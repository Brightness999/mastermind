import React, { Component } from 'react';
import { FaUserAlt } from 'react-icons/fa';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import { Badge, Avatar, Button } from 'antd';
import intl from "react-intl-universal";
import messages from './messages';
import './style/index.less';

class MainHeader extends Component {
  render() {
    
    return (
      <div className='component-mainheader'>
        <div className='div-account'>
          <div className='account-icon'>
            <Badge size="small" count={6}>
              <Avatar icon={<FaUserAlt size={17} className='text-white'/>} />
            </Badge>
          </div>
          <div className='account-name'>
              <p className='mb-0'>Account Name Here</p>
              <p className='font-10 mb-0'>Subname Here</p>
          </div>
        </div>
        <div className='div-trans flex flex-row'>
          <Avatar size={36} className='trans-all'>All</Avatar>
          <Button type='text' className='trans-left'icon={<BiChevronLeft size={35}/>}/>
          <div className='trans-scroll'>
            <Avatar size={36} className='trans-item'>CMR</Avatar>
            <Avatar size={36} className='trans-item'>CR</Avatar>
            <Avatar size={36} className='trans-item'>MZR</Avatar>
            <Avatar size={36} className='trans-item'>DR</Avatar>
            <Avatar size={36} className='trans-item'>FR</Avatar>
            <Avatar size={36} className='trans-item'>SBR</Avatar>
            <Avatar size={36} className='trans-item'>SZR</Avatar>
            <Avatar size={36} className='trans-item'>SZR</Avatar>
            <Avatar size={36} className='trans-item'>KR</Avatar>
          </div>
          <Button type='text' className='trans-right'icon={<BiChevronRight size={35}/>}/>
          <div className='trans-new'>
            <p className='font-16 text-white mb-0'>{intl.formatMessage(messages.new).toUpperCase()}</p>
          </div>
        </div>

      </div>
    );
  }
}

export default MainHeader;
