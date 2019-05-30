import React from 'react';
import Config from 'Config';
import {createSession, qbLogin, qbCreateUser, qbUpdateUser} from './qbHelpers';
import {InputGroup, FormControl, Button, Badge} from 'react-bootstrap';
import {AppointmentList} from './components';
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
            qbUser: null
        };

        this.changeName = this.changeName.bind(this);
        this.qbJoin = this.qbJoin.bind(this);
    }

    changeName(e, field) {
        if (!this.state.nameFlag) return;

        this.setState({[field]: e.target.value});
    }

    async qbJoin() {

        this.setState({nameFlag: false});
        let state = this.state;

        try {
            await createSession();
            let user = await qbLogin(state.id, state.password);

            if (!user) {
                await qbCreateUser(state.id, state.password, state.username, state.room);
                user = await qbLogin(state.id, state.password);
            } else {
                user = await qbUpdateUser(user.id, state.username, state.room);
            }

            this.setState({joinFlag: true, qbUser: user});
        } catch (e) {
            this.setState({joinFlag: false, qbUser: null});
        }
    }

    render() {
        return (
            <div className="left-bar">
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
                <Button variant="primary" onClick={this.qbJoin} disabled={this.state.joinFlag}>QB 연결</Button>
                <Badge variant={this.state.joinFlag? 'success':'danger'} className="join-state">{this.state.joinFlag? '연결됨':'연결안됨'}</Badge>
                <hr/>
                <AppointmentList/>
            </div>
        )
    }
}