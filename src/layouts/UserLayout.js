import React from 'react';
import { connect } from 'dva';
import { Layout } from 'antd';
import { Switch } from 'dva/router';
import './styles/user.less';
import PropTypes from 'prop-types';
const { Content } = Layout;

@connect()
class UserLayout extends React.PureComponent {

  render() {
    const {routerData} = this.props;
    const {childRoutes} = routerData;

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
