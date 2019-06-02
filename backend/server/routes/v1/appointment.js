import Router from 'koa-router';
import {AppointmentController} from '../../controller/v1';

const appointmentRouter = new Router();
const _appointmentController = new AppointmentController();

appointmentRouter
    .get('/', _appointmentController.getAppointments)
    .post('/:id(\\d+)/error', _appointmentController.callAbnormalEnd);

export default appointmentRouter;