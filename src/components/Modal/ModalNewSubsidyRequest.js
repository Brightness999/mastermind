import React from 'react';
import { Row, Form, Button, Input, Select, Switch, Upload, message, Modal, Divider } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux'
import { compose } from 'redux'

import messages from './messages';
import msgCreateAccount from 'routes/Sign/CreateAccount/messages';
import msgLogin from 'routes/Sign/Login/messages';
import request from 'utils/api/request'
import { url } from 'utils/api/baseUrl'
import { createSubsidyRequest, getAllSchoolsForParent } from 'utils/api/apiList';
import './style/index.less';

class ModalNewSubsidyRequest extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			documentUploaded: [],
			skillSet: [],
			listSchools: [],
			dependents: [],
			isRequestRav: false,
			loadingCreate: false,
		}
	}

	componentDidMount = () => {
		const { dependent, auth } = this.props;
		if (dependent) {
			this.setState({
				documentUploaded: [],
				skillSet: dependent?.services,
				listSchools: dependent?.school?._id ? [dependent?.school] : [],
				dependents: [dependent],
				isRequestRav: !dependent?.school?._id,
			})
			this.form.setFieldsValue({ student: dependent?._id, school: dependent?.school?._id });
		} else {
			this.setState({
				documentUploaded: [],
				skillSet: auth.skillSet,
				listSchools: [],
				dependents: auth.dependents,
			})
			this.loadSchools();
		}
	}

	loadSchools() {
		request.post(getAllSchoolsForParent, { communityServed: this.props.auth.user?.role === 3 ? this.props.auth.user?.parentInfo?.cityConnection : this.props.auth.currentCommunity?.community?._id }).then(result => {
			const { success, data } = result;
			if (success) {
				this.setState({ listSchools: data })
			} else {
				this.setState({ listSchools: [] })
			}
		}).catch(err => {
			this.setState({ listSchools: [] })
		})
	}

	handleChangeDependent = (dependentId) => {
		const { dependents } = this.state;
		this.setState({
			skillSet: dependents?.find(d => d._id == dependentId)?.services,
			listSchools: dependents?.find(d => d._id == dependentId)?.school ? [dependents?.find(d => d._id == dependentId)?.school] : undefined,
			isRequestRav: !dependents?.find(d => d._id == dependentId)?.school?._id,
		})
		this.form.setFieldsValue({ school: dependents?.find(d => d._id == dependentId)?.school?._id, skillSet: undefined });
	}

	handleChangeService = (service) => {
		const { subsidyRequests } = this.props;
		const student = this.form?.getFieldValue('student');
		const subsidies = subsidyRequests?.filter(s => [0, 1, 3, 5].includes(s.status) && s.student?._id === student && s.skillSet?._id === service);

		if (subsidies?.find(s => [0, 1, 3].includes(s.status))) {
			message.warning("Your subsidy request is still being processed");
			return;
		} else if (subsidies?.reduce((a, b) => a + (b?.appointments?.length || 0), 0) < subsidies?.reduce((a, b) => a + (b?.numberOfSessions || 0), 0)) {
			message.warning("Your subsidy request is still being processed");
			return;
		} else {
			message.destroy();
		}
	}

	onFinish = (values) => {
		const { subsidyRequests } = this.props;
		const { isRequestRav, documentUploaded } = this.state;
		values.documents = documentUploaded?.map(d => ({ name: d.name, url: d.response.data }));
		values.requestContactRav = isRequestRav;
		const subsidies = subsidyRequests?.filter(s => [0, 1, 3, 5].includes(s.status) && s.student?._id === values?.student && s.skillSet?._id === values.skillSet);

		if (subsidies?.find(s => [0, 1, 3].includes(s.status))) {
			message.warning("Your subsidy request is still being processed");
			return;
		} else if (subsidies?.reduce((a, b) => a + (b?.appointments?.length || 0), 0) < subsidies?.reduce((a, b) => a + (b?.numberOfSessions || 0), 0)) {
			message.warning("Your subsidy request is still being processed");
			return;
		} else {
			message.destroy();
		}

		this.setState({ loadingCreate: true });
		request.post(createSubsidyRequest, values).then(result => {
			this.setState({ loadingCreate: false });
			if (result.success) {
				message.success('Requested successfully.');
				this.form.resetFields();
				this.props.onSubmit();
			} else {
				this.form.setFields([{ name: 'documents', errors: ['error from server'] }]);
			}
		}).catch(err => {
			this.setState({ loadingCreate: false });
			this.form.setFields([{ name: 'documents', errors: ['error from server'] }]);
		})
	};

	onChangeUpload = (info) => {
		if (['removed', 'done'].includes(info.file.status)) {
			this.setState({ documentUploaded: info.fileList })
		}
	}

	render = () => {
		const { loadingCreate, skillSet, listSchools, dependents, isRequestRav } = this.state;
		const modalProps = {
			className: 'modal-new-subsidy',
			title: (<span className='font-20'>{intl.formatMessage(msgCreateAccount.subsidyRequest)}</span>),
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: (e) => e.target.className !== 'ant-modal-wrap' && this.props.onCancel(),
			footer: null,
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
							ref={ref => this.form = ref}
						>
							<Form.Item
								name="student"
								label={intl.formatMessage(msgCreateAccount.dependent)}
								className="float-label-item"
								rules={[{ required: true }]}
							>
								<Select placeholder={intl.formatMessage(msgCreateAccount.dependent)} onChange={v => this.handleChangeDependent(v)}>
									{dependents?.map((item, index) => <Select.Option key={index} value={item._id}>{item.firstName} {item.lastName}</Select.Option>)}
								</Select>
							</Form.Item>
							<Form.Item
								name="skillSet"
								label={intl.formatMessage(msgCreateAccount.services)}
								className="float-label-item"
								rules={[{ required: true }]}
							>
								<Select placeholder={intl.formatMessage(msgCreateAccount.services)} onChange={v => this.handleChangeService(v)}>
									{skillSet?.map((skill, index) => <Select.Option key={index} value={skill._id}>{skill.name}</Select.Option>)}
								</Select>
							</Form.Item>
							{!isRequestRav && (
								<Form.Item
									name="school"
									label={intl.formatMessage(msgCreateAccount.school)}
									className="float-label-item"
									rules={[{ required: true }]}
								>
									<Select placeholder={intl.formatMessage(msgCreateAccount.school)}>
										{listSchools?.map((school, index) => <Select.Option key={index} value={school?._id}>{school?.name}</Select.Option>)}
									</Select>
								</Form.Item>
							)}
							<div className='flex flex-row items-center pb-10'>
								<Switch size="small" checked={isRequestRav} disabled={!listSchools?.length} onChange={() => this.setState({ isRequestRav: !isRequestRav })} />
								<p className='font-12 ml-10 mb-0'>{intl.formatMessage(messages.requestRav)}</p>
							</div>
							{isRequestRav ? (
								<>
									<Divider />
									<Form.Item
										name="ravName"
										label={intl.formatMessage(messages.nameOfRav)}
										className="float-label-item"
										rules={[{ required: isRequestRav, message: intl.formatMessage(msgLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.nameOfRav) }]}
									>
										<Input placeholder={intl.formatMessage(messages.nameOfRav)} />
									</Form.Item>
									<Form.Item
										name="ravEmail"
										label={intl.formatMessage(messages.ravEmail)}
										className="float-label-item"
										rules={[
											{ required: isRequestRav, message: intl.formatMessage(msgLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.ravEmail) },
											{ type: 'email', message: intl.formatMessage(messages.emailNotValid) }
										]}
									>
										<Input placeholder={intl.formatMessage(messages.ravEmail)} />
									</Form.Item>
									<Form.Item
										name="ravPhone"
										label={intl.formatMessage(messages.ravPhone)}
										className="float-label-item"
										rules={[
											{ required: isRequestRav, message: intl.formatMessage(msgLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.ravPhone) },
											{ pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$', message: intl.formatMessage(messages.phoneNumberValid) },
										]}
									>
										<Input placeholder={intl.formatMessage(messages.ravPhone) + ' #'} />
									</Form.Item>
								</>
							) : null}
							<Divider />
							<Form.Item
								name="therapistContact"
								label={intl.formatMessage(messages.nameOfTherapist) + "(optional)"}
								className="float-label-item"
							>
								<Input placeholder={intl.formatMessage(messages.nameOfTherapist)} />
							</Form.Item>
							<Form.Item
								name="therapistEmail"
								label={intl.formatMessage(messages.therapistEmail) + "(optional)"}
								className="float-label-item"
								rules={[
									{ type: 'email', message: intl.formatMessage(messages.emailNotValid) }
								]}
							>
								<Input placeholder={intl.formatMessage(messages.therapistEmail)} />
							</Form.Item>
							<Form.Item
								name="therapistPhone"
								label={intl.formatMessage(messages.therapistPhone) + "(optional)"}
								className="float-label-item"
								rules={[
									{ pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$', message: intl.formatMessage(messages.phoneNumberValid) },
								]}
							>
								<Input placeholder={intl.formatMessage(messages.therapistPhone) + ' #'} />
							</Form.Item>
							<Form.Item
								name="note"
								label={intl.formatMessage(messages.generalNotes)}
								className="float-label-item"
								rules={[{ required: true, message: intl.formatMessage(msgLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.generalNotes) }]}
							>
								<Input.TextArea rows={5} placeholder={intl.formatMessage(messages.generalNotes)} />
							</Form.Item>
							<Form.Item
								name="documents"
								className='upload-document'
							>
								<div className='input-download flex flex-row justify-between'>
									<div className='div-document'>
										<p>Document</p>
									</div>
									<div className='div-upload flex-1'>
										<Upload {...props}>
											<a className='font-12 underline'>{intl.formatMessage(messages.upload)}</a>
										</Upload>
									</div>
								</div>
							</Form.Item>
							<Row className='justify-end gap-2'>
								<Button key="back" onClick={this.props.onCancel}>
									{intl.formatMessage(messages.cancel)}
								</Button>
								<Button key="submit" type="primary" htmlType="submit" loading={loadingCreate} style={{ padding: '7.5px 30px' }}>
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
	subsidyRequests: state.appointments.dataSubsidyRequests,
})

export default compose(connect(mapStateToProps))(ModalNewSubsidyRequest);