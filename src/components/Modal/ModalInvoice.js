import React from 'react';
import { Modal, Button, Popover, Input } from 'antd';
import intl from 'react-intl-universal';
import messages from './messages';
import './style/index.less';
import '../../assets/styles/login.less';
import { CheckCircleTwoTone, CloseCircleTwoTone, DeleteTwoTone, EditTwoTone } from '@ant-design/icons';
import { connect } from 'react-redux';
import { compose } from 'redux';

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

	render() {
		const { event } = this.props;
		const { items, selectedItemIndex, subTotal } = this.state;

		const modalProps = {
			className: 'modal-invoice',
			title: (<div className='font-20'>Invoice</div>),
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: this.props.onCancel,
			closable: false,
			width: 1000,
			footer: [
				<Button key="back" onClick={this.props.onCancel}>
					{intl.formatMessage(messages.cancel)}
				</Button>,
				<Button key="submit" type="primary" onClick={() => this.props.onSubmit(items)} style={{ padding: '7.5px 30px' }}>
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
								<div className='my-10'><Button type='primary' className='font-16 px-20' onClick={() => this.handleAddItem()}>Add item</Button></div>
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
												<Popover key={index} placement='right' content={this.props.user?.role == 3 ? (<></>) : (
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
			</Modal>
		);
	}
};

const mapStateToProps = state => {
	return ({ user: state.auth.user });
}

export default compose(connect(mapStateToProps))(ModalInvoice);