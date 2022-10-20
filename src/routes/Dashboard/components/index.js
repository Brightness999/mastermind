import React from 'react';
import { Collapse, Badge, Avatar, Tabs, Dropdown, Menu, Button, Segmented, Row, Col, Checkbox, Select, message, notification, Input } from 'antd';
import { FaUser, FaCalendarAlt } from 'react-icons/fa';
import { MdFormatAlignLeft } from 'react-icons/md';
import { BsFilter, BsX, BsFillDashSquareFill, BsFillPlusSquareFill, BsClockHistory, BsFillFlagFill } from 'react-icons/bs';
import { ModalNewGroup, ModalNewAppointmentForParents, ModalSubsidyProgress, ModalReferralService, ModalNewSubsidyRequest, ModalNewSubsidyReview } from '../../../components/Modal';
import CSSAnimate from '../../../components/CSSAnimate';
import DrawerDetail from '../../../components/DrawerDetail';
import DrawerDetailPost from '../../../components/DrawerDetailPost';
import intl from 'react-intl-universal';
import FullCalendar from '@fullcalendar/react' // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import timeGridPlugin from '@fullcalendar/timegrid' // a plugin!
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import listPlugin from '@fullcalendar/list';
import "@fullcalendar/daygrid/main.css";
import "@fullcalendar/timegrid/main.css";
import events from "../../../utils/calendar/events";
import messages from '../messages';
import messagesCreateAccount from '../../Sign/CreateAccount/messages';
import EventDetail from './EventDetail';
import { checkPermission } from '../../../utils/auth/checkPermission';
import './index.less';
const { Panel } = Collapse;
import { socketUrl, socketUrlJSFile } from '../../../utils/api/baseUrl';
import request, { generateSearchStructure } from '../../../utils/api/request'
import moment from 'moment';
import { changeTime, getAppointmentsMonthData, removeAppoint } from '../../../redux/features/appointmentsSlice'
import { store } from '../../../redux/store'
import { routerLinks } from "../../constant";
import PanelAppointment from './PanelAppointment';
import PanelSubsidaries from './PanelSubsidaries';
import PlacesAutocomplete from 'react-places-autocomplete';

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.socket = undefined;
    this.state = {
      isFilter: false,
      visibleDetail: false,
      visibleDetailPost: false,
      visibleNewAppoint: false,
      visibleSubsidy: false,
      visiblReferralService: false,
      visibleNewSubsidy: false,
      visibleNewReview: false,
      visibleNewGroup: false,
      visibleEvaluation: false,
      isEventDetail: false,
      idEvent: 0,
      isMonth: 1,
      isGridDayView: 'Grid',
      canDrop: true,
      calendarWeekends: true,
      calendarEvents: store.getState().appointments.dataAppointmentsMonth ?? events,
      userRole: -1,
      listDependents: [],
      parentInfo: {},
      providerInfo: {},
      schoolInfo: {},
      listAppointmentsRecent: [],
      listAppoinmentsFilter: [],
      SkillSet: [],
      isEditSubsidyRequest: "",
      selectedProviders: [],
      selectedLocations: [],
      selectedSkills: [],
      listProvider: [],
      location: '',
    }
  }

  componentDidMount() {
    if (!!localStorage.getItem('token') && localStorage.getItem('token').length > 0) {
      this.loadDefaultData();
      checkPermission().then(loginData => {
        loginData.user.role > 900 && this.props.history.push(routerLinks.Admin)
        this.setState({ userRole: loginData.user.role });
        this.updateCalendarEvents(loginData.user.role);
        this.getMyAppointments();
      }).catch(err => {
        this.props.history.push('/');
      })
    }

    const script = document.createElement("script");
    script.src = socketUrlJSFile;
    script.async = true;
    script.onload = () => this.scriptLoaded();
    document.body.appendChild(script);
  }

  loadDefaultData() {
    request.post('clients/get_default_value_for_client').then(result => {
      let data = result.data;
      this.setState({ SkillSet: data.SkillSet });
    });
    request.post('clients/search_providers', generateSearchStructure('')).then(result => {
      if (result.success) {
        this.setState({ listProvider: result.data });
      }
    });
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

  showNotificationForAppeal(data) {
    notification.open({
      message: 'Subsidy Appeal',
      description:
        '1 user has sent appeal for Subsidy.',
      duration: 10,
      onClick: () => {
        console.log('Notification Clicked!');
        this.onShowModalSubsidy(data);
      },
    });
  }

  handleSocketResult(data) {
    switch (data.key) {
      case 'new_appoint_from_client':
        this.setState({ visibleDetailPost: true, });
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
        this.getParentInfo();
        this.loadDependent();
        return;
      case 30: // get provider info
        this.loadMyProviderInfo();
        return;
      case 60:// get school info
        this.loadMySchoolInfo();
        this.loadDependentForSchool();
        return;
    }
  }

  loadMySchoolInfo = () => {
    request.post('schools/get_my_school_info').then(result => {
      let data = result.data;
      this.setState({ schoolInfo: data })
      this.joinRoom(data._id);
    })
  }

  getParentInfo = () => {
    request.post('clients/get_parent_profile').then(result => {
      let data = result.data;
      this.setState({ parentInfo: data })
      this.joinRoom(data._id);
    })
  }

  loadDependent = () => {
    request.post('clients/get_child_profile').then(result => {
      let data = result.data;
      for (let i = 0; i < data.length; i++) {
        this.joinRoom(data[i]._id);
      }
      this.setState({ listDependents: data })
    })
  }

  loadDependentForSchool = () => {
    request.post('schools/get_my_dependents').then(result => {
      if (result.success) {
        this.setState({ listDependents: result.data })
      }
    })
  }

  loadMyProviderInfo = () => {
    request.post('providers/get_my_provider_info').then(result => {
      let data = result.data;
      this.setState({ providerInfo: data })
      this.joinRoom(data._id);
    })
  }

  joinRoom = (roomId) => {
    this.socket.emit('join_room', roomId);
  }

  modalAppointments() {
    const modalNewAppointProps = {
      visible: this.state.visibleNewAppoint,
      onSubmit: this.onSubmitModalNewAppoint,
      onCancel: this.onCloseModalNewAppoint,
      listDependents: this.state.listDependents,
      SkillSet: this.state.SkillSet,
      listAppointmentsRecent: this.state.listAppointmentsRecent,
    };
    return (<ModalNewAppointmentForParents {...modalNewAppointProps} />);
  }

  modalCreateAndEditSubsidyRequest = () => {
    const modalNewSubsidyProps = {
      visible: this.state.visibleNewSubsidy,
      onSubmit: this.onCloseModalNewSubsidy,
      onCancel: this.onCloseModalNewSubsidy,
      isEditSubsidyRequest: this.state.isEditSubsidyRequest,
    };
    return <ModalNewSubsidyRequest {...modalNewSubsidyProps}
      setOpennedEvent={opennedEvent => {
        this.openNewSubsidyRequest = opennedEvent;
      }}
      userRole={this.state.userRole}
      listDependents={this.state.listDependents}
    />
  }

  calendarRef = React.createRef();

  onShowFilter = () => {
    this.setState({ isFilter: !this.state.isFilter });
  }

  onShowDrawerDetail = () => {
    this.setState({ visibleDetail: true });
  };

  onCloseDrawerDetail = () => {
    this.setState({ visibleDetail: false });
  };

  onShowDrawerDetailPost = () => {
    this.setState({ visibleDetailPost: true });
  };

  onCloseDrawerDetailPost = () => {
    this.setState({ visibleDetailPost: false });
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

  onShowModalNewSubsidy = () => {
    this.setState({ visibleNewSubsidy: true });
    this.openNewSubsidyRequest();
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

  onShowModalEvaluation = () => {
    this.setState({ visibleEvaluation: true });
  }
  onCloseModalEvaluation = () => {
    this.setState({ visibleEvaluation: false });
  }

  handleDateClick = arg => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Would you like to add an event to " + arg.dateStr + " ?")) {
      this.setState({
        // add new event data
        calendarEvents: this.state.calendarEvents.concat({
          // creates a new array
          title: "New Event",
          start: arg.date,
          allDay: arg.allDay
        })
      });
    }
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

  handleEventClick = (val) => {
    if (val?.event) {
      const id = val?.event?.toPlainObject() ? val.event?.toPlainObject()?.extendedProps?._id : 0
      this.setState({
        isEventDetail: !this.state.isEventDetail,
        idEvent: id
      });
    } else {
      this.setState({
        isEventDetail: !this.state.isEventDetail,
      });
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

  getMyAppointments() {
    let url = 'clients/get_my_appointments';
    if (this.state.userRole === 30) {
      url = 'providers/get_my_appointments'
    }

    request.post(url).then(result => {
      if (result.success) {
        const data = result.data;
        this.setState({ listAppointmentsRecent: data.docs });
      } else {
        this.setState({ listAppointmentsRecent: [] });
      }
    })
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

  renderListAppoinmentsRecent = (appoinment, index) => {
    return (
      <div key={index} className={appoinment.status == -1 || appoinment.status == 2 ? 'item-feed done' : 'item-feed'}>
        <p className='font-700'>{appoinment.dependent.firstName} {appoinment.dependent.lastName}</p>
        {appoinment.provider != undefined && <p>{appoinment.provider.name || appoinment.provider.referredToAs}</p>}
        {appoinment.school != undefined && <p>{appoinment.school.name}</p>}
        <p>{this.state.SkillSet[appoinment.skillSet[0]]}</p>
        <p>{appoinment.location}</p>
        <p>{moment(appoinment.date).format('hh:mm a')}</p>
        <p className='font-700 text-primary text-right' style={{ marginTop: '-10px' }}>{moment(appoinment.date).fromNow()}</p>
      </div>
    );
  }

  genExtraFlag = () => (
    <Badge size="small" count={2}>
      <BsFillFlagFill
        size={18}
        onClick={() => { }}
      />
    </Badge>
  );

  renderPanelAppointmentForProvider = () => {
    if (this.state.userRole == 30 || this.state.userRole == 3)
      return (
        <Panel
          key="1"
          header={intl.formatMessage(messages.appointments)}
          extra={(<BsClockHistory size={18} onClick={() => { }} />)}
          className='appointment-panel'
        >
          <PanelAppointment
            userRole={this.state.userRole}
            setReload={reload => {
              this.panelAppoimentsReload = reload;
            }}
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
            setReload={reload => {
              this.panelSubsidariesReload = reload;
            }}
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
    const month = calendar._calendarApi.getDate().getMonth() + 1;
    const year = calendar._calendarApi.getDate().getFullYear();
    let selectedSkills = [], selectedProviders = [];
    this.state.selectedSkills.forEach(skill => selectedSkills.push(this.state.skillSet.findIndex(s => s == skill)));
    this.state.selectedProviders.forEach(provider => selectedProviders.push(this.state.listProvider.find(p => p.name == provider)._id));
    const dataFetchAppointMonth = {
      role: role,
      data: {
        month: month,
        year: year,
        locations: this.state.selectedLocations,
        providers: selectedProviders,
        skills: selectedSkills,
      }
    };
    store.dispatch(getAppointmentsMonthData(dataFetchAppointMonth)).then(() => {
      const appointmentsMonth = store.getState().appointments.dataAppointmentsMonth;
      this.setState({ calendarEvents: appointmentsMonth });
    });
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

  handleApplyFilter = () => {
    this.updateCalendarEvents(this.state.userRole);
    this.setState({ isFilter: false });
  }

  render() {
    const {
      isFilter,
      visibleDetail,
      visibleDetailPost,
      visiblReferralService,
      isEventDetail,
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
          {
            value: 'Grid',
            icon: <FaCalendarAlt size={18} />,
          },
          {
            value: 'List',
            icon: <MdFormatAlignLeft size={20} />,
          },
        ]}
      />
    );

    const btnFilter = (
      <div className='header-left flex flex-row' onClick={this.onShowFilter}>
        <p className='font-15'>{intl.formatMessage(messages.filterOptions)} {isFilter ? <BsX size={30} /> : <BsFilter size={25} />}</p>
      </div>
    );

    const menu = (
      <Menu
        items={[
          {
            key: '1',
            label: (<a target="_blank" rel="noopener noreferrer" onClick={this.onShowModalNewAppoint}>{intl.formatMessage(messages.session)}</a>),
          },
          {
            key: '2',
            label: (<a target="_blank" rel="noopener noreferrer" onClick={this.onShowModalEvaluation}>{intl.formatMessage(messages.evaluation)}</a>),
          },
          {
            key: '3',
            label: (<a target="_blank" rel="noopener noreferrer" onClick={this.onShowModalReferral}>{intl.formatMessage(messages.referral)}</a>),
          },
        ]}
      />
    );

    const optionsEvent = [
      {
        label: intl.formatMessage(messages.appointments),
        value: 'appointments',
      },
      {
        label: intl.formatMessage(messages.evaluations),
        value: 'evaluations',
      },
      {
        label: intl.formatMessage(messages.screenings),
        value: 'screenings',
      },
      {
        label: intl.formatMessage(messages.referrals),
        value: 'referrals',
      },
    ];

    const modalReferralServiceProps = {
      visible: visiblReferralService,
      onSubmit: this.onCloseModalReferral,
      onCancel: this.onCloseModalReferral,
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

    return (
      <div className="full-layout page dashboard-page">
        <div className='div-content'>
          <section className='div-activity-feed box-card'>
            <div className='div-title-feed text-center'>
              <p className='font-16 text-white mb-0'>{intl.formatMessage(messages.activityFeed)}</p>
            </div>
            <div className='div-list-feed'>
              {listAppointmentsRecent?.filter((appointment) => moment(appointment.date).isAfter(new Date()))?.map((appoinment, index) => this.renderListAppoinmentsRecent(appoinment, index))}
            </div>
          </section>
          <section className='div-calendar box-card'>
            {isFilter && (
              <div className='calendar-filter w-100'>
                <CSSAnimate className="animated-shorter">
                  <Row gutter={10}>
                    <Col xs={12} sm={12} md={4}>
                      <p className='font-10 font-700 mb-5'>{intl.formatMessage(messages.eventType)}</p>
                      <Checkbox.Group options={optionsEvent} className="flex flex-col" />
                    </Col>
                    <Col xs={12} sm={12} md={8} className='skillset-checkbox'>
                      <p className='font-10 font-700 mb-5'>{intl.formatMessage(messagesCreateAccount.skillsets)}</p>
                      <Checkbox.Group options={SkillSet} />
                    </Col>
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
                    <Col xs={12} sm={12} md={6} className='select-small'>
                      <p className='font-10 font-700 mb-5'>{intl.formatMessage(messagesCreateAccount.location)}</p>
                      <PlacesAutocomplete
                        value={this.state.location}
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
            {!isEventDetail && (
              <>
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
                    eventColor='#2d5cfa'
                    eventDisplay='block'
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    weekends={this.state.calendarWeekends}
                    datesSet={this.handleDates}
                    events={this.state.calendarEvents}
                    eventContent={renderEventContent}
                    eventClick={this.handleEventClick}
                    eventChange={this.handleEventChange} // called for drag-n-drop/resize
                    eventRemove={this.handleEventRemove}
                  />
                </div>
                <div className='btn-appointment'>
                  <Dropdown overlay={this.state.userRole == 60 ? <></> : menu} placement="topRight">
                    <Button
                      type='primary'
                      block
                      icon={<FaCalendarAlt size={19} />}
                    >
                      {intl.formatMessage(messages.makeAppointment)}
                    </Button>
                  </Dropdown>
                </div>
              </>
            )}
            {isEventDetail && (
              <EventDetail backView={this.handleEventClick}
                id={this.state.idEvent}
                role={this.state.userRole}
                calendarEvents={this.state.calendarEvents}
              />
            )}
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
                {new Array(10).fill(null).map((_, index) =>
                  <div key={index} className='list-item padding-item'>
                    <Avatar size={24} icon={<FaUser size={12} />} />
                    <div className='div-service'>
                      <p className='font-11 mb-0'>Service Type</p>
                      <p className='font-09 mb-0'>Referrer Name</p>
                    </div>
                    <div className='text-center ml-auto mr-5'>
                      <p className='font-11 mb-0'>{intl.formatMessage(messages.phoneCall)}</p>
                      <p className='font-11 mb-0'>Phone number</p>
                    </div>
                    <div className='ml-auto'>
                      <p className='font-12 mb-0'>Time</p>
                      <p className='font-12 font-700 mb-0'>Date</p>
                    </div>
                  </div>
                )}
              </Panel>
              <Panel header={intl.formatMessage(messages.screenings)} key="3">
                {listAppointmentsRecent?.filter(a => a.status == 3)?.map((appointment, index) =>
                  <div key={index} className='list-item padding-item'>
                    <Avatar size={24} icon={<FaUser size={12} />} />
                    <div className='div-service flex-1'>
                      <p className='font-11 mb-0'>{SkillSet[appointment.skillSet[0]]}</p>
                      <p className='font-09 mb-0'>{userRole == 3 ? appointment.provider?.name : userRole == 30 ? appointment.dependent?.firstName + appointment.dependent?.lastName : ''}</p>
                    </div>
                    <div className='text-center ml-auto mr-5 flex-1'>
                      <p className='font-11 mb-0'>{intl.formatMessage(messages.phoneCall)}</p>
                      <p className='font-11 mb-0'>{appointment.phoneNumber}</p>
                    </div>
                    <div className='ml-auto flex-1'>
                      <p className='font-12 mb-0'>{appointment.date?.split('T')?.[1].split(':')?.[0] + ':' + appointment.date?.split('T')?.[1].split(':')?.[1]}</p>
                      <p className='font-12 font-700 mb-0'>{appointment.date?.split('T')?.[0]}</p>
                    </div>
                  </div>
                )}
              </Panel>
              <Panel
                key="4"
                header={intl.formatMessage(messages.evaluations)}
                className='evaluations-panel'
              >
                <Tabs defaultActiveKey="1" type="card" size='small'>
                  <Tabs.TabPane tab={intl.formatMessage(messages.upcoming)} key="1">
                    {new Array(10).fill(null).map((_, index) =>
                      <div key={index} className='list-item padding-item'>
                        <Avatar size={24} icon={<FaUser size={12} />} />
                        <div className='div-service'>
                          <p className='font-11 mb-0'>Service Type</p>
                          <p className='font-09 mb-0'>Provide Name</p>
                        </div>
                        <p className='font-11 mb-0 ml-auto mr-5'>Location</p>
                        <div className='ml-auto'>
                          <p className='font-12 mb-0'>Time</p>
                          <p className='font-12 font-700 mb-0'>Date</p>
                        </div>
                      </div>
                    )}
                  </Tabs.TabPane>
                  <Tabs.TabPane tab={intl.formatMessage(messages.past)} key="2">
                    <div className='list-item padding-item'>{intl.formatMessage(messages.past)}</div>
                  </Tabs.TabPane>
                </Tabs>
              </Panel>
              <Panel header={intl.formatMessage(messages.flags)} key="5" extra={this.genExtraFlag()}>
                {new Array(10).fill(null).map((_, index) =>
                  <div key={index} className='list-item padding-item'>
                    <Avatar size={24} icon={<FaUser size={12} />} />
                    <div className='div-service'>
                      <p className='font-11 mb-0'>Service Type</p>
                      <p className='font-09 mb-0'>Provide Name</p>
                    </div>
                    <p className='font-11 mb-0 ml-auto mr-5'>Request clearance</p>
                    <p className='font-12 ml-auto mb-0'>Pay Flag</p>
                  </div>
                )}
              </Panel>
              {this.renderPanelSubsidaries()}
            </Collapse>
          </section>
        </div>
        <div className='text-right'>
          <div className='btn-call'>
            <img src='../images/call.png' />
          </div>
        </div>
        <DrawerDetail
          visible={visibleDetail}
          onClose={this.onCloseDrawerDetail}
        />
        <DrawerDetailPost
          visible={visibleDetailPost}
          onClose={this.onCloseDrawerDetailPost}
        />
        {this.modalAppointments()}
        {this.renderModalSubsidyDetail()}
        {this.modalCreateAndEditSubsidyRequest()}
        <ModalNewGroup {...modalNewGroupProps}
          SkillSet={this.state.SkillSet}
          setLoadData={reload => {
            this.loadDataModalNewGroup = reload;
          }}
        />
        <ModalReferralService {...modalReferralServiceProps}
          SkillSet={this.state.SkillSet}
          listDependents={this.state.listDependents}
          setLoadData={reload => {
            this.loadDataModalReferral = reload;
          }}
          userRole={this.state.userRole}
        />
        <ModalNewSubsidyReview {...modalNewReviewProps} />
      </div>
    );
  }
}

function reportNetworkError() {
  alert('This action could not be completed')
}

function renderEventContent(eventInfo) {
  return (
    <div className='flex flex-col'>
      <Avatar shape="square" size="large" src='../images/doctor_ex2.jpeg' />
      <b className='mr-3'>{moment(eventInfo.event.start).format('hh:mm')}</b>
      <b className='mr-3'>Meeting with {eventInfo.event.title}</b>
    </div>
  )
}