import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { message } from 'antd';

import request from 'utils/api/request'
import { updateChildProfile, updateMyProviderProfile, updateParentProfile, updateSchoolInfo } from 'utils/api/apiList';

const initialState = {
	user: {},
	authData: [],
	authDataClientChild: [],
	authDataClientParent: [],
	dependents: [],
	providers: [],
	skillSet: [],
	locations: [],
	academicLevels: [],
	currentCommunity: {},
	selectedUser: {},
	selectedTime: undefined,
	meetingLink: '',
	durations: [],
	consultants: [],
	schools: [],
	generalData: {
		contactNumberTypes: [],
		emailTypes: [],
		skillSets: [],
		academicLevels: [],
		cancellationWindow: [],
		durations: [],
		maritialTypes: [],
		cityConnections: [],
		schools: [],
	},
};

export const setInforClientChild = createAsyncThunk(
	'auth/setInforClientChild',
	async (data) => {
		try {
			const result = await request.post(updateChildProfile, data);
			if (result.success) {
				message.success('Updated successfully');
			}
			return result;
		} catch (error) {
			console.log(error, 'error')
			message.error(error.message);
		}
		return false
	}
)

export const setInforClientParent = createAsyncThunk(
	'auth/setInforClientParent',
	async (data) => {
		try {
			const result = await request.post(updateParentProfile, data.data);
			if (result.success) {
				message.success('Updated successfully');
			}
		} catch (error) {
			console.log(error, 'error')
			message.error(error.message);
		}
		return false
	}
)

export const setInforProvider = createAsyncThunk(
	'auth/setInforProvider',
	async (data) => {
		try {
			const result = await request.post(updateMyProviderProfile, data);
			if (result.success) {
				message.success('Updated successfully');
				return result.data;
			}
		} catch (error) {
			console.log(error, 'error')
			message.error(error.message);
		}
		return false
	}
)

export const setInforSchool = createAsyncThunk(
	'auth/setInforSchool',
	async (data) => {
		try {
			const result = await request.post(updateSchoolInfo, data);
			if (result.success) {
				message.success('Updated successfully');
			}
		} catch (error) {
			console.log(error, 'error')
			message.error(error.message);
		}
		return false
	}
)

export const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setUser(state, action) {
			state.user = action.payload
		},
		setDependents(state, action) {
			state.dependents = action.payload
		},
		setProviders(state, action) {
			state.providers = action.payload
		},
		setSkillSet(state, action) {
			state.skillSet = action.payload
		},
		setLocations(state, action) {
			state.locations = action.payload
		},
		setAcademicLevels(state, action) {
			state.academicLevels = action.payload
		},
		setCommunity(state, action) {
			state.currentCommunity = action.payload
		},
		setSelectedUser(state, action) {
			state.selectedUser = action.payload
		},
		setSelectedTime(state, action) {
			state.selectedTime = action.payload
		},
		setMeetingLink(state, action) {
			state.meetingLink = action.payload
		},
		setDurations(state, action) {
			state.durations = action.payload
		},
		setGeneralData(state, action) {
			state.generalData = action.payload
		},
		setConsultants(state, action) {
			state.consultants = action.payload
		},
		setSchools(state, action) {
			state.schools = action.payload
		},
		logout(state) {
			state.user = {};
		},
	},
	extraReducers: {
		[setInforProvider.fulfilled]: (state, action) => {
			state.user = { ...state.user, providerInfo: action.payload };
		},
	}
});

export const {
	logout,
	setUser,
	setDependents,
	setProviders,
	setSkillSet,
	setLocations,
	setAcademicLevels,
	setCommunity,
	setSelectedUser,
	setSelectedTime,
	setMeetingLink,
	setDurations,
	setGeneralData,
	setConsultants,
	setSchools,
} = authSlice.actions;

export default authSlice.reducer;