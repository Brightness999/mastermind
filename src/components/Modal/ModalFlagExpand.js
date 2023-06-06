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
import { clearFlag, requestClearance, setFlag, setFlagBalance, updateInvoice, updateNoshowFlag } from '../../utils/api/apiList';
import ModalBalance from './ModalBalance';
import ModalNoShow from './ModalNoShow';
import ModalInvoice from './ModalInvoice';
import { getAppointmentsMonthData, getAppointmentsData } from '../../redux/features/appointmentsSlice';
import { ACTIVE, APPOINTMENT, BALANCE, EVALUATION, NOSHOW, SUBSIDY } from '../../routes/constant';
import { store } from '../../redux/store';
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
			visibleBalance: false,
			visibleNoShow: false,
			visibleCreateNote: false,
			visibleInvoice: false,
		}
		this.searchInput = React.createRef(null);
	}

	componentDidMount() {
		const flags = JSON.parse(JSON.stringify(this.props.flags));
		const skillSet = JSON.parse(JSON.stringify(this.props.auth.skillSet));
		this.setState({
			activeFlags: flags?.filter(f => f.flagStatus == 1)?.map(f => { f['key'] = f._id; return f; }),
			clearedFlags: flags?.filter(f => f.flagStatus == 2)?.map(f => { f['key'] = f._id; return f; }),
			skillSet: skillSet?.map(skill => { skill['text'] = skill.name, skill['value'] = skill._id; return skill; })
		})
	}

	handleRequestClearance = (requestMessage) => {
		this.onCloseModalCreateNote();
		message.success("Your request has been submitted. Please allow up to 24 hours for the provider to review this.");

		request.post(requestClearance, { appointmentId: this.state.event?._id, message: requestMessage }).catch(err => {
			message.error(err.message);
		})
	}

	handleClearFlag = (appointment) => {
		request.post(clearFlag, { _id: appointment?._id }).then(result => {
			const { success } = result;
			if (success) {
				const { activeFlags, clearedFlags } = this.state;
				message.success('Cleared successfully');
				clearedFlags.push(appointment);
				const newActiveFlags = activeFlags.filter(a => a._id != appointment?._id);
				this.setState({
					clearedFlags: clearedFlags,
					activeFlags: newActiveFlags,
				})
				this.updateAppointments();
			}
		})
	}

	openModalFlag = (appointment) => {
		if (appointment?.flagType === BALANCE) {
			this.setState({ visibleBalance: true, event: appointment });
		}
		if (appointment?.flagType === NOSHOW) {
			this.setState({ visibleNoShow: true, event: appointment });
		}
	}

	onCloseModalNoShow = () => {
		this.setState({ visibleNoShow: false });
	};

	onSubmitFlagNoShow = (values) => {
		const { event } = this.state;
		const { penalty, program, notes, invoiceId, balance, feeOption } = values;
		const data = {
			_id: event?._id,
			dependent: event?.dependent?._id,
			provider: event?.provider?._id,
			status: NOSHOW,
			flagStatus: ACTIVE,
			flagType: NOSHOW,
			flagItems: {
				notes,
				penalty: penalty * 1,
				program: program * 1,
				data: [{
					type: 'Fee',
					date: moment(event?.date).format("MM/DD/YYYY hh:mm a"),
					details: "Missed Appointment",
					rate: feeOption === 1 ? balance : feeOption === 2 ? penalty * 1 + program * 1 : 0,
				}],
				flagType: NOSHOW,
				feeOption,
				balance,
			},
			totalPayment: feeOption === 1 ? balance : feeOption === 2 ? penalty * 1 + program * 1 : 0,
			invoiceId,
		}

		request.post(invoiceId ? updateNoshowFlag : setFlag, data).then(result => {
			const { success } = result;
			if (success) {
				this.setState({ visibleNoShow: false, isFlag: true });
			}
		})
	}

	onCloseModalBalance = () => {
		this.setState({ visibleBalance: false, event: {} });
	};

	onSubmitFlagBalance = (values) => {
		const { notes } = values;
		const { appointments } = this.props;
		const { event } = this.state;
		const providerIds = Object.keys(values).filter(a => a.includes('invoiceId')).map(a => a.split("-")[1]);
		let bulkData = [];
		providerIds.forEach(providerId => {
			let temp = [];
			Object.entries(values)?.forEach(value => {
				if (value?.length) {
					const appointment = appointments?.find(a => a._id === value[0]);
					if (appointment && appointment?.provider?._id === providerId) {
						temp.push({
							appointment: appointment._id,
							items: {
								flagType: BALANCE,
								late: value[1] * 1,
								balance: values[`balance-${appointment._id}`],
								totalPayment: values[`totalPayment-${appointment.provider?._id}`],
								minimumPayment: values[`minimumPayment-${appointment.provider?._id}`] * 1,
								data: [
									{
										type: appointment?.type === EVALUATION ? intl.formatMessage(messages.evaluation) : appointment?.type === APPOINTMENT ? intl.formatMessage(messages.standardSession) : appointment?.type === SUBSIDY ? intl.formatMessage(messages.subsidizedSession) : '',
										date: moment(appointment?.date).format("MM/DD/YYYY hh:mm a"),
										details: `Location: ${appointment?.location}`,
										count: appointment.type === SUBSIDY ? `[${appointments?.filter(a => a?.type === SUBSIDY && [PENDING, CLOSED].includes(a?.status) && a?.dependent?._id === appointment?.dependent?._id && a?.provider?._id === appointment?.provider?._id)?.length}/${appointment?.subsidy?.numberOfSessions}]` : '',
										discount: values[`discount-${appointment._id}`],
										rate: values[`balance-${appointment._id}`],
									},
									{
										type: 'Fee',
										date: moment(appointment?.date).format("MM/DD/YYYY hh:mm a"),
										details: 'Past Due Balance Fee',
										rate: value[1] * 1,
									},
								],
								notes,
							}
						})
					}
				}
			})
			bulkData.push({
				providerId,
				invoiceId: values[`invoiceId-${providerId}`],
				totalPayment: values[`totalPayment-${providerId}`],
				minimumPayment: values[`minimumPayment-${providerId}`],
				data: temp,
			})
		})

		request.post(setFlagBalance, { bulkData, dependent: event?.dependent?._id }).then(result => {
			const { success } = result;
			if (success) {
				this.onCloseModalBalance();
				this.updateAppointments();
			}
		}).catch(err => message.error(err.message));
	}

	updateAppointments() {
		const { role } = this.props.auth.user;
		store.dispatch(getAppointmentsData({ role: role }));
		const month = this.props.calendar.current?._calendarApi.getDate().getMonth() + 1;
		const year = this.props.calendar.current?._calendarApi.getDate().getFullYear();
		const dataFetchAppointMonth = {
			role: role,
			data: {
				month: month,
				year: year
			}
		};
		store.dispatch(getAppointmentsMonthData(dataFetchAppointMonth));
	}

	onOpenModalCreateNote = (appointment) => {
		this.setState({ visibleCreateNote: true, event: appointment });
	}

	onCloseModalCreateNote = () => {
		this.setState({ visibleCreateNote: false, event: {} });
	}

	openModalInvoice = (appointment) => {
		this.setState({ visibleInvoice: true, event: appointment });
	}

	closeModalInvoice = () => {
		this.setState({ visibleInvoice: false, event: {} })
	}

	handleUpdateInvoice = (items) => {
		const { event } = this.state;

		if (event?._id) {
			let postData = {
				invoiceId: items?.invoiceId,
				totalPayment: items?.totalPayment,
				minimumPayment: items?.minimumPayment,
				updateData: [{
					appointment: event._id,
					items: {
						...event.flagInvoice.data?.[0]?.items,
						data: items.items,
					},
				}],
			}

			request.post(updateInvoice, postData).then(result => {
				if (result.success) {
					this.closeModalInvoice();
					this.updateAppointments();
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
		const { activeFlags, clearedFlags, skillSet, visibleBalance, visibleNoShow, event, visibleCreateNote, visibleInvoice } = this.state;
		const { auth, appointments } = this.props;
		const dependent = { ...event?.dependent, appointments: appointments?.filter(a => a.dependent?._id === event?.dependent?._id) };
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
				title: 'Dependent', key: 'dependent',
				sorter: (a, b) => a.dependent?.firstName + a.dependent?.lastName > b.dependent?.firstName + b.dependent?.lastName ? 1 : -1,
				render: (appointment) => `${appointment?.dependent.firstName ?? ''} ${appointment?.dependent.lastName ?? ''}`,
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
								onClick={() => clearFilters()}
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
			},
			{
				title: 'Service', key: 'skillSet', filters: skillSet,
				onFilter: (value, record) => record.skillSet?._id == value,
				render: (record) => record.skillSet?.name,
			},
			{
				title: 'Session Type', dataIndex: 'type', key: 'sessionType',
				filters: [
					{ text: 'Evaluation', value: 2 },
					{ text: 'Standard Session', value: 3 },
					{ text: 'Subsidized Session', value: 5 },
				],
				onFilter: (value, record) => record.type == value,
				render: (type) => type === EVALUATION ? intl.formatMessage(messages.evaluation) : type === APPOINTMENT ? intl.formatMessage(messages.standardSession) : type === SUBSIDY ? intl.formatMessage(messages.subsidizedSession) : '',
			},
			{ title: 'Session Date', dataIndex: 'date', key: 'date', type: 'datetime', sorter: (a, b) => a.date > b.date ? 1 : -1, render: (date) => moment(date).format('MM/DD/YYYY hh:mm A') },
		];

		if (auth.user.role == 3) {
			columns.splice(1, 0, {
				title: 'Provider',
				key: 'provider',
				sorter: (a, b) => a.provider?.firstName + a.provider?.lastName > b.provider?.firstName + b.provider?.lastName ? 1 : -1,
				render: (appointment) => `${appointment?.provider.firstName ?? ''} ${appointment?.provider.lastName ?? ''}`,
			});
			columns.splice(5, 0, {
				title: 'Action', key: 'action', render: (appointment) => (
					<Space size="small">
						{(appointment?.flagInvoice?.isPaid || appointment?.flagInvoice?.totalPayment == 0) ? <a className='btn-blue action' onClick={() => this.onOpenModalCreateNote(appointment)}>{intl.formatMessage(msgDrawer.requestClearance)}</a> : null}
						{appointment?.flagInvoice?.isPaid ? 'Paid' : appointment?.flagInvoice?.totalPayment == 0 ? null : (
							<form aria-live="polite" data-ux="Form" action="https://www.paypal.com/cgi-bin/webscr" method="post">
								<input type="hidden" name="edit_selector" data-aid="EDIT_PANEL_EDIT_PAYMENT_ICON" />
								<input type="hidden" name="business" value="office@helpmegethelp.org" />
								<input type="hidden" name="cmd" value="_donations" />
								<input type="hidden" name="item_name" value="Help Me Get Help" />
								<input type="hidden" name="item_number" />
								<input type="hidden" name="amount" value={appointment?.flagInvoice?.totalPayment} data-aid="PAYMENT_HIDDEN_AMOUNT" />
								<input type="hidden" name="shipping" value="0.00" />
								<input type="hidden" name="currency_code" value="USD" data-aid="PAYMENT_HIDDEN_CURRENCY" />
								<input type="hidden" name="rm" value="0" />
								<input type="hidden" name="return" value={`${window.location.href}?s=${encryptParam('true')}&i=${encryptParam(appointment?.flagInvoice?._id)}`} />
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
			columns.splice(4, 0, {
				title: 'Action', key: 'action', render: (appointment) => (
					<Popconfirm
						title="Are you sure to clear this flag?"
						onConfirm={() => this.handleClearFlag(appointment)}
						okText="Yes"
						cancelText="No"
					>
						<a className='btn-blue action'>{intl.formatMessage(msgDrawer.clearFlag)}</a>
					</Popconfirm>
				)
			});
		} else if (auth.user.role > 900) {
			columns.splice(1, 0, {
				title: 'Provider',
				key: 'provider',
				sorter: (a, b) => a.provider?.firstName + a.provider?.lastName > b.provider?.firstName + b.provider?.lastName ? 1 : -1,
				render: (appointment) => `${appointment?.provider.firstName ?? ''} ${appointment?.provider.lastName ?? ''}`,
			});
			columns.splice(5, 0, {
				title: 'Action', key: 'action', render: (appointment) => (
					<Space size="small">
						{(appointment?.flagInvoice?.isPaid || appointment?.flagInvoice?.totalPayment == 0) ? <a className='btn-blue action' onClick={() => this.onOpenModalCreateNote(appointment)}>{intl.formatMessage(msgDrawer.requestClearance)}</a> : null}
						{appointment?.flagInvoice?.isPaid ? 'Paid' : appointment?.flagInvoice?.totalPayment == 0 ? null : (
							<form aria-live="polite" data-ux="Form" action="https://www.paypal.com/cgi-bin/webscr" method="post">
								<input type="hidden" name="edit_selector" data-aid="EDIT_PANEL_EDIT_PAYMENT_ICON" />
								<input type="hidden" name="business" value="office@helpmegethelp.org" />
								<input type="hidden" name="cmd" value="_donations" />
								<input type="hidden" name="item_name" value="Help Me Get Help" />
								<input type="hidden" name="item_number" />
								<input type="hidden" name="amount" value={appointment?.flagInvoice?.totalPayment} data-aid="PAYMENT_HIDDEN_AMOUNT" />
								<input type="hidden" name="shipping" value="0.00" />
								<input type="hidden" name="currency_code" value="USD" data-aid="PAYMENT_HIDDEN_CURRENCY" />
								<input type="hidden" name="rm" value="0" />
								<input type="hidden" name="return" value={`${window.location.href}?s=${encryptParam('true')}&i=${encryptParam(appointment?.flagInvoice?._id)}`} />
								<input type="hidden" name="cancel_return" value={window.location.href} />
								<input type="hidden" name="cbt" value="Return to Help Me Get Help" />
								<button className='flag-action pay-flag-button'>
									{intl.formatMessage(msgDrawer.payFlag)}
								</button>
							</form>
						)}
						<Popconfirm
							title="Are you sure to clear this flag?"
							onConfirm={() => this.handleClearFlag(appointment)}
							okText="Yes"
							cancelText="No"
						>
							<a className='btn-blue action'>{intl.formatMessage(msgDrawer.clearFlag)}</a>
						</Popconfirm>
					</Space>
				)
			});
		}

		const modalNoShowProps = {
			visible: visibleNoShow,
			onSubmit: this.onSubmitFlagNoShow,
			onCancel: this.onCloseModalNoShow,
			event,
		};

		const modalBalanceProps = {
			visible: visibleBalance,
			onSubmit: this.onSubmitFlagBalance,
			onCancel: this.onCloseModalBalance,
			event,
			dependent,
		};

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
			event,
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
							onRow={(appointment) => {
								return {
									onClick: (e) => e.target.className == 'ant-table-cell ant-table-cell-row-hover' && this.openModalInvoice(appointment),
									onDoubleClick: (e) => e.target.className == 'ant-table-cell ant-table-cell-row-hover' && this.openModalInvoice(appointment),
									// onClick: (e) => e.target.className == 'ant-table-cell ant-table-cell-row-hover' && this.openModalFlag(appointment),
									// onDoubleClick: (e) => e.target.className == 'ant-table-cell ant-table-cell-row-hover' && this.openModalFlag(appointment),
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
							onRow={(appointment) => {
								return {
									onClick: (e) => e.target.className == 'ant-table-cell ant-table-cell-row-hover' && this.openModalInvoice(appointment),
									onDoubleClick: (e) => e.target.className == 'ant-table-cell ant-table-cell-row-hover' && this.openModalInvoice(appointment),
								}
							}}
						/>
					</Tabs.TabPane>
				</Tabs>
				{visibleBalance && <ModalBalance {...modalBalanceProps} />}
				{visibleNoShow && <ModalNoShow {...modalNoShowProps} />}
				{visibleCreateNote && <ModalCreateNote {...modalCreateNoteProps} />}
				{visibleInvoice && <ModalInvoice {...modalInvoiceProps} />}
			</Modal>
		);
	}
};

const mapStateToProps = state => {
	return ({
		auth: state.auth,
		appointments: state.appointments.dataAppointments,
	})
}

export default compose(connect(mapStateToProps))(ModalFlagExpand);