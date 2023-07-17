import React from 'react';
import { Row, Col, Button, message, Card, Switch } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Cookies from 'js-cookie';

import messages from 'routes/Sign/CreateAccount/messages';
import request from 'utils/api/request';
import { updateNotificationSetting, userSignUp } from 'utils/api/apiList';
import { socketUrl } from 'utils/api/baseUrl';
import { setUser, setCountOfUnreadNotifications } from 'src/redux/features/authSlice';
import { CONSULTANT, SCHOOL, routerLinks } from 'routes/constant';
import { removeRegisterData, setRegisterData } from 'src/redux/features/registerSlice';

class InfoNotification extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isNewSessionEmail: true,
			isNewSessionPush: true,
			isNewSessionText: true,
			isRescheduleSessionEmail: true,
			isRescheduleSessionPush: true,
			isRescheduleSessionText: true,
			isCloseSessionEmail: true,
			isCloseSessionPush: true,
			isCloseSessionText: true,
			isSessionReminderEmail: true,
			isSessionReminderPush: true,
			isSessionReminderText: true,
			isCancelSessionEmail: true,
			isCancelSessionPush: true,
			isCancelSessionText: true,
			isSubsidyUpdateEmail: true,
			isSubsidyUpdatePush: true,
			isSubsidyUpdateText: true,
			isSubsidyCreateEmail: true,
			isSubsidyCreatePush: true,
			isSubsidyCreateText: true,
			isFlagClearedEmail: true,
			isFlagClearedPush: true,
			isFlagClearedText: true,
			isFlagCreatedEmail: true,
			isFlagCreatedPush: true,
			isFlagCreatedText: true,
			isInvoiceUpdatedEmail: true,
			isInvoiceUpdatedPush: true,
			isInvoiceUpdatedText: true,
			isInvoicePaidEmail: true,
			isInvoicePaidPush: true,
			isInvoicePaidText: true,
			isDependentDeclinedEmail: true,
			isDependentDeclinedPush: true,
			isDependentDeclinedText: true,
			isDependentAcceptedEmail: true,
			isDependentAcceptedPush: true,
			isDependentAcceptedText: true,
			isSubmit: false,
		};
	}

	componentDidMount() {
		if (window.location.pathname.includes(routerLinks.CreateAccount)) {
			const { registerData } = this.props.register;
			if (registerData.notificationSetting) {
				this.setState({
					isNewSessionEmail: registerData.notificationSetting.isNewSessionEmail,
					isNewSessionPush: registerData.notificationSetting.isNewSessionPush,
					isNewSessionText: registerData.notificationSetting.isNewSessionText,
					isRescheduleSessionEmail: registerData.notificationSetting.isRescheduleSessionEmail,
					isRescheduleSessionPush: registerData.notificationSetting.isRescheduleSessionPush,
					isRescheduleSessionText: registerData.notificationSetting.isRescheduleSessionText,
					isCloseSessionEmail: registerData.notificationSetting.isCloseSessionEmail,
					isCloseSessionPush: registerData.notificationSetting.isCloseSessionPush,
					isCloseSessionText: registerData.notificationSetting.isCloseSessionText,
					isSessionReminderEmail: registerData.notificationSetting.isSessionReminderEmail,
					isSessionReminderPush: registerData.notificationSetting.isSessionReminderPush,
					isSessionReminderText: registerData.notificationSetting.isSessionReminderText,
					isCancelSessionEmail: registerData.notificationSetting.isCancelSessionEmail,
					isCancelSessionPush: registerData.notificationSetting.isCancelSessionPush,
					isCancelSessionText: registerData.notificationSetting.isCancelSessionText,
					isSubsidyUpdateEmail: registerData.notificationSetting.isSubsidyUpdateEmail,
					isSubsidyUpdatePush: registerData.notificationSetting.isSubsidyUpdatePush,
					isSubsidyUpdateText: registerData.notificationSetting.isSubsidyUpdateText,
					isSubsidyCreateEmail: registerData.notificationSetting.isSubsidyCreateEmail,
					isSubsidyCreatePush: registerData.notificationSetting.isSubsidyCreatePush,
					isSubsidyCreateText: registerData.notificationSetting.isSubsidyCreateText,
					isFlagClearedEmail: registerData.notificationSetting.isFlagClearedEmail,
					isFlagClearedPush: registerData.notificationSetting.isFlagClearedPush,
					isFlagClearedText: registerData.notificationSetting.isFlagClearedText,
					isFlagCreatedEmail: registerData.notificationSetting.isFlagCreatedEmail,
					isFlagCreatedPush: registerData.notificationSetting.isFlagCreatedPush,
					isFlagCreatedText: registerData.notificationSetting.isFlagCreatedText,
					isInvoiceUpdatedEmail: registerData.notificationSetting.isInvoiceUpdatedEmail,
					isInvoiceUpdatedPush: registerData.notificationSetting.isInvoiceUpdatedPush,
					isInvoiceUpdatedText: registerData.notificationSetting.isInvoiceUpdatedText,
					isInvoicePaidEmail: registerData.notificationSetting.isInvoicePaidEmail,
					isInvoicePaidPush: registerData.notificationSetting.isInvoicePaidPush,
					isInvoicePaidText: registerData.notificationSetting.isInvoicePaidText,
					isDependentDeclinedEmail: registerData.notificationSetting.isDependentDeclinedEmail,
					isDependentDeclinedPush: registerData.notificationSetting.isDependentDeclinedPush,
					isDependentDeclinedText: registerData.notificationSetting.isDependentDeclinedText,
					isDependentAcceptedEmail: registerData.notificationSetting.isDependentAcceptedEmail,
					isDependentAcceptedPush: registerData.notificationSetting.isDependentAcceptedPush,
					isDependentAcceptedText: registerData.notificationSetting.isDependentAcceptedText,
				});
			}
		} else {
			this.setState({
				isNewSessionEmail: this.props.user.notificationSetting?.isNewSessionEmail,
				isNewSessionPush: this.props.user.notificationSetting?.isNewSessionPush,
				isNewSessionText: this.props.user.notificationSetting?.isNewSessionText,
				isRescheduleSessionEmail: this.props.user.notificationSetting?.isRescheduleSessionEmail,
				isRescheduleSessionPush: this.props.user.notificationSetting?.isRescheduleSessionPush,
				isRescheduleSessionText: this.props.user.notificationSetting?.isRescheduleSessionText,
				isCloseSessionEmail: this.props.user.notificationSetting?.isCloseSessionEmail,
				isCloseSessionPush: this.props.user.notificationSetting?.isCloseSessionPush,
				isCloseSessionText: this.props.user.notificationSetting?.isCloseSessionText,
				isSessionReminderEmail: this.props.user.notificationSetting?.isSessionReminderEmail,
				isSessionReminderPush: this.props.user.notificationSetting?.isSessionReminderPush,
				isSessionReminderText: this.props.user.notificationSetting?.isSessionReminderText,
				isCancelSessionEmail: this.props.user.notificationSetting?.isCancelSessionEmail,
				isCancelSessionPush: this.props.user.notificationSetting?.isCancelSessionPush,
				isCancelSessionText: this.props.user.notificationSetting?.isCancelSessionText,
				isSubsidyUpdateEmail: this.props.user.notificationSetting?.isSubsidyUpdateEmail,
				isSubsidyUpdatePush: this.props.user.notificationSetting?.isSubsidyUpdatePush,
				isSubsidyUpdateText: this.props.user.notificationSetting?.isSubsidyUpdateText,
				isSubsidyCreateEmail: this.props.user.notificationSetting?.isSubsidyCreateEmail,
				isSubsidyCreatePush: this.props.user.notificationSetting?.isSubsidyCreatePush,
				isSubsidyCreateText: this.props.user.notificationSetting?.isSubsidyCreateText,
				isFlagClearedEmail: this.props.user.notificationSetting?.isFlagClearedEmail,
				isFlagClearedPush: this.props.user.notificationSetting?.isFlagClearedPush,
				isFlagClearedText: this.props.user.notificationSetting?.isFlagClearedText,
				isFlagCreatedEmail: this.props.user.notificationSetting?.isFlagCreatedEmail,
				isFlagCreatedPush: this.props.user.notificationSetting?.isFlagCreatedPush,
				isFlagCreatedText: this.props.user.notificationSetting?.isFlagCreatedText,
				isInvoiceUpdatedEmail: this.props.user.notificationSetting?.isInvoiceUpdatedEmail,
				isInvoiceUpdatedPush: this.props.user.notificationSetting?.isInvoiceUpdatedPush,
				isInvoiceUpdatedText: this.props.user.notificationSetting?.isInvoiceUpdatedText,
				isInvoicePaidEmail: this.props.user.notificationSetting?.isInvoicePaidEmail,
				isInvoicePaidPush: this.props.user.notificationSetting?.isInvoicePaidPush,
				isInvoicePaidText: this.props.user.notificationSetting?.isInvoicePaidText,
				isDependentDeclinedEmail: this.props.user.notificationSetting?.isDependentDeclinedEmail,
				isDependentDeclinedPush: this.props.user.notificationSetting?.isDependentDeclinedPush,
				isDependentDeclinedText: this.props.user.notificationSetting?.isDependentDeclinedText,
				isDependentAcceptedEmail: this.props.user.notificationSetting?.isDependentAcceptedEmail,
				isDependentAcceptedPush: this.props.user.notificationSetting?.isDependentAcceptedPush,
				isDependentAcceptedText: this.props.user.notificationSetting?.isDependentAcceptedText,
			});
			this.scriptLoaded();
		}
	}

	scriptLoaded = () => {
		let opts = {
			query: {
				token: Cookies.get('tk'),
			},
			withCredentials: true,
			autoConnect: true,
		};
		this.socket = io(socketUrl, opts);
		this.socket.on('socket_result', data => {
			if (data.key === "countOfUnreadNotifications") {
				this.props.setCountOfUnreadNotifications(data.data);
			}
		})
	}

	handleSaveSetting = async () => {
		const { registerData } = this.props.register;
		const data = {
			isNewSessionEmail: this.state.isNewSessionEmail,
			isNewSessionPush: this.state.isNewSessionPush,
			isNewSessionText: this.state.isNewSessionText,
			isRescheduleSessionEmail: this.state.isRescheduleSessionEmail,
			isRescheduleSessionPush: this.state.isRescheduleSessionPush,
			isRescheduleSessionText: this.state.isRescheduleSessionText,
			isCloseSessionEmail: this.state.isCloseSessionEmail,
			isCloseSessionPush: this.state.isCloseSessionPush,
			isCloseSessionText: this.state.isCloseSessionText,
			isSessionReminderEmail: this.state.isSessionReminderEmail,
			isSessionReminderPush: this.state.isSessionReminderPush,
			isSessionReminderText: this.state.isSessionReminderText,
			isCancelSessionEmail: this.state.isCancelSessionEmail,
			isCancelSessionPush: this.state.isCancelSessionPush,
			isCancelSessionText: this.state.isCancelSessionText,
			isSubsidyUpdateEmail: this.state.isSubsidyUpdateEmail,
			isSubsidyUpdatePush: this.state.isSubsidyUpdatePush,
			isSubsidyUpdateText: this.state.isSubsidyUpdateText,
			isSubsidyCreateEmail: this.state.isSubsidyCreateEmail,
			isSubsidyCreatePush: this.state.isSubsidyCreatePush,
			isSubsidyCreateText: this.state.isSubsidyCreateText,
			isFlagClearedEmail: this.state.isFlagClearedEmail,
			isFlagClearedPush: this.state.isFlagClearedPush,
			isFlagClearedText: this.state.isFlagClearedText,
			isFlagCreatedEmail: this.state.isFlagCreatedEmail,
			isFlagCreatedPush: this.state.isFlagCreatedPush,
			isFlagCreatedText: this.state.isFlagCreatedText,
			isInvoiceUpdatedEmail: this.state.isInvoiceUpdatedEmail,
			isInvoiceUpdatedPush: this.state.isInvoiceUpdatedPush,
			isInvoiceUpdatedText: this.state.isInvoiceUpdatedText,
			isInvoicePaidEmail: this.state.isInvoicePaidEmail,
			isInvoicePaidPush: this.state.isInvoicePaidPush,
			isInvoicePaidText: this.state.isInvoicePaidText,
			isDependentDeclinedEmail: this.state.isDependentDeclinedEmail,
			isDependentDeclinedPush: this.state.isDependentDeclinedPush,
			isDependentDeclinedText: this.state.isDependentDeclinedText,
			isDependentAcceptedEmail: this.state.isDependentAcceptedEmail,
			isDependentAcceptedPush: this.state.isDependentAcceptedPush,
			isDependentAcceptedText: this.state.isDependentAcceptedText,
		}

		if (window.location.pathname.includes(routerLinks.CreateAccount)) {
			if ([SCHOOL, CONSULTANT].includes(registerData.role)) {
				this.setState({ isSubmit: true });
				const response = await request.post(userSignUp, { ...registerData, notificationSetting: data });
				this.setState({ isSubmit: false });
				const { success } = response;
				if (success) {
					this.props.onContinue(true);
					this.props.removeRegisterData();
				} else {
					message.error(error?.response?.data?.data ?? error.message);
				}
			} else {
				this.props.setRegisterData({ notificationSetting: data });
				this.props.onContinue();
			}
		} else {
			this.setState({ isSubmit: true });
			request.post(updateNotificationSetting, data).then(res => {
				this.setState({ isSubmit: false });
				const { success } = res;
				let user = JSON.parse(JSON.stringify(this.props.user));
				user.notificationSetting = {
					...user.notificationSetting,
					isNewSessionEmail: this.state.isNewSessionEmail,
					isNewSessionPush: this.state.isNewSessionPush,
					isNewSessionText: this.state.isNewSessionText,
					isRescheduleSessionEmail: this.state.isRescheduleSessionEmail,
					isRescheduleSessionPush: this.state.isRescheduleSessionPush,
					isRescheduleSessionText: this.state.isRescheduleSessionText,
					isCloseSessionEmail: this.state.isCloseSessionEmail,
					isCloseSessionPush: this.state.isCloseSessionPush,
					isCloseSessionText: this.state.isCloseSessionText,
					isSessionReminderEmail: this.state.isSessionReminderEmail,
					isSessionReminderPush: this.state.isSessionReminderPush,
					isSessionReminderText: this.state.isSessionReminderText,
					isCancelSessionEmail: this.state.isCancelSessionEmail,
					isCancelSessionPush: this.state.isCancelSessionPush,
					isCancelSessionText: this.state.isCancelSessionText,
					isSubsidyUpdateEmail: this.state.isSubsidyUpdateEmail,
					isSubsidyUpdatePush: this.state.isSubsidyUpdatePush,
					isSubsidyUpdateText: this.state.isSubsidyUpdateText,
					isSubsidyCreateEmail: this.state.isSubsidyCreateEmail,
					isSubsidyCreatePush: this.state.isSubsidyCreatePush,
					isSubsidyCreateText: this.state.isSubsidyCreateText,
					isFlagClearedEmail: this.state.isFlagClearedEmail,
					isFlagClearedPush: this.state.isFlagClearedPush,
					isFlagClearedText: this.state.isFlagClearedText,
					isFlagCreatedEmail: this.state.isFlagCreatedEmail,
					isFlagCreatedPush: this.state.isFlagCreatedPush,
					isFlagCreatedText: this.state.isFlagCreatedText,
					isInvoiceUpdatedEmail: this.state.isInvoiceUpdatedEmail,
					isInvoiceUpdatedPush: this.state.isInvoiceUpdatedPush,
					isInvoiceUpdatedText: this.state.isInvoiceUpdatedText,
					isInvoicePaidEmail: this.state.isInvoicePaidEmail,
					isInvoicePaidPush: this.state.isInvoicePaidPush,
					isInvoicePaidText: this.state.isInvoicePaidText,
					isDependentDeclinedEmail: this.state.isDependentDeclinedEmail,
					isDependentDeclinedPush: this.state.isDependentDeclinedPush,
					isDependentDeclinedText: this.state.isDependentDeclinedText,
					isDependentAcceptedEmail: this.state.isDependentAcceptedEmail,
					isDependentAcceptedPush: this.state.isDependentAcceptedPush,
					isDependentAcceptedText: this.state.isDependentAcceptedText,
				};
				if (success) {
					this.props.setUser(user);
					message.success("Successfully updated");
				}
			}).catch(err => {
				this.setState({ isSubmit: false });
				message.error(err.message);
			})
		}
	}

	render() {
		const { registerData } = this.props.register;
		const { user } = this.props;
		const {
			isNewSessionEmail,
			isNewSessionPush,
			isNewSessionText,
			isRescheduleSessionEmail,
			isRescheduleSessionPush,
			isRescheduleSessionText,
			isCloseSessionEmail,
			isCloseSessionPush,
			isCloseSessionText,
			isSessionReminderEmail,
			isSessionReminderPush,
			isSessionReminderText,
			isCancelSessionEmail,
			isCancelSessionPush,
			isCancelSessionText,
			isSubsidyUpdateEmail,
			isSubsidyUpdatePush,
			isSubsidyUpdateText,
			isSubsidyCreateEmail,
			isSubsidyCreatePush,
			isSubsidyCreateText,
			isFlagClearedEmail,
			isFlagClearedPush,
			isFlagClearedText,
			isFlagCreatedEmail,
			isFlagCreatedPush,
			isFlagCreatedText,
			isInvoiceUpdatedEmail,
			isInvoiceUpdatedPush,
			isInvoiceUpdatedText,
			isInvoicePaidEmail,
			isInvoicePaidPush,
			isInvoicePaidText,
			isDependentDeclinedEmail,
			isDependentDeclinedPush,
			isDependentDeclinedText,
			isDependentAcceptedEmail,
			isDependentAcceptedPush,
			isDependentAcceptedText,
			isSubmit,
		} = this.state;

		const isCreate = window.location.pathname.includes(routerLinks.CreateAccount);

		return (
			<div className='col-form'>
				<div className='div-form-title mb-10'>
					<p className='font-30 text-center mb-0'>{intl.formatMessage(messages.notificationSetting)}</p>
				</div>
				<Row justify="center" className="row-form">
					<Col xs={24} sm={24} md={24} lg={16} xl={16} xxl={8}>
						<Card className='bg-white'>
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
										<td><div className='text-center'><Switch checked={isNewSessionEmail} onChange={v => this.setState({ isNewSessionEmail: v })} /></div></td>
										<td><div className='text-center'><Switch checked={isNewSessionText} onChange={v => this.setState({ isNewSessionText: v })} /></div></td>
										<td><div className='text-center'><Switch checked={isNewSessionPush} onChange={v => this.setState({ isNewSessionPush: v })} /></div></td>
									</tr>
									<tr>
										<td>Reschedule Session</td>
										<td><div className='text-center'><Switch checked={isRescheduleSessionEmail} onChange={v => this.setState({ isRescheduleSessionEmail: v })} /></div></td>
										<td><div className='text-center'><Switch checked={isRescheduleSessionText} onChange={v => this.setState({ isRescheduleSessionText: v })} /></div></td>
										<td><div className='text-center'><Switch checked={isRescheduleSessionPush} onChange={v => this.setState({ isRescheduleSessionPush: v })} /></div></td>
									</tr>
									<tr>
										<td>Close Session</td>
										<td><div className='text-center'><Switch checked={isCloseSessionEmail} onChange={v => this.setState({ isCloseSessionEmail: v })} /></div></td>
										<td><div className='text-center'><Switch checked={isCloseSessionText} onChange={v => this.setState({ isCloseSessionText: v })} /></div></td>
										<td><div className='text-center'><Switch checked={isCloseSessionPush} onChange={v => this.setState({ isCloseSessionPush: v })} /></div></td>
									</tr>
									<tr>
										<td>Cancel Session</td>
										<td><div className='text-center'><Switch checked={isCancelSessionEmail} onChange={v => this.setState({ isCancelSessionEmail: v })} /></div></td>
										<td><div className='text-center'><Switch checked={isCancelSessionText} onChange={v => this.setState({ isCancelSessionText: v })} /></div></td>
										<td><div className='text-center'><Switch checked={isCancelSessionPush} onChange={v => this.setState({ isCancelSessionPush: v })} /></div></td>
									</tr>
									<tr>
										<td>Session reminder</td>
										<td><div className='text-center'><Switch checked={isSessionReminderEmail} onChange={v => this.setState({ isSessionReminderEmail: v })} /></div></td>
										<td><div className='text-center'><Switch checked={isSessionReminderText} onChange={v => this.setState({ isSessionReminderText: v })} /></div></td>
										<td><div className='text-center'><Switch checked={isSessionReminderPush} onChange={v => this.setState({ isSessionReminderPush: v })} /></div></td>
									</tr>
									{(user?.role === 3 || user?.role === 60 || registerData?.role === 3 || registerData?.role === 60) && (
										<>
											<tr>
												<td colSpan={4} className="bg-pastel">
													<div className='header'>Subsidy</div>
												</td>
											</tr>
											<tr>
												<td>Subsidy Create</td>
												<td><div className='text-center'><Switch checked={isSubsidyCreateEmail} onChange={v => this.setState({ isSubsidyCreateEmail: v })} /></div></td>
												<td><div className='text-center'><Switch checked={isSubsidyCreateText} onChange={v => this.setState({ isSubsidyCreateText: v })} /></div></td>
												<td><div className='text-center'><Switch checked={isSubsidyCreatePush} onChange={v => this.setState({ isSubsidyCreatePush: v })} /></div></td>
											</tr>
											<tr>
												<td>Subsidy Update</td>
												<td><div className='text-center'><Switch checked={isSubsidyUpdateEmail} onChange={v => this.setState({ isSubsidyUpdateEmail: v })} /></div></td>
												<td><div className='text-center'><Switch checked={isSubsidyUpdateText} onChange={v => this.setState({ isSubsidyUpdateText: v })} /></div></td>
												<td><div className='text-center'><Switch checked={isSubsidyUpdatePush} onChange={v => this.setState({ isSubsidyUpdatePush: v })} /></div></td>
											</tr>
										</>
									)}
									{(user?.role === 3 || user?.role === 30 || registerData?.role === 3 || registerData?.role === 30) && (
										<>
											<tr>
												<td colSpan={4} className="bg-pastel">
													<div className='header'>Flag</div>
												</td>
											</tr>
											<tr>
												<td>Flag Created</td>
												<td><div className='text-center'><Switch checked={isFlagCreatedEmail} onChange={v => this.setState({ isFlagCreatedEmail: v })} /></div></td>
												<td><div className='text-center'><Switch checked={isFlagCreatedText} onChange={v => this.setState({ isFlagCreatedText: v })} /></div></td>
												<td><div className='text-center'><Switch checked={isFlagCreatedPush} onChange={v => this.setState({ isFlagCreatedPush: v })} /></div></td>
											</tr>
											<tr>
												<td>Flag Cleared</td>
												<td><div className='text-center'><Switch checked={isFlagClearedEmail} onChange={v => this.setState({ isFlagClearedEmail: v })} /></div></td>
												<td><div className='text-center'><Switch checked={isFlagClearedText} onChange={v => this.setState({ isFlagClearedText: v })} /></div></td>
												<td><div className='text-center'><Switch checked={isFlagClearedPush} onChange={v => this.setState({ isFlagClearedPush: v })} /></div></td>
											</tr>
											<tr>
												<td colSpan={4} className="bg-pastel">
													<div className='header'>Invoice</div>
												</td>
											</tr>
											<tr>
												<td>Invoice Updated</td>
												<td><div className='text-center'><Switch checked={isInvoiceUpdatedEmail} onChange={v => this.setState({ isInvoiceUpdatedEmail: v })} /></div></td>
												<td><div className='text-center'><Switch checked={isInvoiceUpdatedText} onChange={v => this.setState({ isInvoiceUpdatedText: v })} /></div></td>
												<td><div className='text-center'><Switch checked={isInvoiceUpdatedPush} onChange={v => this.setState({ isInvoiceUpdatedPush: v })} /></div></td>
											</tr>
											<tr>
												<td>Invoice Paid</td>
												<td><div className='text-center'><Switch checked={isInvoicePaidEmail} onChange={v => this.setState({ isInvoicePaidEmail: v })} /></div></td>
												<td><div className='text-center'><Switch checked={isInvoicePaidText} onChange={v => this.setState({ isInvoicePaidText: v })} /></div></td>
												<td><div className='text-center'><Switch checked={isInvoicePaidPush} onChange={v => this.setState({ isInvoicePaidPush: v })} /></div></td>
											</tr>
											<tr>
												<td colSpan={4} className="bg-pastel">
													<div className='header'>Dependent</div>
												</td>
											</tr>
											<tr>
												<td>Dependent Declined</td>
												<td><div className='text-center'><Switch checked={isDependentDeclinedEmail} onChange={v => this.setState({ isDependentDeclinedEmail: v })} /></div></td>
												<td><div className='text-center'><Switch checked={isDependentDeclinedText} onChange={v => this.setState({ isDependentDeclinedText: v })} /></div></td>
												<td><div className='text-center'><Switch checked={isDependentDeclinedPush} onChange={v => this.setState({ isDependentDeclinedPush: v })} /></div></td>
											</tr>
											<tr>
												<td>Dependent Accpted</td>
												<td><div className='text-center'><Switch checked={isDependentAcceptedEmail} onChange={v => this.setState({ isDependentAcceptedEmail: v })} /></div></td>
												<td><div className='text-center'><Switch checked={isDependentAcceptedText} onChange={v => this.setState({ isDependentAcceptedText: v })} /></div></td>
												<td><div className='text-center'><Switch checked={isDependentAcceptedPush} onChange={v => this.setState({ isDependentAcceptedPush: v })} /></div></td>
											</tr>
										</>
									)}
								</tbody>
							</table>
							<div className='mt-10 flex justify-end'>
								<Button type='primary' loading={isSubmit} block={isCreate} className='px-20' onClick={() => this.handleSaveSetting()}>{isCreate ? [SCHOOL, CONSULTANT].includes(registerData.role) ? intl.formatMessage(messages.submit).toUpperCase() : intl.formatMessage(messages.continue).toUpperCase() : 'Save'}</Button>
							</div>
						</Card>
					</Col>
				</Row>
			</div>
		);
	}
}

const mapStateToProps = state => ({
	register: state.register,
	user: state.auth.user,
});

export default compose(connect(mapStateToProps, { removeRegisterData, setUser, setCountOfUnreadNotifications, setRegisterData }))(InfoNotification);
