import React from 'react';
import axios from 'axios';
import {ListGroup, Badge} from 'react-bootstrap';

export default class AppointmentList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            doctorId: 1,
            appointments: [],
            clickedIndex: -1
        };

        this.apiInterval = null;
        this.getAppointments = this.getAppointments.bind(this);
        this.onClickTarget = this.onClickTarget.bind(this);
        this.clearTarget = this.clearTarget.bind(this);
    }

    componentDidMount() {
        this.apiInterval = setInterval(() => this.getAppointments(), 1000);
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

    onClickTarget(i, appointmentId, internalId, name, uid, status) {
        if (this.state.clickedIndex !== i) this.setState({clickedIndex: i});
        if (typeof this.props.onClickTarget === 'function') this.props.onClickTarget({appointmentId, internalId, name, uid, status});
    }

    clearTarget() {
        this.setState({clickedIndex: -1});
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
                            let variant = this.state.clickedIndex === i ? "danger":"";

                            return (
                                <ListGroup.Item className="appointment" variant={variant} key={i} onClick={() => this.onClickTarget(i, item.id, item.user.internalId, item.user.name, item.user.id, status)}>
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