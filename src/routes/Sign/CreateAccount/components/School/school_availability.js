import React from 'react';
import { Row, Col, Form, Button, Segmented, TimePicker, message, Checkbox } from 'antd';
import moment from 'moment';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';
import * as MultiDatePicker from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel"

import messages from '../../messages';
import { BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY, BASE_CALENDAR_URL, GOOGLE_CALENDAR_API_KEY, JEWISH_CALENDAR_REGION, USA_CALENDAR_REGION } from 'routes/constant';
import { setRegisterData, removeRegisterData } from 'src/redux/features/registerSlice';

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
]

class SchoolAvailability extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			dayIsSelected: 1,
			sessionsInSchool: [],
			sessionsAfterSchool: [],
			legalHolidays: [],
			jewishHolidays: [],
			isLegalHolidays: false,
			isJewishHolidays: false,
		}
	}

	async componentDidMount() {
		const { registerData } = this.props.register;

		this.form?.setFieldsValue(registerData);
		if (!registerData?.sessionsInSchool || registerData?.sessionsInSchool.length == 0) {
			this.setState({
				sessionsInSchool: [this.defaultTimeRangeItem(), this.defaultTimeRangeItem(), this.defaultTimeRangeItem()],
				sessionsAfterSchool: [this.defaultTimeRangeItem(false), this.defaultTimeRangeItem(false), this.defaultTimeRangeItem(false)]
			}, this.callbackAfterSetState)
		} else {
			this.setState({
				sessionsInSchool: registerData.sessionsInSchool,
				sessionsAfterSchool: registerData.sessionsAfterSchool,
				isLegalHolidays: registerData?.isLegalHolidays,
				isJewishHolidays: registerData?.isJewishHolidays,
			})
		}

		if (registerData?.legalHolidays?.length) {
			const holidays = [...registerData?.legalHolidays ?? [], ...registerData?.jewishHolidays ?? []];
			this.setState({
				legalHolidays: registerData?.legalHolidays ?? [],
				jewishHolidays: registerData?.jewishHolidays ?? [],
			})
			if (registerData?.blackoutDates?.length) {
				await this.updateBlackoutDates(registerData?.blackoutDates?.map(date => new Date(date)));
				document.querySelectorAll('#datepanel ul li span')?.forEach(el => {
					let name = document.createElement("div");
					name.textContent = holidays?.find(a => moment(new Date(a?.end?.date).toString()).format('YYYY-MM-DD') == el.innerText)?.summary ?? '';
					el.after(name);
				})
			}
		} else {
			await this.getHolidays();
		}
	}

	defaultTimeRangeItem = (isInSchool = true) => {
		if (!isInSchool) {
			return {
				"openHour": 18,
				"openMin": 0,
				"closeHour": 22,
				"closeMin": 0
			}
		}
		return {
			"openHour": 7,
			"openMin": 0,
			"closeHour": 18,
			"closeMin": 0
		}
	}

	valueForAvailabilityScheduleForOpenHour = (array, index) => {
		if (array.length - 1 < index) {
			return moment('00:00:00', 'HH:mm:ss');
		}
		return (array[index].openHour > -1 || array[index].openMin > -1) ? moment(`${array[index].openHour}:${array[index].openMin}:00`, 'HH:mm:ss') : undefined;
	}

	valueForAvailabilityScheduleForCloseHour = (array, index) => {
		if (array.length - 1 < index) {
			return moment('00:00:00', 'HH:mm:ss');
		}
		return (array[index].closeHour > -1 || array[index].closeMin > -1) ? moment(`${array[index].closeHour}:${array[index].closeMin}:00`, 'HH:mm:ss') : undefined;
	}


	onFinish = async () => {
		const { registerData } = this.props.register;
		const { sessionsAfterSchool, sessionsInSchool, isLegalHolidays, isJewishHolidays } = this.state;
		const invalidInSchoolDay = sessionsInSchool?.findIndex(times => (times.openHour == undefined && times.closeHour != undefined) || (times.openHour != undefined && times.closeHour == undefined) || (times.openHour != undefined && times.closeHour != undefined && moment().set({ hours: times.openHour, minutes: times.openMin }).isAfter(moment().set({ hours: times.closeHour, minutes: times.closeMin }))));
		const invalidAfterSchoolDay = sessionsAfterSchool?.findIndex(times => (times.openHour == undefined && times.closeHour != undefined) || (times.openHour != undefined && times.closeHour == undefined) || (times.openHour != undefined && times.closeHour != undefined && moment().set({ hours: times.openHour, minutes: times.openMin }).isAfter(moment().set({ hours: times.closeHour, minutes: times.closeMin }))));
		const incorrectAfterSchoolDay = sessionsAfterSchool?.findIndex((times, i) => times.openHour != undefined && times.closeHour != undefined && sessionsInSchool[i].openHour != undefined && sessionsInSchool[i].closeHour != undefined && moment().set({ hours: times.openHour, minutes: times.openMin }).isBefore(moment().set({ hours: sessionsInSchool[i].closeHour, minutes: sessionsInSchool[i].closeMin })));

		if (invalidAfterSchoolDay > -1) {
			message.error(`The selected After-school session time is not valid on ${day_week[invalidAfterSchoolDay]?.label}`);
			return;
		}

		if (invalidInSchoolDay > -1) {
			message.error(`The selected In-school session time is not valid on ${day_week[invalidInSchoolDay]?.label}`);
			return;
		}

		if (incorrectAfterSchoolDay > -1) {
			message.error(`The selected After-school session time must be later than In-school session time on ${day_week[incorrectAfterSchoolDay]?.label}`);
			return;
		}

		let newRegisterData = JSON.parse(JSON.stringify(registerData));

		// update in school - after school
		newRegisterData.sessionsInSchool = this.arrDayScheduleFormat(sessionsInSchool);
		newRegisterData.sessionsAfterSchool = this.arrDayScheduleFormat(sessionsAfterSchool);

		this.props.setRegisterData({ ...newRegisterData, isJewishHolidays, isLegalHolidays });
		this.props.onContinue();
	};

	arrDayScheduleFormat = (arr) => {
		const newArr = [];
		for (let i = 0; i < arr.length; i++) {
			if (i == 1) {
				for (let z = 1; z < 5; z++) {
					let newSche = { ...arr[i] };
					newSche.dayInWeek = z;
					newArr.push(newSche);
				}
			} else {
				let newSche = { ...arr[i] };
				newSche.dayInWeek = i == 0 ? 0 : 5;
				newArr.push(newSche);
			}
		}
		return newArr;
	}

	setReduxForSchool(fieldName, value) {
		let obj = {};
		obj[fieldName] = value;
		this.props.setRegisterData(obj);
	}

	onSelectDay = e => {
		if (e) {
			this.setState({ dayIsSelected: e })
		}
	}

	onSelectTimeForSesssion(index, value, type) {
		const hour = value?.hour();
		const minute = value?.minute();
		const { sessionsAfterSchool, sessionsInSchool } = this.state;

		switch (type) {
			case 'inOpen':
				this.setState({ sessionsInSchool: sessionsInSchool.map((session, sessIndex) => sessIndex == index ? { ...session, openHour: hour, openMin: minute } : session) }, this.callbackAfterSetState);
				break;
			case 'inClose':
				this.setState({ sessionsInSchool: sessionsInSchool.map((session, sessIndex) => sessIndex == index ? { ...session, closeHour: hour, closeMin: minute } : session) }, this.callbackAfterSetState);
				break;
			case 'afterOpen':
				this.setState({ sessionsAfterSchool: sessionsAfterSchool.map((session, sessIndex) => sessIndex == index ? { ...session, openHour: hour, openMin: minute } : session) }, this.callbackAfterSetState);
				break;
			case 'afterClose':
				this.setState({ sessionsAfterSchool: sessionsAfterSchool.map((session, sessIndex) => sessIndex == index ? { ...session, closeHour: hour, closeMin: minute } : session) }, this.callbackAfterSetState);
				break;
			default:
				break;
		}
	}

	callbackAfterSetState = () => {
		this.setReduxForSchool('sessionsInSchool', this.state.sessionsInSchool);
		this.setReduxForSchool('sessionsAfterSchool', this.state.sessionsAfterSchool);
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
		this.setReduxForSchool('isLegalHolidays', status);
	}

	handleChangeJewishHolidays = async (status) => {
		this.setState({ isJewishHolidays: status });

		const { legalHolidays, jewishHolidays, isLegalHolidays } = this.state;
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
			}
		})
		this.setReduxForSchool('isJewishHolidays', status);
	}

	updateBlackoutDates = async (dates) => {
		this.form?.setFieldsValue({ blackoutDates: dates });
		this.setReduxForSchool('blackoutDates', dates?.map(date => date.toString()));
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
		const { dayIsSelected, sessionsInSchool, sessionsAfterSchool, isLegalHolidays, isJewishHolidays } = this.state;

		return (
			<Row justify="center" className="row-form">
				<div className='col-form col-school'>
					<div className='div-form-title mb-10'>
						<p className='font-30 text-center mb-0'>{intl.formatMessage(messages.availabilityInfo)}</p>
					</div>
					<Form
						name="form_school"
						layout='vertical'
						onFinish={this.onFinish}
						ref={(ref) => { this.form = ref }}
					>
						<div className='div-availability'>
							<Segmented options={day_week} block={true} onChange={this.onSelectDay} />
							{day_week.map((item, index) => (
								<div key={index} className='div-time' style={{ display: dayIsSelected === (index + 1) ? 'block' : 'none' }}>
									<p className='mb-10 font-700'>{intl.formatMessage(messages.inSchoolHours)}</p>
									<Row gutter={14}>
										<Col xs={24} sm={24} md={12}>
											<TimePicker
												onSelect={v => this.onSelectTimeForSesssion(index, v, 'inOpen')}
												onChange={v => this.onSelectTimeForSesssion(index, v, 'inOpen')}
												onClick={(e) => (e.target.nodeName == 'path' || e.target.nodeName == 'svg') && this.onSelectTimeForSesssion(index, undefined, 'inOpen')}
												use12Hours
												format="h:mm a"
												placeholder={intl.formatMessage(messages.from)}
												popupClassName="timepicker"
												value={this.valueForAvailabilityScheduleForOpenHour(sessionsInSchool, index)}
											/>
										</Col>
										<Col xs={24} sm={24} md={12}>
											<TimePicker
												onSelect={v => this.onSelectTimeForSesssion(index, v, 'inClose')}
												onChange={v => this.onSelectTimeForSesssion(index, v, 'inClose')}
												onClick={(e) => (e.target.nodeName == 'path' || e.target.nodeName == 'svg') && this.onSelectTimeForSesssion(index, undefined, 'inClose')}
												value={this.valueForAvailabilityScheduleForCloseHour(sessionsInSchool, index)}
												use12Hours
												format="h:mm a"
												popupClassName="timepicker"
												placeholder={intl.formatMessage(messages.to)}
											/>
										</Col>
									</Row>
									<p className='mb-10 font-700'>{intl.formatMessage(messages.afterSchoolHours)}</p>
									<Row gutter={14}>
										<Col xs={24} sm={24} md={12}>
											<TimePicker
												onSelect={v => this.onSelectTimeForSesssion(index, v, 'afterOpen')}
												onChange={v => this.onSelectTimeForSesssion(index, v, 'afterOpen')}
												onClick={(e) => (e.target.nodeName == 'path' || e.target.nodeName == 'svg') && this.onSelectTimeForSesssion(index, undefined, 'afterOpen')}
												use12Hours
												value={this.valueForAvailabilityScheduleForOpenHour(sessionsAfterSchool, index)}
												format="h:mm a"
												popupClassName="timepicker"
												placeholder={intl.formatMessage(messages.from)}
											/>
										</Col>
										<Col xs={24} sm={24} md={12}>
											<TimePicker
												onSelect={v => this.onSelectTimeForSesssion(index, v, 'afterClose')}
												onChange={v => this.onSelectTimeForSesssion(index, v, 'afterClose')}
												onClick={(e) => (e.target.nodeName == 'path' || e.target.nodeName == 'svg') && this.onSelectTimeForSesssion(index, undefined, 'afterClose')}
												use12Hours
												value={this.valueForAvailabilityScheduleForCloseHour(sessionsAfterSchool, index)}
												format="h:mm a"
												popupClassName="timepicker"
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
					</Form>
				</div>
			</Row>
		);
	}
}

const mapStateToProps = state => ({
	register: state.register
})

export default compose(connect(mapStateToProps, { setRegisterData, removeRegisterData }))(SchoolAvailability);
