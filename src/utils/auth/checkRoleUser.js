import { routerLinks } from "../../routes/constant";

export const checkRoleUser = (role, childRoutes) => {
    let newChildRoute = [];
    switch (role) {
        case 1000:
            newChildRoute = childRoutes.filter(item => item.key !== routerLinks.Dashboard);
            break;
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
