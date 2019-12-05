export class ApiObject {
    constructor(req, res, options = {}) {
        req.log.trace('ApiObject:constructor')
        this.request = req
        this.response = res
        this.setOptions(options)

        this.timestamp = Math.floor(Date.now() / 1000)
        this.resolve.bind(this)
    }

    get className() {
        return this.constructor.name
    }

    get store () {
        if (!this._store) {
            this._store = new Map
        }

        return this._store
    }

    setStore(store = {}) {
        for (let [name, val] of Object.entries(store)) {
            this.store.set(name, val)
        }

        return this
    }

    set(name, val) {
        if (!this.store.has(name)) {
            this.store.set(name, val instanceof Function ? val() : val)
        }

        return this.store.get(name)
    }

    get options() {
        if (!this._options) {
            this._options = {}
        }

        return this._options
    }

    setOptions(options = {}) {
        this._options = {
            ...this._options,
            ...options
        }

        return this
    }

    get log() {
        return this.request.log
    }

    get body() {
        return this.request.body
    }

    get headers() {
        return {
            ...this.request.multiValueHeaders,
            ipAddress: this.ipAddress,
        }
    }

    get cookies() {
        return this.request.cookies
    }

    get ipAddress() {
        return this.request.ip
    }

    get auth() {
        return this.request.auth
    }

    get parsed() {
        return {
            headers: this.headers,
            cookies: this.cookies,
            auth: this.auth,
            body: this.body,
        }
    }

    get lambda() {
        const {
            id: requestId,
            interface: awsInterface,
            awsNamespace,
            coldStart,
            clientType,
            clientCountry,
            requestCount,
        } = this.request

        return {
            requestId,
            requestCount,
            requestTs: this.timestamp,
            awsInterface,
            awsNamespace,
            coldStart,
            clientType,
            clientCountry,
        }
    }

}

export default ApiObject
