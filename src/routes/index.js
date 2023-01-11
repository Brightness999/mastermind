import { createRoutes } from '../utils/core';
import { routerLinks } from './constant';
import UserLayout from '../layouts/UserLayout';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';

import NotFound from './Pages/404';
import Page403 from './Pages/403';
import Page500 from './Pages/500';

import Blank from './Blank';
import Login from './Sign/Login';
import CreateAccount from './Sign/CreateAccount';
import SubsidyRequest from './Sign/SubsidyRequest';
import SubsidyReview from './Sign/SubsidyReview';
import Dashboard from './Dashboard';
import Home from './Home';
import Donate from './Home/donate';
import Referrals from './Home/referrals';
import Opportunities from './Home/opportunities';
import ForgotPass from './Sign/ForgotPass';
import ResetPass from './Sign/ResetPass';
import Admin from './Admin';
import ActiveAccount from './Sign/Login/activeaccount'
import Changeprofile from './Profile/ChangeProfile';
import UserManager from './Administrator/UserManager';
import SubsidyManager from './Administrator/SubsidyManager';
import SystemSetting from './Administrator/SystemSetting';
import SchoolsList from './Administrator/SchoolsList';
import FlagList from './Administrator/FlagList';
import ConsultationRequests from './Administrator/ConsultationRequests';
import Statistics from './Administrator/Statistics';
import Private from './Administrator/PrivateNote';
import PrivateNote from './PrivateNote';
import Notification from './Notifications';
import CreateUser from './Administrator/CreateAccount';

const routesConfig = app => [
  {
    path: '/account',
    title: 'Dashboard',
    component: MainLayout,
    indexRoute: routerLinks['Dashboard'],
    childRoutes: [
      Dashboard(app),
      Changeprofile(app),
      PrivateNote(app),
      Notification(app),
    ]
  },
  {
    path: '/administrator',
    title: 'Admin',
    component: AdminLayout,
    indexRoute: routerLinks['Admin'],
    childRoutes: [
      SchoolsList(app),
      FlagList(app),
      ConsultationRequests(app),
      Admin(app),
      UserManager(app),
      SubsidyManager(app),
      SystemSetting(app),
      Private(app),
      CreateUser(app),
      Statistics(app)
    ]
  },
  // {
  //   path: '/Home',
  //   title: 'Home',
  //   component: Home
  // },
  {
    path: '/donate',
    title: 'Donate',
    component: Donate
  },
  {
    path: '/referrals',
    title: 'Referrals',
    component: Referrals
  },
  {
    path: '/opportunities',
    title: 'Opportunities',
    component: Opportunities
  },
  {
    path: '/',
    title: 'Home',
    indexRoute: routerLinks['Home'],
    component: UserLayout,
    childRoutes: [
      Home(app),
      Login(app),
      CreateAccount(app),
      SubsidyRequest(app),
      ForgotPass(app),
      ResetPass(app),
      SubsidyReview(app),
      // 💬 generate admin to here
      NotFound(),
      ActiveAccount(app),
    ]
  }
];

export default app => createRoutes(app, routesConfig);
