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
// import io from 'socket.io-client';
// import socketio from "http://localhost:3090/socket.io/socket.io.js";//"socket.io-client";


import { routerLinks } from '../routes/constant';
import { checkRoleUser } from '../utils/auth/checkRoleUser';
class MainLayout extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      route: this.props.routerData.childRoutes
    };
  }

  componentDidMount() {
    
    // if(!!localStorage.getItem('token')&&localStorage.getItem('token').length >0){
    //   checkPermission().then(path=>{
    //   const { childRoutes } = this.props.routerData;
    //   const newChildRoute = checkRoleUser(path.role, childRoutes);
    //   if(newChildRoute){
    //     this.setState({
    //       route: [...newChildRoute]
    //     })
    //   }
    //   }).catch(er=>{
    //     this.props.history.push('/');
    //   })
      
    // }else{
    //   this.props.history.push('/');
    // }
    
    
    
  }
  
  

  render() {
    const { routerData } = this.props;
    const { childRoutes } = routerData;
    const {route} = this.state;
    
    return (
      <Layout className="full-layout main-layout fixed">
        <Header>
          <MainHeader />
        </Header>
        <Content>
          <Switch>{route}</Switch>
        </Content>
        {/* <Footer>
          <p className='mb-0'>Footer</p>
        </Footer> */}
      </Layout>
    );
  }
}

MainLayout.propTypes = {
  routerData: PropTypes.object,
};

export default MainLayout;
