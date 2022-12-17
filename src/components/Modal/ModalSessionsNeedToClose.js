import React from 'react';
import { Modal, Button, Input, Table, Space } from 'antd';
import intl from 'react-intl-universal';
import messages from './messages';
import './style/index.less';
import '../../assets/styles/login.less';
import request from '../../utils/api/request'
import { closeAppointmentForProvider, declineAppointmentForProvider } from '../../utils/api/apiList';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import { getAppointmentsMonthData, getAppointmentsData } from '../../redux/features/appointmentsSlice';
import { store } from '../../redux/store';
import ModalProcessAppointment from './ModalProcessAppointment';
import ModalInvoice from './ModalInvoice';

class ModalSessionsNeedToClose extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			skillSet: [],
			visibleProcess: false,
			visibleInvoice: false,
			event: {},
			errorMessage: '',
			appointments: [],
		}
		this.searchInput = React.createRef(null);
	}

	componentDidMount() {
		const appointments = JSON.parse(JSON.stringify(this.props.appointments?.filter(appointment => appointment.type == 3 && appointment.status == 0 && moment(appointment.date).isBefore(moment()))));
		this.setState({ appointments: appointments?.map(a => { a['key'] = a._id; return a; }) });
	}

	handleMarkAsClosed = (items) => {
		const { event, note, publicFeedback } = this.state;
		this.setState({ visibleProcess: false });
		if (event?._id) {
			const data = {
				appointmentId: event._id,
				publicFeedback: publicFeedback,
				note: note,
				items: items,
			}

			request.post(closeAppointmentForProvider, data).then(result => {
				const { success, data } = result;
				if (success) {
					this.setState({ errorMessage: '' });
					this.updateAppointments();
				} else {
					this.setState({ errorMessage: data });
				}
			}).catch(error => {
				console.log('closed error---', error);
				this.setState({ errorMessage: error.message });
			})
		}
	}

	handleDecline = (note, publicFeedback) => {
		this.setState({ visibleProcess: false });
		const { event } = this.state;
		if (event?._id) {
			const data = {
				appointmentId: event._id,
				publicFeedback: publicFeedback,
				note: note,
			}

			request.post(declineAppointmentForProvider, data).then(result => {
				const { success, data } = result;
				if (success) {
					this.setState({ errorMessage: '' });
					this.updateAppointments();
				} else {
					this.setState({ errorMessage: data });
				}
			}).catch(error => {
				console.log('closed error---', error);
				this.setState({ errorMessage: error.message });
			})
		}
	}

	handleClose = (appointment) => {
		this.setState({ visibleProcess: true, event: appointment });
	}

	closeModalProcess = () => {
		this.setState({ visibleProcess: false });
	}

	openModalInvoice = (note, publicFeedback) => {
		this.setState({ visibleProcess: false, visibleInvoice: true, note: note, publicFeedback: publicFeedback });
	}

	onConfirm = (items) => {
		this.setState({ visibleInvoice: false });
		this.handleMarkAsClosed(items, false);
	}

	closeModalInvoice = () => {
		this.setState({ visibleInvoice: false });
	}

	updateAppointments() {
		store.dispatch(getAppointmentsData({ role: this.props.user?.role }));
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

	render() {
		const { appointments, skillSet, visibleProcess, visibleInvoice, event, errorMessage } = this.state;
		const modalProps = {
			className: 'modal-referral-service',
			title: "Sessions need to close",
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

		if (this.props.user?.role > 900 || this.props.user?.role == 100) {
			columns.splice(1, 0, {
				title: 'Provider',
				key: 'provider',
				sorter: (a, b) => a.provider?.firstName + a.provider?.lastName > b.provider?.firstName + b.provider?.lastName ? 1 : -1,
				render: (appointment) => `${appointment?.provider.firstName ?? ''} ${appointment?.provider.lastName ?? ''}`,
			});
			columns.splice(5, 0, {
				title: 'Action', key: 'action', render: (appointment) => this.props.appointments.find(a => a.dependent?._id == appointment?.dependent?._id && a.provider?._id == appointment?.provider?._id && a.flagStatus == 1)
					? (<div>Suspending</div>) : (
						<a className='btn-blue action' onClick={() => this.handleClose(appointment)}>Close</a>
					)
			});
		} else {
			columns.splice(4, 0, {
				title: 'Action', key: 'action', render: (appointment) => this.props.appointments.find(a => a.dependent?._id == appointment?.dependent?._id && a.provider?._id == appointment?.provider?._id && a.flagStatus == 1)
					? (<div>Suspending</div>) : (
						<a className='btn-blue action' onClick={() => this.handleClose(appointment)}>Close</a>
					)
			});
		}

		const modalProcessProps = {
			visible: visibleProcess,
			onDecline: this.handleDecline,
			onConfirm: this.openModalInvoice,
			onCancel: this.closeModalProcess,
			event: event,
		};

		const modalInvoiceProps = {
			visible: visibleInvoice,
			onSubmit: this.onConfirm,
			onCancel: this.closeModalInvoice,
			event: event,
		}

		return (
			<Modal {...modalProps}>
				<Table
					bordered
					size='middle'
					dataSource={appointments}
					columns={columns}
					className="p-10"
				/>
				{visibleProcess && <ModalProcessAppointment {...modalProcessProps} />}
				{visibleInvoice && <ModalInvoice {...modalInvoiceProps} />}
				{errorMessage.length > 0 && (<p className='text-right text-red mr-5'>{errorMessage}</p>)}
			</Modal>
		);
	}
};

const mapStateToProps = state => {
	return ({
		appointments: state.appointments.dataAppointments,
		user: state.auth.user,
	})
}

export default compose(connect(mapStateToProps))(ModalSessionsNeedToClose);