import React from 'react';
import { Modal, Row, Col, Form, Button, Input, Select, Switch, message, Upload, Rate } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import { QuestionCircleOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';

import { url } from '../../utils/api/baseUrl';
import messages from './messages';
import messagesCreate from '../../routes/Sign/CreateAccount/messages';
import messagesLogin from '../../routes/Sign/Login/messages';
import './style/index.less';
import '../../assets/styles/login.less';

class ModalSeparateEvaluation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fileList: [],
            uploading: false,
            documentUploaded: [],
            academicLevel: [
                { level: 1}
            ],

            sameRateForAllLevel:true,
            isSeparateEvaluationRate:true,
            isHomeVisit:true,
            privateOffice:true,
            isReceiptsProvided:true,
            isNewClientScreening:true,
            listSchools:[],
        }
    }
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
    render() {
        const modalProps = {
            className: 'modal-evaluation',
            title: "",
            visible: this.props.visible,
            onOk: this.props.onSubmit,
            onCancel: this.props.onCancel,
            closable: false,
            // width: 900,
            footer: [
                <Button key="back" onClick={this.props.onCancel}>
                    {intl.formatMessage(messages.cancel)}
                </Button>,
                <Button key="submit" type="primary" onClick={this.props.onSubmit} style={{ padding: '7.5px 30px' }}>
                    {intl.formatMessage(messages.accept)}
                </Button>
            ]
        };
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
            <Modal {...modalProps}>
                <Row justify="center" className="row-form">
                    <div className='col-form col-evaluation'>
                        <div className='div-form-title'>
                            <p className='font-24 text-center mb-2'>Separate Evaluation</p>
                        </div>
                        <Form
                            name="form_services_offered"
                            onFinish={this.onFinish}
                            onFinishFailed={this.onFinishFailed}
                            initialValues = {{
                                academicLevel: this.state.academicLevel

                            }}
                            ref={ref => this.form = ref}
                        >
                             <Form.Item
                                name="rate"
                                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesCreate.skillsets) }]}

                            >
                                 <Rate />
                            </Form.Item>
                           
                            <Form.Item
                                name="skillSet"
                                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesCreate.skillsets) }]}

                            >
                                <Select placeholder={intl.formatMessage(messagesCreate.skillsets)}>
                                    <Select.Option value='skill 1'>skill 1</Select.Option>
                                </Select>
                            </Form.Item>
                            <Row gutter={14}>
                                <Col xs={24} sm={24} md={12}>
                                    <Form.Item
                                        name="yearExp"
                                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesCreate.yearsExperience) }]}
                                    >
                                        <Input placeholder={intl.formatMessage(messagesCreate.yearsExperience)} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={12}>
                                    <Form.Item
                                        name="SSN"
                                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + 'SSN' }]}
                                    >
                                        <Input placeholder='SSN' suffix={<QuestionCircleOutlined className='text-primary icon-suffix' />} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item
                                name="serviceableSchool"
                                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesCreate.serviceableSchools) }]}
                            >
                                <Select
                                    mode="multiple"
                                    showArrow
                                    placeholder={intl.formatMessage(messagesCreate.school)}
                                    optionLabelProp="label"
                                >
                                    <Select.Option label='School 1' value='school 1'>School 1</Select.Option>
                                </Select>
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
                                                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesCreate.academicLevel) }]}
                                                            className='bottom-0'
                                                            style={{ marginTop: field.key === 0 ? 0 : 14 }}
                                                        >
                                                            <Select placeholder={intl.formatMessage(messagesCreate.academicLevel)}>
                                                                   <Select.Option value='level1'>level 1</Select.Option>

                                                            </Select>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={8} sm={8} md={8} className={field.key !== 0 && 'item-remove'}>
                                                        <Form.Item
                                                            name={[field.name, "rate"]}
                                                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesCreate.rate) }]}
                                                            className='bottom-0'
                                                            style={{ marginTop: field.key === 0 ? 0 : 14 }}
                                                        >
                                                            <Input placeholder={intl.formatMessage(messagesCreate.rate)}/>
                                                            {/* <Select placeholder={intl.formatMessage(messagesCreate.rate)}>
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
                                                {intl.formatMessage(messagesCreate.addLevel)}
                                            </Button>

                                            <div className='flex flex-row w-50'>
                                                <Switch size="small" checked={this.state.sameRateForAllLevel}/>
                                                <p className='ml-10 mb-0'>{intl.formatMessage(messagesCreate.sameRateLevels)}</p>
                                            </div>
                                        </div>
                                    </div>

                                )}

                            </Form.List>

                            <div className='text-center flex flex-row justify-between'>
                                <div className='flex flex-row items-center mb-10'>
                                    <Switch size="small"
                                        checked={this.state.isSeparateEvaluationRate}
                                    />
                                    <p className='ml-10 mb-0'>{intl.formatMessage(messagesCreate.separateEvaluation)}</p>
                                </div>
                                <Form.Item
                                    name="separateEvaluationRate"
                                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesCreate.rate) }]}
                                >
                                    <Input
                                        onChange={v => {
                                            // this.setState({isSeparateEvaluationRate:!this.state.isSeparateEvaluationRate})
                                        }}
                                        placeholder={intl.formatMessage(messagesCreate.rate)} className='bottom-left-0'  size="small" />
                                    {/* <Select placeholder={intl.formatMessage(messagesCreate.rate)}>
                                    <Select.Option value='rate1'>rate 1</Select.Option>
                                    <Select.Option value='rate2'>rate 2</Select.Option>
                                </Select> */}
                                </Form.Item>
                            </div>
                            <div className='text-center flex flex-row justify-between mb-10'>
                                <div className='flex flex-row items-center w-50'>
                                    <Switch size="small"
                                        checked={this.state.isHomeVisit}
                                    />
                                    <p className='ml-10 mb-0'>{intl.formatMessage(messagesCreate.homeVisits)}</p>
                                </div>
                                <div className='flex flex-row items-center w-50'>
                                    <Switch size="small"
                                        checked={this.state.privateOffice}
                                    />
                                    <p className='ml-10 mb-0'>{intl.formatMessage(messagesCreate.privateOffice)}</p>
                                </div>
                            </div>
                            <div className='flex flex-row items-center mb-10'>
                                <Switch size="small"
                                    checked={this.state.isReceiptsProvided}
                                />
                                <p className='ml-10 mb-0'>{intl.formatMessage(messagesCreate.receiptsRequest)}</p>
                            </div>
                            <div className='text-center flex flex-row justify-between'>
                                <div className='flex flex-row items-center mb-10'>
                                    <Switch size="small"
                                        checked={this.state.isNewClientScreening}
                                    />
                                    <p className='ml-10 mb-0'>{intl.formatMessage(messagesCreate.newClient)}</p>
                                </div>
                                <Form.Item
                                    size='small'
                                    name="screeningTime"
                                    className='select-small'
                                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesCreate.screeningTime) }]}
                                >
                                    <Select
                                        placeholder={intl.formatMessage(messagesCreate.screeningTime)}>
                                        <Select.Option value='time'>time</Select.Option>
                                    </Select>
                                </Form.Item>
                            </div>
                            <Form.Item
                                name="upload_w_9"
                                className='input-download'
                                rules={[{ required: true, message: intl.formatMessage(messagesCreate.uploadMess) }]}
                            >
                                <Input
                                    addonBefore='W-9 Form'
                                    suffix={
                                        <Upload {...props}>
                                            <a className='font-12 underline'>{intl.formatMessage(messages.upload)}</a>
                                        </Upload>
                                    }
                                    readOnly
                                />
                            </Form.Item>
                            <Form.Item
                                name="references"
                                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesCreate.references) }]}
                            >
                                <Input
                                    placeholder={intl.formatMessage(messagesCreate.references)} />
                            </Form.Item>
                            <Form.Item
                                name="publicProfile"
                                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesCreate.publicProfile) }]}
                            >
                                <Input.TextArea
                                    rows={4} placeholder={intl.formatMessage(messagesCreate.publicProfile)} />
                            </Form.Item>
                        </Form>
                    </div>
                </Row>
            </Modal>
        );
    }
};
export default ModalSeparateEvaluation;