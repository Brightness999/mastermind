import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select, Switch, message, Upload } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';
import messagesRequest from '../../../SubsidyRequest/messages';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import { url } from '../../../../../utils/api/baseUrl';
import axios from 'axios';

class InfoFinancial extends Component {
	constructor(props) {
		super(props);
		this.state = {
			fileList: [],
			uploading: false,
			documentUploaded: [],
			AcademicLevel: [],
			sameRateForAllLevel: true,
			isSeparateEvaluationRate: true,
			isReceiptsProvided: true,
		}
	}

	componentDidMount() {
		const { registerData } = this.props.register;
		if (!registerData.financialInfor) {
			this.props.setRegisterData({ financialInfor: this.getDefaultObj() });
		}
		var financialInfor = registerData.financialInfor || this.getDefaultObj();
		this.form.setFieldsValue(financialInfor);
		this.setState({
			isSeparateEvaluationRate: financialInfor.isSeparateEvaluationRate,
			isReceiptsProvided: financialInfor.isReceiptsProvided,
		})
		this.getDataFromServer()
	}

	getDataFromServer = () => {
		axios.post(url + 'providers/get_default_values_for_provider'
		).then(result => {
			if (result.data.success) {
				const data = result.data.data;
				this.setState({ AcademicLevel: data.AcademicLevel });
			} else {
				this.setState({ AcademicLevel: [] });
			}
		}).catch(err => {
			console.log(err);
			this.setState({ AcademicLevel: [] });
		})
	}

	getDefaultObj = () => {
		return {
			academicLevel: [{
				level: undefined,
				rate: "",
			}],
			separateEvaluationRate: "",
			serviceableSchool: undefined,
			upload_w_9: "",
			isSeparateEvaluationRate: true,
			isReceiptsProvided: true,
		}
	}

	onFinish = () => {
		this.props.setRegisterData({ documentUploaded: this.state.documentUploaded });
		this.props.onContinue();
	};

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	onUploadChange = async (info) => {
		if (info.file.status !== 'uploading') {
			this.setState(prevState => ({ fileList: [...prevState.fileList, info.file] }));
		}
		if (info.file.status === 'done') {
			message.success(`${info.file.name} file uploaded successfully`);
			this.form?.setFieldsValue({
				upload_w_9: info.file.name
			})
			this.props.setRegisterData({
				upload_w_9: info.file.name,
				uploaded_path: info.file.response.data
			})
			this.setState(prevState => ({ documentUploaded: [...prevState.documentUploaded, info.file.response.data] }));
		} else if (info.file.status === 'error') {
			message.error(`${info.file.name} file upload failed.`);
			this.setState(prevState => ({ fileList: [...prevState.fileList, info.file] }));
		}
	}

	setValueToReduxRegisterData = (fieldName, value) => {
		const { registerData } = this.props.register;
		var financialInfor = JSON.parse(JSON.stringify(registerData.financialInfor));
		financialInfor[fieldName] = value;
		this.props.setRegisterData({ financialInfor: financialInfor });
	}

	handleSelectChange = (fieldName, value) => {
		this.setValueToReduxRegisterData(fieldName, value);
	}

	render() {
		const { AcademicLevel, sameRateForAllLevel, isSeparateEvaluationRate, isReceiptsProvided } = this.state;
		const uploadProps = {
			name: 'file',
			action: url + 'providers/upload_temp_w9_form',
			headers: { authorization: 'authorization-text' },
			onChange: this.onUploadChange,
			maxCount: 1,
			showUploadList: false,
		};
		const durations = ['15min', '30min', '1h', '2h', '3h', '4h'];

		return (
			<Row justify="center" className="row-form">
				<div className='col-form col-info-parent'>
					<div className='div-form-title'>
						<p className='font-30 text-center mb-10'>{intl.formatMessage(messages.financialInfo)}</p>
					</div>
					<Form
						name="form_services_offered"
						onFinish={this.onFinish}
						onFinishFailed={this.onFinishFailed}
						ref={ref => this.form = ref}
					>
						<Form.List name="academicLevel">
							{(fields, { add, remove }) => (
								<div>
									{fields.map((field) => {
										return (
											<Row gutter={14} key={field.key}>
												<Col xs={16} sm={16} md={16}>
													<Form.Item
														name={[field.name, "level"]}
														rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.academicLevel) }]}
														className='bottom-0'
														style={{ marginTop: field.key === 0 ? 0 : 14 }}
													>
														<Select
															onChange={(event => {
																var arr = this.form.getFieldValue('academicLevel')
																this.setValueToReduxRegisterData('academicLevel', arr);
															})}
															placeholder={intl.formatMessage(messages.academicLevel)}
														>
															{AcademicLevel?.map((level, index) => (
																<Select.Option key={index} value={level}>{level}</Select.Option>
															))}
														</Select>
													</Form.Item>
												</Col>
												<Col xs={8} sm={8} md={8} className={field.key !== 0 && 'item-remove'}>
													<Form.Item
														name={[field.name, "rate"]}
														rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.rate) }]}
														className='bottom-0'
														style={{ marginTop: field.key === 0 ? 0 : 14 }}
													>
														<Input
															placeholder={intl.formatMessage(messages.rate)}
															onChange={(event => {
																var value = event.target.value;
																var arr = JSON.parse(JSON.stringify(this.form.getFieldValue('academicLevel')));
																for (var i = 0; i < arr.length; i++) {
																	if (arr[i] == undefined) arr[i] = {};
																	arr[i].rate = value;
																}
																this.form.setFieldValue('academicLevel', arr);
																this.setValueToReduxRegisterData('academicLevel', arr);
															})}
														/>
													</Form.Item>
													{field.key !== 0 && <BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />}
												</Col>
											</Row>
										);
									})}
									<div className='text-center flex flex-row justify-between my-10'>
										<Button
											type="text"
											className='add-level-btn'
											icon={<BsPlusCircle size={17} className='mr-5' />}
											onClick={() => add(null)}
										>
											{intl.formatMessage(messages.addLevel)}
										</Button>
										<div className='flex flex-row w-50'>
											<Switch size="small"
												checked={sameRateForAllLevel}
												onChange={v => {
													this.setState({ sameRateForAllLevel: v })
													this.handleSelectChange('sameRateForAllLevel', v)
												}}
											/>
											<p className='ml-10 mb-0'>{intl.formatMessage(messages.sameRateLevels)}</p>
										</div>
									</div>
								</div>
							)}
						</Form.List>
						<div className='text-center flex flex-row justify-between mb-10'>
							<div className='flex flex-row items-center'>
								<Switch size="small"
									checked={isSeparateEvaluationRate}
									onChange={v => {
										this.setState({ isSeparateEvaluationRate: v })
										this.handleSelectChange('isSeparateEvaluationRate', v)
									}}
								/>
								<p className='ml-10 mb-0'>{intl.formatMessage(messages.separateEvaluation)}</p>
							</div>
							<Form.Item
								name="separateEvaluationDuration"
								className='mb-0'
								rules={[{ required: isSeparateEvaluationRate, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.duration) }]}
							>
								<Select
									onChange={(v) => this.setValueToReduxRegisterData('separateEvaluationDuration', v)}
									placeholder={intl.formatMessage(messages.duration)}
								>
									{durations?.map((duration, index) => (
										<Select.Option key={index} value={duration}>{duration}</Select.Option>
									))}
								</Select>
							</Form.Item>
							<Form.Item
								name="separateEvaluationRate"
								className='mb-0'
								rules={[{ required: isSeparateEvaluationRate, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.rate) }]}
							>
								<Input
									onChange={(e) => this.setValueToReduxRegisterData('separateEvaluationRate', e.target.value)}
									placeholder={intl.formatMessage(messages.rate)}
									className='bottom-left-0 mb-0'
								/>
							</Form.Item>
						</div>
						<div className='flex flex-row items-center mb-10'>
							<Switch size="small"
								checked={isReceiptsProvided}
								onChange={v => {
									this.setState({ isReceiptsProvided: v })
									this.handleSelectChange('isReceiptsProvided', v)
								}}
							/>
							<p className='ml-10 mb-0'>{intl.formatMessage(messages.receiptsRequest)}</p>
						</div>
						<Form.Item
							name="upload_w_9"
							className='input-download'
							rules={[{ required: true, message: intl.formatMessage(messages.uploadMess) }]}
						>
							<Input
								addonBefore='W-9 Form'
								suffix={
									<Upload {...uploadProps}>
										<a className='font-12 underline'>{intl.formatMessage(messagesRequest.upload)}</a>
									</Upload>
								}
								readOnly
							/>
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

export default compose(connect(mapStateToProps, { setRegisterData }))(InfoFinancial);