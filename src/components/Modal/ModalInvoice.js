import React from 'react';
import { Modal, Button, Popover, Input, message, Col, InputNumber } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';
import moment from 'moment';
import { CheckCircleTwoTone, CloseCircleTwoTone, DeleteTwoTone, DownloadOutlined, EditTwoTone, PrinterTwoTone, SendOutlined } from '@ant-design/icons';

import messages from './messages';
import msgCreateAccount from 'routes/Sign/CreateAccount/messages';
import { downloadInvoice, sendEmailInvoice } from 'utils/api/apiList';
import request from 'utils/api/request';
import { APPOINTMENT, CLOSED, EVALUATION, NOSHOW, PENDING, SUBSIDY } from 'routes/constant';

class ModalInvoice extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			items: [],
			selectedItemIndex: -1,
			type: '',
			locationDate: '',
			rate: '',
			subTotal: '',
			loadingDownload: false,
			loadingEmail: false,
			invoiceNumber: '',
			event: this.props.event,
			invoiceDate: '',
			providerBillingAddress: '',
			providerPhonenumber: '',
			providerEmail: '',
			service: '',
			providerName: '',
			parentName: '',
			parentAddress: '',
			dependentName: '',
			isPaid: false,
			invoiceId: '',
			minimumPayment: 0,
			paidAmount: 0,
		};
	}

	componentDidMount() {
		const { appointments, event, invoice } = this.props;
		if (event?.sessionInvoice) {
			const items = event.sessionInvoice.data?.[0]?.items || [];
			this.setState({
				items,
				invoiceNumber: event.sessionInvoice.invoiceNumber,
				invoiceDate: moment(event.sessionInvoice.updatedAt).format("MM/DD/YYYY"),
				providerBillingAddress: event?.provider?.billingAddress,
				providerPhonenumber: event?.provider?.contactNumber?.[0]?.phoneNumber,
				providerName: `${event?.provider?.firstName ?? ''} ${event?.provider?.lastName ?? ''}`,
				providerEmail: event?.provider?.contactEmail?.[0]?.email,
				parentName: `${event?.parent?.parentInfo?.fatherName ? event?.parent?.parentInfo?.fatherName : event?.parent?.parentInfo?.motherName} ${event?.parent?.parentInfo?.familyName}`,
				parentAddress: event?.parent?.parentInfo?.address,
				dependentName: `${event?.dependent?.firstName ?? ''} ${event?.dependent?.lastName ?? ''}`,
				service: event?.skillSet?.name,
				isPaid: event.sessionInvoice?.isPaid,
				invoiceId: event.sessionInvoice?._id,
			});
		} else if (invoice) {
			let items = [];
			switch (invoice.type) {
				case 1: case 2: case 3: case 6: items = invoice.data?.[0]?.items || []; break;
				case 4: items = invoice.data?.[0]?.items?.data || []; break;
				case 5: items = invoice.data?.map(a => a.items.data)?.flat();
				default:
					break;
			}
			this.setState({
				items,
				invoiceNumber: invoice.invoiceNumber,
				invoiceDate: moment(invoice.updatedAt).format("MM/DD/YYYY"),
				providerBillingAddress: invoice.provider?.billingAddress,
				providerPhonenumber: invoice.provider?.contactNumber?.[0]?.phoneNumber,
				providerName: `${invoice.provider?.firstName ?? ''} ${invoice.provider?.lastName ?? ''}`,
				providerEmail: invoice.provider?.contactEmail?.[0]?.email,
				parentName: `${invoice.parent?.parentInfo?.fatherName ? invoice.parent?.parentInfo?.fatherName : invoice.parent?.parentInfo?.motherName} ${invoice.parent?.parentInfo?.familyName}`,
				parentAddress: invoice.parent?.parentInfo?.address,
				dependentName: `${invoice?.dependent?.firstName ?? ''} ${invoice?.dependent?.lastName ?? ''}`,
				service: [...new Set(invoice.data?.map(a => a?.appointment?.skillSet?.name))].join(', '),
				isPaid: invoice.isPaid,
				minimumPayment: invoice.minimumPayment || 0,
				paidAmount: invoice.paidAmount || 0,
				invoiceId: invoice._id,
			});
		} else if (event?.flagInvoice) {
			let items = [];
			if (event.flagInvoice.type === 4) {
				items = event.flagInvoice.data?.[0]?.items?.data || [];
			}
			if (event.flagInvoice.type === 5) {
				items = event.flagInvoice.data?.map(a => a.items.data)?.flat() || [];
			}

			this.setState({
				items,
				invoiceNumber: event.flagInvoice.invoiceNumber,
				invoiceDate: moment(event.flagInvoice.updatedAt).format("MM/DD/YYYY"),
				providerBillingAddress: event?.provider?.billingAddress,
				providerPhonenumber: event?.provider?.contactNumber?.[0]?.phoneNumber,
				providerName: `${event?.provider?.firstName ?? ''} ${event?.provider?.lastName ?? ''}`,
				providerEmail: event?.provider?.contactEmail?.[0]?.email,
				parentName: `${event?.parent?.parentInfo?.fatherName ? event?.parent?.parentInfo?.fatherName : event?.parent?.parentInfo?.motherName} ${event?.parent?.parentInfo?.familyName}`,
				parentAddress: event?.parent?.parentInfo?.address,
				dependentName: `${event?.dependent?.firstName ?? ''} ${event?.dependent?.lastName ?? ''}`,
				service: event?.skillSet?.name,
				isPaid: event.flagInvoice?.isPaid,
				invoiceId: event.flagInvoice?._id,
				minimumPayment: event.flagInvoice?.minimumPayment || 0,
				paidAmount: invoice.paidAmount || 0,
			});
		} else {
			const initItems = [{
				type: event?.type === EVALUATION ? intl.formatMessage(messages.evaluation) : event?.type === APPOINTMENT ? intl.formatMessage(messages.standardSession) : event?.type === SUBSIDY ? intl.formatMessage(messages.subsidizedSession) : '',
				date: `${moment(event?.date).format('MM/DD/YYYY hh:mm a')}`,
				details: `Location: ${event?.location}`,
				count: event?.type === SUBSIDY ? `[${appointments?.filter(a => a?.type === SUBSIDY && [PENDING, CLOSED].includes(a?.status) && a?.dependent?._id === event?.dependent?._id && a?.provider?._id === event?.provider?._id)?.length}/${event?.subsidy?.numberOfSessions}]` : '',
				discount: event?.type === SUBSIDY ? (event?.subsidy?.pricePerSession || 0) * -1 : undefined,
				rate: event?.rate,
			}]
			this.setState({
				items: initItems,
				invoiceNumber: new Date().getTime().toString(),
				invoiceDate: new Date().toLocaleDateString(),
				providerBillingAddress: event.provider?.billingAddress,
				providerPhonenumber: event?.provider?.contactNumber?.[0]?.phoneNumber,
				providerName: `${event?.provider?.firstName ?? ''} ${event?.provider?.lastName ?? ''}`,
				providerEmail: event?.provider?.contactEmail?.[0]?.email,
				parentName: `${event?.parent?.parentInfo?.fatherName ? event?.parent?.parentInfo?.fatherName : event?.parent?.parentInfo?.motherName} ${event?.parent?.parentInfo?.familyName}`,
				parentAddress: event?.parent?.parentInfo?.address,
				dependentName: `${event?.dependent?.firstName ?? ''} ${event?.dependent?.lastName ?? ''}`,
				service: event?.skillSet?.name,
			});
		}
	}

	handleAddItem = () => {
		this.setState({
			items: [
				...this.state.items,
				{
					type: '',
					date: '',
					details: '',
					rate: '',
					discount: '',
				}]
		});
	}

	onEditItem = (index) => {
		this.setState({ selectedItemIndex: index });
	}

	onCancelEdit = () => {
		let newItems = [...this.state.items];
		newItems[this.state.selectedItemIndex] = {
			type: '',
			locationDate: '',
			rate: '',
		}
		this.setState({ selectedItemIndex: -1, items: newItems });
	}

	onSaveItem = () => {
		this.setState({ selectedItemIndex: -1 });
	}

	onDeleteItem = (index) => {
		const newItems = [...this.state.items];
		newItems.splice(index, 1);
		this.setState({ items: newItems });
	}

	handleChangeItem = (type, value) => {
		const { items, selectedItemIndex } = this.state;
		const newItems = JSON.parse(JSON.stringify(items))?.map((a, i) => {
			if (i == selectedItemIndex) {
				a[type] = value;
				return a;
			} else {
				return a;
			}
		})

		this.setState({
			[type]: value,
			items: newItems,
		});
	}

	downloadInvoice = () => {
		const { items, providerBillingAddress, providerEmail, providerName, providerPhonenumber, dependentName, parentAddress, parentName, service, invoiceDate, invoiceNumber } = this.state;
		this.setState({ loadingDownload: true });

		request.post(downloadInvoice, { items, providerBillingAddress, providerEmail, providerName, providerPhonenumber, dependentName, parentAddress, parentName, service, invoiceDate, invoiceNumber }).then(res => {
			this.setState({ loadingDownload: false });
			const url = window.URL.createObjectURL(new Blob([new Uint8Array(res.data.data)]));
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", "invoice.pdf");
			document.body.appendChild(link);
			link.click();
		}).catch(err => {
			this.setState({ loadingDownload: false });
			message.error(err.message);
		})
	}

	sendEmailInvoice = () => {
		const { event } = this.props;
		const { items, providerBillingAddress, providerEmail, providerName, providerPhonenumber, dependentName, parentAddress, parentName, service, invoiceDate, invoiceNumber } = this.state;

		this.setState({ loadingEmail: true });
		request.post(sendEmailInvoice, { appointmentId: event?._id, items, providerBillingAddress, providerEmail, providerName, providerPhonenumber, dependentName, parentAddress, parentName, service, invoiceDate, invoiceNumber }).then(res => {
			this.setState({ loadingEmail: false });
			if (res.success) {
				message.success('This invoice has been sent successfully.');
			} else {
				message.error("Something went wrong. Please try again.");
			}
		}).catch(err => {
			this.setState({ loadingEmail: false });
			message.error(err.message);
		})
	}

	render() {
		const { event, user, invoice } = this.props;
		const { invoiceId, isPaid, items, minimumPayment, paidAmount, selectedItemIndex, loadingDownload, loadingEmail, invoiceNumber, invoiceDate, providerBillingAddress, providerEmail, providerName, providerPhonenumber, parentAddress, parentName, dependentName, service } = this.state;
		const subTotal = items?.reduce((a, b) => a += b?.rate * 1 || 0, 0) || 0;
		const discount = items?.reduce((a, b) => a += b?.discount * 1 || 0, 0) || 0;
		const totalPayment = subTotal + discount;

		const modalProps = {
			className: 'modal-invoice',
			title: (<div className='font-20'>{(invoice?.type === 1 || event?.sessionInvoice?.type === 1) ? 'Session Invoice' : (invoice?.type === 2 || event?.cancelInvoice?.type === 2) ? 'Reschedule Invoice' : (invoice?.type === 3 || event?.cancelInvoice?.type === 3) ? 'Cancel Invoice' : (invoice?.type === 4 || event?.flagInovice?.type === 4) ? 'No show Invoice' : (invoice?.type === 5 || event?.flagInvoice?.type === 5) ? 'Past due Invoice' : 'Invoice'}</div>),
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: this.props.onCancel,
			closable: false,
			width: 1100,
			footer: null,
		};

		return (
			<Modal {...modalProps}>
				<table className='w-100 table-fixed text-black' id="invoice">
					<tbody>
						<tr>
							<td colSpan={4}>
								<div className='w-100'>
									<img src="../images/logo.svg" alt="logo" width={120} height={120} />
								</div>
							</td>
							<td colSpan={10}></td>
							<td colSpan={10}>
								<div className='grid grid-columns-2'>
									<div className='border border-1 border-black -mb-1 -mr-1 text-center p-10 font-16'>Date</div>
									<div className='border border-1 border-black -mb-1 -mr-1 text-center p-10 font-16'>Invoice #</div>
									<div className='border border-1 border-black -mb-1 -mr-1 text-center p-10 font-16'>{invoiceDate}</div>
									<div className='border border-1 border-black -mb-1 -mr-1 text-center p-10 font-16'>{invoiceNumber}</div>
								</div>
							</td>
						</tr>
						<tr>
							<td colSpan={6}>
								<div className='w-100 text-black'>
									<div className='font-16'>{providerBillingAddress}</div>
								</div>
							</td>
							<td colSpan={18}></td>
						</tr>
						<tr>
							<td colSpan={24}>
								<div className='w-100 text-black06 font-16'>
									<div>{providerPhonenumber}</div>
									<div>{providerEmail}</div>
									<div>helpmegethelp.org</div>
								</div>
							</td>
						</tr>
						<tr><td><br /><br /><br /></td></tr>
						<tr>
							<td colSpan={12}>
								<div className='w-100'>
									<div className='border border-1 border-black -mb-1 -mr-1 p-10 font-16'>Bill To:</div>
									<div className='border border-1 border-black -mb-1 -mr-1 p-10 font-16'>
										<div>{parentName}</div>
										<div>C/O {dependentName}</div>
										<div>{parentAddress}</div>
									</div>
								</div>
							</td>
							<td colSpan={12}></td>
						</tr>
						<tr><td><br /><br /><br /></td></tr>
						<tr>
							<td colSpan={10}></td>
							<td colSpan={14}>
								<div className='grid grid-columns-2'>
									<div className='border border-1 border-black -mb-1 -mr-1 text-center font-16 p-10'>Service</div>
									<div className='border border-1 border-black -mb-1 -mr-1 text-center font-16 p-10'>Provider</div>
									<div className='border border-1 border-black -mb-1 -mr-1 text-center font-16 p-10'>{service}</div>
									<div className='border border-1 border-black -mb-1 -mr-1 text-center font-16 p-10'>{providerName}</div>
								</div>
							</td>
						</tr>
						<tr>
							<td>
								<div className='my-10'>
									{(user?.role > 3 && !isPaid) ? (
										<Button type='primary' className='font-16 add-item px-20' onClick={() => this.handleAddItem()}>Add item</Button>
									) : null}
								</div>
							</td>
						</tr>
						<tr>
							<td colSpan={24}>
								<div className='w-100'>
									<table className='w-100 table-fixed'>
										<thead>
											<tr className='border border-1 border-x-0 border-top-0 border-black -mb-1 -mr-1'>
												<th colSpan={4} className='text-left font-16 p-10'>Type</th>
												<th colSpan={5} className='text-left font-16 p-10'>Date</th>
												<th colSpan={7} className='text-left font-16 p-10'>Details</th>
												<th colSpan={2} className='text-left font-16 p-10'>Rate</th>
												<th colSpan={3} className='text-left font-16 p-10'>Discount</th>
												<th colSpan={3} className='font-16 p-10'>Amount</th>
											</tr>
										</thead>
										<tbody>
											{items.map((item, index) => (
												<Popover key={index} placement='right' content={(user?.role === 3 || isPaid) ? (<></>) : (
													<div className='flex flex-col gap-2'>
														{selectedItemIndex == index ? (
															<>
																<CheckCircleTwoTone twoToneColor='#00ee00' onClick={() => this.onSaveItem()} />
																<CloseCircleTwoTone twoToneColor='#ff0000' onClick={() => this.onCancelEdit()} />
															</>
														) : (
															<>
																<EditTwoTone onClick={() => this.onEditItem(index)} />
																<DeleteTwoTone twoToneColor='#ff0000' onClick={() => this.onDeleteItem(index)} />
															</>
														)}
													</div>
												)}>
													<tr key={index} className='border border-1 border-x-0 border-black -mb-1 -mr-1'>
														<td colSpan={4}>
															<Input name='Type' disabled={selectedItemIndex != index} value={item?.type} className="text-left item-input font-16 p-10" placeholder="Session type" onChange={(e) => this.handleChangeItem('type', e.target.value)} />
														</td>
														<td colSpan={5}>
															<Input name='Date' disabled={selectedItemIndex != index} value={item?.date} className="text-left item-input font-16 p-10" placeholder="Date" onChange={(e) => this.handleChangeItem('date', e.target.value)} />
														</td>
														<td colSpan={7}>
															<div className='flex justify-between items-center'>
																<Input name='Details' disabled={selectedItemIndex != index} value={item?.details} className="text-left item-input font-16 p-10" placeholder="Description" onChange={(e) => this.handleChangeItem('details', e.target.value)} />
																<div className='px-20 font-16'>{item?.count || ''}</div>
															</div>
														</td>
														<td colSpan={2}>
															<Input
																name='Rate'
																type='number'
																prefix="$"
																min={0}
																disabled={selectedItemIndex != index}
																value={item?.rate}
																className="text-center item-input font-16 p-10"
																placeholder={intl.formatMessage(msgCreateAccount.rate)}
																onChange={(e) => this.handleChangeItem('rate', e.target.value)}
																onKeyDown={(e) => {
																	(e.key === '-' || e.key === 'Subtract' || e.key === '.' || e.key === 'e') && e.preventDefault();
																	if (e.key > -1 && e.key < 10 && e.target.value === '0') {
																		e.target.value = '';
																	}
																}}
															/>
														</td>
														<td colSpan={3}>
															<Input
																name='Discount'
																type='number'
																prefix="$"
																disabled={selectedItemIndex != index}
																value={item?.discount}
																className="text-center item-input font-16 p-10"
																onChange={(e) => this.handleChangeItem('discount', e.target.value)}
																onKeyDown={(e) => {
																	(e.key === '.' || e.key === 'e' || (e.key === '-' && e.target.value != '')) && e.preventDefault();
																	if (e.key > -1 && e.key < 10 && e.target.value === '0') {
																		e.target.value = '';
																	}
																	if (e.key === '-' && e.target.value === '') {
																		e.target.value = '-';
																	}
																}}
															/>
														</td>
														<td colSpan={3}>
															<div className='text-center font-16'>${(item?.rate * 1 || 0) + (item?.discount * 1 || 0)}</div>
														</td>
													</tr>
												</Popover>
											))}
											<tr className='border border-1 border-x-0 border-bottom-0 border-black -mb-1 -mr-1'>
												<td colSpan={21} className=' text-left font-16 p-10'>Sub-Total</td>
												<td colSpan={3} className=' text-center font-16 p-10'>${subTotal}</td>
											</tr>
											<tr className='border border-1 border-x-0 border-top-0 border-black -mb-1 -mr-1'>
												<td colSpan={21} className=' text-left font-16 p-10'>Total Discount</td>
												<td colSpan={3} className=' text-center font-16 p-10'>${discount}</td>
											</tr>
											<tr className='border border-1 border-x-0 border-bottom-0 border-black -mb-1 -mr-1'>
												<td colSpan={21} className=' text-left font-16 p-10 text-bold'>Total</td>
												<td colSpan={3} className=' text-center font-16 p-10 text-bold'>${totalPayment}</td>
											</tr>
										</tbody>
									</table>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
				<table className='w-100 table-fixed'>
					<tbody>
						<tr>
							<td colSpan={4}>
								<InputNumber
									size='middle'
									prefix="$"
									min={0}
									disabled={user?.role === 3 || isPaid}
									addonBefore="Minimum due to unlock account:"
									className={`w-100 ${(invoice?.type === 5 || event?.flagInvoice?.type === 5) ? '' : 'd-none'}`}
									value={minimumPayment}
									onKeyDown={(e) => {
										(e.key === '-' || e.key === 'Subtract' || e.key === '.' || e.key === 'e') && e.preventDefault();
										if (e.key > -1 && e.key < 10 && e.target.value === '0') {
											e.target.value = '';
										}
									}}
									onChange={value => this.setState({ minimumPayment: value || 0 })}
								/>
							</td>
							<td colSpan={4}></td>
							{event?.status != 0 && (
								<td colSpan={4}>
									<InputNumber
										size='middle'
										prefix="$"
										min={0}
										disabled
										addonBefore="Paid Amount:"
										value={paidAmount}
										className='w-100'
									/>
								</td>
							)}
						</tr>
					</tbody>
				</table>
				<div className='flex justify-end gap-2 mt-10 actions'>
					<Button key="back" onClick={this.props.onCancel}>
						{intl.formatMessage(messages.cancel)}
					</Button>
					{event?.status != 0 ? (
						<>
							<Button key="print" onClick={() => window.print()}>
								<PrinterTwoTone />
								{intl.formatMessage(messages.print)}
							</Button>
							<Button key="download" icon={<DownloadOutlined />} loading={loadingDownload} onClick={this.downloadInvoice}>
								{intl.formatMessage(messages.download)}
							</Button>
							{user.role > 3 ? (
								<Button key="email" icon={<SendOutlined />} loading={loadingEmail} onClick={this.sendEmailInvoice}>
									{intl.formatMessage(msgCreateAccount.email)}
								</Button>
							) : null}
						</>
					) : null}
					<Button key="submit" type="primary" onClick={() => {
						if (user.role > 3 && !isPaid) {
							if (totalPayment < 0) {
								message.warn("Total amount is not valid.");
							} else {
								if (event?.status === PENDING) {
									this.props.onSubmit({ items, invoiceNumber, invoiceId, totalPayment, minimumPayment });
								} else if ([CLOSED, NOSHOW].includes(event?.status)) {
									this.props.onSubmit({ items, invoiceNumber, invoiceId, totalPayment, minimumPayment, isEdit: true });
								} else if (invoice) {
									this.props.onSubmit({ items, invoiceNumber, invoiceId, totalPayment, minimumPayment, isEdit: true });
								} else {
									this.props.onCancel();
								}
							}
						} else {
							this.props.onCancel();
						}
					}} style={{ padding: '0px 30px', height: 38 }}>
						{(event?.status === PENDING && user.role > 3) ? intl.formatMessage(messages.createInvoice) : (([CLOSED, NOSHOW].includes(event?.status) || invoice) && !isPaid && user.role > 3) ? intl.formatMessage(messages.editInvoice) : intl.formatMessage(messages.ok)}
					</Button>
				</div>
			</Modal >
		);
	}
};

const mapStateToProps = state => ({
	appointments: state.appointments.dataAppointments,
	user: state.auth.user,
});

export default compose(connect(mapStateToProps))(ModalInvoice);