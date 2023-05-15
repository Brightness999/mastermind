import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import request from '../../utils/api/request'
import { cancelAppointmentForParent, cancelAppointmentForProvider, changeTimeAppointForParent, changeTimeAppointForProvider, getAdminSubsidyRequests, getAppointmentsForAdmin, getAppointmentsForConsultant, getAppointmentsForParent, getAppointmentsForProvider, getAppointmentsInMonthForAdmin, getAppointmentsInMonthForConsultant, getAppointmentsInMonthForParent, getAppointmentsInMonthForProvider, getParentSubsidyRequests, getProviderSubsidyRequests, getSchoolSubsidyRequests } from '../../utils/api/apiList';

const initialState = {
	dataAppointments: [],
	dataSubsidyRequests: [],
	dataAppointmentsMonth: []
};

export const getAppointmentsData = createAsyncThunk(
	'auth/getAppointmentsClientData',
	async (data) => {
		let result = {}
		try {
			switch (data.role) {
				case 1000:
					result = await request.post(getAppointmentsForAdmin, data);
					return result.data;
				case 999:
					result = await request.post(getAppointmentsForAdmin, data);
					return result.data;
				case 100:
					result = await request.post(getAppointmentsForConsultant, data);
					return result.data;
				case 30:
					result = await request.post(getAppointmentsForProvider, data);
					return result.data;
				case 3:
					result = await request.post(getAppointmentsForParent, data);
					return result.data;
			}
		} catch (error) {
			console.log('get appointments error---', error)
		}
	}
)

export const getSubsidyRequests = createAsyncThunk(
	'auth/getSubsidyRequests',
	async (data) => {
		let result = {}
		try {
			switch (data.role) {
				case 1000:
					result = await request.post(getAdminSubsidyRequests, data);
					return result.data.docs;
				case 999:
					result = await request.post(getAdminSubsidyRequests, data);
					return result.data.docs;
				case 60:
					result = await request.post(getSchoolSubsidyRequests, data);
					return result.data.docs;
				case 30:
					result = await request.post(getProviderSubsidyRequests, data);
					return result.data.docs;
				case 3:
					result = await request.post(getParentSubsidyRequests, data);
					return result.data.docs;
			}
		} catch (error) {
			console.log('get subsidy requests error---', error);
		}
	}
)

export const getAppointmentsMonthData = createAsyncThunk(
	'auth/getAppointmentsMonthData',
	async (data) => {
		let result = {}
		try {
			switch (data.role) {
				case 1000:
					result = await request.post(getAppointmentsInMonthForAdmin, data.data);
					break;
				case 999:
					result = await request.post(getAppointmentsInMonthForAdmin, data.data);
					break;
				case 100:
					result = await request.post(getAppointmentsInMonthForConsultant, data.data);
					break;
				case 30:
					result = await request.post(getAppointmentsInMonthForProvider, data.data);
					break;
				case 3:
					result = await request.post(getAppointmentsInMonthForParent, data.data);
					break;
			}
			result.data?.forEach((appoint) => {
				if (appoint.type === 4) {
					appoint.title = data.role == 100 ? `${appoint.dependent?.firstName ?? ''} ${appoint.dependent?.lastName ?? ''}` : 'Consultant';
				} else {
					appoint.title = data.role > 3 ? `${appoint.dependent?.firstName ?? ''} ${appoint.dependent?.lastName ?? ''}` : `${appoint.provider?.firstName} ${appoint.provider?.lastName}`;
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
					result = await request.post(changeTimeAppointForProvider, data.data);
					return result.data;
				case 3:
					result = await request.post(changeTimeAppointForParent, data.data);
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
					result = await request.post(cancelAppointmentForProvider, data.data);
					break;
				case 3:
					result = await request.post(cancelAppointmentForParent, data.data);
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
			state.dataAppointments = action.payload;
		},
		setSubsidyRequests(state, action) {
			state.dataSubsidyRequests = action.payload;
		},
	},
	extraReducers: {
		[getAppointmentsData.fulfilled]: (state, action) => {
			state.dataAppointments = action.payload
		},

		[getAppointmentsMonthData.fulfilled]: (state, action) => {
			state.dataAppointmentsMonth = action.payload
		},

		[getSubsidyRequests.fulfilled]: (state, action) => {
			state.dataSubsidyRequests = action.payload
		},

		[changeTime.fulfilled]: (state, action) => { },
	}
});

export const { getDatadAppointments, setAppointMonth, setSubsidyRequests } = appointmentsSlice.actions;

export default appointmentsSlice.reducer;