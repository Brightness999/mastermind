import React from 'react';
import { Row, Col, Form, Button, Segmented, TimePicker, message } from 'antd';
import moment from 'moment';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';
import axios from 'axios';
import * as MultiDatePicker from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel"
import messages from '../../messages';
import { url } from '../../../../../utils/api/baseUrl';
import { userSignUp } from '../../../../../utils/api/apiList'
import { BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY, BASE_CALENDAR_URL, GOOGLE_CALENDAR_API_KEY, JEWISH_CALENDAR_REGION, USA_CALENDAR_REGION } from '../../../../../routes/constant';
import { setRegisterData, removeRegisterData } from '../../../../../redux/features/registerSlice';

class SchoolAvailability extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			dayIsSelected: 1,
			sessionsInSchool: [],
			sessionsAfterSchool: [],
			isSubmit: false,
		}
	}

	componentDidMount() {
		const { registerData } = this.props.register;

		this.form.setFieldsValue(registerData);
		if (!registerData.sessionsInSchool || registerData.sessionsInSchool.length == 0) {
			this.setState({
				sessionsInSchool: [this.defaultTimeRangeItem(), this.defaultTimeRangeItem(), this.defaultTimeRangeItem()],
				sessionsAfterSchool: [this.defaultTimeRangeItem(false), this.defaultTimeRangeItem(false), this.defaultTimeRangeItem(false)]
			}, this.callbackAfterSetState)
		} else {
			this.setState({
				sessionsInSchool: registerData.sessionsInSchool,
				sessionsAfterSchool: registerData.sessionsAfterSchool
			})
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
			return moment('00:00:00', 'HH:mm:ss')
		}
		return moment(`${array[index].openHour}:${array[index].openMin}:00`, 'HH:mm:ss')
	}

	valueForAvailabilityScheduleForCloseHour = (array, index) => {
		if (array.length - 1 < index) {
			return moment('00:00:00', 'HH:mm:ss')
		}
		return moment(`${array[index].closeHour}:${array[index].closeMin}:00`, 'HH:mm:ss')
	}


	onFinish = async () => {
		const { registerData } = this.props.register;
		let newRegisterData = JSON.parse(JSON.stringify(registerData));

		// update in school - after school
		newRegisterData.sessionsInSchool = this.arrDayScheduleFormat(this.state.sessionsInSchool);
		newRegisterData.sessionsAfterSchool = this.arrDayScheduleFormat(this.state.sessionsAfterSchool);

		// post to server
		this.setState({ isSubmit: true });
		axios.post(url + userSignUp, newRegisterData).then(res => {
			this.setState({ isSubmit: false });
			const { success } = res.data;
			if (success) {
				this.props.onContinue(true);
				this.props.removeRegisterData();
			}
		}).catch(error => {
			console.log('creat school error---', error);
			this.setState({ isSubmit: false });
			message.error(error?.response?.data?.data ?? error.message);
		})
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

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

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
		const hour = value ? value.hour() : 0;
		const minute = value ? value.minute() : 0;
		const { sessionsInSchool, sessionsAfterSchool } = this.state;

		switch (type) {
			case 'inOpen':
				this.setState({
					sessionsInSchool: sessionsInSchool.map((session, sessIndex) => {
						if (sessIndex == index) {
							return { ...session, openHour: hour, minute: minute }
						}
						return session;
					}),
					fromInSchool: value,
				}, this.callbackAfterSetState)
				break;
			case 'inClose':
				this.setState({
					sessionsInSchool: sessionsInSchool.map((session, sessIndex) => {
						if (sessIndex == index) {
							return {
								...session, "closeHour": hour,
								"closeMin": minute,
							}
						}
						return session;
					}),
					toInSchool: value,
				}, this.callbackAfterSetState)
				break;
			case 'afterOpen':
				this.setState({
					sessionsAfterSchool: sessionsAfterSchool.map((session, sessIndex) => {
						if (sessIndex == index) {
							return {
								...session, "openHour": hour,
								"openMin": minute,
							}
						}
						return session;
					}),
					fromAfterSchool: value,
				}, this.callbackAfterSetState)
				break;
			case 'afterClose':
				this.setState({
					sessionsAfterSchool: sessionsAfterSchool.map((session, sessIndex) => {
						if (sessIndex == index) {
							return {
								...session, "closeHour": hour,
								"closeMin": minute,
							}
						}
						return session;
					}),
					toAfterSchool: value,
				}, this.callbackAfterSetState)
				break;
			default:
				break;
		}
	}

	callbackAfterSetState = () => {
		this.setReduxForSchool('sessionsInSchool', this.state.sessionsInSchool);
		this.setReduxForSchool('sessionsAfterSchool', this.state.sessionsAfterSchool);
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
				this.setReduxForSchool('blackoutDates', uniqueDates?.map(date => date.toString()));
			})
		})
	}

	handleUpdateBlackoutDates = (dates) => {
		this.form.setFieldsValue({ blackoutDates: dates });
		this.setReduxForSchool('blackoutDates', dates?.map(date => date.toString()));
	}

	render() {
		const { dayIsSelected, sessionsInSchool, sessionsAfterSchool, isSubmit } = this.state;
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

		return (
			<Row justify="center" className="row-form">
				<div className='col-form col-school'>
					<div className='div-form-title mb-10'>
						<p className='font-30 text-center mb-0'>{intl.formatMessage(messages.schoolDetails)}</p>
					</div>
					<Form
						name="form_school"
						layout='vertical'
						onFinish={this.onFinish}
						onFinishFailed={this.onFinishFailed}
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
												use12Hours
												format="h:mm a"
												popupClassName="timepicker"
												placeholder={intl.formatMessage(messages.from)}
												value={this.valueForAvailabilityScheduleForOpenHour(sessionsInSchool, index)}
											/>
										</Col>
										<Col xs={24} sm={24} md={12}>
											<TimePicker
												onSelect={v => this.onSelectTimeForSesssion(index, v, 'inClose')}
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
								loading={isSubmit}
								disabled={isSubmit}
							>
								{intl.formatMessage(messages.submit).toUpperCase()}
							</Button>
						</Form.Item>
					</Form>
				</div>
			</Row>
		);
	}
}

const mapStateToProps = state => ({
	register: state.register,
	auth: state.auth,
})

export default compose(connect(mapStateToProps, { setRegisterData, removeRegisterData }))(SchoolAvailability);
