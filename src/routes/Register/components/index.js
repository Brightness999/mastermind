import React from 'react';
import {connect} from 'dva';
import {Link} from 'dva/router';
import {Layout, Row, Col, Typography, Form, Checkbox, Button, Select} from 'antd';
import intl from 'react-intl-universal';
import { routerLinks } from "../../constant";
import messages from '../messages';
import './index.less';
import {Input} from "antd/es";
import { appLocales } from '../../../i18n';

const {Content} = Layout;
const {Paragraph} = Typography;
const {Option} = Select;

export default class extends React.Component {
  render() {
    return (
      <Layout className="full-layout page register-page">
        <Content>
          <Row justify="center" className="row-login">
            <div className='col-login'>
              <div className="user-img border-bottom">
                <img src='/images/logo2.png' alt="logo"/>
                <Paragraph className='logo-text'>PD Admin</Paragraph>
              </div>
              <div className="div-title">
                <Paragraph className='signIn-text'>Sign Up</Paragraph>
              </div>
              <Form>
                <Form.Item
                    rules={[{required: true, message: intl.formatMessage(messages.messageUsername)}]}
                >
                  <Input placeholder={intl.formatMessage(messages.username)}/>
                </Form.Item>
                <Form.Item
                    rules={[
                      {
                        type: 'email',
                        message: intl.formatMessage(messages.messageEmailFormat),
                      },
                      {
                        required: true,
                        message: intl.formatMessage(messages.messageEmail),
                      },
                    ]}
                >
                  <Input placeholder={intl.formatMessage(messages.email)}/>
                </Form.Item>
                <Form.Item
                    rules={[
                      {
                        required: true,
                        message: intl.formatMessage(messages.enterPassword),
                      },
                    ]}
                >
                  <Input.Password placeholder={intl.formatMessage(messages.password)}/>
                </Form.Item>
                <Form.Item
                    rules={[
                      {
                        required: true,
                        message: intl.formatMessage(messages.passwordConfirm),
                      },
                    ]}
                >
                  <Input.Password placeholder={intl.formatMessage(messages.passwordConfirmMess)}/>
                </Form.Item>
                <Form.Item>
                  {/*<Checkbox>*/}
                  {/*  {intl.formatMessage(messages.remember)}*/}
                  {/*</Checkbox>*/}
                  {/*<Link className="login-form-forgot" to="#">*/}
                  {/*  {intl.formatMessage(messages.forgot)}*/}
                  {/*</Link>*/}
                </Form.Item>
                <Form.Item>
                  <Button
                      block
                      type="primary"
                      htmlType="submit"
                      className="login-form-btn"
                  >
                    {intl.formatMessage(messages.signUp)}
                  </Button>
                </Form.Item>
              </Form>
              <div className="height-30"/>
              <div className="div-new-user" >
                <Link to={routerLinks['Login']} className="sign-up-link">{intl.formatMessage(messages.LoginNow)}</Link>
              </div>
            </div>
          </Row>
        </Content>
      </Layout>
    );
  }
}
