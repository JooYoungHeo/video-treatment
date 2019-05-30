import Router from 'koa-router';
import appointment from './appointment';
import user from './user';

const v1 = new Router();

v1.use('/appointments', appointment.routes());
v1.use('/users', user.routes());

export default v1;