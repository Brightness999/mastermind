import React,  {Component} from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Row, Form, Button, Input, Select, Steps } from 'antd';
import { BsCheck, BsDot, } from 'react-icons/bs';
import intl from 'react-intl-universal';
import messages from '../messages';
import messagesLogin from '../../Login/messages';

import './index.less';

class CreateDefault extends Component {
    onFinish = (values: any) => {
        console.log('Success:', values);
      };
    
    onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
      };
    render() {
        return (
            <Row justify="center" className="row-form">
                <div className='col-form col-create-default'>
                <div className='div-form-title'>
                    <p className='font-30 text-center'>{intl.formatMessage(messages.letCreateAccount)}</p>
                </div>
                <Form 
                    name="form_default"
                    initialValues={{ remember: true }}
                
                    onFinish={this.onFinish}
                    onFinishFailed={this.onFinishFailed}
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: intl.formatMessage(messages.userMessage) }]}
                    >
                        <Input placeholder={intl.formatMessage(messages.username)}/>
                    </Form.Item>
                    <Form.Item
                        name="email"
                        rules={[{ required: true, message: intl.formatMessage(messages.emailMessage) }]}
                    >
                        <Input placeholder={intl.formatMessage(messages.email)}/>
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.passwordMessage) }]}
                        
                    >
                        <Input.Password placeholder={intl.formatMessage(messagesLogin.password)} />
                        <div className='info-icon'><QuestionCircleOutlined/></div>
                        <div className='pass-contain'>
                            <p className='mb-5'>{intl.formatMessage(messages.passwordContain)}</p>
                            <div className='flex flex-row'>
                            <ul>
                                <li className='active'><BsCheck size={15}/>{intl.formatMessage(messages.lowerCase)}</li>
                                <li><BsDot size={15}/>{intl.formatMessage(messages.number)}</li>
                                <li><BsDot size={15}/>{intl.formatMessage(messages.symbol)}</li>
                            </ul>
                            <ul>
                                <li><BsDot size={15}/>{intl.formatMessage(messages.upperCase)}</li>
                                <li><BsDot size={15}/>{intl.formatMessage(messages.moreCharacters)}</li>
                                <li><BsDot size={15}/>{intl.formatMessage(messages.beUncommon)}</li>
                            </ul>
                            </div>
                        </div>
                    </Form.Item>
                    <p className='label-form'>{intl.formatMessage(messages.accountType)}</p>
                    <Form.Item
                        name="account_type"
                    >
                        <Select defaultValue='parent'>
                            <Select.Option value='parent'>{intl.formatMessage(messages.parent)}</Select.Option>
                            <Select.Option value='provider'>{intl.formatMessage(messages.provider)}</Select.Option>
                            <Select.Option value='school'>{intl.formatMessage(messages.school)}</Select.Option>
                            <Select.Option value='admin'>{intl.formatMessage(messages.admin)}</Select.Option>
                        </Select>
                    </Form.Item>
                    
                    <Form.Item className="form-btn continue-btn" >
                        <Button
                            block
                            type="primary"                                      
                            htmlType="submit"
                            onClick={this.props.onContinueDefault}
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
export default CreateDefault;