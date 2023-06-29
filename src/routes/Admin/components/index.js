import React from 'react';
import { Button, Segmented, Row, Col, Checkbox, Select, message, Divider, Collapse, Tabs, Avatar, Badge, Modal } from 'antd';
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
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';

import { ModalSubsidyProgress, ModalReferralService, ModalNewSubsidyRequest, ModalNewAppointment, ModalSessionsNeedToClose, ModalFlagExpand, ModalConfirm, ModalCreateNote, ModalCancelForAdmin, ModalInvoice, ModalPay } from 'components/Modal';
import DrawerDetail from 'components/DrawerDetail';
import messages from 'src/routes/Dashboard/messages';
import msgCreateAccount from 'src/routes/Sign/CreateAccount/messages';
import msgSidebar from 'components/SideBar/messages';
import msgDrawer from 'components/DrawerDetail/messages';
import { socketUrl } from 'utils/api/baseUrl';
import request, { decryptParam, encryptParam } from 'utils/api/request'
import { changeTime, getAppointmentsData, getAppointmentsMonthData, getSubsidyRequests, setAppointments, setAppointmentsInMonth, getInvoiceList, setInvoiceList } from 'src/redux/features/appointmentsSlice'
import { setAcademicLevels, setDependents, setDurations, setMeetingLink, setProviders, setSkillSet, setConsultants, setSchools } from 'src/redux/features/authSlice';
import { clearFlag, getDefaultDataForAdmin, payInvoice, requestClearance, sendEmailInvoice, updateInvoice } from 'utils/api/apiList';
import PanelAppointment from './PanelAppointment';
import PanelSubsidiaries from './PanelSubsidiaries';
import PageLoading from 'components/Loading/PageLoading';
import { ACTIVE, APPOINTMENT, BALANCE, CANCELLED, CONSULTANT, CONSULTATION, DECLINED, EVALUATION, InvoiceType, NOFLAG, NOSHOW, PENDING, PROVIDER, RESCHEDULE, SCREEN, SUBSIDY } from 'routes/constant';
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
      visibleCancelForAdmin: false,
      dragInfo: {},
      visibleInvoice: false,
      selectedFlag: {},
      visiblePay: false,
      returnUrl: '',
    };
    this.calendarRef = React.createRef();
    this.scrollElement = React.createRef();
  }

  componentDidMount() {
    const { auth, appointments, appointmentsInMonth, invoices } = this.props;
    this.setState({ loading: true });
    const params = new URLSearchParams(window.location.search);
    const success = decryptParam(params.get('s')?.replaceAll(' ', '+') || '');
    const invoiceId = decryptParam(params.get('i')?.replaceAll(' ', '+') || '');
    const appointmentId = decryptParam(params.get('a')?.replaceAll(' ', '+') || '');
    if (success === 'true' && (invoiceId || appointmentId)) {
      request.post(payInvoice, { invoiceId, appointmentId }).then(res => {
        if (res.success) {
          message.success('Paid successfully');
          const url = window.location.href;
          const cleanUrl = url.split('?')[0];
          window.history.replaceState({}, document.title, cleanUrl);
          if (invoiceId) {
            const newAppointments = JSON.parse(JSON.stringify(appointments))?.map(a => {
              if (a.sessionInvoice?._id === invoiceId) {
                a.sessionInvoice = { ...a.sessionInvoice, isPaid: 1 }
              }
              if (a.flagInvoice?._id === invoiceId) {
                a.flagInvoice = { ...a.flagInvoice, isPaid: 1 }
              }
              return a;
            })
            const newAppointmentsInMonth = JSON.parse(JSON.stringify(appointmentsInMonth))?.map(a => {
              if (a.sessionInvoice?._id === invoiceId) {
                a.sessionInvoice = { ...a.sessionInvoice, isPaid: 1 }
              }
              if (a.flagInvoice?._id === invoiceId) {
                a.flagInvoice = { ...a.flagInvoice, isPaid: 1 }
              }
              return a;
            })
            const newInvoices = JSON.parse(JSON.stringify(invoices))?.map(a => {
              if (a._id === invoiceId) {
                a.isPaid = 1;
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
    this.updateCalendarEvents(auth?.user?.role);
    this.getMyAppointments(auth?.user?.role);
    this.props.getSubsidyRequests({ role: auth?.user?.role });
    this.props.getInvoiceList({ role: auth?.user?.role });
    this.loadDefaultData();
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
    this.socket.on('socket_result', data => {
      console.log('socket result: ', data.key);
      if (data.key === 'meeting_link') {
        this.props.setMeetingLink(data.data);
      }
    })
  }

  onShowFilter = () => {
    this.setState({ isFilter: !this.state.isFilter });
  }

  onShowDrawerDetail = (val) => {
    const { user } = this.props.auth;
    const { listAppointmentsRecent } = this.state;
    const id = val?.event?.toPlainObject() ? val.event?.toPlainObject()?.extendedProps?._id : val;
    const selectedEvent = listAppointmentsRecent?.find(a => a._id == id);
    this.setState({ selectedEvent: selectedEvent, userDrawerVisible: true });
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
      this.setState({ visiblReferralService: true });
      if (callbackForReload == undefined) {
        callbackForReload = this.panelAppoimentsReload;
      }
      !!this.loadDataModalReferral && this.loadDataModalReferral(subsidy, callbackForReload);
    }
  };

  onCloseModalReferral = () => {
    this.setState({ visiblReferralService: false });
  };

  onSubmitModalReferral = () => {
    this.setState({ visiblReferralService: false });
    message.success({
      content: 'Consultation Scheduled',
      className: 'popup-scheduled',
    });
  };

  onShowModalNewSubsidy = () => {
    this.setState({ visibleNewSubsidy: true });
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

  handleEventChange = async (changeInfo) => {
    const obj = changeInfo.event.toPlainObject();
    const data = {
      role: this.state.userRole,
      data: {
        _id: obj.extendedProps._id,
        date: new Date(obj.start),
      }
    }
    await this.props.changeTime(data)
    this.updateCalendarEvents(this.state.userRole);
    this.getMyAppointments(this.state.userRole);
  }

  handleClickDate = (date) => {
    this.setState({ visibleNewAppoint: true, selectedDate: moment(date.date) });
  }

  handleEventDragStop = (data) => {
    const event = data.oldEvent.extendedProps;
    const date = data.oldEvent.start;

    if (moment(data.event.start).isBefore(moment())) {
      data.revert();
    } else {
      if ([EVALUATION, APPOINTMENT, SUBSIDY].includes(event.type) && moment(date).subtract(event.provider?.cancellationWindow, 'h').isBefore(moment()) && event.provider?.cancellationFee && !event.isCancellationFeePaid) {
        data.revert();
        const desc = <span>A fee <span className='text-bold'>${event.provider.cancellationFee}</span> must be paid to reschedule.</span>
        message.warn(desc);
        this.setState({ visibleCancelForAdmin: true, selectedEvent: event, dragInfo: data });
      } else {
        this.handleEventChange(data);
      }
    }
  }

  onCloseModalCancelForAdmin = () => {
    this.setState({ visibleCancelForAdmin: false });
  }

  applyFeeToParent = () => {
    const { selectedEvent, dragInfo } = this.state;
    this.onCloseModalCancelForAdmin();
    this.handleEventChange(dragInfo);
    this.setState({ selectedEvent: {}, dragInfo: {} });

    const postData = {
      appointmentId: selectedEvent._id,
      type: RESCHEDULE,
      items: [{
        type: 'Fee',
        date: moment(selectedEvent.date).format('MM/DD/YYYY hh:mm a'),
        details: `${RESCHEDULE} Appointment`,
        rate: selectedEvent.provider.cancellationFee,
      }],
      totalPayment: selectedEvent.provider.cancellationFee || 0,
    }
    request.post(sendEmailInvoice, postData).then(res => {
      if (res.success) {
        message.success('Sent an invoice to parent successfully.');
      } else {
        message.error('Something went wrong while sending an invoice.');
      }
    }).catch(() => {
      message.error('Something went wrong while sending an invoice.');
    })
  }

  waiveFee = () => {
    const { dragInfo } = this.state;
    this.onCloseModalCancelForAdmin();
    this.handleEventChange(dragInfo);
    this.setState({ selectedEvent: {}, dragInfo: {} });
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
    const { user } = this.props.auth;
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

  handleRequestClearance = () => {
    const { selectedFlag } = this.state;
    this.closeFlagAction();
    this.onCloseModalCreateNote();
    request.post(requestClearance, { invoiceId: selectedFlag?._id }).then(result => {
      const { success } = result;
      if (success) {
        message.success('Sent successfully');
      }
    })
  }

  handleClearFlag = () => {
    this.onCloseModalConfirm();
    this.closeFlagAction();
    const { selectedFlag, userRole } = this.state;
    request.post(clearFlag, { invoiceId: selectedFlag?._id }).then(result => {
      const { success } = result;
      if (success) {
        message.success('Cleared successfully');
        this.props.getInvoiceList({ role: userRole });
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

  renderPanelAppointmentForProvider = () => (
    <Panel
      key="1"
      header={intl.formatMessage(messages.appointments)}
      extra={(<BsClockHistory size={18} className="cursor" onClick={() => this.onOpenModalSessionsNeedToClose()} />)}
      className='appointment-panel'
      collapsible='header'
    >
      <PanelAppointment
        onShowDrawerDetail={this.onShowDrawerDetail}
        socket={this.socket}
      />
    </Panel>
  );

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

  openFlagAction = (invoice) => {
    this.setState({ selectedFlag: invoice, visibleFlagAction: true });
  }

  closeFlagAction = () => {
    this.setState({ visibleFlagAction: false, selectedFlag: {} });
  }

  openModalInvoice = (invoice) => {
    const { user } = this.props.auth;
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
    const { user } = this.props.auth;
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
    const { user } = this.props.auth;
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
    const { user } = this.props.auth;
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
    const { user } = this.props.auth;
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

  openModalPay = (url) => {
    this.setState({ visiblePay: true, returnUrl: url });
  }

  closeModalPay = () => {
    this.setState({ visiblePay: false, returnUrl: '' });
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
      visibleCancelForAdmin,
      selectedFlag,
      visibleInvoice,
      visiblePay,
      returnUrl,
    } = this.state;
    const { invoices } = this.props;

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
        {userRole != CONSULTANT && (
          <p className='font-15 inline-flex items-center'>{intl.formatMessage(messages.filterOptions)} {isFilter ? <BsX size={30} /> : <BsFilter size={25} />}</p>
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
      socket: this.socket,
    };

    const modalFlagExpandProps = {
      visible: visibleFlagExpand,
      onSubmit: this.onCloseModalFlagExpand,
      onCancel: this.onCloseModalFlagExpand,
      flags: invoices?.filter(invoice => [InvoiceType.BALANCE, InvoiceType.NOSHOW].includes(invoice.type)),
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
    }

    const modalCreateNoteProps = {
      visible: visibleCreateNote,
      onSubmit: this.handleRequestClearance,
      onCancel: this.onCloseModalCreateNote,
      title: "Request Message"
    };

    const modalCancelForAdminProps = {
      visible: visibleCancelForAdmin,
      onSubmit: this.waiveFee,
      applyFeeToParent: this.applyFeeToParent,
      onCancel: this.onCloseModalCancelForAdmin,
    };

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
      returnUrl,
    }

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
                    <p className='font-16 font-700 mb-5'>{intl.formatMessage(msgCreateAccount.services)}</p>
                    <Checkbox.Group options={SkillSet.map(skill => skill.name)} value={selectedSkills} onChange={v => this.handleSelectSkills(v)} />
                  </Col>
                  <Col xs={12} sm={12} md={6} className='select-small'>
                    <p className='font-16 font-700 mb-5'>{intl.formatMessage(msgCreateAccount.provider)}</p>
                    <Select
                      showSearch
                      mode='multiple'
                      allowClear={true}
                      value={selectedProviders}
                      placeholder={intl.formatMessage(messages.startTypingProvider)}
                      optionFilterProp='children'
                      filterOption={(input, option) => option.children?.join('').toLowerCase().includes(input.toLowerCase())}
                      onChange={(v) => this.setState({ selectedProviders: v })}
                    >
                      {listProvider?.map((provider, i) => (
                        <Select.Option key={i} value={provider._id}>{provider.firstName ?? ''} {provider.lastName ?? ''}</Select.Option>
                      ))}
                    </Select>
                  </Col>
                  <Col xs={12} sm={12} md={6} className='select-small'>
                    <p className='font-16 font-700 mb-5'>{intl.formatMessage(msgCreateAccount.location)}</p>
                    <Select
                      showSearch
                      mode='multiple'
                      allowClear={true}
                      value={selectedLocations}
                      placeholder={intl.formatMessage(messages.startTypingLocation)}
                      optionFilterProp='children'
                      filterOption={(input, option) => option.children?.toLowerCase().includes(input.toLowerCase())}
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
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                weekends={calendarWeekends}
                events={calendarEvents}
                eventContent={(info) => renderEventContent(info, listAppointmentsRecent)}
                eventClick={this.onShowDrawerDetail}
                dateClick={this.handleClickDate}
                eventResize={(info) => info.revert()}
                eventDrop={this.handleEventDragStop}
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
                <Tabs defaultActiveKey="1" type="card" size='small' onChange={this.handleChangeReferralTab}>
                  <Tabs.TabPane tab={intl.formatMessage(messages.upcoming)} key="1">
                    {listAppointmentsRecent?.filter(a => a.type === CONSULTATION && a.status === PENDING)?.map((appointment, index) =>
                      <div key={index} className={`list-item padding-item ${[DECLINED, CANCELLED, NOSHOW].includes(appointment.status) ? 'line-through' : ''}`} onClick={() => this.onShowDrawerDetail(appointment._id)}>
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
                    {listAppointmentsRecent?.filter(a => a.type === CONSULTATION && a.status !== PENDING)?.map((appointment, index) =>
                      <div key={index} className={`list-item padding-item ${[DECLINED, CANCELLED, NOSHOW].includes(appointment.status) ? 'line-through' : ''}`} onClick={() => this.onShowDrawerDetail(appointment._id)}>
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
                <Tabs defaultActiveKey="1" type="card" size='small' onChange={this.handleChangeScreeningTab}>
                  <Tabs.TabPane tab={intl.formatMessage(messages.upcoming)} key="1">
                    {listAppointmentsRecent?.filter(a => a.type === SCREEN && a.status === PENDING)?.map((appointment, index) =>
                      <div key={index} className={`list-item padding-item ${[DECLINED, CANCELLED, NOSHOW].includes(appointment.status) ? 'line-through' : ''}`} onClick={() => this.onShowDrawerDetail(appointment._id)}>
                        <Avatar size={24} icon={<FaUser size={12} />} />
                        <div className='div-service flex-1'>
                          <p className='font-11 mb-0'>{appointment.skillSet?.name}</p>
                          <p className='font-09 mb-0'>{userRole === PROVIDER ? `${appointment.dependent?.firstName ?? ''} ${appointment.dependent?.lastName ?? ''}` : `${appointment.provider?.firstName ?? ''} ${appointment.provider?.lastName ?? ''}`}</p>
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
                    {listAppointmentsRecent?.filter(a => a.type === SCREEN && a.status !== PENDING)?.map((appointment, index) =>
                      <div key={index} className={`list-item padding-item ${[DECLINED, CANCELLED, NOSHOW].includes(appointment.status) ? 'line-through' : ''}`} onClick={() => this.onShowDrawerDetail(appointment._id)}>
                        <Avatar size={24} icon={<FaUser size={12} />} />
                        <div className='div-service flex-1'>
                          <p className='font-11 mb-0'>{appointment.skillSet?.name}</p>
                          <p className='font-09 mb-0'>{userRole === PROVIDER ? `${appointment.dependent?.firstName ?? ''} ${appointment.dependent?.lastName ?? ''}` : `${appointment.provider?.firstName ?? ''} ${appointment.provider?.lastName ?? ''}`}</p>
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
                <Tabs defaultActiveKey="1" type="card" size='small' onChange={this.handleChangeEvaluationTab}>
                  <Tabs.TabPane tab={intl.formatMessage(messages.upcoming)} key="1">
                    {listAppointmentsRecent?.filter(a => a.type === EVALUATION && a.status === PENDING && a.flagStatus !== ACTIVE)?.map((appointment, index) =>
                      <div key={index} className={`list-item padding-item ${[DECLINED, CANCELLED, NOSHOW].includes(appointment.status) ? 'line-through' : ''}`} onClick={() => this.onShowDrawerDetail(appointment._id)}>
                        <Avatar size={24} icon={<FaUser size={12} />} />
                        <div className='div-service'>
                          <p className='font-11 mb-0'>{appointment.skillSet?.name}</p>
                          <p className='font-09 mb-0'>{userRole === PROVIDER ? `${appointment.dependent?.firstName ?? ''} ${appointment.dependent?.lastName ?? ''}` : `${appointment.provider?.firstName ?? ''} ${appointment.provider?.lastName ?? ''}`}</p>
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
                    {listAppointmentsRecent?.filter(a => a.type === EVALUATION && a.status !== PENDING && a.flagStatus !== ACTIVE)?.map((appointment, index) =>
                      <div key={index} className={`list-item padding-item ${[DECLINED, CANCELLED, NOSHOW].includes(appointment.status) ? 'line-through' : ''}`} onClick={() => this.onShowDrawerDetail(appointment._id)}>
                        <Avatar size={24} icon={<FaUser size={12} />} />
                        <div className='div-service'>
                          <p className='font-11 mb-0'>{appointment.skillSet?.name}</p>
                          <p className='font-09 mb-0'>{userRole === PROVIDER ? `${appointment.dependent?.firstName ?? ''} ${appointment.dependent?.lastName ?? ''}` : `${appointment.provider?.firstName ?? ''} ${appointment.provider?.lastName ?? ''}`}</p>
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
                    <BiExpand size={18} className="cursor" onClick={this.onOpenModalFlagExpand} />
                    <Badge size="small" count={invoices?.filter(a => [4, 5].includes(a.type) && !a.isPaid)?.length}>
                      <BsFillFlagFill size={18} />
                    </Badge>
                  </div>
                )}
                collapsible="header"
              >
                <Tabs defaultActiveKey="1" type="card" size='small' onChange={this.handleChangeFlagTab}>
                  <Tabs.TabPane tab={intl.formatMessage(messages.upcoming)} key="1">
                    {invoices?.filter(a => [4, 5].includes(a.type) && !a.isPaid)?.map((invoice, index) =>
                      <div key={index} className='list-item padding-item justify-between' onClick={(e) => e.target.id != 'action' && this.openModalInvoice(invoice)}>
                        <Avatar size={24} icon={<FaUser size={12} />} />
                        <div className='div-service'>
                          <p className='font-12 mb-0'>{invoice.dependent?.firstName ?? ''} {invoice.dependent?.lastName ?? ''}</p>
                          <p className='font-12 mb-0'>{invoice.provider?.firstName ?? ''} {invoice.provider?.lastName ?? ''}</p>
                        </div>
                        <div className='font-12'>{invoice?.type === InvoiceType.BALANCE ? 'Past Due Balance' : invoice?.type === InvoiceType.NOSHOW ? 'No Show' : ''}</div>
                        <span className='font-12 text-primary cursor' id='action' onClick={() => this.openFlagAction(invoice)}>{intl.formatMessage(messages.action)}</span>
                      </div>
                    )}
                  </Tabs.TabPane>
                  <Tabs.TabPane tab={intl.formatMessage(messages.past)} key="2">
                    {invoices?.filter(a => [4, 5].includes(a.type) && a.isPaid)?.map((invoice, index) =>
                      <div key={index} className='list-item padding-item justify-between' onClick={() => this.openModalInvoice(invoice)}>
                        <Avatar size={24} icon={<FaUser size={12} />} />
                        <div className='div-service'>
                          <p className='font-12 mb-0'>{invoice.dependent?.firstName ?? ''} {invoice.dependent?.lastName ?? ''}</p>
                          <p className='font-12 mb-0'>{invoice.provider?.firstName ?? ''} {invoice.provider?.lastName ?? ''}</p>
                        </div>
                        <div className='font-12'>{invoice?.type === InvoiceType.BALANCE ? 'Past Due Balance' : invoice?.type === InvoiceType.NOSHOW ? 'No Show' : ''}</div>
                        <div>
                          <div className='font-12'>{moment(invoice.updatedAt).format("hh:mm a")}</div>
                          <div className='font-12 font-700 whitespace-nowrap'>{moment(invoice.updatedAt).format('MM/DD/YYYY')}</div>
                        </div>
                      </div>
                    )}
                  </Tabs.TabPane>
                </Tabs>
              </Panel>
              <Panel
                key="6"
                header={intl.formatMessage(messages.subsidiaries)}
                extra={(
                  <div className='flex flex-row justify-between'>
                    <Button type='primary' size='small' onClick={this.onShowModalNewSubsidy}>
                      {intl.formatMessage(messages.requestNewSubsidy).toUpperCase()}
                    </Button>
                  </div>
                )}
                className='subsidiaries-panel'
                collapsible='header'
              >
                <PanelSubsidiaries onShowModalSubsidyDetail={this.onShowModalSubsidy} socket={this.socket} />
              </Panel>
            </Collapse>
          </section>
        </div>
        <img src='../images/call.png' alt='hand-up-call' className='btn-call' width="6%" onClick={this.onShowModalReferral} />
        {userDrawerVisible && <DrawerDetail {...drawerDetailProps} />}
        {visibleNewAppoint && <ModalNewAppointment {...modalNewAppointProps} />}
        {visibleFlagExpand && <ModalFlagExpand {...modalFlagExpandProps} />}
        {visibleSubsidy && <ModalSubsidyProgress {...modalSubsidyProps} />}
        {visibleNewSubsidy && <ModalNewSubsidyRequest {...modalNewSubsidyProps} />}
        {visiblReferralService && <ModalReferralService {...modalReferralServiceProps} />}
        {visibleSessionsNeedToClose && <ModalSessionsNeedToClose {...modalSessionsNeedToCloseProps} />}
        {visibleConfirm && <ModalConfirm {...modalConfirmProps} />}
        {visibleCreateNote && <ModalCreateNote {...modalCreateNoteProps} />}
        {visibleCancelForAdmin && <ModalCancelForAdmin {...modalCancelForAdminProps} />}
        {visibleInvoice && <ModalInvoice {...modalInvoiceProps} />}
        {visiblePay && <ModalPay {...modalPayProps} />}
        <Modal title="Flag Action" open={visibleFlagAction} footer={null} onCancel={this.closeFlagAction}>
          <div className='flex items-center gap-2'>
            <Button type='primary' block className='font-16 flag-action whitespace-nowrap flex-1' onClick={() => this.onOpenModalCreateNote()}>{intl.formatMessage(msgDrawer.requestClearance)}</Button>
            {selectedFlag?.isPaid ? (
              <Button type='primary' block className='font-16 flag-action whitespace-nowrap flex-1' disabled>
                {intl.formatMessage(msgDrawer.paid)}
              </Button>
            ) : selectedFlag?.totalPayment == 0 ? null : (
              <Button type='primary' block className='font-16 flag-action whitespace-nowrap flex-1' onClick={() => this.openModalPay(`${window.location.href}?s=${encryptParam('true')}&i=${encryptParam(selectedFlag?._id)}`)}>
                {intl.formatMessage(msgDrawer.payFlag)}
              </Button>
            )}
            <Button type='primary' block className='font-16 flag-action whitespace-nowrap flex-1' onClick={() => this.onOpenModalConfirm()}>{intl.formatMessage(msgDrawer.clearFlag)}</Button>
          </div>
        </Modal>
        <PageLoading loading={loading} isBackground={true} />
      </div>
    );
  }
}

function renderEventContent(eventInfo, appointments) {
  const event = eventInfo.event.extendedProps;
  const type = event?.type;
  const status = event?.status;
  const eventType = type === SCREEN ? 'Screening' : type === EVALUATION ? 'Evaluation' : type === CONSULTATION ? 'Consultation' : 'Session';
  const provider = () => type === CONSULTATION ? null : (<div className='text-ellipsis' title={`Provider: ${event?.provider?.firstName ?? ''} ${event?.provider?.lastName ?? ''}`}>Provider: {`${event?.provider?.firstName ?? ''} ${event?.provider?.lastName ?? ''}`}</div>)

  return (
    <div className={`flex flex-col p-3 relative rounded-2 text-white bg-${[CANCELLED, DECLINED, NOSHOW].includes(status) ? 'cancelled' : eventType.toLowerCase()}`}>
      <div className="flex flex-col">
        <div className={`text-bold flex items-center ${[CANCELLED, DECLINED, NOSHOW].includes(status) && 'text-cancelled'}`} title={event?.skillSet?.name}>{[CANCELLED, DECLINED, NOSHOW].includes(status) && <GoPrimitiveDot className={`text-${eventType.toLowerCase()}`} size={16} />}<div className='text-ellipsis'>{event?.skillSet?.name}</div></div>
        <div className='text-ellipsis' title={moment(eventInfo.event.start).format('hh:mm a')}>{moment(eventInfo.event.start).format('hh:mm a')}</div>
        <div className='text-ellipsis' title={`Dependent: ${event?.dependent?.firstName ?? ''} ${event?.dependent?.lastName ?? ''}`}>Dependent: {`${event?.dependent?.firstName ?? ''} ${event?.dependent?.lastName ?? ''}`}</div>
        {provider()}
      </div>
      {type === CONSULTATION ? event?.consultant ? <AiFillStar color="#ffff00" size={20} className="flag-icons" /> : <AiOutlineStar color="#ffff00" size={20} className="flag-icons" /> : null}
      {event?.type === SUBSIDY && <FaHandHoldingUsd size={20} className='text-green500 mr-5' />}
      {event?.flagStatus === ACTIVE && event?.flagType === BALANCE && <MdOutlineRequestQuote color="#ff0000" size={20} className="flag-icons" />}
      {event?.status === PENDING && event?.flagStatus === NOFLAG && appointments?.find(a => a.dependent?._id === event?.dependent?._id && a.provider?._id === event?.provider?._id && a.flagStatus === ACTIVE)?.flagType === BALANCE && <MdOutlineRequestQuote color="#ff0000" size={20} className="flag-icons" />}
      {event?.flagStatus === ACTIVE && event?.flagType === NOSHOW && <MdOutlineEventBusy color="#ff0000" size={20} className="flag-icons" />}
      {event?.status === PENDING && event?.flagStatus === NOFLAG && appointments?.find(a => a.dependent?._id === event?.dependent?._id && a.provider?._id === event?.provider?._id && a.flagStatus === ACTIVE)?.flagType === NOSHOW && <MdOutlineEventBusy color="#ff0000" size={20} className="flag-icons" />}
    </div>
  )
}

const mapStateToProps = state => ({
  appointments: state.appointments.dataAppointments,
  appointmentsInMonth: state.appointments.dataAppointmentsMonth,
  invoices: state.appointments.dataInvoices,
  auth: state.auth,
})

export default compose(connect(mapStateToProps, { changeTime, getAppointmentsData, getAppointmentsMonthData, setAcademicLevels, setDependents, setDurations, setMeetingLink, setProviders, setSkillSet, setConsultants, getSubsidyRequests, setSchools, setAppointments, setAppointmentsInMonth, getInvoiceList, setInvoiceList }))(SchedulingCenter);
