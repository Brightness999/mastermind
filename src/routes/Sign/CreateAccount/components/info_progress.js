import React,  {Component} from 'react';
import { Row, Form, Button, Input, Select, Checkbox, Tabs, Segmented } from 'antd';
import intl from 'react-intl-universal';
import messages from '../messages';
import messagesLogin from '../../Login/messages';

import './index.less';
const { TabPane } = Tabs;

class InfoProgress extends Component {
    onFinish = (values: any) => {
        console.log('Success:', values);
      };
    
    onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
      };
    render() {
        const day_week = [
            intl.formatMessage(messages.sunday),
            intl.formatMessage(messages.monday),
            intl.formatMessage(messages.tuesday),
            intl.formatMessage(messages.wednesday),
            intl.formatMessage(messages.thursday),
            intl.formatMessage(messages.friday),
        ]
        return (
            <Row justify="center" className="row-form">
                <div className='col-form col-create-default'>
                <div className='div-form-title'>
                    <p className='font-30 text-center'>{intl.formatMessage(messages.academicInformation)}</p>
                </div>
                <Form 
                    name="form_default"
                    initialValues={{ remember: true }}
                
                    onFinish={this.onFinish}
                    onFinishFailed={this.onFinishFailed}
                >
                    <p className='font-16 mr-10 mb-5'>{intl.formatMessage(messages.dependent)} #1 First + Last Name </p>
                    <Form.Item
                        name="school"
                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' +  intl.formatMessage(messages.school)}]}
                    >
                        <Input placeholder={intl.formatMessage(messages.school)}/>
                    </Form.Item>
                    <Form.Item
                        name="primary_teacher"
                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' +  intl.formatMessage(messages.primaryTeacher)}]}
                    >
                        <Input placeholder={intl.formatMessage(messages.primaryTeacher)}/>
                    </Form.Item>
                    <Form.Item
                        name="current_grade"
                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' +  intl.formatMessage(messages.currentGrade)}]}
                    >
                        <Input placeholder={intl.formatMessage(messages.currentGrade)}/>
                    </Form.Item>
                    <Form.Item name="marital_status">
                        <Select
                            mode="multiple"
                            showArrow
                            placeholder={intl.formatMessage(messages.servicesRequired)}
                            optionLabelProp="label"
                        >
                            <Select.Option value='Services required 1'>Services required 1</Select.Option>
                            <Select.Option value='Services required 2'>Services required 2</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Checkbox checked={true}>{intl.formatMessage(messages.doHaveIEP)}</Checkbox>
                    </Form.Item>
                    <p className='font-24 mb-10 text-center'>{intl.formatMessage(messages.availability)}</p>
                    {/* <div className='div-availability'> */}
                        {/* <Segmented options={day_week} /> */}
                    {/* <Tabs defaultActiveKey="1">
                        <TabPane tab={intl.formatMessage(messages.sunday)} key="1">
                        Content of Tab Pane 1
                        </TabPane>
                        <TabPane tab={intl.formatMessage(messages.monday)} key="2">
                        Content of Tab Pane 2
                        </TabPane>
                        <TabPane tab={intl.formatMessage(messages.tuesday)} key="3">
                        Content of Tab Pane 3
                        </TabPane>
                        <TabPane tab={intl.formatMessage(messages.wednesday)} key="4">
                        Content of Tab Pane 3
                        </TabPane>
                        <TabPane tab={intl.formatMessage(messages.thursday)} key="5">
                        Content of Tab Pane 3
                        </TabPane>
                        <TabPane tab={intl.formatMessage(messages.friday)} key="6">
                        Content of Tab Pane 3
                        </TabPane>
                    </Tabs> */}
                    {/* </div> */}
                    <Form.Item className="form-btn continue-btn" >
                        <Button
                            block
                            type="primary"                                      
                            htmlType="submit"
                            onClick={this.props.onContinueProgress}
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
export default InfoProgress;