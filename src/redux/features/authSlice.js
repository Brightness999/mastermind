import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { message } from 'antd';

import { helper } from '../../utils/auth/helper';
import request from '../../utils/api/request'
import { getChildProfile, getMyProviderInfo, getMySchoolInfo, getParentProfile, getSettings, updateChildAvailability, updateChildProfile, updateMyProviderProfile, updateParentProfile, updateSchoolInfo } from '../../utils/api/apiList';

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

export const getInfoAuth = createAsyncThunk(
	'auth/getInfoAuth',
	async (data) => {
		try {
			let result = '';
			let resultParent = {};
			let resultChild = {};
			switch (data?.role) {
				case 1000:
					result = await request.post(getSettings, data);
					return result.data;
				case 999:
					result = await request.post(getSettings, data);
					return result.data;
				case 60:
					result = await request.post(getMySchoolInfo, data);
					return result.data;
				case 30:
					result = await request.post(getMyProviderInfo, data);
					return result.data;
				case 3:
					resultParent = await request.post(getParentProfile, data);
					resultChild = await request.post(getChildProfile, data);
					return { parent: resultParent.data, child: resultChild.data };
			}
		} catch (error) {
			console.log('error', error)
		}
		return false;
	}
)

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

export const setAvailabilityClientChild = createAsyncThunk(
	'auth/setAvailabilityClientChild',
	async (data) => {
		try {
			const result = await request.post(updateChildAvailability, data.data);
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
			window.location.href = '/';
		},
	},
	extraReducers: {
		[getInfoAuth.fulfilled]: (state, action) => {
			const user = state.user;
			if (user) {
				if (user.role == 3) {
					state.authDataClientChild = action.payload.child;
					state.authDataClientParent = action.payload.parent;
				} else if (user.role > 900) {
					state.currentCommunity = action.payload;
				} else {
					state.authData = action.payload;
				}
			}
		},
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