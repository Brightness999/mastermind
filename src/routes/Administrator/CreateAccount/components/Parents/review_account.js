import React, { Component } from 'react';
import { Row, Button, message } from 'antd';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesReview from '../../../../Sign/SubsidyReview/messages';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { url } from '../../../../../utils/api/baseUrl'
import axios from 'axios';
import { setRegisterData, removeRegisterData } from '../../../../../redux/features/registerSlice';
import { getAllSchoolsForParent, getDefaultValueForClient, userSignUp } from '../../../../../utils/api/apiList';

class ReviewAccount extends Component {
	constructor(props) {
		super(props);
		this.state = {
			registerData: {
				parentInfo: {},
				studentInfos: [],
			},
			listServices: [],
			listSchools: [],
		}
	}

	componentDidMount() {
		const { registerData } = this.props.register;
		this.setState({ registerData: registerData })
		this.loadDataFromServer();
		this.loadSchools();
	}

	loadDataFromServer() {
		axios.post(url + getDefaultValueForClient).then(result => {
			if (result.data.success) {
				const data = result.data.data;
				this.setState({ listServices: data.SkillSet })
			}
		}).catch(err => {
			console.log(err);
			this.setState({
				checkEmailExist: false,
			});
		})
	}

	loadSchools() {
		axios.post(url + getAllSchoolsForParent, { communityServed: this.props.register.registerData.parentInfo.cityConnection }).then(result => {
			const { success, data } = result.data;
			if (success) {
				this.setState({ listSchools: data });
			}
		}).catch(err => {
			console.log(err);
		})
	}

	onSubmit = async () => {
		const { registerData } = this.props.register;
		const customData = JSON.parse(JSON.stringify(registerData));
		for (let i = 0; i < customData.studentInfos.length; i++) {
			if (!!customData.studentInfos[i].subsidyRequest && customData.studentInfos[i].subsidyRequest.documentUploaded.length > 0) {
				customData.studentInfos[i].subsidyRequest.documents = customData.studentInfos[i].subsidyRequest.documentUploaded;
			}
		}
		const response = await axios.post(url + userSignUp, customData);
		const { success } = response.data;
		if (success) {
			this.props.removeRegisterData();
			this.props.onContinue(true);
		} else {
			message.error(error?.response?.data?.data ?? error.message);
		}
		return;
	}

	checkHaveSchedule(dayInWeek, studentInfo) {
		for (let i = 0; i < studentInfo.availabilitySchedule.length; i++) {
			if (studentInfo.availabilitySchedule[i].dayInWeek == dayInWeek) {
				return true;
			}
		}
		return false;
	}

	getScheduleInDay(dayInWeek, studentInfo) {
		const arr = [];
		for (let i = 0; i < studentInfo.availabilitySchedule.length; i++) {
			if (studentInfo.availabilitySchedule[i].dayInWeek == dayInWeek) {
				arr.push(studentInfo.availabilitySchedule[i])
			}
		}
		return arr;
	}

	displayHourMin(value) {
		return value > 9 ? value : ('0' + value)
	}

	render() {
		const day_week = [
			intl.formatMessage(messages.sunday),
			intl.formatMessage(messages.monday),
			intl.formatMessage(messages.tuesday),
			intl.formatMessage(messages.wednesday),
			intl.formatMessage(messages.thursday),
			intl.formatMessage(messages.friday),
		]
		const { registerData, listSchools, listServices } = this.state;

		return (
			<Row justify="center" className="row-form">
				<Row justify="center" className="row-form">
					<div className='col-form col-review-account'>
						<div className='div-form-title'>
							<p className='font-26 text-center'>{intl.formatMessage(messages.reviewAccountInfo)}</p>
						</div>
						<div>
							<p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.usernameEmail)}</p>
							<p>Username : {registerData?.username}</p>
							<p>Email : {registerData?.email}</p>
						</div>
						<div>
							<p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.parentsInfo)}</p>
							<p className='font-14 underline'>{intl.formatMessage(messages.mother)}</p>
							<p>Mother + Family name : {registerData?.parentInfo?.motherName} {registerData?.parentInfo?.familyName}</p>
							<p>Mother phone : {registerData?.parentInfo?.motherPhoneNumber}</p>
							<p>Mother email : {registerData?.parentInfo?.motherEmail}</p>
							<p className='font-14 underline'>{intl.formatMessage(messages.father)}</p>
							<p>Father + Family name : {registerData?.parentInfo?.fatherName} {registerData?.parentInfo?.familyName}</p>
							<p>Father phone : {registerData?.parentInfo?.fatherPhoneNumber}</p>
							<p>Father email : {registerData?.parentInfo?.fatherEmail}</p>
						</div>
						<div>
							<p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.address)}</p>
							<p>Street Address : {registerData?.parentInfo?.address}</p>
						</div>
						{registerData?.studentInfos?.map((item, index) => (
							<div key={index}>
								<p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.dependentsInfo)}</p>
								<p className='font-14 font-700 mb-10'>{item.firstName} {item.lastName} - {new Date(item.birthday).toDateString()}</p>
								<p>School : {listSchools?.find(school => school._id == item.school)?.name}</p>
								<div className='review-item'>
									<p>Teacher : {item.primaryTeacher} </p>
									<p>Grade : {item.currentGrade}</p>
								</div>
								<div className='flex gap-2'>
									<p className='font-14 font-700 mb-10'>{intl.formatMessage(messages.servicesRequested)}</p>
									<div>
										{item.services?.map((service, index) => (
											<div key={index}>{listServices?.find(skill => skill._id == service)?.name}</div>
										))}
									</div>
								</div>
								{/* <div>
									<p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.availability)}</p>
									<div className='review-item-flex'>
										{day_week.map((dayInWeek, dayInWeekIndex) => {
											if (this.checkHaveSchedule(dayInWeekIndex, item)) {
												return (
													<div key={dayInWeekIndex} className='item-flex'>
														<p className='font-14 font-700 mb-10'>{dayInWeek}</p>
														{this.getScheduleInDay(dayInWeekIndex, item).map((schedule, index) => (
															<p key={index}>{this.displayHourMin(schedule.openHour)}:{this.displayHourMin(schedule.openMin)} - {this.displayHourMin(schedule.closeHour)}:{this.displayHourMin(schedule.closeMin)}</p>
														))}
													</div>
												);
											}
										})}
									</div>
								</div> */}
							</div>
						))}
						<div className="form-btn continue-btn" >
							<Button
								block
								type="primary"
								htmlType="submit"
								onClick={this.onSubmit}
							>
								{intl.formatMessage(messagesReview.submit).toUpperCase()}
							</Button>
						</div>
					</div>
				</Row>
			</Row>
		);
	}
}

const mapStateToProps = state => ({
	register: state.register
})


export default compose(connect(mapStateToProps, { setRegisterData, removeRegisterData }))(ReviewAccount);