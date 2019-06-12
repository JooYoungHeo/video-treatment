import React from 'react';
import moment from 'moment';
import {Button, Table} from 'react-bootstrap';
import {createRTCSession, getLocalMedia, onCall, qbPush, updateAppointment} from '../qbHelpers';
import {onSessionCloseListener, onUserNotAnswerListener, onCallListener, onRejectCallListener, onStopCallListener,
    onAcceptCallListener, onRemoteStreamListener} from '../qbEventListener';
import AppointmentList from './AppointmentList';
import {IncomeCall} from './modals';

export default class VideoScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            staffType: 'aide',
            qbUser: null,
            deviceInfo: null,
            currentSession: null,
            targetUser: null,
            callState: false,
            remoteRecorder: null,
            localRecorder: null,
            localStream: null
        };

        onSessionCloseListener(this);
        onUserNotAnswerListener(this);
        onCallListener(this);
        onRejectCallListener(this);
        onStopCallListener(this);
        onAcceptCallListener(this);
        onRemoteStreamListener(this);

        this.clickTargetUser = this.clickTargetUser.bind(this);
        this.clickDecline = this.clickDecline.bind(this);
        this.onClickAccept = this.onClickAccept.bind(this);
        this.changeStaffType = this.changeStaffType.bind(this);
        this.startVideoCall = this.startVideoCall.bind(this);
        this.endVideoCall = this.endVideoCall.bind(this);
        this.startRecord = this.startRecord.bind(this);
        this.stopLocalRecord = this.stopLocalRecord.bind(this);
        this.stopRemoteRecord = this.stopRemoteRecord.bind(this);
    }

    componentWillReceiveProps(props) {
        if (!props.qbUser || !props.deviceInfo) return;

        this.setState({
            qbUser: props.qbUser,
            deviceInfo: props.deviceInfo
        });
    }

    clickTargetUser(targetUser) {
        this.setState({targetUser: targetUser});
    }

    clickDecline() {
        this.refs.IncomeCall.handleClose();

        let session = this.state.currentSession;

        if (session) {
            session.reject({});
            this.setState({currentSession: null});
        }
    }

    async onClickAccept() {
        this.refs.IncomeCall.handleClose();

        let session = this.state.currentSession;

        try {
            await getLocalMedia(session, this.state.deviceInfo[1], this.state.deviceInfo[0]);
            session.accept({});
            this.setState({callState: true});
        } catch (e) {
            session.stop({});
            this.setState({currentSession: null});
        }
    }

    changeStaffType(e) {
        this.setState({staffType: e.target.value});
    }

    async startVideoCall() {
        let $state = this.state;
        let $target = $state.targetUser;

        if (!$state.deviceInfo || !$target || $state.callState) return;
        if (($state.staffType !== 'aide' || $target.status !== 'none') && ($state.staffType !== 'doctor' || $target.status !== 'ready')) return;

        let currentSession = createRTCSession([$target.internalId]);

        try {
            let localStream = await getLocalMedia(currentSession, $state.deviceInfo[1], $state.deviceInfo[0]);
            console.info('[App] get local stream success');

            await qbPush($state.qbUser.full_name, [$target.internalId]);
            await onCall(currentSession, {
                appointmentId: $target.appointmentId,
                name: $state.qbUser.full_name,
                staffType: $state.staffType
            });

            this.setState({currentSession: currentSession, localStream: localStream});
            console.info('[App] start video call success');
        } catch (e) {
            currentSession.stop({});
            console.warn('[App] start video call fail', e);
        }
    }

    async endVideoCall() {
        let $state = this.state;
        let appointmentId = $state.targetUser? $state.targetUser.appointmentId: null;

        if (!$state.callState) return;

        $state.remoteRecorder.stop();
        $state.localRecorder.stop();
        $state.currentSession.stop({});
        this.refs.AppointmentList.clearTarget();

        console.info('[App] end video call success');

        if (appointmentId) {
            try {
                await updateAppointment(appointmentId, $state.staffType, 1);
                console.info('[App] update appointment status success');
            } catch (e) {
                console.warn('[App] update appointment status fail', e);
            }
        }
    }

    startRecord(stream, source) {
        let $self = this;
        let opts = {
            onstart: () => {
                console.info(`[App] ${source} record start`);
            },
            onstop: blob => {
                console.info(`[App] ${source} record stop`);
                if (source === 'local') $self.stopLocalRecord(blob);
                else $self.stopRemoteRecord(blob);
            },
            onerror: e => {
                console.error('error', e);
            }
        };

        let $stateRecorder = (source === 'local')? 'localRecorder': 'remoteRecorder';
        let recorder = new QBMediaRecorder(opts);
        recorder.start(stream);

        $self.setState({[$stateRecorder]: recorder});
    }

    stopLocalRecord(blob) {
        let $state = this.state;
        $state.localRecorder.download(`video-local-${$state.targetUser.name}`, blob);
        this.setState({localRecorder: null, localStream: null});
    }

    stopRemoteRecord(blob) {
        let $state = this.state;
        $state.remoteRecorder.download(`video-remote-${$state.targetUser.name}`, blob);
        this.setState({currentSession: null, targetUser: null, callState: false, remoteRecorder: null});
    }

    render() {

        console.log('local: ' + this.state.localRecorder);
        console.log('remote: ' + this.state.remoteRecorder);

        let extraClass = this.state.qbUser? '': 'inactive';
        return (
            <div>
                <p className={`target ${extraClass}`}>
                    선택된 환자 : <span className="target-text">{this.state.targetUser? this.state.targetUser.name: '없음'}</span>
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
                                    <video id="remoteVideo" className="qb-video_source" autoPlay/>
                                </div>
                                <div className="qb-video-local">
                                    <video id="localVideo" className="qb-video_source" autoPlay/>
                                </div>
                                <div className="video-btn">
                                    <Button variant="primary" onClick={this.startVideoCall}>video call</Button>
                                    <Button variant="danger" className="call-btn" onClick={this.endVideoCall}>end call</Button>
                                </div>
                            </td>
                            <td className="appointment-section">
                                <AppointmentList ref="AppointmentList" onClickTarget={this.clickTargetUser}/>
                            </td>
                        </tr>
                    </tbody>
                </Table>
                <IncomeCall ref="IncomeCall" onClickDecline={this.clickDecline} onClickAccept={this.onClickAccept}/>
            </div>
        )
    }
}