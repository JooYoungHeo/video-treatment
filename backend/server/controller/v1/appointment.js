import {AppointmentService} from '../../service';

class AppointmentController {
    constructor() {
        this._appointmentService = new AppointmentService();
        this.getAppointments = this.getAppointments.bind(this);
        this.updateAppointmentStatus = this.updateAppointmentStatus.bind(this);
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

    async updateAppointmentStatus(ctx) {
        try {
            let body = ctx.request.body || {};
            let id = Number(ctx.params.id);

            await this._appointmentService.updateAppointmentStatus(id, body.staffType, body.flag);

            ctx.body = {id: id};
        } catch (e) {
            ctx.status = 500;
            ctx.body = e.stack;
        }
    }
}

export default AppointmentController;