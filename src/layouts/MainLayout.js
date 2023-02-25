import React from 'react';
import { Layout } from 'antd';
import { Switch } from 'dva/router';
import MainHeader from '../components/MainHeader';
import PropTypes from 'prop-types';
import '../assets/styles/index.less';
import './styles/main.less';
import { checkPermission } from '../utils/auth/checkPermission';
import { routerLinks } from "../routes/constant";
import { setUser } from '../redux/features/authSlice';
import { store } from '../redux/store';

const { Content, Header } = Layout;

class MainLayout extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      route: this.props.routerData.childRoutes
    };
  }

  componentDidMount() {
    if (!!localStorage.getItem('token') && localStorage.getItem('token').length > 0) {
      checkPermission().then(loginData => {
        (this.props.location.pathname == routerLinks.Dashboard && loginData?.role > 900) && this.props.history.push(routerLinks.Admin);
        store.dispatch(setUser(loginData));
      })
      return;
    } else {
      this.props.history.push('/');
    }
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