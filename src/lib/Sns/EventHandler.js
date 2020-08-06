export const defaultRecordHandler = ( params, context ) => {
    console.log('SnsEventHandler/defaultRecordHandler', { params, context })
}

export const SnsEventHandler = async ({
    Records,
    ...params
}, {
    debug,
    handlerFn = defaultRecordHandler,
    parseFn = JSON.parse,
    ...context
}) => {
    debug && console.log('SnsEventHandler', { params: { Records, ...params }, context })

    if (!Array.isArray(Records)) throw new Error ("Invalid Records Array")

    if (!(handlerFn instanceof Function)) throw new Error ("Record Handler Function Required")

    const all = Records.map(({ Sns: { Message, ...Sns }, ...record }) => {
        debug && console.log('SnsEventHandler/onRecord', { params: { Sns: { Message, ...Sns }, ...record }, context })

        return handlerFn(parseFn(Message), { debug, ...context, snsMessageContext: Sns, snsRecordContext: record })
    })

    return Promise.all(all)
}

export const useSnsEventHandler = ({
    debug,
    handlerFn = defaultRecordHandler,
    parseFn = JSON.parse,
    ...params
}) => {
    debug && console.log('useSnsEventHandler', { debug, handlerFn, parseFn, ...params })

    if (!(handlerFn instanceof Function)) throw new Error ("Invalid Record Handler Function")
    if (!(parseFn instanceof Function)) throw new Error ("Invalid Parse Function")

    return (record, context) => SnsEventHandler(record, { ...context, debug, handlerFn, parseFn, ...params })
}

export default SnsEventHandler
