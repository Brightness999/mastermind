import React, { Component } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Row, Form, Button, Input, Select, message } from 'antd';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { BsCheck, BsDot, BsX } from 'react-icons/bs';
import intl from 'react-intl-universal';
import messages from '../messages';
import messagesLogin from '../../../Sign/Login/messages';
import { setRegisterData } from '../../../../redux/features/registerSlice';
import { url } from '../../../../utils/api/baseUrl';
import { checkEmailRegistered } from '../../../../utils/api/apiList';
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
			checkEmailExist: false,
			checkUsernameExist: false,
		};
	}

	componentDidMount() {
		const { registerData } = this.props.register;
		const defaultPassword = 'Aa123@333';
		this.form?.setFieldsValue({
			username: registerData.username || '',
			email: registerData.email || '',
			password: registerData.password || undefined,
			role: registerData.role || 3,
			account_type: registerData.account_type || intl.formatMessage(messages.parent),
		});
		if (!registerData.role) {
			this.props.setRegisterData({
				role: 3,
				account_type: intl.formatMessage(messages.parent),
				password: defaultPassword
			})
		}
		this.props.onHandleChangeRoleRegister(registerData.account_type || intl.formatMessage(messages.parent));
	}

	onSubmit = async () => {
		try {
			const values = await this.form.validateFields();
			const { email, username } = values;
			const emailExits = await axios.post(url + checkEmailRegistered, { searchData: { email } })
			if (emailExits.data.data > 0) {
				return message.error('Email already exists');
			}
			const usernameExits = await axios.post(url + checkEmailRegistered, { searchData: { username } })
			if (usernameExits.data.data > 0) {
				return message.error('Username already exists');
			}
			return this.props.onContinue();
		} catch (error) {
			console.log(error);
		}
	}

	onFinish = values => {
		console.log('Success:', values);
	};

	onFinishFailed = errorInfo => {
		console.log('Failed:', errorInfo);
	};

	handleChangePassword = event => {
		let input = this.state.input;
		input[event.target.name] = event.target.value;
		this.props.setRegisterData({ password: event.target.value });
		this.setState({ input });
	};

	handleUsernameChange = event => {
		if (!!this.timeoutCheckUsername) {
			clearTimeout(this.timeoutCheckUsername);
			this.timeoutCheckUsername = null;
		}
		this.props.setRegisterData({ username: event.target.value });
		if (event.target.value && event.target.value.length == 0) {
			return;
		}
		this.timeoutCheckUsername = setTimeout(() => {
			axios.post(url + checkEmailRegistered, { searchData: { username: event.target.value } }).then(result => {
				if (result.data.data > 0) {
					this.form.setFields([
						{
							name: 'username',
							errors: [intl.formatMessage(messagesLogin.userExist)],
						},
					])
				}
			}).catch(err => {
				console.log(err);
			})
		}, 300);
	}

	handleEmailChange = event => {
		if (!!this.timeoutCheckUsername) {
			clearTimeout(this.timeoutCheckUsername);
			this.timeoutCheckUsername = null;
		}
		this.props.setRegisterData({ email: event.target.value });
		if (event.target.value && event.target.value.length == 0) {
			this.setState({ checkEmailExist: false });
			return;
		}
		const error = this.form.getFieldError("email")
		if (!!error && error.length > 0) {
			console.log("email dang loi", error);
			return;
		}
		this.timeoutCheckUsername = setTimeout(() => {
			axios.post(url + checkEmailRegistered, { searchData: { email: event.target.value } }).then(result => {
				if (result.data.data > 0) {
					this.form.setFields([
						{
							name: 'email',
							errors: [intl.formatMessage(messagesLogin.emailExist)],
						},
					])
					this.setState({ checkEmailExist: true });
				} else {
					this.setState({ checkEmailExist: false });
				}
			}).catch(err => {
				console.log(err);
				this.setState({
					checkEmailExist: false,
				});
			})
		}, 300);
	}

	handleRoleChange = event => {
		this.props.onHandleChangeRoleRegister(event);
		let role = 0;
		switch (event) {
			case intl.formatMessage(messages.parent):
				role = 3;
				break;
			case intl.formatMessage(messages.provider):
				role = 30;
				break;
			case intl.formatMessage(messages.school):
				role = 60;
				break;
			case intl.formatMessage(messages.consultant):
				role = 100;
				break;
			case intl.formatMessage(messages.admin):
				role = 999;
				break;
		}
		this.props.setRegisterData({
			role: role,
			account_type: event
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
		const { showValidateBox } = this.state;

		return (
			<Row justify="center" className="row-form">
				<div className="col-form col-create-default">
					<div className="div-form-title">
						<p className="font-30 text-center">{intl.formatMessage(messages.letCreateAccount)}</p>
					</div>
					<Form
						name="form_default"
						layout='vertical'
						onFinish={this.onFinish}
						onFinishFailed={this.onFinishFailed}
						ref={ref => this.form = ref}
						initialValues={{ account_type: intl.formatMessage(messages.parent) }}
					>
						<Form.Item
							name="username"
							label={intl.formatMessage(messages.username)}
							rules={[{ required: true, message: intl.formatMessage(messages.userMessage) }]}
						>
							<Input placeholder={intl.formatMessage(messages.username)} onChange={this.handleUsernameChange} />
						</Form.Item>
						<Form.Item
							name="email"
							label={intl.formatMessage(messages.email)}
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
							<Input placeholder={intl.formatMessage(messages.email)} onChange={this.handleEmailChange} />
						</Form.Item>
						<div className="relative">
							<Form.Item
								name="password"
								label={intl.formatMessage(messagesLogin.password)}
								rules={[{ required: true, validator: (_, value) => this.validatePassword(_, value) }]}
							>
								<Input.Password
									onFocus={() => this.setState({ showValidateBox: true })}
									onBlur={() => this.setState({ showValidateBox: false })}
									onChange={this.handleChangePassword}
									placeholder={intl.formatMessage(messagesLogin.password)}
									value={this.state.input.password}
								/>
							</Form.Item>
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
						<Form.Item
							name="account_type"
							label={intl.formatMessage(messages.accountType)}
							value={this.state.accountType}
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.accountType) }]}
						>
							<Select onChange={this.handleRoleChange} placeholder={intl.formatMessage(messages.selectType)}>
								<Select.Option value={intl.formatMessage(messages.parent)}>{intl.formatMessage(messages.parent)}</Select.Option>
								<Select.Option value={intl.formatMessage(messages.provider)}>{intl.formatMessage(messages.provider)}</Select.Option>
								<Select.Option value={intl.formatMessage(messages.school)}>{intl.formatMessage(messages.school)}</Select.Option>
								<Select.Option value={intl.formatMessage(messages.consultant)}>{intl.formatMessage(messages.consultant)}</Select.Option>
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

const mapStateToProps = state => ({ register: state.register });

export default compose(connect(mapStateToProps, { setRegisterData }))(CreateDefault);
