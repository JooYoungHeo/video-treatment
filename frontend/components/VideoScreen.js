import React from 'react';
import {Button, Table} from 'react-bootstrap';
import {createRTCSession, getLocalMedia, onCall, qbPush, updateAppointment} from '../qbHelpers';
import {onSessionCloseListener, onCallListener, onRejectCallListener, onStopCallListener, onAcceptCallListener, onRemoteStreamListener} from '../qbEventListener';
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
            appointmentId: null,
            receiverId: null,
            receiverName: null,
            receiverStatus: null,
            currentSession: null,
            calling: false
        };

        onSessionCloseListener(this);
        onCallListener(this);
        onRejectCallListener();
        onStopCallListener(this);
        onAcceptCallListener(this);
        onRemoteStreamListener(this);

        this.getLocalStream = this.getLocalStream.bind(this);
        this.onClickReceiver = this.onClickReceiver.bind(this);
        this.onCallingEvent = this.onCallingEvent.bind(this);
        this.onClickDecline = this.onClickDecline.bind(this);
        this.onClickAccept = this.onClickAccept.bind(this);
        this.onHangUp = this.onHangUp.bind(this);
        this.changeStaffType = this.changeStaffType.bind(this);
        this.sessionClear = this.sessionClear.bind(this);
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

    onClickReceiver(appointmentId, internalId, name, status) {
        this.setState({appointmentId: appointmentId, receiverId: internalId, receiverName: name, receiverStatus: status});
    }

    onCallingEvent() {
        let state = this.state;

        if (!state.receiverId) return;

        let currentSession = state.currentSession;

        if ((state.staffType !== 'aide' || state.receiverStatus !== 'none') && (state.staffType !== 'doctor' || state.receiverStatus !== 'ready')) {
            alert('잘못된 대상');
            return;
        }

        onCall(currentSession, {
            appointmentId: state.appointmentId,
            name: state.qbUser.full_name,
            staffType: state.staffType
        }).then(() => {
            return qbPush(state.qbUser.full_name, [state.receiverId]);
        }).then(() => {
            this.setState({calling: true});
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
            this.sessionClear();
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
            this.setState({calling: true});
        } catch (e) {
            session.stop({});
            this.sessionClear();
        }
    }

    async onHangUp() {
        let state = this.state;

        if (!state.currentSession) return;

        state.currentSession.stop({});
        this.sessionClear();

        try {
            await updateAppointment(state.appointmentId, state.staffType, 1);
        } catch (err) {
            console.warn('update appointment error', err);
        }
    }

    changeStaffType(e) {
        this.setState({staffType: e.target.value});
    }

    sessionClear() {
        this.setState({currentSession: null, appointmentId: null, receiverId: null, receiverName: null, receiverStatus: null, calling: false});
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
                                    <video id="localVideo" className="qb-video_source" autoPlay playsinline/>
                                </div>
                                <div className="video-btn">
                                    <Button variant="warning" disabled={!this.state.receiverId} onClick={this.getLocalStream}>local-stream</Button>
                                    <Button variant="warning" disabled={!this.state.currentSession} className="call-btn" onClick={this.onCallingEvent}>on-call</Button>
                                    <Button variant="warning" disabled={!this.state.calling} className="call-btn" onClick={this.onHangUp}>hang-up</Button>
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