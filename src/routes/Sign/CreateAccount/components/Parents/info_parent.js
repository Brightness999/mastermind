import React, { Component } from 'react';
import { Row, Form, Button, Input, Select } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PlacesAutocomplete from 'react-places-autocomplete';

import messages from '../../messages';
import messagesLogin from '../../../Login/messages';
import { setRegisterData } from '../../../../../redux/features/registerSlice';

class InfoParent extends Component {
	constructor(props) {
		super(props);
		this.state = {
			address: '',
			cityConnections: this.props.auth.generalData?.cityConnections ?? [],
		};
	}

	componentDidMount() {
		const { registerData } = this.props.register;
		if (!registerData.parentInfo) {
			this.props.setRegisterData({ parentInfo: this.getDefaultObj() });
		}
		const parentInfo = registerData.parentInfo || this.getDefaultObj();
		this.form?.setFieldsValue(parentInfo);

		if (window.location.pathname.includes('administrator')) {
			this.setState({ cityConnections: this.props.auth?.user?.adminCommunity });
		}
	}

	getDefaultObj = () => {
		return {
			maritialType: undefined,
			address: '',
			familyName: '',
			fatherName: '',
			fatherPhoneNumber: '',
			fatherEmail: '',
			motherName: '',
			motherPhoneNumber: '',
			motherEmail: '',
			cityConnection: undefined,
		};
	}

	getDefaultValueInitForm = (key) => {
		const obj = this.getDefaultObj();
		return obj[key];
	}

	setValueToReduxRegisterData = (fieldName, value) => {
		const { registerData } = this.props.register;
		const parentInfo = registerData.parentInfo;
		let obj = {};
		obj[fieldName] = value;
		this.props.setRegisterData({ parentInfo: { ...parentInfo, ...obj } });
	}

	defaultOnValueChange = (event, fieldName) => {
		const value = event.target.value;
		this.setValueToReduxRegisterData(fieldName, value);
	}

	defaultOnChangeDropdownValue = (value, fieldName) => {
		this.setValueToReduxRegisterData(fieldName, value);
	}

	onFinish = (values) => {
		this.props.setRegisterData({ parentInfo: values });
		this.props.onContinue();
	};

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	handleChangeAddress = address => {
		this.setState({ address: address });
		this.setValueToReduxRegisterData('address', address);
	};

	handleSelectAddress = address => {
		this.form?.setFieldsValue({ address: address })
		this.setValueToReduxRegisterData('address', address);
	};

	render() {
		const { address, cityConnections } = this.state;
		const { maritialTypes } = this.props.auth.generalData;

		return (
			<Row justify="center" className="row-form">
				<div className='col-form col-info-parent'>
					<div className='div-form-title'>
						<p className='font-30 text-center'>{intl.formatMessage(messages.parentInformation)}</p>
					</div>
					<Form
						name="form_contact"
						layout='vertical'
						onFinish={this.onFinish}
						onFinishFailed={this.onFinishFailed}
						ref={ref => this.form = ref}
					>
						<p className='font-16 mb-10 text-bold'>{intl.formatMessage(messages.family)}</p>
						<Form.Item
							name="familyName"
							label={intl.formatMessage(messages.familyName)}
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.familyName) }]}
						>
							<Input
								onChange={v => this.defaultOnValueChange(v, "familyName")}
								placeholder={intl.formatMessage(messages.familyName)}
							/>
						</Form.Item>
						<Form.Item
							name="address"
							label={intl.formatMessage(messages.address)}
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.address) }]}
						>
							<PlacesAutocomplete
								value={address}
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
							name="cityConnection"
							label={intl.formatMessage(messages.cityConnections)}
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.cityConnections) }]}
						>
							<Select
								placeholder={intl.formatMessage(messages.cityConnections)}
								showSearch
								optionFilterProp="children"
								filterOption={(input, option) => option.children?.toLowerCase().includes(input.toLowerCase())}
								onChange={(value) => this.setValueToReduxRegisterData("cityConnection", value)}
							>
								{cityConnections?.map((value, index) => (
									<Select.Option key={index} value={value._id}>{value.name}</Select.Option>
								))}
							</Select>
						</Form.Item>
						<Form.Item name="maritialType" label={intl.formatMessage(messages.maritalStatus)}>
							<Select
								onChange={v => this.defaultOnChangeDropdownValue(v, "maritialType")}
								placeholder={intl.formatMessage(messages.maritalStatus)}
							>
								{maritialTypes?.map((type, index) => (
									<Select.Option key={index} value={index}>{type}</Select.Option>
								))}
							</Select>
						</Form.Item>
						<p className='font-16 mb-10 text-bold'>{intl.formatMessage(messages.father)}</p>
						<Form.Item
							name="fatherName"
							label={intl.formatMessage(messages.name)}
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.fatherName) }]}
						>
							<Input
								onChange={v => this.defaultOnValueChange(v, "fatherName")}
								placeholder={intl.formatMessage(messages.fatherName)}
							/>
						</Form.Item>
						<Form.Item
							name="fatherPhoneNumber"
							label={intl.formatMessage(messages.phoneNumber)}
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
								onChange={v => this.defaultOnValueChange(v, "fatherPhoneNumber")}
								placeholder={intl.formatMessage(messages.phoneNumber)}
							/>
						</Form.Item>
						<Form.Item
							name="fatherEmail"
							label={intl.formatMessage(messages.email)}
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
								onChange={v => this.defaultOnValueChange(v, "fatherEmail")}
								placeholder={intl.formatMessage(messages.email)}
							/>
						</Form.Item>
						<p className='font-16 mb-10 text-bold'>{intl.formatMessage(messages.mother)}</p>
						<Form.Item
							name="motherName"
							label={intl.formatMessage(messages.name)}
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.motherName) }]}>
							<Input
								onChange={v => this.defaultOnValueChange(v, "motherName")}
								placeholder={intl.formatMessage(messages.motherName)}
							/>
						</Form.Item>
						<Form.Item
							name="motherPhoneNumber"
							label={intl.formatMessage(messages.phoneNumber)}
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
								onChange={v => this.defaultOnValueChange(v, "motherPhoneNumber")}
								placeholder={intl.formatMessage(messages.phoneNumber)}
							/>
						</Form.Item>
						<Form.Item
							name="motherEmail"
							label={intl.formatMessage(messages.email)}
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
								onChange={v => this.defaultOnValueChange(v, "motherEmail")}
								placeholder={intl.formatMessage(messages.email)}
							/>
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

const mapStateToProps = (state) => ({
	register: state.register,
	auth: state.auth,
})

export default compose(connect(mapStateToProps, { setRegisterData }))(InfoParent);