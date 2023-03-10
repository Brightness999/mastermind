import React from 'react';
import { Modal, Button } from 'antd';
import intl from 'react-intl-universal';
import messages from './messages';
import msgCreateAccount from '../../routes/Sign/CreateAccount/messages';
import './style/index.less';
import '../../assets/styles/login.less';

class ModalConfirm extends React.Component {
	render() {
		const modalProps = {
			className: 'modal-confirm',
			title: "Confirm",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: (e) => e.target.className !== 'ant-modal-wrap' && this.props.onCancel(),
			footer: [
				<Button key="back" onClick={this.props.onCancel}>
					{intl.formatMessage(messages.cancel)}
				</Button>,
				<Button key="submit" type="primary" onClick={this.props.onSubmit}>
					{intl.formatMessage(msgCreateAccount.confirm)}
				</Button>
			]
		};
		return (
			<Modal {...modalProps}>
				<p>{this.props.message}</p>
			</Modal>
		);
	}
};

export default ModalConfirm;