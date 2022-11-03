import React from 'react';
import { Modal, Button } from 'antd';
import intl from 'react-intl-universal';
import messages from './messages';
import './style/index.less';

class ModalCancelAppointment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      event: {},
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.event != this.props.event) {
      this.setState({ event: this.props.event });
    }
  }

  render() {
    const modalProps = {
      className: 'modal-cancel',
      title: "",
      open: this.props.visible,
      onOk: this.props.onSubmit,
      onCancel: this.props.onCancel,
      closable: false,
      footer: null,
      width: 600,
    };

    return (
      <Modal {...modalProps} style={{ top: '40vh' }}>
        <div className='text-center div-cancel-top'>
          <p className='font-18 font-500 mb-20'>Are you sure you want to <span className='text-red'>cancel</span> your {this.state.event?.type == 1 ? 'Screening' : this.state.event?.type == 2 ? 'Evaluation' : 'Appointment'}?</p>
        </div>
        <div className='text-center div-cancel-bottom'>
          <p className='font-18 font-500'>This cannot be undone & you may <span className='text-red'>lose</span> your slot & won't get it back</p>
        </div>
        <div className='btn-footer'>
          <Button type='primary' block onClick={this.props.onCancel}>{intl.formatMessage(messages[this.props.event?.type == 1 ? 'keepScreening' : this.props.event?.type == 2 ? 'keepEvaluation' : 'keepAppointment']).toUpperCase()}</Button>
          <Button className='btn-warning' block onClick={this.props.onSubmit}>{intl.formatMessage(messages.confirmCancellation).toUpperCase()}</Button>
        </div>
      </Modal>
    );
  }
};

export default ModalCancelAppointment;