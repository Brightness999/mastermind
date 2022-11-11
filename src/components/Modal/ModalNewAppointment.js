import React from 'react';
import { Modal, Button, Row, Col, Switch, Select, Typography, Calendar, Avatar, Input, Form, message } from 'antd';
import { BiChevronLeft, BiChevronRight, BiSearch } from 'react-icons/bi';
import { BsCheck } from 'react-icons/bs';
import { GoPrimitiveDot } from 'react-icons/go';
import intl from 'react-intl-universal';
import messages from './messages';
import msgCreateAccount from '../../routes/Sign/CreateAccount/messages';
import msgDrawer from '../../components/DrawerDetail/messages';
import msgReview from '../../routes/Sign/SubsidyReview/messages';
import moment from 'moment';
import 'moment/locale/en-au';
import './style/index.less';
import '../../assets/styles/login.less';
import request from '../../utils/api/request'
import { createAppointmentForParent, searchProvidersForAdmin } from '../../utils/api/apiList';

const { Paragraph } = Typography;
moment.locale('en');

class ModalNewAppointment extends React.Component {
	state = {
		selectedDate: moment(),
		selectedProviderIndex: -1,
		selectedTimeIndex: -1,
		listProvider: [],
		selectedSkill: -1,
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
		duration: 30,
	}

	getArrTime = (type, providerIndex) => {
		let arrTime = [];
		let duration = 30;
		const { listProvider } = this.state;
		const provider = listProvider[providerIndex];
		if (type) {
			if (type == 1 || type == 3) {
				duration = provider?.duration;
			}
			if (type == 2) {
				duration = provider?.duration * 1 + provider?.separateEvaluationDuration * 1
			}
		}
		this.setState({ duration: duration });

		let hour9AM = moment('2022-10-30 9:00:00');
		for (let i = 0; i < 180 / duration; i++) {
			let newTime = hour9AM.clone();
			hour9AM = hour9AM.add(duration, 'minutes')
			arrTime.push({
				value: newTime,
				active: false,
			});
		}

		let hour2PM = moment('2022-10-30 14:00:00');
		for (let i = 0; i < 240 / duration; i++) {
			let newTime = hour2PM.clone();
			hour2PM = hour2PM.add(duration, 'minutes')
			arrTime.push({
				value: newTime,
				active: false,
			});
		}
		return arrTime
	}

	componentDidMount() {
		this.setState({ arrTime: this.getArrTime(0) });
		this.searchProvider()
	}

	componentDidUpdate(prevProps) {
		if (prevProps.SkillSet != this.props.SkillSet) {
			this.setState({ skillSet: this.props.SkillSet });
		}
	}

	searchProvider(searchKey, address, selectedSkill, dependentId) {
		const params = {
			search: searchKey,
			address: address,
			skill: selectedSkill,
			cityConnection: this.props.listDependents?.find(d => d._id == dependentId)?.parent[0]?.parentInfo[0]?.cityConnection,
		};
		request.post(searchProvidersForAdmin, params).then(result => {
			if (result.success) {
				const data = result.data;
				this.setState({
					listProvider: data?.providers,
					addressOptions: data?.locations,
					selectedProviderIndex: -1,
					selectedProvider: undefined,
					selectedTimeIndex: -1,
				});
			}
		}).catch(err => {
			console.log('provider list error-----', err);
		})
	}

	createAppointment = () => {
		const { appointmentType, selectedTimeIndex, selectedDate, selectedSkill, address, selectedDependent, selectedProvider, arrTime, phoneNumber, notes, listProvider, selectedProviderIndex, duration } = this.state;
		if (selectedProvider == undefined) {
			this.setState({ providerErrorMessage: intl.formatMessage(messages.selectProvider) })
			return;
		}
		this.setState({ providerErrorMessage: '' });
		if (!selectedDate?.isAfter(new Date()) || selectedTimeIndex < 0) {
			this.setState({ errorMessage: 'Please select a date and time' })
			return;
		}
		this.setState({ errorMessage: '' });
		if (appointmentType == 2) {
			const appointment = listProvider[selectedProviderIndex]?.appointments?.find(appointment => appointment.dependent == selectedDependent && appointment.type == 2 && appointment.status == 0);
			if (appointment) {
				message.warning("You can't create more evaluation.");
				return;
			}
		}
		if (appointmentType == 1) {
			const appointment = listProvider[selectedProviderIndex]?.appointments?.find(appointment => appointment.dependent == selectedDependent && appointment.type == 1 && appointment.status == 0);
			if (appointment) {
				message.warning((<><p>You can't create more screening.</p><p>The screening with {listProvider[selectedProviderIndex]?.name} is already scheduled at {new Date(appointment.date).toLocaleString()}</p></>), 5);
				return;
			}
		}
		const { years, months, date } = selectedDate.toObject();
		const hour = arrTime[selectedTimeIndex].value.clone().set({ years, months, date });
		const postData = {
			skillSet: selectedSkill,
			dependent: selectedDependent,
			provider: selectedProvider,
			date: hour,
			location: appointmentType > 1 ? address : '',
			phoneNumber: appointmentType == 1 ? phoneNumber : '',
			notes: notes,
			duration: duration,
			type: appointmentType,
			status: 0,
		};
		this.requestCreateAppointment(postData);
	}

	onFinishFailed = (err) => {
		console.log('form data error---', err);
	}

	handleChangeAddress = address => {
		this.setState({ address: address });
		this.searchProvider(this.state.searchKey, address, this.state.selectedSkill, this.state.selectedDependent);
	};

	onSelectDate = (newValue) => {
		if (newValue.isSameOrAfter(new Date())) {
			this.setState({
				selectedDate: newValue,
				selectedTimeIndex: -1,
			});
			const { selectedProviderIndex, selectedDependent, listProvider, appointmentType } = this.state;
			if (selectedProviderIndex > -1) {
				const newArrTime = this.getArrTime(appointmentType, selectedProviderIndex);
				const selectedDay = newValue.day();
				const availableTime = listProvider[selectedProviderIndex]?.manualSchedule?.find(time => time.dayInWeek == selectedDay);
				if (availableTime) {
					const availableFromDate = moment().set({ years: availableTime.fromYear, months: availableTime.fromMonth, dates: availableTime.fromDate });
					const availableToDate = moment().set({ years: availableTime.toYear, months: availableTime.toMonth, dates: availableTime.toDate });
					newArrTime.map(time => {
						const { years, months, date } = newValue.toObject();
						time.value = moment(time.value).set({ years, months, date });
						if (time.value.isBetween(availableFromDate, availableToDate)
							&& (
								(time.value.hour() > availableTime.openHour && time.value.hour() < availableTime.closeHour)
								|| (time.value.hour() == availableTime.openHour && time.value.minute() >= availableTime.openMin)
								|| (time.value.hour() == availableTime.closeHour && time.value.minute() <= availableTime.closeMin)
							)
						) {
							let flag = true;
							this.props.listAppointmentsRecent?.filter(appointment => (appointment.status == 0) && (appointment.provider?._id == selectedProviderIndex || appointment.dependent?._id == selectedDependent))?.forEach(appointment => {
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
			} else {
				this.setState({
					arrTime: this.state.arrTime.map(time => {
						time.active = false;
						return time;
					})
				})
			}
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

	prevMonth = () => {
		if (moment(this.state.selectedDate).add(-1, 'month').isAfter(new Date())) {
			this.setState({
				selectedDate: moment(this.state.selectedDate).add(-1, 'month'),
				selectedTimeIndex: -1,
			});
		}
	}

	onChooseProvider = (providerIndex) => {
		this.setState({ providerErrorMessage: '' });
		const { listProvider, selectedDate, selectedDependent, selectedProviderIndex } = this.state;
		const appointments = listProvider[providerIndex]?.appointments?.filter(appointment => appointment.status == 0) ?? [];
		let appointmentType = 0;

		if (listProvider[providerIndex].isNewClientScreening && !appointments?.find(appointment => (appointment.type == 1 && appointment.status == -1))) {
			this.setState({ appointmentType: 1 });
			appointmentType = 1;
		}
		if (listProvider[providerIndex].isSeparateEvaluationRate && !appointments?.find(appointment => (appointment.type == 2 && appointment.status == -1))) {
			if (listProvider[providerIndex].isNewClientScreening && !appointments?.find(appointment => (appointment.type == 1 && appointment.status == -1))) {
				this.setState({ appointmentType: 1 });
				appointmentType = 1;
			} else {
				this.setState({ appointmentType: 2 });
				appointmentType = 2;
			}
		}
		if (appointments?.find(appointment => appointment.type == 3) || (!listProvider[providerIndex].isSeparateEvaluationRate && !listProvider[providerIndex].isNewClientScreening)) {
			this.setState({ appointmentType: 3 });
			appointmentType = 3;
		}

		const newArrTime = this.getArrTime(appointmentType, providerIndex);
		const availableTime = listProvider[providerIndex]?.manualSchedule?.find(time => time.dayInWeek == selectedDate.day());
		if (availableTime) {
			const availableFromDate = moment().set({ years: availableTime.fromYear, months: availableTime.fromMonth, dates: availableTime.fromDate });
			const availableToDate = moment().set({ years: availableTime.toYear, months: availableTime.toMonth, dates: availableTime.toDate });
			newArrTime.map(time => {
				const { years, months, date } = selectedDate?.toObject();
				time.value = moment(time.value).set({ years, months, date });
				if (time.value.isBetween(availableFromDate, availableToDate)
					&& (
						(time.value.hour() > availableTime.openHour && time.value.hour() < availableTime.closeHour)
						|| (time.value.hour() == availableTime.openHour && time.value.minute() >= availableTime.openMin)
						|| (time.value.hour() == availableTime.closeHour && time.value.minute() <= availableTime.closeMin)
					)
				) {
					let flag = true;
					this.props.listAppointmentsRecent?.filter(appointment => (appointment.status == 0) && (appointment.provider?._id == selectedProviderIndex || appointment.dependent?._id == selectedDependent))?.forEach(appointment => {
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

		this.setState({
			selectedProviderIndex: providerIndex,
			selectedProvider: listProvider[providerIndex]._id,
			arrTime: newArrTime,
		});
	}

	onSelectTime = (index) => {
		this.setState({ selectedTimeIndex: index })
	}

	requestCreateAppointment(postData) {
		request.post(createAppointmentForParent, postData).then(result => {
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
		this.searchProvider(value, this.state.address, this.state.selectedSkill, this.state.selectedDependent);
	}

	handleSelectDependent = (dependentId) => {
		const dependents = this.props.listDependents;
		this.setState({
			selectedDependent: dependentId,
			skillSet: dependents?.find(dependent => dependent._id == dependentId)?.services,
		});
		this.searchProvider(this.state.searchKey, this.state.address, this.state.selectedSkill, dependentId);
	}

	handleSelectSkill = (skill) => {
		this.setState({ selectedSkill: skill });
		this.searchProvider(this.state.searchKey, this.state.address, skill, this.state.selectedDependent);
	}

	handleChangePhone = (number) => {
		this.setState({ phoneNumber: number });
	}
	handleChangeNote = (notes) => {
		this.setState({ notes: notes });
	}

	render() {
		const {
			selectedDate,
			selectedProviderIndex,
			selectedTimeIndex,
			listProvider,
			selectedProvider,
			skillSet,
			arrTime,
			errorMessage,
			providerErrorMessage,
			addressOptions,
			appointmentType,
		} = this.state;
		console.log(listProvider);
		const modalProps = {
			className: 'modal-new',
			title: "",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: this.props.onCancel,
			closable: false,
			width: 900,
			footer: []
		};

		return (
			<Modal {...modalProps}>
				<div className='new-appointment'>
					<Form onFinish={this.createAppointment} onFinishFailed={this.onFinishFailed}>
						<div className='flex gap-5 items-center'>
							<p className='font-30 mb-10'>{appointmentType == 3 && intl.formatMessage(messages.newAppointment)}{appointmentType == 2 && intl.formatMessage(messages.newEvaluation)}{appointmentType == 1 && intl.formatMessage(messages.newScreening)}</p>
							{appointmentType == 2 && (
								<div className='font-20'>
									<div>{listProvider[selectedProviderIndex]?.separateEvaluationDuration} evaluation</div>
									<div>Rate: ${listProvider[selectedProviderIndex]?.separateEvaluationRate}</div>
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
										onChange={value => this.handleSelectDependent(value)}
										placeholder={intl.formatMessage(msgCreateAccount.dependent)}
									>
										{this.props.listDependents?.map((dependent, index) => (
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
										<p className='font-12 font-700 ml-auto text-primary'>{listProvider[selectedProviderIndex]?.isNewClientScreening ? intl.formatMessage(messages.screeningRequired) : ''}</p>
									</div>
									<div className='flex'>
										<div className='flex-1'>
											<p className='font-10 mb-0'>Name:</p>
											<p className='font-10'>{listProvider[selectedProviderIndex]?.name}</p>
										</div>
										<div className='flex-1'>
											<p className='font-10 mb-0'>Skillset(s):</p>
											<p className='font-10'>{listProvider[selectedProviderIndex]?.skillSet?.name}</p>
										</div>
									</div>
									<p className='font-10 flex'><span className='flex-1'>Practice/Location:</span><span className='flex-1'>{listProvider[selectedProviderIndex]?.serviceAddress}</span></p>
									<div className='flex'>
										{listProvider[selectedProviderIndex] && (
											<div className='flex-1'>
												<p className='font-10 mb-0'>Contact number:</p>
												{listProvider[selectedProviderIndex]?.contactNumber?.map((phone, phoneIndex) => (
													<p key={phoneIndex} className='font-10'>{phone.phoneNumber}</p>
												))}
											</div>
										)}
										{listProvider[selectedProviderIndex] && (
											<div className='flex-1'>
												<p className='font-10 mb-0'>Contact email:</p>
												{listProvider[selectedProviderIndex]?.contactEmail?.map((email, emailIndex) => (
													<p key={emailIndex} className='font-10'>{email.email}</p>
												))}
											</div>
										)}
									</div>
									<div className='flex'>
										<div className='font-10 flex-1'>
											<p>Academic level(s)</p>
											<div>{listProvider[selectedProviderIndex]?.academicLevel?.map((level, i) => (
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
											{listProvider[selectedProviderIndex]?.publicProfile}
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
						<Row className='justify-end gap-2'>
							<Button key="back" onClick={this.props.onCancel}>
								{intl.formatMessage(msgReview.goBack).toUpperCase()}
							</Button>
							<Button key="submit" type="primary" htmlType='submit'>
								{intl.formatMessage(messages.schedule)?.toUpperCase()}
							</Button>
						</Row>
					</Form>
				</div>
			</Modal>
		);
	}
};
export default ModalNewAppointment;