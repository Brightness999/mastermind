import React from 'react';
import { Row, Form, Button, Input } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../../Sign/Login/messages';
import { connect } from 'react-redux';
import { compose } from 'redux';

class ChangePassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }


  componentDidMount() {
  }

  onFinish = (values) => {
    console.log('Success:', values);
  };

  onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  render() {

    return (
      <Row justify="center" className="row-form">
        <div className='col-form col-admin'>
          <div className='div-form-title mb-10'>
            <p className='font-30 text-center mb-0'>{intl.formatMessage(messages.titleChangePassword)}</p>
          </div>
          <Form
            name="form_admin"
            onFinish={this.onFinish}
            onFinishFailed={this.onFinishFailed}
            ref={ref => this.form = ref}
          >
            <Form.Item name="password" rules={[{ required: true, message: intl.formatMessage(messages.passwordMessage) }]} >
                  <Input.Password placeholder={intl.formatMessage(messages.password)} />
            </Form.Item>

            <Form.Item name="new_password" rules={[{ required: true, message: intl.formatMessage(messages.passwordMessage) }]} >
                  <Input.Password placeholder={intl.formatMessage(messages.passwordOld)} />
            </Form.Item>

            <Form.Item name="confirm_password" rules={[{ required: true, message: intl.formatMessage(messages.passwordMessage) }]} >
                  <Input.Password placeholder={intl.formatMessage(messages.passwordConfirm)} />
            </Form.Item>

            <Form.Item className="form-btn continue-btn" >
              <Button
                block
                type="primary"
                htmlType="submit"
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
const mapStateToProps = state => {
    return ({
        auth: state.auth
    })
}

export default compose(connect(mapStateToProps))(ChangePassword);
