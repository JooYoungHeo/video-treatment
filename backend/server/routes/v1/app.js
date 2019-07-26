import Router from 'koa-router';
import {AppController} from '../../controller/v1';

const appRouter = new Router();
const _appController = new AppController();

appRouter
    .post('/error', _appController.appError);

export default appRouter;