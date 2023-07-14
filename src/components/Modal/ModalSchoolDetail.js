import React from 'react';
import { Modal, Button, Form, Input, Segmented, Row, Col, Checkbox, Select, TimePicker, Tabs } from 'antd';
import intl from 'react-intl-universal';
import * as MultiDatePicker from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel"
import moment from 'moment';
import PlacesAutocomplete from 'react-places-autocomplete';

import messages from './messages';
import msgCreateAccount from 'routes/Sign/CreateAccount/messages';
import msgLogin from 'routes/Sign/Login/messages';
import { EmailType } from 'routes/constant';
import './style/index.less';
import 'assets/styles/login.less';

const day_week = [
	{
		label: 'Sunday',
		value: 1
	},
	{
		label: 'Monday-Thursday',
		value: 2
	},
	{
		label: 'Friday',
		value: 3
	},
];

class ModalSchoolDetail extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			dayIsSelected: 1,
			sessionsInSchool: [],
			sessionsAfterSchool: [],
			legalHolidays: [],
			jewishHolidays: [],
			isLegalHolidays: false,
			isJewishHolidays: false,
		}
	}

	async componentDidMount() {
		const { school } = this.props;
		this.form?.setFieldsValue(school?.schoolInfo);

		const sessionsInSchool = school?.schoolInfo?.sessionsInSchool?.filter(s => s.dayInWeek === 0 || s.dayInWeek === 1 || s.dayInWeek === 5);
		const sessionsAfterSchool = school?.schoolInfo?.sessionsAfterSchool?.filter(s => s.dayInWeek === 0 || s.dayInWeek === 1 || s.dayInWeek === 5);

		this.setState({
			sessionsInSchool: sessionsInSchool?.length ? sessionsInSchool : [this.defaultTimeRangeItem(), this.defaultTimeRangeItem(), this.defaultTimeRangeItem()],
			sessionsAfterSchool: sessionsAfterSchool?.length ? sessionsAfterSchool : [this.defaultTimeRangeItem(false), this.defaultTimeRangeItem(false), this.defaultTimeRangeItem(false)],
			isLegalHolidays: school?.schoolInfo?.isLegalHolidays,
			isJewishHolidays: school?.schoolInfo?.isJewishHolidays,
		})
	}

	defaultTimeRangeItem = (isInSchool = true) => {
		if (!isInSchool) {
			return {
				"openHour": 0,
				"openMin": 0,
				"closeHour": 0,
				"closeMin": 0
			}
		}
		return {
			"openHour": 0,
			"openMin": 0,
			"closeHour": 0,
			"closeMin": 0
		}
	}

	valueForAvailabilityScheduleForOpenHour = (array, index) => {
		if (array?.length - 1 < index) {
			return moment('00:00:00', 'HH:mm:ss');
		}
		return (array[index].openHour > -1 || array[index].openMin > -1) ? moment(`${array[index].openHour}:${array[index].openMin}:00`, 'HH:mm:ss') : undefined;
	}

	valueForAvailabilityScheduleForCloseHour = (array, index) => {
		if (array?.length - 1 < index) {
			return moment('00:00:00', 'HH:mm:ss');
		}
		return (array[index].closeHour > -1 || array[index].closeMin > -1) ? moment(`${array[index].closeHour}:${array[index].closeMin}:00`, 'HH:mm:ss') : undefined;
	}

	onSelectDay = e => {
		e && this.setState({ dayIsSelected: e });
	}

	handleChangeTab = async (v) => {
		if (v === '1') {
			const { jewishHolidays, legalHolidays } = this.props;
			const holidays = [...legalHolidays, ...jewishHolidays];
			await this.updateBlackoutDates();
			document.querySelectorAll('#datepanel ul li span')?.forEach(el => {
				const name = holidays?.find(a => moment(new Date(a?.start?.date).toString()).format('YYYY-MM-DD') == el.innerText)?.summary;
				if (name) {
					if (el.nextElementSibling.nodeName.toLowerCase() == 'div') {
						el.nextElementSibling.innerText = name;
					} else {
						let newElement = document.createElement("div");
						newElement.textContent = name;
						el.after(newElement);
					}
				}
			})
		}
	}

	updateBlackoutDates = async () => {
		return new Promise((resolveOuter) => {
			resolveOuter(
				new Promise((resolveInner) => {
					setTimeout(resolveInner, 0);
				}),
			);
		});
	}

	render() {
		const { dayIsSelected, isLegalHolidays, isJewishHolidays, sessionsAfterSchool, sessionsInSchool } = this.state;
		const blackoutDates = this.props.school?.schoolInfo?.blackoutDates?.map(date => new Date(date));
		const modalProps = {
			className: 'modal-school-detail',
			title: "School Detail",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: this.props.onCancel,
			footer: [
				<Button key="back" onClick={this.props.onCancel}>
					{intl.formatMessage(messages.cancel)}
				</Button>,
				<Button key="submit" type="primary" onClick={this.props.onSubmit}>
					{intl.formatMessage(messages.ok)}
				</Button>
			],
			width: 550,
		};

		const items = [
			{
				key: '0',
				label: 'School details',
				children: (
					<Form
						name="form_school"
						layout='vertical'
						className='events-none'
						ref={(ref) => { this.form = ref }}
					>
						<Form.Item
							name="name"
							label={intl.formatMessage(msgCreateAccount.nameSchool)}
							className="float-label-item"
							rules={[{ required: true, message: intl.formatMessage(msgLogin.pleaseEnter) + ' ' + intl.formatMessage(msgCreateAccount.nameSchool) }]}
						>
							<Input className='h-40' placeholder={intl.formatMessage(msgCreateAccount.nameSchool)} />
						</Form.Item>
						<Form.Item
							name="communityServed"
							label={intl.formatMessage(msgCreateAccount.communitiesServed)}
							className="float-label-item"
							rules={[{ required: true, message: intl.formatMessage(msgLogin.pleaseEnter) + ' ' + intl.formatMessage(msgCreateAccount.communitiesServed) }]}
						>
							<Select placeholder={intl.formatMessage(msgCreateAccount.communitiesServedNote)}>
								{this.props.user?.adminCommunity?.map((item, index) => (
									<Select.Option key={index} value={item._id}>{item.name}</Select.Option>
								))}
							</Select>
						</Form.Item>
						<Form.Item
							name="valueForContact"
							label={intl.formatMessage(msgCreateAccount.schoolAddress)}
							className="float-label-item"
							rules={[{ required: true, message: intl.formatMessage(msgLogin.pleaseEnter) + ' ' + intl.formatMessage(msgCreateAccount.schoolAddress) }]}
						>
							<PlacesAutocomplete>
								{({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
									<div>
										<Input {...getInputProps({
											placeholder: intl.formatMessage(msgCreateAccount.schoolAddress),
											className: 'location-search-input h-40',
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
													label={intl.formatMessage(msgCreateAccount.contactEmail)}
													className='bottom-0 float-label-item'
													style={{ marginTop: field.key === 0 ? 0 : 14 }}
													rules={[
														{
															required: true,
															message: intl.formatMessage(msgLogin.pleaseEnter) + ' ' + intl.formatMessage(msgCreateAccount.contactEmail)
														},
														{
															type: 'email',
															message: intl.formatMessage(msgLogin.emailNotValid)
														}
													]}
												>
													<Input placeholder={intl.formatMessage(msgCreateAccount.contactEmail)} className='h-40' />
												</Form.Item>
											</Col>
											<Col xs={8} sm={8} md={8} className='item-remove'>
												<Form.Item
													name={[field.name, 'type']}
													label={intl.formatMessage(msgCreateAccount.type)}
													rules={[{ required: true }]}
													className='bottom-0 float-label-item'
													style={{ marginTop: field.key === 0 ? 0 : 14 }}
												>
													<Select placeholder={intl.formatMessage(msgCreateAccount.type)}>
														{EmailType?.map((value, index) => (
															<Select.Option key={index} value={value}>{value}</Select.Option>
														))}
													</Select>
												</Form.Item>
											</Col>
										</Row>
									))}
								</div>
							)}
						</Form.List>
						<Form.List name="techContactRef">
							{(fields, { add, remove }) => (
								<div>
									{fields.map((field) => (
										<div key={field.key}>
											<div className='font-16 text-center '>{intl.formatMessage(msgCreateAccount.technicalReferralContact)}</div>
											<div className="item-remove">
												<Form.Item
													name={[field.name, "name"]}
													label={intl.formatMessage(msgCreateAccount.name)}
													className="float-label-item"
												>
													<Input className='h-40' placeholder={intl.formatMessage(msgCreateAccount.name)} />
												</Form.Item>
											</div>
											<div className="item-remove">
												<Form.Item
													name={[field.name, "phoneNumber"]}
													label={intl.formatMessage(msgCreateAccount.contactNumber)}
													className="float-label-item"
													rules={[{ pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$', message: intl.formatMessage(msgCreateAccount.phoneNumberValid) }]}
												>
													<Input className='h-40' placeholder={intl.formatMessage(msgCreateAccount.contactNumber)} />
												</Form.Item>
											</div>
											<div className="item-remove">
												<Form.Item
													name={[field.name, "email"]}
													label={intl.formatMessage(msgCreateAccount.contactEmail)}
													className="float-label-item"
													rules={[{ type: 'email', message: intl.formatMessage(msgLogin.emailNotValid) }]}
												>
													<Input className='h-40' placeholder={intl.formatMessage(msgCreateAccount.contactEmail)} />
												</Form.Item>
											</div>
										</div>
									))}
								</div>
							)}
						</Form.List>
						<Form.List name="studentContactRef">
							{(fields, { add, remove }) => (
								<div>
									{fields.map((field) => (
										<div key={field.key}>
											<div className='font-16 text-center '>{intl.formatMessage(msgCreateAccount.studentReferralContact)}</div>
											<div className="item-remove">
												<Form.Item
													name={[field.name, "name"]}
													label={intl.formatMessage(msgCreateAccount.name)}
													className="float-label-item"
												>
													<Input className='h-40' placeholder={intl.formatMessage(msgCreateAccount.name)} />
												</Form.Item>
											</div>
											<div className="item-remove">
												<Form.Item
													name={[field.name, "phoneNumber"]}
													label={intl.formatMessage(msgCreateAccount.contactNumber)}
													className="float-label-item"
													rules={[{ pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$', message: intl.formatMessage(msgCreateAccount.phoneNumberValid) }]}
												>
													<Input className='h-40' placeholder={intl.formatMessage(msgCreateAccount.contactNumber)} />
												</Form.Item>
											</div>
											<div className="item-remove">
												<Form.Item
													name={[field.name, "email"]}
													label={intl.formatMessage(msgCreateAccount.contactEmail)}
													className="float-label-item"
													rules={[{ type: 'email', message: intl.formatMessage(msgLogin.emailNotValid) }]}
												>
													<Input className='h-40' placeholder={intl.formatMessage(msgCreateAccount.contactEmail)} />
												</Form.Item>
											</div>
										</div>
									))}
								</div>
							)}
						</Form.List>
					</Form>
				)
			},
			{
				key: '1',
				label: 'School availability',
				children: (
					<Form
						name="form_school"
						ref={(ref) => { this.form = ref }}
						initialValues={{ blackoutDates }}
					>
						<div className='div-availability'>
							<Segmented options={day_week} block={true} onChange={this.onSelectDay} />
							{day_week.map((_, index) => (
								<div key={index} className='div-time events-none' style={{ display: dayIsSelected === (index + 1) ? 'block' : 'none' }}>
									<p className='mb-0 font-700'>{intl.formatMessage(msgCreateAccount.inSchoolHours)}</p>
									<Row gutter={14}>
										<Col xs={24} sm={24} md={12}>
											<TimePicker
												onSelect={v => this.onSelectTimeForSesssion(index, v, 'inOpen')}
												onClick={(e) => (e.target.nodeName == 'path' || e.target.nodeName == 'svg') && this.onSelectTimeForSesssion(index, undefined, 'inOpen')}
												popupClassName="timepicker"
												use12Hours
												format="h:mm a"
												className='w-100'
												placeholder={intl.formatMessage(msgCreateAccount.from)}
												value={this.valueForAvailabilityScheduleForOpenHour(sessionsInSchool, index)}
											/>
										</Col>
										<Col xs={24} sm={24} md={12}>
											<TimePicker
												onSelect={v => this.onSelectTimeForSesssion(index, v, 'inClose')}
												onClick={(e) => (e.target.nodeName == 'path' || e.target.nodeName == 'svg') && this.onSelectTimeForSesssion(index, undefined, 'inClose')}
												popupClassName="timepicker"
												use12Hours
												format="h:mm a"
												className='w-100'
												value={this.valueForAvailabilityScheduleForCloseHour(sessionsInSchool, index)}
												placeholder={intl.formatMessage(msgCreateAccount.to)}
											/>
										</Col>
									</Row>
									<p className='mb-0 font-700'>{intl.formatMessage(msgCreateAccount.afterSchoolHours)}</p>
									<Row gutter={14}>
										<Col xs={24} sm={24} md={12}>
											<TimePicker
												onSelect={v => this.onSelectTimeForSesssion(index, v, 'afterOpen')}
												onClick={(e) => (e.target.nodeName == 'path' || e.target.nodeName == 'svg') && this.onSelectTimeForSesssion(index, undefined, 'afterOpen')}
												popupClassName="timepicker"
												use12Hours
												format="h:mm a"
												className='w-100'
												value={this.valueForAvailabilityScheduleForOpenHour(sessionsAfterSchool, index)}
												placeholder={intl.formatMessage(msgCreateAccount.from)}
											/>
										</Col>
										<Col xs={24} sm={24} md={12}>
											<TimePicker
												onSelect={v => this.onSelectTimeForSesssion(index, v, 'afterClose')}
												onClick={(e) => (e.target.nodeName == 'path' || e.target.nodeName == 'svg') && this.onSelectTimeForSesssion(index, undefined, 'afterClose')}
												popupClassName="timepicker"
												use12Hours
												format="h:mm a"
												className='w-100'
												value={this.valueForAvailabilityScheduleForCloseHour(sessionsAfterSchool, index)}
												placeholder={intl.formatMessage(msgCreateAccount.to)}
											/>
										</Col>
									</Row>
								</div>
							))}
						</div>
						<p className='font-18 mb-10 text-center'>{intl.formatMessage(msgCreateAccount.blackoutDates)}</p>
						<div className='flex items-center justify-center mb-10 events-none'>
							<div className='flex gap-4 items-center cursor'>
								<Checkbox checked={isLegalHolidays} onChange={(e) => this.handleChangeLegalHolidays(e.target.checked)}>Legal Holidays</Checkbox>
								<Checkbox checked={isJewishHolidays} onChange={(e) => this.handleChangeJewishHolidays(e.target.checked)}>Jewish Holidays</Checkbox>
							</div>
						</div>
						<Form.Item name="blackoutDates" className='events-none'>
							<MultiDatePicker.Calendar
								multiple
								sort
								className='m-auto'
								format='YYYY-MM-DD'
								onChange={dates => this.handleUpdateBlackoutDates(dates)}
								plugins={[<DatePanel id="datepanel" />]}
							/>
						</Form.Item>
					</Form>
				)
			}
		]

		return (
			<Modal {...modalProps}>
				<Tabs
					defaultActiveKey="0"
					type="card"
					size='small'
					items={items}
					className="bg-white p-10 h-100 overflow-y-scroll overflow-x-hidden"
					onChange={this.handleChangeTab}
				/>
			</Modal>
		);
	}
};

export default ModalSchoolDetail;