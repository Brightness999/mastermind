import React, { Component } from 'react';
import { Drawer, Button, Row, Col, Typography, Popover, Input, message, Popconfirm, Radio, Space } from 'antd';
import { BsBell, BsCheckCircle, BsClockHistory, BsFillFlagFill, BsPaypal, BsXCircle } from 'react-icons/bs';
import { BiDollarCircle } from 'react-icons/bi';
import { FaFileContract } from 'react-icons/fa';
import { ImPencil } from 'react-icons/im';
import { TbSend } from 'react-icons/tb';
import { MdOutlineEventBusy, MdOutlineRemove, MdOutlineRequestQuote } from 'react-icons/md';
import intl from "react-intl-universal";
import moment from 'moment';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { AiFillTag, AiOutlineUserSwitch } from 'react-icons/ai';

import { ModalBalance, ModalCancelAppointment, ModalCancelForAdmin, ModalCreateNote, ModalCurrentAppointment, ModalCurrentReferralService, ModalEvaluationProcess, ModalInvoice, ModalNewScreening, ModalNoShow, ModalPay, ModalPayment, ModalProcessAppointment } from 'components/Modal';
import messages from './messages';
import msgModal from 'components/Modal/messages';
import msgDashboard from 'routes/User/Dashboard/messages';
import msgCreateAccount from 'routes/Sign/CreateAccount/messages';
import request, { encryptParam } from 'utils/api/request';
import { setAppointments, setAppointmentsInMonth, getInvoiceList } from 'src/redux/features/appointmentsSlice';
import { acceptDeclinedScreening, appealRequest, cancelAppointmentForParent, claimConsultation, clearFlag, closeAppointmentAsNoshow, closeAppointmentForProvider, declineAppointmentForProvider, leaveFeedbackForProvider, removeConsultation, requestClearance, requestFeedbackForClient, rescheduleAppointmentForParent, setFlag, setFlagBalance, setNotificationTime, switchConsultation, updateAppointmentNotesForParent, updateInvoice, updateNoshowFlag } from 'utils/api/apiList';
import { ACTIVE, ADMIN, APPOINTMENT, BALANCE, CANCEL, CANCELLED, CLOSED, CONSULTATION, DECLINED, EVALUATION, InvoiceType, NOFLAG, NOSHOW, PARENT, PENDING, RESCHEDULE, SCREEN, SUBSIDY, SUPERADMIN } from 'routes/constant';
import { url } from 'utils/api/baseUrl'
import './style/index.less';

const { Paragraph } = Typography;

class DrawerDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isProviderHover: false,
      isDependentHover: false,
      visibleCancel: false,
      visibleCurrent: false,
      errorMessage: '',
      isShowEditNotes: false,
      notes: this.props.event?.notes,
      visibleInvoice: false,
      publicFeedback: this.props.event?.publicFeedback ?? '',
      isLeftFeedback: !!this.props.event?.publicFeedback,
      isShowFeedback: false,
      userRole: this.props.auth.user?.role,
      visibleProcess: false,
      visibleCurrentReferral: false,
      visibleNoShow: false,
      visibleBalance: false,
      note: '',
      visibleEvaluationProcess: false,
      items: [],
      visibleModalMessage: false,
      visibleCurrentScreen: false,
      visibleCreateNote: false,
      notificationTime: 1440,
      visiblePayment: false,
      paymentDescription: '',
      visibleCancelForAdmin: false,
      cancellationType: '',
      isFeeToParent: false,
      visiblePay: false,
      returnUrl: '',
      totalPayment: 0,
      minimumPayment: 0,
      paidAmount: 0,
    };
  }

  componentDidMount() {
    const { userRole } = this.state;
    const { event } = this.props;

    if (userRole === 3) {
      this.setState({ notificationTime: event?.parentNotificationTime });
    }

    if (userRole === 30) {
      this.setState({ notificationTime: event?.providerNotificationTime });
    }

    if (userRole === 100) {
      this.setState({ notificationTime: event?.consultantNotificationTime });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.event?.notes != this.props.event?.notes) {
      this.setState({ notes: this.props.event?.notes });
    }
    if (prevProps.event?.publicFeedback != this.props.event?.publicFeedback) {
      this.setState({ publicFeedback: this.props.event?.publicFeedback, isLeftFeedback: !!this.props.event?.publicFeedback });
    }
  }

  handleProviderHoverChange = (visible) => {
    this.setState({ isProviderHover: visible });
  };

  handleDependentHoverChange = (visible) => {
    this.setState({ isDependentHover: visible });
  };

  closeModalCancel = () => {
    this.setState({ visibleCancel: false });
  }

  openModalCancel = () => {
    const { event, auth } = this.props;

    if ([EVALUATION, APPOINTMENT, SUBSIDY].includes(event.type) && [PARENT, ADMIN, SUPERADMIN].includes(auth.user.role) && moment(event.date).subtract(event.provider?.cancellationWindow, 'h').isBefore(moment()) && event.provider?.cancellationFee && !event.isCancellationFeePaid) {
      const desc = <span>A fee <span className='text-bold'>${event.provider.cancellationFee}</span> must be paid to cancel.</span>
      if (auth.user.role === PARENT) {
        this.setState({ paymentDescription: desc });
        message.warn(desc, 2).then(() => {
          this.setState({ visiblePayment: true, cancellationType: CANCEL });
        });
      } else {
        message.warn(desc, 2);
        this.setState({ visibleCancelForAdmin: true, cancellationType: CANCEL });
      }
    } else {
      this.setState({ visibleCancel: true });
    }
  }

  handleChangeFeedback = feedback => {
    this.setState({ publicFeedback: feedback });
  }

  handleConfirmCancel = () => {
    const { event } = this.props;
    const { isFeeToParent } = this.state;
    this.setState({ visibleCancel: false }, () => {
      if (event?._id) {
        let data = { appointId: event._id };
        if (isFeeToParent) {
          data = {
            ...data,
            type: InvoiceType.CANCEL,
            items: [{
              type: 'Fee',
              date: moment(event.date).format('MM/DD/YYYY hh:mm a'),
              details: 'Canceled Appointment',
              rate: event.provider.cancellationFee || 0,
            }],
            totalPayment: event.provider.cancellationFee || 0,
          }
        }

        request.post(cancelAppointmentForParent, data).then(result => {
          if (result.success) {
            this.setState({ errorMessage: '', isFeeToParent: false });
            this.updateAppointments(result.data);
          } else {
            this.setState({ errorMessage: result.data, isFeeToParent: false });
          }
        }).catch(error => {
          this.setState({ errorMessage: error.message, isFeeToParent: false });
        })
      }
    });
  }

  submitModalCurrent = () => {
    this.setState({ visibleCurrent: false });
  }

  submitModalCurrentReferral = () => {
    this.setState({ visibleCurrentReferral: false });
  }

  closeModalCurrent = () => {
    const { event } = this.props;
    event?.type === SCREEN ? this.setState({ visibleCurrentScreen: false }) : event?.type === CONSULTATION ? this.setState({ visibleCurrentReferral: false }) : this.setState({ visibleCurrent: false });
  }

  openModalCurrent = () => {
    const { event } = this.props;
    const { user } = this.props.auth;

    if ([EVALUATION, APPOINTMENT, SUBSIDY].includes(event.type) && [PARENT, ADMIN, SUPERADMIN].includes(user.role) && moment(event.date).subtract(event.provider?.cancellationWindow, 'h').isBefore(moment()) && event.provider?.cancellationFee && !event.isCancellationFeePaid) {
      const desc = <span>A fee <span className='text-bold'>${event.provider.cancellationFee}</span> must be paid to reschedule.</span>
      if (user.role === PARENT) {
        this.setState({ paymentDescription: desc });
        message.warn(desc, 2).then(() => {
          this.setState({ visiblePayment: true, cancellationType: RESCHEDULE });
        });
      } else {
        message.warn(desc, 2);
        this.setState({ visibleCancelForAdmin: true, cancellationType: RESCHEDULE });
      }
    } else {
      event?.type === SCREEN ? this.setState({ visibleCurrentScreen: true }) : event?.type === CONSULTATION ? this.setState({ visibleCurrentReferral: true }) : this.setState({ visibleCurrent: true });
    }
  }

  onCloseModalCancelForAdmin = () => {
    this.setState({ visibleCancelForAdmin: false, isFeeToParent: false });
  }

  applyFeeToParent = () => {
    const { cancellationType } = this.state;
    this.setState({ visibleCancelForAdmin: false, isFeeToParent: true });
    if (cancellationType === CANCEL) {
      this.setState({ visibleCancel: true, cancellationType: '' });
    } else if (cancellationType === RESCHEDULE) {
      this.setState({ visibleCurrent: true, cancellationType: '' });
    }
  }

  waiveFee = () => {
    const { cancellationType } = this.state;
    this.setState({ visibleCancelForAdmin: false, isFeeToParent: false });
    if (cancellationType === CANCEL) {
      this.setState({ visibleCancel: true });
    } else if (cancellationType === RESCHEDULE) {
      this.setState({ visibleCurrent: true });
    }
  }

  showEditNotes = () => {
    this.setState({ isShowEditNotes: true });
  }

  hideEditNotes = () => {
    this.setState({ isShowEditNotes: false });
  }

  showFeedback = () => {
    this.setState({ isShowFeedback: true });
  }

  hideFeedback = () => {
    this.setState({ isShowFeedback: false });
  }

  openModalMessage = () => {
    this.setState({ visibleModalMessage: true });
  }

  closeModalMessage = () => {
    this.setState({ visibleModalMessage: false });
  }

  handleChangeNotes = (value) => {
    this.setState({ notes: value });
  }

  handleUpdateNotes = () => {
    const { event } = this.props;
    if (event?._id) {
      const data = { appointmentId: event._id, notes: this.state.notes };
      request.post(updateAppointmentNotesForParent, data).then(res => {
        if (res.success) {
          this.setState({
            errorMessage: '',
            isShowEditNotes: false,
          });
          message.success('Successfully Updated');
          this.updateAppointments(res.data);
        }
      }).catch(err => {
        this.setState({ errorMessage: err.message });
      })
    }
  }

  displayDuration = (event) => {
    let duration = event?.provider?.duration ?? 30;
    if (event?.type == EVALUATION) {
      duration = event?.provider?.separateEvaluationDuration;
    }
    return `${moment(event?.date).format('MM/DD/YYYY hh:mm a')} - ${moment(event?.date).clone().add(duration, 'minutes').format('hh:mm a')}`;
  }

  handleMarkAsClosed = (items, skipEvaluation, note, publicFeedback) => {
    this.setState({ visibleProcess: false, visibleInvoice: false });
    const { event } = this.props;

    if (event?._id) {
      const data = {
        appointmentId: event._id,
        publicFeedback: publicFeedback ? publicFeedback : this.state.publicFeedback,
        skipEvaluation: skipEvaluation,
        items: items?.items,
        invoiceNumber: items?.invoiceNumber,
        invoiceId: items?.invoiceId,
        totalPayment: items?.totalPayment,
        note: note,
      }
      request.post(closeAppointmentForProvider, data).then(result => {
        if (result.success) {
          this.setState({ errorMessage: '' });
          this.updateAppointments(result.data);
        } else {
          this.setState({ errorMessage: result.data });
        }
      }).catch(error => {
        this.setState({ errorMessage: error.message });
      })
    }
  }

  handleMarkAsNoShow = (note, publicFeedback) => {
    this.setState({ visibleProcess: false, visibleInvoice: false });
    const { event } = this.props;

    if (event?._id) {
      const data = {
        appointmentId: event._id,
        publicFeedback: publicFeedback ? publicFeedback : this.state.publicFeedback,
        note: note,
      }
      request.post(closeAppointmentAsNoshow, data).then(result => {
        if (result.success) {
          this.setState({ errorMessage: '' });
          this.updateAppointments(result.data);
        } else {
          this.setState({ errorMessage: result.data });
        }
      }).catch(error => {
        this.setState({ errorMessage: error.message });
      })
    }
  }

  handleDecline = (note, publicFeedback) => {
    this.setState({ visibleProcess: false, visibleInvoice: false });
    const { event } = this.props;

    if (event?._id) {
      const data = {
        appointmentId: event._id,
        publicFeedback: publicFeedback ? publicFeedback : this.state.publicFeedback,
        note: note,
        items: this.state.items,
      }
      request.post(declineAppointmentForProvider, data).then(result => {
        if (result.success) {
          this.setState({ errorMessage: '' });
          this.updateAppointments(result.data);
        } else {
          this.setState({ errorMessage: result.data });
        }
      }).catch(error => {
        this.setState({ errorMessage: error.message });
      })
    }
  }

  confirmModalProcess = (note, publicFeedback) => {
    const { event } = this.props;

    if (event?.type == EVALUATION) {
      this.setState({ visibleProcess: false, visibleInvoice: true, note: note, publicFeedback: publicFeedback });
    } else if (event?.type == CONSULTATION) {
      this.handleMarkAsClosed(undefined, false, note, publicFeedback);
    } else {
      this.handleMarkAsClosed(this.state.items, false, note, publicFeedback);
    }
  }

  confirmModalInvoice = (items) => {
    if (items.isEdit) {
      this.handleUpdateInvoice(items);
    } else {
      if (this.props.event?.type == EVALUATION) {
        this.setState({ visibleInvoice: false, visibleEvaluationProcess: true, items: items });
      } else {
        this.setState({ visibleInvoice: false, visibleProcess: true, items: items });
      }
    }
  }

  closeModalInvoice = () => {
    this.setState({ visibleInvoice: false });
  }

  handleUpdateInvoice = (items) => {
    this.closeModalInvoice();
    const { event, auth } = this.props;

    if (event?._id) {
      let postData = {
        invoiceId: items?.invoiceId,
        totalPayment: items?.totalPayment,
        minimumPayment: items?.minimumPayment,
      }

      if (event.sessionInvoice) {
        postData = {
          ...postData,
          updateData: [{
            appointment: event._id,
            items: items?.items,
          }],
        }
      } else if (event.flagInvoice) {
        postData = {
          ...postData,
          updateData: [{
            appointment: event._id,
            items: {
              ...event.flagInvoice.data?.[0]?.items,
              data: items.items,
            },
          }],
        }
      }
      request.post(updateInvoice, postData).then(result => {
        if (result.success) {
          this.setState({ errorMessage: '' });
          this.props.getInvoiceList({ role: auth.user.role });
        } else {
          this.setState({ errorMessage: result.data });
        }
      }).catch(error => {
        this.setState({ errorMessage: error.message });
      })
    }
  }

  handleLeaveFeedback = () => {
    const data = {
      appointmentId: this.props.event._id,
      publicFeedback: this.state.publicFeedback,
    }
    request.post(leaveFeedbackForProvider, data).then(result => {
      if (result.success) {
        this.setState({ errorMessage: '', isShowFeedback: false });
        this.updateAppointments(result.data);
      } else {
        this.setState({ errorMessage: result.data });
      }
    }).catch(error => {
      this.setState({ errorMessage: error.message });
    })
  }

  handleRequestFeedback = () => {
    const { provider, type, dependent } = this.props.event;
    const data = { providerId: provider?._id, dependentId: dependent?._id, type };
    request.post(requestFeedbackForClient, data).then(result => {
      if (result.success) {
        message.success('The request has been sent successfully.');
      } else {
        this.setState({ errorMessage: result.data });
      }
    }).catch(error => {
      this.setState({ errorMessage: error.message });
    })
  }

  updateAppointments(data, isSwitch) {
    const { event, appointments, appointmentsMonth } = this.props;
    const newAppointments = JSON.parse(JSON.stringify(appointments))?.map(a => a._id === event._id ? ({ ...data, parent: a.parent }) : a);
    this.props.setAppointments(newAppointments);
    
    if (isSwitch) {
      const newAppointmentsInMonth = JSON.parse(JSON.stringify(appointmentsMonth))?.filter(a => a._id != event._id);
      this.props.setAppointmentsInMonth(newAppointmentsInMonth);
    } else {
      const newAppointmentsInMonth = JSON.parse(JSON.stringify(appointmentsMonth))?.map(a => a._id === event._id ? ({ ...data, parent: a.parent }) : a);
      this.props.setAppointmentsInMonth(newAppointmentsInMonth);
    }
  }

  openModalProcess() {
    this.setState({ visibleProcess: true });
  }

  closeModalProcess = () => {
    this.setState({ visibleProcess: false, note: '', publicFeedback: '' });
  }

  onShowModalNoShow = () => {
    this.setState({ visibleNoShow: true });
  };

  onCloseModalNoShow = () => {
    this.setState({ visibleNoShow: false });
  };

  onSubmitFlagNoShow = (values) => {
    const { event, auth } = this.props;
    const { penalty, program, notes, invoiceId, balance, feeOption } = values;
    const data = {
      _id: event?._id,
      dependent: event?.dependent?._id,
      provider: event?.provider?._id,
      status: NOSHOW,
      flagStatus: ACTIVE,
      flagType: NOSHOW,
      flagItems: {
        penalty: penalty * 1,
        program: program * 1,
        notes,
        data: [{
          type: 'Fee',
          date: moment(event?.date).format("MM/DD/YYYY hh:mm a"),
          details: 'Missed Appointment',
          rate: feeOption === 1 ? balance : feeOption === 2 ? penalty * 1 + program * 1 : 0,
        }],
        flagType: NOSHOW,
        feeOption,
        balance,
      },
      totalPayment: feeOption === 1 ? balance : feeOption === 2 ? penalty * 1 + program * 1 : 0,
      invoiceId,
    }

    request.post(invoiceId ? updateNoshowFlag : setFlag, data).then(result => {
      const { success } = result;
      if (success) {
        this.setState({ visibleNoShow: false });
        this.updateAppointments(result.data);
        this.props.getInvoiceList({ role: auth.user.role });
      }
    })
  }

  onShowModalBalance = () => {
    this.setState({ visibleBalance: true });
  };

  onCloseModalBalance = () => {
    this.setState({ visibleBalance: false });
  };

  onSubmitFlagBalance = (values) => {
    const { notes } = values;
    const { auth, listAppointmentsRecent, event } = this.props;
    const providerIds = Object.keys(values).filter(a => a.includes('invoiceId')).map(a => a.split("-")[1]);
    let bulkData = [];

    providerIds.forEach(providerId => {
      let temp = [];
      Object.entries(values)?.forEach(value => {
        if (value?.length) {
          const appointment = listAppointmentsRecent?.find(a => a._id === value[0]);
          if (appointment && appointment?.provider?._id === providerId) {
            temp.push({
              appointment: appointment._id,
              items: {
                flagType: BALANCE,
                late: value[1] * 1,
                balance: values[`balance-${appointment._id}`],
                totalPayment: values[`totalPayment-${appointment.provider?._id}`],
                minimumPayment: values[`minimumPayment-${appointment.provider?._id}`] * 1,
                data: [
                  {
                    type: appointment?.type === EVALUATION ? intl.formatMessage(msgModal.evaluation) : appointment?.type === APPOINTMENT ? intl.formatMessage(msgModal.standardSession) : appointment?.type === SUBSIDY ? intl.formatMessage(msgModal.subsidizedSession) : '',
                    date: moment(appointment?.date).format("MM/DD/YYYY hh:mm a"),
                    details: `Location: ${appointment?.location}`,
                    count: appointment.type === SUBSIDY ? `[${listAppointmentsRecent?.filter(a => a?.type === SUBSIDY && [PENDING, CLOSED].includes(a?.status) && a?.dependent?._id === appointment?.dependent?._id && a?.provider?._id === appointment?.provider?._id)?.length}/${appointment?.subsidy?.numberOfSessions}]` : '',
                    discount: values[`discount-${appointment._id}`],
                    rate: values[`balance-${appointment._id}`] * 1,
                  },
                  {
                    type: 'Fee',
                    date: moment(appointment?.date).format("MM/DD/YYYY hh:mm a"),
                    details: 'Past Due Balance Fee',
                    rate: value[1] * 1,
                  },
                ],
                notes,
              }
            })
          }
        }
      })
      bulkData.push({
        providerId,
        invoiceId: values[`invoiceId-${providerId}`],
        totalPayment: values[`totalPayment-${providerId}`],
        minimumPayment: values[`minimumPayment-${providerId}`],
        data: temp,
      })
    })

    request.post(setFlagBalance, { bulkData, dependent: event?.dependent?._id, appointmentId: event?._id }).then(result => {
      const { success, data } = result;
      if (success) {
        this.onCloseModalBalance();
        this.updateAppointments(data);
        this.props.getInvoiceList({ role: auth.user.role });
      }
    }).catch(err => message.error(err.message));
  }

  onOpenModalInvoice = () => {
    this.setState({ visibleInvoice: true });
    this.props.socket.emit("action_tracking", {
      user: this.props.auth.user?._id,
      action: "Invoice",
      description: "Viewed invoice",
    })
  }

  declineEvaluation = () => {
    const { note, publicFeedback } = this.state;
    this.onCloseModalEvaluationProcess();
    this.handleDecline(note, publicFeedback);
  }

  closeEvaluation = () => {
    const { items, note, publicFeedback } = this.state;
    this.onCloseModalEvaluationProcess();
    this.handleMarkAsClosed(items, false, note, publicFeedback);
  }

  onCloseModalEvaluationProcess = () => {
    this.setState({ visibleEvaluationProcess: false });
  }

  displayTime = (value) => {
    return `${value?.split(' ')[0]?.split(':')[0]}:${value?.split(' ')[0]?.split(':')[1]} ${value?.split(' ')[1]}`;
  }

  handleAcceptDeclinedScreening = () => {
    request.post(acceptDeclinedScreening, { _id: this.props.event?._id, status: 0 }).then(res => {
      if (res.success) {
        message.success('Accepted successfully');
        this.updateAppointments(res.data);
      }
    }).catch(err => {
      message.error(err.message);
    });
  }

  handleAppealRequest = (msg) => {
    request.post(appealRequest, { id: this.props.event?._id, message: msg }).then(res => {
      if (res.success) {
        message.success('Your request has been submitted. Please allow up to 24 hours for the provider to review this.');
        this.closeModalMessage();
      }
    }).catch(err => {
      message.error(err.message);
    });
  }

  handleRescheduleScreening = (data) => {
    const rescheduleData = {
      appointmentId: this.props.event?._id,
      screeningTime: data?.time,
      phoneNumber: data?.phoneNumber,
      notes: data?.notes,
    }
    request.post(rescheduleAppointmentForParent, rescheduleData).then(result => {
      if (result.success) {
        this.closeModalCurrent();
        this.updateAppointments(result.data);
        message.success("Updated successfully");
      }
    }).catch(err => {
      message.error(err.message);
    });
  }

  handleClearFlag = () => {
    const { event } = this.props;
    request.post(clearFlag, { invoiceId: event?.flagInvoice?._id }).then(result => {
      const { success, data } = result;
      if (success) {
        message.success('Cleared successfully');
        this.updateAppointments(data);
      }
    }).catch(err => {
      message.error('Clear Flag: ' + err.message);
    })
  }

  onOpenModalCreateNote = () => {
    this.setState({ visibleCreateNote: true });
  }

  onCloseModalCreateNote = () => {
    this.setState({ visibleCreateNote: false });
  }

  onCloseModalPayment = () => {
    this.setState({ visiblePayment: false, cancellationType: '' });
  }

  handleRequestClearance = (requestMessage) => {
    this.onCloseModalCreateNote();
    message.success("Your request has been submitted. Please allow up to 24 hours for the provider to review this.");

    request.post(requestClearance, { invoiceId: this.props.flagInvoice?._id, message: requestMessage }).catch(err => {
      message.error(err.message);
    })
  }

  handleSessionReminder = (time) => {
    this.setState({ notificationTime: time });
    request.post(setNotificationTime, { appointmentId: this.props.event?._id, time })
      .then(res => {
        if (res.success) {
          this.setState({ errorMessage: '' });
          message.success("Updated successfully");
          this.updateAppointments(res.data);
        }
      })
      .catch(err => this.setState({ errorMessage: err.message }));
  }

  handleTag = () => {
    const { auth, event, listAppointmentsRecent } = this.props;

    if (listAppointmentsRecent?.find(a => a?.consultant?._id === auth.user?.consultantInfo?._id && a.date === event?.date)) {
      message.warning("You already scheduled at this event time.");
    } else {
      const appointmentDate = moment(event?.date);
      const ranges = auth.user?.consultantInfo?.manualSchedule?.filter(a => a.dayInWeek === appointmentDate.day() && appointmentDate.isBetween(moment().set({ years: a.fromYear, months: a.fromMonth, dates: a.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }), moment().set({ years: a.toYear, months: a.toMonth, dates: a.toDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 0 })));

      if (ranges?.length) {
        request.post(claimConsultation, { appointmentId: event?._id })
          .then(res => {
            if (res.success) {
              this.setState({ errorMessage: '' });
              if (res.data.message) {
                message.warning(res.data.message);
              } else {
                message.success("Claimed successfully");
                this.updateAppointments(res.data);
              }
            }
          })
          .catch(err => this.setState({ errorMessage: err.message }));
      } else {
        message.warning("You are not available at this event time.");
      }
    }
  }

  handleSwitchTag = (consultantId) => {
    request.post(switchConsultation, { appointmentId: this.props.event?._id, consultantId })
      .then(res => {
        if (res.success) {
          this.setState({ errorMessage: '' });
          this.updateAppointments(res.data, true);
          message.success("Switched successfully");
        }
      })
      .catch(err => this.setState({ errorMessage: err.message }));
  }

  handleRemoveTag = () => {
    request.post(removeConsultation, { appointmentId: this.props.event?._id })
      .then(res => {
        if (res.success) {
          this.setState({ errorMessage: '' });
          this.updateAppointments(res.data);
          message.success("Removed successfully");
        }
      })
      .catch(err => this.setState({ errorMessage: err.message }));
  }

  openModalPay = (url, paidAmount, totalPayment, minimumPayment = 0) => {
    this.setState({ visiblePay: true, returnUrl: url, paidAmount, totalPayment, minimumPayment });
  }

  closeModalpay = () => {
    this.setState({ visiblePay: false, returnUrl: '', paidAmount: 0, totalPayment: 0, minimumPayment: 0 });
  }

  render() {
    const {
      isProviderHover,
      isDependentHover,
      visibleCancel,
      visibleProcess,
      visibleCurrent,
      isShowEditNotes,
      notes,
      publicFeedback,
      visibleInvoice,
      isLeftFeedback,
      userRole,
      visibleCurrentReferral,
      isShowFeedback,
      visibleNoShow,
      visibleBalance,
      visibleEvaluationProcess,
      errorMessage,
      visibleModalMessage,
      visibleCurrentScreen,
      visibleCreateNote,
      notificationTime,
      visiblePayment,
      paymentDescription,
      visibleCancelForAdmin,
      isFeeToParent,
      cancellationType,
      visiblePay,
      returnUrl,
      totalPayment,
      minimumPayment,
      paidAmount,
    } = this.state;
    const { event, listAppointmentsRecent, auth } = this.props;
    const dependent = { ...event?.dependent, appointments: listAppointmentsRecent?.filter(a => a.dependent?._id === event?.dependent?._id) };
    const appointmentDate = moment(event?.date);
    const consultants = auth.consultants?.filter(consultant => consultant?._id !== auth.user?._id && !listAppointmentsRecent?.find(a => a?.consultant?._id === consultant?.consultantInfo?._id && a.date === event?.date) && consultant?.consultantInfo?.manualSchedule?.find(a => a.dayInWeek === appointmentDate.day() && appointmentDate.isBetween(moment().set({ years: a.fromYear, months: a.fromMonth, dates: a.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }), moment().set({ years: a.toYear, months: a.toMonth, dates: a.toDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 0 }))));
    const flagEvent = listAppointmentsRecent?.find(a => a.dependent?._id === event?.dependent?._id && a.provider?._id === event?.provider?._id && a.flagStatus === ACTIVE);
    const isReschedule = event?.status === PENDING && (event?.type === SCREEN || (moment().isBefore(moment(event?.date)) && [EVALUATION, APPOINTMENT, SUBSIDY].includes(event?.type)) || (moment().isBefore(moment(event?.date)) && event?.type === CONSULTATION && (userRole === 3 || userRole > 900 || (userRole === 100 && event?.consultant?._id && event?.consultant?._id === auth.user?.consultantInfo?._id))));
    const isLeaveFeedback = userRole !== 3 && !isShowFeedback && [CLOSED, DECLINED].includes(event?.status) && ((event?.type !== CONSULTATION) || (event?.type === CONSULTATION && event?.consultant?._id && (event?.consultant?._id === auth.user?.consultantInfo?._id || userRole > 900)));
    const isCancel = event?.status === PENDING && (event?.type === SCREEN || (moment().isBefore(moment(event?.date)) && [EVALUATION, APPOINTMENT, SUBSIDY].includes(event?.type)) || (moment().isBefore(moment(event?.date)) && event?.type === CONSULTATION && (userRole === 3 || userRole > 900 || (userRole === 100 && event?.consultant?._id && event?.consultant?._id === auth.user?.consultantInfo?._id))));

    const providerProfile = (
      <div className='provider-profile'>
        <p className='font-20 font-700 mb-10'>{`${event?.provider?.firstName ?? ''} ${event?.provider?.lastName ?? ''}`}</p>
        <div className='flex'>
          <div className='flex-1'>
            {event?.provider?.contactNumber?.map((phone, index) => (
              <p key={index} className='font-16'>{phone.phoneNumber}</p>
            ))}
            {event?.provider?.contactEmail?.map((email, index) => (
              <p key={index} className='font-16'>{email.email}</p>
            ))}
            {event?.provider?.serviceAddress && (
              <p className='font-16'>{event?.provider.serviceAddress}</p>
            )}
          </div>
        </div>
        <div className='flex'>
          <div className='flex-1'>
            <p className='font-16 mb-0 text-bold'>{intl.formatMessage(msgCreateAccount.services)}:</p>
            {event?.provider?.skillSet?.map((skill, index) => (
              <p key={index} className='font-16 mb-0'>{skill.name}</p>
            ))}
          </div>
          <div className='font-16 flex-1'>
            <p className='mb-0 text-bold'>Grade level(s)</p>
            <div>{event?.provider?.academicLevel?.map((level, i) => (
              <div key={i} className="flex justify-between gap-2">
                <span>{level.level}</span>
                <span>${level.rate}</span>
              </div>
            ))}</div>
          </div>
        </div>
        <p className='font-16 mb-0 text-bold'>Profile</p>
        <div className='profile-text'>
          <Paragraph className='font-16 mb-0' ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>
            {event?.provider?.publicProfile}
          </Paragraph>
        </div>
      </div>
    );
    const dependentProfile = (
      <div className='provider-profile'>
        <p className='font-20 font-700 mb-10'>{event?.dependent?.firstName ?? ''} {event?.dependent?.lastName ?? ''}</p>
        <div className='flex'>
          <div className='flex-1'>
            <p className='font-16 mb-0'>{event?.dependent?.guardianPhone ?? ''}</p>
            <p className='font-16 mb-0'>{event?.dependent?.guardianEmail ?? ''}</p>
          </div>
          <div className='flex-1 font-16'>
            <div className='text-bold'>{intl.formatMessage(msgCreateAccount.services)}</div>
            {event?.dependent?.services?.map((service, i) => (<div key={i}>{service.name}</div>))}
          </div>
        </div>
      </div >
    );
    const modalCancelProps = {
      visible: visibleCancel,
      onSubmit: this.handleConfirmCancel,
      onCancel: this.closeModalCancel,
      event: listAppointmentsRecent?.find(a => a?._id === event?._id),
    };
    const modalProcessProps = {
      visible: visibleProcess,
      onDecline: this.handleDecline,
      onSubmit: this.handleMarkAsClosed,
      onConfirm: this.confirmModalProcess,
      onConfirmNoShow: this.handleMarkAsNoShow,
      onCancel: this.closeModalProcess,
      event: listAppointmentsRecent?.find(a => a?._id === event?._id),
    };
    const modalCurrentProps = {
      visible: visibleCurrent,
      onSubmit: this.submitModalCurrent,
      onCancel: this.closeModalCurrent,
      event: listAppointmentsRecent?.find(a => a?._id === event?._id),
      listAppointmentsRecent,
      isFeeToParent,
    };
    const modalInvoiceProps = {
      visible: visibleInvoice,
      onSubmit: this.confirmModalInvoice,
      onCancel: this.closeModalInvoice,
      event: listAppointmentsRecent?.find(a => a?._id === event?._id),
    }
    const modalCurrentReferralProps = {
      visible: visibleCurrentReferral,
      onSubmit: this.submitModalCurrentReferral,
      onCancel: this.closeModalCurrent,
      event: listAppointmentsRecent?.find(a => a?._id === event?._id),
    }
    const modalNoShowProps = {
      visible: visibleNoShow,
      onSubmit: this.onSubmitFlagNoShow,
      onCancel: this.onCloseModalNoShow,
      event: listAppointmentsRecent?.find(a => a?._id === event?._id),
    };
    const modalBalanceProps = {
      visible: visibleBalance,
      onSubmit: this.onSubmitFlagBalance,
      onCancel: this.onCloseModalBalance,
      event: listAppointmentsRecent?.find(a => a?._id === event?._id),
      dependent,
    };
    const modalEvaluationProcessProps = {
      visible: visibleEvaluationProcess,
      onSubmit: this.closeEvaluation,
      onDecline: this.declineEvaluation,
      onCancel: this.onCloseModalEvaluationProcess,
    };
    const modalMessageProps = {
      visible: visibleModalMessage,
      title: 'Message',
      onSubmit: this.handleAppealRequest,
      onCancel: this.closeModalMessage,
    };
    const modalCurrentScreeningProps = {
      visible: visibleCurrentScreen,
      onSubmit: this.handleRescheduleScreening,
      onCancel: this.closeModalCurrent,
      provider: event?.provider,
      dependent: event?.dependent,
      event: event,
    }
    const modalCreateNoteProps = {
      visible: visibleCreateNote,
      onSubmit: this.handleRequestClearance,
      onCancel: this.onCloseModalCreateNote,
      title: "Request Message"
    };
    const modalPaymentProps = {
      visible: visiblePayment,
      onSubmit: this.onCloseModalPayment,
      onCancel: this.onCloseModalPayment,
      description: paymentDescription,
      appointment: event,
      cancellationType,
    };
    const modalCancelForAdminProps = {
      visible: visibleCancelForAdmin,
      onSubmit: this.waiveFee,
      applyFeeToParent: this.applyFeeToParent,
      onCancel: this.onCloseModalCancelForAdmin,
    };
    const modalPayProps = {
      visible: visiblePay,
      onSubmit: this.closeModalpay,
      onCancel: this.closeModalpay,
      returnUrl, totalPayment, minimumPayment, paidAmount,
    };

    const contentConfirm = (
      <div className='confirm-content'>
        <Col xs={24} sm={24} md={24} className="flex flex-col">
          <p className='font-16 text-center mb-0'>{intl.formatMessage(msgModal.old)}</p>
          <div className='new-content flex-1'>
            <p className='font-16 font-700'>{event?.previousAppointment?.type === SCREEN ? intl.formatMessage(msgModal.screening) : event?.previousAppointment?.type === EVALUATION ? intl.formatMessage(msgModal.evaluation) : event?.previousAppointment?.type === APPOINTMENT ? intl.formatMessage(msgModal.appointment) : event?.previousAppointment?.type === CONSULTATION ? intl.formatMessage(msgModal.consultation) : ''}</p>
            <p className='font-16'>{`${event?.previousAppointment?.dependent?.firstName ?? ''} ${event?.previousAppointment?.dependent?.lastName ?? ''}`}</p>
            <p className='font-16'>{`${event?.previousAppointment?.provider?.firstName ?? ''} ${event?.previousAppointment?.provider?.lastName ?? ''}`}</p>
            {event?.previousAppointment?.type === SCREEN ? (
              <p className='font-16 whitespace-nowrap'>{intl.formatMessage(messages.phonenumber)}: {event?.previousAppointment?.phoneNumber}</p>
            ) : event?.previousAppointment?.type === CONSULTATION ? (
              <p className='font-16'>{event?.previousAppointment?.meetingLink ? intl.formatMessage(messages.meeting) : intl.formatMessage(messages.phonenumber)}: {event?.previousAppointment?.meetingLink ? event?.previousAppointment?.meetingLink : event?.previousAppointment?.phoneNumber}</p>
            ) : (
              <p className='font-16'>{intl.formatMessage(messages.where)}: {event?.previousAppointment?.location}</p>
            )}
            <p className='font-16 nobr'>{intl.formatMessage(messages.when)}: <span className='font-16 font-700'>{event?.previousAppointment?.type === SCREEN ? event?.previousAppointment?.screeningTime ?? '' : this.displayDuration(event?.previousAppointment)}</span></p>
          </div>
        </Col>
        <Col xs={24} sm={24} md={24} className="flex flex-col">
          <p className='font-16 text-center mb-0'>{intl.formatMessage(msgModal.current)}</p>
          <div className='current-content flex-1'>
            <p className='font-16 font-700'>{event?.type === SCREEN ? intl.formatMessage(msgModal.screening) : event?.type === EVALUATION ? intl.formatMessage(msgModal.evaluation) : event?.type === APPOINTMENT ? intl.formatMessage(msgModal.appointment) : event?.type === CONSULTATION ? intl.formatMessage(msgModal.consultation) : ''}</p>
            <p className='font-16'>{`${event?.dependent?.firstName ?? ''} ${event?.dependent?.lastName ?? ''}`}</p>
            <p className='font-16'>{`${event?.provider?.firstName ?? ''} ${event?.provider?.lastName ?? ''}`}</p>
            {event?.type === SCREEN ? (
              <p className='font-16 whitespace-nowrap'>{intl.formatMessage(messages.phonenumber)}: {event?.phoneNumber}</p>
            ) : event?.type === CONSULTATION ? (
              <p className='font-16'>{event?.meetingLink ? intl.formatMessage(messages.meeting) : intl.formatMessage(messages.phonenumber)}: {event?.meetingLink ? event?.meetingLink : event?.phoneNumber}</p>
            ) : (
              <p className='font-16'>{intl.formatMessage(messages.where)}: {event?.location}</p>
            )}
            <p className='font-16 nobr'>{intl.formatMessage(messages.when)}: <span className='font-16 font-700'>{event?.type === SCREEN ? event?.screeningTime ?? '' : this.displayDuration(event)}</span></p>
          </div>
        </Col>
      </div>
    );

    return (
      <Drawer
        title={event?.type === SCREEN ? intl.formatMessage(messages.screeningDetails) : event?.type === EVALUATION ? intl.formatMessage(messages.evaluationDetails) : event?.type === CONSULTATION ? intl.formatMessage(messages.consultationDetails) : intl.formatMessage(messages.appointmentDetails)}
        closable={true}
        onClose={() => this.props.onClose()}
        open={this.props.visible}
        extra={
          <Button type='text' icon={<Popover placement="bottomLeft" overlayClassName='notification-time' trigger={([3, 30].includes(userRole) || (userRole === 100 && event?.consultant?._id && event?.consultant?._id === auth.user?.consultantInfo?._id)) ? "click" : ""} content={(
            <Radio.Group onChange={e => this.handleSessionReminder(e.target.value)} value={notificationTime} className="box-card p-10 bg-pastel">
              <Space direction="vertical">
                <Radio value={15} className="nobr">15 min</Radio>
                <Radio value={30} className="nobr">30 min</Radio>
                <Radio value={60} className="nobr">1 hr</Radio>
              </Space>
            </Radio.Group>
          )}><BsBell size={18} /></Popover>} />
        }
      >
        <div>
          {event?.flagStatus === ACTIVE && event?.flagType === BALANCE && (
            <div className='text-center'><MdOutlineRequestQuote color="#ff0000" size={32} /></div>
          )}
          {event?.flagStatus === ACTIVE && event?.flagType === NOSHOW && (
            <div className='text-center'><MdOutlineEventBusy color="#ff0000" size={32} /></div>
          )}
          {event?.flagStatus !== ACTIVE && event?.type === CONSULTATION && event?.status === PENDING && event?.consultant?._id && event?.consultant?._id !== auth.user?.consultantInfo?._id && (
            <div className='event-status text-consultation font-20 text-center'>[{intl.formatMessage(messages.claimed)}]</div>
          )}
          {event?.flagStatus !== ACTIVE && event?.type === CONSULTATION && event?.status === PENDING && !event?.consultant && (
            <div className='event-status text-consultation font-20 text-center'>[{intl.formatMessage(messages.unclaimed)}]</div>
          )}
          {event?.flagStatus !== ACTIVE && event?.status === CLOSED && (
            <div className='event-status text-consultation font-20 text-center'>[{intl.formatMessage(messages.accepted)}]</div>
          )}
          {event?.flagStatus !== ACTIVE && event?.status === NOSHOW && (
            <div className='event-status text-consultation font-20 text-center'>[{intl.formatMessage(messages.noShow)}]</div>
          )}
          {event?.flagStatus !== ACTIVE && event?.status === CANCELLED ? event?.dependent?.isRemoved ? (
            <div className='event-status text-consultation font-20 text-center'>[{intl.formatMessage(messages.graduated)}]</div>
          ) : (
            <div className='event-status text-consultation font-20 text-center'>[{intl.formatMessage(messages.cancelled)}]</div>
          ) : null}
          {event?.flagStatus !== ACTIVE && event?.status === DECLINED && (
            <div className='event-status text-consultation font-20 text-center'>[{intl.formatMessage(msgDashboard.declined)}]</div>
          )}
          {event?.flagStatus !== ACTIVE && event?.status === PENDING && event?.previousAppointment && (
            <Popover content={contentConfirm} trigger="click">
              <div className='event-status text-consultation font-20 text-center text-underline cursor'>
                {intl.formatMessage(msgDashboard.rescheduled)}
              </div>
            </Popover>
          )}
          <div className='detail-item flex'>
            <div className='title'>
              <p className='font-18 font-700 title'>{intl.formatMessage(messages.what)}</p>
              {event?.type === SUBSIDY ? <BiDollarCircle size={18} className='mx-10 text-green500' /> : null}
            </div>
            <p className='font-16 flex flex-col'><span>{event?.skillSet?.name}</span><span>{event?.type === CONSULTATION ? '(HMGH Consultation)' : ''}</span></p>
          </div>
          <Popover
            placement="leftTop"
            content={dependentProfile}
            trigger="hover"
            open={isDependentHover}
            onOpenChange={this.handleDependentHoverChange}
          >
            <div className='detail-item flex'>
              <p className='font-18 font-700 title'>{intl.formatMessage(messages.who)}</p>
              <a className='font-18 underline text-primary'>{`${event?.dependent?.firstName ?? ''} ${event?.dependent?.lastName ?? ''}`}</a>
            </div>
          </Popover>
          {event?.type === CONSULTATION ? (
            <div className='detail-item flex'>
              <p className='font-18 font-700 title'>{intl.formatMessage(messages.with)}</p>
              <div className='flex flex-row flex-1'>
                <div className='font-18'>{event?.consultantName || ''}</div>
              </div>
            </div>
          ) : (
            <Popover
              placement="leftTop"
              content={providerProfile}
              trigger="hover"
              open={isProviderHover}
              onOpenChange={this.handleProviderHoverChange}
            >
              <div className='detail-item flex'>
                <p className='font-18 font-700 title'>{intl.formatMessage(messages.with)}</p>
                <div className='flex flex-row flex-1'>
                  <a className='font-18 underline text-primary'>{`${event?.provider?.firstName ?? ''} ${event?.provider?.lastName ?? ''}`}</a>
                </div>
              </div>
            </Popover>
          )}
          <div className='detail-item flex'>
            <p className='font-18 font-700 title'>{intl.formatMessage(messages.when)}</p>
            <p className='font-16'>{event?.type === SCREEN ? event?.screeningTime ?? '' : this.displayDuration(event)}</p>
          </div>
          {[EVALUATION, APPOINTMENT, SUBSIDY].includes(event?.type) && (
            <div className='detail-item flex'>
              <p className='font-18 font-700 title'>{intl.formatMessage(messages.where)}</p>
              <p className='font-18'>{event?.location}</p>
            </div>
          )}
          {[EVALUATION, APPOINTMENT, SUBSIDY].includes(event?.type) && (
            <div className='detail-item flex'>
              <p className='font-18 font-700 title'>{intl.formatMessage(msgCreateAccount.rate)}</p>
              <p className='font-18'>${event?.rate}</p>
            </div>
          )}
          {[EVALUATION, APPOINTMENT, SUBSIDY].includes(event?.type) ? event?.sessionInvoice?._id ? (
            <div className='detail-item flex'>
              <p className='font-18 font-700 title'>{intl.formatMessage(msgCreateAccount.totalDue)}</p>
              <p className={`font-18 text-underline cursor ${!event?.sessionInvoice?.isPaid && 'text-red'}`} onClick={this.onOpenModalInvoice}>${event?.sessionInvoice?.totalPayment}</p>
            </div>
          ) : event?.flagInvoice?._id ? (
            <div className='detail-item flex'>
              <p className='font-18 font-700 title'>{intl.formatMessage(msgCreateAccount.totalDue)}</p>
              <p className={`font-18 text-underline cursor ${!event?.flagInvoice?.isPaid && 'text-red'}`} onClick={this.onOpenModalInvoice}>${event?.flagInvoice?.totalPayment}</p>
            </div>
          ) : null : null}
          {[SCREEN, CONSULTATION].includes(event?.type) && (
            <div className='detail-item flex'>
              <p className='font-18 font-700 title'>{(event?.type === CONSULTATION && event?.meetingLink) ? intl.formatMessage(messages.meeting) : intl.formatMessage(messages.phonenumber)}</p>
              <p className={`font-18 cursor ${(event?.type === CONSULTATION && event?.meetingLink) ? 'text-underline text-primary' : ''}`} onClick={() => (event?.type === CONSULTATION && event?.meetingLink) && window.open(event?.meetingLink)} >{(event?.type === CONSULTATION && event?.meetingLink) ? event?.meetingLink : event?.phoneNumber}</p>
            </div>
          )}
          {event?.addtionalDocuments?.length > 0 ? (
            <div className='detail-item flex'>
              <p className='font-18 font-700 title'>Documents</p>
              <div>
                {event?.addtionalDocuments?.map((document, index) => (
                  <a
                    key={index}
                    href={document.url}
                    className='font-18'
                    target="_blank"
                  >
                    {document.name}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        {(flagEvent && (event?.flagStatus === ACTIVE || moment().isBefore(moment(event?.date)))) ? (
          <div className='text-center font-18 mt-2'>
            {flagEvent.flagType === BALANCE ? (
              <MdOutlineRequestQuote color="#ff0000" size={32} />
            ) : (
              <MdOutlineEventBusy color="#ff0000" size={32} />
            )}
            {event?.flagStatus === ACTIVE ? userRole === 3 ? (
              <div className='flex items-center justify-between gap-2'>
                <Button type='primary' block className='flex-1 h-30 p-0' onClick={this.onOpenModalCreateNote}>
                  {intl.formatMessage(messages.requestClearance)}
                </Button>
                {event?.flagInvoice?.isPaid ? (
                  <Button type='primary' block className='flex-1 h-30 p-0' disabled>
                    {intl.formatMessage(messages.paid)}
                  </Button>
                ) : event?.flagInvoice?.totalPayment == 0 ? null : (
                  <>
                    <Button type='primary' className='flex-1 h-30 p-0' onClick={this.onOpenModalInvoice}>
                      {intl.formatMessage(messages.flagDetails)}
                    </Button>
                    <Button type='primary' block className='h-30 p-0' onClick={() => this.openModalPay(`${window.location.href}?s=${encryptParam('true')}&i=${encryptParam(event?.flagInvoice?._id)}`, event?.flagInvoice?.paidAmount, event?.flagInvoice?.totalPayment, event?.flagInvoice?.minimumPayment)}>
                      {intl.formatMessage(messages.payFlag)}
                    </Button>
                  </>
                )}
              </div>
            ) : userRole === 30 ? (
              event?.flagInvoice?.isPaid ? (
                <Button type='primary' block className='flex-1 h-30 p-0' disabled>
                  {intl.formatMessage(messages.paid)}
                </Button>
              ) : (
                <div className='flex items-center gap-2'>
                  <Button type='primary' className='flex-1 h-30 p-0' onClick={this.onOpenModalInvoice}>
                    {intl.formatMessage(messages.editFlag)}
                  </Button>
                  <Popconfirm
                    title="Are you sure to clear this flag?"
                    onConfirm={this.handleClearFlag}
                    okText="Yes"
                    cancelText="No"
                    placement='left'
                  >
                    <Button type='primary' block className='flex-1 h-30 p-0'>
                      {intl.formatMessage(messages.clearFlag)}
                    </Button>
                  </Popconfirm>
                </div>
              )
            ) : (
              <div className='flex items-center justify-between gap-2 flex-2'>
                <Button type='primary' block className='flex-1 h-30 p-0 px-5' onClick={this.onOpenModalCreateNote}>
                  {intl.formatMessage(messages.requestClearance)}
                </Button>
                {event?.flagInvoice?.isPaid ? (
                  <Button type='primary' block className='flex-1 h-30 p-0' disabled>
                    {intl.formatMessage(messages.paid)}
                  </Button>
                ) : event?.flagInvoice?.totalPayment == 0 ? null : (
                  <>
                    <Button type='primary' className='flex-1 h-30 p-0' onClick={this.onOpenModalInvoice}>
                      {intl.formatMessage(messages.flagDetails)}
                    </Button>
                    <Button type='primary' block className='h-30 p-0' onClick={() => this.openModalPay(`${window.location.href}?s=${encryptParam('true')}&i=${encryptParam(event?.flagInvoice?._id)}`, event?.flagInvoice?.paidAmount, event?.flagInvoice?.totalPayment, event?.flagInvoice?.minimumPayment)}>
                      {intl.formatMessage(messages.payFlag)}
                    </Button>
                    <Popconfirm
                      title="Are you sure to clear this flag?"
                      onConfirm={this.handleClearFlag}
                      okText="Yes"
                      cancelText="No"
                      placement='left'
                    >
                      <Button type='primary' block className='flex-1 h-30 p-0'>
                        {intl.formatMessage(messages.clearFlag)}
                      </Button>
                    </Popconfirm>
                  </>
                )}
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <Input.TextArea name='AppointmentNote' rows={5} className="appointment-note" disabled={!isShowEditNotes} value={notes} onChange={(e) => this.handleChangeNotes(e.target.value)} />
            {isShowEditNotes && (
              <div className='flex gap-2 mt-10'>
                <Button type='primary' block onClick={this.handleUpdateNotes} className='h-30 p-0'>
                  {intl.formatMessage(msgModal.save)}
                </Button>
                <Button type='primary' block onClick={this.hideEditNotes} className='h-30 p-0'>
                  {intl.formatMessage(msgModal.cancel)}
                </Button>
              </div>
            )}
            <div className='post-feedback mt-1'>
              {event?.status !== 0 && (
                <>
                  <p className='font-18 font-700 mb-5'>{intl.formatMessage(messages.feedback)}</p>
                  <Input.TextArea name='AppointmentFeedback' rows={7} className="appointment-feedback" disabled={userRole === 3 ? true : !isShowFeedback} value={publicFeedback} onChange={e => this.handleChangeFeedback(e.target.value)} placeholder={intl.formatMessage(messages.feedback)} />
                </>
              )}
              {isShowFeedback && (
                <Row gutter={15} className="mt-10">
                  <Col span={12}>
                    <Button type='primary' block onClick={this.handleLeaveFeedback} className='h-30 p-0'>
                      {intl.formatMessage(msgModal.save)}
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button type='primary' block onClick={this.hideFeedback} className='h-30 p-0'>
                      {intl.formatMessage(msgModal.cancel)}
                    </Button>
                  </Col>
                </Row>
              )}
            </div>
            <Row gutter={15} className='list-btn-detail'>
              {event?.type === CONSULTATION && event?.status === PENDING && moment().isBefore(moment(event?.date)) && !event?.consultant?._id && userRole === 100 && (
                <Col span={12}>
                  <Popconfirm
                    title="Are you sure to tag this consultation?"
                    onConfirm={this.handleTag}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type='primary' icon={<AiFillTag size={15} />} block className='flex items-center gap-2 h-30'>
                      {intl.formatMessage(messages.tag)}
                    </Button>
                  </Popconfirm>
                </Col>
              )}
              {(event?.status === PENDING && userRole > 3 && ([SCREEN, EVALUATION].includes(event?.type) || (event?.type === CONSULTATION && event?.consultant?._id && (event?.consultant?._id === auth.user?.consultantInfo?._id || userRole > 900)))) && (
                <Col span={12}>
                  <Button type='primary' icon={<BsCheckCircle size={15} />} block onClick={() => this.openModalProcess()} className='flex items-center gap-2 h-30'>
                    {intl.formatMessage(messages.markClosed)}
                  </Button>
                </Col>
              )}
              {[APPOINTMENT, SUBSIDY].includes(event?.type) && event?.status === PENDING && userRole > 3 && (
                <Col span={12}>
                  <Button type='primary' icon={<BsCheckCircle size={15} />} block onClick={this.onOpenModalInvoice} className='flex items-center gap-2 h-30'>
                    {intl.formatMessage(messages.markClosed)}
                  </Button>
                </Col>
              )}
              {[EVALUATION, APPOINTMENT, SUBSIDY].includes(event?.type) && event?.status === CLOSED && !event?.sessionInvoice?.isPaid && !event?.flagInvoice?.isPaid && (userRole === 3 || userRole > 900) && (
                <Col span={12}>
                  <Button type='primary' icon={<BsPaypal size={15} color="#fff" />} block onClick={() => this.openModalPay(`${window.location.href}?s=${encryptParam('true')}&i=${encryptParam(event?.sessionInvoice?._id)}`, event?.sessionInvoice?.paidAmount, event?.sessionInvoice?.totalPayment)}>
                    {intl.formatMessage(messages.payInvoice)}
                  </Button>
                </Col>
              )}
              {[EVALUATION, APPOINTMENT, SUBSIDY].includes(event?.type) && event?.status === CLOSED && (
                <Col span={12}>
                  <Button type='primary' icon={<ImPencil size={12} />} block onClick={this.onOpenModalInvoice}>
                    {intl.formatMessage(messages.viewInvoice)}
                  </Button>
                </Col>
              )}
              {((userRole === 30 || userRole > 900) && event?.status === DECLINED && event?.isAppeal) && (
                <Col span={12}>
                  <Button type='primary' icon={<BsCheckCircle size={15} />} block onClick={this.handleAcceptDeclinedScreening}>
                    {intl.formatMessage(msgModal.accept)}
                  </Button>
                </Col>
              )}
              {((userRole === 3 || userRole > 900) && event?.status === DECLINED) ? event?.isAppeal ? (
                <Col span={12}>
                  <Button type='primary' icon={<TbSend size={12} />} block>
                    {intl.formatMessage(msgModal.appealed)}
                  </Button>
                </Col>
              ) : (
                <Col span={12}>
                  <Button type='primary' icon={<TbSend size={12} />} block onClick={this.openModalMessage}>
                    {intl.formatMessage(msgModal.appeal)}
                  </Button>
                </Col>
              ) : null}
              {isLeaveFeedback && (
                <Col span={12}>
                  <Button type='primary' icon={<ImPencil size={12} />} block onClick={this.showFeedback}>
                    {intl.formatMessage(messages.leaveFeedback)}
                  </Button>
                </Col>
              )}
              {((userRole === 3 || userRole > 900) && [CLOSED, DECLINED].includes(event?.status) && !isLeftFeedback) && (
                <Col span={12}>
                  <Button type='primary' icon={<ImPencil size={12} />} block onClick={this.handleRequestFeedback}>
                    {intl.formatMessage(messages.requestFeedback)}
                  </Button>
                </Col>
              )}
              {isReschedule && (
                <Col span={12}>
                  <Button type='primary' icon={<BsClockHistory size={15} />} block onClick={this.openModalCurrent}>
                    {intl.formatMessage(messages.reschedule)}
                  </Button>
                </Col>
              )}
              {(event?.status === PENDING && moment().isBefore(moment(event?.date)) && event?.type === CONSULTATION && event?.consultant?._id && (event?.consultant?._id === auth.user?.consultantInfo?._id || userRole > 900)) && (
                <Col span={12}>
                  <Popover trigger="click" placement='bottom' overlayClassName='consultant' content={consultants?.length ? (
                    <Radio.Group onChange={e => this.handleSwitchTag(e.target.value)} className="box-card p-10 bg-pastel">
                      <Space direction="vertical">
                        {consultants?.map((consultant, i) => (
                          <Radio key={i} value={consultant?.consultantInfo?._id} className="nobr">{consultant?.username}</Radio>
                        ))}
                      </Space>
                    </Radio.Group>
                  ) : <div className='p-10 bg-pastel'>No consultants to switch</div>}>
                    <Button type='primary' icon={<AiOutlineUserSwitch size={15} />} block>
                      {intl.formatMessage(messages.switchTag)}
                    </Button>
                  </Popover>
                </Col>
              )}
              {(event?.status === PENDING && moment().isBefore(moment(event?.date)) && event?.type === CONSULTATION && event?.consultant?._id && (event?.consultant?._id === auth.user?.consultantInfo?._id || userRole > 900)) && (
                <Col span={12}>
                  <Popconfirm
                    title="Are you sure to remove tag?"
                    onConfirm={this.handleRemoveTag}
                    okText="Yes"
                    cancelText="No"
                    placement='left'
                  >
                    <Button type='primary' icon={<MdOutlineRemove size={15} />} block>
                      {intl.formatMessage(messages.removeTag)}
                    </Button>
                  </Popconfirm>
                </Col>
              )}
              {(event?.flagStatus === NOFLAG && userRole > 3 && [EVALUATION, APPOINTMENT, SUBSIDY].includes(event?.type) && event?.status === PENDING && moment().isAfter(moment(event?.date))) && (
                <Col span={12}>
                  <Button
                    type='primary'
                    icon={<BsFillFlagFill size={15} />}
                    block
                    onClick={this.onShowModalNoShow}
                  >
                    {intl.formatMessage(messages.flagDependent)}
                  </Button>
                </Col>
              )}
              {(userRole === 3 && [EVALUATION, APPOINTMENT, SUBSIDY].includes(event?.type) && event?.flagStatus === ACTIVE) && (
                <Col span={12}>
                  <Button type='primary' icon={<FaFileContract size={12} />} block onClick={this.onOpenModalCreateNote}>
                    {intl.formatMessage(messages.requestClearance)}
                  </Button>
                </Col>
              )}
              {((userRole === 3 || userRole > 900) && event?.status === PENDING && moment().isBefore(moment(event?.date))) && (
                <Col span={12}>
                  <Button type='primary' icon={<ImPencil size={12} />} block onClick={this.showEditNotes}>
                    {intl.formatMessage(messages.editNotes)}
                  </Button>
                </Col>
              )}
              {isCancel && (
                <Col span={12}>
                  <Button type='primary' icon={<BsXCircle size={15} />} block onClick={this.openModalCancel}>
                    {intl.formatMessage(msgModal.cancel)}
                  </Button>
                </Col>
              )}
            </Row>
          </>
        )}
        {errorMessage.length > 0 && (<p className='text-right text-red mr-5'>{errorMessage}</p>)}
        {visibleCancel && <ModalCancelAppointment {...modalCancelProps} />}
        {visibleProcess && <ModalProcessAppointment {...modalProcessProps} />}
        {visibleCurrent && <ModalCurrentAppointment {...modalCurrentProps} />}
        {visibleCurrentReferral && <ModalCurrentReferralService {...modalCurrentReferralProps} />}
        {visibleInvoice && <ModalInvoice {...modalInvoiceProps} />}
        {visibleNoShow && <ModalNoShow {...modalNoShowProps} />}
        {visibleBalance && <ModalBalance {...modalBalanceProps} />}
        {visibleEvaluationProcess && <ModalEvaluationProcess {...modalEvaluationProcessProps} />}
        {visibleModalMessage && <ModalCreateNote {...modalMessageProps} />}
        {visibleCurrentScreen && <ModalNewScreening {...modalCurrentScreeningProps} />}
        {visibleCreateNote && <ModalCreateNote {...modalCreateNoteProps} />}
        {visiblePayment && <ModalPayment {...modalPaymentProps} />}
        {visibleCancelForAdmin && <ModalCancelForAdmin {...modalCancelForAdminProps} />}
        {visiblePay && <ModalPay {...modalPayProps} />}
      </Drawer >
    );
  }
}

const mapStateToProps = state => ({
  appointments: state.appointments.dataAppointments,
  appointmentsMonth: state.appointments.dataAppointmentsMonth,
  auth: state.auth,
});

export default compose(connect(mapStateToProps, { setAppointments, setAppointmentsInMonth, getInvoiceList }))(DrawerDetail);