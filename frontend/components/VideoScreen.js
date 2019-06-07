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
            deviceInfo: null,
            currentSession: null,
            targetUser: null,
            callState: false
        };

        onSessionCloseListener(this);
        onCallListener(this);
        onRejectCallListener(this);
        onStopCallListener(this);
        onAcceptCallListener(this);
        onRemoteStreamListener(this);

        this.getLocalStream = this.getLocalStream.bind(this);
        this.dropLocalStream = this.dropLocalStream.bind(this);
        this.clickTargetUser = this.clickTargetUser.bind(this);
        this.makeCall = this.makeCall.bind(this);
        this.clickDecline = this.clickDecline.bind(this);
        this.onClickAccept = this.onClickAccept.bind(this);
        this.clickHangUp = this.clickHangUp.bind(this);
        this.changeStaffType = this.changeStaffType.bind(this);


        this.startVideoCall = this.startVideoCall.bind(this);
        this.endVideoCall = this.endVideoCall.bind(this);
    }

    componentWillReceiveProps(props) {
        if (!props.qbUser || !props.deviceInfo) return;

        this.setState({
            qbUser: props.qbUser,
            deviceInfo: props.deviceInfo
        });
    }

    async getLocalStream() {
        if (!this.state.deviceInfo || !this.state.targetUser) return;

        let currentSession = createRTCSession([this.state.targetUser.internalId]);

        try {
            await getLocalMedia(currentSession, this.state.deviceInfo[1], this.state.deviceInfo[0]);
            this.setState({currentSession: currentSession});
            console.info('[App] get local stream success');
        } catch (e) {
            currentSession.stop({});
            this.setState({currentSession: null});
            console.warn('[App] get local stream fail', e);
        }
    }

    dropLocalStream() {
        let $state = this.state;
        if (!$state.currentSession || $state.callState) return;

        $state.currentSession.stop({});
        this.setState({currentSession: null});

        console.info('[App] drop local stream');
    }

    clickTargetUser(targetUser) {
        this.setState({targetUser: targetUser});
    }


    async makeCall() {
        let $state = this.state;
        let $target = $state.targetUser;

        if (!$state.currentSession || !$target) return;
        if (($state.staffType !== 'aide' || $target.status !== 'none') && ($state.staffType !== 'doctor' || $target.status !== 'ready')) {
            alert('통화 불가');
            return;
        }

        try {
            await qbPush($state.qbUser.full_name, [$target.internalId]);
            await onCall($state.currentSession, {
                appointmentId: $target.appointmentId,
                name: $target.name,
                staffType: $state.staffType
            });

            this.setState({callState: true});
            console.info('[App] make a call success');
        } catch (e) {
            $state.currentSession.stop({});
            this.setState({currentSession: null, targetUser: null});
            console.warn('[App] make a call fail', e);
        }
    }

    async clickHangUp() {
        let $state = this.state;
        let appointmentId = $state.targetUser.appointmentId;

        if (!$state.currentSession || !$state.callState) return;

        $state.currentSession.stop({});

        this.refs.AppointmentList.clearTarget();
        this.setState({currentSession: null, targetUser: null, callState: false});
        console.info('[App] hangup call success');

        try {
            await updateAppointment(appointmentId, $state.staffType, 1);
            console.info('[App] update appointment status success');
        } catch (e) {
            console.warn('[App] update appointment status fail', e);
        }
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

        if (!$state.deviceInfo || !$target) return;
        if (($state.staffType !== 'aide' || $target.status !== 'none') && ($state.staffType !== 'doctor' || $target.status !== 'ready')) return;

        let currentSession = createRTCSession([$target.internalId]);

        try {
            await getLocalMedia(currentSession, $state.deviceInfo[1], $state.deviceInfo[0]);
            console.info('[App] get local stream success');

            await qbPush($target.name, [$target.internalId]);
            await onCall(currentSession, {
                appointmentId: $target.appointmentId,
                name: $target.name,
                staffType: $state.staffType
            });

            this.setState({currentSession: currentSession, callState: true});
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

        $state.currentSession.stop({});
        this.setState({currentSession: null, targetUser: null, callState: false});
        this.refs.AppointmentList.clearTarget();

        console.info('[App] end video call success');

        try {
            if (appointmentId) await updateAppointment(appointmentId, $state.staffType, 1);

            console.info('[App] update appointment status success');
        } catch (e) {
            console.warn('[App] update appointment status fail', e);
        }
    }

    render() {
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
                                    {/*<Button variant="warning" disabled={this.state.currentSession||this.state.callState} onClick={this.getLocalStream}>로컬 연결</Button>*/}
                                    {/*<Button variant="warning" disabled={!this.state.currentSession||this.state.callState} className="call-btn" onClick={this.dropLocalStream}>로컬 해제</Button>*/}
                                    {/*<Button variant="warning" disabled={!this.state.currentSession||this.state.callState} className="call-btn" onClick={this.makeCall}>발신</Button>*/}
                                    {/*<Button variant="warning" disabled={!this.state.callState} className="call-btn" onClick={this.clickHangUp}>종료</Button>*/}
                                    <Button variant="primary" onClick={this.startVideoCall}>video call</Button>
                                    <Button variant="dark" className="call-btn" onClick={this.endVideoCall}>end call</Button>
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