import React from 'react';
import { Modal, Button, Form, Select } from 'antd';
import intl from 'react-intl-universal';

import messages from './messages';
import msgCreateAccount from 'routes/Sign/CreateAccount/messages';
import './style/index.less';

class ModalSelectProvider extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { providers } = this.props;
    const modalProps = {
      className: 'modal-select-provider',
      title: "Appeal",
      open: this.props.visible,
      onOk: this.props.onSubmit,
      closable: false,
      footer: null,
      width: 450,
    };

    return (
      <Modal {...modalProps}>
        <p>Please select a provider.</p>
        <Form onFinish={this.props.onSubmit}>
          <Form.Item
            name="provider"
            label="Provider"
            rules={[{ required: true }]}
          >
            <Select>
              {providers?.map((p) => (
                <Select.Option key={p.provider?._id} value={p.provider?._id}>{`${p.provider?.firstName} ${p.provider?.lastName}`}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <div className='flex gap-2 btn-footer mt-2'>
            <Button block onClick={() => this.props.onCancel()}>{intl.formatMessage(messages.goBack)}</Button>
            <Button type='primary' block htmlType='submit'>{intl.formatMessage(msgCreateAccount.confirm)}</Button>
          </div>
        </Form>
      </Modal>
    );
  }
};

export default ModalSelectProvider;