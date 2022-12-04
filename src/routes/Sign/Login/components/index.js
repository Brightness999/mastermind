import React from 'react';
import { Link } from 'dva/router';
import { Row, Form, Button, Input } from 'antd';
import { routerLinks } from "../../../constant";
import intl from 'react-intl-universal';
import messages from '../messages';
import { url } from '../../../../utils/api/baseUrl';
import axios from 'axios';
import './index.less';
import { decode as base64_decode, encode as base64_encode } from 'base-64';
import { getInfoAuth, setUser } from '../../../../redux/features/authSlice';
import { getAppointmentsData } from "../../../../redux/features/appointmentsSlice"
import { store } from '../../../../redux/store';

export default class extends React.Component {

	componentDidMount() {
		if (this.props.location.pathname.indexOf('/login/v') >= 0) {
			var base64Code = this.props.location.pathname.substring(8);
			var decodedString = base64_decode(base64Code);
			this.activeAccount(decodedString)
		}
	}

	activeAccount(decodedString) {
		axios.post(url + 'users/active_user', { token: decodedString }).then(result => {
			var data = result.data;
			if (data.success) {
				this.form.setFields([
					{
						name: 'loginresult',
						warnings: ['Your email actived!'],
					},
				]);
			} else {
				this.form.setFields([
					{
						name: 'loginresult',
						errors: ['cannot find your email!'],
					},
				]);
			}
		}).catch(err => {
			this.form.setFields([
				{
					name: 'loginresult',
					errors: [err?.response?.data?.data ?? 'cannot find your email!'],
				},
			]);
		});
	}

	onSubmit = async () => {
		try {
			const values = await this.form.validateFields();
			const response = await axios.post(url + 'users/login', values);
			const { success, data } = response.data;
			if (success) {
				localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
				store.dispatch(setUser(data.user))
				store.dispatch(getInfoAuth());
				store.dispatch(getAppointmentsData({ role: data.user.role, token: data.token }))
				data.user.role > 900 ? this.props.history.push(routerLinks.Admin) : this.props.history.push(routerLinks.Dashboard);
			}
		} catch (error) {
			console.log(error);
			this.form.setFields([
				{
					name: 'loginresult',
					errors: [error?.response?.data?.data ?? 'cannot find your email!'],
				},
			]);
		}
	}

	render() {
		const onFinishFailed = (errorInfo) => {
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
								onFinishFailed={onFinishFailed}
								ref={ref => this.form = ref}
							>
								<Form.Item
									name="username"
									rules={[{ required: true, message: intl.formatMessage(messages.usernameMessage) }]}
								>
									<Input placeholder={intl.formatMessage(messages.emailOrUsername)} />
								</Form.Item>
								<Form.Item
									name="password"
									rules={[{ required: true, message: intl.formatMessage(messages.passwordMessage) }]}
								>
									<Input.Password placeholder={intl.formatMessage(messages.password)} />
								</Form.Item>
								<Form.Item name="loginresult">
									<Button
										block
										type="primary"
										htmlType="submit"
										className="form-btn"
										onClick={this.onSubmit}
									>
										{intl.formatMessage(messages.login).toUpperCase()}
									</Button>
								</Form.Item>
							</Form>
						</div>
						<div className="div-new-user">
							<Link to={routerLinks['CreateAccount']}>{intl.formatMessage(messages.createAccount)}</Link>
							<Link to={routerLinks['ForgotPass']}>{intl.formatMessage(messages.forgotPass)}</Link>
						</div>
					</div>
				</Row>
			</div>
		);
	}
}
