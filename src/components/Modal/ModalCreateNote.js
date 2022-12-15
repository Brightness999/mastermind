import React from 'react';
import { Modal, Button, Input } from 'antd';
import intl from 'react-intl-universal';
import messages from './messages';
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
    const modalProps = {
      className: 'modal-note',
      title: "",
      open: this.props.visible,
      onOk: this.props.onSubmit,
      onCancel: this.props.onCancel,
      closable: false,
      footer: [
        <Button key="back" onClick={this.props.onCancel}>
          {intl.formatMessage(messages.cancel)}
        </Button>,
        <Button key="submit" type="primary" onClick={() => this.props.onSubmit(this.state.note)} style={{ padding: '7.5px 30px' }}>
          {intl.formatMessage(messages.save)}
        </Button>
      ]
    };
    return (
      <Modal {...modalProps}>
        <p>Internal Note</p>
        <Input.TextArea rows={7} value={this.state.note} onChange={e => this.setState({ note: e.target.value })} placeholder={intl.formatMessage(messages.privateNote)} />
      </Modal>
    );
  }
};

export default ModalCreateNote;