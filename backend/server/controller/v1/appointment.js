import {AppointmentService} from '../../service';

class AppointmentController {
    constructor() {
        this._appointmentService = new AppointmentService();
        this.getAppointments = this.getAppointments.bind(this);
        this.callAbnormalEnd = this.callAbnormalEnd.bind(this);
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

    async callAbnormalEnd(ctx) {
        try {
            let appointmentId = Number(ctx.params.id);
            let body = ctx.request.body || {};

            await this._appointmentService.callAbnormalEnd(appointmentId, body.userId, body.staffType);

            ctx.body = {id: appointmentId};
        } catch (e) {
            ctx.status = 500;
            ctx.body = e.stack;
        }
    }
}

export default AppointmentController;