import axios from 'axios'
import Cookies from 'js-cookie';
import { message } from 'antd';
import CryptoJS from 'crypto-js';
import { routerLinks } from 'routes/constant';
import { url } from './baseUrl';
import { store } from 'src/redux/store';
import { initializeAppointments } from 'src/redux/features/appointmentsSlice';
import { initializeAuth } from 'src/redux/features/authSlice';

// config aioxs
const instance = axios.create({
	baseURL: url,
	timeout: 300000,
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
})

instance.interceptors.request.use(
	config => {
		const token = Cookies.get('tk');

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
			Cookies.set('tk', token, { expires: new Date(Date.now() + 10 * 60 * 1000) });
		} else {
			if (window.location.pathname.includes('/account') || window.location.pathname.includes('/administrator')) {
				message.warning({
					content: 'Your session has expired.',
					className: 'popup-session-expired',
					duration: 1,
				}).then(() => {
					store.dispatch(initializeAuth());
					store.dispatch(initializeAppointments());
					window.location.href = routerLinks.Home;
				})
			} else {
				delete instance.defaults.headers.common.Authorization;
			}
		}
		return config;
	},
	error => Promise.reject(error)
);
// response parse
instance.interceptors.response.use((response) => {
	const { code, auto } = response.data
	if (code === 401) { }
	return response.data;
}, error => {
	return Promise.reject(error)
})

export function generateSearchStructure(search = "", filter = {}, page = 1, limit = 10) {
	return {
		"data": {
			"search": search,
			"filter": filter,
			"page": page,
			"limit": limit
		}
	}
}

export function generateSearchStructureWithPopulateSearch(search = "", filter = {}, page = 1, limit = 10, populate = [], isNestedQuery = false) {
	return {
		"data": {
			"search": search,
			"filter": filter,
			"page": page,
			"limit": limit,
			"populate": populate,
			"isNestedQuery": isNestedQuery
		}
	}
}

export function encryptParam(param) {
	const key = 'hmghpayment';
	return CryptoJS.AES.encrypt(param, key).toString();
}

export function decryptParam(encryptedParam) {
	const key = 'hmghpayment';
	return CryptoJS.AES.decrypt(encryptedParam, key).toString(CryptoJS.enc.Utf8);
}

export default instance;
