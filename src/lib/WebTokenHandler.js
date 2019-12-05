import jwt from 'jsonwebtoken'

/**

taken from https://gist.github.com/ziluvatar/a3feb505c4c0ec37059054537b38fc48

 */

export class WebTokenHandler {
    constructor (secretOrPrivateKey, secretOrPublicKey, options = {}) {
        this.private = secretOrPrivateKey
        this.public = secretOrPublicKey
        this.options = options || {} // algorithm + keyid + noTimestamp + expiresIn + notBefore
    }

    sign(payload, options = {}) {
        const sign_options = { ...this.options, ...options }

        return jwt.sign(payload, this.private, sign_options)
    }

    verify(token, { verify, validator, ...options } = {}) {
        const { verify: g_verify, validator: g_validator } = this.options
        verify = g_verify && { ...g_verify, ...verify } || verify
        validator = validator || g_validator

        const payload = jwt.verify(token, this.public, verify)

        if (validator) {
            if (!(validator instanceof Function)) {
                throw new Error ('Invalid Payload Validator Function')
            }
            if (!validator(payload)) {
                throw new Error ('Invalid Payload')
            }
        }

        return payload
    }

    refresh(token, { jwtid, ...options } = {}) {
        const payload = this.verify(token, options)

        delete payload.iat;
        delete payload.exp;
        delete payload.nbf;
        delete payload.jti; //We are generating a new token, if you are using jwtid during signing, pass it in options

        return jwt.sign(payload, this.private, jwtid && { ...this.options, jwtid } || this.options );
    }
}

export default WebTokenHandler
