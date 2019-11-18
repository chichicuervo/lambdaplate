const sls = require( 'serverless-webpack' );

const server = !!sls.lib.serverless;


/**
 * LIST FROM AWS DOCS
 * https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html
 */
const runtimes = {
	"nodejs8.10": "8.10",
	"nodejs10.x": "10.16.3"
}

const recent = () => {
	const keys = Object.keys(runtimes)

	return runtimes[keys[keys.length - 1]]
}

if ( server ) {
	let { service: { provider: { runtime }}} = sls.lib.serverless || {}
	runtime = runtimes[runtime] || recent()
}

module.exports = function ( api ) {

	const presets = [
		['minify', {
			keepFnName: true,
			keepClassName: true,
		}],
		["@babel/preset-react", {
			useBuiltIns: true,
			useSpread: true,
			// development: process.env.BABEL_ENV === "development"
		}],
		["@babel/preset-env", {
			useBuiltIns: "usage",
            corejs: {
				version: 3,
				proposals: true
			},
			server ? ...{
				targets : {
					node: `${runtime}`
				},
				modules: false,
				shippedProposals: true
			} : ...{
				targets: {
					browsers: "defaults",
					esmodules: true,
				},
				modules: 'auto',
				shippedProposals: true
			}
		}],
	]

	api.cache( false );

	return {
		presets,
		plugins
	};
}
