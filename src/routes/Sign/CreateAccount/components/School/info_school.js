import React from 'react';
import { Row, Col, Form, Button, Input, Select, Segmented, TimePicker, message } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import moment from 'moment';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';
import PlacesAutocomplete from 'react-places-autocomplete';
import axios from 'axios';
import { url } from '../../../../../utils/api/baseUrl';
import { getCityConnections, getDefaultValueForProvider, userSignUp } from '../../../../../utils/api/apiList'
import { setRegisterData, removeRegisterData } from '../../../../../redux/features/registerSlice';
import { connect } from 'react-redux';
import { compose } from 'redux';

class InfoSchool extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			school_address: '',
			listCommunitiServer: [],
			dayIsSelected: 1,
			sessionsInSchool: [],
			sessionsAfterSchool: [],
			emailTypes: [],
		}
	}

	componentDidMount() {
		this.loadCommunitiServer()
		const { registerData } = this.props.register;
		if (!registerData.techContactRef || registerData.techContactRef.length == 0) {
			this.setReduxForSchool('techContactRef', ['']);
			this.form.setFieldsValue({ techContactRef: [""] });
		}
		if (!registerData.studentContactRef || registerData.studentContactRef.length == 0) {
			this.setReduxForSchool('studentContactRef', ['']);
			this.form.setFieldsValue({ studentContactRef: [""] });
		}
		if (!registerData.contactEmail || registerData.contactEmail.length == 0) {
			this.setReduxForSchool('contactEmail', [{ email: "", type: 'Personal' }]);
			this.form.setFieldsValue({ contactEmail: [{ email: "", type: 'Personal' }] });
		}
		this.form.setFieldsValue(registerData);
		if (!registerData.sessionsInSchool || registerData.sessionsInSchool.length == 0) {
			this.setState({
				sessionsInSchool: [this.defaultTimeRangeItem(), this.defaultTimeRangeItem(), this.defaultTimeRangeItem()],
				sessionsAfterSchool: [this.defaultTimeRangeItem(false), this.defaultTimeRangeItem(false), this.defaultTimeRangeItem(false)]
			}, this.callbackAfterSetState)
		} else {
			this.setState({
				sessionsInSchool: registerData.sessionsInSchool,
				sessionsAfterSchool: registerData.sessionsAfterSchool
			})
		}
	}

	defaultTimeRangeItem = (isInSchool = true) => {
		if (!isInSchool) {
			return {
				"openHour": 18,
				"openMin": 0,
				"closeHour": 22,
				"closeMin": 0
			}
		}
		return {
			"openHour": 7,
			"openMin": 0,
			"closeHour": 18,
			"closeMin": 0
		}
	}

	valueForAvailabilityScheduleForOpenHour = (array, index) => {
		if (array.length - 1 < index) {
			return moment('00:00:00', 'HH:mm:ss')
		}
		return moment(`${array[index].openHour}:${array[index].openMin}:00`, 'HH:mm:ss')
	}

	valueForAvailabilityScheduleForCloseHour = (array, index) => {
		if (array.length - 1 < index) {
			return moment('00:00:00', 'HH:mm:ss')
		}
		return moment(`${array[index].closeHour}:${array[index].closeMin}:00`, 'HH:mm:ss')
	}


	onFinish = async () => {
		const { registerData } = this.props.register;
		let newRegisterData = JSON.parse(JSON.stringify(registerData));

		// update in school - after school
		newRegisterData.sessionsInSchool = this.arrDayScheduleFormat(this.state.sessionsInSchool);
		newRegisterData.sessionsAfterSchool = this.arrDayScheduleFormat(this.state.sessionsAfterSchool);
		newRegisterData.techContactRef = registerData.techContactRef?.map((item) => item.techContactRef);
		newRegisterData.studentContactRef = registerData.studentContactRef?.map((item) => item.studentContactRef);

		// post to server
		const response = await axios.post(url + userSignUp, newRegisterData);
		const { success } = response.data;
		if (success) {
			this.props.onContinue(true);
			this.props.removeRegisterData();
		} else {
			message.error(error?.response?.data?.data ?? error.message);
		}
	};

	arrDayScheduleFormat = (arr) => {
		const newArr = [];
		for (let i = 0; i < arr.length; i++) {
			if (i == 1) {
				for (let z = 1; z < 5; z++) {
					let newSche = { ...arr[i] };
					newSche.dayInWeek = z;
					newArr.push(newSche);
				}
			} else {
				let newSche = { ...arr[i] };
				newSche.dayInWeek = i == 0 ? 0 : 5;
				newArr.push(newSche);
			}
		}
		return newArr;
	}

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
				this.setState({ listCommunitiServer: data.docs });
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

	onSelectDay = e => {
		if (e) {
			this.setState({ dayIsSelected: e })
		}
	}

	onSelectTimeForSesssion(index, value, type) {
		const hour = value ? value.hour() : 0;
		const minute = value ? value.minute() : 0;

		switch (type) {
			case 'inOpen':
				this.setState({
					sessionsInSchool: this.state.sessionsInSchool.map((session, sessIndex) => {
						if (sessIndex == index) {
							return { ...session, openHour: hour, minute: minute }
						}
						return session;
					}),
					fromInSchool: value,
				},
					this.callbackAfterSetState)
				break;
			case 'inClose':
				this.setState({
					sessionsInSchool: this.state.sessionsInSchool.map((session, sessIndex) => {
						if (sessIndex == index) {
							return {
								...session, "closeHour": hour,
								"closeMin": minute,
							}
						}
						return session;
					}),
					toInSchool: value,
				},
					this.callbackAfterSetState)
				break;
			case 'afterOpen':
				this.setState({
					sessionsAfterSchool: this.state.sessionsAfterSchool.map((session, sessIndex) => {
						if (sessIndex == index) {
							return {
								...session, "openHour": hour,
								"openMin": minute,
							}
						}
						return session;
					}),
					fromAfterSchool: value,
				},
					this.callbackAfterSetState)
				break;
			case 'afterClose':
				this.setState({
					sessionsAfterSchool: this.state.sessionsAfterSchool.map((session, sessIndex) => {
						if (sessIndex == index) {
							return {
								...session, "closeHour": hour,
								"closeMin": minute,
							}
						}
						return session;
					}),
					toAfterSchool: value,
				},
					this.callbackAfterSetState)
				break;
			default:
				break;
		}
	}

	callbackAfterSetState = () => {
		this.setReduxForSchool('sessionsInSchool', this.state.sessionsInSchool);
		this.setReduxForSchool('sessionsAfterSchool', this.state.sessionsAfterSchool);
	}

	onTechContactRefChange = () => {
		const contactRefs = this.form.getFieldValue('techContactRef');
		this.setReduxForSchool('techContactRef', contactRefs);
	}

	onStudentContactRefChange = () => {
		const contactRefs = this.form.getFieldValue('studentContactRef');
		this.setReduxForSchool('studentContactRef', contactRefs);
	}

	render() {
		const { listCommunitiServer, school_address, dayIsSelected, sessionsInSchool, sessionsAfterSchool, emailTypes } = this.state;
		const day_week = [
			{
				label: intl.formatMessage(messages.sunday),
				value: 1
			},
			{
				label: intl.formatMessage(messages.monday) + '-' + intl.formatMessage(messages.thursday),
				value: 2
			},
			{
				label: intl.formatMessage(messages.friday),
				value: 3
			},
		]

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
						<Form.Item
							name="legalName"
							label={intl.formatMessage(messages.legalName)}
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.legalName) }]}
						>
							<Input onChange={e => this.setReduxForSchool("legalName", e.target.value)} placeholder={intl.formatMessage(messages.legalName)} />
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
													className='bottom-0'
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
														onChange={() => {
															this.setReduxForSchool('contactEmail', this.form.getFieldValue('contactEmail'))
														}}
														placeholder={intl.formatMessage(messages.contactEmail)}
													/>
												</Form.Item>
											</Col>
											<Col xs={8} sm={8} md={8} className='item-remove'>
												<Form.Item
													name={[field.name, 'type']}
													label={intl.formatMessage(messages.type)}
													rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.type) }]}
													className='bottom-0'
													style={{ marginTop: field.key === 0 ? 0 : 14 }}
												>
													<Select placeholder={intl.formatMessage(messages.type)}>
														{emailTypes?.map((value, index) => (
															<Select.Option key={index} value={value}>{value}</Select.Option>
														))}
													</Select>
												</Form.Item>
												{field.key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => { remove(name); this.setReduxForSchool('contactEmail', this.form.getFieldValue('contactEmail')); }} />}
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
										<div key={field.key} className={field.key !== 0 ? 'item-remove' : ''}>
											<Form.Item
												name={[field.name, "techContactRef"]}
												label={intl.formatMessage(messages.technicalReferralContact)}
												rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.technicalReferralContact) }]}
											>
												<Input
													onChange={() => this.onTechContactRefChange()}
													placeholder={intl.formatMessage(messages.technicalReferralContact)}
												/>
											</Form.Item>
											{field.key !== 0 && (
												<BsDashCircle
													size={16}
													className='text-red icon-remove'
													onClick={() => {
														remove(field.name)
														this.onTechContactRefChange();
													}}
												/>
											)}
										</div>
									))}
									<div className='text-center'>
										<Button
											type="text"
											className='add-number-btn mb-10'
											icon={<BsPlusCircle size={17} className='mr-5' />}
											onClick={() => {
												add('');
												this.onTechContactRefChange();
											}}
										>
											{intl.formatMessage(messages.addContact)}
										</Button>
									</div>
								</div>
							)}
						</Form.List>
						<Form.List name="studentContactRef">
							{(fields, { add, remove }) => (
								<div>
									{fields.map((field) => (
										<div key={field.key} className={field.key !== 0 ? 'item-remove' : ''}>
											<Form.Item
												name={[field.name, "studentContactRef"]}
												label={intl.formatMessage(messages.studentReferralContact)}
												rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.studentReferralContact) }]}
											>
												<Input
													onChange={() => this.onStudentContactRefChange()}
													placeholder={intl.formatMessage(messages.studentReferralContact)}
												/>
											</Form.Item>
											{field.key !== 0 && (
												<BsDashCircle
													size={16}
													className='text-red icon-remove'
													onClick={() => {
														remove(field.name)
														this.onStudentContactRefChange();
													}}
												/>
											)}
										</div>
									))}
									<div className='text-center'>
										<Button
											type="text"
											className='add-number-btn mb-10'
											icon={<BsPlusCircle size={17} className='mr-5' />}
											onClick={() => {
												add(null)
												this.onStudentContactRefChange();
											}}
										>
											{intl.formatMessage(messages.addContact)}
										</Button>
									</div>
								</div>
							)}
						</Form.List>
						<div className='div-availability'>
							<Segmented options={day_week} block={true} onChange={this.onSelectDay} />
							{day_week.map((item, index) => (
								<div key={index} className='div-time' style={{ display: dayIsSelected === (index + 1) ? 'block' : 'none' }}>
									<p className='mb-10 font-700'>{intl.formatMessage(messages.inSchoolHours)}</p>
									<Row gutter={14}>
										<Col xs={24} sm={24} md={12}>
											<TimePicker
												onChange={v => this.onSelectTimeForSesssion(index, v, 'inOpen')}
												use12Hours
												format="h:mm a"
												placeholder={intl.formatMessage(messages.from)}
												value={this.valueForAvailabilityScheduleForOpenHour(sessionsInSchool, index)}
											/>
										</Col>
										<Col xs={24} sm={24} md={12}>
											<TimePicker
												onChange={v => this.onSelectTimeForSesssion(index, v, 'inClose')}
												value={this.valueForAvailabilityScheduleForCloseHour(sessionsInSchool, index)}
												use12Hours
												format="h:mm a"
												placeholder={intl.formatMessage(messages.to)}
											/>
										</Col>
									</Row>
									<p className='mb-10 font-700'>{intl.formatMessage(messages.afterSchoolHours)}</p>
									<Row gutter={14}>
										<Col xs={24} sm={24} md={12}>
											<TimePicker
												onChange={v => this.onSelectTimeForSesssion(index, v, 'afterOpen')} use12Hours
												value={this.valueForAvailabilityScheduleForOpenHour(sessionsAfterSchool, index)}
												format="h:mm a" placeholder={intl.formatMessage(messages.from)}
											/>
										</Col>
										<Col xs={24} sm={24} md={12}>
											<TimePicker
												onChange={v => this.onSelectTimeForSesssion(index, v, 'afterClose')} use12Hours
												value={this.valueForAvailabilityScheduleForCloseHour(sessionsAfterSchool, index)}
												format="h:mm a" placeholder={intl.formatMessage(messages.to)}
											/>
										</Col>
									</Row>
								</div>
							))}
						</div>
						<Form.Item className="form-btn continue-btn" >
							<Button
								block
								type="primary"
								htmlType="submit"
							>
								{intl.formatMessage(messages.confirm).toUpperCase()}
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
