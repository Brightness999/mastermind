import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select, Switch, message, Upload, AutoComplete } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import { QuestionCircleOutlined } from '@ant-design/icons';

import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../../Sign/Login/messages';
import messagesRequest from '../../../../Sign/SubsidyRequest/messages';


import { connect } from 'react-redux'
import { compose } from 'redux'
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import { url } from '../../../../../utils/api/baseUrl';
import { store } from '../../../../../redux/store';
import { setInforProvider } from '../../../../../redux/features/authSlice';
import axios from 'axios';

class InfoServices extends Component {
    constructor(props) {
        super(props);

        console.log(props, 'props')


        this.state = {
            levels: [
                { level: "Dependent 1" },
            ],
            fileList: [],
            uploading: false,
            documentUploaded: [],
            SkillSet: [],
            AcademicLevel: [],
            ServiceableSchools: [],
            ScreenTime: [],
            sameRateForAllLevel: true,

            isSeparateEvaluationRate: true,
            isHomeVisit: true,
            privateOffice: true,
            isReceiptsProvided: true,
            isNewClientScreening: true,

        }
    }

    componentDidMount() {
        //const { authData } = this.props.auth;

        // if (!authData) {
        //     this.props.setRegisterData({ serviceInfor: this.getDefaultObj() });
        // }
        // const newAuthData = {...authData, upload_w_9: authData.W9FormPath }
        // var serviceInfor = newAuthData || this.getDefaultObj();
        // this.form.setFieldsValue(serviceInfor);
        // this.setState({
        //     isSeparateEvaluationRate :serviceInfor.isSeparateEvaluationRate,
        //     isHomeVisit: serviceInfor.isHomeVisit,
        //     privateOffice: serviceInfor.privateOffice,
        //     isReceiptsProvided: serviceInfor.isReceiptsProvided,
        //     isNewClientScreening: serviceInfor.isNewClientScreening,
        // })

        const tokenUser = localStorage.getItem('token');

        axios.post(url + 'providers/get_my_provider_info', {}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + tokenUser
            }
        }).then(result => {
            const { data } = result.data
            console.log(data);
            this.form.setFieldsValue({
                ...data
            })
        })

        this.getDataFromServer()
    }

    getDataFromServer = () => {
        axios.post(url + 'providers/get_default_values_for_provider'
        ).then(result => {
            console.log('get_default_value_for_client', result.data);
            if (result.data.success) {
                var data = result.data.data;
                this.setState({
                    SkillSet: data.SkillSet,
                    AcademicLevel: data.AcademicLevel,
                    ScreenTime: data.SreenTime,
                })
            } else {
                this.setState({
                    SkillSet: [],
                    AcademicLevel: [],
                    ScreenTime: [],
                });

            }

        }).catch(err => {
            console.log(err);
            this.setState({
                SkillSet: [],
                AcademicLevel: [],
                ScreenTime: [],
            });
        })
    }

    getDefaultObj = () => {
        return {
            SSN: "",
            academicLevel: [{
                level: undefined,
                rate: "",
            }],
            publicProfile: "",
            separateEvaluationRate: "",
            references: "",
            screeningTime: undefined,
            serviceableSchool: undefined,
            skillSet: undefined,
            upload_w_9: "",
            yearExp: '',
            isSeparateEvaluationRate: true,
            isHomeVisit: true,
            privateOffice: true,
            isReceiptsProvided: true,
            isNewClientScreening: true,
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
                upload_w_9: info.file.name,
                uploaded_path: info.file.response.data
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
        var serviceInfor = JSON.parse(JSON.stringify(registerData.serviceInfor));

        serviceInfor[fieldName] = value;
        console.log('new value', serviceInfor);
        this.props.setRegisterData({ serviceInfor: serviceInfor });
    }

    defaultOnValueChange = (event, fieldName) => {
        var value = event.target.value;
        console.log(fieldName, value);
        this.setValueToReduxRegisterData(fieldName, value);
    }

    handleSelectChange = (fieldName, value) => {
        console.log(fieldName, value);
        this.setValueToReduxRegisterData(fieldName, value);


    }

    handleChangeServiceable = (text) => {
        // filter with server
        console.log(text);
        this.setValueToReduxRegisterData('serviceableSchool', text);

        this.searchServiceableSchool(text)
    }

    searchServiceableSchool = (text) => {
        axios.post(url + 'schools/get_school_infos', { data: { "search": text } }
        ).then(result => {
            console.log('get_school_infos', result.data);
            if (result.data.success) {
                var data = result.data.data;
                this.setState({
                    ServiceableSchools: data.docs
                })
            } else {
                this.setState({
                    ServiceableSchools: [],
                });

            }

        }).catch(err => {
            console.log(err);
            this.setState({
                ServiceableSchools: [],
            });
        })

    }

    updateProfile = async () => {
        const { user } = this.props.auth;
        const { parentInfo } = user

        const token = localStorage.getItem('token');
        const values = await this.form.validateFields();

        const dataFrom = { ...values, _id: parentInfo }
        try {
            store.dispatch(setInforClientParent({ data: dataFrom, token: token }))
            //this.props.changeInforClientParent(dataFrom)
        } catch (error) {
            console.log(error, 'error')
        }
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

                        ref={ref => this.form = ref}
                    >
                        <Form.Item
                            name="skillSet"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.skillsets) }]}

                        >
                            <Select
                                placeholder={intl.formatMessage(messages.skillsets)}
                                onChange={v => this.handleSelectChange('skillSet', v)}>
                                {this.state.SkillSet.map((value, index) => {
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
                                onChange={v => this.handleChangeServiceable(v)}
                                options={this.state.ServiceableSchools.map((value, index) => {
                                    return { key: index, value: value.name }
                                })}
                            />
                        </Form.Item>

                        <Form.List name="academicLevel">
                            {(fields, { add, remove }) => (
                                <div>
                                    {fields.map((field) => {
                                        return (
                                            <Row gutter={14} key={field.key}>
                                                <Col xs={16} sm={16} md={16}>
                                                    <Form.Item
                                                        name={[field.name, "level"]}
                                                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.academicLevel) }]}
                                                        className='bottom-0'
                                                        style={{ marginTop: field.key === 0 ? 0 : 14 }}
                                                    >
                                                        <Select
                                                            onChange={(event => {
                                                                var arr = this.form.getFieldValue('academicLevel')
                                                                this.setValueToReduxRegisterData('academicLevel', arr);
                                                            })}
                                                            placeholder={intl.formatMessage(messages.academicLevel)}>
                                                            {this.state.AcademicLevel.map((level, index) => {
                                                                return (<Select.Option value={index}>{level}</Select.Option>)
                                                            })}

                                                        </Select>
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={8} sm={8} md={8} className={field.key !== 0 && 'item-remove'}>
                                                    <Form.Item
                                                        name={[field.name, "rate"]}
                                                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.rate) }]}
                                                        className='bottom-0'
                                                        style={{ marginTop: field.key === 0 ? 0 : 14 }}
                                                    >
                                                        <Input
                                                            placeholder={intl.formatMessage(messages.rate)}
                                                            onChange={(event => {
                                                                console.log('values', this.form.getFieldsValue());
                                                                var value = event.target.value;
                                                                var arr = JSON.parse(JSON.stringify(this.form.getFieldValue('academicLevel')));
                                                                for (var i = 0; i < arr.length; i++) {
                                                                    if (arr[i] == undefined) arr[i] = {};
                                                                    arr[i].rate = value;
                                                                }
                                                                this.form.setFieldValue('academicLevel', arr);
                                                                this.setValueToReduxRegisterData('academicLevel', arr);
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
                                            <Switch size="small"
                                                checked={this.state.sameRateForAllLevel}
                                                onChange={v => {
                                                    this.setState({ sameRateForAllLevel: v })
                                                    this.handleSelectChange('sameRateForAllLevel', v)
                                                }}
                                            />
                                            <p className='ml-10 mb-0'>{intl.formatMessage(messages.sameRateLevels)}</p>
                                        </div>
                                    </div>
                                </div>

                            )}

                        </Form.List>

                        <div className='text-center flex flex-row justify-between'>
                            <div className='flex flex-row items-center mb-10'>
                                <Switch size="small"

                                    checked={this.state.isSeparateEvaluationRate}
                                    onChange={v => {
                                        this.setState({ isSeparateEvaluationRate: v })
                                        this.handleSelectChange('isSeparateEvaluationRate', v)
                                    }}
                                />
                                <p className='ml-10 mb-0'>{intl.formatMessage(messages.separateEvaluation)}</p>
                            </div>
                            <Form.Item
                                name="separateEvaluationRate"

                                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.rate) }]}
                            >
                                <Input
                                    onChange={v => {
                                        // this.setState({isSeparateEvaluationRate:!this.state.isSeparateEvaluationRate})
                                    }}
                                    placeholder={intl.formatMessage(messages.rate)} className='bottom-left-0' />
                                {/* <Select placeholder={intl.formatMessage(messages.rate)}>
                                    <Select.Option value='rate1'>rate 1</Select.Option>
                                    <Select.Option value='rate2'>rate 2</Select.Option>
                                </Select> */}
                            </Form.Item>
                        </div>
                        <div className='text-center flex flex-row justify-between mb-10'>
                            <div className='flex flex-row items-center w-50'>
                                <Switch size="small"
                                    checked={this.state.isHomeVisit}
                                    onChange={v => {
                                        this.setState({ isHomeVisit: v })
                                        this.handleSelectChange('isHomeVisit', v)
                                    }}
                                />
                                <p className='ml-10 mb-0'>{intl.formatMessage(messages.homeVisits)}</p>
                            </div>
                            <div className='flex flex-row items-center w-50'>
                                <Switch size="small"
                                    checked={this.state.privateOffice}
                                    onChange={v => {
                                        this.setState({ privateOffice: v })
                                        this.handleSelectChange('privateOffice', v)
                                    }}
                                />
                                <p className='ml-10 mb-0'>{intl.formatMessage(messages.privateOffice)}</p>
                            </div>
                        </div>
                        <div className='flex flex-row items-center mb-10'>
                            <Switch size="small"
                                checked={this.state.isReceiptsProvided}
                                onChange={v => {
                                    this.setState({ isReceiptsProvided: v })
                                    this.handleSelectChange('isReceiptsProvided', v)
                                }}
                            />
                            <p className='ml-10 mb-0'>{intl.formatMessage(messages.receiptsRequest)}</p>
                        </div>
                        <div className='text-center flex flex-row justify-between'>
                            <div className='flex flex-row items-center mb-10'>
                                <Switch size="small"
                                    checked={this.state.isNewClientScreening}
                                    onChange={v => {
                                        this.setState({ isNewClientScreening: v })
                                        this.handleSelectChange('isNewClientScreening', v)
                                    }}
                                />
                                <p className='ml-10 mb-0'>{intl.formatMessage(messages.newClient)}</p>
                            </div>
                            <Form.Item
                                size='small'
                                name="screeningTime"
                                className='select-small'
                                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.screeningTime) }]}
                            >
                                <Select
                                    onChange={v => {
                                        this.handleSelectChange('screeningTime', v)
                                    }}
                                    placeholder={intl.formatMessage(messages.screeningTime)}>
                                    {this.state.ScreenTime.map((value, index) => {
                                        return (<Select.Option value={index}>{value}</Select.Option>)
                                    })}
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
                            <Input
                                onChange={(event => {
                                    var value = event.target.value;
                                    this.setValueToReduxRegisterData('references', value);
                                })}
                                placeholder={intl.formatMessage(messages.references)} />
                        </Form.Item>
                        <Form.Item
                            name="publicProfile"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.publicProfile) }]}
                        >
                            <Input.TextArea
                                onChange={(event => {
                                    var value = event.target.value;
                                    this.setValueToReduxRegisterData('publicProfile', value);
                                })}
                                rows={4} placeholder={intl.formatMessage(messages.publicProfile)} />
                        </Form.Item>


                        <Form.Item className="form-btn continue-btn" >
                            <Button
                                block
                                type="primary"
                                htmlType="submit"
                            // onClick={this.props.onContinue}
                            >
                                {intl.formatMessage(messages.update).toUpperCase()}
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
    auth: state.auth
})
export default compose(connect(mapStateToProps, { setRegisterData }))(InfoServices);