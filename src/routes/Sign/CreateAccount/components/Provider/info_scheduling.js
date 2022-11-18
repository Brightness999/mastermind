import React, { Component } from 'react';
import { Row, Col, Form, Button, Select, Switch } from 'antd';
import moment from 'moment';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import { url } from '../../../../../utils/api/baseUrl';
import axios from 'axios'
import 'moment/locale/en-au';
import { getDefaultValueForProvider } from '../../../../../utils/api/apiList';
moment.locale('en');

class InfoScheduling extends Component {
	state = {
		durations: [],
		cancellationWindow: [],
		isNewClientScreening: true,
		isSeparateEvaluationRate: true,
	}

	componentDidMount() {
		const { registerData } = this.props.register;

		if (registerData.scheduling) {
			this.form.setFieldsValue(registerData.scheduling);
			this.setState({
				isSeparateEvaluationRate: registerData.scheduling.isSeparateEvaluationRate,
				isNewClientScreening: registerData.scheduling.isNewClientScreening,
			});
		} else {
			this.form.setFieldsValue({ chidren: [this.getDefaultObj()] });
			this.props.setRegisterData({ scheduling: this.getDefaultObj() });
		}
		this.getDataFromServer();
	}

	getDataFromServer = () => {
		axios.post(url + getDefaultValueForProvider).then(result => {
			if (result.data.success) {
				const data = result.data.data;
				this.setState({
					durations: data?.durations,
					cancellationWindow: data?.CancellationWindow,
				})
			} else {
				this.setState({
					durations: [],
					cancellationWindow: [],
				});
			}
		}).catch(err => {
			console.log(err);
			this.setState({
				durations: [],
				cancellationWindow: [],
			});
		})
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

	render() {
		const { durations, cancellationWindow, isSeparateEvaluationRate, isNewClientScreening } = this.state;

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
							<Select placeholder={intl.formatMessage(messages.duration)}>
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
									onChange={v => this.setState({ isNewClientScreening: v })}
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
											onChange={v => this.setState({ isSeparateEvaluationRate: v })}
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
										className='w-100'
										rules={[{ required: isSeparateEvaluationRate, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.duration) }]}
									>
										<Select placeholder={intl.formatMessage(messages.duration)}>
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
								<Select placeholder={intl.formatMessage(messages.cancellationWindow)}>
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
})

export default compose(connect(mapStateToProps, { setRegisterData }))(InfoScheduling);