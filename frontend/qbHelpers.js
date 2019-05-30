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

export {getUui, createSession, qbLogin, qbCreateUser, qbUpdateUser};