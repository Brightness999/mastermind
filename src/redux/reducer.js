import { persistReducer } from 'redux-persist';
import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';

import registerReducer from './features/registerSlice'
import authReducer from './features/authSlice'

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth'],
};

const appReducer = combineReducers({
    register: registerReducer,
    auth: authReducer,
});

const rootReducer = persistReducer(persistConfig, appReducer);

export default rootReducer;
