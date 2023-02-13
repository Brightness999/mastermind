import React from 'react';
import { Modal, Button, Row, Col, Switch, Select, Typography, Calendar, Avatar, Input, Popover, message, Form, Spin } from 'antd';
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
import { rescheduleAppointmentForParent, searchProvidersForAdmin } from '../../utils/api/apiList';
import { FaCalendarAlt, FaHandHoldingUsd } from 'react-icons/fa';
import ModalNewScreening from './ModalNewScreening';

class ModalCurrentAppointment extends React.Component {
	state = {
		selectedDate: moment(),
		selectedPrivateDate: moment(),
		selectedProviderIndex: -1,
		selectedTimeIndex: -1,
		listProvider: [],
		selectedSkillSet: undefined,
		address: '',
		addressOptions: store.getState().auth.locations,
		selectedDependent: undefined,
		selectedProvider: undefined,
		arrTime: [],
		privateArrTime: [],
		errorMessage: '',
		skillSet: store.getState().auth.skillSet,
		searchKey: '',
		appointmentType: 3,
		notes: '',
		providerErrorMessage: '',
		isConfirm: false,
		dependents: store.getState().auth.dependents,
		standardRate: '',
		subsidizedRate: '',
		visibleModalScreening: false,
		screeningData: undefined,
		userRole: store.getState().auth.user.role,
		subsidyAvailable: false,
		restSessions: 0,
		loading: false,
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

		let hour9AM = moment().set({ hours: 9, minutes: 0, seconds: 0, milliseconds: 0 });
		for (let i = 0; i < 180 / duration; i++) {
			let newTime = hour9AM.clone();
			hour9AM = hour9AM.add(duration, 'minutes')
			arrTime.push({
				value: newTime,
				active: false,
			});
		}

		let hour2PM = moment().set({ hours: 14, minutes: 0, seconds: 0, milliseconds: 0 });
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
		const event = this.props.event;
		this.setState({
			selectedDependent: event?.dependent?._id,
			selectedSkillSet: event?.skillSet?._id,
			address: event?.location ?? undefined,
			appointmentType: event?.type,
			notes: event?.notes,
			skillSet: store.getState().auth.dependents?.find(dependent => dependent._id == event?.dependent?._id)?.services ?? [],
			selectedProvider: event?.provider?._id,
			selectedDate: moment(event?.date),
			addressOptions: ['Dependent Home', 'Provider Office', store.getState().auth.dependents?.find(dependent => dependent._id == event?.dependent?._id)?.school?.name],
		});
		this.form?.setFieldsValue({ dependent: event?.dependent?._id, skill: event?.skillSet?._id, address: event?.location, phoneNumber: event?.phoneNumber });
		this.searchProvider('', event?.location, event?.skillSet?._id, event?.dependent?._id, true, event?.provider?._id);
	}

	searchProvider(searchKey, address, selectedSkillSet, dependentId, isInitial, providerId) {
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
				this.setState({ listProvider: data.providers });
				if (isInitial) {
					data.providers?.forEach((provider, i) => {
						if (provider?._id == providerId) {
							this.setState({ selectedProviderIndex: i }, () => {
								this.onChooseProvider(i);
							});
						}
					})
				} else {
					this.setState({ selectedProviderIndex: -1 });
				}
			} else {
				this.setState({ listProvider: [] });
			}
			this.setState({ standardRate: '', subsidizedRate: '' });
			!isInitial && this.setState({ selectedProvider: undefined });
		}).catch(err => {
			console.log('provider list error-----', err);
			this.setState({
				loading: false,
				listProvider: [],
				selectedProviderIndex: -1,
				selectedProvider: undefined,
				standardRate: '',
				subsidizedRate: '',
			});
		})
	}

	createAppointment = (data) => {
		const { appointmentType, selectedTimeIndex, selectedDate, selectedProvider, arrTime, selectedProviderIndex, listProvider } = this.state;
		if (selectedProvider == undefined) {
			this.setState({ providerErrorMessage: intl.formatMessage(messages.selectProvider) })
			return;
		}
		if (appointmentType != 1 && (!selectedDate?.isAfter(new Date()) || selectedTimeIndex < 0)) {
			this.setState({ errorMessage: 'Please select a date and time' })
			return;
		}
		this.setState({ errorMessage: '' })
		if (appointmentType == 2) {
			const appointment = listProvider[selectedProviderIndex]?.appointments?.find(a => a._id != this.props.event?._id && a.dependent == selectedDependent && a.type == 2 && a.status == 0);
			if (appointment) {
				message.warning("You can't create more evaluation.");
				return;
			}
		}
		if (appointmentType == 1) {
			const appointment = listProvider[selectedProviderIndex]?.appointments?.find(a => a._id != this.props.event?._id && a.dependent == selectedDependent && a.type == 1 && a.status == 0);
			if (appointment) {
				message.warning("Your screening request is still being processed", 5);
				return;
			}
		}
		const { years, months, date } = selectedDate.toObject();
		const hour = arrTime[selectedTimeIndex]?.value.clone().set({ years, months, date });
		this.setState({ selectedDate: hour, visibleModalScreening: false, screeningData: data });
		this.onConfirm();
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
			const { selectedProviderIndex, dependents, selectedDependent, listProvider, appointmentType } = this.state;
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
							dependents.find(dependent => dependent._id == selectedDependent)?.appointments?.filter(appointment => appointment.status == 0)?.forEach(appointment => {
								if (time.value.isSame(moment(appointment.date))) {
									flag = false;
								}
							})
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
					newArrTime.map(time => ({ ...time, active: false }));
				}
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
		this.onSelectDate(moment(this.state.selectedDate).add(1, 'month'));
	}

	prevMonth = () => {
		this.setState({
			selectedDate: moment(this.state.selectedDate).add(-1, 'month'),
			selectedTimeIndex: -1,
		});
		this.onSelectDate(moment(this.state.selectedDate).add(-1, 'month'));
	}

	onChooseProvider = (providerIndex) => {
		this.setState({ providerErrorMessage: '' });
		const { listProvider, selectedDate, dependents, selectedDependent, selectedSkillSet } = this.state;
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
		const newPrivateArrTime = this.getArrTime(1, providerIndex);
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
					dependents.find(dependent => dependent._id == selectedDependent)?.appointments?.filter(appointment => appointment.status == 0)?.forEach(appointment => {
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
		if (availableTime && availableTime.isPrivate) {
			const availableFromDate = moment().set({ years: availableTime.fromYear, months: availableTime.fromMonth, dates: availableTime.fromDate });
			const availableToDate = moment().set({ years: availableTime.toYear, months: availableTime.toMonth, dates: availableTime.toDate });
			const openTime = selectedDate.clone().set({ hours: availableTime.openHour, minutes: availableTime.openMin, seconds: 0, milliseconds: 0 });
			const closeTime = selectedDate.clone().set({ hours: availableTime.closeHour, minutes: availableTime.closeMin, seconds: 0, milliseconds: 0 }).add(-duration, 'minutes');
			newPrivateArrTime.map(time => {
				const { years, months, date } = selectedDate?.toObject();
				time.value = moment(time.value).set({ years, months, date });
				if (time.value.isBetween(availableFromDate, availableToDate) && time.value.isSameOrAfter(openTime) && time.value.isSameOrBefore(closeTime)) {
					time.active = true;
				} else {
					time.active = false;
				}
				return time;
			})
		} else {
			newPrivateArrTime.map(time => {
				time.active = false;
				return time;
			})
		}

		let standardRate = 0;
		let subsidizedRate = 0;

		if (selectedDependent) {
			const currentGrade = dependents?.find(dependent => dependent?._id == selectedDependent)?.currentGrade;

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
	}

	requestUpdateAppointment(postData) {
		const { searchKey, address, selectedSkillSet, selectedDependent } = this.state;
		request.post(rescheduleAppointmentForParent, postData).then(result => {
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
		const { searchKey, address, selectedSkillSet, dependents } = this.state;
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

	onConfirm = () => {
		this.setState({ isConfirm: true });
	}

	displayTime = (value) => {
		return `${value?.split(' ')[0]?.split(':')[0]}:${value?.split(' ')[0]?.split(':')[1]} ${value?.split(' ')[1]}`;
	}

	handleReschedule = () => {
		const { listProvider, selectedProviderIndex, appointmentType, selectedDate, selectedSkillSet, address, selectedDependent, selectedProvider, notes, standardRate, subsidizedRate, screeningData } = this.state;
		const postData = {
			_id: this.props.event?._id,
			skillSet: selectedSkillSet,
			dependent: selectedDependent,
			provider: selectedProvider,
			date: appointmentType == 1 ? undefined : selectedDate?.valueOf(),
			location: appointmentType > 1 ? address : '',
			phoneNumber: appointmentType == 1 ? screeningData?.phoneNumber : '',
			notes: appointmentType == 1 ? screeningData?.notes : notes,
			type: appointmentType,
			status: 0,
			rate: appointmentType == 2 ? listProvider[selectedProviderIndex]?.separateEvaluationRate : appointmentType == 3 ? standardRate : appointmentType == 5 ? subsidizedRate : 0,
			screeningTime: appointmentType == 1 ? screeningData?.time : '',
		};
		this.requestUpdateAppointment(postData);
	}

	displayDuration = () => {
		const { event } = this.props;
		return `${moment(event?.date).format('MM/DD/YYYY hh:mm')} - ${moment(event?.date).add(event?.provider?.duration, 'minutes').format('hh:mm a')}`;
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
		const { listProvider, selectedProviderIndex } = this.state;
		const newArrTime = this.getArrTime(1, selectedProviderIndex);
		const selectedDay = newValue.day();
		const availableTime = listProvider[selectedProviderIndex]?.manualSchedule?.find(time => time.dayInWeek == selectedDay && time.isPrivate);
		if (availableTime) {
			const availableFromDate = moment().set({ years: availableTime.fromYear, months: availableTime.fromMonth, dates: availableTime.fromDate });
			const availableToDate = moment().set({ years: availableTime.toYear, months: availableTime.toMonth, dates: availableTime.toDate });
			const openTime = newValue.clone().set({ hours: availableTime.openHour, minutes: availableTime.openMin, seconds: 0, milliseconds: 0 });
			const closeTime = newValue.clone().set({ hours: availableTime.closeHour, minutes: availableTime.closeMin, seconds: 0, milliseconds: 0 }).add(-30, 'minutes');
			newArrTime.map(time => {
				const { years, months, date } = newValue.toObject();
				time.value = moment(time.value).set({ years, months, date });
				if (time.value.isBetween(availableFromDate, availableToDate) && time.value.isSameOrAfter(openTime) && time.value.isSameOrBefore(closeTime)) {
					time.active = true;
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
			selectedDependent,
			address,
			isConfirm,
			dependents,
			standardRate,
			subsidizedRate,
			visibleModalScreening,
			screeningData,
			userRole,
			subsidyAvailable,
			restSessions,
			loading,
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
		const modalScreeningProps = {
			visible: visibleModalScreening,
			onSubmit: this.createAppointment,
			onCancel: this.onCloseModalScreening,
			provider: listProvider[selectedProviderIndex],
			dependent: dependents?.find(dependent => dependent._id == selectedDependent),
			event: event,
		}

		const contentConfirm = (
			<div className='confirm-content'>
				<p className='text-center mb-5'>{intl.formatMessage(messages.areSureChangeAppoint)}</p>
				<Row gutter={10}>
					<Col xs={24} sm={24} md={12}>
						<p className='font-12 text-center mb-0'>{intl.formatMessage(messages.current)}</p>
						<div className='current-content'>
							<p className='font-10'>30 minutes {intl.formatMessage(messages.meetingWith)} <span className='font-11 font-700'>{`${event?.provider?.firstName ?? ''} ${event?.provider?.lastName ?? ''}`}</span></p>
							<p className='font-10'>{intl.formatMessage(msgDrawer.who)}: {`${event?.dependent?.firstName ?? ''} ${event?.dependent?.lastName ?? ''}`}</p>
							{event?.type == 1 ? (
								<p className='font-10'>{intl.formatMessage(msgDrawer.phonenumber)}: {event?.phoneNumber}</p>
							) : (
								<p className='font-10'>{intl.formatMessage(msgDrawer.where)}: {event?.location}</p>
							)}
							<p className='font-10 nobr'>{intl.formatMessage(msgDrawer.when)}: <span className='font-11 font-700'>{this.displayTime(new Date(event?.date)?.toLocaleTimeString())}</span> on <span className='font-11 font-700'>{new Date(event?.date)?.toLocaleDateString()}</span></p>
						</div>
					</Col>
					<Col xs={24} sm={24} md={12}>
						<p className='font-12 text-center mb-0'>{intl.formatMessage(messages.new)}</p>
						<div className='new-content'>
							<p className='font-10'>30 minutes {intl.formatMessage(messages.meetingWith)} <span className='font-11 font-700'>{`${listProvider[selectedProviderIndex]?.firstName ?? ''} ${listProvider[selectedProviderIndex]?.lastName ?? ''}`}</span></p>
							<p className='font-10'>{intl.formatMessage(msgDrawer.who)}: {`${dependents.find(dependent => dependent._id == selectedDependent)?.firstName ?? ''} ${dependents?.find(dependent => dependent._id == selectedDependent)?.lastName ?? ''}`}</p>
							{appointmentType == 1 ? (
								<p className='font-10'>{intl.formatMessage(msgDrawer.phonenumber)}: {screeningData?.phoneNumber}</p>
							) : (
								<p className='font-10'>{intl.formatMessage(msgDrawer.where)}: {address}</p>
							)}
							{appointmentType == 1 ? (
								<p className='font-10 nobr'>{intl.formatMessage(msgDrawer.when)}: <span className='font-11 font-700'>{screeningData?.time ?? ''}</span></p>
							) : (
								<p className='font-10 nobr'>{intl.formatMessage(msgDrawer.when)}: <span className='font-11 font-700'>{this.displayTime(new Date(selectedDate?.toString())?.toLocaleTimeString())}</span> on <span className='font-11 font-700'>{new Date(selectedDate?.toString())?.toLocaleDateString()}</span></p>
							)}
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
						onFinish={() => appointmentType == 1 ? this.onOpenModalScreening() : this.createAppointment()}
						onFinishFailed={this.onFinishFailed}
						ref={ref => this.form = ref}
					>
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
									rules={[{ required: appointmentType == 3, message: "Select an appointment location." }]}
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
						)}
						<Row gutter={10}>
							<Col xs={24} sm={24} md={10}>
								<div className='provider-profile'>
									<div className='flex flex-row items-center'>
										<p className='font-16 font-700'>
											{`${listProvider[selectedProviderIndex]?.firstName ?? ''} ${listProvider[selectedProviderIndex]?.lastName ?? ''}`}
											{!!listProvider[selectedProviderIndex]?.academicLevel?.length ? <FaHandHoldingUsd size={16} className='mx-10 text-green500' /> : null}
											{userRole > 3 && listProvider[selectedProviderIndex]?.manualSchedule?.find(m => m.isPrivate) ? <Popover content={this.privateSlot} trigger="click"><FaCalendarAlt size={16} className="text-green500 cursor" /></Popover> : null}
										</p>
										<p className='font-700 ml-auto text-primary'>{listProvider[selectedProviderIndex]?.isNewClientScreening ? intl.formatMessage(messages.screeningRequired) : ''}</p>
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
												<p key={i} className='font-12'>{level.level}</p>
											))}
										</div>
									</div>
									<p className='mt-10 text-bold'>Profile</p>
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
													disabledDate={(date) => {
														if (date.isBefore(moment())) {
															return true;
														}

														if (date.isAfter(moment()) && date.day() == 6) {
															return true;
														}

														if (selectedProviderIndex > -1) {
															const range = listProvider[selectedProviderIndex]?.manualSchedule?.find(d => d.dayInWeek == date.day() && date.isBetween(moment().set({ years: d.fromYear, months: d.fromMonth, dates: d.fromDate }), moment().set({ years: d.toYear, months: d.toMonth, dates: d.toDate })));
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
							{!isConfirm && <Button key="submit" type="primary" htmlType='submit'>
								{intl.formatMessage(msgDrawer.reschedule)?.toUpperCase()}
							</Button>}
							{isConfirm && (
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
					{visibleModalScreening && <ModalNewScreening {...modalScreeningProps} />}
				</div>
			</Modal>
		);
	}
};

export default ModalCurrentAppointment;