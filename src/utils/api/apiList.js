export const userSignUp = 'users/signup'
export const checkEmailRegistered = 'users/check_email_registered'
export const getDependents = 'users/get_dependents'
export const deletePrivateNote = 'users/delete_private_note'
export const updatePrivateNote = 'users/update_private_note'
export const createPrivateNote = 'users/create_private_note'
export const changePassword = 'users/change_password'
export const clearFlag = 'users/clear_flag'
export const updateNotificationSetting = 'users/update_notification_setting'
export const downloadInvoice = 'users/download_invoice'
export const printInvoice = 'users/print_invoice'
export const getUserProfile = 'users/get_user_profile'
export const checkLogin = 'users/check_login'
export const userActivate = 'users/activate_user'
export const userLogin = 'users/login'
export const forgotPassword = 'users/forgot_password'
export const confirmForgotPassword = 'users/confirm_forgot_password'
export const getDataForCreatingUser = 'users/get_data_for_creating_user'
export const setNotificationTime = 'users/set_notification_time'
export const closeNotification = 'users/close_notification'

export const getAppointmentsForAdmin = 'admin/get_appointments'
export const getAppointmentsInMonthForAdmin = 'admin/get_appointments_in_month'
export const getDefaultDataForAdmin = 'admin/get_default_data'
export const searchProvidersForAdmin = 'admin/search_providers'
export const getUsers = 'admin/get_users'
export const activateUser = 'admin/activate_user'
export const getSettings = 'admin/get_settings'
export const updateSettings = 'admin/update_settings'
export const addCommunity = 'admin/add_community'
export const getSchools = 'admin/get_schools'
export const getFlagList = 'admin/get_flag_list'
export const getConsultationList = 'admin/get_consultation_list'
export const getAdminSubsidyRequests = 'admin/get_subsidy_requests'
export const getAdminInfo = 'admin/get_admin_info'
export const updateAdminInfo = 'admin/update_admin_info'
export const preApproveSubsidy = 'admin/pre_approve_subsidy'
export const selectFinalProviderForSubsidy = 'admin/select_final_provider_for_subsidy'
export const applyCancellationFeeToParent = 'admin/apply_cancellation_fee_to_parent'
export const changeTimeAppointForAdmin = 'admin/change_time_appoint'

export const getDefaultValuesForConsultant = 'consultants/get_default_values_for_consultant'
export const getAppointmentsForConsultant = 'consultants/get_my_appointments'
export const getAppointmentsInMonthForConsultant = 'consultants/get_my_appointments_in_month'
export const getMyConsultantInfo = 'consultants/get_my_consultant_info'
export const updateConsultantInfo = 'consultants/update_consultant_info'
export const updateConsultantAvailability = 'consultants/update_consultant_availability'
export const claimConsultation = 'consultants/claim_consultation'
export const switchConsultation = 'consultants/switch_consultation'
export const removeConsultation = 'consultants/remove_consultation'
export const checkNotificationForConsultant = 'consultants/check_notification'

export const getCommunitiServer = 'schools/get_list_communites'
export const getSchoolInfos = 'schools/get_school_infos'
export const getMySchoolInfo = 'schools/get_my_school_info'
export const updateSchoolInfo = 'schools/update_school_info'
export const updateSchoolAvailability = 'schools/update_school_availability'
export const getSchoolSubsidyRequests = 'schools/get_my_subsidy_requests'
export const getLastConsulation = 'schools/get_last_consulation'
export const getAllProviderInSchool = 'schools/get_all_provider_in_school'
export const denySubsidyRequest = 'schools/deny_subsidy_request'
export const acceptSubsidyRequest = 'schools/accept_subsidy_request'
export const denyAppealSubsidy = 'schools/deny_appeal_subsidy'
export const schoolAcceptAppealSubsidy = 'schools/accept_appeal_subsidy'
export const reorderRequests = 'schools/reorder_requests'

export const getAppointmentsForProvider = 'providers/get_my_appointments'
export const getAppointmentsInMonthForProvider = 'providers/get_my_appointments_in_month'
export const getCityConnections = 'providers/get_city_connections'
export const getDefaultValueForProvider = 'providers/get_default_values_for_provider'
export const getReviewInfoForProvider = 'providers/get_review_info'
export const uploadTempW9FormForProvider = 'providers/upload_temp_w9_form'
export const checkNotificationForProvider = 'providers/check_notification'
export const closeAppointmentForProvider = 'providers/close_appointment'
export const closeAppointmentAsNoshow = 'providers/close_appointment_as_noshow'
export const declineAppointmentForProvider = 'providers/decline_appointment'
export const leaveFeedbackForProvider = 'providers/leave_feedback'
export const cancelAppointmentForProvider = 'providers/cancel_appoint'
export const changeTimeAppointForProvider = 'providers/change_time_appoint'
export const getMyProviderInfo = 'providers/get_my_provider_info'
export const updateMyProviderProfile = 'providers/update_my_provider_profile'
export const updateMyProviderAvailability = 'providers/update_my_provider_availability'
export const setFlag = 'providers/set_flag'
export const setFlagBalance = 'providers/set_flag_balance'
export const acceptDeclinedScreening = 'providers/accept_declined_screening'
export const sendEmailInvoice = 'providers/send_email_invoice'
export const getProviderSubsidyRequests = 'providers/get_my_subsidy_requests'

export const getAppointmentsForParent = 'clients/get_my_appointments'
export const getAppointmentsInMonthForParent = 'clients/get_my_appointments_in_month'
export const createAppointmentForParent = 'clients/create_appoinment'
export const getAllSchoolsForParent = 'clients/get_all_schools'
export const getDefaultValueForClient = 'clients/get_default_value_for_client'
export const checkNotificationForClient = 'clients/check_notification'
export const cancelAppointmentForParent = 'clients/cancel_appoint'
export const changeTimeAppointForParent = 'clients/change_time_appoint'
export const updateAppointmentNotesForParent = 'clients/update_appointment_notes'
export const rescheduleAppointmentForParent = 'clients/reschedule_appointment'
export const getAllConsultantForParent = 'clients/get_all_consultants'
export const getConsultationsForDependent = 'clients/get_consultations_for_dependent'
export const uploadDocumentForParent = 'clients/upload_document'
export const createSubsidyRequest = 'clients/create_subsidy_request'
export const requestFeedbackForClient = 'clients/request_feedback'
export const getChildProfile = 'clients/get_child_profile'
export const getParentProfile = 'clients/get_parent_profile'
export const updateChildProfile = 'clients/update_child_profile'
export const updateChildAvailability = 'clients/update_child_availability'
export const updateParentProfile = 'clients/update_parent_profile'
export const requestClearance = 'clients/request_clearance'
export const payInvoice = 'clients/pay_invoice'
export const createGoogleMeet = 'clients/create_google_meet'
export const getAuthorizationUrl = 'clients/get_authorization_url'
export const getParentSubsidyRequests = 'clients/get_my_subsidy_requests'
export const appealSubsidy = 'clients/appeal_subsidy'
export const getMeetingLink = 'clients/get_meeting_link'
export const appealRequest = 'clients/appeal_request'
export const cancelSubsidyRequest = 'clients/cancel_subsidy_request'

export const monthlyCustomAmount = 'donations/monthly_custom_amount'
export const donationReceipt = 'donations/donation_receipt'