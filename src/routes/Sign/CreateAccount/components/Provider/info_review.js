import React, { Component } from 'react';
import { Row, Col, Button, message } from 'antd';
import intl from 'react-intl-universal';
import messages from '../../messages';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import { url } from '../../../../../utils/api/baseUrl';
import axios from 'axios'

class InfoReview extends Component {
	constructor(props) {
		super(props);
		this.state = {
			SkillSet: [],
			AcademicLevel: [],
			ServiceableSchools: [],
			ScreenTime: [],
			CityConnections: [],
			listSchools: [],
		}
	}

	componentDidMount() {
		this.searchCityConnection();
		this.loadSchools();
	}

	searchCityConnection() {
		axios.post(url + 'providers/get_city_connections'
		).then(result => {
			if (result.data.success) {
				var data = result.data.data;
				this.setState({ CityConnections: data.docs })
			} else {
				this.setState({
					CityConnections: [],
				});
			}
		}).catch(err => {
			console.log(err);
			this.setState({
				CityConnections: [],
			});
		})
	}

	loadSchools() {
		axios.post(url + 'clients/get_all_schools'
		).then(result => {
			if (result.data.success) {
				var data = result.data.data;
				this.setState({ listSchools: data })
			}
		}).catch(err => {
			console.log(err);
		})
	}

	onFinish = async (values) => {
		const { registerData } = this.props.register;
		var postData = this.copyField(registerData);
		const response = await axios.post(url + 'users/signup', postData);
		const { success } = response.data;
		if (success) {
			this.props.onContinue(true);
		} else {
			message.error(error?.response?.data?.data ?? error.message);
		}
	};

	copyField = (registerData) => {
		var arr = ["email", "role", "isAcceptProBono", "isAcceptReduceRate", "isWillingOpenPrivate", "password", "username"];
		var availability = this.validAvaiability(registerData.availability);
		var obj = { ...registerData.profileInfor, ...registerData.subsidy, ...registerData.serviceInfor, ...availability };
		for (var i = 0; i < arr.length; i++) {
			obj["" + arr[i]] = registerData["" + arr[i]];
		}
		obj.W9FormPath = registerData.uploaded_path;
		return obj;
	}

	validAvaiability = (availability) => {
		var manualSchedule = [];
		for (var i = 0; i < day_week.length; i++) {
			for (var j = 0; j < availability['' + day_week[i]].length; j++) {
				var scheduleItem = availability['' + day_week[i]][j];
				manualSchedule.push({
					"location": scheduleItem.location,
					"dayInWeek": i,
					"openHour": scheduleItem.from_time.hour(),
					"openMin": scheduleItem.from_time.minutes(),
					"closeHour": scheduleItem.to_time.hour(),
					"closeMin": scheduleItem.to_time.minutes()
				})
			}
		}
		return {
			cancellationFee: availability.cancellation_fee,
			cancellationWindow: availability.cancellation_window,
			manualSchedule: manualSchedule
		}
	}

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	render() {
		const { registerData } = this.props.register;

		return (
			<Row justify="center" className="row-form">
				<Row justify="center" className="row-form">
					<div className='col-form col-info-review'>
						<div className='div-form-title'>
							<p className='font-26'>{intl.formatMessage(messages.reviewAccountInfo)}</p>
						</div>
						<Row gutter={14}>
							<Col xs={24} sm={24} md={6}>
								<div>
									<p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.usernameEmail)}</p>
									<p>Username: {registerData?.username}</p>
									<p>Email: {registerData?.email}</p>
								</div>
								<div>
									<p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.providerInfo)}</p>
									<p>Legal Name: {registerData?.profileInfor?.name}</p>
									<p>Referred to As: {registerData?.profileInfor?.referredToAs}</p>
									<p>Service Address: {registerData?.profileInfor?.serviceAddress}</p>
									<p>Billing Address: {registerData?.profileInfor?.billingAddress}</p>
									<p>City Connection: {registerData?.profileInfor?.cityConnection}</p>
									<p>License Number: {registerData?.profileInfor?.licenseNumber}</p>
									<p>Agency: {registerData?.profileInfor?.agency}</p>
									<div className='mb-10'>
										<div>Contact Number:</div>
										{registerData?.profileInfor?.contactNumber.map((number, index) => (
											<div key={index} className='flex gap-10'>
												<span>{number.phoneNumber}</span>
												<span>{number.type}</span>
											</div>
										))}
									</div>
									<div className='mb-10'>
										<div>Contact Email:</div>
										{registerData?.profileInfor?.contactEmail.map((email, index) => (
											<div key={index} className='flex gap-10'>
												<span>{email.email}</span>
												<span>{email.type}</span>
											</div>
										))}
									</div>
									<div className='mb-10'>
										<div>Professional Experience</div>
										<div>{registerData?.profileInfor.proExp}</div>
									</div>
								</div>
							</Col>
							<Col xs={24} sm={24} md={9}>
								<div>
									<p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.servicesOffered)}</p>
									<p>Skillset: {registerData?.serviceInfor?.skillSet}</p>
									<div className='review-item'>
										<p>Years of Experience: {registerData?.serviceInfor?.yearExp}</p>
										<p>SSN: {registerData?.serviceInfor?.SSN}</p>
									</div>
									<div className='mb-10'>
										<div>Serviceable Schools:</div>
										{registerData?.serviceInfor?.serviceableSchool.map((school, index) => (
											<div key={index}>{school}</div>
										))}
									</div>
									<div className='mb-10'>
										<div className='review-item'>
											<div>Academic Level</div>
											<div>Rate</div>
										</div>
										{registerData?.serviceInfor?.academicLevel.map((academic, index) => (
											<div key={index} className='review-item'>
												<p>{academic.level}</p>
												<p>{academic.rate}</p>
											</div>
										))}
									</div>
									<p>Reference: {registerData?.serviceInfor?.references}</p>
									<div className='mb-10'>
										<div>Public profile:</div>
										<div>{registerData?.serviceInfor?.publicProfile}</div>
									</div>
								</div>
								<div>
									<p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.availability)}</p>
									<div className='review-item-flex'>
										<div className='item-flex'>
											<p className='font-14 font-700 mb-10'>{intl.formatMessage(messages.sunday)}</p>
											{registerData?.availability.Sunday.map((data, index) => (
												<div key={index} className='review-item'>
													<div>{`${data.from_date.month()}/${data.from_date.date()}/${data.from_date.year()}`} - {`${data.to_date.month()}/${data.to_date.date()}/${data.to_date.year()}`}</div>
													<div>{`${data.from_time.hour()}/${data.from_time.minute()}`} - {`${data.to_time.hour()}/${data.to_time.minute()}`}</div>
												</div>
											))}
										</div>
										<div className='item-flex'>
											<p className='font-14 font-700 mb-10'>{intl.formatMessage(messages.monday)}</p>
											{registerData?.availability.Monday.map((data, index) => (
												<div key={index} className='review-item'>
													<div>{`${data.from_date.month()}/${data.from_date.date()}/${data.from_date.year()}`} - {`${data.to_date.month()}/${data.to_date.date()}/${data.to_date.year()}`}</div>
													<div>{`${data.from_time.hour()}/${data.from_time.minute()}`} - {`${data.to_time.hour()}/${data.to_time.minute()}`}</div>
												</div>
											))}
										</div>
										<div className='item-flex'>
											<p className='font-14 font-700 mb-10'>{intl.formatMessage(messages.tuesday)}</p>
											{registerData?.availability.Tuesday.map((data, index) => (
												<div key={index} className='review-item'>
													<div>{`${data.from_date.month()}/${data.from_date.date()}/${data.from_date.year()}`} - {`${data.to_date.month()}/${data.to_date.date()}/${data.to_date.year()}`}</div>
													<div>{`${data.from_time.hour()}/${data.from_time.minute()}`} - {`${data.to_time.hour()}/${data.to_time.minute()}`}</div>
												</div>
											))}
										</div>
										<div className='item-flex'>
											<p className='font-14 font-700 mb-10'>{intl.formatMessage(messages.wednesday)}</p>
											{registerData?.availability.Wednesday.map((data, index) => (
												<div key={index} className='review-item'>
													<div>{`${data.from_date.month()}/${data.from_date.date()}/${data.from_date.year()}`} - {`${data.to_date.month()}/${data.to_date.date()}/${data.to_date.year()}`}</div>
													<div>{`${data.from_time.hour()}/${data.from_time.minute()}`} - {`${data.to_time.hour()}/${data.to_time.minute()}`}</div>
												</div>
											))}
										</div>
										<div className='item-flex'>
											<p className='font-14 font-700 mb-10'>{intl.formatMessage(messages.thursday)}</p>
											{registerData?.availability.Thursday.map((data, index) => (
												<div key={index} className='review-item'>
													<div>{`${data.from_date.month()}/${data.from_date.date()}/${data.from_date.year()}`} - {`${data.to_date.month()}/${data.to_date.date()}/${data.to_date.year()}`}</div>
													<div>{`${data.from_time.hour()}/${data.from_time.minute()}`} - {`${data.to_time.hour()}/${data.to_time.minute()}`}</div>
												</div>
											))}
										</div>
										<div className='item-flex'>
											<p className='font-14 font-700 mb-10'>{intl.formatMessage(messages.friday)}</p>
											{registerData?.availability.Friday.map((data, index) => (
												<div key={index} className='review-item'>
													<div>{`${data.from_date.month()}/${data.from_date.date()}/${data.from_date.year()}`} - {`${data.to_date.month()}/${data.to_date.date()}/${data.to_date.year()}`}</div>
													<div>{`${data.from_time.hour()}/${data.from_time.minute()}`} - {`${data.to_time.hour()}/${data.to_time.minute()}`}</div>
												</div>
											))}
										</div>
									</div>
								</div>
							</Col>
							<Col xs={24} sm={24} md={9}>
								<div>
									<p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.subsidyProgram)}</p>
									<p>{intl.formatMessage(messages.numberSessionsWeek)}: {registerData?.subsidy.numberSessions}</p>
									<div className='mb-10'>
										<div>Reduced Academic Levels:</div>
										{registerData?.subsidy.reduceWithAcademic?.map((academic, index) => (
											<div key={index} className='flex'>
												<div>Level: {academic.level}</div>
												<div>Rate: {academic.rate}</div>
												<div>Reduced: {academic.reduced}</div>
											</div>
										))}
									</div>
									<div className='mb-10'>
										<div>Private Calendars:</div>
										{registerData.subsidy.privateCalendars?.map((date, index) => (
											<div key={index} className='flex'>
												<div>{date.day}</div>
												<div>
													{date.availableHours.map((hour, index) => (
														<div key={index}>{hour}</div>
													))}
												</div>
											</div>
										))}
									</div>
								</div>
							</Col>
						</Row>
						<div className="form-btn continue-btn" >
							<Button
								block
								type="primary"
								htmlType="submit"
							>
								{intl.formatMessage(messages.confirm).toUpperCase()}
							</Button>
						</div>
					</div>
				</Row>
			</Row>
		);
	}
}
const mapStateToProps = state => ({
	register: state.register,
})

export default compose(connect(mapStateToProps, { setRegisterData }))(InfoReview);