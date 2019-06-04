import {AppointmentService} from '../../service';

class AppController {

    constructor() {
        this._appointmentService = new AppointmentService();
        this.appError = this.appError.bind(this);
    }

    async appError(ctx) {
        try {
            let body = ctx.request.body || {};

            await this._appointmentService.appAbnormalEnd(body.appointmentId, body.userId);

            ctx.body = {id: body.appointmentId};
        } catch (e) {
            ctx.status = 500;
            ctx.body = e.stack;
        }
    }
}

export default AppController;