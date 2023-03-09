import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select } from 'antd';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import { getDefaultValueForProvider } from '../../../../../utils/api/apiList';
import { BsDashCircle, BsPlusCircle } from 'react-icons/bs';
import request from '../../../../../utils/api/request';

class InfoServices extends Component {
	constructor(props) {
		super(props);
		this.state = {
			SkillSet: [],
		}
	}

	componentDidMount() {
		const { registerData } = this.props.register;
		if (!registerData.serviceInfor) {
			this.props.setRegisterData({ serviceInfor: this.getDefaultObj() });
		}
		const serviceInfor = registerData.serviceInfor || this.getDefaultObj();
		this.form.setFieldsValue(serviceInfor);
		this.getDataFromServer()
	}

	getDataFromServer = () => {
		request.post(getDefaultValueForProvider).then(result => {
			const { success, data } = result;
			if (success) {
				this.setState({ SkillSet: data?.SkillSet?.docs ?? [] });
			}
		}).catch(err => {
			console.log('get default value for provider error ---', err);
		})
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
		const { SkillSet } = this.state;

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
							label={intl.formatMessage(messages.skillsets)}
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.skillsets) }]}
						>
							<Select mode="multiple" showArrow placeholder={intl.formatMessage(messages.skillsets)} onChange={skill => this.setValueToReduxRegisterData("skillSet", skill)}>
								{SkillSet.map((skill, index) => (
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
										validator: (_, value) => {
											if (_.required && (value < 0 || value == '' || value == undefined)) return Promise.reject('Must be value greater than 0');
											return Promise.resolve();
										},
									}]}
								>
									<Input type='number' min={0} placeholder={intl.formatMessage(messages.yearsExperience)} onChange={e => this.setValueToReduxRegisterData("yearExp", e.target.value)} />
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
													<Input placeholder={intl.formatMessage(messages.references)} onChange={() => this.setValueToReduxRegisterData("references", this.form?.getFieldValue('references'))}/>
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
})

export default compose(connect(mapStateToProps, { setRegisterData }))(InfoServices);