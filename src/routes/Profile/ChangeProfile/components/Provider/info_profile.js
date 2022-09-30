import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../../Sign/Login/messages';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import PlacesAutocomplete from 'react-places-autocomplete';

import { url } from '../../../../../utils/api/baseUrl';
import axios from 'axios';
import { setInforProvider, changeInfor } from '../../../../../redux/features/authSlice';
import { store } from '../../../../../redux/store'
class InfoProfile extends Component {
    constructor(props) {

        super(props);

        console.log('props', props);

        this.state = {
            dataForm: [],
            phone_contact: [
                { phone: "Phone 1" },
            ],
            email_contact: [
                { email: "Email 1" },
            ],
            // infor_profile: 
            service_address: '',
            billing_address: '',
            EmailType: [],
            ContactNumberType: [],

            contactPhoneNumber: [],
            contactEmail: [],
            CityConnections: [],
        }
    }


    componentDidMount() {
        // const { registerData } = this.props.register;
        // const { authData } = this.props;

        this.getDataFromServer();
        this.searchCityConnection('');
        // var profileInfor = this.getDefaultObj(authData);
        // this.setState({ dataForm: authData })
        // this.form.setFieldsValue(profileInfor);

        const tokenUser = localStorage.getItem('token');

        axios.post(url + 'providers/get_my_provider_info', {}, {
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
        })

        // if (!authData) {
        //     this.props.setRegisterData({ profileInfor: this.getDefaultObj() });
        // }

    }

    getDataFromServer = () => {
        axios.post(url + 'providers/get_default_values_for_provider'
        ).then(result => {
            console.log('get_default_value_for_client', result.data);
            if (result.data.success) {
                var data = result.data.data;
                this.setState({ ContactNumberType: data.ContactNumberType, EmailType: data.EmailType, })
            } else {
                this.setState({
                    checkEmailExist: false,
                });

            }

        }).catch(err => {
            console.log(err);
            this.setState({
                checkEmailExist: false,
            });
        })
    }


    searchCityConnection(value) {
        axios.post(url + 'providers/get_city_connections'
        ).then(result => {
            console.log('get_city_connections', result.data);
            if (result.data.success) {
                var data = result.data.data;
                console.log('get_city_connections', data.docs);
                this.setState({ CityConnections: data.docs })
            } else {
                this.setState({
                    CityConnections: [],
                });

            }

        }).catch(err => {
            console.log(err);
            this.setState({
                CityConnections: [],
            });
        })

    }



    getDefaultObj = (data) => {
        return {
            agency: data.agency,
            billingAddress: data.billingAddress,
            cityConnection: undefined,
            licenseNumber: data.licenseNumber,
            proExp: data.proExp,
            referredToAs: data.referredToAs,
            serviceAddress: data.serviceAddress,
            contactEmail: data.contactEmail,
            contactNumber: data.contactNumber
        };
    }
    updateProfile = async () => {
        const { dataForm } = this.state
        const { authData } = this.props

        console.log('dataForm', this.props);
        return

        const token = localStorage.getItem('token');
        const values = await this.form.validateFields();
        const valuesForm = { ...values, id: authData.id }
        try {
            store.dispatch(setInforProvider({ data: valuesForm, token: token }))
            this.props.changeInfor(dataForm)
        } catch (error) {
            console.log(error, 'error')
        }
    }
    onFinish = (values) => {
        console.log('Success:', values);
    };

    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    setValueToReduxRegisterData = (fieldName, value) => {
        const { registerData } = this.props.register;
        var profileInfor = registerData.profileInfor;
        var obj = {};
        obj[fieldName] = value;
        console.log(obj);
        this.props.setRegisterData({ profileInfor: { ...profileInfor, ...obj } });
    }

    defaultOnValueChange = (event, fieldName) => {
        const { dataForm } = this.state
        var value = event.target.value;
        const newData = { ...dataForm }
        newData[fieldName] = value
        this.setState({ dataForm: newData })
        // this.setValueToReduxRegisterData(fieldName, value);
    }

    onConnectionsChanged = (selected) => {
        console.log('connect changed', selected);
    }

    handelChange = (event, fieldName) => {
        var value = event;
        console.log(fieldName, value);
        this.setValueToReduxRegisterData(fieldName, value);
    }

    handleSelect = (value, fieldName) => {
        console.log(value, fieldName);
        this.setValueToReduxRegisterData(fieldName, value);
        this.form.setFieldsValue({ [fieldName]: value });
    }

    updateProfile = async () => {
        const { user } = this.props.auth;

        console.log('updateProfile', user);

        const { providerInfo } = user

        const token = localStorage.getItem('token');
        const values = await this.form.validateFields();

        const dataFrom = { ...values, _id: providerInfo }
        try {
            store.dispatch(setInforProvider({ data: dataFrom, token: token }))
        } catch (error) {
            console.log(error, 'error')
        }
    }

    render() {
        const children = [];

        for (let i = 10; i < 36; i++) {
            children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
        }

        const handleChange = (value) => {
            console.log(`selected ${value}`);
        };
        return (
            <Row justify="center" className="row-form">
                <div className='col-form col-info-parent'>
                    <div className='div-form-title'>
                        <p className='font-30 text-center mb-10'>{intl.formatMessage(messages.tellYourself)}</p>
                    </div>
                    <Form
                        name="form_profile_provider"
                        onFinish={this.onFinish}
                        onFinishFailed={this.onFinishFailed}
                        ref={ref => this.form = ref}
                    >
                        {/* <Form.Item
                            name="legal_name"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.legalName) }]}
                        >
                            <Input onChange={v=>this.defaultOnValueChange(v, "familyName")} placeholder={intl.formatMessage(messages.legalName)} />
                        </Form.Item> */}
                        <Form.Item
                            name="referredToAs"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.referredAs) }]}
                        >
                            <Input onChange={v => this.defaultOnValueChange(v, "referredToAs")} placeholder={intl.formatMessage(messages.referredAs)} />
                        </Form.Item>
                        <Form.Item
                            name="serviceAddress"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.serviceAddress) }]}
                        >
                            <PlacesAutocomplete
                                value={this.state.service_address}
                                onChange={(e) => this.handelChange(e, "serviceAddress")}
                                onSelect={(e) => this.handleSelect(e, "serviceAddress")}
                            >
                                {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                                    <div>
                                        <Input {...getInputProps({
                                            placeholder: 'Service Address',
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
                        <Form.Item
                            name="billingAddress"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.billingAddress) }]}
                        >
                            <PlacesAutocomplete
                                value={this.state.billing_address}
                                onChange={(e) => this.handelChange(e, "billingAddress")}
                                onSelect={(e) => this.handleSelect(e, "billingAddress")}
                            >
                                {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                                    <div>
                                        <Input {...getInputProps({
                                            placeholder: 'Billing Address',
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
                            {/* <Select placeholder={intl.formatMessage(messages.billingAddress)}>
                                <Select.Option value='a1'>address 1</Select.Option>
                                <Select.Option value='a2'>address 2</Select.Option>
                            </Select> */}
                        </Form.Item>
                        <Form.Item
                            name="cityConnection"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.cityConnections) }]}

                        >
                            <Select
                                onChange={v => this.onConnectionsChanged(v, "cityConnection")}
                                placeholder={intl.formatMessage(messages.cityConnections)}
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                            >
                                {this.state.CityConnections.map((value, index) => {
                                    return (<Select.Option value={value._id}>{value.name}</Select.Option>)
                                })}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="licenseNumber"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.licenseNumber) }]}
                        >
                            <Input onChange={v => this.defaultOnValueChange(v, "licenseNumber")} placeholder={intl.formatMessage(messages.licenseNumber)} />
                        </Form.Item>
                        <Form.Item
                            name="agency"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.agency) }]}
                        >
                            <Input onChange={v => this.defaultOnValueChange(v, "agency")} placeholder={intl.formatMessage(messages.agency)} />
                        </Form.Item>
                        <Form.List name="contactNumber mb-10">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Row key={key} gutter={14}>
                                            <Col xs={16} sm={16} md={16}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'phoneNumber']}
                                                    className='bottom-0'
                                                    style={{ marginTop: key === 0 ? 0 : 14 }}
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.contactNumber)
                                                        },
                                                        {
                                                            pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$',
                                                            message: intl.formatMessage(messages.phoneNumberValid)
                                                        },
                                                    ]}

                                                >
                                                    <Input placeholder={intl.formatMessage(messages.contactNumber)} />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={8} sm={8} md={8} className='item-remove'>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'type']}
                                                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.type) }]}
                                                    className='bottom-0'
                                                    style={{ marginTop: key === 0 ? 0 : 14 }}
                                                >
                                                    <Select placeholder={intl.formatMessage(messages.type)}>
                                                        {this.state.ContactNumberType.map((value, index) => {
                                                            return (<Select.Option value={index}>{value}</Select.Option>)
                                                        })}
                                                    </Select>
                                                </Form.Item>
                                                {key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(name)} />}
                                            </Col>
                                        </Row>
                                    ))}
                                </>
                            )}
                        </Form.List>

                        <Form.List name="contactEmail mb-10">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Row key={key} gutter={14}>
                                            <Col xs={16} sm={16} md={16}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'email']}
                                                    className='bottom-0'
                                                    style={{ marginTop: key === 0 ? 0 : 14 }}
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.contactEmail)
                                                        },
                                                        {
                                                            type: 'email',
                                                            message: intl.formatMessage(messagesLogin.emailNotValid)
                                                        }
                                                    ]}

                                                >
                                                    <Input placeholder={intl.formatMessage(messages.contactEmail)} />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={8} sm={8} md={8} className='item-remove'>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'type']}
                                                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.type) }]}
                                                    className='bottom-0'
                                                    style={{ marginTop: key === 0 ? 0 : 14 }}
                                                >

                                                    <Select placeholder={intl.formatMessage(messages.type)}>
                                                        {this.state.EmailType.map((value, index) => {
                                                            return (<Select.Option value={index}>{value}</Select.Option>)
                                                        })}
                                                    </Select>
                                                </Form.Item>
                                                {key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(name)} />}
                                            </Col>
                                        </Row>
                                    ))}
                                </>
                            )}
                        </Form.List>

                        <Form.Item
                            name="proExp"
                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.professionalExperience) }]}
                        >
                            <Input.TextArea onChange={v => this.defaultOnValueChange(v, "proExp")} rows={4} placeholder={intl.formatMessage(messages.professionalExperience)} />
                        </Form.Item>

                        <Form.Item className="form-btn continue-btn" >
                            <Button
                                block
                                type="primary"
                                htmlType="submit"
                                onClick={this.updateProfile}
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
    authData: state.auth.authData,
    auth: state.auth
})
export default compose(connect(mapStateToProps, { setRegisterData, changeInfor }))(InfoProfile);