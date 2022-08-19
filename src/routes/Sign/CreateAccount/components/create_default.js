import React, { Component } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Row, Form, Button, Input, Select } from 'antd';
import { BsCheck, BsDot, } from 'react-icons/bs';
import intl from 'react-intl-universal';
import messages from '../messages';
import messagesLogin from '../../Login/messages';

import './index.less';

class CreateDefault extends Component {
    constructor(props) {
        super(props);
        this.state = {
            passwordError: '',
            confirmPasswordError: '',
            passwordInput: '',
            regexpPass: /^\S*$/,
        }
    }
    
    onFinish = (values) => {
        console.log('Success:', values);
        this.props.onContinue();
    };

    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    // handleValidation = (evnt) => {
    //     const passwordInputValue = evnt.target.value.trim();
    //     const passwordInputFieldName = evnt.target.name;
    //     //for password 
    //     if (passwordInputFieldName === 'password') {
    //         const uppercaseRegExp = /(?=.*?[A-Z])/;
    //         const lowercaseRegExp = /(?=.*?[a-z])/;
    //         const digitsRegExp = /(?=.*?[0-9])/;
    //         const specialCharRegExp = /(?=.*?[#?!@$%^&*-])/;
    //         const minLengthRegExp = /.{8,}/;
    //         const passwordLength = passwordInputValue.length;
    //         const uppercasePassword = uppercaseRegExp.test(passwordInputValue);
    //         const lowercasePassword = lowercaseRegExp.test(passwordInputValue);
    //         const digitsPassword = digitsRegExp.test(passwordInputValue);
    //         const specialCharPassword = specialCharRegExp.test(passwordInputValue);
    //         const minLengthPassword = minLengthRegExp.test(passwordInputValue);
    //         let errMsg = "";
    //         if (passwordLength === 0) {
    //             errMsg = "Password is empty";
    //         } else if (!uppercasePassword) {
    //             errMsg = "At least one Uppercase";
    //         } else if (!lowercasePassword) {
    //             errMsg = "At least one Lowercase";
    //         } else if (!digitsPassword) {
    //             errMsg = "At least one digit";
    //         } else if (!specialCharPassword) {
    //             errMsg = "At least one Special Characters";
    //         } else if (!minLengthPassword) {
    //             errMsg = "At least minumum 8 characters";
    //         } else {
    //             errMsg = "";
    //         }
    //         setPasswordErr(errMsg);
    //     }
    //     // for confirm password
    //     if (passwordInputFieldName === "confirmPassword" || (passwordInputFieldName === "password" && passwordInput.confirmPassword.length > 0)) {

    //         if (passwordInput.confirmPassword !== passwordInput.password) {
    //             this.setState({confirmPasswordError: "Confirm password is not matched"})
    //         } else {
    //             this.setState({confirmPasswordError: ""})
    //         }

    //     }
    // }

    // validatePassword(rule, value, callback) {
    //     const { form } = this.props;
    //     if (value) {
    //       form.validateFields(['confirmPassword'], { force: true });
    //     }
    //     callback();
    //   }

    render() {
        
        return (
            <Row justify="center" className="row-form">
                <div className='col-form col-create-default'>
                    <div className='div-form-title'>
                        <p className='font-30 text-center'>{intl.formatMessage(messages.letCreateAccount)}</p>
                    </div>
                    <Form
                        name="form_default"
                        onFinish={this.onFinish}
                        onFinishFailed={this.onFinishFailed}
                    >
                        <Form.Item
                            name="username"
                            rules={[{ required: true, message: intl.formatMessage(messages.userMessage) }]}
                        >
                            <Input placeholder={intl.formatMessage(messages.username)} />
                        </Form.Item>
                        <Form.Item
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: intl.formatMessage(messages.emailMessage)
                                },
                                {
                                    type: 'email',
                                    message: intl.formatMessage(messagesLogin.emailNotValid)
                                }]}
                        >
                            <Input placeholder={intl.formatMessage(messages.email)} />
                        </Form.Item>
                        <div className='relative'>
                            <Form.Item
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: intl.formatMessage(messagesLogin.passwordMessage)
                                    },
                                    {   type: 'string', min: 8 }, 
                                    { 
                                        pattern: this.state.regexpPass,
                                        message: 'The password does not contain spaces'
                                    },
                                    // {
                                    //     validator: (rule, value, callback) => this.validatePassword(rule, value, callback)
                                    // }
                                ]}
                            >
                                <Input.Password placeholder={intl.formatMessage(messagesLogin.password)} />
                            </Form.Item>
                            <div className='info-icon'><QuestionCircleOutlined /></div>
                                <div className='pass-contain'>
                                    <p className='mb-5'>{intl.formatMessage(messages.passwordContain)}</p>
                                    <div className='flex flex-row'>
                                        <ul>
                                            <li className='active'><BsCheck size={15} />{intl.formatMessage(messages.lowerCase)}</li>
                                            <li><BsDot size={15} />{intl.formatMessage(messages.number)}</li>
                                            <li><BsDot size={15} />{intl.formatMessage(messages.symbol)}</li>
                                        </ul>
                                        <ul>
                                            <li><BsDot size={15} />{intl.formatMessage(messages.upperCase)}</li>
                                            <li><BsDot size={15} />{intl.formatMessage(messages.moreCharacters)}</li>
                                            <li><BsDot size={15} />{intl.formatMessage(messages.beUncommon)}</li>
                                        </ul>
                                    </div>
                                </div>
                        </div>
                        
                        <p className='label-form'>{intl.formatMessage(messages.accountType)}</p>
                        <Form.Item
                            name="account_type"
                            value={this.state.accountType}

                        >
                            <Select defaultValue={intl.formatMessage(messages.parent)} onChange={this.props.onHandleChange} placeholder={intl.formatMessage(messages.selectType)}>
                                <Select.Option value={intl.formatMessage(messages.parent)}>{intl.formatMessage(messages.parent)}</Select.Option>
                                <Select.Option value={intl.formatMessage(messages.provider)}>{intl.formatMessage(messages.provider)}</Select.Option>
                                <Select.Option value={intl.formatMessage(messages.school)}>{intl.formatMessage(messages.school)}</Select.Option>
                                <Select.Option value={intl.formatMessage(messages.admin)}>{intl.formatMessage(messages.admin)}</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item className="form-btn continue-btn" >
                            <Button
                                block
                                type="primary"
                                htmlType="submit"
                            >
                                {intl.formatMessage(messages.continue).toUpperCase()}
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Row>
        );
    }
}
export default CreateDefault;