import './style/index.less';
import React, { Component } from 'react';
import { Drawer, Button, Row, Col, Typography, Popover, Input, message, Menu, Dropdown } from 'antd';
import { BsBell, BsCheckCircle, BsClockHistory, BsFillFlagFill, BsXCircle } from 'react-icons/bs';
import { BiDollarCircle, BiInfoCircle } from 'react-icons/bi';
import { FaFileContract } from 'react-icons/fa';
import { ImPencil } from 'react-icons/im';
import { ModalBalance, ModalCancelAppointment, ModalCurrentAppointment, ModalCurrentReferralService, ModalInvoice, ModalNoShow, ModalProcessAppointment } from '../../components/Modal';
import intl from "react-intl-universal";
import messages from './messages';
import msgModal from '../Modal/messages';
import msgDetailPost from '../DrawerDetailPost/messages';
import moment from 'moment';
import request from '../../utils/api/request';
import { store } from '../../redux/store';
import { getAppointmentsData, getAppointmentsMonthData } from '../../redux/features/appointmentsSlice';
import { cancelAppointmentForParent, closeAppointmentForProvider, declineAppointmentForProvider, leaveFeedbackForProvider, requestFeedbackForClient, setFlag, updateAppointmentNotesForParent } from '../../utils/api/apiList';
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
      isNotPending: this.props.event?.status < 0,
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
            this.setState({
              errorMessage: '',
              isNotPending: true,
            });
            this.updateAppointments();
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
    this.updateAppointments();
  }

  closeModalCurrent = () => {
    this.props.event?.type == 4 ? this.setState({ visibleCurrentReferral: false }) : this.setState({ visibleCurrent: false });
  }

  openModalCurrent = () => {
    this.props.event?.type == 4 ? this.setState({ visibleCurrentReferral: true }) : this.setState({ visibleCurrent: true });
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
    let duration = event?.provider?.duration ?? 0;
    if (event?.type == 2) {
      duration = duration * 1 + event?.provider?.separateEvaluationDuration * 1;
    }
    return `${moment(event?.date).format('MM/DD/YYYY hh:mm')} - ${moment(event?.date).add(duration, 'minutes').format('hh:mm a')}`;
  }

  handleMarkAsClosed = (items, skipEvaluation, note, publicFeedback) => {
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
          this.setState({
            errorMessage: '',
            isNotPending: true,
            visibleProcess: false,
          });
          this.updateAppointments();
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

  handleDecline = (note, publicFeedback) => {
    if (this.props.event?._id) {
      const data = {
        appointmentId: this.props.event._id,
        publicFeedback: publicFeedback ? publicFeedback : this.state.publicFeedback,
        note: note,
      }
      request.post(declineAppointmentForProvider, data).then(result => {
        if (result.success) {
          this.setState({
            errorMessage: '',
            isNotPending: true,
            visibleProcess: false,
          });
          this.updateAppointments();
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

  openModalConfirm = (note, publicFeedback) => {
    this.setState({ isModalInvoice: true, note: note, publicFeedback: publicFeedback });
  }

  onConfirm = (items) => {
    this.setState({ isModalInvoice: false });
    this.handleMarkAsClosed(items, false);
  }

  onCancel = () => {
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
        message.success('The request was sent.');
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
    this.setState({ visibleProcess: false });
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
        type: event?.type == 2 ? intl.formatMessage(msgModal.evaluation) : event?.type == 3 ? intl.formatMessage(msgModal.standardSession) : event?.type == 4 ? intl.formatMessage(msgModal.subsidizedSession) : '',
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
        type: event?.type == 2 ? intl.formatMessage(msgModal.evaluation) : event?.type == 3 ? intl.formatMessage(msgModal.standardSession) : event?.type == 4 ? intl.formatMessage(msgModal.subsidizedSession) : '',
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

  render() {
    const { isProviderHover, isDependentHover, visibleCancel, visibleProcess, visibleCurrent, isNotPending, isShowEditNotes, notes, publicFeedback, isModalInvoice, isLeftFeedback, userRole, visibleCurrentReferral, isShowFeedback, visibleNoShow, visibleBalance, isFlag } = this.state;
    const { event } = this.props;

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

    const providerProfile = (
      <div className='provider-profile'>
        <p className='font-16 font-700 mb-10'>{`${event?.provider?.firstName ?? ''} ${event?.provider?.lastName ?? ''}`}</p>
        <div className='flex'>
          <div className='flex-1'>
            {event?.provider?.contactNumber?.map((phone, index) => (
              <p key={index} className='font-10'>{phone.phoneNumber}</p>
            ))}
            {event?.provider?.contactEmail?.map((email, index) => (
              <p key={index} className='font-10'>{email.email}</p>
            ))}
            {event?.provider?.serviceAddress && (
              <p className='font-10'>{event?.provider.serviceAddress}</p>
            )}
          </div>
          <div className='flex-1'>

          </div>
        </div>
        <div className='flex'>
          <div className='flex-1'>
            <p className='font-10 mb-0 text-bold'>Skillset(s):</p>
            {event?.provider?.skillSet?.map((skill, index) => (
              <p key={index} className='font-10 mb-0'>{skill.name}</p>
            ))}
          </div>
          <div className='font-10 flex-1'>
            <p className='mb-0 text-bold'>Grade level(s)</p>
            <div>{event?.provider?.academicLevel?.map((level, i) => (
              <div key={i} className="flex">
                <span>{level.level}</span>
                <span className='ml-10'>${level.rate}</span>
              </div>
            ))}</div>
          </div>
        </div>
        <p className='font-10 mb-0 text-bold'>Profile</p>
        <div className='profile-text'>
          <Paragraph className='font-12 mb-0' ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>
            {event?.provider?.publicProfile}
          </Paragraph>
        </div>
      </div>
    );
    const dependentProfile = (
      <div className='provider-profile'>
        <p className='font-16 font-700 mb-10'>{event?.dependent?.firstName ?? ''} {event?.dependent?.lastName ?? ''}</p>
        <div className='flex'>
          <div className='flex-1'>
            <p className='font-10 mb-0'>{event?.dependent?.guardianPhone ?? ''}</p>
            <p className='font-10 mb-0'>{event?.dependent?.guardianEmail ?? ''}</p>
          </div>
          <div className='flex-1 font-10'>
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
      event: event,
    };
    const modalProcessProps = {
      visible: visibleProcess,
      onDecline: this.handleDecline,
      onSubmit: this.handleMarkAsClosed,
      onConfirm: this.openModalConfirm,
      onCancel: this.closeModalProcess,
      event: event,
    };
    const modalCurrentProps = {
      visible: visibleCurrent,
      onSubmit: this.submitModalCurrent,
      onCancel: this.closeModalCurrent,
      event: event,
    };
    const modalInvoiceProps = {
      visible: isModalInvoice,
      onSubmit: this.onConfirm,
      onCancel: this.onCancel,
      event: event,
    }
    const modalCurrentReferralProps = {
      visible: visibleCurrentReferral,
      onCancel: this.closeModalCurrent,
      event: event,
    }
    const modalNoShowProps = {
      visible: visibleNoShow,
      onSubmit: this.onSubmitFlagNoShow,
      onCancel: this.onCloseModalNoShow,
      event: event,
    };
    const modalBalanceProps = {
      visible: visibleBalance,
      onSubmit: this.onSubmitFlagBalance,
      onCancel: this.onCloseModalBalance,
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
              <a className='font-18 underline text-primary'>{`${event?.dependent?.firstName ?? ''} ${event?.dependent?.lastName ?? ''}`}</a>
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
                  <a className='font-18 underline text-primary'>{`${event?.provider?.firstName ?? ''} ${event?.provider?.lastName ?? ''}`}</a>
                  <BiInfoCircle size={12} className='text-primary ml-auto' />
                </div>
              </div>
            </Popover>
          )}
          <div className='detail-item flex'>
            <p className='font-18 font-700 title'>{intl.formatMessage(messages.when)}</p>
            <p className='font-18'>{event?.type == 1 ? event?.screeningTime ?? '' : this.displayDuration()}</p>
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
          {event.status != 0 && (
            <>
              <p className='font-18 font-700 mb-5'>{intl.formatMessage(messages.feedback)}</p>
              <Input.TextArea rows={7} className="appointment-feedback" disabled={userRole == 3 ? true : !isShowFeedback} value={publicFeedback} onChange={e => this.handleChangeFeedback(e.target.value)} placeholder={intl.formatMessage(messages.feedback)} />
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
          {[1, 2, 4].includes(event?.type) && event?.status == 0 && userRole > 3 && (
            <Col span={12}>
              <Button
                type='primary'
                icon={<BsCheckCircle size={15} />}
                block
                onClick={() => [1, 2].includes(event.type) ? this.openModalProcess() : this.handleMarkAsClosed()}
                disabled={isNotPending}
                className='flex items-center gap-2 h-30'
              >
                {intl.formatMessage(msgDetailPost.markClosed)}
              </Button>
            </Col>
          )}
          {[3, 5].includes(event?.type) && moment(event?.date).isBefore(moment()) && event?.status == 0 && userRole > 3 && (
            <Col span={12}>
              <Button
                type='primary'
                icon={<BsCheckCircle size={15} />}
                block
                onClick={() => this.openModalConfirm()}
                disabled={isNotPending}
                className='flex items-center gap-2 h-30'
              >
                {intl.formatMessage(msgDetailPost.markClosed)}
              </Button>
            </Col>
          )}
          {(userRole != 3 && !isShowFeedback && event?.status != 0) && (
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
          {(userRole == 3 && event?.status == -1 && !isLeftFeedback) && (
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
          {(!isFlag && userRole > 3 && event?.type > 1 && event?.status == -1 && moment(event?.date).isBefore(moment())) && (
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
          {(event?.type != 1 && event?.status == 0 && !isNotPending) && (
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
          {(event?.status == 0 && !isNotPending) && (
            <Col span={12}>
              <Button
                type='primary'
                icon={<BsXCircle size={15} />}
                block
                onClick={this.openModalCancel}
                disabled={isNotPending}
              >
                {intl.formatMessage(msgModal.cancel)}
              </Button>
            </Col>
          )}
          {(userRole == 3 && [2, 3].includes(event?.type) && event?.status == -1 && event?.flagStatus == 0) && (
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
          {(userRole == 3 && [2, 3].includes(event?.type) && event?.status == -1 && event?.flagStatus == 1) && (
            <Col span={12}>
              <Button
                type='primary'
                icon={<FaFileContract size={12} />}
                block
              >
                {intl.formatMessage(messages.requestClearance)}
              </Button>
            </Col>
          )}
          {(event?.status == 0 && !isNotPending) && (
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
        {this.state.errorMessage.length > 0 && (<p className='text-right text-red mr-5'>{this.state.errorMessage}</p>)}
        <ModalCancelAppointment {...modalCancelProps} />
        <ModalProcessAppointment {...modalProcessProps} />
        {visibleCurrent && <ModalCurrentAppointment {...modalCurrentProps} />}
        {visibleCurrentReferral && <ModalCurrentReferralService {...modalCurrentReferralProps} />}
        {isModalInvoice && <ModalInvoice {...modalInvoiceProps} />}
        {visibleNoShow && <ModalNoShow {...modalNoShowProps} />}
        {visibleBalance && <ModalBalance {...modalBalanceProps} />}
      </Drawer>
    );
  }
}

export default DrawerDetail;
