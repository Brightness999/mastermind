import { dynamicWrapper, createRoute } from 'utils/core';
import { routerLinks } from "routes/constant";

const routesConfig = app => ({
  path: routerLinks.Providers,
  title: 'providers',
  component: dynamicWrapper(app, [import('./model')], () => import('routes/Administrator/ProviderList/components'))
});

export default app => createRoute(app, routesConfig);
