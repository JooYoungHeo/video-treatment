function getUui(appId) {
    let navigatorInfo = window.navigator;
    let screenInfo = window.screen;
    let uid = navigatorInfo.mimeTypes.length;

    uid += navigatorInfo.userAgent.replace(/\D+/g, '');
    uid += navigatorInfo.plugins.length;
    uid += screenInfo.height || '';
    uid += screenInfo.width || '';
    uid += screenInfo.pixelDepth || '';
    uid += appId;

    return uid;
}

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

function getLocalMedia(session, params) {
    return new Promise((resolve, reject) => {
        session.getUserMedia(params, (err, stream) => {
            if (err || !stream.getAudioTracks().length || !stream.getVideoTracks().length) reject(err);
            else resolve();
        });
    });
}

export {getUui, createSession, qbLogin, qbCreateUser, qbUpdateUser,
    fillMedia, showMediaDevices, createRTCSession, getLocalMedia};