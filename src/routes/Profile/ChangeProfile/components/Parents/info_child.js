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
import messagesLogin from '../../../../Sign/Login/messages';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import moment from 'moment';
import { url } from '../../../../../utils/api/baseUrl';
import axios from 'axios';
import { setInforClientChild, changeInforClientChild } from '../../../../../redux/features/authSlice';
import { store } from '../../../../../redux/store'
class InfoChild extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formChild: [
                {
                    firstName: '',
                    lastName: '',
                    birthday: '',
                    backgroundInfor: '',
                    primaryTeacher: '',
                    currentGrade: '',
                    school: '',
                    services: [],
                },
            ],
            dataChange: [],
            isTypeFull: false,
            phoneFill: '',
            emailFill: '',
            listServices: [],
        }
    }

    componentDidMount() {

        // const tokenUser = localStorage.getItem('token');
        // if (tokenUser) {
        //     axios.post(url + 'clients/get_child_profile', {}, {
        //         headers: {
        //             'Authorization': 'Bearer ' + tokenUser
        //         }
        //     }).then(result => {
        //         console.log('get_child_profile', result.data);
        //     }).catch(err => {

        //     })
        // }

        // const { authDataClientChild } = this.props.auth;
        // console.log(authDataClientChild, 'authDataClientChild')
        // var newChild = this.getDefaultChildObj(authDataClientChild);

        // var studentInfos = !!authDataClientChild ? JSON.parse(JSON.stringify(authDataClientChild)) : [newChild, newChild, newChild];

        // if (!authDataClientChild) {
        //     this.props.setRegisterData({ studentInfos: studentInfos });
        // }

        // const newStudentInfos = studentInfos.map(item => (
        //     { ...item, birthday_moment: moment(item.birthday, "YYYY/MM/DD") }
        // ))
        // this.form.setFieldsValue({ children: newStudentInfos });

        const tokenUser = localStorage.getItem('token');

        if (tokenUser) {
            axios.post(url + 'clients/get_child_profile', {}, {
                headers: {
                    'Authorization': 'Bearer ' + tokenUser
                }
            }).then(result => {
                let { success, data } = result.data;
                console.log('adta', data)
                if (success) {
                    data = data.map(item => {
                        return {
                            ...item,
                            birthday_moment: moment(item.birthday, "YYYY-MM-DD"),
                            services: item.services.map(item => item._id)
                        }
                    })
                    this.form.setFieldsValue({ children: data });
                }
            }).catch(err => {
                console.log(err);
                this.setState({
                    checkEmailExist: false,
                });
            })
        }

        this.loadServices();
    }

    loadServices() {
        axios.post(url + 'clients/get_default_value_for_client'
        ).then(result => {
            if (result.data.success) {
                var data = result.data.data;
                this.setState({ listServices: data.listServices })
            } else {
                this.setState({
                    checkEmailExist: false,
                });
            }
        }).catch(err => {
            console.log(err);
            this.setState({
                checkEmailExist: false,
            });
        })
    }

    getDefaultChildObj(parentInfo) {
        var obj = {
            "firstName": '',
            "lastName": "",
            "birthday": "",
            "guardianPhone": "",
            "guardianEmail": "",
            "backgroundInfor": "",
            "school": "",
            "primaryTeacher": "",
            "currentGrade": "",
            "services": [],
            "hasIEP": 1,
            "availabilitySchedule": []
        };
        return obj;
    }


    updateReduxValueFor1Depedent(index, fieldName, value) {
        const { authDataClientChild } = this.props.auth;
        var studentInfos = [...authDataClientChild]
        var selectedObj = { ...studentInfos[index] };
        selectedObj[fieldName] = value;
        studentInfos[index] = selectedObj;
        // this.props.setRegisterData({ studentInfos: studentInfos });
    }

    getBirthday = (index) => {
        const { authDataClientChild } = this.props.auth;
        if (!!authDataClientChild && authDataClientChild[index] != undefined && !!authDataClientChild[index].birthday_moment) {
            return authDataClientChild[index].birthday_moment;
        }
        return moment();
    }
    onFinish = (values) => {

    };

    updateProfile = async (index) => {
        const token = localStorage.getItem('token');
        const values = await this.form.validateFields();
        const dataForm = values.children[index];
        const dataChangeFrom = this.state.dataChange ?? [];

        try {
            store.dispatch(setInforClientChild({ data: dataForm, token: token }))
            if (dataChangeFrom.length != 0) {
                this.props.changeInforClientChild(dataChangeFrom)
            }
        } catch (error) {
            console.log(error, 'error')
        }

    }

    onFinishFailed = (errorInfo) => {
        // console.log('Failed:', errorInfo);
    };

    getValueInForm = (allValue, allValueChange) => {
        console.log(allValue, 'allValue')
        console.log(allValueChange, 'allValueChange')
        this.setState({ dataChange: allValueChange.children })
    }

    onValueChange() {

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
                        ref={ref => this.form = ref}
                        onValuesChange={this.getValueInForm}
                    >
                        <Form.List name="children">

                            {
                                (fields, { add, remove }) => (
                                    <div>
                                        {fields.map((field, index) => {
                                            return (
                                                <div key={field.key} className='div-dependent-form'>
                                                    <div className='flex flex-row items-center justify-between mb-10'>
                                                        <div className='flex flex-row items-center'>
                                                            <p className='font-16 mr-10 mb-0'>{intl.formatMessage(messages.dependent)}# {index + 1}</p>
                                                            <Switch
                                                                onChange={v => {
                                                                    console.log('hasIEP', v)
                                                                    this.updateReduxValueFor1Depedent(index, "hasIEP", v);
                                                                }}
                                                                size="small" defaultChecked />
                                                            <p className='font-16 ml-10 mb-0'>{intl.formatMessage(messages.hasIEP)}</p>
                                                        </div>
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
                                                                <Input onChange={v => {
                                                                    this.updateReduxValueFor1Depedent(index, "firstName", v.target.value);
                                                                }}
                                                                    placeholder={intl.formatMessage(messages.firstName)} />
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
                                                                <Input onChange={v => {
                                                                    this.updateReduxValueFor1Depedent(index, "lastName", v.target.value);

                                                                }} placeholder={intl.formatMessage(messages.lastName)} />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={6}>
                                                            <Form.Item
                                                                name={[field.name, "birthday_moment"]}
                                                                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.dateBirth) }]}
                                                            >
                                                                <DatePicker format={"YYYY-MM-DD"} placeholder={intl.formatMessage(messages.dateBirth)}
                                                                    selected={this.getBirthday(index)}
                                                                    onChange={v => {
                                                                        console.log(v.valueOf(), typeof v);
                                                                        // this.updateReduxValueFor1Depedent(index,"birthday_moment" ,v.clone() );
                                                                        this.updateReduxValueFor1Depedent(index, "birthday", v.valueOf());
                                                                    }} />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>

                                                    <Row gutter={14}>
                                                        <Col xs={24} sm={24} md={12}>
                                                            <Form.Item
                                                                name={[field.name, "guardianPhone"]}
                                                                className='float-label-item'
                                                                label={intl.formatMessage(messages.guardianPhone)}>
                                                                <Input
                                                                    onChange={v => {
                                                                        this.updateReduxValueFor1Depedent(index, "guardianPhone", v.target.value);
                                                                    }}
                                                                    placeholder='{PARENTS} AUTOFILL' />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={12}>
                                                            <Form.Item className='float-label-item'
                                                                name={[field.name, "guardianEmail"]}
                                                                label={intl.formatMessage(messages.guardianEmail)}>
                                                                <Input
                                                                    onChange={v => {
                                                                        this.updateReduxValueFor1Depedent(index, "guardianEmail", v.target.value);
                                                                    }}
                                                                    placeholder='{PARENTS} AUTOFILL'
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>

                                                    <Form.Item

                                                        name={[field.name, "backgroundInfor"]}
                                                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.backgroundInformation) }]}
                                                    >
                                                        <Input.TextArea onChange={v => {
                                                            this.updateReduxValueFor1Depedent(index, "backgroundInfor", v.target.value);
                                                        }}
                                                            rows={4}
                                                            placeholder={intl.formatMessage(messages.backgroundInformation)} />
                                                    </Form.Item>
                                                    <Form.Item

                                                        name={[field.name, "school"]}
                                                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.school) }]}
                                                    >
                                                        <Input onChange={v => {
                                                            this.updateReduxValueFor1Depedent(index, "school", v.target.value);
                                                        }}
                                                            placeholder={intl.formatMessage(messages.school)} />
                                                    </Form.Item>
                                                    <Row gutter={14}>
                                                        <Col xs={24} sm={24} md={12}>
                                                            <Form.Item

                                                                name={[field.name, "primaryTeacher"]}
                                                                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.primaryTeacher) }]}
                                                            >
                                                                <Input onChange={v => {
                                                                    this.updateReduxValueFor1Depedent(index, "primaryTeacher", v.target.value);
                                                                }}
                                                                    placeholder={intl.formatMessage(messages.primaryTeacher)} />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={12}>
                                                            <Form.Item

                                                                name={[field.name, "currentGrade"]}
                                                                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.currentGrade) }]}
                                                            >
                                                                <Input onChange={v => {
                                                                    this.updateReduxValueFor1Depedent(index, "currentGrade", v.target.value);
                                                                }}
                                                                    placeholder={intl.formatMessage(messages.currentGrade)} />
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

                                                                onChange={v => {
                                                                    console.log(v);
                                                                    this.updateReduxValueFor1Depedent(index, "services", v);
                                                                }}
                                                            >
                                                                {this.state.listServices.map(service => {
                                                                    return (<Select.Option label={service.name} value={service._id}>{service.name}</Select.Option>)
                                                                })}
                                                            </Select>
                                                        </Form.Item>
                                                    </div>
                                                    <Form.Item className="form-btn continue-btn" >
                                                        <Button
                                                            block
                                                            type="primary"
                                                            htmlType="submit"
                                                            onClick={() => this.updateProfile(index)}
                                                        >
                                                            {intl.formatMessage(messages.update).toUpperCase()}
                                                        </Button>
                                                    </Form.Item>
                                                </div>
                                            )
                                        })}
                                        <Form.Item className='text-center'>
                                        </Form.Item>
                                    </div>
                                )}
                        </Form.List>


                    </Form>
                </div>
            </Row>
        );
    }
}

const mapStateToProps = state => {
    console.log('state', state);
    return ({
        register: state.register,
        auth: state.auth
    })
}

export default compose(connect(mapStateToProps, { setRegisterData, changeInforClientChild }))(InfoChild);