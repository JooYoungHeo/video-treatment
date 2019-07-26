import Router from 'koa-router';
import {AppointmentController} from '../../controller/v1';

const appointmentRouter = new Router();
const _appointmentController = new AppointmentController();

appointmentRouter
    .get('/', _appointmentController.getAppointments)
    .put('/:id(\\d+)', _appointmentController.updateAppointmentStatus);

export default appointmentRouter;