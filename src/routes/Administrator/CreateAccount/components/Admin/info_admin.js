import React from 'react';
import { Row, Form, Button, Input, Select, message } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';
import messages from '../../messages';
import messagesLogin from '../../../../Sign/Login/messages';
import request from '../../../../../utils/api/request';
import { getCityConnections, userSignUp } from '../../../../../utils/api/apiList';
import { removeRegisterData } from '../../../../../redux/features/registerSlice';

class AdminInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cityConnections: [],
    };
  }

  componentDidMount() {
    const { user } = this.props;

    request.post(getCityConnections, { id: user?._id, role: user?.role }).then(result => {
      const { success, data } = result;

      if (success) {
        this.setState({ cityConnections: data });
      }
    }).catch(err => {
      message.error(err.message);
      this.setState({ cityConnections: [] });
    })
  }

  onFinish = (values) => {
    const { registerData } = this.props.register;
    request.post(userSignUp, { ...values, email: registerData.email, password: registerData.password, username: registerData.username, role: registerData.role }).then(result => {
      if (result.success) {
        message.success("Successfully created!");
        this.props.removeRegisterData();
        this.props.onContinue(true);
      }
    }).catch(err => {
      console.log('create admin user error---', err);
      message.error(err.message);
    })
  };

  onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  render() {
    const { cityConnections } = this.state;

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
            layout="vertical"
            ref={ref => this.form = ref}
          >
            <Form.Item
              name="fullName"
              label={intl.formatMessage(messages.name)}
              rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.name) }]}
            >
              <Input placeholder={intl.formatMessage(messages.name)} />
            </Form.Item>
            <Form.Item
              name="phoneNumber"
              label={intl.formatMessage(messages.phoneNumber)}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.phoneNumber),
                },
                {
                  pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$',
                  message: intl.formatMessage(messages.phoneNumberValid),
                },
              ]}
            >
              <Input placeholder={intl.formatMessage(messages.phoneNumber)} />
            </Form.Item>
            <Form.Item
              name="adminCommunity"
              label={intl.formatMessage(messages.cityConnections)}
              rules={[{ required: true }]}
            >
              <Select
                placeholder={intl.formatMessage(messages.cityConnections)}
                showSearch
                optionFilterProp="children"
                mode="multiple"
                filterOption={(input, option) => option.children?.toLowerCase().includes(input.toLowerCase())}
              >
                {cityConnections?.map((value, index) => (
                  <Select.Option key={index} value={value._id}>{value.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="adminEmail"
              label={intl.formatMessage(messages.contactEmail)}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage(messages.emailMessage)
                },
                {
                  type: 'email',
                  message: intl.formatMessage(messagesLogin.emailNotValid)
                }
              ]}
            >
              <Input placeholder={intl.formatMessage(messages.contactEmail)} />
            </Form.Item>
            <Form.Item className="form-btn continue-btn" >
              <Button
                block
                type="primary"
                htmlType="submit"
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


const mapStateToProps = state => ({ register: state.register, user: state.auth.user });

export default compose(connect(mapStateToProps))(AdminInfo);
