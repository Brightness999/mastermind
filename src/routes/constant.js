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
  Invoices: '/administrator/invoicelist',
  Changeprofile: '/account/changeprofile',
  Notification: '/account/notifications',
  PrivateNote: '/account/privatenote',
  InvoiceList: '/account/invoicelist',
  ConsultationList: '/account/consultationlist',
  SubsidyRequests: '/account/subsidyrequests',
  Blank: '/widget/blank',
  Home: '/home',
  Donate: '/donate',
  Referrals: '/referrals',
  Opportunities: '/opportunities',
};

export const BASE_CALENDAR_URL = "https://www.googleapis.com/calendar/v3/calendars";
export const BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY = "holiday@group.v.calendar.google.com";
export const GOOGLE_CALENDAR_API_KEY = "AIzaSyDBN1t-9owQFgpRbPU1YvFTYFl89o2wm24";
export const USA_CALENDAR_REGION = "en.usa";
export const JEWISH_CALENDAR_REGION = "en.jewish";

// APPOINTMENT STATUS
export const DECLINED = -3;
export const CANCELLED = -2;
export const CLOSED = -1;
export const PENDING = 0;

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
// export const PENDING = 0;
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

// Cancellation Type
export const RESCHEDULE = 'Reschedule';
export const CANCEL = 'Cancel';

export const InvoiceType = {
  SESSION: 1,
  RESCHEDULE: 2,
  CANCEL: 3,
  NOSHOW: 4,
  BALANCE: 5,
}

export const MethodType = {
  WAIVED: 1,
  PAYPAL: 2,
}

export const ContactNumberType = [
  'Home',
  'Work',
  'Mobile',
  'Fax',
];

export const EmailType = [
  'Personal',
  'Work'
];

export const DEPENDENTHOME = 'Dependent Home';
export const PROVIDEROFFICE = 'Provider Office';

export const CancellationWindow = [
  { label: '12 hrs', value: 12 },
  { label: '24 hrs', value: 24 },
];

export const Durations = [
  { label: '15 mins', value: 15 },
  { label: '30 mins', value: 30 },
  { label: '45 mins', value: 45 },
  { label: '1 hr', value: 60 },
  { label: '1.5 hrs', value: 90 },
  { label: '2 hrs', value: 120 },
  { label: '2.5 hrs', value: 150 },
  { label: '3 hrs', value: 180 },
  { label: '3.5 hrs', value: 210 },
  { label: '4 hrs', value: 240 },
];