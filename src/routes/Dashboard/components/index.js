import React from 'react';
import { Collapse, Badge, Avatar, Tabs, Button, Segmented, Row, Col, Checkbox, Select, message, notification, Input, Popconfirm } from 'antd';
import { FaUser, FaCalendarAlt, FaCalendarTimes } from 'react-icons/fa';
import { MdFormatAlignLeft } from 'react-icons/md';
import { BsFilter, BsX, BsFillDashSquareFill, BsFillPlusSquareFill, BsClockHistory, BsFillFlagFill } from 'react-icons/bs';
import { ModalNewGroup, ModalNewAppointmentForParents, ModalSubsidyProgress, ModalReferralService, ModalNewSubsidyRequest, ModalNewSubsidyReview, ModalFlagExpand, ModalConfirm, ModalSessionsNeedToClose, ModalPayment } from '../../../components/Modal';
import CSSAnimate from '../../../components/CSSAnimate';
import DrawerDetail from '../../../components/DrawerDetail';
import intl from 'react-intl-universal';
import FullCalendar from '@fullcalendar/react' // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import timeGridPlugin from '@fullcalendar/timegrid' // a plugin!
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import listPlugin from '@fullcalendar/list';
import "@fullcalendar/daygrid/main.css";
import "@fullcalendar/timegrid/main.css";
import messages from '../messages';
import messagesCreateAccount from '../../Sign/CreateAccount/messages';
import msgModal from '../../../components/Modal/messages';
import msgDrawer from '../../../components/DrawerDetail/messages';
import { checkPermission } from '../../../utils/auth/checkPermission';
import './index.less';
const { Panel } = Collapse;
import { socketUrl, socketUrlJSFile } from '../../../utils/api/baseUrl';
import request from '../../../utils/api/request'
import moment from 'moment';
import { changeTime, getAppointmentsData, getAppointmentsMonthData } from '../../../redux/features/appointmentsSlice'
import { store } from '../../../redux/store';
import { routerLinks } from "../../constant";
import PanelAppointment from './PanelAppointment';
import PanelSubsidaries from './PanelSubsidaries';
import PlacesAutocomplete from 'react-places-autocomplete';
import { setDependents, setLocations, setProviders, setSkillSet, setUser } from '../../../redux/features/authSlice';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { checkNotificationForClient, checkNotificationForProvider, clearFlag, closeNotificationForClient, getDefaultDataForAdmin, payFlag, requestClearance } from '../../../utils/api/apiList';
import { BiExpand } from 'react-icons/bi';
import { GiPayMoney } from 'react-icons/gi';

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
      visibleNewReview: false,
      visibleNewGroup: false,
      isMonth: 1,
      isGridDayView: 'Grid',
      canDrop: true,
      calendarWeekends: true,
      calendarEvents: this.props.appointmentsInMonth,
      userRole: this.props.user?.role,
      listDependents: [],
      parentInfo: {},
      providerInfo: {},
      schoolInfo: {},
      consultantInfo: {},
      listAppointmentsRecent: this.props.appointments,
      listAppoinmentsFilter: [],
      SkillSet: [],
      selectedProviders: [],
      selectedLocations: [],
      selectedSkills: [],
      listProvider: [],
      location: '',
      selectedEvent: {},
      selectedEventTypes: [],
      intervalId: 0,
      selectedDate: undefined,
      visibleFlagExpand: false,
      modalType: '',
      visibleConfirm: false,
      confirmMessage: '',
      visibleSessionsNeedToClose: false,
      visiblePayment: false,
    };
    this.calendarRef = React.createRef();
  }

  componentDidMount() {
    if (!!localStorage.getItem('token') && localStorage.getItem('token').length > 0) {
      checkPermission().then(loginData => {
        store.dispatch(setUser(loginData));
        loginData?.role == 999 && this.props.history.push(routerLinks.Admin)
        switch (loginData.role) {
          case 3:
            this.setState({ parentInfo: loginData.parentInfo });
            this.loadDefaultData();
            break;
          case 30:
            this.setState({ providerInfo: loginData.providerInfo })
            this.loadDefaultData();
            break;
          case 60:
            this.setState({ schoolInfo: loginData.schoolInfo })
            this.loadDefaultData();
            break;
          case 100:
            this.setState({ consultantInfo: loginData.consultantInfo });
            this.loadDefaultData();
            break;
        }
        this.updateCalendarEvents(loginData.role);
        this.getMyAppointments(loginData.role);
        const notifications = setInterval(() => {
          if (loginData.role == 3) {
            request.post(checkNotificationForClient).then(res => {
              if (res.success) {
                res.data?.forEach(appointment => {
                  let duration = appointment.provider?.duration;
                  if (appointment.type == 2) {
                    duration = duration * 1 + appointment.provider?.separateEvaluateDuration * 1;
                  }
                  const key = `open${Date.now()}`;
                  const btn = (
                    <Button type="primary" size="small" onClick={() => {
                      notification.close(key);
                      this.handleCloseNotification(appointment._id);
                    }}>
                      Confirm
                    </Button>
                  );
                  const description = (
                    <div>
                      <p className='font-10'>{duration ?? ''} minutes {intl.formatMessage(msgModal.meetingWith)} <span className='font-11 font-700'>{`${appointment?.provider?.firstName ?? ''} ${appointment?.provider?.lastName ?? ''}`}</span></p>
                      <p className='font-10'>{intl.formatMessage(msgDrawer.who)}: {`${appointment?.dependent?.firstName ?? ''} ${appointment?.dependent?.lastName ?? ''}`}</p>
                      {appointment?.type == 1 ? <p className='font-10'>{intl.formatMessage(msgDrawer.phonenumber)}: {appointment?.phoneNumber ?? ''}</p> : <p className='font-10'>{intl.formatMessage(msgDrawer.where)}: {appointment?.location ?? ''}</p>}
                      <p className='font-10 nobr'>{intl.formatMessage(msgDrawer.when)}: <span className='font-11 font-700'>{this.displayTime(new Date(appointment?.date)?.toLocaleTimeString())}</span> on <span className='font-11 font-700'>{new Date(appointment?.date)?.toLocaleDateString()}</span></p>
                    </div>
                  )
                  notification.open({
                    message: 'Notification',
                    description,
                    btn,
                    key,
                    onClose: close(key),
                    duration: 10,
                    placement: 'top',
                  });
                })
              }
            })
          }
          if (loginData.role == 30) {
            request.post(checkNotificationForProvider).then(res => {
              if (res.success) {
                res.data?.forEach(appointment => {
                  let duration = appointment.provider?.duration;
                  if (appointment.type == 2) {
                    duration = duration * 1 + appointment.provider?.separateEvaluateDuration * 1;
                  }
                  const key = `open${Date.now()}`;
                  const btn = (
                    <Button type="primary" size="small" onClick={() => {
                      notification.close(key);
                      this.handleCloseNotification(appointment._id);
                    }}>
                      Confirm
                    </Button>
                  );
                  const description = (
                    <div>
                      <p className='font-10'>{duration} minutes {intl.formatMessage(msgModal.meetingWith)} <span className='font-11 font-700'>{`${appointment?.provider?.firstName ?? ''} ${appointment?.provider?.lastName ?? ''}`}</span></p>
                      <p className='font-10'>{intl.formatMessage(msgDrawer.who)}: {`${appointment?.dependent?.firstName ?? ''} ${appointment?.dependent?.lastName ?? ''}`}</p>
                      {appointment?.type == 1 ? <p className='font-10'>{intl.formatMessage(msgDrawer.phonenumber)}: {appointment?.phoneNumber ?? ''}</p> : <p className='font-10'>{intl.formatMessage(msgDrawer.where)}: {appointment?.location ?? ''}</p>}
                      <p className='font-10 nobr'>{intl.formatMessage(msgDrawer.when)}: <span className='font-11 font-700'>{this.displayTime(new Date(appointment?.date)?.toLocaleTimeString())}</span> on <span className='font-11 font-700'>{new Date(appointment?.date)?.toLocaleDateString()}</span></p>
                    </div>
                  )
                  notification.open({
                    message: 'Notification',
                    description,
                    btn,
                    key,
                    onClose: close(key),
                    duration: 0,
                    placement: 'top',
                  });
                })
              }
            })
          }
        }, 60000);
        this.setState({ intervalId: notifications });
      }).catch(err => {
        console.log('check permission error ---', err);
        this.props.history.push('/');
      })
    }

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
    request.post(closeNotificationForClient, { appointmentId: id }).catch(err => {
      console.log('close notification error---', err);
    })
  }

  loadDefaultData() {
    request.post(getDefaultDataForAdmin).then(result => {
      const { data, success } = result;
      if (success) {
        this.setState({
          listProvider: data?.providers,
          SkillSet: data?.skillSet,
          listDependents: data?.dependents,
        });
        store.dispatch(setDependents(data?.dependents));
        store.dispatch(setProviders(data?.providers));
        store.dispatch(setSkillSet(data?.skillSet));
        store.dispatch(setLocations(data?.locations));
      } else {
        this.setState({
          listProvider: [],
          SkillSet: [],
          listDependents: [],
        });
      }
    }).catch(err => {
      console.log('get default data error ---', err);
      this.setState({
        listProvider: [],
        SkillSet: [],
        listDependents: [],
      });
    })
  }

  scriptLoaded = () => {
    let opts = {
      query: {
        token: localStorage.getItem('token'),
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
      this.getSubprofile();
    });

    this.socket.on('socket_result', data => {
      console.log('socket result', data);
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
      description:
        'A parent has sent 1 subsidy request, press for view.',
      onClick: () => {
        console.log('Notification Clicked!');
        this.onShowModalSubsidy(data.data._id);
      },
    });
  }

  showNotificationForSubsidyChange(data) {
    notification.open({
      message: 'Subsidy Status changed',
      duration: 10,
      description:
        'Press for check subsidy progress.',
      onClick: () => {
        console.log('Notification Clicked!');
        this.onShowModalSubsidy(data);
      },
    });
  }

  handleSocketResult(data) {
    switch (data.key) {
      case 'new_appoint_from_client':
        this.setState({ providerDrawervisible: true, });
        return;
      case 'new_subsidy_request_from_client':
        this.panelSubsidariesReload && typeof this.panelSubsidariesReload == 'function' && this.panelSubsidariesReload(true)
        return;
      case 'new_subsidy_request_from_client':
        this.panelSubsidariesReload && typeof this.panelSubsidariesReload == 'function' && this.panelSubsidariesReload(true)
        this.showNotificationForSubsidy(data);
        return;
      case 'subsidy_change_status':
        this.panelSubsidariesReload && typeof this.panelSubsidariesReload == 'function' && this.panelSubsidariesReload(true)
        this.showNotificationForSubsidyChange(data.data);
        return;
      case 'appeal_subsidy':
        return;
    }
  }

  getSubprofile = () => {
    switch (this.state.userRole) {
      case 3: // get parent info
        this.joinRoom(this.state.parentInfo._id);
        for (let i = 0; i < this.state.listDependents.length; i++) {
          this.joinRoom(this.state.listDependents[i]._id);
        }
        return;
      case 30: // get provider info
        this.joinRoom(this.state.providerInfo._id);
        return;
      case 60:// get school info
        this.joinRoom(this.state.schoolInfo._id);
        return;
    }
  }

  joinRoom = (roomId) => {
    this.socket.emit('join_room', roomId);
  }

  modalCreateAndEditSubsidyRequest = () => {
    const { visibleNewSubsidy } = this.state;
    const modalNewSubsidyProps = {
      visible: visibleNewSubsidy,
      onSubmit: this.onCloseModalNewSubsidy,
      onCancel: this.onCloseModalNewSubsidy,
    };
    return <ModalNewSubsidyRequest {...modalNewSubsidyProps} />
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
    this.setState({ visibleSubsidy: true });
    this.reloadModalSubsidyDetail(subsidyId);
  };

  onCancelSubsidy = () => { }

  onCloseModalSubsidy = () => {
    this.setState({ visibleSubsidy: false });
  };

  onSubmitModalSubsidy = () => {
    this.setState({ visibleSubsidy: false });
  };

  openHierachyModal = (subsidy, callbackAfterChanged) => {
    this.setState({ visibleNewGroup: true });
    !!this.loadDataModalNewGroup && this.loadDataModalNewGroup(subsidy, callbackAfterChanged);
  }

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
    this.setState({ visibleNewReview: true });
  };

  onCloseModalNewSubsidy = (isNeedReload) => {
    this.setState({ visibleNewSubsidy: false });
    !!this.panelSubsidariesReload && this.panelSubsidariesReload(isNeedReload);
  };

  onSubmitModalNewReview = () => {
    this.setState({ visibleNewReview: false });
  };

  onCloseModalNewReview = () => {
    this.setState({ visibleNewReview: false });
    this.setState({ visibleNewSubsidy: true });
  };

  onShowModalGroup = () => {
    this.setState({ visibleNewGroup: true });
  }

  onCloseModalGroup = () => {
    this.setState({ visibleNewGroup: false });
  }

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
      token: localStorage.getItem('token'),
      role: this.state.userRole,
      data: {
        appointId: obj.extendedProps._id,
        date: new Date(obj.start).getTime()
      }
    }
    store.dispatch(changeTime(data))
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

  getMyAppointments(userRole) {
    store.dispatch(getAppointmentsData({ role: userRole }));
  }

  onCollapseChange = (v => {
    if (v.length > 0 && v[v.length - 1] == 6) {
      this.panelSubsidariesReload && this.panelSubsidariesReload();
    }
  })

  renderModalSubsidyDetail = () => {
    const modalSubsidyProps = {
      visible: this.state.visibleSubsidy,
      onSubmit: this.onCloseModalSubsidy,
      onCancel: this.onCloseModalSubsidy,
    };
    return (
      <ModalSubsidyProgress {...modalSubsidyProps}
        setOpennedEvent={(reload) => { this.reloadModalSubsidyDetail = reload }}
        userRole={this.state.userRole}
        SkillSet={this.state.SkillSet}
        openReferral={this.onShowModalReferral}
        openHierachy={this.openHierachyModal}
      />
    );
  }

  renderListAppoinmentsRecent = (appointment, index) => {
    const type = appointment?.type;
    const status = appointment?.status;
    const eventType = type == 1 ? 'Screening' : type == 2 ? 'Evaluation' : type == 4 ? 'Consultation' : 'Session';

    return (
      <div key={index} className={`text-white item-feed ${status != 0 ? 'line-through' : ''} bg-${status == 0 ? 'active' : eventType.toLowerCase()}`}>
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
          extra={this.state.userRole > 3 && (<BsClockHistory size={18} onClick={() => this.onOpenModalSessionsNeedToClose()} />)}
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

  renderPanelSubsidaries = () => {
    if (this.state.userRole == 60 || this.state.userRole == 3)
      return (
        <Panel
          key="6"
          header={(
            <div className='flex flex-row justify-between'>
              <p className='mb-0'>{intl.formatMessage(messages.subsidaries)}</p>
              {this.state.userRole == 3 && (
                <Button type='primary' size='small' onClick={this.onShowModalNewSubsidy}>
                  {intl.formatMessage(messages.requestNewSubsidy).toUpperCase()}
                </Button>
              )}
            </div>
          )}
          className='subsidaries-panel'
        >
          <PanelSubsidaries
            setReload={reload => this.panelSubsidariesReload = reload}
            userRole={this.state.userRole}
            SkillSet={this.state.SkillSet}
            onShowModalSubsidyDetail={this.onShowModalSubsidy}
            onCancelSubsidy={this.onCancelSubsidy}
          />
        </Panel>
      )
  }

  handleClickPrevMonth = () => {
    const calendar = this.calendarRef.current;
    calendar._calendarApi.prev();
    this.updateCalendarEvents(this.state.userRole);
  }

  handleClickNextMonth = () => {
    const calendar = this.calendarRef.current;
    calendar._calendarApi.next();
    this.updateCalendarEvents(this.state.userRole);
  }

  updateCalendarEvents(role) {
    const calendar = this.calendarRef.current;
    const month = calendar?._calendarApi.getDate().getMonth() + 1;
    const year = calendar?._calendarApi.getDate().getFullYear();
    const { selectedSkills, selectedProviders, SkillSet, listProvider, selectedLocations, selectedEventTypes } = this.state;
    let skills = [], providers = [];
    selectedSkills?.forEach(skill => skills.push(SkillSet.find(s => s.name == skill)?._id));
    selectedProviders?.forEach(provider => providers.push(listProvider.find(p => p.name == provider)._id));
    const dataFetchAppointMonth = {
      role: role,
      data: {
        month: month,
        year: year,
        locations: selectedLocations,
        providers: providers,
        skills: skills,
        types: selectedEventTypes,
      }
    };
    store.dispatch(getAppointmentsMonthData(dataFetchAppointMonth));
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
    this.setState({ location: '' });
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

  handleRequestClearance = () => {
    this.onCloseModalConfirm();
    request.post(requestClearance, { appointmentId: this.state.selectedEvent?._id }).then(result => {
      const { success } = result;
      if (success) {
        message.success('Sent successfully');
      }
    })
  }

  handlePayFlag = (payment) => {
    request.post(payFlag, { ...payment, _id: this.state.selectedEvent?._id }).then(result => {
      const { success } = result;
      if (success) {
        message.success('Paid successfully');
        this.setState({ visiblePayment: false });
      }
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

  onOpenModalPayment = (appointment) => {
    this.setState({
      visiblePayment: true,
      selectedEvent: appointment,
    });
  }

  onCloseModalPayment = () => {
    this.setState({ visiblePayment: false });
  }

  render() {
    const {
      isFilter,
      userDrawerVisible,
      visiblReferralService,
      isMonth,
      isGridDayView,
      visibleNewReview,
      visibleNewGroup,
      SkillSet,
      listProvider,
      selectedProviders,
      selectedLocations,
      listAppointmentsRecent,
      userRole,
      location,
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
      visiblePayment,
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
        value: 6,
      },
    ];

    const modalReferralServiceProps = {
      visible: visiblReferralService,
      onSubmit: this.onSubmitModalReferral,
      onCancel: this.onCloseModalReferral,
      SkillSet: SkillSet,
      listDependents: listDependents,
      setLoadData: reload => this.loadDataModalReferral = reload,
      userRole: this.state.userRole,
    };

    const modalNewReviewProps = {
      visible: visibleNewReview,
      onSubmit: this.onSubmitModalNewReview,
      onCancel: this.onCloseModalNewReview,
    }

    const modalNewGroupProps = {
      visible: visibleNewGroup,
      onSubmit: this.onCloseModalGroup,
      onCancel: this.onCloseModalGroup,
      SkillSet: SkillSet,
      setLoadData: (reload) => this.loadDataModalNewGroup = reload,
    }

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
      event: selectedEvent,
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

    const modalPaymentProps = {
      visible: visiblePayment,
      onSubmit: this.handlePayFlag,
      onCancel: this.onCloseModalPayment,
    };

    return (
      <div className="full-layout page dashboard-page">
        <div className='div-content'>
          <section className='div-activity-feed box-card'>
            <div className='div-title-feed text-center'>
              <p className='font-16 text-white mb-0'>{intl.formatMessage(messages.activityFeed)}</p>
            </div>
            <div className='div-list-feed'>
              {listAppointmentsRecent?.filter((appointment) => moment(appointment.date).isAfter(new Date().setHours(0, 0, 0)))?.map((appoinment, index) => this.renderListAppoinmentsRecent(appoinment, index))}
            </div>
          </section>
          <section className='div-calendar box-card'>
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
            {isFilter && (
              <div className='calendar-filter w-100'>
                <CSSAnimate className="animated-shorter">
                  <Row gutter={10}>
                    <Col xs={12} sm={12} md={4}>
                      <p className='font-10 font-700 mb-5'>{intl.formatMessage(messages.eventType)}</p>
                      <Checkbox.Group options={optionsEvent} value={selectedEventTypes} onChange={(v) => this.handleSelectEventType(v)} className="flex flex-col" />
                    </Col>
                    <Col xs={12} sm={12} md={8} className='skillset-checkbox'>
                      <p className='font-10 font-700 mb-5'>{intl.formatMessage(messagesCreateAccount.skillsets)}</p>
                      <Checkbox.Group options={SkillSet.map(skill => skill.name)} value={selectedSkills} onChange={v => this.handleSelectSkills(v)} />
                    </Col>
                    {userRole != 30 && (
                      <Col xs={12} sm={12} md={6} className='select-small'>
                        <p className='font-10 font-700 mb-5'>{intl.formatMessage(messagesCreateAccount.provider)}</p>
                        <Select
                          showSearch
                          placeholder={intl.formatMessage(messages.startTypingProvider)}
                          value=''
                          optionFilterProp='children'
                          filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                          onChange={(v) => this.handleSelectProvider(v)}
                        >
                          {listProvider?.map((provider, i) => (
                            <Select.Option key={i} value={provider.name}>{provider.name}</Select.Option>
                          ))}
                        </Select>
                        <div className='div-chip'>
                          {selectedProviders?.map((name, i) => (
                            <div key={i} className='chip'>
                              {name}
                              <BsX size={16} onClick={() => this.handleRemoveProvider(i)} /></div>
                          ))}
                        </div>
                      </Col>
                    )}
                    <Col xs={12} sm={12} md={6} className='select-small'>
                      <p className='font-10 font-700 mb-5'>{intl.formatMessage(messagesCreateAccount.location)}</p>
                      <PlacesAutocomplete
                        value={location}
                        onChange={(value) => this.handelChangeLocation(value)}
                        onSelect={(value) => this.handleSelectLocation(value)}
                      >
                        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                          <div>
                            <Input {...getInputProps({
                              placeholder: 'Service Address',
                              className: 'location-search-input',
                            })} />
                            <div className="autocomplete-dropdown-container">
                              {loading && <div>Loading...</div>}
                              {suggestions.map(suggestion => {
                                const className = suggestion.active
                                  ? 'suggestion-item--active'
                                  : 'suggestion-item';
                                // inline style for demonstration purpose
                                const style = suggestion.active
                                  ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                                  : { backgroundColor: '#ffffff', cursor: 'pointer' };
                                return (
                                  <div {...getSuggestionItemProps(suggestion, { className, style })} key={suggestion.index}>
                                    <span>{suggestion.description}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </PlacesAutocomplete>
                      <div className='div-chip'>
                        {selectedLocations?.map((location, i) => (
                          <div key={i} className='chip'>
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
                </CSSAnimate>
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
                    type: isMonth ? 'dayGridMonth' : 'timeGridWeek',
                    buttonText: btnMonthToWeek,
                  },
                  segmentView: {
                    type: isGridDayView === 'Grid' ? 'dayGridMonth' : 'listWeek',
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
                dateClick={this.handleClickDate}
                height="calc(100vh - 190px)"
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
                        {listAppointmentsRecent?.filter(a => a.type == 4 && a.status == 0 && a.flagStatus != 1)?.map((appointment, index) =>
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
                      <Tabs.TabPane tab={intl.formatMessage(messages.past)} key="2">
                        {listAppointmentsRecent?.filter(a => a.type == 4 && a.status != 0 && a.flagStatus != 1)?.map((appointment, index) =>
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
                      {listAppointmentsRecent?.filter(a => a.type == 1 && a.status == 0 && a.flagStatus != 1)?.map((appointment, index) =>
                        <div key={index} className={`list-item padding-item ${[-2, -3].includes(appointment.status) ? 'line-through' : ''}`} onClick={() => this.onShowDrawerDetail(appointment._id)}>
                          <Avatar size={24} icon={<FaUser size={12} />} />
                          <div className='div-service flex-1'>
                            <p className='font-11 mb-0'>{appointment.skillSet?.name}</p>
                            <p className='font-09 mb-0'>{userRole == 30 ? `${appointment.dependent?.firstName ?? ''} ${appointment.dependent?.lastName ?? ''}` : `${appointment.provider?.firstName ?? ''} ${appointment.provider?.lastName ?? ''}`}</p>
                          </div>
                          <div className='text-center ml-auto mr-5 flex-1'>
                            <p className='font-11 mb-0'>{intl.formatMessage(messages.phoneCall)}</p>
                            <p className='font-11 mb-0'>{appointment.phoneNumber}</p>
                          </div>
                          <div className='ml-auto flex-1'>
                            <p className='font-12 mb-0'>{appointment.screeningTime ?? ''}</p>
                          </div>
                        </div>
                      )}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={intl.formatMessage(messages.past)} key="2">
                      {listAppointmentsRecent?.filter(a => a.type == 1 && a.status != 0 && a.flagStatus != 1)?.map((appointment, index) =>
                        <div key={index} className={`list-item padding-item ${[-2, -3].includes(appointment.status) ? 'line-through' : ''}`} onClick={() => this.onShowDrawerDetail(appointment._id)}>
                          <Avatar size={24} icon={<FaUser size={12} />} />
                          <div className='div-service flex-1'>
                            <p className='font-11 mb-0'>{appointment.skillSet?.name}</p>
                            <p className='font-09 mb-0'>{userRole == 30 ? `${appointment.dependent?.firstName ?? ''} ${appointment.dependent?.lastName ?? ''}` : `${appointment.provider?.firstName ?? ''} ${appointment.provider?.lastName ?? ''}`}</p>
                          </div>
                          <div className='text-center ml-auto mr-5 flex-1'>
                            <p className='font-11 mb-0'>{intl.formatMessage(messages.phoneCall)}</p>
                            <p className='font-11 mb-0'>{appointment.phoneNumber}</p>
                          </div>
                          <div className='ml-auto flex-1'>
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
                      {listAppointmentsRecent?.filter(a => a.type == 2 && a.status == 0 && moment(a.date).isAfter(new Date()) && a.flagStatus != 1)?.map((appointment, index) =>
                        <div key={index} className={`list-item padding-item ${[-2, -3].includes(appointment.status) ? 'line-through' : ''}`} onClick={() => this.onShowDrawerDetail(appointment._id)}>
                          <Avatar size={24} icon={<FaUser size={12} />} />
                          <div className='div-service'>
                            <p className='font-11 mb-0'>{appointment.skillSet?.name}</p>
                            <p className='font-09 mb-0'>{userRole == 30 ? `${appointment.dependent?.firstName ?? ''} ${appointment.dependent?.lastName ?? ''}` : `${appointment.provider?.firstName ?? ''} ${appointment.provider?.lastName ?? ''}`}</p>
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
                      {listAppointmentsRecent?.filter(a => a.type == 2 && moment(a.date).isBefore(new Date()) && a.flagStatus != 1)?.map((appointment, index) =>
                        <div key={index} className={`list-item padding-item ${[-2, -3].includes(appointment.status) ? 'line-through' : ''}`} onClick={() => this.onShowDrawerDetail(appointment._id)}>
                          <Avatar size={24} icon={<FaUser size={12} />} />
                          <div className='div-service'>
                            <p className='font-11 mb-0'>{appointment.skillSet?.name}</p>
                            <p className='font-09 mb-0'>{userRole == 30 ? `${appointment.dependent?.firstName ?? ''} ${appointment.dependent?.lastName ?? ''}` : `${appointment.provider?.firstName ?? ''} ${appointment.provider?.lastName ?? ''}`}</p>
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
                      <BiExpand size={18} onClick={() => this.onOpenModalFlagExpand()} />
                      <Badge size="small" count={listAppointmentsRecent?.filter(a => a.flagStatus == 1)?.length}>
                        <BsFillFlagFill size={18} />
                      </Badge>
                    </div>
                  }
                  collapsible='header'
                >
                  <Tabs defaultActiveKey="1" type="card" size='small'>
                    <Tabs.TabPane tab={intl.formatMessage(messages.upcoming)} key="1">
                      {listAppointmentsRecent?.filter(a => a.flagStatus == 1)?.map((appointment, index) =>
                        <div key={index} className='list-item padding-item gap-2' onClick={(e) => e.target.className != 'font-12 flag-action' && this.onShowDrawerDetail(appointment._id)}>
                          <Avatar size={24} icon={<FaUser size={12} />} />
                          <div className='div-service'>
                            <p className='font-11 mb-0'>{appointment.skillSet?.name}</p>
                            <p className='font-09 mb-0'>{userRole == 30 ? `${appointment.dependent?.firstName ?? ''} ${appointment.dependent?.lastName ?? ''}` : `${appointment.provider?.firstName ?? ''} ${appointment.provider?.lastName ?? ''}`}</p>
                          </div>
                          {userRole == 3 ? (
                            <>
                              <a className='font-12 flag-action' onClick={() => this.onOpenModalConfirm('request-clearance', appointment)}>{intl.formatMessage(msgDrawer.requestClearance)}</a>
                              <a className='font-12 flag-action' onClick={() => this.onOpenModalPayment(appointment)}>{intl.formatMessage(msgDrawer.payFlag)}</a>
                            </>
                          ) : (
                            <>
                              <div className='font-12'>{appointment?.type == 2 ? intl.formatMessage(messages.evaluation) : appointment?.type == 3 ? intl.formatMessage(msgModal.standardSession) : appointment?.type == 5 ? intl.formatMessage(msgModal.subsidizedSession) : ''}</div>
                              <a className='font-12 flag-action' onClick={() => this.onOpenModalConfirm('clear-flag', appointment)}>{intl.formatMessage(msgDrawer.clearFlag)}</a>
                            </>
                          )}
                        </div>
                      )}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={intl.formatMessage(messages.past)} key="2">
                      {listAppointmentsRecent?.filter(a => a.flagStatus == 2)?.map((appointment, index) =>
                        <div key={index} className='list-item padding-item gap-2' onClick={() => this.onShowDrawerDetail(appointment._id)}>
                          <Avatar size={24} icon={<FaUser size={12} />} />
                          <div className='div-service'>
                            <p className='font-11 mb-0'>{appointment.skillSet?.name}</p>
                            <p className='font-09 mb-0'>{userRole == 30 ? `${appointment.dependent?.firstName ?? ''} ${appointment.dependent?.lastName ?? ''}` : `${appointment.provider?.firstName ?? ''} ${appointment.provider?.lastName ?? ''}`}</p>
                          </div>
                          <div className='font-12'>{appointment?.type == 2 ? intl.formatMessage(messages.evaluation) : appointment?.type == 3 ? intl.formatMessage(msgModal.standardSession) : appointment?.type == 5 ? intl.formatMessage(msgModal.subsidizedSession) : ''}</div>
                          <div className='ml-auto'>
                            <div className='font-12'>{moment(appointment.date).format("hh:mm a")}</div>
                            <div className='font-12 font-700'>{moment(appointment.date).format('MM/DD/YYYY')}</div>
                          </div>
                        </div>
                      )}
                    </Tabs.TabPane>
                  </Tabs>

                </Panel>
                {this.renderPanelSubsidaries()}
              </Collapse>
            </section>
          )}
        </div>
        <div className='text-right'>
          <div className='btn-call'>
            <img src='../images/call.png' onClick={this.onShowModalReferral} />
          </div>
        </div>
        {userDrawerVisible && <DrawerDetail {...drawerDetailProps} />}
        {visibleNewAppoint && <ModalNewAppointmentForParents {...modalNewAppointProps} />}
        {visibleFlagExpand && <ModalFlagExpand {...modalFlagExpandProps} />}
        {this.renderModalSubsidyDetail()}
        {this.modalCreateAndEditSubsidyRequest()}
        <ModalNewGroup {...modalNewGroupProps} />
        <ModalReferralService {...modalReferralServiceProps} />
        <ModalNewSubsidyReview {...modalNewReviewProps} />
        {visibleConfirm && <ModalConfirm {...modalConfirmProps} />}
        {visibleSessionsNeedToClose && <ModalSessionsNeedToClose {...modalSessionsNeedToCloseProps} />}
        {visiblePayment && <ModalPayment {...modalPaymentProps} />}
      </div>
    );
  }
}

function reportNetworkError() {
  alert('This action could not be completed')
}

function renderEventContent(eventInfo, appointments) {
  const event = eventInfo.event.extendedProps;
  const type = event?.type;
  const status = event?.status;
  const eventType = type == 1 ? 'Screening' : type == 2 ? 'Evaluation' : type == 4 ? 'Consultation' : 'Session';

  return (
    <div className={`flex flex-col p-3 rounded-2 relative bg-${status == 0 ? 'active' : status == -1 ? eventType.toLowerCase() : 'cancelled'}`}>
      <div className='flex items-center gap-2'>
        <Avatar shape="square" size="large" src='../images/doctor_ex2.jpeg' />
        {event?.status == -2 && <span className='font-20 text-black'>Cancelled</span>}
        {event?.status == -1 && <span className='font-20 text-black'>Closed</span>}
      </div>
      <div className={`flex flex-col text-white ${event?.status == -2 ? 'line-through' : ''}`}>
        <b className='mr-3'>{moment(eventInfo.event.start).format('hh:mm a')}</b>
        <b className='mr-3'>Dependent: {`${event?.dependent?.firstName ?? ''} ${event?.dependent?.lastName ?? ''}`}</b>
        <b className='mr-3'>{eventType} with {eventInfo.event.title}</b>
      </div>
      {event?.flagStatus == 1 && event?.flagItems?.flagType == 1 && <div className='flag-icons'><BsFillFlagFill color="#ff0000" size={15} /><GiPayMoney color="#ff0000" size={15} /></div>}
      {event?.status == 0 && appointments?.find(a => a.dependent?._id == event?.dependent?._id && a.provider?._id == event?.provider?._id && a.flagStatus == 1)?.flagItems?.flagType == 1 && <div className='flag-icons'><BsFillFlagFill color="#ff0000" size={15} /><GiPayMoney color="#ff0000" size={15} /></div>}
      {event?.flagStatus == 1 && event?.flagItems?.flagType == 2 && <div className='flag-icons'><BsFillFlagFill color="#ff0000" size={15} /><FaCalendarTimes color="#ff0000" size={15} /></div>}
      {event?.status == 0 && appointments?.find(a => a.dependent?._id == event?.dependent?._id && a.provider?._id == event?.provider?._id && a.flagStatus == 1)?.flagItems?.flagType == 2 && <div className='flag-icons'><BsFillFlagFill color="#ff0000" size={15} /><FaCalendarTimes color="#ff0000" size={15} /></div>}
    </div>
  )
}

const mapStateToProps = state => {
  return ({
    appointments: state.appointments.dataAppointments,
    appointmentsInMonth: state.appointments.dataAppointmentsMonth,
    user: state.auth.user,
  })
}

export default compose(connect(mapStateToProps))(Dashboard);
