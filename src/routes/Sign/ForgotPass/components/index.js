import React from 'react';
import { Row, Form, Button, Input } from 'antd';
import intl from 'react-intl-universal';
import messages from '../messages';
import msgLogin from '../../Login/messages';
import msgCreate from '../../CreateAccount/messages';
import './index.less';
import { forgotPassword, confirmForgotPassword } from '../../../../utils/api/apiList';
import request from '../../../../utils/api/request';

export default class extends React.Component {
  state = {
    isSent: false,
    lastTry: 0,
  }

  onFinish = (values) => {
    this.setState({ isSent: true });
    this.sendRequestForgot()
  };

  sendRequestForgot = () => {
    request.post(forgotPassword, this.form1.getFieldsValue()).then(result => {
      if (result.success) {
        this.setState({ isSent: true })
      } else {
        if (!!err.response.data) {
          this.form1.setFields([
            {
              name: 'email',
              errors: ['cannot find your email!'],
            },
          ]);
        }
      }
    }).catch(err => {
      if (!!err.response.data) {
        this.form1.setFields([
          {
            name: 'email',
            errors: [err.response.data.data],
          },
        ]);
      }
    })
  }

  onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  onFinishkeyCode = (values) => {
    if (this.state.lastTry >= 4) {
      this.props.history.push('/');
      return;
    }
    this.setState({ lastTry: this.state.lastTry + 1 });
    const postData = { ...this.form1.getFieldsValue(), ...this.form2.getFieldsValue() };
    request.post(confirmForgotPassword, postData).then(result => {
      const { success, data } = result;
      if (success) {
        this.props.history.push({ pathname: '/resetpass', state: { token: data.token } });
      } else {
        if (!!err.response.data) {
          this.form1.setFields([
            {
              name: 'keyCode',
              errors: ['Incorrect verify code!'],
            },
          ]);
        }
      }
    }).catch(err => {
      console.log(err);
      if (!!err.response.data) {
        this.form1.setFields([
          {
            name: 'keyCode',
            errors: ['Incorrect verify code!'],
          },
        ]);
      }
    })
  }

  render() {
    const { isSent } = this.state;

    return (
      <div className="full-layout page forgotpass-page">
        <Row justify="center" className="row-form row-login">
          <div className='col-form col-login'>
            <div className='div-form-title'>
              <p className='font-24'>{intl.formatMessage(messages.resetYourPassword)}</p>
            </div>
            <div style={{ display: !isSent ? 'block' : 'none' }}>
              <Form
                ref={ref => this.form1 = ref}
                name="reset_pass"
                onFinish={this.onFinish}
                onFinishFailed={this.onFinishFailed}
              >
                <p className='mt-1'>{intl.formatMessage(messages.enterYourEmail)}</p>
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: intl.formatMessage(msgLogin.pleaseEnter) + ' ' + intl.formatMessage(msgCreate.email) },
                    { type: 'email', message: intl.formatMessage(msgLogin.emailNotValid) }
                  ]}
                >
                  <Input placeholder={intl.formatMessage(msgCreate.email)} />
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
            <div style={{ display: isSent ? 'block' : 'none' }}>
              <Form
                name="input_key"
                ref={ref => this.form2 = ref}
                onFinish={this.onFinishkeyCode}
                onFinishFailed={this.onFinishFailed}
              >
                <p className='mt-1'>{intl.formatMessage(messages.enterYourEmail)}</p>
                <Form.Item
                  name="keyCode"
                  rules={[
                    { required: true, message: intl.formatMessage(msgLogin.pleaseEnter) + ' 6 digits code from email ' },
                    { pattern: '^([-]?[1-9][0-9]*|0)$', message: 'Invalid KeyCode!' }
                  ]}
                >
                  <Input placeholder="please enter code from your email" />
                </Form.Item>
                <a className='text-primary' onClick={() => this.sendRequestForgot()}>Resend</a>
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
