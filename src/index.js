import React from 'react';
import dva from 'dva';
import dynamic from 'dva/dynamic';
import createLoading from 'dva-loading';
import { Router } from 'dva/router';
import { createBrowserHistory } from 'history';
import request from 'cmn-utils/lib/request';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import 'moment/locale/vi';

import { homepage } from '../package.json';
import * as serviceWorker from './serviceWorker';
import LanguageProvider from './components/LanguageProvider';
import { persistor, store } from './redux/store';
import { helper } from './utils/auth/helper';
import createRoutes from './routes';
import config from './config';
import './assets/styles/index.less';

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

// -> loading
dynamic.setDefaultLoadingComponent(() => config.router.loading);

// -> Register global model
application.model(require('./models/global').default);

// -> Initialize route
application.router(({ history, app }) => {
  helper.history = history;
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <LanguageProvider>
          <Router history={history}  >{createRoutes(app)}</Router>
        </LanguageProvider>
      </PersistGate>
    </Provider>
  )
});

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
