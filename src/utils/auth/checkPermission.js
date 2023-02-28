import request from '../../utils/api/request';
import { checkLogin } from '../../utils/api/apiList';
import Cookies from 'js-cookie';

export const checkPermission = async () => {
    const token = Cookies.get('tk');
    const headers = {
        Authorization: 'Bearer ' + token
    };
    const result = await request.post(checkLogin, {}, { headers: headers });
    return result.data;
}