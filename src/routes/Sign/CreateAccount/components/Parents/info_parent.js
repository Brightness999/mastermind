import React, { Component } from 'react';

import { Row, Form, Button, Input, Select } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';
import { setParent } from '../../../../../redux/features/registerSlice';


class InfoParent extends Component {

    componentDidMount() {
        const parent = this.props.parentStep2
        this.form?.setFieldsValue({
            ...parent
        })
        // this.form.setFieldsValue({
        //     address: "TDP3 Hương CHữ Hương Trà Thừa Thiên Huế",
        //     family_name: "rewr",
        //     father_email: "lctiendat@gmail.com",
        //     father_name: "werwer",
        //     father_phone: "+84766667020",
        //     marital_status: "status1",
        //     mother_email: "lctiendat@gmail.com",
        //     mother_name: "werwerwe",
        //     mother_phone: "+84766667020"
        // })
    }

    onFinish = (values) => {
        console.log('Success:', values);
        this.props.setParent({ step2: values });
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
                        ref={ref => this.form = ref}
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
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.address) }]}
                        >
                            <Input placeholder={intl.formatMessage(messages.address)} />
                        </Form.Item>
                        <Form.Item name="marital_status" rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.maritalStatus) }]}
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
                                    pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$',
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
                                    message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.email)
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
                                    message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.motherName)
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
                                    pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$',
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
                                    message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.email)
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

const mapStateToProps = (state) => {
    console.log('state in parent', state);
    return {
        parentStep2: state.register.parent.step2,
        register: state.register,
    };
}

export default compose(connect(mapStateToProps, { setParent }))(InfoParent);