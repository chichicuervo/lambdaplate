import { DEV_MODE } from './config'

import makeMessenger from './SendMessage'

import { defaultFormatResponse } from 'Http'

export const defaultHandler = (req, context) => req

export const makeResponseHandler = ({
    requestContext,
    ...params
}) => {
    if (DEV_MODE) {
        return makeMessenger({ ...requestContext, ...params })
    }

    return async ({
        body,
        statusCode = 200
    }) => {
        return defaultFormatResponse({ statusCode, body })
    }
}

const handleRequest = async ({
    body,
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

        body = body && parseFn(body) || body

        return await requestFn({ body, ...request }, { debug, ...context })
    } catch (err) {
        console.error('WebsocketEventHandler/request#error', `${(err.code || err.name || "Error")}: ${err.message}`, err)

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
        console.error('WebsocketEventHandler/response#error', `${(err.code || err.name || "Error")}: ${err.message}`, err)

        if (!err.code) err.code = 500

        throw err
    }
}

export const WebsocketEventHandler = async ({
    requestContext,
    headers,
    ...request
}, {
    debug,
    ...context
}) => {
    debug && console.log('WebsocketEventHandler', { requestContext, headers, ...request }, { debug, ...context })

    let responder

    try {
        responder = makeResponseHandler({ debug, requestContext, headers, ...context })
        request = await handleRequest({ requestContext, headers, ...request }, { debug, ...context })
    } catch (err) {
        return responder({
            status: err.code || 400,
            body: `${(err.code || err.name || "Error")}: ${err.message}`
        })
    }

    try {
        return await handleResponse(request, { debug, formatResponse: responder, ...context })
    } catch (err) {
        return responder({
            status: err.code || 500,
            body: `${(err.code || err.name || "Error")}: ${err.message}`
        })
    }
}

export const useWebsocketEventHandler = ({
    debug,
    stringifyFn = JSON.stringify,
    parseFn = JSON.parse,
    requestFn = defaultHandler,
    processFn,
    ...params
}) => {
    debug && console.log('useHttpEventHandler', { debug, stringifyFn, parseFn, requestFn, processFn, ...params })

    if (!(stringifyFn instanceof Function)) throw new Error ("Invalid Stringify Function")
    if (!(parseFn instanceof Function)) throw new Error ("Invalid Parse Function")
    if (!(requestFn instanceof Function)) throw new Error ("Invalid Request Handler Function")
    if (!(processFn instanceof Function)) throw new Error ("Invalid Process Function")

    return (request, context) => WebsocketEventHandler(request, { ...context, debug, stringifyFn, parseFn, requestFn, processFn, ...params })
}
