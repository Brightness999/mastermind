import React from 'react';
import { Layout } from 'antd';
import { Switch } from 'dva/router';
import './styles/user.less';
import PropTypes from 'prop-types';
const { Content } = Layout;
import { checkPermission } from '../utils/auth/checkPermission';
import { routerLinks } from "../routes/constant";

class UserLayout extends React.PureComponent {
  componentDidMount() {
    if (!!localStorage.getItem('token') && localStorage.getItem('token').length > 0) {
      checkPermission().then(loginData => {
        loginData?.role > 900 ? this.props.history.push(routerLinks.Admin) : this.props.history.push(routerLinks.Dashboard);
      })
      return;
    }
  }

  render() {
    const { routerData } = this.props;
    const { childRoutes } = routerData;

    return (
      <Layout className="full-layout user-layout fixed">
        <Content>
          <Switch>{childRoutes}</Switch>
        </Content>
      </Layout>
    );
  }
}

UserLayout.propTypes = {
  routerData: PropTypes.object,
};

export default UserLayout;
