import React from 'react';
import { Modal, Button, Row, Col, Switch, Select, Typography, Calendar, Avatar, Input, Form, message, Spin, Dropdown, Upload } from 'antd';
import { BiChevronLeft, BiChevronRight, BiSearch, BiUpload } from 'react-icons/bi';
import { BsCheck } from 'react-icons/bs';
import { GoPrimitiveDot } from 'react-icons/go';
import { MdAdminPanelSettings } from 'react-icons/md';
import { FaCalendarAlt, FaHandHoldingUsd } from 'react-icons/fa';
import intl from 'react-intl-universal';
import moment from 'moment';
import 'moment/locale/en-au';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { DownOutlined } from '@ant-design/icons';

import messages from './messages';
import msgCreateAccount from 'routes/Sign/CreateAccount/messages';
import request from 'utils/api/request'
import { createAppointmentForParent, getDefaultDataForAdmin, searchProvidersForAdmin } from 'utils/api/apiList';
import ModalNewScreening from './ModalNewScreening';
import ModalConfirm from './ModalConfirm';
import { setAppointments, setAppointmentsInMonth } from 'src/redux/features/appointmentsSlice';
import { ADMINAPPROVED, APPOINTMENT, CLOSED, DEPENDENTHOME, Durations, EVALUATION, PENDING, PROVIDEROFFICE, SCREEN, SUBSIDY } from 'routes/constant';
import { url } from 'src/utils/api/baseUrl'
import './style/index.less';
import '../../assets/styles/login.less';

const { Paragraph } = Typography;
moment.locale('en');

class ModalNewAppointment extends React.Component {
	state = {
		selectedDate: moment(),
		selectedProviderIndex: -1,
		selectedTimeIndex: -1,
		listProvider: [],
		selectedSkill: undefined,
		address: '',
		addressOptions: [],
		selectedDependent: undefined,
		selectedProvider: undefined,
		arrTime: [],
		errorMessage: '',
		skillSet: this.props.skillSet,
		searchKey: '',
		appointmentType: APPOINTMENT,
		notes: '',
		providerErrorMessage: '',
		duration: 30,
		standardRate: 0,
		subsidizedRate: 0,
		visibleModalScreening: false,
		subsidyAvailable: false,
		restSessions: 0,
		loadingSearchProvider: false,
		visibleModalConfirm: false,
		confirmMessage: '',
		isSubsidyOnly: true,
		cancellationFee: '',
		loadingSchedule: false,
		fileList: [],
		loading: false,
		dependents: [],
	}
	scrollElement = React.createRef();

	getArrTime = (type, providerIndex, date) => {
		let arrTime = [];
		let duration = 30;
		const { listProvider, address } = this.state;
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
			} else if (provider?.durationValue && date.isSameOrAfter(moment().add(provider?.durationValue, provider?.durationType).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }))) {
				return [];
			} else if (date.isSameOrAfter(moment().add(15, 'years').set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }))) {
				return [];
			} else {
				const ranges = provider?.manualSchedule?.filter(a => a.dayInWeek == date.day() && a.location == address && date.isBetween(moment().set({ years: a.fromYear, months: a.fromMonth, dates: a.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }), moment().set({ years: a.toYear, months: a.toMonth, dates: a.toDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 0 })));
				if (!!ranges?.length) {
					const blackoutTime = provider?.blackoutTimes?.find(t => t.year === date.year() && t.month === date.month() && t.date === date.date());
					let timeArr = ranges?.map(a => ([a.openHour, a.closeHour]))?.sort((a, b) => a[0] > b[0] ? 1 : -1)?.reduce((a, b) => {
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
							if (blackoutTime) {
								const { year, month, date, openHour, openMin, closeHour, closeMin } = blackoutTime;
								if (!startTime.clone().add(duration * i, 'minutes').isBetween(moment().clone().set({ year, month, date, hour: openHour, minute: openMin }), moment().clone().set({ year, month, date, hour: closeHour, minute: closeMin }))) {
									arrTime.push({
										value: startTime.clone().add(duration * i, 'minutes'),
										active: startTime.clone().add(duration * i, 'minutes').isAfter(moment()),
									});
								}
							} else {
								arrTime.push({
									value: startTime.clone().add(duration * i, 'minutes'),
									active: startTime.clone().add(duration * i, 'minutes').isAfter(moment()),
								});
							}
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
		const { selectedDate } = this.props;
		this.setState({ selectedDate: moment(selectedDate) });
		this.getDependentList();
	}

	getDependentList = () => {
		this.setState({ loading: true });
		request.post(getDefaultDataForAdmin, { isAppointment: true }).then(res => {
			this.setState({ loading: false });
			const { success, data } = res;
			if (success) {
				this.setState({ dependents: data });
			}
		}).catch(err => {
			this.setState({ loading: false });
			message.error(err.message);
		})
	}

	searchProvider(searchKey, address, selectedSkill, dependentId) {
		const params = {
			search: searchKey,
			address: address,
			skill: selectedSkill,
			dependentId: dependentId,
		};
		this.setState({ loadingSearchProvider: true });
		request.post(searchProvidersForAdmin, params).then(result => {
			this.setState({ loadingSearchProvider: false });
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
				standardRate: 0,
				subsidizedRate: 0,
				arrTime: [],
				cancellationFee: '',
			});
		}).catch(err => {
			message.error(err.message);
			this.setState({
				loadingSearchProvider: false,
				listProvider: [],
				selectedProviderIndex: -1,
				selectedProvider: undefined,
				selectedTimeIndex: -1,
				standardRate: 0,
				subsidizedRate: 0,
				arrTime: [],
				cancellationFee: '',
			});
		})
	}

	createAppointment = (data) => {
		const { dependents, fileList, selectedTimeIndex, selectedDate, selectedSkill, address, selectedDependent, selectedProvider, arrTime, notes, listProvider, selectedProviderIndex, duration, standardRate } = this.state;
		const appointmentType = data?.isEvaluation ? EVALUATION : this.state.appointmentType;

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
		const hour = arrTime?.[selectedTimeIndex]?.value.clone().set({ years, months, date });
		const dependent = dependents?.find(d => d._id === selectedDependent);
		const subsidies = dependent?.subsidy?.filter(s => s.skillSet === selectedSkill && s.status === 5 && selectedProvider === s.selectedProviderFromAdmin)?.sort((a, b) => new Date(a.approvalDate) > new Date(b.approvalDate) ? -1 : 1);

		const postData = {
			skillSet: selectedSkill,
			dependent: selectedDependent,
			provider: selectedProvider,
			date: hour,
			location: appointmentType > SCREEN ? address : '',
			phoneNumber: appointmentType === SCREEN ? data?.phoneNumber : '',
			notes: appointmentType === SCREEN ? data?.notes : notes,
			duration: duration,
			type: appointmentType,
			subsidyOnly: appointmentType === SUBSIDY,
			subsidy: appointmentType === SUBSIDY ? subsidies[0]?._id : undefined,
			status: PENDING,
			rate: appointmentType === EVALUATION ? (listProvider[selectedProviderIndex]?.separateEvaluationRate || 0) * 1 : appointmentType === SUBSIDY ? ((subsidies[0]?.pricePerSession || 0) * 1 + (subsidies[0]?.dependentRate || 0) * 1) : appointmentType === APPOINTMENT ? standardRate * 1 : 0,
			screeningTime: appointmentType === SCREEN ? data.time : '',
			addtionalDocuments: fileList.length > 0 ? [{ name: fileList[0].name, url: fileList[0].response.data }] : [],
		};
		this.setState({ visibleModalScreening: false });

		if (appointmentType === EVALUATION) {
			this.setState({
				visibleModalConfirm: true,
				confirmMessage: (<span><span className='text-bold'>{listProvider[selectedProviderIndex]?.firstName ?? ''} {listProvider[selectedProviderIndex]?.lastName ?? ''}</span> requires a <span className='text-bold'>{Durations?.find(a => a.value == postData?.duration)?.label}</span> evaluation. Please proceed to schedule.</span>),
			});
		} else {
			this.requestCreateAppointment(postData);
		}
	}

	onConfirmEvaluation = () => {
		this.onCloseModalConfirm();
		const { fileList, selectedTimeIndex, selectedDate, selectedSkill, address, selectedDependent, selectedProvider, arrTime, notes, listProvider, selectedProviderIndex, duration } = this.state;
		const { years, months, date } = selectedDate.toObject();
		const hour = arrTime[selectedTimeIndex]?.value.clone().set({ years, months, date });
		const postData = {
			skillSet: selectedSkill,
			dependent: selectedDependent,
			provider: selectedProvider,
			date: hour,
			location: address,
			notes: notes,
			duration: duration,
			type: EVALUATION,
			status: 0,
			rate: listProvider[selectedProviderIndex]?.separateEvaluationRate ?? 0,
			addtionalDocuments: fileList.length > 0 ? [{ name: fileList[0].name, url: fileList[0].response.data }] : [],
		};
		this.requestCreateAppointment(postData);
	}

	handleChangeAddress = address => {
		const { searchKey, selectedSkill, selectedDependent } = this.state;
		this.setState({ address: address, subsidyAvailable: false, isSubsidyOnly: false, appointmentType: APPOINTMENT });
		this.searchProvider(searchKey, address, selectedSkill, selectedDependent);
	};

	onSelectDate = (newValue) => {
		const { listAppointmentsRecent } = this.props;
		this.setState({ selectedDate: newValue, selectedTimeIndex: -1 });
		if (newValue.isSameOrAfter(new Date())) {
			const { selectedProviderIndex, selectedDependent, listProvider, appointmentType } = this.state;
			if (selectedProviderIndex > -1) {
				const newArrTime = this.getArrTime(appointmentType, selectedProviderIndex, newValue);

				newArrTime?.map(time => {
					const { years, months, date } = newValue.toObject();
					time.value = moment(time.value).set({ years, months, date });

					let flag = true;
					listAppointmentsRecent?.filter(appointment => (appointment.status === 0) && (appointment.provider?._id === listProvider[selectedProviderIndex]?._id || appointment.dependent?._id === selectedDependent))?.forEach(appointment => {
						if (time.value.toLocaleString() === moment(appointment.date).toLocaleString()) {
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
		const { dependents, listProvider, selectedDate, selectedDependent, selectedProviderIndex, selectedSkill } = this.state;
		const { listAppointmentsRecent } = this.props;
		const appointments = listProvider[providerIndex]?.appointments ?? [];

		const flagAppointments = appointments?.filter(a => a?.dependent === selectedDependent && a?.flagStatus === 1);
		const declinedProvider = dependents?.find(d => d?._id === selectedDependent)?.declinedProviders?.find(p => p.provider === listProvider[providerIndex]?._id);

		if (declinedProvider) {
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
			listAppointmentsRecent?.filter(appointment => (appointment.status === 0) && (appointment.provider?._id === listProvider[selectedProviderIndex]?._id || appointment.dependent?._id === selectedDependent))?.forEach(appointment => {
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

			if (selectedSkill) {
				const dependent = dependents?.find(d => d._id === selectedDependent);
				const subsidies = dependent?.subsidy?.filter(s => s.skillSet === selectedSkill && s.status === ADMINAPPROVED && s.selectedProviderFromAdmin === listProvider[providerIndex]._id)?.sort((a, b) => new Date(a.approvalDate) > new Date(b.approvalDate) ? -1 : 1);
				if (subsidies?.length) {
					const totalSessions = subsidies[0]?.numberOfSessions || 0;
					const subsidyAppointments = dependent?.appointments?.filter(a => a.subsidy === subsidies[0]?._id && a.type === SUBSIDY && [PENDING, CLOSED].includes(a.status))?.length || 0;
					if (totalSessions - subsidyAppointments > 0) {
						if (totalSessions - subsidyAppointments === 2) {
							message.warn("Only 2 of allotted subsidized sessions remain.");
						}
						if (totalSessions - subsidyAppointments === 1) {
							message.warn("Only 1 of allotted subsidized sessions remain.");
						}
						this.setState({ subsidyAvailable: true, restSessions: totalSessions - subsidyAppointments, isSubsidyOnly: true, appointmentType: SUBSIDY });
					}
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
		const { listAppointmentsRecent, appointmentsInMonth, onSubmit, setAppointments, setAppointmentsInMonth } = this.props;
		this.setState({ loadingSchedule: true });
		request.post(createAppointmentForParent, postData).then(result => {
			this.setState({ loadingSchedule: false });
			const { success, data } = result;
			if (success) {
				this.setState({ errorMessage: '' });
				setAppointments([...listAppointmentsRecent, data]);
				setAppointmentsInMonth([...appointmentsInMonth, data]);
				onSubmit(postData.type);
			} else {
				this.setState({ errorMessage: data });
			}
		}).catch(err => {
			this.setState({ errorMessage: err.message, loadingSchedule: false });
		});
	}

	handleSearchProvider = (value) => {
		const { address, selectedSkill, selectedDependent } = this.state;
		this.setState({ searchKey: value });
		this.searchProvider(value, address, selectedSkill, selectedDependent);
	}

	handleSelectDependent = (dependentId) => {
		const { searchKey, dependents } = this.state;
		this.setState({
			selectedDependent: dependentId,
			skillSet: dependents?.find(dependent => dependent._id === dependentId)?.services,
			addressOptions: dependents?.find(dependent => dependent._id === dependentId)?.school?.name ? [DEPENDENTHOME, PROVIDEROFFICE, dependents?.find(dependent => dependent._id === dependentId)?.school?.name] : [DEPENDENTHOME, PROVIDEROFFICE],
			subsidyAvailable: false,
			isSubsidyOnly: false,
			appointmentType: APPOINTMENT,
			address: undefined,
			selectedSkill: undefined,
		});
		this.searchProvider(searchKey, undefined, undefined, dependentId);
		this.form.setFieldsValue({ address: undefined, skill: undefined });
	}

	handleSelectSkill = (skill) => {
		const { searchKey, address, selectedDependent } = this.state;
		this.setState({ selectedSkill: skill, subsidyAvailable: false, isSubsidyOnly: false, appointmentType: APPOINTMENT });
		this.searchProvider(searchKey, address, skill, selectedDependent);
	}

	handleChangeNote = (notes) => {
		this.setState({ notes: notes });
	}

	onOpenModalScreening = () => {
		const { selectedProvider, selectedDependent, listProvider, selectedProviderIndex } = this.state;

		if (selectedProvider == undefined) {
			this.setState({ providerErrorMessage: intl.formatMessage(messages.selectProvider) })
			return;
		}

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
			restSessions,
			loadingSearchProvider,
			notes,
			address,
			visibleModalConfirm,
			confirmMessage,
			isSubsidyOnly,
			cancellationFee,
			loadingSchedule,
			subsidyAvailable,
			loading,
			dependents,
		} = this.state;
		const props = {
			name: 'file',
			action: url + "clients/upload_document",
			headers: {
				authorization: 'authorization-text',
			},
			onChange: this.onChangeUpload,
			maxCount: 1,
		};

		const modalProps = {
			className: 'modal-new',
			title: "",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: (e) => e.target.className !== 'ant-modal-wrap' && this.props.onCancel(),
			width: 1000,
			footer: null,
		};
		const modalScreeningProps = {
			visible: visibleModalScreening,
			onSubmit: this.createAppointment,
			onCancel: this.onCloseModalScreening,
			provider: listProvider[selectedProviderIndex],
			dependent: dependents?.find(dependent => dependent._id == selectedDependent),
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
					{loading ? (
						<div className='text-center'>...loading</div>
					) : (
						<Form onFinish={() => appointmentType === SCREEN ? this.onOpenModalScreening() : this.createAppointment()} layout='vertical' ref={ref => this.form = ref}>
							<div className='flex gap-5 items-center'>
								<p className='font-30 mb-10'>{(appointmentType === APPOINTMENT || appointmentType === SUBSIDY) && intl.formatMessage(messages.newAppointment)}{appointmentType === EVALUATION && intl.formatMessage(messages.newEvaluation)}{appointmentType === SCREEN && intl.formatMessage(messages.newScreening)}</p>
								{appointmentType === EVALUATION && selectedProviderIndex > -1 && (
									<div className='font-20'>
										<div>{Durations?.find(a => a.value == listProvider[selectedProviderIndex]?.separateEvaluationDuration)?.label} evaluation</div>
										<div>Rate: ${listProvider[selectedProviderIndex]?.separateEvaluationRate}</div>
									</div>
								)}
							</div>
							<div className='flex flex-row items-center mb-10'>
								<p className='font-16 mb-0'>{intl.formatMessage(messages.selectOptions)}<sup>*</sup></p>
								{subsidyAvailable && (
									<div className='flex flex-row items-center ml-20 gap-5'>
										<p className='mb-0'>Number of Sessions: {restSessions}</p>
										<div className='flex items-center gap-2'>
											<Switch size="small" checked={isSubsidyOnly} onChange={v => this.setState({ isSubsidyOnly: v, appointmentType: v ? SUBSIDY : APPOINTMENT })} />
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
											filterOption={(input, option) => option.children?.join('')?.toLowerCase()?.includes(input.toLowerCase())}
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
										label={intl.formatMessage(msgCreateAccount.services)}
										rules={[{ required: true, message: 'Please select a service.' }]}
									>
										<Select
											showSearch
											optionFilterProp="children"
											filterOption={(input, option) => option.children?.toLowerCase()?.includes(input?.toLowerCase())}
											filterSort={(optionA, optionB) => optionA.children?.toLowerCase()?.localeCompare(optionB.children?.toLowerCase())}
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
										rules={[{ required: [EVALUATION, APPOINTMENT, SUBSIDY].includes(appointmentType), message: "Select an appointment location." }]}
									>
										<Select
											showSearch
											optionFilterProp="children"
											filterOption={(input, option) => option.children?.toLowerCase()?.includes(input?.toLowerCase())}
											filterSort={(optionA, optionB) => optionA.children?.toLowerCase()?.localeCompare(optionB.children?.toLowerCase())}
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
										<Upload {...props}>
											<Button size='small' type='primary' className='btn-upload'>
												{intl.formatMessage(messages.upload).toUpperCase()} <BiUpload size={16} />
											</Button>
										</Upload>
									</Form.Item>
								</Col>
							</Row>
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
									<div className='doctor-list' onWheel={(e) => this.scrollElement.current.scrollLeft += e.deltaY / 2} ref={this.scrollElement}>
										{loadingSearchProvider ? <Spin spinning={loadingSearchProvider} size='large' className='p-10' /> : listProvider?.length > 0 ? listProvider?.map((provider, index) => (
											<div key={index} className='doctor-item' onClick={() => this.onChooseProvider(index)}>
												<Avatar shape="square" size="large" src='../images/doctor_ex2.jpeg' />
												<p className='font-12 text-center'>{`${provider.firstName ?? ''} ${provider.lastName ?? ''}`}</p>
												{selectedProvider === provider._id ? (
													<BsCheck className='selected-doctor' size={12} />
												) : null}
												{provider.isPrivateForHmgh ? (
													<MdAdminPanelSettings size={12} className='selected-private-provider' />
												) : null}
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
												{(listProvider[selectedProviderIndex]?.isPrivateForHmgh || listProvider[selectedProviderIndex]?.manualSchedule?.find(a => a.isPrivate && a.location === address && selectedDate?.isBetween(moment().set({ years: a.fromYear, months: a.fromMonth, dates: a.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }), moment().set({ years: a.toYear, months: a.toMonth, dates: a.toDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 0 })))) ? <FaCalendarAlt size={16} className="text-green500" /> : null}
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
												{standardRate ? <p>{intl.formatMessage(msgCreateAccount.rate)}: ${standardRate}</p> : ''}
												{(subsidizedRate && subsidizedRate != standardRate) ? <p>{intl.formatMessage(messages.subsidizedRate)}: ${subsidizedRate}</p> : ''}
												{standardRate ? <p>{intl.formatMessage(msgCreateAccount.cancellationFee)}: ${cancellationFee}</p> : ''}
											</div>
										</div>
										<div className='flex mt-10'>
											<div className='flex-1'>
												<p className='text-bold'>{intl.formatMessage(msgCreateAccount.services)}</p>
												{listProvider[selectedProviderIndex]?.skillSet?.map((skill, i) => (
													<p className='font-12' key={i}>{skill.name}</p>
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
															if (selectedProviderIndex > -1) {
																const availableTime = listProvider[selectedProviderIndex]?.manualSchedule?.find(time => time.dayInWeek === date.day() && time.location === address && time.isPrivate);
																if (availableTime) {
																	const availableFromDate = moment().set({ years: availableTime.fromYear, months: availableTime.fromMonth, dates: availableTime.fromDate });
																	const availableToDate = moment().set({ years: availableTime.toYear, months: availableTime.toMonth, dates: availableTime.toDate });
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
																const range = listProvider[selectedProviderIndex]?.manualSchedule?.find(d => d.dayInWeek === date.day() && d.location === address && date.isBetween(moment().set({ years: d.fromYear, months: d.fromMonth, dates: d.fromDate }), moment().set({ years: d.toYear, months: d.toMonth, dates: d.toDate })));
																if (!range) {
																	return true;
																}
																if (listProvider[selectedProviderIndex]?.blackoutDates?.find(blackoutDate => moment(blackoutDate).year() === date.year() && moment(blackoutDate).month() === date.month() && moment(blackoutDate).date() === date.date())) {
																	return true;
																}

																if (listProvider[selectedProviderIndex]?.durationValue) {
																	if (date.isSameOrAfter(moment().add(listProvider[selectedProviderIndex]?.durationValue, listProvider[selectedProviderIndex]?.durationType).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }))) {
																		return true;
																	}
																} else {
																	if (date.isSameOrAfter(moment().add(15, 'years').set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }))) {
																		return true;
																	}
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
								{(appointmentType === APPOINTMENT || appointmentType === SUBSIDY) && listProvider[selectedProviderIndex]?.isSeparateEvaluationRate ? (
									<Dropdown.Button
										loading={loadingSchedule}
										icon={<DownOutlined />}
										type='primary'
										htmlType='submit'
										style={{ width: 'auto' }}
										placement='topRight'
										trigger='click'
										menu={{
											items: [
												{
													label: intl.formatMessage(messages.bookYourEvaluation),
													key: '1',
													onClick: () => this.createAppointment({ isEvaluation: true }),
												},
											]
										}}
									>
										{intl.formatMessage(messages.bookYourSession)}
									</Dropdown.Button>
								) : (
									<Button key="submit" type="primary" htmlType='submit' loading={loadingSchedule}>
										{intl.formatMessage(appointmentType === 1 ? messages.bookYourScreening : appointmentType === 2 ? messages.bookYourEvaluation : messages.bookYourSession)?.toUpperCase()}
									</Button>
								)}
							</Row>
						</Form>
					)}
				</div>
			</Modal >
		);
	}
};

const mapStateToProps = state => ({
	skillSet: state.auth.skillSet,
	listAppointmentsRecent: state.appointments.dataAppointments,
	appointmentsInMonth: state.appointments.dataAppointmentsMonth,
});

export default compose(connect(mapStateToProps, { setAppointments, setAppointmentsInMonth }))(ModalNewAppointment);