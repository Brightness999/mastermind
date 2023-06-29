import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select, message, Switch } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import intl from 'react-intl-universal';
import { connect } from 'react-redux'
import { compose } from 'redux'
import PlacesAutocomplete from 'react-places-autocomplete';

import messages from 'routes/Sign/CreateAccount/messages';
import messagesLogin from 'routes/Sign/Login/messages';
import { setInforProvider } from 'src/redux/features/authSlice';
import request from 'utils/api/request';
import { getMyProviderInfo, getCityConnections, getUserProfile } from 'utils/api/apiList';
import PageLoading from 'components/Loading/PageLoading';
import { EmailType, ContactNumberType } from 'routes/constant';

class InfoProfile extends Component {
	constructor(props) {
		super(props);
		this.state = {
			service_address: '',
			contactEmail: [],
			cityConnections: [],
			loading: false,
			isPrivateForHmgh: false,
		}
	}

	componentDidMount() {
		const { selectedUser, user } = this.props.auth;

		this.setState({ loading: true });
		user?.role > 900 ? this.setState({ cityConnections: user?.adminCommunity }) : this.searchCityConnection();
		if (window.location.pathname?.includes('changeuserprofile')) {
			request.post(getUserProfile, { id: selectedUser?._id }).then(result => {
				this.setState({ loading: false });
				const { success, data } = result;
				if (success) {
					this.form?.setFieldsValue(data?.providerInfo);
					this.setState({ isPrivateForHmgh: data?.providerInfo?.isPrivateForHmgh });
				}
			}).catch(err => {
				message.error("Getting Profile" + err.message);
				this.setState({ loading: false });
			})
		} else {
			request.post(getMyProviderInfo).then(result => {
				this.setState({ loading: false });
				const { success, data } = result;
				if (success) {
					this.form?.setFieldsValue(data);
					this.setState({ isPrivateForHmgh: user?.providerInfo?.isPrivateForHmgh });
				}
			}).catch(err => {
				message.error("Getting Profile" + err.message);
				this.setState({ loading: false });
			})
		}
	}

	searchCityConnection() {
		request.post(getCityConnections).then(result => {
			const { success, data } = result;
			if (success) {
				this.setState({ cityConnections: data ?? [] });
			}
		})
	}

	onFinish = (values) => {
		try {
			this.props.dispatch(setInforProvider({
				...values,
				_id: window.location.pathname?.includes('changeuserprofile') ? this.props.auth.selectedUser?.providerInfo?._id : this.props.auth.user?.providerInfo?._id,
			}))
		} catch (error) {
			message.error(error.message);
		}
	};

	render() {
		const { service_address, cityConnections, loading, isPrivateForHmgh } = this.state;

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
						ref={ref => this.form = ref}
					>
						<div className="flex items-center justify-start gap-2 h-50">
							<Form.Item name="isPrivateForHmgh" className='mb-0'>
								<Switch size="small" checked={isPrivateForHmgh} onChange={(state) => this.setState({ isPrivateForHmgh: state })} />
							</Form.Item>
							<p className='font-12 mb-0'>{intl.formatMessage(messages.onlyVisibleToHmgh)}</p>
						</div>
						<Row gutter={14}>
							<Col xs={24} sm={24} md={12}>
								<Form.Item
									name="firstName"
									label={intl.formatMessage(messages.firstName)}
									className="float-label-item"
									rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.firstName) }]}
								>
									<Input placeholder={intl.formatMessage(messages.firstName)} />
								</Form.Item>
							</Col>
							<Col xs={24} sm={24} md={12}>
								<Form.Item
									name="lastName"
									label={intl.formatMessage(messages.lastName)}
									className="float-label-item"
									rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.lastName) }]}
								>
									<Input placeholder={intl.formatMessage(messages.lastName)} />
								</Form.Item>
							</Col>
						</Row>
						<Form.Item
							name="cityConnection"
							label={intl.formatMessage(messages.cityConnections)}
							className="float-label-item"
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.cityConnections) }]}
						>
							<Select
								placeholder={intl.formatMessage(messages.cityConnections)}
								showSearch
								optionFilterProp="children"
								filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
							>
								{cityConnections?.map((value, index) => (
									<Select.Option key={index} value={value._id}>{value.name}</Select.Option>
								))}
							</Select>
						</Form.Item>
						<Form.Item
							name="serviceAddress"
							label={intl.formatMessage(messages.serviceAddress)}
							className="float-label-item"
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.serviceAddress) }]}
						>
							<PlacesAutocomplete
								value={service_address}
								onChange={(value) => this.setState({ service_address: value })}
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
							className="float-label-item"
							rules={[{ required: false }]}
						>
							<Input placeholder={intl.formatMessage(messages.agency)} />
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
													className='bottom-0 float-label-item'
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
													className='bottom-0 float-label-item'
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
													className='bottom-0 float-label-item'
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
													className='bottom-0 float-label-item'
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
								{intl.formatMessage(messages.update).toUpperCase()}
							</Button>
						</Form.Item>
					</Form>
				</div>
				<PageLoading loading={loading} isBackground={true} />
			</Row>
		);
	}
}

const mapStateToProps = state => ({
	auth: state.auth
})
export default compose(connect(mapStateToProps))(InfoProfile);