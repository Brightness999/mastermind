import React from 'react';
import { Modal, Button, Row, Col, Switch, Select, Typography, Calendar, Avatar, Input, Popover, message, Form } from 'antd';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import { BsCheck } from 'react-icons/bs';
import { GoPrimitiveDot } from 'react-icons/go';
import intl from 'react-intl-universal';
import messages from './messages';
import msgCreateAccount from '../../routes/Sign/CreateAccount/messages';
import msgDrawer from '../../components/DrawerDetail/messages';
import msgReview from '../../routes/Sign/SubsidyReview/messages';
import moment from 'moment';
import request from '../../utils/api/request';
import './style/index.less';
import '../../assets/styles/login.less';
const { Paragraph } = Typography;
import 'moment/locale/en-au';
moment.locale('en');
import { store } from '../../redux/store';
import { rescheduleAppointmentForParent } from '../../utils/api/apiList';
import { FaCalendarAlt, FaHandHoldingUsd } from 'react-icons/fa';
import { MdAdminPanelSettings } from 'react-icons/md';

class ModalCurrentAppointment extends React.Component {
	state = {
		selectedDate: moment(this.props.event?.date),
		selectedPrivateDate: moment(this.props.event?.date),
		selectedTimeIndex: -1,
		addressOptions: store.getState().auth.locations,
		arrTime: [],
		privateArrTime: [],
		errorMessage: '',
		skillSet: store.getState().auth.skillSet,
		notes: this.props.event?.notes,
		dependents: store.getState().auth.dependents,
		standardRate: '',
		subsidizedRate: '',
		userRole: store.getState().auth.user.role,
		subsidyAvailable: false,
		restSessions: 0,
		duration: 30,
		address: this.props.event?.location,
	}

	getArrTime = (date) => {
		let arrTime = [];
		let duration = 30;
		const { address } = this.state;
		const { event } = this.props;

		if (event?.type == 2) {
			duration = event?.provider?.separateEvaluationDuration;
		} else {
			duration = event?.provider?.duration;
		}
		this.setState({ duration: duration });

		if (date) {
			if (date.day() == 6) {
				return [];
			} else if (event?.provider?.blackoutDates?.includes(a => moment(a).year() == date.year() && moment(a).month() == date.month() && moment(a).date() == date.date())) {
				return [];
			} else {
				const ranges = event?.provider?.manualSchedule?.filter(a => a.dayInWeek == date.day() && a.location == address && !a.isPrivate && date.isBetween(moment().set({ years: a.fromYear, months: a.fromMonth, dates: a.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }), moment().set({ years: a.toYear, months: a.toMonth, dates: a.toDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 0 })));
				if (!!ranges?.length) {
					let arr24 = new Array(24).fill(0);
					let timeObject = { start: 0, end: 0 };
					let timeArr = [];
					ranges.forEach(a => {
						for (let i = a?.openHour; i <= a?.closeHour; i++) {
							arr24[i] = 1;
						}
					})
					arr24.forEach((a, i) => {
						if (a == 0) {
							timeObject = { start: 0, end: 0 };
						} else {
							if (i == 0 || arr24[i - 1] == 0) {
								timeObject.start = i;
							}
							if (i == 23 || arr24[i + 1] == 0) {
								timeObject.end = i;
								timeArr.push(timeObject);
							}
						}
					});
					timeArr.forEach(a => {
						let startTime = moment().set({ hours: a.start, minutes: 0, seconds: 0, milliseconds: 0 });
						for (let i = 0; i < (a.end - a.start) * 60 / duration; i++) {
							arrTime.push({
								value: startTime.clone().add(duration * i, 'minutes'),
								active: date.isBefore(moment()) ? false : true,
							});
						}
					})
					return arrTime;
				} else {
					return [];
				}
			}
		}
	}

	componentDidMount() {
		this.setState({ arrTime: this.getArrTime(0) });
		const { event } = this.props;
		this.setState({
			skillSet: store.getState().auth.dependents?.find(dependent => dependent._id == event?.dependent?._id)?.services ?? [],
			selectedDate: moment(event?.date),
			addressOptions: ['Dependent Home', 'Provider Office', store.getState().auth.dependents?.find(dependent => dependent._id == event?.dependent?._id)?.school?.name],
			standardRate: event?.type == 3 ? event?.rate : '',
			subsidizedRate: event?.type == 5 ? event?.rate : '',
			duration: event?.type == 2 ? event?.provider?.separateEvaluationDuration : event?.provider?.duration,
		});
		this.form?.setFieldsValue({ dependent: event?.dependent?._id, skill: event?.skillSet?._id, address: event?.location });
		this.onSelectDate(moment(event?.date));
	}

	onFinishFailed = (err) => {
		console.log('form data error---', err);
	}

	handleChangeAddress = address => {
		this.setState({ address: address });
	};

	onSelectDate = (newValue) => {
		const { event } = this.props;
		const newArrTime = this.getArrTime(newValue);
		this.setState({ selectedDate: newValue, selectedTimeIndex: -1 });

		if (newValue.isSameOrAfter(new Date())) {
			newArrTime.map(time => {
				const { years, months, date } = newValue.toObject();
				time.value = moment(time.value).set({ years, months, date });

				let flag = true;
				this.props.listAppointmentsRecent?.filter(appointment => (appointment.status == 0) && (appointment.provider?._id == event?.provider?._id || appointment.dependent?._id == event?.dependent?._id))?.forEach(appointment => {
					if (time.value.isSame(moment(appointment.date))) {
						flag = false;
					}
				})

				if (flag) {
					time.active = true;
				} else {
					time.active = false;
				}
				return time;
			})
			this.setState({ arrTime: newArrTime });
		} else {
			this.setState({ arrTime: newArrTime?.map(time => ({ ...time, active: false })) });
		}
	}

	nextMonth = () => {
		this.setState({
			selectedDate: moment(this.state.selectedDate).add(1, 'month'),
			selectedTimeIndex: -1,
		});
		this.onSelectDate(moment(this.state.selectedDate).add(1, 'month'));
	}

	prevMonth = () => {
		this.setState({
			selectedDate: moment(this.state.selectedDate).add(-1, 'month'),
			selectedTimeIndex: -1,
		});
		this.onSelectDate(moment(this.state.selectedDate).add(-1, 'month'));
	}

	onSelectTime = (index) => {
		this.setState({ selectedTimeIndex: index })
		index > -1 && this.setState({ errorMessage: '' });
	}

	handleChangeNote = (notes) => {
		this.setState({ notes: notes });
	}

	displayTime = (value) => {
		return `${value?.split(' ')[0]?.split(':')[0]}:${value?.split(' ')[0]?.split(':')[1]} ${value?.split(' ')[1]}`;
	}

	handleReschedule = () => {
		const { selectedDate, address, notes, selectedTimeIndex, arrTime } = this.state;
		const { durations } = store.getState().auth;
		const { event } = this.props;

		if (!selectedDate?.isAfter(new Date()) || selectedTimeIndex < 0) {
			this.setState({ errorMessage: 'Please select a date and time' })
			return;
		}
		this.setState({ errorMessage: '' })
		if (event?.type == 2) {
			const appointment = event?.provider?.appointments?.find(a => a._id != event?._id && a.dependent == event?.dependent?._id && a.type == 2 && a.status == 0);
			if (appointment) {
				message.warning("You can't create more evaluation.");
				return;
			}
		}

		const { years, months, date } = selectedDate.toObject();
		const hour = arrTime[selectedTimeIndex]?.value.clone().set({ years, months, date });
		const postData = {
			_id: this.props.event?._id,
			date: hour?.valueOf(),
			location: address,
			notes: notes,
			status: 0,
		};

		request.post(rescheduleAppointmentForParent, postData).then(result => {
			if (result.success) {
				this.setState({ errorMessage: '' });
				if (postData?.type == 2) {
					message.success(`${event?.provider?.firstName ?? ''} ${event?.provider?.lastName ?? ''} requires a ${durations?.find(a => a.value == this.state.duration)?.label} evaluation. Please proceed to schedule.`);
				}
				this.props.onSubmit();
			} else {
				this.setState({ errorMessage: result.data });
			}
		}).catch(err => {
			this.setState({ errorMessage: err.message });
		});
	}

	displayDuration = () => {
		const { event } = this.props;
		return `${moment(event?.date).format('MM/DD/YYYY hh:mm')} - ${moment(event?.date).add(event?.duration, 'minutes').format('hh:mm a')}`;
	}

	nextPrivateMonth = () => {
		this.setState({ selectedPrivateDate: moment(this.state.selectedPrivateDate).add(1, 'month') });
	}

	prevPrivateMonth = () => {
		this.setState({ selectedPrivateDate: moment(this.state.selectedPrivateDate).add(-1, 'month') });
	}

	onSelectPrivateDate = (newValue) => {
		const newArrTime = this.getArrTime(newValue);
		this.setState({
			selectedPrivateDate: newValue,
			privateArrTime: newArrTime,
		});
	}

	privateSlot = () => {
		const { userRole, selectedPrivateDate, privateArrTime } = this.state;
		const { event } = this.props;

		return (
			<div className='private-calendar'>
				<p className='font-700'>{intl.formatMessage(msgCreateAccount.privateHMGHAgents)}</p>
				<Row gutter={15}>
					<Col xs={24} sm={24} md={12}>
						<Calendar
							fullscreen={false}
							value={selectedPrivateDate}
							onSelect={this.onSelectPrivateDate}
							dateCellRender={date => {
								if (userRole > 3) {
									const availableTime = event?.provider?.manualSchedule?.find(time => time.dayInWeek == date.day());
									if (availableTime) {
										const availableFromDate = moment().set({ years: availableTime.fromYear, months: availableTime.fromMonth, dates: availableTime.fromDate });
										const availableToDate = moment().set({ years: availableTime.toYear, months: availableTime.toMonth, dates: availableTime.toDate });
										if (date.isBetween(availableFromDate, availableToDate) && availableTime.isPrivate) {
											return (<div className='absolute top-0 left-0 h-100 w-100 border border-1 border-warning rounded-2'></div>)
										} else {
											return null;
										}
									} else {
										return null;
									}
								} else {
									return null;
								}
							}}
							headerRender={() => (
								<div style={{ marginBottom: 10 }}>
									<Row gutter={8} justify="space-between" align="middle">
										<Col>
											<p className='font-12 mb-0'>{selectedPrivateDate?.format('MMMM YYYY')}</p>
										</Col>
										<Col>
											<Button
												type='text'
												className='mr-10 left-btn'
												icon={<BiChevronLeft size={25} />}
												onClick={this.prevPrivateMonth}
											/>
											<Button
												type='text'
												className='right-btn'
												icon={<BiChevronRight size={25} />}
												onClick={this.nextPrivateMonth}
											/>
										</Col>
									</Row>
								</div>
							)}
						/>
					</Col>
					<Col xs={24} sm={24} md={12}>
						<Row gutter={15}>
							{privateArrTime?.map((time, index) => (
								<Col key={index} span={12}>
									<div className={`${time.active ? 'time-available' : 'time-not-available'}`}>
										<p className='font-12 mb-0'><GoPrimitiveDot className={`${time.active ? 'active' : 'inactive'}`} size={15} />{moment(time.value)?.format('hh:mm a')}</p>
									</div>
								</Col>
							))}
						</Row>
					</Col>
				</Row>
			</div>
		)
	}

	render() {
		const {
			selectedDate,
			selectedTimeIndex,
			skillSet,
			arrTime,
			errorMessage,
			addressOptions,
			address,
			isConfirm,
			dependents,
			standardRate,
			subsidizedRate,
			userRole,
			subsidyAvailable,
			restSessions,
		} = this.state;
		const { event } = this.props;
		const modalProps = {
			className: 'modal-current',
			title: "",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: (e) => e.target.className !== 'ant-modal-wrap' && this.props.onCancel(),
			width: 1000,
			footer: []
		};

		const contentConfirm = (
			<div className='confirm-content'>
				<p className='text-center mb-5'>{intl.formatMessage(messages.areSureChangeAppoint)}</p>
				<Row gutter={10}>
					<Col xs={24} sm={24} md={12}>
						<p className='font-12 text-center mb-0'>{intl.formatMessage(messages.current)}</p>
						<div className='current-content'>
							<p className='font-10'>30 minutes {intl.formatMessage(messages.meetingWith)} <span className='font-11 font-700'>{`${event?.provider?.firstName ?? ''} ${event?.provider?.lastName ?? ''}`}</span></p>
							<p className='font-10'>{intl.formatMessage(msgDrawer.who)}: {`${event?.dependent?.firstName ?? ''} ${event?.dependent?.lastName ?? ''}`}</p>
							<p className='font-10'>{intl.formatMessage(msgDrawer.where)}: {event?.location}</p>
							<p className='font-10 nobr'>{intl.formatMessage(msgDrawer.when)}: <span className='font-11 font-700'>{this.displayTime(new Date(event?.date?.toString())?.toLocaleTimeString())}</span> on <span className='font-11 font-700'>{new Date(event?.date?.toString())?.toLocaleDateString()}</span></p>
						</div>
					</Col>
					<Col xs={24} sm={24} md={12}>
						<p className='font-12 text-center mb-0'>{intl.formatMessage(messages.new)}</p>
						<div className='new-content'>
							<p className='font-10'>30 minutes {intl.formatMessage(messages.meetingWith)} <span className='font-11 font-700'>{`${event?.provider?.firstName ?? ''} ${event?.provider?.lastName ?? ''}`}</span></p>
							<p className='font-10'>{intl.formatMessage(msgDrawer.who)}: {`${dependents.find(dependent => dependent._id == event?.dependent?._id)?.firstName ?? ''} ${dependents?.find(dependent => dependent._id == event?.dependent?._id)?.lastName ?? ''}`}</p>
							<p className='font-10'>{intl.formatMessage(msgDrawer.where)}: {address}</p>
							<p className='font-10 nobr'>{intl.formatMessage(msgDrawer.when)}: <span className='font-11 font-700'>{this.displayTime(new Date(selectedDate?.toString())?.toLocaleTimeString())}</span> on <span className='font-11 font-700'>{new Date(selectedDate?.toString())?.toLocaleDateString()}</span></p>
						</div>
					</Col>
				</Row>
			</div>
		);

		return (
			<Modal {...modalProps}>
				<div className='header-current'>
					<Row gutter="15" align="bottom">
						<Col xs={24} sm={24} md={8}>
							<p className='font-24 font-700'>{intl.formatMessage(messages.current)} {event?.type == 3 && intl.formatMessage(messages.appointment)}{event?.type == 2 && intl.formatMessage(messages.evaluation)}{event?.type == 1 && intl.formatMessage(messages.screening)}{event?.type == 4 && intl.formatMessage(messages.consultation)}</p>
							<p className='font-16'>{`${event?.dependent?.firstName ?? ''} ${event?.dependent?.lastName ?? ''}`}</p>
							<p className='font-16'>{`${event?.provider?.firstName ?? ''} ${event?.provider?.lastName ?? ''}`}</p>
						</Col>
						<Col xs={24} sm={24} md={8}>
							<p className={`font-16 ${event?.type != 3 ? 'display-none' : ''}`}>{intl.formatMessage(msgCreateAccount.subsidy)}</p>
							<p className={`font-16 font-700 ${event?.type != 2 ? 'display-none' : ''}`}>{event?.separateEvaluationDuration ?? ''} {intl.formatMessage(messages.evaluation)}</p>
							<p className='font-16'>{(event?.type == 1 || event?.type == 4) ? event?.phoneNumber ?? '' : event?.location ?? ''}</p>
						</Col>
						<Col xs={24} sm={24} md={8}>
							<p></p>
							<p className='font-16'>{event?.skillSet?.name ?? ''}</p>
							<p className='font-16'>{event?.type == 1 ? event?.screeningTime ?? '' : this.displayDuration()}</p>
						</Col>
					</Row>
				</div>
				<div className='new-appointment'>
					<Form
						name="current-appointment"
						layout='vertical'
						onFinish={this.handleReschedule}
						onFinishFailed={this.onFinishFailed}
						ref={ref => this.form = ref}
					>
						<div className='flex gap-5 items-center'>
							<p className='font-30 mb-10'>{event?.type == 3 && intl.formatMessage(messages.newAppointment)}{event?.type == 2 && intl.formatMessage(messages.newEvaluation)}{event?.type == 1 && intl.formatMessage(messages.newScreening)}</p>
							{event?.type == 2 && (
								<div className='font-20'>
									<div>{store.getState().auth.durations?.find(a => a.value == event?.provider?.separateEvaluationDuration)?.label} evaluation</div>
									<div>Rate: ${event?.provider?.separateEvaluationRate}</div>
								</div>
							)}
						</div>
						<div className='flex flex-row items-center mb-10'>
							<p className='font-16 mb-0'>{intl.formatMessage(messages.selectOptions)}<sup>*</sup></p>
							{event?.type == 3 && subsidyAvailable && (
								<div className='flex flex-row items-center ml-20 gap-5'>
									<p className='mb-0'>Number of Sessions: {restSessions}</p>
									<div className='flex items-center gap-2'>
										<Switch size="small" />
										<p className='mb-0'>{intl.formatMessage(messages.subsidyOnly)}</p>
									</div>
								</div>
							)}
						</div>
						<Row gutter={20}>
							<Col xs={24} sm={24} md={8} className='select-small'>
								<Form.Item
									name="dependent"
									label={intl.formatMessage(msgCreateAccount.dependent)}
									rules={[{ required: true, message: 'Please select a dependent' }]}
								>
									<Select
										placeholder={intl.formatMessage(msgCreateAccount.dependent)}
										disabled
									>
										{dependents?.map((dependent, index) => (
											<Select.Option key={index} value={dependent._id}>{dependent.firstName} {dependent.lastName}</Select.Option>
										))}
									</Select>
								</Form.Item>
							</Col>
							<Col xs={24} sm={24} md={8} className='select-small'>
								<Form.Item
									name="skill"
									label={intl.formatMessage(msgCreateAccount.skillsets)}
									rules={[{ required: true, message: 'Please select a skill.' }]}
								>
									<Select
										placeholder={intl.formatMessage(msgCreateAccount.skillsets)}
										disabled
									>
										{skillSet?.map((skill, index) => (
											<Select.Option key={index} value={skill._id}>{skill.name}</Select.Option>
										))}
									</Select>
								</Form.Item>
							</Col>
							<Col xs={24} sm={24} md={8} className='select-small'>
								<Form.Item
									name="address"
									label={intl.formatMessage(msgCreateAccount.location)}
									rules={[{ required: [2, 3, 5].includes(event?.type), message: "Select an appointment location." }]}
								>
									<Select
										showSearch
										optionFilterProp="children"
										filterOption={(input, option) => option.children?.includes(input)}
										onChange={v => this.handleChangeAddress(v)}
										placeholder={intl.formatMessage(msgCreateAccount.location)}
									>
										{addressOptions?.map((address, index) => (
											<Select.Option key={index} value={address}>{address}</Select.Option>
										))}
									</Select>
								</Form.Item>
							</Col>
						</Row>
						<Row>
							<Col xs={24}>
								<Form.Item name="notes" label={intl.formatMessage(msgCreateAccount.notes)}>
									<Input.TextArea rows={3} onChange={e => this.handleChangeNote(e.target.value)} placeholder='Additional information you’d like to share with the provider' />
								</Form.Item>
							</Col>
						</Row>
						{userRole != 30 && (
							<div className='choose-doctor'>
								<p className='font-16 mt-10'>{intl.formatMessage(msgCreateAccount.provider)}</p>
								<div className='doctor-content'>
									<div className='doctor-list'>
										<div className='doctor-item'>
											<Avatar shape="square" size="large" src='../images/doctor_ex2.jpeg' />
											<p className='font-12 text-center'>{`${event?.provider.firstName ?? ''} ${event?.provider.lastName ?? ''}`}</p>
											<BsCheck size={12} className='selected-doctor' />
											{userRole > 3 && event?.provider.isPrivateForHmgh ? (
												<MdAdminPanelSettings size={12} className='selected-private-provider' />
											) : null}
										</div>
									</div>
								</div>
							</div>
						)}
						<Row gutter={10}>
							<Col xs={24} sm={24} md={10}>
								<div className='provider-profile'>
									<div className='flex flex-row items-center'>
										<p className='font-16 font-700'>
											{`${event?.provider?.firstName ?? ''} ${event?.provider?.lastName ?? ''}`}
											{!!event?.provider?.academicLevel?.length ? <FaHandHoldingUsd size={16} className='mx-10 text-green500' /> : null}
											{userRole > 3 && event?.provider?.isPrivateForHmgh ? <Popover content={this.privateSlot} trigger="click"><FaCalendarAlt size={16} className="text-green500 cursor" /></Popover> : null}
										</p>
										<p className='font-700 ml-auto text-primary'>{event?.provider?.isNewClientScreening ? event?.provider?.appointments?.find(a => a.dependent == event?.dependent?._id && a.type == 1 && a.status == -1) ? intl.formatMessage(messages.screenCompleted) : intl.formatMessage(messages.screeningRequired) : ''}</p>
									</div>
									<div className='flex'>
										<div className='flex-1'>
											{event?.provider?.contactNumber?.map((phone, index) => (
												<p key={index} className='font-12'>{phone.phoneNumber}</p>
											))}
											{event?.provider?.contactEmail?.map((email, index) => (
												<p key={index} className='font-12'>{email.email}</p>
											))}
											{event?.provider?.serviceAddress && (
												<p className='font-12'>{event?.provider.serviceAddress}</p>
											)}
										</div>
										<div className='flex-1 font-12'>
											{standardRate && <p>Rate: ${standardRate}</p>}
											{subsidizedRate && <p>Subsidized Rate: ${subsidizedRate}</p>}
										</div>
									</div>
									<div className='flex mt-10'>
										<div className='flex-1'>
											<p className='text-bold'>Skillset(s):</p>
											{event?.provider?.skillSet?.map((skill, index) => (
												<p key={index} className='font-12'>{skill.name}</p>
											))}
										</div>
										<div className='flex-1'>
											<p className='text-bold'>Grade level(s)</p>
											{event?.provider?.academicLevel?.map((level, i) => (
												<p key={i} className='font-12'>{level.level}</p>
											))}
										</div>
									</div>
									<p className='mt-10 text-bold'>Profile</p>
									<div className='profile-text'>
										<Paragraph className='font-12 mb-0' ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>
											{event?.provider?.publicProfile}
										</Paragraph>
									</div>
								</div>
							</Col>
							<Col xs={24} sm={24} md={14}>
								<div className='px-20'>
									<p className='font-700'>{intl.formatMessage(msgCreateAccount.selectDateTime)}<sup>*</sup></p>
									<div className='calendar'>
										<Row gutter={15}>
											<Col xs={24} sm={24} md={12}>
												<Calendar
													fullscreen={false}
													value={selectedDate}
													dateCellRender={date => {
														if (userRole > 3) {
															const availableTime = event?.provider?.manualSchedule?.find(time => time.dayInWeek == date.day());
															if (availableTime) {
																const availableFromDate = moment().set({ years: availableTime.fromYear, months: availableTime.fromMonth, dates: availableTime.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
																const availableToDate = moment().set({ years: availableTime.toYear, months: availableTime.toMonth, dates: availableTime.toDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 0 });
																if (date.isBetween(availableFromDate, availableToDate) && availableTime.isPrivate) {
																	return (<div className='absolute top-0 left-0 h-100 w-100 border border-1 border-warning rounded-2'></div>)
																} else {
																	return null;
																}
															} else {
																return null;
															}
														} else {
															return null;
														}
													}}
													onSelect={this.onSelectDate}
													disabledDate={(date) => {
														if (date.isBefore(moment())) {
															return true;
														}

														if (date.isAfter(moment()) && date.day() == 6) {
															return true;
														}

														const range = event?.provider?.manualSchedule?.find(d => d.dayInWeek == date.day() && d.location == address && date.isBetween(moment().set({ years: d.fromYear, months: d.fromMonth, dates: d.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }), moment().set({ years: d.toYear, months: d.toMonth, dates: d.toDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 0 })));
														if (range) {
															if (range.isPrivate) {
																return true;
															}
														} else {
															return true;
														}

														if (event?.provider?.blackoutDates?.find(blackoutDate => moment(blackoutDate).year() == date.year() && moment(blackoutDate).month() == date.month() && moment(blackoutDate).date() == date.date())) {
															return true;
														}

														return false;
													}}
													headerRender={() => (
														<div style={{ marginBottom: 10 }}>
															<Row gutter={8} justify="space-between" align="middle">
																<Col>
																	<p className='font-12 mb-0'>{selectedDate?.format('MMMM YYYY')}</p>
																</Col>
																<Col>
																	<Button
																		type='text'
																		className='mr-10 left-btn'
																		icon={<BiChevronLeft size={25} />}
																		onClick={this.prevMonth}
																	/>
																	<Button
																		type='text'
																		className='right-btn'
																		icon={<BiChevronRight size={25} />}
																		onClick={this.nextMonth}
																	/>
																</Col>
															</Row>
														</div>
													)}
												/>
											</Col>
											<Col xs={24} sm={24} md={12}>
												<Row gutter={15}>
													{arrTime?.map((time, index) => (
														<Col key={index} span={12}>
															<div className={`${selectedTimeIndex === index ? 'active' : ''} ${time.active ? 'time-available' : 'time-not-available'} ${moment(event?.date)?.year() == selectedDate?.year() && moment(event?.date)?.month() == selectedDate?.month() && moment(event?.date)?.date() == selectedDate?.date() && moment(event?.date).hours() == time.value.hours() && moment(event?.date).minutes() == time.value.minutes() ? 'prev-time' : ''}`} onClick={() => time.active ? this.onSelectTime(index) : this.onSelectTime(-1)}>
																<p className='font-12 mb-0'><GoPrimitiveDot className={`${time.active ? 'active' : 'inactive'}`} size={15} />{moment(time.value)?.format('hh:mm a')}</p>
															</div>
														</Col>
													))}
												</Row>
											</Col>
										</Row>
									</div>
								</div>
							</Col>
						</Row>
						{errorMessage.length > 0 && (<p className='text-right text-red mr-5'>{errorMessage}</p>)}
						<Row className='justify-end gap-2'>
							<Button key="back" onClick={this.props.onCancel}>
								{intl.formatMessage(msgReview.goBack).toUpperCase()}
							</Button>
							{isConfirm ? (
								<Popover
									placement="topRight"
									content={contentConfirm}
									className='popup-confirm'
									trigger="hover"
								>
									<Button key="submit" type="primary" onClick={this.handleReschedule}>
										{intl.formatMessage(msgCreateAccount.confirm).toUpperCase()}
									</Button>
								</Popover>
							) : (
								<Button key="submit" type="primary" htmlType='submit'>
									{intl.formatMessage(msgDrawer.reschedule)?.toUpperCase()}
								</Button>
							)}
						</Row>
					</Form>
				</div>
			</Modal>
		);
	}
};

export default ModalCurrentAppointment;