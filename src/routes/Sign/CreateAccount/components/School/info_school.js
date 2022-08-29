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

export default class extends React.Component {
    constructor(props) {
        super(props);

        console.log(props);

        this.state = {
            technical_contact: [
                {}
            ],
            student_contact: [
                {}
            ],
            shool_detail: localStorage.getItem('school_detail') ? JSON.parse(localStorage.getItem('school_detail')) : '',
            school_address: ''
        }
    }

    convertDate = (date, type) => {
        return moment(date).format(type === 'h' ? 'HH' : 'mm');
    }



    onFinish = async (values) => {
        console.log('Success:', values);
        //localStorage.setItem('school_detail', JSON.stringify(values));
        //window.location.href = "/login";
        const { username, password, email } = JSON.parse(localStorage.getItem('createDefault'));
        const {
            after_from_time,
            after_to_time,
            communityServed,
            in_from_time,
            in_to_time,
            school_address,
            student: studentContactRef,
            technical: techContactRef,
            valueForContact
        } = values;
        try {

            // const data = {
            //     "username": "chi",
            //     "password": "chi123@@I",
            //     "email": "chi@gmail.com",
            //     "role": 60,
            //     "name": "chi_1",
            //     "communityServed": "6302788ceeebce6fb875cbcb",
            //     "valueForContact": "123 abc def",
            //     "sessionsInSchool": [
            //         {
            //             "dayInWeek": 1,
            //             "openHour": 7,
            //             "openMin": 0,
            //             "closeHour": 18,
            //             "closeMin": 0
            //         },
            //         {
            //             "dayInWeek": 2,
            //             "openHour": 7,
            //             "openMin": 0,
            //             "closeHour": 18,
            //             "closeMin": 0
            //         },
            //         {
            //             "dayInWeek": 3,
            //             "openHour": 7,
            //             "openMin": 0,
            //             "closeHour": 18,
            //             "closeMin": 0
            //         },
            //         {
            //             "dayInWeek": 4,
            //             "openHour": 7,
            //             "openMin": 0,
            //             "closeHour": 18,
            //             "closeMin": 0
            //         }
            //     ],
            //     "sessionsAfterSchool": [
            //         {
            //             "dayInWeek": 0,
            //             "openHour": 7,
            //             "openMin": 0,
            //             "closeHour": 18,
            //             "closeMin": 0
            //         }
            //     ],
            //     "techContactRef": ["1234", "123456"],
            //     "studentContactRef": ["12399", "12355"]
            // }


            const data = {
                username,
                password,
                email,
                role: "60",
                name: "chi_1",
                communityServed : "6302788ceeebce6fb875cbcb",
                valueForContact,
                sessionsInSchool: [
                    {
                        "dayInWeek": 1,
                        "openHour": this.convertDate(in_from_time, 'h'),
                        "openMin": this.convertDate(in_from_time, 'm'),
                        "closeHour": this.convertDate(in_to_time, 'h'),
                        "closeMin": this.convertDate(in_to_time, 'm'),
                    }
                ],
                sessionsAfterSchool: [
                    {
                        "dayInWeek": 0,
                        "openHour": this.convertDate(after_from_time, 'h'),
                        "openMin": this.convertDate(after_from_time, 'm'),
                        "closeHour": this.convertDate(after_to_time, 'h'),
                        "closeMin": this.convertDate(after_to_time, 'm'),
                    }
                ],
                techContactRef: [1,2],
                studentContactRef: [1,2],
            }

            const response = await axios.post(url + 'users/signup', data);

            const { success } = response.data;
            if (success) {
                message.success('Create Successfully');
            }
        }
        catch (error) {
            message.error(error?.response?.data?.data ?? error.message);
        }

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
        // geocodeByAddress(school_address)
        //     .then(results => geocodeByPlaceId(results[0].place_id))
        //     .then(latLng => console.log('Success', latLng))
        // .catch(error => console.error('Error', error));
    };


    render() {
        const day_week = [
            intl.formatMessage(messages.sunday),
            intl.formatMessage(messages.monday) + '-' + intl.formatMessage(messages.thursday),
            intl.formatMessage(messages.friday),
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
                            technical: this.state?.shool_detail?.technical || this.state.technical_contact,
                            student: this.state?.shool_detail?.student || this.state.student_contact,
                            school_address: 'Chicago, Illinois, Hoa Kỳ'
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
                                <Select.Option value='c1'>Communities 1</Select.Option>
                                <Select.Option value='c2'>Communities 2</Select.Option>
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
                                        {/* <input
                                            {...getInputProps({
                                                placeholder: 'Search Places ...',
                                                className: 'location-search-input',
                                            })}
                                        /> */}
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
                            <Segmented options={day_week} block={true} />
                            <div className='div-time'>
                                <p className='mb-10 font-700'>{intl.formatMessage(messages.inSchoolHours)}</p>
                                <Row gutter={14}>
                                    <Col xs={24} sm={24} md={12}>
                                        <Form.Item
                                            className='picker-small'
                                            name="in_from_time"
                                            rules={[{ required: true, message: intl.formatMessage(messages.fromMess) }]}
                                        >
                                            <TimePicker use12Hours format="h:mm a" placeholder={intl.formatMessage(messages.from)} defaultOpenValue={moment('00:00:00', 'HH:mm:ss')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={12}>
                                        <Form.Item
                                            className='picker-small'
                                            name="in_to_time"
                                            rules={[{ required: true, message: intl.formatMessage(messages.toMess) }]}
                                        >
                                            <TimePicker use12Hours format="h:mm a" placeholder={intl.formatMessage(messages.to)} defaultOpenValue={moment('00:00:00', 'HH:mm:ss')} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <p className='mb-10 font-700'>{intl.formatMessage(messages.afterSchoolHours)}</p>
                                <Row gutter={14}>
                                    <Col xs={24} sm={24} md={12}>
                                        <Form.Item
                                            className='picker-small'
                                            name="after_from_time"
                                            rules={[{ required: true, message: intl.formatMessage(messages.fromMess) }]}
                                        >
                                            <TimePicker use12Hours format="h:mm a" placeholder={intl.formatMessage(messages.from)} defaultOpenValue={moment('00:00:00', 'HH:mm:ss')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={12}>
                                        <Form.Item
                                            className='picker-small'
                                            name="after_to_time"
                                            rules={[{ required: true, message: intl.formatMessage(messages.toMess) }]}
                                        >
                                            <TimePicker use12Hours format="h:mm a" placeholder={intl.formatMessage(messages.to)} defaultOpenValue={moment('00:00:00', 'HH:mm:ss')} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>
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
