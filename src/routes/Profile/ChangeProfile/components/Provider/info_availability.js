import React, { Component } from 'react';
import { Row, Col, Form, Button, Select, Segmented, TimePicker, Switch, DatePicker, message, Divider } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import { QuestionCircleOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import messages from '../../messages';
import msgSidebar from '../../../../../components/SideBar/messages';
import { connect } from 'react-redux'
import { compose } from 'redux'
import request from '../../../../../utils/api/request';
import { getAllSchoolsForParent, getDefaultValueForProvider, getMyProviderInfo, getUserProfile, updateMyProviderAvailability } from '../../../../../utils/api/apiList';
import moment from 'moment';
import { store } from '../../../../../redux/store';
import { setUser } from '../../../../../redux/features/authSlice';
import * as MultiDatePicker from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel"
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
			listSchool: [],
			selectedLocation: '',
			isPrivateForHmgh: false,
			loading: false,
			allHolidays: [],
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
					this.form?.setFieldsValue(data?.providerInfo);
					this.form?.setFieldValue('serviceableSchool', data?.providerInfo?.serviceableSchool?.map(d => d._id));

					await this.updateBlackoutDates(data?.providerInfo?.blackoutDates?.map(date => new Date(date)));
					document.querySelectorAll('#datepanel ul li span')?.forEach(el => {
						let name = document.createElement("div");
						name.textContent = holidays?.find(a => a.start.date == el.innerText)?.summary ?? '';
						el.after(name);
					})

					day_week.map((day) => {
						const times = data?.providerInfo?.manualSchedule?.filter(t => t.dayInWeek == this.getDayOfWeekIndex(day));
						this.form.setFieldValue(day, times?.map(t => {
							t.from_date = moment().set({ years: t.fromYear, months: t.fromMonth, date: t.fromDate });
							t.to_date = moment().set({ years: t.toYear, months: t.toMonth, date: t.toDate });
							t.from_time = moment().set({ hours: t.openHour, minutes: t.openMin });
							t.to_time = moment().set({ hours: t.closeHour, minutes: t.closeMin });
							return t;
						}));
					});
					let locations = [];
					data?.providerInfo?.isHomeVisit && locations.push('Dependent Home');
					data?.providerInfo?.privateOffice && locations.push('Provider Office');
					data?.providerInfo?.serviceableSchool?.length && data?.providerInfo?.serviceableSchool?.forEach(school => locations.push(school.name));

					this.setState({
						isHomeVisit: data?.providerInfo?.isHomeVisit,
						isPrivateOffice: data?.providerInfo?.privateOffice,
						isSchools: !!data?.providerInfo?.serviceableSchool?.length,
						isPrivateForHmgh: data?.providerInfo?.isPrivateForHmgh,
						locations: locations,
					})
				}
			}).catch(err => {
				this.setState({ loading: false });
				message.error(err.message);
			})
		} else {
			request.post(getMyProviderInfo).then(async result => {
				this.setState({ loading: false });
				const { success, data } = result;
				const { user } = this.props.auth;
				if (success) {
					this.form?.setFieldsValue(data);

					await this.updateBlackoutDates(data?.blackoutDates?.map(date => new Date(date)));
					document.querySelectorAll('#datepanel ul li span')?.forEach(el => {
						let name = document.createElement("div");
						name.textContent = holidays?.find(a => a.start.date == el.innerText)?.summary ?? '';
						el.after(name);
					})

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
					let locations = [];
					user?.providerInfo?.isHomeVisit && locations.push('Dependent Home');
					user?.providerInfo?.privateOffice && locations.push('Provider Office');
					user?.providerInfo?.serviceableSchool?.length && user?.providerInfo?.serviceableSchool?.forEach(school => locations.push(school.name));

					this.setState({
						isHomeVisit: user?.providerInfo?.isHomeVisit,
						isPrivateOffice: user?.providerInfo?.privateOffice,
						isSchools: !!user?.providerInfo?.serviceableSchool?.length,
						isPrivateForHmgh: user?.providerInfo?.isPrivateForHmgh,
						locations: locations,
					})
				}
			}).catch(err => {
				this.setState({ loading: false });
				message.error(err.message);
			})
		}

		this.getDataFromServer();
		this.loadSchools();
	}

	getHolidays = async () => {
		try {
			const usa_url = `${BASE_CALENDAR_URL}/${USA_CALENDAR_REGION}%23${BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY}/events?key=${GOOGLE_CALENDAR_API_KEY}`
			const jewish_url = `${BASE_CALENDAR_URL}/${JEWISH_CALENDAR_REGION}%23${BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY}/events?key=${GOOGLE_CALENDAR_API_KEY}`

			const usa_data = await fetch(usa_url).then(response => response.json());
			const jewish_data = await fetch(jewish_url).then(response => response.json());

			this.setState({ allHolidays: [...usa_data?.items ?? [], ...jewish_data?.items ?? []] });

			return [...usa_data?.items ?? [], ...jewish_data?.items ?? []];
		} catch (error) {
			return [];
		}
	}

	getDataFromServer = () => {
		request.post(getDefaultValueForProvider).then(result => {
			const { success, data } = result;
			if (success) {
				this.setState({ CancellationWindow: data.CancellationWindow });
			} else {
				this.setState({ CancellationWindow: [] });
			}
		}).catch(err => {
			console.log(err);
			this.setState({ CancellationWindow: [] });
		})
	}

	loadSchools() {
		const { user, selectedUser } = this.props.auth;
		if (window.location.pathname?.includes('changeuserprofile')) {
			request.post(getAllSchoolsForParent, { communityServed: selectedUser?.providerInfo?.cityConnection }).then(result => {
				const { success, data } = result;
				if (success) {
					this.setState({ listSchool: data });
				}
			}).catch(err => {
				console.log('get all schools for parent error---', err);
				this.setState({ listSchool: [] });
			})
		} else {
			request.post(getAllSchoolsForParent, { communityServed: user?.providerInfo?.cityConnection?._id ? user?.providerInfo?.cityConnection?._id : user?.providerInfo?.cityConnection }).then(result => {
				const { success, data } = result;
				if (success) {
					this.setState({ listSchool: data });
				}
			}).catch(err => {
				console.log('get all schools for parent error---', err);
				this.setState({ listSchool: [] });
			})
		}
	}

	onFinish = (values) => {
		const { listSchool, isPrivateForHmgh } = this.state;
		let manualSchedule = [];
		day_week.map(day => {
			values[day]?.forEach(t => {
				if (t.from_time && t.to_time && t.location) {
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
						isPrivate: isPrivateForHmgh ? true : t.isPrivate ?? false,
						location: t.location ?? '',
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
						isPrivate: false,
						location: '',
					}
					manualSchedule.push(times);
				}
			})
		});
		values.manualSchedule = manualSchedule.flat();
		values.isPrivateForHmgh = isPrivateForHmgh;
		values.blackoutDates = values.blackoutDates?.map(date => date.toString());

		const invalidDay = Object.values(values?.manualSchedule)?.find(v => moment().set({ years: v?.fromYear, months: v?.fromMonth, dates: v?.fromDate })?.isAfter(moment().set({ years: v?.toYear, months: v?.toMonth, dates: v?.toDate })) || moment().set({ hours: v?.openHour, minutes: v?.openMin })?.isAfter(moment().set({ hours: v?.closeHour, minutes: v?.closeMin })));
		if (invalidDay) {
			message.error(`The selected date or time is not valid on ${day_week[invalidDay.dayInWeek]}`);
		} else {
			if (window.location.pathname?.includes('changeuserprofile')) {
				request.post(updateMyProviderAvailability, { ...values, _id: this.props.auth.selectedUser?.providerInfo?._id }).then(result => {
					const { success } = result;
					if (success) {
						message.success('Updated successfully');
					}
				}).catch(err => {
					message.error("Can't update availability");
					console.log('update provider availability error---', err);
				})
			} else {
				request.post(updateMyProviderAvailability, { ...values, _id: this.props.auth.user.providerInfo?._id }).then(result => {
					const { success } = result;
					if (success) {
						message.success('Updated successfully');
						let newUser = {
							...this.props.auth.user,
							providerInfo: {
								...this.props.auth.user.providerInfo,
								isHomeVisit: values.isHomeVisit,
								privateOffice: values.privateOffice,
								isPrivateForHmgh: isPrivateForHmgh,
								serviceableSchool: listSchool?.filter(school => values.serviceableSchool?.find(id => id == school._id)),
							}
						}
						store.dispatch(setUser(newUser));
					}
				}).catch(err => {
					message.error("Can't update availability");
					console.log('update provider availability error---', err);
				})
			}
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
			message.warning("All availability for dependent's home will also be deleted.").then(() => {
				day_week.forEach(day => {
					this.form.setFieldValue(day, this.form.getFieldValue(day)?.filter(a => a.location != 'Dependent Home'));
				})
			});
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
			message.warning('All availability for your office will also be deleted.').then(() => {
				day_week.forEach(day => {
					this.form.setFieldValue(day, this.form.getFieldValue(day)?.filter(a => a.location != 'Provider Office'));
				})
			});
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
			message.warning('All availability for those school will also be deleted.').then(() => {
				day_week.forEach(day => {
					this.form.setFieldValue(day, this.form.getFieldValue(day)?.filter(a => a.location == 'Provider Office' || a.location == 'Dependent Home'));
				})
			});
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
		message.warning('All availability for this school will also be deleted.').then(() => {
			day_week.forEach(day => {
				this.form.setFieldValue(day, this.form.getFieldValue(day)?.filter(a => a.location != schoolName));
			})
		});
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
	}

	handleClickGoogleCalendar = async () => {
		const dates = this.form.getFieldValue("blackoutDates")?.map(date => new Date(date));
		let uniqueDates = [];
		[...dates ?? [], ...[...new Set(this.state.allHolidays?.map(a => a.start.date))]?.map(a => new Date(a)) ?? []]?.sort((a, b) => a - b)?.forEach(c => {
			if (!uniqueDates.find(d => d.toLocaleDateString() == c.toLocaleDateString())) {
				uniqueDates.push(c);
			}
		})

		await this.updateBlackoutDates(uniqueDates);

		document.querySelectorAll('#datepanel ul li span')?.forEach(el => {
			const name = this.state.allHolidays?.find(a => a.start.date == el.innerText)?.summary;
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
		this.form.setFieldsValue({ blackoutDates: dates });
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
		document.querySelectorAll('#datepanel ul li span')?.forEach(el => {
			const name = this.state.allHolidays?.find(a => a.start.date == el.innerText)?.summary;
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
		const { currentSelectedDay, isPrivateOffice, isHomeVisit, isSchools, locations, listSchool, isPrivateForHmgh, loading } = this.state;
		const { user } = this.props.auth;

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
								<Form.Item name="privateOffice" className='bottom-0'>
									<Switch size="small" checkedChildren="ON" unCheckedChildren="OFF" style={{ width: 50 }} checked={isPrivateOffice} onChange={v => this.handleSwitchOffice(v)} />
								</Form.Item>
								<p className='ml-10 mb-0'>{intl.formatMessage(messages.privateOffice)}</p>
							</div>
							<div className='flex flex-row items-center mb-5'>
								<Form.Item name="isHomeVisit" className='bottom-0'>
									<Switch size="small" checkedChildren="ON" unCheckedChildren="OFF" style={{ width: 50 }} checked={isHomeVisit} onChange={v => this.handleSwitchHome(v)} />
								</Form.Item>
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
									className="float-label-item mt-10"
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
																onChange={v => this.setState({ selectedLocation: v })}
															>
																{locations.map((location, index) => (
																	<Select.Option key={index} label={location} value={location}>{location}</Select.Option>
																))}
															</Select>
														</Form.Item>
														<Row gutter={14}>
															<Col xs={24} sm={24} md={12}>
																<Form.Item name={[field.name, "from_date"]} label={intl.formatMessage(messages.from)} className='float-label-item'>
																	<DatePicker
																		format='MM/DD/YYYY'
																		placeholder={intl.formatMessage(messages.from)}
																	/>
																</Form.Item>
															</Col>
															<Col xs={24} sm={24} md={12} className={field.key !== 0 && 'item-remove'}>
																<Form.Item name={[field.name, "to_date"]} label={intl.formatMessage(messages.to)} className='float-label-item'>
																	<DatePicker
																		format='MM/DD/YYYY'
																		placeholder={intl.formatMessage(messages.to)}
																	/>
																</Form.Item>
																{field.key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />}
															</Col>
														</Row>
														<Row gutter={14}>
															<Col xs={24} sm={24} md={12}>
																<Form.Item name={[field.name, "from_time"]} label={intl.formatMessage(messages.from)} className='float-label-item'>
																	<TimePicker
																		use12Hours
																		format="h:mm a"
																		popupClassName="timepicker"
																		placeholder={intl.formatMessage(messages.from)}
																		onSelect={(v) => this.handleSelectTime(v, 'from_time', day, field.key)}
																	/>
																</Form.Item>
															</Col>
															<Col xs={24} sm={24} md={12} className={field.key !== 0 && 'item-remove'}>
																<Form.Item name={[field.name, "to_time"]} label={intl.formatMessage(messages.to)} className='float-label-item'>
																	<TimePicker
																		use12Hours
																		format="h:mm a"
																		popupClassName="timepicker"
																		placeholder={intl.formatMessage(messages.to)}
																		onSelect={(v) => this.handleSelectTime(v, 'to_time', day, field.key)}
																	/>
																</Form.Item>
																{field.key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />}
															</Col>
														</Row>
														{user?.providerInfo?.isWillingOpenPrivate ? (
															<div className={`flex items-center justify-start gap-2 ${isPrivateForHmgh ? 'd-none' : ''}`}>
																<Form.Item name={[field.name, "isPrivate"]} valuePropName="checked">
																	<Switch size="small" />
																</Form.Item>
																<p className='font-12'>{intl.formatMessage(messages.privateHMGHAgents)}</p>
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
														<div className='div-copy-week justify-center'>
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
						<div className="flex items-center justify-start gap-2">
							<Switch size="small" checked={isPrivateForHmgh} onChange={(state) => this.setState({ isPrivateForHmgh: state })} />
							<p className='font-12 mb-0'>{intl.formatMessage(messages.privateHMGHAgents)}</p>
						</div>
						<p className='font-18 mb-10 text-center'>{intl.formatMessage(messages.blackoutDates)}</p>
						<div className='flex items-center justify-center mb-10'>
							<div className='flex gap-2 items-center cursor' onClick={() => this.handleClickGoogleCalendar()}>
								<img src='../images/gg.png' className='h-30' />
								<p className='font-16 mb-0 text-underline'>Google</p>
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
								{intl.formatMessage(messages.update).toUpperCase()}
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
	auth: state.auth
})
export default compose(connect(mapStateToProps))(InfoAvailability);
