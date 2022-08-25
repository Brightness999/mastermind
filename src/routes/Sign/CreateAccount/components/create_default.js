import React, { Component } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Row, Form, Button, Input, Select, message } from 'antd';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { BsCheck, BsDot, BsX } from 'react-icons/bs';
import intl from 'react-intl-universal';
import messages from '../messages';
import messagesLogin from '../../Login/messages';
import { setParent } from '../../../../redux/features/registerSlice';
import { url } from '../../../../utils/api/baseUrl';
import './index.less';
import axios from 'axios';
const notCheck = 0;
const valid = 1;
const invalid = -1;

class CreateDefault extends Component {
    constructor(props) {
        super(props);
        this.state = {
            input: {},
            minimumCharacterStatus: notCheck,
            upperCaseStatus: notCheck,
            lowerCaseStatus: notCheck,
            numberStatus: notCheck,
            symbolStatus: notCheck,
            commonStatus: notCheck,

            showValidateBox: false,
        };
    }


    componentDidMount() {


        // let data = this.props.register.parent;

        this.form?.setFieldsValue({
            username: 'username',
            email: 'email@gmail.com',
            password: 'Tiendat11@',
            account_type: intl.formatMessage(messages.parent),
        });

        // if (data) {
        //     const { step1 } = data;
        //     this.form?.setFieldsValue({
        //         ...step1
        //     });
        // }
    }

    onSubmit = async () => {
        try {
            const values = await this.form.validateFields();
            const { email, username } = values;
            const emailExits = await axios.post(url + 'users/check_email_registered',
                {
                    "searchData": {
                        email
                    }
                }
            )
            if (emailExits.data.data > 0)
                return message.error('Email already exists');
            const usernameExits = await axios.post(url + 'users/check_email_registered',
                {
                    "searchData": {
                        username
                    }
                }
            )
            if (usernameExits.data.data > 0)
                return message.error('Username already exists');
            this.props.setParent({
                step1: values,
            })
            return this.props.onContinue();
        } catch (error) {
            console.log(error);
            message.error('Some thing went wrong');
        }
    }


    onFinish = values => {
        console.log('Success:', values);
        // this.props.setParent({
        //     step1: values,
        // })
        // this.props.onContinue();
    };

    onFinishFailed = errorInfo => {
        console.log('Failed:', errorInfo);
    };

    handleChange = event => {
        let input = this.state.input;
        input[event.target.name] = event.target.value;

        this.setState({
            input
        });
    };
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

    passwordStatus = (status = 0, message, className = 'active') => {
        switch (status) {
            case notCheck:
                return (
                    <li>
                        <BsDot size={15} />
                        {message}
                    </li>
                );
            case valid:
                return (
                    <li className={className}>
                        <BsCheck size={15} />
                        {message}
                    </li>
                );
            case invalid:
                return (
                    <li className="text-red">
                        <BsX size={15} />
                        {message}
                    </li>
                );
        }
    };

    render() {
        const { showValidateBox, error } = this.state;
        return (
            <Row justify="center" className="row-form">
                <div className="col-form col-create-default">
                    <div className="div-form-title">
                        <p className="font-30 text-center">{intl.formatMessage(messages.letCreateAccount)}</p>
                    </div>
                    {/* <Form
                        name="form_default"
                        onFinish={this.onFinish}
                        onFinishFailed={this.onFinishFailed}
                        ref={ref => this.form = ref}
                        initialValues={{
                            account_type: intl.formatMessage(messages.parent),
                        }}
                    >
                        <Form.Item
                            name="username"
                            rules={[{ required: true, message: intl.formatMessage(messages.userMessage) }]}
                        > */}
                    <Form name="form_default" onFinish={this.onFinish} onFinishFailed={this.onFinishFailed} ref={ref => this.form = ref}
                        initialValues={{
                            account_type: intl.formatMessage(messages.parent),
                        }}
                    >
                        <Form.Item name="username" rules={[{ required: true, message: intl.formatMessage(messages.userMessage) }]}>
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
                                }
                            ]}
                        >
                            <Input placeholder={intl.formatMessage(messages.email)} />
                        </Form.Item>
                        <div className="relative">
                            <Form.Item
                                name="password"
                                rules={[
                                    {
                                        validator: (_, value) => this.validatePassword(_, value),
                                    }
                                ]}
                            >
                                <Input.Password
                                    onFocus={() => this.setState({ showValidateBox: true })}
                                    onChange={this.handleChange}
                                    placeholder={intl.formatMessage(messagesLogin.password)}
                                    value={this.state.input.password}
                                />
                            </Form.Item>
                            {/* <div className="text-red">{error}</div> */}
                            <div className="info-icon">
                                <QuestionCircleOutlined />
                            </div>
                            {showValidateBox && <div className="pass-contain">
                                <p className="mb-5">{intl.formatMessage(messages.passwordContain)}</p>
                                <div className="flex flex-row">
                                    <ul>
                                        {this.passwordStatus(this.state.lowerCaseStatus, intl.formatMessage(messages.lowerCase))}
                                        {this.passwordStatus(this.state.numberStatus, intl.formatMessage(messages.number))}
                                        {this.passwordStatus(this.state.symbolStatus, intl.formatMessage(messages.symbol))}
                                    </ul>
                                    <ul>
                                        {this.passwordStatus(this.state.upperCaseStatus, intl.formatMessage(messages.upperCase))}
                                        {this.passwordStatus(this.state.minimumCharacterStatus, intl.formatMessage(messages.moreCharacters))}
                                        {this.passwordStatus(this.state.commonStatus, intl.formatMessage(messages.beUncommon))}
                                    </ul>
                                </div>
                            </div>}
                        </div>
                        <p className="label-form">{intl.formatMessage(messages.accountType)}</p>
                        <Form.Item
                            name="account_type"
                            value={this.state.accountType}
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.accountType) }]}
                        >
                            <Select onChange={this.props.onHandleChange} placeholder={intl.formatMessage(messages.selectType)}>
                                <Select.Option value={intl.formatMessage(messages.parent)}>{intl.formatMessage(messages.parent)}</Select.Option>
                                <Select.Option value={intl.formatMessage(messages.provider)}>{intl.formatMessage(messages.provider)}</Select.Option>
                                <Select.Option value={intl.formatMessage(messages.school)}>{intl.formatMessage(messages.school)}</Select.Option>
                                <Select.Option value={intl.formatMessage(messages.admin)}>{intl.formatMessage(messages.admin)}</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item className="form-btn continue-btn">
                            <Button block type="primary" htmlType="submit" onClick={this.onSubmit}>
                                {intl.formatMessage(messages.continue).toUpperCase()}
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Row>
        );
    }
}

const mapStateToProps = state => {
    return {
        register: state.register
    }
}

export default compose(
    connect(mapStateToProps, { setParent }))(CreateDefault);
