import React from 'react';
import { Modal, Button, Row, Col, Switch, Select, Typography, Calendar, Avatar, Input, Popover } from 'antd';
import { BiChevronLeft, BiChevronRight, BiSearch } from 'react-icons/bi';
import { BsCheck } from 'react-icons/bs';
import { GoPrimitiveDot } from 'react-icons/go';
import intl from 'react-intl-universal';
import messages from './messages';
import msgCreateAccount from '../../routes/Sign/CreateAccount/messages';
import msgDashboard from '../../routes/Dashboard/messages';
import msgDrawer from '../../components/DrawerDetail/messages';
import msgReview from '../../routes/Sign/SubsidyReview/messages';
import moment from 'moment';
import 'moment/locale/en-au'; 

import './style/index.less';
import '../../assets/styles/login.less';

const { Paragraph } = Typography;
moment.locale('en');
class ModalNewAppointment extends React.Component {
    state = {
        valueCalendar: moment(),
        selectedValue: moment(),
        currentMonth: moment().format('MMMM YYYY'),
        isChoose: 0,
        isConfirm: false,
        isPopupComfirm: false,
        isSelectTime: -1,
    }
    onSelectDate = (newValue) => {
        this.setState({valueCalendar: newValue});
        this.setState({selectedValue: newValue});
    }
    onPanelChange = (newValue) => {
        this.setState({valueCalendar: newValue});
    }
    nextMonth = () => {
        this.setState({selectedValue: moment(this.state.selectedValue).add(1, 'month')});
        this.setState({valueCalendar: moment(this.state.selectedValue).add(1, 'month')});
    }
    prevMonth = () => {
        this.setState({selectedValue: moment(this.state.selectedValue).add(-1, 'month')});
        this.setState({valueCalendar: moment(this.state.selectedValue).add(-1, 'month')});
    }

    onChooseDoctor = (index) => {
        this.setState({isChoose: index});
    }
    onConfirm = () => {
        this.setState({isConfirm: true});
        this.setState({isPopupComfirm: true});
    }
    onSelectTime = (index) => {
        this.setState({isSelectTime: index})
    }
  render() {
    const contentConfirm = (
        <div className='confirm-content'>
            <p className='text-center mb-5'>{intl.formatMessage(messages.areSureChangeAppoint)}</p>
            <Row gutter={10}>
                <Col xs={24} sm={24} md={12}>
                    <p className='font-12 text-center mb-0'>{intl.formatMessage(messages.current)}</p>
                    <div className='current-content'>
                        <p className='font-10'>30 minutes {intl.formatMessage(messages.meetingWith)} <span className='font-11 font-700'>Dr.Blank</span></p>
                        <p className='font-10'>{intl.formatMessage(msgDrawer.who)}: Dependent Name</p>
                        <p className='font-10'>{intl.formatMessage(msgDrawer.where)}: Local Office Name</p>
                        <p className='font-10'>{intl.formatMessage(msgDrawer.when)}: <span className='font-11 font-700'>6:45pm</span> on <span className='font-11 font-700'>July, 26, 2022</span></p>
                    </div>
                </Col>
                <Col xs={24} sm={24} md={12}>
                    <p className='font-12 text-center mb-0'>{intl.formatMessage(messages.new)}</p>
                    <div className='new-content'>
                        <p className='font-10'>30 minutes {intl.formatMessage(messages.meetingWith)} <span className='font-11 font-700'>Dr.Blank</span></p>
                        <p className='font-10'>{intl.formatMessage(msgDrawer.who)}: Dependent Name</p>
                        <p className='font-10'>{intl.formatMessage(msgDrawer.where)}: Local Office Name</p>
                        <p className='font-10'>{intl.formatMessage(msgDrawer.when)}: <span className='font-11 font-700'>7:20pm</span> on <span className='font-11 font-700'>July, 28, 2022</span></p>
                    </div>

                </Col>
            </Row>
        </div>
    );

    const modalProps = {
      className: 'modal-new',
      title: "",
      visible: this.props.visible,
      onOk: this.props.onSubmit,
      onCancel: this.props.onCancel,
      closable: false,
      width: 900,
      footer: [
        <Button key="back" onClick={this.props.onCancel}>
          {intl.formatMessage(msgReview.goBack).toUpperCase()}
        </Button>,
        <Button key="submit" type="primary" onClick={this.props.onSubmit}>
            {intl.formatMessage(messages.scheduleScreening).toUpperCase()}
        </Button>
        
      ]
    };
    const { valueCalendar, selectedValue, isChoose, isSelectTime } = this.state;
    return(
        <Modal {...modalProps}>
            <div className='new-appointment'>
                <p className='font-30'>{intl.formatMessage(messages.newAppointment)}</p>
                <div className='flex flex-row items-center mb-10'>
                    <p className='font-16 mb-0'>{intl.formatMessage(messages.selectOptions)}</p>
                    <div className='flex flex-row items-center ml-20'>
                        <Switch size="small" defaultChecked />
                        <p className='ml-10 mb-0'>{intl.formatMessage(messages.subsidyOnly)}</p>
                    </div>
                </div>
                <Row gutter={20}>
                    <Col xs={24} sm={24} md={8} className='select-small'>
                        <Select placeholder={intl.formatMessage(msgCreateAccount.dependent)}>
                            <Select.Option value='d1'>User 1</Select.Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={24} md={8} className='select-small'>
                        <Select placeholder={intl.formatMessage(msgCreateAccount.skillsets)}>
                            <Select.Option value='l1'>level 1</Select.Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={24} md={8} className='select-small'>
                        <Select placeholder={intl.formatMessage(msgCreateAccount.location)}>
                            <Select.Option value='lo1'>location 1</Select.Option>
                        </Select>
                    </Col>
                </Row>
                
                <div className='choose-doctor'>
                    <p className='font-16 mt-10'>{intl.formatMessage(messages.availableProviders)}</p>
                    <div className='doctor-content'>
                        <div style={{width: 300}}>
                            <Input 
                                placeholder={intl.formatMessage(messages.searchDoctor)}
                                suffix={<BiSearch size={17}/>}
                            />
                        </div>
                        <p className='font-500 mt-1 mb-0'>{intl.formatMessage(messages.popularDoctors)}</p>
                        <div className='doctor-list'>
                            {Array(10).fill(null).map((_, index) => <div key={index} className='doctor-item' onClick={() => this.onChooseDoctor(index)}>
                                <Avatar shape="square" size="large" src='../images/doctor_ex2.jpeg'/>
                                <p className='font-10 text-center'>Dustin</p>
                                {isChoose === index && <div className='selected-doctor'>
                                    <BsCheck size={12}/>
                                </div>}
                            </div>)}
                           
                            <div className='doctor-item'>
                                <Avatar shape="square" size="large" src='../images/doctor_ex1.jpeg'/>
                                <p className='font-10 text-center'>Diane</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Row gutter={10}>
                    <Col xs={24} sm={24} md={8}>
                        <div className='provider-profile'>
                            <div className='flex flex-row items-center'>
                                <p className='font-16 font-700'>{intl.formatMessage(msgDrawer.providerProfile)}</p>
                                <p className='font-12 font-700 ml-auto text-primary'>{intl.formatMessage(messages.screeningRequired)}</p>
                            </div>
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
                    </Col>
                    <Col xs={24} sm={24} md={16}>
                        <div className='px-20'>
                            <p className='font-700'>{intl.formatMessage(msgCreateAccount.selectDateTime)}</p>
                            <div className='calendar'>
                                <Row gutter={15}>
                                    <Col xs={24} sm={24} md={12}>
                                        <Calendar 
                                            fullscreen={false} 
                                            value={valueCalendar} 
                                            onSelect={this.onSelectDate} 
                                            onPanelChange={this.onPanelChange}
                                            headerRender={() => {
                                            return (
                                                <div style={{ marginBottom: 10 }}>
                                                    <Row gutter={8} justify="space-between" align="middle">
                                                        <Col>
                                                            <p className='font-12 mb-0'>{selectedValue?.format('MMMM YYYY')}</p>
                                                        </Col>
                                                        <Col>
                                                            <Button
                                                                type='text' 
                                                                className='mr-10 left-btn' 
                                                                icon={<BiChevronLeft size={25}/>}
                                                                onClick={this.prevMonth}
                                                             />
                                                            <Button 
                                                                type='text' 
                                                                className='right-btn' 
                                                                icon={<BiChevronRight size={25}/>}
                                                                onClick={this.nextMonth}
                                                            />
                                                        </Col>
                                                    </Row>
                                                </div>
                                            );
                                        }}
                                    />
                                    </Col>
                                    <Col xs={24} sm={24} md={12}>
                                       <Row gutter={15}>
                                            {Array(10).fill(null).map((_, index) =><Col key={index} span={12}>
                                                <div className={isSelectTime === index ? 'time-available active' : 'time-available'} onClick={() => this.onSelectTime(index)}>
                                                    <p className='font-12 mb-0'><GoPrimitiveDot size={15} />10:30am</p>
                                                </div>
                                            </Col>)}
                                       </Row>
                                    </Col> 
                                </Row>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </Modal>
    );
  }
};
export default ModalNewAppointment;