import { url } from "../api/baseUrl";
import axios from "axios";
import { routerLinks } from "../../routes/constant";
const headers = {
  Authorization: 'Bearer ' + localStorage.getItem('token')
};
export const checkRoleUser = (role, childRoutes) => {
    let newChildRoute = [];
    switch (role) {
        case 999:
            newChildRoute = childRoutes.filter(item => item.key !== routerLinks.Dashboard); 
            break;
        case 60:
            newChildRoute = childRoutes.filter(item => item.key !== routerLinks.Admin);
            
                break;
        case 30:
            newChildRoute = childRoutes.filter(item => item.key !== routerLinks.Admin);
            break;
        default:
            newChildRoute = childRoutes.filter(item => item.key !== routerLinks.Admin);
            break;
    }
    return newChildRoute
}
