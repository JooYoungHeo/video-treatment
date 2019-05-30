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
                    attributes: ['id', 'name', 'quickbloxId', 'deviceOs']
                }],
                order: [['date', 'asc']]
            });

            return appointments.map(item => {
                item = item.get({plain: true});
                item.date = moment(item.date).format('YYYY-MM-DD HH:mm:ss');
                return item;
            });
        } catch (e) {
            throw e;
        }
    }
}

export default AppointmentService;