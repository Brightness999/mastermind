import './style/index.less';
import React, { Component } from 'react'
import { Menu } from 'antd';
import { FaUsers, FaFileInvoice, FaRegChartBar, FaHandshake, FaFlag, FaSchool } from 'react-icons/fa';
import { AiOutlineSchedule } from 'react-icons/ai';
import { IoSettingsSharp } from 'react-icons/io5';
import { Link, Location } from 'dva/router';
import intl from "react-intl-universal";
import { MdContactPhone } from 'react-icons/md';
import messages from './messages';
import { routerLinks } from '../../routes/constant';

class SideBar extends Component {
  render() {
    const items = [
      {
        label: <Link to={routerLinks['Appointments']}>{intl.formatMessage(messages.appointments)}</Link>,
        key: routerLinks.Appointments,
        icon: <FaHandshake size={20} />
      },
      {
        label: <Link to={routerLinks['UserManager']}>{intl.formatMessage(messages.userManager)}</Link>,
        key: routerLinks.UserManager,
        icon: <FaUsers size={20} />
      },
      {
        label: <Link to={routerLinks['SchoolsList']}>{intl.formatMessage(messages.schoolsList)}</Link>,
        key: routerLinks.SchoolsList,
        icon: <FaSchool size={20} />
      },
      {
        label: <Link to={routerLinks['FlagList']}>{intl.formatMessage(messages.flagList)}</Link>,
        key: routerLinks.FlagList,
        icon: <FaFlag size={20} />
      },
      {
        label: <Link to={routerLinks['ConsultationRequests']}>{intl.formatMessage(messages.consultationRequests)}</Link>,
        key: routerLinks.ConsultationRequests,
        icon: <MdContactPhone size={20} />
      },
      {
        label: <Link to={routerLinks['SubsidyManager']}>{intl.formatMessage(messages.subsidyManager)}</Link>,
        key: routerLinks.SubsidyManager,
        icon: <FaFileInvoice size={20} />
      },
      {
        label: <Link to={routerLinks['Admin']}>{intl.formatMessage(messages.schedulingCenter)}</Link>,
        key: routerLinks.Admin,
        icon: <AiOutlineSchedule size={20} />
      },
      {
        label: <Link to={routerLinks['SystemSetting']}>{intl.formatMessage(messages.systemSetting)}</Link>,
        key: routerLinks.SystemSetting,
        icon: <IoSettingsSharp size={20} />
      },
      {
        label: <Link to={routerLinks['Statistics']}>{intl.formatMessage(messages.statistics)}</Link>,
        key: routerLinks.Statistics,
        icon: <FaRegChartBar size={20} />
      },
    ];

    return (
      <Menu
        mode="inline"
        rootClassName="height-full"
        items={items}
        defaultSelectedKeys={[location.pathname]}
      />
    );
  }
}

export default SideBar;
