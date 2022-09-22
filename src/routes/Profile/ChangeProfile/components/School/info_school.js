import React from 'react';
import { Row, Col, Form, Button, Input, Select, Segmented, TimePicker, message } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import moment from 'moment';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../../Sign/Login/messages';

import PlacesAutocomplete, {
    geocodeByAddress,
    geocodeByPlaceId,
    getLatLng,
} from 'react-places-autocomplete';
import axios from 'axios';

import { url } from '../../../../../utils/api/baseUrl';
import { getCommunitiServer } from '../../../../../utils/api/apiList'
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import { connect } from 'react-redux';
import { compose } from 'redux';

class InfoSchool extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

            school_address: '',
            listCommunitiServer: [],
            dayIsSelected: 1,
            sessionsInSchool: '',
            sessionsAfterSchool: '',
            techContactRef: [],
            studentContactRef: [],
        }
    }

    componentDidMount() {
        this.loadCommunitiServer()

        const tokenUser = localStorage.getItem('token');

        axios.post(url + 'schools/get_my_school_info', {}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + tokenUser
            }
        }).then(result => {
            const { data } = result.data
            console.log(data);
            this.form.setFieldsValue({
                ...data
            })

            console.log(data.communityServed);

            this.setState({
                sessionsInSchool: data.sessionsInSchool,
                sessionsAfterSchool: data.sessionsAfterSchool,
                techContactRef: data.techContactRef,
                studentContactRef: data.studentContactRef,
            })
        })

        // const {registerData} = this.props.register;
        // const { authData } = this.props.auth

        // console.log(registerData);

        // console.log(authData);
        // if(!authData.techContactRef || authData.techContactRef.length ==0 ){
        //     this.setReduxForSchool('techContactRef',['']);
        //     this.form.setFieldsValue({techContactRef:[""]});
        //     // this.form.setFieldValue({techContactRef:[{}]});
        // }

        // if(!authData.studentContactRef || authData.studentContactRef.length ==0 ){
        //     this.setReduxForSchool('studentContactRef',['']);
        //     this.form.setFieldsValue({studentContactRef:[""]});
        // }
        // if(authData.techContactRef || authData.techContactRef.length > 0){
        //     authData.techContactRef.map((item,index) =>(
        //         authData.techContactRef[index] = {techContactRef: item}
        //     ))
        // }
        // if(authData.studentContactRef || authData.studentContactRef.length > 0){
        //     authData.studentContactRef.map((item,index) =>(
        //         authData.studentContactRef[index] = {studentContactRef: item}
        //     ))
        // }
        // console.log('set field value', this.form);
        // this.form.setFieldsValue(authData);

        // if(!authData.sessionsInSchool||authData.sessionsInSchool.length == 0){
        //     var defaultIn = this.defaultTimeRangeItem();
        //     var defaultOut = this.defaultTimeRangeItem(false);
        //     this.setState({
        //         sessionsInSchool:[this.defaultTimeRangeItem(),this.defaultTimeRangeItem(),this.defaultTimeRangeItem()],
        //         sessionsAfterSchool:[this.defaultTimeRangeItem(false),this.defaultTimeRangeItem(false),this.defaultTimeRangeItem(false)]
        //     }, this.callbackAfterSetState)
        // }else{
        //     console.log('redux for sessions ',authData.sessionsInSchool);
        //     console.log('redux for sessions ',authData.sessionsAfterSchool);
        //     this.setState({
        //         sessionsInSchool:authData.sessionsInSchool,
        //         sessionsAfterSchool:authData.sessionsAfterSchool
        //     })
        // }
    }

    defaultTimeRangeItem = (isInSchool = true) => {
        if (!isInSchool) {
            return {
                "openHour": 18,
                "openMin": 0,
                "closeHour": 22,
                "closeMin": 0
            }
        }
        return {
            "openHour": 7,
            "openMin": 0,
            "closeHour": 18,
            "closeMin": 0
        }
    }


    valueForAvailabilityScheduleForOpenHour = (array, index, fieldType = 'open') => {

        if (array.length - 1 < index) {
            return moment('00:00:00', 'HH:mm:ss')
        }
        console.log('open', array[index])
        return moment(`${array[index].openHour}:${array[index].openMin}:00`, 'HH:mm:ss')

    }

    valueForAvailabilityScheduleForCloseHour = (array, index, fieldType = 'open') => {
        console.log(array, index, fieldType = 'open', 'array , index , fieldType')
        if (array.length - 1 < index) {
            return moment('00:00:00', 'HH:mm:ss')
        }

        return moment(`${array[index].closeHour}:${array[index].closeMin}:00`, 'HH:mm:ss')

    }


    onFinish = async (values) => {

        console.log(values, 'valuesvaluesvalues');
        console.log(this.props.auth.authData, 'authData');
        return false
        const { registerData } = this.props.register;
        console.log('Success:', values);
        var newRegisterData = JSON.parse(JSON.stringify(registerData));

        // update in school - after school
        newRegisterData.sessionsInSchool = this.arrDayScheduleFormat(this.state.sessionsInSchool);
        newRegisterData.sessionsAfterSchool = this.arrDayScheduleFormat(this.state.sessionsAfterSchool);

        newRegisterData.techContactRef = registerData.techContactRef.map((item, index) => {
            return item.techContactRef;
        })

        newRegisterData.studentContactRef = registerData.studentContactRef.map((item, index) => {
            return item.studentContactRef;
        })
        newRegisterData.parentInfo = null;
        newRegisterData.studentInfos = null;

        console.log('register data', newRegisterData)
        // post to server
        const response = await axios.post(url + 'users/signup', newRegisterData);
        const { success, data } = response.data;
        if (success) {
            // this.props.onFinishRegister();
            // localStorage.setItem('token', data.token);
            this.props.onContinue(true);

        } else {
            message.error(error?.response?.data?.data ?? error.message);
        }
    };

    arrDayScheduleFormat = (arr) => {
        var newArr = [];
        for (var i = 0; i < arr.length; i++) {
            if (i == 1) {
                for (var z = 1; z < 5; z++) {
                    var newSche = { ...arr[i] };
                    newSche.dayInWeek = z;
                    newArr.push(newSche);
                }
            } else {
                var newSche = { ...arr[i] };
                newSche.dayInWeek = i == 0 ? 0 : 5;
                newArr.push(newSche);
            }
        }
        return newArr;
    }

    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    setReduxForSchool(fieldName, value) {
        var obj = {};
        obj[fieldName] = value;
        this.props.setRegisterData(obj);
    }

    handleChange = school_address => {
        this.setReduxForSchool('valueForContact', school_address);
    };

    handleSelect = school_address => {
        console.log(school_address);
        this.setReduxForSchool('valueForContact', school_address);
        this.form.setFieldsValue({
            valueForContact: school_address
        })

    };

    loadCommunitiServer = () => {
        axios.post(url + getCommunitiServer).then(response => {
            const { success, data } = response.data
            console.log(response);
            if (success) {
                this.setState({
                    listCommunitiServer: data.docs,

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

                this.setState({
                    sessionsInSchool: this.state.sessionsInSchool.map((session, sessIndex) => {
                        if (sessIndex == index) {
                            return { ...session, openHour: hour, minute: minute }
                        }
                        return session;
                    })

                },
                    this.callbackAfterSetState)
                break;
            case 'inClose':
                this.setState({
                    sessionsInSchool: this.state.sessionsInSchool.map((session, sessIndex) => {
                        if (sessIndex == index) {
                            return {
                                ...session, "closeHour": hour,
                                "closeMin": minute,
                            }
                        }
                        return session;
                    })

                },
                    this.callbackAfterSetState)
                break;
            case 'afterOpen':
                this.setState({
                    sessionsAfterSchool: this.state.sessionsAfterSchool.map((session, sessIndex) => {
                        if (sessIndex == index) {
                            return {
                                ...session, "openHour": hour,
                                "openMin": minute,
                            }
                        }
                        return session;
                    })

                },
                    this.callbackAfterSetState)
                break;
            case 'afterClose':
                this.setState({
                    sessionsAfterSchool: this.state.sessionsAfterSchool.map((session, sessIndex) => {
                        if (sessIndex == index) {
                            return {
                                ...session, "closeHour": hour,
                                "closeMin": minute,
                            }
                        }
                        return session;
                    })

                },
                    this.callbackAfterSetState)
                break;
            default:
                break;
        }

    }

    callbackAfterSetState = () => {
        this.setReduxForSchool('sessionsInSchool', this.state.sessionsInSchool);
        this.setReduxForSchool('sessionsAfterSchool', this.state.sessionsAfterSchool);
    }

    onTechContactRefChange = () => {
        console.log('contact ref', this.form.getFieldsValue());
        var contactRefs = this.form.getFieldValue('techContactRef');
        console.log(contactRefs, 'contactRefscontactRefs')
        this.setReduxForSchool('techContactRef', contactRefs);
    }

    onStudentContactRefChange = () => {
        console.log('contact ref', this.form.getFieldsValue());
        var contactRefs = this.form.getFieldValue('studentContactRef');
        this.setReduxForSchool('studentContactRef', contactRefs);
    }

    render() {
        console.log(this.props.auth.authData, 'state')
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

                        ref={(ref) => { this.form = ref }}
                        initialValues={{
                            techContactRef: this.state.techContactRef,
                            studentContactRef: this.state.studentContactRef,
                        }}
                    >
                        <Form.Item
                            name="name"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.nameSchool) }]}
                        >
                            <Input
                                onChange={event => {
                                    console.log('name', event.target.value)
                                    this.setReduxForSchool('name', event.target.value)
                                }}
                                placeholder={intl.formatMessage(messages.nameSchool)} />
                        </Form.Item>
                        <Form.Item
                            name="communityServed"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.communitiesServed) }]}
                        >
                            <Select
                                onChange={event => {
                                    console.log('communityServed', event)
                                    this.setReduxForSchool('communityServed', event)
                                }}
                                placeholder={intl.formatMessage(messages.communitiesServedNote)}>
                                {this.state.listCommunitiServer?.map((item, index) => {
                                    return (
                                        <Select.Option key={index} value={item._id}>{item.name}</Select.Option>
                                    )
                                })}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="valueForContact"
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
                        <Form.List name="techContactRef">
                            {(fields, { add, remove }) => (
                                <div>
                                    {fields.map((field, index) => {
                                        return (
                                            <div key={field.key} className={field.key !== 0 && 'item-remove'}>
                                                <Form.Item
                                                    name={[field.name, index]}
                                                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.technicalReferralContact) }]}
                                                >
                                                    <Input
                                                        onChange={event => {
                                                            console.log('techContactRef123', field.key, event.target.value)
                                                            this.onTechContactRefChange();
                                                        }}
                                                        placeholder={intl.formatMessage(messages.technicalReferralContact)} />
                                                </Form.Item>
                                                {field.key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => {

                                                    remove(field.name)
                                                    this.onTechContactRefChange();
                                                }
                                                } />}
                                            </div>
                                        );
                                    }
                                    )}
                                    <div className='text-center'>
                                        <Button
                                            type="text"
                                            className='add-number-btn mb-10'
                                            icon={<BsPlusCircle size={17} className='mr-5' />}
                                            onClick={() => {
                                                add('');
                                                this.onTechContactRefChange();
                                            }}
                                        >
                                            {intl.formatMessage(messages.addContact)}
                                        </Button>
                                    </div>
                                </div>

                            )}

                        </Form.List>

                        <Form.List name="studentContactRef">
                            {(fields, { add, remove }) => (
                                <div>
                                    {fields.map((field, index) => {
                                        return (
                                            <div key={field.key} className={field.key !== 0 && 'item-remove'}>
                                                <Form.Item
                                                    name={index}
                                                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.studentReferralContact) }]}
                                                >
                                                    <Input
                                                        value={'xzcmxzncm,nxz,mcnxz,mc'}
                                                        onChange={event => {
                                                            this.onStudentContactRefChange();
                                                        }}
                                                        placeholder={intl.formatMessage(messages.studentReferralContact)} />
                                                </Form.Item>
                                                {field.key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => {

                                                    remove(field.name)
                                                    this.onStudentContactRefChange();
                                                }} />}
                                            </div>
                                        );
                                    }
                                    )}
                                    <div className='text-center'>
                                        <Button
                                            type="text"
                                            className='add-number-btn mb-10'
                                            icon={<BsPlusCircle size={17} className='mr-5' />}
                                            onClick={() => {
                                                add(null)
                                                this.onStudentContactRefChange();
                                            }}
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
                                // index = ++index
                                return (
                                    <div className='div-time' style={{
                                        display: this.state.dayIsSelected === (index + 1) ? 'block' : 'none'
                                    }}>
                                        <p className='mb-10 font-700'>{intl.formatMessage(messages.inSchoolHours)}</p>
                                        <Row gutter={14}>
                                            <Col xs={24} sm={24} md={12}>
                                                <TimePicker onChange={v => this.onSelectTimeForSesssion(index, v, 'inOpen')}
                                                    use12Hours format="h:mm a"
                                                    placeholder={intl.formatMessage(messages.from)}
                                                    value={this.valueForAvailabilityScheduleForOpenHour(this.state.sessionsInSchool, index, 'open')}
                                                />
                                            </Col>
                                            <Col xs={24} sm={24} md={12}>
                                                <TimePicker onChange={v => this.onSelectTimeForSesssion(index, v, 'inClose')} use12Hours
                                                    value={this.valueForAvailabilityScheduleForCloseHour(this.state.sessionsInSchool, index, 'close')}
                                                    format="h:mm a" placeholder={intl.formatMessage(messages.to)} />
                                            </Col>
                                        </Row>
                                        <p className='mb-10 font-700'>{intl.formatMessage(messages.afterSchoolHours)}</p>
                                        <Row gutter={14}>
                                            <Col xs={24} sm={24} md={12}>
                                                <TimePicker onChange={v => this.onSelectTimeForSesssion(index, v, 'afterOpen')} use12Hours
                                                    value={this.valueForAvailabilityScheduleForOpenHour(this.state.sessionsAfterSchool, index, 'open')}
                                                    format="h:mm a" placeholder={intl.formatMessage(messages.from)} />
                                            </Col>
                                            <Col xs={24} sm={24} md={12}>
                                                <TimePicker onChange={v => this.onSelectTimeForSesssion(index, v, 'afterClose')} use12Hours
                                                    value={this.valueForAvailabilityScheduleForCloseHour(this.state.sessionsAfterSchool, index, 'close')}
                                                    format="h:mm a" placeholder={intl.formatMessage(messages.to)} />
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
                                {intl.formatMessage(messages.update).toUpperCase()}
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Row>
        );
    }
}

const mapStateToProps = state => {
    return {
        register: state.register,
        auth: state.auth
    }
}


export default compose(connect(mapStateToProps, { setRegisterData }))(InfoSchool);
