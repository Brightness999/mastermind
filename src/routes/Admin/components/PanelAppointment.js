import React from 'react';
import { Avatar, message, Tabs } from 'antd';
import { FaUser } from 'react-icons/fa';
import { GiBackwardTime } from 'react-icons/gi';
import { BsEnvelope, BsXCircle, BsFillFlagFill, BsCheckCircleFill } from 'react-icons/bs';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';
import moment from 'moment';

import msgDashboard from 'routes/Dashboard/messages';
import msgModal from 'components/Modal/messages';
import request from 'utils/api/request'
import { ModalBalance, ModalCancelAppointment, ModalCancelForAdmin, ModalCurrentAppointment, ModalFeedback, ModalInvoice, ModalNoShow, ModalProcessAppointment } from 'components/Modal';
import { getInvoiceList, setAppointments, setAppointmentsInMonth } from 'src/redux/features/appointmentsSlice';
import { cancelAppointmentForParent, closeAppointmentForProvider, declineAppointmentForProvider, leaveFeedbackForProvider, setFlag, setFlagBalance, updateNoshowFlag } from 'utils/api/apiList';
import { ACTIVE, APPOINTMENT, BALANCE, CANCEL, CANCELLED, CLOSED, DECLINED, EVALUATION, InvoiceType, NOSHOW, PENDING, RESCHEDULE, SUBSIDY } from 'routes/constant';
import './index.less';

class PanelAppointment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      appointments: this.props.appointments,
      visibleCancel: false,
      visibleCurrent: false,
      event: {},
      visibleInvoice: false,
      visibleProcess: false,
      note: '',
      publicFeedback: '',
      visibleBalance: false,
      visibleNoShow: false,
      visibleFeedback: false,
      visibleCancelForAdmin: false,
      cancellationType: '',
      isFeeToParent: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.appointments != this.props.appointments) {
      this.setState({ appointments: this.props.appointments });
    }
  }

  handleTabChange = (v) => {
    const { user } = this.props;
    let data = {
      user: user?._id,
      action: "View",
    }
    switch (v) {
      case "1": data.description = "Viewed upcoming appointments"; break;
      case "2": data.description = "Viewed unprocessed appointments"; break;
      case "3": data.description = "Viewed unprocessed appointments"; break;
      default: break;
    }

    this.props.socket.emit("action_tracking", data);
  }

  renderItemLeft = (event) => {
    return (
      <div className={`item-left ${[CANCELLED, DECLINED].includes(event.status) ? 'line-through' : ''}`} onClick={() => this.props.onShowDrawerDetail(event._id)}>
        <Avatar size={24} icon={<FaUser size={12} />} />
        <div className='div-service'>
          <p className='font-09'>{`${event.dependent.firstName ?? ''} ${event.dependent.lastName ?? ''}`}</p>
          <p className='font-09 mb-0'>{`${event.provider.firstName ?? ''} ${event.provider.lastName ?? ''}`}</p>
        </div>
        <p className='font-11 mb-0 ml-auto mr-5'>{event.location}</p>
        <div className='ml-auto'>
          <p className='font-12 mb-0'>{moment(event.date).format("hh:mm a")}</p>
          <p className='font-12 font-700 mb-0 whitespace-nowrap'>{moment(event.date).format('MM/DD/YYYY')}</p>
        </div>
      </div>
    );
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
    this.onCloseModalCancelForAdmin();
    if (cancellationType === CANCEL) {
      this.setState({ visibleCancel: true });
    } else if (cancellationType === RESCHEDULE) {
      this.setState({ visibleCurrent: true });
    }
  }

  submitModalCurrent = () => {
    this.closeModalCurrent();
  }

  closeModalCurrent = () => {
    this.setState({ visibleCurrent: false });
  }

  openModalCurrent = (event) => {
    if (moment(event.date).subtract(event.provider?.cancellationWindow, 'h').isBefore(moment()) && event.provider?.cancellationFee && !event.isCancellationFeePaid) {
      this.setState({ visibleCancelForAdmin: true, cancellationType: RESCHEDULE, event: event });
    } else {
      this.setState({ visibleCurrent: true, event: event });
    }
  }

  closeModalCancel = () => {
    this.setState({ visibleCancel: false });
  }

  openModalCancel = (event) => {
    if (moment(event.date).subtract(event.provider?.cancellationWindow, 'h').isBefore(moment()) && event.provider?.cancellationFee && !event.isCancellationFeePaid) {
      this.setState({ visibleCancelForAdmin: true, cancellationType: CANCEL, event: event });
    } else {
      this.setState({ visibleCancel: true, event: event });
    }
  }

  handleConfirmCancel = () => {
    const { isFeeToParent } = this.state;
    this.setState({ visibleCancel: false }, () => {
      const { event } = this.state;
      if (event?._id) {
        let postData = { appointId: event._id };
        if (isFeeToParent) {
          postData = {
            ...postData,
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

        request.post(cancelAppointmentForParent, postData).then(result => {
          const { success, data } = result;
          if (success) {
            this.updateAppointments(data);
            this.setState({ isFeeToParent: false });
          } else {
            message.warning("can't cancel this appointment")
            this.setState({ isFeeToParent: false });
          }
        }).catch(error => {
          message.error(error.message);
          this.setState({ isFeeToParent: false });
        })
      }
    });
  }

  handleClose = (appointment) => {
    this.setState({ visibleInvoice: true, event: appointment });
  }

  closeModalProcess = () => {
    this.setState({ visibleProcess: false });
  }

  onConfirm = (items) => {
    this.setState({ visibleInvoice: false, visibleProcess: true, items: items });
  }

  closeModalInvoice = () => {
    this.setState({ visibleInvoice: false });
  }

  handleMarkAsClosed = (note, publicFeedback) => {
    const { event, items } = this.state;
    this.closeModalProcess();

    if (event?._id) {
      const updateData = {
        appointmentId: event._id,
        publicFeedback: publicFeedback,
        note: note,
        items: items?.items,
        invoiceNumber: items?.invoiceNumber,
        invoiceId: items?.invoiceId,
        totalPayment: items?.totalPayment,
      }

      request.post(closeAppointmentForProvider, updateData).then(result => {
        const { success, data } = result;
        if (success) {
          this.updateAppointments(data);
        } else {
          message.warning("can't close this appointment");
        }
      }).catch(error => {
        message.warning(error.message);
      })
    }
  }

  handleDecline = (note, publicFeedback) => {
    const { event, items } = this.state;
    this.closeModalProcess();

    if (event?._id) {
      const postData = {
        appointmentId: event._id,
        publicFeedback: publicFeedback,
        note: note,
        items: items,
      }

      request.post(declineAppointmentForProvider, postData).then(result => {
        const { success, data } = result;
        if (success) {
          this.updateAppointments(data);
        } else {
          message.warning("can't decline this appointment");
        }
      }).catch(error => {
        message.error(error.message);
      })
    }
  }

  openModalNoShow = (appointment) => {
    this.setState({ visibleNoShow: true, event: appointment });
  }

  closeModalNoShow = () => {
    this.setState({ visibleNoShow: false });
  }

  openModalBalance = (appointment) => {
    this.setState({ visibleBalance: true, event: appointment });
  }

  closeModalBalance = () => {
    this.setState({ visibleBalance: false, event: {} });
  }

  onSubmitFlagBalance = (values) => {
    const { notes } = values;
    const { appointments } = this.props;
    const { event } = this.state;
    const providerIds = Object.keys(values).filter(a => a.includes('invoiceId')).map(a => a.split("-")[1]);
    let bulkData = [];

    providerIds.forEach(providerId => {
      let temp = [];
      Object.entries(values)?.forEach(value => {
        if (value?.length) {
          const appointment = appointments?.find(a => a._id === value[0]);
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
                    count: appointment.type === SUBSIDY ? `[${appointments?.filter(a => a?.type === SUBSIDY && [PENDING, CLOSED].includes(a?.status) && a?.dependent?._id === appointment?.dependent?._id && a?.provider?._id === appointment?.provider?._id)?.length}/${appointment?.subsidy?.numberOfSessions}]` : '',
                    discount: values[`discount-${appointment._id}`],
                    rate: values[`balance-${appointment._id}`],
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

    if (bulkData.length) {
      request.post(setFlagBalance, { bulkData, dependent: event?.dependent?._id, appointmentId: event?._id }).then(result => {
        const { success, data } = result;
        if (success) {
          this.updateAppointments(data);
          this.props.getInvoiceList({ role: user.role });
          this.closeModalBalance();
        }
      }).catch(err => message.error(err.message));
    }
  }

  onSubmitFlagNoShow = (values) => {
    const { user } = this.props;
    const { event } = this.state;
    const { penalty, program, notes, invoiceId, balance, feeOption } = values;
    const postData = {
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
          details: "Missed Appointment",
          rate: feeOption === 1 ? balance : feeOption === 2 ? penalty * 1 + program * 1 : 0,
        }],
        flagType: NOSHOW,
        feeOption,
        balance,
      },
      totalPayment: feeOption === 1 ? balance : feeOption === 2 ? penalty * 1 + program * 1 : 0,
      invoiceId,
    }

    request.post(invoiceId ? updateNoshowFlag : setFlag, postData).then(result => {
      const { success, data } = result;
      if (success) {
        this.updateAppointments(data);
        this.props.getInvoiceList({ role: user.role });
        this.closeModalNoShow();
      }
    })
  }

  openModalFeedback = (appointment) => {
    this.setState({ visibleFeedback: true, event: appointment });
  }

  closeModalFeedback = () => {
    this.setState({ visibleFeedback: false });
  }

  handleLeaveFeedback = (note, publicFeedback) => {
    const { event } = this.state;

    if (!note?.trim() && !publicFeedback?.trim()) {
      message.warn('Please input the internal note or public feedback for parent');
      return;
    }

    if (event?._id) {
      const postData = {
        appointmentId: event._id,
        publicFeedback: publicFeedback,
        note: note,
      }

      request.post(leaveFeedbackForProvider, postData).then(result => {
        const { success, data } = result;
        if (success) {
          this.updateAppointments(data);
          this.closeModalFeedback();
        } else {
          message.warning("can't leave feedback");
        }
      }).catch(error => {
        message.error(error.message);
      })
    }
  }

  updateAppointments = (data) => {
    const { appointments, appointmentsMonth } = this.props;
    const { event } = this.state;
    const newAppointments = JSON.parse(JSON.stringify(appointments))?.map(a => a._id === event._id ? ({ ...data, parent: a.parent }) : a);
    const newAppointmentsInMonth = JSON.parse(JSON.stringify(appointmentsMonth))?.map(a => a._id === event._id ? ({ ...data, parent: a.parent }) : a);

    this.props.setAppointments(newAppointments);
    this.props.setAppointmentsInMonth(newAppointmentsInMonth);
  }

  render() {
    const {
      appointments,
      visibleCancel,
      visibleCurrent,
      event,
      visibleInvoice,
      visibleProcess,
      visibleBalance,
      visibleFeedback,
      visibleNoShow,
      visibleCancelForAdmin,
      isFeeToParent,
    } = this.state;
    const dependent = { ...event?.dependent, appointments: appointments?.filter(a => a.dependent?._id === event?.dependent?._id) };
    const modalCancelProps = {
      visible: visibleCancel,
      onSubmit: this.handleConfirmCancel,
      onCancel: this.closeModalCancel,
      event: event,
    };

    const modalCurrentProps = {
      visible: visibleCurrent,
      onSubmit: this.submitModalCurrent,
      onCancel: this.closeModalCurrent,
      event: appointments?.find(a => a?._id == event?._id),
      listAppointmentsRecent: appointments,
      isFeeToParent,
    };

    const modalProcessProps = {
      visible: visibleProcess,
      onDecline: this.handleDecline,
      onConfirm: this.handleMarkAsClosed,
      onCancel: this.closeModalProcess,
      event: event,
    };

    const modalInvoiceProps = {
      visible: visibleInvoice,
      onSubmit: this.onConfirm,
      onCancel: this.closeModalInvoice,
      event: event,
    }

    const modalNoShowProps = {
      visible: visibleNoShow,
      onSubmit: this.onSubmitFlagNoShow,
      onCancel: this.closeModalNoShow,
      event: event,
    };

    const modalBalanceProps = {
      visible: visibleBalance,
      onSubmit: this.onSubmitFlagBalance,
      onCancel: this.closeModalBalance,
      event: event,
      dependent,
    };

    const modalFeedbackProps = {
      visible: visibleFeedback,
      onSubmit: this.handleLeaveFeedback,
      onCancel: this.closeModalFeedback,
      event: event,
    };

    const modalCancelForAdminProps = {
      visible: visibleCancelForAdmin,
      onSubmit: this.waiveFee,
      applyFeeToParent: this.applyFeeToParent,
      onCancel: this.onCloseModalCancelForAdmin,
    };

    return (
      <Tabs defaultActiveKey="1" type="card" size='small' onChange={this.handleTabChange}>
        <Tabs.TabPane tab={intl.formatMessage(msgDashboard.upcoming)} key="1">
          {appointments?.filter(a => (a.type === APPOINTMENT || a.type === SUBSIDY) && a.flagStatus != ACTIVE && a.status === PENDING && moment().isBefore(moment(a.date).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })))?.map((data, index) => (
            <div key={index} className='list-item'>
              {this.renderItemLeft(data)}
              {data.status === PENDING && (
                <div className='item-right gap-1'>
                  <GiBackwardTime size={19} cursor='pointer' onClick={() => this.openModalCurrent(data)} />
                  <BsXCircle size={15} cursor='pointer' onClick={() => this.openModalCancel(data)} />
                </div>
              )}
            </div>
          ))}
          {(appointments?.filter(a => (a.type === APPOINTMENT || a.type === SUBSIDY) && a.flagStatus != ACTIVE && a.status === PENDING && moment().isBefore(moment(a.date).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })))?.length == 0) && (
            <div key={1} className='list-item justify-center'>
              <p className='p-10'>No upcoming appoiment</p>
            </div>
          )}
          {visibleCancel && <ModalCancelAppointment {...modalCancelProps} />}
          {visibleCurrent && <ModalCurrentAppointment {...modalCurrentProps} />}
          {visibleCancelForAdmin && <ModalCancelForAdmin {...modalCancelForAdminProps} />}
        </Tabs.TabPane>
        <Tabs.TabPane tab={intl.formatMessage(msgDashboard.unprocessed)} key="2">
          {appointments?.filter(a => (a.type === APPOINTMENT || a.type === SUBSIDY) && a.flagStatus != ACTIVE && ((a.status === PENDING && moment().set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }).isSameOrAfter(moment(a.date).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }))) || a.status === CANCELLED))?.map((data, index) => (
            <div key={index} className='list-item'>
              {this.renderItemLeft(data)}
              <div className={`item-right gap-1 ${data.status === CANCELLED && 'd-none'}`}>
                {data.flagStatus === PENDING && <BsFillFlagFill size={15} onClick={() => this.openModalNoShow(data)} />}
                <BsCheckCircleFill className='text-green500' size={15} onClick={() => this.handleClose(data)} />
              </div>
            </div>
          ))}
          {(appointments?.filter(a => (a.type === APPOINTMENT || a.type === SUBSIDY) && ((a.status === PENDING && a.flagStatus != ACTIVE && moment().set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }).isSameOrAfter(moment(a.date).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }))) || a.status === CANCELLED))?.length == 0) && (
            <div key={1} className='list-item justify-center'>
              <p className='p-10'>No unprocess appoiment</p>
            </div>
          )}
          {visibleProcess && <ModalProcessAppointment {...modalProcessProps} />}
          {visibleInvoice && <ModalInvoice {...modalInvoiceProps} />}
          {visibleNoShow && <ModalNoShow {...modalNoShowProps} />}
        </Tabs.TabPane>
        <Tabs.TabPane tab={intl.formatMessage(msgDashboard.past)} key="3">
          {appointments?.filter(a => (a.type === APPOINTMENT || a.type === SUBSIDY) && [CLOSED, DECLINED].includes(a.status) && a.flagStatus != ACTIVE)?.map((data, index) => (
            <div key={index} className='list-item'>
              {this.renderItemLeft(data)}
              <div className={`item-right gap-1 ${data?.status === DECLINED && 'display-none events-none'}`}>
                <BsEnvelope size={15} onClick={() => this.openModalFeedback(data)} />
                {(data?.flagStatus === PENDING && !data?.sessionInvoice?.isPaid) && <BsFillFlagFill size={15} onClick={() => this.openModalBalance(data)} />}
              </div>
            </div>
          ))}
          {(appointments?.filter(a => (a.type === APPOINTMENT || a.type === SUBSIDY) && [CLOSED, DECLINED].includes(a.status) && a.flagStatus != ACTIVE)?.length == 0) && (
            <div key={1} className='list-item justify-center'>
              <p className='p-10'>No past appoiment</p>
            </div>
          )}
          {visibleFeedback && <ModalFeedback {...modalFeedbackProps} />}
          {visibleBalance && <ModalBalance {...modalBalanceProps} />}
        </Tabs.TabPane>
      </Tabs>
    )
  }
}

const mapStateToProps = state => ({
  appointments: state.appointments.dataAppointments,
  appointmentsMonth: state.appointments.dataAppointmentsMonth,
  user: state.auth.user,
})

export default compose(connect(mapStateToProps, { getInvoiceList, setAppointments, setAppointmentsInMonth }))(PanelAppointment);
