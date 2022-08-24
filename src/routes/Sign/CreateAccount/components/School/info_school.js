import React from 'react';
import { Row, Col, Form, Button, Input, Select, Segmented, TimePicker, } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';

import moment from 'moment';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            technical_contact: [
                { technical: "Dependent 1" },
            ],
            student_contact: [
                { student: "Dependent 1" },
            ],
        }
    }
    onFinish = (values) => {
        console.log('Success:', values);
        window.location.href = "/login";
    };

    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    render() {
        const day_week = [
            intl.formatMessage(messages.sunday),
            intl.formatMessage(messages.monday) + '-' + intl.formatMessage(messages.thursday),
            intl.formatMessage(messages.friday),
        ]
        return (
            <Row justify="center" className="row-form">
                <div className='col-form col-school'>
                    <div className='div-form-title mb-10'>
                        <p className='font-30 text-center mb-0'>{intl.formatMessage(messages.schoolDetails)}</p>
                    </div>
                    <Form
                        name="form_school"
                        onFinish={this.onFinish}
                        onFinishFailed={this.onFinishFailed}
                        initialValues={{
                            technical: this.state.technical_contact,
                            student: this.state.student_contact,
                        }}
                    >
                        <Form.Item
                            name="name_school"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.nameSchool) }]}
                        >
                            <Input placeholder={intl.formatMessage(messages.nameSchool)} />
                        </Form.Item>
                        <Form.Item
                            name="communicate_served"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.communitiesServed) }]}
                        >
                            <Select placeholder={intl.formatMessage(messages.communitiesServedNote)}>
                                <Select.Option value='c1'>Communities 1</Select.Option>
                                <Select.Option value='c2'>Communities 2</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="school_address"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.schoolAddress) }]}
                        >
                            <Input placeholder={intl.formatMessage(messages.schoolAddress)} />
                        </Form.Item>
                        <Form.List name="technical">
                            {(fields, { add, remove }) => (
                                <div>
                                    {fields.map((field) => {
                                        return (
                                            <div key={field.key} className={field.key !== 0 && 'item-remove'}>
                                                <Form.Item
                                                    name={[field.name, "technical_contact"]}
                                                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.technicalReferralContact) }]}
                                                >
                                                    <Input placeholder={intl.formatMessage(messages.technicalReferralContact)} />
                                                </Form.Item>
                                                {field.key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />}
                                            </div>
                                        );
                                    }
                                    )}
                                    <div className='text-center'>
                                        <Button
                                            type="text"
                                            className='add-number-btn mb-10'
                                            icon={<BsPlusCircle size={17} className='mr-5' />}
                                            onClick={() => add(null)}
                                        >
                                            {intl.formatMessage(messages.addContact)}
                                        </Button>
                                    </div>
                                </div>

                            )}

                        </Form.List>

                        <Form.List name="student">
                            {(fields, { add, remove }) => (
                                <div>
                                    {fields.map((field) => {
                                        return (
                                            <div key={field.key} className={field.key !== 0 && 'item-remove'}>
                                                <Form.Item
                                                    name={[field.name, "student_contact"]}
                                                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.studentReferralContact) }]}
                                                >
                                                    <Input placeholder={intl.formatMessage(messages.studentReferralContact)} />
                                                </Form.Item>
                                                {field.key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />}
                                            </div>
                                        );
                                    }
                                    )}
                                    <div className='text-center'>
                                        <Button
                                            type="text"
                                            className='add-number-btn mb-10'
                                            icon={<BsPlusCircle size={17} className='mr-5' />}
                                            onClick={() => add(null)}
                                        >
                                            {intl.formatMessage(messages.addContact)}
                                        </Button>
                                    </div>
                                </div>

                            )}

                        </Form.List>

                        <div className='div-availability'>
                            <Segmented options={day_week} block={true} />
                            <div className='div-time'>
                                <p className='mb-10 font-700'>{intl.formatMessage(messages.inSchoolHours)}</p>
                                <Row gutter={14}>
                                    <Col xs={24} sm={24} md={12}>
                                        <Form.Item
                                            className='picker-small'
                                            name="in_from_time"
                                            rules={[{ required: true, message: intl.formatMessage(messages.fromMess) }]}
                                        >
                                            <TimePicker use12Hours format="h:mm a" placeholder={intl.formatMessage(messages.from)} defaultOpenValue={moment('00:00:00', 'HH:mm:ss')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={12}>
                                        <Form.Item
                                            className='picker-small'
                                            name="in_to_time"
                                            rules={[{ required: true, message: intl.formatMessage(messages.toMess) }]}
                                        >
                                            <TimePicker use12Hours format="h:mm a" placeholder={intl.formatMessage(messages.to)} defaultOpenValue={moment('00:00:00', 'HH:mm:ss')} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <p className='mb-10 font-700'>{intl.formatMessage(messages.afterSchoolHours)}</p>
                                <Row gutter={14}>
                                    <Col xs={24} sm={24} md={12}>
                                        <Form.Item
                                            className='picker-small'
                                            name="after_from_time"
                                            rules={[{ required: true, message: intl.formatMessage(messages.fromMess) }]}
                                        >
                                            <TimePicker use12Hours format="h:mm a" placeholder={intl.formatMessage(messages.from)} defaultOpenValue={moment('00:00:00', 'HH:mm:ss')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={12}>
                                        <Form.Item
                                            className='picker-small'
                                            name="after_to_time"
                                            rules={[{ required: true, message: intl.formatMessage(messages.toMess) }]}
                                        >
                                            <TimePicker use12Hours format="h:mm a" placeholder={intl.formatMessage(messages.to)} defaultOpenValue={moment('00:00:00', 'HH:mm:ss')} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>
                        </div>

                        <Form.Item className="form-btn continue-btn" >
                            <Button
                                block
                                type="primary"
                                htmlType="submit"
                            >
                                {intl.formatMessage(messages.confirm).toUpperCase()}
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Row>
        );
    }
}
