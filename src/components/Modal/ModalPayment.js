import React from 'react';
import { Modal, Button } from 'antd';
import intl from 'react-intl-universal';

import messages from './messages';
import { encryptParam } from 'src/utils/api/request';
import './style/index.less';

class ModalPayment extends React.Component {
	onFinish = (values) => {
		this.props.onSubmit(values);
	}

	render() {
		const modalProps = {
			className: 'modal-payment',
			title: (<span className='font-16'>{intl.formatMessage(messages.payment)}</span>),
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: (e) => e.target.className !== 'ant-modal-wrap' && this.props.onCancel(),
			footer: [
				<Button key="back" onClick={this.props.onCancel}>
					{intl.formatMessage(messages.close)}
				</Button>,
				<form key="paynow" className='inline-block ml-10' aria-live="polite" data-ux="Form" action="https://www.paypal.com/cgi-bin/webscr" method="post">
					<input type="hidden" name="edit_selector" data-aid="EDIT_PANEL_EDIT_PAYMENT_ICON" />
					<input type="hidden" name="business" value="office@helpmegethelp.org" />
					<input type="hidden" name="cmd" value="_donations" />
					<input type="hidden" name="item_name" value="Help Me Get Help" />
					<input type="hidden" name="item_number" />
					<input type="hidden" name="amount" value={this.props.appointment?.provider?.cancellationFee} data-aid="PAYMENT_HIDDEN_AMOUNT" />
					<input type="hidden" name="shipping" value="0.00" />
					<input type="hidden" name="currency_code" value="USD" data-aid="PAYMENT_HIDDEN_CURRENCY" />
					<input type="hidden" name="rm" value="0" />
					<input type="hidden" name="return" value={`${window.location.href}?s=${encryptParam('true')}&t=${encryptParam(this.props.cancellationType)}&a=${encryptParam(this.props.appointment?._id)}`} />
					<input type="hidden" name="cancel_return" value={window.location.href} />
					<input type="hidden" name="cbt" value="Return to Help Me Get Help" />
					<Button key="submit" type="primary" htmlType='submit'>
						{intl.formatMessage(messages.paynow)}
					</Button>
				</form>
			],
			width: 400,
		};

		return (
			<Modal {...modalProps}>
				<p className='font-16'>Are your sure to {this.props.cancellationType?.toLowerCase()}?</p>
				<p className='font-16'>{this.props.description}</p>
			</Modal>
		);
	}
};

export default ModalPayment;