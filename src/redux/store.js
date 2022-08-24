import { configureStore } from '@reduxjs/toolkit'
import registerReducer from './features/registerSlice'

export default configureStore({
    reducer: {
        register: registerReducer,
    }
})