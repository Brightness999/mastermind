import React, { Fragment } from 'react';
import { Modal, Button, Input, Form, Row, Col, Divider } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';
import { connect } from 'react-redux';
import { compose } from 'redux';

import messages from './messages';
import msgCreateAccount from '../../routes/Sign/CreateAccount/messages';
import { ACTIVE, ADMIN, APPOINTMENT, CLEAR, CLOSED, EVALUATION, NOFLAG, PARENT, PROVIDER, SUBSIDY, SUPERADMIN } from '../../routes/constant';
import './style/index.less';
import '../../assets/styles/login.less';

class ModalBalance extends React.Component {
	state = {
		providerData: [],
	}

	componentDidMount() {
		const { dependent, auth, event } = this.props;
		let unpaidAppointments = [], providerData = [];

		if (event?.flagStatus === CLEAR) {
			this.form?.setFieldsValue({
				[event._id]: event.flagItems?.late || 0,
				[`balance-${event?._id}`]: event.flagItems?.totalPayment || 0,
				[`totalPayment-${event.provider?._id}`]: event.flagItems?.totalPayment || 0,
				[`minimumPayment-${event.provider?._id}`]: event.flagItems?.minimumPayment || 0,
			});
			this.setState({
				providerData: [{
					appointments: [{ ...event, pastDays: this.pastDays(event.date) }],
					provider: event.provider,
				}]
			})
		} else {
			if (auth.user.role === ADMIN || auth.user.role === SUPERADMIN) {
				unpaidAppointments = dependent?.appointments?.filter(a => [EVALUATION, APPOINTMENT, SUBSIDY].includes(a.type) && moment().isAfter(moment(a.date)) && a.status === CLOSED && !a.isPaid && [ACTIVE, NOFLAG].includes(a.flagStatus));
			} else if (auth.user.role === PROVIDER) {
				unpaidAppointments = dependent?.appointments?.filter(a => a.provider?._id === auth.user.providerInfo?._id && [EVALUATION, APPOINTMENT, SUBSIDY].includes(a.type) && moment().isAfter(moment(a.date)) && a.status === CLOSED && !a.isPaid && [ACTIVE, NOFLAG].includes(a.flagStatus));
			} else {
				unpaidAppointments = dependent?.appointments?.filter(a => a.provider?._id === event?.provider?._id && [EVALUATION, APPOINTMENT, SUBSIDY].includes(a.type) && moment().isAfter(moment(a.date)) && a.status === CLOSED && !a.isPaid && [ACTIVE, NOFLAG].includes(a.flagStatus));
			}

			const providers = unpaidAppointments?.map(a => a.provider)?.reduce((a, b) => a?.find(p => p._id === b._id) ? a : [...a, b], []);
			providers?.forEach(provider => {
				let temp = [], total = 0, minimum = 0;
				unpaidAppointments?.filter(a => a.provider?._id === provider?._id)?.forEach(event => {
					const balance = this.getBalance(event);
					if (event?.flagStatus === NOFLAG) {
						temp.push({ ...event, pastDays: this.pastDays(event?.date) });
						this.form?.setFieldsValue({
							[event._id]: balance || 0,
							[`balance-${event._id}`]: balance || 0,
						});
						total += balance * 2;
					} else {
						temp.push({ ...event, pastDays: this.pastDays(event?.date) });
						this.form?.setFieldsValue({
							[event._id]: event?.flagItems?.late || 0,
							[`balance-${event._id}`]: event?.flagItems.balance || 0,
							notes: event?.flagItems?.notes,
						});
						total += event?.flagItems?.balance + event?.flagItems?.late;
						minimum = event?.flagItems?.minimumPayment;
					}
				});
				this.form.setFieldsValue({
					[`totalPayment-${provider?._id}`]: total || 0,
					[`minimumPayment-${provider?._id}`]: minimum || 0,
				});
				providerData.push({
					appointments: temp,
					provider: provider,
				})
			})
			this.setState({ providerData });
		}
	}


	getBalance = (event) => {
		const { dependent } = this.props;
		let balance;
		if (event?.type === EVALUATION) {
			balance = event?.provider?.separateEvaluationRate;
		} else if (event?.type === APPOINTMENT) {
			if (['Pre-Nursery', 'Nursery', 'Kindergarten', 'Pre-1A'].includes(dependent?.currentGrade)) {
				balance = event?.provider?.academicLevel?.find(a => [dependent?.currentGrade, 'Early Education'].includes(a.level))?.rate;
			} else if (['Grades 1', 'Grades 2', 'Grades 3', 'Grades 4', 'Grades 5', 'Grades 6'].includes(dependent?.currentGrade)) {
				balance = event?.provider?.academicLevel?.find(a => [dependent?.currentGrade, 'Elementary Grades 1-6', 'Elementary Grades 1-8'].includes(a.level))?.rate;
			} else if (['Grades 7', 'Grades 8'].includes(dependent?.currentGrade)) {
				balance = event?.provider?.academicLevel?.find(a => [dependent?.currentGrade, 'Middle Grades 7-8', 'Elementary Grades 1-8'].includes(a.level))?.rate;
			} else if (['Grades 9', 'Grades 10', 'Grades 11', 'Grades 12'].includes(dependent?.currentGrade)) {
				balance = event?.provider?.academicLevel?.find(a => [dependent?.currentGrade, 'High School Grades 9-12'].includes(a.level))?.rate;
			} else {
				balance = event?.provider?.academicLevel?.find(a => a.level == dependent?.currentGrade)?.rate;
			}
		} else if (event?.type === SUBSIDY) {
			if (['Pre-Nursery', 'Nursery', 'Kindergarten', 'Pre-1A'].includes(dependent?.currentGrade)) {
				const level = event?.provider?.academicLevel?.find(a => [dependent?.currentGrade, 'Early Education'].includes(a.level));
				balance = level?.subsidizedRate ? level.subsidizedRate : level.rate;
			} else if (['Grades 1', 'Grades 2', 'Grades 3', 'Grades 4', 'Grades 5', 'Grades 6'].includes(dependent?.currentGrade)) {
				const level = event?.provider?.academicLevel?.find(a => [dependent?.currentGrade, 'Elementary Grades 1-6', 'Elementary Grades 1-8'].includes(a.level));
				balance = level?.subsidizedRate ? level.subsidizedRate : level.rate;
			} else if (['Grades 7', 'Grades 8'].includes(dependent?.currentGrade)) {
				const level = event?.provider?.academicLevel?.find(a => [dependent?.currentGrade, 'Middle Grades 7-8', 'Elementary Grades 1-8'].includes(a.level));
				balance = level?.subsidizedRate ? level.subsidizedRate : level.rate;
			} else if (['Grades 9', 'Grades 10', 'Grades 11', 'Grades 12'].includes(dependent?.currentGrade)) {
				const level = event?.provider?.academicLevel?.find(a => [dependent?.currentGrade, 'High School Grades 9-12'].includes(a.level));
				balance = level?.subsidizedRate ? level.subsidizedRate : level.rate;
			} else {
				const level = event?.provider?.academicLevel?.find(a => a.level == dependent?.currentGrade);
				balance = level?.subsidizedRate ? level.subsidizedRate : level.rate;
			}
		} else {
			balance = '';
		}
		return balance;
	}

	onFinish = (values) => {
		this.props.onSubmit(values);
	}

	pastDays = (date) => {
		return `${moment().diff(moment(date), 'hours') / 24 >= 1 ? Math.floor(moment().diff(moment(date), 'hours') / 24) + 'Days' : ''} ${moment().diff(moment(date), 'hours') % 24 > 0 ? Math.floor(moment().diff(moment(date), 'hours') % 24) + 'Hours' : ''}`;
	}

	handleChangeLateFee = (providerId) => {
		const { providerData } = this.state;
		const values = this.form.getFieldsValue();
		const appointments = providerData?.find(p => p.provider?._id == providerId).appointments;
		let newTotal = appointments?.reduce((a, b) => (a + values[`balance-${b._id}`] * 1 + values[b._id] * 1), 0);
		this.form.setFieldsValue({ [`totalPayment-${providerId}`]: newTotal });
	}

	render() {
		const { event, dependent } = this.props;
		const { user } = this.props.auth;
		const { providerData } = this.state;
		const modalProps = {
			className: 'modal-balance',
			title: "",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: (e) => e.target.className !== 'ant-modal-wrap' && this.props.onCancel(),
			footer: null,
			width: 700,
		};

		return (
			<Modal {...modalProps}>
				<p className='font-20 font-500 mb-10'>{intl.formatMessage(messages.unpaidBalance)} - <span className='text-uppercase'>{`${dependent?.firstName ?? ''} ${dependent?.lastName ?? ''}`}</span></p>
				<Form name='flag-balance' layout='vertical' onFinish={this.onFinish} ref={ref => this.form = ref}>
					{providerData?.map((p, index) => (
						<Fragment key={index}>
							<Divider className={index === 0 ? 'd-none' : 'my-10'} />
							{p.appointments?.map((a, index) => (
								<div key={index} className={`flex flex-row ${index === 0 ? 'items-start' : 'items-center'} mb-5`}>
									<div className='mr-10 flex-1'>
										<Form.Item
											name={a._id}
											label={index === 0 ? intl.formatMessage(messages.lateFeeAmount) : ''}
											className='mb-0'
											rules={[{ required: true }]}
										>
											<Input
												type='number'
												min={0}
												addonBefore="$"
												style={{ width: 110 }}
												className='font-16 late'
												disabled={user?.role === PARENT || event?.flagStatus === CLEAR}
												onKeyDown={(e) => {
													(e.key === '-' || e.key === 'Subtract' || e.key === '.' || e.key === 'e') && e.preventDefault();
													if (e.key > -1 && e.key < 10 && e.target.value === '0') {
														e.preventDefault();
														e.target.value = e.key;
													}
												}}
												onChange={() => this.handleChangeLateFee(p.provider?._id)}
											/>
										</Form.Item>
									</div>
									<div className='mr-10 flex-1'>
										<Form.Item
											name={`balance-${a._id}`}
											label={index === 0 ? intl.formatMessage(messages.currentBalanceDue) : ''}
											className='mb-0'
											rules={[{ required: true }]}
										>
											<Input
												type='number'
												min={0}
												addonBefore="$"
												style={{ width: 110 }}
												className='font-16 late'
												disabled
											/>
										</Form.Item>
									</div>
									<div className='flex-1'>
										{index === 0 ? <p>{intl.formatMessage(messages.daysPastDue)}</p> : null}
										<p className={`font-16 font-500 mb-0 ${index === 0 && 'mt-1'}`}>{a?.pastDays}</p>
									</div>
									<div className='flex-1'>
										{index === 0 ? <p>{intl.formatMessage(msgCreateAccount.provider)}</p> : null}
										<p className={`font-16 font-500 mb-0 ${index === 0 && 'mt-1'}`}>{p?.provider?.firstName} {p?.provider?.lastName}</p>
									</div>
								</div>
							))}
							<Row gutter={15}>
								<Col>
									<Form.Item
										name={`totalPayment-${p.provider?._id}`}
										label={intl.formatMessage(messages.totalPayment)}
										className="mb-0"
										rules={[{ required: true }]}
									>
										<Input
											type='number'
											min={0}
											addonBefore="$"
											style={{ width: 120 }}
											className='font-16 late'
											disabled
										/>
									</Form.Item>
								</Col>
								<Col>
									<Form.Item
										name={`minimumPayment-${p.provider?._id}`}
										label={intl.formatMessage(messages.minimumPayment)}
										className='mb-0'
										rules={[{ required: true }]}
									>
										<Input
											type='number'
											min={0}
											addonBefore="$"
											style={{ width: 120 }}
											className='font-16 late'
											disabled={user?.role === PARENT || event?.flagStatus === CLEAR}
											onKeyDown={(e) => {
												(e.key === '-' || e.key === 'Subtract' || e.key === '.' || e.key === 'e') && e.preventDefault();
												if (e.key > -1 && e.key < 10 && e.target.value === '0') {
													e.preventDefault();
													e.target.value = e.key;
												}
											}}
										/>
									</Form.Item>
								</Col>
							</Row>
						</Fragment>
					))}
					<Form.Item name="notes" label={intl.formatMessage(messages.notes)} rules={[{ required: true }]}>
						<Input.TextArea rows={4} placeholder={intl.formatMessage(messages.notes)} className="notes" disabled={user?.role === PARENT || event?.flagStatus === CLEAR} />
					</Form.Item>
					<Row className="justify-end gap-2 mt-10">
						<Button key="back" onClick={this.props.onCancel}>
							{intl.formatMessage(messages.goBack)}
						</Button>
						<Button key="submit" type="primary" htmlType='submit' disabled={user?.role === PARENT || event?.flagStatus === CLEAR}>
							{intl.formatMessage(messages.submitFlag)}
						</Button>
					</Row>
				</Form>
			</Modal>
		);
	}
};

const mapStateToProps = state => {
	return ({
		auth: state.auth,
	})
}

export default compose(connect(mapStateToProps))(ModalBalance);