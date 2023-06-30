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
import ModalPay from './ModalPay';
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
			visiblePay: false,
			returnUrl: '',
		}
		this.searchInput = React.createRef(null);
	}

	componentDidMount() {
		const { auth, invoices } = this.props;
		const { selectedTab } = this.state;
		this.setState({ tabFlags: invoices?.length ? JSON.parse(JSON.stringify(invoices))?.filter(i => [InvoiceType.NOSHOW, InvoiceType.BALANCE].includes(i.type) && i.isPaid == selectedTab)?.map(f => ({ ...f, key: f._id })) : [] });
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
		const { totalPayment, minimumPayment } = items;

		if (selectedFlag?._id) {
			let postData = {
				invoiceId: selectedFlag._id,
				totalPayment: totalPayment,
				minimumPayment: minimumPayment,
				updateData: [{
					appointment: selectedFlag.data?.[0]?.appointment?._id,
					items: {
						...selectedFlag.data?.[0]?.items,
						data: items.items,
					}
				}],
			}

			request.post(updateInvoice, postData).then(result => {
				if (result.success) {
					this.closeModalInvoice();
					message.success('Successfully updated!');
					const newInvoices = JSON.parse(JSON.stringify(invoices))?.map(invoice => {
						if (invoice?._id === selectedFlag._id) {
							invoice.totalPayment = totalPayment;
							invoice.minimumPayment = minimumPayment;
							invoice.data = [{
								appointment: selectedFlag.data?.[0]?.appointment,
								items: {
									...selectedFlag.data?.[0]?.items,
									data: items?.items,
								},
							}];
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

	openModalPay = (url) => {
		this.setState({ visiblePay: true, returnUrl: url });
	}

	closeModalPay = (url) => {
		this.setState({ visiblePay: false, returnUrl: '' });
	}

	render() {
		const { returnUrl, selectedFlag, tabFlags, visibleCreateNote, visibleInvoice, visiblePay } = this.state;
		const { auth } = this.props;
		const modalProps = {
			className: 'modal-flag-expand',
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
						<div className='text-primary cursor' onClick={() => this.onOpenModalCreateNote(invoice)}>{intl.formatMessage(msgDrawer.requestClearance)}</div>
						{invoice?.isPaid ? 'Paid' : invoice?.totalPayment == 0 ? null : (
							<div className='text-primary cursor' onClick={() => this.openModalPay(`${window.location.href}?s=${encryptParam('true')}&i=${encryptParam(invoice?._id)}`)}>
								{intl.formatMessage(msgDrawer.payFlag)}
							</div>
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
						<div className='text-primary cursor' onClick={() => this.onOpenModalCreateNote(invoice)}>{intl.formatMessage(msgDrawer.requestClearance)}</div>
						{invoice?.isPaid ? 'Paid' : invoice?.totalPayment == 0 ? null : (
							<button className='flag-action pay-flag-button' onClick={() => this.openModalPay(`${window.location.href}?s=${encryptParam('true')}&i=${encryptParam(invoice?._id)}`)}>
								{intl.formatMessage(msgDrawer.payFlag)}
							</button>
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

		const modalPayProps = {
			visible: visiblePay,
			onSubmit: this.closeModalPay,
			onCancel: this.closeModalPay,
			returnUrl,
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
				{visiblePay && <ModalPay {...modalPayProps} />}
			</Modal>
		);
	}
};

const mapStateToProps = state => ({
	auth: state.auth,
	invoices: state.appointments.dataInvoices,
})

export default compose(connect(mapStateToProps, { getInvoiceList, setInvoiceList }))(ModalFlagExpand);