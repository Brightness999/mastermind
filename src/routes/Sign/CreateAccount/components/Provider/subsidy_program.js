import React, { Component } from 'react';
import { Row, Col, Form, Button, Select, Switch, Divider, Input, Checkbox } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import 'moment/locale/en-au';
import { getDefaultValueForProvider } from '../../../../../utils/api/apiList';
import request from '../../../../../utils/api/request';

class SubsidyProgram extends Component {
	state = {
		academicLevels: [],
		numberOfSession: [1, 2, 3, 4, 5, 6, 7],
		isAcceptProBono: false,
		isAcceptReduceRate: false,
		isWillingOpenPrivate: false,
		isSameRate: true,
		isPrivateForHmgh: false,
	}

	componentDidMount() {
		const { registerData } = this.props.register;
		const { academicLevels, user } = this.props.auth;

		if (registerData.subsidy) {
			this.form?.setFieldsValue(registerData.subsidy);
		} else {
			this.props.setRegisterData({ subsidy: this.getDefaultObj() });
		}

		this.form?.setFieldsValue({ academicLevel: registerData?.subsidy?.academicLevel ? registerData?.subsidy?.academicLevel : registerData?.financialInfor?.academicLevel });

		this.setState({
			isAcceptProBono: registerData.isAcceptProBono || false,
			isAcceptReduceRate: registerData.isAcceptReduceRate || false,
			isWillingOpenPrivate: registerData?.profileInfor?.isPrivateForHmgh ? false : registerData.isWillingOpenPrivate || false,
			isPrivateForHmgh: registerData?.profileInfor?.isPrivateForHmgh || false,
		})

		if (user?.role > 900) {
			this.setState({ academicLevels: academicLevels });
		} else {
			this.getDataFromServer();
		}
	}

	getDataFromServer = () => {
		request.post(getDefaultValueForProvider).then(result => {
			const { success, data } = result;
			if (success) {
				this.setState({ academicLevels: data?.AcademicLevel ?? [] });
			}
		}).catch(err => {
			console.log('get default data error---', err);
		})
	}

	getDefaultObj = () => {
		return {
			isAcceptProBono: false,
			isAcceptReduceRate: false,
			isWillingOpenPrivate: false,
			numberSessions: '',
			level: '',
			subsidizedRate: '',
			rate: '',
			isSameRate: true,
		}
	}

	onFinish = (values) => {
		const { isAcceptProBono, isAcceptReduceRate, isWillingOpenPrivate } = this.state;
		const { registerData } = this.props.register;
		let data = {
			isAcceptProBono: isAcceptProBono,
			isAcceptReduceRate: isAcceptReduceRate,
			isWillingOpenPrivate: isWillingOpenPrivate,
		};

		if (isAcceptProBono) {
			data.proBonoNumber = values.proBonoNumber;
		} else {
			data.proBonoNumber = 0;
		}

		this.props.setRegisterData({
			subsidy: {
				...data,
				academicLevel: isAcceptReduceRate ? values.academicLevel : values.academicLevel?.map(level => ({ ...level, subsidizedRate: level?.rate })),
			},
			financialInfor: {
				...registerData.financialInfor,
				academicLevel: isAcceptReduceRate ? values.academicLevel : values.academicLevel?.map(level => ({ ...level, subsidizedRate: level?.rate })),
			},
		})
		this.props.onContinue();
	};

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	changeCheckboxValueOnRedux = (name, value) => {
		let obj = {};
		obj[name] = value;
		this.props.setRegisterData(obj)
	}

	handleSelectChange = () => {
		console.log(this.form.getFieldsValue())
		this.props.setRegisterData({ subsidy: this.form.getFieldsValue() })
	}

	render() {
		const { isAcceptProBono, isAcceptReduceRate, isWillingOpenPrivate, academicLevels, isSameRate, numberOfSession, isPrivateForHmgh } = this.state;

		return (
			<Row justify="center" className="row-form">
				<div className='col-form col-subsidy-program'>
					<div className='div-form-title'>
						<p className='font-30 text-center mb-10'>{intl.formatMessage(messages.subsidyProgram)}<QuestionCircleOutlined className='text-primary icon-question ' /></p>
					</div>
					<Form
						name="form_subsidy_program"
						layout='vertical'
						onFinish={this.onFinish}
						onFinishFailed={this.onFinishFailed}
						ref={(ref) => { this.form = ref }}
					>
						<div className='flex flex-row mb-10'>
							<Checkbox
								checked={isAcceptProBono}
								onChange={v => {
									this.setState({ isAcceptProBono: v.target.checked })
									this.changeCheckboxValueOnRedux('isAcceptProBono', v.target.checked)
								}}
							/>
							<p className='font-15 font-700 mb-0 ml-10'>{intl.formatMessage(messages.offeringVolunteer)}</p>
						</div>
						<div className='flex flex-row justify-between px-20'>
							<p className='mb-10'>{intl.formatMessage(messages.numberSessionsWeek)}</p>
							<Form.Item
								name="proBonoNumber"
								label="Sessions"
								className='select-small'
								rules={[{ required: isAcceptProBono, message: 'Please select your sessions.' }]}
							>
								<Select
									disabled={!isAcceptProBono}
									onChange={() => this.handleSelectChange()}
								>
									{numberOfSession?.map((value, index) => (
										<Select.Option key={index} value={value}>{value}</Select.Option>
									))}
								</Select>
							</Form.Item>
						</div>
						<Divider style={{ marginTop: 10, borderColor: '#d7d7d7' }} />
						<div className='flex flex-row mb-10'>
							<Checkbox
								onChange={v => {
									this.setState({ isAcceptReduceRate: v.target.checked })
									this.changeCheckboxValueOnRedux('isAcceptReduceRate', v.target.checked)
								}}
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
														className='select-small'
														rules={[{ required: isAcceptReduceRate, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.level) }]}
													>
														<Select
															disabled
															placeholder={intl.formatMessage(messages.level)}
														>
															{academicLevels?.map((lvl, index) => (
																<Select.Option key={index} value={lvl}>{lvl}</Select.Option>
															))}
														</Select>
													</Form.Item>
												</Col>
												<Col xs={12} sm={12} md={6}>
													<Form.Item
														name={[field.name, "rate"]}
														label={'Standard ' + intl.formatMessage(messages.rate)}
														className='select-small'
														style={{ height: "25px !important" }}
														rules={[{ required: isAcceptReduceRate, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.rate) }]}
													>
														<Input
															disabled
															className='input-with-select-small'
															placeholder={intl.formatMessage(messages.rate)}
														/>
													</Form.Item>
												</Col>
												<Col xs={12} sm={12} md={6} className={field.key !== 0 && 'item-remove'}>
													<Form.Item
														name={[field.name, "subsidizedRate"]}
														label={'Subsidized ' + intl.formatMessage(messages.rate)}
														className='select-small'
														rules={[{
															required: isAcceptReduceRate,
															message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.reduced),
															validator: (_, value) => {
																if (_.required && (value < 0 || value == '' || value == undefined)) return Promise.reject('Must be value greater than 0');
																return Promise.resolve();
															},
														}]}
													>
														<Input
															type="number"
															min={0}
															onChange={e => {
																if (isSameRate) {
																	let arr = JSON.parse(JSON.stringify(this.form.getFieldValue('academicLevel')));
																	this.form.setFieldValue('academicLevel', arr?.map(item => ({ ...item, subsidizedRate: e.target.value })));
																}
																this.handleSelectChange();
															}}
															disabled={!isAcceptReduceRate}
															className='input-with-select-small'
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
														size="small" defaultChecked
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
						<div className='flex flex-row mb-20'>
							<Checkbox
								onChange={v => {
									this.setState({ isWillingOpenPrivate: v.target.checked })
									this.changeCheckboxValueOnRedux('isWillingOpenPrivate', v.target.checked)
								}}
								checked={isWillingOpenPrivate}
								disabled={isPrivateForHmgh}
							/>
							<p className='font-15 font-700 mb-0 ml-10'>{intl.formatMessage(messages.openPrivateSlots)}</p>
						</div>
						<Button block type="primary" htmlType="submit">
							{intl.formatMessage(messages.continue).toUpperCase()}
						</Button>
					</Form>
				</div>
			</Row>
		);
	}
}

const mapStateToProps = state => ({
	register: state.register,
	auth: state.auth,
})

export default compose(connect(mapStateToProps, { setRegisterData }))(SubsidyProgram);