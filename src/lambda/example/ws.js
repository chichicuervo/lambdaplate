import { DEV_MODE, makePostbackUrl, makeResponseHandler, useWebsocketEventHandler, makeMessenger } from 'Websocket'

const requestConnect = ({ requestContext, ...params }, { debug, ...context }) => {
    debug && console.log('Example:Ws/requestConnect', { requestContext, ...params }, { debug, ...context })

    const { connectionId } = requestContext || {}

    debug && console.log('Example:Ws/requestConnect#return', { connectionId })

    return { connectionId }
}

const processConnect = async ({ connectionId,  ...params }, { debug, formatResponse, ...context }) => {
    debug && console.log('Example:Ws/processConnect', { connectionId, ...params }, { debug, formatResponse, ...context })

    // do soemthing

    return await formatResponse({
        statusCode: 200,
        body: { connectionId }
    })
}

const processDisconnect = async ({ connectionId, ...params }, { debug, formatResponse, ...context }) => {
    debug && console.log('Example:Ws/processDisonnect', { connectionId, ...params }, { debug, formatResponse, ...context })

    // do something

    return await formatResponse({
        statusCode: 200,
    })
}

const processDefault = async ({ body, requestContext, ...params }, { debug, formatResponse, ...context }) => {
    debug && console.log('Example:Ws/processDefault', { body, ...params }, { debug, formatResponse, ...context })

    const { connectionId } = requestContext || {}

    return await formatResponse({
        statusCode: 200,
        body: { ...body, connectionId },
    })
}

export const connect = useWebsocketEventHandler({
    debug: true,
    requestFn: requestConnect,
    processFn: processConnect,
})

export const disconnect = useWebsocketEventHandler({
    debug: true,
    requestFn: requestConnect,
    processFn: processDisconnect,
})

export const ws_default = useWebsocketEventHandler({
    debug: true,
    // requestFn: requestConnect,
    processFn: processDefault,
})

import { useHttpEventHandler } from 'Http'

const processRequest = async ({
    body,
    ...request
}, {
    debug,
    formatResponse,
    ...context
}) => {
    debug && console.log('Example:Ws/process', { request: { body, ...request }, context })

    const { id, ...params } = body || {}

    const notifier = makeMessenger({ port: 3001, connectionId: id, ...context })

    console.log('Example:Ws/process#response', { notifier })

    await notifier({ body })

    return formatResponse({ status: 200 }, { debug })
}

export const http = useHttpEventHandler({ debug: DEV_MODE, processFn: processRequest })
