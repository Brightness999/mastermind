import React from 'react';
import { Modal, Button, Divider, Steps, Row, Col, Select, Input, message } from 'antd';
import { FaRegCalendarAlt } from 'react-icons/fa';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';
import moment from 'moment';

import messages from './messages';
import msgCreateAccount from '../../routes/Sign/CreateAccount/messages';
import msgDashboard from '../../routes/Dashboard/messages';
import request from '../../utils/api/request'
import { url, switchPathWithRole } from '../../utils/api/baseUrl'
import { acceptSubsidyRequest, appealSubsidy, denyAppealSubsidy, denySubsidyRequest, getLastConsulation, schoolAcceptAppeal, schoolAcceptAppealSubsidy } from '../../utils/api/apiList';
import { setSubsidyRequests } from '../../redux/features/appointmentsSlice';
import './style/index.less';
import '../../assets/styles/login.less';

const arrMeetSolution = [
	'Google meet',
	'Zoom',
	'Direction',
]

class ModalSubsidyProgress extends React.Component {
	state = {
		subsidy: {},
		selectedProvider: undefined,
		decisionExplanation: "",
		selectedDate: moment(),
		selectedHour: undefined,
		selectProviderFromAdmin: undefined,
		numberOfSessions: undefined,
		priceForSession: undefined,
		parentWarning: '',
		consulationWarning: '',
		referral: {},
	}

	componentDidMount = () => {
		this.clearData();
		this.loadSubsidyData(this.props.subsidyId);
	}

	loadSubsidyData = (subsidyId) => {
		request.post(switchPathWithRole(this.props.auth.user?.role) + 'get_subsidy_detail', { subsidyId: subsidyId }).then(result => {
			const { success, data } = result;
			if (success) {
				this.setState({ subsidy: data }, () => this.loadLastReferral());
				if (!!data.decisionExplanation && data.decisionExplanation.length > 0) {
					this.setState({ decisionExplanation: data.decisionExplanation });
				}

				if (!!data.selectedProvider) {
					this.setState({
						selectProviderFromAdmin: data.selectedProvider,
						numberOfSessions: data.numberOfSessions,
						priceForSession: data.priceForSession,
						selectedProvider: data.selectedProvider,
					})
				}
			} else {
				this.props.onCancel();
			}
		}).catch(err => {
			console.log('get_subsidy_detail-----', err);
			this.props.onCancel();
		})
	}

	loadLastReferral = () => {
		request.post(getLastConsulation, { subsidyId: this.state.subsidy._id }).then(result => {
			if (result.success) {
				this.setState({ referral: result.data });
			} else {
				this.setState({ referral: {} });
			}
		}).catch(err => {
			this.setState({ referral: {} });
		})
	}

	clearData = () => {
		this.setState({
			subsidy: {},
			selectedProvider: undefined,
			decisionExplanation: "",
			selectProviderFromAdmin: undefined,
			numberOfSessions: undefined,
			priceForSession: undefined,
			referral: {},
		});
	}

	schoolDenySubsidy(subsidy) {
		request.post(denySubsidyRequest, { subsidyId: subsidy._id }).then(result => {
			const { success, data } = result;
			if (success) {
				this.loadSubsidyData(subsidy._id);
				this.updateSubsidaries(subsidy, data);
				this.props.onSubmit();
			}
		}).catch(err => {
			message.error(err.message);
		})
	}

	adminDenySubsidy(subsidy) {
		request.post(switchPathWithRole(this.props.auth.user?.role) + 'deny_subsidy_request', { subsidyId: subsidy._id }).then(result => {
			if (result.success) {
				this.loadSubsidyData(subsidy._id);
			}
		}).catch(err => {
			message.error(err.message);
		})
	}

	schoolAcceptSubsidy(subsidy) {
		const { selectedProvider, decisionExplanation } = this.state;

		if (!selectedProvider || decisionExplanation.length === 0) {
			this.setState({ parentWarning: 'Please suggest a provider and fill in decision explaintion' })
			return;
		}
		this.setState({ parentWarning: '' });
		request.post(acceptSubsidyRequest, {
			subsidyId: subsidy._id,
			student: subsidy?.student?._id,
			selectedProvider,
			decisionExplanation,
		}).then(result => {
			message.success('Approved successfully');
			const { success, data } = result;
			if (success) {
				this.loadSubsidyData(subsidy._id);
				this.updateSubsidaries(subsidy, data);
				this.props.onSubmit();
			}
		}).catch(err => {
			message.error(err.message);
		})
	}

	submitSubsidyFromAdmin = (subsidy) => {
		const { selectProviderFromAdmin, numberOfSessions, priceForSession } = this.state;
		const postData = {
			"selectedProvider": selectProviderFromAdmin,
			"numberOfSessions": numberOfSessions,
			"priceForSession": priceForSession,
			"subsidyId": subsidy._id,
			"student": subsidy.student._id,
			"school": subsidy.school._id,
		}
		if (!selectProviderFromAdmin || !numberOfSessions || !priceForSession) {
			message.error('please fill all reuired field');
			return;
		}
		request.post(switchPathWithRole(this.props.auth.user?.role) + 'select_final_provider_for_subsidy', postData).then(result => {
			if (result.success) {
				this.loadSubsidyData(subsidy._id);
			}
		}).catch(err => {
			message.error(err.message);
		})
	}

	appealSubsidy = (subsidy) => {
		const postData = { subsidyId: subsidy._id };
		request.post(appealSubsidy, postData).then(result => {
			message.success('Your appeal has been sent successfully');
			if (result.success) {
				this.loadSubsidyData(subsidy._id);
			}
		}).catch(err => {
			message.error(err.message);
		})
	}

	getFileName(path) {
		return path.replace(/^.*[\\\/]/, '')
	}

	getFileUrl(path) {
		return url + 'uploads/' + path;
	}

	denyAppeal = (subsidy) => {
		const postData = { subsidyId: subsidy._id };
		request.post(denyAppealSubsidy, postData).then(result => {
			message.success('Denied successfully');
			if (result.success) {
				this.loadSubsidyData(subsidy._id);
			}
		}).catch(err => {
			message.error(err.message);
		})
	}

	schoolAcceptAppeal = (subsidy) => {
		const postData = { subsidyId: subsidy._id };
		request.post(schoolAcceptAppealSubsidy, postData).then(result => {
			message.success('Accepted successfully');
			const { success, data } = result;
			if (success) {
				this.loadSubsidyData(subsidy._id);
				this.updateSubsidaries(subsidy, data);
				this.props.onSubmit();
			}
		}).catch(err => {
			message.error(err.message);
		})
	}

	updateSubsidaries(subsidy, data) {
		const newSubsidyRequests = JSON.parse(JSON.stringify(this.props.listSubsidaries));
		this.props.dispatch(setSubsidyRequests(newSubsidyRequests?.map(s => {
			if (s._id === subsidy._id) {
				s.status = data.status;
				s.isAppeal = data.isAppeal;
			}
			return s;
		})));
	}

	renderStudentParentInfo(subsidy) {
		const { student, documents } = subsidy;
		return (<div className='parent-info'>
			<p className='font-20 font-700'>{intl.formatMessage(messages.parentInformation)}</p>
			<Row gutter={15}>
				<Col xs={24} sm={24} md={12}>
					<p className='font-700'>{intl.formatMessage(messages.dependentInfo)}</p>
					<div className='count-2'>
						<p className='font-12'>Dependent: <b>{student.firstName} {student.lastName}</b></p>
						<p className='font-12'>School: {student.school.name}</p>
						<p className='font-12'>Skillset: {subsidy?.skillSet?.name}</p>
						<p className='font-12'>Age: {moment().year() - moment(student.birthday).year()}</p>
						<p className='font-12'>Grade: {student.currentGrade}</p>
						<p className='font-12'>Teacher: {student.primaryTeacher}</p>
					</div>
				</Col>
				<Col xs={24} sm={24} md={12}>
					<p className='font-700'>{intl.formatMessage(messages.otherContacts)}</p>
					<p className='font-12'>Rav name: {subsidy.ravName}</p>
					<p className='font-12'>Rav phone: {subsidy.ravPhone}</p>
					<p className='font-12'>Rav email: {subsidy.ravEmail}</p>
				</Col>
			</Row>
			<Divider style={{ margin: '12px 0', borderColor: '#d7d7d7' }} />
			{!!documents && documents.length > 0 && <Row gutter={15}>
				<Col xs={24} sm={24} md={12}>
					<p className='font-700'>{intl.formatMessage(messages.subsidyNotes)}</p>
					<p className='font-12'>{subsidy.note}</p>
				</Col>
				<Col xs={24} sm={24} md={12}>
					<p className='font-700'>{intl.formatMessage(messages.documents)}</p>
					{documents?.map((document, index) => (
						<a
							key={index}
							href={this.getFileUrl(document)}
							className='font-12'
							target="_blank"
						>
							{this.getFileName(document)}
						</a>
					))}
				</Col>
			</Row>}
		</div>)
	}

	renderButtonsForSchoolInfo(subsidy) {
		if (this.props.auth.user?.role === 3) {
			return;
		}
		if (subsidy.isAppeal > 0 && [2, 4].includes(subsidy.status)) {
			return (
				<div>
					<div className='flex flex-row items-center'>
						<p>User has sent appeal for this, please choose an action </p>
					</div>
					<div className='flex flex-row items-center justify-end'>
						<Button
							onClick={() => this.denyAppeal(subsidy)}
							size='small' className='mr-10'>{intl.formatMessage(messages.decline).toUpperCase()}</Button>
						<Button
							onClick={() => this.schoolAcceptAppeal(subsidy)}
							size='small' type='primary'>{intl.formatMessage(messages.approve).toUpperCase()}</Button>
					</div>
				</div>
			)
		}

		return (
			<div>
				{this.state.parentWarning.length > 0 ? (
					<div className='flex flex-row items-center'>
						<p className='text-red'>{this.state.parentWarning}</p>
					</div>
				) : null}
				<div className='flex flex-row items-center justify-end'>
					{subsidy.status == 0 && (
						<Button onClick={() => this.schoolDenySubsidy(subsidy)} size='small' className='mr-10'>
							{intl.formatMessage(messages.decline).toUpperCase()}
						</Button>
					)}
					{subsidy.status == 0 && (
						<Button onClick={() => this.schoolAcceptSubsidy(subsidy)} size='small' type='primary'>
							{intl.formatMessage(messages.approve).toUpperCase()}
						</Button>
					)}
				</div>
			</div>
		)
	}

	renderButtonsForConsulation(subsidy) {
		return (
			<div className='flex flex-row items-center'>
				<div className='flex flex-row items-center'>
					<a
						className='text-primary'
						onClick={() => { }}
					>
						<FaRegCalendarAlt />{intl.formatMessage(messages.reSchedule)}
					</a>
				</div>
			</div>
		)
	}

	renderButtonsForDecision(subsidy) {
		if (this.props.auth.user?.role > 900) {
			return (
				<div className='flex flex-row items-center'>
					<Button
						onClick={() => this.adminDenySubsidy(subsidy)}
						size='small' className='mr-10'>{intl.formatMessage(messages.decline).toUpperCase()}</Button>
					<Button
						onClick={() => this.submitSubsidyFromAdmin(subsidy)}
						size='small' type='primary'>{intl.formatMessage(messages.approve).toUpperCase()}</Button>
				</div>
			)
		}
	}

	renderSchoolInfo = (data) => {
		const { subsidy, decisionExplanation, selectedProvider } = this.state;
		const { user, providers } = this.props.auth;

		if (user?.role === 3 && subsidy.status === 0) {
			return null;
		}

		return (
			<div className='school-info'>
				<div className='flex flex-row justify-between'>
					<p className='font-20 font-700'>{intl.formatMessage(messages.schoolInformation)}</p>
					{this.renderButtonsForSchoolInfo(data)}
				</div>
				<Row gutter={15}>
					<Col xs={24} sm={24} md={8}>
						<p className='font-700 mb-10'>{intl.formatMessage(messages.recommendedProviders)}</p>
						<div className='select-md'>
							<Select
								disabled={user.role === 3 || [2, 4].includes(subsidy.status)}
								onChange={v => this.setState({ selectedProvider: v })}
								value={selectedProvider}
								className='mb-10'
								placeholder={intl.formatMessage(msgCreateAccount.provider)}
							>
								{providers?.filter(provider => provider?.skillSet?.find(skill => skill?._id === subsidy?.skillSet?._id))?.map((provider) => (
									<Select.Option key={provider._id} value={provider._id}>{`${provider.firstName} ${provider.lastName}` || provider.referredToAs}</Select.Option>
								))}
							</Select>
						</div>
					</Col>
					<Col xs={24} sm={24} md={16}>
						<p className='font-700 mb-10'>{intl.formatMessage(messages.decisionExplanation)}</p>
						<Input.TextArea
							value={decisionExplanation}
							disabled={user.role === 3 || [2, 4].includes(subsidy.status)}
							onChange={v => this.setState({ decisionExplanation: v.target.value })}
							rows={5} placeholder={intl.formatMessage(messages.generalNotes)} />
					</Col>
				</Row>
			</div>
		)
	}

	renderConsulation = (data) => {
		const { referral } = this.state;

		if ([3, 5].includes(data.status)) {
			if (referral.typeForAppointLocation == undefined || referral.location == undefined) {
				return (
					<div className='consulation-appoint'>
						<div className='flex flex-row justify-between'>
							<p className='font-20 font-700 mb-10'>{intl.formatMessage(messages.consulationAppointment)}</p>
							{this.renderButtonsForConsulation(data)}
						</div>
					</div>
				);
			}
			return (
				<div className='consulation-appoint'>
					<Col xs={24} sm={24} md={10}>
						<p className='font-20 font-700'>{intl.formatMessage(messages.consulationAppointment)}</p>
					</Col>
					<Col xs={24} sm={24} md={14}>
						<div className='flex flex-row justify-between'>
							{referral.typeForAppointLocation != undefined && (
								<p>
									<span className='font-700'>{arrMeetSolution[referral.typeForAppointLocation]}</span>: <a>{referral.location}</a>
								</p>
							)}
							<div className='flex flex-row items-center'>
								<a className='text-primary' onClick={() => { }}><FaRegCalendarAlt />{intl.formatMessage(messages.reSchedule)}</a>
							</div>
						</div>
						<div className='flex flex-row justify-between'>
							{referral.date != undefined && <p><span className='font-700'>{intl.formatMessage(messages.dateTime)}</span>: {moment(referral.date).format('YYYY-MM-DD')} | {referral.date != undefined ? moment(referral.date).format('HH:mm A') : ''}</p>}
							<p><span className='font-700'>{intl.formatMessage(messages.phone)}</span>: {referral.phoneNumber}</p>
						</div>
					</Col>
				</div>
			)
		}
	}

	renderDecision(subsidy) {
		const { selectProviderFromAdmin, numberOfSessions, priceForSession } = this.state;
		const { user, providers } = this.props.auth;
		const isNotAdmin = user?.role < 900;
		if (isNotAdmin || (!isNotAdmin && ![3, 5].includes(subsidy.status))) {
			return;
		}

		return (
			<div className='subsidy-detail'>
				<div className='flex flex-row justify-between'>
					<p className='font-20 font-700'>{intl.formatMessage(messages.subsidyDetails)}</p>
					{this.renderButtonsForDecision(subsidy)}
				</div>
				<Row gutter={15}>
					<Col xs={24} sm={24} md={8}>
						<p className='font-700'>{intl.formatMessage(msgCreateAccount.provider)}:</p>
						<Select
							disabled={isNotAdmin}
							value={selectProviderFromAdmin}
							onChange={v => this.setState({ selectProviderFromAdmin: v })}
							className='mb-10'
							placeholder={intl.formatMessage(msgCreateAccount.provider)}
						>
							{providers?.map((provider) => (
								<Select.Option key={provider._id} value={provider._id}>{provider.name || provider.referredToAs}</Select.Option>
							))}
						</Select>
					</Col>
					<Col xs={24} sm={24} md={8}>
						<p className='font-700'>{intl.formatMessage(messages.numberApprovedSessions)}:</p>
						<Input
							disabled={isNotAdmin}
							value={numberOfSessions}
							type="number"
							onChange={v => this.setState({ numberOfSessions: v.target.value })}
						/>
					</Col>
					<Col xs={24} sm={24} md={8}>
						<p className='font-700'>{intl.formatMessage(messages.totalRemaining)}:</p>
						<Input
							value={priceForSession}
							type="number"
							onChange={v => this.setState({ priceForSession: v.target.value })}
							disabled={isNotAdmin}
						/>
					</Col>
				</Row>
			</div>
		)
	}

	renderSubsidyData(subsidy) {
		if (!subsidy.student) {
			return (<div>Loading...</div>)
		}
		return (
			<div className="steps-content mt-1">
				{this.renderStudentParentInfo(subsidy)}
				{this.renderSchoolInfo(subsidy)}
				{this.renderConsulation(subsidy)}
				{this.renderDecision(subsidy)}
			</div>
		)
	}

	checkCurrentStep = (subsidy) => {
		if (subsidy.status == 1) {
			if (!!subsidy.adminApprovalStatus) {
				return 3;
			}
			return 2;
		} else if (subsidy.status == -1) {
			return 1;
		} else {
			return 0;
		}
	}

	footerButton() {
		const { subsidy } = this.state;

		if ([2, 4].includes(subsidy.status) && subsidy.isAppeal >= 0 && (this.props.auth.user?.role === 3 || this.props.auth.user?.role > 900)) {
			return [
				<Button key="back" onClick={this.props.onCancel}>
					CLOSE
				</Button>,
				<Button
					disabled={subsidy.isAppeal != 0}
					key="submit" type="primary" onClick={() => this.appealSubsidy(subsidy)} style={{ padding: '7.5px 30px' }}>
					{intl.formatMessage(messages.appeal).toUpperCase()}
				</Button>
			]
		}
		return null
	}

	render() {
		const { subsidy } = this.state;
		const modalProps = {
			className: 'modal-subsidy-progress',
			title: "",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: this.props.onCancel,
			closable: false,
			width: 900,
			footer: this.footerButton(),
		};

		return (
			<Modal {...modalProps}>
				<div className='flex flex-row mb-20'>
					<div className='flex-1 text-center'>
						<p className='font-30 font-30-sm'>{intl.formatMessage(messages.subsidyProgress)}</p>
					</div>
					{subsidy.status != 0 && (
						<div style={{ width: 110, textAlign: 'right' }}>
							{[1, 3, 5].includes(subsidy.status) && <p className='text-green500 font-24 font-700 ml-auto'>{intl.formatMessage(msgDashboard.approved)}</p>}
							{[2, 4].includes(subsidy.status) && <p className='text-red font-24 font-700 ml-auto'>{intl.formatMessage(msgDashboard.declined)}</p>}
						</div>
					)}
				</div>
				<div className={subsidy.status != -2 ? '' : 'step-declined'}>
					<Steps current={this.checkCurrentStep(subsidy)} responsive={false} style={{ maxWidth: 600 }} items={[
						{ title: intl.formatMessage(messages.request), icon: (<p>1</p>) },
						{ title: intl.formatMessage(msgCreateAccount.school), icon: (<p>2</p>) },
						{ title: intl.formatMessage(messages.consultation), icon: (<p>3</p>) },
						{ title: intl.formatMessage(messages.decision), icon: (<p>4</p>) },
					]}>
					</Steps>
				</div>
				{this.renderSubsidyData(subsidy)}
			</Modal>
		);
	}
};

const mapStateToProps = state => ({
	listSubsidaries: state.appointments.dataSubsidyRequests,
	auth: state.auth,
})

export default compose(connect(mapStateToProps))(ModalSubsidyProgress);