import React, { Component } from 'react';
import { Row, Col, Button, message } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux'
import { compose } from 'redux'

import messages from '../../messages';
import { setRegisterData, removeRegisterData } from '../../../../../redux/features/registerSlice';
import { userSignUp } from '../../../../../utils/api/apiList';
import request from '../../../../../utils/api/request';

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
			cityConnections: this.props.auth.generalData?.cityConnections,
			isSubmit: false,
		}
	}

	componentDidMount() {
		if (window.location.pathname.includes('administrator')) {
			this.setState({ cityConnections: this.props.auth.user?.adminCommunity });
		}
	}

	onSubmit = async () => {
		const { registerData } = this.props.register;
		const postData = this.copyField(registerData);
		this.setState({ isSubmit: true });
		const response = await request.post(userSignUp, postData);
		this.setState({ isSubmit: false });
		const { success } = response;
		if (success) {
			this.props.removeRegisterData();
			this.props.onContinue(true);
		} else {
			message.error(error?.response?.data?.data ?? error.message);
		}
	};

	copyField = (registerData) => {
		const arr = ["email", "role", "isAcceptProBono", "isAcceptReduceRate", "isWillingOpenPrivate", "password", "username"];
		const availability = this.validAvaiability(registerData.availability);
		let obj = { ...registerData.profileInfor, ...registerData.subsidy, ...registerData.serviceInfor, ...registerData.financialInfor, ...registerData.scheduling, ...availability };
		for (let i = 0; i < arr?.length; i++) {
			obj["" + arr[i]] = registerData["" + arr[i]];
		}
		obj.W9FormPath = registerData.uploaded_path;
		return obj;
	}

	validAvaiability = (availability) => {
		const { registerData } = this.props.register;
		let manualSchedule = [];
		for (let i = 0; i < day_week?.length; i++) {
			for (let j = 0; j < availability['' + day_week[i]]?.length; j++) {
				const scheduleItem = availability['' + day_week[i]][j];
				if (scheduleItem.from_time && scheduleItem.to_time && scheduleItem.location) {
					manualSchedule.push({
						isPrivate: registerData?.profileInfor?.isPrivateForHmgh ? true : scheduleItem.isPrivate ?? false,
						location: scheduleItem.location,
						dayInWeek: i,
						fromYear: scheduleItem.from_date?.year() ?? 1,
						fromMonth: scheduleItem.from_date?.month() ?? 0,
						fromDate: scheduleItem.from_date?.date() ?? 1,
						toYear: scheduleItem.to_date?.year() ?? 10000,
						toMonth: scheduleItem.to_date?.month() ?? 0,
						toDate: scheduleItem.to_date?.date() ?? 0,
						openHour: scheduleItem.from_time.hour(),
						openMin: scheduleItem.from_time.minutes(),
						closeHour: scheduleItem.to_time.hour(),
						closeMin: scheduleItem.to_time.minutes()
					})
				}
			}
		}
		return {
			manualSchedule: manualSchedule,
			serviceableSchool: availability.serviceableSchool,
			isHomeVisit: availability.isHomeVisit,
			privateOffice: availability.isPrivateOffice,
			isLegalHolidays: availability.isLegalHolidays,
			isJewishHolidays: availability.isJewishHolidays,
			isSchools: availability.isSchools,
			blackoutDates: availability.blackoutDates?.map(date => date.toString()),
		}
	}

	displayHourMin(value) {
		return value > 9 ? value : `0${value}`;
	}

	render() {
		const { registerData, isSubmit } = this.props.register;
		const { cityConnections } = this.state;
		const { schools, skillSets } = this.props.auth.generalData;
		const listSchools = schools?.filter(school => school.communityServed?._id === registerData.profileInfor?.cityConnection);

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
								<div className='mt-10'>
									<p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.generalInformation)}</p>
									<div><span className='font-700'>Name: </span>{registerData?.profileInfor?.firstName} {registerData?.profileInfor?.lastName}</div>
									<div><span className='font-700'>City Connection: </span>{cityConnections?.find(a => a._id == registerData?.profileInfor?.cityConnection)?.name}</div>
									<div><span className='font-700'>Service Address: </span>{registerData?.profileInfor?.serviceAddress}</div>
									<div><span className='font-700'>Agency: </span> {registerData?.profileInfor?.agency ?? ''}</div>
									<div className='mb-10'>
										<div className='font-700'>Contact Number:</div>
										{registerData?.profileInfor?.contactNumber?.map((number, index) => (
											<div key={index}>{number.phoneNumber} {number.type}</div>
										))}
									</div>
									<div className='mb-10'>
										<div className='font-700'>Contact Email:</div>
										{registerData?.profileInfor?.contactEmail?.map((email, index) => (
											<div key={index}>{email.email} {email.type}</div>
										))}
									</div>
								</div>
								<div className='mt-10'>
									<p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.professionalInformation)}</p>
									<div className='flex gap-2'><span className='font-700'>Service:</span><div>{registerData?.serviceInfor?.skillSet?.map(id => skillSets?.find(skill => skill._id == id)?.name)}</div></div>
									<div><span className='font-700'>Years of Experience:</span> {registerData?.serviceInfor?.yearExp}</div>
									<div className='mb-10'>
										<div className='font-700'>Public profile:</div>
										<div>{registerData?.serviceInfor?.publicProfile}</div>
									</div>
									<div className='flex gap-1'>
										<div className='font-700'>Reference:</div>
										<div>
											{registerData?.serviceInfor?.references?.map((data, index) => (<div key={index}>{data.name}</div>))}
										</div>
									</div>
								</div>
							</Col>
							<Col xs={24} sm={24} md={8}>
								<div className='mt-10'>
									<p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.scheduling)}</p>
									<div><span className='font-700'>Standard duration: </span>{registerData?.scheduling?.duration}min</div>
									<div><span className='font-700'>New client screening: </span>{registerData?.scheduling?.isNewClientScreening}</div>
									{registerData?.scheduling?.isSeparateEvaluationRate ? <div><span className='font-700'>Evaluation duration: </span>{registerData?.scheduling?.separateEvaluationDuration}min</div> : null}
									<div><span className='font-700'>CancellationWindow: </span>{registerData?.scheduling?.cancellationWindow}</div>
								</div>
								<div className='mt-10'>
									<p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.billingDetails)}</p>
									<div><span className='font-700'>Legal Name:</span> {registerData?.financialInfor?.legalName}</div>
									<div><span className='font-700'>Billing Address:</span> {registerData?.financialInfor?.billingAddress}</div>
									<div><span className='font-700'>License Number:</span> {registerData?.financialInfor?.licenseNumber ?? ''}</div>
									<div><span className='font-700'>SSN:</span> {registerData?.financialInfor?.SSN ?? ''}</div>
									<div><span className='font-700'>Academic Level's Rate:</span></div>
									<div className='mb-10'>
										<div className='flex'>
											<div className='font-700 flex-1'>Level</div>
											<div className='font-700 flex-1'>Standard Rate</div>
											{registerData?.subsidy?.isAcceptReduceRate ? <div className='font-700 flex-1'>Subsidized Rate</div> : null}
										</div>
										{registerData?.financialInfor?.academicLevel?.map((academic, index) => (
											<div key={index} className='flex'>
												<div className='flex-1'>{academic.level}</div>
												<div className='flex-1'>${academic.rate}</div>
												{registerData?.subsidy?.isAcceptReduceRate ? <div className='flex-1'>${academic.subsidizedRate}</div> : null}
											</div>
										))}
									</div>
									{registerData?.scheduling?.isSeparateEvaluationRate ? <div className='mb-10'><span className='font-700'>Evaluation Rate:</span> ${registerData?.financialInfor?.separateEvaluationRate ?? ''}</div> : null}
								</div>
								<div className='mt-10'>
									<p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.subsidyProgram)}</p>
									{registerData?.subsidy?.isAcceptProBono ? <div><span className='font-700'>{intl.formatMessage(messages.numberSessionsWeek)}:</span> {registerData?.subsidy?.proBonoNumber}</div> : null}
									<div><span className='font-700'>Private slots for HMGH:</span> {registerData?.subsidy?.isWillingOpenPrivate ? 'Yes' : 'No'}</div>
								</div>
							</Col>
							<Col xs={24} sm={24} md={8}>
								<div className='mt-10'>
									<p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.availability)}</p>
									<div className='mb-10'>
										<div className='font-700'>Serviceable Schools:</div>
										{registerData?.availability?.serviceableSchool?.map((school, index) => (
											<div key={index}>{listSchools?.find(s => s._id == school)?.name}</div>
										))}
									</div>
									<div className='item-flex'>
										<p className='font-14 font-700 mb-5'>{intl.formatMessage(messages.sunday)}</p>
										{registerData?.availability?.Sunday?.map((data, index) => {
											return (data.from_time && data.to_time && data.location) ? (
												<React.Fragment key={index}>
													<div className='flex gap-5'>
														{(data.from_date || data.to_date) ? <div>{`${data.from_date ? data.from_date?.format('MM/DD/YYYY') : ''}`} - {`${data.to_date ? data.to_date.format('MM/DD/YYYY') : ''}`}</div> : null}
														<div>{`${this.displayHourMin(data.from_time.hour())}:${this.displayHourMin(data.from_time.minute())}`} - {`${this.displayHourMin(data.to_time.hour())}:${this.displayHourMin(data.to_time.minute())}`}</div>
													</div>
													<div>{data.location}</div>
												</React.Fragment>
											) : null
										})}
									</div>
									<div className='item-flex'>
										<p className='font-14 font-700 mb-5'>{intl.formatMessage(messages.monday)}</p>
										{registerData?.availability?.Monday?.map((data, index) => {
											return (data.from_time && data.to_time && data.location) ? (
												<React.Fragment key={index}>
													<div className='flex gap-5'>
														{(data.from_date || data.to_date) ? <div>{`${data.from_date ? data.from_date?.format('MM/DD/YYYY') : ''}`} - {`${data.to_date ? data.to_date.format('MM/DD/YYYY') : ''}`}</div> : null}
														<div>{`${this.displayHourMin(data.from_time.hour())}:${this.displayHourMin(data.from_time.minute())}`} - {`${this.displayHourMin(data.to_time.hour())}:${this.displayHourMin(data.to_time.minute())}`}</div>
													</div>
													<div>{data.location}</div>
												</React.Fragment>
											) : null
										})}
									</div>
									<div className='item-flex'>
										<p className='font-14 font-700 mb-5'>{intl.formatMessage(messages.tuesday)}</p>
										{registerData?.availability?.Tuesday?.map((data, index) => {
											return (data.from_time && data.to_time && data.location) ? (
												<React.Fragment key={index}>
													<div className='flex gap-5'>
														{(data.from_date || data.to_date) ? <div>{`${data.from_date ? data.from_date?.format('MM/DD/YYYY') : ''}`} - {`${data.to_date ? data.to_date.format('MM/DD/YYYY') : ''}`}</div> : null}
														<div>{`${this.displayHourMin(data.from_time.hour())}:${this.displayHourMin(data.from_time.minute())}`} - {`${this.displayHourMin(data.to_time.hour())}:${this.displayHourMin(data.to_time.minute())}`}</div>
													</div>
													<div>{data.location}</div>
												</React.Fragment>
											) : null
										})}
									</div>
									<div className='item-flex'>
										<p className='font-14 font-700 mb-5'>{intl.formatMessage(messages.wednesday)}</p>
										{registerData?.availability?.Wednesday?.map((data, index) => {
											return (data.from_time && data.to_time && data.location) ? (
												<React.Fragment key={index}>
													<div className='flex gap-5'>
														{(data.from_date || data.to_date) ? <div>{`${data.from_date ? data.from_date?.format('MM/DD/YYYY') : ''}`} - {`${data.to_date ? data.to_date.format('MM/DD/YYYY') : ''}`}</div> : null}
														<div>{`${this.displayHourMin(data.from_time.hour())}:${this.displayHourMin(data.from_time.minute())}`} - {`${this.displayHourMin(data.to_time.hour())}:${this.displayHourMin(data.to_time.minute())}`}</div>
													</div>
													<div>{data.location}</div>
												</React.Fragment>
											) : null
										})}
									</div>
									<div className='item-flex'>
										<p className='font-14 font-700 mb-5'>{intl.formatMessage(messages.thursday)}</p>
										{registerData?.availability?.Thursday?.map((data, index) => {
											return (data.from_time && data.to_time && data.location) ? (
												<React.Fragment key={index}>
													<div className='flex gap-5'>
														{(data.from_date || data.to_date) ? <div>{`${data.from_date ? data.from_date?.format('MM/DD/YYYY') : ''}`} - {`${data.to_date ? data.to_date.format('MM/DD/YYYY') : ''}`}</div> : null}
														<div>{`${this.displayHourMin(data.from_time.hour())}:${this.displayHourMin(data.from_time.minute())}`} - {`${this.displayHourMin(data.to_time.hour())}:${this.displayHourMin(data.to_time.minute())}`}</div>
													</div>
													<div>{data.location}</div>
												</React.Fragment>
											) : null
										})}
									</div>
									<div className='item-flex'>
										<p className='font-14 font-700 mb-5'>{intl.formatMessage(messages.friday)}</p>
										{registerData?.availability?.Friday?.map((data, index) => {
											return (data.from_time && data.to_time && data.location) ? (
												<React.Fragment key={index}>
													<div className='flex gap-5'>
														{(data.from_date || data.to_date) ? <div>{`${data.from_date ? data.from_date?.format('MM/DD/YYYY') : ''}`} - {`${data.to_date ? data.to_date.format('MM/DD/YYYY') : ''}`}</div> : null}
														<div>{`${this.displayHourMin(data.from_time.hour())}:${this.displayHourMin(data.from_time.minute())}`} - {`${this.displayHourMin(data.to_time.hour())}:${this.displayHourMin(data.to_time.minute())}`}</div>
													</div>
													<div>{data.location}</div>
												</React.Fragment>
											) : null
										})}
									</div>
								</div>
								<div className='mt-10'>
									<p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.blackoutDates)}</p>
									{registerData?.availability?.isLegalHolidays ? (
										<>
											<p className='font-16 font-700 text-underline'>Legal Holidays</p>
											{registerData?.legalHolidays?.filter(a => registerData?.availability?.blackoutDates?.find(date => new Date(a?.start?.date).toLocaleDateString() == new Date(date.toString()).toLocaleDateString()))?.map(a => ({ date: new Date(a.start.date), summary: a.summary }))?.sort((a, b) => a.date - b.date)?.map((date, index) => (
												<div className='flex gap-2' key={index}>
													<div>{new Date(date?.date?.toString()).toLocaleDateString()}</div>
													<div>{date.summary}</div>
												</div>
											))}
										</>
									) : null}
									{registerData?.availability?.isJewishHolidays ? (
										<>
											<p className='font-16 font-700 text-underline'>Jewish Holidays</p>
											{registerData?.jewishHolidays?.filter(a => registerData?.availability?.blackoutDates?.find(date => new Date(a?.start?.date).toLocaleDateString() == new Date(date.toString()).toLocaleDateString()))?.map(a => ({ date: new Date(a.start.date), summary: a.summary }))?.sort((a, b) => a.date - b.date)?.map((date, index) => (
												<div className='flex gap-2' key={index}>
													<div>{new Date(date?.date?.toString()).toLocaleDateString()}</div>
													<div>{date.summary}</div>
												</div>
											))}
										</>
									) : null}
								</div>
							</Col>
						</Row>
						<div className="form-btn continue-btn" >
							<Button
								block
								type="primary"
								htmlType="submit"
								onClick={this.onSubmit}
								loading={isSubmit}
								disabled={isSubmit}
							>
								{intl.formatMessage(messages.submit).toUpperCase()}
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
	auth: state.auth,
})

export default compose(connect(mapStateToProps, { setRegisterData, removeRegisterData }))(InfoReview);