import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select, DatePicker, Switch } from 'antd';
import { BsPlusCircle } from 'react-icons/bs';
import { TbTrash } from 'react-icons/tb';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import moment from 'moment';
import { url } from '../../../../../utils/api/baseUrl';
import axios from 'axios';
import { getAllSchoolsForParent, getDefaultValueForClient } from '../../../../../utils/api/apiList';

class InfoChild extends Component {
	constructor(props) {
		super(props);
		this.state = {
			formChild: [
				{
					firstName: '',
					lastName: '',
					birthday: '',
					backgroundInfor: '',
					primaryTeacher: '',
					currentGrade: '',
					school: '',
					services: [],
				},
			],
			isTypeFull: false,
			phoneFill: '',
			emailFill: '',
			listServices: [],
			inforChildren: [{}, {}, {}],
			parentInfo: {},
			listSchools: [],
		}
	}

	componentDidMount() {
		const { registerData } = this.props.register;
		this.setState({ parentInfo: registerData.parentInfo })
		const newChild = this.getDefaultChildObj(registerData.parentInfo);
		let studentInfos = !!registerData.studentInfos ? JSON.parse(JSON.stringify(registerData.studentInfos)) : [newChild];
		if (!registerData.studentInfos) {
			this.props.setRegisterData({ studentInfos: studentInfos });
		}
		for (let i = 0; i < studentInfos.length; i++) {
			if ((studentInfos[i].birthday + '').length > 0) {
				studentInfos[i].birthday_moment = moment(studentInfos[i].birthday);
			}
		}
		this.form.setFieldsValue({ children: studentInfos });
		this.loadServices();
		this.loadSchools(registerData.parentInfo);
	}

	createNewChild() {
		const { registerData } = this.props.register;
		const newChild = this.getDefaultChildObj(registerData.parentInfo);
		this.form.setFieldsValue({ children: registerData.studentInfos });
		this.props.setRegisterData({ studentInfos: [...registerData.studentInfos, newChild] });
	}

	loadServices() {
		axios.post(url + getDefaultValueForClient).then(result => {
			if (result.data.success) {
				const data = result.data.data;
				this.setState({ listServices: data.SkillSet })
			} else {
				this.setState({ checkEmailExist: false });
			}
		}).catch(err => {
			console.log('getDefaultValueForClient error---', err);
		})
	}

	loadSchools(parentInfo) {
		axios.post(url + getAllSchoolsForParent, { communityServed: parentInfo?.cityConnection }).then(result => {
			if (result.data.success) {
				const data = result.data.data;
				this.setState({ listSchools: data })
			}
		}).catch(err => {
			console.log('getAllSchoolsForParent error---', err);
		})
	}

	getDefaultChildObj(parentInfo) {
		const obj = {
			"firstName": "",
			"lastName": "",
			"birthday": "",
			"guardianPhone": parentInfo?.fatherPhoneNumber || parentInfo?.motherPhoneNumber,
			"guardianEmail": parentInfo?.fatherEmail || parentInfo?.motherEmail,
			"backgroundInfor": "",
			"school": undefined,
			"primaryTeacher": "",
			"currentGrade": "",
			"services": [],
			"hasIEP": 1,
			"availabilitySchedule": []
		};
		return obj;
	}

	onRemove1Depenent(index) {
		const { registerData } = this.props.register;
		let studentInfos = [...registerData.studentInfos]
		studentInfos.splice(index, 1);
		this.props.setRegisterData({ studentInfos: studentInfos });
	}

	updateReduxValueFor1Depedent(index, fieldName, value) {
		const { registerData } = this.props.register;
		let studentInfos = [...registerData.studentInfos]
		let selectedObj = { ...studentInfos[index] };
		selectedObj[fieldName] = value;
		studentInfos[index] = selectedObj;
		this.props.setRegisterData({ studentInfos: studentInfos });
	}

	getBirthday = (index) => {
		if (!!this.props.register.studentInfos && this.props.register.studentInfos[index] != undefined && !!this.props.register.studentInfos[index].birthday_moment) {
			return this.props.register.studentInfos[index].birthday_moment;
		}
		return moment();
	}

	onFinish = (values) => {
		this.props.onContinue();
	};

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	checkFillinAllFieldForSubsidy(index) {
		const { registerData } = this.props.register;
		const studentInfo = registerData.studentInfos[index];
		try {
			const isAlreadyFillIn = !!studentInfo && !!studentInfo.firstName && studentInfo.firstName.length > 0
				&& !!studentInfo.lastName && studentInfo.lastName.length > 0
				&& ('' + studentInfo.birthday).length > 0
				&& studentInfo.guardianPhone.length > 0
				&& studentInfo.guardianEmail.length > 0
				&& studentInfo.backgroundInfor.length > 0
				&& studentInfo.school?.length > 0
				&& studentInfo.primaryTeacher.length > 0
				&& studentInfo.currentGrade.length > 0
				&& studentInfo.services.length > 0;

			return isAlreadyFillIn;
		} catch (err) {
			return false;
		}
	}

	render() {
		return (
			<Row justify="center" className="row-form">
				<div className='col-form col-info-child'>
					<div className='div-form-title'>
						<p className='font-30 text-center mb-10'>{intl.formatMessage(messages.tellYourself)}</p>
						<p className='font-24 text-center'>{intl.formatMessage(messages.contactInformation)}</p>
					</div>
					<Form
						name="form_contact"
						onFinish={this.onFinish}
						onFinishFailed={this.onFinishFailed}
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
														<Switch
															onChange={v => this.updateReduxValueFor1Depedent(index, "hasIEP", v)}
															size="small" defaultChecked
														/>
														<p className='font-16 ml-10 mb-0'>{intl.formatMessage(messages.hasIEP)}</p>
													</div>
													{field.key === 0 ? null : <Button
														type='text'
														className='remove-btn'
														icon={<TbTrash size={18} />}
														onClick={() => {
															remove(field.name);
															this.onRemove1Depenent(index);
														}}
													>{intl.formatMessage(messages.remove)}</Button>}
												</div>
												<Row gutter={14}>
													<Col xs={24} sm={24} md={9}>
														<Form.Item
															name={[field.name, "firstName"]}
															rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.firstName) }]}
														>
															<Input
																onChange={v => this.updateReduxValueFor1Depedent(index, "firstName", v.target.value)}
																placeholder={intl.formatMessage(messages.firstName)}
															/>
														</Form.Item>
													</Col>
													<Col xs={24} sm={24} md={9}>
														<Form.Item
															name={[field.name, "lastName"]}
															rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.lastName) }]}
														>
															<Input
																onChange={v => this.updateReduxValueFor1Depedent(index, "lastName", v.target.value)}
																placeholder={intl.formatMessage(messages.lastName)}
															/>
														</Form.Item>
													</Col>
													<Col xs={24} sm={24} md={6}>
														<Form.Item
															name={[field.name, "birthday_moment"]}
															rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.dateBirth) }]}
														>
															<DatePicker
																format='YYYY-MM-DD'
																placeholder={intl.formatMessage(messages.dateBirth)}
																selected={this.getBirthday(index)}
																onChange={v => this.updateReduxValueFor1Depedent(index, "birthday", v.valueOf())}
															/>
														</Form.Item>
													</Col>
												</Row>
												<Row gutter={14}>
													<Col xs={24} sm={24} md={12}>
														<Form.Item
															name={[field.name, "guardianPhone"]}
															className='float-label-item'
															label={intl.formatMessage(messages.guardianPhone)}>
															<Input
																onChange={v => this.updateReduxValueFor1Depedent(index, "guardianPhone", v.target.value)}
																placeholder={intl.formatMessage(messages.contactNumber)}
															/>
														</Form.Item>
													</Col>
													<Col xs={24} sm={24} md={12}>
														<Form.Item className='float-label-item'
															name={[field.name, "guardianEmail"]}
															label={intl.formatMessage(messages.guardianEmail)}>
															<Input
																onChange={v => this.updateReduxValueFor1Depedent(index, "guardianEmail", v.target.value)}
																placeholder={intl.formatMessage(messages.contactEmail)}
															/>
														</Form.Item>
													</Col>
												</Row>
												<Form.Item
													name={[field.name, "backgroundInfor"]}
													rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.backgroundInformation) }]}
												>
													<Input.TextArea
														onChange={v => this.updateReduxValueFor1Depedent(index, "backgroundInfor", v.target.value)}
														rows={4}
														placeholder={intl.formatMessage(messages.backgroundInformation)}
													/>
												</Form.Item>
												<Form.Item
													name={[field.name, "school"]}
													rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.school) }]}
												>
													<Select
														showArrow
														placeholder={intl.formatMessage(messages.school)}
														optionLabelProp="label"
														onChange={v => this.updateReduxValueFor1Depedent(index, "school", v)}
													>
														{this.state.listSchools.map((school, index) => (
															<Select.Option key={index} label={school.name} value={school._id}>{school.name}</Select.Option>
														))}
													</Select>
												</Form.Item>
												<Row gutter={14}>
													<Col xs={24} sm={24} md={12}>
														<Form.Item
															name={[field.name, "primaryTeacher"]}
															rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.primaryTeacher) }]}
														>
															<Input
																onChange={v => this.updateReduxValueFor1Depedent(index, "primaryTeacher", v.target.value)}
																placeholder={intl.formatMessage(messages.primaryTeacher)}
															/>
														</Form.Item>
													</Col>
													<Col xs={24} sm={24} md={12}>
														<Form.Item
															name={[field.name, "currentGrade"]}
															rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.currentGrade) }]}
														>
															<Input
																onChange={v => this.updateReduxValueFor1Depedent(index, "currentGrade", v.target.value)}
																placeholder={intl.formatMessage(messages.currentGrade)}
															/>
														</Form.Item>
													</Col>
												</Row>
												<div className='flex flex-row'>
													<Form.Item
														name={[field.name, 'services']}
														rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.servicesRequired) }]}
														className='add-services bottom-0 flex-1'
													>
														<Select
															mode="multiple"
															showArrow
															placeholder={intl.formatMessage(messages.servicesRequired)}
															optionLabelProp="label"
															onChange={v => this.updateReduxValueFor1Depedent(index, "services", v)}
														>
															{this.state.listServices.map((service, index) => (
																<Select.Option key={index} label={service.name} value={service._id}>{service.name}</Select.Option>
															))}
														</Select>
													</Form.Item>
													<Button
														className='ml-10'
														disabled={!this.checkFillinAllFieldForSubsidy(index)}
														onClick={v => this.props.onOpenSubsidyStep(1, index)}
													>
														{intl.formatMessage(messages.subsidyRequest)}
													</Button>
												</div>
											</div>
										)
									})}
									<Form.Item className='text-center'>
										<Button
											type="text"
											className='add-dependent-btn'
											icon={<BsPlusCircle size={17} className='mr-5' />}
											onClick={() => {
												this.createNewChild()
												add(null)
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
})

export default compose(connect(mapStateToProps, { setRegisterData }))(InfoChild);