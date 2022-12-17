import React from 'react';
import { Layout } from 'antd';
import { Switch } from 'dva/router';
import MainHeader from '../components/MainHeader';
import PropTypes from 'prop-types';
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
    if (!localStorage.getItem('token')) {
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