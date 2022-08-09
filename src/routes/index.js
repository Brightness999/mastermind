import { createRoutes } from '../utils/core';
import { routerLinks } from './constant';
import BasicLayout from '../layouts/BasicLayout';
import UserLayout from '../layouts/UserLayout';
import MainLayout from '../layouts/MainLayout';

import NotFound from './Pages/404';
import Page403 from './Pages/403';
import Page500 from './Pages/500';


// import Dashboard from './Dashboard2';
import Blank from './Blank';
import Login from './Sign/Login';
import CreateAccount from './Sign/CreateAccount';
import SubsidyRequest from './Sign/SubsidyRequest';
import SubsidyReview from './Sign/SubsidyReview';
import InfoSchool from './Sign/InfoSchool';
import InfoAdmin from './Sign/InfoAdmin';
import Dashboard from './Dashboard';

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
      // 💬 generate admin to here
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
      InfoAdmin(app),
      InfoSchool(app),
      SubsidyReview(app),
      NotFound()]
  }
];

export default app => createRoutes(app, routesConfig);
