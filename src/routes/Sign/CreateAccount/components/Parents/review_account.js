import React, { Component } from 'react';
import { Row, Button, message, Col, Switch } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';

import messages from '../../messages';
import { setRegisterData, removeRegisterData } from 'src/redux/features/registerSlice';
import { userSignUp } from 'utils/api/apiList';
import request from 'utils/api/request';

class ReviewAccount extends Component {
	constructor(props) {
		super(props);
		this.state = {
			registerData: {
				parentInfo: {},
				studentInfos: [],
			},
			isSubmit: false,
		}
	}

	componentDidMount() {
		const { registerData } = this.props.register;
		this.setState({ registerData: registerData })
	}

	onSubmit = async () => {
		const { registerData } = this.props.register;
		const customData = JSON.parse(JSON.stringify(registerData));
		for (let i = 0; i < customData.studentInfos.length; i++) {
			customData.studentInfos[i].school = customData.studentInfos[i].school === 'other' ? undefined : customData.studentInfos[i].school;
		}
		this.setState({ isSubmit: true });
		const response = await request.post(userSignUp, customData);
		this.setState({ isSubmit: false });
		const { success } = response;
		if (success) {
			this.props.removeRegisterData();
			this.props.onContinue(true);
		} else {
			message.error(error?.response?.data?.data ?? error.message);
		}
		return;
	}

	render() {
		const { registerData, isSubmit } = this.state;
		const { schools, skillSets } = this.props.auth.generalData;
		const listSchools = schools?.filter(school => school.communityServed?._id === registerData.parentInfo?.cityConnection) ?? [];

		return (
			<Row justify="center" className="row-form">
				<div className='col-form col-review-account'>
					<div className='div-form-title'>
						<p className='font-26 text-center'>{intl.formatMessage(messages.reviewAccountInfo)}</p>
					</div>
					<Row gutter={15}>
						<Col xs={24} sm={24} md={12}>
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
							<p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.dependentsInfo)}</p>
							{registerData?.studentInfos?.map((item, index) => (
								<div key={index}>
									<p className='font-14 font-700 mb-10'>{item.firstName} {item.lastName} - {new Date(item.birthday).toDateString()}</p>
									<p>School : {listSchools?.find(school => school._id == item.school)?.name || 'Other'}</p>
									{!listSchools?.find(school => school._id == item.school)?.name ? (
										<>
											<p>Other Contact Name : {item.otherName}</p>
											<p>Other Contact Phonenumber : {item.otherContactNumber}</p>
											<p>Other Notes : {item.otherNotes}</p>
										</>
									) : null}
									<div className='review-item'>
										<p>Teacher : {item.primaryTeacher} </p>
										<p>Grade : {item.currentGrade}</p>
									</div>
									<div className='flex gap-2'>
										<p className='font-14 font-700 mb-10'>{intl.formatMessage(messages.servicesRequested)}</p>
										<div>
											{item?.services?.map((service, index) => (
												<p key={index}>{skillSets?.find(skill => skill._id == service)?.name}</p>
											))}
										</div>
									</div>
								</div>
							))}
						</Col>
						<Col xs={24} sm={24} md={12}>
							<p className='font-18 font-700 mb-10 text-center'>{intl.formatMessage(messages.notificationSetting)}</p>
							<table className='notification-settings w-100 table-fixed'>
								<thead>
									<tr>
										<th></th>
										<th>Email</th>
										<th>Text</th>
										<th>Push</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td colSpan={4} className="bg-pastel">
											<div className='header'>Sessions</div>
										</td>
									</tr>
									<tr>
										<td>New Session</td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isNewSessionEmail} disabled /></div></td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isNewSessionText} disabled /></div></td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isNewSessionPush} disabled /></div></td>
									</tr>
									<tr>
										<td>Reschedule Session</td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isRescheduleSessionEmail} disabled /></div></td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isRescheduleSessionText} disabled /></div></td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isRescheduleSessionPush} disabled /></div></td>
									</tr>
									<tr>
										<td>Close Session</td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isCloseSessionEmail} disabled /></div></td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isCloseSessionText} disabled /></div></td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isCloseSessionPush} disabled /></div></td>
									</tr>
									<tr>
										<td>Cancel Session</td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isCancelSessionEmail} disabled /></div></td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isCancelSessionText} disabled /></div></td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isCancelSessionPush} disabled /></div></td>
									</tr>
									<tr>
										<td>Session reminder</td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isSessionReminderEmail} disabled /></div></td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isSessionReminderText} disabled /></div></td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isSessionReminderPush} disabled /></div></td>
									</tr>
									<tr>
										<td colSpan={4} className="bg-pastel">
											<div className='header'>Subsidy</div>
										</td>
									</tr>
									<tr>
										<td>Subsidy Create</td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isSubsidyCreateEmail} disabled /></div></td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isSubsidyCreateText} disabled /></div></td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isSubsidyCreatePush} disabled /></div></td>
									</tr>
									<tr>
										<td>Subsidy Update</td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isSubsidyUpdateEmail} disabled /></div></td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isSubsidyUpdateText} disabled /></div></td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isSubsidyUpdatePush} disabled /></div></td>
									</tr>
									<tr>
										<td colSpan={4} className="bg-pastel">
											<div className='header'>Flag</div>
										</td>
									</tr>
									<tr>
										<td>Flag Created</td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isFlagCreatedEmail} disabled /></div></td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isFlagCreatedText} disabled /></div></td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isFlagCreatedPush} disabled /></div></td>
									</tr>
									<tr>
										<td>Flag Cleared</td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isFlagClearedEmail} disabled /></div></td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isFlagClearedText} disabled /></div></td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isFlagClearedPush} disabled /></div></td>
									</tr>
									<tr>
										<td colSpan={4} className="bg-pastel">
											<div className='header'>Invoice</div>
										</td>
									</tr>
									<tr>
										<td>Invoice Updated</td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isInvoiceUpdatedEmail} disabled /></div></td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isInvoiceUpdatedText} disabled /></div></td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isInvoiceUpdatedPush} disabled /></div></td>
									</tr>
									<tr>
										<td>Invoice Paid</td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isInvoicePaidEmail} disabled /></div></td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isInvoicePaidText} disabled /></div></td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isInvoicePaidPush} disabled /></div></td>
									</tr>
									<tr>
										<td colSpan={4} className="bg-pastel">
											<div className='header'>Dependent</div>
										</td>
									</tr>
									<tr>
										<td>Dependent Declined</td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isDependentDeclinedEmail} disabled /></div></td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isDependentDeclinedText} disabled /></div></td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isDependentDeclinedPush} disabled /></div></td>
									</tr>
									<tr>
										<td>Dependent Accpted</td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isDependentAcceptedEmail} disabled /></div></td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isDependentAcceptedText} disabled /></div></td>
										<td><div className='text-center'><Switch checked={registerData?.notificationSetting?.isDependentAcceptedPush} disabled /></div></td>
									</tr>
								</tbody>
							</table>
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
		);
	}
}

const mapStateToProps = state => ({
	register: state.register,
	auth: state.auth,
})

export default compose(connect(mapStateToProps, { setRegisterData, removeRegisterData }))(ReviewAccount);