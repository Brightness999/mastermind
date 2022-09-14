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
import ForgotPass from './Sign/ForgotPass';
import ResetPass from './Sign/ResetPass';
import Admin from './Admin';
import ActiveAccount from './Sign/Login/activeaccount'
import Changeprofile from './Profile/ChangeProfile';
import UserManager from './Administrator/UserManager';
import SubsidyManager from './Administrator/SubsidyManager';
import SystemSetting from './Administrator/SystemSetting';
import Statistics from './Administrator/Statistics';
const routesConfig = app => [
  
  // {
  //   path: '/administrator',
  //   title: 'System center',
  //   component: BasicLayout,
  //   indexRoute: routerLinks['Dashboard'],
  //   childRoutes: [
  //     Page403(), 
  //     Page500(), 
  //     Dashboard(app), 
  //     Blank(app),
      
  //   ]
  // },
  {
    path: '/account',
    title: 'Dashboard',
    component: MainLayout,
    indexRoute: routerLinks['Dashboard'],
    childRoutes: [
      Dashboard(app),
      Changeprofile(app)
    ]
  },
  {
    path: '/administrator',
    title: 'Admin',
    component: AdminLayout,
    indexRoute: routerLinks['UserManager'],
    childRoutes: [
      // Admin(app),
      UserManager(app),
      SubsidyManager(app),
      SystemSetting(app),
      Statistics(app)
    ]
  },
  {
    path: '/',
    title: 'Login',
    indexRoute: routerLinks['Login'],
    component: UserLayout,
    childRoutes: [
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
