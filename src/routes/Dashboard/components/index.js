import React from 'react';
import { Collapse, Badge, Avatar, Tabs, Button, Segmented, Row, Col, Checkbox, Select, message, notification } from 'antd';
import { FaUser, FaCalendarAlt, FaHandHoldingUsd } from 'react-icons/fa';
import { MdFormatAlignLeft, MdOutlineEventBusy, MdOutlineRequestQuote } from 'react-icons/md';
import { BsFilter, BsX, BsFillDashSquareFill, BsFillPlusSquareFill, BsClockHistory, BsFillFlagFill } from 'react-icons/bs';
import intl from 'react-intl-universal';
import FullCalendar from '@fullcalendar/react' // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import timeGridPlugin from '@fullcalendar/timegrid' // a plugin!
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import listPlugin from '@fullcalendar/list';
import "@fullcalendar/daygrid/main.css";
import "@fullcalendar/timegrid/main.css";
import Cookies from 'js-cookie';
import moment from 'moment';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { BiChevronLeft, BiChevronRight, BiExpand } from 'react-icons/bi';
import { GoPrimitiveDot } from 'react-icons/go';

import { ModalNewAppointmentForParents, ModalSubsidyProgress, ModalReferralService, ModalNewSubsidyRequest, ModalFlagExpand, ModalConfirm, ModalSessionsNeedToClose, ModalCreateNote } from '../../../components/Modal';
import DrawerDetail from '../../../components/DrawerDetail';
import messages from '../messages';
import messagesCreateAccount from '../../Sign/CreateAccount/messages';
import msgModal from '../../../components/Modal/messages';
import msgDrawer from '../../../components/DrawerDetail/messages';
import { socketUrl, socketUrlJSFile } from '../../../utils/api/baseUrl';
import request from '../../../utils/api/request'
import PanelAppointment from './PanelAppointment';
import PanelSubsidiaries from './PanelSubsidiaries';
import { setAcademicLevels, setConsultants, setDependents, setDurations, setLocations, setMeetingLink, setProviders, setSkillSet } from '../../../redux/features/authSlice';
import { changeTime, getAppointmentsData, getAppointmentsMonthData, getSubsidyRequests } from '../../../redux/features/appointmentsSlice'
import { checkNotificationForClient, checkNotificationForConsultant, checkNotificationForProvider, clearFlag, closeNotification, getDefaultDataForAdmin, payInvoice, requestClearance } from '../../../utils/api/apiList';
import Subsidiaries from './school';
import PageLoading from '../../../components/Loading/PageLoading';
import './index.less';

const { Panel } = Collapse;

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.socket = undefined;
    this.state = {
      isFilter: false,
      userDrawerVisible: false,
      visibleNewAppoint: false,
      visibleSubsidy: false,
      visiblReferralService: false,
      visibleNewSubsidy: false,
      isMonth: 1,
      isGridDayView: 'Grid',
      canDrop: true,
      calendarWeekends: true,
      calendarEvents: [],
      userRole: this.props.user?.role,
      listDependents: [],
      parentInfo: {},
      providerInfo: {},
      schoolInfo: {},
      consultantInfo: {},
      listAppointmentsRecent: [],
      listAppoinmentsFilter: [],
      SkillSet: [],
      selectedProviders: [],
      selectedLocations: [],
      selectedSkills: [],
      listProvider: [],
      locations: [],
      selectedEvent: {},
      selectedEventTypes: [],
      intervalId: 0,
      selectedDate: undefined,
      visibleFlagExpand: false,
      modalType: '',
      visibleConfirm: false,
      confirmMessage: '',
      visibleSessionsNeedToClose: false,
      selectedDependentId: 0,
      visibleCreateNote: false,
      subsidyId: '',
      loading: false,
    };
    this.calendarRef = React.createRef();
    this.scrollElement = React.createRef();
  }

  componentDidMount() {
    const { user } = this.props;
    this.setState({ loading: true });
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true' && params.get('id')) {
      const appointmentId = params.get('id');
      const type = params.get('type');
      request.post(payInvoice, { id: appointmentId, type }).then(res => {
        if (res.success) {
          message.success('Paid successfully');
          window.location.search = '';
        } else {
          message.warning('Something went wrong. Please try again');
        }
      }).catch(err => {
        console.log('pay flag error---', err);
        message.error(err.message);
      });
    }
    this.loadDefaultData();
    this.updateCalendarEvents(user.role);
    this.getMyAppointments(user.role);
    this.props.getSubsidyRequests({ role: user.role });
    const notifications = setInterval(() => {
      if (user.role === 3) {
        request.post(checkNotificationForClient).then(res => {
          const { success, data } = res;
          if (success) {
            data?.forEach(appointment => {
              let duration = appointment.provider?.duration ?? 30;
              if (appointment.type === 2) {
                duration = appointment.provider?.separateEvaluateDuration;
              }
              const key = `open${Date.now()}`;
              const btn = (
                <Button type="primary" size='middle' onClick={() => {
                  notification.close(key);
                  this.handleCloseNotification(appointment._id);
                }}>
                  Confirm
                </Button>
              );
              const description = (
                <div>
                  <p className='font-15 text-bold'>{appointment?.type === 2 ? intl.formatMessage(messages.evaluation) : appointment?.type === 3 ? intl.formatMessage(msgModal.standardSession) : appointment?.type === 4 ? intl.formatMessage(msgModal.consultation) : appointment?.type === 5 ? intl.formatMessage(msgModal.subsidizedSession) : ''}</p>
                  <p className='font-15'><span className='text-bold'>{intl.formatMessage(msgDrawer.what)}: </span>{appointment?.skillSet?.name ?? ''}</p>
                  <p className='font-15'><span className='text-bold'>{intl.formatMessage(msgDrawer.who)}: </span>{appointment?.dependent?.firstName ?? ''} {appointment?.dependent?.lastName ?? ''}</p>
                  <p className='font-15'><span className='text-bold'>{intl.formatMessage(msgDrawer.with)}: </span>{appointment?.type === 4 ? intl.formatMessage(msgModal.consultant) : `${appointment?.provider?.firstName ?? ''} ${appointment?.provider?.lastName ?? ''}`}</p>
                  <p className='font-15 nobr'><span className='text-bold'>{intl.formatMessage(msgDrawer.when)}: </span>{moment(appointment?.date).format('MM/DD/YYYY hh:mm a')} - {moment(appointment?.date).clone().add(duration, 'minutes').format('hh:mm a')}</p>
                  {appointment?.type === 4 ? appointment?.phoneNumber ? <p className='font-15'><span className='text-bold'>{intl.formatMessage(msgDrawer.phonenumber)}: </span>{appointment?.phoneNumber ?? ''}</p> : <p className='font-15'><span className='text-bold'>{intl.formatMessage(msgDrawer.meeting)}: </span>{appointment?.meetingLink ?? ''}</p> : <p className='font-15'><span className='text-bold'>{intl.formatMessage(msgDrawer.where)}: </span>{appointment?.location ?? ''}</p>}
                </div>
              )
              notification.open({
                message: "",
                description,
                btn,
                key,
                duration: 10,
                placement: 'top',
              });
            })
          }
        })
      }
      if (user.role === 30) {
        request.post(checkNotificationForProvider).then(res => {
          const { success, data } = res;
          if (success) {
            data?.forEach(appointment => {
              let duration = appointment.provider?.duration;
              if (appointment.type === 2) {
                duration = appointment.provider?.separateEvaluateDuration;
              }
              const key = `open${Date.now()}`;
              const btn = (
                <Button type="primary" size="middle" onClick={() => {
                  notification.close(key);
                  this.handleCloseNotification(appointment._id);
                }}>
                  Confirm
                </Button>
              );
              const description = (
                <div>
                  <p className='font-15 text-bold'>{appointment?.type === 2 ? intl.formatMessage(messages.evaluation) : appointment?.type === 3 ? intl.formatMessage(msgModal.standardSession) : appointment?.type === 5 ? intl.formatMessage(msgModal.subsidizedSession) : ''}</p>
                  <p className='font-15'><span className='text-bold'>{intl.formatMessage(msgDrawer.what)}: </span>{appointment?.skillSet?.name ?? ''}</p>
                  <p className='font-15'><span className='text-bold'>{intl.formatMessage(msgDrawer.who)}: </span>{appointment?.dependent?.firstName ?? ''} {appointment?.dependent?.lastName ?? ''}</p>
                  <p className='font-15 nobr'><span className='text-bold'>{intl.formatMessage(msgDrawer.when)}: </span>{moment(appointment?.date).format('MM/DD/YYYY hh:mm a')} - {moment(appointment?.date).clone().add(duration, 'minutes').format('hh:mm a')}</p>
                  <p className='font-15'><span className='text-bold'>{appointment?.type === 2 ? intl.formatMessage(msgDrawer.phonenumber) : intl.formatMessage(msgDrawer.where)}: </span>{appointment?.type === 2 ? appointment.phoneNumber ?? '' : appointment?.location ?? ''}</p>
                </div>
              )
              notification.open({
                message: '',
                description,
                btn,
                key,
                duration: 0,
                placement: 'top',
              });
            })
          }
        })
      }
      if (user.role === 100) {
        request.post(checkNotificationForConsultant).then(res => {
          const { success, data } = res;
          if (success) {
            data?.forEach(appointment => {
              let duration = 30;
              const key = `open${Date.now()}`;
              const btn = (
                <Button type="primary" size="middle" onClick={() => {
                  notification.close(key);
                  this.handleCloseNotification(appointment._id);
                }}>
                  Confirm
                </Button>
              );
              const description = (
                <div>
                  <p className='font-15 text-bold'>{intl.formatMessage(msgModal.consultation)}</p>
                  <p className='font-15'><span className='text-bold'>{intl.formatMessage(msgDrawer.what)}: </span>{appointment?.skillSet?.name ?? ''}</p>
                  <p className='font-15'><span className='text-bold'>{intl.formatMessage(msgDrawer.who)}: </span>{appointment?.dependent?.firstName ?? ''} {appointment?.dependent?.lastName ?? ''}</p>
                  <p className='font-15 nobr'><span className='text-bold'>{intl.formatMessage(msgDrawer.when)}: </span>{moment(appointment?.date).format('MM/DD/YYYY hh:mm a')} - {moment(appointment?.date).clone().add(duration, 'minutes').format('hh:mm a')}</p>
                  <p className='font-15'><span className='text-bold'>{appointment?.meetingLink ? intl.formatMessage(msgDrawer.meeting) : intl.formatMessage(msgDrawer.phonenumber)}: </span>{appointment?.meetingLink ? appointment?.meetingLink ?? '' : appointment?.phoneNumber ?? ''}</p>
                </div>
              )
              notification.open({
                message: '',
                description,
                btn,
                key,
                duration: 0,
                placement: 'top',
              });
            })
          }
        })
      }
    }, 60000);
    this.setState({ intervalId: notifications });

    const script = document.createElement("script");
    script.src = socketUrlJSFile;
    script.async = true;
    script.onload = () => this.scriptLoaded();
    document.body.appendChild(script);
  }

  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps.appointments) != JSON.stringify(this.props.appointments)) {
      this.setState({ listAppointmentsRecent: this.props.appointments });
    }
    if (JSON.stringify(prevProps.appointmentsInMonth) != JSON.stringify(this.props.appointmentsInMonth)) {
      this.setState({ calendarEvents: this.props.appointmentsInMonth });
    }
  }

  componentWillUnmount() {
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId);
    }
  }

  displayTime = (value) => {
    return `${value?.split(' ')[0]?.split(':')[0]}:${value?.split(' ')[0]?.split(':')[1]} ${value?.split(' ')[1]}`;
  }

  handleCloseNotification = (id) => {
    request.post(closeNotification, { appointmentId: id }).catch(err => {
      console.log('close notification error---', err);
    })
  }

  loadDefaultData() {
    request.post(getDefaultDataForAdmin).then(result => {
      this.setState({ loading: false });
      const { data, success } = result;
      if (success) {
        this.setState({
          listProvider: data?.providers ?? [],
          SkillSet: data?.skillSet ?? [],
          listDependents: data?.dependents ?? [],
          locations: data?.locations ?? [],
        });
        this.props.setDependents(data?.dependents ?? []);
        this.props.setProviders(data?.providers ?? []);
        this.props.setSkillSet(data?.skillSet ?? []);
        this.props.setLocations(data?.locations ?? []);
        this.props.setAcademicLevels(data?.academicLevels ?? []);
        this.props.setDurations(data?.durations ?? []);
        this.props.setConsultants(data?.consultants ?? []);
      }
    }).catch(err => {
      console.log('get default data error ---', err);
      this.setState({ loading: false });
    })
  }

  scrollTrans = (scrollOffset) => {
    this.scrollElement.current.scrollLeft += scrollOffset;
  }

  scriptLoaded = () => {
    let opts = {
      query: {
        token: Cookies.get('tk'),
      },
      withCredentials: true,
      autoConnect: true,
    };
    this.socket = io(socketUrl, opts);
    this.socket.on('connect_error', e => {
      console.log('connect error ', e);
    });

    this.socket.on('connect', () => {
      console.log('socket connect success');
      this.socket.emit('join_room', this.props.user?._id);
    });

    this.socket.on('socket_result', data => {
      console.log('socket result');
      this.handleSocketResult(data);
    })

    this.socket.on('disconnect', e => {
      console.log('socket disconnect', e);
    });
  }

  showNotificationForSubsidy(data) {
    notification.open({
      message: 'You have new Subsidy',
      duration: 10,
      description: 'A parent has sent 1 subsidy request, press for view.',
      onClick: () => {
        console.log('Notification Clicked!');
        this.onShowModalSubsidy(data.data._id);
        notification.destroy();
      },
    });
  }

  showNotificationForSubsidyChange(data) {
    notification.open({
      message: 'Subsidy Status changed',
      duration: 10,
      description: 'Press for check subsidy progress.',
      onClick: () => {
        console.log('Notification Clicked!');
        this.onShowModalSubsidy(data);
        notification.destroy();
      },
    });
  }

  showNotificationForAppointment(data) {
    notification.open({
      message: 'You have new Appointment',
      duration: 10,
      description: `A parent has sent 1 ${data.type == 1 ? intl.formatMessage(msgModal.screening).toLocaleLowerCase() : data.type == 1 ? intl.formatMessage(msgModal.evaluation).toLocaleLowerCase() : data.type == 3 ? intl.formatMessage(msgModal.appointment).toLocaleLowerCase() : data.type == 4 ? intl.formatMessage(msgModal.consultation).toLocaleLowerCase() : data.type == 5 ? intl.formatMessage(msgModal.subsidizedSession).toLocaleLowerCase() : ''}, press for view.`,
      onClick: () => {
        this.setState({ userDrawerVisible: true, selectedEvent: this.state.listAppointmentsRecent?.find(a => a._id == data?._id) });
        notification.destroy();
      },
    });
  }

  showNotificationForAppointmentUpdate(data) {
    notification.open({
      message: data.type.toUpperCase(),
      duration: 10,
      description: `1 ${data?.appointment?.type == 1 ? intl.formatMessage(msgModal.screening).toLocaleLowerCase() : data?.appointment?.type == 1 ? intl.formatMessage(msgModal.evaluation).toLocaleLowerCase() : data?.appointment?.type == 3 ? intl.formatMessage(msgModal.appointment).toLocaleLowerCase() : data?.appointment?.type == 4 ? intl.formatMessage(msgModal.consultation).toLocaleLowerCase() : data?.appointment?.type == 5 ? intl.formatMessage(msgModal.subsidizedSession).toLocaleLowerCase() : ''} has been ${data.type}, press for view.`,
      onClick: () => {
        this.setState({ userDrawerVisible: true, selectedEvent: this.state.listAppointmentsRecent?.find(a => a._id == data?.appointment?._id) });
        notification.destroy();
      },
    });
  }

  handleSocketResult(data) {
    const { userRole } = this.state;
    switch (data.key) {
      case 'new_appoint_from_client':
        this.updateCalendarEvents(userRole);
        this.getMyAppointments(userRole);
        this.showNotificationForAppointment(data.data);
        return;
      case 'update_appointment':
        this.updateCalendarEvents(userRole);
        this.getMyAppointments(userRole);
        this.showNotificationForAppointmentUpdate(data.data);
        return;
      case 'new_subsidy_request_from_client':
        this.props.getSubsidyRequests({ role: userRole });
        this.panelSubsidiariesReload && typeof this.panelSubsidiariesReload == 'function' && this.panelSubsidiariesReload(true);
        this.showNotificationForSubsidy(data);
        return;
      case 'subsidy_change_status':
        this.props.getSubsidyRequests({ role: userRole });
        this.panelSubsidiariesReload && typeof this.panelSubsidiariesReload == 'function' && this.panelSubsidiariesReload(true);
        this.showNotificationForSubsidyChange(data.data);
        return;
      case 'meeting_link':
        this.props.setMeetingLink(data.data);
      case 'appeal_subsidy':
        this.props.getSubsidyRequests({ role: userRole });
        this.panelSubsidiariesReload && typeof this.panelSubsidiariesReload == 'function' && this.panelSubsidiariesReload(true);
        this.showNotificationForSubsidyChange(data.data);
        return;
    }
  }

  onShowFilter = () => {
    this.setState({ isFilter: !this.state.isFilter });
  }

  onShowDrawerDetail = (val) => {
    const { userRole, listAppointmentsRecent } = this.state;
    const id = val?.event?.toPlainObject() ? val.event?.toPlainObject()?.extendedProps?._id : val;
    const selectedEvent = listAppointmentsRecent?.find(a => a._id == id);
    this.setState({ selectedEvent: selectedEvent });
    [3, 30, 100].includes(userRole) && this.setState({ userDrawerVisible: true });
  };

  onCloseDrawerDetail = () => {
    this.setState({ userDrawerVisible: false });
  };

  onShowModalNewAppoint = () => {
    this.setState({ visibleNewAppoint: true });
  };

  onCloseModalNewAppoint = () => {
    this.setState({ visibleNewAppoint: false });
  };

  onSubmitModalNewAppoint = () => {
    this.setState({ visibleNewAppoint: false });
    message.success({
      content: intl.formatMessage(messages.appointmentScheduled),
      className: 'popup-scheduled',
    });
    this.updateCalendarEvents(this.state.userRole);
    this.getMyAppointments(this.state.userRole);
  };

  onShowModalSubsidy = (subsidyId) => {
    this.setState({ visibleSubsidy: true, subsidyId: subsidyId });
  };

  onCloseModalSubsidy = () => {
    this.setState({ visibleSubsidy: false, subsidyId: '' });
  };

  onShowModalReferral = (subsidy, callbackForReload) => {
    this.setState({ visiblReferralService: true });
    if (callbackForReload == undefined) {
      callbackForReload = this.panelAppoimentsReload;
    }
    !!this.loadDataModalReferral && this.loadDataModalReferral(subsidy, callbackForReload);
  };

  onCloseModalReferral = () => {
    this.setState({ visiblReferralService: false });
  };

  onSubmitModalReferral = () => {
    this.setState({ visiblReferralService: false });
    message.success({
      content: intl.formatMessage(messages.appointmentScheduled),
      className: 'popup-scheduled',
    });
    this.updateCalendarEvents(this.state.userRole);
    this.getMyAppointments(this.state.userRole);
  };

  onShowModalNewSubsidy = () => {
    this.setState({ visibleNewSubsidy: true });
  };

  onSubmitModalNewSubsidy = () => {
    this.setState({ visibleNewSubsidy: false });
    this.props.getSubsidyRequests({ role: this.state.userRole });
  };

  onCloseModalNewSubsidy = (isNeedReload) => {
    this.setState({ visibleNewSubsidy: false });
    !!this.panelSubsidiariesReload && this.panelSubsidiariesReload(isNeedReload);
  };

  handleMonthToWeek = () => {
    if (this.state.isMonth === 1) {
      this.setState({ isMonth: 0 });
    } else {
      this.setState({ isMonth: 1 });
    }
  }

  handleChangeDayView = () => {
    if (this.state.isGridDayView === 'Grid') {
      this.setState({ isGridDayView: 'List' });
    } else {
      this.setState({ isGridDayView: 'Grid' });
    }
  }

  handleDateSelect = (selectInfo) => {
    let calendarApi = selectInfo.view.calendar
    let title = prompt('Please enter a new title for your event')

    calendarApi.unselect() // clear date selection

    if (title) {
      calendarApi.addEvent({ // will render immediately. will call handleEventAdd
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay
      }, true) // temporary=true, will get overwritten when reducer gives new events
    }
  }

  handleEventAdd = (addInfo) => {
    this.props.createEvent(addInfo.event.toPlainObject())
      .catch(() => {
        reportNetworkError()
        addInfo.revert()
      })
  }

  handleEventChange = (changeInfo) => {
    const obj = changeInfo.event.toPlainObject();
    const data = {
      role: this.state.userRole,
      data: {
        appointId: obj.extendedProps._id,
        date: new Date(obj.start).getTime()
      }
    }
    this.props.changeTime(data)
  }

  handleEventRemove = (removeInfo) => {
    this.props.deleteEvent(removeInfo.event.id)
      .catch(() => {
        reportNetworkError()
        removeInfo.revert()
      })
  }

  handleClickDate = (date) => {
    this.setState({ visibleNewAppoint: true, selectedDate: moment(date.date) });
  }

  async getMyAppointments(userRole, dependentId) {
    const appointments = await this.props.getAppointmentsData({ role: userRole, dependentId: dependentId });
    this.setState({ listAppointmentsRecent: appointments?.payload ?? [] });
  }

  onCollapseChange = (v => {
    if (v.length > 0 && v[v.length - 1] == 6) {
      this.panelSubsidiariesReload && this.panelSubsidiariesReload();
    }
  })

  renderListAppoinmentsRecent = (appointment, index) => {
    const type = appointment?.type;
    const status = appointment?.status;
    const eventType = type == 1 ? 'Screening' : type == 2 ? 'Evaluation' : type == 4 ? 'Consultation' : 'Session';

    return (
      <div key={index} className={`text-white item-feed ${status != 0 ? 'line-through' : ''} bg-${status == 0 ? 'active' : eventType.toLowerCase()}`} onClick={() => this.onShowDrawerDetail(appointment?._id)}>
        <p className='font-700'>{appointment.dependent?.firstName ?? ''} {appointment.dependent?.lastName ?? ''} {status == -2 ? 'Cancelled' : ''}</p>
        {appointment.provider != undefined && <p>{`${appointment.provider?.firstName ?? ''} ${appointment.provider?.lastName ?? ''}`}</p>}
        {appointment.school != undefined && <p>{appointment.school?.name}</p>}
        <p>{appointment.skillSet?.name}</p>
        <p>{appointment.location}</p>
        <p>{moment(appointment.date).format('hh:mm a')}</p>
        <p className='font-700 text-right' style={{ marginTop: '-10px' }}>{moment(appointment.date).fromNow()}</p>
      </div>
    );
  }

  onOpenModalSessionsNeedToClose = () => {
    this.setState({ visibleSessionsNeedToClose: true });
  }

  renderPanelAppointmentForProvider = () => {
    if (this.state.userRole == 30 || this.state.userRole == 3)
      return (
        <Panel
          key="1"
          header={intl.formatMessage(messages.appointments)}
          extra={this.state.userRole > 3 && (<BsClockHistory size={18} className="cursor" onClick={() => this.onOpenModalSessionsNeedToClose()} />)}
          className='appointment-panel'
          collapsible='header'
        >
          <PanelAppointment
            setReload={reload => this.panelAppoimentsReload = reload}
            onShowDrawerDetail={this.onShowDrawerDetail}
            calendar={this.calendarRef}
          />
        </Panel>
      );
  }

  handleClickPrevMonth = () => {
    const calendar = this.calendarRef.current;
    calendar._calendarApi.prev();
    this.updateCalendarEvents(this.state.userRole, this.state.selectedDependentId);
  }

  handleClickNextMonth = () => {
    const calendar = this.calendarRef.current;
    calendar._calendarApi.next();
    this.updateCalendarEvents(this.state.userRole, this.state.selectedDependentId);
  }

  async updateCalendarEvents(role, dependentId) {
    const calendar = this.calendarRef.current;
    const month = calendar?._calendarApi.getDate().getMonth() + 1;
    const year = calendar?._calendarApi.getDate().getFullYear();
    const { selectedSkills, selectedProviders, SkillSet, selectedLocations, selectedEventTypes } = this.state;
    let skills = [];
    selectedSkills?.forEach(skill => skills.push(SkillSet.find(s => s.name == skill)?._id));
    const dataFetchAppointMonth = {
      role: role,
      data: {
        month: month,
        year: year,
        locations: selectedLocations,
        providers: selectedProviders,
        skills: skills,
        types: selectedEventTypes,
        dependentId: dependentId,
      }
    };
    const appointmentsInMonth = await this.props.getAppointmentsMonthData(dataFetchAppointMonth);
    this.setState({ calendarEvents: appointmentsInMonth?.payload ?? [] });
  }

  handleSelectProvider = (name) => {
    if (!this.state.selectedProviders.includes(name)) {
      this.setState({ selectedProviders: [...this.state.selectedProviders, name] });
    }
  }

  handleRemoveProvider = (index) => {
    this.state.selectedProviders.splice(index, 1);
    this.setState({ selectedProviders: this.state.selectedProviders });
  }

  handelChangeLocation = (location) => {
    this.setState({ location: location });
  }

  handleSelectLocation = (location) => {
    if (!this.state.selectedLocations.includes(location)) {
      this.setState({ selectedLocations: [...this.state.selectedLocations, location] });
    }
  }

  handleRemoveLocation = (index) => {
    this.state.selectedLocations.splice(index, 1);
    this.setState({ selectedLocations: this.state.selectedLocations });
  }

  handleSelectEventType = types => {
    this.setState({ selectedEventTypes: types });
  }

  handleSelectSkills = (skills) => {
    this.setState({ selectedSkills: skills });
  }

  handleApplyFilter = () => {
    this.updateCalendarEvents(this.state.userRole);
    this.setState({ isFilter: false });
  }

  onOpenModalFlagExpand = () => {
    this.setState({ visibleFlagExpand: true });
  }

  onCloseModalFlagExpand = () => {
    this.setState({ visibleFlagExpand: false });
  }

  handleRequestClearance = (requestMessage) => {
    this.onCloseModalCreateNote();
    message.success("Your request has been submitted. Please allow up to 24 hours for the provider to review this.");

    request.post(requestClearance, { appointmentId: this.state.selectedEvent?._id, message: requestMessage }).catch(err => {
      message.error(err.message);
    })
  }

  handleClearFlag = () => {
    this.onCloseModalConfirm();
    request.post(clearFlag, { _id: this.state.selectedEvent?._id }).then(result => {
      const { success } = result;
      if (success) {
        message.success('Cleared successfully');
        this.updateCalendarEvents(this.state.userRole);
        this.getMyAppointments(this.state.userRole);
      }
    })
  }

  onSubmitModalConfirm = () => {
    if (this.state.modalType == 'request-clearance') {
      this.handleRequestClearance();
    }
    if (this.state.modalType == 'clear-flag') {
      this.handleClearFlag();
    }
  }

  onCloseModalConfirm = () => {
    this.setState({ visibleConfirm: false });
  }

  onOpenModalConfirm = (type, appointment) => {
    this.setState({
      visibleConfirm: true,
      confirmMessage: type == 'request-clearance' ? 'Did you pay for this flag?' : 'Are you sure to clear this flag?',
      modalType: type,
      selectedEvent: appointment,
    });
  }

  onCloseModalSessionsNeedToClose = () => {
    this.setState({ visibleSessionsNeedToClose: false });
  }

  handleClickDependent = (id) => {
    this.setState({ selectedDependentId: id });
    this.updateCalendarEvents(this.state.userRole, id);
    this.getMyAppointments(this.state.userRole, id);
  }

  handleClickAllDependent = () => {
    this.setState({ selectedDependentId: 0 });
    this.updateCalendarEvents(this.state.userRole, 0);
    this.getMyAppointments(this.state.userRole, 0);
  }

  onOpenModalCreateNote = (appointment) => {
    this.setState({ visibleCreateNote: true, selectedEvent: appointment });
  }

  onCloseModalCreateNote = () => {
    this.setState({ visibleCreateNote: false, selectedEvent: {} });
  }

  render() {
    const {
      isFilter,
      userDrawerVisible,
      visiblReferralService,
      isMonth,
      isGridDayView,
      SkillSet,
      listProvider,
      selectedProviders,
      selectedLocations,
      listAppointmentsRecent,
      userRole,
      calendarEvents,
      calendarWeekends,
      listDependents,
      selectedEvent,
      selectedSkills,
      selectedEventTypes,
      visibleNewAppoint,
      selectedDate,
      visibleFlagExpand,
      visibleConfirm,
      confirmMessage,
      visibleSessionsNeedToClose,
      selectedDependentId,
      visibleCreateNote,
      visibleNewSubsidy,
      visibleSubsidy,
      subsidyId,
      loading,
      locations,
    } = this.state;

    const btnMonthToWeek = (
      <div role='button' className='btn-type' onClick={this.handleMonthToWeek}>
        {isMonth ? intl.formatMessage(messages.month) : intl.formatMessage(messages.week)}
      </div>
    );
    const btnChangeDayView = (
      <Segmented
        onChange={this.handleChangeDayView}
        options={[
          { value: 'Grid', icon: <FaCalendarAlt size={18} /> },
          { value: 'List', icon: <MdFormatAlignLeft size={20} /> },
        ]}
      />
    );

    const btnFilter = (
      <div className='header-left flex flex-row' onClick={this.onShowFilter}>
        {userRole != 100 && (
          <p className='font-15'>{intl.formatMessage(messages.filterOptions)} {isFilter ? <BsX size={30} /> : <BsFilter size={25} />}</p>
        )}
      </div>
    );

    const optionsEvent = [
      {
        label: intl.formatMessage(messages.appointments),
        value: 3,
      },
      {
        label: intl.formatMessage(messages.evaluations),
        value: 2,
      },
      {
        label: intl.formatMessage(messages.screenings),
        value: 1,
      },
      {
        label: intl.formatMessage(messages.referrals),
        value: 4,
      },
    ];

    const modalReferralServiceProps = {
      visible: visiblReferralService,
      onSubmit: this.onSubmitModalReferral,
      onCancel: this.onCloseModalReferral,
      setLoadData: reload => this.loadDataModalReferral = reload,
    };

    const modalNewAppointProps = {
      visible: visibleNewAppoint,
      onSubmit: this.onSubmitModalNewAppoint,
      onCancel: this.onCloseModalNewAppoint,
      listDependents: listDependents,
      SkillSet: SkillSet,
      selectedDate: selectedDate,
    };

    const drawerDetailProps = {
      visible: userDrawerVisible,
      onClose: this.onCloseDrawerDetail,
      event: listAppointmentsRecent?.find(a => a._id == selectedEvent?._id),
      listAppointmentsRecent: listAppointmentsRecent,
      calendar: this.calendarRef,
    };

    const modalFlagExpandProps = {
      visible: visibleFlagExpand,
      onSubmit: this.onCloseModalFlagExpand,
      onCancel: this.onCloseModalFlagExpand,
      flags: listAppointmentsRecent?.filter(appointment => appointment.flagStatus == 1 || appointment.flagStatus == 2),
      calendar: this.calendarRef,
    };

    const modalSessionsNeedToCloseProps = {
      visible: visibleSessionsNeedToClose,
      onSubmit: this.onCloseModalSessionsNeedToClose,
      onCancel: this.onCloseModalSessionsNeedToClose,
      calendar: this.calendarRef,
    };

    const modalConfirmProps = {
      visible: visibleConfirm,
      onSubmit: this.onSubmitModalConfirm,
      onCancel: this.onCloseModalConfirm,
      message: confirmMessage,
    };

    const modalCreateNoteProps = {
      visible: visibleCreateNote,
      onSubmit: this.handleRequestClearance,
      onCancel: this.onCloseModalCreateNote,
      title: "Request Message"
    };

    const modalNewSubsidyProps = {
      visible: visibleNewSubsidy,
      onSubmit: this.onSubmitModalNewSubsidy,
      onCancel: this.onCloseModalNewSubsidy,
    };

    const modalSubsidyProps = {
      visible: visibleSubsidy,
      subsidyId: subsidyId,
      onSubmit: this.onCloseModalSubsidy,
      onCancel: this.onCloseModalSubsidy,
    }

    if (userRole == 60) {
      return <Subsidiaries subsidyId={subsidyId} />
    } else {
      return (
        <div className="full-layout page dashboard-page">
          <div className='div-content'>
            <section className='div-activity-feed box-card overflow-y-scroll'>
              <div className='div-title-feed text-center'>
                <p className='font-16 text-white mb-0'>{intl.formatMessage(messages.activityFeed)}</p>
              </div>
              <div className='div-list-feed'>
                {listAppointmentsRecent && listAppointmentsRecent?.filter((appointment) => moment(appointment.date).isAfter(new Date().setHours(0, 0, 0)))?.map((appoinment, index) => this.renderListAppoinmentsRecent(appoinment, index))}
              </div>
            </section>
            <section className='div-calendar box-card'>
              <div className='flex justify-end items-center gap-5'>
                <div className='div-trans flex flex-row'>
                  <Avatar size={36} className='trans-all' onClick={() => this.handleClickAllDependent()}>All</Avatar>
                  <Button
                    type='text'
                    className='trans-left' icon={<BiChevronLeft size={35} />}
                    onClick={() => this.scrollTrans(-42)}
                  />
                  <div className='trans-scroll' ref={this.scrollElement}>
                    {listDependents?.map((dependent, index) => (
                      <Avatar
                        key={index}
                        size={36}
                        className={`trans-item ${selectedDependentId == dependent._id ? 'active' : ''}`}
                        onClick={() => this.handleClickDependent(dependent._id)}
                      >
                        {dependent?.firstName?.charAt(0)?.toUpperCase()}{dependent?.lastName?.charAt(0)?.toUpperCase()}
                      </Avatar>
                    ))}
                  </div>
                  <Button
                    type='text'
                    className='trans-right' icon={<BiChevronRight size={35} />}
                    onClick={() => this.scrollTrans(42)}
                  />
                </div>
                <div className='btn-appointment'>
                  <Button
                    type='primary'
                    block
                    icon={<FaCalendarAlt size={19} />}
                    disabled={userRole == 30 || userRole == 60}
                    onClick={() => (userRole == 3 || userRole == 100) && this.onShowModalNewAppoint()}
                  >
                    {intl.formatMessage(messages.makeAppointment)}
                  </Button>
                </div>
              </div>
              {isFilter && (
                <div className='calendar-filter w-100'>
                  <Row gutter={10}>
                    <Col xs={12} sm={12} md={4}>
                      <p className='font-16 font-700 mb-5'>{intl.formatMessage(messages.eventType)}</p>
                      <Checkbox.Group options={optionsEvent} value={selectedEventTypes} onChange={(v) => this.handleSelectEventType(v)} className="flex flex-col" />
                    </Col>
                    <Col xs={12} sm={12} md={8} className='skillset-checkbox'>
                      <p className='font-16 font-700 mb-5'>{intl.formatMessage(messagesCreateAccount.skillsets)}</p>
                      <Checkbox.Group options={SkillSet.map(skill => skill.name)} value={selectedSkills} onChange={v => this.handleSelectSkills(v)} />
                    </Col>
                    {userRole != 30 && (
                      <Col xs={12} sm={12} md={6} className='select-small'>
                        <p className='font-16 font-700 mb-5'>{intl.formatMessage(messagesCreateAccount.provider)}</p>
                        <Select
                          showSearch
                          placeholder={intl.formatMessage(messages.startTypingProvider)}
                          value=''
                          optionFilterProp='children'
                          filterOption={(input, option) => option.children.join('').toLowerCase().includes(input.toLowerCase())}
                          onChange={(v) => this.handleSelectProvider(v)}
                        >
                          {listProvider?.map((provider, i) => (
                            <Select.Option key={i} value={provider._id}>{provider.firstName ?? ''} {provider.lastName ?? ''}</Select.Option>
                          ))}
                        </Select>
                        <div className='div-chip'>
                          {selectedProviders?.map((id, i) => (
                            <div key={i} className='chip font-12'>
                              {listProvider?.find(a => a._id === id).firstName ?? ''} {listProvider?.find(a => a._id === id).lastName ?? ''}
                              <BsX size={16} onClick={() => this.handleRemoveProvider(i)} /></div>
                          ))}
                        </div>
                      </Col>
                    )}
                    <Col xs={12} sm={12} md={6} className='select-small'>
                      <p className='font-16 font-700 mb-5'>{intl.formatMessage(messagesCreateAccount.location)}</p>
                      <Select
                        showSearch
                        placeholder={intl.formatMessage(messages.startTypingLocation)}
                        value=''
                        optionFilterProp='children'
                        filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                        onChange={(v) => this.handleSelectLocation(v)}
                      >
                        {locations?.map((location, i) => (
                          <Select.Option key={i} value={location}>{location}</Select.Option>
                        ))}
                      </Select>
                      <div className='div-chip'>
                        {selectedLocations?.map((location, i) => (
                          <div key={i} className='chip font-12'>
                            {location}
                            <BsX size={16} onClick={() => this.handleRemoveLocation(i)} />
                          </div>
                        ))}
                      </div>
                    </Col>
                  </Row>
                  <div className='text-right'>
                    <Button size='small' type='primary' onClick={this.handleApplyFilter}>{intl.formatMessage(messages.apply).toUpperCase()}</Button>
                  </div>
                </div>
              )}
              <div className='calendar-content'>
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                  ref={this.calendarRef}
                  headerToolbar={{
                    left: "filterButton",
                    center: "prev,title,next",
                    right: "monthToWeekButton,segmentView"
                  }}
                  views={{
                    monthToWeekButton: {
                      type: (isGridDayView === 'Grid' && isMonth) ? 'dayGridMonth' : (isGridDayView === 'Grid' && !isMonth) ? 'timeGridWeek' : (isGridDayView !== 'Grid' && isMonth) ? 'listMonth' : 'listWeek',
                      buttonText: btnMonthToWeek,
                    },
                    segmentView: {
                      type: (isGridDayView === 'Grid' && isMonth) ? 'dayGridMonth' : (isGridDayView === 'Grid' && !isMonth) ? 'timeGridWeek' : (isGridDayView !== 'Grid' && isMonth) ? 'listMonth' : 'listWeek',
                      buttonText: btnChangeDayView,
                    },
                    week: { titleFormat: { month: 'numeric', day: 'numeric' } },
                  }}
                  customButtons={{
                    filterButton: { text: btnFilter },
                    prev: { click: () => this.handleClickPrevMonth() },
                    next: { click: () => this.handleClickNextMonth() },
                  }}
                  initialView='dayGridMonth'
                  eventColor='transparent'
                  eventDisplay='block'
                  editable={true}
                  selectable={true}
                  selectMirror={true}
                  dayMaxEvents={true}
                  weekends={calendarWeekends}
                  datesSet={this.handleDates}
                  events={calendarEvents}
                  eventContent={(info) => renderEventContent(info, listAppointmentsRecent)}
                  eventClick={this.onShowDrawerDetail}
                  eventChange={this.handleEventChange} // called for drag-n-drop/resize
                  eventRemove={this.handleEventRemove}
                  dateClick={userRole !== 30 && this.handleClickDate}
                  height="calc(100vh - 165px)"
                />
              </div>
            </section>
            {[3, 30].includes(userRole) && (
              <section className='div-multi-choice'>
                <Collapse
                  defaultActiveKey={['1']}
                  expandIcon={({ isActive }) => isActive ? <BsFillDashSquareFill size={18} /> : <BsFillPlusSquareFill size={18} />}
                  expandIconPosition={'end'}
                  onChange={this.onCollapseChange}
                >
                  {this.renderPanelAppointmentForProvider()}
                  {userRole == 3 && (
                    <Panel header={intl.formatMessage(messages.referrals)} key="2">
                      <Tabs defaultActiveKey="1" type="card" size='small'>
                        <Tabs.TabPane tab={intl.formatMessage(messages.upcoming)} key="1">
                          {listAppointmentsRecent?.filter(a => a.type === 4 && a.status === 0 && a.flagStatus != 1)?.map((appointment, index) =>
                            <div key={index} className={`list-item padding-item ${[-2, -3].includes(appointment.status) ? 'line-through' : ''}`} onClick={() => this.onShowDrawerDetail(appointment._id)}>
                              <Avatar size={24} icon={<FaUser size={12} />} />
                              <div className='div-service'>
                                <p className='font-11 mb-0'>{appointment.skillSet?.name}</p>
                                <p className='font-09 mb-0'>{appointment?.referrer?.name}</p>
                              </div>
                              <div className='text-center ml-auto mr-5'>
                                <p className='font-11 mb-0'>{appointment?.meetingLink ? intl.formatMessage(msgDrawer.meeting) : intl.formatMessage(messages.phoneCall)}</p>
                                <p className='font-11 mb-0'>{appointment.phoneNumber}</p>
                              </div>
                              <div className='ml-auto'>
                                <p className='font-12 mb-0'>{moment(appointment.date).format('hh:mm a')}</p>
                                <p className='font-12 font-700 mb-0'>{moment(appointment.date).format('MM/DD/YYYY')}</p>
                              </div>
                            </div>
                          )}
                        </Tabs.TabPane>
                        <Tabs.TabPane tab={intl.formatMessage(messages.past)} key="2">
                          {listAppointmentsRecent?.filter(a => a.type === 4 && a.status !== 0 && a.flagStatus !== 1)?.map((appointment, index) =>
                            <div key={index} className={`list-item padding-item ${[-2, -3].includes(appointment.status) ? 'line-through' : ''}`} onClick={() => this.onShowDrawerDetail(appointment._id)}>
                              <Avatar size={24} icon={<FaUser size={12} />} />
                              <div className='div-service'>
                                <p className='font-11 mb-0'>{appointment.skillSet?.name}</p>
                                <p className='font-09 mb-0'>{appointment?.referrer?.name}</p>
                              </div>
                              <div className='text-center ml-auto mr-5'>
                                <p className='font-11 mb-0'>{intl.formatMessage(messages.phoneCall)}</p>
                                <p className='font-11 mb-0'>{appointment.phoneNumber}</p>
                              </div>
                              <div className='ml-auto'>
                                <p className='font-12 mb-0'>{moment(appointment.date).format('hh:mm a')}</p>
                                <p className='font-12 font-700 mb-0'>{moment(appointment.date).format('MM/DD/YYYY')}</p>
                              </div>
                            </div>
                          )}
                        </Tabs.TabPane>
                      </Tabs>
                    </Panel>
                  )}
                  <Panel header={intl.formatMessage(messages.screenings)} key="3">
                    <Tabs defaultActiveKey="1" type="card" size='small'>
                      <Tabs.TabPane tab={intl.formatMessage(messages.upcoming)} key="1">
                        {listAppointmentsRecent?.filter(a => a.type === 1 && a.status === 0 && a.flagStatus !== 1)?.map((appointment, index) =>
                          <div key={index} className={`list-item padding-item ${[-2, -3].includes(appointment.status) ? 'line-through' : ''}`} onClick={() => this.onShowDrawerDetail(appointment._id)}>
                            <Avatar size={24} icon={<FaUser size={12} />} />
                            <div className='div-service flex-1'>
                              <p className='font-11 mb-0'>{appointment.skillSet?.name}</p>
                              <p className='font-09 mb-0'>{userRole === 30 ? `${appointment.dependent?.firstName ?? ''} ${appointment.dependent?.lastName ?? ''}` : `${appointment.provider?.firstName ?? ''} ${appointment.provider?.lastName ?? ''}`}</p>
                            </div>
                            <div className='text-center ml-auto mr-5 flex-1'>
                              <p className='font-11 mb-0'>{intl.formatMessage(messages.phoneCall)}</p>
                              <p className='font-11 mb-0'>{appointment.phoneNumber}</p>
                            </div>
                            <div className='ml-auto flex-1 text-center'>
                              <p className='font-12 mb-0'>{appointment.screeningTime ?? ''}</p>
                            </div>
                          </div>
                        )}
                      </Tabs.TabPane>
                      <Tabs.TabPane tab={intl.formatMessage(messages.past)} key="2">
                        {listAppointmentsRecent?.filter(a => a.type === 1 && a.status !== 0 && a.flagStatus !== 1)?.map((appointment, index) =>
                          <div key={index} className={`list-item padding-item ${[-2, -3].includes(appointment.status) ? 'line-through' : ''}`} onClick={() => this.onShowDrawerDetail(appointment._id)}>
                            <Avatar size={24} icon={<FaUser size={12} />} />
                            <div className='div-service flex-1'>
                              <p className='font-11 mb-0'>{appointment.skillSet?.name}</p>
                              <p className='font-09 mb-0'>{userRole === 30 ? `${appointment.dependent?.firstName ?? ''} ${appointment.dependent?.lastName ?? ''}` : `${appointment.provider?.firstName ?? ''} ${appointment.provider?.lastName ?? ''}`}</p>
                            </div>
                            <div className='text-center ml-auto mr-5 flex-1'>
                              <p className='font-11 mb-0'>{intl.formatMessage(messages.phoneCall)}</p>
                              <p className='font-11 mb-0'>{appointment.phoneNumber}</p>
                            </div>
                            <div className='ml-auto flex-1 text-center'>
                              <p className='font-12 mb-0'>{appointment.screeningTime ?? ''}</p>
                            </div>
                          </div>
                        )}
                      </Tabs.TabPane>
                    </Tabs>
                  </Panel>
                  <Panel header={intl.formatMessage(messages.evaluations)} key="4">
                    <Tabs defaultActiveKey="1" type="card" size='small'>
                      <Tabs.TabPane tab={intl.formatMessage(messages.upcoming)} key="1">
                        {listAppointmentsRecent?.filter(a => a.type === 2 && a.status === 0 && a.flagStatus !== 1)?.map((appointment, index) =>
                          <div key={index} className={`list-item padding-item ${[-2, -3].includes(appointment.status) ? 'line-through' : ''}`} onClick={() => this.onShowDrawerDetail(appointment._id)}>
                            <Avatar size={24} icon={<FaUser size={12} />} />
                            <div className='div-service'>
                              <p className='font-11 mb-0'>{appointment.skillSet?.name}</p>
                              <p className='font-09 mb-0'>{userRole === 30 ? `${appointment.dependent?.firstName ?? ''} ${appointment.dependent?.lastName ?? ''}` : `${appointment.provider?.firstName ?? ''} ${appointment.provider?.lastName ?? ''}`}</p>
                            </div>
                            <p className='font-11 mb-0 ml-auto mr-5'>{appointment.location}</p>
                            <div className='ml-auto'>
                              <p className='font-12 mb-0'>{moment(appointment.date).format("hh:mm a")}</p>
                              <p className='font-12 font-700 mb-0'>{moment(appointment.date).format('MM/DD/YYYY')}</p>
                            </div>
                          </div>
                        )}
                      </Tabs.TabPane>
                      <Tabs.TabPane tab={intl.formatMessage(messages.past)} key="2">
                        {listAppointmentsRecent?.filter(a => a.type === 2 && a.status !== 0 && a.flagStatus !== 1)?.map((appointment, index) =>
                          <div key={index} className={`list-item padding-item ${[-2, -3].includes(appointment.status) ? 'line-through' : ''}`} onClick={() => this.onShowDrawerDetail(appointment._id)}>
                            <Avatar size={24} icon={<FaUser size={12} />} />
                            <div className='div-service'>
                              <p className='font-11 mb-0'>{appointment.skillSet?.name}</p>
                              <p className='font-09 mb-0'>{userRole === 30 ? `${appointment.dependent?.firstName ?? ''} ${appointment.dependent?.lastName ?? ''}` : `${appointment.provider?.firstName ?? ''} ${appointment.provider?.lastName ?? ''}`}</p>
                            </div>
                            <p className='font-11 mb-0 ml-auto mr-5'>{appointment.location}</p>
                            <div className='ml-auto'>
                              <p className='font-12 mb-0'>{moment(appointment.date).format("hh:mm a")}</p>
                              <p className='font-12 font-700 mb-0'>{moment(appointment.date).format('MM/DD/YYYY')}</p>
                            </div>
                          </div>
                        )}
                      </Tabs.TabPane>
                    </Tabs>
                  </Panel>
                  <Panel
                    header={intl.formatMessage(messages.flags)}
                    key="5"
                    extra={
                      <div className='flex gap-2'>
                        <BiExpand size={18} className="cursor" onClick={() => this.onOpenModalFlagExpand()} />
                        <Badge size="small" count={listAppointmentsRecent?.filter(a => a.flagStatus === 1)?.length}>
                          <BsFillFlagFill size={18} />
                        </Badge>
                      </div>
                    }
                    collapsible='header'
                  >
                    <Tabs defaultActiveKey="1" type="card" size='small'>
                      <Tabs.TabPane tab={intl.formatMessage(messages.upcoming)} key="1">
                        {listAppointmentsRecent?.filter(a => a.flagStatus === 1)?.map((appointment, index) =>
                          <div key={index} className='list-item padding-item gap-2' onClick={(e) => !e.target.className.includes('font-12 flag-action') && this.onShowDrawerDetail(appointment._id)}>
                            <Avatar size={24} icon={<FaUser size={12} />} />
                            <div className='div-service'>
                              <p className='font-11 mb-0'>{appointment.skillSet?.name}</p>
                              <p className='font-09 mb-0'>{userRole === 30 ? `${appointment.dependent?.firstName ?? ''} ${appointment.dependent?.lastName ?? ''}` : `${appointment.provider?.firstName ?? ''} ${appointment.provider?.lastName ?? ''}`}</p>
                            </div>
                            {userRole === 3 ? (
                              <>
                                {(appointment?.flagItems?.isPaid || appointment?.flagItems?.rate == 0) ? (
                                  <a className='font-12 flag-action' onClick={() => this.onOpenModalCreateNote(appointment)}>{intl.formatMessage(msgDrawer.requestClearance)}</a>
                                ) : null}
                                {appointment?.flagItems?.isPaid ? 'Paid' : appointment?.flagItems?.rate == 0 ? null : (
                                  <form aria-live="polite" data-ux="Form" action="https://www.paypal.com/cgi-bin/webscr" method="post">
                                    <input type="hidden" name="edit_selector" data-aid="EDIT_PANEL_EDIT_PAYMENT_ICON" />
                                    <input type="hidden" name="business" value="office@helpmegethelp.org" />
                                    <input type="hidden" name="cmd" value="_donations" />
                                    <input type="hidden" name="item_name" value="Help Me Get Help" />
                                    <input type="hidden" name="item_number" />
                                    <input type="hidden" name="amount" value={appointment?.flagItems?.rate} data-aid="PAYMENT_HIDDEN_AMOUNT" />
                                    <input type="hidden" name="shipping" value="0.00" />
                                    <input type="hidden" name="currency_code" value="USD" data-aid="PAYMENT_HIDDEN_CURRENCY" />
                                    <input type="hidden" name="rm" value="0" />
                                    <input type="hidden" name="return" value={`${window.location.href}?success=true&type=flag&id=${appointment?._id}`} />
                                    <input type="hidden" name="cancel_return" value={window.location.href} />
                                    <input type="hidden" name="cbt" value="Return to Help Me Get Help" />
                                    <button className='font-12 flag-action pay-flag-button'>
                                      {intl.formatMessage(msgDrawer.payFlag)}
                                    </button>
                                  </form>
                                )}
                              </>
                            ) : (
                              <>
                                <div className='font-12'>{appointment?.type === 2 ? intl.formatMessage(messages.evaluation) : appointment?.type === 3 ? intl.formatMessage(msgModal.standardSession) : appointment?.type === 5 ? intl.formatMessage(msgModal.subsidizedSession) : ''}</div>
                                <a className='font-12 flag-action' onClick={() => this.onOpenModalConfirm('clear-flag', appointment)}>{intl.formatMessage(msgDrawer.clearFlag)}</a>
                              </>
                            )}
                          </div>
                        )}
                      </Tabs.TabPane>
                      <Tabs.TabPane tab={intl.formatMessage(messages.past)} key="2">
                        {listAppointmentsRecent?.filter(a => a.flagStatus === 2)?.map((appointment, index) =>
                          <div key={index} className='list-item padding-item gap-2' onClick={() => this.onShowDrawerDetail(appointment._id)}>
                            <Avatar size={24} icon={<FaUser size={12} />} />
                            <div className='div-service'>
                              <p className='font-11 mb-0'>{appointment.skillSet?.name}</p>
                              <p className='font-09 mb-0'>{userRole === 30 ? `${appointment.dependent?.firstName ?? ''} ${appointment.dependent?.lastName ?? ''}` : `${appointment.provider?.firstName ?? ''} ${appointment.provider?.lastName ?? ''}`}</p>
                            </div>
                            <div className='font-12'>{appointment?.type === 2 ? intl.formatMessage(messages.evaluation) : appointment?.type === 3 ? intl.formatMessage(msgModal.standardSession) : appointment?.type === 5 ? intl.formatMessage(msgModal.subsidizedSession) : ''}</div>
                            <div className='ml-auto'>
                              <div className='font-12'>{moment(appointment.date).format("hh:mm a")}</div>
                              <div className='font-12 font-700'>{moment(appointment.date).format('MM/DD/YYYY')}</div>
                            </div>
                          </div>
                        )}
                      </Tabs.TabPane>
                    </Tabs>
                  </Panel>
                  {(userRole === 3 || userRole === 60) ? (
                    <Panel
                      key="6"
                      header={intl.formatMessage(messages.subsidiaries)}
                      extra={(
                        <div className='flex flex-row justify-between'>
                          {userRole === 3 && (
                            <Button type='primary' size='small' onClick={this.onShowModalNewSubsidy}>
                              {intl.formatMessage(messages.requestNewSubsidy).toUpperCase()}
                            </Button>
                          )}
                        </div>
                      )}
                      className='subsidiaries-panel'
                      collapsible='header'
                    >
                      <PanelSubsidiaries onShowModalSubsidyDetail={this.onShowModalSubsidy} />
                    </Panel>
                  ) : null}
                </Collapse>
              </section>
            )}
          </div>
          <img src='../images/call.png' className='btn-call' width="6%" onClick={this.onShowModalReferral} />
          {userDrawerVisible && <DrawerDetail {...drawerDetailProps} />}
          {visibleNewAppoint && <ModalNewAppointmentForParents {...modalNewAppointProps} />}
          {visibleFlagExpand && <ModalFlagExpand {...modalFlagExpandProps} />}
          {visibleSubsidy && <ModalSubsidyProgress {...modalSubsidyProps} />}
          {visibleNewSubsidy && <ModalNewSubsidyRequest {...modalNewSubsidyProps} />}
          {visiblReferralService && <ModalReferralService {...modalReferralServiceProps} />}
          {visibleConfirm && <ModalConfirm {...modalConfirmProps} />}
          {visibleSessionsNeedToClose && <ModalSessionsNeedToClose {...modalSessionsNeedToCloseProps} />}
          {visibleCreateNote && <ModalCreateNote {...modalCreateNoteProps} />}
          <PageLoading loading={loading} isBackground={true} />
        </div>
      );
    }
  }
}

function reportNetworkError() {
  alert('This action could not be completed')
}

function renderEventContent(eventInfo, appointments) {
  const event = eventInfo.event.extendedProps;
  const type = event?.type;
  const status = event?.status;
  const eventType = type === 1 ? 'Screening' : type === 2 ? 'Evaluation' : type === 4 ? 'Consultation' : 'Session';

  return (
    <div className={`flex flex-col p-3 relative rounded-2 relative text-white bg-${(status === -2 || status === -3) ? 'cancelled' : eventType.toLowerCase()}`}>
      <div className="flex flex-col">
        <div className={`text-bold flex items-center ${(status === -2 || status === -3) && 'text-cancelled'}`}>{(status === -2 || status === -3) && <GoPrimitiveDot className={`text-${eventType.toLowerCase()}`} size={16} />}<div className='text-ellipsis'>{event?.skillSet?.name}</div></div>
        <div className='text-ellipsis'>{moment(eventInfo.event.start).format('hh:mm a')}</div>
        <div className='text-ellipsis'>Dependent: {`${event?.dependent?.firstName ?? ''} ${event?.dependent?.lastName ?? ''}`}</div>
        <div className='text-ellipsis'>{eventType} with {eventInfo.event.title}</div>
      </div>
      {event?.type === 5 && <FaHandHoldingUsd size={20} className='text-green500 mr-5' />}
      {event?.flagStatus === 1 && event?.flagItems?.flagType === 1 && <MdOutlineRequestQuote color="#ff0000" size={20} className="flag-icons" />}
      {event?.status === 0 && event?.flagStatus === 0 && appointments?.find(a => a.dependent?._id === event?.dependent?._id && a.provider?._id === event?.provider?._id && a.flagStatus === 1)?.flagItems?.flagType === 1 && <MdOutlineRequestQuote color="#ff0000" size={20} className="flag-icons" />}
      {event?.flagStatus === 1 && event?.flagItems?.flagType === 2 && <MdOutlineEventBusy color="#ff0000" size={20} className="flag-icons" />}
      {event?.status === 0 && event?.flagStatus === 0 && appointments?.find(a => a.dependent?._id === event?.dependent?._id && a.provider?._id === event?.provider?._id && a.flagStatus === 1)?.flagItems?.flagType === 2 && <MdOutlineEventBusy color="#ff0000" size={20} className="flag-icons" />}
    </div>
  )
}

const mapStateToProps = state => ({
  appointments: state.appointments.dataAppointments,
  appointmentsInMonth: state.appointments.dataAppointmentsMonth,
  user: state.auth.user,
})

export default compose(connect(mapStateToProps, { setAcademicLevels, setConsultants, setDependents, setDurations, setLocations, setMeetingLink, setProviders, setSkillSet, changeTime, getAppointmentsData, getAppointmentsMonthData, getSubsidyRequests }))(Dashboard);
