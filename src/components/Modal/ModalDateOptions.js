import React from 'react';
import { Modal, Button, Form, Row, Radio, Space } from 'antd';
import intl from 'react-intl-universal';

import messages from './messages';
import msgCreateAccount from 'routes/Sign/CreateAccount/messages';
import './style/index.less';
import '../../assets/styles/login.less';

class ModalDateOptions extends React.Component {
	onFinish = (values) => {
		this.props.onSubmit(values);
	}

	render() {
		const modalProps = {
			className: 'modal-date-options',
			title: "Options",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: this.props.onCancel,
			footer: null,
		};

		return (
			<Modal {...modalProps}>
				<p className='font-20 font-500 mb-10'>Please select a option.</p>
				<Form name='date-options' layout='vertical' onFinish={this.onFinish}>
					<Form.Item name="option" rules={[{ required: true, message: 'Please select a option.' }]}>
						<Radio.Group>
							<Space direction="vertical">
								<Radio value="appointment">Create new appointment</Radio>
								<Radio value="datetime">Add blackout date and time</Radio>
							</Space>
						</Radio.Group>
					</Form.Item>
					<Row className="justify-end gap-2 mt-10">
						<Button key="back" onClick={this.props.onCancel}>
							{intl.formatMessage(messages.goBack)}
						</Button>
						<Button key="submit" type="primary" htmlType='submit'>
							{intl.formatMessage(msgCreateAccount.confirm)}
						</Button>
					</Row>
				</Form>
			</Modal>
		);
	}
};

export default ModalDateOptions;