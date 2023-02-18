import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import { url } from '../../../../../utils/api/baseUrl';
import axios from 'axios';
import { getDefaultValuesForConsultant } from '../../../../../utils/api/apiList';

class InfoConsultant extends Component {
  constructor(props) {
    super(props);
    this.state = {
      EmailType: [],
      ContactNumberType: [],
      contactEmail: [],
      SkillSet: [],
      cityConnections: [],
    }
  }

  componentDidMount() {
    const { registerData } = this.props.register;
    const { user } = this.props.auth;

    user?.role > 900 && this.setState({ cityConnections: user?.adminCommunity });
    this.getDataFromServer();
    const consultantInfo = registerData.consultantInfo || this.getDefaultObj();
    this.form.setFieldsValue(consultantInfo);
    if (!registerData.consultantInfo) {
      this.props.setRegisterData({ consultantInfo: this.getDefaultObj() });
    }
  }

  getDataFromServer = () => {
    axios.post(url + getDefaultValuesForConsultant).then(result => {
      const { success, data } = result.data;
      if (success) {
        this.setState({
          ContactNumberType: data.ContactNumberType,
          EmailType: data.EmailType,
          SkillSet: data.SkillSet,
        })
        this.props.auth?.user?.role < 900 && this.setState({ cityConnections: data.CityConnections });
      }
    }).catch(err => {
      console.log('get default data error---', err);
    })
  }

  getDefaultObj = () => {
    const { registerData } = this.props.register;
    return {
      notes: "",
      referredToAs: "",
      contactEmail: [{ email: registerData?.email, type: "Work" }],
      contactNumber: [{ phoneNumber: "", type: "Home" }],
      cityConnection: undefined,
      skillSet: 0,
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
    const consultantInfo = registerData.consultantInfo;
    let obj = {};
    obj[fieldName] = value;
    this.props.setRegisterData({ consultantInfo: { ...consultantInfo, ...obj } });
  }

  defaultOnValueChange = (event, fieldName) => {
    const value = event.target.value;
    this.setValueToReduxRegisterData(fieldName, value);
  }

  handelChange = (fieldName, value) => {
    this.setValueToReduxRegisterData(fieldName, value);
  }

  render() {
    const { cityConnections, SkillSet, EmailType, ContactNumberType } = this.state;

    return (
      <Row justify="center" className="row-form">
        <div className='col-form col-info-parent'>
          <div className='div-form-title'>
            <p className='font-30 text-center mb-10'>{intl.formatMessage(messages.tellYourself)}</p>
          </div>
          <Form
            name="form_profile_provider"
            layout='vertical'
            onFinish={this.onFinish}
            onFinishFailed={this.onFinishFailed}
            ref={ref => this.form = ref}
          >
            <Form.Item name="referredToAs" label={intl.formatMessage(messages.referredAs)}>
              <Input onChange={v => this.defaultOnValueChange(v, "referredToAs")} placeholder={intl.formatMessage(messages.referredAs)} />
            </Form.Item>
            <Form.Item
              name="cityConnection"
              label={intl.formatMessage(messages.cityConnections)}
              rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.cityConnections) }]}
            >
              <Select
                placeholder={intl.formatMessage(messages.cityConnections)}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) => option.children?.toLowerCase().includes(input.toLowerCase())}
              >
                {cityConnections?.map((value, index) => (
                  <Select.Option key={index} value={value._id}>{value.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="skillSet"
              label={intl.formatMessage(messages.skillsets)}
              rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.skillsets) }]}
            >
              <Select
                placeholder={intl.formatMessage(messages.skillsets)}
                onChange={v => this.handelChange('skillSet', v)}
                value={0}
                disabled
              >
                {SkillSet.map((value, index) => (
                  <Select.Option key={index} value={index}>{value}</Select.Option>
                ))}
              </Select>
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
                          label={intl.formatMessage(messages.contactNumber)}
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
                          label={intl.formatMessage(messages.type)}
                          rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.type) }]}
                          className='bottom-0'
                          style={{ marginTop: key === 0 ? 0 : 14 }}
                        >
                          <Select placeholder={intl.formatMessage(messages.type)}>
                            {ContactNumberType.map((value, index) => (
                              <Select.Option key={index} value={value}>{value}</Select.Option>
                            ))}
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
                          label={intl.formatMessage(messages.contactEmail)}
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
                          label={intl.formatMessage(messages.type)}
                          rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.type) }]}
                          className='bottom-0'
                          style={{ marginTop: key === 0 ? 0 : 14 }}
                        >
                          <Select placeholder={intl.formatMessage(messages.type)}>
                            {EmailType.map((value, index) => (
                              <Select.Option key={index} value={value}>{value}</Select.Option>
                            ))}
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
              label={intl.formatMessage(messages.notes)}
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
  auth: state.auth,
})

export default compose(connect(mapStateToProps, { setRegisterData }))(InfoConsultant);