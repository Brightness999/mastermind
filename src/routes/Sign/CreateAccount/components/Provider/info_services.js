import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select, Switch } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import { url } from '../../../../../utils/api/baseUrl';
import axios from 'axios';

class InfoServices extends Component {
	constructor(props) {
		super(props);
		this.state = {
			SkillSet: [],
			ServiceableSchools: [],
			ScreenTime: [],
			isHomeVisit: true,
			privateOffice: true,
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
			isHomeVisit: serviceInfor.isHomeVisit,
			privateOffice: serviceInfor.privateOffice,
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
					ScreenTime: data.SreenTime,
				})
			} else {
				this.setState({
					SkillSet: [],
					ScreenTime: [],
				});
			}
		}).catch(err => {
			console.log(err);
			this.setState({
				SkillSet: [],
				ScreenTime: [],
			});
		})
	}

	getDefaultObj = () => {
		return {
			SSN: "",
			publicProfile: "",
			references: "",
			screeningTime: undefined,
			serviceableSchool: undefined,
			skillSet: undefined,
			yearExp: '',
			isHomeVisit: true,
			privateOffice: true,
			isNewClientScreening: true,
		}
	}

	onFinish = (values) => {
		this.props.setRegisterData({
			serviceInfor: values,
		})
		this.props.onContinue();
	};

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

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

	render() {
		const { SkillSet, listSchools, isHomeVisit, privateOffice, isNewClientScreening, ScreenTime } = this.state;

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
								{SkillSet.map((skill, index) => (
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
								{listSchools.map((school, index) => (
									<Select.Option key={index} label={school.name} value={school._id}>{school.name}</Select.Option>
								))}
							</Select>
						</Form.Item>
						<div className='text-center flex flex-row justify-between mb-10'>
							<div className='flex flex-row items-center w-50'>
								<Switch size="small"
									checked={isHomeVisit}
									onChange={v => {
										this.setState({ isHomeVisit: v })
										this.handleSelectChange('isHomeVisit', v)
									}}
								/>
								<p className='ml-10 mb-0'>{intl.formatMessage(messages.homeVisits)}</p>
							</div>
							<div className='flex flex-row items-center w-50'>
								<Switch size="small"
									checked={privateOffice}
									onChange={v => {
										this.setState({ privateOffice: v })
										this.handleSelectChange('privateOffice', v)
									}}
								/>
								<p className='ml-10 mb-0'>{intl.formatMessage(messages.privateOffice)}</p>
							</div>
						</div>
						<div className='text-center flex flex-row justify-between'>
							<div className='flex flex-row items-center mb-10'>
								<Switch size="small"
									checked={isNewClientScreening}
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
								rules={[{ required: isNewClientScreening, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.screeningTime) }]}
							>
								<Select
									onChange={v => this.handleSelectChange('screeningTime', v)}
									placeholder={intl.formatMessage(messages.screeningTime)}
								>
									{ScreenTime.map((value, index) => (
										<Select.Option key={index} value={index}>{value}</Select.Option>
									))}
								</Select>
							</Form.Item>
						</div>
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