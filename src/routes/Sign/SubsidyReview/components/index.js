import React from 'react';
import { Row, Divider, Button } from 'antd';
import intl from 'react-intl-universal';
import messages from '../messages';
import messagesRequest from '../../SubsidyRequest/messages';
import './index.less';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { setRegisterData } from '../../../../redux/features/registerSlice';
import request from '../../../../utils/api/request';
import { getDefaultValueForClient, getAllSchoolsForParent } from '../../../../utils/api/apiList';

class SubsidyReview extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: {},
			inforChildren: [],
			SkillSet: [],
			childname: '',
			listSchools: [],
		}
	}

	componentDidMount() {
		const { registerData } = this.props.register;
		this.setState({
			childname: registerData.studentInfos[this.props.selectedDependent].firstName + ' ' + registerData.studentInfos[this.props.selectedDependent].lastName,
			data: registerData.studentInfos[this.props.selectedDependent].subsidyRequest
		})
		this.loadDataFromServer()
		this.loadSchools();
	}

	loadDataFromServer() {
		request.post(getDefaultValueForClient).then(result => {
			const { success, data } = result;
			if (success) {
				this.setState({ SkillSet: data.SkillSet ?? [] });
			}
		}).catch(err => {
			console.log(err);
		})
	}

	loadSchools() {
		request.post(getAllSchoolsForParent).then(result => {
			const { success, data } = result;
			if (success) {
				this.setState({ listSchools: data ?? [] });
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

	onSubmit = () => {
		this.props.onOpenSubsidyStep(-1, -1);
	}

	backToPrev = () => {
		this.props.onOpenSubsidyStep(1, this.props.selectedDependent);
	}

	render() {
		const {
			note,
			ravName,
			ravEmail,
			ravPhone,
			school,
			skillSet,
			therapistContact,
			therapistEmail,
			documents,
			therapistPhone
		} = this.state.data;

		return (
			<div className="full-layout page subsidyreview-page">
				<Row justify="center" className="row-form">
					<div className='col-form col-subsidy-review'>
						<div className='div-form-title'>
							<p className='font-24 text-center'>{intl.formatMessage(messages.reviewSubsidyRequest)}</p>
						</div>
						<div>
							<p className='font-20 font-700 mb-10'>{intl.formatMessage(messages.dependentInfo)}</p>
							<div className='review-item'>
								<p>Dependent : {this.state.childname}</p>
								<p>School : {this.schoolNameFromId(school)}</p>
								<p>Skillset(s) : {this.state.SkillSet.length > 0 ? this.state.SkillSet[skillSet] : ''}</p>
							</div>
						</div>
						<Divider style={{ marginTop: 15, marginBottom: 15, borderColor: '#d7d7d7' }} />
						<div>
							<p className='font-20 font-700 mb-10'>{intl.formatMessage(messages.otherCcontacts)}</p>
							<div className='review-item'>
								<p>Raw name : {ravName}</p>
								<p>Rav phone : {ravPhone}</p>
								<p>Rav email : {ravEmail}</p>
								<p>Therapist name : {therapistContact}</p>
								<p>Therapist phone : {therapistPhone}</p>
								<p>Therapist email : {therapistEmail}</p>
							</div>
						</div>
						<Divider style={{ marginTop: 15, marginBottom: 15, borderColor: '#d7d7d7' }} />
						<div>
							<p className='font-20 font-700 mb-10'>{intl.formatMessage(messages.notes)}</p>
							<p>{note}</p>
						</div>
						<Divider style={{ marginTop: 15, marginBottom: 15, borderColor: '#d7d7d7' }} />
						<div>
							<p className='font-20 font-700 mb-10'>{intl.formatMessage(messagesRequest.documents)}</p>
							<div className='review-item'>
								<p>
									{!!documents && documents.length > 0 && documents.map((item, index) => (
										<span key={index}>Document #{++index} {item.name}</span>
									))}
								</p>
							</div>
						</div>
						<div className='div-review-btn'>
							<Button block onClick={() => this.backToPrev()}>{intl.formatMessage(messages.goBack).toUpperCase()}</Button>
							<Button type='primary' onClick={this.onSubmit} block>{intl.formatMessage(messages.submit).toUpperCase()}</Button>
						</div>
					</div>
				</Row>
			</div>
		);
	}
}

const mapStateToProps = state => ({
	register: state.register,
})

export default compose(connect(mapStateToProps, { setRegisterData }))(SubsidyReview);