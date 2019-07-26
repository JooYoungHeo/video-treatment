import Sequelize from 'sequelize';
import path from 'path';
import fs from 'fs';
import sequelize from './connection';

let db = {};
let exceptFileList = ['index.js', 'connection.js'];

fs.readdirSync(__dirname)
    .filter(file => !exceptFileList.includes(file))
    .forEach(file => {
        let model = require(path.join(__dirname, file));
        db[model.name] = model;
    });

Object.values(db)
    .filter(model => typeof model.associate === 'function')
    .forEach(model => model.associate(db));

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;