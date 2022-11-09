import { url } from '../../utils/api/baseUrl';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { helper } from '../../utils/auth/helper';
import request, { generateSearchStructure } from '../../utils/api/request'
const token = localStorage.getItem('token')
const initialState = {
	dataAppointments: {},
	dataAppointmentsMonth: []
};

export const getAppointmentsData = createAsyncThunk(
	'auth/getAppointmentsClientData',
	async (data) => {
		let result = {}
		try {
			switch (data.role) {
				case 999:
					result = await request.post(url + 'admin/get_appointments', {}, data.token);
					return result.data?.docs;
				case 30:
					result = await request.post(url + 'providers/get_my_appointments', {}, data.token);
					return result.data?.docs;
				case 3:
					result = await request.post(url + 'clients/get_my_appointments', {}, data.token);
					return result.data?.docs;
			}
		} catch (error) {
			console.log('get appointments error---', error)
		}
	}
)

export const getAppointmentsMonthData = createAsyncThunk(
	'auth/getAppointmentsMonthData',
	async (data) => {
		let result = {}
		try {
			switch (data.role) {
				case 999:
					result = await request.post(url + 'admin/get_appointments_in_month', data.data);
					break;
				case 30:
					result = await request.post(url + 'providers/get_my_appointments_in_month', data.data);
					break;
				case 3:
					result = await request.post(url + 'clients/get_my_appointments_in_month', data.data);
					break;
			}
			result.data?.forEach((appoint) => {
				if (appoint.type < 4) {
					appoint.title = data.role > 3 ? (appoint.dependent.firstName + " " + appoint.dependent.lastName) : appoint.provider.name;
				} else {
					appoint.title = data.role == 100 ? (appoint.dependent.firstName + " " + appoint.dependent.lastName) : 'Consultant';
				}
				appoint.allDay = false;
				appoint.start = new Date(appoint.date);
				appoint.end = new Date(appoint.date);
			});
			return result.data;
		} catch (error) {
			console.log(error, 'error')
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
					result = await request.post(url + 'providers/change_time_appoint', data.data, data.token);
					return result.data;
				case 3:
					result = await request.post(url + 'clients/change_time_appoint', data.data, data.token);
					return result.data;
			}
		} catch (error) {
			console.log(error, 'error')
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
					result = await request.post(url + 'providers/cancel_appoint', data.data, data.token);
					break;
				case 3:
					result = await request.post(url + 'clients/cancel_appoint', data.data, data.token);
					break;
			}
			return result;
		} catch (error) {
			console.log(error, 'error')
		}
	}
)
export const appointmentsSlice = createSlice({
	name: 'appointments',
	initialState,
	reducers: {
		setAppointMonth(state, action) {
			state.user = action.payload
		}
	},
	extraReducers: {
		[getAppointmentsData.fulfilled]: (state, action) => {
			state.dataAppointments = action.payload
		},

		[getAppointmentsMonthData.fulfilled]: (state, action) => {
			state.dataAppointmentsMonth = action.payload
		},

		[changeTime.fulfilled]: (state, action) => { },
	}
});

export const { getDatadAppointments, setAppointMonth } = appointmentsSlice.actions;

export default appointmentsSlice.reducer;