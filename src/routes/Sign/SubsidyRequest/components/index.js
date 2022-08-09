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
              <BiChevronLeft size={25}/>{intl.formatMessage(messagesCreateAccount.back)}
            </Button>
            <p className='font-24 text-center mb-0'>{intl.formatMessage(messagesCreateAccount.subsidyRequest)}</p>
          </div>
          <Form 
              name="form_subsidy_request"
              initialValues={{ remember: true }}
              onFinish={this.onFinish}
              onFinishFailed={this.onFinishFailed}
          >
              <Form.Item name="dependent">
                  <Select placeholder={intl.formatMessage(messagesCreateAccount.dependent)}>
                      <Select.Option value='d1'>Dependent 1</Select.Option>
                      <Select.Option value='d2'>Dependent 2</Select.Option>
                  </Select>
              </Form.Item>
              <Form.Item name="skill_request">
                  <Select placeholder={intl.formatMessage(messages.skillsetRequested)}>
                      <Select.Option value='s1'>Skill 1</Select.Option>
                      <Select.Option value='s2'>Skill 2</Select.Option>
                  </Select>
              </Form.Item>
              <Form.Item name="school">
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
                    name="rav_email"
                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.ravPhone) }]}
                  >
                    <Input size="small" placeholder={intl.formatMessage(messages.ravPhone) + ' #'}/>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={14}>
                <Col xs={24} sm={24} md={12}>
                  <Form.Item
                    name="name_Rav"
                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.nameOfRav) }]}
                  >
                    <Input size="small" placeholder={intl.formatMessage(messages.nameOfRav)}/>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={12}>
                  <Form.Item
                    name="rav_email"
                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.ravEmail) }]}
                  >
                    <Input size="small" placeholder={intl.formatMessage(messages.ravEmail)}/>
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                  name="therapist_contact"
                  rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.therapistContact) }]}
              >
                  <Input placeholder={intl.formatMessage(messages.therapistContact)}/>
              </Form.Item>
              <Row gutter={14}>
                <Col xs={24} sm={24} md={12}>
                  <Form.Item
                    name="therapist_phone"
                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.therapistPhone) }]}
                  >
                    <Input size="small" placeholder={intl.formatMessage(messages.therapistPhone)}/>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={12}>
                  <Form.Item
                    name="therapist_email"
                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.therapistEmail) }]}
                  >
                    <Input size="small" placeholder={intl.formatMessage(messages.therapistEmail)}/>
                  </Form.Item>
                </Col>
              </Row>
              <Divider style={{marginTop: 0, marginBottom: 15, borderColor: '#d7d7d7'}}/>
              <Form.Item
                name="generate_notes"
                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.generalNotes) }]}
              >
                <Input.TextArea rows={5} placeholder={intl.formatMessage(messages.generalNotes)}/>
              </Form.Item>
              <Form.Item name="upload_document" className='input-download'>
                <Input addonBefore={intl.formatMessage(messages.documents)} suffix={<a className='font-12 underline'>{intl.formatMessage(messages.upload)}</a>} />
              </Form.Item>
              <Form.Item className="form-btn continue-btn" >
                <Link to={routerLinks['SubsidyReview']}>
                  <Button
                      block
                      type="primary"                                      
                      htmlType="submit"
                      // onClick={this.props.onContinueParent}
                  >
                      {intl.formatMessage(messages.review).toUpperCase()}
                  </Button>
                </Link>
              </Form.Item>
          </Form>
          </div>
        </Row>
      </div>
    );
  }
}
