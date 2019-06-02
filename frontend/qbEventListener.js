function onSessionCloseListener ($this) {
    QB.webrtc.onSessionCloseListener = session => {
        console.group('onSessionCloseListener');
            console.info('Session: ' + session);
        console.groupEnd();

        $this.state.currentSession.detachMediaStream('remoteVideo');
        $this.state.currentSession.detachMediaStream('localVideo');
    };
}

function onCallListener ($this) {
    QB.webrtc.onCallListener = (session, extension) => {
        console.group('onCallListener');
            console.info('Session: ' + session);
            console.info('Extension: ' + JSON.stringify(extension));
        console.groupEnd();

        $this.setState({currentSession: session});

        if (session.state !== QB.webrtc.SessionConnectionState.CLOSED)
            $this.refs.IncomeCall.handleOn();
    };
}

function onRejectCallListener() {
    QB.webrtc.onRejectCallListener = (session, userId, extension) => {
        console.group('onRejectCallListener');
            console.info('Session: ' + session);
            console.info('UserId: ' + userId);
            console.info('Extension: ' + extension);
        console.groupEnd();
    }
}

function onStopCallListener() {
    QB.webrtc.onStopCallListener = (session, userId, extension) => {
        console.group('onStopCallListener');
            console.info('Session: ' + session);
            console.info('UserId: ' + userId);
            console.info('Extension: ' + extension);
        console.groupEnd();
    }
}

function onAcceptCallListener() {
    QB.webrtc.onAcceptCallListener = function onAcceptCallListener(session, userId, extension) {
        console.group('onAcceptCallListener');
            console.info('UserId: ' + userId);
            console.info('Session: ' + session);
            console.info('Extension: ' + extension);
        console.groupEnd();
    };
}

function onRemoteStreamListener($this) {
    QB.webrtc.onRemoteStreamListener = (session, userId, stream) => {
        console.group('onRemoteStreamListener');
            console.info('UserId: ' + userId);
            console.info('Session: ' + session);
            console.info('Stream: ' + stream);
        console.groupEnd();

        let state = $this.state.currentSession.connectionStateForUser(userId);
        let peerConnList = QB.webrtc.PeerConnectionState;

        if (state === peerConnList.DISCONNECTED || state === peerConnList.FAILED || state === peerConnList.CLOSED) return false;

        $this.state.currentSession.peerConnections[userId].stream = stream;

        $this.state.currentSession.attachMediaStream('remoteVideo', stream);
    }
}

export {onSessionCloseListener, onCallListener, onRejectCallListener, onStopCallListener, onAcceptCallListener, onRemoteStreamListener};