export const routerLinks = {
  Login: '/login',
  CreateAccount: '/createaccount',
  ForgotPass: '/forgotpass',
  ResetPass: '/resetpass',

  Dashboard: '/account/dashboard',
  SchoolsList: '/administrator/schoolslist',
  FlagList: '/administrator/flaglist',
  ConsultationRequests: '/administrator/consultationrequests',
  Admin: '/administrator/admin',
  CreateAccountForAdmin: '/administrator/createaccount',
  ChangeUserProfile: '/administrator/changeuserprofile',
  UserManager: '/administrator/usermanager',
  SystemSetting: '/administrator/systemsetting',
  SubsidyManager: '/administrator/subsidymanager',
  Statistics: '/administrator/statistics',
  Private: '/administrator/privatenote',
  Changeprofile: '/account/changeprofile',
  Notification: '/account/notifications',
  PrivateNote: '/account/privatenote',
  Blank: '/widget/blank',
  Home: '/home',
  Donate: '/donate',
  Referrals: '/referrals',
  Opportunities: '/opportunities',
};

export const BASE_CALENDAR_URL = "https://www.googleapis.com/calendar/v3/calendars";
export const BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY = "holiday@group.v.calendar.google.com";
export const GOOGLE_CALENDAR_API_KEY = "AIzaSyA77lKHRvtdisK7_UhwalO8Hzgd4P_kaDk";
export const USA_CALENDAR_REGION = "en.usa";
export const JEWISH_CALENDAR_REGION = "en.jewish";

// APPOINTMENT STATUS
export const DECLINED = -3;
export const CANCELLED = -2;
export const CLOSED = -1;
// export const PENDING = 0;

// APPOINTMENT TYPE
export const SCREEN = 1;
export const EVALUATION = 2;
export const APPOINTMENT = 3;
export const CONSULTATION = 4;
export const SUBSIDY = 5;

// FLAG TYPE
export const BALANCE = 1;
export const NOSHOW = 2;

// FLAG STATUS
export const NOFLAG = 0;
export const ACTIVE = 1;
export const CLEAR = 2;

// SUBSIDY STATUS
// export const CANCELLED = -2;
export const PENDING = 0;
export const SCHOOLAPPROVED = 1;
export const SCHOOLDECLINED = 2;
export const ADMINPREAPPROVED = 3;
export const ADMINDECLINED = 4;
export const ADMINAPPROVED = 5;

// USER TYPE
export const SUPERADMIN = 1000;
export const ADMIN = 999;
export const CONSULTANT = 100;
export const SCHOOL = 60;
export const PROVIDER = 30;
export const PARENT = 3;
export const BANNED = 1;