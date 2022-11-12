import './style/index.less';
import React, { Component } from 'react';
import { Drawer, Button, Row, Col, Typography, Input, Menu, Dropdown, Popover } from 'antd';
import { BsFillFlagFill, BsCheckCircle } from 'react-icons/bs';
import { BiInfoCircle } from 'react-icons/bi';
import intl from "react-intl-universal";
import messages from './messages';
import msgDetail from '../DrawerDetail/messages';
import { ModalNoShow, ModalBalance, ModalConfirm } from '../../components/Modal';
import request from '../../utils/api/request';
import moment from 'moment';
import { cancelAppointmentForProvider, closeAppointmentForProvider } from '../../utils/api/apiList';
import { getAppointmentsData, getAppointmentsMonthData } from '../../redux/features/appointmentsSlice';
import { store } from '../../redux/store';

const { Paragraph } = Typography;

class DrawerDetailPost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleNoShow: false,
      visibleBalance: false,
      publicFeedback: this.props.event?.publicFeedback ?? '',
      privateNotes: '',
      isProviderHover: false,
      isDependentHover: false,
      errorMessage: '',
      isModalConfirm: false,
      message: '',
      isClosed: this.props.event?.status == -1,
      isCancelled: this.props.evnt?.status == -2,
      modalType: '',
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.event?.status != this.props.event?.status) {
      this.setState({
        isCancelled: this.props.event.status < 0,
        isClosed: this.props.event.status < 0,
      });
    }
  }

  onShowModalNoShow = () => {
    this.setState({ visibleNoShow: true });
  };

  onCloseModalNoShow = () => {
    this.setState({ visibleNoShow: false });
  };
  onShowModalBalance = () => {
    this.setState({ visibleBalance: true });
  };

  onCloseModalBalance = () => {
    this.setState({ visibleBalance: false });
  };

  handleChangeFeedback = feedback => {
    this.setState({ publicFeedback: feedback });
  }

  handleChangeNotes = notes => {
    this.setState({ privateNotes: notes });
  }

  handleProviderHoverChange = (visible) => {
    this.setState({ isProviderHover: visible });
  };

  handleDependentHoverChange = (visible) => {
    this.setState({ isDependentHover: visible });
  };

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
            isClosed: true,
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
            isClosed: false,
          });
        }
      }).catch(error => {
        console.log('closed error---', error);
        this.setState({
          errorMessage: error.message,
          isClosed: false,
        });
      })
    }
  }

  handleCancel = () => {
    if (this.props.event?._id) {
      const data = { appointId: this.props.event._id };
      request.post(cancelAppointmentForProvider, data).then(result => {
        if (result.success) {
          this.setState({
            errorMessage: '',
            isCancelled: true,
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
            isCancelled: false,
          });
        }
      }).catch(error => {
        console.log('closed error---', error);
        this.setState({
          errorMessage: error.message,
          isCancelled: false,
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

  openCancelConfirmModal = () => {
    this.setState({
      isModalConfirm: true,
      message: 'Are you sure you want to cancel?',
      modalType: 'cancel',
    });
  }

  onConfirm = () => {
    this.setState({ isModalConfirm: false });
    this.state.modalType == 'cancel' && this.handleCancel();
    this.state.modalType == 'close' && this.handleMarkAsClosed();
  }

  onCancel = () => {
    this.setState({ isModalConfirm: false });
  }

  render() {
    const {
      visibleNoShow,
      visibleBalance,
      isProviderHover,
      isDependentHover,
      publicFeedback,
      isModalConfirm,
      message,
      isClosed,
      isCancelled,
    } = this.state;
    const { event } = this.props;
    const providerProfile = (
      <div className='provider-profile'>
        <p className='font-16 font-700 mb-10'>{intl.formatMessage(msgDetail.providerProfile)}</p>
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
        <p className='font-16 font-700 mb-10'>{intl.formatMessage(msgDetail.dependentProfile)}</p>
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
    const menu = (
      <Menu
        selectable
        defaultSelectedKeys={['2']}
        items={[
          {
            key: '1',
            label: (<a target="_blank" rel={intl.formatMessage(messages.pastDueBalance)} onClick={this.onShowModalBalance}>{intl.formatMessage(messages.pastDueBalance)}</a>),
          },
          {
            key: '2',
            label: (<a target="_blank" rel={intl.formatMessage(messages.noShow)} onClick={this.onShowModalNoShow}>{intl.formatMessage(messages.noShow)}</a>),
          }
        ]}
      />
    );
    const modalNoShowProps = {
      visible: visibleNoShow,
      onSubmit: this.onCloseModalNoShow,
      onCancel: this.onCloseModalNoShow,
    };
    const modalBalanceProps = {
      visible: visibleBalance,
      onSubmit: this.onCloseModalBalance,
      onCancel: this.onCloseModalBalance,
    };
    const modalConfirmProps = {
      visible: isModalConfirm,
      onSubmit: this.onConfirm,
      onCancel: this.onCancel,
      message: message,
    }

    return (
      <Drawer
        title={event?.type == 1 ? intl.formatMessage(msgDetail.screeningDetails) : event?.type == 2 ? intl.formatMessage(msgDetail.evaluationDetails) : event?.type == 3 ? intl.formatMessage(msgDetail.appointmentDetails) : intl.formatMessage(msgDetail.consultationDetails)}
        closable={true}
        onClose={this.props.onClose}
        open={this.props.visible}
      >
        <div>
          <div className='detail-item flex'>
            <div className='title'>
              <p className='font-18 font-700 title'>{intl.formatMessage(msgDetail.what)}</p>
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
              <p className='font-18 font-700 title'>{intl.formatMessage(msgDetail.who)}</p>
              <a className='font-18 underline text-primary'>{`${event?.dependent?.firstName} ${event?.dependent?.lastName}`}</a>
            </div>
          </Popover>
          {event?.type == 4 ? (
            <div className='detail-item flex'>
              <p className='font-18 font-700 title'>{intl.formatMessage(msgDetail.with)}</p>
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
                <p className='font-18 font-700 title'>{intl.formatMessage(msgDetail.with)}</p>
                <div className='flex flex-row flex-1'>
                  <a className='font-18 underline text-primary'>{event?.provider?.name}</a>
                  <BiInfoCircle size={12} className='text-primary ml-auto' />
                </div>
              </div>
            </Popover>
          )}
          <div className='detail-item flex'>
            <p className='font-18 font-700 title'>{intl.formatMessage(msgDetail.when)}</p>
            <p className='font-18'>{new Date(event?.date).toLocaleString()}</p>
          </div>
          {[2, 3].includes(event?.type) && (
            <div className='detail-item flex'>
              <p className='font-18 font-700 title'>{intl.formatMessage(msgDetail.where)}</p>
              <p className='font-16'>{event?.location}</p>
            </div>
          )}
          {[1, 4].includes(event?.type) && (
            <div className='detail-item flex'>
              <p className='font-18 font-700 title'>{intl.formatMessage(msgDetail.phonenumber)}</p>
              <p className='font-16'>{event?.phoneNumber}</p>
            </div>
          )}
        </div>
        {moment(event?.date).isBefore(moment()) && event?.status == 0 && (
          <div className='post-feedback mt-1'>
            <p className='font-18 font-700 mb-5'>{intl.formatMessage(messages.postSessionFeedback)}</p>
            <Input.TextArea rows={7} value={publicFeedback} onChange={e => this.handleChangeFeedback(e.target.value)} placeholder={intl.formatMessage(messages.postSessionFeedback)} />
          </div>
        )}
        <Row gutter={15} className='list-btn-detail'>
          {moment(event?.date).isBefore(moment()) && event?.status == 0 && (
            <Col span={12}>
              <Button
                type='primary'
                icon={<BsCheckCircle size={15} />}
                block
                onClick={() => this.openConfirmModal()}
                disabled={isClosed || isCancelled}
              >
                {intl.formatMessage(messages.markClosed)}
              </Button>
            </Col>
          )}
          {(event?.type > 1 && event?.status == -1 && moment(event?.date).isBefore(new Date())) && (
            <Col span={12}>
              <Dropdown overlay={menu} placement="bottomRight">
                <Button
                  type='primary'
                  icon={<BsFillFlagFill size={15} />}
                  block
                >
                  {intl.formatMessage(messages.flagDependent)}
                </Button>
              </Dropdown>
            </Col>
          )}
          <Col span={12}>
            <Button
              type='primary'
              icon={<BsCheckCircle size={15} />}
              block
              onClick={() => this.openCancelConfirmModal()}
              disabled={isCancelled || isClosed}
            >
              {intl.formatMessage(messages.cancel)}
            </Button>
          </Col>
        </Row>
        {this.state.errorMessage.length > 0 && (<p className='text-right text-red mr-5'>{this.state.errorMessage}</p>)}
        <ModalNoShow {...modalNoShowProps} />
        <ModalBalance {...modalBalanceProps} />
        <ModalConfirm {...modalConfirmProps} />
      </Drawer>
    );
  }
}

export default DrawerDetailPost;
