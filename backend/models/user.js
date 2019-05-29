import Sequelize from 'sequelize';
import connection from './connection';
import {Options, Attributes} from 'sequelize-decorators';

@Options({
    sequelize: connection,
    tableName: 'user',
    freezeTableName: true,
    timestamps: false,
    underscored: true
})
@Attributes({
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    quickbloxId: {type: Sequelize.STRING(64), allowNull: false, field: 'quickblox_id'},
    deviceOs: {type: Sequelize.ENUM('Android', 'Ios', 'Etc'), allowNull: false, field: 'device_os'}
})
class User extends Sequelize.Model {
    static associate(models) {
        this.hasMany(models.Appointment, {foreignKey: 'userId', as: 'appointments'});
    }
}

module.exports = User;