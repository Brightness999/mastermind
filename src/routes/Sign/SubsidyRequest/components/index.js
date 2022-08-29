import React from 'react';
import { Row, Col, Form, Button, Input, Select, Switch, Divider, Upload, message } from 'antd';
import { BiChevronLeft } from 'react-icons/bi';
import { Link } from 'dva/router';
import { routerLinks } from '../../../constant';
import intl from 'react-intl-universal';
import messages from '../messages';
import messagesCreateAccount from '../../CreateAccount/messages';
import messagesLogin from '../../Login/messages';
import messagesRequest from '../messages'
import './index.less';


export default class extends React.Component {


  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
      uploading: false,
      listDenpendent: localStorage.getItem('inforChildren') ? JSON.parse(localStorage.getItem('inforChildren')) : [],
    }
  }


  onFinish = (values) => {
    console.log('Success:', values);
  };

  onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  componentDidMount() {

    let data = localStorage.getItem('subsidyRequest');
    if (data) {
      data = JSON.parse(data);
      this.form.setFieldsValue({
        ...data
      })
    }
  }

  onSubmit = async () => {
    try {
      const values = await this.form.validateFields();
      values.documents = this.state.fileList.map(file => {
        return file.name
      });
      localStorage.setItem('subsidyRequest', JSON.stringify(values));
      this.props.history.push(routerLinks['SubsidyReview']);
    } catch (error) {
      console.log('error', error);
    }
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
      <div className="full-layout page subsidyrequest-page">
        <Row justify="center" className="row-form">
          <div className='col-form col-subsidy'>
            <div className='div-form-title mb-10'>
              <Button
                type="text"
                className='back-btn'
                onClick={() => window.history.back()}
              >
                <BiChevronLeft size={25} />{intl.formatMessage(messagesCreateAccount.back)}
              </Button>
              <p className='font-24 text-center mb-0'>{intl.formatMessage(messagesCreateAccount.subsidyRequest)}</p>
            </div>
            <Form
              name="form_subsidy_request"
              initialValues={{ remember: true }}
              onFinish={this.onFinish}
              onFinishFailed={this.onFinishFailed}
              ref={ref => this.form = ref}
            >
              <Form.Item name="dependent"
                rules=
                {[{
                  required: true,
                  message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.dependent)
                }]}
              >
                <Select placeholder={intl.formatMessage(messagesCreateAccount.dependent)}>
                  {this.state.listDenpendent.map((item, index) => {
                    return (
                      <Select.Option key={index} value={++index}>Dependent {index}</Select.Option>
                    )
                  })}
                </Select>
              </Form.Item>
              <Form.Item name="skillSet" rules=
                {[{
                  required: true,
                  message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.skillsetRequested)
                }]}>
                <Select placeholder={intl.formatMessage(messages.skillsetRequested)}>
                  <Select.Option value='1'>Skill 1</Select.Option>
                  <Select.Option value='2'>Skill 2</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="school" rules=
                {[{
                  required: true,
                  message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.school)
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
                    <p className='font-10 ml-10 mb-0'>{intl.formatMessage(messages.requestRav)}</p>
                  </div>
                </Col>
                <Col xs={24} sm={24} md={12}>
                  <Form.Item
                    name="ravPhone"
                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.ravPhone) },
                    {
                      pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$',
                      message: intl.formatMessage(messages.phoneNumberValid)
                    },
                    ]}
                  >
                    <Input size="small" placeholder={intl.formatMessage(messages.ravPhone) + ' #'} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={14}>
                <Col xs={24} sm={24} md={12}>
                  <Form.Item
                    name="ravName"
                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.nameOfRav) }]}
                  >
                    <Input size="small" placeholder={intl.formatMessage(messages.nameOfRav)} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={12}>
                  <Form.Item
                    name="ravEmail"
                    rules={[
                      { required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.ravEmail) },
                      {
                        type: 'email',
                        message: intl.formatMessage(messages.emailNotValid)
                      }

                    ]}
                  >
                    <Input size="small" placeholder={intl.formatMessage(messages.ravEmail)} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="requestContactRav"
                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.requestContactRav) }]}
              >
                <Input placeholder={intl.formatMessage(messages.requestContactRav)} />
              </Form.Item>
              <Row gutter={14}>
                <Col xs={24} sm={24} md={12}>
                  <Form.Item
                    name="therapistPhone"
                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.therapistPhone) },
                    {
                      pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$',
                      message: intl.formatMessage(messages.phoneNumberValid)
                    },
                    ]}
                  >
                    <Input size="small" placeholder={intl.formatMessage(messages.therapistPhone)} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={12}>
                  <Form.Item
                    name="therapistEmail"
                    rules={[
                      { required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.therapistEmail) },
                      {
                        type: 'email',
                        message: intl.formatMessage(messages.emailNotValid)
                      }
                    ]}
                  >
                    <Input size="small" placeholder={intl.formatMessage(messages.therapistEmail)} />
                  </Form.Item>
                </Col>
              </Row>
              <Divider style={{ marginTop: 0, marginBottom: 15, borderColor: '#d7d7d7' }} />
              <Form.Item
                name="note"
                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.generalNotes) }]}
              >
                <Input.TextArea rows={5} placeholder={intl.formatMessage(messages.generalNotes)} />
              </Form.Item>
              {/* <Form.Item name="documents" className='input-download'
                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesRequest.upload) }]}
              >
                <Input autoSize={{ minRows: 1 }} addonBefore={intl.formatMessage(messages.documents)} suffix={
                  <Upload {...props}>
                    <a className='font-12 underline'>{intl.formatMessage(messagesRequest.upload)}</a>
                  </Upload>} />
              </Form.Item> */}
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
              <Form.Item className="form-btn continue-btn" >
                {/* <Link to={routerLinks['SubsidyReview']}> */}
                <Button
                  block
                  type="primary"
                  htmlType="submit"
                  // onClick={this.props.onContinueParent}
                  onClick={this.onSubmit}
                >
                  {intl.formatMessage(messages.review).toUpperCase()}
                </Button>
                {/* </Link> */}
              </Form.Item>
            </Form>
          </div>
        </Row>
      </div>
    );
  }
}
