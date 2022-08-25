import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select, DatePicker, Switch } from 'antd';
// import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
// import { Row, Col, Form, Button, Space, Input } from "antd";
import { BsPlusCircle } from 'react-icons/bs';
import { TbTrash } from 'react-icons/tb';
import { Link } from 'dva/router';
import { routerLinks } from '../../../../constant';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { setParent } from '../../../../../redux/features/registerSlice';

class InfoChild extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formChild: [
                {
                    children: "Dependent 1",
                },
            ],
            isTypeFull: false,
            phoneFill: this.props.register.parent.step2.fatherPhoneNumber || '',
            emailFill: this.props.register.parent.step2.fatherEmail || '',
        }
    }


    onChange = () => console.log('Date change!');
    onFinish = (values) => {
        this.props.setParent({ step3: values.children });
        console.log('Success:', values);
        this.props.onContinue();
    };

    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    checkTypeFull = (changedValues, allValues) => {
        // console.log(changedValues, allValues);
        // const length = allValues.children.length;

        // if (length === 1) {
        //     let data = allValues.children[0];
        //     data = Object.values(data);
        //     data = data.filter(item => item !== "");
        //     if (data && data.length === 9) {
        //         this.setState({
        //             isTypeFull: true,
        //         })
        //     }
        //     else {
        //         this.setState({
        //             isTypeFull: false,
        //         })
        //     }
        // }
        // else {
        //     // delete allValues.children[0];
        //     let data = allValues.children;
        //     data = Object.values(data);

        // }

    }

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
                        initialValues={{
                            children: this.props.parentStep3 || this.state.formChild,
                        }}
                        ref={ref => this.form = ref}
                        onValuesChange={this.checkTypeFull}

                    >
                        <Form.List name="children">
                            {(fields, { add, remove }) => (
                                <div>
                                    {fields.map((field) => {
                                        return (
                                            <div key={field.key} className='div-dependent-form'>
                                                <div className='flex flex-row items-center justify-between mb-10'>
                                                    <div className='flex flex-row items-center'>
                                                        <p className='font-16 mr-10 mb-0'>{intl.formatMessage(messages.dependent)}# {field.key + 1}</p>
                                                        <Switch size="small" defaultChecked />
                                                        <p className='font-16 ml-10 mb-0'>{intl.formatMessage(messages.hasIEP)}</p>
                                                    </div>
                                                    {field.key === 0 ? null : <Button
                                                        type='text'
                                                        className='remove-btn'
                                                        icon={<TbTrash size={18} />}
                                                        onClick={() => remove(field.name)}
                                                    >{intl.formatMessage(messages.remove)}</Button>}
                                                </div>
                                                <Row gutter={14}>
                                                    <Col xs={24} sm={24} md={9}>
                                                        <Form.Item
                                                            name={[field.name, "firstName"]}
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.firstName)
                                                                }
                                                            ]}
                                                        >
                                                            <Input placeholder={intl.formatMessage(messages.firstName)} />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={24} sm={24} md={9}>
                                                        <Form.Item
                                                            name={[field.name, "lastName"]}
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.lastName)
                                                                }
                                                            ]}
                                                        >
                                                            <Input placeholder={intl.formatMessage(messages.lastName)} />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={24} sm={24} md={6}>
                                                        <Form.Item
                                                            name={[field.name, "birthday"]}
                                                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.dateBirth) }]}
                                                        >
                                                            <DatePicker placeholder={intl.formatMessage(messages.dateBirth)} onChange={this.onChange} />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>

                                                <Row gutter={14}>
                                                    <Col xs={24} sm={24} md={12}>
                                                        <Form.Item
                                                            name={[field.name, "guardianPhone"]}
                                                            className='float-label-item'
                                                            label={intl.formatMessage(messages.guardianPhone)}>
                                                            <Input placeholder='{PARENTS} AUTOFILL' defaultValue={this.state.phoneFill} />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={24} sm={24} md={12}>
                                                        <Form.Item className='float-label-item'
                                                            name={[field.name, "guardianEmail"]}
                                                            label={intl.formatMessage(messages.guardianEmail)}>
                                                            <Input placeholder='{PARENTS} AUTOFILL' defaultValue={this.state.emailFill} />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>

                                                <Form.Item

                                                    name={[field.name, "backgroundInfor"]}
                                                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.backgroundInformation) }]}
                                                >
                                                    <Input.TextArea rows={4} placeholder={intl.formatMessage(messages.backgroundInformation)} />
                                                </Form.Item>
                                                <Form.Item

                                                    name={[field.name, "school"]}
                                                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.school) }]}
                                                >
                                                    <Input placeholder={intl.formatMessage(messages.school)} />
                                                </Form.Item>
                                                <Row gutter={14}>
                                                    <Col xs={24} sm={24} md={12}>
                                                        <Form.Item

                                                            name={[field.name, "primaryTeacher"]}
                                                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.primaryTeacher) }]}
                                                        >
                                                            <Input placeholder={intl.formatMessage(messages.primaryTeacher)} />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={24} sm={24} md={12}>
                                                        <Form.Item

                                                            name={[field.name, "currentGrade"]}
                                                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.currentGrade) }]}
                                                        >
                                                            <Input placeholder={intl.formatMessage(messages.currentGrade)} />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                                <div className='flex flex-row'>
                                                    <Form.Item
                                                        name={[field.name, 'services']}
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.servicesRequired)
                                                            }
                                                        ]}
                                                        className='add-services bottom-0 flex-1'>
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
                                                    <Link to={routerLinks['SubsidyRequest']}>
                                                        <Button className='ml-10' disabled={
                                                            this.state.isTypeFull ? false : true
                                                        }>{intl.formatMessage(messages.subsidyRequest)}</Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    <Form.Item className='text-center'>
                                        <Button
                                            type="text"
                                            className='add-dependent-btn'
                                            icon={<BsPlusCircle size={17} className='mr-5' />}
                                            onClick={() => add(null)}
                                        >
                                            {intl.formatMessage(messages.addDependent)}
                                        </Button>
                                    </Form.Item>
                                </div>
                            )}
                        </Form.List>

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
            </Row >
        );
    }
}

const mapStateToProps = state => {
    console.log('state', state);
    return ({
        parentStep3: state.register.parent.step3,
        register: state.register,
    })
}

export default compose(connect(mapStateToProps, { setParent }))(InfoChild);