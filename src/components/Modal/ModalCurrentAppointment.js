import React from 'react';
import { Modal, Button, Row, Col, Switch, Select, Typography, Calendar, Avatar, Input, Popover, message, Form } from 'antd';
import { BiChevronLeft, BiChevronRight, BiSearch } from 'react-icons/bi';
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

class ModalCurrentAppointment extends React.Component {
	state = {
		selectedDate: moment(),
		isChoose: -1,
		isSelectTime: -1,
		listProvider: [],
		selectedSkillSet: -1,
		address: '',
		addressOptions: [],
		selectedDependent: undefined,
		selectedProvider: undefined,
		arrTime: [],
		errorMessage: '',
		skillSet: [],
		searchKey: '',
		appointmentType: 3,
		phoneNumber: '',
		notes: '',
		providerErrorMessage: '',
		isConfirm: false,
		isPopupConfirm: false,
	}

	componentDidMount() {
		let arrTime = [];
		let hour9AM = moment('2022-10-30 9:00:00');
		for (let i = 0; i < 6; i++) {
			let newTime = hour9AM.clone();
			hour9AM = hour9AM.add(30, 'minutes')
			arrTime.push({
				value: newTime,
				active: false,
			});
		}
		let hour2PM = moment('2022-10-30 14:00:00');
		for (let i = 0; i < 8; i++) {
			let newTime = hour2PM.clone();
			hour2PM = hour2PM.add(30, 'minutes')
			arrTime.push({
				value: newTime,
				active: false,
			});
		}
		this.setState({ arrTime: arrTime });
		this.searchProvider()
	}

	componentDidUpdate(prevProps) {
		if (prevProps.SkillSet != this.props.SkillSet) {
			this.setState({ skillSet: this.props.SkillSet });
		}
	}

	searchProvider(searchKey, address, selectedSkillSet) {
		const data = {
			search: searchKey,
			address: address,
			skill: selectedSkillSet
		};
		request.post('clients/search_providers', data).then(result => {
			if (result.success) {
				this.setState({
					listProvider: result.data.providers,
					addressOptions: result.data?.locations,
					isChoose: -1,
					selectedProvider: undefined,
				});
			}
		}).catch(err => {
			console.log('provider list error-----', err);
		})
	}

	createAppointment = () => {
		const { isSelectTime, selectedDate, selectedProvider, arrTime } = this.state;
		if (selectedProvider == undefined) {
			this.setState({ providerErrorMessage: intl.formatMessage(messages.selectProvider) })
			return;
		}
		if (!selectedDate?.isAfter(new Date()) || isSelectTime < 0) {
			this.setState({ errorMessage: 'Please select a date and time' })
			return;
		}
		this.setState({ errorMessage: '' })
		const { years, months, date } = selectedDate.toObject();
		const hour = arrTime[isSelectTime].value.clone().set({ years, months, date });
		this.setState({ selectedDate: hour });
		this.onConfirm();
	}

	onFinishFailed = (err) => {
		console.log('form data error---', err);
	}

	handleChangeAddress = address => {
		this.setState({ address: address });
		this.searchProvider(this.state.searchKey, address, this.state.selectedSkillSet);
	};

	onSelectDate = (newValue) => {
		if (newValue.isSameOrAfter(new Date())) {
			this.setState({
				selectedDate: newValue,
				isSelectTime: -1,
			});
			const { isChoose, arrTime, listProvider } = this.state;
			if (isChoose > -1) {
				const newArrTime = JSON.parse(JSON.stringify(arrTime));
				const selectedDay = newValue.day();
				const appointments = listProvider[isChoose]?.appointments?.filter(appointment => appointment.status == 0) ?? [];
				const availableTime = listProvider[isChoose]?.manualSchedule?.[selectedDay];
				if (availableTime) {
					newArrTime.map(time => {
						const { years, months, date } = newValue.toObject();
						time.value = moment(time.value).set({ years, months, date });
						if ((time.value.hour() > availableTime.openHour && time.value.hour() < availableTime.closeHour) || (time.value.hour() == availableTime.openHour && time.value.minute() >= availableTime.openMin) || (time.value.hour() == availableTime.closeHour && time.value.minute() <= availableTime.closeMin)) {
							let flag = true;
							appointments.forEach(appointment => {
								if (time.value.isSame(moment(appointment.date))) {
									flag = false;
								}
							})
							if (flag) {
								time.active = true;
							} else {
								time.active = false;
							}
						} else {
							time.active = false;
						}
						return time;
					})
				} else {
					newArrTime.map(time => {
						time.active = false;
						return time;
					})
				}
				this.setState({ arrTime: newArrTime });
			}
		}
	}

	nextMonth = () => {
		if (moment(this.state.selectedDate).add(1, 'month').isAfter(new Date())) {
			this.setState({
				selectedDate: moment(this.state.selectedDate).add(1, 'month'),
				isSelectTime: -1,
			});
		}
	}

	prevMonth = () => {
		if (moment(this.state.selectedDate).add(-1, 'month').isAfter(new Date())) {
			this.setState({
				selectedDate: moment(this.state.selectedDate).add(-1, 'month'),
				isSelectTime: -1,
			});
		}
	}

	onChooseProvider = (providerIndex) => {
		const { listProvider, arrTime, selectedDate } = this.state;
		const newArrTime = JSON.parse(JSON.stringify(arrTime));
		const appointments = listProvider[providerIndex]?.appointments?.filter(appointment => appointment.status == 0) ?? [];
		const availableTime = listProvider[providerIndex]?.manualSchedule?.[selectedDate.day()];
		if (availableTime) {
			newArrTime.map(time => {
				const { years, months, date } = selectedDate?.toObject();
				time.value = moment(time.value).set({ years, months, date });
				if ((time.value.hour() > availableTime.openHour && time.value.hour() < availableTime.closeHour) || (time.value.hour() == availableTime.openHour && time.value.minute() >= availableTime.openMin) || (time.value.hour() == availableTime.closeHour && time.value.minute() <= availableTime.closeMin)) {
					let flag = true;
					appointments.forEach(appointment => {
						if (time.value.isSame(moment(appointment.date))) {
							flag = false;
						} else {
							flag = true;
						}
					})
					if (flag) {
						time.active = true;
					} else {
						time.active = false;
					}
				} else {
					time.active = false;
				}
				return time;
			})
		} else {
			newArrTime.map(time => {
				time.active = false;
				return time;
			})
		}
		if (listProvider[providerIndex].isNewClientScreening && !appointments?.find(appointment => (appointment.type == 1 && appointment.status == -1))) {
			this.setState({ appointmentType: 1 });
		}
		if (listProvider[providerIndex].isSeparateEvaluationRate && !appointments?.find(appointment => (appointment.type == 2 && appointment.status == -1))) {
			if (listProvider[providerIndex].isNewClientScreening && !appointments?.find(appointment => (appointment.type == 1 && appointment.status == -1))) {
				this.setState({ appointmentType: 1 });
			} else {
				this.setState({ appointmentType: 2 });
			}
		}
		if (appointments?.find(appointment => appointment.type == 3) || (!listProvider[providerIndex].isSeparateEvaluationRate && !listProvider[providerIndex].isNewClientScreening)) {
			this.setState({ appointmentType: 3 });
		}

		this.setState({
			isChoose: providerIndex,
			selectedProvider: listProvider[providerIndex]._id,
			arrTime: newArrTime,
		});
	}

	onSelectTime = (index) => {
		this.setState({ isSelectTime: index })
	}

	requestUpdateAppointment(postData) {
		request.post('clients/reschedule_appointment', postData).then(result => {
			if (result.success) {
				this.setState({ errorMessage: '' });
				this.searchProvider();
				this.props.onSubmit();
			} else {
				this.setState({ errorMessage: result.data });
			}
		}).catch(err => {
			this.setState({ errorMessage: err.message });
		});
	}

	handleSearchProvider = (value) => {
		this.setState({ searchKey: value });
		this.searchProvider(value, this.state.address, this.state.selectedSkillSet);
	}

	handlelSelectDependent = (dependentId) => {
		const dependents = store.getState().auth.user?.studentInfos;
		this.setState({
			selectedDependent: dependentId,
			skillSet: dependents?.find(dependent => dependent._id == dependentId)?.services,
		});
	}

	handleSelectSkill = (skill) => {
		this.setState({ selectedSkillSet: skill });
		this.searchProvider(this.state.searchKey, this.state.address, skill);
	}

	handleChangePhone = (number) => {
		this.setState({ phoneNumber: number });
	}
	handleChangeNote = (notes) => {
		this.setState({ notes: notes });
	}

	onConfirm = () => {
		this.setState({
			isConfirm: true,
			isPopupConfirm: true,
		});
	}

	displayTime = (value) => {
		return `${value?.split(' ')[0]?.split(':')[0]}:${value?.split(' ')[0]?.split(':')[1]} ${value?.split(' ')[1]}`;
	}

	handleReschedule = () => {
		const { appointmentType, selectedDate, selectedSkillSet, address, selectedDependent, selectedProvider, arrTime, phoneNumber, notes, listProvider, isChoose } = this.state;
		const postData = {
			_id: this.props.event?._id,
			skillSet: selectedSkillSet,
			dependent: selectedDependent,
			provider: selectedProvider,
			date: selectedDate.valueOf(),
			location: appointmentType > 1 ? address : '',
			phoneNumber: appointmentType == 1 ? phoneNumber : '',
			notes: notes,
			type: appointmentType,
			status: 0,
		};
		this.requestUpdateAppointment(postData);
	}

	render() {
		const { selectedDate, isChoose, isSelectTime, listProvider, selectedProvider, skillSet, arrTime, errorMessage, providerErrorMessage, addressOptions, appointmentType, selectedDependent, address, phoneNumber } = this.state;
		const { event } = this.props;
		const user = store.getState().auth.user;
		const modalProps = {
			className: 'modal-current',
			title: "",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: this.props.onCancel,
			closable: false,
			width: 900,
			footer: []
		};

		const contentConfirm = (
			<div className='confirm-content'>
				<p className='text-center mb-5'>{intl.formatMessage(messages.areSureChangeAppoint)}</p>
				<Row gutter={10}>
					<Col xs={24} sm={24} md={12}>
						<p className='font-12 text-center mb-0'>{intl.formatMessage(messages.current)}</p>
						<div className='current-content'>
							<p className='font-10'>30 minutes {intl.formatMessage(messages.meetingWith)} <span className='font-11 font-700'>{event?.provider?.name}</span></p>
							<p className='font-10'>{intl.formatMessage(msgDrawer.who)}: {`${event?.dependent?.firstName} ${event?.dependent?.lastName}`}</p>
							{event?.type == 1 ? <p className='font-10'>{intl.formatMessage(msgDrawer.phonenumber)}: {event?.phoneNumber}</p> : <p className='font-10'>{intl.formatMessage(msgDrawer.where)}: {event?.location}</p>}
							<p className='font-10 nobr'>{intl.formatMessage(msgDrawer.when)}: <span className='font-11 font-700'>{this.displayTime(new Date(event?.date)?.toLocaleTimeString())}</span> on <span className='font-11 font-700'>{new Date(event?.date)?.toLocaleDateString()}</span></p>
						</div>
					</Col>
					<Col xs={24} sm={24} md={12}>
						<p className='font-12 text-center mb-0'>{intl.formatMessage(messages.new)}</p>
						<div className='new-content'>
							<p className='font-10'>30 minutes {intl.formatMessage(messages.meetingWith)} <span className='font-11 font-700'>{listProvider[isChoose]?.name}</span></p>
							<p className='font-10'>{intl.formatMessage(msgDrawer.who)}: {`${user?.studentInfos?.find(dependent => dependent._id == selectedDependent)?.firstName} ${user?.studentInfos?.find(dependent => dependent._id == selectedDependent)?.lastName}`}</p>
							{appointmentType == 1 ? <p className='font-10'>{intl.formatMessage(msgDrawer.phonenumber)}: {phoneNumber}</p> : <p className='font-10'>{intl.formatMessage(msgDrawer.where)}: {address}</p>}
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
							<p className='font-24 font-700'>{intl.formatMessage(messages.current)} {event?.type == 3 && intl.formatMessage(messages.appointment)}{event?.type == 2 && intl.formatMessage(messages.evaluation)}{event?.type == 1 && intl.formatMessage(messages.screening)}</p>
							<p className='font-16'>{`${event?.dependent?.firstName} ${event?.dependent?.lastName}`}</p>
							<p className='font-16'>{event?.provider?.name}</p>
						</Col>
						<Col xs={24} sm={24} md={8}>
							<p className={`font-16 ${event?.type != 3 ? 'display-none' : ''}`}>{intl.formatMessage(msgCreateAccount.subsidy)}</p>
							<p className={`font-16 font-700 ${event?.type != 2 ? 'display-none' : ''}`}>{event?.separateEvaluationDuration} {intl.formatMessage(messages.evaluation)}</p>
							<p className='font-16'>{event?.type == 1 ? event?.phoneNumber : event?.location}</p>
						</Col>
						<Col xs={24} sm={24} md={8}>
							<p></p>
							<p className='font-16'>{event?.skillSet?.name}</p>
							<p className='font-16'>{`${new Date(event?.date)?.toLocaleDateString()} ${this.displayTime(new Date(event?.date)?.toLocaleTimeString())}`}</p>
						</Col>
					</Row>
				</div>
				<div className='new-appointment'>
					<Form onFinish={this.createAppointment} onFinishFailed={this.onFinishFailed}>
						<div className='flex gap-5 items-center'>
							<p className='font-30 mb-10'>{appointmentType == 3 && intl.formatMessage(messages.newAppointment)}{appointmentType == 2 && intl.formatMessage(messages.newEvaluation)}{appointmentType == 1 && intl.formatMessage(messages.newScreening)}</p>
							{appointmentType == 2 && (
								<div className='font-20'>
									<div>{listProvider[isChoose]?.separateEvaluationDuration} evaluation</div>
									<div>Rate: ${listProvider[isChoose]?.separateEvaluationRate}</div>
								</div>
							)}
						</div>
						<div className='flex flex-row items-center mb-10'>
							<p className='font-16 mb-0'>{intl.formatMessage(messages.selectOptions)}<sup>*</sup></p>
							{appointmentType == 3 && (
								<div className='flex flex-row items-center ml-20'>
									<Switch size="small" defaultChecked />
									<p className='ml-10 mb-0'>{intl.formatMessage(messages.subsidyOnly)}</p>
								</div>
							)}
						</div>
						<Row gutter={20}>
							<Col xs={24} sm={24} md={appointmentType == 1 ? 6 : 8} className='select-small'>
								<Form.Item name="dependent" rules={[{ required: true, message: 'Please select a dependent' }]}>
									<Select
										showSearch
										optionFilterProp="children"
										filterOption={(input, option) => option.children?.join('').includes(input)}
										filterSort={(optionA, optionB) => optionA.children?.join('').toLowerCase().localeCompare(optionB.children?.join('').toLowerCase())}
										onChange={value => this.handlelSelectDependent(value)}
										placeholder={intl.formatMessage(msgCreateAccount.dependent)}
									>
										{user?.studentInfos?.map((dependent, index) => (
											<Select.Option key={index} value={dependent._id}>{dependent.firstName} {dependent.lastName}</Select.Option>
										))}
									</Select>
								</Form.Item>
							</Col>
							<Col xs={24} sm={24} md={appointmentType == 1 ? 6 : 8} className='select-small'>
								<Form.Item name="skill" rules={[{ required: true, message: 'Please select a skill.' }]}>
									<Select
										showSearch
										optionFilterProp="children"
										filterOption={(input, option) => option.children?.includes(input)}
										onChange={v => this.handleSelectSkill(v)}
										placeholder={intl.formatMessage(msgCreateAccount.skillsets)}
									>
										<Select.Option key="000" value=""></Select.Option>
										{skillSet?.map((skill, index) => (
											<Select.Option key={index} value={skill._id}>{skill.name}</Select.Option>
										))}
									</Select>
								</Form.Item>
							</Col>
							<Col xs={24} sm={24} md={appointmentType == 1 ? 6 : 8} className='select-small'>
								<Form.Item name="address" rules={[{ required: appointmentType == 3, message: "Select an appointment location." }]}>
									<Select
										showSearch
										optionFilterProp="children"
										filterOption={(input, option) => option.children?.includes(input)}
										onChange={v => this.handleChangeAddress(v)}
										placeholder={intl.formatMessage(msgCreateAccount.address)}
									>
										<Select.Option key='000' value=''></Select.Option>
										{addressOptions?.map((address, index) => (
											<Select.Option key={index} value={address}>{address}</Select.Option>
										))}
									</Select>
								</Form.Item>
							</Col>
							{appointmentType == 1 && (
								<Col xs={24} sm={24} md={6} className="select-small">
									<Form.Item name="phoneNumber" rules={[
										{ required: true, message: intl.formatMessage(messages.pleaseEnter) + ' ' + intl.formatMessage(messages.contactNumber) },
										{ pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$', message: intl.formatMessage(messages.phoneNumberValid) }
									]}>
										<Input type='text' className='w-100' onChange={e => this.handleChangePhone(e.target.value)} placeholder={intl.formatMessage(msgCreateAccount.phoneNumber)} pattern='^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$' required />
									</Form.Item>
								</Col>
							)}
						</Row>
						<Row>
							<Col xs={24}>
								<Form.Item name="notes">
									<Input.TextArea rows={3} onChange={e => this.handleChangeNote(e.target.value)} placeholder={intl.formatMessage(msgCreateAccount.notes) + '(optional)'} />
								</Form.Item>
							</Col>
						</Row>
						<div className='choose-doctor'>
							<p className='font-16 mt-10'>{intl.formatMessage(messages.selectProvider)}<sup>*</sup></p>
							<div className='doctor-content'>
								<Row>
									<Col xs={24} sm={24} md={8} className='select-small'>
										<Input
											onChange={e => this.handleSearchProvider(e.target.value)}
											placeholder={intl.formatMessage(messages.searchProvider)}
											suffix={<BiSearch size={17} />}
										/>
									</Col>
								</Row>
								<p className='font-500 mt-1 mb-0'>{intl.formatMessage(messages.availableProviders)}</p>
								<div className='doctor-list'>
									{listProvider?.map((provider, index) => (
										<div key={index} className='doctor-item' onClick={() => this.onChooseProvider(index)}>
											<Avatar shape="square" size="large" src='../images/doctor_ex2.jpeg' />
											<p className='font-10 text-center'>{provider.name || provider.referredToAs}</p>
											{selectedProvider === provider._id && (
												<div className='selected-doctor'>
													<BsCheck size={12} />
												</div>
											)}
										</div>
									))}
								</div>
								{providerErrorMessage.length > 0 && (<p className='text-left text-red mr-5'>{providerErrorMessage}</p>)}
							</div>
						</div>
						<Row gutter={10}>
							<Col xs={24} sm={24} md={8}>
								<div className='provider-profile'>
									<div className='flex flex-row items-center'>
										<p className='font-16 font-700'>{intl.formatMessage(msgDrawer.providerProfile)}</p>
										<p className='font-12 font-700 ml-auto text-primary'>{listProvider[isChoose]?.isNewClientScreening ? intl.formatMessage(messages.screeningRequired) : ''}</p>
									</div>
									<div className='flex'>
										<div className='flex-1'>
											<p className='font-10 mb-0'>Name:</p>
											<p className='font-10'>{listProvider[isChoose]?.name}</p>
										</div>
										<div className='flex-1'>
											<p className='font-10 mb-0'>Skillset(s):</p>
											<p className='font-10'>{listProvider[isChoose]?.skillSet?.name}</p>
										</div>
									</div>
									<p className='font-10 flex'><span className='flex-1'>Practice/Location:</span><span className='flex-1'>{listProvider[isChoose]?.serviceAddress}</span></p>
									<div className='flex'>
										{listProvider[isChoose] && (
											<div className='flex-1'>
												<p className='font-10 mb-0'>Contact number:</p>
												{listProvider[isChoose]?.contactNumber?.map((phone, phoneIndex) => (
													<p key={phoneIndex} className='font-10'>{phone.phoneNumber}</p>
												))}
											</div>
										)}
										{listProvider[isChoose] && (
											<div className='flex-1'>
												<p className='font-10 mb-0'>Contact email:</p>
												{listProvider[isChoose]?.contactEmail?.map((email, emailIndex) => (
													<p key={emailIndex} className='font-10'>{email.email}</p>
												))}
											</div>
										)}
									</div>
									<div className='flex'>
										<div className='font-10 flex-1'>
											<p>Academic level(s)</p>
											<div>{listProvider[isChoose]?.academicLevel?.map((level, i) => (
												<div key={i} className="flex">
													<span>{level.level}</span>
													<span className='ml-10'>{level.rate}</span>
												</div>
											))}</div>
										</div>
										<p className='font-10 flex-1'>Subsidy </p>
									</div>
									<div className='profile-text'>
										<Paragraph className='font-12 mb-0' ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>
											{listProvider[isChoose]?.publicProfile}
										</Paragraph>
									</div>
								</div>
							</Col>
							<Col xs={24} sm={24} md={16}>
								<div className='px-20'>
									<p className='font-700'>{intl.formatMessage(msgCreateAccount.selectDateTime)}<sup>*</sup></p>
									<div className='calendar'>
										<Row gutter={15}>
											<Col xs={24} sm={24} md={12}>
												<Calendar
													fullscreen={false}
													value={selectedDate}
													onSelect={this.onSelectDate}
													disabledDate={(date) => date.isBefore(new Date())}
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
															<div className={isSelectTime === index ? 'time-available active' : 'time-available'} onClick={() => time.active ? this.onSelectTime(index) : this.onSelectTime(-1)}>
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
							{!this.state.isConfirm && <Button key="submit" type="primary" htmlType='submit'>
								{intl.formatMessage(msgDrawer.reschedule)?.toUpperCase()}
							</Button>}
							{this.state.isConfirm && (
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
							)}
						</Row>
					</Form>
				</div>
			</Modal>
		);
	}
};

export default ModalCurrentAppointment;