import moment from 'moment';
import models from '../../models';

class AppointmentService {
    constructor() {
        this.getAppointments = this.getAppointments.bind(this);
        this.appAbnormalEnd = this.appAbnormalEnd.bind(this);
        this.updateAppointmentStatus = this.updateAppointmentStatus.bind(this);
    }

    async getAppointments(doctorId) {
        try {
            let appointments = await models.Appointment.findAll({
                attributes: ['id', 'date', 'status'],
                where: {
                    isActive: true,
                    doctorId: doctorId,
                    status: {
                        [models.Sequelize.Op.not]: 'Finish'
                    }
                },
                include: [{
                    model: models.User,
                    as: 'user',
                    attributes: ['id', 'name', 'internalId', 'qbId', 'deviceOs']
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

    async appAbnormalEnd(appointmentId, userId) {
        try {
            return await models.Appointment.update({
                status: 'None'
            }, {
                where: {
                    id: appointmentId,
                    userId: userId
                }
            });
        } catch (e) {
            throw e;
        }
    }

    async updateAppointmentStatus(appointmentId, staffType, flag) {

        let status;

        if (flag) status = (staffType === 'doctor')? 'Finish': 'Ready';
        else status = (staffType === 'doctor')? 'Ing': 'Pre';

        try {
            return await models.Appointment.update({
                status: status,
                isActive: (status !== 'Finish')
            }, {
                where: {
                    id: appointmentId
                }
            });
        } catch (e) {
            throw e;
        }
    }
}

export default AppointmentService;