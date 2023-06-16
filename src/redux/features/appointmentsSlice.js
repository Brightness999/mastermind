import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import moment from 'moment';

import request from 'src/utils/api/request'
import { changeTimeAppointForAdmin, changeTimeAppointForParent, changeTimeAppointForProvider, getAdminSubsidyRequests, getAppointmentsForAdmin, getAppointmentsForConsultant, getAppointmentsForParent, getAppointmentsForProvider, getAppointmentsInMonthForAdmin, getAppointmentsInMonthForConsultant, getAppointmentsInMonthForParent, getAppointmentsInMonthForProvider, getInvoices, getParentSubsidyRequests, getProviderSubsidyRequests, getSchoolSubsidyRequests } from 'src/utils/api/apiList';
import { ADMIN, CONSULTANT, CONSULTATION, PARENT, PENDING, PROVIDER, SCHOOL, SUPERADMIN } from 'src/routes/constant';
import { message } from 'antd';

const initialState = {
	dataAppointments: [],
	dataSubsidyRequests: [],
	dataAppointmentsMonth: [],
	dataInvoices: [],
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
			return [];
		}
	}
)

export const getSubsidyRequests = createAsyncThunk(
	'auth/getSubsidyRequests',
	async (data) => {
		let result = {}
		try {
			switch (data.role) {
				case SUPERADMIN:
					result = await request.post(getAdminSubsidyRequests, data);
					return result.data.docs;
				case ADMIN:
					result = await request.post(getAdminSubsidyRequests, data);
					return result.data.docs;
				case SCHOOL:
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
			return [];
		}
	}
)

export const getAppointmentsMonthData = createAsyncThunk(
	'auth/getAppointmentsMonthData',
	async (data) => {
		let result = {}
		try {
			switch (data.role) {
				case SUPERADMIN:
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
			return [];
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
				case CONSULTANT:
					result = await request.post(changeTimeAppointForParent, data.data);
					return result.data;
				case PROVIDER:
					result = await request.post(changeTimeAppointForProvider, data.data);
					return result.data;
				case PARENT:
					result = await request.post(changeTimeAppointForParent, data.data);
					return result.data;
			}
		} catch (error) {
			message.error(error.message);
		}
	}
)

export const getInvoiceList = createAsyncThunk(
	'auth/getInvoiceList',
	async (data) => {
		let result = {}
		try {
			switch (data.role) {
				case SUPERADMIN:
					result = await request.post(getInvoices, data.data);
					return result.data;
				case ADMIN:
					result = await request.post(getInvoices, data.data);
					return result.data;
				case PROVIDER:
					result = await request.post(getInvoices, data.data);
					return result.data;
				case PARENT:
					result = await request.post(getInvoices, data.data);
					return result.data;
			}
		} catch (error) {
			return [];
		}
	}
)

export const appointmentsSlice = createSlice({
	name: 'appointments',
	initialState,
	reducers: {
		setAppointments(state, action) {
			state.dataAppointments = action.payload;
		},
		setAppointmentsInMonth(state, action) {
			state.dataAppointmentsMonth = action.payload;
		},
		setSubsidyRequests(state, action) {
			state.dataSubsidyRequests = action.payload;
		},
		setInvoiceList(state, action) {
			state.dataInvoices = action.payload;
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

		[getInvoiceList.fulfilled]: (state, action) => {
			state.dataInvoices = action.payload
		},

		[changeTime.fulfilled]: (state, action) => { },
	}
});

export const { getDatadAppointments, setAppointments, setAppointmentsInMonth, setSubsidyRequests, setInvoiceList } = appointmentsSlice.actions;

export default appointmentsSlice.reducer;