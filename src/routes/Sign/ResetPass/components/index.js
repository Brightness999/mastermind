import React from 'react';
import { Row, Form, Button, Input } from 'antd';
import intl from 'react-intl-universal';
import messages from '../messages';
import msgLogin from '../../Login/messages';
import './index.less';
import request from '../../../../utils/api/request';
import { changePassword } from '../../../../utils/api/apiList';
const notCheck = 0;
const valid = 1;
const invalid = -1;

export default class extends React.Component {

  constructor(props) {
    super(props);
    const token = this.props.location.state.token;
    this.state = {
      token: token
    }
  }

  onFinish = (values) => {
    this.sendRequestResetPassword();
    return;
  };

  onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  sendRequestResetPassword = () => {
    const postData = { token: this.state.token, password: this.form.getFieldValue('new_pass') };
    request.post(changePassword, postData).then(result => {
      if (result.success) {
        this.props.history.push('/');
      } else {
        if (!!err.response.data) {
          this.form.setFields([
            {
              name: 'new_pass',
              errors: ['password invalid'],
            },
          ]);
        }
      }
    }).catch(err => {
      if (!!err.response.data) {
        this.form.setFields([
          {
            name: 'new_pass',
            errors: ['password invalid'],
          },
        ]);
      }
    })
  }

  validatePassword(_, value) {
    const uppercaseRegExp = /(?=.*?[A-Z])/;
    const lowercaseRegExp = /(?=.*?[a-z])/;
    const specialCharRegExp = /(?=.*?[#?!@$%^&*-])/;
    const digitsRegExp = /(?=.*?[0-9])/;
    const minLengthRegExp = /.{8,}/;
    if (!value || value.length === 0) {
      this.setState({
        minimumCharacterStatus: notCheck,
        upperCaseStatus: notCheck,
        lowerCaseStatus: notCheck,
        symbolStatus: notCheck,
        numberStatus: notCheck,
        commonStatus: notCheck,
      });
      return Promise.reject(intl.formatMessage(messagesLogin.passwordMessage));
    }

    if (!value || lowercaseRegExp.test(value)) {
      this.setState({ lowerCaseStatus: valid });
    } else {
      this.setState({ lowerCaseStatus: invalid });
      return Promise.reject('At least one lowercase');
    }
    if (!value || uppercaseRegExp.test(value)) {
      this.setState({ upperCaseStatus: valid });
    } else {
      this.setState({ upperCaseStatus: invalid });
      return Promise.reject('At least one uppercase');
    }
    if (!value || digitsRegExp.test(value)) {
      this.setState({ numberStatus: valid });
    } else {
      this.setState({ numberStatus: invalid });
      return Promise.reject('At least one number');
    }
    if (!value || specialCharRegExp.test(value)) {
      this.setState({ symbolStatus: valid });
    } else {
      this.setState({ symbolStatus: invalid });
      return Promise.reject('At least one symbol');
    }
    if (!value || minLengthRegExp.test(value)) {
      this.setState({ minimumCharacterStatus: valid });
    } else {
      this.setState({ minimumCharacterStatus: invalid });
      return Promise.reject('At least minumum 8 characters');
    }
    if (this.state.minimumCharacterStatus &&
      this.state.lowerCaseStatus &&
      this.state.upperCaseStatus &&
      this.state.symbolStatus &&
      this.state.numberStatus === valid
    ) {
      this.setState({ commonStatus: valid });
    }
    return Promise.resolve();
  }

  render() {
    return (
      <div className="full-layout page resetpass-page">
        <Row justify="center" className="row-form row-login">
          <div className='col-form col-login'>
            <div className='div-form-title'>
              <p className='font-24'>{intl.formatMessage(messages.changeYourPassword)}</p>
            </div>
            <div>
              <Form
                ref={ref => this.form = ref}
                name="reset_pass"
                onFinish={this.onFinish}
                onFinishFailed={this.onFinishFailed}
              >
                <Form.Item
                  name="new_pass"
                  hasFeedback
                  rules={[{ validator: (_, value) => this.validatePassword(_, value) }]}
                >
                  <Input.Password placeholder={intl.formatMessage(messages.newPassword)} />
                </Form.Item>
                <Form.Item
                  name="confirm_pass"
                  hasFeedback
                  rules={[
                    { required: true, message: intl.formatMessage(msgLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.confirmNewPass) },
                    ({ getFieldValue }) => ({
                      validator(rule, value) {
                        if (!value || getFieldValue('new_pass') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject('The two passwords that you entered do not match!');
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder={intl.formatMessage(messages.confirmNewPass)} />
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
