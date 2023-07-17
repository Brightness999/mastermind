import React from 'react';
import { Modal, Button, Form, Select } from 'antd';

import './style/index.less';

class ModalSelectSubsidy extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { subsidies } = this.props;
    const modalProps = {
      className: 'modal-select-subsidy',
      title: "Subsidy",
      open: this.props.visible,
      onOk: this.props.onSubmit,
      onCancel: this.props.onCancel,
      footer: null,
      width: 450,
    };

    return (
      <Modal {...modalProps}>
        <p>Is this consultation in reference to one of these open subsidy cases?</p>
        <Form onFinish={this.props.onSubmit}>
          <Form.Item
            name="subsidy"
            label="Subsidy"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select a subsidy">
              {subsidies?.map((s, index) => (
                <Select.Option key={index} value={s._id}>{s?.student?.firstName ?? ''} {s?.student?.lastName ?? ''}({s?.skillSet?.name ?? ''})</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <div className='flex gap-2 btn-footer mt-2'>
            <Button block onClick={() => this.props.onSubmit()}>NO</Button>
            <Button type='primary' block htmlType='submit'>YES</Button>
          </div>
        </Form>
      </Modal>
    );
  }
};

export default ModalSelectSubsidy;