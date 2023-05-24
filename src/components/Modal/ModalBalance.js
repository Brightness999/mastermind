import React from 'react';
import { Modal, Button, Input, Form, Row, Col } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';
import { connect } from 'react-redux';
import { compose } from 'redux';

import messages from './messages';
import { APPOINTMENT, CLEAR, CLOSED, EVALUATION, NOFLAG, PARENT, SUBSIDY } from '../../routes/constant';
import './style/index.less';
import '../../assets/styles/login.less';

class ModalBalance extends React.Component {
	state = {
		appointments: [],
	}

	componentDidMount() {
		const { dependent, auth, event } = this.props;
		let data = [];
		let totalPayment = 0, minimumPayment = 0;

		dependent?.appointments?.filter(a => (a.provider?._id === auth.user.providerInfo?._id || a.provider?._id === event?.provider?._id) && [EVALUATION, APPOINTMENT, SUBSIDY].includes(a.type) && moment().isAfter(moment(a.date)) && a.status == CLOSED && !a.isPaid)?.forEach(event => {
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

			if (event?.flagStatus === NOFLAG) {
				data.push({ ...event, currentBalance: balance, pastDays: this.pastDays(event?.date) });
				this.form?.setFieldsValue({ [event._id]: balance });
				totalPayment += balance * 2;
			} else {
				data.push({ ...event, currentBalance: balance, pastDays: this.pastDays(event?.date) });
				this.form?.setFieldsValue({ [event._id]: event?.flagItems?.late, notes: event?.flagItems?.notes });
				totalPayment += balance + event?.flagItems?.late;
				minimumPayment = event?.flagItems?.minimumPayment;
			}
		});
		this.setState({ appointments: data });
		this.form?.setFieldsValue({ totalPayment, minimumPayment });
	}

	onFinish = (values) => {
		this.props.onSubmit(values);
	}

	pastDays = (date) => {
		return `${moment().diff(moment(date), 'hours') / 24 >= 1 ? Math.floor(moment().diff(moment(date), 'hours') / 24) + 'Days' : ''} ${moment().diff(moment(date), 'hours') % 24 > 0 ? Math.floor(moment().diff(moment(date), 'hours') % 24) + 'Hours' : ''}`;
	}

	handleChangeLateFee = () => {
		const { appointments } = this.state;
		const values = this.form.getFieldsValue();
		delete values.totalPayment;
		delete values.minimumPayment;
		delete values.notes;
		let newTotal = appointments?.reduce((a, b) => (a + b?.currentBalance * 1), 0);
		newTotal = newTotal + Object.values(values)?.reduce((a, b) => (a + b * 1), 0);

		this.form.setFieldsValue({ totalPayment: newTotal });
	}

	render() {
		const { event, dependent } = this.props;
		const { user } = this.props.auth;
		const { appointments } = this.state;
		const modalProps = {
			className: 'modal-balance',
			title: "",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: (e) => e.target.className !== 'ant-modal-wrap' && this.props.onCancel(),
			footer: null,
		};

		return (
			<Modal {...modalProps}>
				<p className='font-20 font-500 mb-10'>{intl.formatMessage(messages.unpaidBalance)} - <span className='text-uppercase'>{`${dependent?.firstName ?? ''} ${dependent?.lastName ?? ''}`}</span></p>
				<Form name='flag-balance' layout='vertical' onFinish={this.onFinish} ref={ref => this.form = ref}>
					{appointments?.map((event, index) => (
						<div key={index} className={`flex flex-row ${index === 0 ? 'items-start' : 'items-center'} mb-5`}>
							<div className='mr-10 flex-1'>
								<Form.Item
									name={event._id}
									label={index === 0 ? intl.formatMessage(messages.lateFeeAmount) : ''}
									className={`mb-0 ${(user?.role === PARENT || event?.flagStatus === CLEAR) && 'events-none'}`}
									rules={[{ required: true }]}
								>
									<Input
										type='number'
										min={0}
										addonBefore="$"
										style={{ width: 110 }}
										className='font-16 late'
										onKeyDown={(e) => {
											(e.key === '-' || e.key === 'Subtract' || e.key === '.' || e.key === 'e') && e.preventDefault();
											if (e.key > -1 && e.key < 10 && e.target.value === '0') {
												e.preventDefault();
												e.target.value = e.key;
											}
										}}
										onChange={this.handleChangeLateFee}
									/>
								</Form.Item>
							</div>
							<div className='mr-10 flex-1'>
								{index === 0 ? <p>{intl.formatMessage(messages.currentBalanceDue)}</p> : null}
								<p className={`font-16 font-500 mb-0 ${index === 0 && 'mt-1'}`}>{event?.currentBalance ? `$${event?.currentBalance}` : ''}</p>
							</div>
							<div className='flex-1'>
								{index === 0 ? <p>{intl.formatMessage(messages.daysPastDue)}</p> : null}
								<p className={`font-16 font-500 mb-0 ${index === 0 && 'mt-1'}`}>{event?.pastDays}</p>
							</div>
						</div>
					))}
					<Row gutter={15}>
						<Col>
							<Form.Item
								name="totalPayment"
								label={intl.formatMessage(messages.totalPayment)}
								className="mb-0 events-none"
								rules={[{ required: true }]}
							>
								<Input
									type='number'
									min={0}
									addonBefore="$"
									style={{ width: 120 }}
									className='font-16 late'
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
						<Col>
							<Form.Item
								name="minimumPayment"
								label={intl.formatMessage(messages.minimumPayment)}
								className={`mb-0 ${(user?.role === PARENT || event?.flagStatus === CLEAR) && 'events-none'}`}
								rules={[{ required: true }]}
							>
								<Input
									type='number'
									min={0}
									addonBefore="$"
									style={{ width: 120 }}
									className='font-16 late'
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
					<Form.Item name="notes" label={intl.formatMessage(messages.notes)} rules={[{ required: true }]} className={`${(user?.role === PARENT || event?.flagStatus === CLEAR) && 'events-none'}`}>
						<Input.TextArea rows={4} placeholder={intl.formatMessage(messages.notes)} className="notes" />
					</Form.Item>
					<Row className="justify-end gap-2 mt-10">
						<Button key="back" onClick={this.props.onCancel}>
							{intl.formatMessage(messages.cancel)}
						</Button>
						{(user?.role === PARENT || event?.flagStatus === CLEAR) ? (
							<Button key="submit" type="primary" onClick={this.props.onCancel} className="px-20">OK</Button>
						) : (
							<Button key="submit" type="primary" htmlType='submit'>
								{intl.formatMessage(messages.submitFlag)}
							</Button>
						)}
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