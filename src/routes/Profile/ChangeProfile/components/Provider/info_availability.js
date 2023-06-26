import React, { Component } from 'react';
import { Row, Col, Form, Button, Select, Segmented, TimePicker, Switch, DatePicker, message, Divider, Checkbox } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import { QuestionCircleOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import { connect } from 'react-redux'
import { compose } from 'redux'
import moment from 'moment';
import * as MultiDatePicker from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel"

import messages from 'routes/Sign/CreateAccount/messages';
import msgSidebar from 'components/SideBar/messages';
import request from 'utils/api/request';
import { getAllSchoolsForParent, getMyProviderInfo, getUserProfile, updateMyProviderAvailability } from 'utils/api/apiList';
import { setUser } from 'src/redux/features/authSlice';
import { BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY, BASE_CALENDAR_URL, DEPENDENTHOME, GOOGLE_CALENDAR_API_KEY, JEWISH_CALENDAR_REGION, PROVIDEROFFICE, USA_CALENDAR_REGION } from 'routes/constant';
import PageLoading from 'components/Loading/PageLoading';

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
			isWillingOpenPrivate: false,
			legalHolidays: [],
			jewishHolidays: [],
			isLegalHolidays: false,
			isJewishHolidays: false,
		}
	}

	async componentDidMount() {
		this.setState({ loading: true });
		this.loadSchools();
		const holidays = await this.getHolidays();
		if (window.location.pathname?.includes('changeuserprofile')) {
			request.post(getUserProfile, { id: this.props.auth.selectedUser?._id }).then(async result => {
				this.setState({ loading: false });
				const { success, data } = result;
				if (success) {
					this.form?.setFieldsValue({
						...data?.providerInfo,
						serviceableSchool: data?.providerInfo?.serviceableSchool?.map(d => d._id),
					});

					await this.updateBlackoutDates(data?.providerInfo?.blackoutDates?.map(date => new Date(date)));
					document.querySelectorAll('#datepanel ul li span')?.forEach(el => {
						let name = document.createElement("div");
						name.textContent = holidays?.find(a => moment(new Date(a?.start?.date).toString()).format('YYYY-MM-DD') === el.innerText)?.summary ?? '';
						el.after(name);
					})

					day_week.map((day) => {
						const times = data?.providerInfo?.manualSchedule?.filter(t => t.dayInWeek == this.getDayOfWeekIndex(day));
						this.form?.setFieldValue(day, times?.map(t => {
							t.from_date = moment().set({ years: t.fromYear, months: t.fromMonth, date: t.fromDate });
							t.to_date = moment().set({ years: t.toYear, months: t.toMonth, date: t.toDate });
							t.from_time = moment().set({ hours: t.openHour, minutes: t.openMin });
							t.to_time = moment().set({ hours: t.closeHour, minutes: t.closeMin });
							return t;
						}));
					});
					let locations = [];
					data?.providerInfo?.isHomeVisit && locations.push(DEPENDENTHOME);
					data?.providerInfo?.privateOffice && locations.push(PROVIDEROFFICE);
					data?.providerInfo?.serviceableSchool?.length && data?.providerInfo?.serviceableSchool?.forEach(school => locations.push(school.name));

					this.setState({
						isHomeVisit: data?.providerInfo?.isHomeVisit,
						isPrivateOffice: data?.providerInfo?.privateOffice,
						isSchools: !!data?.providerInfo?.serviceableSchool?.length,
						isPrivateForHmgh: data?.providerInfo?.isPrivateForHmgh,
						locations: locations,
						isWillingOpenPrivate: data?.providerInfo?.isWillingOpenPrivate,
						isLegalHolidays: data?.providerInfo?.isLegalHolidays,
						isJewishHolidays: data?.providerInfo?.isJewishHolidays,
					})
				}
			}).catch(err => {
				this.setState({ loading: false });
				message.error("Getting Profile: " + err.message);
			})
		} else {
			request.post(getMyProviderInfo).then(async result => {
				this.setState({ loading: false });
				const { success, data } = result;
				if (success) {
					this.form?.setFieldsValue(data);

					await this.updateBlackoutDates(data?.blackoutDates?.map(date => new Date(date)));
					document.querySelectorAll('#datepanel ul li span')?.forEach(el => {
						let name = document.createElement("div");
						name.textContent = holidays?.find(a => moment(new Date(a?.start?.date).toString()).format('YYYY-MM-DD') === el.innerText)?.summary ?? '';
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
					let locations = [];
					data?.isHomeVisit && locations.push(DEPENDENTHOME);
					data?.privateOffice && locations.push(PROVIDEROFFICE);
					data?.serviceableSchool?.length && data?.serviceableSchool?.forEach(school => locations.push(school.name));

					this.setState({
						isHomeVisit: data?.isHomeVisit,
						isPrivateOffice: data?.privateOffice,
						isSchools: !!data?.serviceableSchool?.length,
						isPrivateForHmgh: data?.isPrivateForHmgh,
						locations: locations,
						isWillingOpenPrivate: data?.isWillingOpenPrivate,
						isLegalHolidays: data?.isLegalHolidays,
						isJewishHolidays: data?.isJewishHolidays,
					})
				}
			}).catch(err => {
				this.setState({ loading: false });
				message.error("Getting Profile: " + err.message);
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

	loadSchools() {
		const { user, selectedUser } = this.props.auth;
		if (window.location.pathname?.includes('changeuserprofile')) {
			request.post(getAllSchoolsForParent, { communityServed: selectedUser?.providerInfo?.cityConnection }).then(result => {
				const { success, data } = result;
				if (success) {
					this.setState({ listSchool: data });
				}
			}).catch(err => {
				this.setState({ listSchool: [] });
			})
		} else {
			request.post(getAllSchoolsForParent, { communityServed: user?.providerInfo?.cityConnection?._id ? user?.providerInfo?.cityConnection?._id : user?.providerInfo?.cityConnection }).then(result => {
				const { success, data } = result;
				if (success) {
					this.setState({ listSchool: data });
				}
			}).catch(err => {
				this.setState({ listSchool: [] });
			})
		}
	}

	onFinish = (values) => {
		const { listSchool, isPrivateForHmgh, isJewishHolidays, isLegalHolidays } = this.state;
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
				}
			})
		});
		values.manualSchedule = manualSchedule.flat();
		values.blackoutDates = values.blackoutDates?.map(date => date.toString());

		const invalidDateDay = Object.values(values?.manualSchedule)?.findIndex(v => moment().set({ years: v?.fromYear, months: v?.fromMonth, dates: v?.fromDate })?.isAfter(moment().set({ years: v?.toYear, months: v?.toMonth, dates: v?.toDate })));
		const invalidTimeDay = Object.values(values?.manualSchedule)?.findIndex(v => moment().set({ hours: v?.openHour, minutes: v?.openMin })?.isAfter(moment().set({ hours: v?.closeHour, minutes: v?.closeMin })));

		if (invalidDateDay > -1) {
			message.error(`The selected date is not valid on ${day_week[invalidDateDay]}`);
			return;
		}

		if (invalidTimeDay > -1) {
			message.error(`The selected time is not valid on ${day_week[invalidTimeDay]}`);
			return;
		}

		if (window.location.pathname?.includes('changeuserprofile')) {
			request.post(updateMyProviderAvailability, { ...values, isJewishHolidays, isLegalHolidays, _id: this.props.auth.selectedUser?.providerInfo?._id }).then(result => {
				const { success } = result;
				if (success) {
					message.success('Updated successfully');
				}
			}).catch(err => {
				message.error("Can't update availability");
			})
		} else {
			request.post(updateMyProviderAvailability, { ...values, isJewishHolidays, isLegalHolidays, _id: this.props.auth.user.providerInfo?._id }).then(result => {
				const { success } = result;
				if (success) {
					message.success('Updated successfully');
					let newUser = {
						...this.props.auth.user,
						providerInfo: {
							...this.props.auth.user.providerInfo,
							isHomeVisit: values.isHomeVisit,
							privateOffice: values.privateOffice,
							serviceableSchool: listSchool?.filter(school => values.serviceableSchool?.find(id => id == school._id)),
							isJewishHolidays, isLegalHolidays,
						}
					}
					this.props.dispatch(setUser(newUser));
				}
			}).catch(err => {
				message.error("Can't update availability");
			})
		}
	};

	onSelectDay = e => {
		if (e) {
			this.setState({
				currentSelectedDay: e,
				selectedLocation: '',
			})
		}
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

	handleSwitchHome = (state) => {
		if (state) {
			this.setState({
				isHomeVisit: state,
				locations: [DEPENDENTHOME, ...this.state.locations],
			});
		} else {
			message.warning("All availability for dependent's home will also be deleted.").then(() => {
				day_week.forEach(day => {
					this.form?.setFieldValue(day, this.form?.getFieldValue(day)?.filter(a => a.location != DEPENDENTHOME));
				})
			});
			this.setState({
				isHomeVisit: state,
				locations: this.state.locations?.filter(location => location != DEPENDENTHOME),
			});
		}
	}

	handleSwitchOffice = (state) => {
		if (state) {
			this.setState({
				isPrivateOffice: state,
				locations: [PROVIDEROFFICE, ...this.state.locations],
			});
		} else {
			message.warning('All availability for your office will also be deleted.').then(() => {
				day_week.forEach(day => {
					this.form?.setFieldValue(day, this.form?.getFieldValue(day)?.filter(a => a.location != PROVIDEROFFICE));
				})
			});
			this.setState({
				isPrivateOffice: state,
				locations: this.state.locations?.filter(location => location != PROVIDEROFFICE),
			});
		}
	}

	handleSwitchSchool = (state) => {
		if (state) {
			this.setState({ isSchools: state });
		} else {
			const { locations } = this.state;
			const selectedSchools = locations?.filter(location => location !== PROVIDEROFFICE && location !== DEPENDENTHOME);

			if (selectedSchools?.length) {
				message.warning('All availability for those school will also be deleted.').then(() => {
					day_week.forEach(day => {
						this.form?.setFieldValue(day, this.form?.getFieldValue(day)?.filter(a => a.location === PROVIDEROFFICE || a.location === DEPENDENTHOME));
					})
				});
				this.setState({
					locations: this.state.locations?.filter(location => location === PROVIDEROFFICE || location === DEPENDENTHOME),
				});
			}
			this.setState({ isSchools: state });
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
				this.form?.setFieldValue(day, this.form?.getFieldValue(day)?.filter(a => a.location != schoolName));
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
		const dayTime = this.form?.getFieldValue(day);
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
							message.destroy();
							this.form?.setFieldValue(day, dayTime?.map((d, i) => i === index ? ({ ...d, from_time: value }) : d));
						}
					}
					if (type == 'to_time') {
						if (!((value.isSame(inCloseTime) || value.isBetween(inOpenTime, inCloseTime)) || (value.isSame(afterCloseTime) || value.isBetween(afterOpenTime, afterCloseTime)))) {
							message.warning("The school is not available at that time. Please select another time.", 5);
						} else {
							message.destroy();
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
	}

	render() {
		const { currentSelectedDay, isPrivateOffice, isHomeVisit, isSchools, locations, listSchool, isPrivateForHmgh, loading, isWillingOpenPrivate, isLegalHolidays, isJewishHolidays } = this.state;

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
												{fields.map((field, i) => (
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
															<Col xs={24} sm={24} md={12} className='item-remove'>
																<Form.Item name={[field.name, "to_date"]} label={intl.formatMessage(messages.to)} className='float-label-item'>
																	<DatePicker
																		format='MM/DD/YYYY'
																		placeholder={intl.formatMessage(messages.to)}
																	/>
																</Form.Item>
																<BsDashCircle size={16} className='text-red icon-remove' onClick={() => { remove(field.name); this.handleRemoveRange(day); }} />
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
																		onSelect={(v) => this.handleSelectTime(v, 'from_time', day, i)}
																	/>
																</Form.Item>
															</Col>
															<Col xs={24} sm={24} md={12} className='item-remove'>
																<Form.Item name={[field.name, "to_time"]} label={intl.formatMessage(messages.to)} className='float-label-item'>
																	<TimePicker
																		use12Hours
																		format="h:mm a"
																		popupClassName="timepicker"
																		placeholder={intl.formatMessage(messages.to)}
																		onSelect={(v) => this.handleSelectTime(v, 'to_time', day, i)}
																	/>
																</Form.Item>
																<BsDashCircle size={16} className='text-red icon-remove' onClick={() => { remove(field.name); this.handleRemoveRange(day); }} />
															</Col>
														</Row>
														<Row>
															<Col span={12}>
																{!isPrivateForHmgh ? (
																	<div className={`flex items-center justify-start gap-2 ${!isWillingOpenPrivate ? 'd-none' : ''}`}>
																		<Form.Item name={[field.name, "isPrivate"]} valuePropName="checked">
																			<Switch size="small" />
																		</Form.Item>
																		<p className='font-12'>{intl.formatMessage(messages.privateHMGHAgents)}</p>
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
