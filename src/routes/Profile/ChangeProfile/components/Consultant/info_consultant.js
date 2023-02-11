import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select, message } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import intl from 'react-intl-universal';
import { connect } from 'react-redux'
import { compose } from 'redux'
import messages from '../../messages';
import messagesLogin from '../../../../Sign/Login/messages';
import request from '../../../../../utils/api/request';
import { getDefaultValuesForConsultant, getMyConsultantInfo, getUserProfile, updateConsultantInfo } from '../../../../../utils/api/apiList';

class InfoConsultant extends Component {
	constructor(props) {
		super(props);
		this.state = {
			EmailType: [],
			ContactNumberType: [],
			contactEmail: [],
			SkillSet: [],
			CityConnections: [],
		}
	}

	componentDidMount() {
		this.getDataFromServer();
		if (window.location.pathname?.includes('changeuserprofile')) {
			request.post(getUserProfile, { id: this.props.auth.selectedUser?._id }).then(result => {
				const { success, data } = result;
				if (success) {
					this.form.setFieldsValue(data?.consultantInfo);
				}
			})
		} else {
			request.post(getMyConsultantInfo).then(result => {
				const { success, data } = result;
				if (success) {
					this.form.setFieldsValue(data);
				}
			})
		}
	}

	getDataFromServer = () => {
		request.post(getDefaultValuesForConsultant).then(result => {
			const { success, data } = result;
			if (success) {
				this.setState({
					ContactNumberType: data?.ContactNumberType,
					EmailType: data?.EmailType,
					SkillSet: data?.SkillSet,
					CityConnections: data?.CityConnections,
				})
			}
		}).catch(err => {
			console.log(err);
		})
	}

	onFinish = async (values) => {
		if (values) {
			request.post(updateConsultantInfo, { ...values, _id: window.location.pathname?.includes('changeuserprofile') ? this.props.auth.selectedUser?.consultantInfo : this.props.auth.user?.consultantInfo }).then(res => {
				const { success } = res;
				if (success) {
					message.success('Updated successfully');
				}
			}).catch(err => {
				console.log(err)
				message.error(err.message);
			})
		} else {
			message.warning('Not enough data.');
		}
	};

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	render() {
		const { CityConnections, SkillSet, EmailType, ContactNumberType } = this.state;

		return (
			<Row justify="center" className="row-form">
				<div className='col-form col-info-parent'>
					<div className='div-form-title'>
						<p className='font-30 text-center mb-10'>{intl.formatMessage(messages.generalInformation)}</p>
					</div>
					<Form
						name="form_profile_provider"
						layout='vertical'
						onFinish={this.onFinish}
						onFinishFailed={this.onFinishFailed}
						ref={ref => this.form = ref}
					>
						<Form.Item
							name="referredToAs"
							label={intl.formatMessage(messages.referredAs)}
							className="float-label-item"
						>
							<Input placeholder={intl.formatMessage(messages.referredAs)} />
						</Form.Item>
						<Form.Item
							name="cityConnection"
							label={intl.formatMessage(messages.cityConnections)}
							className="float-label-item"
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.cityConnections) }]}
						>
							<Select
								placeholder={intl.formatMessage(messages.cityConnections)}
								showSearch
								optionFilterProp="children"
								filterOption={(input, option) => option.children?.toLowerCase().includes(input.toLowerCase())}
							>
								{CityConnections?.map((value, index) => (
									<Select.Option key={index} value={value._id}>{value.name}</Select.Option>
								))}
							</Select>
						</Form.Item>
						<Form.Item
							name="skillSet"
							label={intl.formatMessage(messages.skillsets)}
							className="float-label-item"
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.skillsets) }]}
						>
							<Select
								placeholder={intl.formatMessage(messages.skillsets)}
								value={0}
								disabled
								className='consultant-skill'
							>
								{SkillSet?.map((value, index) => (
									<Select.Option key={index} value={index}>{value}</Select.Option>
								))}
							</Select>
						</Form.Item>
						<Form.List name="contactNumber">
							{(fields, { add, remove }) => (
								<>
									{fields.map(({ key, name, ...restField }) => (
										<Row key={key} gutter={14}>
											<Col xs={16} sm={16} md={16}>
												<Form.Item
													{...restField}
													name={[name, 'phoneNumber']}
													label={intl.formatMessage(messages.contactNumber)}
													className="bottom-0 float-label-item"
													style={{ marginTop: key === 0 ? 0 : 14 }}
													rules={[
														{
															required: true,
															message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.contactNumber)
														},
														{
															pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$',
															message: intl.formatMessage(messages.phoneNumberValid)
														},
													]}
												>
													<Input placeholder={intl.formatMessage(messages.contactNumber)} />
												</Form.Item>
											</Col>
											<Col xs={8} sm={8} md={8} className='item-remove'>
												<Form.Item
													{...restField}
													name={[name, 'type']}
													label={intl.formatMessage(messages.type)}
													className="bottom-0 float-label-item"
													rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.type) }]}
													style={{ marginTop: key === 0 ? 0 : 14 }}
												>
													<Select placeholder={intl.formatMessage(messages.type)}>
														{ContactNumberType.map((value, index) => (
															<Select.Option key={index} value={value}>{value}</Select.Option>
														))}
													</Select>
												</Form.Item>
												{key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(name)} />}
											</Col>
										</Row>
									))}
									<Form.Item className='text-center mb-0'>
										<Button
											type="text"
											className='add-number-btn mb-10'
											icon={<BsPlusCircle size={17} className='mr-5' />}
											onClick={() => add()}
										>
											{intl.formatMessage(messages.addNumber)}
										</Button>
									</Form.Item>
								</>
							)}
						</Form.List>
						<Form.List name="contactEmail">
							{(fields, { add, remove }) => (
								<>
									{fields.map(({ key, name, ...restField }) => (
										<Row key={key} gutter={14}>
											<Col xs={16} sm={16} md={16}>
												<Form.Item
													{...restField}
													name={[name, 'email']}
													label={intl.formatMessage(messages.contactEmail)}
													className="bottom-0 float-label-item"
													style={{ marginTop: key === 0 ? 0 : 14 }}
													rules={[
														{
															required: true,
															message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.contactEmail)
														},
														{
															type: 'email',
															message: intl.formatMessage(messagesLogin.emailNotValid)
														}
													]}
												>
													<Input placeholder={intl.formatMessage(messages.contactEmail)} />
												</Form.Item>
											</Col>
											<Col xs={8} sm={8} md={8} className='item-remove'>
												<Form.Item
													{...restField}
													name={[name, 'type']}
													label={intl.formatMessage(messages.type)}
													className="bottom-0 float-label-item"
													rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.type) }]}
													style={{ marginTop: key === 0 ? 0 : 14 }}
												>
													<Select placeholder={intl.formatMessage(messages.type)}>
														{EmailType.map((value, index) => (
															<Select.Option key={index} value={value}>{value}</Select.Option>
														))}
													</Select>
												</Form.Item>
												{key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(name)} />}
											</Col>
										</Row>
									))}
									<Form.Item className='text-center mb-0'>
										<Button
											type="text"
											className='add-number-btn mb-10'
											icon={<BsPlusCircle size={17} className='mr-5' />}
											onClick={() => add()}
										>
											{intl.formatMessage(messages.addEmail)}
										</Button>
									</Form.Item>
								</>
							)}
						</Form.List>
						<Form.Item
							name="notes"
							label={intl.formatMessage(messages.notes)}
						>
							<Input.TextArea rows={4} placeholder={intl.formatMessage(messages.notes)} />
						</Form.Item>
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
			</Row>
		);
	}
}

const mapStateToProps = state => ({
	auth: state.auth,
})

export default compose(connect(mapStateToProps))(InfoConsultant);