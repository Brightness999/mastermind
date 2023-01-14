import React from 'react';
import { Modal, Button, Popover, Input, message } from 'antd';
import intl from 'react-intl-universal';
import messages from './messages';
import './style/index.less';
import '../../assets/styles/login.less';
import { CheckCircleTwoTone, CloseCircleTwoTone, DeleteTwoTone, DownloadOutlined, EditTwoTone, PrinterTwoTone } from '@ant-design/icons';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { downloadInvoice } from '../../utils/api/apiList';
import request from '../../utils/api/request';

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
		};
	}

	componentDidMount() {
		const { event } = this.props;
		if (event?.items?.length) {
			this.setState({ items: event.items, subTotal: event.items?.reduce((a, b) => a += b.rate * 1, 0) });
		} else {
			const initItems = [{
				type: event?.type == 2 ? intl.formatMessage(messages.evaluation) : event?.type == 3 ? intl.formatMessage(messages.standardSession) : event?.type == 4 ? intl.formatMessage(messages.subsidizedSession) : '',
				locationDate: `(${event?.location}) Session on ${new Date(event?.date).toLocaleDateString()}`,
				rate: event?.rate,
			}]
			this.setState({ items: initItems, subTotal: event?.rate });
		}
	}

	handleAddItem = () => {
		this.state.items.push({
			type: '',
			locationDate: '',
			rate: '',
		})
		this.setState({ items: this.state.items });
	}

	onEditItem = (index) => {
		this.setState({ selectedItemIndex: index });
	}

	onCancelEdit = () => {
		this.state.items[this.state.selectedItemIndex] = {
			type: '',
			locationDate: '',
			rate: '',
		}
		this.setState({ selectedItemIndex: -1, items: this.state.items });
	}

	onSaveItem = () => {
		this.setState({ selectedItemIndex: -1 });
	}

	onDeleteItem = (index) => {
		this.state.items.splice(index, 1);
		this.state.subTotal = this.state.items.reduce((a, b) => a = a * 1 + b.rate * 1, 0);
		this.setState({ items: this.state.items, subTotal: this.state.subTotal });
	}

	handleChangeItem = (type, value) => {
		this.state.items[this.state.selectedItemIndex][type] = value;
		if (type === 'rate') {
			this.state.subTotal = this.state.items.reduce((a, b) => a = a * 1 + b.rate * 1, 0);
		}
		this.setState({ [type]: value, items: this.state.items, subTotal: this.state.subTotal });
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

	render() {
		const { event, user } = this.props;
		const { items, selectedItemIndex, subTotal, loadingDownload } = this.state;

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
				<table className='w-100 table-fixed'>
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
										<div>{event?.parent?.parentInfo?.fatherName ? event?.parent?.parentInfo?.fatherName : event?.parent?.parentInfo?.motherName}</div>
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
								<div className='my-10'><Button type='primary' className={`font-16 add-item px-20 ${user.role > 3 ? '' : 'display-none'}`} onClick={() => this.handleAddItem()}>Add item</Button></div>
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
															<Input disabled={selectedItemIndex != index} value={item.type} className="text-center item-input font-16 p-10" placeholder="Session type" onChange={(e) => this.handleChangeItem('type', e.target.value)} />
														</td>
														<td colSpan={9} className='border border-1 border-black -mb-1 -mr-1'>
															<Input disabled={selectedItemIndex != index} value={item.locationDate} className="text-center item-input font-16 p-10" placeholder="date and location" onChange={(e) => this.handleChangeItem('locationDate', e.target.value)} />
														</td>
														<td colSpan={2} className='border border-1 border-black -mb-1 -mr-1'>
															<Input type='number' disabled={selectedItemIndex != index} value={item.rate} className="text-center item-input font-16 p-10" placeholder="Rate" onChange={(e) => this.handleChangeItem('rate', e.target.value)} />
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
					<Button key="print" onClick={() => {
						document.querySelector(".add-item").style.display = 'none';
						document.querySelector(".actions").style.display = 'none';
						window.print();
						document.querySelector(".actions").style.display = '';
						document.querySelector(".add-item").style.display = '';
					}}>
						<PrinterTwoTone />
						{intl.formatMessage(messages.print)}
					</Button>
					<Button key="download" icon={<DownloadOutlined />} loading={loadingDownload} onClick={() => this.downloadInvoice()}>
						{intl.formatMessage(messages.download)}
					</Button>
					<Button key="submit" type="primary" onClick={() => user.role > 3 ? this.props.onSubmit(items) : this.props.onCancel()} style={{ padding: '0px 30px', height: 38 }}>
						Ok
					</Button>
				</div>
			</Modal>
		);
	}
};

const mapStateToProps = state => {
	return ({ user: state.auth.user });
}

export default compose(connect(mapStateToProps))(ModalInvoice);