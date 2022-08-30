import { configureStore , createSerializableStateInvariantMiddleware} from '@reduxjs/toolkit'
import registerReducer from './features/registerSlice'

const serializableMiddleware = createSerializableStateInvariantMiddleware({
    serializableCheck:false
  })

export default configureStore({
    reducer: {
        register: registerReducer,
    },
    middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})