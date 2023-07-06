import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select, DatePicker } from 'antd';
import { BsPlusCircle } from 'react-icons/bs';
import { TbTrash } from 'react-icons/tb';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';
import moment from 'moment';

import messages from '../../messages';
import msgLogin from 'routes/Sign/Login/messages';
import msgCreateAccount from 'routes/Sign/CreateAccount/messages';
import { setRegisterData } from 'src/redux/features/registerSlice';

class InfoChild extends Component {
	constructor(props) {
		super(props);
		this.state = {
			otherSchools: [],
		}
	}

	componentDidMount() {
		const { registerData } = this.props.register;
		const newChild = this.getDefaultChildObj(registerData.parentInfo);
		let studentInfos = !!registerData.studentInfos ? JSON.parse(JSON.stringify(registerData.studentInfos)) : [newChild];
		this.props.setRegisterData({ studentInfos: studentInfos });
		studentInfos = studentInfos?.map(student => student.birthday ? { ...student, birthday: moment(student.birthday) } : student);
		this.form?.setFieldsValue({ children: studentInfos });
		let otherSchools = [];
		studentInfos?.map((a, i) => a.school === 'other' && otherSchools.push(i));
		this.setState({ otherSchools });
	}

	getDefaultChildObj(parentInfo) {
		const obj = {
			"firstName": "",
			"lastName": parentInfo?.familyName,
			"birthday": undefined,
			"guardianPhone": parentInfo?.fatherPhoneNumber || parentInfo?.motherPhoneNumber,
			"guardianEmail": parentInfo?.fatherEmail || parentInfo?.motherEmail,
			"backgroundInfor": "",
			"school": undefined,
			"primaryTeacher": "",
			"currentGrade": "",
			"services": [],
			"age": "",
			"availabilitySchedule": []
		};
		return obj;
	}

	onRemoveDepenent(index) {
		const { registerData } = this.props.register;
		let studentInfos = [...registerData.studentInfos]
		studentInfos.splice(index, 1);
		this.props.setRegisterData({ studentInfos: studentInfos });
	}

	updateReduxValueForDepedent(index, fieldName, value) {
		const { registerData } = this.props.register;
		let studentInfos = [...registerData.studentInfos]
		let selectedObj = { ...studentInfos[index] };
		if (fieldName === 'birthday') {
			selectedObj.birthday = value?.valueOf();
			selectedObj.age = value ? moment().year() - value.year() : 0;
		} else {
			selectedObj[fieldName] = value;
		}
		studentInfos[index] = selectedObj;
		this.props.setRegisterData({ studentInfos: studentInfos });
	}

	getBirthday = (index) => {
		if (!!this.props.register.studentInfos && this.props.register.studentInfos[index] != undefined && !!this.props.register.studentInfos[index].birthday) {
			return this.props.register.studentInfos[index].birthday;
		}
		return moment();
	}

	onFinish = (values) => {
		this.props.onContinue();
	};

	handleSelectBirthday = (date, index) => {
		if (date) {
			const dependents = this.form?.getFieldsValue();
			this.form?.setFieldsValue({ children: dependents?.children?.map((child, i) => i === index ? { ...child, age: moment().year() - date.year() } : child) });
		}
	}

	handleChangeBirthDay = (date, index) => {
		if (date) {
			const dateArr = date.split('-');
			if (dateArr.length === 3 && dateArr[0].length === 4 && dateArr[1].length === 2 && dateArr[2].length === 2) {
				if (moment(date).isValid()) {
					const dependents = this.form?.getFieldsValue();
					this.form?.setFieldsValue({ children: dependents?.children?.map((child, i) => i === index ? { ...child, age: date ? moment().year() - moment(date).year() : 0, birthday: moment(date) } : child) });
					this.updateReduxValueForDepedent(index, "birthday", moment(date));
				}
			}
		}
	}

	render() {
		const { schools, skillSets, academicLevels } = this.props.auth.generalData;
		const { otherSchools } = this.state;
		const { registerData } = this.props.register;
		const listSchools = schools?.filter(school => school.communityServed?._id === registerData.parentInfo?.cityConnection) ?? [];

		return (
			<Row justify="center" className="row-form">
				<div className='col-form col-info-child'>
					<div className='div-form-title'>
						<p className='font-30 text-center'>{intl.formatMessage(messages.dependentsInformation)}</p>
					</div>
					<Form
						name="form_contact"
						layout='vertical'
						onFinish={this.onFinish}
						ref={ref => this.form = ref}
					>
						<Form.List name="children">
							{(fields, { add, remove }) => (
								<div>
									{fields.map((field, index) => {
										return (
											<div key={field.key} className='div-dependent-form'>
												<div className='flex flex-row items-center justify-between mb-10'>
													<div className='flex flex-row items-center'>
														<p className='font-16 mr-10 mb-0'>{intl.formatMessage(messages.dependent)}# {index + 1}</p>
													</div>
													{field.key === 0 ? null : <Button
														type='text'
														className='remove-btn'
														icon={<TbTrash size={18} />}
														onClick={() => {
															remove(field.name);
															this.onRemoveDepenent(index);
															this.setState({ otherSchools: otherSchools?.filter(a => a != field.key) });
														}}
													>{intl.formatMessage(messages.remove)}</Button>}
												</div>
												<Row gutter={14}>
													<Col xs={24} sm={24} md={12}>
														<Form.Item
															name={[field.name, "firstName"]}
															label={intl.formatMessage(messages.firstName)}
															rules={[{ required: true, message: intl.formatMessage(msgLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.firstName) }]}
														>
															<Input
																onChange={v => this.updateReduxValueForDepedent(index, "firstName", v.target.value)}
																placeholder={intl.formatMessage(messages.firstName)}
															/>
														</Form.Item>
													</Col>
													<Col xs={24} sm={24} md={12}>
														<Form.Item
															name={[field.name, "lastName"]}
															label={intl.formatMessage(messages.lastName)}
															rules={[{ required: true, message: intl.formatMessage(msgLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.lastName) }]}
														>
															<Input
																onChange={v => this.updateReduxValueForDepedent(index, "lastName", v.target.value)}
																placeholder={intl.formatMessage(messages.lastName)}
															/>
														</Form.Item>
													</Col>
												</Row>
												<Row gutter={14}>
													<Col xs={24} sm={24} md={12}>
														<Form.Item
															name={[field.name, "guardianPhone"]}
															className='float-label-item'
															label={intl.formatMessage(messages.guardianPhone)}
															rules={[
																{ pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$', message: intl.formatMessage(messages.phoneNumberValid) },
															]}
														>
															<Input
																onChange={v => this.updateReduxValueForDepedent(index, "guardianPhone", v.target.value)}
																placeholder={intl.formatMessage(messages.contactNumber)}
															/>
														</Form.Item>
													</Col>
													<Col xs={24} sm={24} md={12}>
														<Form.Item className='float-label-item'
															name={[field.name, "guardianEmail"]}
															label={intl.formatMessage(messages.guardianEmail)}
															rules={[
																{ type: 'email', message: intl.formatMessage(msgLogin.emailNotValid) },
															]}
														>
															<Input
																onChange={v => this.updateReduxValueForDepedent(index, "guardianEmail", v.target.value)}
																placeholder={intl.formatMessage(messages.contactEmail)}
															/>
														</Form.Item>
													</Col>
												</Row>
												<Row gutter={14}>
													<Col xs={24} sm={24} md={12}>
														<Form.Item
															name={[field.name, "school"]}
															label={intl.formatMessage(messages.school)}
															rules={[{ required: true }]}
														>
															<Select
																showArrow
																placeholder={intl.formatMessage(messages.school)}
																optionLabelProp="label"
																onChange={v => {
																	this.updateReduxValueForDepedent(index, "school", v)
																	if (v === 'other') {
																		otherSchools.push(field.key);
																		this.setState({ otherSchools: otherSchools });
																	} else {
																		this.setState({ otherSchools: otherSchools?.filter(a => a != field.key) });
																	}
																}}
															>
																{listSchools?.map((school, index) => (
																	<Select.Option key={index} label={school.name} value={school._id}>{school.name}</Select.Option>
																))}
																<Select.Option key={listSchools?.length || 0} label='Other' value='other'>Other</Select.Option>
															</Select>
														</Form.Item>
													</Col>
													<Col xs={24} sm={24} md={12}>
														<Form.Item
															name={[field.name, "primaryTeacher"]}
															label={intl.formatMessage(messages.primaryTeacher)}
															rules={[{ required: true, message: intl.formatMessage(msgLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.primaryTeacher) }]}
														>
															<Input
																onChange={v => this.updateReduxValueForDepedent(index, "primaryTeacher", v.target.value)}
																placeholder={intl.formatMessage(messages.primaryTeacher)}
															/>
														</Form.Item>
													</Col>
												</Row>
												{otherSchools?.includes(field.key) ? (
													<>
														<Row gutter={14}>
															<Col xs={24} sm={24} md={12}>
																<Form.Item
																	name={[field.name, "otherName"]}
																	label="Other's contact name"
																	className='float-label-item'
																	rules={[{ required: true }]}
																>
																	<Input placeholder={intl.formatMessage(messages.name)} onChange={v => this.updateReduxValueForDepedent(index, "otherName", v.target.value)} />
																</Form.Item>
															</Col>
															<Col xs={24} sm={24} md={12}>
																<Form.Item
																	name={[field.name, "otherContactNumber"]}
																	label="Other's contact number"
																	rules={[
																		{ required: true },
																		{
																			pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$',
																			message: intl.formatMessage(messages.phoneNumberValid)
																		},
																	]}
																	className='float-label-item'
																>
																	<Input placeholder={intl.formatMessage(messages.contactNumber)} onChange={v => this.updateReduxValueForDepedent(index, "otherContactNumber", v.target.value)} />
																</Form.Item>
															</Col>
														</Row>
														<Row>
															<Col span={24}>
																<Form.Item
																	name={[field.name, "otherNotes"]}
																	label={intl.formatMessage(msgCreateAccount.notes)}
																	className='float-label-item'
																	rules={[{ required: true }]}
																>
																	<Input.TextArea rows={4} placeholder={intl.formatMessage(msgCreateAccount.notes)} onChange={v => this.updateReduxValueForDepedent(index, "otherNotes", v.target.value)} />
																</Form.Item>
															</Col>
														</Row>
													</>
												) : null}
												<Row gutter={14}>
													<Col xs={24} sm={24} md={8}>
														<Form.Item
															name={[field.name, "birthday"]}
															label={intl.formatMessage(messages.dateBirth)}
															rules={[{ required: true, message: intl.formatMessage(msgLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.dateBirth) }]}
														>
															<DatePicker
																format='YYYY-MM-DD'
																inputRender={(props) => {
																	return <Input
																		aria-required={props['aria-required']}
																		aria-describedby={props['aria-describedby']}
																		aria-invalid={props['aria-invalid']}
																		autoComplete={props.autoComplete}
																		autoFocus={props.autoFocus}
																		disabled={props.disabled}
																		id={props.id}
																		onBlur={props.onBlur}
																		onChange={(e) => { props.onChange(e); this.handleChangeBirthDay(e.target.value, index) }}
																		onFocus={props.onFocus}
																		onKeyDown={props.onKeyDown}
																		onMouseDown={props.onMouseDown}
																		placeholder={props.placeholder}
																		readOnly={props.readOnly}
																		value={props.value}
																		title={props.title}
																		size={props.size}
																	/>
																}}
																placeholder={intl.formatMessage(messages.dateBirth)}
																onSelect={(date) => this.handleSelectBirthday(date, index)}
																onChange={date => { this.handleSelectBirthday(date, index); this.updateReduxValueForDepedent(index, "birthday", date); }}
															/>
														</Form.Item>
													</Col>
													<Col xs={24} sm={24} md={8}>
														<Form.Item
															name={[field.name, "age"]}
															label={intl.formatMessage(messages.age)}
															rules={[{ required: true }]}
														>
															<Input disabled type='number' min={0} className="bg-white" />
														</Form.Item>
													</Col>
													<Col xs={24} sm={24} md={8}>
														<Form.Item
															name={[field.name, "currentGrade"]}
															label={intl.formatMessage(messages.currentGrade)}
															rules={[{ required: true, message: intl.formatMessage(msgLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.currentGrade) }]}
														>
															<Select
																placeholder={intl.formatMessage(messages.currentGrade)}
																onChange={v => this.updateReduxValueForDepedent(index, "currentGrade", v)}
															>
																{academicLevels.slice(6)?.map((level, index) => (
																	<Select.Option key={index} value={level}>{level}</Select.Option>
																))}
															</Select>
														</Form.Item>
													</Col>
												</Row>
												<Row>
													<Form.Item
														name={[field.name, 'services']}
														label={intl.formatMessage(messages.services)}
														rules={[{ required: true, message: intl.formatMessage(msgLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.servicesRequired) }]}
														className='add-services flex-1'
													>
														<Select
															mode="multiple"
															showArrow
															placeholder={intl.formatMessage(messages.servicesRequired)}
															optionLabelProp="label"
															onChange={v => this.updateReduxValueForDepedent(index, "services", v)}
															filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
															allowClear={true}
														>
															{skillSets?.map((service, index) => (
																<Select.Option key={index} label={service.name} value={service._id}>{service.name}</Select.Option>
															))}
														</Select>
													</Form.Item>
												</Row>
												<Form.Item
													name={[field.name, "backgroundInfor"]}
													label={intl.formatMessage(messages.briefProfile)}
													rules={[{ required: true, message: intl.formatMessage(msgLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.briefProfile) }]}
												>
													<Input.TextArea
														onChange={v => this.updateReduxValueForDepedent(index, "backgroundInfor", v.target.value)}
														rows={4}
														placeholder={intl.formatMessage(messages.briefProfile)}
													/>
												</Form.Item>
											</div>
										)
									})}
									<Form.Item className='text-center'>
										<Button
											type="text"
											className='add-dependent-btn'
											icon={<BsPlusCircle size={17} className='mr-5' />}
											onClick={() => {
												add(this.getDefaultChildObj(registerData.parentInfo));
												this.props.setRegisterData({ studentInfos: this.form?.getFieldsValue()?.children });
											}}
										>
											{intl.formatMessage(messages.addDependent)}
										</Button>
									</Form.Item>
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
			</Row >
		);
	}
}

const mapStateToProps = state => ({
	register: state.register,
	auth: state.auth,
})

export default compose(connect(mapStateToProps, { setRegisterData }))(InfoChild);