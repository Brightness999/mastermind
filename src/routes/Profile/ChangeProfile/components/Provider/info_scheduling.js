import React, { Component } from 'react';
import { Row, Col, Form, Button, Select, Switch, message, InputNumber } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux'
import { compose } from 'redux'

import messages from 'routes/Sign/CreateAccount/messages';
import { getMyProviderInfo, getUserProfile } from 'utils/api/apiList';
import request from 'utils/api/request';
import { setInforProvider } from 'src/redux/features/authSlice';
import PageLoading from 'components/Loading/PageLoading';
import { CancellationWindow, DurationType, Durations } from 'routes/constant';

class InfoScheduling extends Component {
	state = {
		durations: [],
		cancellationWindow: [],
		isNewClientScreening: true,
		isSeparateEvaluationRate: true,
		loading: false,
	}

	componentDidMount() {
		this.setState({ loading: true });
		if (window.location.pathname?.includes('changeuserprofile')) {
			request.post(getUserProfile, { id: this.props.auth.selectedUser?._id }).then(result => {
				this.setState({ loading: false });
				const { success, data } = result;
				if (success) {
					this.form?.setFieldsValue(data?.providerInfo);
					if (!data?.durationType) {
						this.form?.setFieldsValue({ durationType: 'days' });
					}
					this.setState({
						isNewClientScreening: data?.providerInfo?.isNewClientScreening,
						isSeparateEvaluationRate: data?.providerInfo?.isSeparateEvaluationRate,
					})
				}
			}).catch(err => {
				message.error("Getting Profile" + err.message);
				this.setState({ loading: false });
			})
		} else {
			request.post(getMyProviderInfo).then(result => {
				this.setState({ loading: false });
				const { success, data } = result;
				if (success) {
					this.form?.setFieldsValue(data);
					if (!data?.durationType) {
						this.form?.setFieldsValue({ durationType: 'days' });
					}
					this.setState({
						isNewClientScreening: data?.isNewClientScreening,
						isSeparateEvaluationRate: data?.isSeparateEvaluationRate,
					})
				}
			}).catch(err => {
				message.error("Getting Profile" + err.message);
				this.setState({ loading: false });
			})
		}
	}

	onFinish = (values) => {
		try {
			this.props.dispatch(setInforProvider({
				...values,
				_id: window.location.pathname?.includes('changeuserprofile') ? this.props.auth.selectedUser?.providerInfo?._id : this.props.auth.user?.providerInfo?._id,
			}));
		} catch (error) {
			message.error(error.message);
		}
	};

	render() {
		const { isSeparateEvaluationRate, isNewClientScreening, loading } = this.state;

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
							rules={[{ required: true }]}
							className='w-100 float-label-item'
						>
							<Select placeholder={intl.formatMessage(messages.standardSessionDuration)}>
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
								<Form.Item
									name="separateEvaluationDuration"
									label={intl.formatMessage(messages.evaluationDuration)}
									className={`w-100 float-label-item ${isSeparateEvaluationRate ? '' : 'display-none events-none'}`}
									rules={[{ required: isSeparateEvaluationRate }]}
								>
									<Select placeholder={intl.formatMessage(messages.duration)}>
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
								rules={[{ required: true }]}
								className='w-100 float-label-item'
							>
								<Select placeholder={intl.formatMessage(messages.cancellationWindow)}>
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
								{intl.formatMessage(messages.update).toUpperCase()}
							</Button>
						</Form.Item>
					</Form>
				</div>
				<PageLoading loading={loading} isBackground={true} />
			</Row >
		);
	}
}

const mapStateToProps = state => ({
	auth: state.auth,
})

export default compose(connect(mapStateToProps))(InfoScheduling);