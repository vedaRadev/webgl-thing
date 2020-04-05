const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	watch: true,
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: 'index_bundle.js'
	},
	plugins: [new HtmlWebpackPlugin({
		template: './index.html',
	})],
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			}
		]
	}
};
