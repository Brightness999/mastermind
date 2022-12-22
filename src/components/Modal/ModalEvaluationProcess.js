import React from 'react';
import { Modal, Button } from 'antd';
import './style/index.less';
import intl from "react-intl-universal";
import messages from './messages';

class ModalEvaluationProcess extends React.Component {
  constructor(props) {
    super(props);
  }

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
      <Modal {...modalProps}>
        <div className='flex justify-center gap-2'>
          <Button type='primary' block onClick={() => this.props.onDecline()}>{intl.formatMessage(messages.decline)}</Button>
          <Button type='primary' block onClick={() => this.props.onSubmit()}>{intl.formatMessage(messages.toStandardSession)}</Button>
        </div>
      </Modal>
    );
  }
};

export default ModalEvaluationProcess;