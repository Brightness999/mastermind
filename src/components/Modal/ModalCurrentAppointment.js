import React from 'react';
import { Modal, Button, Row, Col, Switch, Select, Typography, Calendar, Avatar, Input, Popover, message, Form } from 'antd';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import { BsCheck } from 'react-icons/bs';
import { GoPrimitiveDot } from 'react-icons/go';
import { MdAdminPanelSettings } from 'react-icons/md';
import { FaCalendarAlt, FaHandHoldingUsd } from 'react-icons/fa';
import intl from 'react-intl-universal';
import moment from 'moment';
import 'moment/locale/en-au';
import { connect } from 'react-redux';
import { compose } from 'redux';

import messages from './messages';
import msgCreateAccount from 'routes/Sign/CreateAccount/messages';
import msgDrawer from 'components/DrawerDetail/messages';
import request from 'utils/api/request';
import { rescheduleAppointmentForParent } from 'utils/api/apiList';
import { APPOINTMENT, CLOSED, CONSULTATION, DEPENDENTHOME, Durations, EVALUATION, PENDING, PROVIDEROFFICE, SCREEN, SUBSIDY } from 'routes/constant';
import { setAppointments, setAppointmentsInMonth } from 'src/redux/features/appointmentsSlice';
import { url } from 'utils/api/baseUrl'
import './style/index.less';
import '../../assets/styles/login.less';

moment.locale('en');
const { Paragraph } = Typography;

class ModalCurrentAppointment extends React.Component {
	state = {
		selectedDate: moment(this.props.event?.date),
		selectedTimeIndex: -1,
		addressOptions: this.props.auth.locations,
		arrTime: [],
		errorMessage: '',
		skillSet: this.props.auth.skillSet,
		notes: this.props.event?.notes,
		dependents: this.props.auth.dependents,
		standardRate: '',
		subsidizedRate: '',
		userRole: this.props.auth.user.role,
		subsidyAvailable: false,
		restSessions: 0,
		duration: 30,
		address: this.props.event?.location,
		cancellationFee: '',
		loadingSchedule: false,
	}

	getArrTime = (date) => {
		let arrTime = [];
		let duration = 30;
		const { address, userRole } = this.state;
		const { event } = this.props;

		if (event?.type === EVALUATION) {
			duration = event?.provider?.separateEvaluationDuration;
		} else {
			duration = event?.provider?.duration;
		}
		this.setState({ duration: duration });

		if (moment().isBefore(moment(date))) {
			if (date.day() == 6) {
				return [];
			} else if (event?.provider?.blackoutDates?.includes(a => moment(a).year() == date.year() && moment(a).month() == date.month() && moment(a).date() == date.date())) {
				return [];
			} else {
				let ranges = []
				if (userRole === 3 || userRole === 60) {
					ranges = event?.provider?.manualSchedule?.filter(a => a.dayInWeek == date.day() && a.location == address && !a.isPrivate && date.isBetween(moment().set({ years: a.fromYear, months: a.fromMonth, dates: a.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }), moment().set({ years: a.toYear, months: a.toMonth, dates: a.toDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 0 })));
				} else {
					ranges = event?.provider?.manualSchedule?.filter(a => a.dayInWeek == date.day() && a.location == address && date.isBetween(moment().set({ years: a.fromYear, months: a.fromMonth, dates: a.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }), moment().set({ years: a.toYear, months: a.toMonth, dates: a.toDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 0 })));
				}
				if (!!ranges?.length) {
					let timeArr = ranges?.map(a => ([a.openHour, a.closeHour]))?.reduce((a, b) => {
						if (!a?.length) a.push(b);
						else if (a?.find(c => (c[0] <= b[0] && c[1] >= b[0]) || (c[0] <= b[1] && c[1] >= b[1]))) {
							a = a.map(c => {
								if ((c[0] <= b[0] && c[1] >= b[0]) || (c[0] <= b[1] && c[1] >= b[1])) {
									return [Math.min(...c, ...b), Math.max(...c, ...b)];
								} else {
									return c;
								}
							})
						} else {
							a.push(b);
						}
						return a;
					}, []);

					timeArr?.sort((a, b) => a?.[0] - b?.[0]).forEach(a => {
						let startTime = moment(date).set({ hours: a?.[0], minutes: 0, seconds: 0, milliseconds: 0 });
						for (let i = 0; i < (a?.[1] - a?.[0]) * 60 / duration; i++) {
							arrTime.push({
								value: startTime.clone().add(duration * i, 'minutes'),
								active: startTime.clone().add(duration * i, 'minutes').isAfter(moment()),
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
		const { event, auth } = this.props;
		const currentGrade = event.dependent.currentGrade;
		let standardRate = 0;
		let subsidizedRate = 0;

		if (['Pre-Nursery', 'Nursery', 'Kindergarten', 'Pre-1A'].includes(currentGrade)) {
			standardRate = event.provider?.academicLevel?.find(level => [currentGrade, 'Early Education'].includes(level.level))?.rate;
			subsidizedRate = event.provider?.academicLevel?.find(level => [currentGrade, 'Early Education'].includes(level.level))?.subsidizedRate;
		} else if (['Grades 1', 'Grades 2', 'Grades 3', 'Grades 4', 'Grades 5', 'Grades 6'].includes(currentGrade)) {
			standardRate = event.provider?.academicLevel?.find(level => [currentGrade, 'Elementary Grades 1-6', 'Elementary Grades 1-8'].includes(level.level))?.rate;
			subsidizedRate = event.provider?.academicLevel?.find(level => [currentGrade, 'Elementary Grades 1-6', 'Elementary Grades 1-8'].includes(level.level))?.subsidizedRate;
		} else if (['Grades 7', 'Grades 8'].includes(currentGrade)) {
			standardRate = event.provider?.academicLevel?.find(level => [currentGrade, 'Middle Grades 7-8', 'Elementary Grades 1-8'].includes(level.level))?.rate;
			subsidizedRate = event.provider?.academicLevel?.find(level => [currentGrade, 'Middle Grades 7-8', 'Elementary Grades 1-8'].includes(level.level))?.subsidizedRate;
		} else if (['Grades 9', 'Grades 10', 'Grades 11', 'Grades 12'].includes(currentGrade)) {
			standardRate = event.provider?.academicLevel?.find(level => [currentGrade, 'High School Grades 9-12'].includes(level.level))?.rate;
			subsidizedRate = event.provider?.academicLevel?.find(level => [currentGrade, 'High School Grades 9-12'].includes(level.level))?.subsidizedRate;
		} else {
			standardRate = event.provider?.academicLevel?.find(level => level.level === currentGrade)?.rate;
			subsidizedRate = event.provider?.academicLevel?.find(level => level.level === currentGrade)?.subsidizedRate;
		}

		this.setState({
			skillSet: auth.dependents?.find(dependent => dependent._id == event?.dependent?._id)?.services ?? [],
			selectedDate: moment(event?.date),
			addressOptions: [DEPENDENTHOME, PROVIDEROFFICE, auth.dependents?.find(dependent => dependent._id == event?.dependent?._id)?.school?.name],
			standardRate: standardRate ? standardRate : '',
			subsidizedRate: subsidizedRate ? subsidizedRate : '',
			duration: event?.type === EVALUATION ? event?.provider?.separateEvaluationDuration : event?.provider?.duration,
			cancellationFee: event.provider.cancellationFee,
		});
		this.form?.setFieldsValue({ dependent: event?.dependent?._id, skill: event?.skillSet?._id, address: event?.location });
		this.onSelectDate(moment(event?.date));
	}

	handleChangeAddress = address => {
		this.setState({ address: address });
		this.onSelectDate();
	};

	onSelectDate = (newValue) => {
		const { event } = this.props;
		const newArrTime = this.getArrTime(newValue);
		this.setState({ selectedDate: newValue, selectedTimeIndex: -1 });

		if (newValue?.isSameOrAfter(new Date())) {
			newArrTime.map(time => {
				const { years, months, date } = newValue.toObject();
				time.value = moment(time.value).set({ years, months, date });

				let flag = true;
				this.props.listAppointmentsRecent?.filter(appointment => (appointment.status == 0) && (appointment.provider?._id == event?.provider?._id || appointment.dependent?._id == event?.dependent?._id))?.forEach(appointment => {
					if (time.value.isSame(moment(appointment.date))) {
						flag = false;
					}
				})

				if (!flag) {
					time.active = false;
				}
				return time;
			})
			this.setState({ arrTime: newArrTime });
		} else {
			this.setState({ arrTime: [] });
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
		const { appointments, appointmentsMonth, event, isFeeToParent } = this.props;
		const { years, months, date } = selectedDate.toObject();
		const hour = arrTime[selectedTimeIndex]?.value.clone().set({ years, months, date });

		if (!hour?.isAfter(moment()) || selectedTimeIndex < 0) {
			this.setState({ errorMessage: 'Please select a date and time' })
			return;
		}
		this.setState({ errorMessage: '' })
		if (event?.type === EVALUATION) {
			const appointment = event?.provider?.appointments?.find(a => a._id != event?._id && a.dependent == event?.dependent?._id && a.type === EVALUATION && a.status === PENDING);
			if (appointment) {
				message.warning("You can't create more evaluation.");
				return;
			}
		}

		let postData = {
			appointmentId: this.props.event?._id,
			date: hour?.valueOf(),
			location: address,
			notes: notes,
		};

		if (isFeeToParent) {
			postData = {
				...postData,
				isFeeToParent,
				items: [{
					type: 'Fee',
					date: moment(event.date).format('MM/DD/YYYY hh:mm a'),
					details: 'Rescheduled Appointment',
					rate: event.provider.cancellationFee || 0,
				}],
				totalPayment: event.provider.cancellationFee || 0,
			}
		}

		this.setState({ loadingSchedule: true });
		request.post(rescheduleAppointmentForParent, postData).then(result => {
			this.setState({ loadingSchedule: false });
			const { success, data } = result;
			if (success) {
				this.setState({ errorMessage: '' });
				const newAppointments = JSON.parse(JSON.stringify(appointments))?.map(a => a._id === event._id ? ({ ...data, parent: a.parent }) : a);
				const newAppointmentsInMonth = JSON.parse(JSON.stringify(appointmentsMonth))?.map(a => a._id === event._id ? ({ ...data, parent: a.parent }) : a);

				this.props.setAppointments(newAppointments);
				this.props.setAppointmentsInMonth(newAppointmentsInMonth);

				if (event?.type == EVALUATION) {
					message.success(`${event?.provider?.firstName ?? ''} ${event?.provider?.lastName ?? ''} requires a ${Durations?.find(a => a.value == this.state.duration)?.label} evaluation. Please proceed to schedule.`);
				} else {
					message.success('Successfully Rescheduled');
				}
				this.props.onSubmit();
			} else {
				this.setState({ errorMessage: result.data });
			}
		}).catch(err => {
			this.setState({ errorMessage: err.message, loadingSchedule: false });
		});
	}

	displayDuration = () => {
		const { event } = this.props;
		return `${moment(event?.date).format('MM/DD/YYYY hh:mm')} - ${moment(event?.date).add(event?.duration, 'minutes').format('hh:mm a')}`;
	}

	getFileUrl(path) {
		return url + 'uploads/' + path;
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
			cancellationFee,
			loadingSchedule,
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
							<p className='font-24 font-700'>{intl.formatMessage(messages.current)} {event?.type == APPOINTMENT && intl.formatMessage(messages.appointment)}{event?.type === EVALUATION && intl.formatMessage(messages.evaluation)}{event?.type === SCREEN && intl.formatMessage(messages.screening)}{event?.type === CONSULTATION && intl.formatMessage(messages.consultation)}</p>
							<p className='font-16'>{`${event?.dependent?.firstName ?? ''} ${event?.dependent?.lastName ?? ''}`}</p>
							<p className='font-16'>{`${event?.provider?.firstName ?? ''} ${event?.provider?.lastName ?? ''}`}</p>
						</Col>
						<Col xs={24} sm={24} md={8}>
							<p className={`font-16 ${event?.type != APPOINTMENT ? 'display-none' : ''}`}>{intl.formatMessage(msgCreateAccount.subsidy)}</p>
							<p className={`font-16 font-700 ${event?.type != EVALUATION ? 'display-none' : ''}`}>{event?.separateEvaluationDuration ?? ''} {intl.formatMessage(messages.evaluation)}</p>
							<p className='font-16'>{(event?.type === SCREEN || event?.type === CONSULTATION) ? event?.phoneNumber ?? '' : event?.location ?? ''}</p>
						</Col>
						<Col xs={24} sm={24} md={8}>
							<p></p>
							<p className='font-16'>{event?.skillSet?.name ?? ''}</p>
							<p className='font-16'>{event?.type === SCREEN ? event?.screeningTime ?? '' : this.displayDuration()}</p>
						</Col>
					</Row>
				</div>
				<div className='new-appointment'>
					<Form
						name="current-appointment"
						layout='vertical'
						onFinish={this.handleReschedule}
						ref={ref => this.form = ref}
					>
						<div className='flex gap-5 items-center'>
							<p className='font-30 mb-10'>{event?.type == APPOINTMENT && intl.formatMessage(messages.newAppointment)}{event?.type === EVALUATION && intl.formatMessage(messages.newEvaluation)}{event?.type === SCREEN && intl.formatMessage(messages.newScreening)}</p>
							{event?.type === EVALUATION && (
								<div className='font-20'>
									<div>{Durations?.find(a => a.value == event?.provider?.separateEvaluationDuration)?.label} evaluation</div>
									<div>Rate: ${event?.provider?.separateEvaluationRate}</div>
								</div>
							)}
						</div>
						<div className='flex flex-row items-center mb-10'>
							<p className='font-16 mb-0'>{intl.formatMessage(messages.selectOptions)}<sup>*</sup></p>
							{event?.type == APPOINTMENT && subsidyAvailable && (
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
									label={intl.formatMessage(msgCreateAccount.services)}
									rules={[{ required: true, message: 'Please select a service.' }]}
								>
									<Select
										placeholder={intl.formatMessage(msgCreateAccount.services)}
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
									rules={[{ required: [EVALUATION, APPOINTMENT, SUBSIDY].includes(event?.type), message: "Select an appointment location." }]}
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
						<Row gutter={14}>
							<Col xs={24} sm={24} md={12}>
								<Form.Item name="notes" label={intl.formatMessage(msgCreateAccount.notes)}>
									<Input.TextArea rows={3} onChange={e => this.handleChangeNote(e.target.value)} placeholder='Additional information you’d like to share with the provider' />
								</Form.Item>
							</Col>
							<Col xs={24} sm={24} md={12}>
								<Form.Item name="additionalDocuments" label={intl.formatMessage(messages.additionalDocuments)}>
									<div>
										{event?.addtionalDocuments?.map((document, index) => (
											<a
												key={index}
												href={this.getFileUrl(document.url)}
												target="_blank"
											>
												{document.name}
											</a>
										))}
									</div>
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
											{userRole > 3 && (event?.provider?.isPrivateForHmgh || event?.provider?.manualSchedule?.find(a => a.isPrivate && a.location === address && selectedDate?.isBetween(moment().set({ years: a.fromYear, months: a.fromMonth, dates: a.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }), moment().set({ years: a.toYear, months: a.toMonth, dates: a.toDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 0 })))) ? <FaCalendarAlt size={16} className="text-green500" /> : null}
										</p>
										<p className='font-700 ml-auto text-primary'>{event?.provider?.isNewClientScreening ? event?.provider?.appointments?.find(a => a.dependent == event?.dependent?._id && a.type === SCREEN && a.status === CLOSED) ? intl.formatMessage(messages.screenCompleted) : intl.formatMessage(messages.screeningRequired) : ''}</p>
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
											{standardRate && <p>{intl.formatMessage(msgCreateAccount.rate)}: ${standardRate}</p>}
											{(subsidizedRate && subsidizedRate != standardRate) && <p> {intl.formatMessage(messages.subsidizedRate)}: ${subsidizedRate}</p>}
											{cancellationFee && <p>{intl.formatMessage(msgCreateAccount.cancellationFee)}: ${cancellationFee}</p>}
										</div>
									</div>
									<div className='flex mt-10'>
										<div className='flex-1'>
											<p className='text-bold'>{intl.formatMessage(msgCreateAccount.services)}:</p>
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
															const availableTime = event?.provider?.manualSchedule?.find(time => time.dayInWeek === date.day() && time.location === address && time.isPrivate);
															if (availableTime) {
																const availableFromDate = moment().set({ years: availableTime.fromYear, months: availableTime.fromMonth, dates: availableTime.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
																const availableToDate = moment().set({ years: availableTime.toYear, months: availableTime.toMonth, dates: availableTime.toDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 0 });
																if (date.isBetween(availableFromDate, availableToDate) && !event?.provider?.blackoutDates?.find(blackoutDate => moment(new Date(blackoutDate)).year() === date.year() && moment(new Date(blackoutDate)).month() === date.month() && moment(new Date(blackoutDate)).date() === date.date())) {
																	return (<div className='absolute top-0 left-0 h-100 w-100 border border-1 border-warning rounded-2'></div>)
																}
															}
														}
													}}
													onSelect={this.onSelectDate}
													disabledDate={(date) => {
														if (date.set({ hours: 0, minutes: 0, seconds: 0 }).isBefore(moment())) {
															return true;
														}

														if (date.isAfter(moment()) && date.day() === 6) {
															return true;
														}

														const range = event?.provider?.manualSchedule?.find(d => d.dayInWeek === date.day() && d.location === address && date.isBetween(moment().set({ years: d.fromYear, months: d.fromMonth, dates: d.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }), moment().set({ years: d.toYear, months: d.toMonth, dates: d.toDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 0 })));
														if (range) {
															if (userRole < 100 && range.isPrivate) {
																return true;
															}
														} else {
															return true;
														}

														if (event?.provider?.blackoutDates?.find(blackoutDate => moment(new Date(blackoutDate)).year() === date.year() && moment(new Date(blackoutDate)).month() === date.month() && moment(new Date(blackoutDate)).date() === date.date())) {
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
												<div className='grid grid-columns-2 gap-2'>
													{arrTime?.map((time, index) => (
														<div key={index}>
															<div className={`${selectedTimeIndex === index ? 'active' : ''} ${time.active ? 'time-available' : 'time-not-available'} ${moment(event?.date)?.year() === selectedDate?.year() && moment(event?.date)?.month() === selectedDate?.month() && moment(event?.date)?.date() === selectedDate?.date() && moment(event?.date).hours() === time.value.hours() && moment(event?.date).minutes() === time.value.minutes() ? 'prev-time' : ''} ${event?.provider?.manualSchedule?.find(a => a.dayInWeek === selectedDate.day() && a.location === address && a.isPrivate && selectedDate.isBetween(moment().set({ years: a.fromYear, months: a.fromMonth, dates: a.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }), moment().set({ years: a.toYear, months: a.toMonth, dates: a.toDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 0 })) && (time.value?.isBetween(moment(time.value).clone().set({ hours: a.openHour, minutes: a.openMin }), moment(time.value).clone().set({ hours: a.closeHour, minutes: a.closeMin })) || time.value?.isSame(moment(time.value).set({ hours: a.openHour, minutes: a.openMin })))) ? 'border border-1 border-warning' : ''}`} onClick={() => time.active ? this.onSelectTime(index) : this.onSelectTime(-1)}>
																<p className='font-12 mb-0 flex items-center justify-center gap-1'><GoPrimitiveDot className={`${time.active ? 'active' : 'inactive'}`} size={15} />{moment(time.value)?.format('hh:mm a')}</p>
															</div>
														</div>
													))}
												</div>
											</Col>
										</Row>
									</div>
								</div>
							</Col>
						</Row>
						{errorMessage.length > 0 && (<p className='text-right text-red mr-5'>{errorMessage}</p>)}
						<Row className='justify-end gap-2 mt-10'>
							<Button key="back" onClick={this.props.onCancel}>
								{intl.formatMessage(messages.goBack).toUpperCase()}
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
								<Button key="submit" type="primary" htmlType='submit' loading={loadingSchedule}>
									{intl.formatMessage(msgDrawer.reschedule)?.toUpperCase()}
								</Button>
							)}
						</Row>
					</Form>
				</div>
			</Modal >
		);
	}
};

const mapStateToProps = state => ({
	appointments: state.appointments.dataAppointments,
	appointmentsMonth: state.appointments.dataAppointmentsMonth,
	auth: state.auth,
})

export default compose(connect(mapStateToProps, { setAppointments, setAppointmentsInMonth }))(ModalCurrentAppointment);