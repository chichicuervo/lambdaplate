import { makePostbackUrl, makeApi } from './config'

export const makeMessenger = ({
    debug,
    connectionId,
    headers,
    postbackUrl,
    stringifyFn,
    ...context
}) => {
    debug && console.log('Websocket:SendMessage/makeMessenger', { debug, connectionId, headers, postbackUrl, stringifyFn, ...context  })

    if (!(stringifyFn instanceof Function)) throw new Error ("Stringify Function Required")

    if (!connectionId) throw new Error ('ConnectionId Required')

    const { Host } = headers || {}
    const [ hostname, port ] = Host && Host.split(':') || []

    postbackUrl = postbackUrl || makePostbackUrl({ /* * / hostname, /* */ port, ...context })

    const api = makeApi({ debug, endpoint: postbackUrl })

    debug && console.log('Websocket:SendMessage/makeMessenger#api', { endpoint: postbackUrl, api })

    return async ({
        body,
        statusCode = 200,
    } = {}, {
        stringifyFn: stringify = stringifyFn,
        connectionId: ConnectionId = connectionId,
        ...context
    } = {}) => {
        debug && console.log('Websocket:SendMessage/makeMessenger#handler', { body, statusCode }, { debug, stringify, ConnectionId, ...context })

        try {
            body = (typeof body === 'object') && stringify(body) || body || undefined

            return body && (await api.postToConnection({
                ConnectionId,
                Data: (typeof body === 'object') && stringify(body) || body || undefined
            }).promise())

        } catch (err) {
            console.error('Websocket:SendMessage/makeMessenger#error', `${(err.code || err.name || "Error")}: ${err.message}`, err)

            if (!err.statusCode || ![410,401].includes(err.statusCode)) throw err
        }
    }
}

export default makeMessenger
