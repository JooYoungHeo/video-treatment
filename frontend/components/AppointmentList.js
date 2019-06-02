import React from 'react';
import axios from 'axios';
import {ListGroup, Badge} from 'react-bootstrap';

export default class AppointmentList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            doctorId: 1,
            appointments: []
        };

        this.apiInterval = null;
        this.getAppointments = this.getAppointments.bind(this);
        this.onClickReceiver = this.onClickReceiver.bind(this);
    }

    componentDidMount() {
        this.apiInterval = setInterval(() => this.getAppointments(), 5000);
    }

    componentWillUnmount() {
        this.apiInterval = null;
    }

    getAppointments() {
        axios.get('/api/v1/appointments', {
            params: {
                doctorId: this.state.doctorId
            }
        }).then(response => {
            this.setState({appointments: response.data});
        }).catch(err => {
            this.setState({appointments: []});
        });
    }

    onClickReceiver(qbId, name, status) {
        if (typeof this.props.onClickReceiver === 'function') this.props.onClickReceiver(qbId, name, status);
    }

    render() {
        return (
            <div>
                <div className="appointment-list">
                    <h5><Badge variant="secondary">예약 리스트</Badge></h5>
                    <ListGroup>
                        {this.state.appointments.map((item, i) => {
                            let status = item.status.toLowerCase();
                            let statusText = status === 'none'? '상담전': status === 'pre'? '상담중': status === 'ready'? '진료전': '진료중';

                            return (
                                <ListGroup.Item key={i} onClick={() => this.onClickReceiver(item.user.internalId, item.user.name, status)}>
                                    <p>
                                        <strong>{item.user.name}</strong>
                                        <span className={`user-status ${status}`}>{statusText}</span>
                                    </p>
                                    <span className="small-text">({item.date})</span>
                                </ListGroup.Item>
                            )
                        })}
                    </ListGroup>
                </div>
            </div>
        )
    }
}