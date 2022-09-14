import './style/index.less';
import React, { Component } from 'react'
import { Drawer, Layout, Menu, Select, Button } from 'antd';
import { FaUsers, FaFileInvoice, FaRegChartBar } from 'react-icons/fa';
import { IoSettingsSharp } from 'react-icons/io5';
import { Link } from 'dva/router';
import intl from "react-intl-universal";
import messages from './messages';
import { routerLinks } from '../../routes/constant';
const {Option} = Select;
const { Sider } = Layout;
const {SubMenu} = Menu;

class SideBar extends Component {
  state = {
    hovered: false,
    clicked: false,
    visibleCancel: false,
    visibleCurrent: false
  };
 
  render() {
    
    const items = [
      { 
        label: <Link to={routerLinks['UserManager']}>{intl.formatMessage(messages.userManager)}</Link>, 
        key: 'user_manager', 
        icon: <FaUsers size={20}/> 
      }, 
      { 
        label: <Link to={routerLinks['SubsidyManager']}>{intl.formatMessage(messages.subsidyManager)}</Link>, 
        key: 'subsidy_manager', 
        icon: <FaFileInvoice size={20}/> 
      }, 
      { 
        label: <Link to={routerLinks['SystemSetting']}>{intl.formatMessage(messages.systemSetting)}</Link>, 
        key: 'system_setting', 
        icon: <IoSettingsSharp size={20}/> 
      }, 
      { 
        label: <Link to={routerLinks['Statistics']}>{intl.formatMessage(messages.statistics)}</Link>, 
        key: 'statistics', 
        icon: <FaRegChartBar size={20}/> 
      }, 
      
    ];

    return (
    <Menu
        mode="inline"
        defaultSelectedKeys={['user_manager']}
        style={{
          height: '100%',
          borderRight: 0,
        }}
        items={items}
      />
    );
  }
}

export default SideBar;
