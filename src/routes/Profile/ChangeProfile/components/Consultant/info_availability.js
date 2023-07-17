import React, { Component } from 'react';
import { Row, Col, Form, Button, Segmented, TimePicker, message, DatePicker, Checkbox } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import { QuestionCircleOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import { connect } from 'react-redux'
import { compose } from 'redux'
import * as MultiDatePicker from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel"
import moment from 'moment';

import messages from 'routes/Sign/CreateAccount/messages';
import { BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY, BASE_CALENDAR_URL, GOOGLE_CALENDAR_API_KEY, JEWISH_CALENDAR_REGION, USA_CALENDAR_REGION } from 'routes/constant';
import request from 'utils/api/request';
import { getMyConsultantInfo, getUserProfile, updateConsultantAvailability } from 'utils/api/apiList';
import PageLoading from 'components/Loading/PageLoading';

const day_week = [
	intl.formatMessage(messages.sunday),
	intl.formatMessage(messages.monday),
	intl.formatMessage(messages.tuesday),
	intl.formatMessage(messages.wednesday),
	intl.formatMessage(messages.thursday),
	intl.formatMessage(messages.friday),
	intl.formatMessage(messages.saturday),
]

class ConsultantAvailability extends Component {
	constructor(props) {
		super(props);
		this.state = {
			currentSelectedDay: day_week[0],
			loading: false,
			legalHolidays: [],
			jewishHolidays: [],
			isLegalHolidays: false,
			isJewishHolidays: false,
		}
	}

	async componentDidMount() {
		this.setState({ loading: true });
		const holidays = await this.getHolidays();
		if (window.location.pathname?.includes('changeuserprofile')) {
			request.post(getUserProfile, { id: this.props.auth.selectedUser?._id }).then(async result => {
				this.setState({ loading: false });
				const { success, data } = result;
				if (success) {
					await this.updateBlackoutDates(data?.consultantInfo?.blackoutDates?.map(date => new Date(date)));
					document.querySelectorAll('#datepanel ul li span')?.forEach(el => {
						let name = document.createElement("div");
						name.textContent = holidays?.find(a => moment(new Date(a?.end?.date).toString()).format('YYYY-MM-DD') == el.innerText)?.summary ?? '';
						el.after(name);
					})

					day_week.map((day) => {
						const times = data?.consultantInfo?.manualSchedule?.filter(t => t.dayInWeek == this.getDayOfWeekIndex(day));
						this.form?.setFieldValue(day, times?.map(t => {
							t.from_date = moment().set({ years: t.fromYear, months: t.fromMonth, date: t.fromDate });
							t.to_date = moment().set({ years: t.toYear, months: t.toMonth, date: t.toDate });
							t.from_time = moment().set({ hours: t.openHour, minutes: t.openMin });
							t.to_time = moment().set({ hours: t.closeHour, minutes: t.closeMin });
							return t;
						}));
					});

					this.setState({
						isLegalHolidays: data?.consultantInfo?.isLegalHolidays,
						isJewishHolidays: data?.consultantInfo?.isJewishHolidays,
					})
				}
			}).catch(err => {
				message.error("Getting Profile: " + err.message);
				this.setState({ loading: false });
			})
		} else {
			request.post(getMyConsultantInfo).then(async result => {
				this.setState({ loading: false });
				const { success, data } = result;
				if (success) {
					await this.updateBlackoutDates(data?.blackoutDates?.map(date => new Date(date)));
					document.querySelectorAll('#datepanel ul li span')?.forEach(el => {
						let name = document.createElement("div");
						name.textContent = holidays?.find(a => moment(new Date(a?.end?.date).toString()).format('YYYY-MM-DD') == el.innerText)?.summary ?? '';
						el.after(name);
					})

					day_week.map((day) => {
						const times = data?.manualSchedule?.filter(t => t.dayInWeek == this.getDayOfWeekIndex(day));
						this.form?.setFieldValue(day, times?.map(t => {
							t.from_date = moment().set({ years: t.fromYear, months: t.fromMonth, date: t.fromDate });
							t.to_date = moment().set({ years: t.toYear, months: t.toMonth, date: t.toDate });
							t.from_time = moment().set({ hours: t.openHour, minutes: t.openMin });
							t.to_time = moment().set({ hours: t.closeHour, minutes: t.closeMin });
							return t;
						}));
					});

					this.setState({
						isLegalHolidays: data?.isLegalHolidays,
						isJewishHolidays: data?.isJewishHolidays,
					})
				}
			}).catch(err => {
				message.error("Getting Profile: " + err.message);
				this.setState({ loading: false });
			})
		}
	}

	getHolidays = async () => {
		try {
			const usa_url = `${BASE_CALENDAR_URL}/${USA_CALENDAR_REGION}%23${BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY}/events?key=${GOOGLE_CALENDAR_API_KEY}`
			const jewish_url = `${BASE_CALENDAR_URL}/${JEWISH_CALENDAR_REGION}%23${BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY}/events?key=${GOOGLE_CALENDAR_API_KEY}`

			const usa_data = await fetch(usa_url).then(response => response.json());
			const jewish_data = await fetch(jewish_url).then(response => response.json());

			this.setState({
				legalHolidays: usa_data?.items ?? [],
				jewishHolidays: jewish_data?.items ?? [],
			});

			return [...usa_data?.items ?? [], ...jewish_data?.items ?? []];
		} catch (error) {
			return [];
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
			case intl.formatMessage(messages.saturday): return 6;
			default: return -1;
		}
	}

	onFinish = (values) => {
		let manualSchedule = [];
		const { isLegalHolidays, isJewishHolidays } = this.state
		const invalidTimeDay = Object.values(values).findIndex(times => times?.find(v => v?.from_time && v?.to_time && v?.from_time?.isAfter(v.to_time)));
		const invalidDateDay = Object.values(values).findIndex(times => times?.find(v => v?.from_date && v?.to_date && v?.from_date?.isAfter(v.to_date)));

		if (invalidDateDay > -1) {
			message.error(`The selected date is not valid on ${day_week[invalidDateDay]}`);
			return;
		}

		if (invalidTimeDay > -1) {
			message.error(`The selected time is not valid on ${day_week[invalidTimeDay]}`);
			return;
		}

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
				}
			})
		});
		values.manualSchedule = manualSchedule.flat();
		values.blackoutDates = values.blackoutDates?.map(date => date.toString());

		const params = {
			...values,
			isLegalHolidays,
			isJewishHolidays,
			_id: window.location.pathname?.includes('changeuserprofile') ? this.props.auth.selectedUser?.consultantInfo?._id : this.props.auth.user?.consultantInfo
		};

		request.post(updateConsultantAvailability, params).then(res => {
			if (res.success) {
				message.success('Updated successfully');
			}
		}).catch(err => {
			message.error(err.message);
		})
	};

	onSelectDay = e => {
		e && this.setState({ currentSelectedDay: e });
	}

	copyToFullWeek = (dayForCopy, index) => {
		const arrToCopy = this.form?.getFieldValue(dayForCopy);
		day_week.map((newDay) => {
			if (newDay != dayForCopy) {
				if (this.form?.getFieldValue(newDay)) {
					const newRanges = this.form.getFieldValue(newDay)?.filter(a => !(!a.from_date && !a.to_date && !a.from_time && !a.to_time));
					this.form?.setFieldValue(newDay, [...newRanges, arrToCopy[index]]);
				} else {
					this.form?.setFieldValue(newDay, [arrToCopy[index]]);
				}
			}
		})
	}

	handleRemoveRange = (day) => {
		const arrToCopy = this.form?.getFieldValue(day);
		day_week.map((newDay) => {
			if (newDay == day) {
				this.form?.setFieldValue(newDay, arrToCopy);
			}
		})
	}

	handleChangeLegalHolidays = async (status) => {
		this.setState({ isLegalHolidays: status });

		const { legalHolidays, jewishHolidays, isJewishHolidays } = this.state;
		const dates = this.form?.getFieldValue("blackoutDates")?.map(date => new Date(date));
		let uniqueDates = [];

		if (status) {
			[...dates ?? [], ...[...new Set(legalHolidays?.map(a => a.end.date))]?.map(a => new Date(a)) ?? []]?.sort((a, b) => a - b)?.forEach(c => {
				if (!uniqueDates.find(d => d.toLocaleDateString() == c.toLocaleDateString())) {
					uniqueDates.push(c);
				}
			})
		} else {
			if (isJewishHolidays) {
				uniqueDates = jewishHolidays.map(a => new Date(a.end.date))?.sort((a, b) => a - b);
			}
		}

		await this.updateBlackoutDates(uniqueDates);

		let holidays = [];
		if (status) {
			if (isJewishHolidays) {
				holidays = [...legalHolidays ?? [], ...jewishHolidays ?? []];
			} else {
				holidays = legalHolidays ?? [];
			}
		} else {
			if (isJewishHolidays) {
				holidays = jewishHolidays ?? [];
			}
		}

		document.querySelectorAll('#datepanel ul li span')?.forEach(el => {
			const name = holidays?.find(a => moment(new Date(a?.end?.date).toString()).format('YYYY-MM-DD') == el.innerText)?.summary;
			if (name) {
				if (el.nextElementSibling.nodeName.toLowerCase() == 'div') {
					el.nextElementSibling.innerText = name;
				} else {
					let newElement = document.createElement("div");
					newElement.textContent = name;
					el.after(newElement);
				}
			}
		})
	}

	handleChangeJewishHolidays = async (status) => {
		this.setState({ isJewishHolidays: status });

		const { jewishHolidays, legalHolidays, isLegalHolidays } = this.state;
		const dates = this.form?.getFieldValue("blackoutDates")?.map(date => new Date(date));
		let uniqueDates = [];

		if (status) {
			[...dates ?? [], ...[...new Set(jewishHolidays?.map(a => a.end.date))]?.map(a => new Date(a)) ?? []]?.sort((a, b) => a - b)?.forEach(c => {
				if (!uniqueDates.find(d => d.toLocaleDateString() == c.toLocaleDateString())) {
					uniqueDates.push(c);
				}
			})
		} else {
			if (isLegalHolidays) {
				uniqueDates = legalHolidays.map(a => new Date(a.end.date))?.sort((a, b) => a - b);
			}
		}

		await this.updateBlackoutDates(uniqueDates);

		let holidays = [];
		if (status) {
			if (isLegalHolidays) {
				holidays = [...jewishHolidays ?? [], ...legalHolidays ?? []];
			} else {
				holidays = jewishHolidays ?? [];
			}
		} else {
			if (isLegalHolidays) {
				holidays = legalHolidays ?? [];
			}
		}

		document.querySelectorAll('#datepanel ul li span')?.forEach(el => {
			const name = holidays?.find(a => moment(new Date(a?.end?.date).toString()).format('YYYY-MM-DD') == el.innerText)?.summary;
			if (name) {
				if (el.nextElementSibling.nodeName.toLowerCase() == 'div') {
					el.nextElementSibling.innerText = name;
				} else {
					let newElement = document.createElement("div");
					newElement.textContent = name;
					el.after(newElement);
				}
			} else {
				if (el.nextElementSibling.nodeName.toLowerCase() == 'div') {
					el.nextElementSibling.innerText = '';
				}
			}
		})
	}

	updateBlackoutDates = async (dates) => {
		this.form?.setFieldsValue({ blackoutDates: dates });
		return new Promise((resolveOuter) => {
			resolveOuter(
				new Promise((resolveInner) => {
					setTimeout(resolveInner, 0);
				}),
			);
		});
	}

	handleUpdateBlackoutDates = async (dates) => {
		await this.updateBlackoutDates(dates);
		const { legalHolidays, jewishHolidays } = this.state;

		document.querySelectorAll('#datepanel ul li span')?.forEach(el => {
			const name = [...legalHolidays ?? [], ...jewishHolidays ?? []]?.find(a => a.end.date == el.innerText)?.summary;
			if (name) {
				if (el.nextElementSibling.nodeName.toLowerCase() == 'div') {
					el.nextElementSibling.innerText = name;
				} else {
					let newElement = document.createElement("div");
					newElement.textContent = name;
					el.after(newElement);
				}
			} else {
				if (el.nextElementSibling.nodeName.toLowerCase() == 'div') {
					el.nextElementSibling.innerText = '';
				}
			}
		})
	}

	render() {
		const { currentSelectedDay, loading, isLegalHolidays, isJewishHolidays } = this.state;

		return (
			<Row justify="center" className="row-form">
				<div className='col-form col-availability'>
					<div className='div-form-title'>
						<p className='font-30 text-center mb-10'>{intl.formatMessage(messages.availability)}</p>
					</div>
					<Form
						name="form_availability"
						onFinish={this.onFinish}
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
															<Col xs={24} sm={24} md={12} className='item-remove'>
																<Form.Item name={[field.name, "to_date"]}>
																	<DatePicker
																		format="MM/DD/YYYY"
																		placeholder={intl.formatMessage(messages.to)}
																	/>
																</Form.Item>
																<BsDashCircle size={16} className='text-red icon-remove' onClick={() => { remove(field.name); this.handleRemoveRange(day) }} />
															</Col>
														</Row>
														<Row gutter={14}>
															<Col xs={24} sm={24} md={12}>
																<Form.Item name={[field.name, "from_time"]}>
																	<TimePicker
																		onSelect={(time) => {
																			const dayTime = this.form?.getFieldValue(day);
																			this.form?.setFieldValue(day, dayTime?.map((d, i) => i === index ? ({ ...d, from_time: time }) : d));
																		}}
																		use12Hours
																		format="h:mm a"
																		popupClassName='timepicker'
																		placeholder={intl.formatMessage(messages.from)}
																	/>
																</Form.Item>
															</Col>
															<Col xs={24} sm={24} md={12} className='item-remove'>
																<Form.Item name={[field.name, "to_time"]}>
																	<TimePicker
																		onSelect={(time) => {
																			const dayTime = this.form?.getFieldValue(day);
																			this.form?.setFieldValue(day, dayTime?.map((d, i) => i === index ? ({ ...d, to_time: time }) : d));
																		}}
																		use12Hours
																		format="h:mm a"
																		popupClassName='timepicker'
																		placeholder={intl.formatMessage(messages.to)}
																	/>
																</Form.Item>
																<BsDashCircle size={16} className='text-red icon-remove' onClick={() => { remove(field.name); this.handleRemoveRange(day) }} />
															</Col>
														</Row>
														<Col offset={12} span={12}>
															<div className='div-copy-week mb-10'>
																<a className='underline text-primary' onClick={() => this.copyToFullWeek(day, index)}>{intl.formatMessage(messages.copyFullWeek)}</a>
																<QuestionCircleOutlined className='text-primary' />
															</div>
														</Col>
													</div>
												))}
												<div className='div-add-time justify-center'>
													<BsPlusCircle size={17} className='mr-5 text-primary' />
													<a className='text-primary' onClick={() => add()}>{intl.formatMessage(messages.addRange)}</a>
												</div>
											</div>
										)}
									</Form.List>
								</div>
							))}
						</div>
						<p className='font-18 mb-10 text-center'>{intl.formatMessage(messages.blackoutDates)}</p>
						<div className='flex items-center justify-center mb-10'>
							<div className='flex gap-4 items-center cursor'>
								<Checkbox checked={isLegalHolidays} onChange={(e) => this.handleChangeLegalHolidays(e.target.checked)}>Legal Holidays</Checkbox>
								<Checkbox checked={isJewishHolidays} onChange={(e) => this.handleChangeJewishHolidays(e.target.checked)}>Jewish Holidays</Checkbox>
							</div>
						</div>
						<Form.Item name="blackoutDates">
							<MultiDatePicker.Calendar
								multiple
								sort
								className='m-auto'
								format='YYYY-MM-DD'
								onChange={dates => this.handleUpdateBlackoutDates(dates)}
								plugins={[<DatePanel id="datepanel" />]}
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
