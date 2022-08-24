import React, { Component } from 'react';
import { Row, Form, Button, Input, Select } from 'antd';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesReview from '../../../SubsidyReview/messages';
import { connect } from 'react-redux';

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


    onFinish = (values) => {
        console.log('Success:', values);
        this.props.onContinue();
    };

    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
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
                            <p>Mother + Family name : {this.state.step2.mother_name}</p>
                            <p>Mother phone : {this.state.step2.mother_phone}</p>
                            <p>Mother email : {this.state.step2.mother_email}</p>
                            <p className='font-14 underline'>{intl.formatMessage(messages.father)}</p>
                            <p>Father + Family name : {this.state.step2.father_name} </p>
                            <p>Father phone : {this.state.step2.father_name}</p>
                            <p>Father email : {this.state.step2.father_name}</p>
                        </div>
                        <div>
                            <p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.address)}</p>
                            <p>Street Address : {this.state.step2.address}</p>
                            {/* <p>City State Zip : </p> */}
                            <p>Family Name : {this.state.step2.family_name}</p>
                        </div>
                        <div>
                            <p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.dependentsInfo)}</p>
                            <p className='font-14 font-700 mb-10'>Dependent #1 First + Last Name + DOB</p>
                            <p>School : {this.state.step4.school}</p>
                            <div className='review-item'>
                                <p>Teacher : {this.state.step4.primary_teacher} </p>
                                <p>Grade : {this.state.step4.current_grade}</p>
                            </div>
                            <div className='review-item'>
                                <p className='font-14 font-700 mb-10'>{intl.formatMessage(messages.servicesRequested)}</p>
                                <p>Has an IEP</p>
                            </div>
                            <div className='review-item-3'>
                                {this.state.step4.marital_status.map((item, index) => { return <p key={index}>{item}</p> })}
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
                                <div className='item-flex'>
                                    <p className='font-14 font-700 mb-10'>{intl.formatMessage(messages.wednesday)}</p>
                                    <p>AM#1.1 - AM#1.2</p>
                                    <p>AM#1.1 - AM#1.2</p>
                                </div>
                                <div className='item-flex'>
                                    <p className='font-14 font-700 mb-10'>{intl.formatMessage(messages.thursday)}</p>
                                    <p>AM#1.1 - AM#1.2</p>
                                </div>
                            </div>
                        </div>

                        <div className="form-btn continue-btn" >
                            <Button
                                block
                                type="primary"
                                htmlType="submit"
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