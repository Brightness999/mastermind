import React from 'react';
import { Row, Col, Form, Button, Input, Select, Segmented, TimePicker, message } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import moment from 'moment';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';

import PlacesAutocomplete, {
    geocodeByAddress,
    geocodeByPlaceId,
    getLatLng,
} from 'react-places-autocomplete';
import axios from 'axios';

import { url } from '../../../../../utils/api/baseUrl';
import { getCommunitiServer } from '../../../../../utils/api/apiList'

export default class extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            technical_contact: [
                {}
            ],
            student_contact: [
                {}
            ],
            school_address: 'Chicago, Illinois, Hoa Kỳ',
            listCommunitiServer: [],
            dayIsSelected: 1,
            sessionsInSchool: [],
            sessionsAfterSchool: []
        }
    }

    componentDidMount() {
        this.loadCommunitiServer()
    }

    onFinish = async (values) => {
        console.log(this.state);
        console.log('Success:', values);

    };

    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    handleChange = school_address => {
        this.setState({ school_address });
    };

    handleSelect = school_address => {
        this.form.setFieldsValue({
            school_address
        })
    };

    loadCommunitiServer = () => {
        axios.post(url + getCommunitiServer).then(response => {
            const { success, data } = response.data
            console.log(response);
            if (success) {
                this.setState({
                    listCommunitiServer: data.docs
                })
            }
            else {
                message.error('Cant loading', intl.formatMessage(messages.communitiesServed))
            }

        }).catch(err => {
            message.error('Cant loading', intl.formatMessage(messages.communitiesServed))
        })
    }

    onSelectDay = e => {
        if (e) {
            console.log(e);
            this.setState({
                dayIsSelected: e
            })
        }
    }

    onSelectTimeForSesssion(index, value, type) {
        const hour = value.hour()
        const minute = value.minute()

        switch (type) {
            case 'inOpen':
                var items = { ...this.state.sessionsInSchool }
                items[index] = {
                    ...this.state?.sessionsInSchool[index],
                    "dayInWeek": index,
                    "openHour": hour,
                    "openMin": minute,
                }
                this.setState({
                    sessionsInSchool: items
                })
                break;
            case 'inClose':
                var items = { ...this.state.sessionsInSchool }
                items[index] = {
                    ...this.state?.sessionsInSchool[index],
                    "dayInWeek": index,
                    "closeHour": hour,
                    "closeMin": minute,
                }
                this.setState({
                    sessionsInSchool: items
                })
                break;
            case 'afterOpen':
                var items = { ...this.state.sessionsAfterSchool }
                items[index] = {
                    ...this.state?.sessionsAfterSchool[index],
                    "dayInWeek": index,
                    "openHour": hour,
                    "openMin": minute,
                }
                this.setState({
                    sessionsAfterSchool: items
                })
                break;
            case 'afterClose':
                var items = { ...this.state.sessionsAfterSchool }
                items[index] = {
                    ...this.state?.sessionsAfterSchool[index],
                    "dayInWeek": index,
                    "closeHour": hour,
                    "closeMin": minute,
                }
                this.setState({
                    sessionsAfterSchool: items
                })
                break;
            default:
                break;
        }
    }




    render() {

        const day_week = [
            {
                label: intl.formatMessage(messages.sunday),
                value: 1
            },
            {
                label: intl.formatMessage(messages.monday) + '-' + intl.formatMessage(messages.thursday),

                value: 2
            },
            {
                label: intl.formatMessage(messages.friday),
                value: 3
            },
        ]
        return (
            <Row justify="center" className="row-form">
                <div className='col-form col-school'>
                    <div className='div-form-title mb-10'>
                        <p className='font-30 text-center mb-0'>{intl.formatMessage(messages.schoolDetails)}</p>
                    </div>
                    <Form
                        name="form_school"
                        onFinish={this.onFinish}
                        onFinishFailed={this.onFinishFailed}
                        initialValues={{
                            technical: this.state.technical_contact,
                            student: this.state.student_contact,
                            school_address: this.state.school_address
                        }}
                        ref={(ref) => { this.form = ref }}
                    >
                        <Form.Item
                            name="valueForContact"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.nameSchool) }]}
                        >
                            <Input placeholder={intl.formatMessage(messages.nameSchool)} />
                        </Form.Item>
                        <Form.Item
                            name="communityServed"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.communitiesServed) }]}
                        >
                            <Select placeholder={intl.formatMessage(messages.communitiesServedNote)}>
                                {this.state.listCommunitiServer?.map((item, index) => {
                                    return (
                                        <Select.Option key={index} value={item._id}>{item.name}</Select.Option>
                                    )
                                })}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="school_address"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.schoolAddress) }]}
                        >
                            {/* <Input placeholder={intl.formatMessage(messages.schoolAddress)} /> */}
                            <PlacesAutocomplete
                                value={this.state.address}
                                onChange={this.handleChange}
                                onSelect={this.handleSelect}
                            >
                                {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                                    <div>
                                        <Input {...getInputProps({
                                            placeholder: intl.formatMessage(messages.schoolAddress),
                                            className: 'location-search-input',
                                        })} />
                                        <div className="autocomplete-dropdown-container">
                                            {loading && <div>Loading...</div>}
                                            {suggestions.map(suggestion => {
                                                const className = suggestion.active
                                                    ? 'suggestion-item--active'
                                                    : 'suggestion-item';
                                                // inline style for demonstration purpose
                                                const style = suggestion.active
                                                    ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                                                    : { backgroundColor: '#ffffff', cursor: 'pointer' };
                                                return (
                                                    <div
                                                        {...getSuggestionItemProps(suggestion, {
                                                            className,
                                                            style,
                                                        })}
                                                    >
                                                        <span>{suggestion.description}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </PlacesAutocomplete>
                        </Form.Item>
                        <Form.List name="technical">
                            {(fields, { add, remove }) => (
                                <div>
                                    {fields.map((field) => {
                                        return (
                                            <div key={field.key} className={field.key !== 0 && 'item-remove'}>
                                                <Form.Item
                                                    name={[field.name, "techContactRef"]}
                                                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.technicalReferralContact) }]}
                                                >
                                                    <Input placeholder={intl.formatMessage(messages.technicalReferralContact)} />
                                                </Form.Item>
                                                {field.key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />}
                                            </div>
                                        );
                                    }
                                    )}
                                    <div className='text-center'>
                                        <Button
                                            type="text"
                                            className='add-number-btn mb-10'
                                            icon={<BsPlusCircle size={17} className='mr-5' />}
                                            onClick={() => add(null)}
                                        >
                                            {intl.formatMessage(messages.addContact)}
                                        </Button>
                                    </div>
                                </div>

                            )}

                        </Form.List>

                        <Form.List name="student">
                            {(fields, { add, remove }) => (
                                <div>
                                    {fields.map((field) => {
                                        return (
                                            <div key={field.key} className={field.key !== 0 && 'item-remove'}>
                                                <Form.Item
                                                    name={[field.name, "studentContactRef"]}
                                                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.studentReferralContact) }]}
                                                >
                                                    <Input placeholder={intl.formatMessage(messages.studentReferralContact)} />
                                                </Form.Item>
                                                {field.key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />}
                                            </div>
                                        );
                                    }
                                    )}
                                    <div className='text-center'>
                                        <Button
                                            type="text"
                                            className='add-number-btn mb-10'
                                            icon={<BsPlusCircle size={17} className='mr-5' />}
                                            onClick={() => add(null)}
                                        >
                                            {intl.formatMessage(messages.addContact)}
                                        </Button>
                                    </div>
                                </div>

                            )}

                        </Form.List>

                        <div className='div-availability'>
                            <Segmented options={day_week} block={true} onChange={this.onSelectDay} />
                            {day_week.map((item, index) => {
                                index = ++index
                                return (
                                    <div className='div-time' style={{
                                        display: this.state.dayIsSelected === index ? 'block' : 'none'
                                    }}>
                                        <p className='mb-10 font-700'>{intl.formatMessage(messages.inSchoolHours)}</p>
                                        <Row gutter={14}>
                                            <Col xs={24} sm={24} md={12}>
                                                <Form.Item
                                                    className='picker-small'
                                                    name={[index, 'in_from_time']}
                                                    rules={[{ required: true, message: intl.formatMessage(messages.fromMess) }]}
                                                >
                                                    <TimePicker onChange={v => this.onSelectTimeForSesssion(index, v, 'inOpen')} use12Hours format="h:mm a" placeholder={intl.formatMessage(messages.from)} defaultOpenValue={moment('00:00:00', 'HH:mm:ss')} />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={24} md={12}>
                                                <Form.Item
                                                    className='picker-small'
                                                    name={[index, 'in_to_time']}
                                                    rules={[{ required: true, message: intl.formatMessage(messages.toMess) }]}
                                                >
                                                    <TimePicker onChange={v => this.onSelectTimeForSesssion(index, v, 'inClose')} use12Hours format="h:mm a" placeholder={intl.formatMessage(messages.to)} defaultOpenValue={moment('00:00:00', 'HH:mm:ss')} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <p className='mb-10 font-700'>{intl.formatMessage(messages.afterSchoolHours)}</p>
                                        <Row gutter={14}>
                                            <Col xs={24} sm={24} md={12}>
                                                <Form.Item
                                                    className='picker-small'
                                                    name={[index, 'after_from_time']}
                                                    rules={[{ required: true, message: intl.formatMessage(messages.fromMess) }]}
                                                >
                                                    <TimePicker onChange={v => this.onSelectTimeForSesssion(index, v, 'afterOpen')} use12Hours format="h:mm a" placeholder={intl.formatMessage(messages.from)} defaultOpenValue={moment('00:00:00', 'HH:mm:ss')} />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={24} md={12}>
                                                <Form.Item
                                                    className='picker-small'
                                                    name={[index, 'after_to_time']}
                                                    rules={[{ required: true, message: intl.formatMessage(messages.toMess) }]}
                                                >
                                                    <TimePicker onChange={v => this.onSelectTimeForSesssion(index, v, 'afterClose')} use12Hours format="h:mm a" placeholder={intl.formatMessage(messages.to)} defaultOpenValue={moment('00:00:00', 'HH:mm:ss')} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </div>
                                )
                            })}
                        </div>

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
