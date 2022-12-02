import React, { Component } from 'react';
import { Row, Form, Button, Input, Select } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';
import messages from '../../messages';
import messagesLogin from '../../../../Sign/Login/messages';
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import PlacesAutocomplete from 'react-places-autocomplete';
import request from '../../../../../utils/api/request';
import { setInforClientParent, changeInforClientParent, setUser } from '../../../../../redux/features/authSlice';
import { store } from '../../../../../redux/store'
import { getDefaultValueForClient } from '../../../../../utils/api/apiList';

class InfoParent extends Component {
	constructor(props) {
		super(props);
		this.state = {
			address: '',
			cityConnections: [],
			maritialTypes: [],
		};
	}

	componentDidMount() {
		const tokenUser = localStorage.getItem('token');
		if (tokenUser) {
			const parentInfo = this.props.auth.user.parentInfo;
			this.form.setFieldsValue(parentInfo);

			request.post(getDefaultValueForClient).then(result => {
				const { success, data } = result;
				if (success) {
					this.setState({
						cityConnections: data?.cityConnections,
						maritialTypes: data?.MaritialType,
					})
				} else {
					this.setState({
						cityConnections: [],
						maritialTypes: [],
					});
				}
			}).catch(err => {
				console.log('get default data for client error---', err);
				this.setState({
					cityConnections: [],
					maritialTypes: [],
				});
			})
		}
	}

	onFinish = (values) => {
		const { parentInfo } = this.props.auth.user;
		const token = localStorage.getItem('token');
		const dataFrom = { ...values, _id: parentInfo._id }

		try {
			store.dispatch(setInforClientParent({ data: dataFrom, token: token }))
			let user = JSON.parse(JSON.stringify(this.props.auth.user));
			user.parentInfo = dataFrom;
			console.log(user);
			store.dispatch(setUser(user));
		} catch (error) {
			console.log(error, 'error')
		}
	};

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	handleChangeAddress = address => {
		this.setState({ address: address });
		this.form.setFieldsValue({ address: address });
	};

	render() {
		const { address, cityConnections, maritialTypes } = this.state;

		return (
			<Row justify="center" className="row-form">
				<div className='col-form col-info-parent'>
					<div className='div-form-title'>
						<p className='font-30 text-center mb-10'>{intl.formatMessage(messages.tellYourself)}</p>
						<p className='font-24 text-center'>{intl.formatMessage(messages.contactInformation)}</p>
					</div>
					<Form
						name="form_contact"
						layout='vertical'
						onFinish={this.onFinish}
						onFinishFailed={this.onFinishFailed}
						ref={ref => this.form = ref}
					>
						<Form.Item
							name="familyName"
							label={intl.formatMessage(messages.familyName)}
							className='float-label-item'
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.familyName) }]}
						>
							<Input placeholder={intl.formatMessage(messages.familyName)} />
						</Form.Item>
						<Form.Item
							name="address"
							label={intl.formatMessage(messages.address)}
							className='float-label-item'
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.address) }]}
						>
							<PlacesAutocomplete
								value={address}
								onChange={this.handleChangeAddress}
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
						<Form.Item
							name="cityConnection"
							label={intl.formatMessage(messages.cityConnections)}
							className='float-label-item'
							rules={[{ required: true }]}
						>
							<Select
								placeholder={intl.formatMessage(messages.cityConnections)}
								showSearch
								optionFilterProp="children"
								filterOption={(input, option) => option.children?.toLowerCase().includes(input.toLowerCase())}
							>
								{cityConnections?.map((value, index) => (
									<Select.Option key={index} value={value._id}>{value.name}</Select.Option>
								))}
							</Select>
						</Form.Item>
						<Form.Item
							name="maritialType"
							label={intl.formatMessage(messages.maritalStatus)}
							className='float-label-item'
						>
							<Select
								showSearch
								optionFilterProp="children"
								filterOption={(input, option) => option.children?.toLowerCase().includes(input.toLowerCase())}
								placeholder={intl.formatMessage(messages.maritalStatus)}
							>
								{maritialTypes?.map((type, index) => (
									<Select.Option key={index} value={index.toString()}>{type}</Select.Option>
								))}
							</Select>
						</Form.Item>
						<p className='font-16 mb-10'>{intl.formatMessage(messages.father)}</p>
						<Form.Item
							name="fatherName"
							label={intl.formatMessage(messages.fatherName)}
							className='float-label-item'
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.fatherName) }]}
						>
							<Input placeholder={intl.formatMessage(messages.fatherName)} />
						</Form.Item>
						<Form.Item
							name="fatherPhoneNumber"
							label={intl.formatMessage(messages.contactNumber)}
							className='float-label-item'
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
							<Input placeholder={intl.formatMessage(messages.phoneNumber)} />
						</Form.Item>
						<Form.Item
							name="fatherEmail"
							label={intl.formatMessage(messages.contactEmail)}
							className='float-label-item'
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
							<Input placeholder={intl.formatMessage(messages.email)} />
						</Form.Item>
						<p className='font-16 mb-10'>{intl.formatMessage(messages.mother)}</p>
						<Form.Item
							name="motherName"
							label={intl.formatMessage(messages.motherName)}
							className='float-label-item'
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.motherName) }]}>
							<Input placeholder={intl.formatMessage(messages.motherName)} />
						</Form.Item>
						<Form.Item
							name="motherPhoneNumber"
							label={intl.formatMessage(messages.contactNumber)}
							className='float-label-item'
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
							<Input placeholder={intl.formatMessage(messages.phoneNumber)} />
						</Form.Item>
						<Form.Item
							name="motherEmail"
							label={intl.formatMessage(messages.contactEmail)}
							className='float-label-item'
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
							<Input placeholder={intl.formatMessage(messages.email)} />
						</Form.Item>
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

const mapStateToProps = (state) => {
	return {
		register: state.register,
		auth: state.auth
	};
}

export default compose(connect(mapStateToProps, { setRegisterData, changeInforClientParent }))(InfoParent);