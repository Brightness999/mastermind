import React, { Component } from 'react';
import { Row, Form, Button, Input, Select, message } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PlacesAutocomplete from 'react-places-autocomplete';

import messages from '../../messages';
import messagesLogin from '../../../../Sign/Login/messages';
import request from '../../../../../utils/api/request';
import { setInforClientParent, setUser } from '../../../../../redux/features/authSlice';
import { getDefaultValueForClient, getUserProfile } from '../../../../../utils/api/apiList';
import PageLoading from '../../../../../components/Loading/PageLoading';

class InfoParent extends Component {
	constructor(props) {
		super(props);
		this.state = {
			address: '',
			cityConnections: [],
			maritialTypes: [],
			loading: false,
		};
	}

	componentDidMount() {
		const { selectedUser, user } = this.props.auth;
		this.setState({ loading: true });
		if (window.location.pathname?.includes('changeuserprofile')) {
			request.post(getUserProfile, { id: selectedUser?._id }).then(result => {
				const { success, data } = result;
				if (success) {
					this.form?.setFieldsValue(data?.parentInfo);
				}
			}).catch(err => {
				message.error("Getting Profile" + err.message);
				console.log(err);
			})
		} else {
			const parentInfo = this.props.auth.user.parentInfo;
			this.form?.setFieldsValue(parentInfo);
		}

		user?.role > 900 && this.setState({ cityConnections: user?.adminCommunity });

		request.post(getDefaultValueForClient).then(result => {
			this.setState({ loading: false });
			const { success, data } = result;
			if (success) {
				this.setState({ maritialTypes: data?.MaritialType });
				user?.role < 900 && this.setState({ cityConnections: data?.cityConnections ?? [] });
			}
		}).catch(err => {
			console.log('get default data for client error---', err);
			this.setState({ loading: false });
		})
	}

	onFinish = (values) => {
		if (values) {
			try {
				if (window.location.pathname?.includes('changeuserprofile')) {
					this.props.dispatch(setInforClientParent({ data: { ...values, _id: this.props.auth.selectedUser?.parentInfo?._id }, token: token }));
				} else {
					const { parentInfo } = this.props.auth.user;
					const dataFrom = { ...values, _id: parentInfo._id }
					this.props.dispatch(setInforClientParent({ data: dataFrom }));
					let user = JSON.parse(JSON.stringify(this.props.auth.user));
					user.parentInfo = dataFrom;
					this.props.dispatch(setUser(user));
				}
			} catch (error) {
				message.error(error.message);
			}
		} else {
			message.warning('Not enough data');
		}
	};

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	handleChangeAddress = address => {
		this.setState({ address: address });
		this.form?.setFieldsValue({ address: address });
	};

	render() {
		const { address, cityConnections, maritialTypes, loading } = this.state;

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
													<div {...getSuggestionItemProps(suggestion, { className, style, })} key={suggestion.index}>
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
				<PageLoading loading={loading} isBackground={true} />
			</Row>
		);
	}
}

const mapStateToProps = (state) => ({ auth: state.auth });

export default compose(connect(mapStateToProps))(InfoParent);