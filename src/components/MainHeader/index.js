import React, { Component } from 'react';
import { Link } from 'dva/router';
import { FaChild, FaFileInvoiceDollar, FaUserAlt, FaUserEdit } from 'react-icons/fa';
import { BiLogOutCircle, BiBell } from 'react-icons/bi';
import { BsSearch } from 'react-icons/bs';
import { Badge, Avatar, Input, Dropdown } from 'antd';
import intl from "react-intl-universal";
import Cookies from 'js-cookie';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { MdOutlineSpaceDashboard } from 'react-icons/md';

import messages from './messages';
import msgSidebar from 'src/components/SideBar/messages';
import { ADMIN, CONSULTANT, PARENT, PROVIDER, SCHOOL, SUPERADMIN, routerLinks } from 'routes/constant';
import { logout, setCommunity, setCountOfUnreadNotifications } from 'src/redux/features/authSlice';
import { helper } from 'utils/auth/helper';
import request from 'utils/api/request';
import { getSettings } from 'utils/api/apiList';
import { socketUrl, socketUrlJSFile } from 'utils/api/baseUrl';
import './style/index.less';

class MainHeader extends Component {
  constructor(props) {
    super(props);
    this.socket = undefined;
    this.state = {
      intervalId: 0,
    };
  }

  componentDidMount() {
    const { user } = this.props;
    const token = Cookies.get('tk');

    if (token?.length > 0) {
      const script = document.createElement("script");
      script.src = socketUrlJSFile;
      script.async = true;
      script.onload = () => this.handleSocketEvents();
      document.body.appendChild(script);
    }

    if (user.role > 900) {
      request.post(getSettings).then(result => {
        const { success, data } = result;
        if (success) {
          this.props.setCommunity(data);
        }
      })
    }
    window.onblur = () => {
      if (window.location.pathname.includes('/account') || window.location.pathname.includes('/administrator')) {
        const countDown = setTimeout(() => {
          this.logout();
          helper.history.push(routerLinks.Home);
        }, 10 * 60 * 1000);
        this.setState({ intervalId: countDown });
      }
    }

    window.onfocus = () => {
      const token = Cookies.get('tk');
      if (token) {
        Cookies.set('tk', token, { expires: new Date(Date.now() + 10 * 60 * 1000) });
      }
      clearTimeout(this.state.intervalId);
    }
  }

  handleSocketEvents = () => {
    const { user } = this.props;
    let opts = {
      query: {
        token: Cookies.get('tk'),
      },
      withCredentials: true,
      autoConnect: true,
    };
    this.socket = io(socketUrl, opts);

    if (user.role < 900) {
      this.socket.on('connect', () => {
        this.socket.emit('unread_notifications', this.props.user?._id);
      });
    }

    this.socket.on('socket_result', data => {
      switch (data.key) {
        case "countOfUnreadNotifications": this.props.setCountOfUnreadNotifications(data.count); break;
        case "subsidy_change_status":
        case "invoice_updated":
        case "missed_consultation":
        case "noshow_created":
        case "update_noshow":
        case "balance_created":
        case "flag_cleared":
        case "new_appoint_from_client":
        case "new_subsidy_request_from_client":
        case "appeal_subsidy":
        case "cancel_subsidy":
        case "paid":
        case "update_appointment": this.props.setCountOfUnreadNotifications(this.props.countOfUnreadNotifications + 1); break;
        default: break;
      }
    })
  }

  logout = () => {
    const { user } = this.props;
    const data = {
      user: user?._id,
      action: 'Logout',
      description: 'User logged out',
    }
    this.socket.emit("action_tracking", data);
    Cookies.remove('tk');
    this.props.logout();
  }

  handleClickLink = (link) => {
    const { user } = this.props;
    let data = { user: user?._id };

    switch (link) {
      case intl.formatMessage(messages.dashboard):
        if ([PARENT, PROVIDER, CONSULTANT].includes(user?.role)) {
          data.action = 'User Manage';
          data.description = `Viewed ${intl.formatMessage(messages.dashboard)}`;
        } else if (user.role === SCHOOL) {
          data.action = 'User Manage';
          data.description = `Viewed pending subsidy requests`;
        } else if ([ADMIN, SUPERADMIN].includes(user?.role)) {
          data.action = 'Admin Manage';
          data.description = `Viewed ${intl.formatMessage(msgSidebar.schedulingCenter)}`;
        }
        break;
      case intl.formatMessage(messages.editProfile):
        data.action = 'Profile';
        data.description = 'Viewed Profile';
        break;
      case intl.formatMessage(messages.notification):
        data.action = 'User Manage';
        data.description = `Viewed ${intl.formatMessage(messages.notification)}`;
        break;
      case intl.formatMessage(messages.dependentList):
        data.action = 'User Manage';
        data.description = `Viewed ${intl.formatMessage(messages.dependentList)}`;
        break;
      case intl.formatMessage(messages.invoiceList):
        data.action = 'User Manage';
        data.description = `Viewed ${intl.formatMessage(messages.invoiceList)}`;
        break;
      default:
        break;
    }
    this.socket.emit("action_tracking", data);
  }

  render() {
    const { user, community, countOfUnreadNotifications } = this.props;
    const items = [
      {
        key: '1',
        icon: <MdOutlineSpaceDashboard size={18} color='#495057' />,
        label: (
          <Link to={user?.role > 900 ? routerLinks.Admin : routerLinks.Dashboard} onClick={() => this.handleClickLink(intl.formatMessage(messages.dashboard))}>
            {intl.formatMessage(messages.dashboard)}
          </Link>
        ),
      },
      {
        key: '2',
        icon: <FaUserEdit size={18} color='#495057' />,
        label: (
          <Link to={routerLinks.Changeprofile} onClick={() => this.handleClickLink(intl.formatMessage(messages.editProfile))}>
            {intl.formatMessage(messages.editProfile)}
          </Link>
        ),
      },
      {
        key: '5',
        icon: <BiLogOutCircle size={18} color='#495057' />,
        label: (
          <Link to={routerLinks.Home} onClick={() => this.logout()}>
            {intl.formatMessage(messages.logOut)}
          </Link>
        ),
      },
    ]
    user?.role < 900 && items.splice(2, 0, {
      key: '3',
      icon: <Badge size="small" count={countOfUnreadNotifications}><BiBell size={18} color='#495057' /></Badge>,
      label: (
        <Link to={routerLinks.Notification} onClick={() => this.handleClickLink(intl.formatMessage(messages.notification))}>
          {intl.formatMessage(messages.notification)}
        </Link>
      ),
    });
    user?.role < 900 && items.splice(3, 0, {
      key: '4',
      icon: <FaChild size={18} color='#495057' />,
      label: (
        <Link to={routerLinks.PrivateNote} onClick={() => this.handleClickLink(intl.formatMessage(messages.dependentList))}>
          {intl.formatMessage(messages.dependentList)}
        </Link>
      ),
    });
    [PARENT, PROVIDER].includes(user?.role) && items.splice(4, 0, {
      key: '6',
      icon: <FaFileInvoiceDollar size={18} color='#495057' />,
      label: (
        <Link to={routerLinks.InvoiceList} onClick={() => this.handleClickLink(intl.formatMessage(messages.invoiceList))}>
          {intl.formatMessage(messages.invoiceList)}
        </Link>
      ),
    });

    return (
      <div className='component-mainheader'>
        <div className='div-account'>
          <div className='account-icon'>
            <Dropdown menu={{ items }} placement="bottomLeft" trigger="click">
              <Badge size="small" count={countOfUnreadNotifications}>
                <Avatar icon={<FaUserAlt size={17} className='text-white' />} />
              </Badge>
            </Dropdown>
          </div>
          <div className='account-name'>
            <p className='mb-0'>{user?.fullName ?? user?.username}</p>
          </div>
          {user?.role > 900 ? <div className='font-16 ml-20'>{community?.community?.name}</div> : null}
        </div>
        <div className='div-search'>
          <BsSearch size={18} />
          <Input name='search' placeholder={`${intl.formatMessage(messages.search)}...`} />
        </div>
      </div>
    );
  }
}
const mapStateToProps = state => ({
  user: state.auth.user,
  countOfUnreadNotifications: state.auth.countOfUnreadNotifications,
  community: state.auth.currentCommunity,
});

export default compose(connect(mapStateToProps, { logout, setCommunity, setCountOfUnreadNotifications }))(MainHeader);
