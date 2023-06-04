import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Modal, Button, Row, Col, Switch, Select, Typography, Calendar, Avatar, Input, Form, message, Popover, Spin } from 'antd';
import { BiChevronLeft, BiChevronRight, BiSearch } from 'react-icons/bi';
import { BsCheck } from 'react-icons/bs';
import { GoPrimitiveDot } from 'react-icons/go';
import { FaCalendarAlt, FaHandHoldingUsd } from 'react-icons/fa';
import intl from 'react-intl-universal';
import moment from 'moment';
import 'moment/locale/en-au';
import { MdAdminPanelSettings } from 'react-icons/md';

import messages from './messages';
import msgCreateAccount from '../../routes/Sign/CreateAccount/messages';
import request from '../../utils/api/request';
import { createAppointmentForParent, searchProvidersForAdmin } from '../../utils/api/apiList';
import ModalNewScreening from './ModalNewScreening';
import ModalConfirm from './ModalConfirm';
import { ADMINAPPROVED, APPOINTMENT, CLOSED, EVALUATION, PENDING, SCREEN, SUBSIDY } from '../../routes/constant';
import './style/index.less';
import '../../assets/styles/login.less';

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
		appointmentType: APPOINTMENT,
		notes: '',
		providerErrorMessage: '',
		appointments: [],
		standardRate: '',
		subsidizedRate: '',
		cancellationFee: '',
		visibleModalScreening: false,
		subsidyAvailable: false,
		restSessions: 0,
		loading: false,
		duration: 30,
		visibleModalConfirm: false,
		confirmMessage: '',
		isSubsidyOnly: false,
		user: this.props.auth.user,
	}

	getArrTime = (type, providerIndex, date) => {
		let arrTime = [];
		let duration = 30;
		const { listProvider, address, user } = this.state;
		const provider = listProvider[providerIndex];
		if (type === SCREEN || type === APPOINTMENT) {
			duration = provider?.duration;
		}
		if (type === EVALUATION) {
			duration = provider?.separateEvaluationDuration;
		}
		this.setState({ duration: duration });

		if (moment().isBefore(moment(date))) {
			if (date.day() == 6) {
				return [];
			} else if (provider?.blackoutDates?.includes(a => moment(a).year() == date.year() && moment(a).month() == date.month() && moment(a).date() == date.date())) {
				return [];
			} else {
				let ranges = [];
				if (user.role === 3 || user.role === 60) {
					ranges = provider?.manualSchedule?.filter(a => a.dayInWeek == date.day() && a.location == address && !a.isPrivate && date.isBetween(moment().set({ years: a.fromYear, months: a.fromMonth, dates: a.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }), moment().set({ years: a.toYear, months: a.toMonth, dates: a.toDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 0 })));
				} else {
					ranges = provider?.manualSchedule?.filter(a => a.dayInWeek == date.day() && a.location == address && date.isBetween(moment().set({ years: a.fromYear, months: a.fromMonth, dates: a.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }), moment().set({ years: a.toYear, months: a.toMonth, dates: a.toDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 0 })));
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
		const { user } = this.state;
		this.setState({
			skillSet: this.props.SkillSet,
			selectedDate: moment(this.props.selectedDate),
		});
		if (user.role === 30) {
			this.setState({
				selectedProvider: user.providerInfo._id,
				listProvider: [user.providerInfo],
				selectedProviderIndex: 0,
			})
		}
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
				cancellationFee: '',
				arrTime: [],
			});
		}).catch(err => {
			this.setState({
				loading: false,
				listProvider: [],
				selectedProviderIndex: -1,
				selectedProvider: undefined,
				selectedTimeIndex: -1,
				standardRate: '',
				subsidizedRate: '',
				cancellationFee: '',
				arrTime: [],
			});
		})
	}

	createAppointment = (data) => {
		const { appointmentType, selectedTimeIndex, selectedDate, selectedSkillSet, address, selectedDependent, selectedProvider, arrTime, notes, listProvider, selectedProviderIndex, standardRate, subsidizedRate, subsidyAvailable, isSubsidyOnly } = this.state;
		const { durations } = this.props.auth;

		if (selectedProvider == undefined) {
			this.setState({ providerErrorMessage: intl.formatMessage(messages.selectProvider) })
			return;
		}
		this.setState({ providerErrorMessage: '' });
		if (appointmentType !== SCREEN && (!selectedDate?.isAfter(new Date()) || selectedTimeIndex < 0)) {
			this.setState({ errorMessage: 'Please select a date and time' })
			return;
		}
		this.setState({ errorMessage: '' });

		const { years, months, date } = selectedDate.toObject();
		const hour = arrTime[selectedTimeIndex]?.value.clone().set({ years, months, date });
		const dependent = this.props.listDependents?.find(d => d._id === selectedDependent);
		const subsidy = dependent?.subsidy?.find(s => s.skillSet === selectedSkillSet && s.status === 5);

		const postData = {
			skillSet: selectedSkillSet,
			dependent: selectedDependent,
			provider: selectedProvider,
			date: appointmentType === SCREEN ? undefined : hour,
			location: appointmentType > SCREEN ? address : '',
			phoneNumber: appointmentType === SCREEN ? data.phoneNumber : '',
			notes: appointmentType === SCREEN ? data.notes : notes,
			type: (appointmentType === APPOINTMENT && subsidyAvailable && isSubsidyOnly) ? SUBSIDY : appointmentType,
			subsidyOnly: appointmentType === APPOINTMENT && subsidyAvailable && isSubsidyOnly,
			subsidy: (appointmentType === APPOINTMENT && isSubsidyOnly && subsidyAvailable) ? subsidy?._id : undefined,
			status: 0,
			rate: appointmentType === EVALUATION ? listProvider[selectedProviderIndex]?.separateEvaluationRate : (appointmentType === APPOINTMENT && subsidyAvailable && isSubsidyOnly) ? subsidizedRate : appointmentType === APPOINTMENT ? standardRate : 0,
			screeningTime: appointmentType === SCREEN ? data.time : '',
			duration: appointmentType === EVALUATION ? listProvider[selectedProviderIndex]?.separateEvaluationDuration : listProvider[selectedProviderIndex]?.duration,
		};
		this.setState({ visibleModalScreening: false });
		if (appointmentType === EVALUATION) {
			this.setState({
				visibleModalConfirm: true,
				confirmMessage: (<span><span className='text-bold'>{listProvider[selectedProviderIndex]?.firstName ?? ''} {listProvider[selectedProviderIndex]?.lastName ?? ''}</span> requires a <span className='text-bold'>{durations?.find(a => a.value == postData?.duration)?.label}</span> evaluation. Please proceed to schedule.</span>)
			});
		} else {
			this.requestCreateAppointment(postData);
		}
	}

	onConfirmEvaluation = () => {
		this.onCloseModalConfirm();
		const { appointmentType, selectedTimeIndex, selectedDate, selectedSkillSet, address, selectedDependent, selectedProvider, arrTime, notes, listProvider, selectedProviderIndex, duration } = this.state;
		const { years, months, date } = selectedDate.toObject();
		const hour = arrTime[selectedTimeIndex]?.value.clone().set({ years, months, date });
		const postData = {
			skillSet: selectedSkillSet,
			dependent: selectedDependent,
			provider: selectedProvider,
			date: hour,
			location: address,
			notes: notes,
			duration: duration,
			type: appointmentType,
			status: 0,
			rate: listProvider[selectedProviderIndex]?.separateEvaluationRate ?? 0,
		};
		this.requestCreateAppointment(postData);
	}

	onFinishFailed = (err) => {
		console.log('form data error---', err);
	}

	handleChangeAddress = address => {
		const { searchKey, selectedSkillSet, selectedDependent, user } = this.state;
		this.setState({ address: address, subsidyAvailable: false, isSubsidyOnly: false }, () => {
			if (user.role === 30) {
				this.onChooseProvider(0);
			} else {
				this.searchProvider(searchKey, address, selectedSkillSet, selectedDependent);
			}
		});
	};

	onSelectDate = (newValue) => {
		this.setState({
			selectedDate: newValue,
			selectedTimeIndex: -1,
		});
		if (newValue?.isSameOrAfter(new Date())) {
			const { selectedProviderIndex, listProvider, appointmentType, selectedDependent } = this.state;

			if (selectedProviderIndex > -1) {
				const newArrTime = this.getArrTime(appointmentType, selectedProviderIndex, newValue);
				const appointments = listProvider[selectedProviderIndex]?.appointments?.filter(appointment => appointment.status === 0) ?? [];

				newArrTime.map(time => {
					const { years, months, date } = newValue.toObject();
					time.value = moment(time.value).set({ years, months, date });

					let flag = true;
					this.props.listDependents?.find(dependent => dependent._id === selectedDependent)?.appointments?.filter(appointment => appointment.status === 0)?.forEach(appointment => {
						if (time.value.isSame(moment(appointment.date))) {
							flag = false;
						}
					})
					appointments?.filter(appointment => appointment.status === 0)?.forEach(appointment => {
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
		} else {
			this.setState({ arrTime: [] });
		}
	}

	nextMonth = () => {
		this.onSelectDate(moment(this.state.selectedDate).add(1, 'month'));
	}

	prevMonth = () => {
		this.onSelectDate(moment(this.state.selectedDate).add(-1, 'month'));
	}

	onChooseProvider = (providerIndex) => {
		const { listProvider, selectedDate, selectedDependent, selectedSkillSet } = this.state;
		const appointments = listProvider[providerIndex]?.appointments ?? [];

		const flagAppointments = appointments?.filter(a => a?.dependent === selectedDependent && a?.flagStatus === 1);
		const declinedAppointments = appointments?.filter(a => a?.dependent === selectedDependent && a?.status === -3);

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
				if (appointments?.find(a => a.dependent === selectedDependent && a.type === SCREEN && a.status === CLOSED)) {
					if (appointments?.find(a => a.dependent === selectedDependent && a.type === EVALUATION && a.status === CLOSED)) {
						appointmentType = APPOINTMENT;
					} else {
						if (appointments?.find(a => a.dependent === selectedDependent && a.type === SCREEN && a.status === CLOSED && a.skipEvaluation)) {
							appointmentType = APPOINTMENT;
						} else {
							if (appointments?.find(a => a.dependent === selectedDependent && a.type === EVALUATION && a.status === PENDING)) {
								message.warning("Scheduling with this provider will be available after the evaluation");
								return;
							}
							appointmentType = EVALUATION;
						}
					}
				} else {
					if (appointments?.find(a => a.dependent === selectedDependent && a.type === SCREEN && a.status === PENDING)) {
						message.warning("Your screening request is still being processed", 5);
						return;
					}
					appointmentType = SCREEN;
				}
			} else {
				if (appointments?.find(a => a.dependent === selectedDependent && a.type === SCREEN && a.status === CLOSED)) {
					appointmentType = APPOINTMENT;
				} else {
					if (appointments?.find(a => a.dependent === selectedDependent && a.type === SCREEN && a.status === PENDING)) {
						message.warning("Your screening request is still being processed", 5);
						return;
					}
					appointmentType = SCREEN;
				}
			}
		} else {
			if (listProvider[providerIndex].isSeparateEvaluationRate) {
				if (appointments?.find(a => a.dependent === selectedDependent && a.type === EVALUATION && a.status === CLOSED)) {
					appointmentType = APPOINTMENT;
				} else {
					if (appointments?.find(a => a.dependent === selectedDependent && a.type === EVALUATION && a.status === PENDING)) {
						message.warning("Scheduling with this provider will be available after the evaluation");
						return;
					}
					appointmentType = EVALUATION;
				}
			} else {
				appointmentType = APPOINTMENT;
			}
		}
		this.setState({ appointmentType: appointmentType });

		const newArrTime = this.getArrTime(appointmentType, providerIndex, selectedDate);
		newArrTime?.map(time => {
			const { years, months, date } = selectedDate?.toObject();
			time.value = moment(time.value).set({ years, months, date });

			let flag = true;
			this.props.listDependents?.find(dependent => dependent._id === selectedDependent)?.appointments?.filter(appointment => appointment.status === 0)?.forEach(appointment => {
				if (time.value.isSame(moment(appointment.date))) {
					flag = false;
				}
			})
			appointments?.filter(appointment => appointment.status === 0)?.forEach(appointment => {
				if (time.value.isSame(moment(appointment.date))) {
					flag = false;
				}
			})

			if (!flag) {
				time.active = false;
			}
			return time;
		})

		let standardRate = 0;
		let subsidizedRate = 0;

		if (selectedDependent) {
			const currentGrade = this.props.listDependents?.find(dependent => dependent?._id === selectedDependent)?.currentGrade;

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
				standardRate = listProvider[providerIndex]?.academicLevel?.find(level => level.level === currentGrade)?.rate;
				subsidizedRate = listProvider[providerIndex]?.academicLevel?.find(level => level.level === currentGrade)?.subsidizedRate;
			}

			if (selectedSkillSet) {
				const dependent = this.props.listDependents?.find(d => d._id === selectedDependent);
				const subsidy = dependent?.subsidy?.find(s => s.skillSet === selectedSkillSet && s.status === ADMINAPPROVED);
				if (subsidy) {
					const subsidyAppointments = dependent?.appointments?.filter(a => a.skillSet === selectedSkillSet && a.type === SUBSIDY && [PENDING, CLOSED].includes(a.status))?.length ?? 0;
					const totalSessions = subsidy.numberOfSessions ?? 0;
					this.setState({ subsidyAvailable: true, restSessions: totalSessions - subsidyAppointments, isSubsidyOnly: true });
				}
			}
		}

		this.setState({
			selectedProviderIndex: providerIndex,
			selectedProvider: listProvider[providerIndex]._id,
			arrTime: newArrTime,
			standardRate: standardRate,
			subsidizedRate: subsidizedRate,
			cancellationFee: listProvider[providerIndex].cancellationFee,
		});
	}

	onSelectTime = (index) => {
		this.setState({ selectedTimeIndex: index })
		index > -1 && this.setState({ errorMessage: '' });
	}

	requestCreateAppointment(postData) {
		request.post(createAppointmentForParent, postData).then(result => {
			if (result.success) {
				this.setState({ errorMessage: '' });
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
		const { searchKey, address, selectedSkillSet, user } = this.state;
		this.setState({
			selectedDependent: dependentId,
			skillSet: user.role === 30 ? dependents?.find(dependent => dependent._id === dependentId)?.services?.filter(s => user.providerInfo?.skillSet?.find(skill => skill?._id === s?._id)) : dependents?.find(dependent => dependent._id === dependentId)?.services,
			addressOptions: dependents?.find(dependent => dependent._id === dependentId)?.school?.name ? ['Dependent Home', 'Provider Office', dependents?.find(dependent => dependent._id === dependentId)?.school?.name] : ['Dependent Home', 'Provider Office'],
			subsidyAvailable: false,
			isSubsidyOnly: false,
		}, () => {
			if (user.role === 30) {
				this.onChooseProvider(0);
			} else {
				this.searchProvider(searchKey, address, selectedSkillSet, dependentId);
			}
		});
	}

	handleSelectSkill = (skill) => {
		const { searchKey, address, selectedDependent, user } = this.state;
		this.setState({ selectedSkillSet: skill, subsidyAvailable: false, isSubsidyOnly: false }, () => {
			if (user.role === 30) {
				this.onChooseProvider(0);
			} else {
				this.searchProvider(searchKey, address, skill, selectedDependent);
			}
		});
	}

	handleChangeNote = (notes) => {
		this.setState({ notes: notes });
	}

	onOpenModalScreening = () => {
		const { selectedDependent, listProvider, selectedProviderIndex } = this.state;
		const appointment = listProvider[selectedProviderIndex]?.appointments?.find(a => a.dependent === selectedDependent && a.type === SCREEN && a.status === PENDING);
		if (appointment) {
			message.warning("Your screening request is still being processed", 5);
			return;
		}

		this.setState({ visibleModalScreening: true });
	}

	onCloseModalScreening = () => {
		this.setState({ visibleModalScreening: false });
	}

	onCloseModalConfirm = () => {
		this.setState({ visibleModalConfirm: false });
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
			subsidyAvailable,
			restSessions,
			loading,
			notes,
			address,
			visibleModalConfirm,
			confirmMessage,
			isSubsidyOnly,
			cancellationFee,
			user,
		} = this.state;
		const { durations } = this.props.auth;
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
		const modalConfirmProps = {
			visible: visibleModalConfirm,
			onSubmit: this.onConfirmEvaluation,
			onCancel: this.onCloseModalConfirm,
			message: confirmMessage,
		}

		return (
			<Modal {...modalProps}>
				<div className='new-appointment'>
					<Form onFinish={() => appointmentType === SCREEN ? this.onOpenModalScreening() : this.createAppointment()} onFinishFailed={this.onFinishFailed} layout='vertical'>
						<div className='flex gap-5 items-center'>
							<p className='font-30 mb-10'>{appointmentType === APPOINTMENT && intl.formatMessage(messages.newAppointment)}{appointmentType === EVALUATION && intl.formatMessage(messages.newEvaluation)}{appointmentType === SCREEN && intl.formatMessage(messages.newScreening)}</p>
							{appointmentType === EVALUATION && selectedProviderIndex > -1 && (
								<div className='font-20'>
									<div>{durations?.find(a => a.value == listProvider[selectedProviderIndex]?.separateEvaluationDuration)?.label} evaluation</div>
									<div>Rate: ${listProvider[selectedProviderIndex]?.separateEvaluationRate}</div>
								</div>
							)}
						</div>
						<div className='flex flex-row items-center mb-10'>
							<p className='font-16 mb-0'>{intl.formatMessage(messages.selectOptions)}<sup>*</sup></p>
							{appointmentType === APPOINTMENT && subsidyAvailable && (
								<div className='flex flex-row items-center ml-20 gap-5'>
									<p className='mb-0'>Number of Sessions: {restSessions}</p>
									<div className='flex items-center gap-2'>
										<Switch size="small" checked={isSubsidyOnly} onChange={v => this.setState({ isSubsidyOnly: v })} />
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
									rules={[{ required: true, message: intl.formatMessage(messages.pleaseSelect) + ' ' + intl.formatMessage(msgCreateAccount.dependent) }]}
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
									label={intl.formatMessage(msgCreateAccount.services)}
									rules={[{ required: true, message: intl.formatMessage(messages.pleaseSelect) + ' ' + intl.formatMessage(msgCreateAccount.servicesRequired) }]}
								>
									<Select
										showSearch
										optionFilterProp="children"
										filterOption={(input, option) => option.children?.includes(input)}
										onChange={v => this.handleSelectSkill(v)}
										placeholder={intl.formatMessage(msgCreateAccount.services)}
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
									rules={[{ required: [EVALUATION, APPOINTMENT, SUBSIDY].includes(appointmentType), message: intl.formatMessage(messages.pleaseSelect) + ' ' + intl.formatMessage(msgCreateAccount.location) }]}
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
						{user.role === 30 ? null : (
							<div className='choose-doctor'>
								<p className='font-16 mt-10'>{intl.formatMessage(messages.selectProvider)}<sup>*</sup></p>
								<div className='doctor-content'>
									<Row>
										<Col xs={24} sm={24} md={8} className='select-small'>
											<Input
												name='SearchProvider'
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
												{selectedProvider === provider._id ? (
													<BsCheck size={12} className='selected-doctor' />
												) : null}
												{user.role === 100 && provider.isPrivateForHmgh ? (
													<MdAdminPanelSettings size={12} className='selected-private-provider' />
												) : null}
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
											{user.role > 3 && (listProvider[selectedProviderIndex]?.isPrivateForHmgh || listProvider[selectedProviderIndex]?.manualSchedule?.find(a => a.isPrivate && a.location === address && selectedDate?.isBetween(moment().set({ years: a.fromYear, months: a.fromMonth, dates: a.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }), moment().set({ years: a.toYear, months: a.toMonth, dates: a.toDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 0 })))) ? <FaCalendarAlt size={16} className="text-green500" /> : null}
										</p>
										<p className='font-700 ml-auto text-primary'>{listProvider[selectedProviderIndex]?.isNewClientScreening ? listProvider[selectedProviderIndex]?.appointments?.find(a => a.dependent === selectedDependent && a.type === SCREEN && a.status === CLOSED) ? intl.formatMessage(messages.screenCompleted) : intl.formatMessage(messages.screeningRequired) : ''}</p>
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
											{standardRate && <p>{intl.formatMessage(msgCreateAccount.rate)}: ${standardRate}</p>}
											{(subsidizedRate && subsidizedRate != standardRate) && <p>{intl.formatMessage(messages.subsidizedRate)}: ${subsidizedRate}</p>}
											{cancellationFee && <p>{intl.formatMessage(msgCreateAccount.cancellationFee)}: ${cancellationFee}</p>}
										</div>
									</div>
									<div className='flex mt-10'>
										<div className='flex-1'>
											<p className='text-bold'>{intl.formatMessage(msgCreateAccount.services)}</p>
											{listProvider[selectedProviderIndex]?.skillSet?.map((skill, index) => (
												<p key={index} className='font-12'>{skill.name}</p>
											))}
										</div>
										<div className='flex-1'>
											<p className='text-bold'>{intl.formatMessage(messages.gradeLevels)}</p>
											{listProvider[selectedProviderIndex]?.academicLevel?.map((level, i) => (
												<p className='font-12' key={i}>{level.level}</p>
											))}
										</div>
									</div>
									<p className='text-bold mt-10'>{intl.formatMessage(messages.profile)}</p>
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
														if (selectedProviderIndex > -1 && user.role > 3) {
															const availableTime = listProvider[selectedProviderIndex]?.manualSchedule?.find(time => time.dayInWeek === date.day() && time.location === address && time.isPrivate);
															if (availableTime) {
																const availableFromDate = moment().set({ years: availableTime.fromYear, months: availableTime.fromMonth, dates: availableTime.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
																const availableToDate = moment().set({ years: availableTime.toYear, months: availableTime.toMonth, dates: availableTime.toDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 0 });
																if (date.isBetween(availableFromDate, availableToDate) && !listProvider[selectedProviderIndex]?.blackoutDates?.find(blackoutDate => moment(blackoutDate).year() === date.year() && moment(blackoutDate).month() === date.month() && moment(blackoutDate).date() === date.date())) {
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

														if (selectedProviderIndex > -1) {
															const range = listProvider[selectedProviderIndex]?.manualSchedule?.find(d => d.dayInWeek === date.day() && d.location === address && date.isBetween(moment().set({ years: d.fromYear, months: d.fromMonth, dates: d.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }), moment().set({ years: d.toYear, months: d.toMonth, dates: d.toDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 0 })));
															if (range) {
																if (user.role < 100 && range.isPrivate) {
																	return true;
																}
															} else {
																return true;
															}
															if (listProvider[selectedProviderIndex]?.blackoutDates?.find(blackoutDate => moment(blackoutDate).year() === date.year() && moment(blackoutDate).month() === date.month() && moment(blackoutDate).date() === date.date())) {
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
												<div className='grid grid-columns-2 gap-2'>
													{arrTime?.map((time, index) => (
														<div key={index}>
															<div className={`${selectedTimeIndex === index ? 'active' : ''} ${time.active ? 'time-available' : 'time-not-available'} ${listProvider[selectedProviderIndex]?.manualSchedule?.find(a => a.dayInWeek === selectedDate.day() && a.location === address && a.isPrivate && selectedDate.isBetween(moment().set({ years: a.fromYear, months: a.fromMonth, dates: a.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }), moment().set({ years: a.toYear, months: a.toMonth, dates: a.toDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 0 })) && (time.value?.isBetween(moment(time.value).clone().set({ hours: a.openHour, minutes: a.openMin }), moment(time.value).clone().set({ hours: a.closeHour, minutes: a.closeMin })) || time.value?.isSame(moment(time.value).set({ hours: a.openHour, minutes: a.openMin })))) ? 'border border-1 border-warning' : ''}`} onClick={() => time.active ? this.onSelectTime(index) : this.onSelectTime(-1)}>
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
						{visibleModalScreening && <ModalNewScreening {...modalScreeningProps} />}
						{visibleModalConfirm && <ModalConfirm {...modalConfirmProps} />}
						{errorMessage.length > 0 && (<p className='text-right text-red mr-5'>{errorMessage}</p>)}
						<Row className='justify-end gap-2 mt-10'>
							<Button key="back" onClick={this.props.onCancel}>
								{intl.formatMessage(messages.goBack).toUpperCase()}
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

const mapStateToProps = state => ({
	auth: state.auth,
});

export default compose(connect(mapStateToProps))(ModalNewAppointmentForParents);