import React,  {Component} from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Row, Form, Button, Input, Select, Steps } from 'antd';
import { BsCheck, BsDot, } from 'react-icons/bs';
import intl from 'react-intl-universal';
import messages from '../messages';
import messagesLogin from '../../Login/messages';

import './index.less';

class InfoParent extends Component {
    onFinish = (values: any) => {
        console.log('Success:', values);
      };
    
    onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
      };
    render() {
        return (
            <Row justify="center" className="row-form">
                <div className='col-form col-info-parent'>
                <div className='div-form-title'>
                    <p className='font-30 text-center mb-10'>{intl.formatMessage(messages.tellYourself)}</p>
                    <p className='font-24 text-center'>{intl.formatMessage(messages.contactInformation)}</p>
                </div>
                <Form 
                    name="form_contact"
                    initialValues={{ remember: true }}
                    onFinish={this.onFinish}
                    onFinishFailed={this.onFinishFailed}
                >
                    <Form.Item
                        name="family_name"
                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.familyName) }]}
                    >
                        <Input placeholder={intl.formatMessage(messages.familyName)}/>
                    </Form.Item>
                    <Form.Item
                        name="address"
                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.address) }]}
                    >
                        <Input placeholder={intl.formatMessage(messages.address)}/>
                    </Form.Item>
                    <Form.Item name="marital_status">
                        <Select placeholder={intl.formatMessage(messages.maritalStatus)}>
                            <Select.Option value='status1'>Married</Select.Option>
                            <Select.Option value='status2'>Widowed</Select.Option>
                            <Select.Option value='status3'>Separated</Select.Option>
                            <Select.Option value='status4'>Divorced</Select.Option>
                        </Select>
                    </Form.Item>

                    <p className='font-16 mb-10'>{intl.formatMessage(messages.father)}</p>
                    <Form.Item name="father_name">
                        <Input placeholder={intl.formatMessage(messages.fatherName)}/>
                    </Form.Item>
                    <Form.Item name="father_phone">
                        <Input placeholder={intl.formatMessage(messages.phoneNumber)}/>
                    </Form.Item>
                    <Form.Item name="father_email">
                        <Input placeholder={intl.formatMessage(messages.email)}/>
                    </Form.Item>
                    
                    <p className='font-16 mb-10'>{intl.formatMessage(messages.mother)}</p>
                    <Form.Item name="mother_name" >
                        <Input placeholder={intl.formatMessage(messages.motherName)}/>
                    </Form.Item>
                    <Form.Item name="mother_phone">
                        <Input placeholder={intl.formatMessage(messages.phoneNumber)}/>
                    </Form.Item>
                    <Form.Item name="mother_email">
                        <Input placeholder={intl.formatMessage(messages.email)}/>
                    </Form.Item>
                    
                    <Form.Item className="form-btn continue-btn" >
                        <Button
                            block
                            type="primary"                                      
                            htmlType="submit"
                            onClick={this.props.onContinueParent}
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
export default InfoParent;