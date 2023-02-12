import React, { Component } from 'react';
import { Row, Col, Form, Button, Select, Segmented, TimePicker, Switch, DatePicker, message, Divider } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import { QuestionCircleOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import axios from 'axios';
import moment from 'moment';
import { connect } from 'react-redux'
import { compose } from 'redux'
import * as MultiDatePicker from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel"
import messages from '../../messages';
import msgSidebar from '../../../../../components/SideBar/messages';
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import { url } from '../../../../../utils/api/baseUrl';
import { getAllSchoolsForParent } from '../../../../../utils/api/apiList';
import { BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY, BASE_CALENDAR_URL, GOOGLE_CALENDAR_API_KEY, JEWISH_CALENDAR_REGION, USA_CALENDAR_REGION } from '../../../../../routes/constant';

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
			currentSelectedDay: day_week[0],
			isHomeVisit: true,
			isPrivateOffice: true,
			isSchools: true,
			locations: ['Dependent Home', 'Provider Office'],
			listSchool: [],
			selectedLocation: '',
		}
	}

	componentDidMount() {
		const { registerData } = this.props.register;
		if (!!registerData.availability) {
			this.form?.setFieldsValue({ ...registerData.availability });
			this.setState({
				isHomeVisit: registerData.availability?.isHomeVisit,
				isPrivateOffice: registerData.availability?.isPrivateOffice,
				isSchools: registerData.availability?.isSchools,
			})
		} else {
			day_week.map((day) => this.form.setFieldValue(day, ['']));
			this.form.setFieldsValue({ serviceableSchool: [] });
		}
		this.loadSchools(registerData.profileInfor);
	}

	loadSchools(providerInfor) {
		axios.post(url + getAllSchoolsForParent, { communityServed: providerInfor?.cityConnection }).then(result => {
			const { success, data } = result.data;
			if (success) {
				this.setState({ listSchool: data });
			}
		}).catch(err => {
			console.log('get all schools for parent error---', err);
		})
	}

	onFinish = (values) => {
		const invalidDayInWeek = Object.values(values).findIndex(times => times?.find(v => (v?.from_date && v?.to_date && v?.from_date?.isAfter(v.to_date)) || (v?.from_time && v?.to_time && v?.from_time?.isAfter(v.to_time))));
		if (invalidDayInWeek < 0) {
			const { isHomeVisit, isSchools, isPrivateOffice } = this.state;
			this.props.setRegisterData({ availability: { ...values, isHomeVisit, isSchools, isPrivateOffice } });
			this.props.onContinue();
		} else {
			message.error(`The selected date or time is not valid on ${day_week[invalidDayInWeek]}`);
		}
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

	copyToFullWeek = (dayForCopy) => {
		const arrToCopy = this.form.getFieldValue(dayForCopy);
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
				isPrivateOffice: state,
				locations: ['Provider Office', ...this.state.locations],
			});
		} else {
			this.setState({
				isPrivateOffice: state,
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

	handleSelectSchool = (schoolId) => {
		const { locations, listSchool } = this.state;
		locations.push(listSchool?.find(school => school._id == schoolId)?.name);
		this.setState({ locations: locations });
	}

	handleDeselectSchool = (schoolId) => {
		const { locations, listSchool } = this.state;
		const schoolName = listSchool?.find(school => school._id == schoolId)?.name;
		this.setState({ locations: locations.filter(location => location != schoolName) });
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

	handleSelectTime = (value, type, day, index) => {
		const { selectedLocation, currentSelectedDay, listSchool } = this.state;
		const dayTime = this.form.getFieldValue(day);
		if (selectedLocation) {
			const school = listSchool?.find(school => school.name == selectedLocation);
			if (school) {
				const dayIndex = this.getDayOfWeekIndex(currentSelectedDay);
				if (dayIndex > -1) {
					value = value.set({ seconds: 0, milliseconds: 0 });
					const inOpenTime = moment().set({ hours: school.sessionsInSchool[dayIndex]?.openHour, minutes: school.sessionsInSchool[dayIndex]?.openMin, seconds: 0, milliseconds: 0 });
					const inCloseTime = moment().set({ hours: school.sessionsInSchool[dayIndex]?.closeHour, minutes: school.sessionsInSchool[dayIndex]?.closeMin, seconds: 0, milliseconds: 0 });
					const afterOpenTime = moment().set({ hours: school.sessionsAfterSchool[dayIndex]?.openHour, minutes: school.sessionsAfterSchool[dayIndex]?.openMin, seconds: 0, milliseconds: 0 });
					const afterCloseTime = moment().set({ hours: school.sessionsAfterSchool[dayIndex]?.closeHour, minutes: school.sessionsAfterSchool[dayIndex]?.closeMin, seconds: 0, milliseconds: 0 });
					if (type == 'from_time') {
						if (!((value.isSame(inOpenTime) || value.isBetween(inOpenTime, inCloseTime)) || (value.isSame(afterOpenTime) || value.isBetween(afterOpenTime, afterCloseTime)))) {
							message.warning("The school is not available at that time. Please select another time.", 5);
						} else {
							this.form.setFieldValue(day, dayTime?.map((d, i) => i === index ? ({ ...d, from_time: value }) : d));
						}
					}
					if (type == 'to_time') {
						if (!((value.isSame(inCloseTime) || value.isBetween(inOpenTime, inCloseTime)) || (value.isSame(afterCloseTime) || value.isBetween(afterOpenTime, afterCloseTime)))) {
							message.warning("The school is not available at that time. Please select another time.", 5);
						} else {
							this.form.setFieldValue(day, dayTime?.map((d, i) => i === index ? ({ ...d, to_time: value }) : d));
						}
					}
				}
			} else {
				this.form.setFieldValue(day, dayTime?.map((d, i) => i === index ? ({ ...d, [type]: value }) : d));
			}
		} else {
			this.form.setFieldValue(day, dayTime?.map((d, i) => i === index ? ({ ...d, [type]: value }) : d));
		}
		this.onChangeScheduleValue();
	}

	handleClickGoogleCalendar = () => {
		const usa_url = `${BASE_CALENDAR_URL}/${USA_CALENDAR_REGION}%23${BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY}/events?key=${GOOGLE_CALENDAR_API_KEY}`
		const jewish_url = `${BASE_CALENDAR_URL}/${JEWISH_CALENDAR_REGION}%23${BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY}/events?key=${GOOGLE_CALENDAR_API_KEY}`

		fetch(usa_url).then(response => response.json()).then(data => {
			const holidays = [...new Set(data.items?.map(item => [item.start.date]).flat())]?.map(date => new Date(date));
			fetch(jewish_url).then(response => response.json()).then(data1 => {
				const holidays1 = [...new Set(data1.items?.map(item => [item.start.date]).flat())]?.map(date => new Date(date));
				const dates = this.form.getFieldValue("blackoutDates");
				let uniqueDates = [];
				[...dates ?? [], ...holidays ?? [], ...holidays1 ?? []]?.sort((a, b) => a - b)?.forEach(c => {
					if (!uniqueDates.find(d => d.toString() == c.toString())) {
						uniqueDates.push(c);
					}
				})
				this.form.setFieldsValue({ blackoutDates: uniqueDates });
			})
		})
	}

	handleUpdateBlackoutDates = (dates) => {
		this.form.setFieldsValue({ blackoutDates: dates });
	}

	render() {
		const { currentSelectedDay, isPrivateOffice, isHomeVisit, isSchools, locations, listSchool } = this.state;
		const { registerData } = this.props.register;

		return (
			<Row justify="center" className="row-form">
				<div className='col-form col-availability'>
					<div className='div-form-title'>
						<p className='font-30 text-center mb-10'>{intl.formatMessage(messages.availability)}</p>
					</div>
					<Form
						name="form_availability"
						layout='vertical'
						onFinish={this.onFinish}
						onFinishFailed={this.onFinishFailed}
						ref={ref => this.form = ref}
					>
						<p className='font-18 mb-10 text-center'>{intl.formatMessage(messages.locations)}</p>
						<div className='mb-10'>
							<div className='flex flex-row items-center mb-5'>
								<Switch size="small" checkedChildren="ON" unCheckedChildren="OFF" style={{ width: 50 }} checked={isPrivateOffice} onChange={v => this.handleSwitchOffice(v)} />
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
								<Form.Item
									name="serviceableSchool"
									label={intl.formatMessage(messages.serviceableSchools)}
									rules={[{ required: isSchools }]}
								>
									<Select
										mode="multiple"
										showArrow
										placeholder={intl.formatMessage(msgSidebar.schoolsList)}
										optionLabelProp="label"
										onSelect={(v) => this.handleSelectSchool(v)}
										onDeselect={(v) => this.handleDeselectSchool(v)}
									>
										{listSchool?.map((school, index) => (
											<Select.Option key={index} label={school.name} value={school._id}>{school.name}</Select.Option>
										))}
									</Select>
								</Form.Item>
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
														{field.key != 0 && <Divider className='bg-gray' />}
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
																		format='MM/DD/YYYY'
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
																		popupClassName='timepicker'
																		placeholder={intl.formatMessage(messages.from)}
																		onSelect={(v) => this.handleSelectTime(v, 'from_time', day, field.key)}
																	/>
																</Form.Item>
															</Col>
															<Col xs={24} sm={24} md={12} className={field.key !== 0 && 'item-remove'}>
																<Form.Item name={[field.name, "to_time"]}>
																	<TimePicker
																		onChange={() => this.onChangeScheduleValue()}
																		use12Hours
																		format="h:mm a"
																		popupClassName='timepicker'
																		placeholder={intl.formatMessage(messages.to)}
																		onSelect={(v) => this.handleSelectTime(v, 'to_time', day, field.key)}
																	/>
																</Form.Item>
																{field.key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />}
															</Col>
														</Row>
														{registerData?.subsidy?.isWillingOpenPrivate ? (
															<div className="flex items-center justify-start gap-2">
																<Form.Item name={[field.name, "isPrivate"]} valuePropName="checked">
																	<Switch size="small" />
																</Form.Item>
																<p className='font-09'>{intl.formatMessage(messages.privateHMGHAgents)}</p>
															</div>
														) : null}
													</div>
												))}
												<Row>
													<Col span={12}>
														<div className='div-add-time justify-center'>
															<BsPlusCircle size={17} className='mr-5 text-primary' />
															<a className='text-primary' onClick={() => add()}>
																{intl.formatMessage(messages.addRange)}
															</a>
														</div>
													</Col>
													<Col span={12}>
														<div className='text-center div-copy-week'>
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
						<p className='font-18 mb-10 text-center'>{intl.formatMessage(messages.blackoutDates)}</p>
						<div className='flex items-center justify-center gap-2 cursor mb-10' onClick={() => this.handleClickGoogleCalendar()}>
							<img src='../images/gg.png' className='h-30' />
							<p className='font-16 mb-0'>Google</p>
						</div>
						<Form.Item name="blackoutDates">
							<MultiDatePicker.Calendar
								multiple
								sort
								className='m-auto'
								onChange={dates => this.handleUpdateBlackoutDates(dates)}
								plugins={[<DatePanel />]}
							/>
						</Form.Item>
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
