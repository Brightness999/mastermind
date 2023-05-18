import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Input } from 'antd';
import intl from 'react-intl-universal';
import messages from './messages';
import './style/index.less';
import '../../assets/styles/login.less';

const ModalInputCode = (props) => {
	const inputRef = useRef(null);
	const [code, setcode] = useState();
	const modalProps = {
		className: 'modal-verification',
		title: "Verification Code",
		open: props.visible,
		onOk: props.onSubmit,
		onCancel: props.onCancel,
		closable: false,
		footer: [
			<Button key="back" onClick={props.onCancel}>
				{intl.formatMessage(messages.cancel)}
			</Button>,
			<Button key="submit" type="primary" onClick={() => props.onSubmit(code)} style={{ padding: '0px 20px', height: 38 }}>
				{intl.formatMessage(messages.verify)}
			</Button>
		]
	};

	useEffect(() => {
		inputRef?.current?.focus();
	}, []);

	return (
		<Modal {...modalProps}>
			<Input name='PassCode' ref={inputRef} placeholder={intl.formatMessage(messages.verificationCode)} onKeyUp={(e) => e.key == 'Enter' && props.onSubmit(code)} onChange={(e) => setcode(e.target.value)} />
		</Modal>
	);
};

export default ModalInputCode;