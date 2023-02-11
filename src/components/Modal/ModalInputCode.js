import React from 'react';
import { Modal, Button, Input } from 'antd';
import intl from 'react-intl-universal';
import messages from './messages';
import './style/index.less';
import '../../assets/styles/login.less';

class ModalInputCode extends React.Component {
	state = {
		code: '',
	}

	render() {
		const modalProps = {
			className: 'modal-verification',
			title: "Verification Code",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: this.props.onCancel,
			closable: false,
			footer: [
				<Button key="back" onClick={this.props.onCancel}>
					{intl.formatMessage(messages.cancel)}
				</Button>,
				<Button key="submit" type="primary" onClick={() => this.props.onSubmit(this.state.code)} style={{ padding: '0px 20px', height: 38 }}>
					{intl.formatMessage(messages.verify)}
				</Button>
			]
		};

		return (
			<Modal {...modalProps}>
				<Input placeholder={intl.formatMessage(messages.verificationCode)} onChange={(e) => this.setState({ code: e.target.value })} />
			</Modal>
		);
	}
};

export default ModalInputCode;