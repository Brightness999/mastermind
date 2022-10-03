import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select, Segmented, TimePicker, Switch, DatePicker } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import { QuestionCircleOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import { url } from '../../../../../utils/api/baseUrl';
import axios from 'axios';
import PlacesAutocomplete from 'react-places-autocomplete';

const day_week = [
	intl.formatMessage(messages.sunday),
	intl.formatMessage(messages.monday),
	intl.formatMessage(messages.tuesday),
	intl.formatMessage(messages.wednesday),
	intl.formatMessage(messages.thursday),
	intl.formatMessage(messages.friday),
]

class InfoAvailability extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isPrivate: true,
			CancellationWindow: [],
			currentSelectedDay: day_week[0],
			service_address: ''
		}
	}

	componentDidMount() {
		let { registerData } = this.props.register;
		if (!!registerData.availability) {
			this.form?.setFieldsValue({
				...registerData.availability
			})
			this.setState({
				isPrivate: registerData.isPrivate
			})
		} else {
			day_week.map((day) => {
				this.form.setFieldValue(day, [''])
			})
		}
		this.getDataFromServer();
	}

	defaultTimeRangeItem = (dayInWeek) => {
		return {
			"uid": shortid.generate() + '' + Date.now(),
			"location": undefined,
			"dayInWeek": dayInWeek,
			"openHour": 7,
			"openMin": 0,
			"closeHour": 18,
			"closeMin": 0
		}
	}

	getDataFromServer = () => {
		axios.post(url + 'providers/get_default_values_for_provider'
		).then(result => {
			if (result.data.success) {
				var data = result.data.data;
				this.setState({ CancellationWindow: data.CancellationWindow, })
			} else {
				this.setState({ CancellationWindow: [] });
			}
		}).catch(err => {
			console.log(err);
			this.setState({ CancellationWindow: [] });
		})
	}

	onFinish = (values) => {
		this.props.setRegisterData({ availability: values });
		this.props.onContinue();
	};

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	onSelectDay = e => {
		if (e) {
			this.setState({ currentSelectedDay: e })
		}
	}

	onChangeScheduleValue = (day, value) => {
		this.props.setRegisterData({ availability: this.form.getFieldsValue() });
	}

	onLocationChange = (day, value) => {
		this.props.setRegisterData({ availability: this.form.getFieldsValue() });
	}

	onLocationSelected = (day, value, index) => {
		var arr = this.form.getFieldValue(day);
		if (arr[index] == undefined) arr[index] = {};
		arr[index].location = value;
		this.form.setFieldValue(day, arr);
		this.props.setRegisterData({ availability: this.form.getFieldsValue() });
	}

	copyToFullWeek = (dayForCopy) => {
		var arrToCopy = this.form.getFieldValue(dayForCopy);
		day_week.map((newDay) => {
			if (newDay != dayForCopy) {
				this.form.setFieldValue(newDay, arrToCopy);
			}
		})
	}

	render() {
		return (
			<Row justify="center" className="row-form">
				<div className='col-form col-availability'>
					<div className='div-form-title'>
						<p className='font-30 text-center mb-10'>{intl.formatMessage(messages.availability)}</p>
					</div>
					<Form
						name="form_availability"
						onFinish={this.onFinish}
						onFinishFailed={this.onFinishFailed}
						ref={ref => this.form = ref}
					>
						<p className='font-18 mb-10 text-center'>{intl.formatMessage(messages.autoSyncCalendar)}</p>
						<Row gutter={10}>
							<Col span={12}>
								<div className='div-gg'>
									<img src='../images/gg.png' />
									<p className='font-16 mb-0'>Google</p>
								</div>
							</Col>
							<Col span={12}>
								<div className='div-gg'>
									<img src='../images/outlook.png' />
									<p className='font-16 mb-0'>Outlook</p>
								</div>
							</Col>
						</Row>
						<p className='font-18 mb-10 text-center'>{intl.formatMessage(messages.manualSchedule)}</p>
						<div className='div-availability'>
							<Segmented options={day_week} block={true} onChange={this.onSelectDay} />
							{day_week.map((day, index) => (
								<div key={index} id={day} style={{ display: this.state.currentSelectedDay === day ? 'block' : 'none' }}>
									<Form.List name={day}>
										{(fields, { add, remove }) => (
											<div className='div-time'>
												{fields.map((field, index) => (
													<div key={field.key}>
														<Row gutter={14}>
															<Col xs={24} sm={24} md={12}>
																<Form.Item
																	name={[field.name, "from_date"]}
																	rules={[{ required: true, message: intl.formatMessage(messages.fromMess) }]}
																>
																	<DatePicker
																		onChange={v => this.onChangeScheduleValue(day, v)}
																		format='MM/DD/YYYY'
																		placeholder={intl.formatMessage(messages.from)}
																	/>
																</Form.Item>
															</Col>
															<Col xs={24} sm={24} md={12} className={field.key !== 0 && 'item-remove'}>
																<Form.Item
																	name={[field.name, "to_date"]}
																	rules={[{ required: true, message: intl.formatMessage(messages.toMess) }]}
																>
																	<DatePicker
																		onChange={v => this.onChangeScheduleValue(day, v)}
																		format='MM/DD/YYY'
																		placeholder={intl.formatMessage(messages.to)}
																	/>
																</Form.Item>
																{field.key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />}
															</Col>
														</Row>
														<Row gutter={14}>
															<Col xs={24} sm={24} md={12}>
																<Form.Item
																	name={[field.name, "from_time"]}
																	rules={[{ required: true, message: intl.formatMessage(messages.fromMess) }]}
																>
																	<TimePicker
																		onChange={v => this.onChangeScheduleValue(day, v)}
																		use12Hours
																		format="h:mm a"
																		placeholder={intl.formatMessage(messages.from)}
																	/>
																</Form.Item>
															</Col>
															<Col xs={24} sm={24} md={12} className={field.key !== 0 && 'item-remove'}>
																<Form.Item
																	name={[field.name, "to_time"]}
																	rules={[{ required: true, message: intl.formatMessage(messages.toMess) }]}
																>
																	<TimePicker
																		onChange={v => this.onChangeScheduleValue(day, v)}
																		use12Hours
																		format="h:mm a"
																		placeholder={intl.formatMessage(messages.to)}
																	/>
																</Form.Item>
																{field.key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />}
															</Col>
														</Row>
														<Form.Item
															name={[field.name, "location"]}
															rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.location) }]}
														>
															<PlacesAutocomplete
																onChange={(e) => this.onLocationChange(day, e, "billingAddress")}
																onSelect={(e) => this.onLocationSelected(day, e, index)}
															>
																{({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
																	<div>
																		<Input {...getInputProps({
																			placeholder: intl.formatMessage(messages.location),
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
																					<div {...getSuggestionItemProps(suggestion, { className, style, key: suggestion.index })}>
																						<span>{suggestion.description}</span>
																					</div>
																				);
																			})}
																		</div>
																	</div>
																)}
															</PlacesAutocomplete>
														</Form.Item>
													</div>
												))}
												<Row>
													<Col span={8}>
														<div className='flex flex-row items-center'>
															<Switch
																size="small"
																checked={this.state.isPrivate}
																onChange={v => {
																	this.setState({ isPrivate: v })
																	this.props.setRegisterData({ isPrivate: v })
																}}
															/>
															<p className='font-09 ml-10 mb-0'>{intl.formatMessage(messages.privateHMGHAgents)}</p>
														</div>
													</Col>
													<Col span={8}>
														<div className='div-add-time justify-center'>
															<BsPlusCircle size={17} className='mr-5 text-primary' />
															<a className='text-primary' onClick={() => add()}>
																{intl.formatMessage(messages.addRange)}
															</a>
														</div>
													</Col>
													<Col span={8}>
														<div className='text-right div-copy-week'>
															<a className='font-10 underline text-primary' onClick={() => this.copyToFullWeek(day)}>
																{intl.formatMessage(messages.copyFullWeek)}
															</a>
															<QuestionCircleOutlined className='text-primary' />
														</div>
													</Col>
												</Row>
											</div>
										)}
									</Form.List>
								</div>
							))}
						</div>
						<Row gutter={14} style={{ marginLeft: '-22px', marginRight: '-22px' }}>
							<Col xs={24} sm={24} md={13}>
								<Form.Item
									name="cancellation_window"
									rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.cancellationWindow) }]}
								>
									<Select placeholder={intl.formatMessage(messages.cancellationWindow)}>
										{this.state.CancellationWindow.map((value, index) => (
											<Select.Option key={index} value={value}>{value}</Select.Option>
										))}
									</Select>
								</Form.Item>
							</Col>
							<Col xs={24} sm={24} md={11}>
								<Form.Item
									name="cancellation_fee"
									rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.cancellationFee) }]}
								>
									<Input placeholder={intl.formatMessage(messages.cancellationFee)} />
								</Form.Item>
							</Col>
						</Row>
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

export default compose(connect(mapStateToProps, { setRegisterData }))(InfoAvailability);
