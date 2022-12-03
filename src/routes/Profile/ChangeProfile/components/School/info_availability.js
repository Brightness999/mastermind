
import React from 'react';
import { Row, Col, Form, Button, Segmented, TimePicker, message } from 'antd';
import moment from 'moment';
import intl from 'react-intl-universal';
import messages from '../../messages';
import { getMySchoolInfo, updateSchoolAvailability } from '../../../../../utils/api/apiList'
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import { connect } from 'react-redux';
import { compose } from 'redux';
import request from '../../../../../utils/api/request';

class InfoAvailability extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			dayIsSelected: 1,
			sessionsInSchool: [],
			sessionsAfterSchool: [],
		}
	}

	componentDidMount() {
		request.post(getMySchoolInfo).then(result => {
			const { success, data } = result;
			if (success) {
				this.form.setFieldsValue(data)
				this.setState({
					sessionsInSchool: data.sessionsInSchool,
					sessionsAfterSchool: data.sessionsAfterSchool,
				})
			}
		})
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

	onFinish = () => {
		const { sessionsInSchool, sessionsAfterSchool } = this.state

		request.post(updateSchoolAvailability, { sessionsAfterSchool, sessionsInSchool }).then(res => {
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
		if (e) {
			this.setState({ dayIsSelected: e });
		}
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

	render() {
		const { sessionsAfterSchool, sessionsInSchool, dayIsSelected } = this.state;
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
												onChange={v => this.onSelectTimeForSesssion(index, v, 'afterOpen')}
												use12Hours
												format="h:mm a"
												value={this.valueForAvailabilityScheduleForOpenHour(sessionsAfterSchool, index)}
												placeholder={intl.formatMessage(messages.from)}
											/>
										</Col>
										<Col xs={24} sm={24} md={12}>
											<TimePicker
												onChange={v => this.onSelectTimeForSesssion(index, v, 'afterClose')}
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
			</Row>
		);
	}
}

const mapStateToProps = state => {
	return {
		register: state.register,
		auth: state.auth
	}
}

export default compose(connect(mapStateToProps, { setRegisterData }))(InfoAvailability);
