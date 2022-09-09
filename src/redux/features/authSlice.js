import { url } from '../../utils/api/baseUrl';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { helper } from '../../utils/auth/helper';
import request,{generateSearchStructure} from '../../utils/api/request'
const initialState = {
    authData: [],
    authDataClientChild: [],
    authDataClientParent: []
};

export const getInfoAuth = createAsyncThunk(
    'auth/getInfoAuth',
    async (role,token) => {
        try {
            let result = '';
            let resultParent = {};
            let resultChild = {};
            switch (role) {
                case 60:
                    result = await request.post(url+'schools/get_my_school_info' ,{}, token);
                return result.data;
                case 30:
                    result = await request.post(url+'providers/get_my_provider_info' ,{}, token);
                return result.data;
                case 3:
                    resultParent = await request.post(url+'clients/get_parent_profile' ,{}, token);
                    resultChild = await request.post(url+'clients/get_child_profile' ,{}, token);
                return {parent: resultParent.data, child: resultChild.data};
            }
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
            state.authDataClientChild = [];
            state.authDataClientParent = [];
            helper.history.push('/');
        }

    },
    extraReducers:{
        [getInfoAuth.fulfilled]: (state, action) => {
            const user = localStorage.getItem('user') && JSON.parse(localStorage.getItem('user'))
            if(user.role == 3){
                console.log(action.payload, 'action.payload')
                state.authDataClientChild = action.payload.child;
                state.authDataClientParent = action.payload.parent;
            } else {
                state.authData = action.payload;
            }
            
        },
    }
});

export const { logout, setAuthData } = authSlice.actions;

export default authSlice.reducer;