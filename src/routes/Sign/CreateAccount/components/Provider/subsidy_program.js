import React, { Component } from 'react';
import { Row, Col, Form, Button, Calendar, Select, Switch, Divider } from 'antd';
import { BsPlusCircle, BsSquare, BsDashCircle } from 'react-icons/bs';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import { GoPrimitiveDot } from 'react-icons/go';
import { QuestionCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';

import { connect } from 'react-redux'
import { compose } from 'redux'
import { setRegisterData } from '../../../../../redux/features/registerSlice';

import 'moment/locale/en-au';
moment.locale('en');

class SubsidyProgram extends Component {
    state = {
        valueCalendar: moment(),
        selectedValue: moment(),
        currentDate: new Date(),
        currentMonth: moment().format('MMMM YYYY'),
        isSelectTime: -1,
        levels: [
            { level: "Level 1" },
        ],
    }


    componentDidMount() {
        const data = this.props.register.provider;
        if (data) {
            this.form?.setFieldsValue({
                ...data?.step5
            })
        }
    }

    onSelect = (newValue) => {
        this.setState({ valueCalendar: newValue });
        this.setState({ selectedValue: newValue });
    }
    onPanelChange = (newValue) => {
        this.setState({ valueCalendar: newValue });
    }
    onFinish = (values) => {
        console.log('Success:', values);
        this.props.setRegisterData({
            step5: values
        })

        this.props.onContinue();
    };

    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    nextMonth = () => {
        this.setState({ selectedValue: moment(this.state.selectedValue).add(1, 'month') });
        this.setState({ valueCalendar: moment(this.state.selectedValue).add(1, 'month') });
    }
    prevMonth = () => {
        this.setState({ selectedValue: moment(this.state.selectedValue).add(-1, 'month') });
        this.setState({ valueCalendar: moment(this.state.selectedValue).add(-1, 'month') });
    }
    onSelectTime = (index) => {
        this.setState({ isSelectTime: index })
    }
    render() {
        const { valueCalendar, selectedValue, isSelectTime } = this.state;
        return (
            <Row justify="center" className="row-form">
                <div className='col-form col-subsidy-program'>
                    <div className='div-form-title'>
                        <p className='font-30 text-center mb-10'>{intl.formatMessage(messages.subsidyProgram)}<QuestionCircleOutlined className='text-primary icon-question ' /></p>
                    </div>
                    <Form
                        name="form_subsidy_program"
                        onFinish={this.onFinish}
                        onFinishFailed={this.onFinishFailed}
                        initialValues={{
                            level: this.state.levels,
                        }}
                        ref={(ref) => { this.form = ref }}
                    >
                        <div className='flex flex-row mb-10'>
                            <BsSquare size={11} />
                            <p className='font-15 font-700 mb-0 ml-10'>{intl.formatMessage(messages.offeringVolunteer)}</p>
                        </div>
                        <div className='flex flex-row justify-between px-20'>
                            <p className='mb-10'>{intl.formatMessage(messages.numberSessionsWeek)}</p>
                            <Form.Item
                                name="number_sessions"
                                className='select-small'
                            >
                                <Select defaultValue="1">
                                    <Select.Option value='0'>0</Select.Option>
                                    <Select.Option value='1'>1</Select.Option>
                                </Select>
                            </Form.Item>
                        </div>
                        <Divider style={{ marginTop: 10, borderColor: '#d7d7d7' }} />
                        <div className='flex flex-row mb-10'>
                            <BsSquare size={11} />
                            <p className='font-15 font-700 mb-0 ml-10'>{intl.formatMessage(messages.provideSubsidizedCases)}</p>
                        </div>
                        <div className='px-20'>
                            <p className='mb-10'>{intl.formatMessage(messages.academicLevel)}</p>
                            <Form.List name="level">
                                {(fields, { add, remove }) => (
                                    <div className='div-time'>
                                        {fields.map((field) => {
                                            return (
                                                <Row key={field.key} gutter={10}>
                                                    <Col xs={24} sm={24} md={12}>
                                                        <Form.Item
                                                            name={[field.name, "level"]}
                                                            className='select-small'
                                                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.level) }]}
                                                        >
                                                            <Select placeholder={intl.formatMessage(messages.level)}>
                                                                <Select.Option value='1'>level 1</Select.Option>
                                                                <Select.Option value='2'>level 2</Select.Option>
                                                            </Select>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={12} sm={12} md={6}>
                                                        <Form.Item
                                                            name={[field.name, "rate"]}
                                                            className='select-small'
                                                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.rate) }]}
                                                        >
                                                            <Select placeholder={intl.formatMessage(messages.rate)}>
                                                                <Select.Option value='r1'>rate 1</Select.Option>
                                                                <Select.Option value='r2'>rate 2</Select.Option>
                                                            </Select>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={12} sm={12} md={6} className={field.key !== 0 && 'item-remove'}>
                                                        <Form.Item
                                                            name={[field.name, "reduced"]}
                                                            className='select-small'
                                                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.reduced) }]}
                                                        >
                                                            <Select placeholder={intl.formatMessage(messages.reduced)}>
                                                                <Select.Option value='re1'>reduced 1</Select.Option>
                                                                <Select.Option value='re2'>reduced 2</Select.Option>
                                                            </Select>
                                                        </Form.Item>
                                                        {field.key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />}
                                                    </Col>
                                                </Row>

                                            );
                                        }
                                        )}
                                        <Row>
                                            <Col span={8}>
                                                <div className='flex flex-row'>
                                                    <BsPlusCircle size={14} className='mr-5 text-primary' />
                                                    <a className='text-primary' onClick={() => add()}>{intl.formatMessage(messages.addLevel)}</a>
                                                </div>
                                            </Col>
                                            <Col span={16}>
                                                <div className='flex flex-row items-center justify-end'>
                                                    <Switch size="small" defaultChecked />
                                                    <p className='ml-10 mb-0'>{intl.formatMessage(messages.sameRateLevels)}</p>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                )}
                            </Form.List>


                        </div>

                        <Divider style={{ borderColor: '#d7d7d7' }} />
                        <div className='flex flex-row mb-10'>
                            <BsSquare size={11} />
                            <p className='font-15 font-700 mb-0 ml-10'>{intl.formatMessage(messages.openPrivateSlots)}</p>
                        </div>
                        <div className='px-20'>
                            <p className='font-700'>{intl.formatMessage(messages.selectDateTime)}</p>
                            <div className='calendar'>
                                <Row gutter={15}>
                                    <Col xs={24} sm={24} md={15}>
                                        <Calendar
                                            fullscreen={false}
                                            value={valueCalendar}
                                            onSelect={this.onSelect}
                                            onPanelChange={this.onPanelChange}
                                            headerRender={() => {
                                                return (
                                                    <div style={{ marginBottom: 10 }}>
                                                        <Row gutter={8} justify="space-between" align="middle">
                                                            <Col>
                                                                <p className='font-16 mb-0'>{selectedValue?.format('MMMM YYYY')}</p>
                                                            </Col>
                                                            <Col>
                                                                <Button
                                                                    type='text'
                                                                    className='mr-10 left-btn'
                                                                    icon={<BiChevronLeft size={25} />}
                                                                    onClick={this.prevMonth}
                                                                />
                                                                <Button
                                                                    type='text'
                                                                    className='right-btn'
                                                                    icon={<BiChevronRight size={25} />}
                                                                    onClick={this.nextMonth}
                                                                />
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                );
                                            }}
                                        />
                                    </Col>
                                    <Col xs={24} sm={24} md={9}>
                                        <p className='font-16'>{selectedValue?.format('dddd MMMM DD ')}</p>
                                        <div className='time-available-title'>
                                            <p className='font-12 mb-0'><GoPrimitiveDot size={15} />{intl.formatMessage(messages.timesAvailable)}</p>
                                        </div>
                                        {Array(4).fill(null).map((_, index) => <div key={index} className={isSelectTime === index ? 'time-available active' : 'time-available'} onClick={() => this.onSelectTime(index)}>
                                            <p className='font-12 mb-0'><GoPrimitiveDot size={15} />10:30am</p>
                                        </div>)}
                                    </Col>
                                </Row>
                            </div>
                        </div>

                        <Form.Item className="form-btn continue-btn" >
                            <Button
                                block
                                type="primary"
                                htmlType="submit"
                            // onClick={this.props.onContinueProgram}
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
export default compose(connect(mapStateToProps, { setRegisterData }))(SubsidyProgram);