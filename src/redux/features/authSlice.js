import { url } from '../../utils/api/baseUrl';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { helper } from '../../utils/auth/helper';
import request from '../../utils/api/request'
import { getChildProfile, getMyProviderInfo, getMySchoolInfo, getParentProfile, updateChildAvailability, updateChildProfile, updateMyProviderProfile, updateParentProfile, updateSchoolInfo } from '../../utils/api/apiList';
import { message } from 'antd';

const initialState = {
	user: [],
	authData: [],
	authDataClientChild: [],
	authDataClientParent: [],
	dependents: [],
	providers: [],
	skillSet: [],
	locations: [],
};

export const getInfoAuth = createAsyncThunk(
	'auth/getInfoAuth',
	async (role, token) => {
		try {
			let result = '';
			let resultParent = {};
			let resultChild = {};
			switch (role) {
				case 60:
					result = await request.post(url + getMySchoolInfo, {}, token);
					return result.data;
				case 30:
					result = await request.post(url + getMyProviderInfo, {}, token);
					return result.data;
				case 3:
					resultParent = await request.post(url + getParentProfile, {}, token);
					resultChild = await request.post(url + getChildProfile, {}, token);
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
			const result = await request.post(url + updateChildProfile, data.data, data.token);
			if (result.success) {
				message.success('Updated successfully');
			}
		} catch (error) {
			console.log(error, 'error')
		}
		return false
	}
)

export const setAvailabilityClientChild = createAsyncThunk(
	'auth/setAvailabilityClientChild',
	async (data) => {
		try {
			const result = await request.post(url + updateChildAvailability, data.data, data.token);
			if (result.success) {
				message.success('Updated successfully');
			}
		} catch (error) {
			console.log(error, 'error')
		}
		return false
	}
)

export const setInforClientParent = createAsyncThunk(
	'auth/setInforClientParent',
	async (data) => {
		try {
			const result = await request.post(url + updateParentProfile, data.data, data.token);
			if (result.success) {
				message.success('Updated successfully');
			}
		} catch (error) {
			console.log(error, 'error')
		}
		return false
	}
)

export const setInforProvider = createAsyncThunk(
	'auth/setInforProvider',
	async (data) => {
		try {
			const result = await request.post(url + updateMyProviderProfile, data.data, data.token);
			if (result.success) {
				message.success('Updated successfully');
			}
		} catch (error) {
			console.log(error, 'error')
		}
		return false
	}
)

export const setInforSchool = createAsyncThunk(
	'auth/setInforSchool',
	async (data) => {
		try {
			const result = await request.post(url + updateSchoolInfo, data.data, data.token);
			if (result.success) {
				message.success('Updated successfully');
			}
		} catch (error) {
			console.log(error, 'error')
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
		changeInforClientChild(state, action) {
			state.authDataClientChild = action.payload
		},
		changeInforClientChild(state, action) {
			state.authDataClientChild = action.payload
		},
		changeInfor(state, action) {
			state.authData = action.payload
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
		logout(state) {
			localStorage.removeItem('token');
			helper.history.push('/');
		},
		removeUser() {
			localStorage.removeItem('user'),
				state.initialState = { ...initialState }
		}
	},
	extraReducers: {
		[getInfoAuth.fulfilled]: (state, action) => {
			const user = localStorage.getItem('user') && JSON.parse(localStorage.getItem('user'))
			if (user) {
				if (user.role == 3) {
					state.authDataClientChild = action.payload.child;
					state.authDataClientParent = action.payload.parent;
				} else {
					state.authData = action.payload;
				}
			}
		},
	}
});

export const { logout, setAuthData, setUser, removeUser, changeInforClientChild, changeInforClientParent, changeInfor, setDependents, setProviders, setSkillSet, setLocations } = authSlice.actions;

export default authSlice.reducer;