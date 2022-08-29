import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select, Switch, message, Upload } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import { QuestionCircleOutlined } from '@ant-design/icons';

import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';
import messagesRequest from '../../../SubsidyRequest/messages';


import { connect } from 'react-redux'
import { compose } from 'redux'
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import { url } from '../../../../../utils/api/baseUrl';
import axios from 'axios';

class InfoServices extends Component {
    constructor(props) {
        super(props);
        this.state = {
            levels: [
                { level: "Dependent 1" },
            ],
            fileList: null,
            uploading: false,
        }
    }

    componentDidMount() {
        const data = this.props.register.provider;
        console.log(data);
        if (data) {
            this.form?.setFieldsValue({
                ...data?.step3
            })
        }
    }

    onFinish = (values) => {
        console.log('Success:', values);
        this.props.setRegisterData({
            step3: values
        });
        this.props.onContinue();
    };

    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    onChange = async (info) => {
        if (info.file.status !== 'uploading') {

            // this.setState({ fileList: info.file });
            // this.form?.setFieldsValue({
            //     upload_w_9: info.file.name
            // })

            try {
                const formData = new FormData();
                formData.append('file', info.file.originFileObj);
                const response = await axios.post(url + 'providers/upload_temp_w9_form', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                const { success, data } = response.data;
                if (success) {
                    this.setState({
                        fileList: data,
                        uploading: false,
                    });
                    this.form?.setFieldsValue({
                        upload_w_9: data
                    })
                    message.success(intl.formatMessage(messages.uploadSuccess));
                }
                console.log(response);
            } catch (error) {
                console.log(error);
                message.error(error?.response?.data?.data ?? error.message);
            }
        }
        // if (info.file.status === 'done') {
        //     message.success(`${info.file.name} file uploaded successfully`);
        // } else if (info.file.status === 'error') {
        //     message.error(`${info.file.name} file upload failed.`);
        // }
    }

    render() {
        const { fileList } = this.state;
        const props = {
            name: 'file',
            action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
            listType: "picture",
            headers: {
                authorization: 'authorization-text',
            },
            onChange: this.onChange,
            maxCount: 1,
            showUploadList: false,
        };
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
                        initialValues={{
                            level: this.state.levels,
                            upload_w_9: this.state?.fileList?.name || ''
                        }}
                        ref={ref => this.form = ref}
                    >
                        <Form.Item
                            name="skillsets"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.skillsets) }]}

                        >
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
                                    <Input placeholder={intl.formatMessage(messages.yearsExperience)} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={12}>
                                <Form.Item
                                    name="ssn"
                                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + 'SSN' }]}
                                >
                                    <Input placeholder='SSN' suffix={<QuestionCircleOutlined className='text-primary icon-suffix' />} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item
                            name="serviceable_schools"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.serviceableSchools) }]}
                        >
                            <Select placeholder={intl.formatMessage(messages.serviceableSchools)}>
                                <Select.Option value='s1'>serviceable 1</Select.Option>
                                <Select.Option value='s2'>serviceable 2</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.List name="level">
                            {(fields, { add, remove }) => (
                                <div>
                                    {fields.map((field) => {
                                        return (
                                            <Row gutter={14} key={field.key}>
                                                <Col xs={16} sm={16} md={16}>
                                                    <Form.Item
                                                        name={[field.name, "academic_level"]}
                                                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.academicLevel) }]}
                                                        className='bottom-0'
                                                        style={{ marginTop: field.key === 0 ? 0 : 14 }}
                                                    >
                                                        <Select placeholder={intl.formatMessage(messages.academicLevel)}>
                                                            <Select.Option value='l1'>level 1</Select.Option>
                                                            <Select.Option value='l2'>level 2</Select.Option>
                                                        </Select>
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={8} sm={8} md={8} className={field.key !== 0 && 'item-remove'}>
                                                    <Form.Item
                                                        name={[field.name, "rate_large"]}
                                                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.rate) }]}
                                                        className='bottom-0'
                                                        style={{ marginTop: field.key === 0 ? 0 : 14 }}
                                                    >
                                                        <Select placeholder={intl.formatMessage(messages.rate)}>
                                                            <Select.Option value='r1'>rate 1</Select.Option>
                                                            <Select.Option value='r2'>rate 2</Select.Option>
                                                        </Select>
                                                    </Form.Item>
                                                    {field.key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />}

                                                </Col>
                                            </Row>
                                        );
                                    }
                                    )}

                                    <div className='text-center flex flex-row justify-between my-10'>
                                        <Button
                                            type="text"
                                            className='add-level-btn'
                                            icon={<BsPlusCircle size={17} className='mr-5' />}
                                            onClick={() => add(null)}
                                        >
                                            {intl.formatMessage(messages.addLevel)}
                                        </Button>

                                        <div className='flex flex-row w-50'>
                                            <Switch size="small" defaultChecked />
                                            <p className='ml-10 mb-0'>{intl.formatMessage(messages.sameRateLevels)}</p>
                                        </div>
                                    </div>
                                </div>

                            )}

                        </Form.List>

                        <div className='text-center flex flex-row justify-between'>
                            <div className='flex flex-row items-center mb-10'>
                                <Switch size="small" defaultChecked />
                                <p className='ml-10 mb-0'>{intl.formatMessage(messages.separateEvaluation)}</p>
                            </div>
                            <Form.Item
                                name="rate_small"
                                className='select-small'
                                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.rate) }]}
                            >
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
                            <Form.Item
                                size='small'
                                name="screening_time"
                                className='select-small'
                                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.screeningTime) }]}
                            >
                                <Select placeholder={intl.formatMessage(messages.screeningTime)}>
                                    <Select.Option value='t1'>1 minute</Select.Option>
                                    <Select.Option value='t2'>2 minutes</Select.Option>
                                </Select>
                            </Form.Item>
                        </div>
                        <Form.Item
                            name="upload_w_9"
                            className='input-download'
                            rules={[{ required: true, message: intl.formatMessage(messages.uploadMess) }]}
                        >
                            <Input
                                addonBefore='W-9 Form'
                                suffix={
                                    <Upload {...props}>
                                        <a className='font-12 underline'>{intl.formatMessage(messagesRequest.upload)}</a>
                                    </Upload>
                                }
                                readOnly
                            />
                        </Form.Item>
                        <Form.Item
                            name="references"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.references) }]}
                        >
                            <Input placeholder={intl.formatMessage(messages.references)} />
                        </Form.Item>
                        <Form.Item
                            name="public_profile"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.publicProfile) }]}
                        >
                            <Input.TextArea rows={4} placeholder={intl.formatMessage(messages.publicProfile)} />
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

const mapStateToProps = state => ({
    register: state.register,
})
export default compose(connect(mapStateToProps, { setRegisterData }))(InfoServices);