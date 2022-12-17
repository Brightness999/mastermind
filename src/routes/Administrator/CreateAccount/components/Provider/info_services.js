import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select } from 'antd';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../../Sign/Login/messages';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import { url } from '../../../../../utils/api/baseUrl';
import axios from 'axios';
import { getDefaultValueForProvider } from '../../../../../utils/api/apiList';

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
		axios.post(url + getDefaultValueForProvider).then(result => {
			if (result.data.success) {
				const data = result.data.data;
				this.setState({ SkillSet: data.SkillSet.docs });
			} else {
				this.setState({ SkillSet: [] });
			}
		}).catch(err => {
			console.log('get default value for provider error ---', err);
			this.setState({ SkillSet: [] });
		})
	}

	getDefaultObj = () => {
		return {
			publicProfile: "",
			references: "",
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
							<Select mode="multiple" showArrow placeholder={intl.formatMessage(messages.skillsets)}>
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
									rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.yearsExperience) }]}
								>
									<Input placeholder={intl.formatMessage(messages.yearsExperience)} />
								</Form.Item>
							</Col>
						</Row>
						<Form.Item
							name="publicProfile"
							label={intl.formatMessage(messages.publicProfile)}
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.publicProfile) }]}
						>
							<Input.TextArea rows={4} placeholder={intl.formatMessage(messages.publicProfile)} />
						</Form.Item>
						<Form.Item
							name="references"
							label={intl.formatMessage(messages.references)}
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
	register: state.register,
})

export default compose(connect(mapStateToProps, { setRegisterData }))(InfoServices);