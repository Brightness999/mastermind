import React from 'react';
import { Modal, Button, Input, Form, Row } from 'antd';
import intl from 'react-intl-universal';
import messages from './messages';
import './style/index.less';
import '../../assets/styles/login.less';

class ModalPayment extends React.Component {
	onFinish = (values) => {
		this.props.onSubmit(values);
	}

	render() {
		const modalProps = {
			className: 'modal-payment',
			title: "Payment",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: (e) => e.target.className !== 'ant-modal-wrap' && this.props.onCancel(),
			footer: [],
			width: 300,
		};

		return (
			<Modal {...modalProps}>
				<p className='font-16 font-500 mb-10'>Enter your payment</p>
				<Form name='flag-no-show' layout='vertical' onFinish={this.onFinish} ref={ref => this.form = ref}>
					<Form.Item
						name="payment"
						rules={[{
							required: true,
							validator: (_, value) => {
								if (value === undefined) return Promise.reject('Please enter your payment');
								if (value <= 0) return Promise.reject('Must be value greater than 0');
								return Promise.resolve();
							}
						}]}
					>
						<Input type='number' addonBefore="$" className='font-16 penalty' />
					</Form.Item>
					<Row className="justify-end gap-2 mt-10">
						<Button key="back" onClick={this.props.onCancel}>
							{intl.formatMessage(messages.cancel)}
						</Button>
						<Button key="submit" type="primary" htmlType='submit'>
							{intl.formatMessage(messages.submitFlag)}
						</Button>
					</Row>
				</Form>
			</Modal>
		);
	}
};

export default ModalPayment;