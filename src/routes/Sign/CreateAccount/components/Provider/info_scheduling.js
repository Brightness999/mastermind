import React, { Component } from 'react';
import { Row, Col, Form, Button, Select, Switch } from 'antd';
import moment from 'moment';
import 'moment/locale/en-au';
import intl from 'react-intl-universal';
import { connect } from 'react-redux'
import { compose } from 'redux'

import messages from '../../messages';
import messagesLogin from '../../../Login/messages';
import { setRegisterData } from '../../../../../redux/features/registerSlice';

moment.locale('en');

class InfoScheduling extends Component {
	state = {
		isNewClientScreening: true,
		isSeparateEvaluationRate: true,
	}

	componentDidMount() {
		const { registerData } = this.props.register;

		if (registerData.scheduling) {
			this.form?.setFieldsValue(registerData.scheduling);
			this.setState({
				isSeparateEvaluationRate: registerData.scheduling.isSeparateEvaluationRate,
				isNewClientScreening: registerData.scheduling.isNewClientScreening,
			});
		} else {
			this.form?.setFieldsValue(this.getDefaultObj());
			this.props.setRegisterData({ scheduling: this.getDefaultObj() });
		}
	}

	getDefaultObj = () => {
		return {
			duration: undefined,
			isNewClientScreening: true,
			isSeparateEvaluationRate: true,
			separateEvaluationDuration: undefined,
			cancellationWindow: undefined,
		}
	}

	onFinish = (values) => {
		values.isSeparateEvaluationRate = this.state.isSeparateEvaluationRate;
		values.isNewClientScreening = this.state.isNewClientScreening;
		this.props.setRegisterData({ scheduling: { ...values } })
		this.props.onContinue();
	};

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	setValueToReduxRegisterData = (fieldName, value) => {
		const { registerData } = this.props.register;
		const scheduling = registerData.scheduling;
		let obj = {};
		obj[fieldName] = value;
		this.props.setRegisterData({ scheduling: { ...scheduling, ...obj } });
	}

	render() {
		const { isSeparateEvaluationRate, isNewClientScreening } = this.state;
		const { durations, cancellationWindow } = this.props.auth.generalData;

		return (
			<Row justify="center" className="row-form">
				<div className='col-form col-scheduling'>
					<div className='div-form-title'>
						<p className='font-30 text-center mb-10'>{intl.formatMessage(messages.scheduling)}</p>
					</div>
					<Form
						name="scheduling"
						layout='vertical'
						onFinish={this.onFinish}
						onFinishFailed={this.onFinishFailed}
						ref={(ref) => { this.form = ref }}
					>
						<Form.Item
							name="duration"
							label={intl.formatMessage(messages.standardSessionDuration)}
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.duration) }]}
							className='w-100'
						>
							<Select placeholder={intl.formatMessage(messages.duration)} onChange={duration => this.setValueToReduxRegisterData("duration", duration)}>
								{durations?.map((duration, index) => (
									<Select.Option key={index} value={duration.value}>{duration.label}</Select.Option>
								))}
							</Select>
						</Form.Item>
						<Row className='items-center gap-2'>
							<Form.Item name="isNewClientScreening">
								<Switch
									size='small'
									checked={isNewClientScreening}
									onChange={v => { this.setState({ isNewClientScreening: v }); this.setValueToReduxRegisterData("isNewClientScreening", v) }}
								/>
							</Form.Item>
							<p>{intl.formatMessage(messages.newClientScreening)}</p>
						</Row>
						<Row className='items-center'>
							<Col xs={24} sm={24} md={12}>
								<Row className='items-center gap-2'>
									<Form.Item name="isSeparateEvaluationRate">
										<Switch
											size='small'
											checked={isSeparateEvaluationRate}
											onChange={v => { this.setState({ isSeparateEvaluationRate: v }); this.setValueToReduxRegisterData("isSeparateEvaluationRate", v) }}
										/>
									</Form.Item>
									<p>{intl.formatMessage(messages.newClientEvaluation)}</p>
								</Row>
							</Col>
							<Col xs={24} sm={24} md={12}>
								{isSeparateEvaluationRate && (
									<Form.Item
										name="separateEvaluationDuration"
										label={intl.formatMessage(messages.evaluationDuration)}
										className='w-100 float-label-item'
										rules={[{ required: isSeparateEvaluationRate, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.duration) }]}
									>
										<Select placeholder={intl.formatMessage(messages.duration)} onChange={separateEvaluationDuration => this.setValueToReduxRegisterData("separateEvaluationDuration", separateEvaluationDuration)}>
											{durations?.map((duration, index) => (
												<Select.Option key={index} value={duration.value}>{duration.label}</Select.Option>
											))}
										</Select>
									</Form.Item>
								)}
							</Col>
						</Row>
						<Row>
							<Form.Item
								name="cancellationWindow"
								label={intl.formatMessage(messages.cancellationWindow)}
								rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.cancellationWindow) }]}
								className='w-100'
							>
								<Select placeholder={intl.formatMessage(messages.cancellationWindow)} onChange={cancellationWindow => this.setValueToReduxRegisterData("cancellationWindow", cancellationWindow)}>
									{cancellationWindow?.map((value, index) => (
										<Select.Option key={index} value={value}>{value}</Select.Option>
									))}
								</Select>
							</Form.Item>
						</Row>
						<Form.Item className="form-btn continue-btn" >
							<Button block type="primary" htmlType="submit">
								{intl.formatMessage(messages.continue).toUpperCase()}
							</Button>
						</Form.Item>
					</Form>
				</div>
			</Row >
		);
	}
}

const mapStateToProps = state => ({
	register: state.register,
	auth: state.auth,
})

export default compose(connect(mapStateToProps, { setRegisterData }))(InfoScheduling);