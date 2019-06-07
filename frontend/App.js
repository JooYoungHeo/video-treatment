import React from 'react';
import Config from 'Config';
import axios from 'axios';
import {createSession, qbLogin, qbCreateUser, qbUpdateUser, chatConnect, fillMedia, showMediaDevices} from './qbHelpers';
import {Table, InputGroup, FormControl, Button, Badge} from 'react-bootstrap';
import {VideoScreen} from './components';
import './css/app.css';

export default class App extends React.Component {

    constructor(props) {
        super(props);

        QB.init(Config.creds.appId, Config.creds.authKey, Config.creds.authSecret, Config.etc);

        this.state = {
            id: '',
            password: '',
            username: '',
            qbUser: null,
            deviceInfo: null
        };

        this.changeName = this.changeName.bind(this);
        this.login = this.login.bind(this);
    }

    changeName(e, field) {
        if (this.state.qbUser) return;

        this.setState({[field]: e.target.value});
    }

    async login() {
        let $state = this.state;

        try {
            let user = await App.connectQb($state.id, $state.password, $state.username, 'ZUM');

            await App.userLogin($state, user.id);

            await chatConnect(user.id, Config.creds.appId, $state.password);

            let deviceInfo = await App.getMedia();

            this.setState({qbUser: user, deviceInfo: deviceInfo});
            console.info('[App] qb & app login success');
        } catch (e) {
            this.setState({qbUser: null, id: '', password: '', username: '', deviceInfo: null});
            console.warn('[App] qb & app login error', e);
        }
    }

    static async connectQb(id, password, username, room) {
        try {
            await createSession();
            let user = await qbLogin(id, password);

            if (user) user = await qbUpdateUser(user.id, username, room);
            else {
                await qbCreateUser(id, password, username, room);
                user = await qbLogin(id, password);
            }

            return user;
        } catch (e) {
            throw e;
        }
    }

    static async userLogin(state, internalId) {
        try {
            return await axios.post('/api/v1/users/login', {
                internalId,
                qbId: state.id,
                qbPassword: state.password,
                username: state.username,
                type: 'staff'
            });
        } catch (e) {
            throw e;
        }
    }

    static async getMedia() {
        try {
            let stream = await fillMedia();
            let [videoDevices, audioDevices] = await Promise.all([
                showMediaDevices('videoinput'),
                showMediaDevices('audioinput')
            ]);

            let videoDeviceId = videoDevices.length? videoDevices[0].deviceId: null;
            let audioDeviceId = audioDevices.length? audioDevices[0].deviceId: null;

            if (stream) stream.getTracks().forEach(track => {track.stop()});

            return [videoDeviceId, audioDeviceId];
        } catch (e) {
            throw e;
        }
    }

    render() {

        let qbUser = this.state.qbUser;

        return (
            <div>
                <Table className="container">
                    <tbody>
                        <tr>
                            <td className="left-side">
                                <InputGroup size="sm" className="mb-3">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="inputGroup-sizing-sm">id</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <FormControl aria-describedby="inputGroup-sizing-sm" value={this.state.id} onChange={e => this.changeName(e, 'id')}/>
                                </InputGroup>
                                <InputGroup size="sm" className="mb-3">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="inputGroup-sizing-sm">password</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <FormControl aria-describedby="inputGroup-sizing-sm" value={this.state.password} onChange={e => this.changeName(e, 'password')}/>
                                </InputGroup>
                                <InputGroup size="sm" className="mb-3">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="inputGroup-sizing-sm">username</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <FormControl aria-describedby="inputGroup-sizing-sm" value={this.state.username} onChange={e => this.changeName(e, 'username')}/>
                                </InputGroup>
                                <Button variant="primary" onClick={this.login} disabled={qbUser}>Go</Button>
                                <Badge variant={qbUser? 'success':'danger'} className="join-state">{qbUser? '연결됨':'연결안됨'}</Badge>
                            </td>
                            <td className="right-side">
                                <VideoScreen qbUser={qbUser} deviceInfo={this.state.deviceInfo}/>
                            </td>
                        </tr>
                    </tbody>
                </Table>
            </div>
        )
    }
}