import React from 'react';
import { Row, Form, Button, Input } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';

export default class extends React.Component {

  onFinish = (values) => {
    console.log('Success:', values);
    window.location.href = "/login";
  };

  onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  render() {

    return (
      <Row justify="center" className="row-form">
        <div className='col-form col-admin'>
          <div className='div-form-title mb-10'>
            <p className='font-30 text-center mb-0'>{intl.formatMessage(messages.adminDetails)}</p>
          </div>
          <Form
            name="form_admin"
            onFinish={this.onFinish}
            onFinishFailed={this.onFinishFailed}
          >
            <Form.Item
              name="name"
              rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.name) }]}
            >
              <Input placeholder={intl.formatMessage(messages.name)} />
            </Form.Item>
            <Form.Item
              name="phone"
              rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.phoneNumber) }]}
            >
              <Input placeholder={intl.formatMessage(messages.phoneNumber)} />
            </Form.Item>
            <Form.Item
              name="email"
              rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.email) }]}
            >
              <Input placeholder={intl.formatMessage(messages.email)} />
            </Form.Item>
            <Form.List name="contact">
              {(fields, { add, remove }) => (
                <div>
                  {fields.map((field) => {
                    return (
                      <div key={field.key} className='item-remove'>
                        <Form.Item
                          key={field.key}
                          name={[field.name, "contact_email"]}
                          rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.contactEmail) }]}
                        >
                          <Input placeholder={intl.formatMessage(messages.contactEmail)} />
                        </Form.Item>
                        <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />
                      </div>
                    );
                  }
                  )}
                  <div className='text-center'>
                    <Button
                      type="text"
                      className='add-number-btn mb-10'
                      icon={<BsPlusCircle size={17} className='mr-5' />}
                      onClick={() => add(null)}
                    >
                      {intl.formatMessage(messages.addContact)}
                    </Button>
                  </div>
                </div>

              )}

            </Form.List>

            <Form.Item className="form-btn continue-btn" >
              <Button
                block
                type="primary"
                htmlType="submit"
                onClick={() => window.location.href = "/login"}
              >
                {intl.formatMessage(messages.confirm).toUpperCase()}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Row>
    );
  }
}
