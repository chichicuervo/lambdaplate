const path = require( 'path' );
const webpack = require( 'webpack' );
const sls = require( 'serverless-webpack' );
const nodeExternals = require( 'webpack-node-externals' );

const TerserPlugin = require('terser-webpack-plugin')

const ROOT_DIR = path.resolve(__dirname, "..");
const DEV_MODE = sls.lib.webpack.isLocal || process.env.IS_OFFLINE || process.env.NODE_ENV !== "production";

const config = async () => {
	const account_id = await sls.lib.serverless.providers.aws.getAccountId();
	const region = await sls.lib.serverless.providers.aws.getRegion();

	return {
		target: 'node',
		entry: sls.lib.entries,
		mode: DEV_MODE ? "development" : "production",
		externals: [ 'aws-sdk',
			nodeExternals({ // i think we want to explictly exclude assets?
	        	whitelist: [] // i think we /want/ to include static files under node_modules?
	    	})
		],
        optimization: {
            // We don't need to minimize our Lambda code.
            minimize: true,
			sideEffects: true,
			usedExports: true,
			minimizer: [
				new TerserPlugin()
			]
        },
        performance: {
            // Turn off size warnings for entry points
            hints: false,
        },
		plugins: [
            new webpack.DefinePlugin( {
				DEV_MODE,
				AWS_ACCOUNT_ID: `${account_id}`,
				AWS_REGION: `${region}`,
                'process.env.BROWSER': false,
                'process.env.NODE_ENV': DEV_MODE ? '"development"' : '"production"'
			} ),
        ],
		module: {
			rules: [ {
				test: /\.(mjs|jsx?)$/,
				exclude: /node_modules/,
				use: [ {
					loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                    }
                } ],
			}, {
		        test: /\.mdx?$/,
		        use: [ 'babel-loader', '@mdx-js/loader' ]
            } ]
		},
		resolve: {
			modules: [
                path.resolve( ROOT_DIR, "src/server" ),
				path.resolve( ROOT_DIR, "src/lib" ),
                path.resolve( ROOT_DIR, "node_modules" ),
            ]
		},
		output: {
			libraryTarget: "umd",
			path: path.resolve( ROOT_DIR, ".webpack" ),
			filename: "[name].js",
		}
	}
}

module.exports = config()
