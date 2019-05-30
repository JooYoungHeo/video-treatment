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
    }

    componentDidMount() {
        axios.get('/api/v1/appointments', {
            params: {
                doctorId: this.state.doctorId
            }
        }).then(response => {
            this.setState({appointments: response.data});
        }).catch(err => {});
    }

    render() {
        return (
            <div>
                <h5><Badge variant="secondary">예약 리스트</Badge></h5>
                <ListGroup>
                    {this.state.appointments.map((item, i) => (
                        <ListGroup.Item key={i}>
                            <strong>{i+1} : {item.user.name}</strong> <span className="small-text">({item.date})</span>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>
        )
    }
}