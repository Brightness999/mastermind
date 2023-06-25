import React from 'react';
import { Modal, Button, Row, Col, Switch, Select, Calendar, Upload, Input, message, Form } from 'antd';
import { BiChevronLeft, BiChevronRight, BiUpload } from 'react-icons/bi';
import { GoPrimitiveDot } from 'react-icons/go';
import intl from 'react-intl-universal';
import moment from 'moment';
import 'moment/locale/en-au';
import { connect } from 'react-redux';
import { compose } from 'redux';

import messages from './messages';
import msgCreateAccount from 'src/routes/Sign/CreateAccount/messages';
import msgLogin from 'src/routes/Sign/Login/messages';
import { url } from 'src/utils/api/baseUrl'
import request from 'src/utils/api/request'
import { createAppointmentForParent, getAllConsultantForParent, getAuthorizationUrl } from 'src/utils/api/apiList';
import { setMeetingLink, setSelectedTime, setSelectedUser } from 'src/redux/features/authSlice';
import { setAppointments, setAppointmentsInMonth } from 'src/redux/features/appointmentsSlice';
import { ADMINPREAPPROVED, CONSULTANT, CONSULTATION, PENDING } from 'src/routes/constant';
import './style/index.less';
import '../../assets/styles/login.less';

moment.locale('en');

class ModalReferralService extends React.Component {
	state = {
		selectedTimeIndex: -1,
		fileList: [],
		selectedDependent: undefined,
		selectedSkillSet: undefined,
		phoneNumber: undefined,
		note: undefined,
		isGoogleMeet: false,
		selectedDate: moment(),
		errorMessage: '',
		arrTime: [],
		appointments: [],
		consultants: [],
		skillSet: this.props.auth.skillSet,
		selectedSubsidy: undefined,
		loadingSchedule: false,
	}

	componentDidMount = () => {
		const { subsidy, auth } = this.props;

		if (auth.user.role == 3) {
			this.setState({ phoneNumber: auth.user?.parentInfo?.fatherPhoneNumber ? auth.user?.parentInfo?.fatherPhoneNumber : auth.user?.parentInfo?.motherPhoneNumber });
			this.form?.setFieldsValue({ phoneNumber: auth.user?.parentInfo?.fatherPhoneNumber ? auth.user?.parentInfo?.fatherPhoneNumber : auth.user?.parentInfo?.motherPhoneNumber });
		}

		if (subsidy) {
			const dependent = this.props.auth.dependents?.find(d => d._id == subsidy?.student?._id);
			this.setState({
				selectedSubsidy: subsidy?._id,
				selectedDependent: subsidy?.student?._id,
				skillSet: subsidy?.student?.services,
				selectedSkillSet: subsidy?.skillSet?._id,
			})
			this.form.setFieldsValue({
				selectedSubsidy: subsidy?._id,
				selectedDependent: subsidy?.student?._id,
				phoneNumber: dependent?.parent?.fatherPhoneNumber ?? dependent?.parent?.motherPhoneNumber,
				selectedSkillSet: subsidy?.skillSet?._id,
			});
			if (this.props.auth.user?.role > 3) {
				this.setState({ phoneNumber: dependent?.parent?.fatherPhoneNumber ?? dependent?.parent?.motherPhoneNumber });
			}
			this.getConsultationData(subsidy?.student?._id);
		}
		this.props.setMeetingLink('');
	}

	componentDidUpdate(prevProps) {
		if (prevProps?.auth?.meetingLink != this.props.auth?.meetingLink) {
			this.form?.setFieldValue('meetingLink', this.props.auth?.meetingLink);
		}
	}

	getConsultationData = (dependentId) => {
		request.post(getAllConsultantForParent, { dependentId: dependentId }).then(res => {
			const { success, data } = res;
			if (success) {
				this.setState({
					consultants: data?.consultants ?? [],
					appointments: data?.appointments ?? [],
				});
			}
		}).catch(err => {
			this.setState({ consultants: [], appointments: [] });
		});
	}

	createConsultation = () => {
		const { selectedDependent, selectedSkillSet, phoneNumber, fileList, note, selectedTimeIndex, selectedDate, arrTime, isGoogleMeet, selectedSubsidy } = this.state;
		const { subsidy, auth } = this.props;
		const meetingLink = this.form.getFieldValue("meetingLink");

		if (!selectedDate?.isAfter(new Date()) || selectedTimeIndex < 0) {
			this.setState({ errorMessage: 'Please select a date and time' });
			return;
		}
		this.setState({ errorMessage: '' });

		const existingConsultation = this.props.appointments.find(appointment => appointment.type === CONSULTATION && appointment.status === PENDING && appointment.dependent?._id === selectedDependent && moment(new Date(appointment.date).toLocaleString()).isSame(arrTime[selectedTimeIndex].value))
		if (existingConsultation) {
			message.warn("The consultation already exists");
			return;
		}

		const { years, months, date } = selectedDate.toObject();
		const selectedTime = arrTime[selectedTimeIndex]?.value.set({ years, months, date });
		const postData = {
			dependent: selectedDependent,
			skillSet: selectedSkillSet,
			date: selectedTime,
			phoneNumber: isGoogleMeet ? undefined : phoneNumber,
			meetingLink: isGoogleMeet ? meetingLink : undefined,
			addtionalDocuments: fileList.length > 0 ? [fileList[0].response.data] : [],
			notes: note,
			type: CONSULTATION,
			status: PENDING,
			subsidy: subsidy ? subsidy?._id : selectedSubsidy,
			consultant: auth.user.role === CONSULTANT ? auth.user.consultantInfo?._id : undefined,
		};

		this.setState({ loadingSchedule: true });
		request.post(createAppointmentForParent, postData).then(result => {
			this.setState({ loadingSchedule: false });
			const { success, data } = result;
			if (success) {
				this.props.setMeetingLink('');
				this.props.setAppointments([...this.props.appointments, data]);
				this.props.setAppointmentsInMonth([...this.props.appointmentsInMonth, data]);
				this.props.onSubmit();
			} else {
				message.error('cannot create referral');
			}
		}).catch(err => {
			message.error(err.message);
			this.setState({ loadingSchedule: false });
		})
	}

	onSelectTime = (index) => {
		this.setState({ selectedTimeIndex: index });
	}

	onChangeUpload = (info) => {
		if (info.file.status == 'removed') {
			this.setState({ fileList: [] })
			return;
		}
		if (info.file.status == 'done') {
			this.setState(prevState => ({
				fileList: info.fileList,
			}));
		}
	}

	changeMeetingType = () => {
		const { selectedTimeIndex, selectedDate, arrTime, isGoogleMeet, selectedDependent } = this.state;
		const { dependents } = this.props.auth;
		const meetingLink = this.form.getFieldValue('meetingLink');
		if (isGoogleMeet && !meetingLink) {
			const { years, months, date } = selectedDate.toObject();
			const selectedTime = arrTime[selectedTimeIndex]?.value.set({ years, months, date });

			this.props.setSelectedTime(selectedTime);
			this.props.setSelectedUser(dependents?.find(a => a?._id == selectedDependent)?.parent);
			request.post(getAuthorizationUrl).then(res => {
				window.open(res.data);
			})
		} else {
			this.createConsultation();
		}
	}

	prevMonth = () => {
		this.setState({
			selectedDate: moment(this.state.selectedDate).add(-1, 'month'),
			selectedTimeIndex: -1,
		});
		this.onSelectDate(moment(this.state.selectedDate).add(-1, 'month'));
	}

	nextMonth = () => {
		this.setState({
			selectedDate: moment(this.state.selectedDate).add(1, 'month'),
			selectedTimeIndex: -1,
		});
		this.onSelectDate(moment(this.state.selectedDate).add(1, 'month'));
	}

	handleSelectDependent = (dependentId) => {
		const dependent = this.props.auth.dependents?.find(d => d._id == dependentId);
		this.setState({
			selectedDependent: dependentId,
			skillSet: dependent?.services,
			selectedSkillSet: undefined,
		});

		this.form.setFieldsValue({ selectedSubsidy: undefined });
		if (this.props.auth.user?.role > 3) {
			this.form.setFieldsValue({
				phoneNumber: dependent?.parent?.fatherPhoneNumber ?? dependent?.parent?.motherPhoneNumber,
				selectedSkillSet: undefined,
			});
			this.setState({ phoneNumber: dependent?.parent?.fatherPhoneNumber ?? dependent?.parent?.motherPhoneNumber });
		}
		this.getConsultationData(dependentId);
	}

	handleSelectSkillSet = (skill) => {
		this.setState({ selectedSkillSet: skill });
		this.form.setFieldsValue({ selectedSubsidy: undefined });
	}

	handleSwitchMeeting = (status) => {
		this.setState({ isGoogleMeet: status });
	}

	handleChangePhonenumber = (phoneNumber) => {
		this.setState({ phoneNumber: phoneNumber });
	}

	handleSelectSubsidy = (subsidyId) => {
		const subsidy = this.props.listSubsidy?.find(s => s._id === subsidyId);
		const dependent = this.props.auth.dependents?.find(d => d._id == subsidy?.student?._id);
		this.setState({
			selectedDependent: subsidy?.student?._id,
			skillSet: subsidy?.student?.services,
			selectedSkillSet: subsidy?.skillSet?._id,
			selectedSubsidy: subsidyId,
		})
		this.form.setFieldsValue({
			selectedDependent: subsidy?.student?._id,
			phoneNumber: dependent?.parent?.fatherPhoneNumber ?? dependent?.parent?.motherPhoneNumber,
			selectedSkillSet: subsidy?.skillSet?._id,
		});
		if (this.props.auth.user?.role > 3) {
			this.setState({ phoneNumber: dependent?.parent?.fatherPhoneNumber ?? dependent?.parent?.motherPhoneNumber });
		}
		this.getConsultationData(subsidy?.student?._id);
	}

	onSelectDate = (newValue) => {
		this.setState({
			selectedDate: newValue,
			selectedTimeIndex: -1,
		});

		if (newValue.isSameOrAfter(new Date())) {
			const { appointments, consultants, selectedDependent } = this.state;
			const blackoutConsultants = consultants?.filter(consultant => consultant?.blackoutDates?.find(d => newValue.year() == moment(d).year() && newValue.month() == moment(d).month() && newValue.date() == moment(d).date()));

			if (blackoutConsultants?.length == consultants?.length) {
				this.setState({ arrTime: [] });
			} else {
				let arrTime = [];
				const ranges = consultants?.map(a => a.manualSchedule)?.flat()?.filter(a => a.dayInWeek == newValue.day() && newValue.isBetween(moment().set({ years: a.fromYear, months: a.fromMonth, dates: a.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }), moment().set({ years: a.toYear, months: a.toMonth, dates: a.toDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 0 })));
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
						for (let i = 0; i < (a.end - a.start) * 60 / 30; i++) {
							arrTime.push({
								value: startTime.clone().add(30 * i, 'minutes'),
								active: true,
							});
						}
					})

					const { years, months, date } = newValue.toObject();
					const dayInWeek = newValue.day();
					const newArrTime = arrTime.map(time => {
						if (selectedDependent) {
							time.value = time.value.set({ years: years, months: months, date: date });
							let consultant_length = 0; let appointment_length = 0;
							consultants.forEach(consultant => {
								const availableTime = consultant.manualSchedule.find(s => s.dayInWeek == dayInWeek);
								const fromDate = moment().set({ years: availableTime?.fromYear, months: availableTime?.fromMonth, date: availableTime?.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
								const toDate = moment().set({ years: availableTime?.toYear, months: availableTime?.toMonth, date: availableTime?.toDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 999 });
								const openTime = moment().set({ years, months, date, hours: availableTime?.openHour, minutes: availableTime?.openMin, seconds: 0, milliseconds: 0 });
								const closeTime = moment().set({ years, months, date, hours: availableTime?.closeHour, minutes: availableTime?.closeMin, seconds: 0, milliseconds: 0 });
								if (newValue.isBetween(fromDate, toDate) && (time.value.isSameOrAfter(openTime) && time.value.isSameOrBefore(closeTime))) {
									consultant_length++;
								}
							})
							appointments.forEach(appointment => {
								if (time.value.isSame(moment(appointment.date))) {
									appointment_length++;
								}
							})
							if (consultant_length - appointment_length > 0) {
								time.active = true;
							} else {
								time.active = false;
							}
						} else {
							time.active = false;
						}
						return time;
					})
					this.setState({ arrTime: newArrTime });
				} else {
					this.setState({ arrTime: [] });
				}
			}
		} else {
			this.setState({ arrTime: [] });
		}
	}

	render() {
		const { loadingSchedule, selectedDate, selectedTimeIndex, selectedDependent, selectedSkillSet, phoneNumber, note, isGoogleMeet, errorMessage, arrTime, skillSet, consultants, selectedSubsidy } = this.state;
		const { auth, listSubsidy, subsidy } = this.props;
		const subsidiaries = listSubsidy?.filter(s => s.status === ADMINPREAPPROVED && !s.consultation?.date) ?? [];

		const modalProps = {
			className: 'modal-referral-service',
			title: "",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: (e) => e.target.className !== 'ant-modal-wrap' && this.props.onCancel(),
			width: 900,
			footer: []
		};

		const props = {
			name: 'file',
			action: url + "clients/upload_document",
			headers: {
				authorization: 'authorization-text',
			},
			onChange: this.onChangeUpload,
			maxCount: 1,
		};

		return (
			<Modal {...modalProps}>
				<div className='new-appointment'>
					<div className='flex mt-10'>
						<p className='font-30'>{intl.formatMessage(messages.referralService)}</p>
						<img src='../images/hands.png' alt='hands-up' className='hands-img' />
					</div>
					<Form
						name='consultation-form'
						layout='vertical'
						onFinish={this.changeMeetingType}
						ref={ref => this.form = ref}
					>
						<p className='font-16 mb-5'>{intl.formatMessage(messages.selectOptions)}</p>
						<Row gutter={20} className='mb-10' align="bottom">
							<Col xs={24} sm={24} md={8} className='select-small'>
								{!!subsidiaries?.length ? (
									<Form.Item
										name='selectedSubsidy'
										label={intl.formatMessage(msgCreateAccount.subsidyRequest)}
									>
										<Select
											placeholder={intl.formatMessage(msgCreateAccount.subsidyRequest)}
											value={selectedSubsidy}
											onChange={v => this.handleSelectSubsidy(v)}
											disabled={!!subsidy}
										>
											{subsidiaries?.map((s, index) => (
												<Select.Option key={index} value={s._id}>{s?.student?.firstName ?? ''} {s?.student?.lastName ?? ''}({s?.skillSet?.name ?? ''})</Select.Option>
											))}
										</Select>
									</Form.Item>
								) : null}
								<Form.Item
									name='selectedDependent'
									label={intl.formatMessage(msgCreateAccount.dependent)}
									rules={[{ required: true, message: intl.formatMessage(messages.pleaseSelect) + ' ' + intl.formatMessage(msgCreateAccount.dependent) }]}
								>
									<Select
										placeholder={intl.formatMessage(msgCreateAccount.dependent)}
										value={selectedDependent}
										onChange={v => this.handleSelectDependent(v)}
										disabled={!!subsidy}
									>
										{auth.dependents?.map((dependent, index) => (
											<Select.Option key={index} value={dependent._id}>{dependent.firstName} {dependent.lastName}</Select.Option>
										))}
									</Select>
								</Form.Item>
							</Col>
							<Col xs={24} sm={24} md={8} className='select-small'>
								<Form.Item
									name='selectedSkillSet'
									label={intl.formatMessage(msgCreateAccount.services)}
									rules={[{ required: true, message: intl.formatMessage(messages.pleaseSelect) + ' ' + intl.formatMessage(msgCreateAccount.services).slice(0, -1) }]}
								>
									<Select
										placeholder={intl.formatMessage(msgCreateAccount.services)}
										value={selectedSkillSet}
										onChange={v => this.handleSelectSkillSet(v)}
										disabled={!!subsidy}
									>
										{skillSet?.map((skill, index) => (
											<Select.Option key={index} value={skill._id}>{skill.name}</Select.Option>
										))}
									</Select>
								</Form.Item>
							</Col>
							<Col xs={24} sm={24} md={8}>
								<div className='flex gap-2 pb-10'>
									<div>{intl.formatMessage(messages.byPhone)}</div>
									<Switch className='phone-googlemeet-switch' checked={isGoogleMeet} onChange={(status) => this.handleSwitchMeeting(status)} />
									<div>{intl.formatMessage(messages.googleMeet)}</div>
								</div>
								<Form.Item
									name='phoneNumber'
									label={intl.formatMessage(msgCreateAccount.contactNumber)}
									rules={[
										{ required: !isGoogleMeet, message: intl.formatMessage(msgLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.contactNumber) },
										{ pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$', message: intl.formatMessage(messages.phoneNumberValid) },
									]}
									className={`${isGoogleMeet ? 'd-none' : ''}`}
								>
									<Input
										placeholder={intl.formatMessage(msgCreateAccount.contactNumber)}
										value={phoneNumber}
										onChange={e => this.handleChangePhonenumber(e.target.value)}
									/>
								</Form.Item>
								<Form.Item
									name='meetingLink'
									label={intl.formatMessage(messages.meetingLink)}
									rules={[{ required: false }]}
									className={`${isGoogleMeet ? '' : 'd-none'}`}
								>
									<Input className='meeting-link' disabled />
								</Form.Item>
							</Col>
						</Row>
						<Row gutter={10}>
							<Col xs={24} sm={24} md={8}>
								<div className='provider-profile'>
									<p className='font-14 font-700'>{intl.formatMessage(messages.additionalDocuments)}</p>
									<div className='upload-document flex-1 mb-10'>
										<Upload {...props}>
											<Button size='small' type='primary' className='btn-upload'>
												{intl.formatMessage(messages.upload).toUpperCase()} <BiUpload size={16} />
											</Button>
										</Upload>
									</div>
									<Input.TextArea
										name='ReferralNote'
										value={note}
										onChange={e => { this.setState({ note: e.target.value }) }}
										rows={6}
										placeholder={intl.formatMessage(messages.notes)}
										className='font-12'
									/>
								</div>
							</Col>
							<Col xs={24} sm={24} md={16}>
								<div className='px-20'>
									<p className='font-700'>{intl.formatMessage(msgCreateAccount.selectDateTime)}</p>
									<div className='calendar'>
										<Row gutter={15}>
											<Col xs={24} sm={24} md={12}>
												<Calendar
													fullscreen={false}
													value={selectedDate}
													onSelect={this.onSelectDate}
													disabledDate={(date) => {
														if (date.isBefore(moment())) {
															return true;
														}

														const ranges = consultants?.filter(consultant => consultant?.manualSchedule?.find(d => d.dayInWeek == date.day() && date.isBetween(moment().set({ years: d.fromYear, months: d.fromMonth, dates: d.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }), moment().set({ years: d.toYear, months: d.toMonth, dates: d.toDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 0 }))));
														if (!ranges?.length) {
															return true;
														}

														const blackoutConsultants = consultants?.filter(consultant => consultant?.blackoutDates?.find(d => date.year() == moment(d).year() && date.month() == moment(d).month() && date.date() == moment(d).date()));
														if (blackoutConsultants?.length == consultants?.length) {
															return true;
														}

														return false;
													}}
													headerRender={() => (
														<div className='mb-10'>
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
															<div className={`${selectedTimeIndex === index ? 'active' : ''} ${time.active ? 'time-available' : 'time-not-available'}`} onClick={() => time.active ? this.onSelectTime(index) : this.onSelectTime(-1)}>
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
						<Row justify='end' className='gap-2 mt-10'>
							<Button key="back" onClick={this.props.onCancel}>
								{intl.formatMessage(messages.goBack).toUpperCase()}
							</Button>
							<Button key="submit" type="primary" htmlType='submit' loading={loadingSchedule}>
								{intl.formatMessage(messages.scheduleConsultation).toUpperCase()}
							</Button>
						</Row>
					</Form>
				</div>
			</Modal>
		);
	}
};

const mapStateToProps = state => ({
	auth: state.auth,
	appointments: state.appointments.dataAppointments,
	appointmentsInMonth: state.appointments.dataAppointmentsMonth,
	listSubsidy: state.appointments.dataSubsidyRequests,
});

export default compose(connect(mapStateToProps, { setMeetingLink, setSelectedTime, setSelectedUser, setAppointments, setAppointmentsInMonth }))(ModalReferralService);