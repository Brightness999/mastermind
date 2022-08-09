import React from 'react';
import { Row, Col, Form, Button, Input, Select, Segmented, TimePicker, } from 'antd';
import { BsPlusCircle } from 'react-icons/bs';
import { BiChevronLeft } from 'react-icons/bi';
import { Link } from 'dva/router';
import { routerLinks } from '../../../constant';
import moment from 'moment';
import intl from 'react-intl-universal';
import messages from '../messages';
import messagesCreateAccount from '../../CreateAccount/messages';
import messagesLogin from '../../Login/messages';
import './index.less';

export default class extends React.Component {
  onFinish = (values) => {
    console.log('Success:', values);
  };

  onFinishFailed = (errorInfo) => {
      console.log('Failed:', errorInfo);
  };
  render() {
    const day_week = [
      intl.formatMessage(messagesCreateAccount.sunday),
      intl.formatMessage(messagesCreateAccount.monday) + '-' + intl.formatMessage(messagesCreateAccount.thursday),
      intl.formatMessage(messagesCreateAccount.friday),
    ]
    return (
      <div className="full-layout page infoschool-page">
        <Row justify="center" className="row-form">
          <div className='col-form col-school'>
            <div className='div-form-title mb-10'>
              <p className='font-30 text-center mb-0'>{intl.formatMessage(messages.schoolDetails)}</p>
            </div>
            <Form 
                name="form_school"
                onFinish={this.onFinish}
                onFinishFailed={this.onFinishFailed}
            >
                <Form.Item
                    name="name_school"
                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.nameSchool) }]}
                  >
                    <Input placeholder={intl.formatMessage(messages.nameSchool)}/>
                </Form.Item>
                <Form.Item name="communicate_served">
                    <Select placeholder={intl.formatMessage(messages.communitiesServed)}>
                        <Select.Option value='c1'>Communities 1</Select.Option>
                        <Select.Option value='c2'>Communities 2</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    name="school_address"
                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.schoolAddress) }]}
                  >
                    <Input placeholder={intl.formatMessage(messages.schoolAddress)}/>
                </Form.Item>
                <Form.Item
                    name="technical_contact"
                    className='bottom-0'
                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.technicalReferralContact) }]}
                  >
                    <Input placeholder={intl.formatMessage(messages.technicalReferralContact)}/>
                </Form.Item>
                <div className='text-center'>
                    <Button
                        type="text" 
                        className='add-number-btn mb-10'     
                        icon={<BsPlusCircle size={17} className='mr-5'/>}                                
                    >
                        {intl.formatMessage(messages.addContact)}
                    </Button>
                </div>
                <Form.Item
                    name="student_contact"
                    className='bottom-0'
                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.studentReferralContact) }]}
                  >
                    <Input placeholder={intl.formatMessage(messages.studentReferralContact)}/>
                </Form.Item>
                <div className='text-center'>
                    <Button
                        type="text" 
                        className='add-number-btn mb-20'     
                        icon={<BsPlusCircle size={17} className='mr-5'/>}                                
                    >
                        {intl.formatMessage(messages.addContact)}
                    </Button>
                </div>

                <div className='div-availability'>
                    <Segmented options={day_week} block={true}/>
                    <div className='div-time'>
                      <p className='mb-10 font-700'>{intl.formatMessage(messages.inSchoolHours)}</p>
                      <Row gutter={14}>
                          <Col xs={24} sm={24} md={12}>
                              <Form.Item className='picker-small' name="from_time">
                                  <TimePicker placeholder={intl.formatMessage(messagesCreateAccount.from)} defaultOpenValue={moment('00:00:00', 'HH:mm:ss')} />
                              </Form.Item>
                          </Col>
                          <Col xs={24} sm={24} md={12}>
                              <Form.Item className='picker-small' name="to_time">
                                  <TimePicker placeholder={intl.formatMessage(messagesCreateAccount.to)} defaultOpenValue={moment('00:00:00', 'HH:mm:ss')} />
                              </Form.Item>
                          </Col>
                      </Row>
                      <p className='mb-10 font-700'>{intl.formatMessage(messages.afterSchoolHours)}</p>
                      <Row gutter={14}>
                          <Col xs={24} sm={24} md={12}>
                              <Form.Item className='picker-small' name="from_time">
                                  <TimePicker placeholder={intl.formatMessage(messagesCreateAccount.from)} defaultOpenValue={moment('00:00:00', 'HH:mm:ss')} />
                              </Form.Item>
                          </Col>
                          <Col xs={24} sm={24} md={12}>
                              <Form.Item className='picker-small' name="to_time">
                                  <TimePicker placeholder={intl.formatMessage(messagesCreateAccount.to)} defaultOpenValue={moment('00:00:00', 'HH:mm:ss')} />
                              </Form.Item>
                          </Col>
                      </Row>
                    </div>
                </div>
                
                <Form.Item className="form-btn continue-btn" >
                  <Button
                      block
                      type="primary"                                      
                      htmlType="submit"
                      // onClick={this.props.onContinueParent}
                  >
                      {intl.formatMessage(messagesCreateAccount.confirm).toUpperCase()}
                  </Button>
                </Form.Item>
            </Form>
            <div className="steps-action">
              <Button
                type="text"
                className='back-btn'
                onClick={() => window.history.back()}
              >
                <BiChevronLeft size={25}/>{intl.formatMessage(messagesCreateAccount.back)}
              </Button>
            </div>
          </div>
        </Row>
      </div>
    );
  }
}
