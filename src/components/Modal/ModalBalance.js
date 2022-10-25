import React from 'react';
import { Modal, Button, Input } from 'antd';
import intl from 'react-intl-universal';
import messages from './messages';
import msgReview from '../../routes/Sign/SubsidyReview/messages';
import './style/index.less';
import '../../assets/styles/login.less';

class ModalBalance extends React.Component {
	render() {
		const modalProps = {
			className: 'modal-balance',
			title: "",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: this.props.onCancel,
			closable: false,
			footer: [
				<Button key="back" onClick={this.props.onCancel}>
					{intl.formatMessage(messages.cancel)}
				</Button>,
				<Button key="submit" type="primary" onClick={this.props.onSubmit} style={{ padding: '7.5px 30px' }}>
					{intl.formatMessage(messages.submitFlag)}
				</Button>
			]
		};

		return (
			<Modal {...modalProps}>
				<p className='font-20 font-500 mb-10'>{intl.formatMessage(messages.unpaidBalance)} - <span className='text-uppercase'>DEPENDENT NAME HERE</span></p>
				<div className='flex flex-row items-start mb-5'>
					<div className='mr-10 flex-1'>
						<p className='mb-5'>{intl.formatMessage(messages.lateFreeAmount)}</p>
						<Input defaultValue='${zero}' style={{ width: 100 }} className='font-16' />
					</div>
					<div className='mr-10 flex-1'>
						<p className='mb-5'>{intl.formatMessage(messages.currentBalanceDue)}</p>
						<p className='font-16 font-500'>&#36;&#123;amount&#125;</p>
					</div>
					<div className='flex-1'>
						<p className='mb-5'>{intl.formatMessage(messages.daysPastDue)}</p>
						<p className='font-16 font-500'>&#36;&#123;number&#125;</p>
					</div>
				</div>
				<div>
					<Input.TextArea rows={4} placeholder={intl.formatMessage(msgReview.notes)} />
				</div>
			</Modal>
		);
	}
};

export default ModalBalance;