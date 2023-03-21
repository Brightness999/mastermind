import { routerLinks } from "../routes/constant";
import modelEnhance from '../utils/modelEnhance';
import { DEFAULT_LOCALE } from '../i18n';
export default modelEnhance({
  namespace: 'global',

  state: {
    menu: [],
    flatMenu: [],
    locale: DEFAULT_LOCALE,
  },

  effects: {
    *getMenu({ payload }, { call, put }) {
      const data = [
        { name: 'Dashboard', icon: 'DashboardOutlined', path: routerLinks['Dashboard'], },

      ]
      const loopMenu = (menu, pitem = {}) => {
        menu.forEach(item => {
          if (pitem.path) {
            item.parentPath = pitem.parentPath ? pitem.parentPath.concat(pitem.path) : [pitem.path];
          }
          if (item.children && item.children.length) {
            loopMenu(item.children, item);
          }
        });
      };
      loopMenu(data);

      yield put({
        type: 'getMenuSuccess',
        payload: data,
      });
    },
    *setLocale({ payload }, { put }) {
      yield put({
        type: 'setLocaleSuccess',
        payload,
      });
    }
  },

  reducers: {
    getMenuSuccess(state, { payload }) {
      return {
        ...state,
        menu: payload,
        flatMenu: getFlatMenu(payload),
      };
    },
    setLocaleSuccess(state, { payload }) {
      return {
        ...state,
        locale: payload,
      };
    },
  },
});

export function getFlatMenu(menus) {
  let menu = [];
  menus.forEach(item => {
    if (item.children) {
      menu = menu.concat(getFlatMenu(item.children));
    }
    menu.push(item);
  });
  return menu;
}