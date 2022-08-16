import React from 'react';
import { connect } from 'dva';
import { 
  Collapse,
  Badge,
  Avatar,
  Tabs,
  Dropdown,
  Menu,
  Button,
  Segmented,
  Row,
  Col,
  Checkbox,
  Select,
  Tooltip,
  message
} from 'antd';
import { FaUser, FaCalendarAlt } from 'react-icons/fa';
import { GiBackwardTime } from 'react-icons/gi';
import { BiChevronLeft,  } from 'react-icons/bi';
import { MdFormatAlignLeft } from 'react-icons/md';
import { BsEnvelope, BsFilter, BsXCircle, BsX, BsFillDashSquareFill, BsFillPlusSquareFill, BsClockHistory, BsFillFlagFill, BsCheckCircleFill } from 'react-icons/bs';
import { ModalNewAppointment, ModalSubsidyProgress } from '../../../components/Modal';
import CSSAnimate from '../../../components/CSSAnimate';
import DrawerDetail from '../../../components/DrawerDetail';
import DrawerDetailPost from '../../../components/DrawerDetailPost';
import intl from 'react-intl-universal';

import messages from '../messages';
import msgCreateAccount from '../../Sign/CreateAccount/messages';
import './index.less';
export default class EventDetail extends React.Component {

  render() {
    return (
      <div className='calendar-content'>
        <div className='flex flex-row items-center'>
            <Button
              type="text"
              className='back-btn'
              onClick={this.props.backView}
            >
              <BiChevronLeft size={25}/>{intl.formatMessage(msgCreateAccount.back)}
            </Button>
            <p className='font-24 mb-0 ml-10'>Even Type</p>
            <div className='flex flex-row ml-auto'>
                <p className='font-18 font-700 mb-0 mr-5'>{intl.formatMessage(messages.recurring)}</p>
                <BsFillFlagFill className='text-red' size={20}/>
            </div>
        </div>
      </div>
    );
  }
}
