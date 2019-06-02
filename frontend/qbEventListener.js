function onCallListener ($this) {
    QB.webrtc.onCallListener = (session, extension) => {
        console.group('onCallListener');
            console.info('Session: ' + session);
            console.info('Extension: ' + extension);
        console.groupEnd();

        $this.setState({currentSession: session});

        if (session.state !== QB.webrtc.SessionConnectionState.CLOSED)
            $this.refs.IncomeCall.handleOn();
    };
}

export {onCallListener};