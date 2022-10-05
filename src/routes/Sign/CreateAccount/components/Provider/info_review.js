import React, { Component } from 'react';
import { Row, Col, Button, message } from 'antd';
import intl from 'react-intl-universal';
import messages from '../../messages';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import { url } from '../../../../../utils/api/baseUrl';
import axios from 'axios'

const day_week = [
	intl.formatMessage(messages.sunday),
	intl.formatMessage(messages.monday),
	intl.formatMessage(messages.tuesday),
	intl.formatMessage(messages.wednesday),
	intl.formatMessage(messages.thursday),
	intl.formatMessage(messages.friday),
]

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
				if (scheduleItem.from_time && scheduleItem.to_time && scheduleItem.from_date && scheduleItem.to_date && scheduleItem.location) {
					manualSchedule.push({
						"location": scheduleItem.location,
						"dayInWeek": i,
						"fromYear": scheduleItem.from_date.year(),
						"fromMonth": scheduleItem.from_date.month(),
						"fromDate": scheduleItem.from_date.date(),
						"toYear": scheduleItem.to_date.year(),
						"toMonth": scheduleItem.to_date.month(),
						"toDate": scheduleItem.to_date.date(),
						"openHour": scheduleItem.from_time.hour(),
						"openMin": scheduleItem.from_time.minutes(),
						"closeHour": scheduleItem.to_time.hour(),
						"closeMin": scheduleItem.to_time.minutes()
					})
				}
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

	displayHourMin(value) {
		return value > 9 ? value : ('0' + value)
	}

	render() {
		const { registerData } = this.props.register;
		console.log(registerData)
		const { listSchools, CityConnections } = this.state;

		return (
			<Row justify="center" className="row-form">
				<Row justify="center" className="row-form">
					<div className='col-form col-info-review'>
						<div className='div-form-title'>
							<p className='font-26'>{intl.formatMessage(messages.reviewAccountInfo)}</p>
						</div>
						<Row gutter={14}>
							<Col xs={24} sm={24} md={8}>
								<div>
									<p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.usernameEmail)}</p>
									<div><span className='font-700'>Username:</span> {registerData?.username}</div>
									<div><span className='font-700'>Email:</span> {registerData?.email}</div>
								</div>
								<div>
									<p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.providerInfo)}</p>
									<div><span className='font-700'>Legal Name:</span> {registerData?.profileInfor?.name}</div>
									<div><span className='font-700'>Referred to As:</span> {registerData?.profileInfor?.referredToAs}</div>
									<div><span className='font-700'>Service Address:</span> {registerData?.profileInfor?.serviceAddress}</div>
									<div><span className='font-700'>Billing Address:</span> {registerData?.profileInfor?.billingAddress}</div>
									<div><span className='font-700'>City Connection:</span> {CityConnections?.find(a => a._id == registerData?.profileInfor?.cityConnection)?.name}</div>
									<div><span className='font-700'>License Number:</span> {registerData?.profileInfor?.licenseNumber}</div>
									<div><span className='font-700'>Agency:</span> {registerData?.profileInfor?.agency}</div>
									<div className='mb-10'>
										<div className='font-700'>Contact Number:</div>
										{registerData?.profileInfor?.contactNumber.map((number, index) => (
											<div key={index} className='review-item'>
												<span>{number.phoneNumber}</span>
												<span>{number.type}</span>
											</div>
										))}
									</div>
									<div className='mb-10'>
										<div className='font-700'>Contact Email:</div>
										{registerData?.profileInfor?.contactEmail.map((email, index) => (
											<div key={index} className='review-item'>
												<span>{email.email}</span>
												<span>{email.type}</span>
											</div>
										))}
									</div>
									<div className='mb-10'>
										<div className='font-700'>Professional Experience:</div>
										<div>{registerData?.profileInfor?.proExp}</div>
									</div>
								</div>
							</Col>
							<Col xs={24} sm={24} md={8}>
								<div>
									<p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.servicesOffered)}</p>
									<div><span className='font-700'>Skillset:</span> {registerData?.serviceInfor?.skillSet}</div>
									<div className='review-item'>
										<div><span className='font-700'>Years of Experience:</span> {registerData?.serviceInfor?.yearExp}</div>
										<div><span className='font-700'>SSN:</span> {registerData?.serviceInfor?.SSN}</div>
									</div>
									<div className='mb-10'>
										<div className='font-700'>Serviceable Schools:</div>
										{registerData?.serviceInfor?.serviceableSchool.map((school, index) => (
											<div key={index}>{listSchools?.find(s => s._id == school)?.name}</div>
										))}
									</div>
									<div className='mb-10'>
										<div className='review-item'>
											<div className='font-700'>Academic Level</div>
											<div className='font-700'>Rate</div>
										</div>
										{registerData?.serviceInfor?.academicLevel.map((academic, index) => (
											<div key={index} className='review-item'>
												<div>{academic.level}</div>
												<div>{academic.rate}</div>
											</div>
										))}
									</div>
									<p><span className='font-700'>Reference:</span> {registerData?.serviceInfor?.references}</p>
									<div className='mb-10'>
										<div className='font-700'>Public profile:</div>
										<div>{registerData?.serviceInfor?.publicProfile}</div>
									</div>
								</div>
								<div>
									<p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.availability)}</p>
									<div className='item-flex'>
										<p className='font-14 font-700 mb-5'>{intl.formatMessage(messages.sunday)}</p>
										{registerData?.availability?.Sunday?.map((data, index) => {
											return (data.from_date && data.to_date && data.from_time && data.to_time && data.location) ? (
												<>
													<div key={index} className='flex'>
														<div>{`${this.displayHourMin(data.from_date.month() + 1)}/${this.displayHourMin(data.from_date.date())}/${data.from_date.year()}`} - {`${this.displayHourMin(data.to_date.month() + 1)}/${this.displayHourMin(data.to_date.date())}/${data.to_date.year()}`}</div>
														<div className='ml-20'>{`${this.displayHourMin(data.from_time.hour())}:${this.displayHourMin(data.from_time.minute())}`} - {`${this.displayHourMin(data.to_time.hour())}:${this.displayHourMin(data.to_time.minute())}`}</div>
													</div>
													<div>{data.location}</div>
												</>
											) : null
										})}
									</div>
									<div className='item-flex'>
										<p className='font-14 font-700 mb-5'>{intl.formatMessage(messages.monday)}</p>
										{registerData?.availability?.Moday?.map((data, index) => {
											return (data.from_date && data.to_date && data.from_time && data.to_time && data.location) ? (
												<div key={index} className='flex'>
													<div>{`${this.displayHourMin(data.from_date.month() + 1)}/${this.displayHourMin(data.from_date.date())}/${data.from_date.year()}`} - {`${this.displayHourMin(data.to_date.month() + 1)}/${this.displayHourMin(data.to_date.date())}/${data.to_date.year()}`}</div>
													<div className='ml-20'>{`${this.displayHourMin(data.from_time.hour())}:${this.displayHourMin(data.from_time.minute())}`} - {`${this.displayHourMin(data.to_time.hour())}:${this.displayHourMin(data.to_time.minute())}`}</div>
												</div>
											) : null
										})}
									</div>
									<div className='item-flex'>
										<p className='font-14 font-700 mb-5'>{intl.formatMessage(messages.tuesday)}</p>
										{registerData?.availability?.Tuesday?.map((data, index) => {
											return (data.from_date && data.to_date && data.from_time && data.to_time && data.location) ? (
												<>
													<div key={index} className='flex'>
														<div>{`${this.displayHourMin(data.from_date.month() + 1)}/${this.displayHourMin(data.from_date.date())}/${data.from_date.year()}`} - {`${this.displayHourMin(data.to_date.month() + 1)}/${this.displayHourMin(data.to_date.date())}/${data.to_date.year()}`}</div>
														<div className='ml-20'>{`${this.displayHourMin(data.from_time.hour())}:${this.displayHourMin(data.from_time.minute())}`} - {`${this.displayHourMin(data.to_time.hour())}:${this.displayHourMin(data.to_time.minute())}`}</div>
													</div>
													<div>{data.location}</div>
												</>
											) : null
										})}
									</div>
									<div className='item-flex'>
										<p className='font-14 font-700 mb-5'>{intl.formatMessage(messages.wednesday)}</p>
										{registerData?.availability?.Wednesday?.map((data, index) => {
											return (data.from_date && data.to_date && data.from_time && data.to_time && data.location) ? (
												<>
													<div key={index} className='flex'>
														<div>{`${this.displayHourMin(data.from_date.month() + 1)}/${this.displayHourMin(data.from_date.date())}/${data.from_date.year()}`} - {`${this.displayHourMin(data.to_date.month() + 1)}/${this.displayHourMin(data.to_date.date())}/${data.to_date.year()}`}</div>
														<div className='ml-20'>{`${this.displayHourMin(data.from_time.hour())}:${this.displayHourMin(data.from_time.minute())}`} - {`${this.displayHourMin(data.to_time.hour())}:${this.displayHourMin(data.to_time.minute())}`}</div>
													</div>
													<div>{data.location}</div>
												</>
											) : null
										})}
									</div>
									<div className='item-flex'>
										<p className='font-14 font-700 mb-5'>{intl.formatMessage(messages.thursday)}</p>
										{registerData?.availability?.Thursday?.map((data, index) => {
											return (data.from_date && data.to_date && data.from_time && data.to_time && data.location) ? (
												<>
													<div key={index} className='flex'>
														<div>{`${this.displayHourMin(data.from_date.month() + 1)}/${this.displayHourMin(data.from_date.date())}/${data.from_date.year()}`} - {`${this.displayHourMin(data.to_date.month() + 1)}/${this.displayHourMin(data.to_date.date())}/${data.to_date.year()}`}</div>
														<div className='ml-20'>{`${this.displayHourMin(data.from_time.hour())}:${this.displayHourMin(data.from_time.minute())}`} - {`${this.displayHourMin(data.to_time.hour())}:${this.displayHourMin(data.to_time.minute())}`}</div>
													</div>
													<div>{data.location}</div>
												</>
											) : null
										})}
									</div>
									<div className='item-flex'>
										<p className='font-14 font-700 mb-5'>{intl.formatMessage(messages.friday)}</p>
										{registerData?.availability?.Friday?.map((data, index) => {
											return (data.from_date && data.to_date && data.from_time && data.to_time && data.location) ? (
												<>
													<div key={index} className='flex'>
														<div>{`${this.displayHourMin(data.from_date.month() + 1)}/${this.displayHourMin(data.from_date.date())}/${data.from_date.year()}`} - {`${this.displayHourMin(data.to_date.month() + 1)}/${this.displayHourMin(data.to_date.date())}/${data.to_date.year()}`}</div>
														<div className='ml-20'>{`${this.displayHourMin(data.from_time.hour())}:${this.displayHourMin(data.from_time.minute())}`} - {`${this.displayHourMin(data.to_time.hour())}:${this.displayHourMin(data.to_time.minute())}`}</div>
													</div>
													<div>{data.location}</div>
												</>
											) : null
										})}
									</div>
								</div>
							</Col>
							<Col xs={24} sm={24} md={8}>
								<div>
									<p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.subsidyProgram)}</p>
									<div><span className='font-700'>{intl.formatMessage(messages.numberSessionsWeek)}:</span> {registerData?.subsidy?.numberSessions}</div>
									<div className='mb-10'>
										<div className='font-700'>Reduced Academic Levels:</div>
										{registerData?.subsidy?.reduceWithAcademic?.map((academic, index) => (
											<div key={index} className='review-item-3'>
												<div>Level: {academic.level}</div>
												<div>Rate: {academic.rate}</div>
												<div>Reduced: {academic.reduced}</div>
											</div>
										))}
									</div>
									<div className='mb-10'>
										<div className='font-700'>Private Calendars:</div>
										{registerData?.subsidy?.privateCalendars?.map((date, index) => (
											<div key={index} className='flex'>
												<div>{`${this.displayHourMin(new Date(date.day)?.getMonth() + 1)}/${this.displayHourMin(new Date(date.day)?.getDate())}/${new Date(date.day)?.getFullYear()}`}</div>
												<div className='ml-20'>
													{date.availableHours.map((time, index) => (
														<div key={index}>{`${this.displayHourMin(new Date(time)?.getHours())}:${this.displayHourMin(new Date(time)?.getMinutes())}`}</div>
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
								onClick={this.onFinish}
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