import React from 'react';
import { Avatar, Tabs } from 'antd';
import { FaUser } from 'react-icons/fa';
import { GiBackwardTime } from 'react-icons/gi';
import { BsEnvelope, BsXCircle, BsFillFlagFill, BsCheckCircleFill } from 'react-icons/bs';
import intl from 'react-intl-universal';
import messages from '../messages';
import { connect } from 'react-redux';
import { compose } from 'redux';
import './index.less';
import moment from 'moment';
import request from '../../../utils/api/request'
import { ModalCancelAppointment, ModalCurrentAppointment } from '../../../components/Modal';
import { store } from '../../../redux/store';
import { getAppointmentsData, getAppointmentsMonthData } from '../../../redux/features/appointmentsSlice';
import { cancelAppointmentForParent } from '../../../utils/api/apiList';

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
      userRole: store.getState().auth.user.role
    };
  }

  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps.appointments) != JSON.stringify(this.props.appointments)) {
      this.setState({ appointments: this.props.appointments });
    }
  }

  componentDidMount() {
    this.handleTabChange(1)
    this.props.setReload(this.setReloadData);
  }

  setReloadData = () => {
    this.handleTabChange(this.state.currentTab);
  }

  handleTabChange = (v) => {
    this.setState({ currentTab: v });
  }

  renderItemLeft = (event) => {
    return (
      <div className={`item-left ${event.status == -2 ? 'line-through' : ''}`} onClick={() => this.props.onShowDrawerDetail(event._id)}>
        <Avatar size={24} icon={<FaUser size={12} />} />
        <div className='div-service'>
          <p className='font-09 mb-0'>{`${event.provider.firstName ?? ''} ${event.provider.lastName ?? ''}`}{event?.school?.name}</p>
        </div>
        <p className='font-11 mb-0 ml-auto mr-5'>{event.location}</p>
        <div className='ml-auto'>
          <p className='font-12 mb-0'>{moment(event.date).format("HH:mm:ss")}</p>
          <p className='font-12 font-700 mb-0'>{moment(event.date).format('YYYY-MM-DD')}</p>
        </div>
      </div>
    );
  }

  submitModalCurrent = () => {
    this.setState({ visibleCurrent: false });
    store.dispatch(getAppointmentsData({ role: this.state.userRole }));
    const month = this.props.calendar.current?._calendarApi.getDate().getMonth() + 1;
    const year = this.props.calendar.current?._calendarApi.getDate().getFullYear();
    const dataFetchAppointMonth = {
      role: this.state.userRole,
      data: {
        month: month,
        year: year,
      }
    };
    store.dispatch(getAppointmentsMonthData(dataFetchAppointMonth));
  }

  closeModalCurrent = () => {
    this.setState({ visibleCurrent: false });
  }

  openModalCurrent = (data) => {
    this.setState({
      visibleCurrent: true,
      event: data,
    });
  }

  closeModalCancel = () => {
    this.setState({ visibleCancel: false });
  }

  openModalCancel = (data) => {
    this.setState({
      visibleCancel: true,
      event: data,
    });
  }

  handleConfirmCancel = () => {
    this.setState({ visibleCancel: false }, () => {
      const { event, userRole } = this.state;
      if (event?._id) {
        const data = { appointId: event._id };
        request.post(cancelAppointmentForParent, data).then(result => {
          if (result.success) {
            this.setState({
              errorMessage: '',
              isCancelled: true,
            });
            store.dispatch(getAppointmentsData({ role: userRole }));
            const month = this.props.calendar.current?._calendarApi.getDate().getMonth() + 1;
            const year = this.props.calendar.current?._calendarApi.getDate().getFullYear();
            const dataFetchAppointMonth = {
              role: userRole,
              data: {
                month: month,
                year: year,
              }
            };
            store.dispatch(getAppointmentsMonthData(dataFetchAppointMonth));
          } else {
            this.setState({
              errorMessage: result.data,
              isCancelled: true,
            });
          }
        }).catch(error => {
          console.log('closed error---', error);
          this.setState({
            errorMessage: error.message,
            isCancelled: true,
          });
        })
      }
    });
  }

  render() {
    const { appointments, visibleCancel, visibleCurrent, event } = this.state;
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
      event: event,
    };

    return (
      <Tabs defaultActiveKey="1" type="card" size='small' onChange={this.handleTabChange}>
        <Tabs.TabPane tab={intl.formatMessage(messages.upcoming)} key="1">
          {appointments?.filter(app => app.type == 3 && [0, -2].includes(app.status) && moment(new Date()).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }).isBefore(moment(app.date).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })))?.map((data, index) => (
            <div key={index} className='list-item'>
              {this.renderItemLeft(data)}
              {data.status == 0 && (
                <div className='item-right'>
                  <GiBackwardTime size={19} cursor='pointer' onClick={() => this.openModalCurrent(data)} />
                  <BsXCircle style={{ marginTop: 4 }} size={15} cursor='pointer' onClick={() => this.openModalCancel(data)} />
                </div>
              )}
            </div>
          ))}
          {(appointments?.filter(app => app.type == 3 && [0, -2].includes(app.status) && moment(new Date()).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }).isBefore(moment(app.date).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })))?.length == 0) && (
            <div key={1} className='list-item'>
              <p className='p-10'>No upcoming appoiment</p>
            </div>
          )}
          <ModalCancelAppointment {...modalCancelProps} />
          {visibleCurrent && <ModalCurrentAppointment {...modalCurrentProps} />}
        </Tabs.TabPane>
        <Tabs.TabPane tab={intl.formatMessage(messages.unprocessed)} key="2">
          {appointments?.filter(app => app.type == 3 && [0, -1].includes(app.status) && moment(new Date()).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }).isSame(moment(app.date).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })))?.map((data, index) => (
            <div key={index} className='list-item'>
              {this.renderItemLeft(data)}
              <div className='item-right'>
                <BsFillFlagFill size={15} onClick={() => { }} />
                <BsCheckCircleFill className='text-green500' style={{ marginTop: 4 }} size={15} onClick={() => { }} />
              </div>
            </div>
          ))}
          {(appointments?.filter(app => app.type == 3 && [0, -1].includes(app.status) && moment(new Date()).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }).isSame(moment(app.date).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })))?.length == 0) && (
            <div key={1} className='list-item'>
              <p className='p-10'>No unprocess appoiment</p>
            </div>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab={intl.formatMessage(messages.past)} key="3">
          {appointments?.filter(app => app.type == 3 && [0, -1, -2].includes(app.status) && moment(new Date()).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }).isAfter(moment(app.date).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })))?.map((data, index) => (
            <div key={index} className='list-item'>
              {this.renderItemLeft(data)}
              <div className='item-right'>
                <BsEnvelope size={15} onClick={() => { }} />
                <BsFillFlagFill style={{ marginTop: 4 }} size={15} onClick={() => { }} />
              </div>
            </div>
          ))}
          {(appointments?.filter(app => app.type == 3 && [0, -1, -2].includes(app.status) && moment(new Date()).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }).isAfter(moment(app.date).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })))?.length == 0) && (
            <div key={1} className='list-item'>
              <p className='p-10'>No past appoiment</p>
            </div>
          )}
        </Tabs.TabPane>
      </Tabs>
    )
  }
}

const mapStateToProps = state => {
  return ({
    appointments: state.appointments.dataAppointments
  })
}

export default compose(connect(mapStateToProps))(PanelAppointment);
