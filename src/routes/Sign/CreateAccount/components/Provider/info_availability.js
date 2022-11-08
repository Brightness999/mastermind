import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select, Segmented, TimePicker, Switch, DatePicker, message } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import { QuestionCircleOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';
import msgSidebar from '../../../../../components/SideBar/messages';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import { url } from '../../../../../utils/api/baseUrl';
import axios from 'axios';
import moment from 'moment';
import { getDefaultValueForProvider } from '../../../../../utils/api/apiList';

const day_week = [
	intl.formatMessage(messages.sunday),
	intl.formatMessage(messages.monday),
	intl.formatMessage(messages.tuesday),
	intl.formatMessage(messages.wednesday),
	intl.formatMessage(messages.thursday),
	intl.formatMessage(messages.friday),
]

class InfoAvailability extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isPrivate: true,
			CancellationWindow: [],
			currentSelectedDay: day_week[0],
			service_address: '',
			isHomeVisit: true,
			privateOffice: true,
			isSchools: true,
			locations: ['Dependent Home', 'Provider Office'],
			listSchool: [],
			selectedSchools: [],
			selectedLocation: '',
		}
	}

	componentDidMount() {
		let { registerData } = this.props.register;
		if (!!registerData.availability) {
			this.form?.setFieldsValue({ ...registerData.availability });
		} else {
			const listSchool = this.props.listSchool?.filter(school => registerData.serviceInfor?.serviceableSchool.includes(school._id))?.map(school => school.name);
			this.setState({ listSchool: listSchool });
			day_week.map((day) => this.form.setFieldValue(day, ['']));
		}
		this.getDataFromServer();
	}

	defaultTimeRangeItem = (dayInWeek) => {
		return {
			"uid": shortid.generate() + '' + Date.now(),
			"location": undefined,
			"dayInWeek": dayInWeek,
			"openHour": 7,
			"openMin": 0,
			"closeHour": 18,
			"closeMin": 0
		}
	}

	getDataFromServer = () => {
		axios.post(url + getDefaultValueForProvider).then(result => {
			if (result.data.success) {
				var data = result.data.data;
				this.setState({ CancellationWindow: data.CancellationWindow, })
			} else {
				this.setState({ CancellationWindow: [] });
			}
		}).catch(err => {
			console.log('get default values for provider error---', err);
			this.setState({ CancellationWindow: [] });
		})
	}

	onFinish = (values) => {
		this.props.setRegisterData({ availability: values });
		this.props.onContinue();
	};

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	onSelectDay = e => {
		if (e) {
			this.setState({
				currentSelectedDay: e,
				selectedLocation: '',
			})
		}
	}

	onChangeScheduleValue = () => {
		this.props.setRegisterData({ availability: this.form.getFieldsValue() });
	}

	onLocationChange = (location) => {
		this.props.setRegisterData({ availability: this.form.getFieldsValue() });
		this.setState({ selectedLocation: location });
	}

	onLocationSelected = (day, value, index) => {
		var arr = this.form.getFieldValue(day);
		if (arr[index] == undefined) arr[index] = {};
		arr[index].location = value;
		this.form.setFieldValue(day, arr);
		this.props.setRegisterData({ availability: this.form.getFieldsValue() });
	}

	copyToFullWeek = (dayForCopy) => {
		var arrToCopy = this.form.getFieldValue(dayForCopy);
		day_week.map((newDay) => {
			if (newDay != dayForCopy) {
				this.form.setFieldValue(newDay, arrToCopy);
			}
		})
	}

	handleSwitchHome = (state) => {
		if (state) {
			this.setState({
				isHomeVisit: state,
				locations: ['Dependent Home', ...this.state.locations],
			});
		} else {
			this.setState({
				isHomeVisit: state,
				locations: this.state.locations?.filter(location => location != 'Dependent Home'),
			});
		}
	}

	handleSwitchOffice = (state) => {
		if (state) {
			this.setState({
				privateOffice: state,
				locations: ['Provider Office', ...this.state.locations],
			});
		} else {
			this.setState({
				privateOffice: state,
				locations: this.state.locations?.filter(location => location != 'Provider Office'),
			});
		}
	}

	handleSwitchSchool = (state) => {
		if (state) {
			this.setState({ isSchools: state });
		} else {
			this.setState({
				isSchools: state,
				locations: this.state.locations?.filter(location => location == 'Provider Office' || location == 'Dependent Home'),
			});
		}
	}

	handleSelectSchool = (school) => {
		this.state.locations.push(school);
		this.setState({ locations: this.state.locations });
	}

	handleDeselectSchool = (school) => {
		this.setState({ locations: this.state.locations.filter(location => location != school) });
	}

	getDayOfWeekIndex = (day) => {
		switch (day) {
			case intl.formatMessage(messages.sunday): return 0;
			case intl.formatMessage(messages.monday): return 1;
			case intl.formatMessage(messages.tuesday): return 2;
			case intl.formatMessage(messages.wednesday): return 3;
			case intl.formatMessage(messages.thursday): return 4;
			case intl.formatMessage(messages.friday): return 5;
			default: return -1;
		}
	}

	handleSelectTime = (value, type) => {
		const { selectedLocation, currentSelectedDay } = this.state;
    if (selectedLocation) {
			const school = this.props.listSchool?.find(school => school.name == selectedLocation);
			if (school) {
				const idx = this.getDayOfWeekIndex(currentSelectedDay);
				if (idx > -1) {
					value = value.set({ seconds: 0, milliseconds: 0 });
					const inOpenTime = moment().set({ hours: school.sessionsInSchool[idx]?.openHour, minutes: school.sessionsInSchool[idx]?.openMin, seconds: 0, milliseconds: 0 });
					const inCloseTime = moment().set({ hours: school.sessionsInSchool[idx]?.closeHour, minutes: school.sessionsInSchool[idx]?.closeMin, seconds: 0, milliseconds: 0 });
					const afterOpenTime = moment().set({ hours: school.sessionsAfterSchool[idx]?.openHour, minutes: school.sessionsAfterSchool[idx]?.openMin, seconds: 0, milliseconds: 0 });
					const afterCloseTime = moment().set({ hours: school.sessionsAfterSchool[idx]?.closeHour, minutes: school.sessionsAfterSchool[idx]?.closeMin, seconds: 0, milliseconds: 0 });
					if (type == 'from' && !((value.isSame(inOpenTime) || value.isBetween(inOpenTime, inCloseTime)) || (value.isSame(afterOpenTime) || value.isBetween(afterOpenTime, afterCloseTime)))) {
						message.warning("The school is not available at that time. Please select another time.", 5);
					}
					if (type == 'to' && !((value.isSame(inCloseTime) || value.isBetween(inOpenTime, inCloseTime)) || (value.isSame(afterCloseTime) || value.isBetween(afterOpenTime, afterCloseTime)))) {
						message.warning("The school is not available at that time. Please select another time.", 5);
					}
				}
			}
		}
	}

	render() {
		const { currentSelectedDay, CancellationWindow, isPrivate, privateOffice, isHomeVisit, isSchools, locations, listSchool } = this.state;

		return (
			<Row justify="center" className="row-form">
				<div className='col-form col-availability'>
					<div className='div-form-title'>
						<p className='font-30 text-center mb-10'>{intl.formatMessage(messages.availability)}</p>
					</div>
					<Form
						name="form_availability"
						onFinish={this.onFinish}
						onFinishFailed={this.onFinishFailed}
						ref={ref => this.form = ref}
					>
						<p className='font-18 mb-10 text-center'>{intl.formatMessage(messages.autoSyncCalendar)}</p>
						<Row gutter={10}>
							<Col span={12}>
								<div className='div-gg'>
									<img src='../images/gg.png' />
									<p className='font-16 mb-0'>Google</p>
								</div>
							</Col>
							<Col span={12}>
								<div className='div-gg'>
									<img src='../images/outlook.png' />
									<p className='font-16 mb-0'>Outlook</p>
								</div>
							</Col>
						</Row>
						<p className='font-18 mb-10 text-center'>{intl.formatMessage(messages.locations)}</p>
						<div className='mb-10'>
							<div className='flex flex-row items-center mb-5'>
								<Switch size="small" checkedChildren="ON" unCheckedChildren="OFF" style={{ width: 50 }} checked={privateOffice} onChange={v => this.handleSwitchOffice(v)} />
								<p className='ml-10 mb-0'>{intl.formatMessage(messages.privateOffice)}</p>
							</div>
							<div className='flex flex-row items-center mb-5'>
								<Switch size="small" checkedChildren="ON" unCheckedChildren="OFF" style={{ width: 50 }} checked={isHomeVisit} onChange={v => this.handleSwitchHome(v)} />
								<p className='ml-10 mb-0'>{intl.formatMessage(messages.homeVisits)}</p>
							</div>
							<div className='flex flex-row items-center mb-5'>
								<Switch size="small" checkedChildren="ON" unCheckedChildren="OFF" style={{ width: 50 }} checked={isSchools} onChange={v => this.handleSwitchSchool(v)} />
								<p className='ml-10 mb-0'>{intl.formatMessage(messages.school)}</p>
							</div>
							{isSchools && (
								<Select
									mode="multiple"
									showArrow
									placeholder={intl.formatMessage(msgSidebar.schoolsList)}
									optionLabelProp="label"
									onSelect={(v) => this.handleSelectSchool(v)}
									onDeselect={(v) => this.handleDeselectSchool(v)}
								>
									{listSchool?.map((school, index) => (
										<Select.Option key={index} label={school} value={school}>{school}</Select.Option>
									))}
								</Select>
							)}
						</div>
						<p className='font-18 mb-10 text-center'>{intl.formatMessage(messages.manualSchedule)}</p>
						<div className='div-availability'>
							<Segmented options={day_week} block={true} onChange={this.onSelectDay} />
							{day_week.map((day, index) => (
								<div key={index} id={day} style={{ display: currentSelectedDay === day ? 'block' : 'none' }}>
									<Form.List name={day}>
										{(fields, { add, remove }) => (
											<div className='div-time'>
												{fields.map((field) => (
													<div key={field.key}>
														<Form.Item name={[field.name, "location"]}>
															<Select
																showArrow
																placeholder={intl.formatMessage(messages.location)}
																optionLabelProp="label"
																onSelect={(v) => this.onLocationChange(v)}
															>
																{locations.map((location, index) => (
																	<Select.Option key={index} label={location} value={location}>{location}</Select.Option>
																))}
															</Select>
														</Form.Item>
														<Row gutter={14}>
															<Col xs={24} sm={24} md={12}>
																<Form.Item name={[field.name, "from_date"]}>
																	<DatePicker
																		onChange={() => this.onChangeScheduleValue()}
																		format='MM/DD/YYYY'
																		placeholder={intl.formatMessage(messages.from)}
																	/>
																</Form.Item>
															</Col>
															<Col xs={24} sm={24} md={12} className={field.key !== 0 && 'item-remove'}>
																<Form.Item name={[field.name, "to_date"]}>
																	<DatePicker
																		onChange={() => this.onChangeScheduleValue()}
																		format='MM/DD/YYY'
																		placeholder={intl.formatMessage(messages.to)}
																	/>
																</Form.Item>
																{field.key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />}
															</Col>
														</Row>
														<Row gutter={14}>
															<Col xs={24} sm={24} md={12}>
																<Form.Item name={[field.name, "from_time"]}>
																	<TimePicker
																		onChange={() => this.onChangeScheduleValue()}
																		use12Hours
																		format="h:mm a"
																		placeholder={intl.formatMessage(messages.from)}
																		onOk={(v) => this.handleSelectTime(v, 'from')}
																	/>
																</Form.Item>
															</Col>
															<Col xs={24} sm={24} md={12} className={field.key !== 0 && 'item-remove'}>
																<Form.Item name={[field.name, "to_time"]}>
																	<TimePicker
																		onChange={() => this.onChangeScheduleValue()}
																		use12Hours
																		format="h:mm a"
																		placeholder={intl.formatMessage(messages.to)}
																		onOk={(v) => this.handleSelectTime(v, 'to')}
																	/>
																</Form.Item>
																{field.key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />}
															</Col>
														</Row>
													</div>
												))}
												<Row>
													<Col span={8}>
														<div className='flex flex-row items-center'>
															<Form.Item name="isPrivate" className='mb-0'>
																<Switch
																	size="small"
																	checked={isPrivate}
																	onChange={v => this.setState({ isPrivate: v })}
																/>
															</Form.Item>
															<p className='font-09 ml-10 mb-0'>{intl.formatMessage(messages.privateHMGHAgents)}</p>
														</div>
													</Col>
													<Col span={8}>
														<div className='div-add-time justify-center'>
															<BsPlusCircle size={17} className='mr-5 text-primary' />
															<a className='text-primary' onClick={() => add()}>
																{intl.formatMessage(messages.addRange)}
															</a>
														</div>
													</Col>
													<Col span={8}>
														<div className='text-right div-copy-week'>
															<a className='font-10 underline text-primary' onClick={() => this.copyToFullWeek(day)}>
																{intl.formatMessage(messages.copyFullWeek)}
															</a>
															<QuestionCircleOutlined className='text-primary' />
														</div>
													</Col>
												</Row>
											</div>
										)}
									</Form.List>
								</div>
							))}
						</div>
						<Row gutter={14} style={{ marginLeft: '-22px', marginRight: '-22px' }}>
							<Col xs={24} sm={24} md={13}>
								<Form.Item
									name="cancellation_window"
									rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.cancellationWindow) }]}
								>
									<Select placeholder={intl.formatMessage(messages.cancellationWindow)}>
										{CancellationWindow?.map((value, index) => (
											<Select.Option key={index} value={value}>{value}</Select.Option>
										))}
									</Select>
								</Form.Item>
							</Col>
							<Col xs={24} sm={24} md={11}>
								<Form.Item
									name="cancellation_fee"
									rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.cancellationFee) }]}
								>
									<Input placeholder={intl.formatMessage(messages.cancellationFee)} />
								</Form.Item>
							</Col>
						</Row>
						<Form.Item className="form-btn continue-btn" >
							<Button
								block
								type="primary"
								htmlType="submit"
							>
								{intl.formatMessage(messages.continue).toUpperCase()}
							</Button>
						</Form.Item>
					</Form >
				</div >
			</Row >
		);
	}
}

const mapStateToProps = state => ({
	register: state.register,
})

export default compose(connect(mapStateToProps, { setRegisterData }))(InfoAvailability);
