import React from 'react';
import { Row, Form, Button, Input } from 'antd';
import intl from 'react-intl-universal';
import messages from '../messages';
import msgLogin from '../../Login/messages';
import './index.less';

export default class extends React.Component {
  render() {
    const onFinish = (values: any) => {
      console.log('Success:', values);
      window.location.href="/login"
    };
  
    const onFinishFailed = (errorInfo: any) => {
      console.log('Failed:', errorInfo);
    };
    return (
      <div className="full-layout page resetpass-page">
         <Row justify="center" className="row-form row-login">
            <div className='col-form col-login'>
                <div className='div-form-title'>
                  <p className='font-24'>{intl.formatMessage(messages.changeYourPassword)}</p>
                </div>
                <div>
                <Form 
                  name="reset_pass"
                  onFinish={onFinish}
                  onFinishFailed={onFinishFailed}
                >
                    <Form.Item
                      name="new_pass"
                      rules={[{ required: true, message: intl.formatMessage(msgLogin.pleaseEnter) + ' ' +  intl.formatMessage(messages.newPassword)}]}
                    >
                        <Input.Password placeholder={intl.formatMessage(messages.newPassword)}/>
                    </Form.Item>
                    <Form.Item
                      name="confirm_pass"
                      rules={[{ required: true, message: intl.formatMessage(msgLogin.pleaseEnter) + ' ' +  intl.formatMessage(messages.confirmNewPass)}]}
                    >
                        <Input.Password placeholder={intl.formatMessage(messages.confirmNewPass)}/>
                    </Form.Item>
                    <Form.Item >
                        <Button
                            block
                            type="primary"                                      
                            htmlType="submit"
                            className="form-btn" 
                        >
                            {intl.formatMessage(messages.submit).toUpperCase()}
                        </Button>
                    </Form.Item>
                </Form>
              </div>
            </div>
        </Row>
      </div>
    );
  }
}
