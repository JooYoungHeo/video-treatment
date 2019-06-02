import models from '../../models';

class UserService {

    constructor() {
        this.login = this.login.bind(this);
    }

    async login(internalId, qbId, qbPassword, username, os = 'Etc', type = 'staff') {

        let transaction;

        try {
            transaction = await models.sequelize.transaction();

            let user = await this._findUser(qbId, qbPassword, transaction);

            if (user) await this._updateUser(user.id, internalId, username, transaction);
            else user = await this._createUser(internalId, qbId, qbPassword, username, os, transaction);

            let appointment = await this._findAppointment(user.id, transaction);

            if (!appointment && type !== 'staff') await this._createAppointment(user.id, transaction);

            await transaction.commit();

            return {id: user.id};
        } catch (e) {
            await transaction.rollback();
            throw e;
        }
    }

    async _findUser(qbId, qbPassword, t) {
        try {
            return await models.User.findOne({
                attributes: ['id'],
                where: {qbId: qbId, qbPassword: qbPassword},
                transaction: t
            });
        } catch (e) {
            throw e;
        }
    }

    async _createUser(internalId, qbId, qbPassword, username, os, t) {
        try {
            return await models.User.create({
                name: username,
                internalId: internalId,
                qbId: qbId,
                qbPassword: qbPassword,
                deviceOs: os
            }, {
                transaction: t
            });
        } catch (e) {
            throw e;
        }
    }

    async _updateUser(id, internalId, username, t) {
        try {
            return await models.User.update({
                name: username,
                internalId: internalId,
            }, {
                where: {id: id},
                transaction: t
            });
        } catch (e) {
            throw e;
        }
    }

    async _findAppointment(userId, t) {
        try {
            return await models.Appointment.findOne({
                attributes: ['id'],
                where: {
                    userId: userId,
                    status: {
                        [models.Sequelize.Op.not]: 'Finish'
                    }
                },
                transaction: t
            });
        } catch (e) {
            throw e;
        }
    }

    async _createAppointment(userId, t) {
        let date = new Date();
        let random = Math.floor(Math.random() * 60) + 5;
        date.setHours(date.getHours() + random);

        try {
            return await models.Appointment.create({
                date: date,
                status: 'None',
                doctorId: 1,
                active: true,
                userId: userId
            }, {
                transaction: t
            });
        } catch (e) {
            throw e;
        }
    }
}

export default UserService;