'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();

var port = 3000;

app.use('/', _express2.default.static(__dirname + '/../public'));
app.use('/index', _routes2.default);

var server = app.listen(port, function () {
    console.log('server on port #' + port);
});