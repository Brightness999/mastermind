import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select, message } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import PlacesAutocomplete from 'react-places-autocomplete';
import { url } from '../../../../../utils/api/baseUrl';
import axios from 'axios';

class InfoConsultant extends Component {
  constructor(props) {
    super(props);
    this.state = {
      EmailType: [],
      ContactNumberType: [],
      contactPhoneNumber: [],
      contactEmail: [],
      SkillSet: [],
    }
  }

  componentDidMount() {
    const { registerData } = this.props.register;
    this.getDataFromServer();
    this.searchCityConnection('');
    var consultantInfo = registerData.consultantInfo || this.getDefaultObj();
    this.form.setFieldsValue(consultantInfo);
    if (!registerData.consultantInfo) {
      this.props.setRegisterData({ consultantInfo: this.getDefaultObj() });
    }
  }

  getDataFromServer = () => {
    axios.post(url + 'consultants/get_default_values_for_consultant').then(result => {
      if (result.data.success) {
        var data = result.data.data;
        this.setState({
          ContactNumberType: data.ContactNumberType,
          EmailType: data.EmailType,
          SkillSet: data.SkillSet,
        })
      } else {
        this.setState({
          checkEmailExist: false,
        });
      }
    }).catch(err => {
      console.log(err);
      this.setState({
        checkEmailExist: false,
      });
    })
  }

  searchCityConnection(value) {
    axios.post(url + 'providers/get_city_connections'
    ).then(result => {
      if (result.data.success) {
        var data = result.data.data;
        this.setState({ CityConnections: data.docs })
      } else {
        this.setState({
          CityConnections: [],
        });
      }
    }).catch(err => {
      console.log(err);
      this.setState({
        CityConnections: [],
      });
    })
  }

  getDefaultObj = () => {
    return {
      proExp: "",
      notes: "",
      referredToAs: "",
      yearExp: "",
      contactEmail: [{
        email: "",
        type: 0
      }],
      contactNumber: [{
        phoneNumber: "", type: 0
      }],
    };
  }

  onFinish = async (values) => {
    this.props.setRegisterData({ consultantInfo: values });
    this.props.onContinue();
  };

  onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  setValueToReduxRegisterData = (fieldName, value) => {
    const { registerData } = this.props.register;
    var consultantInfo = registerData.consultantInfo;
    var obj = {};
    obj[fieldName] = value;
    this.props.setRegisterData({ consultantInfo: { ...consultantInfo, ...obj } });
  }

  defaultOnValueChange = (event, fieldName) => {
    var value = event.target.value;
    this.setValueToReduxRegisterData(fieldName, value);
  }

  handelChange = (fieldName, value) => {
    this.setValueToReduxRegisterData(fieldName, value);
  }

  render() {
    const children = [];
    for (let i = 10; i < 36; i++) {
      children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
    }

    return (
      <Row justify="center" className="row-form">
        <div className='col-form col-info-parent'>
          <div className='div-form-title'>
            <p className='font-30 text-center mb-10'>{intl.formatMessage(messages.tellYourself)}</p>
          </div>
          <Form
            name="form_profile_provider"
            onFinish={this.onFinish}
            onFinishFailed={this.onFinishFailed}
            ref={ref => this.form = ref}
          >
            <Form.Item
              name="referredToAs"
              rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.referredAs) }]}
            >
              <Input onChange={v => this.defaultOnValueChange(v, "referredToAs")} placeholder={intl.formatMessage(messages.referredAs)} />
            </Form.Item>
            <Form.Item
              name="proExp"
              rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.professionalExperience) }]}
            >
              <Input.TextArea onChange={v => this.defaultOnValueChange(v, "proExp")} rows={4} placeholder={intl.formatMessage(messages.professionalExperience)} />
            </Form.Item>
            <Form.Item
              name="skillSet"
              rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.skillsets) }]}
            >
              <Select
                placeholder={intl.formatMessage(messages.skillsets)}
                onChange={v => this.handelChange('skillSet', v)}>
                {this.state.SkillSet.map((value, index) => {
                  return (<Select.Option value={index}>{value}</Select.Option>)
                })}
              </Select>
            </Form.Item>
            <Form.Item
              name="yearExp"
              rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.yearsExperience) }]}
            >
              <Input onChange={v => this.defaultOnValueChange(v, 'yearExp')} placeholder={intl.formatMessage(messages.yearsExperience)} />
            </Form.Item>
            <Form.List name="contactNumber">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row key={key} gutter={14}>
                      <Col xs={16} sm={16} md={16}>
                        <Form.Item
                          {...restField}
                          name={[name, 'phoneNumber']}
                          className='bottom-0'
                          style={{ marginTop: key === 0 ? 0 : 14 }}
                          rules={[
                            {
                              required: true,
                              message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.contactNumber)
                            },
                            {
                              pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$',
                              message: intl.formatMessage(messages.phoneNumberValid)
                            },
                          ]}
                        >
                          <Input placeholder={intl.formatMessage(messages.contactNumber)} />
                        </Form.Item>
                      </Col>
                      <Col xs={8} sm={8} md={8} className='item-remove'>
                        <Form.Item
                          {...restField}
                          name={[name, 'type']}
                          rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.type) }]}
                          className='bottom-0'
                          style={{ marginTop: key === 0 ? 0 : 14 }}
                        >
                          <Select placeholder={intl.formatMessage(messages.type)}>
                            {this.state.ContactNumberType.map((value, index) => {
                              return (<Select.Option value={index}>{value}</Select.Option>)
                            })}
                          </Select>
                        </Form.Item>
                        {key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(name)} />}
                      </Col>
                    </Row>
                  ))}
                  <Form.Item className='text-center mb-0'>
                    <Button
                      type="text"
                      className='add-number-btn mb-10'
                      icon={<BsPlusCircle size={17} className='mr-5' />}
                      onClick={() => add()}
                    >
                      {intl.formatMessage(messages.addNumber)}
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
            <Form.List name="contactEmail">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row key={key} gutter={14}>
                      <Col xs={16} sm={16} md={16}>
                        <Form.Item
                          {...restField}
                          name={[name, 'email']}
                          className='bottom-0'
                          style={{ marginTop: key === 0 ? 0 : 14 }}
                          rules={[
                            {
                              required: true,
                              message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.contactEmail)
                            },
                            {
                              type: 'email',
                              message: intl.formatMessage(messagesLogin.emailNotValid)
                            }
                          ]}
                        >
                          <Input placeholder={intl.formatMessage(messages.contactEmail)} />
                        </Form.Item>
                      </Col>
                      <Col xs={8} sm={8} md={8} className='item-remove'>
                        <Form.Item
                          {...restField}
                          name={[name, 'type']}
                          rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.type) }]}
                          className='bottom-0'
                          style={{ marginTop: key === 0 ? 0 : 14 }}
                        >
                          <Select placeholder={intl.formatMessage(messages.type)}>
                            {this.state.EmailType.map((value, index) => {
                              return (<Select.Option value={index}>{value}</Select.Option>)
                            })}
                          </Select>
                        </Form.Item>
                        {key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(name)} />}
                      </Col>
                    </Row>
                  ))}
                  <Form.Item className='text-center mb-0'>
                    <Button
                      type="text"
                      className='add-number-btn mb-10'
                      icon={<BsPlusCircle size={17} className='mr-5' />}
                      onClick={() => add()}
                    >
                      {intl.formatMessage(messages.addEmail)}
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
            <Form.Item
              name="notes"
              rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.notes) }]}
            >
              <Input.TextArea onChange={v => this.defaultOnValueChange(v, "notes")} rows={4} placeholder={intl.formatMessage(messages.notes)} />
            </Form.Item>
            <Form.Item className="form-btn continue-btn" >
              <Button
                block
                type="primary"
                htmlType="submit"
              >
                {intl.formatMessage(messages.continue).toUpperCase()}
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

export default compose(connect(mapStateToProps, { setRegisterData }))(InfoConsultant);