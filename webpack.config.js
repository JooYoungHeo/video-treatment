module.exports = {
	mode: 'production',
    entry: './frontend/index.js',
    output: {
        path: __dirname + '/public',
        filename: 'bundle.js'
    },
	externals: {
    	Config: JSON.stringify({
            creds: {
                appId: 76478,
                authKey: 'YOFCEOtKqGqJq5j',
                authSecret: 'TsAwCNmAndT5kte'
            },
            etc: {
                debug: true,
                webrtc: {
                    answerTimeInterval: 30,
                    dialogTimeInterval: 5,
                    disconnectTimeInterval: 35,
                    statsReportTimeInterval: 5
                }
            }
		})
	},
    module: {
        rules: [
			{
            	test: /\.js$/,
            	loader: 'babel-loader',
            	exclude: /node_modules/,
            	query: {
                	cacheDirectory: true,
                	presets: ['es2015', 'react']
            	}
        	}, {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
		]
    }
};
