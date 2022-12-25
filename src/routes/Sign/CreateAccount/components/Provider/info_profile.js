import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import PlacesAutocomplete from 'react-places-autocomplete';
import { url } from '../../../../../utils/api/baseUrl';
import axios from 'axios';
import { getCityConnections, getDefaultValueForProvider } from '../../../../../utils/api/apiList';

class InfoProfile extends Component {
	constructor(props) {
		super(props);
		this.state = {
			service_address: '',
			EmailType: [],
			ContactNumberType: [],
			contactPhoneNumber: [],
			contactEmail: [],
			CityConnections: [],
		}
	}

	componentDidMount() {
		const { registerData } = this.props.register;
		this.getDataFromServer();
		this.searchCityConnection();
		const profileInfor = registerData.profileInfor || this.getDefaultObj();
		this.form.setFieldsValue(profileInfor);
		if (!registerData.profileInfor) {
			this.props.setRegisterData({ profileInfor: this.getDefaultObj() });
		}
	}

	getDataFromServer = () => {
		axios.post(url + getDefaultValueForProvider).then(result => {
			if (result.data.success) {
				const data = result.data.data;
				this.setState({
					ContactNumberType: data?.ContactNumberType ?? [],
					EmailType: data?.EmailType ?? [],
				});
			} else {
				this.setState({
					ContactNumberType: [],
					EmailType: [],
				});
			}
		}).catch(err => {
			console.log('get default values for provider error---', err);
			this.setState({
				ContactNumberType: [],
				EmailType: [],
			});
		})
	}

	searchCityConnection() {
		axios.post(url + getCityConnections).then(result => {
			const { success, data } = result.data;
			if (success) {
				this.setState({ CityConnections: data });
			} else {
				this.setState({ CityConnections: [] });
			}
		}).catch(err => {
			console.log('get city connections error ---', err);
			this.setState({ CityConnections: [] });
		})
	}

	getDefaultObj = () => {
		return {
			firstName: "",
			lastName: "",
			agency: "",
			cityConnection: undefined,
			serviceAddress: "",
			contactEmail: [{ email: "", type: 'Personal' }],
			contactNumber: [{ phoneNumber: "", type: 'Home' }],
		};
	}

	onFinish = (values) => {
		this.props.setRegisterData({ profileInfor: values });
		this.props.onContinue();
	};

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	setValueToReduxRegisterData = (fieldName, value) => {
		const { registerData } = this.props.register;
		const profileInfor = registerData.profileInfor;
		let obj = {};
		obj[fieldName] = value;
		this.props.setRegisterData({ profileInfor: { ...profileInfor, ...obj } });
	}

	render() {
		const { service_address, CityConnections, ContactNumberType, EmailType } = this.state;

		return (
			<Row justify="center" className="row-form">
				<div className='col-form col-info-parent'>
					<div className='div-form-title'>
						<p className='font-30 text-center mb-10'>{intl.formatMessage(messages.generalInformation)}</p>
					</div>
					<Form
						name="form_profile_provider"
						layout='vertical'
						onFinish={this.onFinish}
						onFinishFailed={this.onFinishFailed}
						ref={ref => this.form = ref}
					>
						<Row gutter={14}>
							<Col xs={24} sm={24} md={12}>
								<Form.Item
									name="firstName"
									label={intl.formatMessage(messages.firstName)}
									rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.firstName) }]}
								>
									<Input onChange={e => this.setValueToReduxRegisterData("firstName", e.target.value)} placeholder={intl.formatMessage(messages.firstName)} />
								</Form.Item>
							</Col>
							<Col xs={24} sm={24} md={12}>
								<Form.Item
									name="lastName"
									label={intl.formatMessage(messages.lastName)}
									rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.lastName) }]}
								>
									<Input onChange={e => this.setValueToReduxRegisterData("lastName", e.target.value)} placeholder={intl.formatMessage(messages.lastName)} />
								</Form.Item>
							</Col>
						</Row>
						<Form.Item
							name="cityConnection"
							label={intl.formatMessage(messages.cityConnections)}
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.cityConnections) }]}
						>
							<Select
								placeholder={intl.formatMessage(messages.cityConnections)}
								showSearch
								optionFilterProp="children"
								filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
							>
								{CityConnections?.map((value, index) => (
									<Select.Option key={index} value={value._id}>{value.name}</Select.Option>
								))}
							</Select>
						</Form.Item>
						<Form.Item
							name="serviceAddress"
							label={intl.formatMessage(messages.serviceAddress)}
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.serviceAddress) }]}
						>
							<PlacesAutocomplete
								value={service_address}
								onChange={(value) => this.setValueToReduxRegisterData("serviceAddress", value)}
								onSelect={(value) => {
									this.setValueToReduxRegisterData("serviceAddress", value);
									this.form.setFieldsValue({ serviceAddress: value });
								}}
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
													<div {...getSuggestionItemProps(suggestion, { className, style })} key={suggestion.index}>
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
							name="agency"
							label={intl.formatMessage(messages.agency)}
							rules={[{ required: false }]}
						>
							<Input onChange={e => this.setValueToReduxRegisterData("agency", e.target.value)} placeholder={intl.formatMessage(messages.agency)} />
						</Form.Item>
						<Form.List name="contactNumber">
							{(fields, { add, remove }) => (
								<>
									{fields.map(({ key, name, ...restField }) => (
										<Row key={key} gutter={14}>
											<Col xs={16} sm={16} md={16}>
												<Form.Item
													{...restField}
													name={[name, 'phoneNumber']}
													label={intl.formatMessage(messages.contactNumber)}
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
													label={intl.formatMessage(messages.type)}
													rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.type) }]}
													className='bottom-0'
													style={{ marginTop: key === 0 ? 0 : 14 }}
												>
													<Select placeholder={intl.formatMessage(messages.type)}>
														{ContactNumberType?.map((value, index) => (
															<Select.Option key={index} value={value}>{value}</Select.Option>
														))}
													</Select>
												</Form.Item>
												{key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(name)} />}
											</Col>
										</Row>
									))}
									<Form.Item className='text-center mb-0'>
										<Button
											type="text"
											className='add-number-btn mb-10'
											icon={<BsPlusCircle size={17} className='mr-5' />}
											onClick={() => add()}
										>
											{intl.formatMessage(messages.addNumber)}
										</Button>
									</Form.Item>
								</>
							)}
						</Form.List>
						<Form.List name="contactEmail">
							{(fields, { add, remove }) => (
								<>
									{fields.map(({ key, name, ...restField }) => (
										<Row key={key} gutter={14}>
											<Col xs={16} sm={16} md={16}>
												<Form.Item
													{...restField}
													name={[name, 'email']}
													label={intl.formatMessage(messages.contactEmail)}
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
													label={intl.formatMessage(messages.type)}
													rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.type) }]}
													className='bottom-0'
													style={{ marginTop: key === 0 ? 0 : 14 }}
												>
													<Select placeholder={intl.formatMessage(messages.type)}>
														{EmailType?.map((value, index) => (
															<Select.Option key={index} value={value}>{value}</Select.Option>
														))}
													</Select>
												</Form.Item>
												{key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(name)} />}
											</Col>
										</Row>
									))}
									<Form.Item className='text-center mb-0'>
										<Button
											type="text"
											className='add-number-btn mb-10'
											icon={<BsPlusCircle size={17} className='mr-5' />}
											onClick={() => add()}
										>
											{intl.formatMessage(messages.addEmail)}
										</Button>
									</Form.Item>
								</>
							)}
						</Form.List>
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

const mapStateToProps = state => ({
	register: state.register,
})

export default compose(connect(mapStateToProps, { setRegisterData }))(InfoProfile);