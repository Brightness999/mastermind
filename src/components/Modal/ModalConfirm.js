import React from 'react';
import { Modal, Button } from 'antd';
import intl from 'react-intl-universal';
import messages from './messages';
import './style/index.less';
import '../../assets/styles/login.less';

class ModalConfirm extends React.Component {
	render() {
		const modalProps = {
			className: 'modal-balance',
			title: "Confirm",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: this.props.onCancel,
			closable: false,
			footer: [
				<Button key="back" onClick={this.props.onCancel}>
					{intl.formatMessage(messages.cancel)}
				</Button>,
				<Button key="submit" type="primary" onClick={this.props.onSubmit} style={{ padding: '7.5px 30px' }}>
					{intl.formatMessage(messages.save)}
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