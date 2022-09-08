import { configureStore , createSerializableStateInvariantMiddleware} from '@reduxjs/toolkit'
import { persistStore } from 'redux-persist';
import rootReducer from './reducer'

const serializableMiddleware = createSerializableStateInvariantMiddleware({
    serializableCheck:false
  })

export const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export const persistor = persistStore(store);