import React from 'react';
import { Modal, Button, Input } from 'antd';
import './style/index.less';

class ModalProcessAppointment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      note: '',
      publicFeedback: '',
    }
  }

  render() {
    const { event } = this.props;
    const { note, publicFeedback } = this.state;
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
        <div className='flex flex-col gap-5'>
          <div>
            <p className='mb-0 font-12'>Internal notes</p>
            <Input.TextArea rows={3} value={note} onChange={e => this.setState({ note: e.target.value })} placeholder="Internal notes" />
          </div>
          <div>
            <p className='mb-0 font-12'>Public feedback</p>
            <Input.TextArea rows={3} value={publicFeedback} onChange={e => this.setState({ publicFeedback: e.target.value })} placeholder="Public feedback" />
          </div>
          <div className='flex gap-2'>
            <Button type='primary' block onClick={() => this.props.onDecline(note, publicFeedback)}>Decline</Button>
            {event?.type == 1 && <Button type='primary' block onClick={() => this.props.onSubmit([], false, note, publicFeedback)}>Proceed to evaluation</Button>}
            {(event?.type == 1 || event?.type == 2) && <Button type='primary' block onClick={() => event?.type == 1 ? this.props.onSubmit([], true, note, publicFeedback) : this.props.onConfirm(note, publicFeedback)}>Proceed to standard session</Button>}
            {(event?.type == 3 || event?.type == 5) && <Button type='primary' block onClick={() => this.props.onConfirm(note, publicFeedback)}>Mark as closed</Button>}
          </div>
        </div>
      </Modal>
    );
  }
};

export default ModalProcessAppointment;