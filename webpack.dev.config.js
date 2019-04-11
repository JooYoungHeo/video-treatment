let webpack = require('webpack');

module.exports = {
	mode: 'development',
    entry: [
    	'./src/index.js',
		'webpack-dev-server/client?http://0.0.0.0:3001',
		'webpack/hot/only-dev-server'
	],
    output: {
        path: '/',
        filename: 'bundle.js'
    },
	devServer: {
    	hot: true,
		filename: 'bundle.js',
		publicPath: '/',
		historyApiFallback: true,
		contentBase: './public',
		proxy: {
    		"**": "http://localhost:3000"
		}
	},
	plugins: [
		new webpack.optimize.OccurrenceOrderPlugin(),
		new webpack.HotModuleReplacementPlugin()
	],
	performance: {
    	hints: process.env.NODE_ENV === 'production' ? 'warning': false
	},
    module: {
        rules: [
			{
            	test: /\.js$/,
				loaders: [
					'react-hot-loader/webpack',
					'babel-loader?' + JSON.stringify({
						cacheDirectory: true,
                		presets: ['es2015', 'react']
					})
				],
            	exclude: /node_modules/
        	}
		]
    }
};
