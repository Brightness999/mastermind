import React from 'react';
import { Modal, Button, Input, Tabs, Table, Space, Popconfirm, message } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { SearchOutlined } from '@ant-design/icons';
import moment from 'moment';

import messages from './messages';
import msgDrawer from '../DrawerDetail/messages';
import request, { encryptParam } from '../../utils/api/request'
import { clearFlag, requestClearance, updateInvoice } from '../../utils/api/apiList';
import ModalInvoice from './ModalInvoice';
import { getInvoiceList, setInvoiceList } from '../../redux/features/appointmentsSlice';
import { InvoiceType } from '../../routes/constant';
import ModalCreateNote from './ModalCreateNote';
import './style/index.less';
import '../../assets/styles/login.less';

class ModalFlagExpand extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			visibleCreateNote: false,
			visibleInvoice: false,
			selectedFlag: {},
			tabFlags: [],
			selectedTab: 0,
		}
		this.searchInput = React.createRef(null);
	}

	componentDidMount() {
		const { auth, invoices } = this.props;
		const { selectedTab } = this.state;
		this.setState({ tabFlags: JSON.parse(JSON.stringify(invoices))?.filter(i => [InvoiceType.NOSHOW, InvoiceType.BALANCE].includes(i.type) && i.isPaid == selectedTab)?.map(f => ({ ...f, key: f._id })) });
		this.props.getInvoiceList({ role: auth.user.role });
	}

	componentDidUpdate(prevProps) {
		const { selectedTab } = this.state;
		const { invoices } = this.props;
		if (JSON.stringify(prevProps.invoices) != JSON.stringify(invoices)) {
			this.setState({ tabFlags: JSON.parse(JSON.stringify(invoices))?.filter(i => [InvoiceType.NOSHOW, InvoiceType.BALANCE].includes(i.type) && i.isPaid == selectedTab)?.map(f => ({ ...f, key: f._id })) });
		}
	}

	handleChangeTab = (value) => {
		const { invoices } = this.props;
		this.setState({
			tabFlags: JSON.parse(JSON.stringify(invoices)).filter(i => [InvoiceType.NOSHOW, InvoiceType.BALANCE].includes(i.type) && i.isPaid == value)?.map(f => ({ ...f, key: f._id })),
			selectedTab: value,
		})
	}

	handleRequestClearance = (requestMessage) => {
		const { selectedFlag } = this.state;
		this.onCloseModalCreateNote();
		message.success("Your request has been submitted. Please allow up to 24 hours for the provider to review this.");

		request.post(requestClearance, { invoiceId: selectedFlag?._id, message: requestMessage }).catch(err => {
			message.error(err.message);
		})
	}

	handleClearFlag = (invoice) => {
		const { invoices } = this.props;
		request.post(clearFlag, { invoiceId: invoice?._id }).then(result => {
			if (result.success) {
				const newInvoices = JSON.parse(JSON.stringify(invoices))?.map(a => {
					if (a._id === invoice?._id) {
						a.isPaid = true;
					}
					return a;
				})
				this.props.setInvoiceList(newInvoices);
			}
		})
	}

	onOpenModalCreateNote = (invoice) => {
		this.setState({ visibleCreateNote: true, selectedFlag: invoice });
	}

	onCloseModalCreateNote = () => {
		this.setState({ visibleCreateNote: false, selectedFlag: {} });
	}

	openModalInvoice = (invoice) => {
		this.setState({ visibleInvoice: true, selectedFlag: invoice });
	}

	closeModalInvoice = () => {
		this.setState({ visibleInvoice: false, selectedFlag: {} })
	}

	handleUpdateInvoice = (items) => {
		const { invoices } = this.props;
		const { selectedFlag } = this.state;
		const { totalPayment } = items;

		if (selectedFlag?._id) {
			let postData = {
				invoiceId: selectedFlag._id,
				totalPayment: totalPayment,
			}

			if (selectedFlag.type === InvoiceType.NOSHOW) {
				postData = {
					...postData,
					updateData: [{
						appointment: selectedFlag.data?.[0]?.appointment?._id,
						items: {
							...selectedFlag.data?.[0]?.items,
							data: items.items,
						}
					}]
				}
			}

			request.post(updateInvoice, postData).then(result => {
				if (result.success) {
					this.closeModalInvoice();
					message.success('Successfully updated!');
					const newInvoices = JSON.parse(JSON.stringify(invoices))?.map(invoice => {
						if (invoice?._id === selectedFlag._id) {
							if ([InvoiceType.BALANCE, InvoiceType.CANCEL, InvoiceType.RESCHEDULE].includes(selectedFlag.type)) {
								invoice.totalPayment = totalPayment;
								invoice.data = [{
									appointment: selectedFlag.data?.[0]?.appointment,
									items: items?.items,
								}];
							} else if (selectedFlag.type === InvoiceType.NOSHOW) {
								invoice.totalPayment = totalPayment;
								invoice.data = [{
									appointment: selectedFlag.data?.[0]?.appointment,
									items: {
										...selectedFlag.data?.[0]?.items,
										data: items?.items,
									},
								}];
							}
						}
						return invoice;
					});
					this.props.setInvoiceList(newInvoices);
				} else {
					message.success("Something went wrong. Please try again or contact admin");
				}
			}).catch(error => {
				message.success("Something went wrong. Please try again or contact admin");
			})
		}
	}

	render() {
		const { selectedFlag, tabFlags, visibleCreateNote, visibleInvoice } = this.state;
		const { auth } = this.props;
		const modalProps = {
			className: 'modal-referral-service',
			title: "Flags",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: (e) => e.target.className !== 'ant-modal-wrap' && this.props.onCancel(),
			width: 1000,
			footer: []
		};
		const columns = [
			{
				title: 'Flag Type', dataIndex: 'type', key: 'flagtype',
				filters: [
					{ text: 'No Show', value: InvoiceType.NOSHOW },
					{ text: 'Past Due Balance', value: InvoiceType.BALANCE },
				],
				onFilter: (value, record) => record.type == value,
				render: (type) => type === InvoiceType.NOSHOW ? 'No Show' : type === InvoiceType.BALANCE ? 'Past Due Balance' : '',
			},
			{
				title: 'Student', tabIndex: 'dependent', key: 'dependent',
				sorter: (a, b) => ((a.dependent?.firstName || '') + (a.dependent?.lastName || '')).toLowerCase() > ((b.dependent?.firstName || '') + (b.dependent?.lastName || '')).toLowerCase() ? 1 : -1,
				filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
					<div style={{ padding: 8 }}>
						<Input
							name='SearchName'
							ref={this.searchInput}
							placeholder={`Search Dependent Name`}
							value={selectedKeys[0]}
							onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
							onPressEnter={() => confirm()}
							style={{ marginBottom: 8, display: 'block' }}
						/>
						<Space>
							<Button
								type="primary"
								onClick={() => confirm()}
								icon={<SearchOutlined />}
								size="small"
								style={{ width: 90 }}
							>
								Search
							</Button>
							<Button
								onClick={() => { clearFilters(); confirm(); }}
								size="small"
								style={{ width: 90 }}
							>
								Reset
							</Button>
						</Space>
					</div>
				),
				filterIcon: (filtered) => (
					<SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
				),
				onFilter: (value, record) => record.dependent?.firstName?.toString()?.toLowerCase()?.includes((value).toLowerCase()) || record.dependent?.lastName?.toString()?.toLowerCase()?.includes((value).toLowerCase()),
				onFilterDropdownOpenChange: visible => {
					if (visible) {
						setTimeout(() => this.searchInput.current?.select(), 100);
					}
				},
				render: (invoice) => `${invoice?.dependent.firstName ?? ''} ${invoice?.dependent.lastName ?? ''}`,
			},
			{
				title: 'Amount', dataIndex: 'totalPayment', type: 'number', key: 'amount',
				sorter: (a, b) => a.totalPayment > b.totalPayment ? 1 : -1,
			},
			{
				title: 'Created Date', dataIndex: 'createdAt', key: 'createdAt', type: 'datetime',
				sorter: (a, b) => a.createdAt > b.createdAt ? 1 : -1,
				render: (date) => moment(date).format('MM/DD/YYYY hh:mm a'),
			},
			{
				title: 'Updated Date', dataIndex: 'updatedAt', key: 'updatedAt', type: 'datetime',
				sorter: (a, b) => a.updatedAt > b.updatedAt ? 1 : -1,
				render: (date) => moment(date).format('MM/DD/YYYY hh:mm a'),
			},
		];

		if (auth.user.role == 3) {
			columns.splice(2, 0, {
				title: 'Provider', dataIndex: 'provider', key: 'provider',
				sorter: (a, b) => ((a.provider?.firstName || '') + (a.provider?.lastName || '')).toLowerCase() > ((b.provider?.firstName || '') + (b.provider?.lastName || '')).toLowerCase() ? 1 : -1,
				filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
					<div style={{ padding: 8 }}>
						<Input
							name='SearchName'
							ref={this.searchInput}
							placeholder={`Search Dependent Name`}
							value={selectedKeys[0]}
							onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
							onPressEnter={() => confirm()}
							style={{ marginBottom: 8, display: 'block' }}
						/>
						<Space>
							<Button
								type="primary"
								onClick={() => confirm()}
								icon={<SearchOutlined />}
								size="small"
								style={{ width: 90 }}
							>
								Search
							</Button>
							<Button
								onClick={() => { clearFilters(); confirm(); }}
								size="small"
								style={{ width: 90 }}
							>
								Reset
							</Button>
						</Space>
					</div>
				),
				filterIcon: (filtered) => (
					<SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
				),
				onFilter: (value, record) => record.provider?.firstName?.toString()?.toLowerCase()?.includes((value).toLowerCase()) || record.provider?.lastName?.toString()?.toLowerCase()?.includes((value).toLowerCase()),
				onFilterDropdownOpenChange: visible => {
					if (visible) {
						setTimeout(() => this.searchInput.current?.select(), 100);
					}
				},
				render: (provider) => `${provider?.firstName ?? ''} ${provider?.lastName ?? ''}`,
			});
			columns.splice(6, 0, {
				title: 'Action', key: 'action', render: (invoice) => (
					<Space size="small">
						{(invoice?.totalPayment == 0) ? <a className='btn-blue action' onClick={() => this.onOpenModalCreateNote(invoice)}>{intl.formatMessage(msgDrawer.requestClearance)}</a> : null}
						{invoice?.isPaid ? 'Paid' : invoice?.totalPayment == 0 ? null : (
							<form aria-live="polite" data-ux="Form" action="https://www.paypal.com/cgi-bin/webscr" method="post">
								<input type="hidden" name="edit_selector" data-aid="EDIT_PANEL_EDIT_PAYMENT_ICON" />
								<input type="hidden" name="business" value="office@helpmegethelp.org" />
								<input type="hidden" name="cmd" value="_donations" />
								<input type="hidden" name="item_name" value="Help Me Get Help" />
								<input type="hidden" name="item_number" />
								<input type="hidden" name="amount" value={invoice?.totalPayment} data-aid="PAYMENT_HIDDEN_AMOUNT" />
								<input type="hidden" name="shipping" value="0.00" />
								<input type="hidden" name="currency_code" value="USD" data-aid="PAYMENT_HIDDEN_CURRENCY" />
								<input type="hidden" name="rm" value="0" />
								<input type="hidden" name="return" value={`${window.location.href}?s=${encryptParam('true')}&i=${encryptParam(invoice?._id)}`} />
								<input type="hidden" name="cancel_return" value={window.location.href} />
								<input type="hidden" name="cbt" value="Return to Help Me Get Help" />
								<button className='flag-action pay-flag-button'>
									{intl.formatMessage(msgDrawer.payFlag)}
								</button>
							</form>
						)}
					</Space>
				)
			});
		} else if (auth.user.role == 30) {
			columns.splice(5, 0, {
				title: 'Action', key: 'action', render: (invoice) => (
					<Popconfirm
						title="Are you sure to clear this flag?"
						onConfirm={() => this.handleClearFlag(invoice)}
						okText="Yes"
						cancelText="No"
					>
						<a className='btn-blue action'>{intl.formatMessage(msgDrawer.clearFlag)}</a>
					</Popconfirm>
				)
			});
		} else if (auth.user.role > 900) {
			columns.splice(2, 0, {
				title: 'Provider', dataIndex: 'provider', key: 'provider',
				sorter: (a, b) => ((a.provider?.firstName || '') + (a.provider?.lastName || '')).toLowerCase() > ((b.provider?.firstName || '') + (b.provider?.lastName || '')).toLowerCase() ? 1 : -1,
				filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
					<div style={{ padding: 8 }}>
						<Input
							name='SearchName'
							ref={this.searchInput}
							placeholder={`Search Dependent Name`}
							value={selectedKeys[0]}
							onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
							onPressEnter={() => confirm()}
							style={{ marginBottom: 8, display: 'block' }}
						/>
						<Space>
							<Button
								type="primary"
								onClick={() => confirm()}
								icon={<SearchOutlined />}
								size="small"
								style={{ width: 90 }}
							>
								Search
							</Button>
							<Button
								onClick={() => { clearFilters(); confirm(); }}
								size="small"
								style={{ width: 90 }}
							>
								Reset
							</Button>
						</Space>
					</div>
				),
				filterIcon: (filtered) => (
					<SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
				),
				onFilter: (value, record) => record.provider?.firstName?.toString()?.toLowerCase()?.includes((value).toLowerCase()) || record.provider?.lastName?.toString()?.toLowerCase()?.includes((value).toLowerCase()),
				onFilterDropdownOpenChange: visible => {
					if (visible) {
						setTimeout(() => this.searchInput.current?.select(), 100);
					}
				},
				render: (provider) => `${provider?.firstName ?? ''} ${provider?.lastName ?? ''}`,
			});
			columns.splice(6, 0, {
				title: 'Action', key: 'action', render: (invoice) => (
					<Space size="small">
						{(invoice?.totalPayment == 0) ? <a className='btn-blue action' onClick={() => this.onOpenModalCreateNote(invoice)}>{intl.formatMessage(msgDrawer.requestClearance)}</a> : null}
						{invoice?.isPaid ? 'Paid' : invoice?.totalPayment == 0 ? null : (
							<form aria-live="polite" data-ux="Form" action="https://www.paypal.com/cgi-bin/webscr" method="post">
								<input type="hidden" name="edit_selector" data-aid="EDIT_PANEL_EDIT_PAYMENT_ICON" />
								<input type="hidden" name="business" value="office@helpmegethelp.org" />
								<input type="hidden" name="cmd" value="_donations" />
								<input type="hidden" name="item_name" value="Help Me Get Help" />
								<input type="hidden" name="item_number" />
								<input type="hidden" name="amount" value={invoice?.totalPayment} data-aid="PAYMENT_HIDDEN_AMOUNT" />
								<input type="hidden" name="shipping" value="0.00" />
								<input type="hidden" name="currency_code" value="USD" data-aid="PAYMENT_HIDDEN_CURRENCY" />
								<input type="hidden" name="rm" value="0" />
								<input type="hidden" name="return" value={`${window.location.href}?s=${encryptParam('true')}&i=${encryptParam(invoice?._id)}`} />
								<input type="hidden" name="cancel_return" value={window.location.href} />
								<input type="hidden" name="cbt" value="Return to Help Me Get Help" />
								<button className='flag-action pay-flag-button'>
									{intl.formatMessage(msgDrawer.payFlag)}
								</button>
							</form>
						)}
						<Popconfirm
							title="Are you sure to clear this flag?"
							onConfirm={() => this.handleClearFlag(invoice)}
							okText="Yes"
							cancelText="No"
						>
							<span className='text-primary cursor'>{intl.formatMessage(msgDrawer.clearFlag)}</span>
						</Popconfirm>
					</Space>
				)
			});
		}

		const modalCreateNoteProps = {
			visible: visibleCreateNote,
			onSubmit: this.handleRequestClearance,
			onCancel: this.onCloseModalCreateNote,
			title: "Request Message"
		};

		const modalInvoiceProps = {
			visible: visibleInvoice,
			onSubmit: this.handleUpdateInvoice,
			onCancel: this.closeModalInvoice,
			invoice: selectedFlag,
		}

		return (
			<Modal {...modalProps}>
				<Tabs defaultActiveKey="0" type="card" size='small' onChange={this.handleChangeTab}>
					<Tabs.TabPane tab={intl.formatMessage(messages.active)} key="0">
						<Table
							bordered
							size='middle'
							dataSource={tabFlags}
							columns={columns}
							className="p-10"
							onRow={(invoice) => {
								return {
									onClick: (e) => e.target.className == 'ant-table-cell ant-table-cell-row-hover' && this.openModalInvoice(invoice),
									onDoubleClick: (e) => e.target.className == 'ant-table-cell ant-table-cell-row-hover' && this.openModalInvoice(invoice),
								}
							}}
						/>
					</Tabs.TabPane>
					<Tabs.TabPane tab={intl.formatMessage(messages.cleared)} key="1">
						<Table
							bordered
							size='middle'
							dataSource={tabFlags}
							columns={columns.slice(0, -1)}
							className="p-10"
							onRow={(invoice) => {
								return {
									onClick: () => this.openModalInvoice(invoice),
									onDoubleClick: () => this.openModalInvoice(invoice),
								}
							}}
						/>
					</Tabs.TabPane>
				</Tabs>
				{visibleCreateNote && <ModalCreateNote {...modalCreateNoteProps} />}
				{visibleInvoice && <ModalInvoice {...modalInvoiceProps} />}
			</Modal>
		);
	}
};

const mapStateToProps = state => ({
	auth: state.auth,
	invoices: state.appointments.dataInvoices,
})

export default compose(connect(mapStateToProps, { getInvoiceList, setInvoiceList }))(ModalFlagExpand);