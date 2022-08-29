import React, { Component } from 'react';
import { Row, Form, Button, Input, Select, message } from 'antd';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesReview from '../../../SubsidyReview/messages';
import { connect } from 'react-redux';
import { compose } from 'redux';
import moment from 'moment';
import { url } from '../../../../../utils/api/baseUrl'
import axios from 'axios';
import { setRegisterData } from '../../../../../redux/features/registerSlice';

class ReviewAccount extends Component {

    constructor(props) {
        super(props);



        console.log(this.props);

        this.state = {
            registerData:{
                parentInfo:{},
                studentInfos:[],
            }
        }
    }

    componentDidMount() {
        const {registerData} = this.props.register;
        console.log('old progress',registerData);
        this.setState({
            registerData:registerData
        })
    }

    onFinish = (values) => {
        console.log('Success:', values);
        this.props.onContinue();
    };

    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    onSubmit = async () => {
        const {registerData} = this.props.register;
        const response = await axios.post(url + 'users/signup', registerData);
        const { success, data } = response.data;
        if (success) {
            message.success('Create Successfully');
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000)
        }
        return;
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

        try {
            const data1 = {
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
                studentInfos: this.state.step3.map(item => {
                    return {
                        ...item,
                        birthday: moment(item.birthday).format('YYYY-MM-DD'),
                    }
                })

            }

            const response = await axios.post(url + 'users/signup', data1);
            const { success, data } = response.data;
            if (success) {
                message.success('Create Successfully');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000)
            }
        } catch (error) {
            message.error(error?.response?.data?.data ?? error.message);
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
                            <p>Username : {this.state?.registerData.username}</p>
                            <p>Email : {this.state?.registerData.email}</p>
                        </div>
                        <div>
                            <p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.parentsInfo)}</p>
                            <p className='font-14 underline'>{intl.formatMessage(messages.mother)}</p>
                            <p>Mother + Family name : {this.state.registerData?.parentInfo.motherName}</p>
                            <p>Mother phone : {this.state.registerData?.parentInfo.motherPhoneNumber}</p>
                            <p>Mother email : {this.state.registerData?.parentInfo.motherEmail}</p>
                            <p className='font-14 underline'>{intl.formatMessage(messages.father)}</p>
                            <p>Father + Family name : {this.state.registerData?.parentInfo.familyName} </p>
                            <p>Father phone : {this.state.registerData?.parentInfo.fatherPhoneNumber}</p>
                            <p>Father email : {this.state.registerData?.parentInfo.fatherEmail}</p>
                        </div>
                        <div>
                            <p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.address)}</p>
                            <p>Street Address : {this.state.registerData?.parentInfo.address}</p>
                            {/* <p>City State Zip : </p> */}
                            {/* <p>City State Zip : {this.state.registerData?.parentInfo.family_name}</p> */}
                        </div>
                        {this.state.registerData?.studentInfos.map((item, index) => {
                            return (
                                <div>
                                    <p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.dependentsInfo)}</p>
                                    <p className='font-14 font-700 mb-10'>Dependent #{++index} {item.firstName} {item.lastName} + DOB</p>
                                    <p>School : {item.school}</p>
                                    <div className='review-item'>
                                        <p>Teacher : {item.primaryTeacher} </p>
                                        <p>Grade : {item.currentGrade}</p>
                                    </div>
                                    <div className='review-item'>
                                        <p className='font-14 font-700 mb-10'>{intl.formatMessage(messages.servicesRequested)}</p>
                                        <p>Has an IEP</p>
                                    </div>
                                    <div className='review-item-3'>
                                        {item.services.map((service, index) => { return <p key={index}>{service}</p> })}
                                        {/* <p>Service#1</p>
                                <p>Service#2</p>
                                <p>Service#3</p> */}
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
                                </div>

                            )

                        })}


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
    console.log('mapState prop review',state.register);
    return {
        register: state.register
    }
}


export default compose(connect(mapStateToProps, { setRegisterData }))(ReviewAccount);