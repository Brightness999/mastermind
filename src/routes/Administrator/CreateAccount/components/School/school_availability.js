import React from 'react';
import { Row, Col, Form, Button, Segmented, TimePicker, message } from 'antd';
import moment from 'moment';
import intl from 'react-intl-universal';
import messages from '../../messages';
import axios from 'axios';
import { url } from '../../../../../utils/api/baseUrl';
import { userSignUp } from '../../../../../utils/api/apiList'
import { setRegisterData, removeRegisterData } from '../../../../../redux/features/registerSlice';
import { connect } from 'react-redux';
import { compose } from 'redux';

class SchoolAvailability extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			dayIsSelected: 1,
			sessionsInSchool: [],
			sessionsAfterSchool: [],
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
		axios.post(url + userSignUp, newRegisterData).then(res => {
			const { success } = res.data;
			if (success) {
				this.props.onContinue(true);
				this.props.removeRegisterData();
			}
		}).catch(error => {
			console.log('creat school error---', error);
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

		switch (type) {
			case 'inOpen':
				this.setState({
					sessionsInSchool: this.state.sessionsInSchool.map((session, sessIndex) => {
						if (sessIndex == index) {
							return { ...session, openHour: hour, minute: minute }
						}
						return session;
					}),
					fromInSchool: value,
				},
					this.callbackAfterSetState)
				break;
			case 'inClose':
				this.setState({
					sessionsInSchool: this.state.sessionsInSchool.map((session, sessIndex) => {
						if (sessIndex == index) {
							return {
								...session, "closeHour": hour,
								"closeMin": minute,
							}
						}
						return session;
					}),
					toInSchool: value,
				},
					this.callbackAfterSetState)
				break;
			case 'afterOpen':
				this.setState({
					sessionsAfterSchool: this.state.sessionsAfterSchool.map((session, sessIndex) => {
						if (sessIndex == index) {
							return {
								...session, "openHour": hour,
								"openMin": minute,
							}
						}
						return session;
					}),
					fromAfterSchool: value,
				},
					this.callbackAfterSetState)
				break;
			case 'afterClose':
				this.setState({
					sessionsAfterSchool: this.state.sessionsAfterSchool.map((session, sessIndex) => {
						if (sessIndex == index) {
							return {
								...session, "closeHour": hour,
								"closeMin": minute,
							}
						}
						return session;
					}),
					toAfterSchool: value,
				},
					this.callbackAfterSetState)
				break;
			default:
				break;
		}
	}

	callbackAfterSetState = () => {
		this.setReduxForSchool('sessionsInSchool', this.state.sessionsInSchool);
		this.setReduxForSchool('sessionsAfterSchool', this.state.sessionsAfterSchool);
	}

	render() {
		const { dayIsSelected, sessionsInSchool, sessionsAfterSchool } = this.state;
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
												onChange={v => this.onSelectTimeForSesssion(index, v, 'inOpen')}
												use12Hours
												format="h:mm a"
												placeholder={intl.formatMessage(messages.from)}
												value={this.valueForAvailabilityScheduleForOpenHour(sessionsInSchool, index)}
											/>
										</Col>
										<Col xs={24} sm={24} md={12}>
											<TimePicker
												onChange={v => this.onSelectTimeForSesssion(index, v, 'inClose')}
												value={this.valueForAvailabilityScheduleForCloseHour(sessionsInSchool, index)}
												use12Hours
												format="h:mm a"
												placeholder={intl.formatMessage(messages.to)}
											/>
										</Col>
									</Row>
									<p className='mb-10 font-700'>{intl.formatMessage(messages.afterSchoolHours)}</p>
									<Row gutter={14}>
										<Col xs={24} sm={24} md={12}>
											<TimePicker
												onChange={v => this.onSelectTimeForSesssion(index, v, 'afterOpen')} use12Hours
												value={this.valueForAvailabilityScheduleForOpenHour(sessionsAfterSchool, index)}
												format="h:mm a" placeholder={intl.formatMessage(messages.from)}
											/>
										</Col>
										<Col xs={24} sm={24} md={12}>
											<TimePicker
												onChange={v => this.onSelectTimeForSesssion(index, v, 'afterClose')} use12Hours
												value={this.valueForAvailabilityScheduleForCloseHour(sessionsAfterSchool, index)}
												format="h:mm a" placeholder={intl.formatMessage(messages.to)}
											/>
										</Col>
									</Row>
								</div>
							))}
						</div>
						<Form.Item className="form-btn continue-btn" >
							<Button
								block
								type="primary"
								htmlType="submit"
							>
								{intl.formatMessage(messages.confirm).toUpperCase()}
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
