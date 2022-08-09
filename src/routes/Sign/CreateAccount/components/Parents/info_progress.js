import React,  {Component} from 'react';
import { Row, Col, Form, Button, Input, Select, Checkbox, Segmented, TimePicker, Switch } from 'antd';
import { BsPlusCircle } from 'react-icons/bs';
import { QuestionCircleOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import moment from 'moment';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';

class InfoProgress extends Component {
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
                <div className='col-form col-create-default'>
                <div className='div-form-title'>
                    <p className='font-30 text-center'>{intl.formatMessage(messages.academicInformation)}</p>
                </div>
                <Form 
                    name="form_default"
                    onFinish={this.onFinish}
                    onFinishFailed={this.onFinishFailed}
                >
                    <p className='font-16 mr-10 mb-5'>{intl.formatMessage(messages.dependent)} #1 First + Last Name </p>
                    <Form.Item
                        name="school"
                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' +  intl.formatMessage(messages.school)}]}
                    >
                        <Input placeholder={intl.formatMessage(messages.school)}/>
                    </Form.Item>
                    <Form.Item
                        name="primary_teacher"
                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' +  intl.formatMessage(messages.primaryTeacher)}]}
                    >
                        <Input placeholder={intl.formatMessage(messages.primaryTeacher)}/>
                    </Form.Item>
                    <Form.Item
                        name="current_grade"
                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' +  intl.formatMessage(messages.currentGrade)}]}
                    >
                        <Input placeholder={intl.formatMessage(messages.currentGrade)}/>
                    </Form.Item>
                    <Form.Item name="marital_status">
                        <Select
                            mode="multiple"
                            showArrow
                            placeholder={intl.formatMessage(messages.servicesRequired)}
                            optionLabelProp="label"
                        >
                            <Select.Option value='Services required 1'>Services required 1</Select.Option>
                            <Select.Option value='Services required 2'>Services required 2</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Checkbox checked={true}>{intl.formatMessage(messages.doHaveIEP)}</Checkbox>
                    </Form.Item>
                    <p className='font-24 mb-10 text-center'>{intl.formatMessage(messages.availability)}</p>
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
                            <div className='div-add-time'>
                                <BsPlusCircle size={17} className='mr-5 text-primary'/>
                                <a className='text-primary'>{intl.formatMessage(messages.addTimeRange)}</a>
                            </div>
                            <div className='text-right div-copy-week'>
                                <a className='font-10 underline text-primary'>{intl.formatMessage(messages.copyFullWeek)}</a>
                                <QuestionCircleOutlined className='text-primary'/>
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-row items-center'>
                        <Switch size="small" defaultChecked />
                        <p className='ml-10 mb-0'>{intl.formatMessage(messages.sameAllDependents)}</p>
                    </div>
                    <Form.Item className="form-btn continue-btn" >
                        <Button
                            block
                            type="primary"                                      
                            htmlType="submit"
                            onClick={this.props.onContinueProgress}
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
export default InfoProgress;