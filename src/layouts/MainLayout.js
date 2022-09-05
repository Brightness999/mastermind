import React from 'react';
import { connect } from 'dva';
import { Layout } from 'antd';
import { Switch } from 'dva/router';
import MainHeader from '../components/MainHeader';
import PropTypes from 'prop-types';
import '../assets/styles/index.less';
import './styles/main.less';

const { Content, Header, Footer } = Layout;
import { checkPermission } from '../utils/auth/checkPermission';
class MainLayout extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    console.log('day la did mount cua user layout')
    if(!!localStorage.getItem('token')&&localStorage.getItem('token').length >0){
      checkPermission().then(path=>{
        
      }).catch(er=>{
        this.props.history.push('/');
      })
      
    }else{
      this.props.history.push('/');
    }
  }

  render() {
    const { routerData } = this.props;
    const { childRoutes } = routerData;

    return (
      <Layout className="full-layout main-layout fixed">
        <Header>
          <MainHeader />
        </Header>
        <Content>
          <Switch>{childRoutes}</Switch>
        </Content>
        <Footer>
          <p className='mb-0'>Footer</p>
        </Footer>
      </Layout>
    );
  }
}

MainLayout.propTypes = {
  routerData: PropTypes.object,
};

export default MainLayout;
