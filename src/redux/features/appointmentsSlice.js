import { url } from '../../utils/api/baseUrl';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { helper } from '../../utils/auth/helper';
import request,{generateSearchStructure} from '../../utils/api/request'
const token = localStorage.getItem('token') 
const initialState = {
    dataAppointments: {},
    dataAppointmentsMonth:[]
};

export const getAppointmentsData = createAsyncThunk(
    'auth/getPppointmentsClientData',
    async (data) => {
        let result = {}
        try {
            switch (data.role) {
                case 30:
                    console.log(data,'token')
                    result = await request.post(url+'providers/get_my_appointments' ,{}, data.token);
                    
                    console.log(data,'token')
                return result.data;
                case 3:
                    result = await request.post(url+'clients/get_my_appointments' ,{}, data.token);
                return result.data;
            }
        } catch (error) {
            console.log(error,'error')
        }
    }
)
export const getAppointmentsMonthData = createAsyncThunk(
    'auth/getAppointmentsMonthData',
    async (data) => {
        let result = {}
        try {
            switch (data.role) {
                case 30:
                    console.log(data,'token')
                    result = await request.post(url+'providers/get_my_appointments_in_month' ,data.data, data.token);
                    console.log(result,'result')
                    console.log(data,'token')
                return result.data;
                case 3:
                    result = await request.post(url+'clients/get_my_appointments_in_month' ,data.data, data.token);
                return result.data;
            }
        } catch (error) {
            console.log(error,'error')
        }
    }
)

export const changeTime = createAsyncThunk(
    'auth/changeTime',
    async (data) => {
        let result = {}
        try {
            switch (data.role) {
                case 30:
                    console.log(data,'token')
                    result = await request.post(url+'providers/change_time_appoint' ,data.data, data.token);
                    console.log(result,'result')
                    console.log(data,'token')
                return result.data;
                case 3:
                    result = await request.post(url+'clients/change_time_appoint' ,data.data, data.token);
                return result.data;
            }
        } catch (error) {
            console.log(error,'error')
        }
    }
)
export const removeAppoint = createAsyncThunk(
    'auth/removeAppoint',
    async (data) => {
        let result = {}
        try {
            switch (data.role) {
                case 30:
                    console.log(data,'token')
                    result = await request.post(url+'providers/cancel_appoint' ,data.data, data.token);
                    console.log(result,'result')
                    console.log(data,'token')
                return result;
                case 3:
                    result = await request.post(url+'clients/cancel_appoint' ,data.data, data.token);
                return result;
            }
        } catch (error) {
            console.log(error,'error')
        }
    }
)
export const appointmentsSlice = createSlice({
    name: 'appointments',
    initialState,
    reducers: {
        setAppointMonth (state,action) {
            state.user = action.payload
        }
    },
    extraReducers:{
        [getAppointmentsData.fulfilled]: (state, action) => {
            console.log(action.payload,'action.payload')
            state.dataAppointments = action.payload
        },
        [getAppointmentsMonthData.fulfilled]: (state, action) => {
            console.log(action.payload,'action.getAppointmentsMonthData')
            state.dataAppointmentsMonth = action.payload
            console.log(action.payload,'action.getAppointmentsMonthData')
        },
        
        [changeTime.fulfilled]: (state, action) => {
        },
    }
});

export const { getDatadAppointments, setAppointMonth } = appointmentsSlice.actions;

export default appointmentsSlice.reducer;