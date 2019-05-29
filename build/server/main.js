'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

var _webpackDevServer = require('webpack-dev-server');

var _webpackDevServer2 = _interopRequireDefault(_webpackDevServer);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();

var port = 3000;
var devPort = 3001;

if (process.env.NODE_ENV === 'development') {
    console.log('server is running on development mode');

    var config = require('../../webpack.dev.config');
    var compiler = (0, _webpack2.default)(config);
    var devServer = new _webpackDevServer2.default(compiler, config.devServer);

    devServer.listen(devPort, function () {
        console.log('webpack-dev-server is listening on port', devPort);
    });
}

app.use('/', _express2.default.static(__dirname + '/../../public'));
app.use('/index', _routes2.default);

var server = app.listen(port, function () {
    console.log('server on port #' + port);
});