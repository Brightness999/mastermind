import React from 'react';
import { Modal, Button } from 'antd';
import intl from 'react-intl-universal';
import messages from './messages';
import './style/index.less';
import '../../assets/styles/login.less';

class ModalInvoice extends React.Component {
	render() {
		const { event } = this.props;
		console.log(event);

		const modalProps = {
			className: 'modal-balance',
			title: "Invoice",
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
				<table className='w-100 table-fixed'>
					<tbody>
						<tr>
							<td colSpan={2}>
								<div className='w-100'>
									<img src="../images/logo.svg" alt="logo" width={80} height={80} />
								</div>
							</td>
							<td colSpan={5}></td>
							<td colSpan={5}>
								<div className='grid grid-columns-2'>
									<div className='border border-1 border-black -mb-1 -mr-1 text-center'>Date</div>
									<div className='border border-1 border-black -mb-1 -mr-1 text-center'>Invoice #</div>
									<div className='border border-1 border-black -mb-1 -mr-1 text-center'>{new Date().toLocaleDateString()}</div>
									<div className='border border-1 border-black -mb-1 -mr-1 text-center'>{new Date().getTime().toString()}</div>
								</div>
							</td>
						</tr>
						<tr>
							<td colSpan={3}>
								<div className='w-100 text-black'>
									<div>{event?.provider?.billingAddress}</div>
								</div>
							</td>
							<td colSpan={9}></td>
						</tr>
						<tr>
							<td colSpan={12}>
								<div className='w-100 text-black06'>
									<div>{event?.provider?.contactNumber?.[0]?.phoneNumber}</div>
									<div>{event?.provider?.contactEmail?.[0]?.email}</div>
									<div>helpmegethelp.org</div>
								</div>
							</td>
						</tr>
						<br />
						<tr>
							<td colSpan={6}>
								<div className='w-100'>
									<div className='border border-1 border-black -mb-1 -mr-1 px-5'>Bill To:</div>
									<div className='border border-1 border-black -mb-1 -mr-1 px-5'>
										<div>{event?.parent?.parentInfo?.fatherName ? event?.parent?.parentInfo?.fatherName : event?.parent?.parentInfo?.motherName}</div>
										<div>C/O {`${event?.dependent?.firstName ?? ''} ${event?.dependent?.lastName ?? ''}`}</div>
										<div>{event?.parent?.parentInfo?.address}</div>
									</div>
								</div>
							</td>
							<td colSpan={6}></td>
						</tr>
						<br />
						<tr>
							<td colSpan={5}></td>
							<td colSpan={7}>
								<div className='grid grid-columns-2'>
									<div className='border border-1 border-black -mb-1 -mr-1 text-center'>Terms</div>
									<div className='border border-1 border-black -mb-1 -mr-1 text-center'>Provider</div>
									<div className='border border-1 border-black -mb-1 -mr-1 text-center'>{event?.skillSet?.name}</div>
									<div className='border border-1 border-black -mb-1 -mr-1 text-center'>{`${event?.provider?.firstName ?? ''} ${event?.provider?.lastName ?? ''}`}</div>
								</div>
							</td>
						</tr>
						<br />
						<tr>
							<td colSpan={12}>
								<div className='w-100'>
									<table className='w-100'>
										<thead>
											<tr>
												<th colSpan={3} className='border border-1 border-black -mb-1 -mr-1'>Type</th>
												<th colSpan={3} className='border border-1 border-black -mb-1 -mr-1'>Session Date</th>
												<th colSpan={3} className='border border-1 border-black -mb-1 -mr-1'>Rate</th>
												<th colSpan={3} className='border border-1 border-black -mb-1 -mr-1'>Amount</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td colSpan={3} className='border border-1 border-black -mb-1 -mr-1'>
													<div className='text-center'>
														{event?.type == 2 && intl.formatMessage(messages.evaluation)}{event?.type == 3 && intl.formatMessage(messages.standardSession)}{event?.type == 4 && intl.formatMessage(messages.subsidizedSession)}
													</div>
												</td>
												<td colSpan={3} className='border border-1 border-black -mb-1 -mr-1'>
													<div className='text-center'>
														({event?.location}) Session on {new Date(event?.date)?.toLocaleDateString()}
													</div>
												</td>
												<td colSpan={3} className='border border-1 border-black -mb-1 -mr-1'>
													<div className='text-center'>
														{event?.rate}
													</div>
												</td>
												<td colSpan={3} className='border border-1 border-black -mb-1 -mr-1'>
													<div className='text-center'>
														{event?.rate}
													</div>
												</td>
											</tr>
											<tr>
												<td colSpan={10} rowSpan={5} className='border border-1 border-black -mb-1 -mr-1 vertical-top'>
													<div className='px-5'>
														<div className='text-right'>Subtotal</div>
														<div className='text-right'>Tax payments/Credits Amount Due</div>
													</div>
												</td>
											</tr>
											<tr><td colSpan={2} className='border border-1 border-black -mb-1 -mr-1 text-center'>{event?.rate}</td></tr>
											<tr><td colSpan={2} className='border border-1 border-black -mb-1 -mr-1 text-center'>0.00</td></tr>
											<tr><td colSpan={2} className='border border-1 border-black -mb-1 -mr-1 text-center'>{event?.rate}</td></tr>
											<tr><td colSpan={2} className='border border-1 border-black -mb-1 -mr-1 text-center'>{event?.rate}</td></tr>
										</tbody>
									</table>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</Modal>
		);
	}
};

export default ModalInvoice;