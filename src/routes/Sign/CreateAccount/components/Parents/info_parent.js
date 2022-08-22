import React, { Component } from 'react';
import { Row, Form, Button, Input, Select } from 'antd';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';
class InfoParent extends Component {
    onFinish = (values) => {
        console.log('Success:', values);
        this.props.onContinue();
    };

    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    render() {
        return (
            <Row justify="center" className="row-form">
                <div className='col-form col-info-parent'>
                    <div className='div-form-title'>
                        <p className='font-30 text-center mb-10'>{intl.formatMessage(messages.tellYourself)}</p>
                        <p className='font-24 text-center'>{intl.formatMessage(messages.contactInformation)}</p>
                    </div>
                    <Form
                        name="form_contact"
                        onFinish={this.onFinish}
                        onFinishFailed={this.onFinishFailed}
                    >
                        <Form.Item
                            name="family_name"
                            rules={[
                                {
                                    required: true,
                                    message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.familyName)
                                }
                            ]}
                        >
                            <Input placeholder={intl.formatMessage(messages.familyName)} />
                        </Form.Item>
                        <Form.Item
                            name="address"
                            rules={[
                                {
                                    required: true,
                                    message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.address)
                                }
                            ]}
                        >
                            <Input placeholder={intl.formatMessage(messages.address)} />
                        </Form.Item>
                        <Form.Item
                            name="marital_status"
                            rules={[
                                {
                                    required: true,
                                    message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.maritalStatus)
                                }
                            ]}
                        >
                            <Select placeholder={intl.formatMessage(messages.maritalStatus)}>
                                <Select.Option value='status1'>Married</Select.Option>
                                <Select.Option value='status2'>Widowed</Select.Option>
                                <Select.Option value='status3'>Separated</Select.Option>
                                <Select.Option value='status4'>Divorced</Select.Option>
                            </Select>
                        </Form.Item>

                        <p className='font-16 mb-10'>{intl.formatMessage(messages.father)}</p>
                        <Form.Item
                            name="father_name"
                            rules={[
                                {
                                    required: true,
                                    message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.fatherName)
                                }
                            ]}
                        >
                            <Input placeholder={intl.formatMessage(messages.fatherName)} />
                        </Form.Item>
                        <Form.Item
                            name="father_phone"
                            rules={[
                                {
                                    required: true,
                                    message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.phoneNumber)
                                },
                                {
                                    pattern: '^([-]?[1-9][0-9]*|0)$',
                                    message: intl.formatMessage(messages.phoneNumberValid)
                                },
                            ]}
                        >
                            <Input placeholder={intl.formatMessage(messages.phoneNumber)} />
                        </Form.Item>
                        <Form.Item
                            name="father_email"
                            rules={[
                                {
                                    required: true,
                                    message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.fatherName)
                                },
                                {
                                    type: 'email',
                                    message: intl.formatMessage(messagesLogin.emailNotValid)
                                }
                            ]}>
                            <Input placeholder={intl.formatMessage(messages.email)} />
                        </Form.Item>

                        <p className='font-16 mb-10'>{intl.formatMessage(messages.mother)}</p>
                        <Form.Item
                            name="mother_name"
                            rules={[
                                {
                                    required: true,
                                    message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.fatherName)
                                }
                            ]}>
                            <Input placeholder={intl.formatMessage(messages.motherName)} />
                        </Form.Item>
                        <Form.Item
                            name="mother_phone"
                            rules={[
                                {
                                    required: true,
                                    message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.phoneNumber)
                                },
                                {
                                    pattern: '^([-]?[1-9][0-9]*|0)$',
                                    message: intl.formatMessage(messages.phoneNumberValid)
                                },
                            ]}
                        >
                            <Input placeholder={intl.formatMessage(messages.phoneNumber)} />
                        </Form.Item>
                        <Form.Item
                            name="mother_email"
                            rules={[
                                {
                                    required: true,
                                    message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.fatherName)
                                },
                                {
                                    type: 'email',
                                    message: intl.formatMessage(messagesLogin.emailNotValid)
                                }
                            ]}
                        >
                            <Input placeholder={intl.formatMessage(messages.email)} />
                        </Form.Item>

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
export default InfoParent;