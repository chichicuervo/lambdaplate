const fs = require('fs')
const path = require( 'path' );
const webpack = require( 'webpack' );
const sls = require( 'serverless-webpack' );

const { compact } = require( 'lodash' );

const { CleanWebpackPlugin } = require( 'clean-webpack-plugin' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const BundleAnalyzerPlugin = require( 'webpack-bundle-analyzer' ).BundleAnalyzerPlugin;
const TerserPlugin = require('terser-webpack-plugin')
const LoadablePlugin = require('@loadable/webpack-plugin')

const ROOT_DIR = path.resolve( __dirname, ".." );
const DEV_MODE = sls.lib.webpack.isLocal || process.env.IS_OFFLINE || process.env.NODE_ENV !== "production";
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
		plugins: compact( [
            new webpack.DefinePlugin( {
				DEV_MODE: DEV_MODE,
				'process.env.BROWSER': true,
				'process.env.NODE_ENV': DEV_MODE ? '"development"' : '"production"'
			} ),
            new HtmlWebpackPlugin( {
				template: path.resolve(ROOT_DIR, 'src/index.html')
			} ),
            // DEV_MODE ? new webpack.HotModuleReplacementPlugin() : null,
            !DEV_MODE && new CleanWebpackPlugin(),
			!DEV_MODE && new BundleAnalyzerPlugin( {
				analyzerMode: 'static',
				openAnalyzer: false
			} ),
			new LoadablePlugin(),
        ] ),
		module: {
			rules: [ {
				test: /\.s?css$/,
				use: [ 'style-loader', 'css-loader' ]
            }, {
				test: /\.(mjs|jsx?)$/,
				exclude: /node_modules/,
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
			filename: 'assets/[name].js',
			publicPath: "/",
		},
		resolve: {
			modules: [
                path.resolve( ROOT_DIR, "src/client" ),
                path.resolve( ROOT_DIR, "node_modules" ),
            ]
		},
		devServer: {
			historyApiFallback: true,
			disableHostCheck: true,
			host: server_params.proxy_host || 'localhost',
			port: server_params.proxy_port || 3001,
			hot: true
		},

	}
}

module.exports = config()
