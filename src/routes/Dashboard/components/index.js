import React from 'react';
import { connect } from 'dva';
import {
  Collapse,
  Badge,
  Avatar,
  Tabs,
  Dropdown,
  Menu,
  Button,
  Segmented,
  Row,
  Col,
  Checkbox,
  Select,
  message,
  notification 
} from 'antd';
import { FaUser, FaCalendarAlt } from 'react-icons/fa';
import { GiBackwardTime } from 'react-icons/gi';
import { MdFormatAlignLeft } from 'react-icons/md';
import { BsEnvelope, BsFilter, BsXCircle, BsX, BsFillDashSquareFill, BsFillPlusSquareFill, BsClockHistory, BsFillFlagFill, BsCheckCircleFill } from 'react-icons/bs';
import {
  ModalNewGroup,
  ModalNewAppointment,
  ModalNewAppointmentForParents,
  ModalSubsidyProgress,
  ModalReferralService,
  ModalNewSubsidyRequest,
  ModalNewSubsidyReview,
  ModalNewClientScreening,
  ModalSeparateEvaluation,
  ModalStandardSession
} from '../../../components/Modal';

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
const { TabPane } = Tabs;


import { socketUrl, socketUrlJSFile } from '../../../utils/api/baseUrl';
import request, { generateSearchStructure } from '../../../utils/api/request'
import moment from 'moment';

import { changeTime, getAppointmentsMonthData, removeAppoint } from '../../../redux/features/appointmentsSlice'
import { store } from '../../../redux/store'


import { routerLinks } from "../../constant";
import PanelAppointment from './PanelAppointment';
import PanelSubsidaries from './PanelSubsidaries';

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
      listAppoinmentsRecent: [],
      listAppoinmentsFilter: [],
      SkillSet: [],
      isEditSubsidyRequest: "",
    }
    // this.panelSubsidariesRef = React.forwardRef();
  }
  componentDidMount() {
    if (!!localStorage.getItem('token') && localStorage.getItem('token').length > 0) {
      this.loadDefaultData();
      checkPermission().then(loginData => {
        loginData.user.role > 900 && this.props.history.push(routerLinks.Admin)
        const appointmentsMonth = store.getState().appointments.dataAppointmentsMonth
        const dataFetchAppointMonth = {
          role: loginData.user.role,
          data: {
            month: moment().month() + 1,
            year: moment().year()
          },
          token: loginData.token
        }


        // const newAppointments = 
        this.setState({
          calendarEvents: appointmentsMonth,
          userRole: loginData.user.role
        }, () => {
          // get list appointments
          this.getMyAppointments();
          store.dispatch(getAppointmentsMonthData(dataFetchAppointMonth))
        })

      }).catch(err => {
        this.props.history.push('/');
      })
    } else {
      this.props.history.push('/');
    }

    const script = document.createElement("script");
    script.src = socketUrlJSFile;
    script.async = true;
    script.onload = () => this.scriptLoaded();
    document.body.appendChild(script);
  }

  loadDefaultData() {
    request.post('clients/get_default_value_for_client').then(result => {
      var data = result.data;
      console.log('default value', data);
      this.setState({ SkillSet: data.SkillSet });
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
    // const socket = socketio.connect(socketUrl , opts);
    this.socket.on('connect_error', e => {
      console.log('connect error ', e);
    });

    this.socket.on('connect', () => {
      console.log('socket connect success');
      // this.disconnect();
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

  showNotificationForSubsidy(data){
    notification.open({
      message: 'You have new Subsidy',
      duration:10,
      description:
        'A parent has sent 1 subsidy request, press for view.',
      onClick: () => {
        console.log('Notification Clicked!');
        this.onShowModalSubsidy(data.data._id );
      },
    });
  }

  showNotificationForSubsidyChange(data){
    notification.open({
      message: 'Subsidy Status changed',
      duration:10,
      description:
        'Press for check subsidy progress.',
      onClick: () => {
        console.log('Notification Clicked!');
        this.onShowModalSubsidy(data );
      },
    });
  }

  showNotificationForAppeal(data){
    notification.open({
      message: 'Subsidy Appeal',
      description:
        '1 user has sent appeal for Subsidy.',
      duration:10,
      onClick: () => {
        console.log('Notification Clicked!');
        this.onShowModalSubsidy(data );
      },
    });
  }

  handleSocketResult(data){
    switch(data.key){
      case 'new_appoint_from_client':
        this.setState({ visibleDetailPost: true, });
        return;
      case 'new_subsidy_request_from_client':
        this.panelSubsidariesReload && typeof this.panelSubsidariesReload == 'function' && this.panelSubsidariesReload(true)
        return;
        case 'new_subsidy_request_from_client':
          this.panelSubsidariesReload&&typeof this.panelSubsidariesReload == 'function'&&this.panelSubsidariesReload(true)
          this.showNotificationForSubsidy(data);
          return;
      case  'subsidy_change_status':
        this.panelSubsidariesReload&&typeof this.panelSubsidariesReload == 'function'&&this.panelSubsidariesReload(true)
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
      var data = result.data;
      console.log('get_my_school_info', data);

      this.setState({ schoolInfo: data })
      this.joinRoom(data._id);
    })
  }

  getParentInfo = () => {
    request.post('clients/get_parent_profile').then(result => {
      var data = result.data;
      console.log('get_parent_profile', data);

      this.setState({ parentInfo: data })
      this.joinRoom(data._id);
    })
  }

  loadDependent = () => {
    request.post('clients/get_child_profile').then(result => {
      var data = result.data;
      console.log('get_child_profile', data);
      for (var i = 0; i < data.length; i++) {
        this.joinRoom(data[i]._id);
      }
      this.setState({ listDependents: data })
    })
  }

  loadDependentForSchool = () =>{
    request.post('schools/get_my_dependents').then(result=>{
      if(result.success){
        this.setState({listDependents:result.data})
      }
        
    })
  }

  loadMyProviderInfo = ()=>{
    request.post('providers/get_my_provider_info').then(result=>{
        var data = result.data;
        console.log('get_my_provider_info',data);
    
        this.setState({providerInfo:data})
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
    };
    return (<ModalNewAppointmentForParents {...modalNewAppointProps} />);
    // <ModalNewAppointment {...modalNewAppointProps} />
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

  onCancelSubsidy = () => {

  }

  onCloseModalSubsidy = () => {
    this.setState({ visibleSubsidy: false });

  };
  onSubmitModalSubsidy = () => {
    this.setState({ visibleSubsidy: false });
    // 
  };

  openHierachyModal = (subsidy, callbackAfterChanged) => {
    this.setState({ visibleNewGroup: true });
    !!this.loadDataModalNewGroup&& this.loadDataModalNewGroup(subsidy, callbackAfterChanged);
  }

  onShowModalReferral = (subsidy , callbackForReload  ) => {
    this.setState({ visiblReferralService: true });
    if(callbackForReload == undefined){
      callbackForReload = this.panelAppoimentsReload;
    }
    !!this.loadDataModalReferral&&this.loadDataModalReferral(subsidy , callbackForReload);
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
        // calendarEvents: val.data
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
    const { calendarEvents } = this.state
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
    // store.dispatch(removeAppoint(data))
  }

  getMyAppointments() {
    var url = 'clients/get_my_appointments';
    if (this.state.userRole === 30) {
      url = 'providers/get_my_appointments'
    }

    request.post(url).then(result => {
      if (result.success) {
        var data = result.data;
        console.log(url, data, this.state.userRole);
        this.setState({ listAppoinmentsRecent: data.docs });
      } else {
        this.setState({ listAppoinmentsRecent: [] });
      }

    })

  }

  onCollapseChange = (v => {

    if (v.length > 0 && v[v.length - 1] == 6) {
      this.panelSubsidariesReload && this.panelSubsidariesReload();
    }
  })

  renderModalSubsidyDetail =()=>{
    const modalSubsidyProps = {
      visible: this.state.visibleSubsidy,
      onSubmit: this.onCloseModalSubsidy,
      onCancel: this.onCloseModalSubsidy,
    };
    return (<ModalSubsidyProgress {...modalSubsidyProps}
      setOpennedEvent={(reload) => { this.reloadModalSubsidyDetail = reload }}
      userRole={this.state.userRole}
      SkillSet={this.state.SkillSet}
      openReferral= {this.onShowModalReferral}
      openHierachy={this.openHierachyModal}
    />)
  }

  renderListAppoinmentsRecent = (appoinment, index) => {

    return (<div key={index} className={appoinment.status == -1 || appoinment.status == 2 ? 'item-feed done' : 'item-feed'}>
      <p className='font-700'>{appoinment.dependent.firstName} {appoinment.dependent.lastName}</p>
      {appoinment.provider!=undefined&&<p>{appoinment.provider.name||appoinment.provider.referredToAs}</p>}
      {appoinment.school!=undefined&&<p>{appoinment.school.name}</p>}
      <p>{appoinment.location}</p>
      <p>{moment(appoinment.date).format('hh:mm a')}</p>
      <p className='font-700 text-primary text-right' style={{ marginTop: '-10px' }}>{moment(appoinment.date).fromNow()}</p>
    </div>);
  }


  genExtraTime = () => (
    <BsClockHistory
      size={18}
      onClick={() => { }}
    />
  );
  genExtraFlag = () => (
    <Badge size="small" count={2}>
      <BsFillFlagFill
        size={18}
        onClick={() => { }}
      />
    </Badge>
  );

  renderPanelAppointmentForProvider = () => {
    const appointments = store.getState().appointments.dataAppointments
    if (this.state.userRole == 30 || this.state.userRole == 3)
      return (<Panel
        key="1"
        header={intl.formatMessage(messages.appointments)}
        extra={this.genExtraTime()}
        className='appointment-panel'
      >
        <PanelAppointment
          userRole={this.state.userRole}
          setReload={reload => {
            this.panelAppoimentsReload = reload;
          }}
        />
      </Panel>);
  }

  renderPanelSubsidaries = () => {
    return (
      <Panel
        header={<div className='flex flex-row justify-between'>
          <p className='mb-0'>{intl.formatMessage(messages.subsidaries)}</p>
          {this.state.userRole == 3 && <Button type='primary' size='small' onClick={this.onShowModalNewSubsidy}>
            {intl.formatMessage(messages.requestNewSubsidy).toUpperCase()}
          </Button>}
        </div>
        }
        key="6"
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

  render() {
    const {
      isFilter,
      visibleDetail,
      visibleDetailPost,
      visibleNewAppoint,
      visiblReferralService,
      isEventDetail,
      isMonth,
      isGridDayView,
      visibleNewSubsidy,
      visibleNewReview,
      visibleSubsidy,
      visibleNewGroup,
      visibleEvaluation
    } = this.state;

    const btnMonthToWeek = (
      <Button className='btn-type' onClick={this.handleMonthToWeek}>
        {isMonth ? intl.formatMessage(messages.month) : intl.formatMessage(messages.week)}
      </Button>
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
    const optionsSkillset = [
      {
        label: 'Kriah Tutoring' + '(46)',
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
      {
        label: intl.formatMessage(messages.homeworkTutoring),
        value: 'home_work',
      },
      {
        label: 'OT',
        value: 'OT',
      },
      {
        label: intl.formatMessage(messages.evaluations),
        value: 'evaluations2',
      },
      {
        label: intl.formatMessage(messages.screenings),
        value: 'screenings2',
      },
      {
        label: intl.formatMessage(messages.referrals),
        value: 'referrals2',
      },
    ];
    const modalNewAppointProps = {
      visible: visibleNewAppoint,
      onSubmit: this.onSubmitModalNewAppoint,
      onCancel: this.onCloseModalNewAppoint,
    };
    const modalSubsidyProps = {
      visible: visibleSubsidy,
      onSubmit: this.onSubmitModalSubsidy,
      onCancel: this.onCloseModalSubsidy,
    };
    const modalReferralServiceProps = {
      visible: visiblReferralService,
      onSubmit: this.onCloseModalReferral,
      onCancel: this.onCloseModalReferral,
    };
    const modalNewSubsidyProps = {
      visible: visibleNewSubsidy,
      onSubmit: this.onSubmitModalNewSubsidy,
      onCancel: this.onCloseModalNewSubsidy,
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
    const modalEvaluationProps = {
      visible: visibleEvaluation,
      onSubmit: this.onCloseModalEvaluation,
      onCancel: this.onCloseModalEvaluation,
    }
    return (
      <div className="full-layout page dashboard-page">
        {/* <div className='div-show-subsidy' onClick={this.onShowModalSubsidy} /> */}
        <div className='div-content'>
          <section className='div-activity-feed box-card'>
            <div className='div-title-feed text-center'>
              <p className='font-16 text-white mb-0'>{intl.formatMessage(messages.activityFeed)}</p>
            </div>
            <div className='div-list-feed'>
              {this.state.listAppoinmentsRecent.map((appoinment, index) => this.renderListAppoinmentsRecent(appoinment, index))}



            </div>
          </section>
          <section className='div-calendar box-card'>
            {isFilter && <div className='calendar-filter'>
              <CSSAnimate className="animated-shorter" type={isFilter ? 'fadeIn' : 'fadeOut'}>
                <Row gutter={10}>
                  <Col xs={12} sm={12} md={4}>
                    <p className='font-10 font-700 mb-5'>{intl.formatMessage(messages.eventType)}</p>
                    <Checkbox.Group options={optionsEvent} />
                  </Col>
                  <Col xs={12} sm={12} md={6} className='skillset-checkbox'>
                    <p className='font-10 font-700 mb-5'>{intl.formatMessage(messagesCreateAccount.skillsets)}</p>
                    <Checkbox.Group options={optionsSkillset} />
                  </Col>
                  <Col xs={12} sm={12} md={7} className='select-small'>
                    <p className='font-10 font-700 mb-5'>{intl.formatMessage(messagesCreateAccount.provider)}</p>
                    <Select placeholder={intl.formatMessage(messages.startTypingProvider)}>
                      <Select.Option value='1'>Dr. Rabinowitz </Select.Option>
                    </Select>
                    <div className='div-chip'>
                      {Array(3).fill(null).map((_, index) => <div key={index} className='chip'>Dr. Rabinowitz <BsX size={16} onClick={null} /></div>)}
                    </div>
                  </Col>
                  <Col xs={12} sm={12} md={7} className='select-small'>
                    <p className='font-10 font-700 mb-5'>{intl.formatMessage(messagesCreateAccount.location)}</p>
                    <Select placeholder={intl.formatMessage(messages.startTypingLocation)}>
                      <Select.Option value='1'>Rabinowitz office</Select.Option>
                    </Select>
                    <div className='div-chip'>
                      {Array(3).fill(null).map((_, index) => <div key={index} className='chip'>Rabinowitz office <BsX size={16} onClick={null} /></div>)}
                    </div>
                  </Col>
                </Row>
                <div className='text-right'>
                  <Button size='small' type='primary'>{intl.formatMessage(messages.apply).toUpperCase()}(10)</Button>
                </div>
              </CSSAnimate>
            </div>}
            {!isEventDetail && <><div className='calendar-content'>
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
                  week: {
                    titleFormat: { month: 'numeric', day: 'numeric' }
                  },
                }}
                customButtons={{
                  filterButton: {
                    text: btnFilter,
                  },
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
                // select={this.handleDateSelect}
                events={this.state.calendarEvents}
                // events={events}
                eventContent={renderEventContent}
                eventClick={this.handleEventClick}
                // eventAdd={this.handleEventAdd}
                eventChange={this.handleEventChange} // called for drag-n-drop/resize
                eventRemove={this.handleEventRemove}
              // ref={this.calendarComponentRef}
              />

            </div>
              <div className='btn-appointment'>
                <Dropdown overlay={menu} placement="topRight">
                  <Button
                    type='primary'
                    block
                    icon={<FaCalendarAlt size={19} />}
                  // onClick={this.onShowDrawerDetailPost}
                  >
                    {intl.formatMessage(messages.makeAppointment)}
                  </Button>
                </Dropdown>
              </div></>}
            {isEventDetail && <EventDetail backView={this.handleEventClick}
              id={this.state.idEvent}
              role={this.state.userRole}
              calendarEvents={this.state.calendarEvents}
            />}
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
                  </div>)}
              </Panel>
              <Panel header={intl.formatMessage(messages.screenings)} key="3">
                {new Array(10).fill(null).map((_, index) =>
                  <div key={index} className='list-item padding-item'>
                    <Avatar size={24} icon={<FaUser size={12} />} />
                    <div className='div-service'>
                      <p className='font-11 mb-0'>Service Type</p>
                      <p className='font-09 mb-0'>Provider Name</p>
                    </div>
                    <div className='text-center ml-auto mr-5'>
                      <p className='font-11 mb-0'>{intl.formatMessage(messages.phoneCall)}</p>
                      <p className='font-11 mb-0'>Phone number</p>
                    </div>
                    <div className='ml-auto'>
                      <p className='font-12 mb-0'>Time</p>
                      <p className='font-12 font-700 mb-0'>Date</p>
                    </div>
                  </div>)}
              </Panel>
              <Panel
                key="4"
                header={intl.formatMessage(messages.evaluations)}
                className='evaluations-panel'
              >
                <Tabs defaultActiveKey="1" type="card" size='small'>
                  <TabPane tab={intl.formatMessage(messages.upcoming)} key="1">
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
                  </TabPane>
                  <TabPane tab={intl.formatMessage(messages.past)} key="2">
                    <div className='list-item padding-item'>{intl.formatMessage(messages.past)}</div>
                  </TabPane>
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
        listDependents = {this.state.listDependents}
        setLoadData={reload=>{
          this.loadDataModalReferral = reload;
        }}
        userRole={this.state.userRole}
        
        />
        <ModalSeparateEvaluation {...modalEvaluationProps}/>
        <ModalNewSubsidyReview {...modalNewReviewProps}/>
      </div>
    );
  }
}
function reportNetworkError() {
  alert('This action could not be completed')
}
function renderEventContent(eventInfo) {
  return (
    <>
      <b className='mr-3'>{eventInfo.event.title}-{moment(eventInfo.event.start).format('hh:mm')}</b>
    </>
  )
}