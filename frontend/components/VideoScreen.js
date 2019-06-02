import React from 'react';
import {Button, Table} from 'react-bootstrap';
import {createRTCSession, getLocalMedia, onCall, qbPush} from '../qbHelpers';
import {onCallListener} from '../qbEventListener';
import AppointmentList from './AppointmentList';
import {IncomeCall} from './modals';

export default class VideoScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            qbUser: null,
            videoDeviceId: null,
            audioDeviceId: null,
            receiverId: null,
            receiverName: null,
            currentSession: null
        };

        onCallListener(this);

        this.getLocalStream = this.getLocalStream.bind(this);
        this.onClickReceiver = this.onClickReceiver.bind(this);
        this.onCallingEvent = this.onCallingEvent.bind(this);
        this.onClickDecline = this.onClickDecline.bind(this);
    }

    componentWillReceiveProps(props) {
        if (!props.qbUser || !props.deviceInfo) return;

        this.setState({
            qbUser: props.qbUser,
            videoDeviceId: props.deviceInfo[0],
            audioDeviceId: props.deviceInfo[1]
        });
    }

    // addQuickbloxEvent() {
    //     QB.webrtc.onCallListener = (session, extension) => {
    //         console.group('onCallListener');
    //             console.info('Session: ', session);
    //             console.info('Extension: ', extension);
    //         console.groupEnd();
    //
    //         this.setState({currentSession: session});
    //
    //         if (session.state !== QB.webrtc.SessionConnectionState.CLOSED)
    //             this.refs.IncomeCall.handleOn();
    //     };
    // }

    async getLocalStream() {
        if (!this.state.videoDeviceId || !this.state.audioDeviceId || !this.state.receiverId) return;

        let mediaParams = {
            audio: {deviceId: this.state.audioDeviceId},
            video: {deviceId: this.state.videoDeviceId},
            options: {muted: true, mirror: true},
            elemId: 'localVideo'
        };

        let currentSession = createRTCSession([this.state.receiverId]);

        console.log(currentSession);

        this.setState({currentSession: currentSession});

        try {
            await getLocalMedia(currentSession, mediaParams);
        } catch (e) {
            currentSession.stop({});
        }
    }

    onClickReceiver(internalId, name) {
        this.setState({receiverId: internalId, receiverName: name});
    }

    onCallingEvent() {
        let state = this.state;

        if (!state.receiverId) return;

        let currentSession = state.currentSession;

        onCall(currentSession).then(() => {
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
            this.setState({currentSession: null, receiverId: null, receiverName: null});
        }
    }

    render() {
        return (
            <div>
                <p className="target">target : <span className="target-text">{this.state.receiverName? this.state.receiverName: '없음'}</span></p>
                <Table className="main-section" borderless={true}>
                    <tbody>
                        <tr>
                            <td className="video-section">
                                <div className="qb-video-remote">
                                    <video id="remoteVideo" className="qb-video_source" autoPlay playsinline/>
                                </div>
                                <div className="qb-video-local">
                                    <Button variant="warning" onClick={this.getLocalStream}>on local</Button>
                                    <Button variant="warning" className="calling" onClick={this.onCallingEvent}>on call</Button>
                                    <video id="localVideo" className="qb-video_source" autoPlay playsinline/>
                                </div>
                            </td>
                            <td className="appointment-section">
                                <AppointmentList onClickReceiver={this.onClickReceiver}/>
                            </td>
                        </tr>
                    </tbody>
                </Table>
                <IncomeCall ref="IncomeCall" onClickDecline={this.onClickDecline}/>
            </div>
        )
    }
}