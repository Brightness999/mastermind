import React,  {Component} from 'react';
import { Row, Col, Form, Button, Input, Select, Checkbox, Segmented, TimePicker, Switch } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import { QuestionCircleOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import moment from 'moment';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';

class InfoProgress extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formTime: [{ timeFromTo: "Time 1" }],
            fromLocation: [{ timeLocation: "Location 1" }],
            isSameAll: true,
            isSameAllSchedule: true,
        }
    }
    onFinish = (values) => {
        console.log('Success:', values);
        this.props.onContinue();
    };
    
    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    onSameAllDependent = () => {
        this.setState({isSameAll: !this.state.isSameAll});
    }
    onSameAllSchedule = () => {
        this.setState({isSameAllSchedule: !this.state.isSameAllSchedule});
    }
    render() {
        const day_week = [
            intl.formatMessage(messages.sunday),
            intl.formatMessage(messages.monday),
            intl.formatMessage(messages.tuesday),
            intl.formatMessage(messages.wednesday),
            intl.formatMessage(messages.thursday),
            intl.formatMessage(messages.friday),
        ]
        const { isSameAll, isSameAllSchedule } = this.state;
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
                        initialValues={{ timeFromTo: this.state.formTime, timeLocation: this.state.fromLocation }}
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
                        <Form.Item
                            name="marital_status"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' +  intl.formatMessage(messages.servicesRequired)}]}
                        >
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
                                <Form.List name="timeFromTo">
                                    {(fields, { add, remove }) => (
                                        <div>
                                            {fields.map((field) => (
                                                <Row  key={field.key} gutter={14}>
                                                    <Col xs={24} sm={24} md={12}>
                                                        <Form.Item 
                                                            name={[field.name, "from_time"]}
                                                            rules={[{ required: true, message: intl.formatMessage(messages.fromMess)}]}
                                                        >
                                                            <TimePicker use12Hours format="h:mm a" placeholder={intl.formatMessage(messages.from)} defaultOpenValue={moment('00:00:00', 'HH:mm:ss')} />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={24} sm={24} md={12} className={field.key === 0 ? '' :'item-remove'}>
                                                        <Form.Item 
                                                            name={[field.name, "to_time"]}
                                                            rules={[{ required: true, message: intl.formatMessage(messages.toMess)}]}
                                                        >
                                                            <TimePicker use12Hours format="h:mm a" placeholder={intl.formatMessage(messages.to)} defaultOpenValue={moment('00:00:00', 'HH:mm:ss')} />
                                                        </Form.Item>
                                                        {field.key === 0 ? null : <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />}
                                                    </Col>
                                                </Row>
                                            ))}
                                            <div className='div-add-time' onClick={() => add(null)}>
                                                <BsPlusCircle size={17} className='mr-5 text-primary'/>
                                                <a className='text-primary'>{intl.formatMessage(messages.addTimeRange)}</a>
                                            </div>
                                            <div className='text-right div-copy-week'>
                                                <a className='font-10 underline text-primary'>{intl.formatMessage(messages.copyFullWeek)}</a>
                                                <QuestionCircleOutlined className='text-primary'/>
                                            </div>
                                        </div>
                                    )}
                                </Form.List>
                            </div>
                        </div>
                        <div className='flex flex-row items-center'>
                            <Switch size="small" checked={isSameAll} onChange={this.onSameAllDependent}/>
                            <p className='ml-10 mb-0'>{intl.formatMessage(messages.sameAllDependents)}</p>
                        </div>
                        {/* List of Availability Schedule Start */}
                        {/* Show when the switch "isSameAll" - false */}
                        {!isSameAll && <>
                            <p className='font-24 text-center mt-2'>{intl.formatMessage(messages.availabilitySchedule)}</p>
                            <div>
                                <p className='mb-5'>Dependent #1 First + Last Name</p>
                                <div className='div-availability'>
                                    <Segmented options={day_week} block={true}/>
                                    <div className='div-time'>
                                        <Form.List name="timeLocation">
                                            {(fields, { add, remove }) => (
                                                <div>
                                                    {fields.map((field) => (
                                                        <div key={field.key}>
                                                            <Row gutter={14}>
                                                                <Col xs={24} sm={24} md={12}>
                                                                    <Form.Item 
                                                                        name={[field.name, "from_time_1"]}
                                                                        rules={[{ required: true, message: intl.formatMessage(messages.fromMess)}]}
                                                                    >
                                                                        <TimePicker use12Hours format="h:mm a" placeholder={intl.formatMessage(messages.from)} defaultOpenValue={moment('00:00:00', 'HH:mm:ss')} />
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col xs={24} sm={24} md={12} className={field.key === 0 ? '' :'item-remove'}>
                                                                    <Form.Item 
                                                                        name={[field.name, "to_time_1"]}
                                                                        rules={[{ required: true, message: intl.formatMessage(messages.toMess)}]}
                                                                    >
                                                                        <TimePicker use12Hours format="h:mm a" placeholder={intl.formatMessage(messages.to)} defaultOpenValue={moment('00:00:00', 'HH:mm:ss')} />
                                                                    </Form.Item>
                                                                    {field.key === 0 ? null : <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />}
                                                                </Col>
                                                            </Row>
                                                            <Form.Item 
                                                                name={[field.name, "location_1"]}
                                                                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.location)}]}
                                                            >
                                                                <Input placeholder={intl.formatMessage(messages.location)} />
                                                            </Form.Item>
                                                        </div>
                                                    ))}
                                                    <div className='flex flex-row justify-between'>
                                                        <div className='div-add-time' onClick={() => add(null)}>
                                                            <BsPlusCircle size={17} className='mr-5 text-primary'/>
                                                            <a className='text-primary'>{intl.formatMessage(messages.addRange)}</a>
                                                        </div>
                                                        <div className='text-right div-copy-week'>
                                                            <a className='font-10 underline text-primary'>{intl.formatMessage(messages.copyFullWeek)}</a>
                                                            <QuestionCircleOutlined className='text-primary'/>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </Form.List>
                                    </div>
                                </div>
                                <div className='flex flex-row items-center mb-2'>
                                    <Switch size="small" checked={isSameAllSchedule} onChange={this.onSameAllSchedule}/>
                                    <p className='ml-10 mb-0'>{intl.formatMessage(messages.sameAllDependents)}</p>
                                </div>
                            </div>
                            {/* List of All Availability Schedule Start */}
                            {/* Show when the switch "isSameAllSchedule" - false */}
                            {Array(2).fill(null).map((_, index) => 
                                <div key={index}>
                                    {!isSameAllSchedule && <>
                                        <p className='mb-5 mt-2'>Dependent #{index + 2} First + Last Name</p>
                                        <div className='div-availability'>
                                            <Segmented options={day_week} block={true}/>
                                            <div className='div-time'>
                                                <Form.List name="timeLocation">
                                                    {(fields, { add, remove }) => (
                                                        <div>
                                                            {fields.map((field) => (
                                                                <div key={field.key}>
                                                                    <Row gutter={14}>
                                                                        <Col xs={24} sm={24} md={12}>
                                                                            <Form.Item 
                                                                                name={[field.name, `${"from_time" + index + 2}`]}
                                                                                rules={[{ required: true, message: intl.formatMessage(messages.fromMess)}]}
                                                                            >
                                                                                <TimePicker use12Hours format="h:mm a" placeholder={intl.formatMessage(messages.from)} defaultOpenValue={moment('00:00:00', 'HH:mm:ss')} />
                                                                            </Form.Item>
                                                                        </Col>
                                                                        <Col xs={24} sm={24} md={12} className={field.key === 0 ? '' :'item-remove'}>
                                                                            <Form.Item 
                                                                                name={[field.name, `${"to_time" + index + 2}`]}
                                                                                rules={[{ required: true, message: intl.formatMessage(messages.toMess)}]}
                                                                            >
                                                                                <TimePicker use12Hours format="h:mm a" placeholder={intl.formatMessage(messages.to)} defaultOpenValue={moment('00:00:00', 'HH:mm:ss')} />
                                                                            </Form.Item>
                                                                            {field.key === 0 ? null : <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />}
                                                                        </Col>
                                                                    </Row>
                                                                    <Form.Item 
                                                                        name={[field.name, `${"location" + index + 2}`]}
                                                                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.location)}]}
                                                                    >
                                                                        <Input placeholder={intl.formatMessage(messages.location)} />
                                                                    </Form.Item>
                                                                </div>
                                                            ))}
                                                            <div className='flex flex-row justify-between'>
                                                                <div className='div-add-time' onClick={() => add(null)}>
                                                                    <BsPlusCircle size={17} className='mr-5 text-primary'/>
                                                                    <a className='text-primary'>{intl.formatMessage(messages.addRange)}</a>
                                                                </div>
                                                                <div className='text-right div-copy-week'>
                                                                    <a className='font-10 underline text-primary'>{intl.formatMessage(messages.copyFullWeek)}</a>
                                                                    <QuestionCircleOutlined className='text-primary'/>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Form.List>
                                            </div>
                                        </div>
                                    </>}
                                </div>)}
                            {/* List of All Availability Schedule End */}
                        </>}
                        {/* List of Availability Schedule End */}
                        <Form.Item className="form-btn continue-btn" >
                            <Button
                                block
                                type="primary"                                      
                                htmlType="submit"
                                
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