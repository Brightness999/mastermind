import React from 'react';
import { Modal, Button, Row, Col, Switch, Select, Typography, Calendar, Upload, Input } from 'antd';
import { BiChevronLeft, BiChevronRight, BiUpload } from 'react-icons/bi';
import { GoPrimitiveDot } from 'react-icons/go';
import intl from 'react-intl-universal';
import messages from './messages';
import msgCreateAccount from '../../routes/Sign/CreateAccount/messages';
import msgDrawer from '../../components/DrawerDetail/messages';
import msgReview from '../../routes/Sign/SubsidyReview/messages';
import msgRequest from '../../routes/Sign/SubsidyRequest/messages';
import moment from 'moment';

import './style/index.less';
import '../../assets/styles/login.less';
const { Paragraph } = Typography;
import 'moment/locale/en-au'; 
moment.locale('en');

class ModalReferralService extends React.Component {
    state = {
        valueCalendar: moment(),
        selectedValue: moment(),
        currentMonth: moment().format('MMMM YYYY'),
        isChoose: 0,
        isConfirm: false,
        isPopupComfirm: false,
        isSelectTime: -1,
        fileList: [],
        uploading: false,
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
    onChangeUpload = (info) => {
        if (info.file.status !== 'uploading') {
          console.log(info.file, info.fileList);
          this.setState(prevState => ({
            fileList: [...prevState.fileList, info.file],
          }));
          this.form?.setFieldsValue({
            documents: info.fileList[0].name
          })
        }
    }
    render() {
        const { valueCalendar, selectedValue, isChoose, isSelectTime } = this.state;

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
        className: 'modal-referral-service',
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
                {intl.formatMessage(messages.scheduleConsultation).toUpperCase()}
            </Button>
        ]
        };

        const props = {
            name: 'file',
            action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
            headers: {
            authorization: 'authorization-text',
            },
            onChange: this.onChangeUpload,
            // maxCount: 1,
            // showUploadList: false 
        };
        return(
            <Modal {...modalProps}>
                <div className='new-appointment'>
                    <div className='flex mt-10'>
                        <p className='font-30'>{intl.formatMessage(messages.referralService)}</p>
                        <img src='../images/hands.jpeg' className='hands-img'/>
                    </div>
                    <Row gutter={20} className='mb-20' align="bottom">
                        <Col xs={24} sm={24} md={8} className='select-small'>
                            <p className='font-16 mb-5'>{intl.formatMessage(messages.selectOptions)}</p>
                            <Select defaultValue='d1'>
                                <Select.Option value='d1'>&#123;Current Dependent&#125;</Select.Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={24} md={8} className='select-small'>
                            <Select placeholder={intl.formatMessage(msgCreateAccount.skillsets)}>
                                <Select.Option value='l1'>level 1</Select.Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={24} md={8}>
                            <div className='flex flex-row items-center mb-5'>
                                <p className='mr-10 mb-0'>{intl.formatMessage(messages.subsidyOnly)}</p>
                                <Switch size="small" defaultChecked />
                                <p className='ml-10 mb-0'>Google Meet</p>
                            </div>
                            <Input size="small" defaultValue='{AUTOFILL DEFAULT Phone#}' />
                        </Col>
                    </Row>

                    <Row gutter={10}>
                        <Col xs={24} sm={24} md={8}>
                            <div className='provider-profile'>
                                <p className='font-14 font-700'>{intl.formatMessage(messages.additionalDocuments)}</p>
                                <div className='upload-document flex-1'>
                                    <Upload {...props}>
                                        <Button size='small' type='primary' className='btn-upload'>
                                            {intl.formatMessage(msgRequest.upload).toUpperCase()} <BiUpload size={16}/>
                                        </Button>
                                    </Upload>
                                </div>
                                <div className='profile-text'>
                                    <Paragraph className='font-12 mb-0'>
                                    Notes
                                    </Paragraph>
                                </div>
                                {/* hoặc sử dụng textarea */}
                                {/* <Input.TextArea rows={6} placeholder={intl.formatMessage(msgReview.notes)} className='font-12'/> */}

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
export default ModalReferralService;