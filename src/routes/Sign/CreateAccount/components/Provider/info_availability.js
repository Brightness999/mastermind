import React,  {Component} from 'react';
import { Row, Col, Form, Button, Input, Select, Checkbox, Segmented, TimePicker, Switch } from 'antd';
import { BsPlusCircle } from 'react-icons/bs';
import { QuestionCircleOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import moment from 'moment';
import messages from '../../messages';

class InfoAvailability extends Component {
    onFinish = (values) => {
        console.log('Success:', values);
      };
    
    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
      };
    render() {
        const day_week = [
            intl.formatMessage(messages.sunday),
            intl.formatMessage(messages.monday),
            intl.formatMessage(messages.tuesday),
            intl.formatMessage(messages.wednesday),
            intl.formatMessage(messages.thursday),
            intl.formatMessage(messages.friday),
        ]
        return (
            <Row justify="center" className="row-form">
                <div className='col-form col-availability'>
                <div className='div-form-title'>
                    <p className='font-30 text-center mb-10'>{intl.formatMessage(messages.availability)}</p>
                </div>
                <Form 
                    name="form_availability"
                    onFinish={this.onFinish}
                    onFinishFailed={this.onFinishFailed}
                >
                    <p className='font-18 mb-10 text-center'>{intl.formatMessage(messages.autoSyncCalendar)}</p>
                    <Row gutter={10}>
                        <Col span={12}>
                            <div className='div-gg'>
                                <img src='../images/gg.png'/>
                                <p className='font-16 mb-0'>Google</p>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div className='div-gg'>
                                <img src='../images/outlook.png'/>
                                <p className='font-16 mb-0'>Outlook</p>
                            </div>
                        </Col>
                    </Row>

                    <p className='font-18 mb-10 text-center'>{intl.formatMessage(messages.manualSchedule)}</p>
                    <div className='div-availability'>
                        <Segmented options={day_week} block={true}/>
                        <div className='div-time'>
                            <Row gutter={14}>
                                <Col xs={24} sm={24} md={12}>
                                    <Form.Item name="from_time">
                                        <TimePicker placeholder={intl.formatMessage(messages.from)} defaultOpenValue={moment('00:00:00', 'HH:mm:ss')} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={12}>
                                    <Form.Item name="to_time">
                                        <TimePicker placeholder={intl.formatMessage(messages.to)} defaultOpenValue={moment('00:00:00', 'HH:mm:ss')} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item name="location">
                                <Select placeholder={intl.formatMessage(messages.location)}>
                                    <Select.Option value='l1'>location 1</Select.Option>
                                    <Select.Option value='l2'>location 2</Select.Option>
                                </Select>
                            </Form.Item>
                            <Row>
                                <Col span={8}>
                                    <div className='flex flex-row items-center'>
                                        <Switch size="small" defaultChecked />
                                        <p className='font-09 ml-10 mb-0'>{intl.formatMessage(messages.privateHMGHAgents)}</p>
                                    </div>
                                </Col>
                                <Col span={8}>
                                    <div className='div-add-time justify-center'>
                                        <BsPlusCircle size={17} className='mr-5 text-primary'/>
                                        <a className='text-primary'>{intl.formatMessage(messages.addRange)}</a>
                                    </div>
                                </Col>
                                <Col span={8}>
                                    <div className='text-right div-copy-week'>
                                        <a className='font-10 underline text-primary'>{intl.formatMessage(messages.copyFullWeek)}</a>
                                        <QuestionCircleOutlined className='text-primary'/>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </div>
                    <Row gutter={14} style={{marginLeft: '-22px', marginRight: '-22px'}}>
                        <Col xs={24} sm={24} md={13}>
                            <Form.Item name="cancellation_window">
                                <Select placeholder={intl.formatMessage(messages.cancellationWindow)}>
                                    <Select.Option value='d1'>date 1</Select.Option>
                                    <Select.Option value='d2'>date 2</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={11}>
                            <Form.Item name="cancellation_fee">
                                <Select placeholder={intl.formatMessage(messages.cancellationFee)}>
                                    <Select.Option value='st1'>st 1</Select.Option>
                                    <Select.Option value='st2'>st 2</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item className="form-btn continue-btn" >
                        <Button
                            block
                            type="primary"                                      
                            htmlType="submit"
                            onClick={this.props.onContinueAvailability}
                        >
                            {intl.formatMessage(messages.continue).toUpperCase()}
                        </Button>
                    </Form.Item>
                </Form>
                </div>
            </Row>
        );
    }
}
export default InfoAvailability;