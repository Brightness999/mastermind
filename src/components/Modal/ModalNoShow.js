import React from 'react';
import { Modal, Button, Input, Form, Row, Radio, Space } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';

import messages from './messages';
import { APPOINTMENT, CLEAR, EVALUATION, NOFLAG, PARENT, SUBSIDY } from '../../routes/constant';
import './style/index.less';
import '../../assets/styles/login.less';

class ModalNoShow extends React.Component {
	state = {
		feeOption: 1,
	}

	componentDidMount() {
		const { event } = this.props;

		if (event?.flagStatus === NOFLAG) {
			const balance = this.getBalance(event);
			this.form?.setFieldsValue({ penalty: balance, program: 2, balance });
		} else {
			const invoice = event.flagInvoice;
			const data = invoice?.data?.[0];
			this.form?.setFieldsValue({
				penalty: data?.items?.penalty,
				program: data?.items?.program,
				notes: data?.items?.notes,
				invoiceId: invoice?._id,
				balance: data?.items?.balance,
				feeOption: data?.items?.feeOption,
			});
			this.setState({ feeOption: data?.items?.feeOption });
		}
	}

	onFinish = (values) => {
		this.props.onSubmit(values);
	}

	getBalance(event) {
		let balance;
		if (event?.type === EVALUATION) {
			balance = event?.provider?.separateEvaluationRate;
		} else if (event?.type === APPOINTMENT) {
			if (['Pre-Nursery', 'Nursery', 'Kindergarten', 'Pre-1A'].includes(event?.dependent?.currentGrade)) {
				balance = event?.provider?.academicLevel?.find(a => [event?.dependent?.currentGrade, 'Early Education'].includes(a.level))?.rate;
			} else if (['Grades 1', 'Grades 2', 'Grades 3', 'Grades 4', 'Grades 5', 'Grades 6'].includes(event?.dependent?.currentGrade)) {
				balance = event?.provider?.academicLevel?.find(a => [event?.dependent?.currentGrade, 'Elementary Grades 1-6', 'Elementary Grades 1-8'].includes(a.level))?.rate;
			} else if (['Grades 7', 'Grades 8'].includes(event?.dependent?.currentGrade)) {
				balance = event?.provider?.academicLevel?.find(a => [event?.dependent?.currentGrade, 'Middle Grades 7-8', 'Elementary Grades 1-8'].includes(a.level))?.rate;
			} else if (['Grades 9', 'Grades 10', 'Grades 11', 'Grades 12'].includes(event?.dependent?.currentGrade)) {
				balance = event?.provider?.academicLevel?.find(a => [event?.dependent?.currentGrade, 'High School Grades 9-12'].includes(a.level))?.rate;
			} else {
				balance = event?.provider?.academicLevel?.find(a => a.level == event?.dependent?.currentGrade)?.rate;
			}
		} else if (event?.type === SUBSIDY) {
			if (['Pre-Nursery', 'Nursery', 'Kindergarten', 'Pre-1A'].includes(event?.dependent?.currentGrade)) {
				const level = event?.provider?.academicLevel?.find(a => [event?.dependent?.currentGrade, 'Early Education'].includes(a.level));
				balance = level?.subsidizedRate ? level.subsidizedRate : level.rate;
			} else if (['Grades 1', 'Grades 2', 'Grades 3', 'Grades 4', 'Grades 5', 'Grades 6'].includes(event?.dependent?.currentGrade)) {
				const level = event?.provider?.academicLevel?.find(a => [event?.dependent?.currentGrade, 'Elementary Grades 1-6', 'Elementary Grades 1-8'].includes(a.level));
				balance = level?.subsidizedRate ? level.subsidizedRate : level.rate;
			} else if (['Grades 7', 'Grades 8'].includes(event?.dependent?.currentGrade)) {
				const level = event?.provider?.academicLevel?.find(a => [event?.dependent?.currentGrade, 'Middle Grades 7-8', 'Elementary Grades 1-8'].includes(a.level));
				balance = level?.subsidizedRate ? level.subsidizedRate : level.rate;
			} else if (['Grades 9', 'Grades 10', 'Grades 11', 'Grades 12'].includes(event?.dependent?.currentGrade)) {
				const level = event?.provider?.academicLevel?.find(a => [event?.dependent?.currentGrade, 'High School Grades 9-12'].includes(a.level));
				balance = level?.subsidizedRate ? level.subsidizedRate : level.rate;
			} else {
				const level = event?.provider?.academicLevel?.find(a => a.level == event?.dependent?.currentGrade);
				balance = level?.subsidizedRate ? level.subsidizedRate : level.rate;
			}
		} else {
			balance = '';
		}
		return balance;
	}

	render() {
		const { event, auth } = this.props;
		const { feeOption } = this.state;

		const modalProps = {
			className: 'modal-no-show',
			title: "",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: (e) => e.target.className !== 'ant-modal-wrap' && this.props.onCancel(),
			footer: null,
		};

		return (
			<Modal {...modalProps}>
				<p className='font-20 font-500 mb-10'>{intl.formatMessage(messages.noShowPenalty)} - <span className='text-uppercase'>{`${event?.dependent?.firstName ?? ''} ${event?.dependent?.lastName ?? ''}`}</span></p>
				<Form name='flag-no-show' layout='vertical' onFinish={this.onFinish} ref={ref => this.form = ref}>
					<Form.Item name="invoiceId" hidden>
						<Input />
					</Form.Item>
					<Form.Item name="balance" hidden>
						<Input />
					</Form.Item>
					<Form.Item name="feeOption" rules={[{ required: true }]}>
						<Radio.Group onChange={e => this.setState({ feeOption: e.target.value })}>
							<Space direction="vertical">
								<Radio value={1}>Charge for the session</Radio>
								<Radio value={2}>
									Charge custom amount with an input
								</Radio>
								{feeOption === 2 ? (
									<div className='flex flex-row items-start ml-20'>
										<div className='mr-10 flex-1'>
											<Form.Item
												name="penalty"
												label={intl.formatMessage(messages.penaltyAmount)}
												rules={[{ required: feeOption === 2 }]}
												className={`${(auth.user?.role === PARENT || event?.flagStatus === CLEAR) && 'events-none'}`}
											>
												<Input
													type='number'
													min={0}
													style={{ width: 100 }}
													addonBefore="$"
													className='font-16 penalty'
													onKeyDown={(e) => {
														(e.key === '-' || e.key === 'Subtract' || e.key === '.' || e.key === 'e') && e.preventDefault();
														if (e.key > -1 && e.key < 10 && e.target.value === '0') {
															e.preventDefault();
															e.target.value = e.key;
														}
													}}
												/>
											</Form.Item>
										</div>
										<div className='flex-1'>
											<Form.Item
												name="program"
												label={intl.formatMessage(messages.programPenalty)}
												rules={[{ required: feeOption === 2 }]}
												className={`${(auth.user?.role === PARENT || event?.flagStatus === CLEAR) && 'events-none'}`}
											>
												<Input
													type='number'
													min={0}
													style={{ width: 100 }}
													addonBefore="$"
													className='font-16 program'
													onKeyDown={(e) => {
														(e.key === '-' || e.key === 'Subtract' || e.key === '.' || e.key === 'e') && e.preventDefault();
														if (e.key > -1 && e.key < 10 && e.target.value === '0') {
															e.preventDefault();
															e.target.value = e.key;
														}
													}}
												/>
											</Form.Item>
										</div>
									</div>
								) : null}
								<Radio value={3}>No charge</Radio>
							</Space>
						</Radio.Group>
					</Form.Item>
					<Form.Item name="notes" label={intl.formatMessage(messages.notes)} rules={[{ required: true }]} className={`${(auth.user?.role === PARENT || event?.flagStatus === CLEAR) && 'events-none'}`}>
						<Input.TextArea rows={4} placeholder={intl.formatMessage(messages.notes)} />
					</Form.Item>
					<Row className="justify-end gap-2 mt-10">
						<Button key="back" onClick={this.props.onCancel}>
							{intl.formatMessage(messages.goBack)}
						</Button>
						<Button key="submit" type="primary" htmlType='submit' disabled={auth.user?.role === PARENT || event?.flagStatus === CLEAR}>
							{intl.formatMessage(messages.submitFlag)}
						</Button>
					</Row>
				</Form>
			</Modal>
		);
	}
};

const mapStateToProps = state => ({ auth: state.auth })

export default compose(connect(mapStateToProps))(ModalNoShow);