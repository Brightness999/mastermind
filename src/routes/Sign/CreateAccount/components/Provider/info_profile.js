import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';
class InfoProfile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            phone_contact: [
                { phone: "Phone 1" },
            ],
            email_contact: [
                { email: "Email 1" },
            ],
        }
    }
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
                    </div>
                    <Form
                        name="form_profile_provider"
                        onFinish={this.onFinish}
                        onFinishFailed={this.onFinishFailed}
                        initialValues={{
                            phone: this.state.phone_contact,
                            email: this.state.email_contact,
                        }}
                    >
                        <Form.Item
                            name="legal_name"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.legalName) }]}
                        >
                            <Input placeholder={intl.formatMessage(messages.legalName)} />
                        </Form.Item>
                        <Form.Item
                            name="referred_as"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.referredAs) }]}
                        >
                            <Input placeholder={intl.formatMessage(messages.referredAs)} />
                        </Form.Item>
                        <Form.Item
                            name="service_address"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.serviceAddress) }]}
                        >
                            <Select placeholder={intl.formatMessage(messages.serviceAddress)}>
                                <Select.Option value='a1'>address 1</Select.Option>
                                <Select.Option value='a2'>address 2</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="billing_address"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.billingAddress) }]}
                        >
                            <Select placeholder={intl.formatMessage(messages.billingAddress)}>
                                <Select.Option value='a1'>address 1</Select.Option>
                                <Select.Option value='a2'>address 2</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="city_connections"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.cityConnections) }]}

                        >
                            <Select placeholder={intl.formatMessage(messages.cityConnections)}>
                                <Select.Option value='c1'>city 1</Select.Option>
                                <Select.Option value='c2'>city 2</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="license_num"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.licenseNumber) }]}
                        >
                            <Input placeholder={intl.formatMessage(messages.licenseNumber)} />
                        </Form.Item>
                        <Form.Item
                            name="agency"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.agency) }]}
                        >
                            <Input placeholder={intl.formatMessage(messages.agency)} />
                        </Form.Item>
                        <Form.List name="phone">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Row key={key} gutter={14}>
                                            <Col xs={16} sm={16} md={16}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'contact_num']}
                                                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.contactNumber) }]}
                                                    className='bottom-0'
                                                    style={{ marginTop: key === 0 ? 0 : 14 }}
                                                >
                                                    <Input placeholder={intl.formatMessage(messages.contactNumber)} />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={8} sm={8} md={8} className='item-remove'>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'contact_type']}
                                                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.type) }]}
                                                    className='bottom-0'
                                                    style={{ marginTop: key === 0 ? 0 : 14 }}
                                                >
                                                    <Select placeholder={intl.formatMessage(messages.type)}>
                                                        <Select.Option value='t1'>type 1</Select.Option>
                                                        <Select.Option value='t2'>type type type 2</Select.Option>
                                                    </Select>
                                                </Form.Item>
                                                {key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(name)} />}
                                            </Col>
                                        </Row>
                                    ))}
                                    <Form.Item className='text-center mb-0'>
                                        <Button
                                            type="text"
                                            className='add-number-btn mb-10'
                                            icon={<BsPlusCircle size={17} className='mr-5' />}
                                            onClick={() => add()}
                                        >
                                            {intl.formatMessage(messages.addNumber)}
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>

                        <Form.List name="email">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Row key={key} gutter={14}>
                                            <Col xs={16} sm={16} md={16}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'contact_email']}
                                                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.contactEmail) }]}
                                                    className='bottom-0'
                                                    style={{ marginTop: key === 0 ? 0 : 14 }}
                                                >
                                                    <Input placeholder={intl.formatMessage(messages.contactEmail)} />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={8} sm={8} md={8} className='item-remove'>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'contact_type']}
                                                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.type) }]}
                                                    className='bottom-0'
                                                    style={{ marginTop: key === 0 ? 0 : 14 }}
                                                >
                                                    <Select placeholder={intl.formatMessage(messages.type)}>
                                                        <Select.Option value='t1'>type 1</Select.Option>
                                                        <Select.Option value='t2'>type 2</Select.Option>
                                                    </Select>
                                                </Form.Item>
                                                {key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(name)} />}
                                            </Col>
                                        </Row>
                                    ))}
                                    <Form.Item className='text-center mb-0'>
                                        <Button
                                            type="text"
                                            className='add-number-btn mb-10'
                                            icon={<BsPlusCircle size={17} className='mr-5' />}
                                            onClick={() => add()}
                                        >
                                            {intl.formatMessage(messages.addEmail)}
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>

                        <Form.Item
                            name="professional_exp"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.professionalExperience) }]}
                        >
                            <Input.TextArea rows={4} placeholder={intl.formatMessage(messages.professionalExperience)} />
                        </Form.Item>

                        <Form.Item className="form-btn continue-btn" >
                            <Button
                                block
                                type="primary"
                                htmlType="submit"
                                // onClick={this.props.onContinue}
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
export default InfoProfile;