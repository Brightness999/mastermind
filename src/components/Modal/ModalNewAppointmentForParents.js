import React from 'react';
import { Modal, Button, Row, Col, Switch, Select, Typography, Calendar, Avatar, Input } from 'antd';
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
import request, { generateSearchStructure } from '../../utils/api/request'
import PlacesAutocomplete from 'react-places-autocomplete';
import ModalNewScreening from './ModalNewScreening';

const { Paragraph } = Typography;
moment.locale('en');

class ModalNewAppointmentForParents extends React.Component {
	state = {
		selectedDate: undefined,
		currentMonth: moment().format('MMMM YYYY'),
		isChoose: -1,
		isConfirm: false,
		isPopupComfirm: false,
		isSelectTime: -1,
		listProvider: [],
		selectedSkillSet: -1,
		address: '',
		selectedDependent: undefined,
		selectedProvider: undefined,
		arrTime: [],
		errorMessage: '',
		selectedDay: 0,
		scheduleButtonText: intl.formatMessage(messages?.schedule)?.toUpperCase(),
		visibleNewScreening: false,
	}

	componentDidMount() {
		let arrTime = [];
		let hour9AM = moment('2022-10-30 9:00:00');
		for (let i = 0; i < 6; i++) {
			let newTime = hour9AM.clone();
			hour9AM = hour9AM.add(30, 'minutes')
			arrTime.push({
				value: newTime,
				active: true,
			});
		}
		let hour2PM = moment('2022-10-30 14:00:00');
		for (let i = 0; i < 8; i++) {
			let newTime = hour2PM.clone();
			hour2PM = hour2PM.add(30, 'minutes')
			arrTime.push({
				value: newTime,
				active: true,
			});
		}
		this.setState({
			arrTime: new Array(7).fill(arrTime).map((t, idx) => {
				if (idx == 6) {
					let x = JSON.parse(JSON.stringify(t));
					x.map(c => {
						c.value = moment(c.value);
						c.active = false;
						return c;
					})
					return x;
				} else {
					return t;
				}
			})
		});
		this.searchProvider()
	}

	searchProvider(name) {
		request.post('clients/search_providers', generateSearchStructure(name)).then(result => {
			if (result.success) {
				this.setState({ listProvider: result.data })
			}
		}).catch(err => {
			console.log('provider list error-----', err);
		})
	}

	createAppointment = () => {
		const { isSelectTime, selectedDate, selectedSkillSet, address, selectedDependent, selectedProvider, arrTime, selectedDay } = this.state;
		if (isSelectTime < 0 || selectedSkillSet < 0 || address.length == 0 || selectedDependent == undefined || selectedProvider == undefined) {
			this.setState({ errorMessage: 'please fill all required field' })
			return;
		}
		this.setState({ errorMessage: '' })
		const { years, months, date } = selectedDate.toObject();
		const hour = arrTime[selectedDay][isSelectTime].value.clone().set({ years, months, date });
		const postData = {
			skillSet: selectedSkillSet,
			dependent: selectedDependent,
			provider: selectedProvider,
			date: hour.valueOf(),
			location: address,
			type: 3,
			statu: 0,
		};
		this.requestCreateAppointment(postData);
	}

	onSubmitModalNewScreening = (values) => {
		const { selectedSkillSet, address, selectedDependent, arrTime, selectedDay, selectedDate, selectedProvider, isSelectTime } = this.state;
		const { years, months, date } = selectedDate.toObject();
		const hour = arrTime?.[selectedDay]?.[isSelectTime]?.value.clone().set({ years, months, date });
		const postData = {
			skillSet: selectedSkillSet,
			dependent: selectedDependent,
			provider: selectedProvider,
			date: hour,
			phoneNumber: values?.phoneNumber,
			notes: values?.notes,
			type: 1,
			status: 0,
			location: address,
		};
		this.setState({ visibleNewScreening: false }, () => {
			this.requestCreateAppointment(postData);
		})
	}

	onCloseModalNewScreening = () => {
		this.setState({ visibleNewScreening: false });
	}

	modalScreening = () => {
		const modalNewScreeningProps = {
			visible: this.state.visibleNewScreening,
			onSubmit: this.onSubmitModalNewScreening,
			onCancel: this.onCloseModalNewScreening,
		};
		return (<ModalNewScreening {...modalNewScreeningProps} />);
	}

	createScreening = () => {
		this.setState({ visibleNewScreening: false });
		const { selectedSkillSet, address, selectedDependent, selectedProvider } = this.state;
		if (selectedSkillSet < 0 || address == '' || selectedDependent == undefined || selectedProvider == undefined) {
			this.setState({ errorMessage: 'please fill all required field' })
			return;
		}
		this.setState({ errorMessage: '' });
		this.setState({ visibleNewScreening: true });
	}

	handleChangeAddress = address => {
		this.setState({ address: address });
	};

	handleSelectAddress = address => {
		this.setState({ address: address });
	};

	onSelectDate = (newValue) => {
		if (newValue.isAfter(new Date())) {
			this.setState({
				selectedDate: newValue,
				selectedDay: newValue.day(),
				isSelectTime: -1,
			});
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

	onChooseProvider = (index) => {
		const newArrTime = JSON.parse(JSON.stringify(this.state.arrTime));
		this.state.listProvider[index].availability.forEach((availableTime, index) => {
			newArrTime[index].map(time => {
				time.value = moment(time.value);
				if ((time.value.hour() > availableTime.openHour && time.value.hour() < availableTime.closeHour) || (time.value.hour() == availableTime.openHour && time.value.minute() >= availableTime.openMin) || (time.value.hour() == availableTime.closeHour && time.value.minute() <= availableTime.closeMin)) {
					time.active = true;
				} else {
					time.active = false;
				}
			})
		})
		let buttonText = intl.formatMessage(messages.schedule).toUpperCase();
		const appointmentsForChoosenProvider = this.props.listAppointmentsRecent?.filter(appointment => appointment.provider?._id == this.state.listProvider[index]._id);
		if (this.state.listProvider[index].isNewClientScreening) {
			if (this.state.listProvider[index].isSeparateEvaluationRate) {
				if (appointmentsForChoosenProvider?.find(appointment => appointment.type > 1)) {
					if (!appointmentsForChoosenProvider?.find(appointment => appointment.type > 2)) {
						buttonText = intl.formatMessage(messages.evaluation).toUpperCase();
					}
				} else {
					buttonText = intl.formatMessage(messages.screening).toUpperCase();
				}
			} else {
				if (!appointmentsForChoosenProvider?.find(appointment => appointment.type > 1)) {
					buttonText = intl.formatMessage(messages.screening).toUpperCase();
				}
			}
		} else {
			if (this.state.listProvider[index].isSeparateEvaluationRate) {
				if (!appointmentsForChoosenProvider?.find(appointment => appointment.type > 2)) {
					buttonText = intl.formatMessage(messages.evaluation).toUpperCase();
				}
			}
		}

		this.setState({
			isChoose: index,
			selectedProvider: this.state.listProvider[index]._id,
			arrTime: newArrTime,
			scheduleButtonText: buttonText,
		});
	}

	onConfirm = () => {
		this.setState({
			isConfirm: true,
			isPopupComfirm: true,
		});
	}

	onSelectTime = (index) => {
		this.setState({ isSelectTime: index })
	}

	requestCreateAppointment(postData) {
		request.post('clients/create_appoinment', postData).then(result => {
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

	render() {
		const { selectedDate, isChoose, isSelectTime, selectedDay, listProvider, scheduleButtonText, selectedProvider } = this.state;
		const modalProps = {
			className: 'modal-new',
			title: "",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: this.props.onCancel,
			closable: false,
			width: 900,
			footer: [
				<Button key="back" onClick={this.props.onCancel}>
					{intl.formatMessage(msgReview.goBack).toUpperCase()}
				</Button>,
				<Button key="submit" type="primary" onClick={() => scheduleButtonText == intl.formatMessage(messages.schedule).toUpperCase() ? this.createAppointment() : this.createScreening()}>
					{scheduleButtonText}
				</Button>
			]
		};

		return (
			<Modal {...modalProps}>
				<div className='new-appointment'>
					<p className='font-30 mb-10'>{intl.formatMessage(messages.newAppointment)}</p>
					<div className='flex flex-row items-center mb-10'>
						<p className='font-16 mb-0'>{intl.formatMessage(messages.selectOptions)}<sup>*</sup></p>
						<div className='flex flex-row items-center ml-20'>
							<Switch size="small" defaultChecked />
							<p className='ml-10 mb-0'>{intl.formatMessage(messages.subsidyOnly)}</p>
						</div>
					</div>
					<Row gutter={20}>
						<Col xs={24} sm={24} md={8} className='select-small'>
							<Select
								onChange={v => this.setState({ selectedDependent: v })}
								value={this.state.selectedDependent}
								placeholder={intl.formatMessage(msgCreateAccount.dependent)}
							>
								{this.props.listDependents?.map((dependent, index) => (
									<Select.Option key={index} value={dependent._id}>{dependent.firstName} {dependent.lastName}</Select.Option>
								))}
							</Select>
						</Col>
						<Col xs={24} sm={24} md={8} className='select-small'>
							<Select
								onChange={v => this.setState({ selectedSkillSet: v })}
								placeholder={intl.formatMessage(msgCreateAccount.skillsets)}
							>
								{this.props.SkillSet?.map((skill, index) => (
									<Select.Option key={index} value={index}>{skill}</Select.Option>
								))}
							</Select>
						</Col>
						<Col xs={24} sm={24} md={8} className='select-small'>
							<PlacesAutocomplete
								value={this.state.address}
								onChange={this.handleChangeAddress}
								onSelect={this.handleSelectAddress}
							>
								{({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
									<div>
										<Input {...getInputProps({
											placeholder: 'Search Places ...',
											className: 'location-search-input',
											size: 'medium'
										})} />
										<div className="autocomplete-dropdown-container">
											{loading && <div>Loading...</div>}
											{suggestions.map((suggestion, index) => {
												const className = suggestion.active ? 'suggestion-item--active' : 'suggestion-item';
												// inline style for demonstration purpose
												const style = suggestion.active ? { backgroundColor: '#fafafa', cursor: 'pointer' } : { backgroundColor: '#ffffff', cursor: 'pointer' };
												return (
													<div {...getSuggestionItemProps(suggestion, { className, style })} key={suggestion.index}>
														<span>{suggestion.description}</span>
													</div>
												);
											})}
										</div>
									</div>
								)}
							</PlacesAutocomplete>
						</Col>
					</Row>
					<div className='choose-doctor'>
						<p className='font-16 mt-10'>{intl.formatMessage(messages.selectProvider)}<sup>*</sup></p>
						<div className='doctor-content'>
							<div style={{ width: 300 }}>
								<Input
									onChange={e => this.searchProvider(e.target.value)}
									placeholder={intl.formatMessage(messages.searchProvider)}
									suffix={<BiSearch size={17} />}
								/>
							</div>
							<p className='font-500 mt-1 mb-0'>{intl.formatMessage(messages.availableProviders)}</p>
							<div className='doctor-list'>
								{listProvider.map((provider, index) => (
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
						</div>
					</div>
					<Row gutter={10}>
						<Col xs={24} sm={24} md={8}>
							<div className='provider-profile'>
								<div className='flex flex-row items-center'>
									<p className='font-16 font-700'>{intl.formatMessage(msgDrawer.providerProfile)}</p>
									<p className='font-12 font-700 ml-auto text-primary'>{listProvider[isChoose]?.isNewClientScreening && intl.formatMessage(messages.screeningRequired)}</p>
								</div>
								<div className='count-2'>
									<div>
										<p className='font-10 mb-0'>Name:</p>
										<p className='font-10'>{listProvider[isChoose]?.name}</p>
									</div>
									<div>
										<p className='font-10 mb-0'>Skillset(s):</p>
										<p className='font-10'>{listProvider[isChoose]?.skillSet}</p>
									</div>
								</div>
								<p className='font-10'>Practice/Location: {listProvider[isChoose]?.serviceAddress}</p>
								<div className='count-2'>
									{listProvider[isChoose] && (
										<div>
											<p className='font-10 mb-0'>Contact number:</p>
											{listProvider[isChoose]?.contactNumber?.map((phone, phoneIndex) => (
												<p key={phoneIndex} className='font-10'>{phone.phoneNumber}</p>
											))}
										</div>
									)}
									{listProvider[isChoose] && (
										<div>
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
												{this.state.arrTime[selectedDay]?.map((time, index) => (
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
					{this.state.errorMessage.length > 0 && (<p className='text-right text-red mr-5'>{this.state.errorMessage}</p>)}
					{this.modalScreening()}
				</div>
			</Modal>
		);
	}
};

export default ModalNewAppointmentForParents;