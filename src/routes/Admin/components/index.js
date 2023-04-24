import React from 'react';
import { Button, Segmented, Row, Col, Checkbox, Select, message, notification, Divider, Collapse, Tabs, Avatar, Badge, Modal } from 'antd';
import { FaCalendarAlt, FaHandHoldingUsd, FaUser } from 'react-icons/fa';
import { MdFormatAlignLeft, MdOutlineEventBusy, MdOutlineRequestQuote } from 'react-icons/md';
import { BsClockHistory, BsFillDashSquareFill, BsFillFlagFill, BsFillPlusSquareFill, BsFilter, BsX } from 'react-icons/bs';
import intl from 'react-intl-universal';
import FullCalendar from '@fullcalendar/react' // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import timeGridPlugin from '@fullcalendar/timegrid' // a plugin!
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import listPlugin from '@fullcalendar/list';
import "@fullcalendar/daygrid/main.css";
import "@fullcalendar/timegrid/main.css";
import Cookies from 'js-cookie';
import { BiChevronLeft, BiChevronRight, BiExpand } from 'react-icons/bi';
import { GoPrimitiveDot } from 'react-icons/go';
import moment from 'moment';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { ModalNewGroup, ModalSubsidyProgress, ModalReferralService, ModalNewSubsidyRequest, ModalNewSubsidyReview, ModalNewAppointment, ModalSessionsNeedToClose, ModalFlagExpand, ModalConfirm, ModalCreateNote } from '../../../components/Modal';
import DrawerDetail from '../../../components/DrawerDetail';
import messages from '../../Dashboard/messages';
import messagesCreateAccount from '../../Sign/CreateAccount/messages';
import msgSidebar from '../../../components/SideBar/messages';
import msgDrawer from '../../../components/DrawerDetail/messages';
import msgModal from '../../../components/Modal/messages';
import { socketUrl, socketUrlJSFile } from '../../../utils/api/baseUrl';
import request from '../../../utils/api/request'
import { changeTime, getAppointmentsData, getAppointmentsMonthData, getSubsidyRequests } from '../../../redux/features/appointmentsSlice'
import { setAcademicLevels, setDependents, setDurations, setMeetingLink, setProviders, setSkillSet, setConsultants, setSchools } from '../../../redux/features/authSlice';
import { clearFlag, getDefaultDataForAdmin, payInvoice, requestClearance } from '../../../utils/api/apiList';
import PanelAppointment from './PanelAppointment';
import PanelSubsidaries from './PanelSubsidaries';
import PageLoading from '../../../components/Loading/PageLoading';
import './index.less';

const { Panel } = Collapse;

class SchedulingCenter extends React.Component {
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
      calendarWeekends: true,
      calendarEvents: this.props.appointmentsInMonth,
      userRole: this.props.auth.user?.role,
      listDependents: [],
      parentInfo: {},
      providerInfo: {},
      schoolInfo: {},
      listAppointmentsRecent: this.props.appointments,
      SkillSet: [],
      selectedProviders: [],
      selectedLocations: [],
      selectedSkills: [],
      listProvider: [],
      locations: [],
      selectedEvent: {},
      selectedEventTypes: [],
      selectedDate: undefined,
      visibleSessionsNeedToClose: false,
      visibleFlagExpand: false,
      visibleConfirm: false,
      confirmMessage: '',
      selectedDependentId: 0,
      subsidyId: '',
      loading: false,
      visibleCreateNote: false,
      visibleFlagAction: false,
    };
    this.calendarRef = React.createRef();
    this.scrollElement = React.createRef();
  }

  componentDidMount() {
    const { auth } = this.props;
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
          message.warning('Something went wrong. Please try again.');
        }
      }).catch(err => {
        console.log('pay flag error---', err);
        message.error(err.message);
      });
    }
    this.updateCalendarEvents(auth?.user?.role);
    this.getMyAppointments(auth?.user?.role);
    this.props.getSubsidyRequests({ role: auth?.user?.role });
    this.loadDefaultData();

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

  loadDefaultData() {
    request.post(getDefaultDataForAdmin).then(res => {
      this.setState({ loading: false });
      const { success, data } = res;
      if (success) {
        this.setState({
          SkillSet: data?.skillSet ?? [],
          listProvider: data?.providers ?? [],
          listDependents: data?.dependents ?? [],
          locations: data?.locations ?? [],
        });
        this.props.setDependents(data?.dependents ?? []);
        this.props.setProviders(data?.providers ?? []);
        this.props.setSkillSet(data?.skillSet ?? []);
        this.props.setAcademicLevels(data?.academicLevels ?? []);
        this.props.setDurations(data?.durations ?? []);
        this.props.setConsultants(data?.consultants ?? []);
        this.props.setSchools(data?.schools ?? []);
      }
    }).catch(err => {
      console.log('get default data error---', err);
      this.setState({ loading: false });
    });
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
      this.socket.emit('join_room', this.props.auth?.user?._id);
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
        this.showNotificationForSubsidy(data);
        return;
      case 'subsidy_change_status':
        this.panelSubsidariesReload && typeof this.panelSubsidariesReload == 'function' && this.panelSubsidariesReload(true)
        this.showNotificationForSubsidyChange(data.data);
        return;
      case 'meeting_link':
        this.props.setMeetingLink(data.data);
      case 'appeal_subsidy':
        return;
    }
  }

  modalCreateAndEditSubsidyRequest = () => {
    return
  }

  onShowFilter = () => {
    this.setState({ isFilter: !this.state.isFilter });
  }

  onShowDrawerDetail = (val) => {
    const { listAppointmentsRecent } = this.state;
    const id = val?.event?.toPlainObject() ? val.event?.toPlainObject()?.extendedProps?._id : val;
    const selectedEvent = listAppointmentsRecent?.find(a => a._id == id);
    this.setState({ selectedEvent: selectedEvent, userDrawerVisible: true });
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

  onCancelSubsidy = () => { }

  onCloseModalSubsidy = () => {
    this.setState({ visibleSubsidy: false, subsidyId: '' });
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

  getMyAppointments(userRole, dependentId) {
    this.props.getAppointmentsData({ role: userRole, dependentId: dependentId });
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

  updateCalendarEvents(role, dependentId) {
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
    this.props.getAppointmentsMonthData(dataFetchAppointMonth);
  }

  handleSelectProvider = (id) => {
    if (!this.state.selectedProviders.includes(id)) {
      this.setState({ selectedProviders: [...this.state.selectedProviders, id] });
    }
  }

  handleRemoveProvider = (index) => {
    this.state.selectedProviders.splice(index, 1);
    this.setState({ selectedProviders: this.state.selectedProviders });
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

  handleRequestClearance = () => {
    this.closeFlagAction();
    this.onCloseModalCreateNote();
    request.post(requestClearance, { appointmentId: this.state.selectedEvent?._id }).then(result => {
      const { success } = result;
      if (success) {
        message.success('Sent successfully');
      }
    })
  }

  handleClearFlag = () => {
    this.onCloseModalConfirm();
    this.closeFlagAction();
    const { selectedEvent, userRole } = this.state;
    request.post(clearFlag, { _id: selectedEvent?._id }).then(result => {
      const { success } = result;
      if (success) {
        message.success('Cleared successfully');
        this.updateCalendarEvents(userRole);
        this.getMyAppointments(userRole);
      } else {
        message.error("Cannot find this flag");
      }
    }).catch(err => {
      message.error("Clear Flag: " + err.message);
    })
  }

  onCloseModalConfirm = () => {
    this.setState({ visibleConfirm: false });
  }

  onOpenModalConfirm = () => {
    this.setState({
      visibleConfirm: true,
      confirmMessage: 'Are you sure to clear this flag?',
    });
  }

  onOpenModalSessionsNeedToClose = () => {
    this.setState({ visibleSessionsNeedToClose: true });
  }

  onCloseModalSessionsNeedToClose = () => {
    this.setState({ visibleSessionsNeedToClose: false });
  }

  renderPanelAppointmentForProvider = () => {
    return (
      <Panel
        key="1"
        header={intl.formatMessage(messages.appointments)}
        extra={(<BsClockHistory size={18} className="cursor" onClick={() => this.onOpenModalSessionsNeedToClose()} />)}
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

  onOpenModalCreateNote = () => {
    this.setState({ visibleCreateNote: true });
  }

  onCloseModalCreateNote = () => {
    this.setState({ visibleCreateNote: false });
  }

  openFlagAction = (appointment) => {
    this.setState({ selectedEvent: appointment, visibleFlagAction: true });
  }

  closeFlagAction = () => {
    this.setState({ visibleFlagAction: false, selectedEvent: {} });
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
      calendarEvents,
      calendarWeekends,
      listDependents,
      selectedEvent,
      selectedSkills,
      selectedEventTypes,
      visibleNewAppoint,
      selectedDate,
      visibleSessionsNeedToClose,
      visibleFlagExpand,
      visibleConfirm,
      confirmMessage,
      selectedDependentId,
      visibleNewSubsidy,
      visibleSubsidy,
      subsidyId,
      loading,
      visibleCreateNote,
      visibleFlagAction,
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
      listDependents: listDependents,
      setLoadData: reload => { this.loadDataModalReferral = reload },
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
    }

    const modalNewAppointProps = {
      visible: visibleNewAppoint,
      onSubmit: this.onSubmitModalNewAppoint,
      onCancel: this.onCloseModalNewAppoint,
      listDependents: listDependents,
      SkillSet: SkillSet,
      listAppointmentsRecent: listAppointmentsRecent,
      selectedDate: selectedDate,
    };

    const modalSessionsNeedToCloseProps = {
      visible: visibleSessionsNeedToClose,
      onSubmit: this.onCloseModalSessionsNeedToClose,
      onCancel: this.onCloseModalSessionsNeedToClose,
      calendar: this.calendarRef,
    };

    const drawerDetailProps = {
      visible: userDrawerVisible,
      onClose: this.onCloseDrawerDetail,
      event: listAppointmentsRecent?.find(a => a._id == selectedEvent?._id),
      calendar: this.calendarRef,
      listAppointmentsRecent: listAppointmentsRecent,
    };

    const modalFlagExpandProps = {
      visible: visibleFlagExpand,
      onSubmit: this.onCloseModalFlagExpand,
      onCancel: this.onCloseModalFlagExpand,
      flags: listAppointmentsRecent?.filter(appointment => appointment.flagStatus == 1 || appointment.flagStatus == 2),
      calendar: this.calendarRef,
    };

    const modalConfirmProps = {
      visible: visibleConfirm,
      onSubmit: this.handleClearFlag,
      onCancel: this.onCloseModalConfirm,
      message: confirmMessage,
    };

    const modalNewSubsidyProps = {
      visible: visibleNewSubsidy,
      onSubmit: this.onCloseModalNewSubsidy,
      onCancel: this.onCloseModalNewSubsidy,
    };

    const modalSubsidyProps = {
      visible: visibleSubsidy,
      subsidyId: subsidyId,
      onSubmit: this.onCloseModalSubsidy,
      onCancel: this.onCloseModalSubsidy,
      openReferral: this.onShowModalReferral,
      openHierachy: this.openHierachyModal,
    }

    const modalCreateNoteProps = {
      visible: visibleCreateNote,
      onSubmit: this.handleRequestClearance,
      onCancel: this.onCloseModalCreateNote,
      title: "Request Message"
    };

    return (
      <div className="full-layout page admin-page">
        <div className='div-title-admin'>
          <p className='font-16 font-500'>{intl.formatMessage(msgSidebar.schedulingCenter)}</p>
          <Divider />
        </div>
        <div className='div-content'>
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
              <div className='btn-appointment mb-10 flex justify-end'>
                <Button
                  type='primary'
                  block
                  icon={<FaCalendarAlt size={19} />}
                  onClick={() => this.onShowModalNewAppoint()}
                >
                  <span>{intl.formatMessage(messages.makeAppointment)}</span>
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
                  <Col xs={12} sm={12} md={6} className='select-small'>
                    <p className='font-16 font-700 mb-5'>{intl.formatMessage(messagesCreateAccount.provider)}</p>
                    <Select
                      showSearch
                      placeholder={intl.formatMessage(messages.startTypingProvider)}
                      value=''
                      optionFilterProp='children'
                      filterOption={(input, option) => option.children?.join('').toLowerCase().includes(input.toLowerCase())}
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
                  <Col xs={12} sm={12} md={6} className='select-small'>
                    <p className='font-16 font-700 mb-5'>{intl.formatMessage(messagesCreateAccount.location)}</p>
                    <Select
                      showSearch
                      placeholder={intl.formatMessage(messages.startTypingLocation)}
                      value=''
                      optionFilterProp='children'
                      filterOption={(input, option) => option.children?.toLowerCase().includes(input.toLowerCase())}
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
                  <Button type='primary' onClick={this.handleApplyFilter}>{intl.formatMessage(messages.apply).toUpperCase()}</Button>
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
                dateClick={this.handleClickDate}
                height="calc(100vh - 220px)"
              />
            </div>
          </section>
          <section className='div-multi-choice'>
            <Collapse
              defaultActiveKey={['1']}
              expandIcon={({ isActive }) => isActive ? <BsFillDashSquareFill size={18} /> : <BsFillPlusSquareFill size={18} />}
              expandIconPosition={'end'}
              onChange={this.onCollapseChange}
            >
              {this.renderPanelAppointmentForProvider()}
              <Panel header={intl.formatMessage(messages.referrals)} key="2">
                <Tabs defaultActiveKey="1" type="card" size='small'>
                  <Tabs.TabPane tab={intl.formatMessage(messages.upcoming)} key="1">
                    {listAppointmentsRecent?.filter(a => a.type === 4 && a.status === 0)?.map((appointment, index) =>
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
                          <p className='font-12 font-700 mb-0 whitespace-nowrap'>{moment(appointment.date).format('MM/DD/YYYY')}</p>
                        </div>
                      </div>
                    )}
                  </Tabs.TabPane>
                  <Tabs.TabPane tab={intl.formatMessage(messages.past)} key="2">
                    {listAppointmentsRecent?.filter(a => a.type === 4 && a.status !== 0)?.map((appointment, index) =>
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
                          <p className='font-12 font-700 mb-0 whitespace-nowrap'>{moment(appointment.date).format('MM/DD/YYYY')}</p>
                        </div>
                      </div>
                    )}
                  </Tabs.TabPane>
                </Tabs>
              </Panel>
              <Panel header={intl.formatMessage(messages.screenings)} key="3">
                <Tabs defaultActiveKey="1" type="card" size='small'>
                  <Tabs.TabPane tab={intl.formatMessage(messages.upcoming)} key="1">
                    {listAppointmentsRecent?.filter(a => a.type === 1 && a.status === 0)?.map((appointment, index) =>
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
                    {listAppointmentsRecent?.filter(a => a.type === 1 && a.status !== 0)?.map((appointment, index) =>
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
                          <p className='font-12 mb-0'>{moment(appointment.date).format('hh:mm a')}</p>
                          <p className='font-12 font-700 mb-0 whitespace-nowrap'>{moment(appointment.date).format('MM/DD/YYYY')}</p>
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
                          <p className='font-12 mb-0'>{moment(appointment.date).format('hh:mm a')}</p>
                          <p className='font-12 font-700 mb-0 whitespace-nowrap'>{moment(appointment.date).format('MM/DD/YYYY')}</p>
                        </div>
                      </div>
                    )}
                  </Tabs.TabPane>
                </Tabs>
              </Panel>
              <Panel
                header={intl.formatMessage(messages.flags)}
                key="5"
                extra={(
                  <div className='flex gap-2'>
                    <BiExpand size={18} className="cursor" onClick={() => this.onOpenModalFlagExpand()} />
                    <Badge size="small" count={listAppointmentsRecent?.filter(a => a.flagStatus === 1)?.length}>
                      <BsFillFlagFill size={18} />
                    </Badge>
                  </div>
                )}
                collapsible="header"
              >
                <Tabs defaultActiveKey="1" type="card" size='small'>
                  <Tabs.TabPane tab={intl.formatMessage(messages.upcoming)} key="1">
                    {listAppointmentsRecent?.filter(a => a.flagStatus === 1)?.map((appointment, index) =>
                      <div key={index} className='list-item padding-item justify-between' onClick={(e) => e.target.className !== 'font-12 flag-action' && this.onShowDrawerDetail(appointment._id)}>
                        <Avatar size={24} icon={<FaUser size={12} />} />
                        <div className='div-service'>
                          <p className='font-11 mb-0'>{appointment.skillSet?.name}</p>
                          <p className='font-09 mb-0'>{userRole === 30 ? `${appointment.dependent?.firstName ?? ''} ${appointment.dependent?.lastName ?? ''}` : `${appointment.provider?.firstName ?? ''} ${appointment.provider?.lastName ?? ''}`}</p>
                        </div>
                        <div className='font-12'>{appointment?.type === 2 ? intl.formatMessage(messages.evaluation) : appointment?.type === 3 ? intl.formatMessage(msgModal.standardSession) : appointment?.type === 5 ? intl.formatMessage(msgModal.subsidizedSession) : ''}</div>
                        <a className='font-12 flag-action' onClick={() => this.openFlagAction(appointment)}>{intl.formatMessage(messages.action)}</a>
                      </div>
                    )}
                  </Tabs.TabPane>
                  <Tabs.TabPane tab={intl.formatMessage(messages.past)} key="2">
                    {listAppointmentsRecent?.filter(a => a.flagStatus === 2)?.map((appointment, index) =>
                      <div key={index} className='list-item padding-item justify-between' onClick={() => this.onShowDrawerDetail(appointment._id)}>
                        <Avatar size={24} icon={<FaUser size={12} />} />
                        <div className='div-service'>
                          <p className='font-11 mb-0'>{appointment.skillSet?.name}</p>
                          <p className='font-09 mb-0'>{userRole === 30 ? `${appointment.dependent?.firstName ?? ''} ${appointment.dependent?.lastName ?? ''}` : `${appointment.provider?.firstName ?? ''} ${appointment.provider?.lastName ?? ''}`}</p>
                        </div>
                        <div className='font-12'>{appointment?.type === 2 ? intl.formatMessage(messages.evaluation) : appointment?.type === 3 ? intl.formatMessage(msgModal.standardSession) : appointment?.type === 5 ? intl.formatMessage(msgModal.subsidizedSession) : ''}</div>
                        <div>
                          <div className='font-12'>{moment(appointment.date).format("hh:mm a")}</div>
                          <div className='font-12 font-700 whitespace-nowrap'>{moment(appointment.date).format('MM/DD/YYYY')}</div>
                        </div>
                      </div>
                    )}
                  </Tabs.TabPane>
                </Tabs>
              </Panel>
              <Panel
                key="6"
                header={intl.formatMessage(messages.subsidaries)}
                extra={(
                  <div className='flex flex-row justify-between'>
                    <Button type='primary' size='small' onClick={this.onShowModalNewSubsidy}>
                      {intl.formatMessage(messages.requestNewSubsidy).toUpperCase()}
                    </Button>
                  </div>
                )}
                className='subsidaries-panel'
                collapsible='header'
              >
                <PanelSubsidaries
                  setReload={reload => this.panelSubsidariesReload = reload}
                  userRole={userRole}
                  SkillSet={SkillSet}
                  onShowModalSubsidyDetail={this.onShowModalSubsidy}
                  onCancelSubsidy={this.onCancelSubsidy}
                />
              </Panel>
            </Collapse>
          </section>
        </div>
        <img src='../images/call.png' className='btn-call' width="6%" onClick={this.onShowModalReferral} />
        {userDrawerVisible && <DrawerDetail {...drawerDetailProps} />}
        {visibleNewAppoint && <ModalNewAppointment {...modalNewAppointProps} />}
        {visibleFlagExpand && <ModalFlagExpand {...modalFlagExpandProps} />}
        {visibleSubsidy && <ModalSubsidyProgress {...modalSubsidyProps} />}
        {visibleNewSubsidy && <ModalNewSubsidyRequest {...modalNewSubsidyProps} />}
        <ModalNewGroup {...modalNewGroupProps}
          SkillSet={SkillSet}
          setLoadData={reload => this.loadDataModalNewGroup = reload}
        />
        {visiblReferralService && <ModalReferralService {...modalReferralServiceProps} />}
        <ModalNewSubsidyReview {...modalNewReviewProps} />
        {visibleSessionsNeedToClose && <ModalSessionsNeedToClose {...modalSessionsNeedToCloseProps} />}
        {visibleConfirm && <ModalConfirm {...modalConfirmProps} />}
        {visibleCreateNote && <ModalCreateNote {...modalCreateNoteProps} />}
        <Modal title="Flag Action" open={visibleFlagAction} footer={null} onCancel={this.closeFlagAction}>
          <div className='flex items-center gap-2'>
            {(selectedEvent?.flagItems?.isPaid || selectedEvent?.flagItems?.rate == 0) ? (
              <Button type='primary' block className='font-16 flag-action whitespace-nowrap' onClick={() => this.onOpenModalCreateNote()}>{intl.formatMessage(msgDrawer.requestClearance)}</Button>
            ) : null}
            {selectedEvent?.flagItems?.isPaid ? (
              <Button type='primary' block className='font-16 flag-action whitespace-nowrap' disabled>
                {intl.formatMessage(msgDrawer.paid)}
              </Button>
            ) : selectedEvent?.flagItems?.rate == 0 ? null : (
              <form aria-live="polite" data-ux="Form" action="https://www.paypal.com/cgi-bin/webscr" method="post">
                <input type="hidden" name="edit_selector" data-aid="EDIT_PANEL_EDIT_PAYMENT_ICON" />
                <input type="hidden" name="business" value="office@helpmegethelp.org" />
                <input type="hidden" name="cmd" value="_donations" />
                <input type="hidden" name="item_name" value="Help Me Get Help" />
                <input type="hidden" name="item_number" />
                <input type="hidden" name="amount" value={selectedEvent?.flagItems?.rate} data-aid="PAYMENT_HIDDEN_AMOUNT" />
                <input type="hidden" name="shipping" value="0.00" />
                <input type="hidden" name="currency_code" value="USD" data-aid="PAYMENT_HIDDEN_CURRENCY" />
                <input type="hidden" name="rm" value="0" />
                <input type="hidden" name="return" value={`${window.location.href}?success=true&type=flag&id=${selectedEvent?._id}`} />
                <input type="hidden" name="cancel_return" value={window.location.href} />
                <input type="hidden" name="cbt" value="Return to Help Me Get Help" />
                <Button type='primary' htmlType='submit' block className='font-16 flag-action whitespace-nowrap'>
                  {intl.formatMessage(msgDrawer.payFlag)}
                </Button>
              </form>
            )}
            <Button type='primary' block className='font-16 flag-action whitespace-nowrap' onClick={() => this.onOpenModalConfirm()}>{intl.formatMessage(msgDrawer.clearFlag)}</Button>
          </div>
        </Modal>
        <PageLoading loading={loading} isBackground={true} />
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
  const eventType = type === 1 ? 'Screening' : type === 2 ? 'Evaluation' : type === 4 ? 'Consultation' : 'Session';
  const provider = () => type === 4 ? null : (<div className='text-ellipsis'>Provider: {`${event?.provider?.firstName ?? ''} ${event?.provider?.lastName ?? ''}`}</div>)

  return (
    <div className={`flex flex-col p-3 relative rounded-2 text-white bg-${(status === -2 || status === -3) ? 'cancelled' : eventType.toLowerCase()}`}>
      <div className="flex flex-col">
        <div className={`text-bold flex items-center ${(status === -2 || status === -3) && 'text-cancelled'}`}>{(status === -2 || status === -3) && <GoPrimitiveDot className={`text-${eventType.toLowerCase()}`} size={16} />}<div className='text-ellipsis'>{event?.skillSet?.name}</div></div>
        <div className='text-ellipsis'>{moment(eventInfo.event.start).format('hh:mm a')}</div>
        <div className='text-ellipsis'>Dependent: {`${event?.dependent?.firstName ?? ''} ${event?.dependent?.lastName ?? ''}`}</div>
        {provider()}
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
  auth: state.auth,
})

export default compose(connect(mapStateToProps, { changeTime, getAppointmentsData, getAppointmentsMonthData, setAcademicLevels, setDependents, setDurations, setMeetingLink, setProviders, setSkillSet, setConsultants, getSubsidyRequests, setSchools }))(SchedulingCenter);
