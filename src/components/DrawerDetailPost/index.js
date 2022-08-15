import './style/index.less';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Drawer, Button, Row, Col, Typography, Input } from 'antd';
import { BsBell, BsFillFlagFill, BsCheckCircle } from 'react-icons/bs';
import { BiDollarCircle, BiInfoCircle } from 'react-icons/bi';
import { FaFileContract } from 'react-icons/fa';
import { ImPencil } from 'react-icons/im';
import intl from "react-intl-universal";
import messages from './messages';
import msgDetail from '../DrawerDetail/messages';
const { Paragraph } = Typography;

class DrawerDetailPost extends Component {
  state = {
  };
 
  render() {
    
    return (
      <Drawer
        title={intl.formatMessage(msgDetail.appointmentDetails)}
        closable={true}
        onClose={this.props.onClose}
        visible={this.props.visible}
      >
        <div>
          <div className='detail-item flex'>
            <div className='title'> 
              <p className='font-18 font-700 title'>{intl.formatMessage(msgDetail.what)}</p>
            </div>
            <p className='font-16'>30 Minute Occupational Therapy Session</p>
          </div>
          <div className='detail-item flex'>
            <p className='font-18 font-700 title'>{intl.formatMessage(msgDetail.who)}</p>
            <p className='font-18'>Dependent name</p>
          </div>
          <div className='detail-item flex'>
            <div className='flex flex-row title'>
              <p className='font-18 font-700'>{intl.formatMessage(msgDetail.with)}</p>
              <BiDollarCircle size={18} className='mx-10 text-primary'/>
            </div>
            <div className='flex flex-row flex-1'>
              <p className='font-18'>Provider name</p>
              <BiInfoCircle size={12} className='text-primary ml-auto'/>
            </div>
          </div>
          <div className='detail-item flex'>
            <p className='font-18 font-700 title'>{intl.formatMessage(msgDetail.when)}</p>
            <p className='font-18'>07/27/2022 &#8226; 12:30pm</p>
          </div>
          <div className='detail-item flex'>
            <p className='font-18 font-700 title'>{intl.formatMessage(msgDetail.where)}</p>
            <p className='font-16'>1234 Somewhere Rd Chicago, IL 77777</p>
          </div>
        </div>
        <div className='post-feedback mt-1'>
          <p className='font-18 font-700 mb-5'>{intl.formatMessage(messages.postSessionFeedback)}</p>
          <Input.TextArea rows={7} placeholder={intl.formatMessage(messages.postSessionFeedback)}/>
        </div>
        <Row gutter={15} className='list-btn-detail'>
          <Col span={12}>
            <Button 
            type='primary' 
            icon={<BsCheckCircle size={15}/>} 
            block>
              {intl.formatMessage(messages.markClosed)}
            </Button>
          </Col>
          <Col span={12}>
            <Button 
              type='primary' 
              icon={<BsFillFlagFill size={15}/>} 
              block>
              {intl.formatMessage(messages.flagDependent)}
            </Button>
          </Col>
        </Row>
      </Drawer>
    );
  }
}

export default DrawerDetailPost;
