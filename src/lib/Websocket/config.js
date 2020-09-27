import AWS from 'aws-sdk'

const {
    IS_LOCAL,
    IS_OFFLINE,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_REGION,
    DEV_SNS_REGION,
    WSAPI_ENDPOINT,
    DEV_WSAPI_ENDPOINT
} = process.env;

export const DEV_MODE = IS_LOCAL || IS_OFFLINE;

export const credentials = DEV_MODE ? new AWS.Credentials(
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY
) : new AWS.EnvironmentCredentials( 'AWS' )

const region = DEV_MODE ? ( DEV_SNS_REGION || 'localhost' ) : ( AWS_REGION || 'us-west-2' )

// export const WEBSOCKET_API = (DEV_MODE && window) ? `ws://${window.location.hostname}:3001` : `wss://${WSAPI_ENDPOINT}`

export const makePostbackUrl = ({ domainName, stage, hostname = 'localhost', port = 80 } = {}) => {
    return (DEV_MODE || stage === 'local') ?
        ( DEV_WSAPI_ENDPOINT || `http://${hostname}:${port}` ) :
        ( WSAPI_ENDPOINT || `https://${domainName}/${stage}` )
}

export const makeApi = ({
    debug,
    endpoint,
    apiVersion = '2018-11-29',
    ...params
}) => {
    debug && console.log("Websocket:config/makeApi", { debug, endpoint, apiVersion, ...params }, { region, credentials })

    return new AWS.ApiGatewayManagementApi({
        region,
        credentials,
        apiVersion,
        endpoint
    })
}
