import React from 'react';
import { Modal, Button, Row, Col, Switch, Select, Calendar, Upload, Input, message, Form } from 'antd';
import { BiChevronLeft, BiChevronRight, BiUpload } from 'react-icons/bi';
import { GoPrimitiveDot } from 'react-icons/go';
import intl from 'react-intl-universal';
import messages from './messages';
import msgCreateAccount from '../../routes/Sign/CreateAccount/messages';
import msgReview from '../../routes/Sign/SubsidyReview/messages';
import msgRequest from '../../routes/Sign/SubsidyRequest/messages';
import moment from 'moment';
import './style/index.less';
import '../../assets/styles/login.less';
import { url } from '../../utils/api/baseUrl'
import request from '../../utils/api/request'
import 'moment/locale/en-au';
import { createAppointmentForParent, getAllConsultantForParent } from '../../utils/api/apiList';
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
	}

	componentDidMount = () => {
		let arrTime = [];
		let hour9AM = moment().set({ hours: 9, minutes: 0, seconds: 0, milliseconds: 0 });
		for (let i = 0; i < 6; i++) {
			let newTime = hour9AM.clone();
			hour9AM = hour9AM.add(30, 'minutes')
			arrTime.push({
				value: newTime,
				active: false,
			});
		}
		let hour2PM = moment().set({ hours: 14, minutes: 0, seconds: 0, milliseconds: 0 });
		for (let i = 0; i < 8; i++) {
			let newTime = hour2PM.clone();
			hour2PM = hour2PM.add(30, 'minutes')
			arrTime.push({
				value: newTime,
				active: false,
			});
		}
		this.setState({ arrTime: arrTime });
	}

	getConsultationData = (dependentId) => {
		request.post(getAllConsultantForParent, { dependentId: dependentId }).then(res => {
			if (res.success) {
				this.setState({
					consultants: res.data?.consultants,
					appointments: res.data?.appointments,
				});
			} else {
				this.setState({ consultants: [], appointments: [] });
			}
		}).catch(err => {
			console.log('get all consultants error---', err);
			this.setState({ consultants: [], appointments: [] });
		});
	}

	createConsulation = () => {
		const { selectedDependent, selectedSkillSet, phoneNumber, fileList, note, selectedTimeIndex, selectedDate, arrTime, isGoogleMeet } = this.state;

		if (!selectedDate?.isAfter(new Date()) || selectedTimeIndex < 0) {
			this.setState({ errorMessage: 'Please select a date and time' });
			return;
		}
		this.setState({ errorMessage: '' });

		const { years, months, date } = selectedDate.toObject();
		const selectedTime = arrTime[selectedTimeIndex]?.value.set({ years, months, date });
		const postData = {
			dependent: selectedDependent,
			skillSet: selectedSkillSet,
			date: selectedTime,
			phoneNumber: isGoogleMeet ? undefined : phoneNumber,
			addtionalDocuments: fileList.length > 0 ? [fileList[0].response.data] : [],
			notes: note,
			type: 4,
			status: 0,
		};

		request.post(createAppointmentForParent, postData).then(result => {
			if (result.success) {
				this.setState({
					selectedDate: undefined,
					selectedTimeIndex: -1,
					arrTime: this.state.arrTime.map(time => { time.active = false; return time; }),
					selectedDependent: undefined,
					selectedSkillSet: undefined,
				})
				this.form.setFieldsValue({ selectedDependent: undefined, selectedSkillSet: undefined });
				this.props.onSubmit();
			} else {
				message.error('cannot create referral');
			}
		}).catch(err => {
			console.log(err);
			message.error('cannot create referral');
		})
	}

	onFinishFailed = (values) => {
		console.log('Failed', values);
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

	changeMeetingType = (status) => {
		this.setState({ isGoogleMeet: status });
	}

	prevMonth = () => {
		if (moment(this.state.selectedDate).add(-1, 'month').isAfter(new Date())) {
			this.setState({
				selectedDate: moment(this.state.selectedDate).add(-1, 'month'),
				selectedTimeIndex: -1,
			});
		}
	}

	nextMonth = () => {
		if (moment(this.state.selectedDate).add(1, 'month').isAfter(new Date())) {
			this.setState({
				selectedDate: moment(this.state.selectedDate).add(1, 'month'),
				selectedTimeIndex: -1,
			});
		}
	}

	handleSelectDependent = (value) => {
		this.setState({ selectedDependent: value });
		this.getConsultationData(value);
	}

	onSelectDate = (newValue) => {
		if (newValue.isSameOrAfter(new Date())) {
			this.setState({
				selectedDate: newValue,
				selectedTimeIndex: -1,
			});
			const { appointments, consultants, arrTime, selectedDependent } = this.state;
			const { years, months, date } = newValue.toObject();
			const dayInWeek = newValue.day();
			const newArrTime = arrTime.map(time => {
				if (selectedDependent) {
					time.value = time.value.set({ years: years, months: months, date: date });
					let consultant_length = 0; let appointment_length = 0;
					consultants.forEach(consultant => {
						const availableTime = consultant.manualSchedule.find(s => s.dayInWeek == dayInWeek);
						const fromDate = moment().set({ years: availableTime?.fromYear, months: availableTime?.fromMonth, date: availableTime?.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
						const toDate = moment().set({ years: availableTime?.toYear, months: availableTime?.toMonth, date: availableTime?.toDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
						const openTime = moment().set({ years, months, date, hours: availableTime?.openHour, minutes: availableTime?.openMin });
						const closeTime = moment().set({ years, months, date, hours: availableTime?.closeHour, minutes: availableTime?.closeMin });
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
		}
	}

	render() {
		const { selectedDate, selectedTimeIndex, selectedDependent, selectedSkillSet, phoneNumber, note, isGoogleMeet, errorMessage, arrTime } = this.state;

		const modalProps = {
			className: 'modal-referral-service',
			title: "",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: this.props.onCancel,
			closable: false,
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
						<img src='../images/hands.png' className='hands-img' />
					</div>
					<Form
						name='consultation-form'
						onFinish={this.createConsulation}
						onFinishFailed={this.onFinishFailed}
						ref={ref => this.form = ref}
					>
						<Row gutter={20} className='mb-10' align="bottom">
							<Col xs={24} sm={24} md={8} className='select-small'>
								<p className='font-16 mb-5'>{intl.formatMessage(messages.selectOptions)}</p>
								<Form.Item name='selectedDependent' rules={[{ required: true, message: intl.formatMessage(messages.pleaseSelect) + ' ' + intl.formatMessage(msgCreateAccount.dependent) }]}>
									<Select
										placeholder={intl.formatMessage(msgCreateAccount.dependent)}
										value={selectedDependent}
										onChange={v => this.handleSelectDependent(v)}
									>
										{this.props.listDependents?.map((dependent, index) => (
											<Select.Option key={index} value={dependent._id}>{dependent.firstName} {dependent.lastName}</Select.Option>
										))}
									</Select>
								</Form.Item>
							</Col>
							<Col xs={24} sm={24} md={8} className='select-small'>
								<Form.Item name='selectedSkillSet' rules={[{ required: true, message: intl.formatMessage(messages.pleaseSelect) + ' ' + intl.formatMessage(msgCreateAccount.skillsets).slice(0, -1) }]}>
									<Select
										placeholder={intl.formatMessage(msgCreateAccount.skillsets)}
										value={selectedSkillSet}
										onChange={v => this.setState({ selectedSkillSet: v })}
									>
										{this.props.SkillSet?.map((skill, index) => (
											<Select.Option key={index} value={skill._id}>{skill.name}</Select.Option>
										))}
									</Select>
								</Form.Item>
							</Col>
							<Col xs={24} sm={24} md={8}>
								<div className='flex gap-2 pb-10'>
									<div>{intl.formatMessage(messages.byPhone)}</div>
									<Switch className='phone-googlemeet-switch' checked={isGoogleMeet} onChange={this.changeMeetingType} />
									<div>{intl.formatMessage(messages.googleMeet)}</div>
								</div>
								<Form.Item
									name='phoneNumber'
									rules={[
										{ required: !isGoogleMeet, message: intl.formatMessage(messages.pleaseEnter) + ' ' + intl.formatMessage(messages.contactNumber) },
										{ pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$', message: intl.formatMessage(messages.phoneNumberValid) },
									]}
								>
									<Input
										placeholder={intl.formatMessage(msgCreateAccount.phoneNumber)}
										value={phoneNumber}
										onChange={v => this.setState({ phoneNumber: v.target.value })}
										className={`${isGoogleMeet ? 'display-none' : ''}`}
									/>
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
												{intl.formatMessage(msgRequest.upload).toUpperCase()} <BiUpload size={16} />
											</Button>
										</Upload>
									</div>
									<Input.TextArea
										value={note}
										onChange={e => { this.setState({ note: e.target.value }) }}
										rows={6}
										placeholder={intl.formatMessage(msgReview.notes)}
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
													disabledDate={(date) => date.isBefore(new Date())}
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
												<Row gutter={15}>
													{arrTime?.map((time, index) => (
														<Col key={index} span={12}>
															<div className={selectedTimeIndex === index ? 'time-available active' : 'time-available'} onClick={() => time.active ? this.onSelectTime(index) : this.onSelectTime(-1)}>
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
						<Row justify='end' className='gap-2'>
							<Button key="back" onClick={this.props.onCancel}>
								{intl.formatMessage(msgReview.goBack).toUpperCase()}
							</Button>
							<Button key="submit" type="primary" htmlType='submit'>
								{intl.formatMessage(messages.scheduleConsultation).toUpperCase()}
							</Button>
						</Row>
					</Form>
				</div>
			</Modal>
		);
	}
};

export default ModalReferralService;