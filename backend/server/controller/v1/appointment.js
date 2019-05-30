import {AppointmentService} from '../../service';

class AppointmentController {
    constructor() {
        this._appointmentService = new AppointmentService();
        this.getAppointments = this.getAppointments.bind(this);
    }

    async getAppointments(ctx) {
        try {
            const doctorId = Number(ctx.query.doctorId || 0);

            ctx.body = await this._appointmentService.getAppointments(doctorId);
        } catch (e) {
            ctx.status = 500;
            ctx.body = e.stack;
        }
    }
}

export default AppointmentController;