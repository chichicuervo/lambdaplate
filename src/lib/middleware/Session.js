import { ApiMiddleware } from 'Api';
import WebTokenHandler from 'WebTokenHandler';

const DEFAULT_HEADER = 'X-Session-Token'

export class Session extends ApiMiddleware {

    constructor(req, res, next, options = {}) {
        super(req, res, next, { noHandle: true, ...options })

        const get = () => this.payload
        const set = v => this.payload = v
        Object.defineProperty(req, options.payloadName || 'session', { get, set, enumerable: true })

        return this.handler
    }

    get generator() {
        const log = this.log
        const { secret, publicKey, privateKey, ...options } = this.options

        return this.store('generator', () => {
            log.trace('Session:generator')

            return new WebTokenHandler(secret || privateKey, secret || publicKey, {
                algorithm: 'HS256',
                expiresIn: '1h',
                ...options,
            })
        })
    }

    get authToken() {
        const log = this.log
        const request = this.request
        const response = this.response

        return this.store('authToken', () => {
            log.trace('Session:authToken')

            const { type, value } = request.auth

            log.debug('Session:authToken', { type, value })

            if (type === 'Bearer') {
                return value
            }
        })
    }

    set header(token) {
        const { header } = this.options

        this.log.debug('Session:setHeader', header || DEFAULT_HEADER, token)
        this.response.header(header || DEFAULT_HEADER, token)
    }

    get payload() {
        const log = this.log

        return this.store('payload', () => {
            log.trace('Session:payload')

            const value = this.authToken

            if (value) {
                return this.generator.verify(value)
            }
        })
    }

    set payload(val) {
        const token = this.generator.sign(val)

        if (token) {
            this.header = token
            this.store.set('payload', val)
        }
    }

    async resolve() {
        this.log.trace('Session:resolve')

        try {
            if (!this.authToken) {
                throw new Error ('Invalid Authorization token')
            }

            const token = this.generator.refresh(this.authToken)

            if (token) {
                this.header = token
            }
        } catch (error) {
            this.log.debug('Session:resolve/Auth Error', error)
        }
    }
}

export default Session
