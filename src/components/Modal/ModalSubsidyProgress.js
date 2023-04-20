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
import msgDrawer from '../DrawerDetail/messages';
import request from '../../utils/api/request'
import { url, switchPathWithRole } from '../../utils/api/baseUrl'
import { acceptSubsidyRequest, appealSubsidy, denyAppealSubsidy, denySubsidyRequest, getLastConsulation, preApproveSubsidy, schoolAcceptAppeal, schoolAcceptAppealSubsidy } from '../../utils/api/apiList';
import { setSubsidyRequests } from '../../redux/features/appointmentsSlice';
import ModalReferralService from './ModalReferralService';
import ModalCurrentReferralService from './ModalCurrentReferralService';
import './style/index.less';
import '../../assets/styles/login.less';

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
		visiblReferralService: false,
		visibleCurrentReferral: false,
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

	adminPreApproveSubsidy(subsidy) {
		request.post(preApproveSubsidy, { subsidyId: subsidy?._id }).then(result => {
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

	onShowModalReferral = () => {
		this.setState({ visiblReferralService: true });
	};

	onCloseModalReferral = () => {
		this.setState({ visiblReferralService: false });
	};

	onSubmitModalReferral = () => {
		this.onCloseModalReferral();
		message.success({
			content: intl.formatMessage(msgDashboard.appointmentScheduled),
			className: 'popup-scheduled',
		});
	}

	onShowModalCurrentReferral = () => {
		this.setState({ visibleCurrentReferral: true });
	};

	onCloseModalCurrentReferral = () => {
		this.setState({ visibleCurrentReferral: false });
	};

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
				</div>
				<Row gutter={15}>
					<Col xs={24} sm={24} md={8}>
						<p className='font-700 mb-10'>{intl.formatMessage(messages.recommendedProviders)}</p>
						<div className='select-md'>
							<Select
								disabled={user.role === 3 || subsidy.status > 1}
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
							disabled={user.role === 3 || subsidy.status > 1}
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
			if (!referral?.meetingLink && !referral?.phoneNumber) {
				return (
					<div className='consulation-appoint'>
						<div className='flex flex-row justify-between'>
							<Col xs={24} sm={24} md={12}>
								<p className='font-20 font-700 mb-10'>{intl.formatMessage(messages.consulationAppointment)}</p>
							</Col>
							<Col xs={24} sm={24} md={12}>
								<div className='flex flex-row items-center'>
									<div className='flex flex-row items-center'>
										<a className='text-primary' onClick={this.onShowModalReferral}>
											<FaRegCalendarAlt /> {intl.formatMessage(messages.schedule)}
										</a>
									</div>
								</div>
							</Col>
						</div>
					</div>
				);
			}
			return (
				<div className='consulation-appoint'>
					<p className='font-20 font-700'>{intl.formatMessage(messages.consulationAppointment)}</p>
					<div className='flex flex-row justify-between'>
						<Col xs={24} sm={24} md={12}>
							{referral.meetingLink ? (
								<p>
									<span className='font-700'>{intl.formatMessage(msgDrawer.meeting)}</span>: <a>{referral.meetingLink}</a>
								</p>
							) : null}
							{referral.phoneNumber ? (
								<p>
									<span className='font-700'>{intl.formatMessage(msgDrawer.phonenumber)}</span>: {referral.phoneNumber}
								</p>
							) : null}
						</Col>
						<Col xs={24} sm={24} md={12}>
							<div className='flex flex-row items-center'>
								<a className='text-primary' onClick={this.onShowModalCurrentReferral}>
									<FaRegCalendarAlt /> {intl.formatMessage(msgDrawer.reschedule)}
								</a>
							</div>
						</Col>
					</div>
					<div className='flex flex-row justify-between'>
						{referral.date ? <p><span className='font-700'>{intl.formatMessage(messages.dateTime)}</span>: {moment(referral.date).format('YYYY-MM-DD HH:mm A')}</p> : null}
					</div>
				</div>
			)
		}
	}

	renderDecision(subsidy) {
		const { selectProviderFromAdmin, numberOfSessions, priceForSession } = this.state;
		const { user, providers } = this.props.auth;
		const isNotAdmin = user?.role < 900;
		if (isNotAdmin || (!isNotAdmin && subsidy?.consultation?.status != -1)) {
			return;
		}

		return (
			<div className='subsidy-detail'>
				<div className='flex flex-row justify-between'>
					<p className='font-20 font-700'>{intl.formatMessage(messages.subsidyDetails)}</p>
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
							{providers?.map((provider, index) => (
								<Select.Option key={index} value={provider?._id}>{provider?.firstName ?? ''} {provider?.lastName ?? ''}</Select.Option >
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
		switch (subsidy?.status) {
			case 0: return 0;
			case 1: case 2: return 1;
			case 3: case 4: return 2;
			case 5: return 3;
			default: return 0;
		}
	}

	footerButton() {
		const { subsidy, parentWarning } = this.state;
		const { user } = this.props.auth;

		if (subsidy?.status === 0 && (user?.role === 60 || user?.role > 900)) {
			return [
				<>{parentWarning.length > 0 ? (
					<div className='flex flex-row items-center'>
						<p className='text-red'>{parentWarning}</p>
					</div>
				) : null}</>,
				<Button key="decline" onClick={() => this.schoolDenySubsidy(subsidy)} className='mr-10'>
					{intl.formatMessage(messages.decline).toUpperCase()}
				</Button>,
				<Button key="approve" onClick={() => this.schoolAcceptSubsidy(subsidy)} type='primary'>
					{intl.formatMessage(messages.approve).toUpperCase()}
				</Button>
			]
		}

		if (subsidy?.status === 1 && user.role > 900) {
			return [
				<>{parentWarning.length > 0 ? (
					<div className='flex flex-row items-center'>
						<p className='text-red'>{parentWarning}</p>
					</div>
				) : null}</>,
				<Button key="decline" onClick={() => this.adminDenySubsidy(subsidy)} className='mr-10'>
					{intl.formatMessage(messages.decline).toUpperCase()}
				</Button>,
				<Button key="preapprove" onClick={() => this.adminPreApproveSubsidy(subsidy)} type='primary' className='mr-10'>
					{intl.formatMessage(messages.preapprove).toUpperCase()}
				</Button>
			]
		}

		if ([2, 4].includes(subsidy?.status) && subsidy?.isAppeal === 0 && (user?.role === 3 || user?.role > 900)) {
			return [
				<Button key="back" onClick={this.props.onCancel}>
					CLOSE
				</Button>,
				<Button key="submit" type="primary" onClick={() => this.appealSubsidy(subsidy)} style={{ padding: '7.5px 30px' }}>
					{intl.formatMessage(messages.appeal).toUpperCase()}
				</Button>
			]
		}

		if ([2, 4].includes(subsidy?.status) && subsidy?.isAppeal > 0 && (user?.role === 60 || user?.role > 900)) {
			return [
				<p>User has sent appeal for this, please choose an action </p>,
				<Button key="decline" onClick={() => this.denyAppeal(subsidy)} className='mr-10'>
					{intl.formatMessage(messages.decline).toUpperCase()}
				</Button>,
				<Button key="approve" onClick={() => this.schoolAcceptAppeal(subsidy)} type='primary'>
					{intl.formatMessage(messages.approve).toUpperCase()}
				</Button>
			]
		}

		if (subsidy?.status === 3 && user?.role > 900 && subsidy?.consultation?.status === -1) {
			return [
				<Button key="decline" onClick={() => this.adminDenySubsidy(subsidy)} size='small' className='mr-10'>
					{intl.formatMessage(messages.decline).toUpperCase()}
				</Button>,
				<Button key="approve" onClick={() => this.submitSubsidyFromAdmin(subsidy)} size='small' type='primary'>
					{intl.formatMessage(messages.approve).toUpperCase()}
				</Button>
			]
		}

		return null;
	}

	render() {
		const { subsidy, visiblReferralService, visibleCurrentReferral, referral } = this.state;
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
		const modalReferralServiceProps = {
			visible: visiblReferralService,
			onSubmit: this.onSubmitModalReferral,
			onCancel: this.onCloseModalReferral,
			subsidy: subsidy,
		};
		const modalCurrentReferralProps = {
			visible: visibleCurrentReferral,
			onSubmit: this.onCloseModalCurrentReferral,
			onCancel: this.onCloseModalCurrentReferral,
			event: referral,
		}

		return (
			<Modal {...modalProps}>
				<div className='relative flex flex-row mb-20'>
					<div className='flex-1 text-center'>
						<p className='font-30 font-30-sm'>{intl.formatMessage(messages.subsidyProgress)}</p>
					</div>
					{subsidy.status != 0 && (
						<div className='absolute right-0 top-0'>
							{[1, 3, 5].includes(subsidy.status) && <p className='text-green500 font-24 font-700 ml-auto'>{(subsidy?.status === 1 && this.props.auth.user?.role > 900) ? intl.formatMessage(msgCreateAccount.school) : ''} {subsidy?.status === 3 ? intl.formatMessage(msgDashboard.preApproved) : intl.formatMessage(msgDashboard.approved)}</p>}
							{[2, 4].includes(subsidy.status) && <p className='text-red font-24 font-700 ml-auto'>{(subsidy?.status === 2 && this.props.auth.user?.role > 900) ? intl.formatMessage(msgCreateAccount.school) : ''} {intl.formatMessage(msgDashboard.declined)}</p>}
						</div>
					)}
				</div>
				<div className={[2, 4].includes(subsidy.status) ? 'step-declined' : ''}>
					<Steps current={this.checkCurrentStep(subsidy)} responsive={false} style={{ maxWidth: 600 }} items={[
						{ title: intl.formatMessage(messages.request), icon: (<p>1</p>) },
						{ title: intl.formatMessage(msgCreateAccount.school), icon: (<p>2</p>) },
						{ title: intl.formatMessage(messages.consultation), icon: (<p>3</p>) },
						{ title: intl.formatMessage(messages.decision), icon: (<p>4</p>) },
					]}>
					</Steps>
				</div>
				{visiblReferralService && <ModalReferralService {...modalReferralServiceProps} />}
				{visibleCurrentReferral && <ModalCurrentReferralService {...modalCurrentReferralProps} />}
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