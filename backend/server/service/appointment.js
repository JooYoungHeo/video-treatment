import moment from 'moment';
import models from '../../models';

class AppointmentService {
    constructor() {
        this.getAppointments = this.getAppointments.bind(this);
    }

    async getAppointments(doctorId) {
        try {
            let appointments = await models.Appointment.findAll({
                attributes: ['id', 'date'],
                where: {
                    isActive: true,
                    doctorId: doctorId
                },
                include: [{
                    model: models.User,
                    as: 'user',
                    attributes: ['id', 'quickbloxId', 'deviceOs']
                }]
            });

            return appointments.map(item => {
                item.date = moment(item.date).format('YYYY-MM-DD HH:mm:ss');
                return item;
            });
        } catch (e) {
            throw e;
        }
    }
}

export default AppointmentService;