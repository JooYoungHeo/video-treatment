import React from 'react';
import Config from 'Config';
import axios from 'axios';
import {createSession, qbLogin, qbCreateUser, qbUpdateUser, fillMedia, showMediaDevices} from './qbHelpers';
import {Table, InputGroup, FormControl, Button, Badge} from 'react-bootstrap';
import {VideoScreen} from './components';
import './css/app.css';

export default class App extends React.Component {

    constructor(props) {
        super(props);

        QB.init(Config.creds.appId, Config.creds.authKey, Config.creds.authSecret, Config.etc);

        this.state = {
            nameFlag: true,
            id: '',
            password: '',
            username: '',
            room: 'MCU',
            joinFlag: false,
            qbUser: null,
            deviceInfo: null
        };

        this.changeName = this.changeName.bind(this);
        this.onService = this.onService.bind(this);
        this.qbJoin = this.qbJoin.bind(this);
        this.serviceLogin = this.serviceLogin.bind(this);
        this.getMedia = this.getMedia.bind(this);
    }

    changeName(e, field) {
        if (!this.state.nameFlag) return;

        this.setState({[field]: e.target.value});
    }

    async onService() {
        let state = this.state;

        try {
            let [user] = await Promise.all([
                this.qbJoin(state),
                this.serviceLogin(state)
            ]);

            this.setState({nameFlag: false, joinFlag: true, qbUser: user});

            await this.getMedia();
        } catch (e) {
            this.setState({nameFlag: true, joinFlag: false, qbUser: null, id: '', password: '', username: ''});
        }
    }

    async qbJoin(state) {
        try {
            await createSession();
            let user = await qbLogin(state.id, state.password);

            if (!user) {
                await qbCreateUser(state.id, state.password, state.username, state.room);
                user = await qbLogin(state.id, state.password);
            } else {
                user = await qbUpdateUser(user.id, state.username, state.room);
            }

            return user;
        } catch (e) {
            this.setState({nameFlag: true, joinFlag: false, qbUser: null});
        }
    }

    serviceLogin(state) {
        return new Promise((resolve, reject) => {
            axios.post('/api/v1/users/login', {
                qbId: state.id,
                qbPassword: state.password,
                username: state.username
            }).then(() => {
                resolve();
            }).catch(err => {
                reject(err);
            });
        });
    }

    async getMedia() {
        try {
            let stream = await fillMedia();
            let [videoDevices, audioDevices] = await Promise.all([
                showMediaDevices('videoinput'),
                showMediaDevices('audioinput')
            ]);

            let videoDeviceId = videoDevices.length? videoDevices[0].deviceId: null;
            let audioDeviceId = audioDevices.length? audioDevices[0].deviceId: null;

            this.setState({deviceInfo: [videoDeviceId, audioDeviceId]});

            if (stream) stream.getTracks().forEach(track => {track.stop()});

            console.log('get media done');
        } catch (e) {
            console.warn('get media error', e);
        }
    }

    render() {
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
                                <Button variant="primary" onClick={this.onService} disabled={this.state.joinFlag}>QB 연결</Button>
                                <Badge variant={this.state.joinFlag? 'success':'danger'} className="join-state">{this.state.joinFlag? '연결됨':'연결안됨'}</Badge>
                            </td>
                            <td className="right-side">
                                <VideoScreen deviceInfo={this.state.deviceInfo}/>
                            </td>
                        </tr>
                    </tbody>
                </Table>
            </div>
        )
    }
}