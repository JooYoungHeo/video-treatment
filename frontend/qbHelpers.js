import axios from 'axios';

function createSession() {
    return new Promise((resolve, reject) => {
        QB.createSession((err, res) => {
            if (err) reject(err);
            resolve(res);
        });
    });
}

function qbLogin(id, password) {
    return new Promise(resolve => {
        let params = {login: id, password: password};

        QB.login(params, (err, user) => {
            if (err) resolve();
            else resolve(user);
        });
    });
}

function qbCreateUser(id, password, username, room) {
    return new Promise((resolve, reject) => {
        QB.users.create({
            login: id,
            password: password,
            full_name: username,
            tag_list: room
        }, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

function qbUpdateUser(qbId, username, room) {
    return new Promise((resolve, reject) => {
        QB.users.update(qbId, {
            full_name: username,
            tag_list: room
        }, (err, user) => {
            if (err) reject(err);
            else resolve(user);
        });
    });
}

function chatConnect(internalId, appId, password) {
    return new Promise((resolve, reject) => {
        QB.chat.connect({
            jid: QB.chat.helpers.getUserJid(internalId, appId),
            password: password
        }, err => {
            if (err) reject(err);
            else resolve();
        });
    });
}

function fillMedia() {
    return new Promise(resolve => {
        navigator.mediaDevices.getUserMedia({
            audio: true, video: true
        }).then(stream => {
            resolve(stream);
        }).catch(err => {
            resolve(null, err);
        });
    });
}

function showMediaDevices(kind) {
    return new Promise((resolve, reject) => {
        QB.webrtc.getMediaDevices(kind).then(devices => {
            resolve(devices);
        }).catch(err => {
            reject(err);
        });
    });
}

function createRTCSession(callees){
    return QB.webrtc.createNewSession(callees, QB.webrtc.CallType.VIDEO, null, {bandwidth: ''});
}

function getLocalMedia(session, audio, video, elemId = 'localVideo') {
    return new Promise((resolve, reject) => {
        session.getUserMedia({
            audio: {deviceId: audio},
            video: {deviceId: video},
            options: {muted: true, mirror: true},
            elemId: elemId
        }, (err, stream) => {
            if (err || !stream.getAudioTracks().length || !stream.getVideoTracks().length) reject(err);
            else resolve(stream);
        });
    });
}

function onCall(session, extension) {
    return new Promise((resolve, reject) => {
        session.call(extension, () => {
            if (!window.navigator.onLine) reject();
            else resolve();
        });
    });
}

function qbPush(sender, receiver) {
    return new Promise((resolve, reject) => {
        let params = {
            push_type: 'apns_voip',
            notification_type: 'push',
            user: {ids: receiver},
            environment: 'development',
            message: QB.pushnotifications.base64Encode(`${sender} is calling`)
        };

        QB.pushnotifications.events.create(params, err => {
            resolve();
        });
    });
}

async function updateAppointment(appointmentId, staffType, flag) {
    try {
        return await axios.put(`/api/v1/appointments/${appointmentId}`, {
            staffType: staffType,
            flag: flag
        });
    } catch (e) {
        throw e;
    }
}

export {createSession, qbLogin, qbCreateUser, qbUpdateUser,
    chatConnect, fillMedia, showMediaDevices, createRTCSession, getLocalMedia,
    onCall, qbPush, updateAppointment};