import React, { Component, useRef } from 'react';
import { FaUserAlt } from 'react-icons/fa';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import { BsSearch } from 'react-icons/bs';
import { Badge, Avatar, Button, Input } from 'antd';
import intl from "react-intl-universal";
import messages from './messages';
import './style/index.less';
const scrollElement = React.createRef();
class MainHeader extends Component {

  scrollTrans = (scrollOffset) => {
    scrollElement.current.scrollLeft += scrollOffset;
  }
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
        <div className='div-search'>
          <BsSearch size={18} />
          <Input placeholder={`${intl.formatMessage(messages.search)}...`}/>
        </div>
        <div className='div-trans flex flex-row'>
          <Avatar size={36} className='trans-all'>All</Avatar>
          <Button 
            type='text' 
            className='trans-left'icon={<BiChevronLeft size={35}/>}
            onClick={() => this.scrollTrans(-40)}
          />
          <div className='trans-scroll' ref = {scrollElement}>
            <Avatar size={36} className='trans-item'>CMR</Avatar>
            <Avatar size={36} className='trans-item'>CR</Avatar>
            <Avatar size={36} className='trans-item'>MZR</Avatar>
            <Avatar size={36} className='trans-item'>DR</Avatar>
            <Avatar size={36} className='trans-item'>FR</Avatar>
            <Avatar size={36} className='trans-item'>SBR</Avatar>
            <Avatar size={36} className='trans-item'>SZR</Avatar>
            <Avatar size={36} className='trans-item'>EYR</Avatar>
            <Avatar size={36} className='trans-item'>KR</Avatar>
          </div>
          <Button
            type='text' 
            className='trans-right'icon={<BiChevronRight size={35}/>}
            onClick={() => this.scrollTrans(40)}
          />
          <div className='trans-new'>
            <p className='font-16 text-white mb-0'>{intl.formatMessage(messages.new).toUpperCase()}</p>
          </div>
        </div>
      </div>
    );
  }
}

export default MainHeader;
