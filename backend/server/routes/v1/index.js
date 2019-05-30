import Router from 'koa-router';
import appointment from './appointment';

const v1 = new Router();

v1.use('/appointments', appointment.routes());

export default v1;