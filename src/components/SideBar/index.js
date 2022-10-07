import './style/index.less';
import React, { Component } from 'react'
import { Menu } from 'antd';
import { FaUsers, FaFileInvoice, FaRegChartBar, FaHandshake, FaFlag, FaSchool } from 'react-icons/fa';
import { AiOutlineSchedule } from 'react-icons/ai';
import { IoSettingsSharp } from 'react-icons/io5';
import { Link } from 'dva/router';
import intl from "react-intl-universal";
import messages from './messages';
import { routerLinks } from '../../routes/constant';

class SideBar extends Component {
  render() {
    const items = [
      {
        label: <Link to={routerLinks['Appointments']}>{intl.formatMessage(messages.appointments)}</Link>,
        key: 'appointments',
        icon: <FaHandshake size={20} />
      },
      {
        label: <Link to={routerLinks['UserManager']}>{intl.formatMessage(messages.userManager)}</Link>,
        key: 'users_center',
        icon: <FaUsers size={20} />
      },
      {
        label: <Link to={routerLinks['SchoolsList']}>{intl.formatMessage(messages.schoolsList)}</Link>,
        key: 'schools_list',
        icon: <FaSchool size={20} />
      },
      {
        label: <Link to={routerLinks['FlagList']}>{intl.formatMessage(messages.flagList)}</Link>,
        key: 'flag_list',
        icon: <FaFlag size={20} />
      },
      {
        label: <Link to={routerLinks['ConsultationRequests']}>{intl.formatMessage(messages.consultationRequests)}</Link>,
        key: 'consultation_requests',
        icon: <FaUsers size={20} />
      },
      {
        label: <Link to={routerLinks['SubsidyManager']}>{intl.formatMessage(messages.subsidyManager)}</Link>,
        key: 'subsidized_lit',
        icon: <FaFileInvoice size={20} />
      },
      {
        label: <Link to={routerLinks['Admin']}>{intl.formatMessage(messages.schedulingCenter)}</Link>,
        key: 'scheduling_center',
        icon: <AiOutlineSchedule size={20} />
      },
      {
        label: <Link to={routerLinks['SystemSetting']}>{intl.formatMessage(messages.systemSetting)}</Link>,
        key: 'system_setting',
        icon: <IoSettingsSharp size={20} />
      },
      {
        label: <Link to={routerLinks['Statistics']}>{intl.formatMessage(messages.statistics)}</Link>,
        key: 'statistics',
        icon: <FaRegChartBar size={20} />
      },

    ];

    return (
      <Menu
        mode="inline"
        defaultSelectedKeys={['appointments']}
        rootClassName="height-full"
        items={items}
      />
    );
  }
}

export default SideBar;
