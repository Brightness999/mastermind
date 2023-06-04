import { dynamicWrapper, createRoute } from 'src/utils/core';
import { routerLinks } from "routes/constant";

const routesConfig = app => ({
  path: routerLinks.Invoices,
  title: 'Invoice List',
  component: dynamicWrapper(app, [import('./model')], () => import('./components'))
});

export default app => createRoute(app, routesConfig);
