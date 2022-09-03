import { dynamicWrapper, createRoute } from '../../../utils/core';
import { routerLinks } from "../../constant";

const routesConfig = app => ({
  path: routerLinks['ActiveAccount'],
  title: 'HMGH',
  component: dynamicWrapper(app, [import('./model')], () => import('./components/activeaccount'))
});

export default app => createRoute(app, routesConfig);
