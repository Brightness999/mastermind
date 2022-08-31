import { routerLinks } from "../../routes/constant";
import { listRoleWithRouter } from './listRoleWithRouter'


export const checkPermission = () => {
    const routes = listRoleWithRouter

    const user = JSON.parse(localStorage.getItem('user'));

    if (user) {
        const { role } = user;
        const route = routes.find(item => item.role === role);
        return route.path;
    }
    else {
        return routerLinks['Login'];
    }
}