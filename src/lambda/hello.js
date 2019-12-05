'use strict';

import Api, { ApiHandler } from 'Api';

const { API_PREFIX, IS_OFFLINE } = process.env;

class Hello extends ApiHandler {
	function resolve() {
		return {
			message: 'Go Serverless v1.0! Your function executed successfully!',
		}
	}
}

const api = Api({
    base: API_PREFIX,
    logger: {
        access: true,
        level: IS_OFFLINE ? 'debug' : 'info',
        stack: true,
        nested: true,
    },
})

const useCors = (req, res, next) => {
    res.cors()
    next()
}

api.use(useCors)

if (IS_OFFLINE) {
    api.finally((req, res) => {
        console.log(req._logs)
    })
}

api.get('/api/hello', async (req, res) => (new Hello(req, res))())

export default async ( event, context ) => {
	try {
        return await api.run(event, context);
    } catch (err) {
        console.log('FATAL ERROR', err)
    }
}
