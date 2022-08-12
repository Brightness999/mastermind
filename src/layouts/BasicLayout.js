import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Layout } from 'antd';
import { routerRedux, Switch } from 'dva/router';
import pathToRegexp from 'path-to-regexp';
import $$ from 'cmn-utils';
import cx from 'classnames';
import PropTypes from 'prop-types';

import { routerLinks } from "../routes/constant";
import NavBar from '../components/NavBar';
import SkinToolbox from '../components/SkinToolbox';
import { LeftSideBar, RightSideBar } from '../components/SideBar';
import TopBar from '../components/TopBar';
import CSSAnimate from '../components/CSSAnimate';

import { enquireIsMobile } from '../utils/enquireScreen';
import './styles/basic.less';
import TabsLayout from './TabsLayout';

const { Content, Header, Footer } = Layout;

/**
 * Basic department
 * Can set a variety of skin theme: [light, grey, primary, info, warning, danger, alert, system, success, dark]
 *A variety of layouts can be set [header, sidebar, breadcrumb, tabLayout)
 */
@connect(({ global }) => ({ global }))
class BasicLayout extends PureComponent {
  constructor(props) {
    super(props);
    const user = $$.getStore('user', []);
    const theme = $$.getStore('theme', {
      leftSide: 'dark', // left
      navbar: 'light' // top
    });
    if (!theme.layout) {
      theme.layout = [
        'fixedHeader',
        'fixedSidebar',
        'fixedBreadcrumbs'
        // 'hidedBreadcrumbs',
        // 'tabLayout',
      ];
    }
    this.state = {
      collapsedLeftSide: false, // Left sidebar switch control
      leftCollapsedWidth: 60, // Left column width
      expandTopBar: false, // Head multi-function area opening and closing
      showSidebarHeader: false, // Left side head switch
      collapsedRightSide: true, // Right sidebar switch
      theme, // Skin settings
      user,
      currentMenu: {},
      isMobile: false,
      rightSideBar: false,
    };

    props.dispatch({
      type: 'global/getMenu'
    });
  }

  componentDidMount() {
    this.unregisterEnquire = enquireIsMobile(ismobile => {
      const { isMobile, theme } = this.state;
      if (isMobile !== ismobile) {
        // If the check is mobile, the sidebar is not fixed.
        if (ismobile && $$.isArray(theme.layout)) {
          theme.layout = theme.layout.filter(item => item !== 'fixedSidebar');
        }
        this.setState({
          isMobile: ismobile
        });
      }
    });
  }

  componentWillMount() {
    // Check if the owner is logged in
    // const user = $$.getStore('user');
    // if (!user) {
    //   this.props.dispatch(routerRedux.replace(routerLinks['Login']));
    // }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (
      nextProps.location.pathname !== this.props.location.pathname ||
      nextProps.global.flatMenu !== this.props.global.flatMenu
    ) {
      this.setState({
        currentMenu: this.getCurrentMenu(nextProps) || {}
      });
    }
  }

  componentWillUnmount() {
    // Clean up monitoring
    this.unregisterEnquire();
  }

  getCurrentMenu(props) {
    const {
      location: { pathname },
      global
    } = props || this.props;
    return this.getMeunMatchKeys(global.flatMenu, pathname)[0];
  }

  getMeunMatchKeys = (flatMenu, path) => flatMenu.filter(item => pathToRegexp(item.path).test(path));

  /**
   * Top left menu icon shrink control
   */
  onCollapseLeftSide = () => {
    const { leftCollapsedWidth, collapsedLeftSide, collapsedRightSide } = this.state;
    const collapsedLeft =
      leftCollapsedWidth === 0
        ? true
        : !collapsedLeftSide;
    const collapsedRight =
      collapsedRightSide || !collapsedLeft;

    this.setState({
      collapsedLeftSide: collapsedLeft,
      collapsedRightSide: collapsedRight,
      leftCollapsedWidth: 60
    });
  };

  /**
   * Close the left sidebar completely, that is, the width is 0
   */
  onCollapseLeftSideAll = () => {
    this.setState({
      collapsedLeftSide: true,
      leftCollapsedWidth: 0
    });
  };

  /**
   * Contrary to the above
   */
  onCollapseTopBar = () => {
    this.setState({
      expandTopBar: false
    });
  };

  /**
   * Switch the opening and closing of the head in the left column
   */
  toggleSidebarHeader = () => {
    const { showSidebarHeader } = this.state;
    this.setState({
      showSidebarHeader: !showSidebarHeader
    });
  };

  /**
   * Switch the right sidebar
   */
  toggleRightSide = () => {
    const { collapsedLeftSide, collapsedRightSide } = this.state;
    this.setState({
      collapsedLeftSide: collapsedRightSide ? true : collapsedLeftSide,
      collapsedRightSide: !collapsedRightSide
    });
  };

  onChangeLanguage = (value) => {
    const {dispatch} = this.props;
    dispatch({
      type: 'global/setLocale',
      payload: value
    });
  }

  onChangeTheme = theme => {
    $$.setStore('theme', theme);
    this.setState({
      theme
    });
  };

  render() {
    const {
      collapsedLeftSide,
      leftCollapsedWidth,
      expandTopBar,
      showSidebarHeader,
      collapsedRightSide,
      theme,
      user,
      currentMenu,
      isMobile,
      rightSideBar
    } = this.state;
    const { routerData, location, global } = this.props;
    const { menu, flatMenu, locale } = global;
    const { childRoutes } = routerData;
    const classnames = cx('basic-layout', 'full-layout', {
      fixed: theme.layout && theme.layout.indexOf('fixedSidebar') !== -1,
      'fixed-header':
        theme.layout && theme.layout.indexOf('fixedHeader') !== -1,
      'fixed-breadcrumbs':
        theme.layout && theme.layout.indexOf('fixedBreadcrumbs') !== -1,
      'hided-breadcrumbs':
        theme.layout && theme.layout.indexOf('hidedBreadcrumbs') !== -1
    });

    return (
      <Layout className={classnames}>
        <Header>
          <NavBar
            collapsed={collapsedLeftSide}
            onCollapseLeftSide={this.onCollapseLeftSide}
            toggleSidebarHeader={this.toggleSidebarHeader}
            theme={theme.navbar}
            user={user}
            isMobile={isMobile}
            language={locale}
            onChangeLanguage={this.onChangeLanguage}
          />
        </Header>
        <Layout>
          <LeftSideBar
            collapsed={collapsedLeftSide}
            leftCollapsedWidth={leftCollapsedWidth}
            showHeader={showSidebarHeader}
            onCollapse={this.onCollapseLeftSide}
            onCollapseAll={this.onCollapseLeftSideAll}
            location={location}
            theme={theme.leftSide}
            flatMenu={flatMenu}
            currentMenu={currentMenu}
            menu={menu}
            user={user}
            isMobile={isMobile}
          />
          <Content>
            {theme.layout.indexOf('tabLayout') >= 0 ? (
              <TabsLayout childRoutes={childRoutes} location={location} />
            ) : (
              <Layout className="full-layout">
                <Header>
                  <TopBar
                    rightSideBar={rightSideBar}
                    expand={expandTopBar}
                    toggleRightSide={this.toggleRightSide}
                    collapsedRightSide={collapsedRightSide}
                    onCollapse={this.onCollapseTopBar}
                    currentMenu={currentMenu}
                    location={location}
                    theme={theme}
                  />
                </Header>
                <Content className="router-page">
                  <CSSAnimate type='fadeInRight'>
                    <Switch>{childRoutes}</Switch>
                  </CSSAnimate>
                </Content>
              </Layout>
            )}
          </Content>
          {!!rightSideBar && (
            <RightSideBar
              collapsed={collapsedRightSide}
              isMobile={isMobile}
              onCollapse={this.toggleRightSide}
            />
          )}
        </Layout>
      </Layout>
    );
  }
}

BasicLayout.propTypes = {
  dispatch: PropTypes.func,
  routerData: PropTypes.object,
  location: PropTypes.object,
  global: PropTypes.object,
};

export default BasicLayout