import React from 'react';
import { Modal, Button, Input } from 'antd';
import intl from 'react-intl-universal';
import messages from './messages';
import msgForgotPass from 'routes/Sign/ForgotPass/messages';
import './style/index.less';
import '../../assets/styles/login.less';

class ModalCreateNote extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      note: '',
    }
  }

  componentDidMount() {
    this.setState({ note: this.props.note });
  }

  render() {
    const { note } = this.state;
    const modalProps = {
      className: 'modal-note',
      title: this.props.title,
      open: this.props.visible,
      onOk: this.props.onSubmit,
      onCancel: this.props.onCancel,
      closable: false,
      footer: [
        <Button key="back" onClick={this.props.onCancel}>
          {intl.formatMessage(messages.cancel)}
        </Button>,
        <Button key="submit" type="primary" onClick={() => this.props.onSubmit(note)} className="px-20">
          {intl.formatMessage(msgForgotPass.send)}
        </Button>
      ]
    };

    return (
      <Modal {...modalProps}>
        <Input.TextArea name='note' rows={7} value={note} onChange={e => this.setState({ note: e.target.value })} placeholder={this.props.title} />
      </Modal>
    );
  }
};

export default ModalCreateNote;