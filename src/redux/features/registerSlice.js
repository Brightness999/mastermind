import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    parent: {}
};

export const registerSlice = createSlice({
    name: 'register',
    initialState,
    reducers: {
        setParent: (state, action) => {
            return {
                parent: {
                    ...state.parent,
                    ...action.payload,
                }
            }
        }
    }
});

export const { setParent } = registerSlice.actions;

export default registerSlice.reducer;