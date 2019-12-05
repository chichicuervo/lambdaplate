import ApiObject from './Object'

export class ApiHandler extends ApiObject {
    constructor(req, res, { noHandle, ...options } = {}) {
        req.log.trace('ApiHandler:constructor')

        super(req, res, options)

        const handler = (async () => {
            req.log.trace(`ApiHandler:handler/${this.className}`)
            try {
                return await this.resolve()
            } catch (error) {
                req.log.error(`ApiHandler:handler/${this.className}/catch`, error)
                res.error(500)
            }
        }).bind(this)

        if ( noHandle ) this.handler = handler
        else return handler
    }
}

export default ApiHandler
