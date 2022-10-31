import './style/index.less';
import React, { Component } from 'react';
import { Drawer, Button, Row, Col, Typography, Input, Menu, Dropdown, Popover, message } from 'antd';
import { BsFillFlagFill, BsCheckCircle } from 'react-icons/bs';
import { BiDollarCircle, BiInfoCircle } from 'react-icons/bi';
import intl from "react-intl-universal";
import messages from './messages';
import msgDetail from '../DrawerDetail/messages';
import { ModalNoShow, ModalBalance, ModalConfirm } from '../../components/Modal';
import request from '../../utils/api/request';
const { Paragraph } = Typography;

class DrawerDetailPost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleNoShow: false,
      visibleBalance: false,
      publicFeedback: props.event?.publicFeedback ?? '',
      privateNotes: '',
      isProviderHover: false,
      isDependentHover: false,
      errorMessage: '',
      isModalConfirm: false,
      message: '',
      isClosed: false,
    };
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
      request.post('providers/close_appointment', data).then(result => {
        if (result.success) {
          this.setState({
            errorMessage: '',
            isClosed: true,
          });
          message.success({
            content: intl.formatMessage(messages.screeningClosed),
            className: 'popup-scheduled',
          });
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

  openConfirmModal = () => {
    this.setState({
      isModalConfirm: true,
      message: 'Are you sure you want to mark as closed?'
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
    const {
      visibleNoShow,
      visibleBalance,
      isProviderHover,
      isDependentHover,
      publicFeedback,
      isModalConfirm,
      message,
      isClosed,
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
        title={event?.type == 1 ? intl.formatMessage(msgDetail.screeningDetails) : event?.type == 2 ? intl.formatMessage(msgDetail.evaluationDetails) : intl.formatMessage(msgDetail.appointmentDetails)}
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
              <p className='font-18 underline text-primary'>{`${event?.dependent?.firstName} ${event?.dependent?.lastName}`}</p>
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
              <div className='flex flex-row title'>
                <p className='font-18 font-700'>{intl.formatMessage(msgDetail.with)}</p>
                <BiDollarCircle size={18} className='mx-10 text-primary' />
              </div>
              <div className='flex flex-row flex-1'>
                <p className='font-18 underline text-primary'>{event?.provider?.name}</p>
                <BiInfoCircle size={12} className='text-primary ml-auto' />
              </div>
            </div>
          </Popover>
          <div className='detail-item flex'>
            <p className='font-18 font-700 title'>{intl.formatMessage(msgDetail.when)}</p>
            <p className='font-18'>{new Date(event?.date).toLocaleString()}</p>
          </div>
          <div className='detail-item flex'>
            <p className='font-18 font-700 title'>{intl.formatMessage(msgDetail.where)}</p>
            <p className='font-16'>{event?.location}</p>
          </div>
        </div>
        <div className='post-feedback mt-1'>
          <p className='font-18 font-700 mb-5'>{intl.formatMessage(messages.postSessionFeedback)}</p>
          <Input.TextArea rows={7} value={publicFeedback} onChange={e => this.handleChangeFeedback(e.target.value)} placeholder={intl.formatMessage(messages.postSessionFeedback)} />
        </div>
        <Row gutter={15} className='list-btn-detail'>
          <Col span={12}>
            <Button
              type='primary'
              icon={<BsCheckCircle size={15} />}
              block
              onClick={() => this.openConfirmModal()}
              disabled={isClosed}
            >
              {intl.formatMessage(messages.markClosed)}
            </Button>
          </Col>
          {event?.type > 1 && (
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
