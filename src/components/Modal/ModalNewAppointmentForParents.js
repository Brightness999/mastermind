import React from 'react';
import { Modal, Button, Row, Col, Switch, Select, Typography, Calendar, Avatar, Input, Space, Form } from 'antd';
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
		addressOptions: [],
		selectedDependent: undefined,
		selectedProvider: undefined,
		arrTime: [],
		errorMessage: '',
		selectedDay: 0,
		visibleNewScreening: false,
		skillSet: this.props.SkillSet,
		searchKey: '',
		appointmentType: 3,
		phoneNumber: '',
		notes: '',
		providerErrorMessage: '',
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
		const { appointmentType, isSelectTime, selectedDate, selectedSkillSet, address, selectedDependent, selectedProvider, arrTime, selectedDay, phoneNumber, notes } = this.state;
		if (appointmentType == 3) {
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
		if (appointmentType == 1) {
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
			const hour = arrTime[selectedDay][isSelectTime].value.clone().set({ years, months, date });
			const postData = {
				skillSet: selectedSkillSet,
				dependent: selectedDependent,
				provider: selectedProvider,
				date: hour,
				phoneNumber: phoneNumber,
				notes: notes,
				type: 1,
				status: 0,
				location: address,
			};
			this.requestCreateAppointment(postData);
		}
	}

	onFinishFailed = (err) => {
		console.log('form data error---', err);
	}

	onSubmitModalNewScreening = (data) => {
		const { selectedSkillSet, address, selectedDependent, arrTime, selectedDay, selectedDate, selectedProvider, isSelectTime } = this.state;
		const { years, months, date } = selectedDate.toObject();
		const hour = arrTime?.[selectedDay]?.[isSelectTime]?.value.clone().set({ years, months, date });
		const postData = {
			skillSet: selectedSkillSet,
			dependent: selectedDependent,
			provider: selectedProvider,
			date: hour,
			phoneNumber: data?.phoneNumber,
			notes: data?.notes,
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
		const { selectedDate, isSelectTime, selectedSkillSet, address, selectedDependent, selectedProvider } = this.state;
		if (!selectedDate?.isSameOrAfter(new Date()) || isSelectTime < 0 || selectedSkillSet < 0 || address == '' || selectedDependent == undefined || selectedProvider == undefined) {
			this.setState({ errorMessage: 'please fill all required field' })
			return;
		}
		this.setState({ errorMessage: '' });
		this.setState({ visibleNewScreening: true });
	}

	handleChangeAddress = address => {
		this.setState({ address: address });
		this.searchProvider(this.state.searchKey, address, this.state.selectedSkillSet);
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
		const { listProvider, arrTime } = this.state;
		const newArrTime = JSON.parse(JSON.stringify(arrTime));
		listProvider[index]?.manualSchedule?.forEach((availableTime, index) => {
			newArrTime[index]?.map(time => {
				time.value = moment(time.value);
				if ((time.value.hour() > availableTime.openHour && time.value.hour() < availableTime.closeHour) || (time.value.hour() == availableTime.openHour && time.value.minute() >= availableTime.openMin) || (time.value.hour() == availableTime.closeHour && time.value.minute() <= availableTime.closeMin)) {
					time.active = true;
				} else {
					time.active = false;
				}
			})
		})
		const appointmentsForChoosenProvider = this.props.listAppointmentsRecent?.filter(appointment => appointment.provider?._id == this.state.listProvider[index]._id);
		if (listProvider[index].isNewClientScreening && !appointmentsForChoosenProvider?.find(appointment => (appointment.type == 1 && appointment.status == -1))) {
			this.setState({ appointmentType: 1 });
		}
		if (this.state.listProvider[index].isSeparateEvaluationRate && !appointmentsForChoosenProvider?.find(appointment => (appointment.type == 2 && appointment.status == -1))) {
			if (listProvider[index].isNewClientScreening && !appointmentsForChoosenProvider?.find(appointment => (appointment.type == 1 && appointment.status == -1))) {
				this.setState({ appointmentType: 1 });
			} else {
				this.setState({ appointmentType: 2 });
			}
		}
		if (appointmentsForChoosenProvider?.find(appointment => appointment.type == 3) || (!this.state.listProvider[index].isSeparateEvaluationRate && !this.state.listProvider[index].isNewClientScreening)) {
			this.setState({ appointmentType: 3 });
		}

		this.setState({
			isChoose: index,
			selectedProvider: listProvider[index]._id,
			arrTime: newArrTime,
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

	handleSearchProvider = (value) => {
		this.setState({ searchKey: value });
		this.searchProvider(value, this.state.address, this.state.selectedSkillSet);
	}

	handlelSelectDependent = (dependentId) => {
		const dependents = this.props.listDependents;
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

	render() {
		const {
			selectedDate,
			isChoose,
			isSelectTime,
			selectedDay,
			listProvider,
			selectedProvider,
			skillSet,
			arrTime,
			errorMessage,
			providerErrorMessage,
			addressOptions,
			appointmentType,
		} = this.state;
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
						<p className='font-30 mb-10'>{appointmentType == 3 && intl.formatMessage(messages.newAppointment)}{appointmentType == 1 && intl.formatMessage(messages.newScreening)}</p>
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
						{appointmentType == 1 && (
							<Row>
								<Col xs={24}>
									<Form.Item name="notes" rules={[{ required: true, message: 'Please enter your synopsis.' }]}>
										<Input.TextArea rows={5} onChange={e => this.handleChangeNote(e.target.value)} placeholder={intl.formatMessage(msgCreateAccount.notes)} />
									</Form.Item>
								</Col>
							</Row>
						)}
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
										<p className='font-12 font-700 ml-auto text-primary'>{listProvider[isChoose]?.isNewClientScreening && intl.formatMessage(messages.screeningRequired)}</p>
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
													{arrTime[selectedDay]?.map((time, index) => (
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
						{this.modalScreening()}
						<Row className='justify-end gap-2'>
							<Button key="back" onClick={this.props.onCancel}>
								{intl.formatMessage(msgReview.goBack).toUpperCase()}
							</Button>
							<Button key="submit" type="primary" htmlType='submit'>
								{appointmentType == 1 && intl.formatMessage(messages.screening)?.toUpperCase()}
								{appointmentType == 2 && intl.formatMessage(messages.evaluation)?.toUpperCase()}
								{appointmentType == 3 && intl.formatMessage(messages.schedule)?.toUpperCase()}
							</Button>
						</Row>
					</Form>
				</div>
			</Modal>
		);
	}
};

export default ModalNewAppointmentForParents;