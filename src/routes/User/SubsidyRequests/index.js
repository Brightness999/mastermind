import { dynamicWrapper, createRoute } from 'utils/core';
import { routerLinks } from "routes/constant";

const routesConfig = app => ({
  path: routerLinks.SubsidyRequests,
  title: 'SubsidyRequests',
  component: dynamicWrapper(app, [import('./model')], () => import('routes/Administrator/SubsidyManager/components'))
});

export default app => createRoute(app, routesConfig);
