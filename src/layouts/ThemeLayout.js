import React from 'react';
import { connect } from 'dva';
import { Layout } from 'antd';
import { Switch } from 'dva/router';
import ThemeHeader from '../components/ThemeHeader';
import ThemeFooter from '../components/ThemeFooter';
import ScrollHandler from '../components/ScrollHandler';
import './styles/theme.less';
import PropTypes from 'prop-types';
const { Content, Header, Footer } = Layout;

@connect()
class ThemeLayout extends React.PureComponent {

  render() {
    const {routerData} = this.props;
    const {childRoutes} = routerData;

    return (
      <Layout className="full-layout theme-layout fixed">
        <Header>
          <ThemeHeader/>
        </Header>
        <Content>
          <ScrollHandler/>
          <Switch>{childRoutes}</Switch>
        </Content>
        <Footer>
          <ThemeFooter/>
        </Footer>
      </Layout>
    );
  }
}

ThemeLayout.propTypes = {
  routerData: PropTypes.object,
};

export default ThemeLayout;
