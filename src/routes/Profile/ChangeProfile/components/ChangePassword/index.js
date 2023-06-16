import React from 'react';
import { Row, Form, Button, Input, message } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { BsCheck, BsDot, BsX } from 'react-icons/bs';
import Cookies from 'js-cookie';

import messages from '../../../../Sign/CreateAccount/messages';
import msgLogin from '../../../../Sign/Login/messages';
import request from '../../../../../utils/api/request';
import { changePassword } from '../../../../../utils/api/apiList';

const notCheck = 0;
const valid = 1;
const invalid = -1;

class ChangePassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showValidateBox: false,
      minimumCharacterStatus: notCheck,
      upperCaseStatus: notCheck,
      lowerCaseStatus: notCheck,
      numberStatus: notCheck,
      symbolStatus: notCheck,
      commonStatus: notCheck,
    };
  }

  onFinish = (values) => {
    const token = Cookies.get('tk');
    request.post(changePassword, { ...values, token, type: 'update' }).then(res => {
      if (res.success) {
        message.success('Updated Successfully');
      }
    }).catch(err => {
      if (!err.response.data.data.password) {
        message.warning('Current password does not match');
      } else {
        message.error(err.message);
      }
    })
  };

  validatePassword(_, value, type) {
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
      return Promise.reject(intl.formatMessage(msgLogin.passwordMessage));
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
    const values = this.form.getFieldsValue();
    if (type == 'confirm' && values.new_password != values.confirm_password) {
      return Promise.reject('Passwords do not match');
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

  passwordStatus = (status = 0, message, className = 'active') => {
    switch (status) {
      case notCheck:
        return (<li><BsDot size={15} />{message}</li>);
      case valid:
        return (<li className={className}><BsCheck size={15} />{message}</li>);
      case invalid:
        return (<li className="text-red"><BsX size={15} />{message}</li>);
    }
  };

  render() {
    const { showValidateBox, lowerCaseStatus, upperCaseStatus, minimumCharacterStatus, numberStatus, symbolStatus, commonStatus } = this.state;

    return (
      <Row justify="center" className="row-form">
        <div className='col-form col-admin'>
          <div className='div-form-title mb-10'>
            <p className='font-30 text-center mb-0'>{intl.formatMessage(messages.titleChangePassword)}</p>
          </div>
          <Form
            name="form_admin"
            layout='vertical'
            onFinish={this.onFinish}
            ref={ref => this.form = ref}
          >
            <Form.Item
              name="password"
              label="Current Password"
              className='float-label-item'
              rules={[{ required: true, message: intl.formatMessage(msgLogin.passwordMessage) }]}
            >
              <Input.Password placeholder={intl.formatMessage(messages.passwordCurrent)} />
            </Form.Item>
            <div className='relative'>
              <Form.Item
                name="new_password"
                label="New Password"
                className='float-label-item'
                rules={[{ required: true, validator: (_, value) => this.validatePassword(_, value) }]}
              >
                <Input.Password
                  onFocus={() => this.setState({ showValidateBox: true })}
                  onBlur={() => this.setState({ showValidateBox: false })}
                  placeholder={intl.formatMessage(messages.passwordNew)}
                />
              </Form.Item>
              {showValidateBox && <div className="pass-contain">
                <p className="mb-5">{intl.formatMessage(messages.passwordContain)}</p>
                <div className="flex flex-row">
                  <ul>
                    {this.passwordStatus(lowerCaseStatus, intl.formatMessage(messages.lowerCase))}
                    {this.passwordStatus(numberStatus, intl.formatMessage(messages.number))}
                    {this.passwordStatus(symbolStatus, intl.formatMessage(messages.symbol))}
                  </ul>
                  <ul>
                    {this.passwordStatus(upperCaseStatus, intl.formatMessage(messages.upperCase))}
                    {this.passwordStatus(minimumCharacterStatus, intl.formatMessage(messages.moreCharacters))}
                    {this.passwordStatus(commonStatus, intl.formatMessage(messages.beUncommon))}
                  </ul>
                </div>
              </div>}
            </div>
            <Form.Item
              name="confirm_password"
              label={intl.formatMessage(messages.passwordConfirm)}
              className='float-label-item'
              rules={[{ required: true, validator: (_, value) => this.validatePassword(_, value, 'confirm') }]}
            >
              <Input.Password placeholder={intl.formatMessage(messages.passwordConfirm)} />
            </Form.Item>
            <Form.Item className="form-btn continue-btn" >
              <Button
                block
                type="primary"
                htmlType="submit"
              >
                {intl.formatMessage(messages.update).toUpperCase()}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Row>
    );
  }
}
const mapStateToProps = state => {
  return ({
    auth: state.auth
  })
}

export default compose(connect(mapStateToProps))(ChangePassword);
