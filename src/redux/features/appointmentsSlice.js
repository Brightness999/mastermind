import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import request from '../../utils/api/request'
import { changeTimeAppointForAdmin, changeTimeAppointForParent, changeTimeAppointForProvider, getAdminSubsidyRequests, getAppointmentsForAdmin, getAppointmentsForConsultant, getAppointmentsForParent, getAppointmentsForProvider, getAppointmentsInMonthForAdmin, getAppointmentsInMonthForConsultant, getAppointmentsInMonthForParent, getAppointmentsInMonthForProvider, getParentSubsidyRequests, getProviderSubsidyRequests, getSchoolSubsidyRequests } from '../../utils/api/apiList';
import { ADMIN, CONSULTANT, CONSULTATION, PARENT, PENDING, PROVIDER, SUPERADMIN } from '../../routes/constant';
import moment from 'moment';

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
				case SUPERADMIN:
					result = await request.post(getAppointmentsForAdmin, data);
					return result.data;
				case ADMIN:
					result = await request.post(getAppointmentsForAdmin, data);
					return result.data;
				case CONSULTANT:
					result = await request.post(getAppointmentsForConsultant, data);
					return result.data;
				case PROVIDER:
					result = await request.post(getAppointmentsForProvider, data);
					return result.data;
				case PARENT:
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
				case ADMIN:
					result = await request.post(getAdminSubsidyRequests, data);
					return result.data.docs;
				case 60:
					result = await request.post(getSchoolSubsidyRequests, data);
					return result.data.docs;
				case PROVIDER:
					result = await request.post(getProviderSubsidyRequests, data);
					return result.data.docs;
				case PARENT:
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
				case ADMIN:
					result = await request.post(getAppointmentsInMonthForAdmin, data.data);
					break;
				case CONSULTANT:
					result = await request.post(getAppointmentsInMonthForConsultant, data.data);
					break;
				case PROVIDER:
					result = await request.post(getAppointmentsInMonthForProvider, data.data);
					break;
				case PARENT:
					result = await request.post(getAppointmentsInMonthForParent, data.data);
					break;
			}
			result.data?.forEach((appoint) => {
				if (appoint.type === CONSULTATION) {
					appoint.title = data.role == CONSULTANT ? `${appoint.dependent?.firstName ?? ''} ${appoint.dependent?.lastName ?? ''}` : 'Consultant';
				} else {
					appoint.title = data.role > PARENT ? `${appoint.dependent?.firstName ?? ''} ${appoint.dependent?.lastName ?? ''}` : `${appoint.provider?.firstName} ${appoint.provider?.lastName}`;
				}
				appoint.allDay = false;
				appoint.start = new Date(appoint.date);
				appoint.end = new Date(appoint.date);
				appoint.editable = appoint.status === PENDING && moment(appoint.date).isAfter(moment()) ? true : false;
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
				case SUPERADMIN:
					result = await request.post(changeTimeAppointForAdmin, data.data);
					return result.data;
				case ADMIN:
					result = await request.post(changeTimeAppointForAdmin, data.data);
					return result.data;
				case PROVIDER:
					result = await request.post(changeTimeAppointForProvider, data.data);
					return result.data;
				case PARENT:
					result = await request.post(changeTimeAppointForParent, data.data);
					return result.data;
			}
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