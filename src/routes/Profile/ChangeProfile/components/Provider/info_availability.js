import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select, Checkbox, Segmented, TimePicker, Switch } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import { QuestionCircleOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import moment from 'moment';
import messages from '../../messages';
import messagesLogin from '../../../../Sign/Login/messages';

import { connect } from 'react-redux'
import { compose } from 'redux'
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import { url } from '../../../../../utils/api/baseUrl';
import axios from 'axios';
import PlacesAutocomplete from 'react-places-autocomplete';
const day_week = [
    intl.formatMessage(messages.sunday),
    intl.formatMessage(messages.monday),
    intl.formatMessage(messages.tuesday),
    intl.formatMessage(messages.wednesday),
    intl.formatMessage(messages.thursday),
    intl.formatMessage(messages.friday),
]

class InfoAvailability extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isPrivate: true,
            CancellationWindow:[],
            currentSelectedDay: day_week[4],
            service_address:''
        }
    }

    componentDidMount() {
        let {registerData} = this.props.register;
        const { authData } = this.props.auth
        console.log(day_week,'registerData')
        console.log(registerData,'registerDatazxcxzcxz')
        if (authData) {
            
        console.log(authData.manualSchedule,'manualSchedule1')
            // this.form.setFieldsValue(this.getDefaultChildObj(authData))

            this.setState({
                isPrivate: authData.isPrivate
            })
        }else{

            day_week.map((day)=>{
                this.form.setFieldValue(day, [''])
            })
        }
        this.getDataFromServer();
    }
    getDefaultChildObj(parentInfo) {
       
       
        // console.log(obj,'zxcnxzmcnm,zxncxz,m')
        return obj;
    }
    defaultTimeRangeItem = (dayInWeek)=>{
        return {
            "uid":shortid.generate()+''+Date.now(),
            "location":undefined,
            "dayInWeek":dayInWeek,
            "openHour":7,
            "openMin":0,
            "closeHour":18,
            "closeMin":0
        }
    }
    
    getDataFromServer = () => {
        axios.post(url + 'providers/get_default_values_for_provider'
        ).then(result => {
            console.log('get_default_value_for_client', result.data);
            if (result.data.success) {
                var data = result.data.data;
                this.setState({ 
                    CancellationWindow: data.CancellationWindow,
                })
            } else {
                this.setState({
                    CancellationWindow:[],
                });

            }

        }).catch(err => {
            console.log(err);
            this.setState({
                CancellationWindow:[],
            });
        })
    }


    onFinish = (values) => {
        console.log(values,'value');
        return false
        console.log('Success:', values);
        this.props.setRegisterData({
            step4: values
        });
        this.props.onContinue();
    };
    handleChange = (e) =>{
        console.log(e.target.name,'e.target.name')
        console.log(e.target.value,'e.target.value')
        return false
    }
    onFinishFailed = (errorInfo) => {
        
        console.log('Failed:', errorInfo);
    };

    onSelectDay = e => {
        console.log("selected segment date")
        if (e) {
            console.log(e);
            this.setState({
                currentSelectedDay: e
            })
        }
    }
    onSelectTimeForSesssion = (index, value, type) =>{
        const hour = value.hour()
        const minute = value.minute()
        console.log(this.form.getFieldsValue());
    }

    onChangeScheduleValue = (day,value)=>{
        console.log('all values', this.form.getFieldsValue())
        this.props.setRegisterData({
            step4: this.form.getFieldsValue()
        });
    }

    onLocationChange = (day,value)=>{
        console.log(day,value);
        this.props.setRegisterData({
            step4: this.form.getFieldsValue()
        });
    }

    onLocationSelected = (day, value , index)=>{
        console.log(day,value , this.form.getFieldValue(day) ,index );
        var arr = this.form.getFieldValue(day);
        if(arr[index] == undefined) arr[index] = {};
        arr[index].location = value;
        this.form.setFieldValue(day , arr);
        this.props.setRegisterData({
            step4: this.form.getFieldsValue()
        });
    }

    copyToFullWeek = (dayForCopy)=>{
        var arrToCopy = this.form.getFieldValue(dayForCopy);
        day_week.map((newDay)=>{
            if(newDay!=dayForCopy){
                this.form.setFieldValue(newDay,arrToCopy);
            }
        })
    }

    renderFormList(day , index){
        return <Form.List name={day} initialValue={[{ sunday: "Range 1" },]}>
            {(fields , { add, remove }) =>{
                return (
                    <div 
                        key={day}  
                        className='div-time' 
                        // style={{
                        //     display: this.state.currentSelectedDay === index ? 'block' : 'none'
                        // }}
                    >
                    {fields.map((field ) => {
                        return (
                            <div key={field.key}>
                                {day_week.map((day,index)=>{
                                    <div key={[day,field.key]}  
                                        
                                    >
                                        <Row gutter={14}>
                                            <Col xs={24} sm={24} md={12}>
                                               
                                                <Form.Item
                                                    name={[day,field.name , "from_time"]}
                                                    rules={[{ required: true, message: intl.formatMessage(messages.fromMess) }]}
                                                >
                                                    <TimePicker 
                                                    onChange={v => this.onSelectTimeForSesssion(day, v, 'inOpen')} 
                                                    use12Hours format="h:mm a" placeholder={intl.formatMessage(messages.from)} defaultOpenValue={moment('00:00:00', 'HH:mm:ss')} />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={24} md={12} className={field.key !== 0 && 'item-remove'}>
                                                {/* <TimePicker use12Hours format="h:mm a" placeholder={intl.formatMessage(messages.to)} defaultOpenValue={moment('00:00:00', 'HH:mm:ss')} /> */}
                                                <Form.Item
                                                    name={[day,field.name,"to_time"]}

                                                    rules={[{ required: true, message: intl.formatMessage(messages.toMess) }]}

                                                >
                                                    <TimePicker 
                                                    onChange={v => this.onSelectTimeForSesssion(index, v, 'inOpen')} 
                                                    use12Hours format="h:mm a" placeholder={intl.formatMessage(messages.to)} defaultOpenValue={moment('00:00:00', 'HH:mm:ss')} />
                                                </Form.Item>
                                                {field.key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />}
                                            </Col>
                                        </Row>
                                        <Form.Item
                                            name={[day ,field.name, "location"]}

                                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.location) }]}

                                        >
                                            
                                            <Input 
                                            onChange={v=>{this.onLocationChange(day , v)}}
                                            placeholder={intl.formatMessage(messages.location)}/>
                                        </Form.Item>

                                    </div>
                                })}
                            
                            </div>
                        );
                    })}     
                    <Row>
                        <Col span={8}>
                            <div className='flex flex-row items-center'>
                                <Switch size="small" value={this.state.isPrivate} onChange={v=>{
                                    console.log('switch changed',v)
                                }} />
                                <p className='font-09 ml-10 mb-0'>{intl.formatMessage(messages.privateHMGHAgents)}</p>
                            </div>
                        </Col>
                        <Col span={8}>
                            <div className='div-add-time justify-center'>
                                <BsPlusCircle size={17} className='mr-5 text-primary' />
                                <a className='text-primary' onClick={() =>{
                                        add(null)
                                        console.log('added')
                                }}>{intl.formatMessage(messages.addRange)}</a>
                            </div>
                        </Col>
                        <Col span={8}>
                            <div className='text-right div-copy-week'>
                                <a className='font-10 underline text-primary'Click={() =>{
                                        this.copyToFullWeek(day)
                                }} >{intl.formatMessage(messages.copyFullWeek)}</a>
                                <QuestionCircleOutlined className='text-primary' />
                            </div>
                        </Col>
                    </Row>       
                    </div>
                );
            }}
        </Form.List>

    }

    render() {
        
        console.log(this.props.auth.authData,'this.props.auth.authData')
        return (
            <Row justify="center" className="row-form">
                <div className='col-form col-availability'>
                    <div className='div-form-title'>
                        <p className='font-30 text-center mb-10'>{intl.formatMessage(messages.availability)}</p>
                    </div>
                    <Form
                        name="form_availability"
                        onFinish={this.onFinish}
                        onFinishFailed={this.onFinishFailed}
                        
                        ref={ref => this.form = ref}
                    >
                        <p className='font-18 mb-10 text-center'>{intl.formatMessage(messages.autoSyncCalendar)}</p>
                        <Row gutter={10}>
                            <Col span={12}>
                                <div className='div-gg'>
                                    <img src='../images/gg.png' />
                                    <p className='font-16 mb-0'>Google</p>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div className='div-gg'>
                                    <img src='../images/outlook.png' />
                                    <p className='font-16 mb-0'>Outlook</p>
                                </div>
                            </Col>
                        </Row>

                        <p className='font-18 mb-10 text-center'>{intl.formatMessage(messages.manualSchedule)}</p>
                        <div className='div-availability'>
                            <Segmented options={day_week} block={true} onChange={this.onSelectDay}   />
                            {day_week.map((day,index)=>{
                                return <div id={day}
                                style={{
                                    display: this.state.currentSelectedDay === day ? 'block' : 'none'
                                }}
                                >
                                <Form.List name={day}>
                                {(fields, { add, remove }) => (
                                    <div className='div-time'>
                                        {fields.map((field,index) => {
                                            return (
                                                <div key={field.key}
                                                >
                                                    <Row gutter={14}>
                                                        <Col xs={24} sm={24} md={12}>
                                                            <Form.Item
                                                                name={[field.name, "from_time"]}
                                                                rules={[{ required: true, message: intl.formatMessage(messages.fromMess) }]}
                                                            >
                                                                <TimePicker
                                                                onChange={v => this.onChangeScheduleValue(day , v)} 
                                                                use12Hours format="h:mm a" placeholder={intl.formatMessage(messages.from)} defaultOpenValue={moment('00:00:00', 'HH:mm:ss')} />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={12} className={field.key !== 0 && 'item-remove'}>
                                                            <Form.Item
                                                                name={[field.name, "to_time"]}

                                                                rules={[{ required: true, message: intl.formatMessage(messages.toMess) }]}

                                                            >
                                                                <TimePicker 
                                                                onChange={v => this.onChangeScheduleValue(day , v)} 
                                                                use12Hours format="h:mm a" placeholder={intl.formatMessage(messages.to)} defaultOpenValue={moment('00:00:00', 'HH:mm:ss')} />
                                                            </Form.Item>
                                                            {field.key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />}
                                                        </Col>
                                                    </Row>
                                                    <Form.Item
                                                        name={[field.name, "location"]}

                                                        rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.location) }]}

                                                    >
                                                        <PlacesAutocomplete
                                                            onChange={(e) => this.onLocationChange(day,e, "billingAddress")}
                                                            onSelect={(e) => this.onLocationSelected(day, e, index)}
                                                        >
                                                            {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                                                                <div>
                                                                    <Input {...getInputProps({
                                                                        placeholder: intl.formatMessage(messages.location) ,
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
                                                        {/* <Input placeholder={intl.formatMessage(messages.location)}/> */}
                                                        
                                                    </Form.Item>

                                                </div>
                                            );
                                        }
                                        )}
                                        <Row>
                                            <Col span={8}>
                                                <div className='flex flex-row items-center'>
                                                    <Switch size="small" 
                                                    
                                                    checked={this.state.isPrivate}
                                                    onChange={v=>{console.log('switch changed',v)

                                                        this.setState({isPrivate:v})
                                                        this.props.setRegisterData({isPrivate:v})
                                                    } }
                                                    />
                                                    <p className='font-09 ml-10 mb-0'>{intl.formatMessage(messages.privateHMGHAgents)}</p>
                                                </div>
                                            </Col>
                                            <Col span={8}>
                                                <div className='div-add-time justify-center'>
                                                    <BsPlusCircle size={17} className='mr-5 text-primary' />
                                                    <a className='text-primary' onClick={() => add()}>{intl.formatMessage(messages.addRange)}</a>
                                                </div>
                                            </Col>
                                            <Col span={8}>
                                                <div className='text-right div-copy-week'>
                                                    <a className='font-10 underline text-primary' onClick={()=>this.copyToFullWeek(day)}>{intl.formatMessage(messages.copyFullWeek)}</a>
                                                    <QuestionCircleOutlined className='text-primary' />
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                )}
                            </Form.List>
                            </div>
                            })}
                            
                            
                            
                        </div>
                        <Row gutter={14} style={{ marginLeft: '-22px', marginRight: '-22px' }}>
                            <Col xs={24} sm={24} md={13}>
                                <Form.Item
                                    name="cancellationWindow"
                                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.cancellationWindow) }]}

                                >
                                    <Select placeholder={intl.formatMessage(messages.cancellationWindow)}>
                                        {this.state.CancellationWindow.map((value,index)=>{
                                            return (<Select.Option value={index}>{value}</Select.Option>)
                                        })}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={11}>
                                <Form.Item
                                    name="cancellationFee"
                                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.cancellationFee) }]}

                                >
                                    <Input placeholder={intl.formatMessage(messages.cancellationFee)}/>
                                    {/* <Select placeholder={intl.formatMessage(messages.cancellationFee)}>
                                        <Select.Option value='st1'>st 1</Select.Option>
                                        <Select.Option value='st2'>st 2</Select.Option>
                                    </Select> */}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item className="form-btn continue-btn" >
                            <Button
                                block
                                type="primary"
                                htmlType="submit"
                            onChange={this.handleChange}
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

const mapStateToProps = state => ({
    register: state.register,
    auth: state.auth
})
export default compose(connect(mapStateToProps, { setRegisterData }))(InfoAvailability);
