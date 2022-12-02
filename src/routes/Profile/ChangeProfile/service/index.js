import { MENU_ADMIN, MENU_SCHOOL, MENU_PROVIDER, MENU_PARENT } from "../constant";

export const setKeyDefault = (role) => {
    switch (role) {
        case 999:
            return MENU_ADMIN[0].key;
        case 60:
            return MENU_SCHOOL[0].key;
        case 30:
            return MENU_PROVIDER[0].key;
        case 3:
            return MENU_PARENT[0].key;
    }
}

