import './style/index.less';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Drawer, Button, Row, Col, Typography, Popover } from 'antd';
import { BsBell, BsClockHistory, BsXCircle } from 'react-icons/bs';
import { BiDollarCircle, BiInfoCircle } from 'react-icons/bi';
import { FaFileContract } from 'react-icons/fa';
import { ImPencil } from 'react-icons/im';
import { ModalCancelAppointment, ModalCurrentAppointment } from '../../components/Modal';
import intl from "react-intl-universal";
import messages from './messages';
const { Paragraph } = Typography;

class DrawerDetail extends Component {
  state = {
    hovered: false,
    clicked: false,
    visibleCancel: false,
    visibleCurrent: false,
  };

  handleHoverChange = (visible) => {
    this.setState({hovered: visible});
    this.setState({clicked: false});
  };

  handleClickChange = (visible) => {
    this.setState({hovered: false});
    this.setState({clicked: visible });
  };

  closeModalCancel = () => {
    this.setState({visibleCancel: false});
  }
  openModalCancel = () => {
    this.setState({visibleCancel: true});
  }

  closeModalCurrent = () => {
    this.setState({visibleCurrent: false});
  }
  openModalCurrent = () => {
    this.setState({visibleCurrent: true});
  }
  render() {
    const { hovered, clicked, visibleCancel, visibleCurrent } = this.state;
    const contentProfile = (
      <div className='provider-profile'>
          <p className='font-16 font-700 mb-10'>{intl.formatMessage(messages.providerProfile)}</p>
          <div className='count-2'>
            <p className='font-10'>Name</p>
            <p className='font-10'>Skillset(s)</p>
          </div>
          <p className='font-10'>Practice/Location</p>
          <div className='count-2'>
            <p className='font-10'>Contact number</p>
            <p className='font-10'>Contact email</p>
          </div>
          <div className='count-2'>
            <p className='font-10'>Academic level(s)</p>
            <p className='font-10'>Subsidy (blank or NO Sub.)</p>
          </div>
          <div className='profile-text'>
            <Paragraph className='font-12 mb-0' ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>
              Profile “blurb”
            </Paragraph>
          </div>
      </div>
    );
    const modalCancelProps = {
      visible: visibleCancel,
      onSubmit: this.closeModalCancel,
      onCancel: this.closeModalCancel,
    };
    const modalCurrentProps = {
      visible: visibleCurrent,
      onSubmit: this.closeModalCurrent,
      onCancel: this.closeModalCurrent,
    };
    return (
      <Drawer
        title={intl.formatMessage(messages.appointmentDetails)}
        closable={true}
        onClose={this.props.onClose}
        open={this.props.visible}
        extra={
          <Button type='text' icon={<BsBell size={18}/>}/>
        }
      >
        <div>
          <div className='detail-item flex'>
            <div className='title'> 
              <p className='font-18 font-700 title'>{intl.formatMessage(messages.what)}</p>
              <BiDollarCircle size={18} className='mx-10 text-green500'/>
            </div>
            <p className='font-16'>30 Minute Occupational Therapy Session</p>
          </div>
          <div className='detail-item flex'>
            <p className='font-18 font-700 title'>{intl.formatMessage(messages.who)}</p>
            <p className='font-18 underline text-primary'>Dependent name</p>
          </div>
          <Popover 
            placement="leftTop" 
            content={contentProfile} 
            trigger="hover"
            visible={hovered}
            onVisibleChange={this.handleHoverChange}
          >
            <Popover 
              placement="leftTop" 
              content={contentProfile} 
              trigger="click"
              visible={clicked}
              onVisibleChange={this.handleClickChange}
            >
              <div className='detail-item flex'>
                <p className='font-18 font-700 title'>{intl.formatMessage(messages.with)}</p>
                <div className='flex flex-row flex-1'>
                    <a className='font-18 underline text-primary'>Provider name</a>
                  <BiInfoCircle size={12} className='text-primary ml-auto'/>
                </div>
              </div>
            </Popover>
          </Popover>
          <div className='detail-item flex'>
            <p className='font-18 font-700 title'>{intl.formatMessage(messages.when)}</p>
            <p className='font-18'>07/27/2022 &#8226; 12:30pm</p>
          </div>
          <div className='detail-item flex'>
            <p className='font-18 font-700 title'>{intl.formatMessage(messages.where)}</p>
            <p className='font-16'>1234 Somewhere Rd Chicago, IL 77777</p>
          </div>
        </div>
        <Row gutter={15} className='list-btn-detail'>
          <Col span={12}>
            <Button 
            type='primary' 
            icon={<BsClockHistory size={15}/>} 
            block
            onClick={this.openModalCurrent}>
              {intl.formatMessage(messages.reschedule)}
            </Button>
          </Col>
          <Col span={12}>
            <Button 
              type='primary' 
              icon={<BsXCircle size={15}/>} 
              block
              onClick={this.openModalCancel}>
              {intl.formatMessage(messages.cancel)}
            </Button>
          </Col>
          <Col span={12}>
            <Button type='primary' icon={<FaFileContract size={12}/>} block>{intl.formatMessage(messages.requestInvoice)}</Button>
          </Col>
          <Col span={12}>
            <Button type='primary' icon={<ImPencil size={12}/>} block>{intl.formatMessage(messages.editNotes)}</Button>
          </Col>
        </Row>
        
        <ModalCancelAppointment {...modalCancelProps}/>
        <ModalCurrentAppointment {...modalCurrentProps}/>
      </Drawer>
    );
  }
}

export default DrawerDetail;
