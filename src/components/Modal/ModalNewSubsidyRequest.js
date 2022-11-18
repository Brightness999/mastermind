import React from 'react';
import { Row, Col, Form, Button, Input, Select, Switch, Divider, Upload, message, Modal } from 'antd';
import intl from 'react-intl-universal';
import messages from './messages';
import messagesCreateAccount from '../../routes/Sign/CreateAccount/messages';
import messagesLogin from '../../routes/Sign/Login/messages';
import messagesRequest from '../../routes/Sign/SubsidyRequest/messages';
import './style/index.less';
import request from '../../utils/api/request'
import { url } from '../../utils/api/baseUrl'
import { createSubsidyRequest, getAllSchoolsForParent, getDefaultValueForClient } from '../../utils/api/apiList';

class ModalNewSubsidyRequest extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			fileList: [],
			documentUploaded: [],
			uploading: false,
			SkillSet: [],
			listSchools: [],
		}
	}

	componentDidMount = () => {
		!!this.props.setOpennedEvent && this.props.setOpennedEvent(this.loadData)
	}

	loadData = () => {
		this.setState({
			fileList: [],
			documentUploaded: [],
			uploading: false,
			SkillSet: [],
			listSchools: [],
		})
		this.loadSchools();
		this.loadDataFromServer();
	}

	loadDataFromServer() {
		request.post(getDefaultValueForClient).then(result => {
			if (result.success) {
				const data = result.data;
				this.setState({ SkillSet: data.SkillSet })
			} else {
				this.setState({ SkillSet: [] })
			}
		}).catch(err => {
			console.log('get default data for client error---', err);
			this.setState({ SkillSet: [] })
		})
	}

	loadSchools() {
		request.post(getAllSchoolsForParent).then(result => {
			if (result.success) {
				const data = result.data;
				this.setState({ listSchools: data })
			} else {
				this.setState({ listSchools: [] })
			}
		}).catch(err => {
			console.log('get all schools error---', err);
			this.setState({ listSchools: [] })
		})
	}

	onFinish = (values) => {
		console.log('Success:', values);
	};

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	submitNewRequest = async () => {
		try {
			const values = await this.form.validateFields();
			values.documents = this.state.fileList.map(file => {
				return file.response.data;
			});
			values.requestContactRav = this.state.isRequestRav;
			request.post(createSubsidyRequest, values).then(result => {
				if (result.success) {
					this.form.resetFields();
					this.props.onSubmit();
				} else {
					this.form.setFields([{ name: 'documents', errors: ['error from server'] }]);
				}
			}).catch(err => {
				console.log('create subsidy request error---', err);
				this.form.setFields([{ name: 'documents', errors: ['error from server'] }]);
			})
		} catch (error) {
			console.log('create subsidy request error---', error);
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
			const arrUpload = this.state.documentUploaded || [];
			this.setState({ documentUploaded: arrUpload.push(info.file.response.data) });
		} else if (info.file.status === 'error') {
			message.error(`${info.file.name} file upload failed.`);
			this.setState(prevState => ({
				fileList: [...prevState.fileList, info.file],
			}));
		}
	}

	render = () => {
		const { listDependents } = this.props;
		const { SkillSet, listSchools } = this.state;
		const modalProps = {
			className: 'modal-new-subsidy',
			title: intl.formatMessage(messagesCreateAccount.subsidyRequest),
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: this.props.onCancel,
			closable: false,
			SkillSet: this.state.SkillSet,
			listSchools: this.state.listSchools,
			footer: [
				<Button key="back" onClick={this.props.onCancel}>
					{intl.formatMessage(messages.cancel)}
				</Button>,
				<Button key="submit" type="primary" onClick={this.submitNewRequest} style={{ padding: '7.5px 30px' }}>
					{intl.formatMessage(messages.create)}
				</Button>
			]
		};
		const props = {
			name: 'file',
			action: url + "clients/upload_document",
			headers: {
				authorization: 'authorization-text',
			},
			onChange: this.onChangeUpload,
		};
		return (
			<Modal {...modalProps}>
				<Row justify="center" className="row-form">
					<div className='col-form col-subsidy mt-0'>
						<Form
							name="form_subsidy_request"
							layout='vertical'
							initialValues={{ remember: true }}
							onFinish={this.onFinish}
							onFinishFailed={this.onFinishFailed}
							ref={ref => this.form = ref}
						>
							<Form.Item
								name="student"
								label={intl.formatMessage(messagesRequest.dependent)}
								rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesRequest.dependent) }]}
							>
								<Select placeholder={intl.formatMessage(messagesCreateAccount.dependent)}>
									{listDependents != undefined && listDependents.length >= 0 && this.props.listDependents.map((item, index) => {
										return (
											<Select.Option key={index} value={item._id}>{item.firstName} {item.lastName}</Select.Option>
										)
									})}
									{(listDependents == undefined || listDependents.length == 0) && (<Select.Option key={1} value='-1'>error cmnr</Select.Option>)}
								</Select>
							</Form.Item>
							<Form.Item
								name="skillSet"
								label={intl.formatMessage(messagesCreateAccount.skillsets)}
								rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesRequest.skillsetRequested) }]}
							>
								<Select placeholder={intl.formatMessage(messagesRequest.skillsetRequested)}>
									{SkillSet.map((skill, index) => <Select.Option value={index}>{skill}</Select.Option>)}
								</Select>
							</Form.Item>
							<Form.Item
								name="school"
								label={intl.formatMessage(messagesRequest.school)}
								rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesRequest.school) }]}
							>
								<Select placeholder={intl.formatMessage(messagesCreateAccount.school)}>
									{listSchools.map((school, index) => <Select.Option value={school._id}>{school.name}</Select.Option>)}
								</Select>
							</Form.Item>
							<Row gutter={14}>
								<Col xs={24} sm={24} md={12}>
									<div className='flex flex-row items-center pb-10'>
										<Switch size="small" defaultChecked />
										<p className='font-10 ml-10 mb-0'>{intl.formatMessage(messagesRequest.requestRav)}</p>
									</div>
								</Col>
								<Col xs={24} sm={24} md={12}>
									<Form.Item
										name="ravPhone"
										label={intl.formatMessage(messagesRequest.ravPhone)}
										rules={[
											{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesRequest.ravPhone) },
											{ pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$', message: intl.formatMessage(messagesRequest.phoneNumberValid) },
										]}
									>
										<Input placeholder={intl.formatMessage(messagesRequest.ravPhone) + ' #'} />
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={14}>
								<Col xs={24} sm={24} md={12}>
									<Form.Item
										name="ravName"
										label={intl.formatMessage(messagesRequest.nameOfRav)}
										rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesRequest.nameOfRav) }]}
									>
										<Input placeholder={intl.formatMessage(messagesRequest.nameOfRav)} />
									</Form.Item>
								</Col>
								<Col xs={24} sm={24} md={12}>
									<Form.Item
										name="ravEmail"
										label={intl.formatMessage(messagesRequest.ravEmail)}
										rules={[
											{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesRequest.ravEmail) },
											{ type: 'email', message: intl.formatMessage(messagesRequest.emailNotValid) }
										]}
									>
										<Input placeholder={intl.formatMessage(messagesRequest.ravEmail)} />
									</Form.Item>
								</Col>
							</Row>
							<Form.Item
								name="requestContactRav"
								label={intl.formatMessage(messagesRequest.requestContactRav)}
							>
								<Input placeholder={intl.formatMessage(messagesRequest.requestContactRav)} />
							</Form.Item>
							<Divider style={{ marginTop: 0, marginBottom: 15, borderColor: '#d7d7d7' }} />
							<Form.Item
								name="note"
								label={intl.formatMessage(messagesRequest.generalNotes)}
								rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesRequest.generalNotes) }]}
							>
								<Input.TextArea rows={5} placeholder={intl.formatMessage(messagesRequest.generalNotes)} />
							</Form.Item>
							<Form.Item
								name="documents"
								label={intl.formatMessage(messagesRequest.upload)}
								className='input-download'
								rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesRequest.upload) }]}
							>
								<div className='input-download flex flex-row justify-between'>
									<div className='div-document'>
										<p>Document</p>
									</div>
									<div className='div-upload flex-1'>
										<Upload {...props}>
											<a className='font-12 underline'>{intl.formatMessage(messagesRequest.upload)}</a>
										</Upload>
									</div>
								</div>
							</Form.Item>
						</Form>
					</div>
				</Row>
			</Modal>
		);
	}
};

export default ModalNewSubsidyRequest;