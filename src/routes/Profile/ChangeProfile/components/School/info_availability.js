
import React from 'react';
import { Row, Col, Form, Button, Segmented, TimePicker, message } from 'antd';
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

class InfoAvailability extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			dayIsSelected: 1,
			sessionsInSchool: [],
			sessionsAfterSchool: [],
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
					this.form?.setFieldsValue(data?.schoolInfo);
					this.form?.setFieldsValue({ blackoutDates: data?.schoolInfo?.blackoutDates?.map(date => new Date(date)) });
					this.setState({
						sessionsInSchool: data?.schoolInfo?.sessionsInSchool ?? [this.defaultTimeRangeItem(), this.defaultTimeRangeItem(), this.defaultTimeRangeItem()],
						sessionsAfterSchool: data?.schoolInfo?.sessionsAfterSchool ?? [this.defaultTimeRangeItem(false), this.defaultTimeRangeItem(false), this.defaultTimeRangeItem(false)],
					})
				}
			}).catch(err => {
				message.error(err.message);
				this.setState({ loading: false });
			})
		} else {
			request.post(getMySchoolInfo).then(result => {
				this.setState({ loading: false });
				const { success, data } = result;
				if (success) {
					this.form?.setFieldsValue(data);
					this.form?.setFieldsValue({ blackoutDates: data.blackoutDates?.map(date => new Date(date)) });
					this.setState({
						sessionsInSchool: data.sessionsInSchool ?? [this.defaultTimeRangeItem(), this.defaultTimeRangeItem(), this.defaultTimeRangeItem()],
						sessionsAfterSchool: data.sessionsAfterSchool ?? [this.defaultTimeRangeItem(false), this.defaultTimeRangeItem(false), this.defaultTimeRangeItem(false)],
					})
				}
			}).catch(err => {
				message.error(err.message);
				this.setState({ loading: false });
			})
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
			return moment('00:00:00', 'HH:mm:ss')
		}
		return moment(`${array[index].openHour}:${array[index].openMin}:00`, 'HH:mm:ss')
	}

	valueForAvailabilityScheduleForCloseHour = (array, index) => {
		if (array?.length - 1 < index) {
			return moment('00:00:00', 'HH:mm:ss')
		}
		return moment(`${array[index].closeHour}:${array[index].closeMin}:00`, 'HH:mm:ss')
	}

	onFinish = (values) => {
		const { sessionsInSchool, sessionsAfterSchool } = this.state
		const { blackoutDates } = values;
		const params = {
			sessionsAfterSchool,
			sessionsInSchool,
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
	};

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	onSelectDay = e => {
		e && this.setState({ dayIsSelected: e });
	}

	onSelectTimeForSesssion(index, value, type) {
		const hour = value.hour()
		const minute = value.minute()
		const { sessionsInSchool, sessionsAfterSchool } = this.state;

		switch (type) {
			case 'inOpen':
				this.setState({
					sessionsInSchool: sessionsInSchool.map((session, sessIndex) => {
						if (sessIndex == index) {
							return { ...session, openHour: hour, minute: minute };
						}
						return session;
					})
				})
				break;
			case 'inClose':
				this.setState({
					sessionsInSchool: sessionsInSchool.map((session, sessIndex) => {
						if (sessIndex == index) {
							return { ...session, closeHour: hour, closeMin: minute };
						}
						return session;
					})
				})
				break;
			case 'afterOpen':
				this.setState({
					sessionsAfterSchool: sessionsAfterSchool.map((session, sessIndex) => {
						if (sessIndex == index) {
							return { ...session, openHour: hour, openMin: minute };
						}
						return session;
					})
				})
				break;
			case 'afterClose':
				this.setState({
					sessionsAfterSchool: sessionsAfterSchool.map((session, sessIndex) => {
						if (sessIndex == index) {
							return { ...session, closeHour: hour, closeMin: minute };
						}
						return session;
					})
				})
				break;
			default:
				break;
		}
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
		const { sessionsAfterSchool, sessionsInSchool, dayIsSelected, loading } = this.state;
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
	auth: state.auth
})

export default compose(connect(mapStateToProps))(InfoAvailability);
