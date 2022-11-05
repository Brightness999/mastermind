import './style/index.less';
import React, { Component } from 'react';
import { Drawer, Button, Row, Col, Typography, Popover } from 'antd';
import { BsBell, BsClockHistory, BsXCircle } from 'react-icons/bs';
import { BiDollarCircle, BiInfoCircle } from 'react-icons/bi';
import { FaFileContract } from 'react-icons/fa';
import { ImPencil } from 'react-icons/im';
import { ModalCancelAppointment, ModalCurrentAppointment } from '../../components/Modal';
import intl from "react-intl-universal";
import messages from './messages';
import moment from 'moment';
import request from '../../utils/api/request';
import { store } from '../../redux/store';
import { getAppointmentsData, getAppointmentsMonthData } from '../../redux/features/appointmentsSlice';
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
      isCancelled: this.props.evnt?.status == -2,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.event?.status != this.props.event?.status) {
      this.setState({
        isCancelled: this.props.event.status < 0,
      });
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
    this.setState({ visibleCancel: true });
  }

  handleConfirmCancel = () => {
    this.setState({ visibleCancel: false }, () => {
      if (this.props.event?._id) {
        const data = { appointId: this.props.event._id };
        request.post('clients/cancel_appoint', data).then(result => {
          if (result.success) {
            this.setState({
              errorMessage: '',
              isCancelled: true,
            });
            store.dispatch(getAppointmentsData({ role: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).role : '' }));
            const month = this.props.calendar.current?._calendarApi.getDate().getMonth() + 1;
            const year = this.props.calendar.current?._calendarApi.getDate().getFullYear();
            const dataFetchAppointMonth = {
              role: JSON.parse(localStorage.getItem('user')).role,
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

  closeModalCurrent = () => {
    this.setState({ visibleCurrent: false });
  }

  openModalCurrent = () => {
    this.setState({ visibleCurrent: true });
  }

  render() {
    const { isProviderHover, isDependentHover, visibleCancel, visibleCurrent, isCancelled } = this.state;
    const { role, event } = this.props;

    const providerProfile = (
      <div className='provider-profile'>
        <p className='font-16 font-700 mb-10'>{intl.formatMessage(messages.providerProfile)}</p>
        <div className='count-2'>
          <p className='font-10'>Name: {event?.provider?.name}</p>
          <p className='font-10'>Skillset(s): {event?.provider?.skillSet?.name}</p>
        </div>
        <p className='font-10'>Practice/Location: {event?.provider?.cityConnection}</p>
        <div className='count-2'>
          <p className='font-10'>Contact number {event?.provider?.contactNumber?.map((n, i) => (<span key={i}>{n.phoneNumber}</span>))}</p>
          <p className='font-10'>Contact email: {event?.provider?.contactEmail?.map((e, i) => (<span key={i}>{e.email}</span>))}</p>
        </div>
        <div className='count-2'>
          <p className='font-10'>Academic level(s) : {event?.provider?.academicLevel?.map((a, i) => (<span key={i}>level: {a.level}, rate: {a.rate}</span>))}</p>
          <p className='font-10'>Subsidy (blank or NO Sub.)</p>
        </div>
        <div className='profile-text'>
          <Paragraph className='font-12 mb-0' ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>
            {event?.provider?.publicProfile}
          </Paragraph>
        </div>
      </div>
    );
    const dependentProfile = (
      <div className='provider-profile'>
        <p className='font-16 font-700 mb-10'>{intl.formatMessage(messages.dependentProfile)}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <p className='font-10'>Name: {event?.dependent?.firstName} {event?.dependent?.lastName}</p>
          <div className='font-10'>Skillset(s):
            {event?.dependent?.services?.map((service, i) => (<div key={i}>{service.name}</div>))}
          </div>
          <p className='font-10'>Contact number {event?.dependent?.guardianPhone}</p>
          <p className='font-10'>Contact email: {event?.dependent?.guardianEmail}</p>
        </div>
      </div >
    );
    const modalCancelProps = {
      visible: visibleCancel,
      onSubmit: this.handleConfirmCancel,
      onCancel: this.closeModalCancel,
      event: event,
    };
    const modalCurrentProps = {
      visible: visibleCurrent,
      onSubmit: this.closeModalCurrent,
      onCancel: this.closeModalCurrent,
      event: event,
    };

    return (
      <Drawer
        title={event?.type == 1 ? intl.formatMessage(messages.screeningDetails) : event?.type == 2 ? intl.formatMessage(messages.evaluationDetails) : intl.formatMessage(messages.appointmentDetails)}
        closable={true}
        onClose={this.props.onClose}
        open={this.props.visible}
        extra={
          <Button type='text' icon={<BsBell size={18} />} />
        }
      >
        <div>
          <div className='detail-item flex'>
            <div className='title'>
              <p className='font-18 font-700 title'>{intl.formatMessage(messages.what)}</p>
              <BiDollarCircle size={18} className='mx-10 text-green500' />
            </div>
            <p className='font-16'>{event?.skillSet?.name}</p>
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
              <a className='font-18 underline text-primary'>{`${event?.dependent?.firstName} ${event?.dependent?.lastName}`}</a>
            </div>
          </Popover>
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
                <a className='font-18 underline text-primary'>{event?.provider?.name}</a>
                <BiInfoCircle size={12} className='text-primary ml-auto' />
              </div>
            </div>
          </Popover>
          <div className='detail-item flex'>
            <p className='font-18 font-700 title'>{intl.formatMessage(messages.when)}</p>
            <p className='font-18'>{new Date(event?.date).toLocaleString()}</p>
          </div>
          {event?.type > 1 && (
            <div className='detail-item flex'>
              <p className='font-18 font-700 title'>{intl.formatMessage(messages.where)}</p>
              <p className='font-16'>{event?.location}</p>
            </div>
          )}
          {event?.type == 1 && (
            <div className='detail-item flex'>
              <p className='font-18 font-700 title'>{intl.formatMessage(messages.phonenumber)}</p>
              <p className='font-16'>{event?.phoneNumber}</p>
            </div>
          )}
        </div>
        <Row gutter={15} className='list-btn-detail'>
          {(role == 3 && moment(event?.date).isAfter(new Date()) && event?.status == 0 && !isCancelled) && (
            <>
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
              <Col span={12}>
                <Button
                  type='primary'
                  icon={<BsXCircle size={15} />}
                  block
                  onClick={this.openModalCancel}
                  disabled={isCancelled}
                >
                  {event?.status == 0 ? intl.formatMessage(messages.cancel) : event?.status == -1 ? intl.formatMessage(messages.closed) : event?.status == -2 ? intl.formatMessage(messages.cancelled) : ''}
                </Button>
              </Col>
              {event?.type > 2 && (
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
              <Col span={12}>
                <Button
                  type='primary'
                  icon={<ImPencil size={12} />}
                  block
                >
                  {intl.formatMessage(messages.editNotes)}
                </Button>
              </Col>
            </>
          )}
        </Row>
        {this.state.errorMessage.length > 0 && (<p className='text-right text-red mr-5'>{this.state.errorMessage}</p>)}
        <ModalCancelAppointment {...modalCancelProps} />
        <ModalCurrentAppointment {...modalCurrentProps} />
      </Drawer>
    );
  }
}

export default DrawerDetail;
