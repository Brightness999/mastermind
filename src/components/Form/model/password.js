import React, { Component } from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { Input, Form, Col, Popover, Progress } from 'antd';
import messages from '../messages';
/**
 * Password control
 */

const passwordProgressMap = {
  ok: 'success',
  pass: 'normal',
  poor: 'exception'
};

class PasswordForm extends Component {

  constructor(props) {
    super(props);

    this.state = {
      confirmDirty: false,
      visible: false,
    };
  }

  handleConfirmBlur = e => {
    const {value} = e.target;
    const { confirmDirty } = this.state;
    this.setState({ confirmDirty: confirmDirty || !!value });
  };

  checkConfirm = (rule, value, callback) => {
    const { visible } = this.state;
    const {form} = this.props;
    if (value) {
      if (!visible) {
        this.setState({
          visible: !!value
        });
      }
    } else {
      this.setState({
        visible: !!value
      });
    }
    if (value && this.state.confirmDirty) {
      form.validateFields([`${this.props.name  }_repeat`], { force: true });
    }
    callback();
  };

  checkPassword = (rule, value, callback) => {
    const {form} = this.props;
    if (value && value !== form.getFieldValue(this.props.name)) {
      callback(intl.formatMessage(messages.twoPasswords));
    } else {
      callback();
    }
  };

  getPasswordStatus = () => {
    const { form } = this.props;
    const value = form.getFieldValue('password');
    if (value && value.length > 9) {
      return 'ok';
    }
    if (value && value.length > 5) {
      return 'pass';
    }
    return 'poor';
  };

  renderPasswordProgress = () => {
    const { form } = this.props;
    const value = form.getFieldValue('password');
    const passwordStatus = this.getPasswordStatus();
    return value && value.length ? (
      <Progress
        status={passwordProgressMap[passwordStatus]}
        className={`progress-${passwordStatus}`}
        strokeWidth={6}
        percent={value.length * 10 > 100 ? 100 : value.length * 10}
        showInfo={false}
      />
    ) : null;
  };

  render() {
    const {
      form,
      name,
      initialValue,
      formFieldOptions = {},
      rules,
      placeholder,
      type,
      formItemLayout,
      col,
      repeat,
      // getPopupContainer,
      ...otherProps
    } = this.props;

    const { visible } = this.state;

    const { getFieldDecorator } = form;

    // If there are rules
    formFieldOptions.rules = [
      {
        required: true,
        message: `${intl.formatMessage(messages.plesaeEnter)} ${otherProps.title}.`
      },
      {
        min: 6,
        message: intl.formatMessage(messages.passwordMin)
      },
      {
        validator: this.checkConfirm
      }
    ];

    // If there are rules
    if (rules && rules.length) {
      formFieldOptions.rules = formFieldOptions.rules.concat(rules);
    }

    formFieldOptions.initialValue = initialValue;

    const ComponentCol = type === 'inline' ? 'div' : Col;
    const passwordStatusMap = {
      ok: <div style={{ color: '#52c41a', }}>{intl.formatMessage(messages.strong)}</div>,
      pass: <div style={{ color: '#faad14', }}>{intl.formatMessage(messages.medium)}</div>,
      poor: <div style={{ color: '#f5222d', }}>{intl.formatMessage(messages.short)}</div>
    };

    return (
      <div className="col-item col-item-password-wrap">
        <ComponentCol className="col-item col-item-password" {...col}>
          <Form.Item
            {...formItemLayout}
            label={otherProps.title}
            hasFeedback
            className="col-item-content"
          >
            <Popover
              content={
                <div style={{ padding: '4px 0', }}>
                  {passwordStatusMap[this.getPasswordStatus()]}
                  {this.renderPasswordProgress()}
                  <div style={{ marginTop: 10, }}>
                    {intl.formatMessage(messages.popoverPassword)}
                  </div>
                </div>
              }
              overlayStyle={{ width: 240 }}
              placement="right"
              visible={visible}
            >
              {getFieldDecorator(name, formFieldOptions)(
                <Input
                  type="password"
                  placeholder={placeholder || `Please enter ${otherProps.title}`}
                />
              )}
            </Popover>
          </Form.Item>
        </ComponentCol>
        {repeat ? (
          <ComponentCol className="col-item col-item-repeat-password" {...col}>
            <Form.Item
              {...formItemLayout}
              label={`Confirm ${  otherProps.title}`}
              hasFeedback
              className="col-item-content"
            >
              {getFieldDecorator(`${name  }_repeat`, {
                rules: [
                  {
                    required: true,
                    message: `Please enter again ${otherProps.title}`
                  },
                  {
                    validator: this.checkPassword
                  }
                ]
              })(
                <Input
                  type="password"
                  onBlur={this.handleConfirmBlur}
                  placeholder={intl.formatMessage(messages.twoInput)}
                />
              )}
            </Form.Item>
          </ComponentCol>
        ) : null}
      </div>
    );
  }
}

PasswordForm.propTypes = {
  form: PropTypes.object,
  name: PropTypes.string,
  initialValue: PropTypes.string,
  formFieldOptions: PropTypes.object,
  rules: PropTypes.array,
  placeholder: PropTypes.string,
  ComponentCol: PropTypes.node,
  ComponentItem: PropTypes.node,
  formItemLayout: PropTypes.object,
  col: PropTypes.object,
  repeat: PropTypes.bool,
  type: PropTypes.string,
};

export default PasswordForm;
