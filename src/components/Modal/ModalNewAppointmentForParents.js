import React from 'react';
import { Modal, Button, Row, Col, Switch, Select, Typography, Calendar, Avatar, Input, Form, message } from 'antd';
import { BiChevronLeft, BiChevronRight, BiSearch } from 'react-icons/bi';
import { BsCheck } from 'react-icons/bs';
import { GoPrimitiveDot } from 'react-icons/go';
import intl from 'react-intl-universal';
import messages from './messages';
import msgCreateAccount from '../../routes/Sign/CreateAccount/messages';
import msgReview from '../../routes/Sign/SubsidyReview/messages';
import moment from 'moment';
import 'moment/locale/en-au';
import './style/index.less';
import '../../assets/styles/login.less';
import request from '../../utils/api/request';
import { createAppointmentForParent, searchProvidersForAdmin } from '../../utils/api/apiList';
import { FaHandHoldingUsd } from 'react-icons/fa';
import ModalNewScreening from './ModalNewScreening';
import { store } from '../../redux/store';

const { Paragraph } = Typography;
moment.locale('en');

class ModalNewAppointmentForParents extends React.Component {
	state = {
		selectedDate: moment(),
		selectedProviderIndex: -1,
		selectedTimeIndex: -1,
		listProvider: [],
		selectedSkillSet: undefined,
		address: '',
		addressOptions: [],
		selectedDependent: undefined,
		selectedProvider: undefined,
		arrTime: [],
		errorMessage: '',
		skillSet: [],
		searchKey: '',
		appointmentType: 3,
		notes: '',
		providerErrorMessage: '',
		appointments: [],
		standardRate: '',
		subsidizedRate: '',
		visibleModalScreening: false,
	}

	getArrTime = (type, providerIndex) => {
		let arrTime = [];
		let duration = 30;
		const { listProvider } = this.state;
		const provider = listProvider[providerIndex];
		if (type == 1 || type == 3) {
			duration = provider?.duration;
		}
		if (type == 2) {
			duration = provider?.duration * 1 + provider?.separateEvaluationDuration * 1
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
	}

	componentDidUpdate(prevProps) {
		if (prevProps.SkillSet != this.props.SkillSet) {
			this.setState({ skillSet: this.props.SkillSet });
		}
		if (prevProps.selectedDate != this.props.selectedDate) {
			this.setState({ selectedDate: moment(this.props.selectedDate) });
		}
	}

	searchProvider(searchKey, address, selectedSkillSet, dependentId) {
		const data = {
			search: searchKey,
			address: address,
			skill: selectedSkillSet,
			dependentId: dependentId,
		};
		request.post(searchProvidersForAdmin, data).then(result => {
			const { data, success } = result;
			if (success) {
				this.setState({
					listProvider: data?.providers,
					addressOptions: data?.locations,
				});
			} else {
				this.setState({
					listProvider: [],
					addressOptions: [],
				});
			}
			this.setState({
				selectedProviderIndex: -1,
				selectedProvider: undefined,
				selectedTimeIndex: -1,
			});
		}).catch(err => {
			console.log('provider list error-----', err);
			this.setState({
				listProvider: [],
				addressOptions: [],
				selectedProviderIndex: -1,
				selectedProvider: undefined,
				selectedTimeIndex: -1,
			});
		})
	}

	createAppointment = (data) => {
		const { appointmentType, selectedTimeIndex, selectedDate, selectedSkillSet, address, selectedDependent, selectedProvider, arrTime, notes, listProvider, selectedProviderIndex, standardRate, subsidizedRate } = this.state;
		if (selectedProvider == undefined) {
			this.setState({ providerErrorMessage: intl.formatMessage(messages.selectProvider) })
			return;
		}
		this.setState({ providerErrorMessage: '' });
		if (appointmentType != 1 && !(selectedDate?.isAfter(new Date()) || selectedTimeIndex < 0)) {
			this.setState({ errorMessage: 'Please select a date and time' })
			return;
		}
		this.setState({ errorMessage: '' });
		if (appointmentType == 2) {
			const appointment = listProvider[selectedProviderIndex]?.appointments?.find(a => a.dependent == selectedDependent && a.type == 2 && a.status == 0);
			if (appointment) {
				message.warning("scheduling with this provider will be available after the evaluation");
				return;
			}
		}
		if (appointmentType == 1) {
			const appointment = listProvider[selectedProviderIndex]?.appointments?.find(a => a.dependent == selectedDependent && a.type == 1 && a.status == 0);
			if (appointment) {
				message.warning("Your screening request is still being processed", 5);
				return;
			}
		}
		const { years, months, date } = selectedDate.toObject();
		const hour = arrTime[selectedTimeIndex]?.value.clone().set({ years, months, date });
		const postData = {
			skillSet: selectedSkillSet,
			dependent: selectedDependent,
			provider: selectedProvider,
			date: appointmentType == 1 ? undefined : hour,
			location: appointmentType > 1 ? address : '',
			phoneNumber: appointmentType == 1 ? data.phoneNumber : '',
			notes: appointmentType == 1 ? data.notes : notes,
			type: appointmentType,
			status: 0,
			rate: appointmentType == 2 ? listProvider[selectedProviderIndex]?.separateEvaluationRate : appointmentType == 3 ? standardRate : appointmentType == 5 ? subsidizedRate : 0,
			screeningTime: appointmentType == 1 ? data.time : '',
		};
		this.setState({ visibleModalScreening: false });
		this.requestCreateAppointment(postData);
	}

	onFinishFailed = (err) => {
		console.log('form data error---', err);
	}

	handleChangeAddress = address => {
		const { searchKey, selectedSkillSet, selectedDependent } = this.state;
		this.setState({ address: address });
		this.searchProvider(searchKey, address, selectedSkillSet, selectedDependent);
	};

	onSelectDate = (newValue) => {
		if (newValue.isSameOrAfter(new Date())) {
			this.setState({
				selectedDate: newValue,
				selectedTimeIndex: -1,
			});
			const { selectedProviderIndex, listProvider, appointmentType, selectedDependent } = this.state;
			if (selectedProviderIndex > -1) {
				const newArrTime = this.getArrTime(appointmentType, selectedProviderIndex);
				const selectedDay = newValue.day();
				const appointments = listProvider[selectedProviderIndex]?.appointments?.filter(appointment => appointment.status == 0) ?? [];
				const availableTime = listProvider[selectedProviderIndex]?.manualSchedule?.find(time => time.dayInWeek == selectedDay);
				let duration = 30;
				if (appointmentType == 1 || appointmentType == 3) {
					duration = listProvider[selectedProviderIndex]?.duration;
				}
				if (appointmentType == 2) {
					duration = listProvider[selectedProviderIndex]?.duration * 1 + listProvider[selectedProviderIndex]?.separateEvaluationDuration * 1
				}
				if (availableTime && !availableTime.isPrivate) {
					const availableFromDate = moment().set({ years: availableTime.fromYear, months: availableTime.fromMonth, dates: availableTime.fromDate });
					const availableToDate = moment().set({ years: availableTime.toYear, months: availableTime.toMonth, dates: availableTime.toDate });
					const openTime = newValue.clone().set({ hours: availableTime.openHour, minutes: availableTime.openMin, seconds: 0, milliseconds: 0 });
					const closeTime = newValue.clone().set({ hours: availableTime.closeHour, minutes: availableTime.closeMin, seconds: 0, milliseconds: 0 }).add(-duration, 'minutes');
					newArrTime.map(time => {
						const { years, months, date } = newValue.toObject();
						time.value = moment(time.value).set({ years, months, date });
						if (time.value.isBetween(availableFromDate, availableToDate) && time.value.isSameOrAfter(openTime) && time.value.isSameOrBefore(closeTime)) {
							let flag = true;
							this.props.listDependents?.find(dependent => dependent._id == selectedDependent)?.appointments?.filter(appointment => appointment.status == 0)?.forEach(appointment => {
								if (time.value.isSame(moment(appointment.date))) {
									flag = false;
								}
							})
							appointments?.filter(appointment => appointment.status == 0)?.forEach(appointment => {
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
		const { listProvider, selectedDate, selectedDependent } = this.state;
		const appointments = listProvider[providerIndex]?.appointments ?? [];
		let appointmentType = 0;

		if (listProvider[providerIndex].isNewClientScreening) {
			if (listProvider[providerIndex].isSeparateEvaluationRate) {
				if (appointments?.find(a => a.dependent == selectedDependent && a.type == 1 && a.status == -1)) {
					if (appointments?.find(a => a.dependent == selectedDependent && a.type == 2 && a.status == -1)) {
						appointmentType = 3;
					} else {
						if (appointments?.find(a => a.dependent == selectedDependent && a.type == 1 && a.status == -1 && a.skipEvaluation)) {
							appointmentType = 3;
						} else {
							appointmentType = 2;
						}
					}
				} else {
					appointmentType = 1;
				}
			} else {
				if (appointments?.find(a => a.dependent == selectedDependent && a.type == 1 && a.status == -1)) {
					appointmentType = 3;
				} else {
					appointmentType = 1;
				}
			}
		} else {
			if (listProvider[providerIndex].isSeparateEvaluationRate) {
				if (appointments?.find(a => a.dependent == selectedDependent && a.type == 2 && a.status == -1)) {
					appointmentType = 3;
				} else {
					appointmentType = 2;
				}
			} else {
				appointmentType = 3;
			}
		}
		this.setState({ appointmentType: appointmentType });

		const newArrTime = this.getArrTime(appointmentType, providerIndex);
		const availableTime = listProvider[providerIndex]?.manualSchedule?.find(time => time.dayInWeek == selectedDate.day());
		let duration = 30;

		if (appointmentType == 1 || appointmentType == 3) {
			duration = listProvider[providerIndex]?.duration;
		}
		if (appointmentType == 2) {
			duration = listProvider[providerIndex]?.duration * 1 + listProvider[providerIndex]?.separateEvaluationDuration * 1
		}
		if (availableTime && !availableTime.isPrivate) {
			const availableFromDate = moment().set({ years: availableTime.fromYear, months: availableTime.fromMonth, dates: availableTime.fromDate });
			const availableToDate = moment().set({ years: availableTime.toYear, months: availableTime.toMonth, dates: availableTime.toDate });
			const openTime = selectedDate.clone().set({ hours: availableTime.openHour, minutes: availableTime.openMin, seconds: 0, milliseconds: 0 });
			const closeTime = selectedDate.clone().set({ hours: availableTime.closeHour, minutes: availableTime.closeMin, seconds: 0, milliseconds: 0 }).add(-duration, 'minutes');
			newArrTime.map(time => {
				const { years, months, date } = selectedDate?.toObject();
				time.value = moment(time.value).set({ years, months, date });
				if (time.value.isBetween(availableFromDate, availableToDate) && time.value.isSameOrAfter(openTime) && time.value.isSameOrBefore(closeTime)) {
					let flag = true;
					this.props.listDependents?.find(dependent => dependent._id == selectedDependent)?.appointments?.filter(appointment => appointment.status == 0)?.forEach(appointment => {
						if (time.value.isSame(moment(appointment.date))) {
							flag = false;
						}
					})
					appointments?.filter(appointment => appointment.status == 0)?.forEach(appointment => {
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

		let standardRate = 0;
		let subsidizedRate = 0;

		if (selectedDependent) {
			const currentGrade = this.props.listDependents?.find(dependent => dependent?._id == selectedDependent)?.currentGrade;
			standardRate = listProvider[providerIndex]?.academicLevel?.find(level => level.level == currentGrade)?.rate;
			subsidizedRate = listProvider[providerIndex]?.academicLevel?.find(level => level.level == currentGrade)?.subsidizedRate;
		}

		this.setState({
			selectedProviderIndex: providerIndex,
			selectedProvider: listProvider[providerIndex]._id,
			arrTime: newArrTime,
			standardRate: standardRate,
			subsidizedRate: subsidizedRate,
		});
	}

	onSelectTime = (index) => {
		this.setState({ selectedTimeIndex: index })
	}

	requestCreateAppointment(postData) {
		const { searchKey, address, selectedSkillSet, selectedDependent } = this.state;
		request.post(createAppointmentForParent, postData).then(result => {
			if (result.success) {
				this.setState({ errorMessage: '' });
				this.searchProvider(searchKey, address, selectedSkillSet, selectedDependent);
				this.props.onSubmit();
			} else {
				this.setState({ errorMessage: result.data });
			}
		}).catch(err => {
			this.setState({ errorMessage: err.message });
		});
	}

	handleSearchProvider = (value) => {
		const { address, selectedSkillSet, selectedDependent } = this.state;
		this.setState({ searchKey: value });
		this.searchProvider(value, address, selectedSkillSet, selectedDependent);
	}

	handleSelectDependent = (dependentId) => {
		const dependents = this.props.listDependents;
		const { searchKey, address, selectedSkillSet } = this.state;
		this.setState({
			selectedDependent: dependentId,
			skillSet: dependents?.find(dependent => dependent._id == dependentId)?.services,
		});
		this.searchProvider(searchKey, address, selectedSkillSet, dependentId);
	}

	handleSelectSkill = (skill) => {
		const { searchKey, address, selectedDependent } = this.state;
		this.setState({ selectedSkillSet: skill });
		this.searchProvider(searchKey, address, skill, selectedDependent);
	}

	handleChangeNote = (notes) => {
		this.setState({ notes: notes });
	}

	onOpenModalScreening = () => {
		this.setState({ visibleModalScreening: true });
	}

	onCloseModalScreening = () => {
		this.setState({ visibleModalScreening: false });
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
			standardRate,
			subsidizedRate,
			visibleModalScreening,
			selectedDependent,
		} = this.state;
		const modalProps = {
			className: 'modal-new',
			title: "",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: (e) => e.target.className !== 'ant-modal-wrap' && this.props.onCancel(),
			width: 900,
			footer: []
		};
		const modalScreeningProps = {
			visible: visibleModalScreening,
			onSubmit: this.createAppointment,
			onCancel: this.onCloseModalScreening,
			provider: listProvider[selectedProviderIndex],
			dependent: this.props.listDependents?.find(dependent => dependent._id == selectedDependent),
		}

		return (
			<Modal {...modalProps}>
				<div className='new-appointment'>
					<Form onFinish={() => appointmentType == 1 ? this.onOpenModalScreening() : this.createAppointment()} onFinishFailed={this.onFinishFailed} layout='vertical'>
						<div className='flex gap-5 items-center'>
							<p className='font-30 mb-10'>{appointmentType == 3 && intl.formatMessage(messages.newAppointment)}{appointmentType == 2 && intl.formatMessage(messages.newEvaluation)}{appointmentType == 1 && intl.formatMessage(messages.newScreening)}</p>
							{appointmentType == 2 && selectedProviderIndex > -1 && (
								<div className='font-20'>
									<div>{listProvider[selectedProviderIndex]?.separateEvaluationDuration * 1 + listProvider[selectedProviderIndex]?.duration * 1}Minutes evaluation</div>
									<div>Rate: ${listProvider[selectedProviderIndex]?.separateEvaluationRate}</div>
								</div>
							)}
						</div>
						<div className='flex flex-row items-center mb-10'>
							<p className='font-16 mb-0'>{intl.formatMessage(messages.selectOptions)}<sup>*</sup></p>
							{appointmentType == 3 && (
								<div className='flex flex-row items-center ml-20'>
									<Switch size="small" />
									<p className='ml-10 mb-0'>{intl.formatMessage(messages.subsidyOnly)}</p>
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
							<Col xs={24} sm={24} md={8} className='select-small'>
								<Form.Item
									name="skill"
									label={intl.formatMessage(msgCreateAccount.skillsets)}
									rules={[{ required: true, message: 'Please select a skill.' }]}
								>
									<Select
										showSearch
										optionFilterProp="children"
										filterOption={(input, option) => option.children?.includes(input)}
										onChange={v => this.handleSelectSkill(v)}
										placeholder={intl.formatMessage(msgCreateAccount.skillsets)}
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
									rules={[{ required: appointmentType == 3, message: "Select a location." }]}
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
											<p className='font-10 text-center'>{`${provider.firstName ?? ''} ${provider.lastName ?? ''}`}</p>
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
										<p className='font-16 font-700'>{`${listProvider[selectedProviderIndex]?.firstName ?? ''} ${listProvider[selectedProviderIndex]?.lastName ?? ''}`}{!!listProvider[selectedProviderIndex]?.academicLevel?.length && <FaHandHoldingUsd size={16} className='mx-10 text-green500' />}</p>
										<p className='font-12 font-700 ml-auto text-primary'>{listProvider[selectedProviderIndex]?.isNewClientScreening ? intl.formatMessage(messages.screeningRequired) : ''}</p>
									</div>
									<div className='flex'>
										<div className='flex-1'>
											{listProvider[selectedProviderIndex]?.contactNumber?.map((phone, index) => (
												<p key={index} className='font-10'>{phone.phoneNumber}</p>
											))}
											{listProvider[selectedProviderIndex]?.contactEmail?.map((email, index) => (
												<p key={index} className='font-10'>{email.email}</p>
											))}
											{listProvider[selectedProviderIndex]?.serviceAddress && (
												<p className='font-10'>{listProvider[selectedProviderIndex].serviceAddress}</p>
											)}
										</div>
										<div className='flex-1 font-10'>
											{standardRate && <div>Rate: ${standardRate}</div>}
											{subsidizedRate && <div>Subsidized Rate: ${subsidizedRate}</div>}
										</div>
									</div>
									<div className='flex'>
										<div className='flex-1'>
											<p className='font-10 mb-0 text-bold'>Skillset(s):</p>
											{listProvider[selectedProviderIndex]?.skillSet?.map((skill, index) => (
												<p key={index} className='font-10 mb-0'>{skill.name}</p>
											))}
										</div>
										<div className='font-10 flex-1'>
											<p className='mb-0 text-bold'>Grade level(s)</p>
											<div>{listProvider[selectedProviderIndex]?.academicLevel?.map((level, i) => (
												<div key={i}>{level.level}</div>
											))}</div>
										</div>
									</div>
									<p className='font-10 mb-0 text-bold'>Profile</p>
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
													dateCellRender={date => {
														const userRole = store.getState().auth.user.role;
														if (selectedProviderIndex > -1 && userRole > 3) {
															const availableTime = listProvider[selectedProviderIndex]?.manualSchedule?.find(time => time.dayInWeek == date.day());
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
															<div className={`${selectedTimeIndex === index ? 'active' : ''} ${time.active ? 'time-available' : 'time-not-available'}`} onClick={() => time.active ? this.onSelectTime(index) : this.onSelectTime(-1)}>
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
						{visibleModalScreening && <ModalNewScreening {...modalScreeningProps} />}
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

export default ModalNewAppointmentForParents;