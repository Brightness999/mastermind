import React from 'react';
import { Row, Col, Form, Button, Input, Select, Switch, Divider, Upload, message } from 'antd';
import { BiChevronLeft } from 'react-icons/bi';
import intl from 'react-intl-universal';
import messages from '../messages';
import messagesCreateAccount from '../../CreateAccount/messages';
import messagesLogin from '../../Login/messages';
import messagesRequest from '../messages'
import './index.less';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { setRegisterData } from '../../../../redux/features/registerSlice';
import { url } from '../../../../utils/api/baseUrl';
import axios from 'axios';

class SubsidyRequest extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			fileList: [],
			uploading: false,
			SkillSet: [],
			studentInfos: {},
			dependents: [],
			documentUploaded: [],
			isRequestRav: true,
			listSchools: [],
		}
	}

	onFinish = (values) => {
		console.log('Success:', values);
	};

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	componentDidMount() {
		const { registerData } = this.props.register;
		var arrDependent = [];
		for (var i = 0; i < registerData.studentInfos.length; i++) {
			if (registerData.studentInfos[i].firstName.length > 0 || registerData.studentInfos[i].lastName.length > 0) {
				arrDependent.push(registerData.studentInfos[i]);
			}
		}
		this.setState({
			studentInfos: registerData.studentInfos,
			dependents: arrDependent
		})
		this.form.setFieldsValue({ dependent: this.props.selectedDependent });
		this.loadDataForDependent(this.props.selectedDependent)
		this.loadDataFromServer();
		this.loadSchools();
	}

	loadDataForDependent(index) {
		const { registerData } = this.props.register;
		if (!!registerData.studentInfos[index].subsidyRequest) {
			this.form.setFieldsValue(registerData.studentInfos[index].subsidyRequest);
		} else {
			this.form.setFieldsValue(this.getDefaultObj());
		}
	}

	getDefaultObj() {
		return {
			"skillSet": 0,
			"school": "",
			"requestContactRav": 1,
			"ravPhone": "",
			"ravName": "",
			"ravEmail": "",
			"therapistContact": "",
			"therapistPhone": "",
			"therapistEmail": "",
			"note": "",
			"documents": [],
			"documentUploaded": [],
		}
	}

	updateReduxValueFor1Depedent(index, fieldName, value) {
		const { registerData } = this.props.register;
		var studentInfos = [...registerData.studentInfos]
		var selectedObj = { ...studentInfos[index] };
		selectedObj[fieldName] = value;
		studentInfos[index] = selectedObj;
		this.props.setRegisterData({ studentInfos: studentInfos });
	}

	uploadFileToServer = async (file) => {
		// Create an object of formData
		const formData = new FormData();

		// Update the formData object
		formData.append(
			"myFile",
			file,
			file.name
		);

		// Request made to the backend api
		// Send formData object
		var postResult = await axios.post(url + "clients/upload_document", formData);
	}

	loadDataFromServer() {
		axios.post(url + 'clients/get_default_value_for_client'
		).then(result => {
			if (result.data.success) {
				var data = result.data.data;
				this.setState({ SkillSet: data.SkillSet })
			} else {
				this.setState({
					checkEmailExist: false,
				});
			}
		}).catch(err => {
			console.log(err);
			this.setState({
				checkEmailExist: false,
			});
		})
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

	onChangeDependent(v) {
		this.props.changeSelectedDependent(v);
		this.loadDataForDependent(v);
	}

	onSubmit = async () => {
		try {
			const values = await this.form.validateFields();
			values.documents = this.state.fileList;
			values.documentUploaded = this.state.fileList.map(file => {
				return file.response.data;
			});
			values.requestContactRav = this.state.isRequestRav;
			this.updateReduxValueFor1Depedent(this.props.selectedDependent, 'subsidyRequest', values)
			this.props.onOpenSubsidyStep(2, this.props.selectedDependent);
		} catch (error) {
			console.log('error', error);
		}
	}

	onChangeUpload = (info) => {
		if (info.file.status !== 'uploading') {
			this.setState(prevState => ({
				fileList: [...prevState.fileList, info.file],
			}));
		}
		if (info.file.status === 'done') {
			message.success(`${info.file.name} file uploaded successfully`);
			this.setState({ documentUploaded: this.state.documentUploaded.push(info.file.response.data) });
		} else if (info.file.status === 'error') {
			message.error(`${info.file.name} file upload failed.`);
			this.setState(prevState => ({
				fileList: [...prevState.fileList, info.file],
			}));
		}
	}

	onRemoveFile = (info) => {
		this.setState({
			fileList: this.state.fileList.filter((file) => {
				return info.file.name !== file.file.name
			})
		});
	}

	backToPrev() {
		this.props.onOpenSubsidyStep(-1, -1);
	}

	render() {
		const props = {
			name: 'file',
			action: url + "clients/upload_document",
			headers: {
				authorization: 'authorization-text',
			},
			onChange: this.onChangeUpload,
		};

		return (
			<div className="full-layout page subsidyrequest-page">
				<Row justify="center" className="row-form">
					<div className='col-form col-subsidy'>
						<div className='div-form-title mb-10'>
							<Button
								type="text"
								className='back-btn'
								onClick={() => this.backToPrev()}
							>
								<BiChevronLeft size={25} />{intl.formatMessage(messagesCreateAccount.back)}
							</Button>
							<p className='font-24 text-center mb-0'>{intl.formatMessage(messagesCreateAccount.subsidyRequest)}</p>
						</div>
						<Form
							name="form_subsidy_request"
							initialValues={{ remember: true }}
							onFinish={this.onFinish}
							onFinishFailed={this.onFinishFailed}
							ref={ref => this.form = ref}
						>
							<Form.Item
								name="dependent"
								rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.dependent) }]}
							>
								<Select
									placeholder={intl.formatMessage(messagesCreateAccount.dependent)}
									onChange={v => this.onChangeDependent(v)}
								>
									{this.state.dependents.map((item, index) => (
										<Select.Option key={index} value={index}>{item.firstName} {item.lastName} </Select.Option>
									))}
								</Select>
							</Form.Item>
							<Form.Item
								name="skillSet"
								rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.skillsetRequested) }]}
							>
								<Select placeholder={intl.formatMessage(messages.skillsetRequested)}>
									{this.state.SkillSet.map((skill, index) => (
										<Select.Option key={index} value={index}>{skill}</Select.Option>
									))}
								</Select>
							</Form.Item>
							<Form.Item
								name="school"
								rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.school) }]}
							>
								<Select
									showArrow
									placeholder={intl.formatMessage(messages.school)}
									optionLabelProp="label"
								>
									{this.state.listSchools.map((school, index) => (
										<Select.Option key={index} label={school.name} value={school._id}>{school.name}</Select.Option>
									))}
								</Select>
							</Form.Item>
							<Row gutter={14}>
								<Col xs={24} sm={24} md={12}>
									<div className='flex flex-row items-center pb-10'>
										<Switch size="small" checked={this.state.isRequestRav} onChange={v => this.setState({ isRequestRav: v })} />
										<p className='font-10 ml-10 mb-0'>{intl.formatMessage(messages.requestRav)}</p>
									</div>
								</Col>
								<Col xs={24} sm={24} md={12}>
									<Form.Item
										name="ravPhone"
										rules={[
											{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesLogin.contactNumber) },
											{ pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$', message: intl.formatMessage(messages.phoneNumberValid) },
										]}
									>
										<Input size="small" placeholder={intl.formatMessage(messages.ravPhone) + ' #'} />
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={14}>
								<Col xs={24} sm={24} md={12}>
									<Form.Item
										name="ravName"
										rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.nameOfRav) }]}
									>
										<Input size="small" placeholder={intl.formatMessage(messages.nameOfRav)} />
									</Form.Item>
								</Col>
								<Col xs={24} sm={24} md={12}>
									<Form.Item
										name="ravEmail"
										rules={[
											{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.ravEmail) },
											{ type: 'email', message: intl.formatMessage(messages.emailNotValid) }
										]}
									>
										<Input size="small" placeholder={intl.formatMessage(messages.ravEmail)} />
									</Form.Item>
								</Col>
							</Row>
							<Form.Item name="therapistContact">
								<Input placeholder={intl.formatMessage(messages.therapistContact)} />
							</Form.Item>
							<Row gutter={14}>
								<Col xs={24} sm={24} md={12}>
									<Form.Item
										name="therapistPhone"
										rules={[
											{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.therapistPhone) },
											{ pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$', message: intl.formatMessage(messages.phoneNumberValid) },
										]}
									>
										<Input size="small" placeholder={intl.formatMessage(messages.therapistPhone)} />
									</Form.Item>
								</Col>
								<Col xs={24} sm={24} md={12}>
									<Form.Item
										name="therapistEmail"
										rules={[
											{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.therapistEmail) },
											{ type: 'email', message: intl.formatMessage(messages.emailNotValid) },
										]}
									>
										<Input size="small" placeholder={intl.formatMessage(messages.therapistEmail)} />
									</Form.Item>
								</Col>
							</Row>
							<Divider style={{ marginTop: 0, marginBottom: 15, borderColor: '#d7d7d7' }} />
							<Form.Item
								name="note"
								rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.generalNotes) }]}
							>
								<Input.TextArea rows={5} placeholder={intl.formatMessage(messages.generalNotes)} />
							</Form.Item>
							<Form.Item
								name="documents"
								className='input-download'
								rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesRequest.upload) }]}
							>
								<div className='input-download flex flex-row justify-between'>
									<div className='div-document'>
										<p>Document</p>
									</div>
									<div className='div-upload flex-1'>
										<Upload {...props} onRemove={this.onRemoveFile} >
											<a className='font-12 underline'>{intl.formatMessage(messagesRequest.upload)}</a>
										</Upload>
									</div>
								</div>
							</Form.Item>
							<Form.Item className="form-btn continue-btn" >
								<Button
									block
									type="primary"
									htmlType="submit"
									onClick={this.onSubmit}
								>
									{intl.formatMessage(messages.review).toUpperCase()}
								</Button>
							</Form.Item>
						</Form>
					</div>
				</Row>
			</div>
		);
	}
}

const mapStateToProps = state => ({
	register: state.register,
})

export default compose(connect(mapStateToProps, { setRegisterData }))(SubsidyRequest);