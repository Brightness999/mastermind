import React from 'react';
import { Modal, Button, Popover, Input, message } from 'antd';
import intl from 'react-intl-universal';
import messages from './messages';
import msgCreateAccount from '../../routes/Sign/CreateAccount/messages';
import './style/index.less';
import '../../assets/styles/login.less';
import { CheckCircleTwoTone, CloseCircleTwoTone, DeleteTwoTone, DownloadOutlined, EditTwoTone, PrinterTwoTone, SendOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { downloadInvoice, sendEmailInvoice } from '../../utils/api/apiList';
import request from '../../utils/api/request';
import { APPOINTMENT, CONSULTATION, EVALUATION } from '../../routes/constant';

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
		};
	}

	componentDidMount() {
		const { event } = this.props;
		if (event?.items?.length) {
			this.setState({ items: event.items, subTotal: event.items?.reduce((a, b) => a += b.rate * 1, 0) });
		} else {
			const initItems = [{
				type: event?.type === EVALUATION ? intl.formatMessage(messages.evaluation) : event?.type === APPOINTMENT ? intl.formatMessage(messages.standardSession) : event?.type === CONSULTATION ? intl.formatMessage(messages.subsidizedSession) : '',
				locationDate: `(${event?.location}) Session on ${new Date(event?.date).toLocaleDateString()}`,
				rate: event?.rate,
			}]
			this.setState({ items: initItems, subTotal: event?.rate });
		}
	}

	handleAddItem = () => {
		this.setState({
			items: [
				...this.state.items,
				{
					type: '',
					locationDate: '',
					rate: '',
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
		this.setState({ items: newItems, subTotal: newItems.reduce((a, b) => a = a * 1 + b.rate * 1, 0) });
	}

	handleChangeItem = (type, value) => {
		const { items, subTotal, selectedItemIndex } = this.state;
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
			subTotal: type === 'rate' ? newItems.reduce((a, b) => a = a * 1 + b.rate * 1, 0) : subTotal,
		});
	}

	downloadInvoice = () => {
		const { event } = this.props;
		const { items } = this.state;

		this.setState({ loadingDownload: true });

		request.post(downloadInvoice, { appointmentId: event?._id, items: items }).then(res => {
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
			console.log('download invoice error---', err);
		})
	}

	sendEmailInvoice = () => {
		const { event } = this.props;
		const { items } = this.state;

		this.setState({ loadingEmail: true });
		request.post(sendEmailInvoice, { appointmentId: event?._id, items: items }).then(res => {
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
		const { event, user } = this.props;
		const { items, selectedItemIndex, subTotal, loadingDownload, loadingEmail } = this.state;

		const modalProps = {
			className: 'modal-invoice',
			title: (<div className='font-20'>Invoice</div>),
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: this.props.onCancel,
			closable: false,
			width: 1000,
			footer: null,
		};

		return (
			<Modal {...modalProps}>
				<table className='w-100 table-fixed' id="invoice">
					<tbody>
						<tr>
							<td colSpan={2}>
								<div className='w-100'>
									<img src="../images/logo.svg" alt="logo" width={120} height={120} />
								</div>
							</td>
							<td colSpan={5}></td>
							<td colSpan={5}>
								<div className='grid grid-columns-2'>
									<div className='border border-1 border-black -mb-1 -mr-1 text-center p-10 font-16'>Date</div>
									<div className='border border-1 border-black -mb-1 -mr-1 text-center p-10 font-16'>Invoice #</div>
									<div className='border border-1 border-black -mb-1 -mr-1 text-center p-10 font-16'>{new Date().toLocaleDateString()}</div>
									<div className='border border-1 border-black -mb-1 -mr-1 text-center p-10 font-16'>{new Date().getTime().toString()}</div>
								</div>
							</td>
						</tr>
						<tr>
							<td colSpan={3}>
								<div className='w-100 text-black'>
									<div className='font-16'>{event?.provider?.billingAddress}</div>
								</div>
							</td>
							<td colSpan={9}></td>
						</tr>
						<tr>
							<td colSpan={12}>
								<div className='w-100 text-black06 font-16'>
									<div>{event?.provider?.contactNumber?.[0]?.phoneNumber}</div>
									<div>{event?.provider?.contactEmail?.[0]?.email}</div>
									<div>helpmegethelp.org</div>
								</div>
							</td>
						</tr>
						<tr><td><br /><br /><br /></td></tr>
						<tr>
							<td colSpan={6}>
								<div className='w-100'>
									<div className='border border-1 border-black -mb-1 -mr-1 p-10 font-16'>Bill To:</div>
									<div className='border border-1 border-black -mb-1 -mr-1 p-10 font-16'>
										<div>{event?.parent?.parentInfo?.fatherName ? event?.parent?.parentInfo?.fatherName : event?.parent?.parentInfo?.motherName} {event?.parent?.parentInfo?.familyName}</div>
										<div>C/O {`${event?.dependent?.firstName ?? ''} ${event?.dependent?.lastName ?? ''}`}</div>
										<div>{event?.parent?.parentInfo?.address}</div>
									</div>
								</div>
							</td>
							<td colSpan={6}></td>
						</tr>
						<tr><td><br /><br /><br /></td></tr>
						<tr>
							<td colSpan={5}></td>
							<td colSpan={7}>
								<div className='grid grid-columns-2'>
									<div className='border border-1 border-black -mb-1 -mr-1 text-center font-16 p-10'>Service</div>
									<div className='border border-1 border-black -mb-1 -mr-1 text-center font-16 p-10'>Provider</div>
									<div className='border border-1 border-black -mb-1 -mr-1 text-center font-16 p-10'>{event?.skillSet?.name}</div>
									<div className='border border-1 border-black -mb-1 -mr-1 text-center font-16 p-10'>{`${event?.provider?.firstName ?? ''} ${event?.provider?.lastName ?? ''}`}</div>
								</div>
							</td>
						</tr>
						<tr>
							<td>
								<div className='my-10'><Button type='primary' className={`font-16 add-item px-20 ${user.role > 3 ? '' : 'display-none events-none'}`} onClick={() => this.handleAddItem()}>Add item</Button></div>
							</td>
						</tr>
						<tr>
							<td colSpan={12}>
								<div className='w-100'>
									<table className='w-100 table-fixed'>
										<thead>
											<tr>
												<th colSpan={5} className='border border-1 border-black -mb-1 -mr-1 font-16 p-10'>Type</th>
												<th colSpan={9} className='border border-1 border-black -mb-1 -mr-1 font-16 p-10'>Session Date</th>
												<th colSpan={2} className='border border-1 border-black -mb-1 -mr-1 font-16 p-10'>Rate</th>
												<th colSpan={2} className='border border-1 border-black -mb-1 -mr-1 font-16 p-10'>Amount</th>
											</tr>
										</thead>
										<tbody>
											{items.map((item, index) => (
												<Popover key={index} placement='right' content={user?.role == 3 ? (<></>) : (
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
													<tr key={index}>
														<td colSpan={5} className='border border-1 border-black -mb-1 -mr-1'>
															<Input name='Type' disabled={selectedItemIndex != index} value={item.type} className="text-center item-input font-16 p-10" placeholder="Session type" onChange={(e) => this.handleChangeItem('type', e.target.value)} />
														</td>
														<td colSpan={9} className='border border-1 border-black -mb-1 -mr-1'>
															<Input name='LocationDate' disabled={selectedItemIndex != index} value={item.locationDate} className="text-center item-input font-16 p-10" placeholder="date and location" onChange={(e) => this.handleChangeItem('locationDate', e.target.value)} />
														</td>
														<td colSpan={2} className='border border-1 border-black -mb-1 -mr-1'>
															<Input
																name='Rate'
																type='number'
																min={0}
																disabled={selectedItemIndex != index}
																value={item.rate}
																className="text-center item-input font-16 p-10"
																placeholder={intl.formatMessage(msgCreateAccount.rate)}
																onChange={(e) => this.handleChangeItem('rate', e.target.value)}
																onKeyDown={(e) => {
																	(e.key === '-' || e.key === 'Subtract' || e.key === '.' || e.key === 'e') && e.preventDefault();
																	if (e.key > -1 && e.key < 10 && e.target.value === '0') {
																		e.preventDefault();
																		e.target.value = e.key;
																	}
																}}
															/>
														</td>
														<td colSpan={2} className='border border-1 border-black -mb-1 -mr-1'>
															<div className='text-center font-16'>{item.rate}</div>
														</td>
													</tr>
												</Popover>
											))}
											<tr>
												<td colSpan={16} rowSpan={5} className='border border-1 border-black -mb-1 -mr-1 vertical-top'>
													<div className='p-10 font-16'>
														<div className='text-right'>Subtotal</div>
														<div className='text-right'>Tax payments/Credits Amount Due</div>
													</div>
												</td>
											</tr>
											<tr><td colSpan={2} className='border border-1 border-black -mb-1 -mr-1 text-center font-16 p-10'>{subTotal}</td></tr>
											<tr><td colSpan={2} className='border border-1 border-black -mb-1 -mr-1 text-center font-16 p-10'>0.00</td></tr>
											<tr><td colSpan={2} className='border border-1 border-black -mb-1 -mr-1 text-center font-16 p-10'>{subTotal}</td></tr>
											<tr><td colSpan={2} className='border border-1 border-black -mb-1 -mr-1 text-center font-16 p-10'>{subTotal}</td></tr>
										</tbody>
									</table>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
				<div className='flex justify-end gap-2 mt-10 actions'>
					<Button key="back" onClick={this.props.onCancel}>
						{intl.formatMessage(messages.cancel)}
					</Button>
					{event?.status != 0 ? (
						<>
							<Button key="print" onClick={() => {
								document.querySelector(".add-item").style.display = 'none';
								document.querySelector(".actions").style.display = 'none';
								document.querySelector(".ant-modal-mask").style.backgroundColor = 'white';
								document.querySelector(".ant-modal-content").style.boxShadow = 'none';
								window.print();
								document.querySelector(".actions").style.display = '';
								document.querySelector(".add-item").style.display = '';
								document.querySelector(".ant-modal-mask").style.backgroundColor = '';
							}}>
								<PrinterTwoTone />
								{intl.formatMessage(messages.print)}
							</Button>
							<Button key="download" icon={<DownloadOutlined />} loading={loadingDownload} onClick={() => this.downloadInvoice()}>
								{intl.formatMessage(messages.download)}
							</Button>
							{user.role > 3 ? (
								<Button key="email" icon={<SendOutlined />} loading={loadingEmail} onClick={() => this.sendEmailInvoice()}>
									{intl.formatMessage(msgCreateAccount.email)}
								</Button>
							) : null}
						</>
					) : null}
					<Button key="submit" type="primary" onClick={() => user.role > 3 ? this.props.onSubmit(items) : this.props.onCancel()} style={{ padding: '0px 30px', height: 38 }}>
						{(event?.status === 0 && user.role > 3) ? intl.formatMessage(messages.createInvoice) : (event?.status === -1 && !event?.isPaid && user.role > 3) ? intl.formatMessage(messages.editInvoice) : intl.formatMessage(messages.ok)}
					</Button>
				</div>
			</Modal>
		);
	}
};

const mapStateToProps = state => ({ user: state.auth.user });

export default compose(connect(mapStateToProps))(ModalInvoice);