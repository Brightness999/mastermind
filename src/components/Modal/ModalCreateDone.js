import React from 'react';
import { Modal, Button } from 'antd';
import { BsCheckCircleFill } from 'react-icons/bs';
import intl from 'react-intl-universal';
import messages from './messages';
import './style/index.less';

class ModalCreateDone extends React.Component {
  render() {
    const modalProps = {
      className: 'modal-create-done',
      title: "",
      open: this.props.visible,
      onOk: this.props.onSubmit,
      onCancel: this.props.onCancel,
      closable: false,
      footer: null,
    };
    return (
      <Modal {...modalProps} style={{ top: 200 }}>
        <div className='text-center div-content'>
          <BsCheckCircleFill size={80} className='text-green500 mb-10' />
          <p className='font-30 font-500'>{intl.formatMessage(messages.youAllSet)}</p>
          <Button type='primary' block onClick={this.props.onCancel}>{intl.formatMessage(messages.home).toUpperCase()}</Button>
        </div>
      </Modal>
    );
  }
};
export default ModalCreateDone;