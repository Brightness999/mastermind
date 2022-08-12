import React from 'react';
import { Modal, Button, Row, Col, Switch, Select, Typography, Calendar, Avatar, Input } from 'antd';
import { BiChevronLeft, BiChevronRight, BiSearch } from 'react-icons/bi';
import { GoPrimitiveDot } from 'react-icons/go';
import intl from 'react-intl-universal';
import messages from './messages';
import msgCreateAccount from '../../routes/Sign/CreateAccount/messages';
import msgDashboard from '../../routes/Dashboard/messages';
import msgDrawer from '../../components/DrawerDetail/messages';
import msgReview from '../../routes/Sign/SubsidyReview/messages';
import moment from 'moment';
import './style/index.less';
import '../../assets/styles/login.less';
const { Paragraph } = Typography;

class ModalCurrentAppointment extends React.Component {
    state = {
        valueCalendar: moment(),
        selectedValue: moment(),
    }
    onSelectDate = (newValue) => {
        this.setState({valueCalendar: newValue});
        this.setState({selectedValue: newValue});
    }
    onPanelChange = (newValue) => {
        this.setState({valueCalendar: newValue});
    }

  render() {
    const modalProps = {
      className: 'modal-current',
      title: "",
      visible: this.props.visible,
      onOk: this.props.onSubmit,
      onCancel: this.props.onCancel,
      closable: false,
      width: 900,
      footer: [
        <Button key="back" onClick={this.props.onCancel}>
          {intl.formatMessage(msgReview.goBack).toUpperCase(0)}
        </Button>,
        <Button key="submit" type="primary" onClick={this.props.onSubmit}>
           {intl.formatMessage(msgDrawer.reschedule).toUpperCase(0)}
        </Button>
      ]
    };
    const { valueCalendar, selectedValue } = this.state;
    return(
        <Modal {...modalProps}>
            <div className='header-current'>
                <Row gutter="15" align="bottom">
                    <Col xs={24} sm={24} md={8}>
                        <p className='font-24 font-700'>{intl.formatMessage(messages.currentAppointment)}</p>
                        <p className='font-16'>Dependent name</p>
                        <p className='font-16'>Provider name</p>
                    </Col>
                    <Col xs={24} sm={24} md={8}>
                        <p className='font-16'>{intl.formatMessage(msgCreateAccount.subsidy)}</p>
                        <p className='font-16 font-700'>30 Minute {intl.formatMessage(msgDashboard.evaluation)}</p>
                        <p className='font-16'>{intl.formatMessage(msgCreateAccount.location)}</p>
                    </Col>
                    <Col xs={24} sm={24} md={8}>
                        <p></p>
                        <p className='font-16'>{intl.formatMessage(msgCreateAccount.skillsets)}</p>
                        <p className='font-16'>7/27/2022   7:30pm</p>
                    </Col>
                </Row>
            </div>
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
                                suffix={<BiSearch size={16}/>}
                            />
                        </div>
                        <p className='font-500 mt-1 mb-10'>{intl.formatMessage(messages.popularDoctors)}</p>
                        <div className='doctor-list'>
                            <div className='doctor-item'>
                                <Avatar shape="square" size="large" src='../images/doctor_ex2.jpeg'/>
                                <p className='font-10 text-center'>Dustin</p>
                            </div>
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
                                                            <Button type='text' className='mr-10 left-btn' icon={<BiChevronLeft size={25}/>}/>
                                                            <Button type='text' className='right-btn' icon={<BiChevronRight size={25}/>}/>
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
                                                <div className='time-available'>
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
export default ModalCurrentAppointment;