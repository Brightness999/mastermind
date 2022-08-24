import React from 'react';
import dva from 'dva';
import dynamic from 'dva/dynamic';
import createLoading from 'dva-loading';
import { Router } from 'dva/router';
import { createBrowserHistory } from 'history';
import request from 'cmn-utils/lib/request';
import createRoutes from './routes';
import config from './config';
import './assets/styles/index.less';
import 'moment/locale/vi';
import { homepage } from '../package.json';
import * as serviceWorker from './serviceWorker';
import LanguageProvider from './components/LanguageProvider';
import storeRedux from './redux/store';
import { Provider } from 'react-redux';

// -> initialization
const application = dva({
  history: createBrowserHistory({
    basename: homepage
  })
});

// -> Plugin
application.use(createLoading());
application.use({ onError: config.exception.global });

// -> request
request.config(config.request);

// Using mock data
require('./__mocks__');
// -> Developer mock data
// if (process.env.NODE_ENV === 'development') {
//   require('./__mocks__');
// }

// -> loading
dynamic.setDefaultLoadingComponent(() => config.router.loading);

// -> Register global model
application.model(require('./models/global').default);

// -> Initialize route
application.router(({ history, app }) => (
  <Provider store={storeRedux}>
    <LanguageProvider>
      <Router history={history}>{createRoutes(app)}</Router>
    </LanguageProvider>
  </Provider>
));

// -> Start
application.start('#root');

// export global
export default {
  app: application,
  store: application._store,
  dispatch: application._store.dispatch
};

// If you want to be able to use offline, use register() instead of unregister(). May bring some problems, such as caching, etc.
// Related information can be found at https://bit.ly/CRA-PWA
serviceWorker.unregister();
