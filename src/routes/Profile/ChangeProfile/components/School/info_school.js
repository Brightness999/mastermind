import React from 'react';
import { Row, Col, Form, Button, Input, Select, message } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import intl from 'react-intl-universal';
import PlacesAutocomplete from 'react-places-autocomplete';
import { connect } from 'react-redux';
import { compose } from 'redux';

import messages from 'routes/Sign/CreateAccount/messages';
import messagesLogin from 'routes/Sign/Login/messages';
import { getCommunitiServer, getMySchoolInfo, getUserProfile } from 'utils/api/apiList'
import { setInforSchool } from 'src/redux/features/authSlice';
import request from 'utils/api/request';
import PageLoading from 'components/Loading/PageLoading';
import { EmailType } from 'routes/constant';

class InfoSchool extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			school_address: '',
			listCommunitiServer: [],
			loading: false,
		}
	}

	componentDidMount() {
		const { selectedUser, user } = this.props.auth;

		this.setState({ loading: true });
		user?.role > 900 ? this.setState({ listCommunitiServer: user?.adminCommunity }) : this.loadCommunitiServer();

		if (window.location.pathname?.includes('changeuserprofile')) {
			request.post(getUserProfile, { id: selectedUser?._id }).then(result => {
				this.setState({ loading: false });
				const { success, data } = result;
				if (success) {
					this.form?.setFieldsValue(data?.schoolInfo);
				}
			}).catch(err => {
				message.error("Getting Profile" + err.message);
				this.setState({ loading: false });
			})
		} else {
			request.post(getMySchoolInfo).then(result => {
				this.setState({ loading: false });
				const { success, data } = result;
				if (success) {
					this.form?.setFieldsValue(data);
				}
			}).catch(err => {
				message.error("Getting Profile" + err.message);
				this.setState({ loading: false });
			})
		}
	}

	onFinish = (values) => {
		try {
			const { dispatch, auth } = this.props;
			dispatch(setInforSchool({ ...values, _id: window.location.pathname?.includes('changeuserprofile') ? auth.selectedUser?.schoolInfo?._id : auth.user?.schoolInfo?._id }))
		} catch (error) {
			message.error(error.message);
		}
	};

	loadCommunitiServer = () => {
		request.post(getCommunitiServer).then(result => {
			const { success, data } = result;
			if (success) {
				this.setState({ listCommunitiServer: data });
			}
			else {
				message.error(`Can't loading ${intl.formatMessage(messages.communitiesServed)}`)
			}
		}).catch(err => {
			message.error(`Can't loading ${intl.formatMessage(messages.communitiesServed)}`)
		})
	}

	render() {
		const { listCommunitiServer, school_address, loading } = this.state;

		return (
			<Row justify="center" className="row-form">
				<div className='col-form col-school'>
					<div className='div-form-title mb-10'>
						<p className='font-30 text-center mb-0'>{intl.formatMessage(messages.schoolDetails)}</p>
					</div>
					<Form
						name="form_school"
						layout='vertical'
						onFinish={this.onFinish}
						ref={(ref) => { this.form = ref }}
					>
						<Form.Item
							name="name"
							label={intl.formatMessage(messages.nameSchool)}
							className="float-label-item"
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.nameSchool) }]}
						>
							<Input placeholder={intl.formatMessage(messages.nameSchool)} />
						</Form.Item>
						<Form.Item
							name="communityServed"
							label={intl.formatMessage(messages.communitiesServed)}
							className="float-label-item"
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.communitiesServed) }]}
						>
							<Select placeholder={intl.formatMessage(messages.communitiesServedNote)}>
								{listCommunitiServer?.map((item, index) => (
									<Select.Option key={index} value={item._id}>{item.name}</Select.Option>
								))}
							</Select>
						</Form.Item>
						<Form.Item
							name="valueForContact"
							label={intl.formatMessage(messages.schoolAddress)}
							className="float-label-item"
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.schoolAddress) }]}
						>
							<PlacesAutocomplete
								value={school_address}
								onChange={(address) => this.setState({ school_address: address })}
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
						<Form.List name="contactEmail">
							{(fields, { add, remove }) => (
								<div>
									{fields.map(field => (
										<Row key={field.key} gutter={14}>
											<Col xs={16} sm={16} md={16}>
												<Form.Item
													name={[field.name, 'email']}
													label={intl.formatMessage(messages.contactEmail)}
													className='bottom-0 float-label-item'
													style={{ marginTop: field.key === 0 ? 0 : 14 }}
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
													name={[field.name, 'type']}
													label={intl.formatMessage(messages.type)}
													rules={[{ required: true }]}
													className='bottom-0 float-label-item'
													style={{ marginTop: field.key === 0 ? 0 : 14 }}
												>
													<Select placeholder={intl.formatMessage(messages.type)}>
														{EmailType?.map((value, index) => (
															<Select.Option key={index} value={value}>{value}</Select.Option>
														))}
													</Select>
												</Form.Item>
												{field.key !== 0 && (
													<BsDashCircle
														size={16}
														className='text-red icon-remove contact-email'
														onClick={() => remove(field.name)}
													/>
												)}
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
								</div>
							)}
						</Form.List>
						<Form.List name="techContactRef">
							{(fields, { add, remove }) => (
								<div>
									{fields.map((field) => (
										<div key={field.key}>
											<div className='font-16 text-center '>{intl.formatMessage(messages.technicalReferralContact)}</div>
											<div className="item-remove">
												<Form.Item
													name={[field.name, "name"]}
													label={intl.formatMessage(messages.name)}
													className="float-label-item"
												>
													<Input placeholder={intl.formatMessage(messages.name)} />
												</Form.Item>
												<BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />
											</div>
											<div className="item-remove">
												<Form.Item
													name={[field.name, "phoneNumber"]}
													label={intl.formatMessage(messages.contactNumber)}
													className="float-label-item"
													rules={[
														{
															pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$',
															message: intl.formatMessage(messages.phoneNumberValid)
														},
													]}
												>
													<Input placeholder={intl.formatMessage(messages.contactNumber)} />
												</Form.Item>
												<BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />
											</div>
											<div className="item-remove">
												<Form.Item
													name={[field.name, "email"]}
													label={intl.formatMessage(messages.contactEmail)}
													className="float-label-item"
													rules={[
														{
															type: 'email',
															message: intl.formatMessage(messagesLogin.emailNotValid)
														}
													]}
												>
													<Input placeholder={intl.formatMessage(messages.contactEmail)} />
												</Form.Item>
												<BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />
											</div>
										</div>
									))}
									<div className='text-center'>
										<Button type="text" className='add-number-btn mb-10' icon={<BsPlusCircle size={17} className='mr-5' />} onClick={() => add()}>
											{intl.formatMessage(messages.addTechContact)}
										</Button>
									</div>
								</div>
							)}
						</Form.List>
						<Form.List name="studentContactRef">
							{(fields, { add, remove }) => (
								<div>
									{fields.map((field) => (
										<div key={field.key}>
											<div className='font-16 text-center '>{intl.formatMessage(messages.studentReferralContact)}</div>
											<div className="item-remove">
												<Form.Item
													name={[field.name, "name"]}
													label={intl.formatMessage(messages.name)}
													className="float-label-item"
												>
													<Input placeholder={intl.formatMessage(messages.name)} />
												</Form.Item>
												<BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />
											</div>
											<div className="item-remove">
												<Form.Item
													name={[field.name, "phoneNumber"]}
													label={intl.formatMessage(messages.contactNumber)}
													className="float-label-item"
													rules={[
														{
															pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$',
															message: intl.formatMessage(messages.phoneNumberValid)
														},
													]}
												>
													<Input placeholder={intl.formatMessage(messages.contactNumber)} />
												</Form.Item>
												<BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />
											</div>
											<div className="item-remove">
												<Form.Item
													name={[field.name, "email"]}
													label={intl.formatMessage(messages.contactEmail)}
													className="float-label-item"
													rules={[
														{
															type: 'email',
															message: intl.formatMessage(messagesLogin.emailNotValid)
														}
													]}
												>
													<Input placeholder={intl.formatMessage(messages.contactEmail)} />
												</Form.Item>
												<BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />
											</div>
										</div>
									))}
									<div className='text-center'>
										<Button
											type="text"
											className='add-number-btn mb-10'
											icon={<BsPlusCircle size={17} className='mr-5' />}
											onClick={() => add()}
										>
											{intl.formatMessage(messages.addStudentContact)}
										</Button>
									</div>
								</div>
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

export default compose(connect(mapStateToProps))(InfoSchool);