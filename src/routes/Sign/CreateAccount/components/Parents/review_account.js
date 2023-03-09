import React, { Component } from 'react';
import { Row, Button, message } from 'antd';
import intl from 'react-intl-universal';
import messages from '../../messages';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { setRegisterData, removeRegisterData } from '../../../../../redux/features/registerSlice';
import { userSignUp } from '../../../../../utils/api/apiList';
import request from '../../../../../utils/api/request';

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
			if (!!customData.studentInfos[i].subsidyRequest && customData.studentInfos[i].subsidyRequest.documentUploaded.length > 0) {
				customData.studentInfos[i].subsidyRequest.documents = customData.studentInfos[i].subsidyRequest.documentUploaded;
			}
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
						<p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.dependentsInfo)}</p>
						{registerData?.studentInfos?.map((item, index) => (
							<div key={index}>
								<p className='font-14 font-700 mb-10'>{item.firstName} {item.lastName} - {new Date(item.birthday).toDateString()}</p>
								<p>School : {listSchools?.find(school => school._id == item.school)?.name}</p>
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

export default compose(connect(mapStateToProps, { setRegisterData, removeRegisterData }))(ReviewAccount);