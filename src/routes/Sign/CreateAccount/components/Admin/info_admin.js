import React from 'react';
import { Row, Form, Button, Input } from 'antd';
import { BsPlusCircle } from 'react-icons/bs';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';

export default class extends React.Component {
  onFinish = (values) => {
    console.log('Success:', values);
  };

  onFinishFailed = (errorInfo) => {
      console.log('Failed:', errorInfo);
  };
  render() {
    
    return (
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
                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.phoneNumber) }]}
                  >
                    <Input placeholder={intl.formatMessage(messages.phoneNumber)}/>
                </Form.Item>
                <Form.Item
                    name="email"
                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.email) }]}
                  >
                    <Input placeholder={intl.formatMessage(messages.email)}/>
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
                
                <Form.Item className="form-btn continue-btn" >
                  <Button
                      block
                      type="primary"                                      
                      htmlType="submit"
                  >
                      {intl.formatMessage(messages.confirm).toUpperCase()}
                  </Button>
                </Form.Item>
            </Form>
          </div>
        </Row>
    );
  }
}
