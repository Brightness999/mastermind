import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select, DatePicker } from 'antd';
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
			listServices: [],
			parentInfo: {},
			listSchools: [],
			academicLevels: [],
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
		this.form.setFieldsValue({ children: [...registerData.studentInfos, newChild] });
		this.props.setRegisterData({ studentInfos: [...registerData.studentInfos, newChild] });
	}

	loadServices() {
		axios.post(url + getDefaultValueForClient).then(result => {
			if (result.data.success) {
				const data = result.data.data;
				this.setState({
					listServices: data?.SkillSet,
					academicLevels: data?.AcademicLevel,
				})
			} else {
				this.setState({
					listServices: [],
					academicLevels: [],
				});
			}
		}).catch(err => {
			console.log('getDefaultValueForClient error---', err);
			this.setState({
				listServices: [],
				academicLevels: [],
			});
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
			"lastName": parentInfo?.fatherName?.split(' ')?.[1] ? parentInfo?.fatherName?.split(' ')?.[1] : parentInfo?.motherName?.split(' ')?.[1],
			"birthday": "",
			"guardianPhone": parentInfo?.fatherPhoneNumber || parentInfo?.motherPhoneNumber,
			"guardianEmail": parentInfo?.fatherEmail || parentInfo?.motherEmail,
			"backgroundInfor": "",
			"school": undefined,
			"primaryTeacher": "",
			"currentGrade": "",
			"services": [],
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

	render() {
		const { listSchools, listServices, academicLevels, parentInfo } = this.state;

		return (
			<Row justify="center" className="row-form">
				<div className='col-form col-info-child'>
					<div className='div-form-title'>
						<p className='font-30 text-center mb-10'>{intl.formatMessage(messages.tellYourself)}</p>
						<p className='font-24 text-center'>{intl.formatMessage(messages.dependents)}</p>
					</div>
					<Form
						name="form_contact"
						layout='vertical'
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
													</div>
													{field.key === 0 ? null : <Button
														type='text'
														className='remove-btn'
														icon={<TbTrash size={18} />}
														onClick={() => {
															remove(field.name);
															this.onRemoveDepenent(index);
														}}
													>{intl.formatMessage(messages.remove)}</Button>}
												</div>
												<Row gutter={14}>
													<Col xs={24} sm={24} md={9}>
														<Form.Item
															name={[field.name, "firstName"]}
															label={intl.formatMessage(messages.firstName)}
															rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.firstName) }]}
														>
															<Input
																onChange={v => this.updateReduxValueForDepedent(index, "firstName", v.target.value)}
																placeholder={intl.formatMessage(messages.firstName)}
															/>
														</Form.Item>
													</Col>
													<Col xs={24} sm={24} md={9}>
														<Form.Item name={[field.name, "lastName"]} label={intl.formatMessage(messages.lastName)}>
															<Input defaultValue={parentInfo?.fatherName?.split(' ')?.[1] ? parentInfo?.fatherName?.split(' ')?.[1] : parentInfo?.motherName?.split(' ')?.[1]} disabled />
														</Form.Item>
													</Col>
													<Col xs={24} sm={24} md={6}>
														<Form.Item
															name={[field.name, "birthday_moment"]}
															label={intl.formatMessage(messages.dateBirth)}
															rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.dateBirth) }]}
														>
															<DatePicker
																format='YYYY-MM-DD'
																placeholder={intl.formatMessage(messages.dateBirth)}
																selected={this.getBirthday(index)}
																onChange={v => this.updateReduxValueForDepedent(index, "birthday", v.valueOf())}
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
																onChange={v => this.updateReduxValueForDepedent(index, "guardianPhone", v.target.value)}
																placeholder={intl.formatMessage(messages.contactNumber)}
															/>
														</Form.Item>
													</Col>
													<Col xs={24} sm={24} md={12}>
														<Form.Item className='float-label-item'
															name={[field.name, "guardianEmail"]}
															label={intl.formatMessage(messages.guardianEmail)}>
															<Input
																onChange={v => this.updateReduxValueForDepedent(index, "guardianEmail", v.target.value)}
																placeholder={intl.formatMessage(messages.contactEmail)}
															/>
														</Form.Item>
													</Col>
												</Row>
												<Form.Item
													name={[field.name, "school"]}
													label={intl.formatMessage(messages.school)}
													rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.school) }]}
												>
													<Select
														showArrow
														placeholder={intl.formatMessage(messages.school)}
														optionLabelProp="label"
														onChange={v => this.updateReduxValueForDepedent(index, "school", v)}
													>
														{listSchools?.map((school, index) => (
															<Select.Option key={index} label={school.name} value={school._id}>{school.name}</Select.Option>
														))}
													</Select>
												</Form.Item>
												<Row gutter={14}>
													<Col xs={24} sm={24} md={12}>
														<Form.Item
															name={[field.name, "primaryTeacher"]}
															label={intl.formatMessage(messages.primaryTeacher)}
															rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.primaryTeacher) }]}
														>
															<Input
																onChange={v => this.updateReduxValueForDepedent(index, "primaryTeacher", v.target.value)}
																placeholder={intl.formatMessage(messages.primaryTeacher)}
															/>
														</Form.Item>
													</Col>
													<Col xs={24} sm={24} md={12}>
														<Form.Item
															name={[field.name, "currentGrade"]}
															label={intl.formatMessage(messages.currentGrade)}
															rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.currentGrade) }]}
														>
															<Select
																placeholder={intl.formatMessage(messages.currentGrade)}
																onChange={v => this.updateReduxValueForDepedent(index, "currentGrade", v)}
															>
																{academicLevels?.map((level, index) => (
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
														rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.servicesRequired) }]}
														className='add-services flex-1'
													>
														<Select
															mode="multiple"
															showArrow
															placeholder={intl.formatMessage(messages.servicesRequired)}
															optionLabelProp="label"
															onChange={v => this.updateReduxValueForDepedent(index, "services", v)}
														>
															{listServices?.map((service, index) => (
																<Select.Option key={index} label={service.name} value={service._id}>{service.name}</Select.Option>
															))}
														</Select>
													</Form.Item>
												</Row>
												<Form.Item
													name={[field.name, "backgroundInfor"]}
													label={intl.formatMessage(messages.briefProfile)}
													rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.briefProfile) }]}
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
											onClick={() => this.createNewChild()}
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