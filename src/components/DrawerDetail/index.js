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
const { Paragraph } = Typography;

class DrawerDetail extends Component {
  state = {
    isProviderHover: false,
    isDependentHover: false,
    visibleCancel: false,
    visibleCurrent: false,
  };

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

  closeModalCurrent = () => {
    this.setState({ visibleCurrent: false });
  }

  openModalCurrent = () => {
    this.setState({ visibleCurrent: true });
  }

  render() {
    const { isProviderHover, isDependentHover, visibleCancel, visibleCurrent } = this.state;
    const { role, event, skillSet } = this.props;

    const providerProfile = (
      <div className='provider-profile'>
        <p className='font-16 font-700 mb-10'>{intl.formatMessage(messages.providerProfile)}</p>
        <div className='count-2'>
          <p className='font-10'>Name: {event?.provider?.name}</p>
          <p className='font-10'>Skillset(s): {event?.provider?.skillSet}</p>
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
        <p className='font-16 font-700 mb-10'>{intl.formatMessage(messages.providerProfile)}</p>
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
      onSubmit: this.closeModalCancel,
      onCancel: this.closeModalCancel,
      event: this.props.event,
    };
    const modalCurrentProps = {
      visible: visibleCurrent,
      onSubmit: this.closeModalCurrent,
      onCancel: this.closeModalCurrent,
    };
    console.log(event)

    return (
      <Drawer
        title={event?.status == 1 ? intl.formatMessage(messages.screeningDetails) : event?.status == 2 ? intl.formatMessage(messages.evaluationDetails) : intl.formatMessage(messages.appointmentDetails)}
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
            <p className='font-16'>{skillSet?.[event?.skillSet?.[0]]}</p>
          </div>
          <Popover
            placement="leftTop"
            content={dependentProfile}
            trigger="hover"
            visible={isDependentHover}
            onVisibleChange={this.handleDependentHoverChange}
          >
            <div className='detail-item flex'>
              <p className='font-18 font-700 title'>{intl.formatMessage(messages.who)}</p>
              <p className='font-18 underline text-primary'>{`${event?.dependent?.firstName} ${event?.dependent?.lastName}`}</p>
            </div>
          </Popover>
          <Popover
            placement="leftTop"
            content={providerProfile}
            trigger="hover"
            visible={isProviderHover}
            onVisibleChange={this.handleProviderHoverChange}
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
          {event?.status > 1 && (
            <div className='detail-item flex'>
              <p className='font-18 font-700 title'>{intl.formatMessage(messages.where)}</p>
              <p className='font-16'>{event?.location}</p>
            </div>
          )}
          {event?.status == 1 && (
            <div className='detail-item flex'>
              <p className='font-18 font-700 title'>{intl.formatMessage(messages.phonenumber)}</p>
              <p className='font-16'>{event?.phoneNumber}</p>
            </div>
          )}
        </div>
        <Row gutter={15} className='list-btn-detail'>
          {(role == 3 && moment(event?.date).isAfter(new Date())) && (
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
              {event?.status > 3 && (
                <>
                  <Col span={12}>
                    <Button
                      type='primary'
                      icon={<FaFileContract size={12} />}
                      block
                    >
                      {intl.formatMessage(messages.requestInvoice)}
                    </Button>
                  </Col>
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
            </>
          )}
          <Col span={12}>
            <Button
              type='primary'
              icon={<BsXCircle size={15} />}
              block
              onClick={this.openModalCancel}
            >
              {intl.formatMessage(messages.cancel)}
            </Button>
          </Col>
        </Row>

        <ModalCancelAppointment {...modalCancelProps} />
        <ModalCurrentAppointment {...modalCurrentProps} />
      </Drawer>
    );
  }
}

export default DrawerDetail;
