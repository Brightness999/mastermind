/**
 * source
 * https://github.com/ant-design/ant-design-pro/blob/master/src/components/SiderMenu/SiderMenu.js
 */
import React, { PureComponent } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { Drawer, Layout, Menu, Select, Switch, Space } from 'antd';
import intl from "react-intl-universal";
import { Link } from 'dva/router';
import pathToRegexp from 'path-to-regexp';
import {DashboardOutlined, MenuOutlined} from '@ant-design/icons';
import './style/index.less';
import messages from './messages';

const {Option} = Select;
const { Sider } = Layout;
const {SubMenu} = Menu;

// Allow menu.js config icon as string or ReactNode
//   icon: 'setting',
//   icon: 'http://demo.com/icon.png',
//   icon: <Icon type="setting" />,

// const IconName = ({iconName}) => (
//       React.createElement(iconName)
// );
const IconName = ({ type, ...rest }) => {
  const icons = require(`@ant-design/icons`);
  const Component = icons[type];
  return <Component {...rest} />;
};

const getIcon = icon => {
  if (typeof icon === 'string' && icon.indexOf('http') === 0) {
    return <img src={icon} alt="icon" className="sider-menu-item-img" />;
  }
  if (typeof icon === 'string') {
    return <IconName type={icon} />;
  }
  return icon;
};


export const getMeunMatchKeys = (flatMenu, path) => flatMenu.filter(item => pathToRegexp(item.path).test(path));

class LeftSideBar extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      openKeys: props.currentMenu ? props.currentMenu.parentPath : []
    };
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if ('currentMenu' in nextProps) {
      this.setState({
        openKeys: nextProps.currentMenu.parentPath || []
      });
    }
  }

  /**
   * Determine if it is an http link. Return Link or a
   * Judge whether it is http link.return a or Link
   * @memberof SiderMenu
   */
  getMenuItemPath = item => {
    const itemPath = this.conversionPath(item.path);
    const icon = getIcon(item.icon);
    const { isMobile, onCollapse } = this.props;
    const { target, name } = item;
    // Is it a http link
    if (/^https?:\/\//.test(itemPath)) {
      return (
        <a href={itemPath} target={target}>
          {icon}
          <span>{name}</span>
        </a>
      );
    }
    return (
      <Link
        to={itemPath}
        target={target}
        replace={itemPath === this.props.location.pathname}
        onClick={isMobile ? onCollapse : () => {}}
      >
        {icon}
        <span className="menu-dot">{name}</span>
      </Link>
    );
  };

  /**
   * get SubMenu or Item
   */
  getSubMenuOrItem = item => {
    if (item.children && item.children.some(child => child.name)) {
      const childrenItems = this.getNavMenuItems(item.children);
      if (childrenItems && childrenItems.length > 0) {
        return (
          <SubMenu
            title={
              item.icon ? (
                <span>
                  {getIcon(item.icon)}
                  <span className="menu-dot">{item.name}</span>
                </span>
              ) : (
                <span className="menu-dot">{item.name}</span>
              )
            }
            key={item.path}
          >
            {childrenItems}
          </SubMenu>
        );
      }
      return null;
    }
    return (
      <Menu.Item key={item.path}>{this.getMenuItemPath(item)}</Menu.Item>
    );

  };

  /**
   * Get menu subnode
   */
  getNavMenuItems = menusData => {
    if (!menusData) {
      return [];
    }
    return menusData
      .filter(item => item.name && !item.hideInMenu)
      .map(item => this.getSubMenuOrItem(item))
      .filter(item => item);
  };

  // conversion Path
  // Conversion path
  conversionPath = path => {
    if (path && path.indexOf('http') === 0) {
      return path;
    }
    return `/${path || ''}`.replace(/\/+/g, '/').replace(/\/:\w+\??/, '');

  };

  // Get the currently selected menu
  getSelectedMenuKeys = () => {
    const {pathname} = this.props.location;
    const selectMenu = getMeunMatchKeys(this.props.flatMenu, pathname)[0];
    return selectMenu ? [selectMenu.path] : [];
  };

  isMainMenu = key => this.props.menu.some(
    item => key && (item.key === key || item.path === key)
  );

  handleOpenChange = openKeys => {
    const lastOpenKey = openKeys[openKeys.length - 1];
    const moreThanOne =
      openKeys.filter(openKey => this.isMainMenu(openKey)).length > 1;
    this.setState({
      openKeys: moreThanOne ? [lastOpenKey] : [...openKeys]
    });
  };

  render() {
    const {
      fixed,
      theme,
      onCollapse,
      collapsed,
      onCollapseAll,
      leftCollapsedWidth,
      showHeader,
      user,
      menu,
      isMobile
    } = this.props;

    const classnames = cx('sidebar-left', 'sidebar-default', {
      affix: !!fixed,
      'sidebar-left-sm': collapsed,
      'show-header': collapsed ? false : showHeader,
      'sidebar-left-close': leftCollapsedWidth === 0,
      [theme]: !!theme
    });

    const { openKeys } = this.state;
    // if pathname can't match, use the nearest parent's key
    const selectedKeys = this.getSelectedMenuKeys();
    // Don't show popup menu when it is been collapsed
    const menuProps = collapsed
      ? {
        selectedKeys
      }
      : {
        openKeys,
        selectedKeys
      };

    const siderBar = (
      <Sider
        className={classnames}
        width={265}
        collapsedWidth={leftCollapsedWidth + 0.1}
        collapsible
        collapsed={isMobile ? false : !collapsed}
        onCollapse={isMobile ? null : null}
        breakpoint="lg"
        trigger={null}
      >
        <div className="sidebar-left-content">
          <Menu
            onClick={this.handleClick}
            onOpenChange={this.handleOpenChange}
            mode="inline"
            theme={theme}
            {...menuProps}
          >
            {this.getNavMenuItems(menu)}
          </Menu>
          {/* <div className="sidebar-toggle-mini">
            {collapsed && leftCollapsedWidth !== 0 && !isMobile ? (
              <Switch
                checked={collapsed}
                onChange={onCollapseAll}
                size="small"
              />
            ) : null}
          </div> */}
        </div>
      </Sider>
    );

    return isMobile ? (
      <Drawer
        className="left-sidebar-drawer"
        visible={!collapsed}
        placement="left"
        onClose={onCollapse}
        width={265}
        closable={false}
      >
        <div className="navbar-branding">
          <div className="navbar-brand">
            <img src='/images/logoAct.png' alt="logo" />
            <b>ACT</b>
            Admin
          </div>
          <span role="presentation" className="toggle-sidemenu-l" onClick={onCollapse}>
            <MenuOutlined />
          </span>
        </div>
        {siderBar}
      </Drawer>
    ) : (
      siderBar
    );
  }
}

LeftSideBar.propTypes = {
  fixed: PropTypes.bool,
  collapsed: PropTypes.bool,
  isMobile: PropTypes.bool,
  showHeader: PropTypes.bool,
  theme: PropTypes.string,
  currentMenu: PropTypes.object,
  location: PropTypes.object,
  user: PropTypes.any,
  onCollapse: PropTypes.func,
  onCollapseAll: PropTypes.func,
  flatMenu: PropTypes.array,
  menu: PropTypes.array,
  leftCollapsedWidth: PropTypes.number,
};

LeftSideBar.defaultProps = {
  fixed: true,
  theme: ''
};

export default LeftSideBar;
