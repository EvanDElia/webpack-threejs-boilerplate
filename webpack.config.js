/* eslint-env node */
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


module.exports = ({debug = false} = {}, env = {}) => {
	const isEnvProduction = !!env.prod;
    const isEnvDevelopment = !isEnvProduction;
	const plugins = [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(debug ? 'development' : 'production')
		}),
		new webpack.ProvidePlugin({
			WaveSurfer: 'wavesurfer.js'
		}),
		new MiniCssExtractPlugin({
			filename: 'styles.css'
		}),
		new HtmlWebpackPlugin({
			template: path.join('src', 'index.ejs'),
			filename: 'index.html'
		})
	];
	// if (!debug){
	// 	plugins.push(
	// 		new webpack.optimize.UglifyJsPlugin({
	// 			sourceMap: 'source-map',
	// 			compress: {
	// 				warnings: false
	// 			},
	// 			output: {
	// 				comments: false
	// 			}
	// 		})
	// 	);
	// }

	return {
		target: 'web',
		devtool: 'source-map',
		entry: ['@babel/polyfill', './src/application.js'],
		devServer: {
			contentBase: path.resolve(__dirname, 'dist'),
		},
		output: {
			path: path.resolve(__dirname, 'dist'),
			filename: debug ? 'bundle.js' : 'bundle.min.js',
			publicPath: ''
		},
		plugins,
		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /node_modules\/(?!three)(?!wavesurfer.js)/,
					include: [
						path.resolve(__dirname, 'src')
					],
					loader: 'babel-loader',
					query: {
						compact: true,
						presets: [
							['@babel/preset-env', {modules: false}]
						]
					}
				},
				{
                    test: /\.(le|c)ss$/,
                    exclude: /node_modules/,
                    use: [ {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: !!isEnvDevelopment,
                        },
                    },
                        'css-loader',
                        'postcss-loader',
                        'less-loader',
                    ]
                }
			]
		},
		performance: {
			hints: false
		}
	};
};
