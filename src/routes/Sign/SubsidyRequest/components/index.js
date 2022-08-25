import React from 'react';
import { Row, Col, Form, Button, Input, Select, Switch, Divider } from 'antd';
import { BiChevronLeft } from 'react-icons/bi';
import { Link } from 'dva/router';
import { routerLinks } from '../../../constant';
import intl from 'react-intl-universal';
import messages from '../messages';
import messagesCreateAccount from '../../CreateAccount/messages';
import messagesLogin from '../../Login/messages';
import './index.less';


export default class extends React.Component {

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
      localStorage.setItem('subsidyRequest', JSON.stringify(values));
      this.props.history.push(routerLinks['SubsidyReview']);
    } catch (error) {
      console.log('error', error);
    }
  }

  render() {
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
                  <Select.Option value='d1'>Dependent 1</Select.Option>
                  <Select.Option value='d2'>Dependent 2</Select.Option>
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
                    name="rav_phone"
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
                name="therapistContact"
                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.therapistContact) }]}
              >
                <Input placeholder={intl.formatMessage(messages.therapistContact)} />
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
              <Form.Item name="documents" className='input-download'>
                <Input addonBefore={intl.formatMessage(messages.documents)} suffix={<Upload {...props}>
                                        <a className='font-12 underline'>{intl.formatMessage(messagesRequest.upload)}</a>
                                    </Upload>} />
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
