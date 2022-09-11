import { persistReducer } from 'redux-persist';
import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';

import registerReducer from './features/registerSlice'
import authReducer from './features/authSlice'
import appointmentsReducer from './features/appointmentsSlice'

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth','appointments'],
};

const appReducer = combineReducers({
    register: registerReducer,
    auth: authReducer,
    appointments: appointmentsReducer,
});

const rootReducer = persistReducer(persistConfig, appReducer);

export default rootReducer;
