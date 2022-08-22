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
            input: {},
            errors: {}
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
    //         this.setState(errMsg);
    //     }
    //     // for confirm password
    //     // if (passwordInputFieldName === "confirmPassword" || (passwordInputFieldName === "password" && passwordInput.confirmPassword.length > 0)) {

    //     //     if (passwordInput.confirmPassword !== passwordInput.password) {
    //     //         this.setState({ confirmPasswordError: "Confirm password is not matched" })
    //     //     } else {
    //     //         this.setState({ confirmPasswordError: "" })
    //     //     }

    //     // }
    // }

    // validatePassword(rule, value, callback) {
    //     const { form } = this.props;
    //     let input = this.state.input;
    //     let errors = {};
    //     let isValid = true;
    //     const passwordInputFieldName = evnt.target.name;
    //     if (value) {
    //     //   form.validateFields(['confirmPassword'], { force: true });
    //     if (!input["name"]) {
    //         isValid = false;
    //         errors["name"] = "Please enter your name.";
    //     }

    //     if (!input["email"]) {
    //         isValid = false;
    //         errors["email"] = "Please enter your email Address.";
    //     }

    //     if (typeof input["email"] !== "undefined") {

    //         var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
    //         if (!pattern.test(input["email"])) {
    //             isValid = false;
    //             errors["email"] = "Please enter valid email address.";
    //         }
    //     }

    //     if (!input["password"]) {
    //         isValid = false;
    //         errors["password"] = "Please enter your password hello.";
    //     }

    //     if (passwordInputFieldName !== 'password') {
    //         isValid = false;
    //         const uppercaseRegExp = /(?=.*?[A-Z])/;
    //         const lowercaseRegExp = /(?=.*?[a-z])/;
    //         const digitsRegExp = /(?=.*?[0-9])/;
    //         const specialCharRegExp = /(?=.*?[#?!@$%^&*-])/;
    //         const minLengthRegExp = /.{8,}/;
    //         const passwordLength = input["password"].length;
    //         const uppercasePassword = uppercaseRegExp.test(input["password"]);
    //         const lowercasePassword = lowercaseRegExp.test(input["password"]);
    //         const digitsPassword = digitsRegExp.test(input["password"]);
    //         const specialCharPassword = specialCharRegExp.test(input["password"]);
    //         const minLengthPassword = minLengthRegExp.test(input["password"]);
    //         let errMsg = "";
    //         if (passwordLength === 0) {
    //             errors["password"] = "Please enter your password.";
    //         } else 
    //         if (!uppercasePassword) {
    //             errors["password"] = "At least one Uppercase";
    //         } else if (!lowercasePassword) {
    //             errors["password"] = "At least one Lowercase";
    //         } else if (!digitsPassword) {
    //             errors["password"] = "At least one digit";
    //         } else if (!specialCharPassword) {
    //             errors["password"] = "At least one Special Characters";
    //         } else if (!minLengthPassword) {
    //             errors["password"] = "At least minumum 8 characters";
    //         } else {
    //             errors["password"] = "";
    //         }
            
    //         // this.setState(errMsg);
            
    //     }

    //     if (input["password"] === 'password') {
    //         const uppercaseRegExp = /(?=.*?[A-Z])/;
    //         const lowercaseRegExp = /(?=.*?[a-z])/;
    //         const digitsRegExp = /(?=.*?[0-9])/;
    //         const specialCharRegExp = /(?=.*?[#?!@$%^&*-])/;
    //         const minLengthRegExp = /.{8,}/;
    //         const passwordLength = input["password"].length;
    //         const uppercasePassword = uppercaseRegExp.test(input["password"]);
    //         const lowercasePassword = lowercaseRegExp.test(input["password"]);
    //         const digitsPassword = digitsRegExp.test(input["password"]);
    //         const specialCharPassword = specialCharRegExp.test(input["password"]);
    //         const minLengthPassword = minLengthRegExp.test(input["password"]);
    //         // let errMsg = "";
    //         if (passwordLength === 0) {
    //             errors["password"] = "Password is empty";
    //         } else if (!uppercasePassword) {
    //             errors["password"] = "At least one Uppercase";
    //         } else if (!lowercasePassword) {
    //             errors["password"] = "At least one Lowercase";
    //         } else if (!digitsPassword) {
    //             errors["password"] = "At least one digit";
    //         } else if (!specialCharPassword) {
    //             errors["password"] = "At least one Special Characters";
    //         } else if (!minLengthPassword) {
    //             errors["password"] = "At least minumum 8 characters";
    //         } else {
    //             errors["password"] = "";
    //         }
    //         // this.setState(errMsg);
    //     }

    //     // if (!input["confirm_password"]) {
    //     // isValid = false;
    //     // errors["confirm_password"] = "Please enter your confirm password.";
    //     // }

    //     // if (typeof input["password"] !== "undefined" && typeof input["confirm_password"] !== "undefined") {

    //     //     if (input["password"] != input["confirm_password"]) {
    //     //         isValid = false;
    //     //         errors["password"] = "Passwords don't match.";
    //     //     }
    //     // } 

    //     this.setState({
    //         errors: errors
    //     });

    //     return isValid;
    //     }

    //     callback();
    // }


    handleChange = (event) => {
        let input = this.state.input;
        input[event.target.name] = event.target.value;

        this.setState({
            input
        });
    }

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
                                    // { 
                                    //     pattern: this.state.regexpPass,
                                    //     message: 'The password does not contain spaces'
                                    // },
                                ]}
                                
                            >
                                <Input.Password
                                    value={this.state.input.password}
                                    onChange={this.handleChange} 
                                    placeholder={intl.formatMessage(messagesLogin.password)} 
                                />
                            </Form.Item>
                            <div className="text-red">{this.state.errors.password}</div>
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