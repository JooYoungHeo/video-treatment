import Sequelize from 'sequelize';
import connection from './connection';
import {Options, Attributes} from 'sequelize-decorators';

@Options({
    sequelize: connection,
    tableName: 'appointment',
    freezeTableName: true,
    timestamps: false,
    underscored: true
})
@Attributes({
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    date: {type: Sequelize.DATE, allowNull: false},
    doctorId: {type: Sequelize.INTEGER, allowNull: false, field: 'doctor_id'},
    userId: {type: Sequelize.INTEGER, allowNull: false, field: 'user_id', references: {
        model: 'User', key: 'id'
    }}
})
class Appointment extends Sequelize.Model {
    static associate(models) {
        this.belongsTo(models.User, {foreignKey: 'user_id', as: 'user'});
    }
}

module.exports = Appointment;