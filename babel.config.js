const sls = require( 'serverless-webpack' );

const server = !!sls.lib.serverless;


/**
 * LIST FROM AWS DOCS
 * https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html
 */
const runtimes = {
	"nodejs8.10": "8.10",
	"nodejs10.x": "10.16.3",
    "nodejs12.x": "12.13.0",
}

const recent = () => {
	const keys = Object.keys(runtimes)

	return runtimes[keys[keys.length - 1]]
}

let node_runtime
if ( server ) {
	let { service: { provider: { runtime }}} = sls.lib.serverless || {}
	node_runtime = runtimes[runtime] || recent()
}

module.exports = function ( api ) {

    const env_preset = server ? {
        targets : {
            node: `${node_runtime}`
        },
        modules: false,
        shippedProposals: true
    } : {
        targets: {
            // browsers: "defaults",
            esmodules: true,
        },
        modules: 'auto',
        shippedProposals: true
    }

	const presets = [
		['minify', {
			keepFnName: true,
			keepClassName: true,
		}],
		["@babel/preset-react", {
			useBuiltIns: true,
			// useSpread: true,
			// development: process.env.BABEL_ENV === "development"
		}],
		["@babel/preset-env", {
			useBuiltIns: "usage",
            corejs: {
				version: 3,
				proposals: true
			},
			...env_preset,
		}],
	]

    const hot_loader = server ? ['react-hot-loader/babel'] : []

    const plugins = [
        ...hot_loader,
        '@babel/plugin-proposal-class-properties',
        '@loadable/babel-plugin',
    ]

	api.cache( false );

	return {
		presets,
		plugins
	};
}
