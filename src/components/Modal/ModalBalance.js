import React from 'react';
import { Modal, Button, Input, Form, Row } from 'antd';
import intl from 'react-intl-universal';
import messages from './messages';
import msgReview from '../../routes/Sign/SubsidyReview/messages';
import './style/index.less';
import '../../assets/styles/login.less';
import moment from 'moment';

class ModalBalance extends React.Component {
	componentDidMount() {
		const { event } = this.props;
		const currentBalance = event?.type == 2 ? event?.provider?.separateEvaluationRate : event?.type == 3 ? event?.provider?.academicLevel?.find(a => a.level == event?.dependent?.currentGrade)?.rate : event?.type == 5 ? event?.provider?.academicLevel?.find(a => a.level == event?.dependent?.currentGrade)?.subsidizedRate : '';
		this.form?.setFieldsValue({ rate: currentBalance });
	}

	onFinish = (values) => {
		this.props.onSubmit(values);
	}

	render() {
		const { event } = this.props;
		const modalProps = {
			className: 'modal-balance',
			title: "",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: (e) => e.target.className !== 'ant-modal-wrap' && this.props.onCancel(),
			footer: []
		};
		const pastDays = `${moment().diff(moment(event?.date), 'hours') / 24 >= 1 ? Math.floor(moment().diff(moment(event?.date), 'hours') / 24) + 'Days' : ''} ${moment().diff(moment(event?.date), 'hours') % 24 > 0 ? Math.floor(moment().diff(moment(event?.date), 'hours') % 24) + 'Hours' : ''}`
		const currentBalance = event?.type == 2 ? event?.provider?.separateEvaluationRate : event?.type == 3 ? event?.provider?.academicLevel?.find(a => a.level == event?.dependent?.currentGrade)?.rate : event?.type == 5 ? event?.provider?.academicLevel?.find(a => a.level == event?.dependent?.currentGrade)?.subsidizedRate : '';

		return (
			<Modal {...modalProps}>
				<p className='font-20 font-500 mb-10'>{intl.formatMessage(messages.unpaidBalance)} - <span className='text-uppercase'>{`${event?.dependent?.firstName ?? ''} ${event?.dependent?.lastName ?? ''}`}</span></p>
				<Form name='flag-balance' layout='vertical' onFinish={this.onFinish} ref={ref => this.form = ref}>
					<div className='flex flex-row items-start mb-5'>
						<div className='mr-10 flex-1'>
							<Form.Item
								name="late"
								label={intl.formatMessage(messages.lateFreeAmount)}
								className="mb-0"
								rules={[{
									required: true,
									validator: (_, value) => {
										if (value < 0) return Promise.reject('Must be value greater than 0');
										return Promise.resolve();
									}
								}]}
							>
								<Input type='number' addonBefore="$" style={{ width: 100 }} className='font-16' />
							</Form.Item>
						</div>
						<div className='mr-10 flex-1'>
							<p className='mb-5'>{intl.formatMessage(messages.currentBalanceDue)}</p>
							<p className='font-16 font-500 mb-0 mt-1'>{currentBalance ? `$${currentBalance}` : ''}</p>
						</div>
						<div className='flex-1'>
							<p className='mb-5'>{intl.formatMessage(messages.daysPastDue)}</p>
							<p className='font-16 font-500 mb-0 mt-1'>{pastDays}</p>
						</div>
					</div>
					<Form.Item name="notes" label={intl.formatMessage(messages.notes)} rules={[{ required: true }]}>
						<Input.TextArea rows={4} placeholder={intl.formatMessage(msgReview.notes)} />
					</Form.Item>
					<Row className="justify-end gap-2 mt-10">
						<Button key="back" onClick={this.props.onCancel}>
							{intl.formatMessage(messages.cancel)}
						</Button>
						<Button key="submit" type="primary" htmlType='submit' style={{ padding: '7.5px 30px' }}>
							{intl.formatMessage(messages.submitFlag)}
						</Button>
					</Row>
				</Form>
			</Modal>
		);
	}
};

export default ModalBalance;