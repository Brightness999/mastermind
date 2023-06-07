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
import { getInvoiceList } from '../../redux/features/appointmentsSlice';
import { InvoiceType } from '../../routes/constant';
import ModalCreateNote from './ModalCreateNote';
import './style/index.less';
import '../../assets/styles/login.less';

class ModalFlagExpand extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeFlags: [],
			clearedFlags: [],
			skillSet: [],
			event: {},
			visibleCreateNote: false,
			visibleInvoice: false,
			selectedFlag: {},
		}
		this.searchInput = React.createRef(null);
	}

	componentDidMount() {
		const flags = JSON.parse(JSON.stringify(this.props.flags));
		const skillSet = JSON.parse(JSON.stringify(this.props.auth.skillSet));
		this.setState({
			activeFlags: flags?.filter(f => !f.isPaid)?.map(f => ({ ...f, key: f._id })),
			clearedFlags: flags?.filter(f => f.isPaid)?.map(f => ({ ...f, key: f._id })),
			skillSet: skillSet?.map(skill => { skill['text'] = skill.name, skill['value'] = skill._id; return skill; })
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
		request.post(clearFlag, { invoiceId: invoice?._id }).then(result => {
			const { success } = result;
			if (success) {
				const { activeFlags, clearedFlags } = this.state;
				message.success('Cleared successfully');
				clearedFlags.push(invoice);
				const newActiveFlags = activeFlags.filter(a => a._id != invoice?._id);
				this.setState({
					clearedFlags: clearedFlags,
					activeFlags: newActiveFlags,
				})
				this.props.getInvoiceList();
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
		const { selectedFlag } = this.state;

		if (selectedFlag?._id) {
			let postData = {
				invoiceId: selectedInvoice._id,
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
					this.props.getInvoiceList();
					message.success("Successfully updated.");
				} else {
					message.success("Something went wrong. Please try again or contact admin");
				}
			}).catch(error => {
				message.success("Something went wrong. Please try again or contact admin");
			})
		}
	}

	render() {
		const { activeFlags, clearedFlags, selectedFlag, visibleCreateNote, visibleInvoice } = this.state;
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
						{(invoice?.isPaid || invoice?.totalPayment == 0) ? <a className='btn-blue action' onClick={() => this.onOpenModalCreateNote(invoice)}>{intl.formatMessage(msgDrawer.requestClearance)}</a> : null}
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
						{(invoice?.isPaid || invoice?.totalPayment == 0) ? <a className='btn-blue action' onClick={() => this.onOpenModalCreateNote(invoice)}>{intl.formatMessage(msgDrawer.requestClearance)}</a> : null}
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
				<Tabs defaultActiveKey="1" type="card" size='small'>
					<Tabs.TabPane tab={intl.formatMessage(messages.active)} key="1">
						<Table
							bordered
							size='middle'
							dataSource={activeFlags}
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
					<Tabs.TabPane tab={intl.formatMessage(messages.cleared)} key="2">
						<Table
							bordered
							size='middle'
							dataSource={clearedFlags}
							columns={columns.slice(0, -1)}
							className="p-10"
							onRow={(invoice) => {
								return {
									onClick: (e) => e.target.className == 'ant-table-cell ant-table-cell-row-hover' && this.openModalInvoice(invoice),
									onDoubleClick: (e) => e.target.className == 'ant-table-cell ant-table-cell-row-hover' && this.openModalInvoice(invoice),
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
})

export default compose(connect(mapStateToProps, { getInvoiceList }))(ModalFlagExpand);