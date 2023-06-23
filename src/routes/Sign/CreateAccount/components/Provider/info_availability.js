import React, { Component } from 'react';
import { Row, Col, Form, Button, Select, Segmented, TimePicker, Switch, DatePicker, message, Checkbox } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import { QuestionCircleOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import moment from 'moment';
import { connect } from 'react-redux'
import { compose } from 'redux'
import * as MultiDatePicker from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel"
import messages from '../../messages';
import msgSidebar from '../../../../../components/SideBar/messages';
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import { BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY, BASE_CALENDAR_URL, GOOGLE_CALENDAR_API_KEY, JEWISH_CALENDAR_REGION, USA_CALENDAR_REGION } from '../../../../../routes/constant';
import PageLoading from '../../../../../components/Loading/PageLoading';

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
			locations: [],
			legalHolidays: [],
			jewishHolidays: [],
			isLegalHolidays: false,
			isJewishHolidays: false,
			loading: false,
			listSchool: [],
		}
	}

	async componentDidMount() {
		const { registerData } = this.props.register;
		const { schools } = this.props.auth.generalData;

		this.setState({ loading: true, listSchool: schools?.filter(school => school.communityServed?._id === registerData.profileInfor?.cityConnection) });
		if (!!registerData.availability) {
			this.form?.setFieldsValue({ ...registerData.availability });
			const holidays = [...registerData.legalHolidays ?? [], ...registerData.jewishHolidays ?? []];

			await this.updateBlackoutDates(registerData?.availability?.blackoutDates?.map(date => new Date(date)));
			document.querySelectorAll('#datepanel ul li span')?.forEach(el => {
				let name = document.createElement("div");
				name.textContent = holidays?.find(a => moment(new Date(a?.start?.date).toString()).format('YYYY-MM-DD') === el.innerText)?.summary ?? '';
				el.after(name);
			})

			let locations = [];
			registerData.availability.isHomeVisit && locations.push('Dependent Home');
			registerData.availability.isPrivateOffice && locations.push('Provider Office');
			registerData.availability.serviceableSchool?.length && schools?.filter(school => school.communityServed?._id === registerData.profileInfor?.cityConnection)?.forEach(school => locations.push(school.name));

			this.setState({
				isHomeVisit: registerData.availability?.isHomeVisit,
				isPrivateOffice: registerData.availability?.isPrivateOffice,
				isSchools: registerData.availability?.isSchools,
				locations: locations,
				isLegalHolidays: registerData.availability?.isLegalHolidays,
				isJewishHolidays: registerData.availability?.isJewishHolidays,
				legalHolidays: registerData.legalHolidays,
				jewishHolidays: registerData.jewishHolidays,
			})
		} else {
			await this.getHolidays();
			day_week.map((day) => this.form?.setFieldValue(day, ['']));
			this.form?.setFieldsValue({ serviceableSchool: [] });
			this.props.setRegisterData({ availability: { isHomeVisit: true, isPrivateOffice: true, isSchools: true } });
			this.setState({ locations: ['Dependent Home', 'Provider Office'] });
		}
		this.setState({ loading: false });
	}

	onFinish = (values) => {
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

		const { isHomeVisit, isSchools, isPrivateOffice, isLegalHolidays, isJewishHolidays } = this.state;
		this.props.setRegisterData({ availability: { ...values, isHomeVisit, isSchools, isPrivateOffice, isLegalHolidays, isJewishHolidays } });
		this.props.onContinue();
	};

	onSelectDay = e => {
		e && this.setState({ currentSelectedDay: e });
	}

	onChangeScheduleValue = () => {
		const { isPrivateOffice, isHomeVisit, isSchools, isJewishHolidays, isLegalHolidays } = this.state;
		this.props.setRegisterData({ availability: { ...this.form?.getFieldsValue(), isPrivateOffice, isHomeVisit, isSchools, isJewishHolidays, isLegalHolidays } });
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
		this.onChangeScheduleValue();
	}

	handleSwitchHome = (state) => {
		if (state) {
			this.setState({
				isHomeVisit: state,
				locations: ['Dependent Home', ...this.state.locations],
			}, () => this.onChangeScheduleValue());
		} else {
			message.warning("All availability for dependent's home will also be deleted.").then(() => {
				day_week.forEach(day => {
					this.form?.setFieldValue(day, this.form?.getFieldValue(day)?.filter(a => a?.location != 'Dependent Home'));
				})
			});
			this.setState({
				isHomeVisit: state,
				locations: this.state.locations?.filter(location => location != 'Dependent Home'),
			}, () => this.onChangeScheduleValue());
		}
	}

	handleSwitchOffice = (state) => {
		if (state) {
			this.setState({
				isPrivateOffice: state,
				locations: ['Provider Office', ...this.state.locations],
			}, () => this.onChangeScheduleValue());
		} else {
			message.warning('All availability for your office will also be deleted.').then(() => {
				day_week.forEach(day => {
					this.form?.setFieldValue(day, this.form?.getFieldValue(day)?.filter(a => a?.location != 'Provider Office'));
				})
			});
			this.setState({
				isPrivateOffice: state,
				locations: this.state.locations?.filter(location => location != 'Provider Office'),
			}, () => this.onChangeScheduleValue());
		}
	}

	handleSwitchSchool = (state) => {
		if (state) {
			this.setState({ isSchools: state }, () => this.onChangeScheduleValue());
		} else {
			const { locations } = this.state;
			const selectedSchools = locations?.filter(location => location !== 'Provider Office' && location !== 'Dependent Home');

			if (selectedSchools?.length) {
				message.warning('All availability for those school will also be deleted.').then(() => {
					day_week.forEach(day => {
						this.form?.setFieldValue(day, this.form?.getFieldValue(day)?.filter(a => a.location === 'Provider Office' || a.location === 'Dependent Home'));
					})
				});
				this.setState({
					locations: this.state.locations?.filter(location => location === 'Provider Office' || location === 'Dependent Home'),
				}, () => this.onChangeScheduleValue());
			}
			this.setState({ isSchools: state });
		}
	}

	handleSelectSchool = (schoolId) => {
		const { locations, listSchool } = this.state;
		locations.push(listSchool?.find(school => school._id == schoolId)?.name);
		this.setState({ locations: locations });
		this.onChangeScheduleValue();
	}

	handleDeselectSchool = (schoolId) => {
		const { locations, listSchool } = this.state;
		const schoolName = listSchool?.find(school => school._id == schoolId)?.name;
		this.setState({ locations: locations.filter(location => location != schoolName) });
		message.warning('All availability for this school will also be deleted.').then(() => {
			day_week.forEach(day => {
				this.form?.setFieldValue(day, this.form?.getFieldValue(day)?.filter(a => a?.location != schoolName));
			})
		});
		this.onChangeScheduleValue();
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
		const { listSchool } = this.state;
		const dayTime = this.form?.getFieldValue(day);
		const location = dayTime?.[index]?.location;
		if (location) {
			const school = listSchool?.find(school => school.name == location);
			if (school) {
				const dayIndex = this.getDayOfWeekIndex(day);
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
							this.form?.setFieldValue(day, dayTime?.map((d, i) => i === index ? ({ ...d, from_time: value }) : d));
						}
					}
					if (type == 'to_time') {
						if (!((value.isSame(inCloseTime) || value.isBetween(inOpenTime, inCloseTime)) || (value.isSame(afterCloseTime) || value.isBetween(afterOpenTime, afterCloseTime)))) {
							message.warning("The school is not available at that time. Please select another time.", 5);
						} else {
							this.form?.setFieldValue(day, dayTime?.map((d, i) => i === index ? ({ ...d, to_time: value }) : d));
						}
					}
				}
			} else {
				this.form?.setFieldValue(day, dayTime?.map((d, i) => i === index ? ({ ...d, [type]: value }) : d));
			}
		} else {
			this.form?.setFieldValue(day, dayTime?.map((d, i) => i === index ? ({ ...d, [type]: value }) : d));
		}
		this.onChangeScheduleValue();
	}

	handleSelectLocation = (location, day, index) => {
		const { listSchool } = this.state;
		const dayTime = this.form?.getFieldValue(day);

		const school = listSchool?.find(school => school.name == location);
		if (school) {
			const dayIndex = this.getDayOfWeekIndex(day);
			if (dayIndex > -1) {
				const inOpenTime = moment().set({ hours: school.sessionsInSchool[dayIndex]?.openHour, minutes: school.sessionsInSchool[dayIndex]?.openMin, seconds: 0, milliseconds: 0 });
				const inCloseTime = moment().set({ hours: school.sessionsInSchool[dayIndex]?.closeHour, minutes: school.sessionsInSchool[dayIndex]?.closeMin, seconds: 0, milliseconds: 0 });
				const afterOpenTime = moment().set({ hours: school.sessionsAfterSchool[dayIndex]?.openHour, minutes: school.sessionsAfterSchool[dayIndex]?.openMin, seconds: 0, milliseconds: 0 });
				const afterCloseTime = moment().set({ hours: school.sessionsAfterSchool[dayIndex]?.closeHour, minutes: school.sessionsAfterSchool[dayIndex]?.closeMin, seconds: 0, milliseconds: 0 });

				if (dayTime[index]?.from_time) {
					const fromTime = moment(dayTime[index]?.from_time).set({ seconds: 0, milliseconds: 0 });
					if (!((fromTime.isSame(inOpenTime) || fromTime.isBetween(inOpenTime, inCloseTime)) || (fromTime.isSame(afterOpenTime) || fromTime.isBetween(afterOpenTime, afterCloseTime)))) {
						message.warning("The school is not available at the from_time. Please select another location.", 5);
						this.form?.setFieldValue(day, dayTime?.map((d, i) => i === index ? ({ ...d, location: null }) : d));
					} else {
						this.form?.setFieldValue(day, dayTime?.map((d, i) => i === index ? ({ ...d, location: location }) : d));
					}
				}
				if (dayTime[index]?.to_time) {
					const toTime = moment(dayTime[index]?.to_time).set({ seconds: 0, milliseconds: 0 });
					if (!((toTime.isSame(inCloseTime) || toTime.isBetween(inOpenTime, inCloseTime)) || (toTime.isSame(afterCloseTime) || toTime.isBetween(afterOpenTime, afterCloseTime)))) {
						message.warning("The school is not available at the to_time. Please select another location.", 5);
						this.form?.setFieldValue(day, dayTime?.map((d, i) => i === index ? ({ ...d, location: null }) : d));
					} else {
						this.form?.setFieldValue(day, dayTime?.map((d, i) => i === index ? ({ ...d, location: location }) : d));
					}
				}
			}
		} else {
			this.form?.setFieldValue(day, dayTime?.map((d, i) => i === index ? ({ ...d, location: location }) : d));
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
			this.props.setRegisterData({
				legalHolidays: usa_data?.items ?? [],
				jewishHolidays: jewish_data?.items ?? [],
			});

			return [...usa_data?.items ?? [], ...jewish_data?.items ?? []];
		} catch (error) {
			return [];
		}
	}

	handleChangeLegalHolidays = async (status) => {
		this.setState({ isLegalHolidays: status });

		const { legalHolidays, jewishHolidays, isJewishHolidays } = this.state;
		const dates = this.form?.getFieldValue("blackoutDates")?.map(date => new Date(date));
		let uniqueDates = [];

		if (status) {
			[...dates ?? [], ...[...new Set(legalHolidays?.map(a => a.start.date))]?.map(a => new Date(a)) ?? []]?.sort((a, b) => a - b)?.forEach(c => {
				if (!uniqueDates.find(d => d.toLocaleDateString() == c.toLocaleDateString())) {
					uniqueDates.push(c);
				}
			})
		} else {
			if (isJewishHolidays) {
				uniqueDates = jewishHolidays.map(a => new Date(a.start.date))?.sort((a, b) => a - b);
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
			const name = holidays?.find(a => moment(new Date(a?.start?.date).toString()).format('YYYY-MM-DD') == el.innerText)?.summary;
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
		this.onChangeScheduleValue();
	}

	handleChangeJewishHolidays = async (status) => {
		this.setState({ isJewishHolidays: status });

		const { jewishHolidays, legalHolidays, isLegalHolidays } = this.state;
		const dates = this.form?.getFieldValue("blackoutDates")?.map(date => new Date(date));
		let uniqueDates = [];

		if (status) {
			[...dates ?? [], ...[...new Set(jewishHolidays?.map(a => a.start.date))]?.map(a => new Date(a)) ?? []]?.sort((a, b) => a - b)?.forEach(c => {
				if (!uniqueDates.find(d => d.toLocaleDateString() == c.toLocaleDateString())) {
					uniqueDates.push(c);
				}
			})
		} else {
			if (isLegalHolidays) {
				uniqueDates = legalHolidays.map(a => new Date(a.start.date))?.sort((a, b) => a - b);
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
			const name = holidays?.find(a => moment(new Date(a?.start?.date).toString()).format('YYYY-MM-DD') == el.innerText)?.summary;
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
		this.onChangeScheduleValue();
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
			const name = [...legalHolidays ?? [], ...jewishHolidays ?? []]?.find(a => a.start.date == el.innerText)?.summary;
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
		this.onChangeScheduleValue();
	}

	render() {
		const { currentSelectedDay, isPrivateOffice, isHomeVisit, isSchools, locations, listSchool, isJewishHolidays, isLegalHolidays, loading } = this.state;
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
												{fields.map((field, i) => (
													<div key={field.key}>
														<Form.Item name={[field.name, "location"]}>
															<Select
																showArrow
																placeholder={intl.formatMessage(messages.location)}
																onChange={(location) => this.handleSelectLocation(location, day, i)}
															>
																{locations.map((location, index) => (
																	<Select.Option key={index} value={location}>{location}</Select.Option>
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
															<Col xs={24} sm={24} md={12} className='item-remove'>
																<Form.Item name={[field.name, "to_date"]}>
																	<DatePicker
																		onChange={() => this.onChangeScheduleValue()}
																		format='MM/DD/YYYY'
																		placeholder={intl.formatMessage(messages.to)}
																	/>
																</Form.Item>
																<BsDashCircle size={16} className='text-red icon-remove' onClick={() => { remove(field.name); this.handleRemoveRange(day); }} />
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
																		onSelect={(v) => this.handleSelectTime(v, 'from_time', day, i)}
																	/>
																</Form.Item>
															</Col>
															<Col xs={24} sm={24} md={12} className='item-remove'>
																<Form.Item name={[field.name, "to_time"]}>
																	<TimePicker
																		onChange={() => this.onChangeScheduleValue()}
																		use12Hours
																		format="h:mm a"
																		popupClassName='timepicker'
																		placeholder={intl.formatMessage(messages.to)}
																		onSelect={(v) => this.handleSelectTime(v, 'to_time', day, i)}
																	/>
																</Form.Item>
																<BsDashCircle size={16} className='text-red icon-remove' onClick={() => { remove(field.name); this.handleRemoveRange(day); }} />
															</Col>
														</Row>
														<Row>
															<Col span={12}>
																{!registerData?.profileInfor?.isPrivateForHmgh ? (
																	<div className={`flex items-center justify-start gap-2 ${!registerData?.subsidy?.isWillingOpenPrivate ? 'd-none' : ''}`}>
																		<Form.Item name={[field.name, "isPrivate"]} valuePropName="checked">
																			<Switch size="small" />
																		</Form.Item>
																		<p className='font-09'>{intl.formatMessage(messages.privateHMGHAgents)}</p>
																	</div>
																) : null}
															</Col>
															<Col span={12}>
																<div className='div-copy-week'>
																	<a className='underline text-primary' onClick={() => this.copyToFullWeek(day, i)}>
																		{intl.formatMessage(messages.copyFullWeek)}
																	</a>
																	<QuestionCircleOutlined className='text-primary' />
																</div>
															</Col>
														</Row>
													</div>
												))}
												<div className='div-add-time justify-center'>
													<BsPlusCircle size={17} className='mr-5 text-primary' />
													<a className='text-primary' onClick={() => add()}>
														{intl.formatMessage(messages.addRange)}
													</a>
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
								format="YYYY-MM-DD"
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
								{intl.formatMessage(messages.continue).toUpperCase()}
							</Button>
						</Form.Item>
					</Form >
				</div >
				<PageLoading loading={loading} isBackground={true} />
			</Row >
		);
	}
}

const mapStateToProps = state => ({
	register: state.register,
	auth: state.auth,
})

export default compose(connect(mapStateToProps, { setRegisterData }))(InfoAvailability);
