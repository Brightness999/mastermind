import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    registerData: {},
};

export const registerSlice = createSlice({
    name: 'register',
    initialState,
    reducers: {
        
        setRegisterData: (state , actions) => {
            console.log('redux test ',state,actions);
            return {
                registerData: {
                    ...state.registerData,
                    ...actions.payload,
                }
            }
        }
    }
});

export const {  setRegisterData } = registerSlice.actions;

export default registerSlice.reducer;