import React, { Component } from 'react';
import { Row, Col, Form, Button, Segmented, TimePicker, message, DatePicker } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import { QuestionCircleOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import messages from '../../messages';
import { connect } from 'react-redux'
import { compose } from 'redux'
import * as MultiDatePicker from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel"
import { setRegisterData, removeRegisterData } from '../../../../../redux/features/registerSlice';
import { url } from '../../../../../utils/api/baseUrl';
import axios from 'axios';
import { userSignUp } from '../../../../../utils/api/apiList';
import { BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY, BASE_CALENDAR_URL, GOOGLE_CALENDAR_API_KEY, JEWISH_CALENDAR_REGION, USA_CALENDAR_REGION } from '../../../../../routes/constant';

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
      isSubmit: false,
      allHolidays: [],
    }
  }

  async componentDidMount() {
    const { registerData } = this.props.register;
    const holidays = await this.getHolidays();

    if (!!registerData.step2) {
      this.form?.setFieldsValue({ ...registerData.step2 });

      await this.updateBlackoutDates(registerData?.step2?.blackoutDates?.map(date => new Date(date)));
      document.querySelectorAll('#datepanel ul li span')?.forEach(el => {
        let name = document.createElement("div");
        name.textContent = holidays?.find(a => a.start.date == el.innerText)?.summary ?? '';
        el.after(name);
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
    const invalidDayInWeek = Object.values(values).findIndex(times => times?.find(v => (v?.from_date && v?.to_date && v?.from_date?.isAfter(v.to_date)) || (v?.from_time && v?.to_time && v?.from_time?.isAfter(v.to_time))));
    if (invalidDayInWeek < 0) {
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
        blackoutDates: values?.blackoutDates?.map(d => d.toString()),
        ...registerData.consultantInfo
      }

      // post to server
      this.setState({ isSubmit: true });
      const response = await axios.post(url + userSignUp, newRegisterData);
      this.setState({ isSubmit: false });
      const { success } = response.data;
      if (success) {
        this.props.removeRegisterData();
        this.props.onContinue(true);
      } else {
        message.error(error?.response?.data?.data ?? error.message);
      }
    } else {
      message.error(`The selected date or time is not valid on ${day_week[invalidDayInWeek]}`);
    }
  };

  onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  onSelectDay = e => {
    e && this.setState({ currentSelectedDay: e });
  }

  onChangeScheduleValue = () => {
    this.props.setRegisterData({ step2: this.form.getFieldsValue() });
  }

  copyToFullWeek = (dayForCopy) => {
    const arrToCopy = this.form.getFieldValue(dayForCopy);
    day_week.map((newDay) => {
      if (newDay != dayForCopy) {
        this.form.setFieldValue(newDay, arrToCopy);
      }
    })
  }

  getHolidays = async () => {
    try {
      const usa_url = `${BASE_CALENDAR_URL}/${USA_CALENDAR_REGION}%23${BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY}/events?key=${GOOGLE_CALENDAR_API_KEY}`
      const jewish_url = `${BASE_CALENDAR_URL}/${JEWISH_CALENDAR_REGION}%23${BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY}/events?key=${GOOGLE_CALENDAR_API_KEY}`

      const usa_data = await fetch(usa_url).then(response => response.json());
      const jewish_data = await fetch(jewish_url).then(response => response.json());

      this.setState({ allHolidays: [...usa_data?.items ?? [], ...jewish_data?.items ?? []] });
      this.props.setRegisterData({ allHolidays: [...usa_data?.items ?? [], ...jewish_data?.items ?? []] });

      return [...usa_data?.items ?? [], ...jewish_data?.items ?? []];
    } catch (error) {
      return [];
    }
  }

  handleClickGoogleCalendar = async () => {
    const dates = this.form.getFieldValue("blackoutDates")?.map(date => new Date(date));
    let uniqueDates = [];
    [...dates ?? [], ...[...new Set(this.state.allHolidays?.map(a => a.start.date))]?.map(a => new Date(a)) ?? []]?.sort((a, b) => a - b)?.forEach(c => {
      if (!uniqueDates.find(d => d.toLocaleDateString() == c.toLocaleDateString())) {
        uniqueDates.push(c);
      }
    })

    await this.updateBlackoutDates(uniqueDates);

    document.querySelectorAll('#datepanel ul li span')?.forEach(el => {
      const name = this.state.allHolidays?.find(a => a.start.date == el.innerText)?.summary;
      if (name) {
        if (el.nextElementSibling.nodeName.toLowerCase() == 'div') {
          el.nextElementSibling.innerText = name;
        } else {
          let newElement = document.createElement("div");
          newElement.textContent = name;
          el.after(newElement);
        }
      } else {
        if (el.nextElementSibling.nodeName.toLowerCase() == 'div') {
          el.nextElementSibling.innerText = '';
        }
      }
    })
  }

  updateBlackoutDates = async (dates) => {
    this.form.setFieldsValue({ blackoutDates: dates });
    this.onChangeScheduleValue();
    return new Promise((resolveOuter) => {
      resolveOuter(
        new Promise((resolveInner) => {
          setTimeout(resolveInner, 0);
        }),
      );
    });
  }

  handleUpdateBlackoutDates = async (dates) => {
    await this.updateBlackoutDates(dates);
    document.querySelectorAll('#datepanel ul li span')?.forEach(el => {
      const name = this.state.allHolidays?.find(a => a.start.date == el.innerText)?.summary;
      if (name) {
        if (el.nextElementSibling.nodeName.toLowerCase() == 'div') {
          el.nextElementSibling.innerText = name;
        } else {
          let newElement = document.createElement("div");
          newElement.textContent = name;
          el.after(newElement);
        }
      } else {
        if (el.nextElementSibling.nodeName.toLowerCase() == 'div') {
          el.nextElementSibling.innerText = '';
        }
      }
    })
  }

  render() {
    const { currentSelectedDay, isSubmit } = this.state;

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
                                    onSelect={(time) => {
                                      this.onChangeScheduleValue();
                                      const dayTime = this.form.getFieldValue(day);
                                      this.form.setFieldValue(day, dayTime?.map((d, i) => i === index ? ({ ...d, from_time: time }) : d));
                                    }}
                                    use12Hours
                                    format="h:mm a"
                                    popupClassName='timepicker'
                                    placeholder={intl.formatMessage(messages.from)}
                                  />
                                </Form.Item>
                              </Col>
                              <Col xs={24} sm={24} md={12} className={field.key !== 0 && 'item-remove'}>
                                <Form.Item name={[field.name, "to_time"]}>
                                  <TimePicker
                                    onSelect={(time) => {
                                      this.onChangeScheduleValue();
                                      const dayTime = this.form.getFieldValue(day);
                                      this.form.setFieldValue(day, dayTime?.map((d, i) => i === index ? ({ ...d, to_time: time }) : d));
                                    }}
                                    use12Hours
                                    format="h:mm a"
                                    popupClassName='timepicker'
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
                              <a className='underline text-primary' onClick={() => this.copyToFullWeek(day)}>{intl.formatMessage(messages.copyFullWeek)}</a>
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
            <p className='font-18 mb-10 text-center'>{intl.formatMessage(messages.blackoutDates)}</p>
            <div className='flex items-center justify-center mb-10'>
              <div className='flex gap-2 items-center cursor' onClick={() => this.handleClickGoogleCalendar()}>
                <img src='../images/gg.png' className='h-30' />
                <p className='font-16 mb-0 text-underline'>Google</p>
              </div>
            </div>
            <Form.Item name="blackoutDates">
              <MultiDatePicker.Calendar
                multiple
                sort
                className='m-auto'
                format="YYYY-MM-DD"
                onChange={dates => this.handleUpdateBlackoutDates(dates)}
                plugins={[<DatePanel id="datepanel" />]}
              />
            </Form.Item>
            <Form.Item className="form-btn continue-btn" >
              <Button
                block
                type="primary"
                htmlType="submit"
                loading={isSubmit}
                disabled={isSubmit}
              >
                {intl.formatMessage(messages.submit).toUpperCase()}
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
