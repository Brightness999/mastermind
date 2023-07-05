import React, { Component } from 'react'
import { Menu } from 'antd';
import { FaUsers, FaFileInvoice, FaRegChartBar, FaFlag, FaSchool, FaChild, FaFileInvoiceDollar } from 'react-icons/fa';
import { AiOutlineSchedule } from 'react-icons/ai';
import { IoSettingsSharp } from 'react-icons/io5';
import { Link } from 'dva/router';
import intl from "react-intl-universal";
import { MdContactPhone } from 'react-icons/md';
import Cookies from 'js-cookie';
import { connect } from 'react-redux';
import { compose } from 'redux';

import messages from './messages';
import msgMainHeader from 'components/MainHeader/messages';
import { routerLinks } from 'routes/constant';
import { socketUrl, socketUrlJSFile } from 'utils/api/baseUrl';
import './style/index.less';

class SideBar extends Component {
  constructor(props) {
    super(props);
    this.socket = undefined;
  }

  componentDidMount() {
    const token = Cookies.get('tk');
    if (token?.length > 0) {
      const script = document.createElement("script");
      script.src = socketUrlJSFile;
      script.async = true;
      script.onload = () => this.handleSocketEvents();
      document.body.appendChild(script);
    }
  }

  handleSocketEvents = () => {
    let opts = {
      query: {
        token: Cookies.get('tk'),
      },
      withCredentials: true,
      autoConnect: true,
    };
    this.socket = io(socketUrl, opts);
  }

  handleClickLink = (link) => {
    const { user } = this.props.auth;
    let data = {
      user: user?._id,
      action: 'Admin Manage',
    }
    switch (link) {
      case intl.formatMessage(messages.userManager):
        data['description'] = `Viewed ${intl.formatMessage(messages.userManager)}`; break;
      case intl.formatMessage(messages.schoolsList):
        data['description'] = `Viewed ${intl.formatMessage(messages.schoolsList)}`; break;
      case intl.formatMessage(messages.flagList):
        data['description'] = `Viewed ${intl.formatMessage(messages.flagList)}`; break;
      case intl.formatMessage(messages.consultationRequests):
        data['description'] = `Viewed ${intl.formatMessage(messages.consultationRequests)}`; break;
      case intl.formatMessage(messages.subsidyManager):
        data['description'] = `Viewed ${intl.formatMessage(messages.subsidyManager)}`; break;
      case intl.formatMessage(messages.schedulingCenter):
        data['description'] = `Viewed ${intl.formatMessage(messages.schedulingCenter)}`; break;
      case intl.formatMessage(msgMainHeader.dependentList):
        data['description'] = `Viewed ${intl.formatMessage(msgMainHeader.dependentList)}`; break;
      case intl.formatMessage(msgMainHeader.invoiceList):
        data['description'] = `Viewed ${intl.formatMessage(msgMainHeader.invoiceList)}`; break;
      case intl.formatMessage(messages.systemSetting):
        data['description'] = `Viewed ${intl.formatMessage(messages.systemSetting)}`; break;
      case intl.formatMessage(messages.actionTracker):
        data['description'] = `Viewed ${intl.formatMessage(messages.actionTracker)}`; break;
      default:
        break;
    }
    this.socket.emit('action_tracking', data);
  }

  render() {
    const items = [
      {
        label: <Link to={routerLinks.UserManager} onClick={() => this.handleClickLink(intl.formatMessage(messages.userManager))}>{intl.formatMessage(messages.userManager)}</Link>,
        key: routerLinks.UserManager,
        icon: <FaUsers size={20} />
      },
      {
        label: <Link to={routerLinks.SchoolsList} onClick={() => this.handleClickLink(intl.formatMessage(messages.schoolsList))}>{intl.formatMessage(messages.schoolsList)}</Link>,
        key: routerLinks.SchoolsList,
        icon: <FaSchool size={20} />
      },
      {
        label: <Link to={routerLinks.FlagList} onClick={() => this.handleClickLink(intl.formatMessage(messages.flagList))}>{intl.formatMessage(messages.flagList)}</Link>,
        key: routerLinks.FlagList,
        icon: <FaFlag size={20} />
      },
      {
        label: <Link to={routerLinks.ConsultationRequests} onClick={() => this.handleClickLink(intl.formatMessage(messages.consultationRequests))}>{intl.formatMessage(messages.consultationRequests)}</Link>,
        key: routerLinks.ConsultationRequests,
        icon: <MdContactPhone size={20} />
      },
      {
        label: <Link to={routerLinks.SubsidyManager} onClick={() => this.handleClickLink(intl.formatMessage(messages.subsidyManager))}>{intl.formatMessage(messages.subsidyManager)}</Link>,
        key: routerLinks.SubsidyManager,
        icon: <FaFileInvoice size={20} />
      },
      {
        label: <Link to={routerLinks.Admin} onClick={() => this.handleClickLink(intl.formatMessage(messages.schedulingCenter))}>{intl.formatMessage(messages.schedulingCenter)}</Link>,
        key: routerLinks.Admin,
        icon: <AiOutlineSchedule size={20} />
      },
      {
        label: <Link to={routerLinks.Private} onClick={() => this.handleClickLink(intl.formatMessage(msgMainHeader.dependentList))}>{intl.formatMessage(msgMainHeader.dependentList)}</Link>,
        key: routerLinks.Private,
        icon: <FaChild size={20} />
      },
      {
        label: <Link to={routerLinks.Invoices} onClick={() => this.handleClickLink(intl.formatMessage(msgMainHeader.invoiceList))}>{intl.formatMessage(msgMainHeader.invoiceList)}</Link>,
        key: routerLinks.Invoices,
        icon: <FaFileInvoiceDollar size={20} />
      },
      {
        label: <Link to={routerLinks.SystemSetting} onClick={() => this.handleClickLink(intl.formatMessage(messages.systemSetting))}>{intl.formatMessage(messages.systemSetting)}</Link>,
        key: routerLinks.SystemSetting,
        icon: <IoSettingsSharp size={20} />
      },
      {
        label: <Link to={routerLinks.Statistics} onClick={() => this.handleClickLink(intl.formatMessage(messages.actionTracker))}>{intl.formatMessage(messages.actionTracker)}</Link>,
        key: routerLinks.Statistics,
        icon: <FaRegChartBar size={20} />
      },
    ];

    return (
      <Menu
        mode="inline"
        items={items}
        defaultSelectedKeys={[location.pathname]}
        className="overflow-x-hidden min-h-100"
      />
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
})

export default compose(connect(mapStateToProps))(SideBar);
