import React from 'react';
import { Row, Col, Form, Button, Input } from 'antd';
import { BsPlusCircle } from 'react-icons/bs';
import { BiChevronLeft } from 'react-icons/bi';
import intl from 'react-intl-universal';
import messages from '../messages';
import messagesCreateAccount from '../../CreateAccount/messages';
import messagesInfoSchool from '../../InfoSchool/messages';
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
    
    return (
      <div className="full-layout page infoadmin-page">
        <Row justify="center" className="row-form">
          <div className='col-form col-admin'>
            <div className='div-form-title mb-10'>
              <p className='font-30 text-center mb-0'>{intl.formatMessage(messages.adminDetails)}</p>
            </div> 
            <Form 
                name="form_admin"
                onFinish={this.onFinish}
                onFinishFailed={this.onFinishFailed}
            >
                <Form.Item
                    name="name"
                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.name) }]}
                  >
                    <Input placeholder={intl.formatMessage(messages.name)}/>
                </Form.Item>
                <Form.Item
                    name="phone"
                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesCreateAccount.phoneNumber) }]}
                  >
                    <Input placeholder={intl.formatMessage(messagesCreateAccount.phoneNumber)}/>
                </Form.Item>
                <Form.Item
                    name="email"
                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesCreateAccount.email) }]}
                  >
                    <Input placeholder={intl.formatMessage(messagesCreateAccount.email)}/>
                </Form.Item>
               
                <div className='text-center'>
                    <Button
                        type="text" 
                        className='add-number-btn mb-10'     
                        icon={<BsPlusCircle size={17} className='mr-5'/>}                                
                    >
                        {intl.formatMessage(messagesInfoSchool.addContact)}
                    </Button>
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
