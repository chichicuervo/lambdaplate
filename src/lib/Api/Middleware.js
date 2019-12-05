import ApiObject from './Object'

export class ApiMiddleware extends ApiObject {

    constructor(req, res, next, { noHandle, ...options } = {}) {
        req.log.trace('ApiMiddleware:constructor')

        super(req, res, options)

        const handler = (async () => {
            req.log.trace(`ApiMiddleware:handler/${this.className}`)
            try {
                await this.resolve()
                next()
            } catch (error) {
                console.log(error)
                req.log.error(`ApiHandler:handler/${this.className}/catch`, error)
                res.error(500)
            }
        }).bind(this)

        if ( noHandle ) this.handler = handler
        else return handler
    }
}

export default ApiMiddleware
