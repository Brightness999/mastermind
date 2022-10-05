import React, { Component } from 'react';
import { Row, Col, Form, Button, Segmented, TimePicker, message } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import { QuestionCircleOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import messages from '../../messages';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import { url } from '../../../../../utils/api/baseUrl';
import axios from 'axios';

const day_week = [
  intl.formatMessage(messages.sunday),
  intl.formatMessage(messages.monday),
  intl.formatMessage(messages.tuesday),
  intl.formatMessage(messages.wednesday),
  intl.formatMessage(messages.thursday),
  intl.formatMessage(messages.friday),
]

class ConsultantAvailability extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentSelectedDay: day_week[0],
    }
  }

  componentDidMount() {
    let { registerData } = this.props.register;
    if (!!registerData.step2) {
      this.form?.setFieldsValue({
        ...registerData.step2
      })
    } else {
      day_week.map((day) => {
        this.form.setFieldValue(day, [''])
      })
    }
  }

  onFinish = async (values) => {
    const { registerData } = this.props.register;
    var manualSchedule = [];

    for (var i = 0; i < day_week.length; i++) {
      for (var j = 0; j < values['' + day_week[i]].length; j++) {
        var scheduleItem = values['' + day_week[i]][j];
        manualSchedule.push({
          "location": scheduleItem.location,
          "dayInWeek": i,
          "openHour": scheduleItem.from_time.hour(),
          "openMin": scheduleItem.from_time.minutes(),
          "closeHour": scheduleItem.to_time.hour(),
          "closeMin": scheduleItem.to_time.minutes()
        })
      }
    }

    var newRegisterData = {
      email: registerData.email,
      password: registerData.password,
      role: registerData.role,
      username: registerData.username,
      manualSchedule: manualSchedule,
      ...registerData.consultantInfo
    }

    // post to server
    const response = await axios.post(url + 'users/signup', newRegisterData);
    const { success, data } = response.data;
    if (success) {
      this.props.onContinue(true);
    } else {
      message.error(error?.response?.data?.data ?? error.message);
    }
  };

  onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  onSelectDay = e => {
    if (e) {
      this.setState({
        currentSelectedDay: e
      })
    }
  }

  onChangeScheduleValue = (day, value) => {
    this.props.setRegisterData({
      step2: this.form.getFieldsValue()
    });
  }

  onLocationChange = (day, value) => {
    this.props.setRegisterData({
      step2: this.form.getFieldsValue()
    });
  }

  onLocationSelected = (day, value, index) => {
    console.log(day, value, this.form.getFieldValue(day), index);
    var arr = this.form.getFieldValue(day);
    if (arr[index] == undefined) arr[index] = {};
    arr[index].location = value;
    this.form.setFieldValue(day, arr);
    this.props.setRegisterData({
      step2: this.form.getFieldsValue()
    });
  }

  copyToFullWeek = (dayForCopy) => {
    var arrToCopy = this.form.getFieldValue(dayForCopy);
    day_week.map((newDay) => {
      if (newDay != dayForCopy) {
        this.form.setFieldValue(newDay, arrToCopy);
      }
    })
  }

  render() {
    return (
      <Row justify="center" className="row-form">
        <div className='col-form col-availability'>
          <div className='div-form-title'>
            <p className='font-30 text-center mb-10'>{intl.formatMessage(messages.availability)}</p>
          </div>
          <Form
            name="form_availability"
            onFinish={this.onFinish}
            onFinishFailed={this.onFinishFailed}
            ref={ref => this.form = ref}
          >
            <p className='font-18 mb-10 text-center'>{intl.formatMessage(messages.autoSyncCalendar)}</p>
            <Row gutter={10}>
              <Col span={12}>
                <div className='div-gg'>
                  <img src='../images/gg.png' />
                  <p className='font-16 mb-0'>Google</p>
                </div>
              </Col>
              <Col span={12}>
                <div className='div-gg'>
                  <img src='../images/outlook.png' />
                  <p className='font-16 mb-0'>Outlook</p>
                </div>
              </Col>
            </Row>
            <p className='font-18 mb-10 text-center'>{intl.formatMessage(messages.manualSchedule)}</p>
            <div className='div-availability'>
              <Segmented options={day_week} block={true} onChange={this.onSelectDay} />
              {day_week.map((day, index) => (
                <div key={index} id={day} style={{ display: this.state.currentSelectedDay === day ? 'block' : 'none' }}>
                  <Form.List name={day}>
                    {(fields, { add, remove }) => (
                      <div className='div-time'>
                        {fields.map((field, index) => (
                          <div key={field.key}>
                            <Row gutter={14}>
                              <Col xs={24} sm={24} md={12}>
                                <Form.Item name={[field.name, "from_time"]}>
                                  <TimePicker
                                    onChange={v => this.onChangeScheduleValue(day, v)}
                                    use12Hours
                                    format="h:mm a"
                                    placeholder={intl.formatMessage(messages.from)}
                                  />
                                </Form.Item>
                              </Col>
                              <Col xs={24} sm={24} md={12} className={field.key !== 0 && 'item-remove'}>
                                <Form.Item name={[field.name, "to_time"]}>
                                  <TimePicker
                                    onChange={v => this.onChangeScheduleValue(day, v)}
                                    use12Hours
                                    format="h:mm a"
                                    placeholder={intl.formatMessage(messages.to)}
                                  />
                                </Form.Item>
                                {field.key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />}
                              </Col>
                            </Row>
                          </div>
                        ))}
                        <Row>
                          <Col span={12}>
                            <div className='div-add-time justify-center'>
                              <BsPlusCircle size={17} className='mr-5 text-primary' />
                              <a className='text-primary' onClick={() => add()}>{intl.formatMessage(messages.addRange)}</a>
                            </div>
                          </Col>
                          <Col span={12}>
                            <div className='div-copy-week justify-center'>
                              <a className='font-10 underline text-primary' onClick={() => this.copyToFullWeek(day)}>{intl.formatMessage(messages.copyFullWeek)}</a>
                              <QuestionCircleOutlined className='text-primary' />
                            </div>
                          </Col>
                        </Row>
                      </div>
                    )}
                  </Form.List>
                </div>
              ))}
            </div>
            <Form.Item className="form-btn continue-btn" >
              <Button
                block
                type="primary"
                htmlType="submit"
              >
                {intl.formatMessage(messages.confirm).toUpperCase()}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Row>
    );
  }
}

const mapStateToProps = state => ({
  register: state.register,
})

export default compose(connect(mapStateToProps, { setRegisterData }))(ConsultantAvailability);
