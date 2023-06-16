import React from 'react';
import { Row, Form, Button, Input, Select, message } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';

import messages from '../../../../Sign/CreateAccount/messages';
import messagesLogin from '../../../../Sign/Login/messages';
import request from '../../../../../utils/api/request';
import { getAdminInfo, getCityConnections, getUserProfile, updateAdminInfo } from '../../../../../utils/api/apiList';
import PageLoading from '../../../../../components/Loading/PageLoading';

class InfoAdmin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: [],
      loading: false,
    };
  }

  componentDidMount() {
    this.setState({ loading: true });
    if (window.location.pathname?.includes('changeuserprofile')) {
      request.post(getUserProfile, { id: this.props.auth.selectedUser?._id }).then(result => {
        this.setState({ loading: false });
        const { success, data } = result;
        if (success) {
          this.form?.setFieldsValue(data);
        }
      }).catch(err => {
        this.setState({ loading: false });
        message.error(err.message);
      })

      request.post(getCityConnections).then(result => {
        const { success, data } = result;
        if (success) {
          this.setState({ locations: data });
        }
      }).catch(err => {
        this.setState({ CityConnections: [] });
      })
    } else {
      request.post(getAdminInfo).then(res => {
        this.setState({ loading: false });
        const { success, data } = res;
        if (success) {
          this.form?.setFieldsValue(data?.admin);
          if (data?.admin?.role === 1000) {
            this.form?.setFieldValue('adminCommunity', data?.locations?.map(a => a._id));
            this.setState({ locations: data?.locations });
          } else {
            this.form?.setFieldValue('adminCommunity', data?.admin?.adminCommunity?.map(a => a._id));
            this.setState({ locations: data?.admin?.adminCommunity });
          }
        }
      }).catch(err => {
        message.error(err.message);
      })
    }
  }

  onFinish = (values) => {
    if (values) {
      request.post(updateAdminInfo, { ...values, _id: window.location.pathname?.includes('changeuserprofile') ? this.props.auth.selectedUser?._id : this.props.auth.user?._id }).then(res => {
        if (res.success) {
          message.success('Updated successfully');
        }
      }).catch(err => {
        message.error(err.message);
      })
    } else {
      message.warning('No enough data');
    }
  };

  render() {
    const { locations, loading } = this.state;

    return (
      <Row justify="center" className="row-form">
        <div className='col-form col-admin'>
          <div className='div-form-title mb-10'>
            <p className='font-30 text-center mb-0'>{intl.formatMessage(messages.adminDetails)}</p>
          </div>
          <Form
            name="form_admin"
            layout="vertical"
            onFinish={this.onFinish}
            ref={ref => this.form = ref}
          >
            <Form.Item
              name="fullName"
              label="fullName"
              className='float-label-item'
              rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.name) }]}
            >
              <Input placeholder={intl.formatMessage(messages.name)} />
            </Form.Item>
            <Form.Item
              name="phoneNumber"
              label="phoneNumber"
              className='float-label-item'
              rules={[
                { required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.phoneNumber) },
                { pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$', message: intl.formatMessage(messages.phoneNumberValid) },
              ]}
            >
              <Input placeholder={intl.formatMessage(messages.phoneNumber)} />
            </Form.Item>
            <Form.Item
              name="adminCommunity"
              label={intl.formatMessage(messages.cityConnections)}
              className='float-label-item'
              rules={[{ required: true }]}
            >
              <Select
                placeholder={intl.formatMessage(messages.cityConnections)}
                showSearch
                optionFilterProp="children"
                mode="multiple"
                filterOption={(input, option) => option.children?.toLowerCase().includes(input.toLowerCase())}
              >
                {locations?.map((value, index) => (
                  <Select.Option key={index} value={value._id}>{value.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="adminEmail"
              label="adminEmail"
              className='float-label-item'
              rules={[
                { required: true, message: intl.formatMessage(messages.emailMessage) },
                { type: 'email', message: intl.formatMessage(messagesLogin.emailNotValid) }
              ]}
            >
              <Input placeholder={intl.formatMessage(messages.email)} />
            </Form.Item>
            <Form.Item className="form-btn continue-btn" >
              <Button
                block
                type="primary"
                htmlType="submit"
              >
                {intl.formatMessage(messages.update).toUpperCase()}
              </Button>
            </Form.Item>
          </Form>
        </div>
        <PageLoading loading={loading} isBackground={true} />
      </Row>
    );
  }
}

const mapStateToProps = (state) => ({ auth: state.auth });

export default compose(connect(mapStateToProps))(InfoAdmin);
