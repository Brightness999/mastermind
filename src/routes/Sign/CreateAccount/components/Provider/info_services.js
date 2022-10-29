import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select, Switch, message, Upload, AutoComplete } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import { QuestionCircleOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';
import messagesRequest from '../../../SubsidyRequest/messages';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import { url } from '../../../../../utils/api/baseUrl';
import axios from 'axios';

class InfoServices extends Component {
	constructor(props) {
		super(props);
		this.state = {
			fileList: [],
			uploading: false,
			documentUploaded: [],
			SkillSet: [],
			AcademicLevel: [],
			ServiceableSchools: [],
			ScreenTime: [],
			sameRateForAllLevel: true,
			isSeparateEvaluationRate: true,
			isHomeVisit: true,
			privateOffice: true,
			isReceiptsProvided: true,
			isNewClientScreening: true,
			listSchools: [],
		}
	}

	componentDidMount() {
		const { registerData } = this.props.register;
		if (!registerData.serviceInfor) {
			this.props.setRegisterData({ serviceInfor: this.getDefaultObj() });
		}
		var serviceInfor = registerData.serviceInfor || this.getDefaultObj();
		this.form.setFieldsValue(serviceInfor);
		this.setState({
			isSeparateEvaluationRate: serviceInfor.isSeparateEvaluationRate,
			isHomeVisit: serviceInfor.isHomeVisit,
			privateOffice: serviceInfor.privateOffice,
			isReceiptsProvided: serviceInfor.isReceiptsProvided,
			isNewClientScreening: serviceInfor.isNewClientScreening,
		})
		this.getDataFromServer()
		this.loadSchools();
	}

	getDataFromServer = () => {
		axios.post(url + 'providers/get_default_values_for_provider'
		).then(result => {
			if (result.data.success) {
				const data = result.data.data;
				this.setState({
					SkillSet: data.SkillSet.docs,
					AcademicLevel: data.AcademicLevel,
					ScreenTime: data.SreenTime,
				})
			} else {
				this.setState({
					SkillSet: [],
					AcademicLevel: [],
					ScreenTime: [],
				});
			}
		}).catch(err => {
			console.log(err);
			this.setState({
				SkillSet: [],
				AcademicLevel: [],
				ScreenTime: [],
			});
		})
	}

	getDefaultObj = () => {
		return {
			SSN: "",
			academicLevel: [{
				level: undefined,
				rate: "",
			}],
			publicProfile: "",
			separateEvaluationRate: "",
			references: "",
			screeningTime: undefined,
			serviceableSchool: undefined,
			skillSet: undefined,
			upload_w_9: "",
			yearExp: '',
			isSeparateEvaluationRate: true,
			isHomeVisit: true,
			privateOffice: true,
			isReceiptsProvided: true,
			isNewClientScreening: true,
		}
	}

	onFinish = (values) => {
		this.props.setRegisterData({
			serviceInfor: values,
			documentUploaded: this.state.documentUploaded
		})
		this.props.onContinue();
	};

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	onUploadChange = async (info) => {
		if (info.file.status !== 'uploading') {
			this.setState(prevState => ({
				fileList: [...prevState.fileList, info.file],
			}));
		}
		if (info.file.status === 'done') {
			message.success(`${info.file.name} file uploaded successfully`);
			this.form?.setFieldsValue({
				upload_w_9: info.file.name
			})
			this.props.setRegisterData({
				upload_w_9: info.file.name,
				uploaded_path: info.file.response.data
			})
			this.setState(prevState => ({ documentUploaded: [...prevState.documentUploaded, info.file.response.data] }));
		} else if (info.file.status === 'error') {
			message.error(`${info.file.name} file upload failed.`);
			this.setState(prevState => ({
				fileList: [...prevState.fileList, info.file],
			}));
		}
	}

	setValueToReduxRegisterData = (fieldName, value) => {
		const { registerData } = this.props.register;
		var serviceInfor = JSON.parse(JSON.stringify(registerData.serviceInfor));
		serviceInfor[fieldName] = value;
		this.props.setRegisterData({ serviceInfor: serviceInfor });
	}

	defaultOnValueChange = (event, fieldName) => {
		var value = event.target.value;
		this.setValueToReduxRegisterData(fieldName, value);
	}

	handleSelectChange = (fieldName, value) => {
		this.setValueToReduxRegisterData(fieldName, value);
	}

	handleChangeServiceable = (text) => {
		this.setValueToReduxRegisterData('serviceableSchool', text);
		this.searchServiceableSchool(text)
	}

	loadSchools() {
		axios.post(url + 'clients/get_all_schools'
		).then(result => {
			if (result.data.success) {
				var data = result.data.data;
				this.setState({ listSchools: data })
			}
		}).catch(err => {
			console.log(err);
		})
	}

	searchServiceableSchool = (text) => {
		axios.post(url + 'schools/get_school_infos', { data: { "search": text } }
		).then(result => {
			if (result.data.success) {
				var data = result.data.data;
				this.setState({
					ServiceableSchools: data.docs
				})
			} else {
				this.setState({
					ServiceableSchools: [],
				});
			}
		}).catch(err => {
			console.log(err);
			this.setState({
				ServiceableSchools: [],
			});
		})
	}

	render() {
		const props = {
			name: 'file',
			action: url + 'providers/upload_temp_w9_form',
			headers: {
				authorization: 'authorization-text',
			},
			onChange: this.onUploadChange,
			maxCount: 1,
			showUploadList: false,
		};

		return (
			<Row justify="center" className="row-form">
				<div className='col-form col-info-parent'>
					<div className='div-form-title'>
						<p className='font-30 text-center mb-10'>{intl.formatMessage(messages.servicesOffered)}</p>
					</div>
					<Form
						name="form_services_offered"
						onFinish={this.onFinish}
						onFinishFailed={this.onFinishFailed}
						ref={ref => this.form = ref}
					>
						<Form.Item
							name="skillSet"
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.skillsets) }]}
						>
							<Select
								placeholder={intl.formatMessage(messages.skillsets)}
								onChange={v => this.handleSelectChange('skillSet', v)}>
								{this.state.SkillSet.map((skill, index) => (
									<Select.Option key={index} value={skill._id}>{skill.name}</Select.Option>)
								)}
							</Select>
						</Form.Item>
						<Row gutter={14}>
							<Col xs={24} sm={24} md={12}>
								<Form.Item
									name="yearExp"
									rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.yearsExperience) }]}
								>
									<Input onChange={v => this.defaultOnValueChange(v, 'yearExp')} placeholder={intl.formatMessage(messages.yearsExperience)} />
								</Form.Item>
							</Col>
							<Col xs={24} sm={24} md={12}>
								<Form.Item
									name="SSN"
									rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + 'SSN' }]}
								>
									<Input onChange={v => this.defaultOnValueChange(v, 'SSN')} placeholder='SSN' suffix={<QuestionCircleOutlined className='text-primary icon-suffix' />} />
								</Form.Item>
							</Col>
						</Row>
						<Form.Item
							name="serviceableSchool"
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.serviceableSchools) }]}
						>
							<Select
								mode="multiple"
								showArrow
								placeholder={intl.formatMessage(messages.school)}
								optionLabelProp="label"
							>
								{this.state.listSchools.map((school, index) => (
									<Select.Option key={index} label={school.name} value={school._id}>{school.name}</Select.Option>
								))}
							</Select>
						</Form.Item>
						<Form.List name="academicLevel">
							{(fields, { add, remove }) => (
								<div>
									{fields.map((field) => {
										return (
											<Row gutter={14} key={field.key}>
												<Col xs={16} sm={16} md={16}>
													<Form.Item
														name={[field.name, "level"]}
														rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.academicLevel) }]}
														className='bottom-0'
														style={{ marginTop: field.key === 0 ? 0 : 14 }}
													>
														<Select
															onChange={(event => {
																var arr = this.form.getFieldValue('academicLevel')
																this.setValueToReduxRegisterData('academicLevel', arr);
															})}
															placeholder={intl.formatMessage(messages.academicLevel)}
														>
															{this.state.AcademicLevel.map((level, index) => (
																<Select.Option key={index} value={level}>{level}</Select.Option>
															))}
														</Select>
													</Form.Item>
												</Col>
												<Col xs={8} sm={8} md={8} className={field.key !== 0 && 'item-remove'}>
													<Form.Item
														name={[field.name, "rate"]}
														rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.rate) }]}
														className='bottom-0'
														style={{ marginTop: field.key === 0 ? 0 : 14 }}
													>
														<Input
															placeholder={intl.formatMessage(messages.rate)}
															onChange={(event => {
																var value = event.target.value;
																var arr = JSON.parse(JSON.stringify(this.form.getFieldValue('academicLevel')));
																for (var i = 0; i < arr.length; i++) {
																	if (arr[i] == undefined) arr[i] = {};
																	arr[i].rate = value;
																}
																this.form.setFieldValue('academicLevel', arr);
																this.setValueToReduxRegisterData('academicLevel', arr);
															})}
														/>
													</Form.Item>
													{field.key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />}
												</Col>
											</Row>
										);
									})}
									<div className='text-center flex flex-row justify-between my-10'>
										<Button
											type="text"
											className='add-level-btn'
											icon={<BsPlusCircle size={17} className='mr-5' />}
											onClick={() => add(null)}
										>
											{intl.formatMessage(messages.addLevel)}
										</Button>
										<div className='flex flex-row w-50'>
											<Switch size="small"
												checked={this.state.sameRateForAllLevel}
												onChange={v => {
													this.setState({ sameRateForAllLevel: v })
													this.handleSelectChange('sameRateForAllLevel', v)
												}}
											/>
											<p className='ml-10 mb-0'>{intl.formatMessage(messages.sameRateLevels)}</p>
										</div>
									</div>
								</div>
							)}
						</Form.List>
						<div className='text-center flex flex-row justify-between mb-10'>
							<div className='flex flex-row items-center'>
								<Switch size="small"
									checked={this.state.isSeparateEvaluationRate}
									onChange={v => {
										this.setState({ isSeparateEvaluationRate: v })
										this.handleSelectChange('isSeparateEvaluationRate', v)
									}}
								/>
								<p className='ml-10 mb-0'>{intl.formatMessage(messages.separateEvaluation)}</p>
							</div>
							<Form.Item
								name="separateEvaluationRate"
								className='mb-0'
								rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.rate) }]}
							>
								<Input
									onChange={v => { }}
									placeholder={intl.formatMessage(messages.rate)}
									className='bottom-left-0 mb-0'
								/>
							</Form.Item>
						</div>
						<div className='text-center flex flex-row justify-between mb-10'>
							<div className='flex flex-row items-center w-50'>
								<Switch size="small"
									checked={this.state.isHomeVisit}
									onChange={v => {
										this.setState({ isHomeVisit: v })
										this.handleSelectChange('isHomeVisit', v)
									}}
								/>
								<p className='ml-10 mb-0'>{intl.formatMessage(messages.homeVisits)}</p>
							</div>
							<div className='flex flex-row items-center w-50'>
								<Switch size="small"
									checked={this.state.privateOffice}
									onChange={v => {
										this.setState({ privateOffice: v })
										this.handleSelectChange('privateOffice', v)
									}}
								/>
								<p className='ml-10 mb-0'>{intl.formatMessage(messages.privateOffice)}</p>
							</div>
						</div>
						<div className='flex flex-row items-center mb-10'>
							<Switch size="small"
								checked={this.state.isReceiptsProvided}
								onChange={v => {
									this.setState({ isReceiptsProvided: v })
									this.handleSelectChange('isReceiptsProvided', v)
								}}
							/>
							<p className='ml-10 mb-0'>{intl.formatMessage(messages.receiptsRequest)}</p>
						</div>
						<div className='text-center flex flex-row justify-between'>
							<div className='flex flex-row items-center mb-10'>
								<Switch size="small"
									checked={this.state.isNewClientScreening}
									onChange={v => {
										this.setState({ isNewClientScreening: v })
										this.handleSelectChange('isNewClientScreening', v)
									}}
								/>
								<p className='ml-10 mb-0'>{intl.formatMessage(messages.newClient)}</p>
							</div>
							<Form.Item
								size='small'
								name="screeningTime"
								className='select-small'
								rules={[{ required: this.state.isNewClientScreening, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.screeningTime) }]}
							>
								<Select
									onChange={v => this.handleSelectChange('screeningTime', v)}
									placeholder={intl.formatMessage(messages.screeningTime)}
								>
									{this.state.ScreenTime.map((value, index) => (
										<Select.Option key={index} value={index}>{value}</Select.Option>
									))}
								</Select>
							</Form.Item>
						</div>
						<Form.Item
							name="upload_w_9"
							className='input-download'
							rules={[{ required: true, message: intl.formatMessage(messages.uploadMess) }]}
						>
							<Input
								addonBefore='W-9 Form'
								suffix={
									<Upload {...props}>
										<a className='font-12 underline'>{intl.formatMessage(messagesRequest.upload)}</a>
									</Upload>
								}
								readOnly
							/>
						</Form.Item>
						<Form.Item
							name="references"
							rules={[{ required: false }]}
						>
							<Input
								onChange={(event => {
									var value = event.target.value;
									this.setValueToReduxRegisterData('references', value);
								})}
								placeholder={intl.formatMessage(messages.references)}
							/>
						</Form.Item>
						<Form.Item
							name="publicProfile"
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.publicProfile) }]}
						>
							<Input.TextArea
								onChange={(event => {
									var value = event.target.value;
									this.setValueToReduxRegisterData('publicProfile', value);
								})}
								rows={4} placeholder={intl.formatMessage(messages.publicProfile)}
							/>
						</Form.Item>
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

export default compose(connect(mapStateToProps, { setRegisterData }))(InfoServices);