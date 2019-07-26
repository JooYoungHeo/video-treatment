import Sequelize from 'sequelize';
import config from '../config';

const dbConfig = config.db;

module.exports = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    pool: {
        max: 20,
        min: 0,
        idle: 10000
    },
    logging: false,
    timezone: "+09:00"
});