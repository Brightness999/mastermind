import React from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Row, Form, Button, Input, message } from 'antd';
import { routerLinks } from "../../../constant";
import intl from 'react-intl-universal';
import messages from '../messages';
import { url } from '../../../../utils/api/baseUrl';
import { listRoleWithRouter } from '../../../../utils/auth/listRoleWithRouter';
import { checkPermission } from '../../../../utils/auth/checkPermission';
import axios from 'axios';
import './index.less';

// @connect(({ login, loading, global }) => ({
//   global,
//   login,
//   loading: loading.models.login
// }))

export default class extends React.Component {

  componentDidMount() {
    // const path = checkPermission();
    // if (path) {
    //   this.props.history.push(path);
    // }
  }

  onSubmit = async () => {
    try {
      const values = await this.form.validateFields();
      const response = await axios.post(url + 'users/login', values);
      console.log(response);
      const { success, data } = response.data;
      if (success) {
        console.log('token',  this.props.history , this.props.test1);
        this.props.history.push(routerLinks.Dashboard);
        
      }
    } catch (error) {
      console.log(error);
      message.error(error?.response?.data?.data ?? error.message);
    }
  }

  render() {
    const onFinish = (values) => {
      console.log('Success:', values);
    };
    const onFinishFailed = (errorInfo) => {
      console.log('Failed:', errorInfo);
    };
    return (
      <div className="full-layout page login-page">
        <Row justify="center" className="row-form row-login">
          <div className='col-form col-login'>
            <div className='div-form-title'>
              <p className='font-24'>{intl.formatMessage(messages.login)}</p>
            </div>
            <div>
              <Form
                name="login"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                ref={ref => this.form = ref}
              >
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: intl.formatMessage(messages.usernameMessage) }]}
                >
                  <Input placeholder={intl.formatMessage(messages.emailOrUsername)} />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[{ required: true, message: intl.formatMessage(messages.passwordMessage) }]}
                >
                  <Input.Password placeholder={intl.formatMessage(messages.password)} />
                </Form.Item>


                <Form.Item >
                  <Button
                    block
                    type="primary"
                    htmlType="submit"
                    className="form-btn"
                    onClick={this.onSubmit}
                  >
                    {intl.formatMessage(messages.login).toUpperCase()}
                  </Button>
                </Form.Item>
              </Form>
            </div>


            <div className="div-new-user">
              <Link to={routerLinks['CreateAccount']}>{intl.formatMessage(messages.createAccount)}</Link>
              <Link to={routerLinks['ForgotPass']}>{intl.formatMessage(messages.forgotPass)}</Link>
            </div>
          </div>
        </Row>
      </div>
    );
  }
}