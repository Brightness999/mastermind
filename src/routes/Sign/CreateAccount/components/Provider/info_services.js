import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select, Switch, message, Upload, AutoComplete } from 'antd';
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
            fileList: [],
            uploading: false,
            documentUploaded: [],
            SkillSet:[],
            AcademicLevel:[],

        }
    }

    componentDidMount() {
        const { registerData } = this.props.register;

        console.log(registerData);

        if (!registerData.serviceInfor) {
            this.props.setRegisterData({ serviceInfor: this.getDefaultObj() });
        }
        var serviceInfor = registerData.serviceInfor || this.getDefaultObj();
        this.form.setFieldsValue(serviceInfor);
        this.getDataFromServer()
    }

    getDataFromServer = () => {
        axios.post(url + 'providers/get_default_values_for_provider'
        ).then(result => {
            console.log('get_default_value_for_client', result.data);
            if (result.data.success) {
                var data = result.data.data;
                this.setState({ 
                    SkillSet:data.SkillSet,
                    AcademicLevel:data.AcademicLevel,
                })
            } else {
                this.setState({
                    SkillSet:[],
                    AcademicLevel:[],
                });

            }

        }).catch(err => {
            console.log(err);
            this.setState({
                SkillSet:[],
                AcademicLevel:[],
            });
        })
    }

    getDefaultObj = () => {
        return {
            SSN: "",
            level: [{
                academicLevel: undefined,
                rate_large: "",
            }],
            public_profile: "",
            rate_small: "",
            references: "",
            screeningTime: 0,
            serviceableSchool: "1",
            skillSet: undefined,
            upload_w_9: "",
            yearExp: '',
        }
        return {
            SSN: "undefined",
            level: [{
                academicLevel: "l1",
                rate_large: "r2",
            }],
            public_profile: "undefined",
            rate_small: "r2",
            references: "undefined",
            screeningTime: "AM",
            serviceableSchool: "s1",
            skillSet: "s1",
            upload_w_9: "wedfefewf",
            yearExp: 12,
        }
    }

    onFinish = (values) => {
        console.log('Success:', values);
        this.props.setRegisterData({
            serviceInfor: values,
            documentUploaded: this.state.documentUploaded
        })

        this.props.onContinue();
    };

    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    onUploadChange = async (info) => {

        if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList);
            this.setState(prevState => ({
                fileList: [...prevState.fileList, info.file],
            }));
        }
        if (info.file.status === 'done') {
            console.log('done', info.file.response);
            message.success(`${info.file.name} file uploaded successfully`);
            console.log(info.file.response.data);
            this.form?.setFieldsValue({
                upload_w_9: info.file.name
            })
            this.props.setRegisterData({
                upload_w_9: info.file.name
            })
            this.setState(prevState => ({ documentUploaded: [...prevState.documentUploaded, info.file.response.data] }));
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
            this.setState(prevState => ({
                fileList: [...prevState.fileList, info.file],
            }));
        }
    }

    setValueToReduxRegisterData = (fieldName, value) => {
        const { registerData } = this.props.register;
        var serviceInfor = registerData.serviceInfor;
        var obj = {};
        obj[fieldName] = value;
        console.log(obj);
        this.props.setRegisterData({ serviceInfor: { ...serviceInfor, ...obj } });
    }

    defaultOnValueChange = (event, fieldName) => {
        var value = event.target.value;
        console.log(fieldName, value);
        this.setValueToReduxRegisterData(fieldName, value);
    }

    handleSelectChange = (value, fieldName) => {
        console.log(fieldName, value);
        this.setValueToReduxRegisterData(fieldName, value);
    }

    render() {
        const { fileList } = this.state;
        const props = {
            name: 'file',
            action: url + 'providers/upload_temp_w9_form',
            headers: {
                authorization: 'authorization-text',
            },
            onChange: this.onUploadChange,
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
                            name="skillSet"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.skillsets) }]}

                        >
                            <Select 
                                placeholder={intl.formatMessage(messages.skillsets)} 
                                onChange={v => this.handleSelectChange(v, 'skillSet')}>
                                {this.state.SkillSet.map((value, index)=>{
                                    return (<Select.Option value={index}>{value}</Select.Option>)
                                })}
                            </Select>
                        </Form.Item>
                        <Row gutter={14}>
                            <Col xs={24} sm={24} md={12}>
                                <Form.Item
                                    name="yearExp"
                                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.yearsExperience) }]}
                                >
                                    <Input onChange={v => this.defaultOnValueChange(v, 'yearExp')} placeholder={intl.formatMessage(messages.yearsExperience)} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={12}>
                                <Form.Item
                                    name="SSN"
                                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + 'SSN' }]}
                                >
                                    <Input onChange={v => this.defaultOnValueChange(v, 'SSN')} placeholder='SSN' suffix={<QuestionCircleOutlined className='text-primary icon-suffix' />} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item
                            name="serviceableSchool"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.serviceableSchools) }]}
                           >
                            <AutoComplete
                                placeholder={intl.formatMessage(messages.serviceableSchools)} 
                                onChange={v => this.handleSelectChange(v, 'serviceableSchool')}
                                options={[{ value: 'serviceable 1' }, { value: 'serviceable 2' }]}
                            />
                        </Form.Item>

                        <Form.List name="level">
                            {(fields, { add, remove }) => (
                                <div>
                                    {fields.map((field) => {
                                        return (
                                            <Row gutter={14} key={field.key}>
                                                <Col xs={16} sm={16} md={16}>
                                                    <Form.Item
                                                        name={[field.name, "academicLevel"]}
                                                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.academicLevel) }]}
                                                        className='bottom-0'
                                                        style={{ marginTop: field.key === 0 ? 0 : 14 }}
                                                    >
                                                        <Select placeholder={intl.formatMessage(messages.academicLevel)}>
                                                            {this.state.AcademicLevel.map((level,index)=>{
                                                                return (<Select.Option value={index}>{level}</Select.Option>)
                                                            })}
                                                            
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
                                                        <Input 
                                                            placeholder={intl.formatMessage(messages.rate)} 
                                                            onChange={(envent=>{

                                                            })}
                                                         />
                                                        {/* <Select placeholder={intl.formatMessage(messages.rate)}>
                                                            <Select.Option value='r1'>rate 1</Select.Option>
                                                            <Select.Option value='r2'>rate 2</Select.Option>
                                                        </Select> */}
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
                                name="screeningTime"
                                className='select-small'
                                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.screeningTime) }]}
                            >
                                <Select placeholder={intl.formatMessage(messages.screeningTime)}>
                                    <Select.Option value='AM'>PM</Select.Option>
                                    <Select.Option value='PM'>AM</Select.Option>
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