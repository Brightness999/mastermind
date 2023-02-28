import React, { Component } from 'react';
import { Row, Col, Form, Button, Select, Switch, message } from 'antd';
import intl from 'react-intl-universal';
import messages from '../../messages';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { getDefaultValueForProvider, getMyProviderInfo, getUserProfile } from '../../../../../utils/api/apiList';
import request from '../../../../../utils/api/request';
import { setInforProvider } from '../../../../../redux/features/authSlice';
import PageLoading from '../../../../../components/Loading/PageLoading';

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
		this.getDataFromServer();
		if (window.location.pathname?.includes('changeuserprofile')) {
			request.post(getUserProfile, { id: this.props.auth.selectedUser?._id }).then(result => {
				this.setState({ loading: false });
				const { success, data } = result;
				if (success) {
					this.form.setFieldsValue(data?.providerInfo);
					this.setState({
						isNewClientScreening: data?.providerInfo?.isNewClientScreening,
						isSeparateEvaluationRate: data?.providerInfo?.isSeparateEvaluationRate,
					})
				}
			}).catch(err => {
				console.log('get provider info error---', err);
				message.error("Getting Profile" + err.message);
				this.setState({ loading: false });
			})
		} else {
			request.post(getMyProviderInfo).then(result => {
				this.setState({ loading: false });
				const { success, data } = result;
				if (success) {
					this.form.setFieldsValue(data);
					this.setState({
						isNewClientScreening: data?.isNewClientScreening,
						isSeparateEvaluationRate: data?.isSeparateEvaluationRate,
					})
				}
			}).catch(err => {
				console.log('get provider info error---', err);
				message.error("Getting Profile" + err.message);
				this.setState({ loading: false });
			})
		}
	}

	getDataFromServer = () => {
		request.post(getDefaultValueForProvider).then(result => {
			const { success, data } = result;
			if (success) {
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

	onFinish = (values) => {
		try {
			this.props.dispatch(setInforProvider({
				...values,
				_id: window.location.pathname?.includes('changeuserprofile') ? this.props.auth.selectedUser?.providerInfo?._id : this.props.auth.user?.providerInfo?._id,
			}));
		} catch (error) {
			console.log(error, 'error')
		}
	};

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	render() {
		const { durations, cancellationWindow, isSeparateEvaluationRate, isNewClientScreening, loading } = this.state;

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
							rules={[{ required: true }]}
							className='w-100 float-label-item'
						>
							<Select placeholder={intl.formatMessage(messages.standardSessionDuration)}>
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
								<Form.Item
									name="separateEvaluationDuration"
									label={intl.formatMessage(messages.evaluationDuration)}
									className={`w-100 float-label-item ${isSeparateEvaluationRate ? '' : 'display-none'}`}
									rules={[{ required: isSeparateEvaluationRate }]}
								>
									<Select placeholder={intl.formatMessage(messages.duration)}>
										{durations?.map((duration, index) => (
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
									{cancellationWindow?.map((value, index) => (
										<Select.Option key={index} value={value}>{value}</Select.Option>
									))}
								</Select>
							</Form.Item>
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