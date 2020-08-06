import { sns, DEV_MODE, ROOT_TOPIC_ARN, useSnsEventHandler } from 'Sns'

import { useHttpEventHandler } from 'Http'

const EXAMPLE_TOPIC_ARN = `${ROOT_TOPIC_ARN}:ExampleTopic`

const processRequest = async ({
    body,
    ...request
}, {
    debug,
    formatResponse,
    stringifyFn,
    ...context
}) => {
    debug && console.log('Example:Sns/process', { request: { body, ...request}, context })

    const response = await sns.publish({
        Message: stringifyFn(body),
        TopicArn: EXAMPLE_TOPIC_ARN,
    }).promise()

    console.log('Example:Sns/process#response', { response, EXAMPLE_TOPIC_ARN })

    return formatResponse({ statusCode: 200 }, { debug, stringifyFn })
}

export const http = useHttpEventHandler({ debug: DEV_MODE, processFn: processRequest })

export const sns_msg = useSnsEventHandler({ debug: DEV_MODE })
