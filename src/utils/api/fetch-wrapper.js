import { url } from './baseUrl';
import {logout} from '../../redux/features/authSlice'
// config aioxs
const instance = axios.create({
    baseURL: url,
    timeout: 300000,
    headers: {
        'Content-Type': 'application/json',
    }
})

instance.setToken = (token) => {
    instance.defaults.headers['x-access-token'] = token
}

// response parse
instance.interceptors.response.use((response) => {

    const {code, auto} = response.data
    if (code === 401) {
        
    }
    return response
}, error => {
    console.warn('Error status', error.response.status)
    // return Promise.reject(error)
    if (error.response) {
        return parseError(error.response.data)
    } else {
        return Promise.reject(error)
    }
})