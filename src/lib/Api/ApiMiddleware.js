import ApiHandler from './ApiHandler'

export class ApiMiddleware extends ApiHandler {

    constructor(req, res, next, options = {}) {
        req.log.trace('ApiMiddleware:constructor')

        const resolve = super(req, res, options)

        return async () => {
            req.log.trace('ApiMiddleware:resolve')

            const result = await (resolve instanceof Function) ? resolve() : resolve
            next()
        }
    }
}

export default ApiMiddleware
