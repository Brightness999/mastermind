import React from 'react';
import { Row, Col, Form, Button, Input, Select, message } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';
import PlacesAutocomplete from 'react-places-autocomplete';
import axios from 'axios';
import { url } from '../../../../../utils/api/baseUrl';
import { getCityConnections, getDefaultValueForProvider } from '../../../../../utils/api/apiList'
import { setRegisterData, removeRegisterData } from '../../../../../redux/features/registerSlice';
import { connect } from 'react-redux';
import { compose } from 'redux';

class InfoSchool extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			school_address: '',
			listCommunitiServer: [],
			emailTypes: [],
		}
	}

	componentDidMount() {
		this.loadCommunitiServer()
		const { registerData } = this.props.register;
		if (!registerData.contactEmail || registerData.contactEmail.length == 0) {
			this.setReduxForSchool('contactEmail', [{ email: registerData?.email, type: 'Work' }]);
			this.form.setFieldsValue({ contactEmail: [{ email: registerData?.email, type: 'Work' }] });
		}
		this.form.setFieldsValue(registerData);
	}

	onFinish = async () => {
		this.props.onContinue();
	};

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	setReduxForSchool(fieldName, value) {
		let obj = {};
		obj[fieldName] = value;
		this.props.setRegisterData(obj);
	}

	handleChange = school_address => {
		this.setReduxForSchool('valueForContact', school_address);
	};

	handleSelect = school_address => {
		this.setReduxForSchool('valueForContact', school_address);
		this.form.setFieldsValue({ valueForContact: school_address });
	};

	loadCommunitiServer = () => {
		axios.post(url + getCityConnections).then(response => {
			const { success, data } = response.data;
			if (success) {
				this.setState({ listCommunitiServer: data });
			} else {
				message.error('Cant loading', intl.formatMessage(messages.communitiesServed));
			}
		}).catch(err => {
			console.log(err);
			message.error('Cant loading', intl.formatMessage(messages.communitiesServed));
		})

		axios.post(url + getDefaultValueForProvider).then(result => {
			const { success, data } = result.data;
			if (success) {
				this.setState({ emailTypes: data?.EmailType });
			} else {
				message.error('Cant loading', intl.formatMessage(messages.communitiesServed));
			}
		}).catch(err => {
			console.log(err);
			message.error('Cant loading', intl.formatMessage(messages.communitiesServed));
		})
	}

	render() {
		const { listCommunitiServer, school_address, emailTypes } = this.state;
		
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
						onFinishFailed={this.onFinishFailed}
						ref={(ref) => { this.form = ref }}
					>
						<Form.Item
							name="name"
							label={intl.formatMessage(messages.nameSchool)}
							className="float-label-item"
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.nameSchool) }]}
						>
							<Input
								onChange={event => this.setReduxForSchool('name', event.target.value)}
								placeholder={intl.formatMessage(messages.nameSchool)}
							/>
						</Form.Item>
						<Form.Item
							name="communityServed"
							label={intl.formatMessage(messages.communitiesServed)}
							className="float-label-item"
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.communitiesServed) }]}
						>
							<Select
								onChange={value => this.setReduxForSchool('communityServed', value)}
								placeholder={intl.formatMessage(messages.communitiesServedNote)}
							>
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
													<Input
														onChange={() => this.setReduxForSchool('contactEmail', this.form.getFieldValue('contactEmail'))}
														placeholder={intl.formatMessage(messages.contactEmail)}
													/>
												</Form.Item>
											</Col>
											<Col xs={8} sm={8} md={8} className='item-remove'>
												<Form.Item
													name={[field.name, 'type']}
													label={intl.formatMessage(messages.type)}
													rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.type) }]}
													className='bottom-0 float-label-item'
													style={{ marginTop: field.key === 0 ? 0 : 14 }}
												>
													<Select placeholder={intl.formatMessage(messages.type)} onChange={() => this.setReduxForSchool('contactEmail', this.form.getFieldValue('contactEmail'))}>
														{emailTypes?.map((value, index) => (
															<Select.Option key={index} value={value}>{value}</Select.Option>
														))}
													</Select>
												</Form.Item>
												{field.key !== 0 && <BsDashCircle size={16} className='text-red icon-remove contact-email' onClick={() => { remove(field.name); this.setReduxForSchool('contactEmail', this.form.getFieldValue('contactEmail')); }} />}
											</Col>
										</Row>
									))}
									<Form.Item className='text-center mb-0'>
										<Button
											type="text"
											className='add-number-btn mb-10'
											icon={<BsPlusCircle size={17} className='mr-5' />}
											onClick={() => { add(); this.setReduxForSchool('contactEmail', this.form.getFieldValue('contactEmail')); }}
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
													<Input placeholder={intl.formatMessage(messages.name)} onChange={() => this.setReduxForSchool('techContactRef', this.form.getFieldValue('techContactRef'))} />
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
													<Input placeholder={intl.formatMessage(messages.contactNumber)} onChange={() => this.setReduxForSchool('techContactRef', this.form.getFieldValue('techContactRef'))} />
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
													<Input placeholder={intl.formatMessage(messages.contactEmail)} onChange={() => this.setReduxForSchool('techContactRef', this.form.getFieldValue('techContactRef'))} />
												</Form.Item>
												<BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />
											</div>
										</div>
									))}
									<div className='text-center'>
										<Button type="text" className='add-number-btn mb-10' icon={<BsPlusCircle size={17} className='mr-5' />} onClick={() => add(null)}>
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
													<Input placeholder={intl.formatMessage(messages.name)} onChange={() => this.setReduxForSchool('studentContactRef', this.form.getFieldValue('studentContactRef'))} />
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
													<Input placeholder={intl.formatMessage(messages.contactNumber)} onChange={() => this.setReduxForSchool('studentContactRef', this.form.getFieldValue('studentContactRef'))} />
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
													<Input placeholder={intl.formatMessage(messages.contactEmail)} onChange={() => this.setReduxForSchool('studentContactRef', this.form.getFieldValue('studentContactRef'))} />
												</Form.Item>
												<BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />
											</div>
										</div>
									))}
									<div className='text-center'>
										<Button type="text" className='add-number-btn mb-10' icon={<BsPlusCircle size={17} className='mr-5' />} onClick={() => add(null)}>
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
	register: state.register
})

export default compose(connect(mapStateToProps, { setRegisterData, removeRegisterData }))(InfoSchool);
