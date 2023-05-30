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

import { ModalBalance, ModalCancelAppointment, ModalCancelForAdmin, ModalCreateNote, ModalCurrentAppointment, ModalCurrentReferralService, ModalEvaluationProcess, ModalInvoice, ModalNewScreening, ModalNoShow, ModalPayment, ModalProcessAppointment } from '../../components/Modal';
import messages from './messages';
import msgModal from '../Modal/messages';
import msgDashboard from '../../routes/Dashboard/messages';
import msgCreateAccount from '../../routes/Sign/CreateAccount/messages';
import request from '../../utils/api/request';
import { getAppointmentsData, getAppointmentsMonthData } from '../../redux/features/appointmentsSlice';
import { acceptDeclinedScreening, appealRequest, cancelAppointmentForParent, claimConsultation, clearFlag, closeAppointmentAsNoshow, closeAppointmentForProvider, declineAppointmentForProvider, leaveFeedbackForProvider, removeConsultation, requestClearance, requestFeedbackForClient, rescheduleAppointmentForParent, sendEmailInvoice, setFlag, setFlagBalance, setNotificationTime, switchConsultation, updateAppointmentNotesForParent, updateBalanceFlag, updateNoshowFlag } from '../../utils/api/apiList';
import { ACTIVE, ADMIN, APPOINTMENT, BALANCE, CANCEL, CANCELLED, CLOSED, CONSULTATION, DECLINED, EVALUATION, NOFLAG, NOSHOW, PARENT, PENDING, RESCHEDULE, SCREEN, SUBSIDY, SUPERADMIN } from '../../routes/constant';
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
      const desc = <span>A cancellation fee <span className='text-bold'>${event.provider.cancellationFee}</span> must be paid.</span>
      if (auth.user.role === PARENT) {
        this.setState({ paymentDescription: desc });
        message.warn(desc).then(() => {
          this.setState({ visiblePayment: true });
        });
      } else {
        message.warn(desc);
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
    this.setState({ visibleCancel: false }, () => {
      if (event?._id) {
        const data = { appointId: event._id };
        request.post(cancelAppointmentForParent, data).then(result => {
          if (result.success) {
            this.setState({ errorMessage: '' });
            this.updateAppointments();
          } else {
            this.setState({ errorMessage: result.data });
          }
        }).catch(error => {
          this.setState({ errorMessage: error.message });
        })
      }
    });
  }

  submitModalCurrent = () => {
    this.setState({ visibleCurrent: false });
    this.updateAppointments();
  }

  submitModalCurrentReferral = () => {
    this.setState({ visibleCurrentReferral: false });
    this.updateAppointments();
  }

  closeModalCurrent = () => {
    const { event } = this.props;
    event?.type === SCREEN ? this.setState({ visibleCurrentScreen: false }) : event?.type === CONSULTATION ? this.setState({ visibleCurrentReferral: false }) : this.setState({ visibleCurrent: false });
  }

  openModalCurrent = () => {
    const { event } = this.props;
    const { user } = this.props.auth;

    if ([EVALUATION, APPOINTMENT, SUBSIDY].includes(event.type) && [PARENT, ADMIN, SUPERADMIN].includes(user.role) && moment(event.date).subtract(event.provider?.cancellationWindow, 'h').isBefore(moment()) && event.provider?.cancellationFee && !event.isCancellationFeePaid) {
      const desc = <span>A cancellation fee <span className='text-bold'>${event.provider.cancellationFee}</span> must be paid.</span>
      if (user.role === PARENT) {
        this.setState({ paymentDescription: desc });
        message.warn(desc).then(() => {
          this.setState({ visiblePayment: true });
        });
      } else {
        message.warn(desc);
        this.setState({ visibleCancelForAdmin: true, cancellationType: RESCHEDULE });
      }
    } else {
      event?.type === SCREEN ? this.setState({ visibleCurrentScreen: true }) : event?.type === CONSULTATION ? this.setState({ visibleCurrentReferral: true }) : this.setState({ visibleCurrent: true });
    }
  }

  onCloseModalCancelForAdmin = () => {
    this.setState({ visibleCancelForAdmin: false });
  }

  applyFeeToParent = () => {
    const { cancellationType } = this.state;
    const { event } = this.props;
    this.setState({ visibleCancelForAdmin: false });
    if (cancellationType === CANCEL) {
      this.setState({ visibleCancel: true, cancellationType: '' });
    } else if (cancellationType === RESCHEDULE) {
      this.setState({ visibleCurrent: true, cancellationType: '' });
    }

    const postData = {
      appointmentId: event._id,
      type: cancellationType,
      items: [{
        type: event?.type === EVALUATION ? intl.formatMessage(msgModal.evaluation) : event?.type === APPOINTMENT ? intl.formatMessage(msgModal.standardSession) : event?.type === SUBSIDY ? intl.formatMessage(msgModal.subsidizedSession) : '',
        locationDate: `${event.location} ${moment(event.date).format('MM/DD/YYYY hh:mm a')}`,
        rate: event.provider.cancellationFee,
      }],
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
    const { cancellationType } = this.state;
    this.setState({ visibleCancelForAdmin: false });
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
          this.updateAppointments();
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
        note: note,
      }
      request.post(closeAppointmentForProvider, data).then(result => {
        if (result.success) {
          this.setState({ errorMessage: '' });
          this.updateAppointments();
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
          this.updateAppointments();
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
          this.updateAppointments();
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
    if (this.props.event?.type == EVALUATION) {
      this.setState({ visibleInvoice: false, visibleEvaluationProcess: true, items: items });
    } else {
      this.setState({ visibleInvoice: false, visibleProcess: true, items: items });
    }
  }

  cancelModalInvoice = () => {
    this.setState({ visibleInvoice: false });
  }

  handleLeaveFeedback = () => {
    const data = {
      appointmentId: this.props.event._id,
      publicFeedback: this.state.publicFeedback,
    }
    request.post(leaveFeedbackForProvider, data).then(result => {
      if (result.success) {
        this.setState({ errorMessage: '', isShowFeedback: false });
        this.updateAppointments();
      } else {
        this.setState({ errorMessage: result.data });
      }
    }).catch(error => {
      this.setState({ errorMessage: error.message });
    })
  }

  handleRequestFeedback = () => {
    const data = { appointmentId: this.props.event?._id };
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

  updateAppointments() {
    const { calendar, getAppointmentsData, getAppointmentsMonthData } = this.props;
    const { userRole } = this.state;

    getAppointmentsData({ role: userRole });
    const month = calendar.current?._calendarApi.getDate().getMonth() + 1;
    const year = calendar.current?._calendarApi.getDate().getFullYear();
    const dataFetchAppointMonth = {
      role: userRole,
      data: {
        month: month,
        year: year
      }
    };
    getAppointmentsMonthData(dataFetchAppointMonth);
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
    const { event } = this.props;
    const { penalty, program, notes, invoiceNumber } = values;
    const data = {
      _id: event?._id,
      dependent: event?.dependent?._id,
      status: NOSHOW,
      flagStatus: ACTIVE,
      flagType: NOSHOW,
      flagItems: {
        penalty: penalty * 1,
        program: program * 1,
        notes,
        type: event?.type == EVALUATION ? intl.formatMessage(msgModal.evaluation) : event?.type == APPOINTMENT ? intl.formatMessage(msgModal.standardSession) : event?.type == SUBSIDY ? intl.formatMessage(msgModal.subsidizedSession) : '',
        locationDate: `(${event?.location}) Session on ${new Date(event?.date).toLocaleDateString()}`,
        rate: penalty * 1 + program * 1,
        flagType: NOSHOW,
      },
      invoiceNumber,
    }

    request.post(invoiceNumber ? updateNoshowFlag : setFlag, data).then(result => {
      const { success } = result;
      if (success) {
        this.setState({ visibleNoShow: false });
        this.updateAppointments();
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
    const { notes, invoiceNumber } = values;
    const { listAppointmentsRecent, event } = this.props;
    let bulkData = [];

    Object.entries(values)?.forEach(value => {
      if (value?.length) {
        const appointment = listAppointmentsRecent?.find(a => a._id === value[0]);
        if (appointment) {
          bulkData.push({
            updateOne: {
              filter: { _id: value[0] },
              update: {
                $set: {
                  flagStatus: ACTIVE,
                  flagType: BALANCE,
                  flagItems: {
                    flagType: BALANCE,
                    late: value[1] * 1,
                    balance: values[`balance-${appointment._id}`],
                    totalPayment: values[`totalPayment-${appointment.provider?._id}`],
                    rate: values[`totalPayment-${appointment.provider?._id}`],
                    minimumPayment: values[`minimumPayment-${appointment.provider?._id}`] * 1,
                    type: appointment?.type === EVALUATION ? intl.formatMessage(msgModal.evaluation) : appointment?.type === APPOINTMENT ? intl.formatMessage(msgModal.standardSession) : appointment?.type === SUBSIDY ? intl.formatMessage(msgModal.subsidizedSession) : '',
                    locationDate: `(${appointment?.location}) Session on ${new Date(appointment?.date).toLocaleDateString()}`,
                    notes,
                  }
                }
              }
            }
          })
        }
      }
    })

    request.post(invoiceNumber ? updateBalanceFlag : setFlagBalance, { bulkData, invoiceNumber, dependent: event?.dependent?._id }).then(result => {
      const { success } = result;
      if (success) {
        this.onCloseModalBalance();
        this.updateAppointments();
      }
    }).catch(err => message.error(err.message));
  }

  onOpenModalInvoice = () => {
    this.setState({ visibleInvoice: true });
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
        this.updateAppointments();
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
    request.post(rescheduleAppointmentForParent, { screeningTime: data?.time, phoneNumber: data?.phoneNumber, notes: data?.notes, _id: this.props.event?._id }).then(result => {
      if (result.success) {
        this.closeModalCurrent();
        this.updateAppointments();
        message.success("Updated successfully");
      }
    }).catch(err => {
      message.error(err.message);
    });
  }

  handleClearFlag = () => {
    request.post(clearFlag, { _id: this.props.event?._id }).then(result => {
      const { success } = result;
      if (success) {
        message.success('Cleared successfully');
        this.updateAppointments();
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
    this.setState({ visiblePayment: false });
  }

  handleRequestClearance = (requestMessage) => {
    this.onCloseModalCreateNote();
    message.success("Your request has been submitted. Please allow up to 24 hours for the provider to review this.");

    request.post(requestClearance, { appointmentId: this.props.event?._id, message: requestMessage }).catch(err => {
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
          this.updateAppointments();
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
              }
            }
            this.updateAppointments();
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
          this.updateAppointments();
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
          this.updateAppointments();
          message.success("Removed successfully");
        }
      })
      .catch(err => this.setState({ errorMessage: err.message }));
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
    } = this.state;
    const { event, listAppointmentsRecent, auth } = this.props;
    const dependent = { ...event?.dependent, appointments: listAppointmentsRecent?.filter(a => a.dependent?._id === event?.dependent?._id) };
    const appointmentDate = moment(event?.date);
    const consultants = auth.consultants?.filter(consultant => consultant?._id !== auth.user?._id && !listAppointmentsRecent?.find(a => a?.consultant?._id === consultant?.consultantInfo?._id && a.date === event?.date) && consultant?.consultantInfo?.manualSchedule?.find(a => a.dayInWeek === appointmentDate.day() && appointmentDate.isBetween(moment().set({ years: a.fromYear, months: a.fromMonth, dates: a.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }), moment().set({ years: a.toYear, months: a.toMonth, dates: a.toDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 0 }))));
    const flagEvent = listAppointmentsRecent?.find(a => a.dependent?._id === event?.dependent?._id && a.provider?._id === event?.provider?._id && a.flagStatus === ACTIVE);

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
    };
    const modalInvoiceProps = {
      visible: visibleInvoice,
      onSubmit: this.confirmModalInvoice,
      onCancel: this.cancelModalInvoice,
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
    };
    const modalCancelForAdminProps = {
      visible: visibleCancelForAdmin,
      onSubmit: this.waiveFee,
      applyFeeToParent: this.applyFeeToParent,
      onCancel: this.onCloseModalCancelForAdmin,
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
          {event?.flagStatus !== ACTIVE && event?.type === CONSULTATION && event?.status === PENDING && event?.consultant?._id && event.consultant?._id !== auth.user?.consultantInfo?._id && (
            <div className='event-status text-consultation font-20 text-center'>[{intl.formatMessage(messages.claimed)}]</div>
          )}
          {event?.flagStatus !== ACTIVE && event?.status === CLOSED && (
            <div className='event-status text-consultation font-20 text-center'>[{intl.formatMessage(messages.accepted)}]</div>
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
              <BiDollarCircle size={18} className='mx-10 text-green500' />
            </div>
            <p className='font-16 flex flex-col'><span>{event?.skillSet?.name}</span><span>{event.type === CONSULTATION ? '(HMGH Consultation)' : ''}</span></p>
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
                <div className='font-18'>Consultant</div>
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
              <p className={`font-18 ${event?.status === CLOSED ? 'text-underline cursor' : ''} ${!event?.isPaid && 'text-red'}`} onClick={() => event?.status === CLOSED && this.setState({ visibleInvoice: true })}>${event?.items?.length ? event.items?.reduce((a, b) => a += b.rate * 1, 0) : event?.rate}</p>
            </div>
          )}
          {[SCREEN, CONSULTATION].includes(event?.type) && (
            <div className='detail-item flex'>
              <p className='font-18 font-700 title'>{(event?.type === CONSULTATION && event?.meetingLink) ? intl.formatMessage(messages.meeting) : intl.formatMessage(messages.phonenumber)}</p>
              <p className={`font-18 cursor ${(event?.type === CONSULTATION && event?.meetingLink) ? 'text-underline text-primary' : ''}`} onClick={() => (event?.type === CONSULTATION && event?.meetingLink) && window.open(event?.meetingLink)} >{(event?.type === CONSULTATION && event?.meetingLink) ? event?.meetingLink : event?.phoneNumber}</p>
            </div>
          )}
        </div>
        {(flagEvent && (event?.flagStatus === ACTIVE || moment().isBefore(moment(event.date)))) ? (
          <div className='text-center font-18 mt-2'>
            {flagEvent.flagType === BALANCE ? (
              <MdOutlineRequestQuote color="#ff0000" size={32} />
            ) : (
              <MdOutlineEventBusy color="#ff0000" size={32} />
            )}
            {event?.flagStatus === ACTIVE ? userRole === 3 ? (
              <div className='flex items-center justify-between gap-2'>
                {(event?.flagInvoice?.isPaid || event?.flagInvoice?.data?.[0]?.items?.rate == 0) ? (
                  <Button type='primary' block className='flex-1 h-30 p-0' onClick={this.onOpenModalCreateNote}>
                    {intl.formatMessage(messages.requestClearance)}
                  </Button>
                ) : null}
                {event?.flagInvoice?.isPaid ? (
                  <Button type='primary' block className='flex-1 h-30 p-0' disabled>
                    {intl.formatMessage(messages.paid)}
                  </Button>
                ) : event?.flagInvoice?.data?.[0]?.items?.rate == 0 ? null : (
                  <>
                    <Button type='primary' className='flex-1 h-30 p-0' onClick={() => event?.flagType === BALANCE ? this.onShowModalBalance() : event?.flagType === NOSHOW ? this.onShowModalNoShow() : {}}>
                      {intl.formatMessage(messages.flagDetails)}
                    </Button>
                    <form aria-live="polite" className='flex-1' data-ux="Form" action="https://www.paypal.com/cgi-bin/webscr" method="post">
                      <input type="hidden" name="edit_selector" data-aid="EDIT_PANEL_EDIT_PAYMENT_ICON" />
                      <input type="hidden" name="business" value="office@helpmegethelp.org" />
                      <input type="hidden" name="cmd" value="_donations" />
                      <input type="hidden" name="item_name" value="Help Me Get Help" />
                      <input type="hidden" name="item_number" />
                      <input type="hidden" name="amount" value={event?.flagInvoice?.data?.[0]?.items?.rate} data-aid="PAYMENT_HIDDEN_AMOUNT" />
                      <input type="hidden" name="shipping" value="0.00" />
                      <input type="hidden" name="currency_code" value="USD" data-aid="PAYMENT_HIDDEN_CURRENCY" />
                      <input type="hidden" name="rm" value="0" />
                      <input type="hidden" name="return" value={`${window.location.href}?success=true&type=flag&id=${event?._id}`} />
                      <input type="hidden" name="cancel_return" value={window.location.href} />
                      <input type="hidden" name="cbt" value="Return to Help Me Get Help" />
                      <Button type='primary' block className='h-30 p-0' htmlType='submit'>
                        {intl.formatMessage(messages.payFlag)}
                      </Button>
                    </form>
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
                  <Button type='primary' className='flex-1 h-30 p-0' onClick={() => event?.flagType === BALANCE ? this.onShowModalBalance() : event?.flagType === NOSHOW ? this.onShowModalNoShow() : {}}>
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
                {(event?.flagInvoice?.isPaid || event?.flagInvoice?.data?.[0]?.items?.rate == 0) ? (
                  <Button type='primary' block className='flex-1 h-30 p-0 px-5' onClick={this.onOpenModalCreateNote}>
                    {intl.formatMessage(messages.requestClearance)}
                  </Button>
                ) : null}
                {event?.flagInvoice?.isPaid ? (
                  <Button type='primary' block className='flex-1 h-30 p-0' disabled>
                    {intl.formatMessage(messages.paid)}
                  </Button>
                ) : event?.flagInvoice?.data?.[0]?.items?.rate == 0 ? null : (
                  <>
                    <Button type='primary' className='flex-1 h-30 p-0' onClick={() => event?.flagType === BALANCE ? this.onShowModalBalance() : event?.flagType === NOSHOW ? this.onShowModalNoShow() : {}}>
                      {intl.formatMessage(messages.flagDetails)}
                    </Button>
                    <form aria-live="polite" className='flex-1' data-ux="Form" action="https://www.paypal.com/cgi-bin/webscr" method="post">
                      <input type="hidden" name="edit_selector" data-aid="EDIT_PANEL_EDIT_PAYMENT_ICON" />
                      <input type="hidden" name="business" value="office@helpmegethelp.org" />
                      <input type="hidden" name="cmd" value="_donations" />
                      <input type="hidden" name="item_name" value="Help Me Get Help" />
                      <input type="hidden" name="item_number" />
                      <input type="hidden" name="amount" value={event?.flagInvoice?.data?.[0]?.items?.rate} data-aid="PAYMENT_HIDDEN_AMOUNT" />
                      <input type="hidden" name="shipping" value="0.00" />
                      <input type="hidden" name="currency_code" value="USD" data-aid="PAYMENT_HIDDEN_CURRENCY" />
                      <input type="hidden" name="rm" value="0" />
                      <input type="hidden" name="return" value={`${window.location.href}?success=true&type=flag&id=${event?._id}`} />
                      <input type="hidden" name="cancel_return" value={window.location.href} />
                      <input type="hidden" name="cbt" value="Return to Help Me Get Help" />
                      <Button type='primary' block className='h-30 p-0' htmlType='submit'>
                        {intl.formatMessage(messages.payFlag)}
                      </Button>
                    </form>
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
                  <Button type='primary' icon={<AiFillTag size={15} />} block onClick={this.handleTag} className='flex items-center gap-2 h-30'>
                    {intl.formatMessage(messages.tag)}
                  </Button>
                </Col>
              )}
              {event?.type === SCREEN && event?.status === PENDING && userRole > 3 && (
                <Col span={12}>
                  <Button type='primary' icon={<BsCheckCircle size={15} />} block onClick={() => this.openModalProcess()} className='flex items-center gap-2 h-30'>
                    {intl.formatMessage(messages.markClosed)}
                  </Button>
                </Col>
              )}
              {event?.type === EVALUATION && event?.status === PENDING && userRole > 3 && (
                <Col span={12}>
                  <Button type='primary' icon={<BsCheckCircle size={15} />} block onClick={() => this.openModalProcess()} className='flex items-center gap-2 h-30'>
                    {intl.formatMessage(messages.markClosed)}
                  </Button>
                </Col>
              )}
              {event?.type === CONSULTATION && event?.status === PENDING && event?.consultant?._id && (event?.consultant?._id === auth.user?.consultantInfo?._id || userRole > 900) && (
                <Col span={12}>
                  <Button type='primary' icon={<BsCheckCircle size={15} />} block className='flex items-center gap-2 h-30' onClick={() => this.openModalProcess()}>
                    {intl.formatMessage(messages.markClosed)}
                  </Button>
                </Col>
              )}
              {[APPOINTMENT, SUBSIDY].includes(event?.type) && event?.status === PENDING && userRole > 3 && (
                <Col span={12}>
                  <Button type='primary' icon={<BsCheckCircle size={15} />} block onClick={() => this.onOpenModalInvoice()} className='flex items-center gap-2 h-30'>
                    {intl.formatMessage(messages.markClosed)}
                  </Button>
                </Col>
              )}
              {[EVALUATION, APPOINTMENT, SUBSIDY].includes(event?.type) && event?.status === CLOSED && !event?.isPaid && (userRole === 3 || userRole > 900) && (
                <Col span={12}>
                  <form aria-live="polite" data-ux="Form" action="https://www.paypal.com/cgi-bin/webscr" method="post">
                    <input type="hidden" name="edit_selector" data-aid="EDIT_PANEL_EDIT_PAYMENT_ICON" />
                    <input type="hidden" name="business" value="office@helpmegethelp.org" />
                    <input type="hidden" name="cmd" value="_donations" />
                    <input type="hidden" name="item_name" value="Help Me Get Help" />
                    <input type="hidden" name="item_number" />
                    <input type="hidden" name="amount" value={event?.items?.reduce((a, b) => a += b.rate * 1, 0)} data-aid="PAYMENT_HIDDEN_AMOUNT" />
                    <input type="hidden" name="shipping" value="0.00" />
                    <input type="hidden" name="currency_code" value="USD" data-aid="PAYMENT_HIDDEN_CURRENCY" />
                    <input type="hidden" name="rm" value="0" />
                    <input type="hidden" name="return" value={`${window.location.href}?success=true&type=session&id=${event?._id}`} />
                    <input type="hidden" name="cancel_return" value={window.location.href} />
                    <input type="hidden" name="cbt" value="Return to Help Me Get Help" />
                    <Button type='primary' icon={<BsPaypal size={15} color="#fff" />} block htmlType='submit'>
                      {intl.formatMessage(messages.payInvoice)}
                    </Button>
                  </form>
                </Col>
              )}
              {[EVALUATION, APPOINTMENT, SUBSIDY].includes(event?.type) && event?.status === CLOSED && (
                <Col span={12}>
                  <Button type='primary' icon={<ImPencil size={12} />} block onClick={this.onOpenModalInvoice}>
                    {intl.formatMessage(messages.viewInvoice)}
                  </Button>
                </Col>
              )}
              {((userRole === 30 || userRole > 900) && event?.status === DECLINED && event?.type === SCREEN) && (
                <Col span={12}>
                  <Button type='primary' icon={<BsCheckCircle size={15} />} block onClick={this.handleAcceptDeclinedScreening}>
                    {intl.formatMessage(msgModal.accept)}
                  </Button>
                </Col>
              )}
              {(userRole === 3 && event?.status === DECLINED && [EVALUATION, APPOINTMENT, SUBSIDY].includes(event?.type)) && (
                <Col span={12}>
                  <Button type='primary' icon={<TbSend size={12} />} block onClick={this.openModalMessage}>
                    {intl.formatMessage(msgModal.appeal)}
                  </Button>
                </Col>
              )}
              {(userRole !== 3 && !isShowFeedback && [CLOSED, DECLINED].includes(event?.status) && event?.type !== CONSULTATION) && (
                <Col span={12}>
                  <Button type='primary' icon={<ImPencil size={12} />} block onClick={this.showFeedback}>
                    {intl.formatMessage(messages.leaveFeedback)}
                  </Button>
                </Col>
              )}
              {(!isShowFeedback && [CLOSED, DECLINED].includes(event?.status) && event?.type === CONSULTATION && event?.consultant?._id && (event?.consultant?._id === auth.user?.consultantInfo?._id || userRole > 900)) && (
                <Col span={12}>
                  <Button type='primary' icon={<ImPencil size={12} />} block onClick={this.showFeedback}>
                    {intl.formatMessage(messages.leaveFeedback)}
                  </Button>
                </Col>
              )}
              {(userRole === 3 && [CLOSED, DECLINED].includes(event?.status) && !isLeftFeedback) && (
                <Col span={12}>
                  <Button type='primary' icon={<ImPencil size={12} />} block onClick={this.handleRequestFeedback}>
                    {intl.formatMessage(messages.requestFeedback)}
                  </Button>
                </Col>
              )}
              {(event?.status === PENDING && moment().isBefore(moment(event?.date)) && event?.type !== CONSULTATION) && (
                <Col span={12}>
                  <Button type='primary' icon={<BsClockHistory size={15} />} block onClick={this.openModalCurrent}>
                    {intl.formatMessage(messages.reschedule)}
                  </Button>
                </Col>
              )}
              {(event?.status === PENDING && moment().isBefore(moment(event?.date)) && event?.type === CONSULTATION && (userRole === 3 || userRole > 900 || (userRole === 100 && event?.consultant?._id && event?.consultant?._id === auth.user?.consultantInfo?._id))) && (
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
                  <Button type='primary' icon={<MdOutlineRemove size={15} />} block onClick={this.handleRemoveTag}>
                    {intl.formatMessage(messages.removeTag)}
                  </Button>
                </Col>
              )}
              {(event.flagStatus === NOFLAG && userRole > 3 && [EVALUATION, APPOINTMENT, SUBSIDY].includes(event?.type) && event?.status === PENDING && moment().isAfter(moment(event?.date))) && (
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
              {(userRole === 3 && [EVALUATION, APPOINTMENT, SUBSIDY].includes(event?.type) && event?.status === CLOSED && event?.flagStatus === NOFLAG) && (
                <Col span={12}>
                  <Button type='primary' icon={<FaFileContract size={12} />} block >
                    {intl.formatMessage(messages.requestInvoice)}
                  </Button>
                </Col>
              )}
              {(userRole === 3 && [EVALUATION, APPOINTMENT, SUBSIDY].includes(event?.type) && event?.flagStatus === ACTIVE && (event?.isPaid || event?.flagInvoice?.data?.[0]?.items?.rate == 0)) && (
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
              {event?.status === PENDING && moment().isBefore(moment(event?.date)) && event?.type !== CONSULTATION && (
                <Col span={12}>
                  <Button type='primary' icon={<BsXCircle size={15} />} block onClick={this.openModalCancel}>
                    {intl.formatMessage(msgModal.cancel)}
                  </Button>
                </Col>
              )}
              {(event?.status === PENDING && moment().isBefore(moment(event?.date)) && event?.type === CONSULTATION && (userRole === 3 || userRole > 900 || (userRole === 100 && event?.consultant?._id && event?.consultant?._id === auth.user?.consultantInfo?._id))) && (
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
      </Drawer >
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
});

export default compose(connect(mapStateToProps, { getAppointmentsData, getAppointmentsMonthData }))(DrawerDetail);