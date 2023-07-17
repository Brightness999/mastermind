import React from 'react';
import { Modal, Button, Input } from 'antd';
import intl from "react-intl-universal";

import messages from './messages';
import msgCreateAccount from 'routes/Sign/CreateAccount/messages';
import msgDrawer from '../DrawerDetail/messages';
import { APPOINTMENT, CONSULTATION, EVALUATION, SCREEN, SUBSIDY } from 'routes/constant';
import './style/index.less';

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
    const { note, publicFeedback } = this.state;
    const modalProps = {
      className: 'modal-cancel',
      title: event?.type === EVALUATION ? "Feedback" : "Next Process",
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
            <Input.TextArea name='PrivateNote' rows={3} value={note} onChange={e => this.setState({ note: e.target.value })} placeholder={intl.formatMessage(messages.privateNote)} />
          </div>
          <div>
            <p className='mb-0 font-12'>{intl.formatMessage(messages.publicFeedback)}</p>
            <Input.TextArea name='PublicFeedback' rows={3} value={publicFeedback} onChange={e => this.setState({ publicFeedback: e.target.value })} placeholder={intl.formatMessage(messages.publicFeedback)} />
          </div>
          <div className='flex gap-2 btn-footer'>
            {event?.type === EVALUATION ? (
              <>
                <Button onClick={() => this.props.onDecline(note, publicFeedback)}>{intl.formatMessage(messages.decline)} {intl.formatMessage(msgCreateAccount.dependent)}</Button>
                <Button type='primary' onClick={() => this.props.onConfirm(note, publicFeedback)}>{intl.formatMessage(msgCreateAccount.confirm)}</Button>
              </>
            ) : (
              <>
                {event?.type != CONSULTATION ? <Button type='primary' block onClick={() => event?.type === SCREEN ? this.props.onDeclineDependent(note, publicFeedback) : this.props.onDecline(note, publicFeedback)}>{intl.formatMessage(messages.decline)} {event?.type === SCREEN ? intl.formatMessage(msgCreateAccount.dependent) : ''}</Button> : null}
                {(event?.type === SCREEN && event?.provider?.isSeparateEvaluationRate) ? <Button type='primary' block onClick={() => this.props.onSubmit([], false, note, publicFeedback)}>{intl.formatMessage(messages.toEvaluation)}</Button> : null}
                {event?.type === SCREEN ? <Button type='primary' block onClick={() => this.props.onSubmit([], true, note, publicFeedback)}>{intl.formatMessage(messages.toStandardSession)}</Button> : null}
                {event?.type === CONSULTATION ? <Button type='primary' block onClick={() => this.props.onConfirmNoShow(note, publicFeedback)}>{intl.formatMessage(msgDrawer.markAsNoShow)}</Button> : null}
                {(event?.type === APPOINTMENT || event?.type === CONSULTATION || event?.type === SUBSIDY) ? <Button type='primary' block onClick={() => this.props.onConfirm(note, publicFeedback)}>{intl.formatMessage(msgDrawer.markClosed)}</Button> : null}
              </>
            )}
          </div>
        </div>
      </Modal>
    );
  }
};

export default ModalProcessAppointment;