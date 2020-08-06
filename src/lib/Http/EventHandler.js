export const defaultHandler = (req, context) => req

export const defaultFormatResponse = ({
    headers,
    body,
    status
}, {
    debug,
    stringifyFn = JSON.stringify
} = {}) => {
    debug && console.log('HttpEventHandler/defaultFormatResponse', { headers, body, status })

    if (!(stringifyFn instanceof Function)) throw new Error ("Stringify Function Required")

    return {
        statusCode: status || ( body && 200 || 404),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
            'Content-Type': 'application/json',
            ...headers
        },
        body: (typeof body === 'object') && stringifyFn(body) || body || undefined
    }
}

const handleRequest = async ({
    body,
    headers,
    ...request
}, {
    debug,
    parseFn = JSON.parse,
    requestFn = defaultHandler,
    ...context
}) => {
    try {
        let error
        error = error || !(parseFn instanceof Function) && (new Error ("Parse Function Required"))
        error = error || !(requestFn instanceof Function) && (new Error ("Request Handler Function Required"))

        if (error) {
            error.code = 500
            throw error
        }

        body = body && headers['Content-Type'] == 'application/json' && parseFn(body) || body

        return await requestFn({ body, headers, ...request }, { debug, ...context })
    } catch (err) {
        console.error('HttpEventHandler/request#error', `${(err.code || err.name || "Error")}: ${err.message}`, err)

        if (!err.code) err.code = 400

        throw err
    }
}

const handleResponse = async (request, {
    debug,
    processFn,
    ...context
}) => {
    try {
        if (!(processFn instanceof Function)) throw new Error ("Process Function Required")

        return await processFn(request, { debug, ...context })
    } catch (err) {
        console.error('HttpEventHandler/response#error', `${(err.code || err.name || "Error")}: ${err.message}`, err)

        if (!err.code) err.code = 500

        throw err
    }
}

export const HttpEventHandler = async (request, {
    debug,
    formatFn: formatResponse = defaultFormatResponse,
    ...context
}) => {
    debug && console.log('HttpEventHandler', { request, context })

    if (!(formatResponse instanceof Function)) throw new Error ("Response Format Function Required")

    try {
        request = await handleRequest(request, { debug, ...context })
    } catch (err) {
        return formatResponse({
            statusCode: err.code || 400,
            body: `${(err.code || err.name || "Error")}: ${err.message}`
        }, { debug, ...context })
    }

    try {
        return await handleResponse(request, { debug, formatResponse, ...context })
    } catch (err) {
        return formatResponse({
            statusCode: err.code || 500,
            body: `${(err.code || err.name || "Error")}: ${err.message}`
        }, { debug, ...context })
    }
}

export const useHttpEventHandler = ({
    debug,
    stringifyFn = JSON.stringify,
    parseFn = JSON.parse,
    requestFn = defaultHandler,
    formatFn = defaultFormatResponse,
    processFn,
    ...params
}) => {
    debug && console.log('useHttpEventHandler', { debug, stringifyFn, parseFn, requestFn, formatFn, processFn, ...params })

    if (!(stringifyFn instanceof Function)) throw new Error ("Invalid Stringify Function")
    if (!(parseFn instanceof Function)) throw new Error ("Invalid Parse Function")
    if (!(requestFn instanceof Function)) throw new Error ("Invalid Request Handler Function")
    if (!(formatFn instanceof Function)) throw new Error ("Invalid Response Format Function")
    if (!(processFn instanceof Function)) throw new Error ("Invalid Process Function")

    return (request, context) => HttpEventHandler(request, { ...context, debug, stringifyFn, parseFn, requestFn, formatFn, processFn, ...params })
}
