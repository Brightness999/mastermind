import React,  {Component} from 'react';
import { Row, Col, Form, Button, Input, Select, Switch } from 'antd';
import { BsPlusCircle } from 'react-icons/bs';
import { QuestionCircleOutlined } from '@ant-design/icons';

import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';
import messagesRequest from '../../../SubsidyRequest/messages';
class InfoServices extends Component {
    onFinish = (values) => {
        console.log('Success:', values);
      };
    
    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
      };
    render() {
        return (
            <Row justify="center" className="row-form">
                <div className='col-form col-info-parent'>
                <div className='div-form-title'>
                    <p className='font-30 text-center mb-10'>{intl.formatMessage(messages.servicesOffered)}</p>
                </div>
                <Form 
                    name="form_services_offered"
                    onFinish={this.onFinish}
                    onFinishFailed={this.onFinishFailed}
                >
                    <Form.Item name="skillsets">
                        <Select placeholder={intl.formatMessage(messages.skillsets)}>
                            <Select.Option value='s1'>skill 1</Select.Option>
                            <Select.Option value='s2'>skill 2</Select.Option>
                        </Select>
                    </Form.Item>
                    <Row gutter={14}>
                        <Col xs={24} sm={24} md={12}>
                            <Form.Item
                                name="year_exp"
                                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.yearsExperience) }]}
                            >
                                <Input placeholder={intl.formatMessage(messages.yearsExperience)}/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={12}>
                            <Form.Item
                                name="ssn"
                                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + 'SSN' }]}
                            >
                                <Input placeholder='SSN' suffix={<QuestionCircleOutlined className='text-primary icon-suffix'/>}/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="serviceable_schools">
                        <Select placeholder={intl.formatMessage(messages.serviceableSchools)}>
                            <Select.Option value='s1'>serviceable 1</Select.Option>
                            <Select.Option value='s2'>serviceable 2</Select.Option>
                        </Select>
                    </Form.Item>

                    <Row gutter={14}>
                        <Col xs={16} sm={16} md={16}>
                            <Form.Item className='bottom-0' name="academic_level">
                                <Select placeholder={intl.formatMessage(messages.academicLevel)}>
                                    <Select.Option value='l1'>level 1</Select.Option>
                                    <Select.Option value='l2'>level 2</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={8} sm={8} md={8}>
                            <Form.Item className='bottom-0' name="rate_large">
                                <Select placeholder={intl.formatMessage(messages.rate)}>
                                    <Select.Option value='r1'>rate 1</Select.Option>
                                    <Select.Option value='r2'>rate 2</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <div className='text-center flex flex-row justify-between my-10'>
                        <Button
                            type="text" 
                            className='add-level-btn'     
                            icon={<BsPlusCircle size={17} className='mr-5'/>}                                
                        >
                            {intl.formatMessage(messages.addLevel)}
                        </Button>

                        <div className='flex flex-row w-50'>
                            <Switch size="small" defaultChecked />
                            <p className='ml-10 mb-0'>{intl.formatMessage(messages.sameRateLevels)}</p>
                        </div>
                    </div>
                    <div className='text-center flex flex-row justify-between'>
                        <div className='flex flex-row items-center mb-10'>
                            <Switch size="small" defaultChecked />
                            <p className='ml-10 mb-0'>{intl.formatMessage(messages.separateEvaluation)}</p>
                        </div>
                        <Form.Item name="rate_small" className='select-small'>
                            <Select placeholder={intl.formatMessage(messages.rate)}>
                                <Select.Option value='rate1'>rate 1</Select.Option>
                                <Select.Option value='rate2'>rate 2</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>
                    <div className='text-center flex flex-row justify-between mb-10'>
                        <div className='flex flex-row items-center w-50'>
                            <Switch size="small" defaultChecked />
                            <p className='ml-10 mb-0'>{intl.formatMessage(messages.homeVisits)}</p>
                        </div>
                        <div className='flex flex-row items-center w-50'>
                            <Switch size="small" defaultChecked />
                            <p className='ml-10 mb-0'>{intl.formatMessage(messages.privateOffice)}</p>
                        </div>
                    </div>
                    <div className='flex flex-row items-center mb-10'>
                        <Switch size="small" defaultChecked />
                        <p className='ml-10 mb-0'>{intl.formatMessage(messages.receiptsRequest)}</p>
                    </div>
                    <div className='text-center flex flex-row justify-between'>
                        <div className='flex flex-row items-center mb-10'>
                            <Switch size="small" defaultChecked />
                            <p className='ml-10 mb-0'>{intl.formatMessage(messages.newClient)}</p>
                        </div>
                        <Form.Item size='small' name="screening_time"  className='select-small'>
                            <Select placeholder={intl.formatMessage(messages.screeningTime)}>
                                <Select.Option value='t1'>1 minute</Select.Option>
                                <Select.Option value='t2'>2 minutes</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>
                    <Form.Item name="upload_w_9" className='input-download'>
                        <Input addonBefore='W-9 Form' suffix={<a className='font-12 underline'>{intl.formatMessage(messagesRequest.upload)}</a>} />
                    </Form.Item>
                    <Form.Item
                        name="references"
                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.references) }]}
                    >
                        <Input placeholder={intl.formatMessage(messages.references)}/>
                    </Form.Item>
                    <Form.Item
                        name="public_profile"
                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.publicProfile) }]}
                    >
                        <Input.TextArea rows={4} placeholder={intl.formatMessage(messages.publicProfile)}/>
                    </Form.Item>
                    
                    
                    <Form.Item className="form-btn continue-btn" >
                        <Button
                            block
                            type="primary"                                      
                            htmlType="submit"
                            onClick={this.props.onContinueServices}
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
export default InfoServices;