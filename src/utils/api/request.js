import { url } from './baseUrl';
import axios from 'axios'
import Cookies from 'js-cookie';

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
		} else {
			if (window.location.pathname.includes('/account') || window.location.pathname.includes('/administrator')) {
				window.location.href = '/';
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

export default instance;
