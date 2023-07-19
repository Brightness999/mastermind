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
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';

import { ModalNewAppointmentForParents, ModalSubsidyProgress, ModalReferralService, ModalNewSubsidyRequest, ModalFlagExpand, ModalConfirm, ModalSessionsNeedToClose, ModalCreateNote, ModalPayment, ModalInvoice, ModalPay, ModalDateOptions, ModalSelectTime } from 'components/Modal';
import DrawerDetail from 'components/DrawerDetail';
import messages from '../messages';
import messagesCreateAccount from 'routes/Sign/CreateAccount/messages';
import msgModal from 'components/Modal/messages';
import msgDrawer from 'components/DrawerDetail/messages';
import { socketUrl } from 'utils/api/baseUrl';
import request, { decryptParam, encryptParam } from 'utils/api/request'
import { store } from 'src/redux/store';
import PanelAppointment from './PanelAppointment';
import PanelSubsidiaries from './PanelSubsidiaries';
import { setAcademicLevels, setCityConnections, setConsultants, setDependents, setDurations, setLocations, setMeetingLink, setProviders, setSkillSet, setUser } from 'src/redux/features/authSlice';
import { changeTime, getAppointmentsData, getAppointmentsMonthData, getInvoiceList, getSubsidyRequests, setInvoiceList, setAppointments, setAppointmentsInMonth } from 'src/redux/features/appointmentsSlice'
import { checkNotificationForClient, checkNotificationForConsultant, checkNotificationForProvider, clearFlag, closeNotification, getDefaultDataForAdmin, payInvoice, requestClearance, setBlackoutTimes, updateConsultantInfo, updateInvoice, updateMyProviderProfile } from 'utils/api/apiList';
import Subsidiaries from './school';
import PageLoading from 'components/Loading/PageLoading';
import { ACTIVE, APPOINTMENT, BALANCE, CANCELLED, CONSULTANT, CONSULTATION, DECLINED, EVALUATION, InvoiceType, MethodType, NOFLAG, NOSHOW, PARENT, PENDING, PROVIDER, RESCHEDULE, SCREEN, SUBSIDY } from 'routes/constant';
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
      visibleReferralService: false,
      visibleNewSubsidy: false,
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
      locations: [],
      selectedEvent: {},
      selectedEventTypes: [],
      intervalId: 0,
      selectedDate: undefined,
      visibleFlagExpand: false,
      visibleConfirm: false,
      confirmMessage: '',
      visibleSessionsNeedToClose: false,
      selectedDependentId: 0,
      visibleCreateNote: false,
      subsidyId: '',
      loading: false,
      visiblePayment: false,
      paymentDescription: '',
      selectedFlag: {},
      visibleInvoice: false,
      visiblePay: false,
      returnUrl: '',
      totalPayment: 0,
      minimumPayment: 0,
      paidAmount: 0,
      visibleDateOptions: false,
      visibleSelectTime: false,
    };
    this.calendarRef = React.createRef();
    this.scrollElement = React.createRef();
  }

  componentDidMount() {
    const { user, appointments, appointmentsInMonth, invoices } = this.props;
    this.setState({ loading: true });
    const params = new URLSearchParams(window.location.search);
    const success = decryptParam(params.get('s')?.replaceAll(' ', '+') || '');
    const invoiceId = decryptParam(params.get('i')?.replaceAll(' ', '+') || '');
    const appointmentId = decryptParam(params.get('a')?.replaceAll(' ', '+') || '');
    const cancellationType = decryptParam(params.get('t')?.replaceAll(' ', '+') || '');
    const amount = decryptParam(params.get('v')?.replaceAll(' ', '+') || '');
    if (success === 'true' && (invoiceId || appointmentId)) {
      request.post(payInvoice, { invoiceId, appointmentId, cancellationType, method: MethodType.PAYPAL, amount }).then(res => {
        if (res.success) {
          message.success('Paid successfully');
          const url = window.location.href;
          const cleanUrl = url.split('?')[0];
          window.history.replaceState({}, document.title, cleanUrl);
          if (invoiceId) {
            const newAppointments = JSON.parse(JSON.stringify(appointments))?.map(a => {
              const totalPaidAmount = (a.paidAmount || 0) + amount;
              if (a.sessionInvoice?._id === invoiceId) {
                a.sessionInvoice = {
                  ...a.sessionInvoice,
                  paidAmount: totalPaidAmount,
                  isPaid: totalPaidAmount >= a.totalPayment ? 1 : 0,
                  method: MethodType.PAYPAL,
                }
              }
              if (a.flagInvoice?._id === invoiceId) {
                a.flagInvoice = {
                  ...a.flagInvoice,
                  paidAmount: totalPaidAmount,
                  isPaid: a.type === 5 ? totalPaidAmount >= a.minimumPayment ? 1 : 0 : totalPaidAmount >= a.totalPayment ? 1 : 0,
                  method: MethodType.PAYPAL,
                }
              }
              return a;
            })
            const newAppointmentsInMonth = JSON.parse(JSON.stringify(appointmentsInMonth))?.map(a => {
              const totalPaidAmount = (a.paidAmount || 0) + amount;
              if (a.sessionInvoice?._id === invoiceId) {
                a.sessionInvoice = {
                  ...a.sessionInvoice,
                  paidAmount: totalPaidAmount,
                  isPaid: totalPaidAmount >= a.totalPayment ? 1 : 0,
                  method: MethodType.PAYPAL,
                }
              }
              if (a.flagInvoice?._id === invoiceId) {
                a.flagInvoice = {
                  ...a.flagInvoice,
                  paidAmount: totalPaidAmount,
                  isPaid: a.type === 5 ? totalPaidAmount >= a.minimumPayment ? 1 : 0 : totalPaidAmount >= a.totalPayment ? 1 : 0,
                  method: MethodType.PAYPAL,
                }
              }
              return a;
            })
            const newInvoices = JSON.parse(JSON.stringify(invoices))?.map(a => {
              const totalPaidAmount = (a.paidAmount || 0) + amount;
              if (a._id === invoiceId) {
                a.paidAmount = totalPaidAmount;
                a.isPaid = a.type === 5 ? totalPaidAmount >= a.minimumPayment ? 1 : 0 : totalPaidAmount >= a.totalPayment ? 1 : 0;
                a.method = MethodType.PAYPAL;
              }
              return a;
            })

            this.props.setAppointments(newAppointments);
            this.props.setAppointmentsInMonth(newAppointmentsInMonth);
            this.props.setInvoiceList(newInvoices);
          }
          if (appointmentId) {
            const newAppointments = JSON.parse(JSON.stringify(appointments))?.map(a => {
              if (a._id === appointmentId) {
                a.isCancellationFeePaid = 1;
              }
              return a;
            })
            const newAppointmentsInMonth = JSON.parse(JSON.stringify(appointmentsInMonth))?.map(a => {
              if (a._id === appointmentId) {
                a.isCancellationFeePaid = 1;
              }
              return a;
            })

            this.props.setAppointments(newAppointments);
            this.props.setAppointmentsInMonth(newAppointmentsInMonth);
          }
        } else {
          message.warning('Something went wrong. Please try again');
        }
      }).catch(err => {
        message.error(err.message);
      });
    }
    this.loadDefaultData();
    this.updateCalendarEvents(user.role);
    this.getMyAppointments(user.role);
    this.props.getSubsidyRequests({ role: user.role });
    this.props.getInvoiceList({ role: user.role });
    const notifications = setInterval(() => {
      if (user.role === PARENT) {
        request.post(checkNotificationForClient).then(res => {
          const { success, data } = res;
          if (success) {
            data?.forEach(appointment => {
              this.createNotification(appointment);
            })
          }
        })
      }
      if (user.role === PROVIDER) {
        request.post(checkNotificationForProvider).then(res => {
          const { success, data } = res;
          if (success) {
            data?.forEach(appointment => {
              this.createNotification(appointment);
            })
          }
        })
      }
      if (user.role === CONSULTANT) {
        request.post(checkNotificationForConsultant).then(res => {
          const { success, data } = res;
          if (success) {
            data?.forEach(appointment => {
              this.createNotification(appointment);
            })
          }
        })
      }
    }, 60000);
    this.setState({ intervalId: notifications });
    this.scriptLoaded();
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

  createNotification = (appointment) => {
    let duration = appointment.provider?.duration || 30;
    if (appointment.type === EVALUATION) {
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
        <p className='font-15 text-bold'>{appointment?.type === EVALUATION ? intl.formatMessage(msgModal.evaluation) : appointment?.type === APPOINTMENT ? intl.formatMessage(msgModal.standardSession) : appointment?.type === CONSULTATION ? intl.formatMessage(msgModal.consultation) : appointment?.type === SUBSIDY ? intl.formatMessage(msgModal.subsidizedSession) : ''}</p>
        <p className='font-15'><span className='text-bold'>{intl.formatMessage(msgDrawer.what)}: </span>{appointment?.skillSet?.name ?? ''}</p>
        <p className='font-15'><span className='text-bold'>{intl.formatMessage(msgDrawer.who)}: </span>{appointment?.dependent?.firstName ?? ''} {appointment?.dependent?.lastName ?? ''}</p>
        <p className='font-15 nobr'><span className='text-bold'>{intl.formatMessage(msgDrawer.when)}: </span>{moment(appointment?.date).format('MM/DD/YYYY hh:mm a')} - {moment(appointment?.date).clone().add(duration, 'minutes').format('hh:mm a')}</p>
        {appointment?.type === CONSULTATION ? appointment?.phoneNumber ? (
          <p className='font-15'>
            <span className='text-bold'>{intl.formatMessage(msgDrawer.phonenumber)}: </span>{appointment?.phoneNumber ?? ''}
          </p>
        ) : (
          <p className='font-15'>
            <span className='text-bold'>{intl.formatMessage(msgDrawer.meeting)}: </span>{appointment?.meetingLink ?? ''}
          </p>
        ) : (
          <p className='font-15'>
            <span className='text-bold'>{intl.formatMessage(msgDrawer.where)}: </span>{appointment?.location ?? ''}
          </p>
        )}
      </div>
    )
    notification.open({ message: '', description, btn, key, duration: 0, placement: 'top' });
  }

  displayTime = (value) => {
    return `${value?.split(' ')[0]?.split(':')[0]}:${value?.split(' ')[0]?.split(':')[1]} ${value?.split(' ')[1]}`;
  }

  handleCloseNotification = (id) => {
    request.post(closeNotification, { appointmentId: id });
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
        this.props.setCityConnections(data?.cityConnections ?? []);
      }
    }).catch(err => {
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
  }

  onShowFilter = () => {
    this.setState({ isFilter: !this.state.isFilter });
  }

  onShowDrawerDetail = (val) => {
    const { user } = this.props;
    const { userRole, listAppointmentsRecent } = this.state;
    const id = val?.event?.toPlainObject() ? val.event?.toPlainObject()?.extendedProps?._id : val;
    const selectedEvent = listAppointmentsRecent?.find(a => a._id == id);
    this.setState({ selectedEvent: selectedEvent });
    [3, 30, 100].includes(userRole) && this.setState({ userDrawerVisible: true });
    let data = {
      user: user?._id,
      action: "View",
    }
    switch (selectedEvent.type) {
      case SCREEN: data.description = "Viewed screening details"; break;
      case EVALUATION: data.description = "Viewed evaluation details"; break;
      case APPOINTMENT: data.description = "Viewed standard session details"; break;
      case CONSULTATION: data.description = "Viewed consultation details"; break;
      case SUBSIDY: data.description = "Viewed subsidized session details"; break;
      default: break;
    }
    this.socket.emit("action_tracking", data);
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

  onSubmitModalNewAppoint = (appointmentType) => {
    this.setState({ visibleNewAppoint: false });
    message.success({
      content: `${appointmentType === SCREEN ? 'Screening' : appointmentType === EVALUATION ? 'Evaluation' : appointmentType === APPOINTMENT ? 'Standard Session' : appointmentType === CONSULTATION ? 'Consultation' : appointmentType === SUBSIDY ? 'Subsidized Session' : ''} Scheduled`,
      className: 'popup-scheduled',
    });
  };

  onShowModalSubsidy = (subsidyId) => {
    this.setState({ visibleSubsidy: true, subsidyId: subsidyId });
  };

  onCloseModalSubsidy = () => {
    this.setState({ visibleSubsidy: false, subsidyId: '' });
  };

  onShowModalReferral = (subsidy, callbackForReload) => {
    if (!this.state.loading) {
      this.setState({ visibleReferralService: true });
      if (callbackForReload == undefined) {
        callbackForReload = this.panelAppoimentsReload;
      }
      !!this.loadDataModalReferral && this.loadDataModalReferral(subsidy, callbackForReload);
    }
  };

  onCloseModalReferral = () => {
    this.setState({ visibleReferralService: false });
  };

  onSubmitModalReferral = () => {
    this.setState({ visibleReferralService: false });
    message.success({
      content: 'Consultation Scheduled',
      className: 'popup-scheduled',
    });
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

  handleEventChange = (changeInfo) => {
    const obj = changeInfo.event.toPlainObject();
    const event = obj.extendedProps;
    const { userRole } = this.state;
    const { user } = this.props;

    const data = {
      role: userRole,
      data: {
        _id: event._id,
        date: new Date(obj.start),
        consultant: (event.type === CONSULTATION && userRole === CONSULTANT) ? user?.consultantInfo?._id : undefined,
      }
    }
    this.props.changeTime(data)
  }

  handleClickDate = (data) => {
    const { user } = this.props;
    const blackoutDates = user?.providerInfo?.blackoutDates || user?.consultantInfo?.blackoutDates;
    if (data.date < new Date()) {
      return;
    } else if (user?.role === PROVIDER && data.date.getDay() === 6) {
      return;
    } else {
      if (user?.role === PARENT) {
        this.setState({ visibleNewAppoint: true, selectedDate: moment(data.date) });
      } else {
        if ((user?.role === PROVIDER || user?.role === CONSULTANT) && blackoutDates?.find(date => moment(date).year() === data.date.getFullYear() && moment(date).month() === data.date.getMonth() && moment(date).date() === data.date.getDate())) {
          this.setState({ visibleSelectTime: true, selectedDate: data.date });
        } else {
          this.setState({ visibleDateOptions: true, selectedDate: data.date });
        }
      }
    }
  }

  handleEventDrop = (data) => {
    const event = data.oldEvent.extendedProps;
    const date = data.oldEvent.start;
    const { user } = this.props;

    if (moment(data.event.start).isBefore(moment())) {
      data.revert();
    } else {
      if ([EVALUATION, APPOINTMENT, SUBSIDY].includes(event.type) && user.role === PARENT && moment(date).subtract(event.provider?.cancellationWindow, 'h').isBefore(moment()) && event.provider?.cancellationFee && !event.isCancellationFeePaid) {
        data.revert();
        const desc = <span>A fee <span className='text-bold'>${event.provider.cancellationFee}</span> must be paid to reschedule.</span>
        this.setState({ paymentDescription: desc, selectedEvent: event }, () => {
          message.warn(desc, 2).then(() => {
            this.setState({ visiblePayment: true });
          });
        });
      } else {
        if (event.type === CONSULTATION && !event.consultant) {
          data.revert();
          message.warning('You have to claim the consultation request to reschedule.');
        } else {
          this.handleEventChange(data);
        }
      }
    }
  }

  onCloseModalPayment = () => {
    this.setState({ visiblePayment: false, selectedEvent: {} });
  }

  async getMyAppointments(userRole, dependentId) {
    this.props.getAppointmentsData({ role: userRole, dependentId: dependentId });
  }

  onCollapseChange = (v => {
    if (v.length > 0 && v[v.length - 1] == 6) {
      this.panelSubsidiariesReload && this.panelSubsidiariesReload();
    }
  })

  renderListAppoinmentsRecent = (appointment, index) => {
    const type = appointment?.type;
    const status = appointment?.status;
    const eventType = type === SCREEN ? 'Screening' : type === EVALUATION ? 'Evaluation' : type === CONSULTATION ? 'Consultation' : 'Session';

    return (
      <div key={index} className={`text-white item-feed ${status != PENDING ? 'line-through' : ''} bg-${status == PENDING ? 'active' : eventType.toLowerCase()}`} onClick={() => this.onShowDrawerDetail(appointment?._id)}>
        <p className='font-700'>{appointment.dependent?.firstName ?? ''} {appointment.dependent?.lastName ?? ''} {status == CANCELLED ? 'Cancelled' : ''}</p>
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

  renderPanelAppointmentForProvider = () => (
    <Panel
      key="1"
      header={intl.formatMessage(messages.appointments)}
      extra={this.state.userRole > 3 && (<BsClockHistory size={18} className="cursor" onClick={() => this.onOpenModalSessionsNeedToClose()} />)}
      className='appointment-panel'
      collapsible='header'
    >
      <PanelAppointment
        onShowDrawerDetail={this.onShowDrawerDetail}
        socket={this.socket}
      />
    </Panel>
  )

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
    const { user } = this.props;
    const { selectedSkills, selectedProviders, SkillSet, selectedLocations, selectedEventTypes, isMonth } = this.state;
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
    if (isMonth) {
      this.setState({ calendarEvents: appointmentsInMonth?.payload ?? [] });
    } else {
      let newEvents = [];
      const startDate = calendar._calendarApi.view.activeStart;
      const blackoutDates = user?.providerInfo?.blackoutDates || user?.consultantInfo?.blackoutDates;
      const blackoutTimes = user?.providerInfo?.blackoutTimes || user?.consultantInfo?.blackoutTimes;

      for (let k = 0; k < 7; k++) {
        const manualSchedule = user?.providerInfo?.manualSchedule || user?.consultantInfo?.manualSchedule;
        const newDate = moment(startDate.toString()).clone().add(k * 1, 'days');
        if (!((user?.role === PROVIDER || user?.role === CONSULTANT) && blackoutDates?.find(date => moment(date).year() === newDate.year() && moment(date).month() === newDate.month() && moment(date).date() === newDate.date()))) {
          const ranges = manualSchedule?.filter(a => a.dayInWeek == k && newDate.isBetween(moment().set({ years: a.fromYear, months: a.fromMonth, dates: a.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }), moment().set({ years: a.toYear, months: a.toMonth, dates: a.toDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 0 })));
          if (!!ranges?.length) {
            const additionalTime = blackoutTimes?.find(t => t.year === newDate.year() && t.month === newDate.month() && t.date === newDate.date());

            let timeArr = ranges.map(a => ([a.openHour, a.closeHour]))?.sort((a, b) => a[0] > b[0] ? 1 : -1)?.reduce((a, b) => {
              if (!a?.length) a.push(b);
              else if (a?.find(c => (c[0] <= b[0] && c[1] >= b[0]) || (c[0] <= b[1] && c[1] >= b[1]))) {
                a = a.map(c => {
                  if ((c[0] <= b[0] && c[1] >= b[0]) || (c[0] <= b[1] && c[1] >= b[1])) {
                    return [Math.min(...c, ...b), Math.max(...c, ...b)];
                  } else {
                    return c;
                  }
                })
              } else {
                a.push(b);
              }
              return a;
            }, []);

            let result = [];
            let newTimeArr = [];
            timeArr?.forEach((range, i) => {
              if (i === 0) {
                if (range[0] != 0) {
                  newTimeArr.push([0, range[0]]);
                }
              } else {
                newTimeArr.push([timeArr[i - 1][1], range[0]]);
              }
              if (i === timeArr?.length - 1) {
                newTimeArr.push([range[1], 24]);
              }
            })
            if (additionalTime) {
              newTimeArr = [...newTimeArr, [additionalTime.openHour, additionalTime.closeHour]].sort((a, b) => a[0] > b[0] ? 1 : -1)?.reduce((a, b) => {
                if (!a?.length) {
                  a.push(b);
                } else if (a?.find(c => (c[0] <= b[0] && c[1] >= b[0]) || (c[0] <= b[1] && c[1] >= b[1]))) {
                  a = a.map(c => {
                    if ((c[0] <= b[0] && c[1] >= b[0]) || (c[0] <= b[1] && c[1] >= b[1])) {
                      return [Math.min(...c, ...b), Math.max(...c, ...b)];
                    } else {
                      return c;
                    }
                  })
                } else {
                  a.push(b);
                }
                return a;
              }, []);
            }
            newTimeArr?.forEach((range) => {
              result.push({
                title: 'disable-time',
                start: newDate.clone().hour(range[0]).toISOString(),
                end: newDate.clone().hour(range[1]).toISOString(),
                className: 'disable-time',
              })
            })
            newEvents.push(...result);
          } else {
            newEvents.push({
              title: 'disable-time',
              start: newDate.set({ hours: 0 }).toISOString(),
              end: newDate.set({ hours: 24 }).toISOString(),
              className: 'disable-time',
            })
          }
        }
      }
      this.setState({ calendarEvents: [...(appointmentsInMonth?.payload ?? []), ...newEvents] })
    }
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
    const { user } = this.props;
    this.setState({ visibleFlagExpand: true });
    this.socket.emit("action_tracking", {
      user: user?._id,
      action: "Flag",
      description: "Viewed flags",
    })
  }

  onCloseModalFlagExpand = () => {
    this.setState({ visibleFlagExpand: false });
  }

  handleRequestClearance = (requestMessage) => {
    const { selectedFlag } = this.state;
    this.onCloseModalCreateNote();
    message.success("Your request has been submitted. Please allow up to 24 hours for the provider to review this.");

    request.post(requestClearance, { invoiceId: selectedFlag?._id, message: requestMessage }).catch(err => {
      message.error(err.message);
    })
  }

  handleClearFlag = () => {
    const { selectedFlag, userRole } = this.state;
    this.onCloseModalConfirm();
    request.post(clearFlag, { invoiceId: selectedFlag?._id }).then(result => {
      const { success } = result;
      if (success) {
        message.success('Cleared successfully');
        this.props.getInvoiceList({ role: userRole });
      }
    })
  }

  onCloseModalConfirm = () => {
    this.setState({ visibleConfirm: false, selectedFlag: {} });
  }

  onOpenModalConfirm = (invoice) => {
    this.setState({
      visibleConfirm: true,
      confirmMessage: 'Are you sure to clear this flag?',
      selectedFlag: invoice,
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

  onOpenModalCreateNote = (invoice) => {
    this.setState({ visibleCreateNote: true, selectedFlag: invoice });
  }

  onCloseModalCreateNote = () => {
    this.setState({ visibleCreateNote: false, selectedFlag: {} });
  }

  openModalInvoice = (invoice) => {
    const { user } = this.props;
    this.setState({ visibleInvoice: true, selectedFlag: invoice });
    this.socket.emit("action_tracking", {
      user: user?._id,
      action: "Invoice",
      description: "Viewed invoice"
    })
  }

  closeModalInvoice = () => {
    this.setState({ visibleInvoice: false, selectedFlag: {} });
  }

  handleUpdateInvoice = (items) => {
    const { invoices } = this.props;
    const { selectedFlag } = this.state;
    const { totalPayment, minimumPayment } = items;
    this.closeModalInvoice();
    if (selectedFlag?._id) {
      let postData = {
        invoiceId: selectedFlag._id,
        totalPayment: totalPayment,
        minimumPayment: minimumPayment,
      }

      if ([InvoiceType.BALANCE, InvoiceType.CANCEL, InvoiceType.RESCHEDULE].includes(selectedFlag.type)) {
        postData = {
          ...postData,
          updateData: [{
            appointment: selectedFlag.data?.[0]?.appointment?._id,
            items: items?.items,
          }]
        }
      }

      if (selectedFlag.type === InvoiceType.NOSHOW || selectedFlag.type === InvoiceType.BALANCE) {
        postData = {
          ...postData,
          updateData: [{
            appointment: selectedFlag.data?.[0]?.appointment?._id,
            items: {
              ...selectedFlag.data?.[0]?.items,
              data: items.items,
            }
          }]
        }
      }

      request.post(updateInvoice, postData).then(result => {
        if (result.success) {
          message.success('Successfully updated!');
          const newInvoices = JSON.parse(JSON.stringify(invoices))?.map(invoice => {
            if (invoice?._id === selectedFlag._id) {
              if ([InvoiceType.BALANCE, InvoiceType.CANCEL, InvoiceType.RESCHEDULE].includes(selectedFlag.type)) {
                invoice.totalPayment = totalPayment;
                invoice.data = [{
                  appointment: selectedFlag.data?.[0]?.appointment,
                  items: items?.items,
                }];
              } else if (selectedFlag.type === InvoiceType.NOSHOW || selectedFlag.type === InvoiceType.BALANCE) {
                invoice.totalPayment = totalPayment;
                invoice.minimumPayment = minimumPayment;
                invoice.data = [{
                  appointment: selectedFlag.data?.[0]?.appointment,
                  items: {
                    ...selectedFlag.data?.[0]?.items,
                    data: items?.items,
                  },
                }];
              }
            }
            return invoice;
          });
          this.props.setInvoiceList(newInvoices);
        } else {
          message.warning('Something went wrong. Please try again or contact admin.');
        }
      }).catch(error => {
        message.warning('Something went wrong. Please try again or contact admin.');
      })
    }
  }

  handleChangeReferralTab = (v) => {
    const { user } = this.props;
    let data = {
      user: user?._id,
      action: "View",
    }
    switch (v) {
      case '1': data.description = "Viewed upcoming consultations"; break;
      case '2': data.description = "Viewed past consultations"; break;
      default: break;
    }
    this.socket.emit("action_tracking", data);
  }

  handleChangeScreeningTab = (v) => {
    const { user } = this.props;
    let data = {
      user: user?._id,
      action: "View",
    }
    switch (v) {
      case '1': data.description = "Viewed upcoming screenings"; break;
      case '2': data.description = "Viewed past screenings"; break;
      default: break;
    }
    this.socket.emit("action_tracking", data);
  }

  handleChangeEvaluationTab = (v) => {
    const { user } = this.props;
    let data = {
      user: user?._id,
      action: "View",
    }
    switch (v) {
      case '1': data.description = "Viewed upcoming evaluations"; break;
      case '2': data.description = "Viewed past evaluations"; break;
      default: break;
    }
    this.socket.emit("action_tracking", data);
  }

  handleChangeFlagTab = (v) => {
    const { user } = this.props;
    let data = {
      user: user?._id,
      action: "View",
    }
    switch (v) {
      case '1': data.description = "Viewed active flags"; break;
      case '2': data.description = "Viewed cleared flags"; break;
      default: break;
    }
    this.socket.emit("action_tracking", data);
  }

  openModalPay = (url, paidAmount, totalPayment, minimumPayment = 0) => {
    this.setState({ visiblePay: true, returnUrl: url, totalPayment, minimumPayment, paidAmount });
  }

  closeModalPay = () => {
    this.setState({ visiblePay: false, returnUrl: '', totalPayment: 0, minimumPayment: 0, paidAmount: 0 });
  }

  closeModalDateOptions = () => {
    this.setState({ visibleDateOptions: false, selectedDate: undefined });
  }

  submitModalDateOptions = (data) => {
    this.setState({ visibleDateOptions: false });
    if (data.option === 'appointment') {
      this.setState({ visibleNewAppoint: true });
      return;
    }
    if (data.option === 'datetime') {
      this.setState({ visibleSelectTime: true });
      return;
    }
  }

  addBlackoutDate = () => {
    const { selectedDate } = this.state;
    const { user } = this.props;

    if (selectedDate) {
      if (user.role === PROVIDER) {
        request.post(updateMyProviderProfile, {
          _id: user.providerInfo?._id,
          blackoutDates: [...(user.providerInfo.blackoutDates || []), selectedDate?.toString()],
          blackoutTimes: user.providerInfo.blackoutTimes?.filter(t => !(t?.year === selectedDate.getFullYear() && t?.month === selectedDate.getMonth() && t?.date === selectedDate.getDate()))
        }).then(res => {
          this.closeModalSelectTime();
          const { success, data } = res;
          if (success) {
            let newUser = { ...user, providerInfo: data };
            this.props.setUser(newUser);
          }
        }).catch(() => {
          message.error('Something went wrong. Please try again.');
          this.closeModalSelectTime();
        })
        return;
      }

      if (user.role === CONSULTANT) {
        request.post(updateConsultantInfo, {
          _id: user.consultantInfo?._id,
          blackoutDates: [...(user.consultantInfo.blackoutDates || []), selectedDate?.toString()],
          blackoutTimes: user.consultantInfo.blackoutTimes?.filter(t => !(t?.year === selectedDate.getFullYear() && t?.month === selectedDate.getMonth() && t?.date === selectedDate.getDate()))
        }).then(res => {
          this.closeModalSelectTime();
          const { success, data } = res;
          if (success) {
            let newUser = { ...user, consultantInfo: data };
            this.props.setUser(newUser);
          }
        }).catch(() => {
          message.error('Something went wrong. Please try again.');
          this.closeModalSelectTime();
        })
        return;
      }
    }
  }

  closeModalSelectTime = () => {
    this.setState({ visibleSelectTime: false });
  }

  submitModalSelectTime = (data) => {
    if (data.isFullDay) {
      this.addBlackoutDate();
      return;
    }

    const { selectedDate } = this.state;
    const { user } = this.props;
    const blackoutDates = user?.providerInfo?.blackoutDates || user?.consultantInfo?.blackoutDates;

    if (!selectedDate) {
      message.warn("Please select date.");
      return;
    }

    let blackoutTime = {
      year: selectedDate.getFullYear(),
      month: selectedDate.getMonth(),
      date: selectedDate.getDate(),
    }
    if (data.from_time) {
      blackoutTime.openHour = data.from_time.hours();
      blackoutTime.openMin = data.from_time.minutes();
    } else {
      blackoutTime.openHour = 0;
      blackoutTime.openMin = 0;
    }

    if (data.to_time) {
      blackoutTime.closeHour = data.to_time.hours();
      blackoutTime.closeMin = data.to_time.minutes();
    } else {
      blackoutTime.closeHour = 23;
      blackoutTime.closeMin = 59;
    }

    if (!data.from_time && !data.to_time) {
      blackoutTime.isRemove = true;
    }

    const newBlackoutDates = blackoutDates?.filter(d => !(moment(d).year() === selectedDate.getFullYear() && moment(d).month() === selectedDate.getMonth() && moment(d).date() === selectedDate.getDate()));

    request.post(setBlackoutTimes, { blackoutTime, blackoutDates: newBlackoutDates }).then(res => {
      this.closeModalSelectTime();
      const { success, data } = res;
      if (success) {
        if (user.role === PROVIDER) {
          let newUser = { ...user, providerInfo: data };
          this.props.setUser(newUser);
          return;
        }
        if (user.role === CONSULTANT) {
          let newUser = { ...user, consultantInfo: data };
          this.props.setUser(newUser);
          return;
        }
      }
    }).catch(() => {
      this.closeModalSelectTime();
      message.error('Something went wrong. Please try again.');
    })
  }

  render() {
    const {
      isFilter,
      userDrawerVisible,
      visibleReferralService,
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
      visiblePayment,
      paymentDescription,
      visibleInvoice,
      selectedFlag,
      visiblePay,
      returnUrl,
      totalPayment,
      minimumPayment,
      paidAmount,
      visibleDateOptions,
      visibleSelectTime,
    } = this.state;
    const { invoices, user } = this.props;

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
      <div onClick={this.onShowFilter}>
        {userRole != 100 && (
          <p className='font-15 flex items-center'>{intl.formatMessage(messages.filterOptions)} {isFilter ? <BsX size={30} /> : <BsFilter size={25} />}</p>
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
      visible: visibleReferralService,
      onSubmit: this.onSubmitModalReferral,
      onCancel: this.onCloseModalReferral,
      setLoadData: reload => this.loadDataModalReferral = reload,
    };

    const modalNewAppointProps = {
      visible: visibleNewAppoint,
      onSubmit: this.onSubmitModalNewAppoint,
      onCancel: this.onCloseModalNewAppoint,
      selectedDate: selectedDate,
    };

    const drawerDetailProps = {
      visible: userDrawerVisible,
      onClose: this.onCloseDrawerDetail,
      event: listAppointmentsRecent?.find(a => a._id == selectedEvent?._id),
      listAppointmentsRecent: listAppointmentsRecent,
      calendar: this.calendarRef,
      socket: this.socket,
    };

    const modalFlagExpandProps = {
      visible: visibleFlagExpand,
      onSubmit: this.onCloseModalFlagExpand,
      onCancel: this.onCloseModalFlagExpand,
      flags: invoices?.filter(invoice => [InvoiceType.NOSHOW, InvoiceType.BALANCE].includes(invoice.type)),
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
      onSubmit: this.handleClearFlag,
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

    const modalPaymentProps = {
      visible: visiblePayment,
      onSubmit: this.onCloseModalPayment,
      onCancel: this.onCloseModalPayment,
      description: paymentDescription,
      appointment: selectedEvent,
      cancellationType: RESCHEDULE,
    }

    const modalInvoiceProps = {
      visible: visibleInvoice,
      onSubmit: this.handleUpdateInvoice,
      onCancel: this.closeModalInvoice,
      invoice: selectedFlag,
    }

    const modalPayProps = {
      visible: visiblePay,
      onSubmit: this.openModalPay,
      onCancel: this.closeModalPay,
      returnUrl, totalPayment, minimumPayment, paidAmount,
    }

    const modalDateOptionsprops = {
      visible: visibleDateOptions,
      onSubmit: this.submitModalDateOptions,
      onCancel: this.closeModalDateOptions,
    }

    const modalSelectTimeProps = {
      visible: visibleSelectTime,
      onSubmit: this.submitModalSelectTime,
      onCancel: this.closeModalSelectTime,
      selectedDate,
    }

    if (userRole == 60) {
      return <Subsidiaries socket={this.socket} subsidyId={subsidyId} />
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
                <div className='div-trans flex flex-row my-10'>
                  <Avatar size={36} className='trans-all' onClick={() => this.handleClickAllDependent()}>All</Avatar>
                  <Button
                    type='text'
                    className='trans-left' icon={<BiChevronLeft size={35} />}
                    onClick={() => this.scrollTrans(-42)}
                  />
                  <div className='trans-scroll' onWheel={(e) => { this.scrollElement.current.scrollLeft += e.deltaY / 2 }} ref={this.scrollElement}>
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
                <div className={`btn-appointment ${userRole === CONSULTANT && 'd-none'}`}>
                  <Button
                    type='primary'
                    block
                    icon={<FaCalendarAlt size={19} />}
                    onClick={() => (userRole === PARENT || userRole == PROVIDER) && this.onShowModalNewAppoint()}
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
                      <p className='font-16 font-700 mb-5'>{intl.formatMessage(messagesCreateAccount.services)}</p>
                      <Checkbox.Group options={SkillSet.map(skill => skill.name)} value={selectedSkills} onChange={v => this.handleSelectSkills(v)} />
                    </Col>
                    {userRole != PROVIDER && (
                      <Col xs={12} sm={12} md={6} className='select-small'>
                        <p className='font-16 font-700 mb-5'>{intl.formatMessage(messagesCreateAccount.provider)}</p>
                        <Select
                          showSearch
                          mode='multiple'
                          allowClear={true}
                          value={selectedProviders}
                          placeholder={intl.formatMessage(messages.startTypingProvider)}
                          optionFilterProp='children'
                          filterOption={(input, option) => option.children.join('').toLowerCase().includes(input.toLowerCase())}
                          onChange={(v) => this.setState({ selectedProviders: v })}
                        >
                          {listProvider?.map((provider, i) => (
                            <Select.Option key={i} value={provider._id}>{provider.firstName ?? ''} {provider.lastName ?? ''}</Select.Option>
                          ))}
                        </Select>
                      </Col>
                    )}
                    <Col xs={12} sm={12} md={6} className='select-small'>
                      <p className='font-16 font-700 mb-5'>{intl.formatMessage(messagesCreateAccount.location)}</p>
                      <Select
                        showSearch
                        mode='multiple'
                        allowClear={true}
                        value={selectedLocations}
                        placeholder={intl.formatMessage(messages.startTypingLocation)}
                        optionFilterProp='children'
                        filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                        onChange={(v) => this.setState({ selectedLocations: v })}
                      >
                        {locations?.map((location, i) => (
                          <Select.Option key={i} value={location}>{location}</Select.Option>
                        ))}
                      </Select>
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
                  selectable={false}
                  selectMirror={true}
                  dayMaxEvents={true}
                  weekends={calendarWeekends}
                  events={calendarEvents}
                  eventContent={(info) => renderEventContent(info, listAppointmentsRecent)}
                  eventClick={data => data.event.title !== 'disable-time' && this.onShowDrawerDetail(data)}
                  dateClick={this.handleClickDate}
                  eventResize={(info) => info.revert()}
                  eventDrop={this.handleEventDrop}
                  height="calc(100vh - 165px)"
                  dayCellClassNames={(data) => {
                    const blackoutDates = user?.providerInfo?.blackoutDates || user?.consultantInfo?.blackoutDates;
                    if ((userRole === PROVIDER || userRole === CONSULTANT) && blackoutDates?.find(date => moment(date).year() === data.date.getFullYear() && moment(date).month() === data.date.getMonth() && moment(date).date() === data.date.getDate())) {
                      return 'disable-date';
                    }
                    if (userRole === PROVIDER && data.dow === 6) {
                      return 'unavailable-date';
                    }
                    if (data.date < Date.now()) {
                      return 'unavailable-date';
                    }
                  }}
                  dayCellDidMount={data => {
                    if (!data.dayNumberText && data.dow === 0 && data.el.className.includes('timegrid')) {
                      let newEvents = [];
                      const startDate = data.date;
                      const blackoutDates = user?.providerInfo?.blackoutDates || user?.consultantInfo?.blackoutDates;
                      const blackoutTimes = user?.providerInfo?.blackoutTimes || user?.consultantInfo?.blackoutTimes;

                      for (let k = 0; k < 7; k++) {
                        const manualSchedule = user?.providerInfo?.manualSchedule || user?.consultantInfo?.manualSchedule;
                        const newDate = moment(startDate.toString()).clone().add(k * 1, 'days');
                        if (!((userRole === PROVIDER || userRole === CONSULTANT) && blackoutDates?.find(date => moment(date).year() === newDate.year() && moment(date).month() === newDate.month() && moment(date).date() === newDate.date()))) {
                          const ranges = manualSchedule?.filter(a => a.dayInWeek == k && newDate.isBetween(moment().set({ years: a.fromYear, months: a.fromMonth, dates: a.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }), moment().set({ years: a.toYear, months: a.toMonth, dates: a.toDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 0 })));

                          if (!!ranges?.length) {
                            const additionalTime = blackoutTimes?.find(t => t.year === newDate.year() && t.month === newDate.month() && t.date === newDate.date());
                            let timeArr = ranges.map(a => ([a.openHour, a.closeHour]))?.sort((a, b) => a[0] > b[0] ? 1 : -1)?.reduce((a, b) => {
                              if (!a?.length) {
                                a.push(b);
                              } else if (a?.find(c => (c[0] <= b[0] && c[1] >= b[0]) || (c[0] <= b[1] && c[1] >= b[1]))) {
                                a = a.map(c => {
                                  if ((c[0] <= b[0] && c[1] >= b[0]) || (c[0] <= b[1] && c[1] >= b[1])) {
                                    return [Math.min(...c, ...b), Math.max(...c, ...b)];
                                  } else {
                                    return c;
                                  }
                                })
                              } else {
                                a.push(b);
                              }
                              return a;
                            }, []);

                            let result = [];
                            let newTimeArr = [];
                            timeArr?.forEach((range, i) => {
                              if (i === 0) {
                                if (range[0] != 0) {
                                  newTimeArr.push([0, range[0]]);
                                }
                              } else {
                                newTimeArr.push([timeArr[i - 1][1], range[0]]);
                              }
                              if (i === timeArr?.length - 1) {
                                newTimeArr.push([range[1], 24]);
                              }
                            })
                            if (additionalTime) {
                              newTimeArr = [...newTimeArr, [additionalTime.openHour, additionalTime.closeHour]].sort((a, b) => a[0] > b[0] ? 1 : -1)?.reduce((a, b) => {
                                if (!a?.length) {
                                  a.push(b);
                                } else if (a?.find(c => (c[0] <= b[0] && c[1] >= b[0]) || (c[0] <= b[1] && c[1] >= b[1]))) {
                                  a = a.map(c => {
                                    if ((c[0] <= b[0] && c[1] >= b[0]) || (c[0] <= b[1] && c[1] >= b[1])) {
                                      return [Math.min(...c, ...b), Math.max(...c, ...b)];
                                    } else {
                                      return c;
                                    }
                                  })
                                } else {
                                  a.push(b);
                                }
                                return a;
                              }, []);
                            }
                            newTimeArr?.forEach((range) => {
                              result.push({
                                title: 'disable-time',
                                start: newDate.clone().hour(range[0]).toISOString(),
                                end: newDate.clone().hour(range[1]).toISOString(),
                                className: 'disable-time',
                              })
                            })
                            newEvents.push(...result);
                          } else {
                            newEvents.push({
                              title: 'disable-time',
                              start: newDate.clone().set({ hours: 0 }).toISOString(),
                              end: newDate.clone().set({ hours: 24 }).toISOString(),
                              className: 'disable-time',
                            })
                          }
                        }
                      }
                      this.setState({ calendarEvents: [...calendarEvents, ...newEvents] })
                    }

                    if (data.dayNumberText === '1' && data.el.className.includes('daygrid')) {
                      this.setState({ calendarEvents: calendarEvents?.filter(a => a.title != 'disable-time') });
                    }
                  }}
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
                      <Tabs defaultActiveKey="1" type="card" size='small' onChange={this.handleChangeReferralTab}>
                        <Tabs.TabPane tab={intl.formatMessage(messages.upcoming)} key="1">
                          {listAppointmentsRecent?.filter(a => a.type === CONSULTATION && a.status === PENDING && a.flagStatus != ACTIVE)?.map((appointment, index) =>
                            <div key={index} className={`list-item padding-item gap-2 ${[DECLINED, CANCELLED].includes(appointment.status) ? 'line-through' : ''}`} onClick={() => this.onShowDrawerDetail(appointment._id)}>
                              <Avatar size={24} icon={<FaUser size={12} />} />
                              <div className='flex justify-between items-center flex-1'>
                                <div className='flex-1'>
                                  <div className='font-11'>{appointment.skillSet?.name}</div>
                                  <div className='font-09'>{appointment?.referrer?.name}</div>
                                </div>
                                <div className='flex-1'>
                                  <div className='font-11'>{appointment?.meetingLink ? intl.formatMessage(msgDrawer.meeting) : intl.formatMessage(messages.phoneCall)}</div>
                                  <div className='font-11'>{appointment.phoneNumber}</div>
                                </div>
                                <div className='flex-1'>
                                  <div className='font-12'>{moment(appointment.date).format('hh:mm a')}</div>
                                  <div className='font-12 font-700'>{moment(appointment.date).format('MM/DD/YYYY')}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Tabs.TabPane>
                        <Tabs.TabPane tab={intl.formatMessage(messages.past)} key="2">
                          {listAppointmentsRecent?.filter(a => a.type === CONSULTATION && a.status !== PENDING && a.flagStatus !== ACTIVE)?.map((appointment, index) =>
                            <div key={index} className={`list-item padding-item gap-2 ${[DECLINED, CANCELLED].includes(appointment.status) ? 'line-through' : ''}`} onClick={() => this.onShowDrawerDetail(appointment._id)}>
                              <Avatar size={24} icon={<FaUser size={12} />} />
                              <div className='flex justify-between items-center flex-1'>
                                <div className='flex-1'>
                                  <div className='font-11'>{appointment.skillSet?.name}</div>
                                  <div className='font-09'>{appointment?.referrer?.name}</div>
                                </div>
                                <div className='flex-1'>
                                  <div className='font-11'>{intl.formatMessage(messages.phoneCall)}</div>
                                  <div className='font-11'>{appointment.phoneNumber}</div>
                                </div>
                                <div className='flex-1'>
                                  <div className='font-12'>{moment(appointment.date).format('hh:mm a')}</div>
                                  <div className='font-12 font-700'>{moment(appointment.date).format('MM/DD/YYYY')}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Tabs.TabPane>
                      </Tabs>
                    </Panel>
                  )}
                  <Panel header={intl.formatMessage(messages.screenings)} key="3">
                    <Tabs defaultActiveKey="1" type="card" size='small' onChange={this.handleChangeScreeningTab}>
                      <Tabs.TabPane tab={intl.formatMessage(messages.upcoming)} key="1">
                        {listAppointmentsRecent?.filter(a => a.type === SCREEN && a.status === PENDING && a.flagStatus !== ACTIVE)?.map((appointment, index) =>
                          <div key={index} className={`list-item padding-item gap-2 ${[DECLINED, CANCELLED].includes(appointment.status) ? 'line-through' : ''}`} onClick={() => this.onShowDrawerDetail(appointment._id)}>
                            <Avatar size={24} icon={<FaUser size={12} />} />
                            <div className='flex justify-between items-center flex-1'>
                              <div className='flex-1'>
                                <div className='font-11'>{appointment.skillSet?.name}</div>
                                <div className='font-09'>{userRole === PROVIDER ? `${appointment.dependent?.firstName ?? ''} ${appointment.dependent?.lastName ?? ''}` : `${appointment.provider?.firstName ?? ''} ${appointment.provider?.lastName ?? ''}`}</div>
                              </div>
                              <div className='flex-1'>
                                <div className='font-11'>{intl.formatMessage(messages.phoneCall)}</div>
                                <div className='font-11'>{appointment.phoneNumber}</div>
                              </div>
                              <div className='flex-1'>
                                <div className='font-12'>{appointment.screeningTime ?? ''}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Tabs.TabPane>
                      <Tabs.TabPane tab={intl.formatMessage(messages.past)} key="2">
                        {listAppointmentsRecent?.filter(a => a.type === SCREEN && a.status !== PENDING && a.flagStatus !== ACTIVE)?.map((appointment, index) =>
                          <div key={index} className={`list-item padding-item gap-2 ${[DECLINED, CANCELLED].includes(appointment.status) ? 'line-through' : ''}`} onClick={() => this.onShowDrawerDetail(appointment._id)}>
                            <Avatar size={24} icon={<FaUser size={12} />} />
                            <div className='flex justify-between items-center flex-1'>
                              <div className='flex-1'>
                                <div className='font-11'>{appointment.skillSet?.name}</div>
                                <div className='font-09'>{userRole === PROVIDER ? `${appointment.dependent?.firstName ?? ''} ${appointment.dependent?.lastName ?? ''}` : `${appointment.provider?.firstName ?? ''} ${appointment.provider?.lastName ?? ''}`}</div>
                              </div>
                              <div className='flex-1'>
                                <div className='font-11'>{intl.formatMessage(messages.phoneCall)}</div>
                                <div className='font-11'>{appointment.phoneNumber}</div>
                              </div>
                              <div className='flex-1'>
                                <div className='font-12'>{appointment.screeningTime ?? ''}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Tabs.TabPane>
                    </Tabs>
                  </Panel>
                  <Panel header={intl.formatMessage(messages.evaluations)} key="4" >
                    <Tabs defaultActiveKey="1" type="card" size='small' onChange={this.handleChangeEvaluationTab}>
                      <Tabs.TabPane tab={intl.formatMessage(messages.upcoming)} key="1">
                        {listAppointmentsRecent?.filter(a => a.type === EVALUATION && a.status === PENDING && a.flagStatus !== ACTIVE)?.map((appointment, index) =>
                          <div key={index} className={`list-item padding-item gap-2 ${[DECLINED, CANCELLED].includes(appointment.status) ? 'line-through' : ''}`} onClick={() => this.onShowDrawerDetail(appointment._id)}>
                            <Avatar size={24} icon={<FaUser size={12} />} />
                            <div className='flex justify-between items-center flex-1'>
                              <div className='flex-1'>
                                <div className='font-11'>{`${appointment.dependent?.firstName ?? ''} ${appointment.dependent?.lastName ?? ''}`}</div>
                                <div className='font-09'>{`${appointment.provider?.firstName ?? ''} ${appointment.provider?.lastName ?? ''}`}</div>
                              </div>
                              <div className='flex-1'>
                                <div className='font-11'>{appointment.skillSet?.name}</div>
                                <div className='font-09'>{appointment.location}</div>
                              </div>
                              <div className='flex-1'>
                                <div className='font-12'>{moment(appointment.date).format("hh:mm a")}</div>
                                <div className='font-12 font-700'>{moment(appointment.date).format('MM/DD/YYYY')}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Tabs.TabPane>
                      <Tabs.TabPane tab={intl.formatMessage(messages.past)} key="2">
                        {listAppointmentsRecent?.filter(a => a.type === EVALUATION && a.status !== PENDING && a.flagStatus !== ACTIVE)?.map((appointment, index) =>
                          <div key={index} className={`list-item padding-item gap-2 ${[DECLINED, CANCELLED].includes(appointment.status) ? 'line-through' : ''}`} onClick={() => this.onShowDrawerDetail(appointment._id)}>
                            <Avatar size={24} icon={<FaUser size={12} />} />
                            <div className='flex justify-between items-center flex-1'>
                              <div className='flex-1'>
                                <div className='font-11'>{`${appointment.dependent?.firstName ?? ''} ${appointment.dependent?.lastName ?? ''}`}</div>
                                <div className='font-09'>{`${appointment.provider?.firstName ?? ''} ${appointment.provider?.lastName ?? ''}`}</div>
                              </div>
                              <div className='flex-1'>
                                <div className='font-11'>{appointment.skillSet?.name}</div>
                                <div className='font-09'>{appointment.location}</div>
                              </div>
                              <div className='flex-1'>
                                <div className='font-12'>{moment(appointment.date).format("hh:mm a")}</div>
                                <div className='font-12 font-700'>{moment(appointment.date).format('MM/DD/YYYY')}</div>
                              </div>
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
                        <BiExpand size={18} className="cursor" onClick={this.onOpenModalFlagExpand} />
                        <Badge size="small" count={invoices?.filter(a => [4, 5].includes(a.type) && !a?.isPaid)?.length}>
                          <BsFillFlagFill size={18} />
                        </Badge>
                      </div>
                    }
                    collapsible='header'
                  >
                    <Tabs defaultActiveKey="1" type="card" size='small' onChange={this.handleChangeFlagTab}>
                      <Tabs.TabPane tab={intl.formatMessage(messages.upcoming)} key="1">
                        {invoices?.filter(a => [4, 5].includes(a.type) && !a.isPaid)?.map((invoice, index) =>
                          <div key={index} className='list-item padding-item gap-2' onClick={(e) => e.target.id != 'action' && this.openModalInvoice(invoice)}>
                            <Avatar size={24} icon={<FaUser size={12} />} />
                            <div className='flex justify-between items-center flex-1 gap-1'>
                              <div className='flex-1'>
                                <div className='font-11 mb-0'>{invoice.dependent?.firstName ?? ''} {invoice.dependent?.lastName ?? ''}</div>
                                <div className='font-09 mb-0'>{invoice.provider?.firstName ?? ''} {invoice.provider?.lastName ?? ''}</div>
                              </div>
                              {userRole === PARENT ? (
                                <>
                                  <div className='font-11 flex-1'>{invoice?.type === InvoiceType.BALANCE ? 'Past Due Balance' : invoice?.type === InvoiceType.NOSHOW ? 'No Show' : ''}</div>
                                  <div className='flex-1 flex flex-col gap-2'>
                                    <div className='font-11 text-primary cursor whitespace-nowrap' id='action' onClick={() => this.onOpenModalCreateNote(invoice)}>{intl.formatMessage(msgDrawer.requestClearance)}</div>
                                    {invoice?.isPaid ? 'Paid' : invoice?.totalPayment == 0 ? null : (
                                      <div id='action' className='font-11 flag-action pay-flag-button text-center' onClick={() => this.openModalPay(`${window.location.href}?s=${encryptParam('true')}&i=${encryptParam(invoice?._id)}`, invoice?.paidAmount, invoice?.totalPayment, invoice?.minimumPayment)}>
                                        {intl.formatMessage(msgDrawer.payFlag)}
                                      </div>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className='font-11 flex-1'>{invoice?.type === InvoiceType.BALANCE ? 'Past Due Balance' : invoice?.type === InvoiceType.NOSHOW ? 'No Show' : ''}</div>
                                  <span className='font-11 text-primary cursor flex-1' id='action' onClick={() => this.onOpenModalConfirm(invoice)}>{intl.formatMessage(msgDrawer.clearFlag)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </Tabs.TabPane>
                      <Tabs.TabPane tab={intl.formatMessage(messages.past)} key="2">
                        {invoices?.filter(a => [4, 5].includes(a.type) && a.isPaid)?.map((invoice, index) =>
                          <div key={index} className='list-item padding-item gap-2' onClick={() => this.openModalInvoice(invoice)}>
                            <Avatar size={24} icon={<FaUser size={12} />} />
                            <div className='flex justify-between items-center flex-1 gap-1'>
                              <div className='flex-1'>
                                <div className='font-11'>{invoice.dependent?.firstName ?? ''} {invoice.dependent?.lastName ?? ''}</div>
                                <div className='font-11'>{invoice.provider?.firstName ?? ''} {invoice.provider?.lastName ?? ''}</div>
                              </div>
                              <div className='font-11'>{invoice?.type === InvoiceType.BALANCE ? 'Past Due Balance' : invoice?.type === InvoiceType.NOSHOW ? 'No Show' : ''}</div>
                              <div className='flex-1'>
                                <div className='font-12'>{moment(invoice.updatedAt).format("hh:mm a")}</div>
                                <div className='font-12 font-700'>{moment(invoice.updatedAt).format('MM/DD/YYYY')}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Tabs.TabPane>
                    </Tabs>
                  </Panel>
                  {(userRole === PARENT) ? (
                    <Panel
                      key="6"
                      header={intl.formatMessage(messages.subsidiaries)}
                      extra={(
                        <div className='flex flex-row justify-between'>
                          {userRole === PARENT && (
                            <Button type='primary' size='small' onClick={this.onShowModalNewSubsidy}>
                              {intl.formatMessage(messages.requestNewSubsidy).toUpperCase()}
                            </Button>
                          )}
                        </div>
                      )}
                      className='subsidiaries-panel'
                      collapsible='header'
                    >
                      <PanelSubsidiaries onShowModalSubsidyDetail={this.onShowModalSubsidy} socket={this.socket} />
                    </Panel>
                  ) : null}
                </Collapse>
              </section>
            )}
          </div>
          {[PARENT, CONSULTANT].includes(userRole) ? <img src='../images/call.png' alt='hand-up-call' className='btn-call' width="6%" onClick={this.onShowModalReferral} /> : null}
          {userDrawerVisible && <DrawerDetail {...drawerDetailProps} />}
          {visibleNewAppoint && <ModalNewAppointmentForParents {...modalNewAppointProps} />}
          {visibleFlagExpand && <ModalFlagExpand {...modalFlagExpandProps} />}
          {visibleSubsidy && <ModalSubsidyProgress {...modalSubsidyProps} />}
          {visibleNewSubsidy && <ModalNewSubsidyRequest {...modalNewSubsidyProps} />}
          {visibleReferralService && <ModalReferralService {...modalReferralServiceProps} />}
          {visibleConfirm && <ModalConfirm {...modalConfirmProps} />}
          {visibleSessionsNeedToClose && <ModalSessionsNeedToClose {...modalSessionsNeedToCloseProps} />}
          {visibleCreateNote && <ModalCreateNote {...modalCreateNoteProps} />}
          {visiblePayment && <ModalPayment {...modalPaymentProps} />}
          {visibleInvoice && <ModalInvoice {...modalInvoiceProps} />}
          {visiblePay && <ModalPay {...modalPayProps} />}
          {visibleDateOptions && <ModalDateOptions {...modalDateOptionsprops} />}
          {visibleSelectTime && <ModalSelectTime {...modalSelectTimeProps} />}
          <PageLoading loading={loading} isBackground={true} />
        </div>
      );
    }
  }
}

function renderEventContent(eventInfo, appointments) {
  const { user } = store.getState().auth;
  const event = eventInfo.event.extendedProps;
  const type = event?.type;
  const status = event?.status;
  const eventType = type === SCREEN ? 'Screening' : type === EVALUATION ? 'Evaluation' : type === CONSULTATION ? 'Consultation' : 'Session';

  if (eventInfo.event.title === 'disable-time') {
    return null;
  } else {
    return (
      <div style={{ height: '100%' }} className={`flex flex-col p-3 relative rounded-2 relative text-white bg-${[DECLINED, CANCELLED, NOSHOW].includes(status) ? 'cancelled' : eventType.toLowerCase()}`}>
        <div className="flex flex-col">
          <div className={`text-bold flex items-center ${[DECLINED, CANCELLED, NOSHOW].includes(status) && 'text-cancelled'}`} title={event?.skillSet?.name}>{[DECLINED, CANCELLED, NOSHOW].includes(status) && <GoPrimitiveDot className={`text-${eventType.toLowerCase()}`} size={16} />}<div className='text-ellipsis'>{event?.skillSet?.name}</div></div>
          <div className='text-ellipsis' title={moment(eventInfo.event.start).format('hh:mm a')}>{moment(eventInfo.event.start).format('hh:mm a')}</div>
          <div className='text-ellipsis' title={`Dependent: ${event?.dependent?.firstName ?? ''} ${event?.dependent?.lastName ?? ''}`}>Dependent: {`${event?.dependent?.firstName ?? ''} ${event?.dependent?.lastName ?? ''}`}</div>
          {(user.role === PROVIDER || user.role === CONSULTANT) ? null : <div className='text-ellipsis' title={`${eventType} with ${eventInfo.event.title}`}>{eventType} with {eventInfo.event.title}</div>}
        </div>
        {type === CONSULTATION ? event?.consultant ? <AiFillStar color="#ffff00" size={20} className="flag-icons" /> : <AiOutlineStar color="#ffff00" size={20} className="flag-icons" /> : null}
        {type === SUBSIDY && <FaHandHoldingUsd size={20} className='text-green500 mr-5' />}
        {event?.flagStatus === ACTIVE && event?.flagType === BALANCE && <MdOutlineRequestQuote color="#ff0000" size={20} className="flag-icons" />}
        {status === PENDING && event?.flagStatus === NOFLAG && appointments?.find(a => a.dependent?._id === event?.dependent?._id && a.provider?._id === event?.provider?._id && a.flagStatus === ACTIVE)?.flagType === BALANCE && <MdOutlineRequestQuote color="#ff0000" size={20} className="flag-icons" />}
        {event?.flagStatus === ACTIVE && event?.flagType === NOSHOW && <MdOutlineEventBusy color="#ff0000" size={20} className="flag-icons" />}
        {status === PENDING && event?.flagStatus === NOFLAG && appointments?.find(a => a.dependent?._id === event?.dependent?._id && a.provider?._id === event?.provider?._id && a.flagStatus === ACTIVE)?.flagType === NOSHOW && <MdOutlineEventBusy color="#ff0000" size={20} className="flag-icons" />}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  appointments: state.appointments.dataAppointments,
  appointmentsInMonth: state.appointments.dataAppointmentsMonth,
  invoices: state.appointments.dataInvoices,
  user: state.auth.user,
})

export default compose(connect(mapStateToProps, { setAcademicLevels, setCityConnections, setConsultants, setDependents, setDurations, setLocations, setMeetingLink, setProviders, setSkillSet, changeTime, getAppointmentsData, getAppointmentsMonthData, getSubsidyRequests, getInvoiceList, setInvoiceList, setAppointments, setAppointmentsInMonth, setUser }))(Dashboard);
