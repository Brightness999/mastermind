import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { BsDashCircle, BsPlusCircle } from 'react-icons/bs';

import messages from '../../messages';
import messagesLogin from '../../../Login/messages';
import { setRegisterData } from '../../../../../redux/features/registerSlice';

class InfoServices extends Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		const { registerData } = this.props.register;
		if (!registerData.serviceInfor) {
			this.props.setRegisterData({ serviceInfor: this.getDefaultObj() });
		}
		const serviceInfor = registerData.serviceInfor || this.getDefaultObj();
		this.form?.setFieldsValue(serviceInfor);
	}

	getDefaultObj = () => {
		return {
			publicProfile: "",
			skillSet: undefined,
			yearExp: '',
		}
	}

	onFinish = (values) => {
		this.props.setRegisterData({ serviceInfor: values });
		this.props.onContinue();
	};

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	setValueToReduxRegisterData = (fieldName, value) => {
		const { registerData } = this.props.register;
		const serviceInfor = registerData.serviceInfor;
		let obj = {};
		obj[fieldName] = value;
		this.props.setRegisterData({ serviceInfor: { ...serviceInfor, ...obj } });
	}

	render() {
		const { skillSets } = this.props.auth.generalData;

		return (
			<Row justify="center" className="row-form">
				<div className='col-form col-info-parent'>
					<div className='div-form-title'>
						<p className='font-30 text-center mb-10'>{intl.formatMessage(messages.professionalInformation)}</p>
					</div>
					<Form
						name="form_services_offered"
						layout='vertical'
						onFinish={this.onFinish}
						onFinishFailed={this.onFinishFailed}
						ref={ref => this.form = ref}
					>
						<Form.Item
							name="skillSet"
							label={intl.formatMessage(messages.services)}
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.services) }]}
						>
							<Select mode="multiple" showArrow allowClear={true} placeholder={intl.formatMessage(messages.services)} filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0} onChange={skill => this.setValueToReduxRegisterData("skillSet", skill)}>
								{skillSets?.map((skill, index) => (
									<Select.Option key={index} value={skill._id}>{skill.name}</Select.Option>
								))}
							</Select>
						</Form.Item>
						<Row gutter={14}>
							<Col xs={24} sm={24} md={24}>
								<Form.Item
									name="yearExp"
									label={intl.formatMessage(messages.yearsExperience)}
									rules={[{
										required: true,
										message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.yearsExperience),
									}]}
								>
									<Input
										type='number'
										min={0}
										placeholder={intl.formatMessage(messages.yearsExperience)}
										onChange={e => this.setValueToReduxRegisterData("yearExp", e.target.value)}
										onKeyDown={(e) => (e.key === '-' || e.key === 'Subtract' || e.key === '.' || (e.key > -1 && e.key < 10 && e.target.value === '0') || e.key === 'e') && e.preventDefault()}
									/>
								</Form.Item>
							</Col>
						</Row>
						<Form.Item
							name="publicProfile"
							label={intl.formatMessage(messages.publicProfile)}
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.publicProfile) }]}
						>
							<Input.TextArea rows={4} placeholder={intl.formatMessage(messages.publicProfile)} onChange={e => this.setValueToReduxRegisterData("publicProfile", e.target.value)} />
						</Form.Item>
						<Form.List name="references">
							{(fields, { add, remove }) => (
								<div>
									{fields.map((field) => (
										<div key={field.key}>
											<div className={`font-16 ${field.key != 0 && 'd-none'}`}>{intl.formatMessage(messages.references)}</div>
											<div className="item-remove">
												<Form.Item
													name={[field.name, 'name']}
													rules={[{ required: false }]}
												>
													<Input placeholder={intl.formatMessage(messages.references)} onChange={() => this.setValueToReduxRegisterData("references", this.form?.getFieldValue('references'))} />
												</Form.Item>
												<BsDashCircle size={16} className='text-red icon-remove provider-admin-reference' onClick={() => remove(field.name)} />
											</div>
										</div>
									))}
									<div className='text-center'>
										<Button
											type="text"
											className='add-number-btn mb-10'
											icon={<BsPlusCircle size={17} className='mr-5' />}
											onClick={() => add()}
										>
											{intl.formatMessage(messages.addReference)}
										</Button>
									</div>
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
			</Row>
		);
	}
}

const mapStateToProps = state => ({
	register: state.register,
	auth: state.auth,
})

export default compose(connect(mapStateToProps, { setRegisterData }))(InfoServices);