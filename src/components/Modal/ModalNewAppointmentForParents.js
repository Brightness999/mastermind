import React from 'react';
import { Modal, Button, Row, Col, Switch, Select, Typography, Calendar, Avatar, Input, Form, message, Popover, Spin } from 'antd';
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
import { FaCalendarAlt, FaHandHoldingUsd } from 'react-icons/fa';
import ModalNewScreening from './ModalNewScreening';
import { store } from '../../redux/store';

const { Paragraph } = Typography;
moment.locale('en');

class ModalNewAppointmentForParents extends React.Component {
	state = {
		selectedDate: moment(),
		selectedPrivateDate: moment(),
		selectedProviderIndex: -1,
		selectedTimeIndex: -1,
		listProvider: [],
		selectedSkillSet: undefined,
		address: '',
		addressOptions: [],
		selectedDependent: undefined,
		selectedProvider: undefined,
		arrTime: [],
		privateArrTime: [],
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
		userRole: store.getState().auth.user.role,
		subsidyAvailable: false,
		restSessions: 0,
		loading: false,
		duration: 30,
	}

	getArrTime = (type, providerIndex, date) => {
		let arrTime = [];
		let duration = 30;
		const { listProvider, address } = this.state;
		const provider = listProvider[providerIndex];
		if (type == 1 || type == 3) {
			duration = provider?.duration;
		}
		if (type == 2) {
			duration = provider?.separateEvaluationDuration;
		}
		this.setState({ duration: duration });

		if (date) {
			if (date.day() == 6) {
				return [];
			} else if (provider?.blackoutDates?.includes(a => moment(a).year() == date.year() && moment(a).month() == date.month() && moment(a).date() == date.date())) {
				return [];
			} else {
				const ranges = provider?.manualSchedule?.filter(a => a.dayInWeek == date.day() && a.location == address && !a.isPrivate && date.isBetween(moment().set({ years: a.fromYear, months: a.fromMonth, dates: a.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }), moment().set({ years: a.toYear, months: a.toMonth, dates: a.toDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 0 })));
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
		this.setState({
			skillSet: this.props.SkillSet,
			selectedDate: moment(this.props.selectedDate),
		});
	}

	searchProvider(searchKey, address, selectedSkillSet, dependentId) {
		const data = {
			search: searchKey,
			address: address,
			skill: selectedSkillSet,
			dependentId: dependentId,
		};
		this.setState({ loading: true });
		request.post(searchProvidersForAdmin, data).then(result => {
			this.setState({ loading: false });
			const { data, success } = result;
			if (success) {
				this.setState({ listProvider: data?.providers });
			} else {
				this.setState({ listProvider: [] });
			}
			this.setState({
				selectedProviderIndex: -1,
				selectedProvider: undefined,
				selectedTimeIndex: -1,
				standardRate: '',
				subsidizedRate: '',
			});
		}).catch(err => {
			console.log('provider list error-----', err);
			this.setState({
				loading: false,
				listProvider: [],
				selectedProviderIndex: -1,
				selectedProvider: undefined,
				selectedTimeIndex: -1,
				standardRate: '',
				subsidizedRate: '',
			});
		})
	}

	createAppointment = (data) => {
		const { appointmentType, selectedTimeIndex, selectedDate, selectedSkillSet, address, selectedDependent, selectedProvider, arrTime, notes, listProvider, selectedProviderIndex, standardRate, subsidizedRate, duration } = this.state;
		if (selectedProvider == undefined) {
			this.setState({ providerErrorMessage: intl.formatMessage(messages.selectProvider) })
			return;
		}
		this.setState({ providerErrorMessage: '' });
		if (appointmentType != 1 && (!selectedDate?.isAfter(new Date()) || selectedTimeIndex < 0)) {
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
			duration: appointmentType == 2 ? listProvider[selectedProviderIndex]?.separateEvaluationDuration : listProvider[selectedProviderIndex]?.duration,
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
		this.setState({
			selectedDate: newValue,
			selectedTimeIndex: -1,
		});
		if (newValue.isSameOrAfter(new Date())) {
			const { selectedProviderIndex, listProvider, appointmentType, selectedDependent } = this.state;

			if (selectedProviderIndex > -1) {
				const newArrTime = this.getArrTime(appointmentType, selectedProviderIndex, newValue);
				const appointments = listProvider[selectedProviderIndex]?.appointments?.filter(appointment => appointment.status == 0) ?? [];

				newArrTime.map(time => {
					const { years, months, date } = newValue.toObject();
					time.value = moment(time.value).set({ years, months, date });

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
					return time;
				})
				this.setState({ arrTime: newArrTime });
			} else {
				this.setState({ arrTime: this.state.arrTime?.map(time => ({ ...time, active: false })) });
			}
		} else {
			this.setState({ arrTime: this.state.arrTime?.map(time => ({ ...time, active: false })) });
		}
	}

	nextMonth = () => {
		this.setState({
			selectedDate: moment(this.state.selectedDate).add(1, 'month'),
			selectedTimeIndex: -1,
		});
		this.onSelectDate(moment(this.state.selectedDate).add(1, 'month'))
	}

	prevMonth = () => {
		this.setState({
			selectedDate: moment(this.state.selectedDate).add(-1, 'month'),
			selectedTimeIndex: -1,
		});
		this.onSelectDate(moment(this.state.selectedDate).add(-1, 'month'))
	}

	onChooseProvider = (providerIndex) => {
		const { listProvider, selectedDate, selectedDependent, selectedSkillSet } = this.state;
		const appointments = listProvider[providerIndex]?.appointments ?? [];

		const flagAppointments = appointments?.filter(a => a?.dependent == selectedDependent && a?.flagStatus == 1);
		const declinedAppointments = appointments?.filter(a => a?.dependent == selectedDependent && a?.status == -3);

		if (declinedAppointments?.length) {
			message.error('The provider declined your request');
			return;
		}

		if (flagAppointments?.length) {
			message.error('Sorry there is an open flag. Please clear the flag to proceed');
			return;
		}

		this.setState({ providerErrorMessage: '' });
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

		const newArrTime = this.getArrTime(appointmentType, providerIndex, selectedDate);
		const newPrivateArrTime = this.getArrTime(1, providerIndex, selectedDate);

		newArrTime.map(time => {
			const { years, months, date } = selectedDate?.toObject();
			time.value = moment(time.value).set({ years, months, date });

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
			return time;
		})

		let standardRate = 0;
		let subsidizedRate = 0;

		if (selectedDependent) {
			const currentGrade = this.props.listDependents?.find(dependent => dependent?._id == selectedDependent)?.currentGrade;

			if (['Pre-Nursery', 'Nursery', 'Kindergarten', 'Pre-1A'].includes(currentGrade)) {
				standardRate = listProvider[providerIndex]?.academicLevel?.find(level => [currentGrade, 'Early Education'].includes(level.level))?.rate;
				subsidizedRate = listProvider[providerIndex]?.academicLevel?.find(level => [currentGrade, 'Early Education'].includes(level.level))?.subsidizedRate;
			} else if (['Grades 1', 'Grades 2', 'Grades 3', 'Grades 4', 'Grades 5', 'Grades 6'].includes(currentGrade)) {
				standardRate = listProvider[providerIndex]?.academicLevel?.find(level => [currentGrade, 'Elementary Grades 1-6', 'Elementary Grades 1-8'].includes(level.level))?.rate;
				subsidizedRate = listProvider[providerIndex]?.academicLevel?.find(level => [currentGrade, 'Elementary Grades 1-6', 'Elementary Grades 1-8'].includes(level.level))?.subsidizedRate;
			} else if (['Grades 7', 'Grades 8'].includes(currentGrade)) {
				standardRate = listProvider[providerIndex]?.academicLevel?.find(level => [currentGrade, 'Middle Grades 7-8', 'Elementary Grades 1-8'].includes(level.level))?.rate;
				subsidizedRate = listProvider[providerIndex]?.academicLevel?.find(level => [currentGrade, 'Middle Grades 7-8', 'Elementary Grades 1-8'].includes(level.level))?.subsidizedRate;
			} else if (['Grades 9', 'Grades 10', 'Grades 11', 'Grades 12'].includes(currentGrade)) {
				standardRate = listProvider[providerIndex]?.academicLevel?.find(level => [currentGrade, 'High School Grades 9-12'].includes(level.level))?.rate;
				subsidizedRate = listProvider[providerIndex]?.academicLevel?.find(level => [currentGrade, 'High School Grades 9-12'].includes(level.level))?.subsidizedRate;
			} else {
				standardRate = listProvider[providerIndex]?.academicLevel?.find(level => level.level == currentGrade)?.rate;
				subsidizedRate = listProvider[providerIndex]?.academicLevel?.find(level => level.level == currentGrade)?.subsidizedRate;
			}

			if (selectedSkillSet) {
				const subsidy = this.props.listDependents?.find(d => d._id == selectedDependent)?.subsidy?.find(s => s.skillSet == selectedSkillSet);
				if (subsidy?.status && subsidy?.adminApprovalStatus) {
					this.setState({ subsidyAvailable: true, restSessions: subsidy?.numberOfSessions });
				}
			}
		}

		this.setState({
			selectedProviderIndex: providerIndex,
			selectedProvider: listProvider[providerIndex]._id,
			arrTime: newArrTime,
			standardRate: standardRate,
			subsidizedRate: subsidizedRate,
			privateArrTime: newPrivateArrTime,
		});
	}

	onSelectTime = (index) => {
		this.setState({ selectedTimeIndex: index })
		index > -1 && this.setState({ errorMessage: '' });
	}

	requestCreateAppointment(postData) {
		const { listProvider, selectedProviderIndex } = this.state;
		const { durations } = store.getState().auth;

		request.post(createAppointmentForParent, postData).then(result => {
			if (result.success) {
				this.setState({ errorMessage: '' });
				if (postData?.type == 2) {
					message.success(`${listProvider[selectedProviderIndex]?.firstName ?? ''} ${listProvider[selectedProviderIndex]?.lastName ?? ''} requires a ${durations?.find(a => a.value == postData?.duration)?.label} evaluation. Please proceed to schedule.`);
				}
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
			addressOptions: ['Dependent Home', 'Provider Office', dependents?.find(dependent => dependent._id == dependentId)?.school?.name],
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

	nextPrivateMonth = () => {
		this.setState({ selectedPrivateDate: moment(this.state.selectedPrivateDate).add(1, 'month') });
	}

	prevPrivateMonth = () => {
		this.setState({ selectedPrivateDate: moment(this.state.selectedPrivateDate).add(-1, 'month') });
	}

	onSelectPrivateDate = (newValue) => {
		const { selectedProviderIndex } = this.state;
		const newArrTime = this.getArrTime(1, selectedProviderIndex, newValue);
		this.setState({
			selectedPrivateDate: newValue,
			privateArrTime: newArrTime,
		});
	}

	privateSlot = () => {
		const { listProvider, selectedProviderIndex, userRole, selectedPrivateDate, privateArrTime } = this.state;

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
			userRole,
			subsidyAvailable,
			restSessions,
			loading,
			notes,
		} = this.state;
		const modalProps = {
			className: 'modal-new',
			title: "",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: (e) => e.target.className !== 'ant-modal-wrap' && this.props.onCancel(),
			width: 1000,
			footer: []
		};
		const modalScreeningProps = {
			visible: visibleModalScreening,
			onSubmit: this.createAppointment,
			onCancel: this.onCloseModalScreening,
			provider: listProvider[selectedProviderIndex],
			dependent: this.props.listDependents?.find(dependent => dependent._id == selectedDependent),
			notes: notes,
		}

		return (
			<Modal {...modalProps}>
				<div className='new-appointment'>
					<Form onFinish={() => appointmentType == 1 ? this.onOpenModalScreening() : this.createAppointment()} onFinishFailed={this.onFinishFailed} layout='vertical'>
						<div className='flex gap-5 items-center'>
							<p className='font-30 mb-10'>{appointmentType == 3 && intl.formatMessage(messages.newAppointment)}{appointmentType == 2 && intl.formatMessage(messages.newEvaluation)}{appointmentType == 1 && intl.formatMessage(messages.newScreening)}</p>
							{appointmentType == 2 && selectedProviderIndex > -1 && (
								<div className='font-20'>
									<div>{store.getState().auth.durations?.find(a => a.value == listProvider[selectedProviderIndex]?.separateEvaluationDuration)?.label} evaluation</div>
									<div>Rate: ${listProvider[selectedProviderIndex]?.separateEvaluationRate}</div>
								</div>
							)}
						</div>
						<div className='flex flex-row items-center mb-10'>
							<p className='font-16 mb-0'>{intl.formatMessage(messages.selectOptions)}<sup>*</sup></p>
							{appointmentType == 3 && subsidyAvailable && (
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
									rules={[{ required: [2, 3, 5].includes(appointmentType), message: "Select a location." }]}
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
								<div className='doctor-list'>
									{loading ? <Spin spinning={loading} /> : listProvider?.length > 0 ? listProvider?.map((provider, index) => (
										<div key={index} className='doctor-item' onClick={() => this.onChooseProvider(index)}>
											<Avatar shape="square" size="large" src='../images/doctor_ex2.jpeg' />
											<p className='font-12 text-center'>{`${provider.firstName ?? ''} ${provider.lastName ?? ''}`}</p>
											{selectedProvider === provider._id && (
												<div className='selected-doctor'>
													<BsCheck size={12} />
												</div>
											)}
										</div>
									)) : "No matching providers found. Please update the options to find an available provider."}
								</div>
								{providerErrorMessage.length > 0 && (<p className='text-left text-red mr-5'>{providerErrorMessage}</p>)}
							</div>
						</div>
						<Row gutter={10}>
							<Col xs={24} sm={24} md={10}>
								<div className='provider-profile'>
									<div className='flex flex-row items-center'>
										<p className='font-16 font-700'>
											{`${listProvider[selectedProviderIndex]?.firstName ?? ''} ${listProvider[selectedProviderIndex]?.lastName ?? ''}`}
											{!!listProvider[selectedProviderIndex]?.academicLevel?.length ? <FaHandHoldingUsd size={16} className='mx-10 text-green500' /> : null}
											{userRole > 3 && listProvider[selectedProviderIndex]?.manualSchedule?.find(m => m.isPrivate) ? <Popover content={this.privateSlot} trigger="click"><FaCalendarAlt size={16} className="text-green500 cursor" /></Popover> : null}
										</p>
										<p className='font-700 ml-auto text-primary'>{listProvider[selectedProviderIndex]?.isNewClientScreening ? listProvider[selectedProviderIndex]?.appointments?.find(a => a.dependent == selectedDependent && a.type == 1 && a.status == -1) ? intl.formatMessage(messages.screenCompleted) : intl.formatMessage(messages.screeningRequired) : ''}</p>
									</div>
									<div className='flex'>
										<div className='flex-1'>
											{listProvider[selectedProviderIndex]?.contactNumber?.map((phone, index) => (
												<p key={index} className='font-12'>{phone.phoneNumber}</p>
											))}
											{listProvider[selectedProviderIndex]?.contactEmail?.map((email, index) => (
												<p key={index} className='font-12'>{email.email}</p>
											))}
											{listProvider[selectedProviderIndex]?.serviceAddress && (
												<p className='font-12'>{listProvider[selectedProviderIndex].serviceAddress}</p>
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
											{listProvider[selectedProviderIndex]?.skillSet?.map((skill, index) => (
												<p key={index} className='font-12'>{skill.name}</p>
											))}
										</div>
										<div className='flex-1'>
											<p className='text-bold'>Grade level(s)</p>
											{listProvider[selectedProviderIndex]?.academicLevel?.map((level, i) => (
												<p className='font-12' key={i}>{level.level}</p>
											))}
										</div>
									</div>
									<p className='text-bold mt-10'>Profile</p>
									<div className='profile-text'>
										<Paragraph className='font-12 mb-0' ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>
											{listProvider[selectedProviderIndex]?.publicProfile}
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
														if (selectedProviderIndex > -1 && userRole > 3) {
															const availableTime = listProvider[selectedProviderIndex]?.manualSchedule?.find(time => time.dayInWeek == date.day());
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

														if (selectedProviderIndex > -1) {
															const range = listProvider[selectedProviderIndex]?.manualSchedule?.find(d => d.dayInWeek == date.day() && date.isBetween(moment().set({ years: d.fromYear, months: d.fromMonth, dates: d.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }), moment().set({ years: d.toYear, months: d.toMonth, dates: d.toDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 0 })));
															if (range) {
																if (range.isPrivate) {
																	return true;
																}
															} else {
																return true;
															}
															if (listProvider[selectedProviderIndex]?.blackoutDates?.find(blackoutDate => moment(blackoutDate).year() == date.year() && moment(blackoutDate).month() == date.month() && moment(blackoutDate).date() == date.date())) {
																return true;
															}
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