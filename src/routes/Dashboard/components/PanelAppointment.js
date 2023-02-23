import React from 'react';
import { Avatar, message, Tabs } from 'antd';
import { FaUser } from 'react-icons/fa';
import { GiBackwardTime } from 'react-icons/gi';
import { BsEnvelope, BsXCircle, BsFillFlagFill, BsCheckCircleFill, BsPaypal } from 'react-icons/bs';
import intl from 'react-intl-universal';
import messages from '../messages';
import msgModal from '../../../components/Modal/messages';
import { connect } from 'react-redux';
import { compose } from 'redux';
import './index.less';
import moment from 'moment';
import request from '../../../utils/api/request'
import { ModalBalance, ModalCancelAppointment, ModalCurrentAppointment, ModalFeedback, ModalInvoice, ModalNoShow, ModalProcessAppointment } from '../../../components/Modal';
import { store } from '../../../redux/store';
import { getAppointmentsData, getAppointmentsMonthData } from '../../../redux/features/appointmentsSlice';
import { cancelAppointmentForParent, closeAppointmentForProvider, declineAppointmentForProvider, leaveFeedbackForProvider, setFlag } from '../../../utils/api/apiList';

class PanelAppointment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      appointments: this.props.appointments,
      type: 0,
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
    return (
      <div className={`item-left ${[-2, -3].includes(event.status) ? 'line-through' : ''}`} onClick={() => this.props.onShowDrawerDetail(event._id)}>
        <Avatar size={24} icon={<FaUser size={12} />} />
        <div className='div-service'>
          <p className='font-09 mb-0'>{`${event.provider.firstName ?? ''} ${event.provider.lastName ?? ''}`}{event?.school?.name}</p>
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

  openModalCurrent = (data) => {
    this.setState({ visibleCurrent: true, event: data });
  }

  closeModalCancel = () => {
    this.setState({ visibleCancel: false });
  }

  openModalCancel = (data) => {
    this.setState({ visibleCancel: true, event: data });
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
    store.dispatch(getAppointmentsData({ role: this.props.user?.role }));
    const month = this.props.calendar.current?._calendarApi.getDate().getMonth() + 1;
    const year = this.props.calendar.current?._calendarApi.getDate().getFullYear();
    const dataFetchAppointMonth = {
      role: this.props.user?.role,
      data: {
        month: month,
        year: year
      }
    };
    store.dispatch(getAppointmentsMonthData(dataFetchAppointMonth));
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
    this.setState({ visibleBalance: false });
  }

  onSubmitFlagBalance = (values) => {
    const { event } = this.state;
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

  onSubmitFlagNoShow = (values) => {
    const { event } = this.state;
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
    const { appointments, visibleCancel, visibleCurrent, event, visibleInvoice, visibleProcess, visibleBalance, visibleFeedback, visibleNoShow } = this.state;

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
    };

    const modalFeedbackProps = {
      visible: visibleFeedback,
      onSubmit: this.handleLeaveFeedback,
      onCancel: this.closeModalFeedback,
      event: event,
    };

    return (
      <Tabs defaultActiveKey="1" type="card" size='small' onChange={this.handleTabChange}>
        <Tabs.TabPane tab={intl.formatMessage(messages.upcoming)} key="1">
          {appointments?.filter(a => a.type == 3 && a.flagStatus != 1 && a.status == 0 && moment().isBefore(moment(a.date).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })))?.map((data, index) => (
            <div key={index} className='list-item'>
              {this.renderItemLeft(data)}
              {data.status == 0 && (
                <div className='item-right gap-1'>
                  <GiBackwardTime size={19} cursor='pointer' onClick={() => this.openModalCurrent(data)} />
                  <BsXCircle size={15} cursor='pointer' onClick={() => this.openModalCancel(data)} />
                </div>
              )}
            </div>
          ))}
          {(appointments?.filter(a => a.type == 3 && a.flagStatus != 1 && a.status == 0 && moment().isBefore(moment(a.date).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })))?.length == 0) && (
            <div key={1} className='list-item p-10 justify-center'>
              <span>No upcoming appoiment</span>
            </div>
          )}
          {visibleCancel && <ModalCancelAppointment {...modalCancelProps} />}
          {visibleCurrent && <ModalCurrentAppointment {...modalCurrentProps} />}
        </Tabs.TabPane>
        <Tabs.TabPane tab={intl.formatMessage(messages.unprocessed)} key="2">
          {appointments?.filter(a => a.type == 3 && a.flagStatus != 1 && [0, -2].includes(a.status) && moment().set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }).isSameOrAfter(moment(a.date).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })))?.map((data, index) => (
            <div key={index} className='list-item'>
              {this.renderItemLeft(data)}
              {this.props.user?.role > 3 ? (
                <div className={`item-right gap-1 ${(data.status == -2 || appointments.find(a => a.dependent?._id == data?.dependent?._id && a.provider?._id == data?.provider?._id && a.flagStatus == 1)) && 'display-none'}`}>
                  <BsFillFlagFill size={15} onClick={() => this.openModalNoShow(data)} />
                  <BsCheckCircleFill className='text-green500' size={15} onClick={() => this.handleClose(data)} />
                </div>
              ) : null}
            </div>
          ))}
          {(appointments?.filter(a => a.type == 3 && [0, -2].includes(a.status) && a.flagStatus != 1 && moment().set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }).isSameOrAfter(moment(a.date).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })))?.length == 0) && (
            <div key={1} className='list-item p-10 justify-center'>
              <span>No unprocess appoiment</span>
            </div>
          )}
          {visibleProcess && <ModalProcessAppointment {...modalProcessProps} />}
          {visibleInvoice && <ModalInvoice {...modalInvoiceProps} />}
          {visibleNoShow && <ModalNoShow {...modalNoShowProps} />}
        </Tabs.TabPane>
        <Tabs.TabPane tab={intl.formatMessage(messages.past)} key="3">
          {appointments?.filter(a => a.type == 3 && [-1, -3].includes(a.status) && a.flagStatus != 1 && moment().isAfter(moment(a.date).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })))?.map((data, index) => (
            <div key={index} className='list-item'>
              {this.renderItemLeft(data)}
              {(this.props.user?.role == 3 && !data?.isPaid) ? (
                <div className={`item-right cursor gap-1 ${data?.status == -3 && 'display-none'}`}>
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
                <div className={`item-right gap-1 ${data?.status == -3 && 'display-none'}`}>
                  <BsEnvelope size={15} onClick={() => this.openModalFeedback(data)} />
                  <BsFillFlagFill size={15} onClick={() => this.openModalBalance(data)} />
                </div>
              ) : null}
            </div>
          ))}
          {(appointments?.filter(a => a.type == 3 && [-1, -3].includes(a.status) && a.flagStatus != 1 && moment().isAfter(moment(a.date).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })))?.length == 0) && (
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
