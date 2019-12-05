import { Session } from './Session'

export class Authorize extends Session {

    async resolve() {
        this.log.trace('Authorize:resolve')

        try {
            await super.resolve()

            if (!this.payload) {
                throw new Error ('Invalid Authorization Payload')
            }
        } catch (error) {
            this.log.debug('Authorize:resolve/Auth Error', error)

            this.response.error(401, "Invalid Authorization Payload")
        }
    }
}

export default Authorize
