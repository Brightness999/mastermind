import React from 'react';
import { Modal, Button, Input, Form, Row } from 'antd';
import intl from 'react-intl-universal';
import messages from './messages';
import msgReview from '../../routes/Sign/SubsidyReview/messages';
import './style/index.less';
import '../../assets/styles/login.less';

class ModalNoShow extends React.Component {
	componentDidMount() {
		const { event } = this.props;
		const currentBalance = event?.type == 2 ? event?.provider?.separateEvaluationRate : event?.type == 3 ? event?.provider?.academicLevel?.find(a => a.level == event?.dependent?.currentGrade)?.rate : event?.type == 5 ? event?.provider?.academicLevel?.find(a => a.level == event?.dependent?.currentGrade)?.subsidizedRate : '';
		this.form?.setFieldsValue({ penalty: currentBalance, program: 5 });
	}

	onFinish = (values) => {
		this.props.onSubmit(values);
	}

	render() {
		const { event } = this.props;
		const modalProps = {
			className: 'modal-no-show',
			title: "",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: (e) => e.target.className !== 'ant-modal-wrap' && this.props.onCancel(),
			footer: []
		};

		return (
			<Modal {...modalProps}>
				<p className='font-20 font-500 mb-10'>{intl.formatMessage(messages.noShowPenalty)} - <span className='text-uppercase'>{`${event?.dependent?.firstName ?? ''} ${event?.dependent?.lastName ?? ''}`}</span></p>
				<Form name='flag-no-show' layout='vertical' onFinish={this.onFinish} ref={ref => this.form = ref}>
					<div className='flex flex-row items-start mb-5'>
						<div className='mr-10 flex-1'>
							<Form.Item
								name="penalty"
								label={intl.formatMessage(messages.penaltyAmount)}
								rules={[{
									required: true,
									validator: (_, value) => {
										if (value < 0) return Promise.reject('Must be value greater than 0');
										return Promise.resolve();
									}
								}]}
							>
								<Input type='number' style={{ width: 100 }} addonBefore="$" className='font-16' />
							</Form.Item>
						</div>
						<div className='flex-1'>
							<Form.Item
								name="program"
								label={intl.formatMessage(messages.programPenalty)}
								rules={[{
									required: true,
									validator: (_, value) => {
										if (value < 0) return Promise.reject('Must be value greater than 0');
										return Promise.resolve();
									}
								}]}
							>
								<Input type='number' style={{ width: 100 }} addonBefore="$" className='font-16' />
							</Form.Item>
						</div>
					</div>
					<Form.Item name="notes" label={intl.formatMessage(msgReview.notes)} rules={[{ required: true }]}>
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

export default ModalNoShow;