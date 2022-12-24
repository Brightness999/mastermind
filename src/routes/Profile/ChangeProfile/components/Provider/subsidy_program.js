import React, { Component } from 'react';
import { Row, Col, Form, Button, Select, Switch, Divider, Input, Checkbox, message } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../../Sign/Login/messages';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { setInforProvider } from '../../../../../redux/features/authSlice';
import { store } from '../../../../../redux/store'
import request from '../../../../../utils/api/request';
import { getMyProviderInfo } from '../../../../../utils/api/apiList';

class SubsidyProgram extends Component {
	state = {
		academicLevels: [],
		numberOfSession: [1, 2, 3, 4, 5, 6, 7],
		reduceList: [],
		isAcceptProBono: false,
		isAcceptReduceRate: false,
		isSameRate: true,
	}

	componentDidMount() {
		const arrReduce = [];
		for (let i = 0; i < 100; i++) {
			arrReduce.push(i);
		}

		this.setState({ reduceList: arrReduce, academicLevels: this.props.auth?.academicLevels });

		request.post(getMyProviderInfo).then(result => {
			const { success, data } = result;

			if (success) {
				this.form.setFieldsValue({ ...data, numberSessions: '1' });
				this.setState({
					isAcceptProBono: data.isAcceptProBono,
					isAcceptReduceRate: data.isAcceptReduceRate,
				})
			}
		}).catch(err => {
			console.log('get provider info error---', err);
			message.error(err.message);
		})
	}

	onFinish = async (values) => {
		const { user } = this.props.auth;
		const { isAcceptProBono, isAcceptReduceRate } = this.state;
		const token = localStorage.getItem('token');

		let data = {
			_id: user?.providerInfo?._id,
			isAcceptProBono: isAcceptProBono,
			isAcceptReduceRate: isAcceptReduceRate,
		};

		if (isAcceptProBono) {
			data.proBonoNumber = values.proBonoNumber;
		} else {
			data.proBonoNumber = 0;
		}

		if (isAcceptReduceRate) {
			data.academicLevel = values.academicLevel;
		} else {
			data.academicLevel = values.academicLevel?.map(level => {
				level.reducedRate = 0;
				return level;
			});
		}

		try {
			store.dispatch(setInforProvider({ data: data, token: token }))
		} catch (error) {
			console.log(error, 'error')
		}
	};

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	handleChangeReducedRate = (rate) => {
		if (this.state.isSameRate) {
			const rates = this.form.getFieldValue('academicLevel');
			this.form.setFieldsValue({ academicLevel: rates.map(item => ({ ...item, reducedRate: rate })) });
		}
	}

	render() {
		const { academicLevels, isAcceptProBono, isAcceptReduceRate, numberOfSession, reduceList } = this.state;

		return (
			<Row justify="center" className="row-form">
				<div className='col-form col-subsidy-program'>
					<div className='div-form-title'>
						<p className='font-30 text-center mb-10'>{intl.formatMessage(messages.subsidyProgram)}<QuestionCircleOutlined className='text-primary icon-question ' /></p>
					</div>
					<Form
						name="form_subsidy_program"
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
								onChange={v => this.setState({ isAcceptReduceRate: v.target.checked })}
								checked={isAcceptReduceRate}
							/>
							<p className='font-15 font-700 mb-0 ml-10'>{intl.formatMessage(messages.provideSubsidizedCases)}</p>
						</div>
						<div className='px-20'>
							<Form.List name="academicLevel">
								{(fields, { add, remove }) => (
									<div className='div-time'>
										{fields.map((field) => (
											<Row key={field.key} gutter={10}>
												<Col xs={24} sm={24} md={12}>
													<Form.Item
														name={[field.name, "level"]}
														label={intl.formatMessage(messages.level)}
														className='float-label-item'
													>
														<Select placeholder={intl.formatMessage(messages.level)} disabled>
															{academicLevels?.map((lvl, i) => (
																<Select.Option key={i} value={i}>{lvl}</Select.Option>
															))}
														</Select>
													</Form.Item>
												</Col>
												<Col xs={12} sm={12} md={6}>
													<Form.Item
														name={[field.name, "subsidizedRate"]}
														label={intl.formatMessage(messages.rate)}
														className='float-label-item'
													>
														<Input
															placeholder={intl.formatMessage(messages.rate)}
															disabled
														/>
													</Form.Item>
												</Col>
												<Col xs={12} sm={12} md={6} className='item-remove'>
													<Form.Item
														name={[field.name, "reducedRate"]}
														label={intl.formatMessage(messages.reduced)}
														className='float-label-item'
														rules={[{ required: isAcceptReduceRate, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.reduced) }]}
													>
														<Select
															placeholder={intl.formatMessage(messages.reduced)}
															onChange={(value) => this.handleChangeReducedRate(value)}
															disabled={!isAcceptReduceRate}
														>
															{reduceList?.map((value, index) => (
																<Select.Option key={index} value={value}>{value} %</Select.Option>
															))}
														</Select>
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
			</Row>
		);
	}
}

const mapStateToProps = state => ({ auth: state.auth });
export default compose(connect(mapStateToProps))(SubsidyProgram);