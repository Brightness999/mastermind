import React, { Component } from 'react';
import { Row, Button, message } from 'antd';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesReview from '../../../SubsidyReview/messages';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { url } from '../../../../../utils/api/baseUrl'
import axios from 'axios';
import { setRegisterData } from '../../../../../redux/features/registerSlice';

class ReviewAccount extends Component {
	constructor(props) {
		super(props);
		this.state = {
			registerData: {
				parentInfo: {},
				studentInfos: [],
			},
			listServices: [],
			SkillSet: [],
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
		axios.post(url + 'clients/get_default_value_for_client'
		).then(result => {
			if (result.data.success) {
				var data = result.data.data;
				this.setState({ SkillSet: data.SkillSet, listServices: data.listServices })
			}
		}).catch(err => {
			console.log(err);
			this.setState({
				checkEmailExist: false,
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

	schoolNameFromId(id) {
		for (var i = 0; i < this.state.listSchools.length; i++) {
			if (this.state.listSchools[i]._id == id) {
				return this.state.listSchools[i].name;
			}
		}
		return '';
	}

	getServicesName(id) {
		for (var i = 0; i < this.state.listServices.length; i++) {
			if (this.state.listServices[i]._id == id) {
				return this.state.listServices[i].name;
			}
		}
		return '';
	}

	onFinish = (values) => {
		this.props.onContinue();
	};

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	onSubmit = async () => {
		const { registerData } = this.props.register;
		const customData = JSON.parse(JSON.stringify(registerData));
		for (var i = 0; i < customData.studentInfos.length; i++) {
			if (!!customData.studentInfos[i].subsidyRequest && customData.studentInfos[i].subsidyRequest.documentUploaded.length > 0) {
				customData.studentInfos[i].subsidyRequest.documents = customData.studentInfos[i].subsidyRequest.documentUploaded;
			}
		}
		const response = await axios.post(url + 'users/signup', customData);
		const { success } = response.data;
		if (success) {
			this.props.onContinue(true);
		} else {
			message.error(error?.response?.data?.data ?? error.message);
		}
		return;
	}

	checkHaveSchedule(dayInWeek, studentInfo) {
		for (var i = 0; i < studentInfo.availabilitySchedule.length; i++) {
			if (studentInfo.availabilitySchedule[i].dayInWeek == dayInWeek) {
				return true;
			}
		}
		return false;
	}

	getScheduleInDay(dayInWeek, studentInfo) {
		var arr = [];
		for (var i = 0; i < studentInfo.availabilitySchedule.length; i++) {
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

		return (
			<Row justify="center" className="row-form">
				<Row justify="center" className="row-form">
					<div className='col-form col-review-account'>
						<div className='div-form-title'>
							<p className='font-26 text-center'>{intl.formatMessage(messages.reviewAccountInfo)}</p>
						</div>
						<div>
							<p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.usernameEmail)}</p>
							<p>Username : {this.state.registerData?.username}</p>
							<p>Email : {this.state.registerData?.email}</p>
						</div>
						<div>
							<p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.parentsInfo)}</p>
							<p className='font-14 underline'>{intl.formatMessage(messages.mother)}</p>
							<p>Mother + Family name : {this.state.registerData?.parentInfo?.motherName}</p>
							<p>Mother phone : {this.state.registerData?.parentInfo?.motherPhoneNumber}</p>
							<p>Mother email : {this.state.registerData?.parentInfo?.motherEmail}</p>
							<p className='font-14 underline'>{intl.formatMessage(messages.father)}</p>
							<p>Father + Family name : {this.state.registerData?.parentInfo?.familyName} </p>
							<p>Father phone : {this.state.registerData?.parentInfo?.fatherPhoneNumber}</p>
							<p>Father email : {this.state.registerData?.parentInfo?.fatherEmail}</p>
						</div>
						<div>
							<p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.address)}</p>
							<p>Street Address : {this.state.registerData?.parentInfo?.address}</p>
						</div>
						{this.state.registerData?.studentInfos?.map((item, index) => (
							<div key={index}>
								<p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.dependentsInfo)}</p>
								<p className='font-14 font-700 mb-10'>Dependent #{++index} {item.firstName} {item.lastName} - {item.birthday}</p>
								<p>School : {this.schoolNameFromId(item.school)}</p>
								<div className='review-item'>
									<p>Teacher : {item.primaryTeacher} </p>
									<p>Grade : {item.currentGrade}</p>
								</div>
								<div className='review-item'>
									<p className='font-14 font-700 mb-10'>{intl.formatMessage(messages.servicesRequested)}</p>
									<p>Has an IEP</p>
								</div>
								<div className='review-item-3'>
									{item.services?.map((service, serviceIndex) => (
										<p key={serviceIndex}>{this.getServicesName(service)}</p>
									))}
								</div>
								<div>
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
								</div>
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


export default compose(connect(mapStateToProps, { setRegisterData }))(ReviewAccount);