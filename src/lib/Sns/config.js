import AWS from 'aws-sdk'

const {
    IS_LOCAL,
    IS_OFFLINE,
    AWS_ACCOUNT_ID,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_REGION,
    DEV_SNS_REGION,
    DEV_SNS_ENDPOINT,
    ROOT_TOPIC_ARN: root_arn
} = process.env;

export const DEV_MODE = IS_LOCAL || IS_OFFLINE;

export const credentials = DEV_MODE ? new AWS.Credentials(
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY
) : new AWS.EnvironmentCredentials( 'AWS' )

const region = DEV_MODE ? ( DEV_SNS_REGION || 'localhost' ) : ( AWS_REGION || 'us-west-2' )

export const ROOT_TOPIC_ARN = root_arn

export const sns = new AWS.SNS( {
    region,
    endpoint: DEV_MODE ? ( DEV_SNS_ENDPOINT || 'http://localhost:4002' ) : undefined,
    credentials: credentials,
    correctClockSkew: true,
})
