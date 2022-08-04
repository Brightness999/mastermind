import { createRoute } from '../../utils/core';
import { P500 } from '../../components/Pages';
import { routerLinks } from "../constant";

const routesConfig = () => ({
  path: routerLinks['Pages500'],
  title: '500',
  component: P500
});

export default app => createRoute(app, routesConfig);
