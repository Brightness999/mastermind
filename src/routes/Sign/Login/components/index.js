import React from 'react';
import { Link } from 'dva/router';
import { Row, Form, Button, Input } from 'antd';
import intl from 'react-intl-universal';
import Cookies from 'js-cookie';
import { decode as base64_decode } from 'base-64';

import messages from '../messages';
import { routerLinks } from "routes/constant";
import { setUser } from 'src/redux/features/authSlice';
import { store } from 'src/redux/store';
import request from 'utils/api/request';
import { userActivate, userLogin } from 'utils/api/apiList';
import './index.less';

export default class extends React.Component {

	componentDidMount() {
		if (this.props.location.pathname.indexOf('/login/v') >= 0) {
			var base64Code = this.props.location.pathname.substring(8);
			var decodedString = base64_decode(base64Code);
			this.activeAccount(decodedString)
		}
	}

	activeAccount(decodedString) {
		request.post(userActivate, { token: decodedString }).then(result => {
			const { success } = result;
			if (success) {
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
			const token = Cookies.get('tk');
			if (token) {
				store.getState().auth.user.role > 900 ? this.props.history.push(routerLinks.Admin) : this.props.history.push(routerLinks.Dashboard);
			} else {
				const response = await request.post(userLogin, values);
				const { success, data } = response;
				if (success) {
					Cookies.set('tk', data.token, { expires: new Date(Date.now() + 10 * 60 * 1000) });
					store.dispatch(setUser(data.user));
					data.user.role > 900 ? this.props.history.push(routerLinks.Admin) : this.props.history.push(routerLinks.Dashboard);
				}
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
