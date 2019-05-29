import React from 'react';
import Config from 'Config';

export default class App extends React.Component {

    constructor(props) {
        super(props);
        QB.init(Config.creds.appId, Config.creds.authKey, Config.creds.authSecret, Config.etc);

        this.state = {
            userRequiredParams: {
                login: App._getUui('holyshit'),
                password: 'webAppPass'
            }
        };

        this.clickLogin = this.clickLogin.bind(this);
        this.createQBSession = this.createQBSession.bind(this);
        this.loginToQB = this.loginToQB.bind(this);
    }

    static _getUui(appId) {
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

    clickLogin() {
        this.createQBSession().then(() => {
            return this.loginToQB()
        }).then(result => {
            console.log(result);
        }).catch(err => {
            console.log(err);
        });
    }

    createQBSession() {
        return new Promise((resolve, reject) => {
            QB.createSession((err, res) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    loginToQB() {
        return new Promise((resolve, reject) => {
            QB.login(this.state.userRequiredParams, (err, user) => {
                if (err) reject(err);
                else resolve(user);
            });
        });
    }

    render() {
        return (
            <div>
                <button onClick={this.clickLogin}>로그인</button>
            </div>
        )
    }
}