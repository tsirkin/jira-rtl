const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

module.exports = env => {
    let plugins= [
	new CleanWebpackPlugin('dist'),
	new ExtractTextPlugin('[name].css'),
	new HtmlWebpackPlugin({
	    inject: true,
	    chunks: ['popup'],
	    filename: 'popup.html',
	    template: './app/popup.html'
	}),
	// copy extension manifest and icons
	new CopyWebpackPlugin([
	    { from: './app/manifest.json' },
	    { context: './app/images', from: 'jira-rtl-**.png', to: 'images' }
	])
    ];
    if(!env){
	env = {};
    }
    if(env.prod){
	// use newer uglify plugin install by npm
	// npm install uglifyjs-webpack-plugin --save-dev
	// the old one is broken and does not support let
	plugins.push(new UglifyJsPlugin());
	plugins.push(new ZipPlugin({
	    filename: 'jira-rtl.zip'
	}));
    }
    return {
	entry: {
	    popup: './app/scripts/popup.js',
	    load: './app/scripts/load.js',
	    background: './app/scripts/background.js',
	    rtl: './app/scripts/rtl.js'
	},
	output: {
	    path: path.resolve(__dirname, 'dist'),
	    filename: '[name].js'
	},
	module: {
	    rules: [
		{
		    test: /\.js$/,
		    include: [
			path.resolve(__dirname, './src'),
			    /pretty-bytes/ // <- ES6 module
		    ],
		    use: 'babel-loader'
		},
		{
		    test: /\.css$/,
		    loader: ExtractTextPlugin.extract({
			fallback: 'style-loader',
			use: 'css-loader'
		    })
		},
		{
		    test: /\.(ico|eot|otf|webp|ttf|woff|woff2)(\?.*)?$/,
		    use: 'file-loader?limit=100000'
		},
		{
		    test: /\.(jpe?g|png|gif|svg)$/i,
		    use: [
			'file-loader?limit=100000',
			{
			    loader: 'img-loader',
			    options: {
				enabled: true,
				optipng: true
			    }
			}
		    ]
		}
	    ]
	},
	stats: {
	    children: false,
	    chunks: false,
	    chunkModules: false,
	    chunkOrigins: false,
	    modules: false
	},
	plugins: plugins
    }
}
