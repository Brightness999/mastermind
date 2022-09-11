import React from 'react';
import { 
  Avatar,
  Button,
} from 'antd';
import { FaUser } from 'react-icons/fa';
import { BiChevronLeft,  } from 'react-icons/bi';
import { BsFillFlagFill } from 'react-icons/bs';
import intl from 'react-intl-universal';
import messages from '../messages';
import msgCreateAccount from '../../Sign/CreateAccount/messages';
import msgDrawer from '../../../components/DrawerDetail/messages';
import msgModal from '../../../components/Modal/messages';
import './index.less';
import { store } from '../../../redux/store';
import { removeAppoint, setAppointMonth } from '../../../redux/features/appointmentsSlice';
import { connect } from 'react-redux';
import { compose } from 'redux';
class EventDetail extends React.Component {
  state = {
    isConfirm: false,
  };

  componentDidMount = () =>{

  }

  

  onRescheduleConfirm = () => {
    
  }

  showCancelConfirm = () =>{
    this.setState({isConfirm: true});
  }

  onKeepAppointment = ()=>{
    this.setState({isConfirm: false});
  }

  onCancelEvent = async() => {
    const { role, id, calendarEvents } = this.props
    const data = {
      token: localStorage.getItem('token'),
      role: role,
      data: {
        appointId: id,
      }
    }
    const result = await store.dispatch(removeAppoint(data))
    if(result.payload.success){
      const newCalendarEvents = calendarEvents.filter((item,index) => item._id != result.payload.data._id)
      this.props.setAppointMonth(newCalendarEvents)
      return this.props.backView({data:newCalendarEvents})
    }
  }
  render() {
    const { isConfirm } = this.state;
   
    return (
      <div className='calendar-content'>
        <div className='flex flex-row items-center'>
            <Button
              type="text"
              className='back-btn'
              onClick={this.props.backView}
            >
              <BiChevronLeft size={28}/>{intl.formatMessage(msgCreateAccount.back)}
            </Button>
            <p className='font-20 mb-0 ml-10'>Even Type</p>
            <div className='flex flex-row ml-auto'>
                <p className='font-18 font-700 mb-0 mr-5'>{intl.formatMessage(messages.recurring)}</p>
                <BsFillFlagFill className='text-red' size={20}/>
            </div>
        </div>
        <div className='flex flex-row items-start px-20 mt-1'>
          <div style={{width: 70}}>
            <Avatar shape="square" size={40} icon={<FaUser size={20} />} onClick={this.onShowDrawerDetail}/>
          </div>
          <div>
            <p className='font-18 font-700'>Dependent #1 First and Last Name</p>
            <div className='count-2'>
              <p className='font-18'>provider-name</p>
              <p className='font-18'>skillset</p>
            </div>
            <p className='font-18'>Full street address city state zip</p>
          </div>
        </div>
        <div className='flex flex-row px-20'>
          <div style={{width: 70}}>
            <p className='font-18 font-700 text-primary'>Today</p>
          </div>
          <div>
            <p className='font-18'>date/time</p>
          </div>
        </div>
        {!isConfirm && <div className='div-left-btn'>
          <Button type='primary' onClick={this.onRescheduleConfirm}>
            {intl.formatMessage(msgDrawer.reschedule).toUpperCase()}
          </Button>
          <Button onClick={this.showCancelConfirm}>
            {intl.formatMessage(messages.cancelEvent).toUpperCase()}
          </Button>
        </div>}
        {isConfirm && <div className='div-confirm'>
         <div className='text-center div-cancel-top'>
            <p className='font-18 font-500 mb-20'>Are you sure you want to <span className='text-red'>cancel</span> your "appointment"?</p>
          </div>
          <div className='text-center div-cancel-bottom'>
            <p className='font-18 font-500'>This cannot be undone & you may <span className='text-red'>lose</span> your slot & won't get it back</p>
          </div>
          <div className='btn-footer'>
            <Button type='primary' block onClick={this.onKeepAppointment}>{intl.formatMessage(msgModal.keepAppointment).toUpperCase()}</Button>
            <Button className='btn-warning' block onClick={this.onCancelEvent}>{intl.formatMessage(msgModal.confirmCancellation).toUpperCase()}</Button>
          </div>
        </div>}
      </div>
    );
  }
}
const mapStateToProps = state => {
  return ({
  })
}

export default compose(connect(mapStateToProps,{setAppointMonth}))(EventDetail);