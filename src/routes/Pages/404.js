import { createRoute } from '../../utils/core';
import { P404 } from '../../components/Pages';

const routesConfig = () => ({
  title: '404',
  component: P404,
});

export default (app) => createRoute(app, routesConfig);
