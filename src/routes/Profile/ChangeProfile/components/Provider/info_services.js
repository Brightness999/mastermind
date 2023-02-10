import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select } from 'antd';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../../Sign/Login/messages';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { store } from '../../../../../redux/store';
import { setInforProvider } from '../../../../../redux/features/authSlice';
import { getDefaultValueForProvider, getMyProviderInfo } from '../../../../../utils/api/apiList';
import request from '../../../../../utils/api/request';

class InfoServices extends Component {
	constructor(props) {
		super(props);
		this.state = {
			SkillSet: [],
		}
	}

	componentDidMount() {
		request.post(getMyProviderInfo).then(result => {
			const { success, data } = result;
			if (success) {
				this.form?.setFieldsValue({ ...data, 'upload_w_9': data.W9FormPath });
			}
		})
		this.getDataFromServer()
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
		const token = localStorage.getItem('token');

		try {
			store.dispatch(setInforProvider({ data: { ...values, _id: this.props.auth.user?.providerInfo?._id }, token: token }));
		} catch (error) {
			console.log('updating provider error---', error);
		}
	};

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

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
						<Form.Item
							name="references"
							label={intl.formatMessage(messages.references)}
							className="float-label-item"
							rules={[{ required: false }]}
						>
							<Input placeholder={intl.formatMessage(messages.references)} />
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
	auth: state.auth
})
export default compose(connect(mapStateToProps))(InfoServices);