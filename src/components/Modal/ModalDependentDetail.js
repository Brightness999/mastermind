import React from 'react';
import { Modal, Input, Divider, Card, Button, message, Row, Col, Space, Table, Popconfirm } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { CloseOutlined } from '@ant-design/icons';

import messages from './messages';
import msgCreateAccount from 'routes/Sign/CreateAccount/messages';
import { acceptDependent, appealDependent, createPrivateNote, declineDependent, deletePrivateNote, getDependent, setFlagBalance, updatePrivateNote } from 'utils/api/apiList';
import request from 'utils/api/request';
import ModalNewSubsidyRequest from './ModalNewSubsidyRequest';
import ModalBalance from './ModalBalance';
import ModalSelectProvider from './ModalSelectProvider';
import ModalCreateNote from './ModalCreateNote';
import { APPOINTMENT, BALANCE, CLOSED, CONSULTATION, EVALUATION, PENDING, SUBSIDY } from 'routes/constant';
import './style/index.less';
import '../../assets/styles/login.less';

class ModalDependentDetail extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			dependent: this.props.dependent,
			selectedNoteId: -1,
			note: '',
			isNew: false,
			visibleNewSubsidy: false,
			visibleBalance: false,
			isUpdated: false,
			visibleSelectProvider: false,
			visibleModalMessage: false,
			selectedProviderId: undefined,
		}
	}

	componentDidMount() {
		this.getDependentDetail();
	}

	getDependentDetail = () => {
		const { dependent } = this.props;

		if (dependent?._id) {
			request.post(getDependent, { dependentId: dependent?._id }).then(res => {
				const { success, data } = res;
				if (success) {
					this.setState({ dependent: data });
				}
			}).catch(err => {
				message.error(err.message);
			})
		}
	}

	onEdit = (noteId) => {
		this.setState({ selectedNoteId: noteId, note: this.state.dependent?.notes?.find(n => n._id == noteId)?.note });
	}

	onCancel = () => {
		this.setState({ selectedNoteId: -1, isNew: false });
	}

	onSave = (noteId) => {
		const { dependent, note } = this.state;
		if (noteId) {
			const data = {
				_id: noteId,
				note: note,
			}
			request.post(updatePrivateNote, data).then(res => {
				const { success, data } = res;
				if (success) {
					dependent.notes = dependent.notes.map(note => note._id == data._id ? data : note);
					this.setState({
						dependent: dependent,
						selectedNoteId: -1,
					});
				}
			}).catch(err => {
				message.error(err.message);
			})
		}
	}

	onDelete = (noteId) => {
		request.post(deletePrivateNote, { noteId: noteId }).then((res) => {
			if (res.success) {
				const { dependent, selectedNoteId } = this.state;
				dependent.notes = dependent.notes?.filter((note => note._id != noteId));
				this.setState({
					dependent: dependent,
					note: dependent.notes[selectedNoteId]?.note,
				})
				if (selectedNoteId == dependent.notes.length) {
					this.setState({
						selectedNoteId: selectedNoteId - 1,
						note: dependent.notes[selectedNoteId - 1]?.note,
					});
				}
			}
		}).catch(err => {
			message.error(err.message);
		})
	}

	onAddComment = () => {
		this.setState({ note: '', isNew: true });
	}

	onCreate = () => {
		const { dependent, note } = this.state;
		const data = {
			user: this.props.user?._id,
			dependent: dependent?._id,
			note: note,
		}
		request.post(createPrivateNote, data).then(res => {
			const { success, data } = res;
			if (success) {
				this.state.dependent.notes?.push(data);
				this.setState({ dependent: this.state.dependent, isNew: false });
			}
		}).catch(err => {
			message.error(err.message);
		})
	}

	onOpenModalNewSubsidy = () => {
		this.setState({ visibleNewSubsidy: true });
	}

	onCloseModalNewSubsidy = () => {
		this.setState({ visibleNewSubsidy: false });
	}

	onShowModalBalance = () => {
		this.setState({ visibleBalance: true });
	}

	onCloseModalBalance = () => {
		this.setState({ visibleBalance: false });
	}

	handleSubmitFlagBalance = (values) => {
		const { notes } = values;
		const { dependent } = this.state;
		const providerIds = Object.keys(values).filter(a => a.includes('invoiceId')).map(a => a.split("-")[1]);
		let bulkData = [];
		providerIds.forEach(providerId => {
			let temp = [];
			Object.entries(values)?.forEach(value => {
				if (value?.length) {
					const appointment = dependent.appointments?.find(a => a._id === value[0]);
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
										count: appointment.type === SUBSIDY ? `[${dependent.appointments?.filter(a => a?.type === SUBSIDY && [PENDING, CLOSED].includes(a?.status) && a?.dependent?._id === appointment?.dependent?._id && a?.provider?._id === appointment?.provider?._id)?.length}/${appointment?.subsidy?.numberOfSessions}]` : '',
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

		request.post(setFlagBalance, { bulkData, dependent: dependent?._id }).then(result => {
			const { success, data } = result;
			if (success) {
				this.setState({ isUpdated: ture });
				this.onCloseModalBalance();
				let newDependentInvoices = dependent.invoices?.map(invoice => {
					const updatedInvoice = data?.find(d => d._id === invoice._id);
					if (updatedInvoice) {
						invoice.data = updatedInvoice.data;
						invoice.requester = updatedInvoice.requester;
						invoice.minimumPayment = updatedInvoice.minimumPayment;
						invoice.totalPayment = updatedInvoice.totalPayment;
						return invoice;
					} else {
						return invoice;
					}
				});

				let newDependentAppointments = dependent.appointments?.map(appointment => {
					const updatedInvoice = data?.find(d => d._id === appointment?.flagInvoice?._id);
					if (updatedInvoice) {
						appointment.flagInvoice.data = updatedInvoice.data;
						appointment.flagInvoice.requester = updatedInvoice.requester;
						appointment.flagInvoice.minimumPayment = updatedInvoice.minimumPayment;
						appointment.flagInvoice.totalPayment = updatedInvoice.totalPayment;
						return appointment;
					} else {
						return appointment;
					}
				})

				const newAppointmentIds = data?.filter(d => d.isNew)?.map(d => d.data)?.flat()?.map(d => d.appointment);
				newDependentInvoices = newDependentInvoices?.filter(invoice => !(invoice?.type === 1 && newAppointmentIds.includes(invoice?.data?.[0]?.appointment)));

				data?.filter(d => d.isNew)?.forEach(d => {
					newDependentInvoices.push({
						_id: d._id,
						isPaid: 0,
						requester: d.requester,
						type: 5,
						invoiceNumber: d.invoiceNumber,
						dependent: d.dependent,
						provider: d.provider,
						totalPayment: d.totalPayment,
						minimumPayment: d.minimumPayment,
						data: d.data,
					})

					newDependentAppointments?.map(appointment => {
						if (d?.data?.find(a => a.appointment === appointment?._id)) {
							appointment.sessionInvoice = undefined;
							appointment.flagStatus = 1;
							appointment.flagInvoice = {
								_id: d._id,
								isPaid: 0,
								requester: d.requester,
								type: BALANCE,
								invoiceNumber: d.invoiceNumber,
								dependent: d.dependent,
								provider: d.provider,
								totalPayment: d.totalPayment,
								minimumPayment: d.minimumPayment,
								data: d.data,
							}
							return appointment;
						} else {
							return appointment;
						}
					})
				})

				this.setState({ dependent: { ...dependent, invoices: newDependentInvoices, appointments: newDependentAppointments } })
			}
		}).catch(err => message.error(err.message));
	}

	handleDeclineDependent = () => {
		const { user } = this.props;
		const { dependent } = this.state;
		const data = {
			dependentId: dependent?._id,
			providerId: user?.providerInfo?._id,
		}

		request.post(declineDependent, data).then(result => {
			const { success, data } = result;
			if (success) {
				this.setState({ dependent: { ...dependent, declinedProviders: data.declinedProviders } });
			}
		}).catch(error => {
			message.error(error.message);
		})
	}

	handleAcceptDependent = () => {
		const { user } = this.props;
		const { dependent } = this.state;
		const data = {
			dependentId: dependent?._id,
			providerId: user?.providerInfo?._id,
		}

		request.post(acceptDependent, data).then(result => {
			if (result.success) {
				this.setState({ dependent: { ...dependent, declinedProviders: dependent?.declinedProviders?.filter(p => p.provider?._id != user.providerInfo?._id) } })
			}
		}).catch(error => {
			message.error(error.message);
		})
	}

	handleAppealDependent = (msg) => {
		this.closeModalMessage();
		const { dependent, selectedProviderId } = this.state;
		const data = {
			dependentId: dependent?._id,
			providerId: selectedProviderId,
			message: msg,
		}

		request.post(appealDependent, data).then(result => {
			if (result.success) {
				message.success('Your request has been submitted. Please allow up to 24 hours for the provider to review this.');
				this.setState({ dependent: { ...dependent, declinedProviders: dependent.declinedProviders?.map(p => p.provider?._id === selectedProviderId ? ({ provider: p.provider, isAppeal: true }) : p) } });
			}
		}).catch(error => {
			message.error(error.message);
		})
	}

	openModalSelectProvider = () => {
		this.setState({ visibleSelectProvider: true });
	}

	closeModalSelectProvider = () => {
		this.setState({ visibleSelectProvider: false, selectedProviderId: undefined });
	}

	submitModalSelectProvider = (data) => {
		this.setState({ selectedProviderId: data.provider, visibleSelectProvider: false, visibleModalMessage: true });
	}

	closeModalMessage = () => {
		this.setState({ visibleModalMessage: false });
	}

	render() {
		const { dependent, selectedNoteId, isNew, isUpdated, visibleBalance, visibleNewSubsidy, visibleSelectProvider, visibleModalMessage } = this.state;
		const { user } = this.props;
		const modalProps = {
			className: 'modal-dependent',
			title: "",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: () => this.props.onCancel(isUpdated),
			footer: null,
			closable: false,
			width: 1200,
		};
		const subsidyColumn = [
			{
				title: 'PROVIDER', key: 'provider', dataIndex: 'selectedProviderFromAdmin',
				render: (provider) => `${provider?.firstName} ${provider?.lastName}`,
			},
			{
				title: 'SESSIONS USED', key: 'sessions',
				render: (subsidy) => (dependent?.appointments?.filter(a => a.subsidy?._id === subsidy?._id && a.type === 5)?.length || 0) + '/' + subsidy?.numberOfSessions,
			},
			{
				title: '$ AMOUNT', key: 'amount', dataIndex: 'dependentRate',
			},
		]

		const modalNewSubsidyProps = {
			visible: visibleNewSubsidy,
			onSubmit: this.onCloseModalNewSubsidy,
			onCancel: this.onCloseModalNewSubsidy,
			dependent: dependent,
		};

		const modalBalanceProps = {
			visible: visibleBalance,
			onSubmit: this.handleSubmitFlagBalance,
			onCancel: this.onCloseModalBalance,
			dependent,
		}

		const modalSelectProviderProps = {
			visible: visibleSelectProvider,
			onSubmit: this.submitModalSelectProvider,
			onCancel: this.closeModalSelectProvider,
			providers: dependent.declinedProviders?.filter(p => !p.isAppeal),
		}

		const modalMessageProps = {
			visible: visibleModalMessage,
			title: 'Message',
			onSubmit: this.handleAppealDependent,
			onCancel: this.closeModalMessage,
		}

		let unpaidInvoices = dependent?.invoices?.filter(a => !a.isPaid && a.type === 1);
		if (user.role === 30) {
			unpaidInvoices = unpaidInvoices?.filter(a => a.provider === user.providerInfo?._id);
		}

		return (
			<Modal {...modalProps}>
				<div className='flex justify-between bg-primary text-white header flex-row items-center gap-2'>
					<div className='flex-1 flex items-center gap-2'>
						<div>
							<b className='font-20'>NAME: {`${dependent?.firstName ?? ''} ${dependent?.lastName ?? ''}`}{((user?.role === 30 && dependent?.declinedProviders?.find(p => p.provider === user?.providerInfo?._id)) || ((user?.role === 3 || user?.role > 900) && dependent?.declinedProviders?.length)) ? '(Rejected)' : ''}</b>
							{dependent.isRemoved ? "(Graduated)" : null}
						</div>
					</div>
					<CloseOutlined onClick={() => this.props.onCancel(isUpdated)} />
				</div>
				<Card className='bg-white'>
					<Row gutter={50}>
						<Col xs={24} sm={24} md={12}>
							<Space direction='vertical' size={20} className='w-100'>
								<div>
									<div className='text-secondary'>Info</div>
									<Divider className='mt-0 mb-10 bg-primary' />
									<div className='flex'>
										<div className='flex-1'>
											<div><b>Grade:</b> {dependent?.currentGrade ?? ''}</div>
											<div><b>Age:</b> {moment().year() - moment(dependent?.birthday).year()}</div>
											<div><b>School:</b> {dependent?.school?.name}</div>
											<div><b>Birthday:</b> {moment(dependent.birthday)?.format('MM/DD/YYYY')}</div>
										</div>
										<div className='flex-1'>
											<div><b>Member Since:</b> {moment(dependent?.createdAt).format('MM/DD/YYYY')}</div>
											<div><b>Last Activity Date:</b> {dependent?.appointments?.filter(a => a.status === -1)?.length ? moment(dependent?.appointments?.filter(a => a.status === -1)?.sort((a, b) => moment(a.updatedAt) > moment(b.updatedAt) ? -1 : 1)?.[0]?.date).format('MM/DD/YYYY') : ''}</div>
											<div><b>Total Sessions:</b> {dependent?.appointments?.filter(d => [2, 3, 5].includes(d.type) && d.status == -1 && d.flagStatus != 1)?.length ?? 0}</div>
											<div><b>Total Consultations:</b> {dependent?.appointments?.filter(d => d.type === 4 && d.status == -1 && d.flagStatus != 1)?.length ?? 0}</div>
										</div>
									</div>
								</div>
								<div>
									<div className='text-secondary'>Payment</div>
									<Divider className='mt-0 mb-10 bg-primary' />
									<div className='text-bold'>Overdue Invoice(s): {dependent?.invoices?.filter(a => !a.isPaid)?.length || 0}</div>
								</div>
								<div>
									<div className='text-secondary'>Subsidy</div>
									<Divider className='mt-0 mb-10 bg-primary' />
									<p className='text-bold'>Total Approved Request(s): {dependent?.subsidy?.filter(s => s.status === 5)?.length || 0}</p>
									<p className='text-bold'>Total Denied Request(s): {dependent?.subsidy?.filter(s => [2, 4].includes(s.status))?.length || 0}</p>
									<Table size='middle' dataSource={dependent?.subsidy?.filter(s => s.status === 5) || []} columns={subsidyColumn} scroll={{ x: true }} />
								</div>
								<div>
									<div className='text-secondary'>Services</div>
									<Divider className='mt-0 mb-10 bg-primary' />
									<div className='flex gap-2'>
										<div className='text-bold'>{intl.formatMessage(msgCreateAccount.services)}:</div>
										<div>{dependent?.services?.map(service => service.name)?.join(', ')}</div>
									</div>
									<div className='flex gap-2'>
										<div className='text-bold'>{intl.formatMessage(messages.providers)}:</div>
										<div>{[...new Set(dependent?.appointments?.filter(a => a.type != CONSULTATION)?.map(a => `${a.provider?.firstName} ${a.provider?.lastName}`))].join(', ')}</div>
									</div>
								</div>
								<div>
									<div className='text-secondary'>About</div>
									<Divider className='mt-0 mb-10 bg-primary' />
									<div>{dependent?.backgroundInfor ?? ''}</div>
								</div>
							</Space>
						</Col>
						<Col xs={24} sm={24} md={12}>
							<div className='text-secondary'>Notes</div>
							<Divider className='mt-0 mb-10 bg-primary' />
							{isNew && (
								<div className="mt-2 mb-5 notes">
									<Input.TextArea
										name='NewPrivateNote'
										rows={3}
										onChange={e => this.setState({ note: e.target.value })}
										placeholder={intl.formatMessage(messages.privateNote)}
										className="private-note"
									/>
									<div className='flex justify-end gap-2 mt-10'>
										<Button type='primary' size='small' onClick={() => this.onCreate()}>SAVE</Button>
										<Button type='primary' size='small' onClick={() => this.onCancel()}>CANCEL</Button>
									</div>
								</div>
							)}
							{dependent?.notes?.length ? (
								<div className='flex flex-col gap-5 notes'>
									{dependent?.notes?.map((note, index) => (
										<Card key={index}>
											<Input.TextArea
												name='PrivateNote'
												rows={3}
												defaultValue={note.note}
												disabled={selectedNoteId != note._id}
												onChange={e => this.setState({ note: e.target.value })}
												placeholder={intl.formatMessage(messages.privateNote)}
												className="private-note"
											/>
											<div className='flex items-center gap-5 text-italic'>
												<div className='text-left'>{note.user?.role > 900 ? 'Admin' : note.user?.username}</div>
												<div className='text-left'>{moment(note?.updatedAt).format('MM/DD/YYYY hh:mm')}</div>
											</div>
											{(user?.role > 900 || user?._id == note.user?._id) && (
												<div className='flex justify-end gap-2'>
													{selectedNoteId == note._id ? (
														<>
															<Button type='primary' size='small' onClick={() => this.onSave(note._id)}>SAVE</Button>
															<Button type='primary' size='small' onClick={() => this.onCancel()}>CANCEL</Button>
														</>
													) : (
														<>
															<Button type='primary' size='small' onClick={() => this.onEdit(note._id)}>EDIT</Button>
															<Button type='primary' size='small' onClick={() => this.onDelete(note._id)}>DELETE</Button>
														</>
													)}
												</div>
											)}
										</Card>
									))}
								</div>
							) : (
								<div className='h-50 text-center'>No internal notes</div>
							)}
						</Col>
					</Row>
				</Card>
				<div className='footer-buttons'>
					{(user?.role === 3 || user?.role > 900) ? <Button type='primary' onClick={this.onOpenModalNewSubsidy}>REQUEST SUBSIDY</Button> : null}
					{user?.role != 3 ? <Button type='primary' onClick={this.onAddComment}>ADD COMMENT</Button> : null}
					{((user?.role === 30 || user?.role > 900) && unpaidInvoices?.length) ? <Button type='primary' onClick={this.onShowModalBalance}>FLAG DEPENDENT</Button> : null}
					{user?.role === 30 ? dependent?.declinedProviders?.find(p => p.provider?._id === user?.providerInfo?._id && p.isAppeal) ? (
						<Popconfirm
							title="Are you sure to accept this student?"
							onConfirm={this.handleAcceptDependent}
							okText="Yes"
							cancelText="No"
						>
							<Button type='primary'>ACCEPT</Button>
						</Popconfirm>
					) : dependent?.declinedProviders?.find(p => p.provider === user?.providerInfo?._id) ? null : (
						<Popconfirm
							title="Are you sure to decline this student?"
							onConfirm={this.handleDeclineDependent}
							okText="Yes"
							cancelText="No"
						>
							<Button type='primary'>DECLINE</Button>
						</Popconfirm>
					) : null}
					{((user?.role === 3 || user?.role > 900) && dependent?.declinedProviders?.filter(p => !p.isAppeal)?.length) ? (
						<Popconfirm
							title="Are you sure to appeal to a provider?"
							onConfirm={this.openModalSelectProvider}
							okText="Yes"
							cancelText="No"
						>
							<Button type='primary'>APPEAL</Button>
						</Popconfirm>
					) : null}
				</div>
				{visibleNewSubsidy && <ModalNewSubsidyRequest {...modalNewSubsidyProps} />}
				{visibleBalance && <ModalBalance {...modalBalanceProps} />}
				{visibleSelectProvider && <ModalSelectProvider {...modalSelectProviderProps} />}
				{visibleModalMessage && <ModalCreateNote {...modalMessageProps} />}
			</Modal>
		);
	}
};

const mapStateToProps = state => ({ user: state.auth.user });

export default compose(connect(mapStateToProps))(ModalDependentDetail);