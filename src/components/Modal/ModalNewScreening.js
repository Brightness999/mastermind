import React from 'react';
import { Modal, Button, Row, Col, Input, Form, Select } from 'antd';
import intl from 'react-intl-universal';
import messages from './messages';
import msgReview from '../../routes/Sign/SubsidyReview/messages';
import moment from 'moment';
import 'moment/locale/en-au';
import './style/index.less';
import '../../assets/styles/login.less';
import TextArea from 'antd/lib/input/TextArea';

moment.locale('en');

class ModalNewScreening extends React.Component {
  componentDidMount() {
    const { dependent, event, notes } = this.props;
    if (event) {
      this.form.setFieldsValue({ phoneNumber: event?.phoneNumber, time: event?.screeningTime, notes: notes ? notes : event?.notes });
    } else {
      this.form.setFieldsValue({ phoneNumber: dependent?.parent?.[0]?.parentInfo?.[0]?.fatherPhoneNumber ? dependent?.parent?.[0]?.parentInfo?.[0]?.fatherPhoneNumber : dependent?.parent?.[0]?.parentInfo?.[0]?.motherPhoneNumber });
    }
  }

  onFinish = (values) => {
    this.props.onSubmit({
      phoneNumber: values.phoneNumber,
      notes: values.notes,
      time: values.time,
    })
  }

  onFinishFailed = (error) => {
    console.log(error);
  }

  render() {
    const { provider, dependent } = this.props;
    const modalProps = {
      className: 'modal-new',
      title: "",
      open: this.props.visible,
      onOk: this.props.onSubmit,
      onCancel: this.props.onCancel,
      closable: false,
      width: 700,
      footer: null,
    };

    return (
      <Modal {...modalProps}>
        <div className='new-screening'>
          <p className='font-20 mb-10'>{`${provider?.firstName ?? ''} ${provider?.lastName ?? ''}`} would like to speak with you before meeting({`${dependent?.firstName ?? ''} ${dependent?.lastName ?? ''}`})</p>
          <Form
            layout='vertical'
            onFinish={this.onFinish}
            onFinishFailed={this.onFinishFailed}
            ref={ref => this.form = ref}
          >
            <Row gutter={10}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="phoneNumber"
                  label={intl.formatMessage(messages.phone)}
                  rules={[
                    { required: true, message: intl.formatMessage(messages.pleaseEnter) + ' ' + intl.formatMessage(messages.contactNumber) },
                    { pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$', message: intl.formatMessage(messages.phoneNumberValid) },
                  ]}
                >
                  <Input className='h-40' placeholder={intl.formatMessage(messages.contactNumber)} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="time"
                  label={intl.formatMessage(messages.time)}
                  rules={[{ required: true }]}
                >
                  <Select showArrow placeholder={intl.formatMessage(messages.time)}>
                    <Select.Option value="morning">Morning</Select.Option>
                    <Select.Option value="afternoon">Afternoon</Select.Option>
                    <Select.Option value="evening">Evening</Select.Option>
                    <Select.Option value="night">Night</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={24} md={24}>
                <Form.Item
                  name="notes"
                  label={intl.formatMessage(messages.notes)}
                  rules={[{ required: true, message: intl.formatMessage(messages.pleaseEnter) + ' ' + intl.formatMessage(messages.notes) }]}
                >
                  <TextArea placeholder={intl.formatMessage(messages.notes)} rows={5} />
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
        </div>
      </Modal>
    );
  }
};

export default ModalNewScreening;