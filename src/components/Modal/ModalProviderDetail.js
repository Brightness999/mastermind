import React from 'react';
import { Modal, Button, Form, Input, Segmented, Row, Col, Checkbox, Select, TimePicker, Tabs, Switch, InputNumber, Upload, Divider, DatePicker } from 'antd';
import intl from 'react-intl-universal';
import * as MultiDatePicker from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel"
import moment from 'moment';
import PlacesAutocomplete from 'react-places-autocomplete';

import messages from './messages';
import msgCreateAccount from 'routes/Sign/CreateAccount/messages';
import msgSidebar from 'components/SideBar/messages';
import { CancellationWindow, ContactNumberType, DEPENDENTHOME, DurationType, Durations, EmailType, PROVIDEROFFICE } from 'routes/constant';
import { url } from 'utils/api/baseUrl'
import './style/index.less';
import 'assets/styles/login.less';

const day_week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

class ModalSchoolDetail extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			service_address: '',
			currentSelectedDay: day_week[0],
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

	onSelectDay = e => {
		if (e) {
			this.setState({
				currentSelectedDay: e,
				selectedLocation: '',
			})
		}
	}

	getDayOfWeekIndex = (day) => {
		switch (day) {
			case intl.formatMessage(msgCreateAccount.sunday): return 0;
			case intl.formatMessage(msgCreateAccount.monday): return 1;
			case intl.formatMessage(msgCreateAccount.tuesday): return 2;
			case intl.formatMessage(msgCreateAccount.wednesday): return 3;
			case intl.formatMessage(msgCreateAccount.thursday): return 4;
			case intl.formatMessage(msgCreateAccount.friday): return 5;
			default: return -1;
		}
	}

	handleChangeTab = async (v) => {
		if (v === '5') {
			const { provider, jewishHolidays, legalHolidays } = this.props;
			const holidays = [...(provider?.providerInfo?.isJewishHolidays ? jewishHolidays : []), ...(provider?.providerInfo?.isLegalHolidays ? legalHolidays : [])];
			await this.updateBlackoutDates();
			document.querySelectorAll('#datepanel ul li span')?.forEach(el => {
				const name = holidays?.find(a => moment(new Date(a?.end?.date).toString()).format('YYYY-MM-DD') === el.innerText)?.summary;
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

	render() {
		const { provider, auth } = this.props;
		const { currentSelectedDay, service_address } = this.state;
		const selectedLevels = provider?.providerInfo.academicLevel?.map(item => item.level);
		const academicLevels = [
			{ label: 'By Level', options: auth.academicLevels.slice(0, 6)?.filter(level => !selectedLevels?.find(l => l == level))?.map(a => ({ label: a, value: a })) ?? [] },
			{ label: 'By Grade', options: auth.academicLevels.slice(6)?.filter(level => !selectedLevels?.find(l => l == level))?.map(a => ({ label: a, value: a })) ?? [] },
		];
		const numberOfSession = [1, 2, 3, 4, 5, 6, 7];
		const blackoutDates = provider?.providerInfo?.blackoutDates?.map(date => new Date(date));
		const locations = [];
		provider?.providerInfo?.isHomeVisit && locations.push(DEPENDENTHOME);
		provider?.providerInfo?.privateOffice && locations.push(PROVIDEROFFICE);
		provider?.providerInfo?.serviceableSchool?.length && provider?.providerInfo?.serviceableSchool?.forEach(school => locations.push(school.name));
		let providerAvailability = {};
		day_week.map((day) => {
			const times = provider?.providerInfo?.manualSchedule?.filter(t => t.dayInWeek == this.getDayOfWeekIndex(day));
			providerAvailability[day] = times?.map(t => {
				t.from_date = moment().set({ years: t.fromYear, months: t.fromMonth, date: t.fromDate });
				t.to_date = moment().set({ years: t.toYear, months: t.toMonth, date: t.toDate });
				t.from_time = moment().set({ hours: t.openHour, minutes: t.openMin });
				t.to_time = moment().set({ hours: t.closeHour, minutes: t.closeMin });
				return t;
			})
		});

		const modalProps = {
			className: 'modal-provider-detail',
			title: "Provider Detail",
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
			width: 600,
		};

		const items = [
			{
				key: '0',
				label: 'General Information',
				children: (
					<Form
						name="form_profile_provider"
						layout='vertical'
						className='events-none'
						initialValues={provider?.providerInfo}
					>
						<div className="flex items-center justify-start gap-2 h-50">
							<Form.Item name="isPrivateForHmgh" className='mb-0'>
								<Switch size="small" checked={provider?.providerInfo?.isPrivateForHmgh} />
							</Form.Item>
							<p className='font-12 mb-0'>{intl.formatMessage(msgCreateAccount.onlyVisibleToHmgh)}</p>
						</div>
						<Row gutter={14}>
							<Col xs={24} sm={24} md={12}>
								<Form.Item
									name="firstName"
									label={intl.formatMessage(msgCreateAccount.firstName)}
									className="float-label-item"
								>
									<Input className='h-40' placeholder={intl.formatMessage(msgCreateAccount.firstName)} />
								</Form.Item>
							</Col>
							<Col xs={24} sm={24} md={12}>
								<Form.Item
									name="lastName"
									label={intl.formatMessage(msgCreateAccount.lastName)}
									className="float-label-item"
								>
									<Input className='h-40' placeholder={intl.formatMessage(msgCreateAccount.lastName)} />
								</Form.Item>
							</Col>
						</Row>
						<Form.Item
							name="cityConnection"
							label={intl.formatMessage(msgCreateAccount.cityConnections)}
							className="float-label-item"
						>
							<Select
								placeholder={intl.formatMessage(msgCreateAccount.cityConnections)}
								showSearch
							>
								{auth.cityConnections?.map((value, index) => (
									<Select.Option key={index} value={value._id}>{value.name}</Select.Option>
								))}
							</Select>
						</Form.Item>
						<Form.Item
							name="serviceAddress"
							label={intl.formatMessage(msgCreateAccount.serviceAddress)}
							className="float-label-item"
						>
							<PlacesAutocomplete value={service_address}>
								{({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
									<div>
										<Input {...getInputProps({
											placeholder: 'Service Address',
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
						<Form.Item
							name="agency"
							label={intl.formatMessage(msgCreateAccount.agency)}
							className="float-label-item"
						>
							<Input className='h-40' placeholder={intl.formatMessage(msgCreateAccount.agency)} />
						</Form.Item>
						<Form.List name="contactNumber">
							{(fields) => (
								<>
									{fields.map(({ key, name, ...restField }) => (
										<Row key={key} gutter={14}>
											<Col xs={16} sm={16} md={16}>
												<Form.Item
													{...restField}
													name={[name, 'phoneNumber']}
													label={intl.formatMessage(msgCreateAccount.contactNumber)}
													className='bottom-0 float-label-item'
													style={{ marginTop: key === 0 ? 0 : 14 }}
												>
													<Input className='h-40' placeholder={intl.formatMessage(msgCreateAccount.contactNumber)} />
												</Form.Item>
											</Col>
											<Col xs={8} sm={8} md={8} className='item-remove'>
												<Form.Item
													{...restField}
													name={[name, 'type']}
													label={intl.formatMessage(msgCreateAccount.type)}
													className='bottom-0 float-label-item'
													style={{ marginTop: key === 0 ? 0 : 14 }}
												>
													<Select placeholder={intl.formatMessage(msgCreateAccount.type)}>
														{ContactNumberType?.map((value, index) => (
															<Select.Option key={index} value={value}>{value}</Select.Option>
														))}
													</Select>
												</Form.Item>
											</Col>
										</Row>
									))}
								</>
							)}
						</Form.List>
						<Form.List name="contactEmail">
							{(fields) => (
								<>
									{fields.map(({ key, name, ...restField }) => (
										<Row key={key} gutter={14}>
											<Col xs={16} sm={16} md={16}>
												<Form.Item
													{...restField}
													name={[name, 'email']}
													label={intl.formatMessage(msgCreateAccount.contactEmail)}
													className='bottom-0 float-label-item'
													style={{ marginTop: key === 0 ? 0 : 14 }}
												>
													<Input className='h-40' placeholder={intl.formatMessage(msgCreateAccount.contactEmail)} />
												</Form.Item>
											</Col>
											<Col xs={8} sm={8} md={8} className='item-remove'>
												<Form.Item
													{...restField}
													name={[name, 'type']}
													label={intl.formatMessage(msgCreateAccount.type)}
													className='bottom-0 float-label-item'
													style={{ marginTop: key === 0 ? 0 : 14 }}
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
								</>
							)}
						</Form.List>
					</Form>
				)
			},
			{
				key: '1',
				label: 'Professional Information',
				children: (
					<Form
						name="form_services_offered"
						layout='vertical'
						initialValues={{ ...provider?.providerInfo, skillSet: provider?.providerInfo?.skillSet?.map(s => s._id) }}
						className='events-none'
					>
						<Form.Item
							name="skillSet"
							label={intl.formatMessage(msgCreateAccount.services)}
							className="float-label-item"
						>
							<Select mode="multiple" showArrow allowClear={true} placeholder={intl.formatMessage(msgCreateAccount.services)} filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
								{auth.skillSet?.map((skill, index) => (
									<Select.Option key={index} value={skill._id}>{skill.name}</Select.Option>
								))}
							</Select>
						</Form.Item>
						<Row gutter={14}>
							<Col xs={24} sm={24} md={24}>
								<Form.Item
									name="yearExp"
									label={intl.formatMessage(msgCreateAccount.yearsExperience)}
									className="float-label-item"
								>
									<Input
										type='number'
										min={0}
										value={15}
										className='h-40'
										placeholder={intl.formatMessage(msgCreateAccount.yearsExperience)}
									/>
								</Form.Item>
							</Col>
						</Row>
						<Form.Item
							name="publicProfile"
							label={intl.formatMessage(msgCreateAccount.publicProfile)}
							className="float-label-item"
						>
							<Input.TextArea rows={4} placeholder={intl.formatMessage(msgCreateAccount.publicProfile)} />
						</Form.Item>
						<Form.List name="references">
							{(fields) => (
								<div>
									{fields.map((field) => (
										<div key={field.key}>
											<div className={`font-16 ${field.key != 0 && 'd-none'}`}>{intl.formatMessage(msgCreateAccount.references)}</div>
											<div className="item-remove">
												<Form.Item name={[field.name, 'name']}>
													<Input className='h-40' placeholder={intl.formatMessage(msgCreateAccount.references)} />
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
				key: '2',
				label: 'Scheduling Information',
				children: (
					<Form
						name="scheduling"
						layout='vertical'
						className='events-none'
						initialValues={provider?.providerInfo}
					>
						<Form.Item
							name="duration"
							label={intl.formatMessage(msgCreateAccount.standardSessionDuration)}
							className='w-100 float-label-item'
						>
							<Select placeholder={intl.formatMessage(msgCreateAccount.standardSessionDuration)}>
								{Durations?.map((duration, index) => (
									<Select.Option key={index} value={duration.value}>{duration.label}</Select.Option>
								))}
							</Select>
						</Form.Item>
						<Row className='items-center gap-2'>
							<Form.Item name="isNewClientScreening">
								<Switch
									size='small'
									checked={provider?.providerInfo?.isNewClientScreening}
								/>
							</Form.Item>
							<p>{intl.formatMessage(msgCreateAccount.newClientScreening)}</p>
						</Row>
						<Row className='items-center'>
							<Col xs={24} sm={24} md={12}>
								<Row className='items-center gap-2'>
									<Form.Item name="isSeparateEvaluationRate">
										<Switch
											size='small'
											checked={provider?.providerInfo?.isSeparateEvaluationRate}
										/>
									</Form.Item>
									<p>{intl.formatMessage(msgCreateAccount.newClientEvaluation)}</p>
								</Row>
							</Col>
							<Col xs={24} sm={24} md={12}>
								<Form.Item
									name="separateEvaluationDuration"
									label={intl.formatMessage(msgCreateAccount.evaluationDuration)}
									className={`w-100 float-label-item ${provider?.providerInfo?.isSeparateEvaluationRate ? '' : 'display-none events-none'}`}
								>
									<Select placeholder={intl.formatMessage(msgCreateAccount.duration)}>
										{Durations?.map((duration, index) => (
											<Select.Option key={index} value={duration.value}>{duration.label}</Select.Option>
										))}
									</Select>
								</Form.Item>
							</Col>
						</Row>
						<Row>
							<Form.Item
								name="cancellationWindow"
								label={intl.formatMessage(msgCreateAccount.cancellationWindow)}
								className='w-100 float-label-item'
							>
								<Select placeholder={intl.formatMessage(msgCreateAccount.cancellationWindow)}>
									{CancellationWindow?.map((c, index) => (
										<Select.Option key={index} value={c.value}>{c.label}</Select.Option>
									))}
								</Select>
							</Form.Item>
						</Row>
						<p className='mb-5'>Scheduling Limit</p>
						<Row gutter={14}>
							<Col xs={16} sm={16} md={16}>
								<Form.Item
									name='durationValue'
									label={intl.formatMessage(msgCreateAccount.duration)}
									className='bottom-0 float-label-item'
									style={{ marginTop: 14 }}
								>
									<InputNumber
										min={0}
										onKeyDown={(e) => {
											(e.key === '-' || e.key === 'Subtract' || e.key === '.' || e.key === 'e') && e.preventDefault();
											if (e.key > -1 && e.key < 10 && e.target.value === '0') {
												e.target.value = '';
											}
										}}
										placeholder={intl.formatMessage(msgCreateAccount.duration)}
										className='w-100 h-40'
									/>
								</Form.Item>
							</Col>
							<Col xs={8} sm={8} md={8}>
								<Form.Item
									name='durationType'
									label={intl.formatMessage(msgCreateAccount.type)}
									className='bottom-0 float-label-item'
									style={{ marginTop: 14 }}
								>
									<Select placeholder={intl.formatMessage(msgCreateAccount.type)}>
										{DurationType?.map((d, index) => (
											<Select.Option key={index} value={d.value}>{d.label}</Select.Option>
										))}
									</Select>
								</Form.Item>
							</Col>
						</Row>
					</Form>
				)
			},
			{
				key: '3',
				label: 'Billing Information',
				children: (
					<Form
						name="form_billing_details"
						layout='vertical'
						initialValues={provider?.providerInfo}
					>
						{auth.user?.role > 900 ? (
							<>
								<Form.Item
									name="legalName"
									label={intl.formatMessage(msgCreateAccount.legalName)}
									className="float-label-item events-none"
								>
									<Input className='h-40' placeholder={intl.formatMessage(msgCreateAccount.legalName)} />
								</Form.Item>
								<Form.Item
									name="billingAddress"
									label={intl.formatMessage(msgCreateAccount.billingAddress)}
									className="float-label-item events-none"
								>
									<PlacesAutocomplete value={service_address}>
										{({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
											<div key='billingaddress'>
												<Input {...getInputProps({
													placeholder: 'Billing Address',
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
								<Row gutter={14} className='events-none'>
									<Col xs={16} sm={16} md={16}>
										<Form.Item name="licenseNumber" label={intl.formatMessage(msgCreateAccount.licenseNumber)} className="float-label-item">
											<Input className='h-40' placeholder={intl.formatMessage(msgCreateAccount.licenseNumber)} />
										</Form.Item>
									</Col>
									<Col xs={8} sm={8} md={8}>
										<Form.Item name="SSN" label="SSN" className="float-label-item">
											<Input className='h-40' placeholder='SSN' />
										</Form.Item>
									</Col>
								</Row>
							</>
						) : null}
						<Form.List name="academicLevel">
							{(fields) => (
								<div>
									{fields.map((field) => {
										return (
											<Row gutter={14} key={field.key} className='events-none'>
												<Col xs={16} sm={16} md={16}>
													<Form.Item
														name={[field.name, "level"]}
														label={intl.formatMessage(msgCreateAccount.level)}
														className='bottom-0 float-label-item'
														style={{ marginTop: 14 }}
													>
														<Select
															placeholder={intl.formatMessage(msgCreateAccount.academicLevel)}
															options={academicLevels}
															onChange={(selectedLevel) => this.handleSelectLevel(selectedLevel)}
														>
														</Select>
													</Form.Item>
												</Col>
												<Col xs={8} sm={8} md={8} className='item-remove'>
													<Form.Item
														name={[field.name, "rate"]}
														label={intl.formatMessage(msgCreateAccount.rate)}
														className='bottom-0 float-label-item'
														style={{ marginTop: 14 }}
													>
														<InputNumber
															placeholder={intl.formatMessage(msgCreateAccount.rate)}
															type="number"
															min={0}
															addonBefore="$"
															className='h-40'
														/>
													</Form.Item>
												</Col>
											</Row>
										);
									})}
								</div>
							)}
						</Form.List>
						<Row gutter={15} className='events-none'>
							<Col xs={24} sm={24} md={12} className={provider?.providerInfo?.isSeparateEvaluationRate ? '' : 'd-none'}>
								<Form.Item
									name="separateEvaluationRate"
									label={'Evaluation ' + intl.formatMessage(msgCreateAccount.rate)}
									className="float-label-item"
								>
									<InputNumber
										type='number'
										min={0}
										addonBefore="$"
										placeholder={intl.formatMessage(msgCreateAccount.rate)}
										className='h-40'
									/>
								</Form.Item>
							</Col>
							<Col xs={24} sm={24} md={12}>
								<Form.Item
									name="cancellationFee"
									label={intl.formatMessage(msgCreateAccount.cancellationFee)}
									className='w-100 float-label-item'
								>
									<InputNumber
										type='number'
										min={0}
										addonBefore="$"
										placeholder={intl.formatMessage(msgCreateAccount.cancellationFee)}
										className='h-40'
									/>
								</Form.Item>
							</Col>
						</Row>
						{auth.user?.role > 900 ? (
							<div className='flex gap-2'>
								<div>W-9 Form:</div>
								<a
									href={url + 'uploads/' + provider?.providerInfo?.W9FormPath}
									target="_blank"
								>
									{provider?.providerInfo?.upload_w_9}
								</a>
							</div>
						) : null}
					</Form>
				)
			},
			{
				key: '4',
				label: 'Subsidy Program',
				children: (
					<Form
						name="form_subsidy_program"
						layout="vertical"
						className='events-none'
						initialValues={provider?.providerInfo}
					>
						<div className='flex flex-row mb-10'>
							<Checkbox checked={provider?.providerInfo?.isAcceptProBono} />
							<p className='font-15 font-700 mb-0 ml-10'>{intl.formatMessage(msgCreateAccount.offeringVolunteer)}</p>
						</div>
						<div className='flex flex-row justify-between px-20'>
							<p className='mb-10'>{intl.formatMessage(msgCreateAccount.numberSessionsWeek)}</p>
							<Form.Item
								name="proBonoNumber"
								className='select-small'
							>
								<Select disabled={!provider?.providerInfo?.isAcceptProBono}>
									{numberOfSession?.map((value, index) => (
										<Select.Option key={index} value={value}>{value}</Select.Option>
									))}
								</Select>
							</Form.Item>
						</div>
						<Divider style={{ marginTop: 10, borderColor: '#d7d7d7' }} />
						<div className='flex flex-row mb-10'>
							<Checkbox checked={provider?.providerInfo?.isAcceptReduceRate} />
							<p className='font-15 font-700 mb-0 ml-10'>{intl.formatMessage(msgCreateAccount.provideSubsidizedCases)}</p>
						</div>
						<div className='px-20'>
							<Form.List name="academicLevel">
								{(fields) => (
									<div className='div-time'>
										{fields.map((field) => (
											<Row key={field.key} gutter={10}>
												<Col xs={24} sm={24} md={12}>
													<Form.Item
														name={[field.name, "level"]}
														label={intl.formatMessage(msgCreateAccount.level)}
													>
														<Select placeholder={intl.formatMessage(msgCreateAccount.level)}>
															{academicLevels?.map((lvl, i) => (
																<Select.Option key={i} value={lvl}>{lvl}</Select.Option>
															))}
														</Select>
													</Form.Item>
												</Col>
												<Col xs={12} sm={12} md={6}>
													<Form.Item
														name={[field.name, "rate"]}
														label={'Standard' + intl.formatMessage(msgCreateAccount.rate)}
													>
														<InputNumber
															placeholder={intl.formatMessage(msgCreateAccount.rate)}
															addonBefore="$"
															className='h-40'
														/>
													</Form.Item>
												</Col>
												<Col xs={12} sm={12} md={6} className='item-remove'>
													<Form.Item
														name={[field.name, "subsidizedRate"]}
														label={intl.formatMessage(messages.subsidizedRate)}
													>
														<InputNumber
															type="number"
															min={0}
															addonBefore="$"
															className='h-40'
															disabled={!provider?.providerInfo?.isAcceptReduceRate}
															placeholder={intl.formatMessage(msgCreateAccount.rate)}
														/>
													</Form.Item>
												</Col>
											</Row>
										))}
										<Row>
											<Col span={16}>
												<div className='flex flex-row items-center justify-end'>
													<Switch
														disabled={!provider?.providerInfo?.isAcceptReduceRate}
														size="small"
														defaultChecked
													/>
													<p className='ml-10 mb-0'>{intl.formatMessage(msgCreateAccount.sameRateLevels)}</p>
												</div>
											</Col>
										</Row>
									</div>
								)}
							</Form.List>
						</div>
						<Divider style={{ borderColor: '#d7d7d7' }} />
						<div className='flex flex-row mb-10'>
							<Checkbox
								checked={provider?.providerInfo?.isWillingOpenPrivate}
								disabled={provider?.providerInfo?.isPrivateForHmgh}
							/>
							<p className='font-15 font-700 mb-0 ml-10'>{intl.formatMessage(msgCreateAccount.openPrivateSlots)}</p>
						</div>
					</Form>
				)
			},
			{
				key: '5',
				label: 'Availability Information',
				children: (
					<Form
						name="form_availability"
						layout='vertical'
						initialValues={{ ...provider?.providerInfo, ...providerAvailability, blackoutDates, serviceableSchool: provider?.providerInfo?.serviceableSchool?.map(s => s._id) }}
						ref={ref => this.form = ref}
					>
						<p className='font-18 mb-10 text-center'>{intl.formatMessage(msgCreateAccount.locations)}</p>
						<div className='mb-10 events-none'>
							<div className='flex flex-row items-center mb-5'>
								<Switch size="small" checkedChildren="ON" unCheckedChildren="OFF" style={{ width: 50 }} checked={provider?.providerInfo?.isPrivateOffice} />
								<p className='ml-10 mb-0'>{intl.formatMessage(msgCreateAccount.privateOffice)}</p>
							</div>
							<div className='flex flex-row items-center mb-5'>
								<Switch size="small" checkedChildren="ON" unCheckedChildren="OFF" style={{ width: 50 }} checked={provider?.providerInfo?.isHomeVisit} />
								<p className='ml-10 mb-0'>{intl.formatMessage(msgCreateAccount.homeVisits)}</p>
							</div>
							<div className='flex flex-row items-center mb-5'>
								<Switch size="small" checkedChildren="ON" unCheckedChildren="OFF" style={{ width: 50 }} checked={provider?.providerInfo?.isSchools} />
								<p className='ml-10 mb-0'>{intl.formatMessage(msgCreateAccount.school)}</p>
							</div>
							{!!provider?.providerInfo?.serviceableSchool?.length && (
								<Form.Item
									name="serviceableSchool"
									label={intl.formatMessage(msgCreateAccount.serviceableSchools)}
									className="float-label-item mt-10"
								>
									<Select
										mode="multiple"
										showArrow
										placeholder={intl.formatMessage(msgSidebar.schoolsList)}
										optionLabelProp="label"
									>
										{auth.schools?.map((school, index) => (
											<Select.Option key={index} label={school.schoolInfo?.name} value={school.schoolInfo?._id}>{school.schoolInfo?.name}</Select.Option>
										))}
									</Select>
								</Form.Item>
							)}
						</div>
						<p className='font-18 mb-10 text-center'>{intl.formatMessage(msgCreateAccount.manualSchedule)}</p>
						<div className='div-availability'>
							<Segmented options={day_week} block={true} onChange={this.onSelectDay} />
							{day_week.map((day, index) => (
								<div key={index} id={day} style={{ display: currentSelectedDay === day ? 'block' : 'none' }}>
									<Form.List name={day}>
										{(fields) => (
											<div className='div-time events-none'>
												{fields.map((field, i) => (
													<div key={field.key}>
														{field.key != 0 && <Divider className='bg-gray' />}
														<Form.Item name={[field.name, "location"]}>
															<Select
																showArrow
																placeholder={intl.formatMessage(msgCreateAccount.location)}
																optionLabelProp="label"
																onChange={v => this.handleSelectLocation(v, day, i)}
															>
																{locations.map((location, index) => (
																	<Select.Option key={index} label={location} value={location}>{location}</Select.Option>
																))}
															</Select>
														</Form.Item>
														<Row gutter={14}>
															<Col xs={24} sm={24} md={12}>
																<Form.Item name={[field.name, "from_date"]} label={intl.formatMessage(msgCreateAccount.from)} className='float-label-item'>
																	<DatePicker
																		format='MM/DD/YYYY'
																		placeholder={intl.formatMessage(msgCreateAccount.from)}
																		className='w-100'
																	/>
																</Form.Item>
															</Col>
															<Col xs={24} sm={24} md={12} className='item-remove'>
																<Form.Item name={[field.name, "to_date"]} label={intl.formatMessage(msgCreateAccount.to)} className='float-label-item'>
																	<DatePicker
																		format='MM/DD/YYYY'
																		placeholder={intl.formatMessage(msgCreateAccount.to)}
																		className='w-100'
																	/>
																</Form.Item>
															</Col>
														</Row>
														<Row gutter={14}>
															<Col xs={24} sm={24} md={12}>
																<Form.Item name={[field.name, "from_time"]} label={intl.formatMessage(msgCreateAccount.from)} className='float-label-item'>
																	<TimePicker
																		use12Hours
																		format="h:mm a"
																		popupClassName="timepicker"
																		placeholder={intl.formatMessage(msgCreateAccount.from)}
																		className='w-100'
																	/>
																</Form.Item>
															</Col>
															<Col xs={24} sm={24} md={12} className='item-remove'>
																<Form.Item name={[field.name, "to_time"]} label={intl.formatMessage(msgCreateAccount.to)} className='float-label-item'>
																	<TimePicker
																		use12Hours
																		format="h:mm a"
																		popupClassName="timepicker"
																		placeholder={intl.formatMessage(msgCreateAccount.to)}
																		className='w-100'
																	/>
																</Form.Item>
															</Col>
														</Row>
														<Row>
															<Col span={12}>
																{!provider?.providerInfo?.isPrivateForHmgh ? (
																	<div className={`flex items-center justify-start gap-2 ${!provider?.providerInfo?.isWillingOpenPrivate ? 'd-none' : ''}`}>
																		<Form.Item name={[field.name, "isPrivate"]} valuePropName="checked">
																			<Switch size="small" />
																		</Form.Item>
																		<p className='font-12'>{intl.formatMessage(msgCreateAccount.privateHMGHAgents)}</p>
																	</div>
																) : null}
															</Col>
														</Row>
													</div>
												))}
											</div>
										)}
									</Form.List>
								</div>
							))}
						</div>
						<p className='font-18 mb-10 text-center'>{intl.formatMessage(msgCreateAccount.blackoutDates)}</p>
						<div className='flex items-center justify-center mb-10 events-none'>
							<div className='flex gap-4 items-center cursor'>
								<Checkbox checked={provider?.providerInfo?.isLegalHolidays}>Legal Holidays</Checkbox>
								<Checkbox checked={provider?.providerInfo?.isJewishHolidays}>Jewish Holidays</Checkbox>
							</div>
						</div>
						<Form.Item name="blackoutDates">
							<MultiDatePicker.Calendar
								multiple
								sort
								className='m-auto'
								format="YYYY-MM-DD"
								onFocusedDateChange={() => { }}
								plugins={[<DatePanel id="datepanel" />]}
							/>
						</Form.Item>
					</Form>
				)
			},
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