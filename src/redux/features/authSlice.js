import { url } from '../../utils/api/baseUrl';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { helper } from '../../utils/auth/helper';
import request,{generateSearchStructure} from '../../utils/api/request'
const initialState = {
    authData: [],
};

export const getInfoAuth = createAsyncThunk(
    'auth/getInfoAuth',
    async (role,token) => {
        try {
            let result = '';
            switch (role) {
                case 60:
                    result = await request.post(url+'schools/get_my_school_info' ,{}, token)
                break;
                case 30:
                    result = await request.post(url+'providers/get_my_provider_info' ,{}, token)
                break;
                case 3:
                    result = await request.post(url+'clients/get_parent_profile' ,{}, token)
                break;
            }
            return result.data;
        } catch (error) {
          console.log('error',error)
        }
        return false;
    }
)

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout(state) {
            console.log(state , state.history);
            localStorage.removeItem('token');
            state.authData = [];
            helper.history.push('/');
        }

    },
    extraReducers:{
        [getInfoAuth.fulfilled]: (state, action) => {
            state.authData = action.payload;
        },
    }
});

export const { logout, setAuthData } = authSlice.actions;

export default authSlice.reducer;