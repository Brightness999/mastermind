import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    parent: {},
    provider: {},
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
        },
        setProvider: (state, action) => {
            return {
                provider: {
                    ...state.provider,
                    ...action.payload,
                }
            }
        }
    }
});

export const { setParent, setProvider } = registerSlice.actions;

export default registerSlice.reducer;