import React, { Component } from 'react';
import { Row, Col, Form, Button, Segmented, TimePicker, message, DatePicker } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import { QuestionCircleOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import messages from '../../messages';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { setRegisterData, removeRegisterData } from '../../../../../redux/features/registerSlice';
import { url } from '../../../../../utils/api/baseUrl';
import axios from 'axios';
import { userSignUp } from '../../../../../utils/api/apiList';

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
      errorMessage: '',
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
    let manualSchedule = [];
    const invalidDayInWeek = Object.values(values).findIndex(times => {
      if (times.find(v => v.from_date?.isAfter(v.to_date) || v.from_time?.isAfter(v.to_time))) {
        return true;
      } else {
        return false;
      }
    });
    if (invalidDayInWeek < 0) {
      this.setState({ errorMessage: '' });
      for (let i = 0; i < day_week.length; i++) {
        for (let j = 0; j < values['' + day_week[i]].length; j++) {
          let scheduleItem = values['' + day_week[i]][j];
          if (scheduleItem.from_time && scheduleItem.to_time && (scheduleItem.from_date || scheduleItem.to_date)) {
            manualSchedule.push({
              "dayInWeek": i,
              "fromYear": scheduleItem.from_date.year() ?? 0,
              "fromMonth": scheduleItem.from_date.month() ?? 0,
              "fromDate": scheduleItem.from_date.date() ?? 0,
              "toYear": scheduleItem.to_date.year() ?? 10000,
              "toMonth": scheduleItem.to_date.month() ?? 0,
              "toDate": scheduleItem.to_date.date() ?? 0,
              "openHour": scheduleItem.from_time.hour(),
              "openMin": scheduleItem.from_time.minutes(),
              "closeHour": scheduleItem.to_time.hour(),
              "closeMin": scheduleItem.to_time.minutes(),
            })
          } else {
            manualSchedule.push({
              "location": '',
              "dayInWeek": i,
              "fromYear": 0,
              "fromMonth": 0,
              "fromDate": 0,
              "toYear": 0,
              "toMonth": 0,
              "toDate": 0,
              "openHour": 0,
              "openMin": 0,
              "closeHour": 0,
              "closeMin": 0,
            })
          }
        }
      }
      const newRegisterData = {
        email: registerData.email,
        password: registerData.password,
        role: registerData.role,
        username: registerData.username,
        manualSchedule: manualSchedule,
        ...registerData.consultantInfo
      }

      // post to server
      const response = await axios.post(url + userSignUp, newRegisterData);
      const { success } = response.data;
      if (success) {
        this.props.removeRegisterData();
        this.props.onContinue(true);
      } else {
        message.error(error?.response?.data?.data ?? error.message);
      }
    } else {
      this.setState({ errorMessage: 'The selected time is not valid' });
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

  onChangeScheduleValue = () => {
    this.props.setRegisterData({
      step2: this.form.getFieldsValue()
    });
  }

  copyToFullWeek = (dayForCopy) => {
    const arrToCopy = this.form.getFieldValue(dayForCopy);
    day_week.map((newDay) => {
      if (newDay != dayForCopy) {
        this.form.setFieldValue(newDay, arrToCopy);
      }
    })
  }

  render() {
    const { errorMessage, currentSelectedDay } = this.state;

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
            <p className='font-18 mb-10 text-center'>{intl.formatMessage(messages.manualSchedule)}</p>
            <div className='div-availability'>
              <Segmented options={day_week} block={true} onChange={this.onSelectDay} />
              {day_week.map((day, index) => (
                <div key={index} id={day} style={{ display: currentSelectedDay === day ? 'block' : 'none' }}>
                  <Form.List name={day}>
                    {(fields, { add, remove }) => (
                      <div className='div-time'>
                        {fields.map((field, index) => (
                          <div key={field.key}>
                            <Row gutter={14}>
                              <Col xs={24} sm={24} md={12}>
                                <Form.Item name={[field.name, "from_date"]}>
                                  <DatePicker
                                    format="MM/DD/YYYY"
                                    placeholder={intl.formatMessage(messages.from)}
                                    onChange={() => this.onChangeScheduleValue()}
                                  />
                                </Form.Item>
                              </Col>
                              <Col xs={24} sm={24} md={12} className={field.key !== 0 && 'item-remove'}>
                                <Form.Item name={[field.name, "to_date"]}>
                                  <DatePicker
                                    format="MM/DD/YYYY"
                                    placeholder={intl.formatMessage(messages.to)}
                                    onChange={() => this.onChangeScheduleValue()}
                                  />
                                </Form.Item>
                                {field.key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />}
                              </Col>
                            </Row>
                            <Row gutter={14}>
                              <Col xs={24} sm={24} md={12}>
                                <Form.Item name={[field.name, "from_time"]}>
                                  <TimePicker
                                    onChange={() => this.onChangeScheduleValue()}
                                    use12Hours
                                    format="h:mm a"
                                    placeholder={intl.formatMessage(messages.from)}
                                  />
                                </Form.Item>
                              </Col>
                              <Col xs={24} sm={24} md={12} className={field.key !== 0 && 'item-remove'}>
                                <Form.Item name={[field.name, "to_time"]}>
                                  <TimePicker
                                    onChange={() => this.onChangeScheduleValue()}
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
            {errorMessage.length > 0 && (<p className='text-left text-red'>{errorMessage}</p>)}
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

export default compose(connect(mapStateToProps, { setRegisterData, removeRegisterData }))(ConsultantAvailability);
