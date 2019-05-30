import React from 'react';
import {Button, Table} from 'react-bootstrap';
import {createRTCSession, getLocalMedia} from '../qbHelpers';
import AppointmentList from './AppointmentList';

export default class VideoScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            videoDeviceId: null,
            audioDeviceId: null,
            receiver: []
        };

        this.beforeCall = this.beforeCall.bind(this);
    }

    componentWillReceiveProps(props) {
        if (!props.deviceInfo) return;

        this.setState({
            videoDeviceId: props.deviceInfo[0],
            audioDeviceId: props.deviceInfo[1]
        });
    }

    async beforeCall() {
        if (!this.state.videoDeviceId && !this.state.audioDeviceId) return;

        let mediaParams = {
            audio: {deviceId: this.state.audioDeviceId},
            video: {deviceId: this.state.videoDeviceId},
            options: {muted: true, mirror: true},
            elemId: 'localVideo'
        };

        let currentSession = createRTCSession(this.state.receiver);

        try {
            await getLocalMedia(currentSession, mediaParams);
        } catch (e) {
            currentSession.stop({});
        }
    }

    render() {
        return (
            <div>
                <Table borderless={true}>
                    <tbody>
                        <tr>
                            <td className="video-section">
                                <div className="qb-video-remote">
                                    <video id="remoteVideo" className="qb-video_source" autoPlay playsinline/>
                                </div>
                                <div className="qb-video-local">
                                    <Button variant="warning" onClick={this.beforeCall}>do something</Button>
                                    <video id="localVideo" className="qb-video_source" autoPlay playsinline/>
                                </div>
                            </td>
                            <td className="appointment-section">
                                <AppointmentList/>
                            </td>
                        </tr>
                    </tbody>
                </Table>
            </div>
        )
    }
}