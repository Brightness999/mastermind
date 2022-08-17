import React from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Row, Form, Button, Input } from 'antd';
import { routerLinks } from "../../../constant";
import intl from 'react-intl-universal';
import messages from '../messages';
import msgLogin from '../../Login/messages';
import msgCreate from '../../CreateAccount/messages';
import './index.less';

export default class extends React.Component {
  render() {
    const onFinish = (values: any) => {
      console.log('Success:', values);
      window.location.href="/resetpass"
    };
  
    const onFinishFailed = (errorInfo: any) => {
      console.log('Failed:', errorInfo);
    };
    return (
      <div className="full-layout page forgotpass-page">
         <Row justify="center" className="row-form row-login">
            <div className='col-form col-login'>
                <div className='div-form-title'>
                  <p className='font-24'>{intl.formatMessage(messages.resetYourPassword)}</p>
                </div>
                <div>
                <Form 
                  name="reset_pass"
                  onFinish={onFinish}
                  onFinishFailed={onFinishFailed}
                >
                    <p className='mt-1'>{intl.formatMessage(messages.enterYourEmail)}</p>
                    <Form.Item
                      name="email"
                      rules={[{ required: true, message: intl.formatMessage(msgLogin.pleaseEnter) + ' ' +  intl.formatMessage(msgCreate.email)}]}
                    >
                        <Input placeholder={intl.formatMessage(msgCreate.email)}/>
                    </Form.Item>
                    <Form.Item>
                        <Button
                            block
                            type="primary"                                      
                            htmlType="submit"
                            className="form-btn" 
                        >
                            {intl.formatMessage(messages.send).toUpperCase()}
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
