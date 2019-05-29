import Koa from 'koa';
import Router from 'koa-router';
import koaBody from 'koa-body';
import serve from 'koa-static';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import api from './routes';

const app = new Koa();
const router = new Router();
const port = 3000;
const devPort = 3001;

if (process.env.NODE_ENV === 'development') {
    console.log('server is running on development mode');

    const config = require('../../webpack.dev.config');
    let compiler = webpack(config);
    let devServer = new WebpackDevServer(compiler, config.devServer);

    devServer.listen(devPort, () => {
        console.log('webpack-dev-server is listening on port', devPort);
    });
}

router.use('/api', api.routes());

app.use(serve(__dirname + '/../../public'));
app.use(koaBody());
app.use(router.routes()).use(router.allowedMethods());

app.listen(port, () => {
    console.log(`server on port #${port}`);
});