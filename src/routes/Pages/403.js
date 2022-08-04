import { createRoute } from '../../utils/core';
import { P403 } from '../../components/Pages';
import { routerLinks } from "../constant";

const routesConfig = () => ({
  path: routerLinks['Pages403'],
  title: '403',
  component: P403
});

export default app => createRoute(app, routesConfig);
