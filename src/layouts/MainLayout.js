import React from 'react';
import { Layout } from 'antd';
import { Switch } from 'dva/router';
import MainHeader from '../components/MainHeader';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';

import { checkPermission } from 'utils/auth/checkPermission';
import { routerLinks } from "routes/constant";
import { setUser, initializeAuth } from 'src/redux/features/authSlice';
import { initializeAppointments } from 'src/redux/features/appointmentsSlice';
import { store } from 'src/redux/store';
import '../assets/styles/index.less';
import './styles/main.less';

const { Content, Header } = Layout;

class MainLayout extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      route: this.props.routerData.childRoutes
    };
  }

  componentDidMount() {
    const token = Cookies.get('tk');
    if (token?.length > 0) {
      checkPermission().then(loginData => {
        (loginData?.role > 900 && !window.location.pathname.includes('account/changeprofile') && !window.location.pathname.includes('account/notifications')) && this.props.history.push(routerLinks.Admin);
        store.dispatch(setUser(loginData));
      }).catch(err => {
        Cookies.remove('tk');
        this.logout();
        this.props.history.push(routerLinks.Home);
      })
      return;
    } else {
      this.logout();
      this.props.history.push(routerLinks.Home);
    }
  }

  logout = () => {
    store.dispatch(initializeAuth());
    store.dispatch(initializeAppointments());
  }

  render() {
    const { route } = this.state;

    return (
      <Layout className="full-layout main-layout">
        <Header>
          <MainHeader />
        </Header>
        <Content>
          <Switch>{route}</Switch>
        </Content>
      </Layout>
    );
  }
}

MainLayout.propTypes = {
  routerData: PropTypes.object,
};

export default MainLayout;