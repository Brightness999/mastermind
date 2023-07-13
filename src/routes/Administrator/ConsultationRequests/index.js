import { dynamicWrapper, createRoute } from 'utils/core';
import { routerLinks } from "routes/constant";

const routesConfig = app => ({
  path: routerLinks['ConsultationRequests'],
  title: 'ConsultationRequest',
  component: dynamicWrapper(app, [import('./model')], () => import('routes/User/ConsultationList/components'))
});

export default app => createRoute(app, routesConfig);
