import React, { Component } from 'react';
import { Link } from 'dva/router';
import { FaChild, FaFileInvoice, FaFileInvoiceDollar, FaUserAlt, FaUserEdit, FaUserMd } from 'react-icons/fa';
import { BiLogOutCircle, BiBell } from 'react-icons/bi';
import { BsSearch } from 'react-icons/bs';
import { Badge, Avatar, Input, Dropdown, message, notification, Button } from 'antd';
import intl from "react-intl-universal";
import Cookies from 'js-cookie';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { MdOutlineSpaceDashboard } from 'react-icons/md';

import messages from './messages';
import msgSidebar from 'components/SideBar/messages';
import msgModal from 'components/Modal/messages';
import { ADMIN, APPOINTMENT, CONSULTANT, CONSULTATION, EVALUATION, PARENT, PROVIDER, SCHOOL, SCREEN, SUBSIDY, SUPERADMIN, routerLinks } from 'routes/constant';
import { initializeAuth, setCommunity, setCountOfUnreadNotifications, setMeetingLink } from 'src/redux/features/authSlice';
import { getSubsidyRequests, initializeAppointments } from 'src/redux/features/appointmentsSlice';
import { helper } from 'utils/auth/helper';
import request from 'utils/api/request';
import { getSettings } from 'utils/api/apiList';
import { socketUrl, socketUrlJSFile } from 'utils/api/baseUrl';
import { ModalReferralService } from 'components/Modal';
import './style/index.less';

class MainHeader extends Component {
  constructor(props) {
    super(props);
    this.socket = undefined;
    this.state = {
      intervalId: 0,
      visibleReferralService: false,
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
      } else {
        if (window.location.pathname.includes('/account') || window.location.pathname.includes('/administrator')) {
          message.warning({
            content: 'Your session has expired.',
            className: 'popup-session-expired',
            duration: 1,
          }).then(() => {
            this.logout();
            helper.history.push(routerLinks.Home);
          })
        }
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
      console.log("socket result: ", data.key);
      switch (data.key) {
        case "countOfUnreadNotifications": this.props.setCountOfUnreadNotifications(data.count); break;
        case "subsidy_change_status":
          this.props.setCountOfUnreadNotifications(this.props.countOfUnreadNotifications + 1);
          this.props.getSubsidyRequests({ role: user.role });
          this.showNotificationForSubsidyChange(data.data);
          break;
        case "invoice_updated":
          this.props.setCountOfUnreadNotifications(this.props.countOfUnreadNotifications + 1);
          break;
        case "missed_consultation":
          this.props.setCountOfUnreadNotifications(this.props.countOfUnreadNotifications + 1);
          this.showNotificationForMissedConsultation(data.data);
          break;
        case "noshow_created":
          this.props.setCountOfUnreadNotifications(this.props.countOfUnreadNotifications + 1);
          break;
        case "update_noshow":
          this.props.setCountOfUnreadNotifications(this.props.countOfUnreadNotifications + 1);
          break;
        case "balance_created":
          this.props.setCountOfUnreadNotifications(this.props.countOfUnreadNotifications + 1);
          break;
        case "flag_cleared":
          this.props.setCountOfUnreadNotifications(this.props.countOfUnreadNotifications + 1);
          break;
        case "new_appoint_from_client":
          this.showNotificationForAppointment(data.data);
          this.props.setCountOfUnreadNotifications(this.props.countOfUnreadNotifications + 1);
          break;
        case "new_subsidy_request_from_client":
          this.props.setCountOfUnreadNotifications(this.props.countOfUnreadNotifications + 1);
          this.showNotificationForSubsidy(data.data);
          break;
        case "appeal_subsidy":
          this.props.setCountOfUnreadNotifications(this.props.countOfUnreadNotifications + 1);
          this.props.getSubsidyRequests({ role: user.role });
          this.showNotificationForSubsidyChange(data.data);
          break;
        case "cancel_subsidy":
          this.props.setCountOfUnreadNotifications(this.props.countOfUnreadNotifications + 1);
          break;
        case "paid":
          this.props.setCountOfUnreadNotifications(this.props.countOfUnreadNotifications + 1);
          break;
        case "update_appointment":
          this.props.setCountOfUnreadNotifications(this.props.countOfUnreadNotifications + 1);
          this.showNotificationForAppointmentUpdate(data.data);
          break;
        case 'meeting_link': this.props.setMeetingLink(data.data); break;
        default: break;
      }
    })
  }

  showNotificationForAppointmentUpdate(data) {
    notification.close('update-appointment');
    notification.open({
      key: 'update-appointment',
      type: 'info',
      message: data.type.toUpperCase(),
      duration: 10,
      description: `1 ${data?.appointment?.type === SCREEN ? intl.formatMessage(msgModal.screening).toLocaleLowerCase() : data?.appointment?.type === EVALUATION ? intl.formatMessage(msgModal.evaluation).toLocaleLowerCase() : data?.appointment?.type === APPOINTMENT ? intl.formatMessage(msgModal.appointment).toLocaleLowerCase() : data?.appointment?.type === CONSULTATION ? intl.formatMessage(msgModal.consultation).toLocaleLowerCase() : data?.appointment?.type === SUBSIDY ? intl.formatMessage(msgModal.subsidizedSession).toLocaleLowerCase() : ''} has been ${data.type}.`,
      onClick: () => notification.destroy(),
    });
  }

  showNotificationForAppointment(data) {
    notification.close('new-appointment');
    notification.open({
      key: 'new-appointment',
      type: 'info',
      message: 'New Appointment',
      duration: 10,
      description: `1 ${data.type === SCREEN ? intl.formatMessage(msgModal.screening).toLocaleLowerCase() : data.type === EVALUATION ? intl.formatMessage(msgModal.evaluation).toLocaleLowerCase() : data.type === APPOINTMENT ? intl.formatMessage(msgModal.appointment).toLocaleLowerCase() : data.type === CONSULTATION ? intl.formatMessage(msgModal.consultation).toLocaleLowerCase() : data.type === SUBSIDY ? intl.formatMessage(msgModal.subsidizedSession).toLocaleLowerCase() : ''} has been created.`,
      onClick: () => notification.destroy(),
    });
  }

  showNotificationForMissedConsultation(data) {
    notification.close('missed-consultation');
    notification.open({
      key: 'missed-consultation',
      type: 'info',
      message: data.type.toUpperCase(),
      duration: 10,
      description: `${data?.appointment?.dependent?.firstName} ${data?.appointment?.dependent?.lastName}'s consultation ${data.type === 'noshow' ? 'has been closed as no-show' : 'has been canceled.'} Please reschedule again.`,
      onClick: () => notification.destroy(),
    });
  }

  showNotificationForSubsidy(data) {
    notification.close('new-subsidy');
    notification.open({
      key: 'new-subsidy',
      type: 'info',
      message: 'Subsidy Request',
      duration: 10,
      description: `${data.student?.firstName} ${data.student?.lastName}'s subsidy request has been created.`,
      onClick: () => notification.destroy(),
    });
  }

  showNotificationForSubsidyChange(data) {
    notification.close('update-subsidy');
    if (data?.status === 3) {
      notification.open({
        key: 'update-subsidy',
        type: 'info',
        message: 'Subsidy Request',
        duration: 10,
        description: (
          <div>
            <div>{data.message}</div>
            <div className='flex justify-end'>
              <Button type='primary' onClick={this.openModalReferral}>Schedule a consultation</Button>
            </div>
          </div>
        ),
        onClick: (e) => !e.target.className.includes('action') && notification.destroy(),
      });
    } else {
      notification.open({
        key: 'update-subsidy',
        type: 'info',
        message: 'Subsidy Request',
        duration: 10,
        description: data,
        onClick: () => notification.destroy(),
      });
    }
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
    this.props.initializeAuth();
    this.props.initializeAppointments();
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
      default:
        data.action = 'User Manage';
        data.description = `Viewed ${link}`;
        break;
    }
    this.socket.emit("action_tracking", data);
  }

  openModalReferral = () => {
    this.setState({ visibleReferralService: true });
    notification.destroy();
  }

  closeModalReferral = () => {
    this.setState({ visibleReferralService: false });
  }

  submitModalReferral = () => {
    this.closeModalReferral();
    message.success({
      content: 'Consultation Scheduled',
      className: 'popup-scheduled',
    });
  };

  render() {
    const { user, community, countOfUnreadNotifications } = this.props;
    const { visibleReferralService } = this.state;
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
    PARENT === user?.role && items.splice(5, 0, {
      key: '7',
      icon: <FaFileInvoice size={18} color='#495057' />,
      label: (
        <Link to={routerLinks.SubsidyRequests} onClick={() => this.handleClickLink(intl.formatMessage(msgSidebar.subsidyManager))}>
          {intl.formatMessage(msgSidebar.subsidyManager)}
        </Link>
      ),
    });
    [PARENT].includes(user?.role) && items.splice(6, 0, {
      key: '8',
      icon: <FaUserMd size={18} color='#495057' />,
      label: (
        <Link to={routerLinks.Providers} onClick={() => this.handleClickLink(intl.formatMessage(msgSidebar.providerList))}>
          {intl.formatMessage(msgSidebar.providerList)}
        </Link>
      ),
    });
    CONSULTANT === user?.role && items.splice(4, 0, {
      key: '6',
      icon: <FaFileInvoice size={18} color='#495057' />,
      label: (
        <Link to={routerLinks.ConsultationList} onClick={() => this.handleClickLink(intl.formatMessage(messages.consultationList))}>
          {intl.formatMessage(messages.consultationList)}
        </Link>
      ),
    });
    [CONSULTANT].includes(user?.role) && items.splice(5, 0, {
      key: '8',
      icon: <FaUserMd size={18} color='#495057' />,
      label: (
        <Link to={routerLinks.Providers} onClick={() => this.handleClickLink(intl.formatMessage(msgSidebar.providerList))}>
          {intl.formatMessage(msgSidebar.providerList)}
        </Link>
      ),
    });
    [SCHOOL].includes(user?.role) && items.splice(4, 0, {
      key: '8',
      icon: <FaUserMd size={18} color='#495057' />,
      label: (
        <Link to={routerLinks.Providers} onClick={() => this.handleClickLink(intl.formatMessage(msgSidebar.providerList))}>
          {intl.formatMessage(msgSidebar.providerList)}
        </Link>
      ),
    });

    const modalReferralServiceProps = {
      visible: visibleReferralService,
      onSubmit: this.submitModalReferral,
      onCancel: this.closeModalReferral,
    };

    return (
      <div className='component-mainheader'>
        <div className='div-account'>
          <div className='account-icon'>
            <Dropdown menu={{ items }} placement="bottomLeft" trigger="click">
              <Badge size="small" count={user.role < 900 ? countOfUnreadNotifications : 0}>
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
        {visibleReferralService && <ModalReferralService {...modalReferralServiceProps} />}
      </div>
    );
  }
}
const mapStateToProps = state => ({
  user: state.auth.user,
  countOfUnreadNotifications: state.auth.countOfUnreadNotifications,
  community: state.auth.currentCommunity,
});

export default compose(connect(mapStateToProps, { getSubsidyRequests, initializeAppointments, initializeAuth, setCommunity, setCountOfUnreadNotifications, setMeetingLink }))(MainHeader);
