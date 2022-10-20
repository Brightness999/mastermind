import React from 'react';
import { Modal, Button, Row, Col, Input, Form, DatePicker, TimePicker } from 'antd';
import intl from 'react-intl-universal';
import messages from './messages';
import msgReview from '../../routes/Sign/SubsidyReview/messages';
import moment from 'moment';
import 'moment/locale/en-au';
import './style/index.less';
import '../../assets/styles/login.less';
import TextArea from 'antd/lib/input/TextArea';
import ModalConfirm from './ModalConfirm';

moment.locale('en');

class ModalNewScreening extends React.Component {
  state = {
    isModalConfirm: false,
    message: '',
    phoneNumber: '',
    notes: '',
  }

  onConfirm = () => {
    this.setState({ isModalConfirm: false }, () => {
      this.props.onSubmit({
        phoneNumber: this.state.phoneNumber,
        notes: this.state.notes,
      })
    });
  }

  onCancel = () => {
    this.setState({ isModalConfirm: false });
  }

  onFinish = () => {
    this.setState({
      isModalConfirm: true,
      message: 'Are you sure create this screening?',
    });
  }

  onFinishFailed = (error) => {
    console.log(error);
  }

  handleChangeFormValue = (value, name) => {
    this.setState({ [name]: value });
    this.form.setFieldValue({ [name]: value });
  }

  render() {
    const modalProps = {
      className: 'modal-new',
      title: "",
      open: this.props.visible,
      onOk: this.props.onSubmit,
      onCancel: this.props.onCancel,
      closable: false,
      width: 600,
      footer: null,
    };

    return (
      <Modal {...modalProps}>
        <div className='new-appointment'>
          <p className='font-30 mb-10'>{intl.formatMessage(messages.newScreening)}</p>
          <Form
            onFinish={this.onFinish}
            onFinishFailed={this.onFinishFailed}
            ref={ref => this.form = ref}
          >
            <Row gutter={10}>
              <Col>
                <p className='font-16 mb-0'>{intl.formatMessage(messages.phone)}<sup>*</sup></p>
                <Form.Item
                  name="phoneNumber"
                  rules={[
                    { required: true, message: intl.formatMessage(messages.pleaseEnter) + ' ' + intl.formatMessage(messages.contactNumber) },
                    { pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$', message: intl.formatMessage(messages.phoneNumberValid) },
                  ]}
                >
                  <Input className='h-40' onChange={(e) => this.handleChangeFormValue(e.target.value, 'phoneNumber')} placeholder={intl.formatMessage(messages.contactNumber)} />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={24} md={24}>
                <p className='font-16 mb-0'>{intl.formatMessage(messages.notes)}<sup>*</sup></p>
                <Form.Item
                  name="notes"
                  rules={[{ required: true, message: intl.formatMessage(messages.pleaseEnter) + ' ' + intl.formatMessage(messages.notes) }]}
                >
                  <TextArea onChange={(e) => this.handleChangeFormValue(e.target.value, 'notes')} placeholder={intl.formatMessage(messages.notes)} rows={5} />
                </Form.Item>
              </Col>
            </Row>
            <Row className='justify-end gap-2'>
              <Button key="back" onClick={this.props.onCancel}>
                {intl.formatMessage(msgReview.goBack).toUpperCase()}
              </Button>
              <Form.Item>
                <Button key="submit" type="primary" htmlType="submit">
                  {intl.formatMessage(messages.screening).toUpperCase()}
                </Button>
              </Form.Item>
            </Row>
          </Form>
          <ModalConfirm
            visible={this.state.isModalConfirm}
            onSubmit={this.onConfirm}
            onCancel={this.onCancel}
            message={this.state.message}
          />
        </div>
      </Modal>
    );
  }
};

export default ModalNewScreening;