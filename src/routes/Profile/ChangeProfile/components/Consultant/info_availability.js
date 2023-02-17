import React, { Component } from 'react';
import { Row, Col, Form, Button, Segmented, TimePicker, message, DatePicker } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import { QuestionCircleOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import { connect } from 'react-redux'
import { compose } from 'redux'
import * as MultiDatePicker from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel"
import moment from 'moment';
import messages from '../../messages';
import { BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY, BASE_CALENDAR_URL, GOOGLE_CALENDAR_API_KEY, JEWISH_CALENDAR_REGION, USA_CALENDAR_REGION } from '../../../../../routes/constant';
import request from '../../../../../utils/api/request';
import { getMyConsultantInfo, getUserProfile, updateConsultantAvailability } from '../../../../../utils/api/apiList';
import PageLoading from '../../../../../components/Loading/PageLoading';

const day_week = [
	intl.formatMessage(messages.sunday),
	intl.formatMessage(messages.monday),
	intl.formatMessage(messages.tuesday),
	intl.formatMessage(messages.wednesday),
	intl.formatMessage(messages.thursday),
	intl.formatMessage(messages.friday),
]

class ConsultantAvailability extends Component {
	constructor(props) {
		super(props);
		this.state = {
			currentSelectedDay: day_week[0],
			loading: false,
		}
	}

	componentDidMount() {
		this.setState({ loading: true });
		if (window.location.pathname?.includes('changeuserprofile')) {
			request.post(getUserProfile, { id: this.props.auth.selectedUser?._id }).then(result => {
				this.setState({ loading: false });
				const { success, data } = result;
				if (success) {
					this.form.setFieldValue('blackoutDates', data?.consultantInfo?.blackoutDates?.map(date => new Date(date)));
					day_week.map((day) => {
						const times = data?.consultantInfo?.manualSchedule?.filter(t => t.dayInWeek == this.getDayOfWeekIndex(day));
						this.form.setFieldValue(day, times?.map(t => {
							t.from_date = moment().set({ years: t.fromYear, months: t.fromMonth, date: t.fromDate });
							t.to_date = moment().set({ years: t.toYear, months: t.toMonth, date: t.toDate });
							t.from_time = moment().set({ hours: t.openHour, minutes: t.openMin });
							t.to_time = moment().set({ hours: t.closeHour, minutes: t.closeMin });
							return t;
						}));
					});
				}
			}).catch(err => {
				message.error(err.message);
				this.setState({ loading: false });
			})
		} else {
			request.post(getMyConsultantInfo).then(result => {
				this.setState({ loading: false });
				const { success, data } = result;
				if (success) {
					this.form.setFieldValue('blackoutDates', data?.blackoutDates?.map(date => new Date(date)));
					day_week.map((day) => {
						const times = data?.manualSchedule?.filter(t => t.dayInWeek == this.getDayOfWeekIndex(day));
						this.form.setFieldValue(day, times?.map(t => {
							t.from_date = moment().set({ years: t.fromYear, months: t.fromMonth, date: t.fromDate });
							t.to_date = moment().set({ years: t.toYear, months: t.toMonth, date: t.toDate });
							t.from_time = moment().set({ hours: t.openHour, minutes: t.openMin });
							t.to_time = moment().set({ hours: t.closeHour, minutes: t.closeMin });
							return t;
						}));
					});
				}
			}).catch(err => {
				message.error(err.message);
				this.setState({ loading: false });
			})
		}
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

	onFinish = (values) => {
		let manualSchedule = [];
		const invalidDayInWeek = Object.values(values).findIndex(times => times?.find(v => (v?.from_date && v?.to_date && v?.from_date?.isAfter(v.to_date)) || (v?.from_time && v?.to_time && v?.from_time?.isAfter(v.to_time))));
		if (invalidDayInWeek < 0) {
			day_week.map(day => {
				values[day]?.forEach(t => {
					if (t.from_time && t.to_time) {
						const times = {
							fromYear: t.from_date?.year() ?? 1,
							fromMonth: t.from_date?.month() ?? 0,
							fromDate: t.from_date?.date() ?? 1,
							toYear: t.to_date?.year() ?? 10000,
							toMonth: t.to_date?.month() ?? 0,
							toDate: t.to_date?.date() ?? 0,
							openHour: t.from_time?.hours() ?? 0,
							openMin: t.from_time?.minutes() ?? 0,
							closeHour: t.to_time?.hours() ?? 0,
							closeMin: t.to_time?.minutes() ?? 0,
							dayInWeek: this.getDayOfWeekIndex(day),
						}
						manualSchedule.push(times);
					} else {
						const times = {
							fromYear: 0,
							fromMonth: 0,
							fromDate: 0,
							toYear: 0,
							toMonth: 0,
							toDate: 0,
							openHour: 0,
							openMin: 0,
							closeHour: 0,
							closeMin: 0,
							dayInWeek: this.getDayOfWeekIndex(day),
						}
						manualSchedule.push(times);
					}
				})
			});
			values.manualSchedule = manualSchedule.flat();
			values.blackoutDates = values.blackoutDates?.map(date => date.toString());
			request.post(updateConsultantAvailability, { ...values, _id: window.location.pathname?.includes('changeuserprofile') ? this.props.auth.selectedUser?.consultantInfo?._id : this.props.auth.user?.consultantInfo }).then(res => {
				if (res.success) {
					message.success('Updated successfully');
				}
			}).catch(err => {
				message.error(err.message);
			})
		} else {
			message.error(`The selected date or time is not valid on ${day_week[invalidDayInWeek]}`);
		}
	};

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	onSelectDay = e => {
		e && this.setState({ currentSelectedDay: e });
	}

	copyToFullWeek = (dayForCopy) => {
		const arrToCopy = this.form.getFieldValue(dayForCopy);
		day_week.map((newDay) => {
			if (newDay != dayForCopy) {
				this.form.setFieldValue(newDay, arrToCopy);
			}
		})
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
		const { currentSelectedDay, loading } = this.state;

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
						<p className='font-18 mb-10 text-center'>{intl.formatMessage(messages.manualSchedule)}</p>
						<div className='div-availability'>
							<Segmented options={day_week} block={true} onChange={this.onSelectDay} />
							{day_week.map((day, index) => (
								<div key={index} id={day} style={{ display: currentSelectedDay === day ? 'block' : 'none' }}>
									<Form.List name={day}>
										{(fields, { add, remove }) => (
											<div className='div-time'>
												{fields.map((field, index) => (
													<div key={field.key}>
														<Row gutter={14}>
															<Col xs={24} sm={24} md={12}>
																<Form.Item name={[field.name, "from_date"]}>
																	<DatePicker
																		format="MM/DD/YYYY"
																		placeholder={intl.formatMessage(messages.from)}
																	/>
																</Form.Item>
															</Col>
															<Col xs={24} sm={24} md={12} className={field.key !== 0 && 'item-remove'}>
																<Form.Item name={[field.name, "to_date"]}>
																	<DatePicker
																		format="MM/DD/YYYY"
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
																		onSelect={(time) => {
																			const dayTime = this.form.getFieldValue(day);
																			this.form.setFieldValue(day, dayTime?.map((d, i) => i === index ? ({ ...d, from_time: time }) : d));
																		}}
																		use12Hours
																		format="h:mm a"
																		popupClassName='timepicker'
																		placeholder={intl.formatMessage(messages.from)}
																	/>
																</Form.Item>
															</Col>
															<Col xs={24} sm={24} md={12} className={field.key !== 0 && 'item-remove'}>
																<Form.Item name={[field.name, "to_time"]}>
																	<TimePicker
																		onSelect={(time) => {
																			const dayTime = this.form.getFieldValue(day);
																			this.form.setFieldValue(day, dayTime?.map((d, i) => i === index ? ({ ...d, to_time: time }) : d));
																		}}
																		use12Hours
																		format="h:mm a"
																		popupClassName='timepicker'
																		placeholder={intl.formatMessage(messages.to)}
																	/>
																</Form.Item>
																{field.key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />}
															</Col>
														</Row>
													</div>
												))}
												<Row>
													<Col span={12}>
														<div className='div-add-time justify-center'>
															<BsPlusCircle size={17} className='mr-5 text-primary' />
															<a className='text-primary' onClick={() => add()}>{intl.formatMessage(messages.addRange)}</a>
														</div>
													</Col>
													<Col span={12}>
														<div className='div-copy-week justify-center'>
															<a className='font-10 underline text-primary' onClick={() => this.copyToFullWeek(day)}>{intl.formatMessage(messages.copyFullWeek)}</a>
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
								{intl.formatMessage(messages.update).toUpperCase()}
							</Button>
						</Form.Item>
					</Form>
				</div>
				<PageLoading loading={loading} isBackground={true} />
			</Row>
		);
	}
}

const mapStateToProps = state => ({
	auth: state.auth,
})

export default compose(connect(mapStateToProps))(ConsultantAvailability);