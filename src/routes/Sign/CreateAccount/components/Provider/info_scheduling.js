import React, { Component } from 'react';
import { Row, Col, Form, Button, Select, Switch, InputNumber } from 'antd';
import moment from 'moment';
import 'moment/locale/en-au';
import intl from 'react-intl-universal';
import { connect } from 'react-redux'
import { compose } from 'redux'

import messages from '../../messages';
import messagesLogin from 'routes/Sign/Login/messages';
import { setRegisterData } from 'src/redux/features/registerSlice';
import { CancellationWindow, DurationType, Durations } from 'routes/constant';

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
			durationType: 'days',
			durationValue: undefined,
		}
	}

	onFinish = (values) => {
		values.isSeparateEvaluationRate = this.state.isSeparateEvaluationRate;
		values.isNewClientScreening = this.state.isNewClientScreening;
		this.props.setRegisterData({ scheduling: { ...values } })
		this.props.onContinue();
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
						ref={(ref) => { this.form = ref }}
					>
						<Form.Item
							name="duration"
							label={intl.formatMessage(messages.standardSessionDuration)}
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.duration) }]}
							className='w-100'
						>
							<Select placeholder={intl.formatMessage(messages.duration)} onChange={duration => this.setValueToReduxRegisterData("duration", duration)}>
								{Durations?.map((duration, index) => (
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
								<Form.Item
									name="separateEvaluationDuration"
									label={intl.formatMessage(messages.evaluationDuration)}
									className={`w-100 float-label-item ${isSeparateEvaluationRate ? '' : 'display-none events-none'}`}
									rules={[{ required: isSeparateEvaluationRate, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.duration) }]}
								>
									<Select placeholder={intl.formatMessage(messages.duration)} onChange={separateEvaluationDuration => this.setValueToReduxRegisterData("separateEvaluationDuration", separateEvaluationDuration)}>
										{Durations?.map((duration, index) => (
											<Select.Option key={index} value={duration.value}>{duration.label}</Select.Option>
										))}
									</Select>
								</Form.Item>
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
									{CancellationWindow?.map((c, index) => (
										<Select.Option key={index} value={c.value}>{c.label}</Select.Option>
									))}
								</Select>
							</Form.Item>
						</Row>
						<p className='mb-5'>Scheduling Limit</p>
						<Row gutter={14}>
							<Col xs={16} sm={16} md={16}>
								<Form.Item
									name='durationValue'
									label={intl.formatMessage(messages.duration)}
									className='bottom-0 float-label-item'
									style={{ marginTop: 14 }}
								>
									<InputNumber
										min={0}
										onKeyDown={(e) => {
											(e.key === '-' || e.key === 'Subtract' || e.key === '.' || e.key === 'e') && e.preventDefault();
											if (e.key > -1 && e.key < 10 && e.target.value === '0') {
												e.target.value = '';
											}
										}}
										placeholder={intl.formatMessage(messages.duration)}
										className='w-100'
										onChange={value => this.setValueToReduxRegisterData("durationValue", value)}
									/>
								</Form.Item>
							</Col>
							<Col xs={8} sm={8} md={8}>
								<Form.Item
									name='durationType'
									label={intl.formatMessage(messages.type)}
									className='bottom-0 float-label-item'
									style={{ marginTop: 14 }}
								>
									<Select placeholder={intl.formatMessage(messages.type)}>
										{DurationType?.map((d, index) => (
											<Select.Option key={index} value={d.value}>{d.label}</Select.Option>
										))}
									</Select>
								</Form.Item>
							</Col>
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