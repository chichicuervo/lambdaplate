const fs = require('fs')
const path = require( 'path' )
const webpack = require( 'webpack' )
const sls = require( 'serverless-webpack' )

const { CleanWebpackPlugin } = require( 'clean-webpack-plugin' )
const HtmlWebpackPlugin = require( 'html-webpack-plugin' )
const BundleAnalyzerPlugin = require( 'webpack-bundle-analyzer' ).BundleAnalyzerPlugin
const TerserPlugin = require('terser-webpack-plugin')
const LoadablePlugin = require('@loadable/webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

const ROOT_DIR = path.resolve( __dirname, ".." )
const DEV_MODE = sls.lib.webpack.isLocal || process.env.IS_OFFLINE || process.env.NODE_ENV !== "production"
const BUILD_DIR = path.resolve( ROOT_DIR, "dist" )

const config = async () => {

	const server_params = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'dev.config.json')) || '')

	return {
		target: 'web',
		entry: [
            path.resolve( ROOT_DIR, 'src/polyfill.js' ),
            path.resolve( ROOT_DIR, 'src/client/index.js' ),
        ],
		mode: DEV_MODE ? "development" : "production",
		plugins: [
			new webpack.ProvidePlugin( {
				process: 'process/browser',
			}),
            new webpack.DefinePlugin( {
				DEV_MODE: DEV_MODE,
				WS_ENDPOINT: '"wss://2nsf6ekguk.execute-api.us-west-2.amazonaws.com/dev"', // i really hate this
				'process.env.BROWSER': true,
				'process.env.NODE_ENV': DEV_MODE ? '"development"' : '"production"'
			} ),
            new HtmlWebpackPlugin( {
				template: path.resolve(ROOT_DIR, 'src/index.html')
			} ),
			...( DEV_MODE ? [
				// new webpack.HotModuleReplacementPlugin(),
				new ReactRefreshWebpackPlugin({
					overlay: {
						sockIntegration: 'wds'
					}
				}),
			] : [
				new CleanWebpackPlugin(),
				new BundleAnalyzerPlugin( {
					analyzerMode: 'static',
					openAnalyzer: false
				} )
			]),
			new LoadablePlugin(),
        ].filter(Boolean),
		module: {
			rules: [ {
				test: /\.s?css$/,
				use: [ 'style-loader', 'css-loader' ]
            }, {
				test: /\.(mjs|[jt]sx?)$/,
				exclude: /node_modules/,
				resolve: {
					fullySpecified: false
				},
				use: {
					loader: 'babel-loader',
					options: {
						cacheDirectory: true,
					}
				}
            }, {
				test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
				use: {
					loader: 'file-loader',
					options: {
						name: '[name].[ext]',
						outputPath: 'assets'
					}
				}
			}, {
		        test: /\.(png|svg|jpg|gif)$/,
		        use: {
		            loader: 'file-loader',
		            options: {
		                name: '[name].[ext]',
		                outputPath: 'assets'
		            }
		        }
		    }, {
		        test: /\.mdx?$/,
		        use: [ 'babel-loader', '@mdx-js/loader' ]
            } ]
		},
		optimization: {
			sideEffects: true,
			usedExports: true,
			minimize: true,
			minimizer: [
				new TerserPlugin()
			]
		},
		output: {
			path: BUILD_DIR,
			filename: DEV_MODE ? 'assets/[fullhash].js' : 'assets/[contenthash].js',
			publicPath: "/",
		},
		resolve: {
			modules: [
                path.resolve( ROOT_DIR, "src/client" ),
				path.resolve( ROOT_DIR, "src/lib" ),
                path.resolve( ROOT_DIR, "node_modules" ),
            ]
		},
		devServer: {
			historyApiFallback: true,
			disableHostCheck: true,
			host: server_params.proxy_host || 'localhost',
			port: server_params.proxy_port || 3001,
			hot: true,
			watchOptions: {
				aggregateTimeout: 1000,
				poll: 350,
				ignored: /node_modules/,
			}
		},

	}
}

module.exports = config()
