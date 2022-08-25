import React, { Component } from 'react';
import { Row, Form, Button, Input, Select, message } from 'antd';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesReview from '../../../SubsidyReview/messages';
import { connect } from 'react-redux';
import moment from 'moment';
import { url } from '../../../../../utils/api/baseUrl'
import axios from 'axios';

class ReviewAccount extends Component {

    constructor(props) {
        super(props);
        this.state = {
            step1: props?.register.parent.step1,
            step2: props?.register.parent.step2,
            step3: props?.register.parent.step3,
            step4: props?.register.parent.step4,
        }
    }

    componentDidMount() {
        console.log(url);
        console.log(this.props);
        console.log(moment(this.state.step4.timeFromTo[0].from_time).format('HH:mm'));
    }

    onFinish = (values) => {
        console.log('Success:', values);
        this.props.onContinue();
    };

    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };


    onSubmit = async () => {

        const { step1, step2, step3, step4 } = this.state;
        const { email,
            password,
            username, } = step1;
        const {
            address,
            familyName,
            fatherEmail,
            fatherName,
            fatherPhoneNumber,
            maritialType,
            motherEmail,
            motherName,
            motherPhoneNumber
        } = step2;

        const {
            backgroundInfor,
            birthday,
            children,
            currentGrade,
            firstName,
            guardianEmail,
            guardianPhone,
            lastName,
            primaryTeacher,
            school,
            services
        } = step3[0];

        try {
            const data = {
                username,
                password,
                email,
                role: 3,
                "name": "chi_1",
                "parentInfo": {
                    address,
                    familyName,
                    fatherEmail,
                    fatherName,
                    fatherPhoneNumber,
                    maritialType,
                    motherEmail,
                    motherName,
                    motherPhoneNumber
                },
                studentInfos: [
                    {
                        firstName,
                        lastName,
                        birthday: moment(birthday).format('YYYY-MM-DD'),
                        guardianPhone,
                        guardianEmail,
                        backgroundInfor,
                        school,
                        primaryTeacher,
                        currentGrade,
                        services,
                        "hasIEP": 1,
                        "subsidyRequest": {
                            "skillSet": 1,
                            "school": "school",
                            "requestContactRav": 1,
                            "ravPhone": "333333",
                            "ravName": "ravName",
                            "ravEmail": "ravEmail@rav.com",
                            "therapistContact": "123 123",
                            "therapistPhone": "4444444",
                            "note": "123123 123123",
                            "documents": ["temp/1661196727220.xlsx"]
                        },
                        availabilitySchedule: [
                            {
                                "dayInWeek": 1,
                                "openHour": 7,
                                "openMin": 0,
                                "closeHour": 18,
                                "closeMin": 0
                            },
                            // {
                            //     "dayInWeek": 2,
                            //     "openHour": 7,
                            //     "openMin": 0,
                            //     "closeHour": 18,
                            //     "closeMin": 0
                            // },
                            // {
                            //     "dayInWeek": 3,
                            //     "openHour": 7,
                            //     "openMin": 0,
                            //     "closeHour": 18,
                            //     "closeMin": 0
                            // },
                            // {
                            //     "dayInWeek": 4,
                            //     "openHour": 7,
                            //     "openMin": 0,
                            //     "closeHour": 18,
                            //     "closeMin": 0
                            // }
                        ]
                    }
                ]
            }

            const response = await axios.post(url + 'users/signup', data);
            const { success } = response.data;
            if (success) {
                message.success('Create Successfully');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000)
            }
            else {
                message.error('Some thing error');
            }
        } catch (error) {
            console.log(error);
            message.error('Some thing error');
        }
    }

    render() {
        return (
            <Row justify="center" className="row-form">
                <Row justify="center" className="row-form">
                    <div className='col-form col-review-account'>
                        <div className='div-form-title'>
                            <p className='font-26 text-center'>{intl.formatMessage(messages.reviewAccountInfo)}</p>
                        </div>
                        <div>
                            <p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.usernameEmail)}</p>
                            <p>Username : {this.state?.step1.username}</p>
                            <p>Email : {this.state?.step1.email}</p>
                        </div>
                        <div>
                            <p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.parentsInfo)}</p>
                            <p className='font-14 underline'>{intl.formatMessage(messages.mother)}</p>
                            <p>Mother + Family name : {this.state.step2.motherName}</p>
                            <p>Mother phone : {this.state.step2.motherPhoneNumber}</p>
                            <p>Mother email : {this.state.step2.motherEmail}</p>
                            <p className='font-14 underline'>{intl.formatMessage(messages.father)}</p>
                            <p>Father + Family name : {this.state.step2.familyName} </p>
                            <p>Father phone : {this.state.step2.fatherPhoneNumber}</p>
                            <p>Father email : {this.state.step2.fatherEmail}</p>
                        </div>
                        <div>
                            <p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.address)}</p>
                            <p>Street Address : {this.state.step2.address}</p>
                            {/* <p>City State Zip : </p> */}
                            <p>City State Zip : {this.state.step2.family_name}</p>
                        </div>
                        <div>
                            <p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.dependentsInfo)}</p>
                            <p className='font-14 font-700 mb-10'>Dependent #1 First + Last Name + DOB</p>
                            <p>School : {this.state.step4.school}</p>
                            <div className='review-item'>
                                <p>Teacher : {this.state.step4.primaryTeacher} </p>
                                <p>Grade : {this.state.step4.currentGrade}</p>
                            </div>
                            <div className='review-item'>
                                <p className='font-14 font-700 mb-10'>{intl.formatMessage(messages.servicesRequested)}</p>
                                <p>Has an IEP</p>
                            </div>
                            <div className='review-item-3'>
                                {this.state.step4.services.map((item, index) => { return <p key={index}>{item}</p> })}
                                {/* <p>Service#1</p>
                                <p>Service#2</p>
                                <p>Service#3</p> */}
                            </div>
                        </div>
                        <div>
                            <p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.availability)}</p>
                            <div className='review-item-flex'>
                                <div className='item-flex'>
                                    <p className='font-14 font-700 mb-10'>{intl.formatMessage(messages.sunday)}</p>
                                    <p>AM#1.1 - AM#1.2</p>
                                    <p>AM#1.1 - AM#1.2</p>
                                    <p>AM#1.1 - AM#1.2</p>
                                </div>
                                {/* <div className='item-flex'>
                                    <p className='font-14 font-700 mb-10'>{intl.formatMessage(messages.wednesday)}</p>
                                    <p>AM#1.1 - AM#1.2</p>
                                    <p>AM#1.1 - AM#1.2</p>
                                </div>
                                <div className='item-flex'>
                                    <p className='font-14 font-700 mb-10'>{intl.formatMessage(messages.thursday)}</p>
                                    <p>AM#1.1 - AM#1.2</p>
                                </div> */}
                            </div>
                        </div>

                        <div className="form-btn continue-btn" >
                            <Button
                                block
                                type="primary"
                                htmlType="submit"
                                onClick={this.onSubmit}
                            >
                                {intl.formatMessage(messagesReview.submit).toUpperCase()}
                            </Button>
                        </div>
                    </div>
                </Row>
            </Row>
        );
    }
}

const mapStateToProps = state => {
    console.log(state.register);
    return {
        register: state.register
    }
}

export default connect(mapStateToProps)(ReviewAccount);