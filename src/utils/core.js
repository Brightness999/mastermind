import React from 'react';
import dynamic from 'dva/dynamic';
import { Route, Switch, Redirect } from 'dva/router';
import DocumentTitle from 'react-document-title';
import assign from 'object-assign';
import $$ from 'cmn-utils';
import config from '../config';

/**
 * Generate dynamic components
 * @param {*} app
 * @param {*} models
 * @param {*} component
 */
export const dynamicWrapper = (app, models, component) =>
  dynamic({
    app,
    models: () => models,
    component
  });

/**
 * Generate a set of routes
 * @param {*} app
 * @param {*} routesConfig
 */
export const createRoutes = (app, routesConfig) => (
  <Switch>
    {routesConfig(app).map(configRoute => createRoute(app, () => configRoute))}
  </Switch>
);
// Routing map
window.dva_router_pathMap = {};
/**
 * Generate a single route
 * @param {*} app
 * @param {*} routesConfig
 */
export const createRoute = (app, routesConfig) => {
  const {
    component: Comp,
    path,
    indexRoute,
    title,
    ...otherProps
  } = routesConfig(app);
  if (path && path !== '/') {
    window.dva_router_pathMap[path] = { path, title, ...otherProps };
    // Add a parentPath for the child route
    if (otherProps.childRoutes && otherProps.childRoutes.length) {
      otherProps.childRoutes.forEach(item => {
        if (window.dva_router_pathMap[item.key]) {
          window.dva_router_pathMap[item.key].parentPath = path;
        }
      });
    }
  }
  const routeProps = assign(
    {
      key: path || $$.randomStr(4),
      render: props => (
        <DocumentTitle
          title={
            config.htmlTitle ? config.htmlTitle.replace(/{.*}/gi, title) : title
          }
        >
          <Comp routerData={otherProps} {...props} />
        </DocumentTitle>
      )
    },
    path && {
      path
    }
  );

  if (indexRoute) {
    return [
      <Redirect key={`${path  }_redirect`} exact from={path} to={indexRoute} />,
      <Route {...routeProps} />
    ];
  }

  return <Route {...routeProps} />;
};
