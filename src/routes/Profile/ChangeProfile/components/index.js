import React from 'react';
import { Link } from 'dva/router';
import './index.less';
import { Layout, Menu } from 'antd';

import Info_profile from './Provider/info_profile';
import Info_services from './Provider/info_services';
import Info_availability from './Provider/info_availability';
import Subsidy_program from './Provider/subsidy_program';

import Info_child from './Parents/info_child';
import Info_parent from './Parents/info_parent';
import Info_progress from './Parents/info_progress';

import Info_school from './School/info_school';

import Info_admin from './Admin/info_admin';
import { MENU_ADMIN, MENU_PARENT, MENU_PROVIDER, MENU_SCHOOL } from '../constant';
import { setKeyDefault } from '../service';

// @connect(({ login, loading, global }) => ({
//   global,
//   login,
//   loading: loading.models.login
// }))

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user : localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : '',
      parent: {
        info_child: false,
        info_parent: true,
        info_progress: false,
        change_password: false
      },
      provider: {
        info_profile: true,
        info_availability: false,
        info_services: false,
        subsidy_program: false,
        change_password: false
      },
      school: {
        info_school: true,
        change_password: false
      },
      admin: {
        info_admin: true,
        change_password: false
      },
      listMenu : [],
      keyActive: setKeyDefault()
    };
  }
  componentDidMount() {
    const {user} = this.state;
    switch (user.role) {
      case 999:
        this.setState({ listMenu: this.getMenuList(MENU_ADMIN) });
        break;
      case 60:
        this.setState({ listMenu: this.getMenuList(MENU_SCHOOL) });
        break;
      case 30:
        this.setState({ listMenu: this.getMenuList(MENU_PROVIDER) });
        break;
      default:
        this.setState({ listMenu: this.getMenuList(MENU_PARENT) });
        break;
    }
  }

  onSubmit = async () => {

  }
  getBirthday = () => {
  }
  defaultOnValueChange = (event , fieldName)=>{
  }

  getMenuList = (data) => {
    const menu = data.map((item, index) => ({
      key: String(item.key),
      icon: item.icon != '' ? React.createElement(item.icon) : '',
      label: (
        <Link to='#' onClick={()=>this.changeMenu(item.key)}>
            {item.label}
        </Link>
    )}))
    return menu;
  }
  changeMenu = (val) => {
    const {user} = this.state;
    this.setState({keyActive: val});
    switch (user.role) {
      case 999:
        switch (val) {
          case 'Info_admin':
            this.setState({
              admin: {
                info_admin: true,
                change_password: false
            }})
            break;
          default:
            this.setState({
              admin: {
                info_admin: false,
                change_password: true
            }})
            break;
        }
      break;
      case 60:
        switch (val) {
          case 'Info_school':
            this.setState({
              admin: {
                info_school: true,
                change_password: false
            }})
            break;
          default:
            this.setState({
              admin: {
                info_admin: false,
                change_password: true
            }})
            break;
        }
      break;
      case 30:
        switch (val) {
          case 'Info_profile':
            this.setState({
              provider: {
                info_profile: true,
                info_availability: false,
                info_services: false,
                subsidy_program: false
            }})
            break;
          case 'Info_services':
            this.setState({ 
              provider: {
                info_profile: false,
                info_availability: false,
                info_services: true,
                subsidy_program: false
              }})
            break;
          case 'Info_availability':
            this.setState({  
              provider: {
                info_profile: false,
                info_availability: true,
                info_services: false,
                subsidy_program: false
              }})
            break;
          default:
            this.setState({ 
              provider: {
                info_profile: false,
                info_availability: false,
                info_services: false,
                subsidy_program: true
              }})
            break;
        }
      break;
      default:
        switch (val) {
          case 'Info_child':
            this.setState({
              parent: {
                info_child: true,
                info_parent: false,
                info_progress: false
              }})
            break;
          case 'Info_parent':
            this.setState({
              parent: {
                info_child: false,
                info_parent: true,
                info_progress: false
              }})
            break;
          default:
            this.setState({
              parent: {
                info_child: false,
                info_parent: false,
                info_progress: true
              }})
            break;
        }
      break;
    }
  }

  getScreen = () => {
    const {user, admin, school, parent, provider} = this.state;
    switch (user.role) {
      case 999:
        if(admin.info_admin){
          return <Info_admin />
        }else{
          return <Info_parent />
        }
      case 60:
        if(school.info_school){
          return <Info_school />
        }else{
          return <Info_parent />
        }
      case 30:
        if(provider.info_profile){
          return <Info_profile />
        } else if(provider.info_availability){
          return <Info_availability />
        } else if (provider.info_services){
          return <Info_services />
        } else if (provider.info_progress){
          return <Subsidy_program />
        }
      default:
        if(parent.info_child){
          return <Info_child />
        } else if(parent.info_parent){
          return <Info_parent />
        } else if(parent.info_progress){
          return <Info_progress />
        }
    }
  }
  render() {
    const {user, listMenu, keyActive} = this.state;
    return (
      <div className="full-layout page admin-page">
      <div className='div-content'>
        <section className='div-activity-feed box-card'>
          <Menu theme="light" mode="inline" defaultSelectedKeys={keyActive} 
          items={listMenu}/>
        </section>
        <section className='div-calendar box-card'>
          { this.getScreen() }
        </section>
      </div>
    </div>
      
    );
  }
}

