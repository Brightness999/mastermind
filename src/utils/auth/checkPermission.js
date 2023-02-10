import { url } from '../../utils/api/baseUrl';
import axios from 'axios';
export const checkPermission = async () => {
    const token = localStorage.getItem('token');
    const headers = {
        Authorization: 'Bearer ' + token
    };
    const result = await axios.post(url + 'users/check_login', {}, { headers: headers });
    return result.data.data;
}