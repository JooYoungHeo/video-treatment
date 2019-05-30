import models from '../../models';

class UserService {

    constructor() {
        this.login = this.login.bind(this);
    }

    async login(qbId, qbPassword, username, os) {

        let transaction;

        try {
            transaction = await models.sequelize.transaction();

            let user = await this._findUser(qbId, qbPassword, transaction);

            if (user) await this._updateUser(user.id, username, transaction);
            else {
                user = await this._createUser(qbId, qbPassword, username, os, transaction);
                await this._createAppointment(user.id, transaction);
            }

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

    async _createUser(qbId, qbPassword, username, os, t) {
        try {
            return await models.User.create({
                name: username,
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

    async _updateUser(id, username, t) {
        try {
            return await models.User.update({
                name: username
            }, {
                where: {id: id},
                transaction: t
            });
        } catch (e) {
            throw e;
        }
    }

    async _createAppointment(id, t) {

        let date = new Date();
        let random = Math.floor(Math.random() * 60) + 5;
        date.setHours(date.getHours() + random);

        try {
            return await models.Appointment.create({
                date: date,
                status: 'None',
                doctorId: 1,
                active: true,
                userId: id
            }, {
                transaction: t
            });
        } catch (e) {
            throw e;
        }
    }
}

export default UserService;