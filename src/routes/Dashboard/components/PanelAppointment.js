import React from 'react';
import { Avatar, message, Tabs } from 'antd';
import { FaUser } from 'react-icons/fa';
import { GiBackwardTime } from 'react-icons/gi';
import { BsEnvelope, BsXCircle, BsFillFlagFill, BsCheckCircleFill, BsPaypal } from 'react-icons/bs';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';
import moment from 'moment';

import messages from '../messages';
import msgModal from '../../../components/Modal/messages';
import request from '../../../utils/api/request'
import { ModalBalance, ModalCancelAppointment, ModalCurrentAppointment, ModalFeedback, ModalInvoice, ModalNoShow, ModalPayment, ModalProcessAppointment } from '../../../components/Modal';
import { getAppointmentsData, getAppointmentsMonthData } from '../../../redux/features/appointmentsSlice';
import { cancelAppointmentForParent, closeAppointmentForProvider, declineAppointmentForProvider, leaveFeedbackForProvider, setFlag, setFlagBalance } from '../../../utils/api/apiList';
import { ACTIVE, APPOINTMENT, BALANCE, CLOSED, DECLINED, EVALUATION, NOSHOW, PARENT, PENDING, SUBSIDY } from '../../constant';
import './index.less';

class PanelAppointment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      appointments: this.props.appointments,
      currentTab: 1,
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
      visiblePayment: false,
      paymentDescription: '',
    };
  }

  componentDidMount() {
    this.handleTabChange(1)
    this.props.setReload(this.setReloadData);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.appointments != this.props.appointments) {
      this.setState({ appointments: this.props.appointments });
    }
  }

  setReloadData = () => {
    this.handleTabChange(this.state.currentTab);
  }

  handleTabChange = (v) => {
    this.setState({ currentTab: v });
  }

  renderItemLeft = (event) => {
    const { user } = this.props;

    return (
      <div className={`item-left ${[-2, -3].includes(event.status) ? 'line-through' : ''}`} onClick={() => this.props.onShowDrawerDetail(event._id)}>
        <Avatar size={24} icon={<FaUser size={12} />} />
        <div className='div-service'>
          {user?.role === 3 ? <p className='font-09 mb-0'>{`${event.provider.firstName ?? ''} ${event.provider.lastName ?? ''}`}</p>
            : user?.role === 30 ? <p className='font-09 mb-0'>{`${event.dependent.firstName ?? ''} ${event.dependent.lastName ?? ''}`}</p>
              : <div><p className='font-09'>{`${event.dependent.firstName ?? ''} ${event.dependent.lastName ?? ''}`}</p><p className='font-09 mb-0'>{`${event.provider.firstName ?? ''} ${event.provider.lastName ?? ''}`}</p></div>}

        </div>
        <p className='font-11 mb-0 ml-auto mr-5'>{event.location}</p>
        <div className='ml-auto'>
          <p className='font-12 mb-0'>{moment(event.date).format("hh:mm a")}</p>
          <p className='font-12 font-700 mb-0 whitespace-nowrap'>{moment(event.date).format('MM/DD/YYYY')}</p>
        </div>
      </div>
    );
  }

  submitModalCurrent = () => {
    this.setState({ visibleCurrent: false });
    this.updateAppointments();
  }

  closeModalCurrent = () => {
    this.setState({ visibleCurrent: false });
  }

  openModalCurrent = (event) => {
    const { user } = this.props;

    if (user.role === PARENT && moment(event.date).subtract(event.provider.cancellationWindow, 'h').isBefore(moment()) && event.provider.cancellationFee && !event.isCancellationFeePaid) {
      const desc = <span>A cancellation fee <span className='text-bold'>${event.provider.cancellationFee}</span> must be paid.</span>
      this.setState({ paymentDescription: desc, event: event });
      message.warn(desc).then(() => {
        this.setState({ visiblePayment: true });
      })
    } else {
      this.setState({ visibleCurrent: true, event: event });
    }
  }

  closeModalPayment = () => {
    this.setState({ visiblePayment: false, paymentDescription: '' });
  }

  closeModalCancel = () => {
    this.setState({ visibleCancel: false });
  }

  openModalCancel = (event) => {
    const { user } = this.props;

    if (user.role === PARENT && moment(event.date).subtract(event.provider.cancellationWindow, 'h').isBefore(moment()) && event.provider.cancellationFee && !event.isCancellationFeePaid) {
      const desc = <span>A cancellation fee <span className='text-bold'>${event.provider.cancellationFee}</span> must be paid.</span>
      this.setState({ paymentDescription: desc, event: event });
      message.warn(desc).then(() => {
        this.setState({ visiblePayment: true });
      })
    } else {
      this.setState({ visibleCancel: true, event: event });
    }
  }

  handleConfirmCancel = () => {
    this.setState({ visibleCancel: false }, () => {
      const { event } = this.state;
      if (event?._id) {
        const data = { appointId: event._id };
        request.post(cancelAppointmentForParent, data).then(result => {
          if (result.success) {
            this.updateAppointments();
          } else {
            message.warning("can't cancel this appointment")
          }
        }).catch(error => {
          console.log('closed error---', error);
          message.error(error.message);
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
    this.setState({ visibleProcess: false });

    if (event?._id) {
      const data = {
        appointmentId: event._id,
        publicFeedback: publicFeedback,
        note: note,
        items: items,
      }

      request.post(closeAppointmentForProvider, data).then(result => {
        const { success } = result;
        if (success) {
          this.updateAppointments();
        } else {
          message.warning("can't close this appointment");
        }
      }).catch(error => {
        console.log('closed error---', error);
        message.warning(error.message);
      })
    }
  }

  handleDecline = (note, publicFeedback) => {
    const { event, items } = this.state;
    this.setState({ visibleProcess: false });

    if (event?._id) {
      const data = {
        appointmentId: event._id,
        publicFeedback: publicFeedback,
        note: note,
        items: items,
      }

      request.post(declineAppointmentForProvider, data).then(result => {
        const { success } = result;
        if (success) {
          this.updateAppointments();
        } else {
          message.warning("can't decline this appointment");
        }
      }).catch(error => {
        console.log('closed error---', error);
        message.error(error.message);
      })
    }
  }

  updateAppointments() {
    this.props.dispatch(getAppointmentsData({ role: this.props.user?.role }));
    const month = this.props.calendar.current?._calendarApi.getDate().getMonth() + 1;
    const year = this.props.calendar.current?._calendarApi.getDate().getFullYear();
    const dataFetchAppointMonth = {
      role: this.props.user?.role,
      data: {
        month: month,
        year: year
      }
    };
    this.props.dispatch(getAppointmentsMonthData(dataFetchAppointMonth));
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
    let postData = [];

    Object.entries(values)?.forEach(value => {
      if (value?.length) {
        const appointment = appointments?.find(a => a._id === value[0]);
        if (appointment) {
          postData.push({
            updateOne: {
              filter: { _id: value[0] },
              update: {
                $set: {
                  flagStatus: ACTIVE,
                  flagItems: {
                    flagType: BALANCE,
                    late: value[1] * 1,
                    balance: values[`balance-${appointment._id}`],
                    totalPayment: values[`totalPayment-${appointment.provider?._id}`],
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

    request.post(setFlagBalance, postData).then(result => {
      const { success } = result;
      if (success) {
        this.closeModalBalance();
        this.updateAppointments();
      }
    }).catch(err => message.error(err.message));
  }

  onSubmitFlagNoShow = (values) => {
    const { event } = this.state;
    const { penalty, program, notes } = values;
    const data = {
      _id: event?._id,
      flagItems: {
        penalty: penalty * 1,
        program: program * 1,
        notes,
        type: event?.type === EVALUATION ? intl.formatMessage(msgModal.evaluation) : event?.type === APPOINTMENT ? intl.formatMessage(msgModal.standardSession) : event?.type === SUBSIDY ? intl.formatMessage(msgModal.subsidizedSession) : '',
        locationDate: `(${event?.location}) Session on ${new Date(event?.date).toLocaleDateString()}`,
        rate: penalty * 1 + program * 1,
        flagType: NOSHOW,
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

  openModalFeedback = (appointment) => {
    this.setState({ visibleFeedback: true, event: appointment });
  }

  closeModalFeedback = () => {
    this.setState({ visibleFeedback: false });
  }

  handleLeaveFeedback = (note, publicFeedback) => {
    const { event } = this.state;
    this.setState({ visibleFeedback: false });
    if (event?._id) {
      const data = {
        appointmentId: event._id,
        publicFeedback: publicFeedback,
        note: note,
      }

      request.post(leaveFeedbackForProvider, data).then(result => {
        const { success } = result;
        if (success) {
          this.updateAppointments();
        } else {
          message.warning("can't leave feedback");
        }
      }).catch(error => {
        console.log('closed error---', error);
        message.error(error.message);
      })
    }
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
      visiblePayment,
      paymentDescription,
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

    const modalPaymentProps = {
      visible: visiblePayment,
      onSubmit: this.closeModalPayment,
      onCancel: this.closeModalPayment,
      description: paymentDescription,
      appointment: event,
    };

    return (
      <Tabs defaultActiveKey="1" type="card" size='small' onChange={this.handleTabChange}>
        <Tabs.TabPane tab={intl.formatMessage(messages.upcoming)} key="1">
          {appointments?.filter(a => [APPOINTMENT, SUBSIDY].includes(a.type) && a.flagStatus != ACTIVE && a.status === PENDING && moment().isBefore(moment(a.date).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })))?.map((data, index) => (
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
          {(appointments?.filter(a => [APPOINTMENT, SUBSIDY].includes(a.type) && a.flagStatus != ACTIVE && a.status === PENDING && moment().isBefore(moment(a.date).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })))?.length == 0) && (
            <div key={1} className='list-item p-10 justify-center'>
              <span>No upcoming appoiment</span>
            </div>
          )}
          {visibleCancel && <ModalCancelAppointment {...modalCancelProps} />}
          {visibleCurrent && <ModalCurrentAppointment {...modalCurrentProps} />}
          {visiblePayment && <ModalPayment {...modalPaymentProps} />}
        </Tabs.TabPane>
        <Tabs.TabPane tab={intl.formatMessage(messages.unprocessed)} key="2">
          {appointments?.filter(a => [APPOINTMENT, SUBSIDY].includes(a.type) && a.flagStatus != ACTIVE && [0, -2].includes(a.status) && moment().set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }).isSameOrAfter(moment(a.date).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })))?.map((data, index) => (
            <div key={index} className='list-item'>
              {this.renderItemLeft(data)}
              {this.props.user?.role > 3 ? (
                <div className={`item-right gap-1 ${(data.status == -2 || appointments.find(a => a.dependent?._id == data?.dependent?._id && a.provider?._id == data?.provider?._id && a.flagStatus == 1)) && 'display-none events-none'}`}>
                  <BsFillFlagFill size={15} onClick={() => this.openModalNoShow(data)} />
                  <BsCheckCircleFill className='text-green500' size={15} onClick={() => this.handleClose(data)} />
                </div>
              ) : null}
            </div>
          ))}
          {(appointments?.filter(a => [APPOINTMENT, SUBSIDY].includes(a.type) && [0, -2].includes(a.status) && a.flagStatus != ACTIVE && moment().set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }).isSameOrAfter(moment(a.date).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })))?.length == 0) && (
            <div key={1} className='list-item p-10 justify-center'>
              <span>No unprocess appoiment</span>
            </div>
          )}
          {visibleProcess && <ModalProcessAppointment {...modalProcessProps} />}
          {visibleInvoice && <ModalInvoice {...modalInvoiceProps} />}
          {visibleNoShow && <ModalNoShow {...modalNoShowProps} />}
        </Tabs.TabPane>
        <Tabs.TabPane tab={intl.formatMessage(messages.past)} key="3">
          {appointments?.filter(a => [APPOINTMENT, SUBSIDY].includes(a.type) && [-1, -3].includes(a.status) && a.flagStatus != ACTIVE && moment().isAfter(moment(a.date).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })))?.map((data, index) => (
            <div key={index} className='list-item'>
              {this.renderItemLeft(data)}
              {(this.props.user?.role == 3 && !data?.isPaid) ? (
                <div className={`item-right cursor gap-1 ${data?.status === DECLINED && 'display-none events-none'}`}>
                  <form aria-live="polite" data-ux="Form" action="https://www.paypal.com/cgi-bin/webscr" method="post">
                    <input type="hidden" name="edit_selector" data-aid="EDIT_PANEL_EDIT_PAYMENT_ICON" />
                    <input type="hidden" name="business" value="office@helpmegethelp.org" />
                    <input type="hidden" name="cmd" value="_donations" />
                    <input type="hidden" name="item_name" value="Help Me Get Help" />
                    <input type="hidden" name="item_number" />
                    <input type="hidden" name="amount" value={data?.items?.reduce((a, b) => a += b.rate * 1, 0)} data-aid="PAYMENT_HIDDEN_AMOUNT" />
                    <input type="hidden" name="shipping" value="0.00" />
                    <input type="hidden" name="currency_code" value="USD" data-aid="PAYMENT_HIDDEN_CURRENCY" />
                    <input type="hidden" name="rm" value="0" />
                    <input type="hidden" name="return" value={`${window.location.href}?success=true&id=${data?._id}`} />
                    <input type="hidden" name="cancel_return" value={window.location.href} />
                    <input type="hidden" name="cbt" value="Return to Help Me Get Help" />
                    <button className='flag-action pay-flag-button'>
                      <BsPaypal size={15} color="#1976D2" />
                    </button>
                  </form>
                </div>
              ) : null}
              {this.props.user?.role > 3 ? (
                <div className={`item-right gap-1 ${data?.status === DECLINED && 'display-none events-none'}`}>
                  <BsEnvelope size={15} onClick={() => this.openModalFeedback(data)} />
                  <BsFillFlagFill size={15} onClick={() => this.openModalBalance(data)} />
                </div>
              ) : null}
            </div>
          ))}
          {(appointments?.filter(a => [APPOINTMENT, SUBSIDY].includes(a.type) && [CLOSED, DECLINED].includes(a.status) && a.flagStatus != ACTIVE && moment().isAfter(moment(a.date).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })))?.length == 0) && (
            <div key={1} className='list-item p-10 justify-center'>
              <span>No past appoiment</span>
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
  user: state.auth.user,
})

export default compose(connect(mapStateToProps))(PanelAppointment);
