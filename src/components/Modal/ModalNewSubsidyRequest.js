import React from 'react';
import { Row, Col, Form, Button, Input, Select, Switch, Divider, Upload, message, Modal } from 'antd';
import { BiChevronLeft } from 'react-icons/bi';
import intl from 'react-intl-universal';
import messages from './messages';
import messagesCreateAccount from '../../routes/Sign/CreateAccount/messages';
import messagesLogin from '../../routes/Sign/Login/messages';
import messagesRequest from '../../routes/Sign/SubsidyRequest/messages';
import './style/index.less';
import request,{generateSearchStructure} from '../../utils/api/request'
class ModalNewSubsidyRequest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fileList: [],
            uploading: false,
            SkillSet:[],
            listSchools:[],
        }
    }

    componentDidMount = () =>{
        this.props.setOpennedEvent(this.loadData)
    }

    loadData = () =>{
        console.log('new subsidy loaded data' , this.props.listDependents)
        this.loadSchools();
        this.loadDataFromServer();
    }

    loadDataFromServer(){
        request.post( 'clients/get_default_value_for_client'
            ).then(result=>{
                console.log('get_default_value_for_client',result.data);
                if(result.data.success){
                    var data = result.data.data;
                    this.setState({SkillSet:data.SkillSet})
                }else{
                    
                    
                }
                
            }).catch(err=>{
                console.log(err);
                
            })
      }

    loadSchools() {
        request.post( 'clients/get_all_schools'
        ).then(result => {
            console.log('get_default_value_for_client', result.data);
            if (result.data.success) {
                var data = result.data.data;
                this.setState({ listSchools: data })
            } else {
                
    
            }
    
        }).catch(err => {
            console.log(err);
        })
    }

    onFinish = (values) => {
        console.log('Success:', values);
    };

    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    componentDidMount() {
        // let data = localStorage.getItem('subsidyRequest');
        // if (data) {
        //     data = JSON.parse(data);
        //     this.form.setFieldsValue({
        //         ...data
        //     })
        // }
    }

    onChangeUpload = (info) => {
        if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList);
            this.setState(prevState => ({
                fileList: [...prevState.fileList, info.file],
            }));
            this.form?.setFieldsValue({
                documents: info.fileList[0].name
            })
        }
        if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    }
    render() {

        const modalProps = {
            className: 'modal-new-subsidy',
            title: intl.formatMessage(messagesCreateAccount.subsidyRequest),
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
                    {intl.formatMessage(messages.create)}
                </Button>
            ]
        };
        const props = {
            name: 'file',
            action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
            headers: {
                authorization: 'authorization-text',
            },
            onChange: this.onChangeUpload,
            // maxCount: 1,
            // showUploadList: false 
        };
        return (
            <Modal {...modalProps}>
                <Row justify="center" className="row-form">
                    <div className='col-form col-subsidy mt-0'>
                        <Form
                            name="form_subsidy_request"
                            initialValues={{ remember: true }}
                            onFinish={this.onFinish}
                            onFinishFailed={this.onFinishFailed}
                            ref={ref => this.form = ref}
                        >
                            <Form.Item name="student"
                                rules=
                                {[{
                                    required: true,
                                    message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesRequest.dependent)
                                }]}
                            >
                                <Select placeholder={intl.formatMessage(messagesCreateAccount.dependent)}>
                                    {this.props.listDenpendent!=undefined&& this.props.listDependents.length>0 &&this.props.listDependents.map((item, index) => {
                                        return (
                                            <Select.Option key={index} value={item._id}>{item.firstName} {item.lastName}</Select.Option>
                                        )
                                    })}
                                </Select>
                            </Form.Item>
                            <Form.Item name="skillSet" rules=
                                {[{
                                    required: true,
                                    message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesRequest.skillsetRequested)
                                }]}>
                                <Select placeholder={intl.formatMessage(messagesRequest.skillsetRequested)}>
                                    {this.state.SkillSet.map((skill, index)=>  <Select.Option value={index}>{skill}</Select.Option>)}
                                </Select>
                            </Form.Item>
                            <Form.Item name="school" rules=
                                {[{
                                    required: true,
                                    message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesRequest.school)
                                }]}>
                                <Select placeholder={intl.formatMessage(messagesCreateAccount.school)}>
                                    <Select.Option value='s1'>School 1</Select.Option>
                                    <Select.Option value='s2'>School 2</Select.Option>
                                </Select>
                            </Form.Item>
                            <Row gutter={14}>
                                <Col xs={24} sm={24} md={12}>
                                    <div className='flex flex-row items-center pb-10'>
                                        <Switch size="small" defaultChecked />
                                        <p className='font-10 ml-10 mb-0'>{intl.formatMessage(messagesRequest.requestRav)}</p>
                                    </div>
                                </Col>
                                <Col xs={24} sm={24} md={12}>
                                    <Form.Item
                                        name="ravPhone"
                                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesRequest.ravPhone) },
                                        {
                                            pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$',
                                            message: intl.formatMessage(messagesRequest.phoneNumberValid)
                                        },
                                        ]}
                                    >
                                        <Input size="small" placeholder={intl.formatMessage(messagesRequest.ravPhone) + ' #'} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={14}>
                                <Col xs={24} sm={24} md={12}>
                                    <Form.Item
                                        name="ravName"
                                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesRequest.nameOfRav) }]}
                                    >
                                        <Input size="small" placeholder={intl.formatMessage(messagesRequest.nameOfRav)} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={12}>
                                    <Form.Item
                                        name="ravEmail"
                                        rules={[
                                            { required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesRequest.ravEmail) },
                                            {
                                                type: 'email',
                                                message: intl.formatMessage(messagesRequest.emailNotValid)
                                            }

                                        ]}
                                    >
                                        <Input size="small" placeholder={intl.formatMessage(messagesRequest.ravEmail)} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="requestContactRav"
                                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesRequest.requestContactRav) }]}
                            >
                                <Input placeholder={intl.formatMessage(messagesRequest.requestContactRav)} />
                            </Form.Item>
                            <Row gutter={14}>
                                <Col xs={24} sm={24} md={12}>
                                    <Form.Item
                                        name="therapistPhone"
                                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesRequest.therapistPhone) },
                                        {
                                            pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$',
                                            message: intl.formatMessage(messagesRequest.phoneNumberValid)
                                        },
                                        ]}
                                    >
                                        <Input size="small" placeholder={intl.formatMessage(messagesRequest.therapistPhone)} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={12}>
                                    <Form.Item
                                        name="therapistEmail"
                                        rules={[
                                            { required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesRequest.therapistEmail) },
                                            {
                                                type: 'email',
                                                message: intl.formatMessage(messagesRequest.emailNotValid)
                                            }
                                        ]}
                                    >
                                        <Input size="small" placeholder={intl.formatMessage(messagesRequest.therapistEmail)} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Divider style={{ marginTop: 0, marginBottom: 15, borderColor: '#d7d7d7' }} />
                            <Form.Item
                                name="note"
                                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesRequest.generalNotes) }]}
                            >
                                <Input.TextArea rows={5} placeholder={intl.formatMessage(messagesRequest.generalNotes)} />
                            </Form.Item>
                            <Form.Item name="documents" className='input-download'
                                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesRequest.upload) }]}
                            >
                                <div className='input-download flex flex-row justify-between'>
                                    <div className='div-document'>
                                        <p>Document</p>
                                    </div>
                                    <div className='div-upload flex-1'>
                                        <Upload {...props}>
                                            <a className='font-12 underline'>{intl.formatMessage(messagesRequest.upload)}</a>
                                        </Upload>
                                    </div>
                                </div>
                            </Form.Item>
                        </Form>
                    </div>
                </Row>
            </Modal>
        );
    }
};
export default ModalNewSubsidyRequest;