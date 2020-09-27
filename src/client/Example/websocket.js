import React, { useState, useEffect } from 'react'
import { hot } from 'react-hot-loader'
import useWebSocket from 'react-use-websocket'

const debug = DEV_MODE || false

const App = () => {
    debug && console.log('Example:Websocket/App')

    const socketUrl = DEV_MODE ? `ws://${window.location.hostname}:3001/` : WS_ENDPOINT

    // console.log({ useWebSocket })

    const { sendJsonMessage, lastJsonMessage } = useWebSocket(socketUrl)

    const [ inc, setInc ] = useState(1)
    useEffect(() => {
        setTimeout(() => {
            sendJsonMessage({ inc })
            setInc(inc + 1)
        }, 2500)
    }, [ lastJsonMessage ])

    return (
        <div>
            <div>Hello. {socketUrl}</div>
            <pre>{JSON.stringify(lastJsonMessage, null, 2)}</pre>
        </div>
    )
}

export default hot(module)(App)
