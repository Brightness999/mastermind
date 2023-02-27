import request from '../../utils/api/request';
import { checkLogin } from '../../utils/api/apiList';

export const checkPermission = async () => {
    const token = localStorage.getItem('token');
    const headers = {
        Authorization: 'Bearer ' + token
    };
    const result = await request.post(checkLogin, {}, { headers: headers });
    return result.data;
}