import { routerLinks } from "../../routes/constant";
import { listRoleWithRouter } from './listRoleWithRouter'

import { url } from '../../utils/api/baseUrl';
import axios from 'axios';
export const checkPermission = () => {
    const routes = listRoleWithRouter

    const token = localStorage.getItem('token');
    console.log('token',token)
    const headers = {
        Authorization: 'Bearer ' + token
    };
    return axios.post(url+'users/check_login' , {},{headers:headers}).then(result=>{
        return result.data.data;
    })
    // if (user) {
    //     const { role } = user;
    //     const route = routes.find(item => item.role === role);
    //     return route.path;
    // }
    // else {
    //     return routerLinks['Login'];
    // }
}