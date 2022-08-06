import React from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Row, Form, Button, Input } from 'antd';
import { routerLinks } from "../../../constant";
import intl from 'react-intl-universal';
import messages from '../messages';

import './index.less';

@connect(({ login, loading, global }) => ({
  global,
  login,
  loading: loading.models.login
}))

export default class extends React.Component {
  
    render() {
      const { locale } = this.props.global;
      const onFinish = (values: any) => {
        console.log('Success:', values);
        // window.location.href="/administrator/dashboard"
      };
    
      const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
      };
    
        return (
            <div className="full-layout page login-page">
              <Row justify="center" className="row-form row-login">
                  <div className='col-form col-login'>
                      <div className='div-form-title'>
                        <p className='font-24'>{intl.formatMessage(messages.login)}</p>
                      </div>
                      <div>
                      <Form 
                        name="login"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                      >
                          <Form.Item
                            name="email_username"
                            rules={[{ required: true, message: intl.formatMessage(messages.usernameMessage) }]}
                          >
                              <Input placeholder={intl.formatMessage(messages.emailOrUsername)}/>
                          </Form.Item>
                          <Form.Item
                            name="password"
                            rules={[{ required: true, message: intl.formatMessage(messages.passwordMessage) }]}
                          >
                              <Input.Password placeholder={intl.formatMessage(messages.password)}/>
                          </Form.Item>
                          
                          
                          <Form.Item >
                              <Button
                                  block
                                  type="primary"                                      
                                  htmlType="submit"
                                  className="form-btn" 
                              >
                                  {intl.formatMessage(messages.login).toUpperCase()}
                              </Button>
                          </Form.Item>
                      </Form>
                      </div>
                      
                    
                      <div className="div-new-user">
                        <Link to={routerLinks['CreateAccount']}>{intl.formatMessage(messages.createAccount)}</Link>
                        <Link to='/'>{intl.formatMessage(messages.forgotPass)}</Link>
                      </div>
                  </div>
              </Row>
            </div>
        );
    }
}