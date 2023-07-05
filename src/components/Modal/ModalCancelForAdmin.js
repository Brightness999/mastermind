import React from 'react';
import { Modal, Button } from 'antd';
import intl from 'react-intl-universal';

import messages from './messages';
import msgCreateAccount from 'routes/Sign/CreateAccount/messages';
import './style/index.less';

class ModalCancelForAdmin extends React.Component {
	render() {
		const modalProps = {
			className: 'modal-cancel-for-admin',
			title: (<span className='font-16'>{intl.formatMessage(msgCreateAccount.confirm)}</span>),
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: (e) => e.target.className !== 'ant-modal-wrap' && this.props.onCancel(),
			footer: null,
		};

		return (
			<Modal {...modalProps}>
				<div className='flex items-center gap-2'>
					<Button key="ApplyFeeToParent" type='primary' onClick={this.props.applyFeeToParent}>{intl.formatMessage(messages.applyFeeToParent)}</Button>
					<Button key="WaiveFee" type='primary' onClick={this.props.onSubmit}>{intl.formatMessage(messages.waiveFee)}</Button>
				</div>
			</Modal>
		);
	}
};

export default ModalCancelForAdmin;