import React from 'react';
import { Button, Segmented, Row, Col, Checkbox, Select, message, notification, Input, Divider, Collapse, Tabs, Avatar, Badge } from 'antd';
import { FaCalendarAlt, FaUser } from 'react-icons/fa';
import { MdFormatAlignLeft } from 'react-icons/md';
import { BsFillDashSquareFill, BsFillFlagFill, BsFillPlusSquareFill, BsFilter, BsX } from 'react-icons/bs';
import { ModalNewGroup, ModalSubsidyProgress, ModalReferralService, ModalNewSubsidyRequest, ModalNewSubsidyReview, ModalNewAppointment } from '../../../components/Modal';
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
import messages from '../../Dashboard/messages';
import messagesCreateAccount from '../../Sign/CreateAccount/messages';
import msgSidebar from '../../../components/SideBar/messages';
import { checkPermission } from '../../../utils/auth/checkPermission';
import './index.less';
import { socketUrl, socketUrlJSFile } from '../../../utils/api/baseUrl';
import request from '../../../utils/api/request'
import moment from 'moment';
import { changeTime, getAppointmentsData, getAppointmentsMonthData } from '../../../redux/features/appointmentsSlice'
import { store } from '../../../redux/store';
import { routerLinks } from "../../constant";
import PlacesAutocomplete from 'react-places-autocomplete';
import { setDependents, setProviders, setSkillSet, setUser } from '../../../redux/features/authSlice';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getDefaultDataForAdmin } from '../../../utils/api/apiList';
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
      userRole: -1,
      listDependents: [],
      parentInfo: {},
      providerInfo: {},
      schoolInfo: {},
      listAppointmentsRecent: this.props.appointments,
      SkillSet: [],
      isEditSubsidyRequest: "",
      selectedProviders: [],
      selectedLocations: [],
      selectedSkills: [],
      listProvider: [],
      location: '',
      selectedEvent: {},
      selectedEventTypes: [],
      selectedDate: undefined,
    };
    this.calendarRef = React.createRef();
  }

  componentDidMount() {
    if (!!localStorage.getItem('token') && localStorage.getItem('token').length > 0) {
      checkPermission().then(loginData => {
        store.dispatch(setUser(loginData));
        loginData?.role < 999 && this.props.history.push(routerLinks.Dashboard)
        this.setState({ userRole: loginData.role });
        this.updateCalendarEvents(loginData.role);
        this.getMyAppointments(loginData.role);
        this.loadDefaultData();
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

  loadDefaultData() {
    request.post(getDefaultDataForAdmin).then(res => {
      if (res.success) {
        const data = res.data;
        this.setState({
          SkillSet: data?.skillSet,
          listProvider: data?.providers,
          listDependents: data?.dependents,
        });
        store.dispatch(setDependents(data?.dependents));
        store.dispatch(setProviders(data?.providers));
        store.dispatch(setSkillSet(data?.skillSet));
      } else {
        console.log('get default data error---', err);
      }
    }).catch(err => {
      console.log('get default data error---', err);
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

  onShowFilter = () => {
    this.setState({ isFilter: !this.state.isFilter });
  }

  onShowDrawerDetail = (val) => {
    const { listAppointmentsRecent } = this.state;
    const id = val?.event?.toPlainObject() ? val.event?.toPlainObject()?.extendedProps?._id : val;
    const selectedEvent = listAppointmentsRecent?.find(a => a._id == id);
    this.setState({ selectedEvent: selectedEvent });
    this.setState({ userDrawerVisible: true });
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

  displayHourMin(value) {
    return value > 9 ? value : `0${value}`;
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

    return (
      <div className="full-layout page admin-page">
        <div className='div-title-admin'>
          <p className='font-16 font-500'>{intl.formatMessage(msgSidebar.schedulingCenter)}</p>
          <Divider />
        </div>
        <div className='div-content'>
          <section className='div-calendar box-card'>
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
                eventContent={renderEventContent}
                eventClick={this.onShowDrawerDetail}
                eventChange={this.handleEventChange} // called for drag-n-drop/resize
                eventRemove={this.handleEventRemove}
                dateClick={this.handleClickDate}
                height="calc(100vh - 230px)"
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
              <Panel header={intl.formatMessage(messages.referrals)} key="2">
                <Tabs defaultActiveKey="1" type="card" size='small'>
                  <Tabs.TabPane tab={intl.formatMessage(messages.upcoming)} key="1">
                    {listAppointmentsRecent?.filter(appointment => appointment.type == 4 && appointment.status == 0 && moment(appointment.date).isAfter(new Date()))?.map((appointment, index) =>
                      <div key={index} className='list-item padding-item' onClick={() => this.onShowDrawerDetail(appointment._id)}>
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
                          <p className='font-12 mb-0'>{this.displayHourMin(moment(appointment.date).hour()) + ':' + this.displayHourMin(moment(appointment.date).minute())}</p>
                          <p className='font-12 font-700 mb-0'>{`${this.displayHourMin(moment(appointment.date).month() + 1)}/${this.displayHourMin(moment(appointment.date).date())}/${this.displayHourMin(moment(appointment.date).year())}`}</p>
                        </div>
                      </div>
                    )}
                  </Tabs.TabPane>
                  <Tabs.TabPane tab={intl.formatMessage(messages.past)} key="2">
                    {listAppointmentsRecent?.filter(appointment => appointment.type == 6 && moment(appointment.date).isBefore(new Date()))?.map((appointment, index) =>
                      <div key={index} className='list-item padding-item' onClick={() => this.onShowDrawerDetail(appointment._id)}>
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
                          <p className='font-12 mb-0'>{this.displayHourMin(moment(appointment.date).hour()) + ':' + this.displayHourMin(moment(appointment.date).minute())}</p>
                          <p className='font-12 font-700 mb-0'>{`${this.displayHourMin(moment(appointment.date).month() + 1)}/${this.displayHourMin(moment(appointment.date).date())}/${this.displayHourMin(moment(appointment.date).year())}`}</p>
                        </div>
                      </div>
                    )}
                  </Tabs.TabPane>
                </Tabs>
              </Panel>
              <Panel header={intl.formatMessage(messages.screenings)} key="3">
                <Tabs defaultActiveKey="1" type="card" size='small'>
                  <Tabs.TabPane tab={intl.formatMessage(messages.upcoming)} key="1">
                    {listAppointmentsRecent?.filter(a => a.type == 1 && a.status == 0)?.map((appointment, index) =>
                      <div key={index} className='list-item padding-item' onClick={() => this.onShowDrawerDetail(appointment._id)}>
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
                    {listAppointmentsRecent?.filter(a => a.type == 1 && a.status != 0)?.map((appointment, index) =>
                      <div key={index} className='list-item padding-item' onClick={() => this.onShowDrawerDetail(appointment._id)}>
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
                    {listAppointmentsRecent?.filter(appointment => appointment.type == 2 && appointment.status == 0 && moment(appointment.date).isAfter(new Date()))?.map((appointment, index) =>
                      <div key={index} className='list-item padding-item' onClick={() => this.onShowDrawerDetail(appointment._id)}>
                        <Avatar size={24} icon={<FaUser size={12} />} />
                        <div className='div-service'>
                          <p className='font-11 mb-0'>{appointment.skillSet?.name}</p>
                          <p className='font-09 mb-0'>{userRole == 30 ? `${appointment.dependent?.firstName ?? ''} ${appointment.dependent?.lastName ?? ''}` : `${appointment.provider?.firstName ?? ''} ${appointment.provider?.lastName ?? ''}`}</p>
                        </div>
                        <p className='font-11 mb-0 ml-auto mr-5'>{appointment.location}</p>
                        <div className='ml-auto'>
                          <p className='font-12 mb-0'>{this.displayHourMin(moment(appointment.date).hour()) + ':' + this.displayHourMin(moment(appointment.date).minute())}</p>
                          <p className='font-12 font-700 mb-0'>{`${this.displayHourMin(moment(appointment.date).month() + 1)}/${this.displayHourMin(moment(appointment.date).date())}/${this.displayHourMin(moment(appointment.date).year())}`}</p>
                        </div>
                      </div>
                    )}
                  </Tabs.TabPane>
                  <Tabs.TabPane tab={intl.formatMessage(messages.past)} key="2">
                    {listAppointmentsRecent?.filter(appointment => appointment.type == 2 && moment(appointment.date).isBefore(new Date()))?.map((appointment, index) =>
                      <div key={index} className='list-item padding-item' onClick={() => this.onShowDrawerDetail(appointment._id)}>
                        <Avatar size={24} icon={<FaUser size={12} />} />
                        <div className='div-service'>
                          <p className='font-11 mb-0'>{appointment.skillSet?.name}</p>
                          <p className='font-09 mb-0'>{userRole == 30 ? `${appointment.dependent?.firstName ?? ''} ${appointment.dependent?.lastName ?? ''}` : `${appointment.provider?.firstName ?? ''} ${appointment.provider?.lastName ?? ''}`}</p>
                        </div>
                        <p className='font-11 mb-0 ml-auto mr-5'>{appointment.location}</p>
                        <div className='ml-auto'>
                          <p className='font-12 mb-0'>{this.displayHourMin(moment(appointment.date).hour()) + ':' + this.displayHourMin(moment(appointment.date).minute())}</p>
                          <p className='font-12 font-700 mb-0'>{`${this.displayHourMin(moment(appointment.date).month() + 1)}/${this.displayHourMin(moment(appointment.date).date())}/${this.displayHourMin(moment(appointment.date).year())}`}</p>
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
                  <Badge size="small" count={2}>
                    <BsFillFlagFill
                      size={18}
                      onClick={() => { }}
                    />
                  </Badge>
                )}
              >
                <Tabs defaultActiveKey="1" type="card" size='small'>
                  <Tabs.TabPane tab={intl.formatMessage(messages.upcoming)} key="1">
                    {listAppointmentsRecent?.filter(appointment => appointment.type == 4 && appointment.status == 0 && moment(appointment.date).isAfter(new Date()))?.map((appointment, index) =>
                      <div key={index} className='list-item padding-item' onClick={() => this.onShowDrawerDetail(appointment._id)}>
                        <Avatar size={24} icon={<FaUser size={12} />} />
                        <div className='div-service'>
                          <p className='font-11 mb-0'>{appointment.skillSet?.name}</p>
                          <p className='font-09 mb-0'>{userRole == 30 ? `${appointment.dependent?.firstName ?? ''} ${appointment.dependent?.lastName ?? ''}` : `${appointment.provider?.firstName ?? ''} ${appointment.provider?.lastName ?? ''}`}</p>
                        </div>
                        <p className='font-11 mb-0 ml-auto mr-5'>Request clearance</p>
                        <p className='font-12 ml-auto mb-0'>Pay Flag</p>
                      </div>
                    )}
                  </Tabs.TabPane>
                  <Tabs.TabPane tab={intl.formatMessage(messages.past)} key="2">
                    {listAppointmentsRecent?.filter(appointment => appointment.type == 4 && moment(appointment.date).isBefore(new Date()))?.map((appointment, index) =>
                      <div key={index} className='list-item padding-item' onClick={() => this.onShowDrawerDetail(appointment._id)}>
                        <Avatar size={24} icon={<FaUser size={12} />} />
                        <div className='div-service'>
                          <p className='font-11 mb-0'>{appointment.skillSet?.name}</p>
                          <p className='font-09 mb-0'>{userRole == 30 ? `${appointment.dependent?.firstName ?? ''} ${appointment.dependent?.lastName ?? ''}` : `${appointment.provider?.firstName ?? ''} ${appointment.provider?.lastName ?? ''}`}</p>
                        </div>
                        <p className='font-11 mb-0 ml-auto mr-5'>Request clearance</p>
                        <p className='font-12 ml-auto mb-0'>Pay Flag</p>
                      </div>
                    )}
                  </Tabs.TabPane>
                </Tabs>
              </Panel>
            </Collapse>
          </section>
        </div>
        <div className='text-right'>
          <div className='btn-call'>
            <img src='../images/call.png' onClick={this.onShowModalReferral} />
          </div>
        </div>
        <DrawerDetail
          visible={userDrawerVisible}
          onClose={this.onCloseDrawerDetail}
          role={userRole}
          event={selectedEvent}
          calendar={this.calendarRef}
        />
        <ModalNewAppointment {...modalNewAppointProps} />
        {this.renderModalSubsidyDetail()}
        {this.modalCreateAndEditSubsidyRequest()}
        <ModalNewGroup {...modalNewGroupProps}
          SkillSet={SkillSet}
          setLoadData={reload => this.loadDataModalNewGroup = reload}
        />
        <ModalReferralService {...modalReferralServiceProps}
          SkillSet={SkillSet}
          listDependents={listDependents}
          setLoadData={reload => this.loadDataModalReferral = reload}
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
  const event = eventInfo.event.extendedProps;
  const type = event?.type;
  const status = event?.status;
  const eventType = type == 1 ? 'Screening' : type == 2 ? 'Evaluation' : type == 4 ? 'Consultation' : 'Session';
  const provider = () => type == 4 ? null : (<b>Provider: {`${event?.provider?.firstName ?? ''} ${event?.provider?.lastName ?? ''}`}</b>)

  return (
    <div className={`flex flex-col p-3 rounded-2 bg-${status == 0 ? 'active' : eventType.toLowerCase()}`}>
      <div className='flex items-center gap-2'>
        {event?.status == -2 && <span className='font-20 text-black'>Cancelled</span>}
        {event?.status == -1 && <span className='font-20 text-black'>Closed</span>}
      </div>
      <div className={`flex flex-col text-white ${event?.status == -2 ? 'line-through' : ''}`}>
        <div className='flex gap-2'>
          <b>{moment(eventInfo.event.start).format('hh:mm a')}</b>
          <b>{eventType}</b>
        </div>
        <b>Dependent: {`${event?.dependent?.firstName ?? ''} ${event?.dependent?.lastName ?? ''}`}</b>
        {provider()}
      </div>
    </div>
  )
}

const mapStateToProps = state => {
  return ({
    appointments: state.appointments.dataAppointments,
    appointmentsInMonth: state.appointments.dataAppointmentsMonth,
  })
}

export default compose(connect(mapStateToProps))(SchedulingCenter);
