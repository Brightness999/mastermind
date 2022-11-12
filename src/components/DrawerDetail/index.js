import './style/index.less';
import React, { Component } from 'react';
import { Drawer, Button, Row, Col, Typography, Popover, Input, message } from 'antd';
import { BsBell, BsClockHistory, BsXCircle } from 'react-icons/bs';
import { BiDollarCircle, BiInfoCircle } from 'react-icons/bi';
import { FaFileContract } from 'react-icons/fa';
import { ImPencil } from 'react-icons/im';
import { ModalCancelAppointment, ModalCurrentAppointment } from '../../components/Modal';
import intl from "react-intl-universal";
import messages from './messages';
import msgModal from '../Modal/messages';
import msgDetailPost from '../DrawerDetailPost/messages';
import moment from 'moment';
import request from '../../utils/api/request';
import { store } from '../../redux/store';
import { getAppointmentsData, getAppointmentsMonthData } from '../../redux/features/appointmentsSlice';
import { cancelAppointmentForParent, updateAppointmentNotesForParent } from '../../utils/api/apiList';
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
      isNotPending: this.props.evnt?.status < 0,
      isShowEditNotes: false,
      notes: this.props.event?.notes,
      isModalConfirm: false,
      message: '',
      publicFeedback: this.props.event?.publicFeedback ?? '',
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.event?.status != this.props.event?.status) {
      this.setState({
        isNotPending: this.props.event.status < 0,
      });
    }
    if (prevProps.event?.notes != this.props.event?.notes) {
      this.setState({ notes: this.props.event?.notes });
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

  handleChangeFeedback = feedback => {
    this.setState({ publicFeedback: feedback });
  }

  handleConfirmCancel = () => {
    this.setState({ visibleCancel: false }, () => {
      if (this.props.event?._id) {
        const data = { appointId: this.props.event._id };
        request.post(cancelAppointmentForParent, data).then(result => {
          if (result.success) {
            this.setState({
              errorMessage: '',
              isNotPending: true,
            });
            store.dispatch(getAppointmentsData({ role: this.props.role }));
            const month = this.props.calendar.current?._calendarApi.getDate().getMonth() + 1;
            const year = this.props.calendar.current?._calendarApi.getDate().getFullYear();
            const dataFetchAppointMonth = {
              role: this.props.role,
              data: {
                month: month,
                year: year,
              }
            };
            store.dispatch(getAppointmentsMonthData(dataFetchAppointMonth));
          } else {
            this.setState({
              errorMessage: result.data,
              isNotPending: true,
            });
          }
        }).catch(error => {
          console.log('closed error---', error);
          this.setState({
            errorMessage: error.message,
            isNotPending: true,
          });
        })
      }
    });
  }

  submitModalCurrent = () => {
    this.setState({ visibleCurrent: false });
    store.dispatch(getAppointmentsData({ role: this.props.role }));
    const month = this.props.calendar.current?._calendarApi.getDate().getMonth() + 1;
    const year = this.props.calendar.current?._calendarApi.getDate().getFullYear();
    const dataFetchAppointMonth = {
      role: this.props.role,
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

  openModalCurrent = () => {
    this.setState({ visibleCurrent: true });
  }

  showEditNotes = () => {
    this.setState({ isShowEditNotes: true });
  }

  hideEditNotes = () => {
    this.setState({ isShowEditNotes: false });
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
        }
      }).catch(err => {
        console.log('update edit notes error---', err);
        this.setState({ errorMessage: err.message });
      })
    }
  }

  displayDuration = () => {
    const { event } = this.props;
    return `${moment(event?.date).format('MM/DD/YYYY hh:mm')} - ${moment(event?.date).add(event?.duration, 'minutes').format('hh:mm a')}`;
  }


  handleMarkAsClosed = () => {
    if (this.props.event?._id) {
      const data = {
        appointmentId: this.props.event._id,
        publicFeedback: this.state.publicFeedback,
      }
      request.post(closeAppointmentForProvider, data).then(result => {
        if (result.success) {
          this.setState({
            errorMessage: '',
            isNotPending: true,
          });
          store.dispatch(getAppointmentsData({ role: this.props.role }));
          const month = this.props.calendar.current?._calendarApi.getDate().getMonth() + 1;
          const year = this.props.calendar.current?._calendarApi.getDate().getFullYear();
          const dataFetchAppointMonth = {
            role: this.props.role,
            data: {
              month: month,
              year: year,
            }
          };
          store.dispatch(getAppointmentsMonthData(dataFetchAppointMonth));
        } else {
          this.setState({
            errorMessage: result.data,
            isNotPending: false,
          });
        }
      }).catch(error => {
        console.log('closed error---', error);
        this.setState({
          errorMessage: error.message,
          isNotPending: false,
        });
      })
    }
  }

  openConfirmModal = () => {
    this.setState({
      isModalConfirm: true,
      message: 'Are you sure you want to mark as closed?',
      modalType: 'close',
    });
  }

  onConfirm = () => {
    this.setState({ isModalConfirm: false });
    this.handleMarkAsClosed();
  }

  onCancel = () => {
    this.setState({ isModalConfirm: false });
  }

  render() {
    const { isProviderHover, isDependentHover, visibleCancel, visibleCurrent, isNotPending, isShowEditNotes, notes, publicFeedback } = this.state;
    const { role, event } = this.props;

    const providerProfile = (
      <div className='provider-profile'>
        <p className='font-16 font-700 mb-10'>{intl.formatMessage(messages.providerProfile)}</p>
        <div className='count-2'>
          <p className='font-10'>Name: {event?.provider?.name}</p>
          <p className='font-10'>Skillset(s): {event?.provider?.skillSet?.name}</p>
        </div>
        <p className='font-10'>Practice/Location: {event?.provider?.serviceAddress}</p>
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
      onSubmit: this.submitModalCurrent,
      onCancel: this.closeModalCurrent,
      event: event,
    };

    return (
      <Drawer
        title={event?.type == 1 ? intl.formatMessage(messages.screeningDetails) : event?.type == 2 ? intl.formatMessage(messages.evaluationDetails) : event?.type == 3 ? intl.formatMessage(messages.appointmentDetails) : intl.formatMessage(messages.consultationDetails)}
        closable={true}
        onClose={() => { this.props.onClose(); this.setState({ isShowEditNotes: false }); }}
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
          {event?.type == 4 ? (
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
                  <a className='font-18 underline text-primary'>{event?.provider?.name}</a>
                  <BiInfoCircle size={12} className='text-primary ml-auto' />
                </div>
              </div>
            </Popover>
          )}
          <div className='detail-item flex'>
            <p className='font-18 font-700 title'>{intl.formatMessage(messages.when)}</p>
            <p className='font-18'>{this.displayDuration()}</p>
          </div>
          {[2, 3].includes(event?.type) && (
            <div className='detail-item flex'>
              <p className='font-18 font-700 title'>{intl.formatMessage(messages.where)}</p>
              <p className='font-16'>{event?.location}</p>
            </div>
          )}
          {[1, 4].includes(event?.type) && (
            <div className='detail-item flex'>
              <p className='font-18 font-700 title'>{intl.formatMessage(messages.phonenumber)}</p>
              <p className='font-16'>{event?.phoneNumber}</p>
            </div>
          )}
        </div>
        {isShowEditNotes && (
          <>
            <Input.TextArea rows={5} value={notes} onChange={(e) => this.handleChangeNotes(e.target.value)} />
            <div className='flex gap-2 mt-10'>
              <Button
                type='primary'
                block
                onClick={this.handleUpdateNotes}
              >
                {intl.formatMessage(msgModal.save)}
              </Button>
              <Button
                type='primary'
                block
                onClick={this.hideEditNotes}
              >
                {intl.formatMessage(messages.cancel)}
              </Button>
            </div>
          </>
        )}
        {moment(event?.date).isBefore(moment()) && event?.status == 0 && (
          <div className='post-feedback mt-1'>
            <p className='font-18 font-700 mb-5'>{intl.formatMessage(msgDetailPost.postSessionFeedback)}</p>
            <Input.TextArea rows={7} value={publicFeedback} onChange={e => this.handleChangeFeedback(e.target.value)} placeholder={intl.formatMessage(messages.postSessionFeedback)} />
          </div>
        )}
        <Row gutter={15} className='list-btn-detail'>
          {(role != 30 && moment(event?.date).isAfter(moment()) && event?.status == 0 && !isNotPending) && (
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
                  disabled={isNotPending}
                >
                  {event?.status == 0 ? intl.formatMessage(messages.cancel) : event?.status == -1 ? intl.formatMessage(messages.closed) : event?.status == -2 ? intl.formatMessage(messages.cancelled) : ''}
                </Button>
              </Col>
              {[2, 3].includes(event?.type) && (
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
              {moment(event?.date).isBefore(moment()) && event?.status == 0 && (
                <Col span={12}>
                  <Button
                    type='primary'
                    icon={<BsCheckCircle size={15} />}
                    block
                    onClick={() => this.openConfirmModal()}
                    disabled={isNotPending}
                  >
                    {intl.formatMessage(msgDetailPost.markClosed)}
                  </Button>
                </Col>
              )}
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
