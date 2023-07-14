import React from 'react';
import { Modal, Button, Input } from 'antd';
import intl from 'react-intl-universal';

import messages from './messages';
import './style/index.less';
import { encryptParam } from 'utils/api/request';

class ModalPay extends React.Component {
	state = {
		payamount: 0,
	}

	render() {
		const { payamount } = this.state;
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
				<form key="paynow" className='inline-block ml-10' aria-live="polite" data-ux="Form" action="https://www.paypal.com/cgi-bin/webscr" method="post" onSubmit={e => (!payamount || payamount === '0') && e.preventDefault()}>
					<input type="hidden" name="edit_selector" data-aid="EDIT_PANEL_EDIT_PAYMENT_ICON" />
					<input type="hidden" name="business" value="office@helpmegethelp.org" />
					<input type="hidden" name="cmd" value="_donations" />
					<input type="hidden" name="item_name" value="Help Me Get Help" />
					<input type="hidden" name="item_number" />
					<input type="hidden" name="amount" value={payamount} data-aid="PAYMENT_HIDDEN_AMOUNT" />
					<input type="hidden" name="shipping" value="0.00" />
					<input type="hidden" name="currency_code" value="USD" data-aid="PAYMENT_HIDDEN_CURRENCY" />
					<input type="hidden" name="rm" value="0" />
					<input type="hidden" name="return" value={this.props.returnUrl + `&v=${encryptParam(payamount)}`} />
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
				<p>Total due: ${this.props.totalPayment}</p>
				{this.props.minimumPayment ? <p>Minimum due: ${this.props.minimumPayment}</p> : null}
				<p>Paid amount: ${this.props.paidAmount || 0}</p>
				<Input
					type="number"
					min={1}
					addonBefore="$"
					size='large'
					onKeyDown={(e) => {
						(e.key === '-' || e.key === 'Subtract' || e.key === '.' || e.key === 'e') && e.preventDefault();
						if (e.key > -1 && e.key < 10 && e.target.value === '0') {
							e.target.value = '';
						}
					}}
					onChange={e => this.setState({ payamount: e.target.value })}
					placeholder="Please input pay amount"
				/>
			</Modal>
		);
	}
};

export default ModalPay;