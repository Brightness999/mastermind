import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select, message } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { BsDashCircle, BsPlusCircle } from 'react-icons/bs';

import messages from '../../messages';
import messagesLogin from '../../../../Sign/Login/messages';
import { setInforProvider } from '../../../../../redux/features/authSlice';
import { getDefaultValueForProvider, getMyProviderInfo, getUserProfile } from '../../../../../utils/api/apiList';
import request from '../../../../../utils/api/request';
import PageLoading from '../../../../../components/Loading/PageLoading';

class InfoServices extends Component {
	constructor(props) {
		super(props);
		this.state = {
			SkillSet: [],
			loading: false,
		}
	}

	componentDidMount() {
		this.setState({ loading: true });
		this.getDataFromServer();
		if (window.location.pathname?.includes('changeuserprofile')) {
			request.post(getUserProfile, { id: this.props.auth.selectedUser?._id }).then(result => {
				this.setState({ loading: false });
				const { success, data } = result;
				if (success) {
					this.form?.setFieldsValue(data?.providerInfo);
				}
			}).catch(err => {
				console.log('get provider info error---', err);
				message.error("Getting Profile" + err.message);
				this.setState({ loading: false });
			})
		} else {
			request.post(getMyProviderInfo).then(result => {
				this.setState({ loading: false });
				const { success, data } = result;
				if (success) {
					this.form?.setFieldsValue(data);
				}
			}).catch(err => {
				message.error("Getting Profile" + err.message);
				this.setState({ loading: false });
			})
		}
	}

	getDataFromServer = () => {
		request.post(getDefaultValueForProvider).then(result => {
			const { data, success } = result;
			if (success) {
				this.setState({ SkillSet: data.SkillSet?.docs });
			} else {
				this.setState({ SkillSet: [] });
			}
		}).catch(err => {
			console.log(err);
			this.setState({ SkillSet: [] });
		})
	}

	onFinish = (values) => {
		try {
			this.props.dispatch(setInforProvider({
				...values,
				_id: window.location.pathname?.includes('changeuserprofile') ? this.props.auth.selectedUser?.providerInfo?._id : this.props.auth.user?.providerInfo?._id,
			}));
		} catch (error) {
			console.log('updating provider error---', error);
		}
	};

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	render() {
		const { SkillSet, loading } = this.state;

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
							className="float-label-item"
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.skillsets) }]}
						>
							<Select mode="multiple" showArrow placeholder={intl.formatMessage(messages.skillsets)}>
								{SkillSet?.map((skill, index) => (
									<Select.Option key={index} value={skill._id}>{skill.name}</Select.Option>
								))}
							</Select>
						</Form.Item>
						<Row gutter={14}>
							<Col xs={24} sm={24} md={24}>
								<Form.Item
									name="yearExp"
									label={intl.formatMessage(messages.yearsExperience)}
									className="float-label-item"
									rules={[{
										required: true,
										message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.yearsExperience),
										validator: (_, value) => {
											if (_.required && (value < 0 || value == '' || value == undefined)) return Promise.reject('Must be value greater than 0');
											return Promise.resolve();
										},
									}]}
								>
									<Input type='number' min={0} placeholder={intl.formatMessage(messages.yearsExperience)} />
								</Form.Item>
							</Col>
						</Row>
						<Form.Item
							name="publicProfile"
							label={intl.formatMessage(messages.publicProfile)}
							className="float-label-item"
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.publicProfile) }]}
						>
							<Input.TextArea rows={4} placeholder={intl.formatMessage(messages.publicProfile)} />
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
													<Input placeholder={intl.formatMessage(messages.references)} />
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

const mapStateToProps = state => ({
	auth: state.auth
})
export default compose(connect(mapStateToProps))(InfoServices);