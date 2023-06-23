import { dynamicWrapper, createRoute } from 'utils/core';
import { routerLinks } from "routes/constant";

const routesConfig = app => ({
  path: routerLinks.ConsultationList,
  title: 'ConsultationList',
  component: dynamicWrapper(app, [import('./model')], () => import('./components'))
});

export default app => createRoute(app, routesConfig);
