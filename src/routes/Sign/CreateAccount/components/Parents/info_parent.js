import React, { Component } from 'react';

import { Row, Form, Button, Input, Select } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import PlacesAutocomplete from 'react-places-autocomplete';


class InfoParent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            address: '',
            defaultProps: {
                center: {
                    lat: 10.99835602,
                    lng: 77.01502627
                },
                zoom: 11
            },
            defaultLocation: {
                lat: 10.99835602,
                lng: 77.01502627
            }
        };
    }


    componentDidMount() {
        
        const {registerData} = this.props.register;
        
        if(!registerData.parentInfo){
            this.props.setRegisterData({parentInfo:this.getDefaultObj() });
        }
        var parentInfo = registerData.parentInfo||this.getDefaultObj();
        this.form.setFieldsValue(parentInfo);
    }

    getDefaultObj=()=>{
        return {
            "maritialType": '0',
            "address":"",
            "familyName": "wong",
            "fatherName": "su",
            "fatherPhoneNumber": "0766667020",
            "fatherEmail": "123@bcd.com",
            "motherName": "fong",
            "motherPhoneNumber": "0766667020",
            "motherEmail": "321@dfg.com"
        };
    }

    getDefaultValueInitForm=(key)=>{
        var obj = this.getDefaultObj();
        return obj[key];
        
    }

    setValueToReduxRegisterData = (fieldName , value)=>{
        const {registerData} = this.props.register;
        var parentInfo = registerData.parentInfo;
        
        var obj = {};
        obj[fieldName] = value;
        this.props.setRegisterData({parentInfo:{...parentInfo,...obj}});
    }

    defaultOnValueChange = (event , fieldName)=>{
        
        var value = event.target.value;
        console.log(fieldName , value);
        this.setValueToReduxRegisterData(fieldName, value);
    }

    onFinish = (values) => {
        console.log('Success:', values);
        this.props.setRegisterData({parentInfo:values });
        // localStorage.setItem('inforParent', JSON.stringify(values));
        
        this.props.onContinue();
    };
    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    handleChangeAddress = address => {
        console.log('address',address);
        this.setState({address: address });
        this.setValueToReduxRegisterData('address', address);
    };

    handleSelectAddress = address => {
        console.log('address',address);
        this.form.setFieldsValue({
            address:address
        })
        this.setValueToReduxRegisterData('address', address);
        // geocodeByAddress(address)
        //     .then(results => getLatLng(results[0]))
        //     .then(latLng => console.log('Success', latLng))
        //     .catch(error => console.error('Error', error));
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
                        onFinish={this.onFinish}
                        onFinishFailed={this.onFinishFailed}
                        ref={ref => this.form = ref}
                        
                    >
                        <Form.Item
                            name="familyName"
                            rules={[
                                {
                                    required: true,
                                    message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.familyName)
                                }
                            ]}
                        >
                            <Input 
                            onChange={v=>this.defaultOnValueChange(v, "familyName")}
                            placeholder={intl.formatMessage(messages.familyName)} 
                            />
                        </Form.Item>
                        <Form.Item
                            name="address"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.address) }]}
                        >
                            <PlacesAutocomplete
                                value={this.state.address}
                                onChange={this.handleChangeAddress}
                                onSelect={this.handleSelectAddress}
                            >
                                {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                                    <div>
                                        <Input {...getInputProps({
                                            placeholder: 'Search Places ...',
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
                        <Form.Item name="maritialType" rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.maritalStatus) }]}
                        >
                            <Select 
                            onChange={v=>this.defaultOnValueChange(v, "maritialType")}
                            placeholder={intl.formatMessage(messages.maritalStatus)}>
                                <Select.Option value='0'>Married</Select.Option>
                                <Select.Option value='1'>Widowed</Select.Option>
                                <Select.Option value='2'>Separated</Select.Option>
                                <Select.Option value='3'>Divorced</Select.Option>
                            </Select>
                        </Form.Item>
                        <p className='font-16 mb-10'>{intl.formatMessage(messages.father)}</p>
                        <Form.Item
                            name="fatherName"
                            rules={[
                                {
                                    required: true,
                                    message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.fatherName)
                                }
                            ]}
                        >
                            <Input 
                            onChange={v=>this.defaultOnValueChange(v, "fatherName")}
                            placeholder={intl.formatMessage(messages.fatherName)} />
                        </Form.Item>
                        <Form.Item
                            name="fatherPhoneNumber"
                            rules={[
                                {
                                    required: true,
                                    message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.phoneNumber)
                                },
                                {
                                    pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$',
                                    message: intl.formatMessage(messages.phoneNumberValid)
                                },
                            ]}
                        >
                            <Input 
                            onChange={v=>this.defaultOnValueChange(v,"fatherPhoneNumber" )}
                            placeholder={intl.formatMessage(messages.phoneNumber)} />
                        </Form.Item>
                        <Form.Item
                            name="fatherEmail"
                            rules={[
                                {
                                    required: true,
                                    message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.email)
                                },
                                {
                                    type: 'email',
                                    message: intl.formatMessage(messagesLogin.emailNotValid)
                                }
                            ]}>
                            <Input 
                            onChange={v=>this.defaultOnValueChange(v, "fatherEmail")}
                            placeholder={intl.formatMessage(messages.email)} />
                        </Form.Item>

                        <p className='font-16 mb-10'>{intl.formatMessage(messages.mother)}</p>
                        <Form.Item
                            name="motherName"
                            rules={[
                                {
                                    required: true,
                                    message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.motherName)
                                }
                            ]}>
                            <Input 
                            onChange={v=>this.defaultOnValueChange(v, "motherName")}
                            placeholder={intl.formatMessage(messages.motherName)} />
                        </Form.Item>
                        <Form.Item
                            name="motherPhoneNumber"
                            rules={[
                                {
                                    required: true,
                                    message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.phoneNumber)
                                },
                                {
                                    pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$',
                                    message: intl.formatMessage(messages.phoneNumberValid)
                                },
                            ]}
                        >
                            <Input 
                            onChange={v=>this.defaultOnValueChange(v, "motherPhoneNumber")}
                            placeholder={intl.formatMessage(messages.phoneNumber)} />
                        </Form.Item>
                        <Form.Item
                            name="motherEmail"
                            rules={[
                                {
                                    required: true,
                                    message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.email)
                                },
                                {
                                    type: 'email',
                                    message: intl.formatMessage(messagesLogin.emailNotValid)
                                }
                            ]}
                        >
                            <Input 
                            onChange={v=>this.defaultOnValueChange(v, "motherEmail")}
                            placeholder={intl.formatMessage(messages.email)} />
                        </Form.Item>

                        <Form.Item className="form-btn continue-btn" >
                            <Button
                                block
                                type="primary"
                                htmlType="submit"
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

const mapStateToProps = (state) => {
    console.log('state in parent', state);
    return {
        register: state.register,
    };
}

export default compose(connect(mapStateToProps, { setRegisterData }))(InfoParent);