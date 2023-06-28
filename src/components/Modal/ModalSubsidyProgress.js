import React from 'react';
import { Modal, Button, Divider, Steps, Row, Col, Select, Input, message, Popconfirm } from 'antd';
import { FaRegCalendarAlt } from 'react-icons/fa';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';
import moment from 'moment';
import { AiFillWarning } from 'react-icons/ai';

import messages from './messages';
import msgCreateAccount from 'routes/Sign/CreateAccount/messages';
import msgDashboard from 'routes/Dashboard/messages';
import msgDrawer from '../DrawerDetail/messages';
import request from 'utils/api/request'
import { url, switchPathWithRole } from 'utils/api/baseUrl'
import { acceptSubsidyRequest, appealSubsidy, denyAppealSubsidy, denySubsidyRequest, getLastConsulation, preApproveSubsidy, schoolAcceptAppealSubsidy, searchProvidersForAdmin, selectFinalProviderForSubsidy, updateApprovedRequest } from 'utils/api/apiList';
import { setSubsidyRequests } from 'src/redux/features/appointmentsSlice';
import ModalReferralService from './ModalReferralService';
import ModalCurrentReferralService from './ModalCurrentReferralService';
import ModalCreateNote from './ModalCreateNote';
import './style/index.less';
import '../../assets/styles/login.less';

class ModalSubsidyProgress extends React.Component {
	state = {
		subsidy: {},
		selectedProvider: undefined,
		decisionExplanation: "",
		selectedDate: moment(),
		selectedHour: undefined,
		selectedProviderFromAdmin: undefined,
		numberOfSessions: undefined,
		pricePerSession: undefined,
		parentWarning: '',
		consulationWarning: '',
		referral: {},
		visibleReferralService: false,
		visibleCurrentReferral: false,
		providers: [],
		otherProvider: '',
		visibleDeclineExplanation: false,
		totalPayment: undefined,
		subsidizedRate: undefined,
	}

	componentDidMount = () => {
		this.loadSubsidyData(this.props.subsidyId);
	}

	loadSubsidyData = (subsidyId) => {
		request.post(switchPathWithRole(this.props.auth.user?.role) + 'get_subsidy_detail', { subsidyId: subsidyId }).then(result => {
			const { success, data } = result;
			if (success) {
				this.setState({
					subsidy: data,
					numberOfSessions: data.numberOfSessions,
					pricePerSession: data.pricePerSession,
					totalPayment: data.pricePerSession * data.numberOfSessions,
					otherProvider: data.otherProvider,
					decisionExplanation: data.decisionExplanation ?? '',
				});
				this.loadLastReferral(data);
				this.searchProvider(data);
			} else {
				this.props.onCancel();
			}
		}).catch(err => {
			this.props.onCancel();
		})
	}

	searchProvider(subsidy) {
		request.post(searchProvidersForAdmin, { skill: subsidy?.skillSet?._id, dependentId: subsidy?.student?._id }).then(result => {
			const { data, success } = result;
			if (success) {
				const provider = data.providers?.find(p => p._id === subsidy.selectedProviderFromAdmin?._id);
				let level;

				if (['Pre-Nursery', 'Nursery', 'Kindergarten', 'Pre-1A'].includes(subsidy?.student?.currentGrade)) {
					level = provider?.academicLevel?.find(a => [subsidy?.student?.currentGrade, 'Early Education']?.includes(a.level));
				} else if (['Grades 1', 'Grades 2', 'Grades 3', 'Grades 4', 'Grades 5', 'Grades 6'].includes(subsidy?.student?.currentGrade)) {
					level = provider?.academicLevel?.find(a => [subsidy?.student?.currentGrade, 'Elementary Grades 1-6', 'Elementary Grades 1-8']?.includes(a.level));
				} else if (['Grades 7', 'Grades 8'].includes(subsidy?.student?.currentGrade)) {
					level = provider?.academicLevel?.find(a => [subsidy?.student?.currentGrade, 'Middle Grades 7-8', 'Elementary Grades 1-8']?.includes(a.level));
				} else if (['Grades 9', 'Grades 10', 'Grades 11', 'Grades 12'].includes(subsidy?.student?.currentGrade)) {
					level = provider?.academicLevel?.find(a => [subsidy?.student?.currentGrade, 'High School Grades 9-12']?.includes(a.level));
				} else {
					level = provider?.academicLevel?.find(a => a.level === subsidy?.student?.currentGrade);
				}

				this.setState({
					providers: data.providers ?? [],
					selectedProviderFromAdmin: subsidy.selectedProviderFromAdmin?._id,
					selectedProvider: subsidy.selectedProvider?._id,
					subsidizedRate: level ? level?.subsidizedRate ?? level?.rate : '',
				});
			}
		}).catch(() => {
			this.setState({ providers: [] });
		})
	}

	loadLastReferral = (subsidy) => {
		request.post(getLastConsulation, { subsidyId: subsidy?._id }).then(result => {
			if (result.success) {
				this.setState({ referral: result.data });
			} else {
				this.setState({ referral: {} });
			}
		}).catch(err => {
			this.setState({ referral: {} });
		})
	}

	declineSubsidy = (declineExplanation) => {
		if (declineExplanation?.trim()?.length) {
			this.onCloseModalDeclineExplanation();
			const { subsidy } = this.state;
			request.post(denySubsidyRequest, { subsidyId: subsidy._id, declineExplanation }).then(result => {
				const { success, data } = result;
				if (success) {
					this.updateSubsidiaries(subsidy, data);
					this.props.onSubmit();
				}
			}).catch(err => {
				message.error(err.message);
			})
		} else {
			message.warn("Please fill in the decline explaintion");
		}
	}

	adminPreApproveSubsidy(subsidy) {
		request.post(preApproveSubsidy, { subsidyId: subsidy?._id }).then(result => {
			const { success, data } = result;
			if (success) {
				this.updateSubsidiaries(subsidy, data);
				this.props.onSubmit();
			}
		}).catch(err => {
			message.error(err.message);
		})
	}

	schoolAcceptSubsidy(subsidy) {
		const { selectedProvider, decisionExplanation, otherProvider } = this.state;

		if ((!selectedProvider && !otherProvider) || decisionExplanation.length === 0) {
			this.setState({ parentWarning: 'Please suggest a provider and fill in decision explaintion' });
			return;
		}

		if (selectedProvider && otherProvider) {
			this.setState({ parentWarning: 'Please select only one provider' });
			return;
		}

		this.setState({ parentWarning: '' });
		request.post(acceptSubsidyRequest, {
			subsidyId: subsidy._id,
			student: subsidy?.student?._id,
			selectedProvider,
			decisionExplanation,
			otherProvider,
		}).then(result => {
			message.success('Approved successfully');
			const { success, data } = result;
			if (success) {
				this.updateSubsidiaries(subsidy, data);
				this.props.onSubmit();
			}
		}).catch(err => {
			message.error(err.message);
		})
	}

	submitSubsidyFromAdmin = (subsidy) => {
		const { selectedProviderFromAdmin, numberOfSessions, pricePerSession } = this.state;
		const postData = {
			selectedProviderFromAdmin,
			numberOfSessions,
			pricePerSession,
			approvalDate: moment(),
			subsidyId: subsidy?._id,
		}
		if (!selectedProviderFromAdmin || !numberOfSessions || !pricePerSession) {
			message.error('please fill all reuired field');
			return;
		}
		request.post(selectFinalProviderForSubsidy, postData).then(result => {
			if (result.success) {
				this.updateSubsidiaries(subsidy, result.data);
				this.props.onSubmit();
			}
		}).catch(err => {
			message.error(err.message);
		})
	}

	appealSubsidy = (subsidy) => {
		const postData = { subsidyId: subsidy._id };
		request.post(appealSubsidy, postData).then(result => {
			message.success('Your appeal has been sent successfully');
			const { success, data } = result;
			if (success) {
				this.updateSubsidiaries(subsidy, data);
				this.props.onSubmit();
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
			const { success, data } = result;
			if (success) {
				this.updateSubsidiaries(subsidy, data);
				this.loadSubsidyData(subsidy._id);
			}
		}).catch(err => {
			message.error(err.message);
		})
	}

	schoolAcceptAppeal = (subsidy) => {
		const postData = { subsidyId: subsidy._id };
		request.post(schoolAcceptAppealSubsidy, postData).then(result => {
			const { success, data } = result;
			if (success) {
				this.updateSubsidiaries(subsidy, data);
				this.props.onSubmit();
			}
		}).catch(err => {
			message.error(err.message);
		})
	}

	schoolEditApprovedRequest(subsidy) {
		const { selectedProvider, decisionExplanation, otherProvider } = this.state;

		if ((!selectedProvider && !otherProvider) || decisionExplanation.length === 0) {
			this.setState({ parentWarning: 'Please suggest a provider and fill in decision explaintion' });
			return;
		}

		if (selectedProvider && otherProvider) {
			this.setState({ parentWarning: 'Please select only one provider' });
			return;
		}

		this.setState({ parentWarning: '' });
		request.post(updateApprovedRequest, {
			subsidyId: subsidy._id,
			student: subsidy?.student?._id,
			selectedProvider,
			decisionExplanation,
			otherProvider,
		}).then(result => {
			message.success('Updated successfully');
			const { success, data } = result;
			if (success) {
				this.updateSubsidiaries(subsidy, data);
				this.props.onSubmit();
			}
		}).catch(err => {
			message.error(err.message);
		})
	}

	updateSubsidiaries(subsidy, data) {
		const newSubsidyRequests = JSON.parse(JSON.stringify(this.props.listSubsidiaries));
		this.props.setSubsidyRequests(newSubsidyRequests?.map(s => {
			if (s._id === subsidy._id) {
				s.status = data.status;
				s.isAppeal = data.isAppeal;
				s.selectedProvider = data.selectedProvider;
				s.otherProvider = data.otherProvider;
			}
			return s;
		}));
	}

	onShowModalReferral = () => {
		this.setState({ visibleReferralService: true });
	};

	onCloseModalReferral = () => {
		this.setState({ visibleReferralService: false });
	};

	onSubmitModalReferral = () => {
		this.onCloseModalReferral();
		message.success({
			content: intl.formatMessage(msgDashboard.appointmentScheduled),
			className: 'popup-scheduled',
		});
		this.props.onSubmit();
	}

	onShowModalCurrentReferral = () => {
		this.setState({ visibleCurrentReferral: true });
	};

	onCloseModalCurrentReferral = () => {
		this.setState({ visibleCurrentReferral: false });
	};

	onSubmitModalCurrentReferral = () => {
		this.onCloseModalCurrentReferral();
		message.success("Rescheduled successfully");
		this.props.onSubmit();
	}

	onShowModalDeclineExplanation = () => {
		this.setState({ visibleDeclineExplanation: true });
	};

	onCloseModalDeclineExplanation = () => {
		this.setState({ visibleDeclineExplanation: false });
	};

	handleSelectProvider = (providerId) => {
		const { providers, subsidy } = this.state;
		const provider = providers?.find(p => p._id === providerId);
		let level;

		if (['Pre-Nursery', 'Nursery', 'Kindergarten', 'Pre-1A'].includes(subsidy?.student?.currentGrade)) {
			level = provider?.academicLevel?.find(a => [subsidy?.student?.currentGrade, 'Early Education']?.includes(a.level));
		} else if (['Grades 1', 'Grades 2', 'Grades 3', 'Grades 4', 'Grades 5', 'Grades 6'].includes(subsidy?.student?.currentGrade)) {
			level = provider?.academicLevel?.find(a => [subsidy?.student?.currentGrade, 'Elementary Grades 1-6', 'Elementary Grades 1-8']?.includes(a.level));
		} else if (['Grades 7', 'Grades 8'].includes(subsidy?.student?.currentGrade)) {
			level = provider?.academicLevel?.find(a => [subsidy?.student?.currentGrade, 'Middle Grades 7-8', 'Elementary Grades 1-8']?.includes(a.level));
		} else if (['Grades 9', 'Grades 10', 'Grades 11', 'Grades 12'].includes(subsidy?.student?.currentGrade)) {
			level = provider?.academicLevel?.find(a => [subsidy?.student?.currentGrade, 'High School Grades 9-12']?.includes(a.level));
		} else {
			level = provider?.academicLevel?.find(a => a.level === subsidy?.student?.currentGrade);
		}
		this.setState({ selectedProviderFromAdmin: providerId, subsidizedRate: level?.subsidizedRate ?? level?.rate });
	}

	renderStudentParentInfo(subsidy) {
		const { student, documents, skillSet, ravEmail, ravName, ravPhone } = subsidy;
		return (<div className='parent-info'>
			<p className='font-20 font-700'>{intl.formatMessage(messages.parentInformation)}</p>
			<Row gutter={15}>
				<Col xs={24} sm={24} md={12}>
					<p className='font-700'>{intl.formatMessage(messages.dependentInfo)}</p>
					<div className='count-2'>
						<p className='font-12'>Dependent: <b>{student.firstName} {student.lastName}</b></p>
						<p className='font-12'>School: {student.school?.name}</p>
						<p className='font-12'>Service: {skillSet?.name}</p>
						<p className='font-12'>Age: {moment().year() - moment(student.birthday).year()}</p>
						<p className='font-12'>Grade: {student.currentGrade}</p>
						<p className='font-12'>Teacher: {student.primaryTeacher}</p>
					</div>
				</Col>
				<Col xs={24} sm={24} md={12}>
					<p className='font-700'>{intl.formatMessage(messages.otherContacts)}</p>
					<p className='font-12'>Rav name: {ravName}</p>
					<p className='font-12'>Rav phone: {ravPhone}</p>
					<p className='font-12'>Rav email: {ravEmail}</p>
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

	renderSchoolInfo = (subsidy) => {
		const { decisionExplanation, selectedProvider, providers, otherProvider } = this.state;
		const { user } = this.props.auth;

		if (user?.role === 3 && subsidy.status === 0) {
			return null;
		}

		return (
			<div className='school-info'>
				<div className={`flex flex-row justify-between ${subsidy.status === 2 ? 'd-none' : ''}`}>
					<p className='font-20 font-700'>{intl.formatMessage(messages.schoolInformation)}</p>
				</div>
				{((subsidy.status === 0) || (subsidy.status === 1 && user?.role > 3)) ? (
					<Row gutter={15}>
						<Col xs={24} sm={24} md={8}>
							<p className='font-700 mb-10'>{intl.formatMessage(messages.recommendedProviders)}</p>
							<div className='select-md'>
								<Select
									disabled={user.role === 3}
									onChange={v => this.setState({ selectedProvider: v, otherProvider: undefined })}
									value={selectedProvider}
									allowClear
									onClear={() => this.setState({ selectedProvider: undefined })}
									className='mb-10'
									placeholder={intl.formatMessage(msgCreateAccount.provider)}
								>
									{providers?.filter(provider => provider?.skillSet?.find(skill => skill?._id === subsidy?.skillSet?._id))?.map((provider) => (
										<Select.Option key={provider._id} value={provider._id}>{`${provider.firstName} ${provider.lastName}` || provider.referredToAs}</Select.Option>
									))}
								</Select>
							</div>
							<p className='font-700 mb-10'>{intl.formatMessage(messages.otherProvider)}</p>
							<div className='select-md'>
								<Input name='OtherProvider' value={otherProvider} onChange={e => this.setState({ otherProvider: e.target.value, selectedProvider: undefined })} disabled={user.role === 3} placeholder={intl.formatMessage(messages.otherProvider)} />
							</div>
						</Col >
						<Col xs={24} sm={24} md={16}>
							<p className='font-700 mb-10'>{intl.formatMessage(messages.decisionExplanation)}</p>
							<Input.TextArea
								name='DecisionExplanation'
								value={decisionExplanation}
								disabled={user.role === 3}
								onChange={e => this.setState({ decisionExplanation: e.target.value })}
								rows={5} placeholder={intl.formatMessage(messages.generalNotes)} />
						</Col>
					</Row >
				) : subsidy.status === 2 ? (
					<>
						<p className='font-700 mb-10'>{intl.formatMessage(messages.declineExplanation)}:</p>
						<p className='mb-0'>{subsidy.declineExplanation}</p>
					</>
				) : (
					<Row gutter={15}>
						<Col xs={24} sm={24} md={8}>
							{subsidy.selectedProvider ? (
								<>
									<p className='font-700 mb-10'>{intl.formatMessage(messages.recommendedProviders)}:</p>
									<p className='mb-0'>{`${subsidy.selectedProvider?.firstName} ${subsidy.selectedProvider?.lastName}`}</p>
								</>
							) : null}
							{subsidy.otherProvider ? (
								<>
									<p className='font-700 mb-10'>{intl.formatMessage(messages.otherProvider)}:</p>
									<p className='mb-0'>{otherProvider}</p>
								</>
							) : null}
						</Col >
						<Col xs={24} sm={24} md={16}>
							<p className='font-700 mb-10'>{intl.formatMessage(messages.decisionExplanation)}:</p>
							<p className='mb-0'>{decisionExplanation}</p>
						</Col>
					</Row >
				)}
			</div>
		)
	}

	renderConsulation = (subsidy) => {
		const { referral } = this.state;

		if ([3, 5].includes(subsidy.status)) {
			if (!referral?.meetingLink && !referral?.phoneNumber) {
				return (
					<div className='consulation-appoint'>
						<div className='flex flex-row justify-between'>
							<Col xs={24} sm={24} md={12}>
								<p className='font-20 font-700 mb-10'>{intl.formatMessage(messages.consultationAppointment)}</p>
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
					<p className='font-20 font-700'>{intl.formatMessage(messages.consultationAppointment)}</p>
					<div className='flex flex-row justify-between'>
						<Col xs={24} sm={24} md={12}>
							{referral.meetingLink ? (
								<p>
									<span className='font-700'>{intl.formatMessage(msgDrawer.meeting)}:</span> <a href={referral.meetingLink} target='_blank'>{referral.meetingLink}</a>
								</p>
							) : null}
							{referral.phoneNumber ? (
								<p>
									<span className='font-700'>{intl.formatMessage(msgDrawer.phonenumber)}:</span> {referral.phoneNumber}
								</p>
							) : null}
						</Col>
						<Col xs={24} sm={24} md={12}>
							<div className='flex flex-row items-center'>
								{[0, -2].includes(referral?.status) ? (
									<a className='text-primary' onClick={this.onShowModalCurrentReferral}>
										<FaRegCalendarAlt /> {intl.formatMessage(msgDrawer.reschedule)}
									</a>
								) : referral?.status === -1 ? <span className='font-16'>{intl.formatMessage(msgDrawer.closed)}</span>
									: <span className='font-16'>{intl.formatMessage(msgDashboard.declined)}</span>}
							</div>
						</Col>
					</div>
					<div className='flex flex-row justify-between'>
						{referral.date ? <p><span className='font-700'>{intl.formatMessage(messages.dateTime)}:</span> {moment(referral.date).format('MM/DD/YYYY HH:mm A')}</p> : null}
					</div>
				</div>
			)
		}
	}

	renderDecision(subsidy) {
		const { selectedProviderFromAdmin, numberOfSessions, pricePerSession, referral, providers, totalPayment, subsidizedRate } = this.state;
		const { user } = this.props.auth;
		const isNotAdmin = user?.role < 900;

		if (subsidy.status === 4) {
			return (
				<div className='subsidy-detail'>
					<p className='font-700 mb-10'>{intl.formatMessage(messages.declineExplanation)}:</p>
					<p className='mb-0'>{subsidy.declineExplanation}</p>
				</div >
			)
		}

		if (isNotAdmin || (!isNotAdmin && referral?.status != -1)) {
			return;
		}

		return (
			<div className='subsidy-detail'>
				<div className='flex flex-row justify-between'>
					<p className='font-20 font-700'>{intl.formatMessage(messages.subsidyDetails)}</p>
				</div>
				<Row gutter={15}>
					<Col xs={24} sm={24} md={8} className='flex flex-col justify-between'>
						<p className='font-700'>*{intl.formatMessage(msgCreateAccount.provider)}</p>
						<Select
							disabled={isNotAdmin}
							value={selectedProviderFromAdmin}
							onChange={v => this.handleSelectProvider(v)}
							placeholder={intl.formatMessage(msgCreateAccount.provider)}
							className='pb-10'
						>
							{providers?.map((provider, index) => (
								<Select.Option key={index} value={provider?._id}>{provider?.firstName ?? ''} {provider?.lastName ?? ''}</Select.Option >
							))}
						</Select>
						<p className='font-700'>*{intl.formatMessage(messages.subsidizedRate)}</p>
						<p className='h-40 flex items-center mb-0 ml-10'>$ {subsidizedRate}</p>
					</Col>
					<Col xs={24} sm={24} md={8} className='flex flex-col justify-between'>
						<p className='font-700'>*{intl.formatMessage(messages.numberApprovedSessions)}</p>
						<Input
							name='NumberOfSessions'
							disabled={isNotAdmin}
							value={numberOfSessions}
							type="number"
							min={0}
							className='h-40 mb-10'
							onKeyDown={(e) => {
								(e.key === '-' || e.key === 'Subtract' || e.key === '.' || e.key === 'e') && e.preventDefault();
								if (e.key > -1 && e.key < 10 && e.target.value === '0') {
									e.target.value = '';
								}
							}}
							onChange={e => this.setState({ numberOfSessions: e.target.value, totalPayment: e.target.value * pricePerSession })}
						/>
						<p className='font-700'>*{intl.formatMessage(messages.hmghExpensePerSession)}</p>
						<Input
							name='PricePerSession'
							disabled={isNotAdmin}
							value={pricePerSession}
							type="number"
							min={0}
							className='h-40'
							addonBefore="$"
							onKeyDown={(e) => {
								(e.key === '-' || e.key === 'Subtract' || e.key === '.' || e.key === 'e') && e.preventDefault();
								if (e.key > -1 && e.key < 10 && e.target.value === '0') {
									e.target.value = '';
								}
							}}
							onChange={e => this.setState({ pricePerSession: e.target.value, totalPayment: e.target.value * numberOfSessions })}
						/>
					</Col>
					<Col xs={24} sm={24} md={8} className='flex flex-col justify-end'>
						<p className='font-700'>*{intl.formatMessage(messages.totalPayment)}</p>
						<Input
							name='TotalPayment'
							value={totalPayment}
							type="number"
							min={0}
							addonBefore="$"
							onKeyDown={(e) => {
								(e.key === '-' || e.key === 'Subtract' || e.key === '.' || e.key === 'e') && e.preventDefault();
								if (e.key > -1 && e.key < 10 && e.target.value === '0') {
									e.target.value = '';
								}
							}}
							onChange={e => this.setState({ totalPayment: e.target.value, pricePerSession: numberOfSessions > 0 ? e.target.value / numberOfSessions : 0 })}
							className='h-40'
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
				{subsidy.school && this.renderSchoolInfo(subsidy)}
				{this.renderConsulation(subsidy)}
				{this.renderDecision(subsidy)}
			</div>
		)
	}

	checkCurrentStep = (subsidy) => {
		const { referral } = this.state;

		switch (subsidy?.status) {
			case 0: return 0;
			case 1: case 2: return 1;
			case 3: return referral?.status === -1 ? 3 : 2;
			case 4: return 2;
			case 5: return 3;
			default: return 0;
		}
	}

	footerButton() {
		const { subsidy, parentWarning, referral } = this.state;
		const { user } = this.props.auth;

		if (subsidy?.status === 0 && (user?.role === 60 || user?.role > 900)) {
			return [
				<div key="warning">{parentWarning.length > 0 ? (
					<p className='text-red'>{parentWarning}</p>
				) : null}</div>,
				<Button key="back" type='link' onClick={this.props.onCancel}>
					{intl.formatMessage(messages.goBack).toUpperCase()}
				</Button>,
				<Popconfirm
					key="decline"
					icon={<AiFillWarning size={24} />}
					title="Are you sure to decline this request?"
					onConfirm={this.onShowModalDeclineExplanation}
					okText="Yes"
					cancelText="No"
				>
					<Button key="decline" className='mr-10'>
						{intl.formatMessage(messages.decline).toUpperCase()}
					</Button>
				</Popconfirm>,
				<Popconfirm
					key="approve"
					icon={<AiFillWarning size={24} />}
					title="Are you sure to approve this request?"
					onConfirm={() => subsidy.school ? this.schoolAcceptSubsidy(subsidy) : this.adminPreApproveSubsidy(subsidy)}
					okText="Yes"
					cancelText="No"
				>
					<Button key="approve" type='primary'>
						{subsidy?.school ? intl.formatMessage(messages.approve).toUpperCase() : intl.formatMessage(messages.preapprove).toUpperCase()}
					</Button>
				</Popconfirm>,
			]
		}

		if (subsidy?.status === 1 && user.role > 900) {
			return [
				<div key="warning">{parentWarning.length > 0 ? (
					<p className='text-red'>{parentWarning}</p>
				) : null}</div>,
				<Button key="back" type='link' onClick={this.props.onCancel}>
					{intl.formatMessage(messages.goBack).toUpperCase()}
				</Button>,
				<Popconfirm
					key="decline"
					icon={<AiFillWarning size={24} />}
					title="Are you sure to decline this request?"
					onConfirm={this.onShowModalDeclineExplanation}
					okText="Yes"
					cancelText="No"
				>
					<Button key="decline" className='mr-10'>
						{intl.formatMessage(messages.decline).toUpperCase()}
					</Button>
				</Popconfirm>,
				<Popconfirm
					key="edit"
					icon={<AiFillWarning size={24} />}
					title="Are you sure to update this request?"
					onConfirm={() => this.schoolEditApprovedRequest(subsidy)}
					okText="Yes"
					cancelText="No"
				>
					<Button key="edit" type='primary' className='mr-10'>
						{intl.formatMessage(messages.edit).toUpperCase()}
					</Button>
				</Popconfirm>,
				<Popconfirm
					key="pareapprove"
					icon={<AiFillWarning size={24} />}
					title="Are you sure to approve this request?"
					onConfirm={() => this.adminPreApproveSubsidy(subsidy)}
					okText="Yes"
					cancelText="No"
				>
					<Button key="preapprove" type='primary' className='mr-10'>
						{intl.formatMessage(messages.preapprove).toUpperCase()}
					</Button>
				</Popconfirm>,
			]
		}

		if (subsidy?.status === 1 && user.role === 60) {
			return [
				<div key="warning">{parentWarning.length > 0 ? (
					<p className='text-red'>{parentWarning}</p>
				) : null}</div>,
				<Button key="back" type='link' onClick={this.props.onCancel}>
					{intl.formatMessage(messages.goBack).toUpperCase()}
				</Button>,
				<Popconfirm
					key="decline"
					icon={<AiFillWarning size={24} />}
					title="Are you sure to decline this request?"
					onConfirm={this.onShowModalDeclineExplanation}
					okText="Yes"
					cancelText="No"
				>
					<Button key="decline" className='mr-10'>
						{intl.formatMessage(messages.decline).toUpperCase()}
					</Button>
				</Popconfirm>,
				<Popconfirm
					key="edit"
					icon={<AiFillWarning size={24} />}
					title="Are you sure to update this request?"
					onConfirm={() => this.schoolEditApprovedRequest(subsidy)}
					okText="Yes"
					cancelText="No"
				>
					<Button key="edit" type='primary' className='mr-10'>
						{intl.formatMessage(messages.edit).toUpperCase()}
					</Button>
				</Popconfirm>,
			]
		}

		if ([2, 4].includes(subsidy?.status) && subsidy?.isAppeal === -1) {
			return [
				<Button key="back" type='link' onClick={this.props.onCancel}>
					{intl.formatMessage(messages.goBack).toUpperCase()}
				</Button>,
				<span key="appealed">
					{intl.formatMessage(msgDashboard.declined).toUpperCase()}
				</span>
			]
		}

		if ([2, 4].includes(subsidy?.status) && subsidy?.isAppeal === 0 && (user?.role === 3 || user?.role > 900)) {
			return [
				<Button key="back" type='link' onClick={this.props.onCancel}>
					{intl.formatMessage(messages.goBack).toUpperCase()}
				</Button>,
				<Popconfirm
					key="submit"
					icon={<AiFillWarning size={24} />}
					title="Are you sure to appeal?"
					onConfirm={() => this.appealSubsidy(subsidy)}
					okText="Yes"
					cancelText="No"
				>
					<Button key="submit" type="primary" style={{ padding: '7.5px 30px' }}>
						{intl.formatMessage(messages.appeal).toUpperCase()}
					</Button>
				</Popconfirm>
			]
		}

		if ([2, 4].includes(subsidy?.status) && subsidy?.isAppeal === 1 && user?.role === 3) {
			return [
				<Button key="back" type='link' onClick={this.props.onCancel}>
					{intl.formatMessage(messages.goBack).toUpperCase()}
				</Button>,
				<span key="appealed">
					{intl.formatMessage(messages.appealed).toUpperCase()}
				</span>
			]
		}

		if ([2, 4].includes(subsidy?.status) && subsidy?.isAppeal > 0 && (user?.role === 60 || user?.role > 900)) {
			return [
				<div key="warning">User has sent appeal for this, please choose an action </div>,
				<Button key="back" type='link' onClick={this.props.onCancel}>
					{intl.formatMessage(messages.goBack).toUpperCase()}
				</Button>,
				<Popconfirm
					key="decline"
					icon={<AiFillWarning size={24} />}
					title="Are you sure to decline this appeal?"
					onConfirm={() => this.denyAppeal(subsidy)}
					okText="Yes"
					cancelText="No"
				>
					<Button key="decline" className='mr-10'>
						{intl.formatMessage(messages.decline).toUpperCase()}
					</Button>
				</Popconfirm>,
				<Popconfirm
					key="approve"
					icon={<AiFillWarning size={24} />}
					title="Are you sure to approve this appeal?"
					onConfirm={() => this.schoolAcceptAppeal(subsidy)}
					okText="Yes"
					cancelText="No"
				>
					<Button key="approve" type='primary'>
						{intl.formatMessage(messages.accept).toUpperCase()}
					</Button>
				</Popconfirm>,
			]
		}

		if ((subsidy?.status === 3 && user?.role > 900 && [-1, -2].includes(referral?.status)) || subsidy?.status === 5) {
			return [
				<Button key="back" type='link' onClick={this.props.onCancel}>
					{intl.formatMessage(messages.goBack).toUpperCase()}
				</Button>,
				<Popconfirm
					key="decline"
					icon={<AiFillWarning size={24} />}
					title="Are you sure to decline this request?"
					onConfirm={this.onShowModalDeclineExplanation}
					okText="Yes"
					cancelText="No"
				>
					<Button key="decline" className='mr-10'>
						{intl.formatMessage(messages.decline).toUpperCase()}
					</Button>
				</Popconfirm>,
				<Popconfirm
					key="approve"
					icon={<AiFillWarning size={24} />}
					title="Are you sure to approve this request?"
					onConfirm={() => this.submitSubsidyFromAdmin(subsidy)}
					okText="Yes"
					cancelText="No"
				>
					<Button key="approve" type='primary'>
						{subsidy?.status === 5 ? intl.formatMessage(messages.edit).toUpperCase() : intl.formatMessage(messages.approve).toUpperCase()}
					</Button>
				</Popconfirm>,
			]
		}

		return null;
	}

	render() {
		const { subsidy, visibleReferralService, visibleCurrentReferral, referral, visibleDeclineExplanation } = this.state;
		const modalProps = {
			className: 'modal-subsidy-progress',
			title: "",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: this.props.onCancel,
			closable: true,
			width: 900,
			footer: this.footerButton(),
		};
		const modalReferralServiceProps = {
			visible: visibleReferralService,
			onSubmit: this.onSubmitModalReferral,
			onCancel: this.onCloseModalReferral,
			subsidy: subsidy,
		};
		const modalCurrentReferralProps = {
			visible: visibleCurrentReferral,
			onSubmit: this.onSubmitModalCurrentReferral,
			onCancel: this.onCloseModalCurrentReferral,
			event: referral,
		}
		const modalDeclineExplanationProps = {
			visible: visibleDeclineExplanation,
			onSubmit: this.declineSubsidy,
			onCancel: this.onCloseModalDeclineExplanation,
			title: intl.formatMessage(messages.declineExplanation),
		}

		return (
			<Modal {...modalProps}>
				<div className='relative flex flex-row mb-20'>
					<div className='flex-1 text-center'>
						<p className='font-30 font-30-sm'>{intl.formatMessage(messages.subsidyProgress)}</p>
					</div>
					{subsidy.status != 0 && (
						<div className='absolute right-0 top-0'>
							{[1, 3, 5].includes(subsidy.status) && <p className='text-green500 font-24 font-700 ml-auto'>{(subsidy?.status === 1) ? intl.formatMessage(msgCreateAccount.school) : intl.formatMessage(msgCreateAccount.admin)} {subsidy?.status === 3 ? intl.formatMessage(msgDashboard.preApproved) : intl.formatMessage(msgDashboard.approved)}</p>}
							{[2, 4].includes(subsidy.status) && <p className='text-red font-24 font-700 ml-auto'>{(subsidy?.status === 2) ? intl.formatMessage(msgCreateAccount.school) : intl.formatMessage(msgCreateAccount.admin)} {intl.formatMessage(msgDashboard.declined)}</p>}
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
				{visibleReferralService && <ModalReferralService {...modalReferralServiceProps} />}
				{visibleCurrentReferral && <ModalCurrentReferralService {...modalCurrentReferralProps} />}
				{visibleDeclineExplanation && <ModalCreateNote {...modalDeclineExplanationProps} />}
				{this.renderSubsidyData(subsidy)}
			</Modal>
		);
	}
};

const mapStateToProps = state => ({
	listSubsidiaries: state.appointments.dataSubsidyRequests,
	auth: state.auth,
})

export default compose(connect(mapStateToProps, { setSubsidyRequests }))(ModalSubsidyProgress);