import React, { Component } from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { Modal, Button } from 'antd';
import cx from 'classnames';
import Form from '../Form';
import './style/index.less';
import messages from './messages';

class ModalForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: this.props.visible
    };
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if ('visible' in nextProps) {
      this.setState({
        visible: nextProps.visible
      });
    }
  }

  closeModal = () => {
    if (this.props.onCancel) {
      this.props.onCancel();
      return;
    }
    this.setState({
      visible: false
    });
  };

  onSubmit = () => {
    const { record, onSubmit } = this.props;
    this.form.validateFields((error, value) => {
      if (error) {
        // console.log(error);
        return;
      }
      onSubmit && onSubmit(value, record);
    });
  };

  render() {
    const {
      title,
      record,
      className,
      columns,
      onCancel,
      onSubmit,
      modalOpts,
      formOpts,
      loading,
      full,
      preview,
    } = this.props;

    const classname = cx(className, 'antui-modalform', { 'full-modal': full });
    const modalProps = {
      className: classname,
      visible: this.state.visible,
      style: { top: 20 },
      title: title || (record ?  intl.formatMessage(messages.edit) :  intl.formatMessage(messages.new)),
      // maskClosable: true,
      destroyOnClose: true,
      onCancel: this.closeModal,
      footer: [
        onCancel && (
          <Button key="back" onClick={this.closeModal}>
            {intl.formatMessage(messages.cancel)}
          </Button>
        ),
        onSubmit && (
          <Button key="submit" type="primary" onClick={this.onSubmit} loading={loading}>
            {intl.formatMessage(messages.determine)}
          </Button>
        )
      ],
      ...modalOpts
    };

    const formProps = {
      ref: node => { this.form = node },
      columns,
      onSubmit,
      record,
      preview,
      footer: false,
      formItemLayout: {
        labelCol: { span: 4 },
        wrapperCol: { span: 17 }
      },
      ...formOpts
    };

    return (
      <Modal {...modalProps}>
        <Form {...formProps} />
      </Modal>
    );
  }
}

ModalForm.propTypes = {
  title: PropTypes.string,
  record: PropTypes.object,
  visible: PropTypes.bool,
  loading: PropTypes.bool,
  full: PropTypes.bool,
  preview: PropTypes.bool,
  columns: PropTypes.array,
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  modalOpts: PropTypes.object,
  formOpts: PropTypes.object,
  className: PropTypes.string
};

export default ModalForm;
