import React, { Component } from 'react';
import { Drawer, Button, Row, Col, Typography, Popover, Input, message, Popconfirm } from 'antd';
import { BsBell, BsCheckCircle, BsClockHistory, BsFillFlagFill, BsPaypal, BsXCircle } from 'react-icons/bs';
import { BiDollarCircle } from 'react-icons/bi';
import { FaFileContract } from 'react-icons/fa';
import { ImPencil } from 'react-icons/im';
import { TbSend } from 'react-icons/tb';
import { MdOutlineEventBusy, MdOutlineRequestQuote } from 'react-icons/md';
import intl from "react-intl-universal";
import moment from 'moment';

import { ModalBalance, ModalCancelAppointment, ModalCreateNote, ModalCurrentAppointment, ModalCurrentReferralService, ModalEvaluationProcess, ModalInvoice, ModalNewScreening, ModalNoShow, ModalProcessAppointment } from '../../components/Modal';
import messages from './messages';
import msgModal from '../Modal/messages';
import msgDashboard from '../../routes/Dashboard/messages';
import msgCreateAccount from '../../routes/Sign/CreateAccount/messages';
import request from '../../utils/api/request';
import { store } from '../../redux/store';
import { getAppointmentsData, getAppointmentsMonthData } from '../../redux/features/appointmentsSlice';
import { acceptDeclinedScreening, appealRequest, cancelAppointmentForParent, clearFlag, closeAppointmentForProvider, declineAppointmentForProvider, leaveFeedbackForProvider, requestClearance, requestFeedbackForClient, rescheduleAppointmentForParent, setFlag, updateAppointmentNotesForParent } from '../../utils/api/apiList';
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
      isModalInvoice: false,
      publicFeedback: this.props.event?.publicFeedback ?? '',
      isLeftFeedback: !!this.props.event?.publicFeedback,
      isShowFeedback: false,
      userRole: store.getState().auth.user?.role,
      visibleProcess: false,
      visibleCurrentReferral: false,
      visibleNoShow: false,
      visibleBalance: false,
      isFlag: this.props.event?.flagStatus,
      note: '',
      visibleEvaluationProcess: false,
      items: [],
      visibleModalMessage: false,
      visibleCurrentScreen: false,
      visibleCreateNote: false,
    };
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
    this.setState({ visibleCancel: true });
  }

  handleChangeFeedback = feedback => {
    this.setState({ publicFeedback: feedback });
  }

  handleConfirmCancel = () => {
    this.setState({ visibleCancel: false }, () => {
      if (this.props.event?._id) {
        const data = { appointId: this.props.event._id };
        request.post(cancelAppointmentForParent, data).then(result => {
          if (result.success) {
            this.setState({ errorMessage: '' });
            this.updateAppointments();
          } else {
            this.setState({ errorMessage: result.data });
          }
        }).catch(error => {
          console.log('closed error---', error);
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
    this.props.event?.type == 1 ? this.setState({ visibleCurrentScreen: false }) : this.props.event?.type == 4 ? this.setState({ visibleCurrentReferral: false }) : this.setState({ visibleCurrent: false });
  }

  openModalCurrent = () => {
    this.props.event?.type == 1 ? this.setState({ visibleCurrentScreen: true }) : this.props.event?.type == 4 ? this.setState({ visibleCurrentReferral: true }) : this.setState({ visibleCurrent: true });
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
    if (this.props.event?._id) {
      const data = { appointmentId: this.props.event._id, notes: this.state.notes };
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
        console.log('update edit notes error---', err);
        this.setState({ errorMessage: err.message });
      })
    }
  }

  displayDuration = (event) => {
    let duration = event?.provider?.duration ?? 30;
    if (event?.type == 2) {
      duration = event?.provider?.separateEvaluationDuration;
    }
    return `${moment(event?.date).format('MM/DD/YYYY hh:mm a')} - ${moment(event?.date).clone().add(duration, 'minutes').format('hh:mm a')}`;
  }

  handleMarkAsClosed = (items, skipEvaluation, note, publicFeedback) => {
    this.setState({ visibleProcess: false, isModalInvoice: false });

    if (this.props.event?._id) {
      const data = {
        appointmentId: this.props.event._id,
        publicFeedback: publicFeedback ? publicFeedback : this.state.publicFeedback,
        skipEvaluation: skipEvaluation,
        items: items,
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
        console.log('closed error---', error);
        this.setState({ errorMessage: error.message });
      })
    }
  }

  handleDecline = (note, publicFeedback) => {
    this.setState({ visibleProcess: false, isModalInvoice: false });

    if (this.props.event?._id) {
      const data = {
        appointmentId: this.props.event._id,
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
        console.log('closed error---', error);
        this.setState({ errorMessage: error.message });
      })
    }
  }

  confirmModalProcess = (note, publicFeedback) => {
    if (this.props.event?.type == 2) {
      this.setState({ visibleProcess: false, isModalInvoice: true, note: note, publicFeedback: publicFeedback });
    } else {
      this.handleMarkAsClosed(this.state.items, false, note, publicFeedback);
    }
  }

  confirmModalInvoice = (items) => {
    if (this.props.event?.type == 2) {
      this.setState({ isModalInvoice: false, visibleEvaluationProcess: true, items: items });
    } else {
      this.setState({ isModalInvoice: false, visibleProcess: true, items: items });
    }
  }

  cancelModalInvoice = () => {
    this.setState({ isModalInvoice: false });
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
      console.log('closed error---', error);
      this.setState({ errorMessage: error.message });
    })
  }

  handleRequestFeedback = () => {
    const data = { providerInfoId: this.props.event.provider?._id };
    request.post(requestFeedbackForClient, data).then(result => {
      if (result.success) {
        message.success('The request has been sent successfully.');
      } else {
        this.setState({ errorMessage: result.data });
      }
    }).catch(error => {
      console.log('closed error---', error);
      this.setState({ errorMessage: error.message });
    })
  }

  updateAppointments() {
    const { userRole } = this.state;
    store.dispatch(getAppointmentsData({ role: userRole }));
    const month = this.props.calendar.current?._calendarApi.getDate().getMonth() + 1;
    const year = this.props.calendar.current?._calendarApi.getDate().getFullYear();
    const dataFetchAppointMonth = {
      role: userRole,
      data: {
        month: month,
        year: year
      }
    };
    store.dispatch(getAppointmentsMonthData(dataFetchAppointMonth));
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
    const data = {
      _id: event?._id,
      flagItems: {
        ...values,
        type: event?.type == 2 ? intl.formatMessage(msgModal.evaluation) : event?.type == 3 ? intl.formatMessage(msgModal.standardSession) : event?.type == 5 ? intl.formatMessage(msgModal.subsidizedSession) : '',
        locationDate: `(${event?.location}) Session on ${new Date(event?.date).toLocaleDateString()}`,
        rate: values?.penalty + values?.program,
        flagType: 2,
      }
    }
    request.post(setFlag, data).then(result => {
      const { success } = result;
      if (success) {
        this.setState({ visibleNoShow: false, isFlag: true });
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
    const { event } = this.props;
    const data = {
      _id: event?._id,
      flagItems: {
        ...values,
        type: event?.type == 2 ? intl.formatMessage(msgModal.evaluation) : event?.type == 3 ? intl.formatMessage(msgModal.standardSession) : event?.type == 5 ? intl.formatMessage(msgModal.subsidizedSession) : '',
        locationDate: `(${event?.location}) Session on ${new Date(event?.date).toLocaleDateString()}`,
        rate: values?.late,
        flagType: 1,
      }
    }
    request.post(setFlag, data).then(result => {
      const { success } = result;
      if (success) {
        this.setState({ visibleBalance: false, isFlag: true });
        this.updateAppointments();
      }
    })
  }

  onOpenModalInvoice = () => {
    this.setState({ isModalInvoice: true });
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

  handleRequestClearance = (requestMessage) => {
    this.onCloseModalCreateNote();
    message.success("Your request has been submitted. Please allow up to 24 hours for the provider to review this.");

    request.post(requestClearance, { appointmentId: this.props.event?._id, message: requestMessage }).catch(err => {
      message.error(err.message);
    })
  }

  render() {
    const { isProviderHover, isDependentHover, visibleCancel, visibleProcess, visibleCurrent, isShowEditNotes, notes, publicFeedback, isModalInvoice, isLeftFeedback, userRole, visibleCurrentReferral, isShowFeedback, visibleNoShow, visibleBalance, isFlag, visibleEvaluationProcess, errorMessage, visibleModalMessage, visibleCurrentScreen, visibleCreateNote } = this.state;
    const { event, listAppointmentsRecent } = this.props;

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
            <p className='font-16 mb-0 text-bold'>Skillset(s):</p>
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
            <div className='text-bold'>Skillset</div>
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
      visible: isModalInvoice,
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

    const contentConfirm = (
      <div className='confirm-content'>
        <Row gutter={10}>
          <Col xs={24} sm={24} md={12} className="flex flex-col">
            <p className='font-16 text-center mb-0'>{intl.formatMessage(msgModal.old)}</p>
            <div className='new-content flex-1'>
              <p className='font-16 font-700'>{event?.previousAppointment?.type === 1 ? intl.formatMessage(msgModal.screening) : event?.previousAppointment?.type === 2 ? intl.formatMessage(msgModal.evaluation) : event?.previousAppointment?.type === 3 ? intl.formatMessage(msgModal.appointment) : event?.previousAppointment?.type === 4 ? intl.formatMessage(msgModal.consultation) : ''}</p>
              <p className='font-16'>{`${event?.previousAppointment?.dependent?.firstName ?? ''} ${event?.previousAppointment?.dependent?.lastName ?? ''}`}</p>
              <p className='font-16'>{`${event?.previousAppointment?.provider?.firstName ?? ''} ${event?.previousAppointment?.provider?.lastName ?? ''}`}</p>
              {event?.previousAppointment?.type === 1 ? (
                <p className='font-16 whitespace-nowrap'>{intl.formatMessage(messages.phonenumber)}: {event?.previousAppointment?.phoneNumber}</p>
              ) : event?.previousAppointment?.type === 4 ? (
                <p className='font-16'>{event?.previousAppointment?.meetingLink ? intl.formatMessage(messages.meeting) : intl.formatMessage(messages.phonenumber)}: {event?.previousAppointment?.meetingLink ? event?.previousAppointment?.meetingLink : event?.previousAppointment?.phoneNumber}</p>
              ) : (
                <p className='font-16'>{intl.formatMessage(messages.where)}: {event?.previousAppointment?.location}</p>
              )}
              <p className='font-16 nobr'>{intl.formatMessage(messages.when)}: <span className='font-16 font-700'>{event?.previousAppointment?.type === 1 ? event?.previousAppointment?.screeningTime ?? '' : this.displayDuration(event?.previousAppointment)}</span></p>
            </div>
          </Col>
          <Col xs={24} sm={24} md={12} className="flex flex-col">
            <p className='font-16 text-center mb-0'>{intl.formatMessage(msgModal.current)}</p>
            <div className='current-content flex-1'>
              <p className='font-16 font-700'>{event?.type === 1 ? intl.formatMessage(msgModal.screening) : event?.type === 2 ? intl.formatMessage(msgModal.evaluation) : event?.type === 3 ? intl.formatMessage(msgModal.appointment) : event?.type === 4 ? intl.formatMessage(msgModal.consultation) : ''}</p>
              <p className='font-16'>{`${event?.dependent?.firstName ?? ''} ${event?.dependent?.lastName ?? ''}`}</p>
              <p className='font-16'>{`${event?.provider?.firstName ?? ''} ${event?.provider?.lastName ?? ''}`}</p>
              {event?.type === 1 ? (
                <p className='font-16 whitespace-nowrap'>{intl.formatMessage(messages.phonenumber)}: {event?.phoneNumber}</p>
              ) : event?.type === 4 ? (
                <p className='font-16'>{event?.meetingLink ? intl.formatMessage(messages.meeting) : intl.formatMessage(messages.phonenumber)}: {event?.meetingLink ? event?.meetingLink : event?.phoneNumber}</p>
              ) : (
                <p className='font-16'>{intl.formatMessage(messages.where)}: {event?.location}</p>
              )}
              <p className='font-16 nobr'>{intl.formatMessage(messages.when)}: <span className='font-16 font-700'>{event?.type === 1 ? event?.screeningTime ?? '' : this.displayDuration(event)}</span></p>
            </div>
          </Col>
        </Row>
      </div>
    );

    return (
      <Drawer
        title={event?.type === 1 ? intl.formatMessage(messages.screeningDetails) : event?.type === 2 ? intl.formatMessage(messages.evaluationDetails) : event?.type === 3 ? intl.formatMessage(messages.appointmentDetails) : intl.formatMessage(messages.consultationDetails)}
        closable={true}
        onClose={() => this.props.onClose()}
        open={this.props.visible}
        extra={
          <Button type='text' icon={<BsBell size={18} />} />
        }
      >
        <div>
          {event?.flagStatus === 1 && event?.flagItems?.flagType === 1 && (
            <div className='text-center'><MdOutlineRequestQuote color="#ff0000" size={32} /></div>
          )}
          {event?.flagStatus === 1 && event?.flagItems?.flagType === 2 && (
            <div className='text-center'><MdOutlineEventBusy color="#ff0000" size={32} /></div>
          )}
          {event?.flagStatus !== 1 && event?.status === -1 && (
            <div className='event-status text-consultation font-20 text-center'>[{intl.formatMessage(messages.accepted)}]</div>
          )}
          {event?.flagStatus !== 1 && event?.status === -2 ? event?.dependent?.isRemoved ? (
            <div className='event-status text-consultation font-20 text-center'>[{intl.formatMessage(messages.graduated)}]</div>
          ) : (
            <div className='event-status text-consultation font-20 text-center'>[{intl.formatMessage(messages.cancelled)}]</div>
          ) : null}
          {event?.flagStatus !== 1 && event?.status === -3 && (
            <div className='event-status text-consultation font-20 text-center'>[{intl.formatMessage(msgDashboard.declined)}]</div>
          )}
          {event?.flagStatus !== 1 && event?.status === 0 && event?.previousAppointment && (
            <Popover
              content={contentConfirm}
              trigger="click"
            >
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
            <p className='font-16 flex flex-col'><span>{event?.skillSet?.name}</span><span>{event.type === 4 ? '(HMGH Consultation)' : ''}</span></p>
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
          {event?.type === 4 ? (
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
            <p className='font-16'>{event?.type === 1 ? event?.screeningTime ?? '' : this.displayDuration(event)}</p>
          </div>
          {[2, 3, 5].includes(event?.type) && (
            <div className='detail-item flex'>
              <p className='font-18 font-700 title'>{intl.formatMessage(messages.where)}</p>
              <p className='font-18'>{event?.location}</p>
            </div>
          )}
          {[2, 3, 5].includes(event?.type) && (
            <div className='detail-item flex'>
              <p className='font-18 font-700 title'>{intl.formatMessage(msgCreateAccount.rate)}</p>
              <p className={`font-18 ${(event?.flagStatus === 1 || event?.flagStatus === 2 || (event?.flagStatus === 0 && event?.status === -1)) ? 'text-underline cursor' : ''} ${!event?.isPaid && 'text-red'}`} onClick={() => (event?.flagStatus === 1 || event?.flagStatus === 2 || (event?.flagStatus === 0 && event?.status === -1)) && this.setState({ isModalInvoice: true })}>${event?.items?.length ? event.items?.reduce((a, b) => a += b.rate * 1, 0) : event?.rate}</p>
            </div>
          )}
          {[1, 4].includes(event?.type) && (
            <div className='detail-item flex'>
              <p className='font-18 font-700 title'>{(event?.type === 4 && event?.meetingLink) ? intl.formatMessage(messages.meeting) : intl.formatMessage(messages.phonenumber)}</p>
              <p className={`font-18 cursor ${(event?.type === 4 && event?.meetingLink) ? 'text-underline text-primary' : ''}`} onClick={() => (event?.type === 4 && event?.meetingLink) && window.open(event?.meetingLink)} >{(event?.type === 4 && event?.meetingLink) ? event?.meetingLink : event?.phoneNumber}</p>
            </div>
          )}
        </div>
        {listAppointmentsRecent?.find(a => a.dependent?._id === event?.dependent?._id && a.provider?._id === event?.provider?._id && a.flagStatus === 1) ? (
          <div className='text-center font-18 mt-2'>
            {listAppointmentsRecent?.find(a => a.dependent?._id === event?.dependent?._id && a.provider?._id === event?.provider?._id && a.flagStatus === 1).flagItems?.flagType === 1 ? (
              <MdOutlineRequestQuote color="#ff0000" size={32} />
            ) : (
              <MdOutlineEventBusy color="#ff0000" size={32} />
            )}
            {event?.flagStatus === 1 ? userRole === 3 ? (
              <div className='flex items-center justify-between gap-2'>
                {(event?.isPaid || event?.flagItems?.rate == 0) ? (
                  <Button
                    type='primary'
                    block
                    className='flex-1 h-30 p-0'
                    onClick={this.onOpenModalCreateNote}
                  >
                    {intl.formatMessage(messages.requestClearance)}
                  </Button>
                ) : null}
                {event?.isPaid ? (
                  <Button
                    type='primary'
                    block
                    className='flex-1 h-30 p-0'
                    disabled
                  >
                    {intl.formatMessage(messages.paid)}
                  </Button>
                ) : event?.flagItems?.rate == 0 ? null : (
                  <form aria-live="polite" className='flex-1' data-ux="Form" action="https://www.paypal.com/cgi-bin/webscr" method="post">
                    <input type="hidden" name="edit_selector" data-aid="EDIT_PANEL_EDIT_PAYMENT_ICON" />
                    <input type="hidden" name="business" value="office@helpmegethelp.org" />
                    <input type="hidden" name="cmd" value="_donations" />
                    <input type="hidden" name="item_name" value="Help Me Get Help" />
                    <input type="hidden" name="item_number" />
                    <input type="hidden" name="amount" value={event?.flagItems?.rate} data-aid="PAYMENT_HIDDEN_AMOUNT" />
                    <input type="hidden" name="shipping" value="0.00" />
                    <input type="hidden" name="currency_code" value="USD" data-aid="PAYMENT_HIDDEN_CURRENCY" />
                    <input type="hidden" name="rm" value="0" />
                    <input type="hidden" name="return" value={`${window.location.href}?success=true&id=${event?._id}`} />
                    <input type="hidden" name="cancel_return" value={window.location.href} />
                    <input type="hidden" name="cbt" value="Return to Help Me Get Help" />
                    <Button
                      type='primary'
                      block
                      className='h-30 p-0'
                      htmlType='submit'
                    >
                      {intl.formatMessage(messages.payFlag)}
                    </Button>
                  </form>
                )}
              </div>
            ) : userRole === 30 ? (
              <Popconfirm
                title="Are you sure to clear this flag?"
                onConfirm={this.handleClearFlag}
                okText="Yes"
                cancelText="No"
                overlayClassName='clear-flag-confirm'
              >
                <Button
                  type='primary'
                  block
                  className='h-30 p-0'
                >
                  {intl.formatMessage(messages.clearFlag)}
                </Button>
              </Popconfirm>
            ) : (
              <div className='flex items-center justify-between gap-2'>
                {(event?.isPaid || event?.flagItems?.rate == 0) ? (
                  <Button
                    type='primary'
                    block
                    className='flex-1 h-30 p-0 px-5'
                    onClick={this.onOpenModalCreateNote}
                  >
                    {intl.formatMessage(messages.requestClearance)}
                  </Button>
                ) : null}
                {event?.isPaid ? (
                  <Button
                    type='primary'
                    block
                    className='flex-1 h-30 p-0'
                    disabled
                  >
                    {intl.formatMessage(messages.paid)}
                  </Button>
                ) : event?.flagItems?.rate == 0 ? null : (
                  <form aria-live="polite" className='flex-1' data-ux="Form" action="https://www.paypal.com/cgi-bin/webscr" method="post">
                    <input type="hidden" name="edit_selector" data-aid="EDIT_PANEL_EDIT_PAYMENT_ICON" />
                    <input type="hidden" name="business" value="office@helpmegethelp.org" />
                    <input type="hidden" name="cmd" value="_donations" />
                    <input type="hidden" name="item_name" value="Help Me Get Help" />
                    <input type="hidden" name="item_number" />
                    <input type="hidden" name="amount" value={event?.flagItems?.rate} data-aid="PAYMENT_HIDDEN_AMOUNT" />
                    <input type="hidden" name="shipping" value="0.00" />
                    <input type="hidden" name="currency_code" value="USD" data-aid="PAYMENT_HIDDEN_CURRENCY" />
                    <input type="hidden" name="rm" value="0" />
                    <input type="hidden" name="return" value={`${window.location.href}?success=true&id=${event?._id}`} />
                    <input type="hidden" name="cancel_return" value={window.location.href} />
                    <input type="hidden" name="cbt" value="Return to Help Me Get Help" />
                    <Button
                      type='primary'
                      block
                      className='h-30 p-0'
                      htmlType='submit'
                    >
                      {intl.formatMessage(messages.payFlag)}
                    </Button>
                  </form>
                )}
                <Popconfirm
                  title="Are you sure to clear this flag?"
                  onConfirm={this.handleClearFlag}
                  okText="Yes"
                  cancelText="No"
                  overlayClassName='clear-flag-confirm'
                >
                  <Button
                    type='primary'
                    block
                    className='flex-1 h-30 p-0'
                  >
                    {intl.formatMessage(messages.clearFlag)}
                  </Button>
                </Popconfirm>
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <Input.TextArea rows={5} className="appointment-note" disabled={!isShowEditNotes} value={notes} onChange={(e) => this.handleChangeNotes(e.target.value)} />
            {isShowEditNotes && (
              <div className='flex gap-2 mt-10'>
                <Button
                  type='primary'
                  block
                  onClick={this.handleUpdateNotes}
                  className='h-30 p-0'
                >
                  {intl.formatMessage(msgModal.save)}
                </Button>
                <Button
                  type='primary'
                  block
                  onClick={this.hideEditNotes}
                  className='h-30 p-0'
                >
                  {intl.formatMessage(messages.cancel)}
                </Button>
              </div>
            )}
            <div className='post-feedback mt-1'>
              {event?.status !== 0 && (
                <>
                  <p className='font-18 font-700 mb-5'>{intl.formatMessage(messages.feedback)}</p>
                  <Input.TextArea rows={7} className="appointment-feedback" disabled={userRole === 3 ? true : !isShowFeedback} value={publicFeedback} onChange={e => this.handleChangeFeedback(e.target.value)} placeholder={intl.formatMessage(messages.feedback)} />
                </>
              )}
              {isShowFeedback && (
                <Row gutter={15} className="mt-10">
                  <Col span={12}>
                    <Button
                      type='primary'
                      block
                      onClick={this.handleLeaveFeedback}
                      className='h-30 p-0'
                    >
                      {intl.formatMessage(msgModal.save)}
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button
                      type='primary'
                      block
                      onClick={this.hideFeedback}
                      className='h-30 p-0'
                    >
                      {intl.formatMessage(messages.cancel)}
                    </Button>
                  </Col>
                </Row>
              )}
            </div>
            <Row gutter={15} className='list-btn-detail'>
              {event?.type === 1 && event?.status === 0 && userRole > 3 && (
                <Col span={12}>
                  <Button
                    type='primary'
                    icon={<BsCheckCircle size={15} />}
                    block
                    onClick={() => this.openModalProcess()}
                    className='flex items-center gap-2 h-30'
                  >
                    {intl.formatMessage(messages.markClosed)}
                  </Button>
                </Col>
              )}
              {[2, 4].includes(event?.type) && event?.status === 0 && userRole > 3 && (
                <Col span={12}>
                  <Button
                    type='primary'
                    icon={<BsCheckCircle size={15} />}
                    block
                    onClick={() => event.type === 2 ? this.openModalProcess() : this.handleMarkAsClosed()}
                    className='flex items-center gap-2 h-30'
                  >
                    {intl.formatMessage(messages.markClosed)}
                  </Button>
                </Col>
              )}
              {[3, 5].includes(event?.type) && event?.status === 0 && userRole > 3 && (
                <Col span={12}>
                  <Button
                    type='primary'
                    icon={<BsCheckCircle size={15} />}
                    block
                    onClick={() => this.onOpenModalInvoice()}
                    className='flex items-center gap-2 h-30'
                  >
                    {intl.formatMessage(messages.markClosed)}
                  </Button>
                </Col>
              )}
              {[2, 3, 5].includes(event?.type) && event?.status === -1 && !event?.isPaid && (userRole === 3 || userRole > 900) && (
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
                    <input type="hidden" name="return" value={`${window.location.href}?success=true&id=${event?._id}`} />
                    <input type="hidden" name="cancel_return" value={window.location.href} />
                    <input type="hidden" name="cbt" value="Return to Help Me Get Help" />
                    <Button type='primary' icon={<BsPaypal size={15} color="#fff" />} block htmlType='submit'>
                      {intl.formatMessage(messages.payInvoice)}
                    </Button>
                  </form>
                </Col>
              )}
              {[2, 3, 5].includes(event?.type) && event?.status === -1 && (
                <Col span={12}>
                  <Button
                    type='primary'
                    icon={<ImPencil size={12} />}
                    block
                    onClick={this.onOpenModalInvoice}
                  >
                    {intl.formatMessage(messages.viewInvoice)}
                  </Button>
                </Col>
              )}
              {((userRole === 30 || userRole > 900) && event?.status === -3 && event?.type === 1) && (
                <Col span={12}>
                  <Button
                    type='primary'
                    icon={<BsCheckCircle size={15} />}
                    block
                    onClick={this.handleAcceptDeclinedScreening}
                  >
                    {intl.formatMessage(msgModal.accept)}
                  </Button>
                </Col>
              )}
              {(userRole === 3 && event?.status === -3 && [2, 3, 5].includes(event?.type)) && (
                <Col span={12}>
                  <Button
                    type='primary'
                    icon={<TbSend size={12} />}
                    block
                    onClick={this.openModalMessage}
                  >
                    {intl.formatMessage(msgModal.appeal)}
                  </Button>
                </Col>
              )}
              {(userRole !== 3 && !isShowFeedback && ![0, -2].includes(event?.status)) && (
                <Col span={12}>
                  <Button
                    type='primary'
                    icon={<ImPencil size={12} />}
                    block
                    onClick={this.showFeedback}
                  >
                    {intl.formatMessage(messages.leaveFeedback)}
                  </Button>
                </Col>
              )}
              {(userRole === 3 && ![0, -2].includes(event?.status) && !isLeftFeedback) && (
                <Col span={12}>
                  <Button
                    type='primary'
                    icon={<ImPencil size={12} />}
                    block
                    onClick={this.handleRequestFeedback}
                  >
                    {intl.formatMessage(messages.requestFeedback)}
                  </Button>
                </Col>
              )}
              {(event?.status === 0 && moment().isBefore(moment(event?.date))) && (
                <Col span={12}>
                  <Button
                    type='primary'
                    icon={<BsClockHistory size={15} />}
                    block
                    onClick={this.openModalCurrent}
                  >
                    {intl.formatMessage(messages.reschedule)}
                  </Button>
                </Col>
              )}
              {(!isFlag && userRole > 3 && [2, 3, 5].includes(event?.type) && (event?.status === -1 || event?.status === 0)) && (
                <Col span={12}>
                  <Button
                    type='primary'
                    icon={<BsFillFlagFill size={15} />}
                    block
                    onClick={() => {
                      event?.status === 0 && moment().isBefore(moment(event?.date)) && this.onShowModalBalance();
                      event?.status === 0 && moment().isAfter(moment(event?.date)) && this.onShowModalNoShow();
                      event?.status === -1 && this.onShowModalBalance();
                    }}
                  >
                    {intl.formatMessage(messages.flagDependent)}
                  </Button>
                </Col>
              )}
              {event?.status === 0 && (
                <Col span={12}>
                  <Button
                    type='primary'
                    icon={<BsXCircle size={15} />}
                    block
                    onClick={this.openModalCancel}
                  >
                    {intl.formatMessage(msgModal.cancel)}
                  </Button>
                </Col>
              )}
              {(userRole === 3 && [2, 3, 5].includes(event?.type) && event?.status === -1 && event?.flagStatus === 0) && (
                <Col span={12}>
                  <Button
                    type='primary'
                    icon={<FaFileContract size={12} />}
                    block
                  >
                    {intl.formatMessage(messages.requestInvoice)}
                  </Button>
                </Col>
              )}
              {(userRole === 3 && [2, 3, 5].includes(event?.type) && event?.flagStatus === 1 && (event?.isPaid || event?.flagItems?.rate == 0)) && (
                <Col span={12}>
                  <Button
                    type='primary'
                    icon={<FaFileContract size={12} />}
                    block
                    onClick={this.onOpenModalCreateNote}
                  >
                    {intl.formatMessage(messages.requestClearance)}
                  </Button>
                </Col>
              )}
              {((userRole === 3 || userRole > 900) && event?.status === 0) && (
                <Col span={12}>
                  <Button
                    type='primary'
                    icon={<ImPencil size={12} />}
                    block
                    onClick={this.showEditNotes}
                  >
                    {intl.formatMessage(messages.editNotes)}
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
        {isModalInvoice && <ModalInvoice {...modalInvoiceProps} />}
        {visibleNoShow && <ModalNoShow {...modalNoShowProps} />}
        {visibleBalance && <ModalBalance {...modalBalanceProps} />}
        {visibleEvaluationProcess && <ModalEvaluationProcess {...modalEvaluationProcessProps} />}
        {visibleModalMessage && <ModalCreateNote {...modalMessageProps} />}
        {visibleCurrentScreen && <ModalNewScreening {...modalCurrentScreeningProps} />}
        {visibleCreateNote && <ModalCreateNote {...modalCreateNoteProps} />}
      </Drawer >
    );
  }
}

export default DrawerDetail;