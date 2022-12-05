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
import { createSubsidyRequest, getAllSchoolsForParent } from '../../utils/api/apiList';
import { connect } from 'react-redux'
import { compose } from 'redux'

class ModalNewSubsidyRequest extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			documentUploaded: [],
			uploading: false,
			SkillSet: [],
			listSchools: [],
			dependents: [],
			isRequestRav: false,
		}
	}

	componentDidMount = () => {
		!!this.props.setOpennedEvent && this.props.setOpennedEvent(this.loadData)
	}

	loadData = () => {
		this.setState({
			documentUploaded: [],
			uploading: false,
			SkillSet: this.props.auth.skillSet,
			listSchools: [],
			dependents: this.props.auth.dependents,
		})
		this.loadSchools();
	}

	loadSchools() {
		request.post(getAllSchoolsForParent, { communityServed: this.props.auth.user?.parentInfo.cityConnection }).then(result => {
			const { success, data } = result;
			if (success) {
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
		const { isRequestRav, documentUploaded } = this.state;
		values.documents = documentUploaded;
		values.requestContactRav = isRequestRav;
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
	};

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	onChangeUpload = (info) => {
		if (info.file.status === 'done') {
			message.success(`${info.file.name} file uploaded successfully`);
			const arrUpload = this.state.documentUploaded || [];
			arrUpload.push(info.file.response.data)
			this.setState({ documentUploaded: arrUpload });
		}
	}

	render = () => {
		const { SkillSet, listSchools, dependents, isRequestRav } = this.state;
		const modalProps = {
			className: 'modal-new-subsidy',
			title: intl.formatMessage(messagesCreateAccount.subsidyRequest),
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: (e) => e.target.className !== 'ant-modal-wrap' && this.props.onCancel(),
			footer: []
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
					<div className='col-form col-subsidy p-0 mt-10'>
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
								className="float-label-item"
								rules={[{ required: true }]}
							>
								<Select placeholder={intl.formatMessage(messagesCreateAccount.dependent)}>
									{dependents?.map((item, index) => <Select.Option key={index} value={item._id}>{item.firstName} {item.lastName}</Select.Option>)}
								</Select>
							</Form.Item>
							<Form.Item
								name="skillSet"
								label={intl.formatMessage(messagesCreateAccount.skillsets)}
								className="float-label-item"
								rules={[{ required: !isRequestRav }]}
							>
								<Select placeholder={intl.formatMessage(messagesRequest.skillsetRequested)}>
									{SkillSet?.map((skill, index) => <Select.Option key={index} value={skill._id}>{skill.name}</Select.Option>)}
								</Select>
							</Form.Item>
							{!isRequestRav && (
								<Form.Item
									name="school"
									label={intl.formatMessage(messagesRequest.school)}
									className="float-label-item"
									rules={[{ required: true }]}
								>
									<Select placeholder={intl.formatMessage(messagesCreateAccount.school)}>
										{listSchools?.map((school, index) => <Select.Option key={index} value={school._id}>{school.name}</Select.Option>)}
									</Select>
								</Form.Item>
							)}
							<Row gutter={14}>
								<Col xs={24} sm={24} md={12}>
									<div className='flex flex-row items-center pb-10'>
										<Switch size="small" onChange={() => this.setState({ isRequestRav: !isRequestRav })} />
										<p className='font-12 ml-10 mb-0'>{intl.formatMessage(messagesRequest.requestRav)}</p>
									</div>
								</Col>
								{isRequestRav && (
									<Col xs={24} sm={24} md={12}>
										<Form.Item
											name="ravPhone"
											label={intl.formatMessage(messagesRequest.ravPhone)}
											className="float-label-item"
											rules={[
												{ required: isRequestRav, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesRequest.ravPhone) },
												{ pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$', message: intl.formatMessage(messagesRequest.phoneNumberValid) },
											]}
										>
											<Input placeholder={intl.formatMessage(messagesRequest.ravPhone) + ' #'} />
										</Form.Item>
									</Col>
								)}
							</Row>
							{isRequestRav && (
								<Row gutter={14}>
									<Col xs={24} sm={24} md={12}>
										<Form.Item
											name="ravName"
											label={intl.formatMessage(messagesRequest.nameOfRav)}
											className="float-label-item"
											rules={[{ required: isRequestRav, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesRequest.nameOfRav) }]}
										>
											<Input placeholder={intl.formatMessage(messagesRequest.nameOfRav)} />
										</Form.Item>
									</Col>
									<Col xs={24} sm={24} md={12}>
										<Form.Item
											name="ravEmail"
											label={intl.formatMessage(messagesRequest.ravEmail)}
											className="float-label-item"
											rules={[
												{ required: isRequestRav, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesRequest.ravEmail) },
												{ type: 'email', message: intl.formatMessage(messagesRequest.emailNotValid) }
											]}
										>
											<Input placeholder={intl.formatMessage(messagesRequest.ravEmail)} />
										</Form.Item>
									</Col>
								</Row>
							)}
							<Form.Item
								name="requestContactRav"
								label={intl.formatMessage(messagesRequest.requestContactRav)}
								className="float-label-item"
							>
								<Input placeholder={intl.formatMessage(messagesRequest.requestContactRav)} />
							</Form.Item>
							<Divider style={{ marginTop: 0, marginBottom: 15, borderColor: '#d7d7d7' }} />
							<Form.Item
								name="note"
								label={intl.formatMessage(messagesRequest.generalNotes)}
								className="float-label-item"
								rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messagesRequest.generalNotes) }]}
							>
								<Input.TextArea rows={5} placeholder={intl.formatMessage(messagesRequest.generalNotes)} />
							</Form.Item>
							<Form.Item
								name="documents"
								className='input-download'
								rules={[{ required: true }]}
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
							<Row className='justify-end gap-2'>
								<Button key="back" onClick={this.props.onCancel}>
									{intl.formatMessage(messages.cancel)}
								</Button>
								<Button key="submit" type="primary" htmlType="submit" style={{ padding: '7.5px 30px' }}>
									{intl.formatMessage(messages.create)}
								</Button>
							</Row>
						</Form>
					</div>
				</Row>
			</Modal>
		);
	}
};

const mapStateToProps = state => ({
	auth: state.auth,
})

export default compose(connect(mapStateToProps))(ModalNewSubsidyRequest);