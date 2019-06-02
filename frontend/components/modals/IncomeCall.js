import React from 'react';
import {Modal, Button} from 'react-bootstrap';

export default class IncomeCall extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            show: false
        };

        this.onClickDecline = this.onClickDecline.bind(this);
        this.onClickAccept = this.onClickAccept.bind(this);
        this.handleOn = this.handleOn.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    onClickDecline() {
        if (typeof this.props.onClickDecline === 'function') this.props.onClickDecline();
    }

    onClickAccept() {
        if (typeof this.props.onClickAccept === 'function') this.props.onClickAccept();
    }

    handleOn() {
        this.setState({show: true});
    }

    handleClose() {
        this.setState({show: false});
    }

    render() {
        return (
            <Modal className="modal-income-call" show={this.state.show} onHide={this.handleClose}>
                <Modal.Header>
                    <Modal.Title>전화왔음</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Button className="decline" variant="danger" onClick={this.onClickDecline}>
                        Decline
                    </Button>
                    <Button className="accept" variant="primary" onClick={this.onClickAccept}>
                        Accept
                    </Button>
                </Modal.Body>
            </Modal>
        )
    }
}