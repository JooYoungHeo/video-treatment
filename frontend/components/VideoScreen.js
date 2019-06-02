import React from 'react';
import {Button, Table, Form} from 'react-bootstrap';
import {createRTCSession, getLocalMedia, onCall, qbPush} from '../qbHelpers';
import {onCallListener, onRejectCallListener, onStopCallListener, onAcceptCallListener, onRemoteStreamListener} from '../qbEventListener';
import AppointmentList from './AppointmentList';
import {IncomeCall} from './modals';

export default class VideoScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            staffType: 'aide',
            qbUser: null,
            videoDeviceId: null,
            audioDeviceId: null,
            receiverId: null,
            receiverName: null,
            receiverStatus: null,
            currentSession: null
        };

        onCallListener(this);
        onRejectCallListener();
        onStopCallListener();
        onAcceptCallListener();
        onRemoteStreamListener(this);

        this.getLocalStream = this.getLocalStream.bind(this);
        this.onClickReceiver = this.onClickReceiver.bind(this);
        this.onCallingEvent = this.onCallingEvent.bind(this);
        this.onClickDecline = this.onClickDecline.bind(this);
        this.onClickAccept = this.onClickAccept.bind(this);
        this.onHangUp = this.onHangUp.bind(this);
        this.changeStaffType = this.changeStaffType.bind(this);
    }

    componentWillReceiveProps(props) {

        if (!props.qbUser || !props.deviceInfo) return;

        this.setState({
            qbUser: props.qbUser,
            videoDeviceId: props.deviceInfo[0],
            audioDeviceId: props.deviceInfo[1]
        });
    }

    async getLocalStream() {
        if (!this.state.videoDeviceId || !this.state.audioDeviceId || !this.state.receiverId) return;

        let mediaParams = {
            audio: {deviceId: this.state.audioDeviceId},
            video: {deviceId: this.state.videoDeviceId},
            options: {muted: true, mirror: true},
            elemId: 'localVideo'
        };

        let currentSession = createRTCSession([this.state.receiverId]);

        this.setState({currentSession: currentSession});

        try {
            await getLocalMedia(currentSession, mediaParams);
        } catch (e) {
            currentSession.stop({});
        }
    }

    onClickReceiver(internalId, name, status) {
        this.setState({receiverId: internalId, receiverName: name, receiverStatus: status});
    }

    onCallingEvent() {
        let state = this.state;

        if (!state.receiverId) return;

        let currentSession = state.currentSession;

        if ((state.staffType !== 'aide' || state.receiverStatus !== 'none') && (state.staffType !== 'doctor' || state.receiverStatus !== 'ready')) {
            alert('잘못된 대상');
            return;
        }

        onCall(currentSession, {name: state.qbUser.full_name, staffType: state.staffType}).then(() => {
            return qbPush(state.qbUser.full_name, [state.receiverId]);
        }).then(() => {
            console.info('calling success');
        }).catch(err => {
            currentSession.stop({});
            this.setState({currentSession: null});

            if (err) console.warn('push failed', err);
            else console.warn('calling failed');
        });
    }

    onClickDecline() {
        let session = this.state.currentSession;

        if (session) {
            session.reject({});
            this.refs.IncomeCall.handleClose();
            this.setState({currentSession: null, receiverId: null, receiverName: null, receiverStatus: null});
        }
    }

    async onClickAccept() {
        this.refs.IncomeCall.handleClose();

        let mediaParams = {
            audio: {deviceId: this.state.audioDeviceId},
            video: {deviceId: this.state.videoDeviceId},
            options: {muted: true, mirror: true},
            elemId: 'localVideo'
        };
        let session = this.state.currentSession;

        try {
            await getLocalMedia(session, mediaParams);
            session.accept({});
        } catch (e) {
            session.stop({});
            this.setState({currentSession: null, receiverId: null, receiverName: null, receiverStatus: null});
        }
    }

    onHangUp() {
        this.state.currentSession.stop({});
        this.setState({currentSession: null, receiverId: null, receiverName: null, receiverStatus: null});
    }

    changeStaffType(e) {
        this.setState({staffType: e.target.value});
    }

    render() {
        let extraClass = this.state.qbUser? '': 'inactive';
        return (
            <div>
                <p className={`target ${extraClass}`}>
                    선택된 환자 : <span className="target-text">{this.state.receiverName? this.state.receiverName: '없음'}</span>
                    <span className="staff-desc">/</span>
                    <span className="staff-desc">접속정보 : </span>
                    <input className="staff-desc staff-radio" type="radio" value="aide" checked={this.state.staffType==='aide'} onChange={this.changeStaffType}/>
                    <span className={this.state.staffType==='aide'? 'target-text': ''}>조무사</span>
                    <input className="staff-desc staff-radio" type="radio" value="doctor" checked={this.state.staffType==='doctor'} onChange={this.changeStaffType}/>
                    <span className={this.state.staffType==='doctor'? 'target-text': ''}>의사</span>
                </p>
                <Table className="main-section" borderless={true}>
                    <tbody>
                        <tr>
                            <td className={`video-section ${extraClass}`}>
                                <div className="qb-video-remote">
                                    <video id="remoteVideo" className="qb-video_source" autoPlay playsinline/>
                                </div>
                                <div className="qb-video-local">
                                    <Button variant="warning" onClick={this.getLocalStream}>local-stream</Button>
                                    <Button variant="warning" className="calling" onClick={this.onCallingEvent}>on-call</Button>
                                    <Button variant="warning" className="calling" onClick={this.onHangUp}>hang-up</Button>
                                    <video id="localVideo" className="qb-video_source" autoPlay playsinline/>
                                </div>
                            </td>
                            <td className="appointment-section">
                                <AppointmentList onClickReceiver={this.onClickReceiver}/>
                            </td>
                        </tr>
                    </tbody>
                </Table>
                <IncomeCall ref="IncomeCall" onClickDecline={this.onClickDecline} onClickAccept={this.onClickAccept}/>
            </div>
        )
    }
}