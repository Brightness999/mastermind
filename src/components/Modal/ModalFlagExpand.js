import React from 'react';
import { Modal, Button, Input, Tabs, Table, Space, Popconfirm, message } from 'antd';
import intl from 'react-intl-universal';
import messages from './messages';
import msgDrawer from '../DrawerDetail/messages';
import './style/index.less';
import '../../assets/styles/login.less';
import request from '../../utils/api/request'
import { clearFlag, payFlag, requestClearance, setFlag } from '../../utils/api/apiList';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { SearchOutlined } from '@ant-design/icons';
import ModalBalance from './ModalBalance';
import ModalNoShow from './ModalNoShow';
import moment from 'moment';
import { getAppointmentsMonthData, getAppointmentsData } from '../../redux/features/appointmentsSlice';
import { store } from '../../redux/store';
import ModalPayment from './ModalPayment';

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
			visiblePayment: false,
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

	handleRequestClearance = (appointment) => {
		request.post(requestClearance, { appointmentId: appointment?._id }).then(result => {
			const { success } = result;
			if (success) {
				message.success('Sent successfully');
			}
		})
	}

	handlePayFlag = (payment) => {
		request.post(payFlag, {...payment, appointmentId: this.state.event?._id}).then(result => {
			const { success } = result;
			if (success) {
				message.success('Paid successfully');
				this.setState({ visiblePayment: false });
			}
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
		if (appointment?.flagItems?.flagType == 1) {
			this.setState({ visibleBalance: true, event: appointment });
		}
		if (appointment?.flagItems?.flagType == 2) {
			this.setState({ visibleNoShow: true, event: appointment });
		}
	}

	onCloseModalNoShow = () => {
		this.setState({ visibleNoShow: false });
	};

	onSubmitFlagNoShow = (values) => {
		const { event } = this.state;
		const data = {
			_id: event?._id,
			flagItems: {
				...values,
				type: event?.type == 2 ? intl.formatMessage(messages.evaluation) : event?.type == 3 ? intl.formatMessage(messages.standardSession) : event?.type == 5 ? intl.formatMessage(messages.subsidizedSession) : '',
				locationDate: `(${event?.location}) Session on ${new Date(event?.date).toLocaleDateString()}`,
				rate: values?.penalty * 1 + values?.program * 1,
				flagType: 2,
			}
		}
		request.post(setFlag, data).then(result => {
			const { success } = result;
			if (success) {
				this.setState({ visibleNoShow: false, isFlag: true });
			}
		})
	}

	onCloseModalBalance = () => {
		this.setState({ visibleBalance: false });
	};

	onSubmitFlagBalance = (values) => {
		const { event } = this.state;
		const data = {
			_id: event?._id,
			flagItems: {
				...values,
				type: event?.type == 2 ? intl.formatMessage(messages.evaluation) : event?.type == 3 ? intl.formatMessage(messages.standardSession) : event?.type == 5 ? intl.formatMessage(messages.subsidizedSession) : '',
				locationDate: `(${event?.location}) Session on ${new Date(event?.date).toLocaleDateString()}`,
				rate: values?.late,
				flagType: 1,
			}
		}
		request.post(setFlag, data).then(result => {
			const { success } = result;
			if (success) {
				this.setState({ visibleBalance: false, isFlag: true });
			}
		})
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

	onOpenModalPayment = (appointment) => {
		this.setState({
			visiblePayment: true,
			event: appointment,
		})
	}

	onCloseModalPayment = () => {
		this.setState({ visiblePayment: false });
	}

	render() {
		const { activeFlags, clearedFlags, skillSet, visibleBalance, visibleNoShow, event, visiblePayment } = this.state;
		const { user } = this.props.auth;
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
				title: 'Skill', key: 'skillSet', filters: skillSet,
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
				render: (type) => type == 2 ? intl.formatMessage(messages.evaluation) : type == 3 ? intl.formatMessage(messages.standardSession) : type == 5 ? intl.formatMessage(messages.subsidizedSession) : '',
			},
			{ title: 'Session Date', dataIndex: 'date', key: 'date', type: 'datetime', sorter: (a, b) => a.date > b.date ? 1 : -1, render: (date) => moment(date).format('MM/DD/YYYY hh:mm a') },
		];

		if (user.role == 3) {
			columns.splice(1, 0, {
				title: 'Provider',
				key: 'provider',
				sorter: (a, b) => a.provider?.firstName + a.provider?.lastName > b.provider?.firstName + b.provider?.lastName ? 1 : -1,
				render: (appointment) => `${appointment?.provider.firstName ?? ''} ${appointment?.provider.lastName ?? ''}`,
			});
			columns.splice(5, 0, {
				title: 'Action', key: 'action', render: (appointment) => (
					<Space size="small">
						<Popconfirm
							title="Did you pay for this flag?"
							onConfirm={() => this.handleRequestClearance(appointment)}
							okText="Yes"
							cancelText="No"
							overlayClassName='clear-flag-confirm'
						>
							<a className='btn-blue action'>{intl.formatMessage(msgDrawer.requestClearance)}</a>
						</Popconfirm>
						<a className='btn-blue action' onClick={() => this.onOpenModalPayment(appointment)}>{intl.formatMessage(msgDrawer.payFlag)}</a>
					</Space>
				)
			});
		} else {
			columns.splice(4, 0, {
				title: 'Action', key: 'action', render: (appointment) => (
					<Popconfirm
						title="Are you sure to clear this flag?"
						onConfirm={() => this.handleClearFlag(appointment)}
						okText="Yes"
						cancelText="No"
						overlayClassName='clear-flag-confirm'
					>
						<a className='btn-blue action'>{intl.formatMessage(msgDrawer.clearFlag)}</a>
					</Popconfirm>
				)
			});
		}

		const modalNoShowProps = {
			visible: visibleNoShow,
			onSubmit: this.onSubmitFlagNoShow,
			onCancel: this.onCloseModalNoShow,
			event: event,
		};

		const modalBalanceProps = {
			visible: visibleBalance,
			onSubmit: this.onSubmitFlagBalance,
			onCancel: this.onCloseModalBalance,
			event: event,
		};

		const modalPaymentProps = {
			visible: visiblePayment,
			onSubmit: this.handlePayFlag,
			onCancel: this.onCloseModalPayment,
		};

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
									onClick: (e) => e.target.className == 'ant-table-cell ant-table-cell-row-hover' && this.openModalFlag(appointment),
									onDoubleClick: (e) => e.target.className == 'ant-table-cell ant-table-cell-row-hover' && this.openModalFlag(appointment),
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
									onClick: (e) => e.target.className == 'ant-table-cell ant-table-cell-row-hover' && this.openModalFlag(appointment),
									onDoubleClick: (e) => e.target.className == 'ant-table-cell ant-table-cell-row-hover' && this.openModalFlag(appointment),
								}
							}}
						/>
					</Tabs.TabPane>
				</Tabs>
				{visibleBalance && <ModalBalance {...modalBalanceProps} />}
				{visibleNoShow && <ModalNoShow {...modalNoShowProps} />}
				{visiblePayment && <ModalPayment {...modalPaymentProps} />}
			</Modal>
		);
	}
};

const mapStateToProps = state => {
	return ({
		auth: state.auth,
	})
}

export default compose(connect(mapStateToProps))(ModalFlagExpand);