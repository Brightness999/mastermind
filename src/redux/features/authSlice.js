import { createSlice } from '@reduxjs/toolkit';
import { helper } from '../../utils/auth/helper';

const initialState = {
    authData: {},
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout(state) {
            console.log(state , state.history);
            localStorage.removeItem('token');
            helper.history.push('/');
        }
    }
});

export const { logout, setAuthData } = authSlice.actions;

export default authSlice.reducer;