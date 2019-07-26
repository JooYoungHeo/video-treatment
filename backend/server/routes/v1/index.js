import Router from 'koa-router';
import appointment from './appointment';
import user from './user';
import app from './app';

const v1 = new Router();

v1.use('/appointments', appointment.routes());
v1.use('/users', user.routes());
v1.use('/app', app.routes());

export default v1;