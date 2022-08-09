import React from 'react';
import { connect } from 'dva';
import { Layout } from 'antd';
import { Switch } from 'dva/router';
import MainHeader from '../components/MainHeader';
import PropTypes from 'prop-types';
import '../assets/styles/index.less';

const { Content, Header, Footer } = Layout;

@connect()
class MainLayout extends React.PureComponent {

  render() {
    const {routerData} = this.props;
    const {childRoutes} = routerData;

    return (
      <Layout className="full-layout main-layout fixed">
        <Header>
            <MainHeader/>
        </Header>
        <Content>
          <Switch>{childRoutes}</Switch>
        </Content>
        <Footer>
            <p className='center'>Footer</p>
        </Footer>
      </Layout>
    );
  }
}

MainLayout.propTypes = {
  routerData: PropTypes.object,
};

export default MainLayout;
