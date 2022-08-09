import React,  {Component} from 'react';
import { Row, Col, Form, Button, Input, Select, DatePicker, Switch } from 'antd';
import { BsPlusCircle } from 'react-icons/bs';
import { TbTrash } from 'react-icons/tb';
import { Link } from 'dva/router';
import { routerLinks } from '../../../../constant';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';
class InfoChild extends Component {
    onChange = () => console.log('Date change!');
    onFinish = (values) => {
        console.log('Success:', values);
    };

    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    render() {
        return (
            <Row justify="center" className="row-form">
                <div className='col-form col-info-child'>
                <div className='div-form-title'>
                    <p className='font-30 text-center mb-10'>{intl.formatMessage(messages.tellYourself)}</p>
                    <p className='font-24 text-center'>{intl.formatMessage(messages.contactInformation)}</p>
                </div>
                
                <Form 
                    name="form_contact"
                    onFinish={this.onFinish}
                    onFinishFailed={this.onFinishFailed}
                >
                    <div>
                        {new Array(2).fill(null).map((_,index) => <div key={index} className='div-dependent-form'>
                            <div className='flex flex-row items-center justify-between mb-10'>
                                <div className='flex flex-row items-center'>
                                    <p className='font-16 mr-10 mb-0'>{intl.formatMessage(messages.dependent)} 1</p>
                                    <Switch size="small" defaultChecked/>
                                    <p className='font-16 ml-10 mb-0'>{intl.formatMessage(messages.hasIEP)}</p>
                                </div>
                                <Button type='text' className='remove-btn' icon={<TbTrash size={18}/>}>{intl.formatMessage(messages.remove)}</Button>
                            </div>
                            <Row gutter={14}>
                                <Col xs={24} sm={24} md={9}>
                                    <Form.Item
                                        name="first_name"
                                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.firstName) }]}
                                    >
                                        <Input placeholder={intl.formatMessage(messages.firstName)}/>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={9}>
                                    <Form.Item
                                        name="last_name"
                                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.lastName) }]}
                                    >
                                        <Input placeholder={intl.formatMessage(messages.lastName)}/>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={6}>
                                    <Form.Item
                                        name="date_birth"
                                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.dateBirth) }]}
                                    >
                                        <DatePicker placeholder={intl.formatMessage(messages.dateBirth)} onChange={this.onChange} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={14}>
                                <Col xs={24} sm={24} md={12}>
                                    <Form.Item className='float-label-item' name="guardian_phone" label={intl.formatMessage(messages.guardianPhone)}>
                                        <Input placeholder='{PARENTS} AUTOFILL'/>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={12}>
                                    <Form.Item className='float-label-item' name="guardian_email" label={intl.formatMessage(messages.guardianEmail)}>
                                        <Input placeholder='{PARENTS} AUTOFILL'/>
                                    </Form.Item>
                                </Col>
                            </Row>
                            
                            <Form.Item
                                name="background_info"
                                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.backgroundInformation) }]}
                            >
                                <Input.TextArea rows={4} placeholder={intl.formatMessage(messages.backgroundInformation)}/>
                            </Form.Item>
                            <Form.Item
                                name="school"
                                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.school) }]}
                            >
                                <Input placeholder={intl.formatMessage(messages.school)}/>
                            </Form.Item>
                            <Row gutter={14}>
                                <Col xs={24} sm={24} md={12}>
                                    <Form.Item
                                        name="primary_teacher"
                                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.primaryTeacher) }]}
                                    >
                                        <Input placeholder={intl.formatMessage(messages.primaryTeacher)}/>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={12}>
                                    <Form.Item
                                        name="current_grade"
                                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.currentGrade) }]}
                                    >
                                        <Input placeholder={intl.formatMessage(messages.currentGrade)}/>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item name="marital_status" className='add-services'>
                                <Select
                                    mode="multiple"
                                    showArrow
                                    placeholder={intl.formatMessage(messages.servicesRequired)}
                                    optionLabelProp="label"
                                >
                                    <Select.Option value='Services required 1'>Services required 1</Select.Option>
                                    <Select.Option value='Services required 2'>Services required 2</Select.Option>
                                </Select>
                                <Link to={routerLinks['SubsidyRequest']}>
                                    <Button className='ml-10'>{intl.formatMessage(messages.subsidyRequest)}</Button>
                                </Link>
                            </Form.Item>
                        </div>)}
                    </div>
                    <div className='text-center'>
                        <Button
                            type="text" 
                            className='add-dependent-btn'     
                            icon={<BsPlusCircle size={17} className='mr-5'/>}                                
                        >
                            {intl.formatMessage(messages.addDependent)}
                        </Button>
                    </div>
                    
                    <Form.Item className="form-btn continue-btn" >
                        <Button
                            block
                            type="primary"                                      
                            htmlType="submit"
                            onClick={this.props.onContinueChild}
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
export default InfoChild;