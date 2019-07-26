import fs from 'fs';
import path from 'path';

const properties = JSON.parse(fs.readFileSync(path.join(__dirname, '../../properties.json')));

module.exports = {
    creds: {
        appId: 76478,
        authKey: 'YOFCEOtKqGqJq5j',
        authSecret: 'TsAwCNmAndT5kte'
    },
    webrtc: {
        answerTimeInterval: 30,
        dialogTimeInterval: 5,
        disconnectTimeInterval: 35,
        statsReportTimeInterval: 5
    },
    db: {
        ...properties.mysql,
        dialect: 'mysql',
        database: 'video_treatment'
    }
};