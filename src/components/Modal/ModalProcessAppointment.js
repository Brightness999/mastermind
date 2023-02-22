import React from 'react';
import { Modal, Button, Input } from 'antd';
import './style/index.less';
import intl from "react-intl-universal";
import messages from './messages';
import msgCreateAccount from '../../routes/Sign/CreateAccount/messages';
import msgDrawer from '../DrawerDetail/messages';

class ModalProcessAppointment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      note: '',
      publicFeedback: this.props.event?.publicFeedback,
    }
  }

  render() {
    const { event } = this.props;
    console.log(event);
    const { note, publicFeedback } = this.state;
    const modalProps = {
      className: 'modal-cancel',
      title: event?.type == 2 ? "Feedback" : "Next Process",
      open: this.props.visible,
      onOk: this.props.onSubmit,
      onCancel: this.props.onCancel,
      closable: false,
      footer: null,
      width: 600,
    };

    return (
      <Modal {...modalProps}>
        <div className='flex flex-col gap-5'>
          <div>
            <p className='mb-0 font-12'>{intl.formatMessage(messages.privateNote)}</p>
            <Input.TextArea rows={3} value={note} onChange={e => this.setState({ note: e.target.value })} placeholder={intl.formatMessage(messages.privateNote)} />
          </div>
          <div>
            <p className='mb-0 font-12'>{intl.formatMessage(messages.publicFeedback)}</p>
            <Input.TextArea rows={3} value={publicFeedback} onChange={e => this.setState({ publicFeedback: e.target.value })} placeholder={intl.formatMessage(messages.publicFeedback)} />
          </div>
          <div className='flex gap-2 btn-footer'>
            {event?.type == 2 ? (
              <>
                <Button onClick={() => this.props.onCancel()}>{intl.formatMessage(messages.cancel)}</Button>
                <Button type='primary' onClick={() => this.props.onConfirm(note, publicFeedback)}>{intl.formatMessage(msgCreateAccount.confirm)}</Button>
              </>
            ) : (
              <>
                <Button type='primary' block onClick={() => this.props.onDecline(note, publicFeedback)}>{intl.formatMessage(messages.decline)}</Button>
                {(event?.type == 1 && event?.provider?.isSeparateEvaluationRate) ? <Button type='primary' block onClick={() => this.props.onSubmit([], false, note, publicFeedback)}>{intl.formatMessage(messages.toEvaluation)}</Button> : null}
                {event?.type == 1 ? <Button type='primary' block onClick={() => this.props.onSubmit([], true, note, publicFeedback)}>{intl.formatMessage(messages.toStandardSession)}</Button> : null}
                {(event?.type == 3 || event?.type == 5) ? <Button type='primary' block onClick={() => this.props.onConfirm(note, publicFeedback)}>{intl.formatMessage(msgDrawer.markClosed)}</Button> : null}
              </>
            )}
          </div>
        </div>
      </Modal>
    );
  }
};

export default ModalProcessAppointment;