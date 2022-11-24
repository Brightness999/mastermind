import React from 'react';
import { Modal, Button } from 'antd';
import './style/index.less';

class ModalProcessAppointment extends React.Component {
  render() {
    const modalProps = {
      className: 'modal-cancel',
      title: "Next Process",
      open: this.props.visible,
      onOk: this.props.onSubmit,
      onCancel: this.props.onCancel,
      closable: false,
      footer: null,
      width: 600,
    };

    return (
      <Modal {...modalProps} style={{ top: '40vh' }}>
        <div className='flex gap-2'>
          <Button type='primary' block onClick={() => this.props.onSubmit([], false)}>Proceed to evaluation</Button>
          <Button type='primary' block onClick={() => this.props.onSubmit([], true)}>Proceed to standard session</Button>
        </div>
      </Modal>
    );
  }
};

export default ModalProcessAppointment;