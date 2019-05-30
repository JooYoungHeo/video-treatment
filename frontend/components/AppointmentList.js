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

    render() {
        return (
            <div>
                <div className="appointment-list">
                    <h5><Badge variant="secondary">예약 리스트</Badge></h5>
                    <p className="status">
                        <span className="none">■</span>상담전<span className="ready">■</span>대기<span className="finish">■</span>완료
                    </p>
                    <ListGroup>
                        {this.state.appointments.map((item, i) => {
                            let status = item.status;
                            let variant = status === 'None'? 'info': status === 'Ready'? 'danger': 'success';

                            return (
                                <ListGroup.Item variant={variant} key={i}>
                                    <strong>{item.user.name}</strong> <span className="small-text">({item.date})</span>
                                </ListGroup.Item>
                            )
                        })}
                    </ListGroup>
                </div>
            </div>
        )
    }
}