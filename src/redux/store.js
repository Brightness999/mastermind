import { configureStore , createSerializableStateInvariantMiddleware} from '@reduxjs/toolkit'
import registerReducer from './features/registerSlice'
import authReducer from './features/authSlice'

const serializableMiddleware = createSerializableStateInvariantMiddleware({
    serializableCheck:false
  })

export default configureStore({
    reducer: {
        register: registerReducer,
        auth: authReducer,
    },
    middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})