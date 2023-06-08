import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select, DatePicker, Popconfirm, message } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';
import moment from 'moment';
import { TbTrash } from 'react-icons/tb';
import { BsPlusCircle } from 'react-icons/bs';

import messages from '../../../../Sign/CreateAccount/messages';
import msgLogin from '../../../../Sign/Login/messages';
import msgCreateAccount from '../../../../Sign/CreateAccount/messages';
import { setInforClientChild } from '../../../../../redux/features/authSlice';
import request from '../../../../../utils/api/request';
import { getChildProfile, getDefaultValueForClient, getUserProfile } from '../../../../../utils/api/apiList';
import PageLoading from '../../../../../components/Loading/PageLoading';

class InfoChild extends Component {
	constructor(props) {
		super(props);
		this.state = {
			listServices: [],
			listSchools: [],
			academicLevels: [],
			children: [],
			loading: false,
			user: this.props.auth.user,
		}
	}

	async componentDidMount() {
		this.setState({ loading: true, listServices: this.props.auth.skillSet, academicLevels: this.props.auth.academicLevels?.slice(6) });
		await this.loadServices();
		if (window.location.pathname?.includes('changeuserprofile')) {
			request.post(getUserProfile, { id: this.props.auth.selectedUser?._id }).then(result => {
				this.setState({ loading: false });
				const { success, data } = result;
				if (success) {
					this.setState({ user: data, children: data?.studentInfos?.filter(s => !s.isRemoved) });
					data?.studentInfos?.map(item => {
						item.services = item.services.map(item => item._id);
						item.birthday = moment(item.birthday);
						item.age = moment().year() - moment(item.birthday).year() ?? 0;
						return item;
					})
					this.form?.setFieldsValue({ children: data?.studentInfos?.filter(s => !s.isRemoved) });
				}
			}).catch(err => {
				message.error("Getting Profile" + err.message);
				this.setState({ loading: false });
			})
		} else {
			request.post(getChildProfile).then(result => {
				this.setState({ loading: false });
				const { success, data } = result;
				if (success) {
					this.setState({ children: data });
					data?.map(item => {
						item.services = item.services.map(item => item._id);
						item.birthday = moment(item.birthday);
						item.age = moment().year() - moment(item.birthday).year() ?? 0;
						return item;
					})
					this.form?.setFieldsValue({ children: data });
				}
			}).catch(err => {
				message.error("Getting Profile" + err.message);
				this.setState({ loading: false });
			})
		}
	}

	async loadServices() {
		return await request.post(getDefaultValueForClient, { cityConnection: window.location.pathname?.includes('changeuserprofile') ? this.props.auth.selectedUser?.parentInfo?.cityConnection : this.props.auth.user?.parentInfo?.cityConnection }).then(result => {
			const { success, data } = result;

			if (success) {
				this.setState({ listSchools: data.schools });
			} else {
				this.setState({ listSchools: [] });
			}
		}).catch(err => {
			console.log('getDefaultValueForClient error---', err);
			this.setState({ listSchools: [] });
		})
	}

	getBirthday = (index) => {
		const children = this.form?.getFieldsValue()?.children;
		if (!!children && children[index] != undefined && !!children[index].birthday) {
			return moment(children[index].birthday);
		}
		return moment();
	}

	onFinish = async (values) => {
		try {
			const { children } = this.state;
			const additionalChildren = values.children?.filter(child => !child._id);
			const updateChildren = values.children?.filter(child => child._id);
			const removedChildren = children.filter(child => !values.children?.find(item => item._id == child._id))?.map(child => ({ ...child, isRemoved: true }));
			const params = {
				additionalChildren: additionalChildren,
				updateChildren: updateChildren,
				removedChildren: removedChildren,
				id: window.location.pathname?.includes('changeuserprofile') ? this.props.auth.selectedUser?._id : this.props.auth.user?._id,
				studentInfos: window.location.pathname?.includes('changeuserprofile') ? this.props.auth.selectedUser?.studentInfos : this.props.auth.user?.studentInfos,
			};

			const result = await this.props.dispatch(setInforClientChild(params));
			this.form?.setFieldsValue({ children: result.payload.data?.map(item => ({ ...item, birthday: moment(item.birthday) })) });
		} catch (error) {
			console.log('update children error ---', error)
		}
	}

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	handleSelectBirthday = (date, index) => {
		const dependents = this.form?.getFieldsValue();
		this.form?.setFieldsValue({ children: dependents?.children?.map((child, i) => i === index ? { ...child, age: date ? moment().year() - date.year() : 0 } : child) });
	}

	render() {
		const { listServices, listSchools, academicLevels, loading, user } = this.state;

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
						onFinishFailed={this.onFinishFailed}
						ref={ref => this.form = ref}
					>
						<Form.List name="children">
							{(fields, { add, remove }) => (
								<div>
									{fields.map((field, index) => (
										<div key={field.key} className='div-dependent-form'>
											<div className='flex flex-row items-center justify-between mb-10'>
												<div className='flex flex-row items-center'>
													<p className='font-16 mr-10 mb-0'>{intl.formatMessage(messages.dependent)}# {index + 1}</p>
												</div>
												<Popconfirm
													title={<div className='text-center'><div>Are you sure to remove your child?</div><div>This cannot be undone & you may lose your slots & won't get them back.</div></div>}
													onConfirm={() => remove(field.name)}
													okText="Yes"
													cancelText="No"
													overlayClassName='remove-child-confirm'
												>
													<div className='flex items-center gap-1 text-red cursor'>
														<TbTrash size={18} /><span>{intl.formatMessage(messages.remove)}</span>
													</div>
												</Popconfirm>
											</div>
											<Row gutter={14}>
												<Col xs={24} sm={24} md={12}>
													<Form.Item
														name={[field.name, "firstName"]}
														label={intl.formatMessage(messages.firstName)}
														className='float-label-item'
														rules={[{ required: true, message: intl.formatMessage(msgLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.firstName) }]}
													>
														<Input placeholder={intl.formatMessage(messages.firstName)} />
													</Form.Item>
												</Col>
												<Col xs={24} sm={24} md={12}>
													<Form.Item
														name={[field.name, "lastName"]}
														label={intl.formatMessage(messages.lastName)}
														className='float-label-item'
														rules={[{ required: true, message: intl.formatMessage(msgLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.lastName) }]}
													>
														<Input placeholder={intl.formatMessage(messages.lastName)} />
													</Form.Item>
												</Col>

											</Row>
											<Row gutter={14}>
												<Col xs={24} sm={24} md={12}>
													<Form.Item
														name={[field.name, "guardianPhone"]}
														className='float-label-item'
														label={intl.formatMessage(messages.guardianPhone)}
														rules={[{ required: true }]}
													>
														<Input placeholder={intl.formatMessage(messages.contactNumber)} />
													</Form.Item>
												</Col>
												<Col xs={24} sm={24} md={12}>
													<Form.Item
														name={[field.name, "guardianEmail"]}
														label={intl.formatMessage(messages.guardianEmail)}
														className='float-label-item'
														rules={[{ required: true }]}
													>
														<Input placeholder={intl.formatMessage(messages.contactEmail)} />
													</Form.Item>
												</Col>
											</Row>
											<Row gutter={14}>
												<Col xs={24} sm={24} md={12}>
													<Form.Item
														name={[field.name, "school"]}
														label={intl.formatMessage(messages.school)}
														className='float-label-item'
													>
														<Select
															showArrow
															placeholder={intl.formatMessage(messages.school)}
															optionLabelProp="label"
															allowClear={true}
														>
															{listSchools?.map((school, index) => (
																<Select.Option key={index} label={school.name} value={school._id}>{school.name}</Select.Option>
															))}
														</Select>
													</Form.Item>
												</Col>
												<Col xs={24} sm={24} md={12}>
													<Form.Item
														name={[field.name, "primaryTeacher"]}
														label={intl.formatMessage(messages.primaryTeacher)}
														rules={[{ required: true, message: intl.formatMessage(msgLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.primaryTeacher) }]}
														className='float-label-item'
													>
														<Input placeholder={intl.formatMessage(messages.primaryTeacher)} />
													</Form.Item>
												</Col>
											</Row>
											<Row gutter={14}>
												<Col xs={24} sm={24} md={8}>
													<Form.Item
														name={[field.name, "birthday"]}
														label={intl.formatMessage(messages.dateBirth)}
														className='float-label-item'
														rules={[{ required: true }]}
													>
														<DatePicker
															format={"YYYY-MM-DD"}
															placeholder={intl.formatMessage(messages.dateBirth)}
															onSelect={(date) => this.handleSelectBirthday(date, index)}
															onChange={(date) => this.handleSelectBirthday(date, index)}
														/>
													</Form.Item>
												</Col>
												<Col xs={24} sm={24} md={8}>
													<Form.Item
														name={[field.name, "age"]}
														label={intl.formatMessage(messages.age)}
														className='float-label-item'
														rules={[{ required: true }]}
													>
														<Input type='number' disabled min={0} className="bg-white" />
													</Form.Item>
												</Col>
												<Col xs={24} sm={24} md={8}>
													<Form.Item
														name={[field.name, "currentGrade"]}
														label={intl.formatMessage(messages.currentGrade)}
														rules={[{ required: true }]}
														className='float-label-item'
													>
														<Select placeholder={intl.formatMessage(messages.currentGrade)}>
															{academicLevels?.map((level, index) => (
																<Select.Option key={index} value={level}>{level}</Select.Option>
															))}
														</Select>
													</Form.Item>
												</Col>
											</Row>
											<Row>
												<Col span={24}>
													<Form.Item
														name={[field.name, 'services']}
														label={intl.formatMessage(messages.services)}
														className='add-services flex-1 float-label-item'
														rules={[{ required: true }]}
													>
														<Select
															mode="multiple"
															showArrow
															placeholder={intl.formatMessage(messages.servicesRequested)}
															optionLabelProp="label"
															filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
															allowClear={true}
														>
															{listServices?.map((service, index) => (
																<Select.Option key={index} label={service.name} value={service._id}>{service.name}</Select.Option>
															))}
														</Select>
													</Form.Item>
												</Col>
											</Row>
											<Row>
												<Col span={24}>
													<Form.Item
														name={[field.name, "backgroundInfor"]}
														label={intl.formatMessage(msgCreateAccount.briefProfile)}
														className='float-label-item'
														rules={[{ required: true, message: intl.formatMessage(msgLogin.pleaseEnter) + ' ' + intl.formatMessage(msgCreateAccount.briefProfile) }]}
													>
														<Input.TextArea rows={4} placeholder={intl.formatMessage(msgCreateAccount.briefProfile)} />
													</Form.Item>
												</Col>
											</Row>
										</div>
									))}
									<Form.Item className='text-center'>
										<Button
											type="text"
											className='add-dependent-btn'
											icon={<BsPlusCircle size={17} className='mr-5' />}
											onClick={() => add({
												lastName: user?.parentInfo?.familyName,
												guardianEmail: user?.parentInfo?.fatherEmail ? user?.parentInfo?.fatherEmail : user?.parentInfo?.motherEmail,
												guardianPhone: user?.parentInfo?.fatherPhoneNumber ? user?.parentInfo?.fatherPhoneNumber : user?.parentInfo?.motherPhoneNumber,
											})}
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

const mapStateToProps = state => ({ auth: state.auth });

export default compose(connect(mapStateToProps))(InfoChild);