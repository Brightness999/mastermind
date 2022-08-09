import React,  {Component} from 'react';
import { Row, Form, Button, Input, Select } from 'antd';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesReview from '../../../SubsidyReview/messages';

class ReviewAccount extends Component {
    onFinish = (values) => {
        console.log('Success:', values);
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
                            <p>Username</p>
                            <p>Email</p>
                        </div>
                        <div>
                            <p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.parentsInfo)}</p>
                            <p className='font-14 underline'>{intl.formatMessage(messages.mother)}</p>
                            <p>Mother + Family name</p>
                            <p>Mother phone</p>
                            <p>Mother email</p>
                            <p className='font-14 underline'>{intl.formatMessage(messages.father)}</p>
                            <p>Father + Family name</p>
                            <p>Father phone</p>
                            <p>Father email</p>
                        </div>
                        <div>
                            <p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.address)}</p>
                            <p>Street Address </p>
                            <p>City State Zip</p>
                        </div>
                        <div>
                            <p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.dependentsInfo)}</p>
                            <p className='font-14 font-700 mb-10'>Dependent #1 First + Last Name + DOB</p>
                            <p>School</p>
                            <div className='review-item'>
                                <p>Teacher</p>
                                <p>Grade</p>
                            </div>
                            <div className='review-item'>
                                <p className='font-14 font-700 mb-10'>{intl.formatMessage(messages.servicesRequested)}</p>
                                <p>Has an IEP</p>
                            </div>
                            <div className='review-item-3'>
                                <p>Service#1</p>
                                <p>Service#2</p>
                                <p>Service#3</p>
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
                                onClick={this.props.onContinueProgress}
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
export default ReviewAccount;