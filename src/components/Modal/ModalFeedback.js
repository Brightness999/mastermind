import React from 'react';
import { Modal, Button, Input } from 'antd';
import intl from 'react-intl-universal';
import './style/index.less';
import messages from './messages';
import msgDrawer from '../DrawerDetail/messages';

class ModalFeedback extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      note: '',
      publicFeedback: this.props.event?.publicFeedback,
    }
  }

  render() {
    const { note, publicFeedback } = this.state;
    const modalProps = {
      className: 'modal-cancel',
      title: "Feedback",
      open: this.props.visible,
      onOk: this.props.onSubmit,
      onCancel: this.props.onCancel,
      closable: false,
      footer: null,
      width: 600,
    };

    return (
      <Modal {...modalProps} style={{ top: '40vh' }}>
        <div className='flex flex-col gap-5'>
          <div>
            <p className='mb-0 font-12'>Internal notes</p>
            <Input.TextArea name='PrivateNote' rows={3} value={note} onChange={e => this.setState({ note: e.target.value })} placeholder="Internal notes" />
          </div>
          <div>
            <p className='mb-0 font-12'>Public feedback</p>
            <Input.TextArea name='PublicFeedback' rows={3} value={publicFeedback} onChange={e => this.setState({ publicFeedback: e.target.value })} placeholder="Public feedback" />
          </div>
          <div className='flex gap-2 btn-footer'>
            <Button block onClick={() => this.props.onCancel()}>{intl.formatMessage(messages.cancel)}</Button>
            <Button type='primary' block onClick={() => this.props.onSubmit(note, publicFeedback)}>{intl.formatMessage(msgDrawer.leaveFeedback)}</Button>
          </div>
        </div>
      </Modal>
    );
  }
};

export default ModalFeedback;