import React from 'react';
import { Divider, Button, Form, Input, Select } from 'antd';
import intl from 'react-intl-universal';

import messages from '../messages';
import mgsSidebar from '../../../../components/SideBar/messages';
import './index.less';

export default class extends React.Component {
  onFinish = (values) => {
    console.log(values);
  };
  render() {
    const layout = {
      labelCol: {
        md: 5,
        sm: 7,
      },
      wrapperCol: {
        lg: 10,
        md: 12,
        sm: 14
      },
    };
    const validateMessages = {
      required: '${label} is required!',
      types: {
        email: '${label} is not a valid email!',
        number: '${label} is not a valid number!',
      },
      number: {
        range: '${label} must be between ${min} and ${max}',
      },
    };
    return (
      <div className="full-layout page systemsetting-page">
        <div className='div-title-admin'>
          <p className='font-16 font-500'>{intl.formatMessage(mgsSidebar.systemSetting)}</p>
          <Divider />
        </div>
        <Form {...layout} name="system_setting" onFinish={this.onFinish} validateMessages={validateMessages}>
          <Form.Item
            name={['setting', 'title']}
            label="Title"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item name={['setting', 'website']} label="Website">
            <Input />
          </Form.Item>
          <Form.Item
            name={['setting', 'language']}
            label="Language"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select defaultValue='language1'>
              <Select.Option value='language1'>Language 1</Select.Option>
              <Select.Option value='language2'>Language 2</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name={['setting', 'noti']} label="Notification">
            <Input.TextArea />
          </Form.Item>
          <Form.Item wrapperCol={{
            md: { span: 15, offset: 5 },
            sm: { span: 13, offset: 7 },
          }}>
            <Button className='mr-10'>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}
