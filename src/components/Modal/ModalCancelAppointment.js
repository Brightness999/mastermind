import React from 'react';
import { Modal, Button } from 'antd';
import intl from 'react-intl-universal';

import messages from './messages';
import { APPOINTMENT, CONSULTATION, EVALUATION, SCREEN, SUBSIDY } from 'routes/constant';
import './style/index.less';

class ModalCancelAppointment extends React.Component {
  constructor(props) {
    super(props);
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
          <p className='font-18 font-500 mb-20'>Are you sure you want to <span className='text-red'>cancel</span> your {this.props.event?.type === SCREEN ? 'Screening' : this.props.event?.type === EVALUATION ? 'Evaluation' : this.props.event?.type === CONSULTATION ? 'Consultation' : [APPOINTMENT, SUBSIDY].includes(this.props.event?.type) ? 'Appointment' : 'Application'}?</p>
        </div>
        <div className='text-center div-cancel-bottom'>
          <p className='font-18 font-500'>This cannot be undone & you may <span className='text-red'>lose</span> your slot & won't get it back</p>
        </div>
        <div className='btn-footer'>
          <Button type='primary' block onClick={this.props.onCancel}>{intl.formatMessage(messages[this.props.event?.type === SCREEN ? 'keepScreening' : this.props.event?.type === EVALUATION ? 'keepEvaluation' : this.props.event?.type === CONSULTATION ? 'keepConsultation' : [APPOINTMENT, SUBSIDY].includes(this.props.event?.type) ? 'keepAppointment' : 'keepApplication']).toUpperCase()}</Button>
          <Button className='btn-warning' block onClick={this.props.onSubmit}>{intl.formatMessage(messages.confirmCancellation).toUpperCase()}</Button>
        </div>
      </Modal>
    );
  }
};

export default ModalCancelAppointment;