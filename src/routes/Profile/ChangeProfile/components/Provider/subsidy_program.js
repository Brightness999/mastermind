import React, { Component } from 'react';
import { Row, Col, Form, Button, Select, Switch, Divider, Input, Checkbox, message } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import { connect } from 'react-redux'
import { compose } from 'redux'

import messages from '../../../../Sign/CreateAccount/messages';
import messagesLogin from '../../../../Sign/Login/messages';
import { setInforProvider } from '../../../../../redux/features/authSlice';
import request from '../../../../../utils/api/request';
import { getMyProviderInfo, getUserProfile } from '../../../../../utils/api/apiList';
import PageLoading from '../../../../../components/Loading/PageLoading';

class SubsidyProgram extends Component {
	state = {
		academicLevels: [],
		numberOfSession: [1, 2, 3, 4, 5, 6, 7],
		isAcceptProBono: false,
		isAcceptReduceRate: false,
		isSameRate: true,
		isWillingOpenPrivate: false,
		loading: false,
		isPrivateForHmgh: false,
	}

	componentDidMount() {
		this.setState({ loading: true, academicLevels: this.props.auth?.academicLevels });
		if (window.location.pathname?.includes('changeuserprofile')) {
			request.post(getUserProfile, { id: this.props.auth.selectedUser?._id }).then(result => {
				this.setState({ loading: false });
				const { success, data } = result;
				if (success) {
					this.form?.setFieldsValue({ ...data?.providerInfo, numberSessions: '1' });
					this.setState({
						isAcceptProBono: data?.providerInfo?.isAcceptProBono,
						isAcceptReduceRate: data?.providerInfo?.isAcceptReduceRate,
						isWillingOpenPrivate: data?.providerInfo?.isPrivateForHmgh ? false : data?.providerInfo?.isWillingOpenPrivate,
						isPrivateForHmgh: data?.providerInfo?.isPrivateForHmgh,
					})
				}
			}).catch(err => {
				console.log('get provider info error---', err);
				message.error(err.message);
				this.setState({ loading: false });
			})
		} else {
			request.post(getMyProviderInfo).then(result => {
				this.setState({ loading: false });
				const { success, data } = result;
				if (success) {
					this.form?.setFieldsValue({ ...data, numberSessions: '1' });
					this.setState({
						isAcceptProBono: data.isAcceptProBono,
						isAcceptReduceRate: data.isAcceptReduceRate,
						isWillingOpenPrivate: data?.providerInfo?.isPrivateForHmgh ? false : data.isWillingOpenPrivate,
						isPrivateForHmgh: data?.providerInfo?.isPrivateForHmgh,
					})
				}
			}).catch(err => {
				console.log('get provider info error---', err);
				message.error(err.message);
				this.setState({ loading: false });
			})
		}
	}

	onFinish = async (values) => {
		const { user, selectedUser } = this.props.auth;
		const { isAcceptProBono, isAcceptReduceRate, isWillingOpenPrivate } = this.state;
		let data = {
			_id: window.location.pathname?.includes('changeuserprofile') ? selectedUser?.providerInfo?._id : user?.providerInfo?._id,
			isAcceptProBono: isAcceptProBono,
			isAcceptReduceRate: isAcceptReduceRate,
			isWillingOpenPrivate: isWillingOpenPrivate,
		};

		if (isAcceptProBono) {
			data.proBonoNumber = values.proBonoNumber;
		} else {
			data.proBonoNumber = 0;
		}

		if (isAcceptReduceRate) {
			data.academicLevel = values.academicLevel;
		} else {
			data.academicLevel = values.academicLevel?.map(level => ({ ...level, subsidizedRate: level?.rate }));
		}

		try {
			this.props.dispatch(setInforProvider(data))
		} catch (error) {
			console.log(error, 'error')
		}
	};

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	render() {
		const { academicLevels, isAcceptProBono, isAcceptReduceRate, numberOfSession, isWillingOpenPrivate, isSameRate, loading, isPrivateForHmgh } = this.state;

		return (
			<Row justify="center" className="row-form">
				<div className='col-form col-subsidy-program'>
					<div className='div-form-title'>
						<p className='font-30 text-center mb-10'>{intl.formatMessage(messages.subsidyProgram)}<QuestionCircleOutlined className='text-primary icon-question ' /></p>
					</div>
					<Form
						name="form_subsidy_program"
						layout="vertical"
						onFinish={this.onFinish}
						onFinishFailed={this.onFinishFailed}
						ref={(ref) => { this.form = ref }}
					>
						<div className='flex flex-row mb-10'>
							<Checkbox
								checked={isAcceptProBono}
								onChange={v => this.setState({ isAcceptProBono: v.target.checked })}
							/>
							<p className='font-15 font-700 mb-0 ml-10'>{intl.formatMessage(messages.offeringVolunteer)}</p>
						</div>
						<div className='flex flex-row justify-between px-20'>
							<p className='mb-10'>{intl.formatMessage(messages.numberSessionsWeek)}</p>
							<Form.Item
								name="proBonoNumber"
								className='select-small'
							>
								<Select disabled={!isAcceptProBono}>
									{numberOfSession?.map((value, index) => (
										<Select.Option key={index} value={value}>{value}</Select.Option>
									))}
								</Select>
							</Form.Item>
						</div>
						<Divider style={{ marginTop: 10, borderColor: '#d7d7d7' }} />
						<div className='flex flex-row mb-10'>
							<Checkbox
								onChange={e => this.setState({ isAcceptReduceRate: e.target.checked })}
								checked={isAcceptReduceRate}
							/>
							<p className='font-15 font-700 mb-0 ml-10'>{intl.formatMessage(messages.provideSubsidizedCases)}</p>
						</div>
						<div className='px-20'>
							<Form.List name="academicLevel">
								{(fields) => (
									<div className='div-time'>
										{fields.map((field) => (
											<Row key={field.key} gutter={10}>
												<Col xs={24} sm={24} md={12}>
													<Form.Item
														name={[field.name, "level"]}
														label={intl.formatMessage(messages.level)}
													>
														<Select placeholder={intl.formatMessage(messages.level)} disabled>
															{academicLevels?.map((lvl, i) => (
																<Select.Option key={i} value={lvl}>{lvl}</Select.Option>
															))}
														</Select>
													</Form.Item>
												</Col>
												<Col xs={12} sm={12} md={6}>
													<Form.Item
														name={[field.name, "rate"]}
														label={'Standard' + intl.formatMessage(messages.rate)}
													>
														<Input
															placeholder={intl.formatMessage(messages.rate)}
															addonBefore="$"
															className='h-40'
															disabled
														/>
													</Form.Item>
												</Col>
												<Col xs={12} sm={12} md={6} className='item-remove'>
													<Form.Item
														name={[field.name, "subsidizedRate"]}
														label={'Subsidized' + intl.formatMessage(messages.rate)}
														rules={[{ required: isAcceptReduceRate, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.reduced) }]}
													>
														<Input
															type="number"
															min={0}
															addonBefore="$"
															className='h-40'
															onKeyDown={(e) => (e.key === '-' || e.key === 'Subtract' || e.key === '.' || (e.key > -1 && e.key < 10 && e.target.value === '0') || e.key === 'e') && e.preventDefault()}
															onChange={e => {
																if (isSameRate) {
																	let arr = JSON.parse(JSON.stringify(this.form?.getFieldValue('academicLevel')));
																	this.form?.setFieldValue('academicLevel', arr?.map(item => ({ ...item, subsidizedRate: e.target.value })));
																}
															}}
															disabled={!isAcceptReduceRate}
															placeholder={intl.formatMessage(messages.rate)}
														/>
													</Form.Item>
												</Col>
											</Row>
										))}
										<Row>
											<Col span={16}>
												<div className='flex flex-row items-center justify-end'>
													<Switch
														onChange={v => this.setState({ isSameRate: v })}
														disabled={!isAcceptReduceRate}
														size="small"
														defaultChecked
													/>
													<p className='ml-10 mb-0'>{intl.formatMessage(messages.sameRateLevels)}</p>
												</div>
											</Col>
										</Row>
									</div>
								)}
							</Form.List>
						</div>
						<Divider style={{ borderColor: '#d7d7d7' }} />
						<div className='flex flex-row mb-10'>
							<Checkbox
								onChange={e => this.setState({ isWillingOpenPrivate: e.target.checked })}
								checked={isWillingOpenPrivate}
								disabled={isPrivateForHmgh}
							/>
							<p className='font-15 font-700 mb-0 ml-10'>{intl.formatMessage(messages.openPrivateSlots)}</p>
						</div>
						<Form.Item className="form-btn continue-btn" >
							<Button
								block
								type="primary"
								htmlType="submit"
							>
								{intl.formatMessage(messages.update).toUpperCase()}
							</Button>
						</Form.Item>
					</Form>
				</div>
				<PageLoading loading={loading} isBackground={true} />
			</Row>
		);
	}
}

const mapStateToProps = state => ({ auth: state.auth });

export default compose(connect(mapStateToProps))(SubsidyProgram);