
import React from 'react';
import { Row, Col, Form, Button, Segmented, TimePicker, message, Checkbox } from 'antd';
import moment from 'moment';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';
import * as MultiDatePicker from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel"
import messages from '../../messages';
import { getMySchoolInfo, getUserProfile, updateSchoolAvailability } from '../../../../../utils/api/apiList'
import request from '../../../../../utils/api/request';
import { BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY, BASE_CALENDAR_URL, GOOGLE_CALENDAR_API_KEY, JEWISH_CALENDAR_REGION, USA_CALENDAR_REGION } from '../../../../../routes/constant';
import PageLoading from '../../../../../components/Loading/PageLoading';

const day_week = [
	{
		label: intl.formatMessage(messages.sunday),
		value: 1
	},
	{
		label: intl.formatMessage(messages.monday) + '-' + intl.formatMessage(messages.thursday),
		value: 2
	},
	{
		label: intl.formatMessage(messages.friday),
		value: 3
	},
];

class InfoAvailability extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			dayIsSelected: 1,
			sessionsInSchool: [],
			sessionsAfterSchool: [],
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
					this.form?.setFieldsValue(data?.schoolInfo);

					await this.updateBlackoutDates(data?.schoolInfo?.blackoutDates?.map(date => new Date(date)));
					document.querySelectorAll('#datepanel ul li span')?.forEach(el => {
						let name = document.createElement("div");
						name.textContent = holidays?.find(a => a.start.date == el.innerText)?.summary ?? '';
						el.after(name);
					})

					this.setState({
						sessionsInSchool: data?.schoolInfo?.sessionsInSchool ?? [this.defaultTimeRangeItem(), this.defaultTimeRangeItem(), this.defaultTimeRangeItem()],
						sessionsAfterSchool: data?.schoolInfo?.sessionsAfterSchool ?? [this.defaultTimeRangeItem(false), this.defaultTimeRangeItem(false), this.defaultTimeRangeItem(false)],
						isLegalHolidays: data?.schoolInfo?.isLegalHolidays,
						isJewishHolidays: data?.schoolInfo?.isJewishHolidays,
					})
				}
			}).catch(err => {
				message.error("Getting Profile: " + err.message);
				this.setState({ loading: false });
			})
		} else {
			request.post(getMySchoolInfo).then(async result => {
				this.setState({ loading: false });
				const { success, data } = result;
				if (success) {
					this.form?.setFieldsValue(data);

					await this.updateBlackoutDates(data?.blackoutDates?.map(date => new Date(date)));
					document.querySelectorAll('#datepanel ul li span')?.forEach(el => {
						let name = document.createElement("div");
						name.textContent = holidays?.find(a => a.start.date == el.innerText)?.summary ?? '';
						el.after(name);
					})

					this.setState({
						sessionsInSchool: data.sessionsInSchool ?? [this.defaultTimeRangeItem(), this.defaultTimeRangeItem(), this.defaultTimeRangeItem()],
						sessionsAfterSchool: data.sessionsAfterSchool ?? [this.defaultTimeRangeItem(false), this.defaultTimeRangeItem(false), this.defaultTimeRangeItem(false)],
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
				jewishHolidays: jewish_data?.items ?? [],
				legalHolidays: usa_data?.items ?? [],
			});

			return [...usa_data?.items ?? [], ...jewish_data?.items ?? []];
		} catch (error) {
			return [];
		}
	}

	defaultTimeRangeItem = (isInSchool = true) => {
		if (!isInSchool) {
			return {
				"openHour": 0,
				"openMin": 0,
				"closeHour": 0,
				"closeMin": 0
			}
		}
		return {
			"openHour": 0,
			"openMin": 0,
			"closeHour": 0,
			"closeMin": 0
		}
	}

	valueForAvailabilityScheduleForOpenHour = (array, index) => {
		if (array?.length - 1 < index) {
			return moment('00:00:00', 'HH:mm:ss');
		}
		return (array[index].openHour > -1 || array[index].openMin > -1) ? moment(`${array[index].openHour}:${array[index].openMin}:00`, 'HH:mm:ss') : undefined;
	}

	valueForAvailabilityScheduleForCloseHour = (array, index) => {
		if (array?.length - 1 < index) {
			return moment('00:00:00', 'HH:mm:ss');
		}
		return (array[index].closeHour > -1 || array[index].closeMin > -1) ? moment(`${array[index].closeHour}:${array[index].closeMin}:00`, 'HH:mm:ss') : undefined;
	}

	onFinish = (values) => {
		const { sessionsInSchool, sessionsAfterSchool, isLegalHolidays, isJewishHolidays } = this.state
		const { blackoutDates } = values;
		const invalidInSchoolDay = sessionsInSchool?.findIndex(times => moment().set({ hours: times.openHour, minutes: times.openMin }).isAfter(moment().set({ hours: times.closeHour, minutes: times.closeMin })));
		const invalidAfterSchoolDay = sessionsAfterSchool?.findIndex(times => moment().set({ hours: times.openHour, minutes: times.openMin }).isAfter(moment().set({ hours: times.closeHour, minutes: times.closeMin })));
		if (invalidAfterSchoolDay < 0 && invalidInSchoolDay < 0) {
			const params = {
				sessionsAfterSchool,
				sessionsInSchool,
				isJewishHolidays,
				isLegalHolidays,
				blackoutDates: blackoutDates?.map(date => date.toString()),
				_id: window.location.pathname?.includes('changeuserprofile') ? this.props.auth.selectedUser?.schoolInfo?._id : this.props.auth.user?.schoolInfo?._id,
			}

			request.post(updateSchoolAvailability, params).then(res => {
				if (res.success) {
					message.success('Updated successfully');
				}
			}).catch(err => {
				console.log('update school availability error---', err);
			})
		} else {
			invalidAfterSchoolDay > -1 && message.error(`The selected After-school session time is not valid on ${day_week[invalidAfterSchoolDay]?.label}`);
			invalidInSchoolDay > -1 && message.error(`The selected In-school session time is not valid on ${day_week[invalidInSchoolDay]?.label}`);
		}
	};

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	onSelectDay = e => {
		e && this.setState({ dayIsSelected: e });
	}

	onSelectTimeForSesssion(index, value, type) {
		const hour = value?.hour();
		const minute = value?.minute();
		const { sessionsInSchool, sessionsAfterSchool } = this.state;

		switch (type) {
			case 'inOpen':
				this.setState({ sessionsInSchool: sessionsInSchool.map((session, sessIndex) => sessIndex == index ? { ...session, openHour: hour, openMin: minute } : session) });
				break;
			case 'inClose':
				this.setState({ sessionsInSchool: sessionsInSchool.map((session, sessIndex) => sessIndex == index ? { ...session, closeHour: hour, closeMin: minute } : session) });
				break;
			case 'afterOpen':
				this.setState({ sessionsAfterSchool: sessionsAfterSchool.map((session, sessIndex) => sessIndex == index ? { ...session, openHour: hour, openMin: minute } : session) });
				break;
			case 'afterClose':
				this.setState({ sessionsAfterSchool: sessionsAfterSchool.map((session, sessIndex) => sessIndex == index ? { ...session, closeHour: hour, closeMin: minute } : session) });
				break;
			default:
				break;
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
			const name = holidays?.find(a => a?.start?.date == el.innerText)?.summary;
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
			const name = holidays?.find(a => a?.start?.date == el.innerText)?.summary;
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
		const { sessionsAfterSchool, sessionsInSchool, dayIsSelected, loading, isLegalHolidays, isJewishHolidays } = this.state;

		return (
			<Row justify="center" className="row-form">
				<div className='col-form col-school'>
					<div className='div-form-title mb-10'>
						<p className='font-30 text-center mb-0'>{intl.formatMessage(messages.schoolAvailability)}</p>
					</div>
					<Form
						name="form_school"
						onFinish={this.onFinish}
						onFinishFailed={this.onFinishFailed}
						ref={(ref) => { this.form = ref }}
					>
						<div className='div-availability'>
							<Segmented options={day_week} block={true} onChange={this.onSelectDay} />
							{day_week.map((_, index) => (
								<div key={index} className='div-time' style={{ display: dayIsSelected === (index + 1) ? 'block' : 'none' }}>
									<p className='mb-10 font-700'>{intl.formatMessage(messages.inSchoolHours)}</p>
									<Row gutter={14}>
										<Col xs={24} sm={24} md={12}>
											<TimePicker
												onSelect={v => this.onSelectTimeForSesssion(index, v, 'inOpen')}
												onClick={(e) => (e.target.nodeName == 'path' || e.target.nodeName == 'svg') && this.onSelectTimeForSesssion(index, undefined, 'inOpen')}
												popupClassName="timepicker"
												use12Hours
												format="h:mm a"
												placeholder={intl.formatMessage(messages.from)}
												value={this.valueForAvailabilityScheduleForOpenHour(sessionsInSchool, index)}
											/>
										</Col>
										<Col xs={24} sm={24} md={12}>
											<TimePicker
												onSelect={v => this.onSelectTimeForSesssion(index, v, 'inClose')}
												onClick={(e) => (e.target.nodeName == 'path' || e.target.nodeName == 'svg') && this.onSelectTimeForSesssion(index, undefined, 'inClose')}
												popupClassName="timepicker"
												use12Hours
												format="h:mm a"
												value={this.valueForAvailabilityScheduleForCloseHour(sessionsInSchool, index)}
												placeholder={intl.formatMessage(messages.to)}
											/>
										</Col>
									</Row>
									<p className='mb-10 font-700'>{intl.formatMessage(messages.afterSchoolHours)}</p>
									<Row gutter={14}>
										<Col xs={24} sm={24} md={12}>
											<TimePicker
												onSelect={v => this.onSelectTimeForSesssion(index, v, 'afterOpen')}
												onClick={(e) => (e.target.nodeName == 'path' || e.target.nodeName == 'svg') && this.onSelectTimeForSesssion(index, undefined, 'afterOpen')}
												popupClassName="timepicker"
												use12Hours
												format="h:mm a"
												value={this.valueForAvailabilityScheduleForOpenHour(sessionsAfterSchool, index)}
												placeholder={intl.formatMessage(messages.from)}
											/>
										</Col>
										<Col xs={24} sm={24} md={12}>
											<TimePicker
												onSelect={v => this.onSelectTimeForSesssion(index, v, 'afterClose')}
												onClick={(e) => (e.target.nodeName == 'path' || e.target.nodeName == 'svg') && this.onSelectTimeForSesssion(index, undefined, 'afterClose')}
												popupClassName="timepicker"
												use12Hours
												format="h:mm a"
												value={this.valueForAvailabilityScheduleForCloseHour(sessionsAfterSchool, index)}
												placeholder={intl.formatMessage(messages.to)}
											/>
										</Col>
									</Row>
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
	auth: state.auth
})

export default compose(connect(mapStateToProps))(InfoAvailability);
