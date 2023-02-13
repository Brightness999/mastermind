import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select, Switch, message, Upload } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../../Sign/Login/messages';
import messagesRequest from '../../../../Sign/SubsidyRequest/messages';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import { url } from '../../../../../utils/api/baseUrl';
import { uploadTempW9FormForProvider } from '../../../../../utils/api/apiList';
import PlacesAutocomplete from 'react-places-autocomplete';

class InfoFinancial extends Component {
	constructor(props) {
		super(props);
		this.state = {
			fileList: [],
			uploading: false,
			documentUploaded: [],
			academicLevels: [],
			sameRateForAllLevel: true,
			billingAddress: '',
		}
	}

	componentDidMount() {
		const { registerData } = this.props.register;
		const { academicLevels } = this.props.auth;
		if (!registerData.financialInfor) {
			this.props.setRegisterData({ financialInfor: this.getDefaultObj() });
		}
		const financialInfor = registerData.financialInfor || this.getDefaultObj();
		this.form.setFieldsValue(financialInfor);
		this.setState({
			academicLevels: [
				{ label: 'By Level', options: registerData?.financialInfor?.academicLevel ? academicLevels.slice(0, 6)?.filter(level => !registerData?.financialInfor?.academicLevel?.find(item => item.level == level))?.map(a => ({ label: a, value: a })) : academicLevels.slice(0, 6)?.map(a => ({ label: a, value: a })) ?? [] },
				{ label: 'By Grade', options: registerData?.financialInfor?.academicLevel ? academicLevels.slice(6)?.filter(level => !registerData?.financialInfor?.academicLevel?.find(item => item.level == level))?.map(a => ({ label: a, value: a })) : academicLevels.slice(0, 6)?.map(a => ({ label: a, value: a })) ?? [] },
			]
		});
	}

	getDefaultObj = () => {
		return {
			legalName: '',
			billingAddress: '',
			academicLevel: [{
				level: undefined,
				rate: "",
			}],
			separateEvaluationRate: "",
			upload_w_9: "",
			licenseNumber: '',
			SSN: '',
			cancellationFee: '',
		}
	}

	onFinish = (values) => {
		this.props.setRegisterData({ documentUploaded: this.state.documentUploaded });
		this.props.setRegisterData({ financialInfor: values });
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
				uploaded_path: info.file.response.data.toString(),
			})
			this.setState(prevState => ({ documentUploaded: [...prevState.documentUploaded, info.file.response.data] }));
		} else if (info.file.status === 'error') {
			message.error(`${info.file.name} file upload failed.`);
			this.setState(prevState => ({ fileList: [...prevState.fileList, info.file] }));
		}
	}

	setValueToReduxRegisterData = (fieldName, value) => {
		const { registerData } = this.props.register;
		let financialInfor = JSON.parse(JSON.stringify(registerData.financialInfor));
		financialInfor[fieldName] = value;
		this.props.setRegisterData({ financialInfor: financialInfor });
	}

	handleSelectChange = (fieldName, value) => {
		this.setValueToReduxRegisterData(fieldName, value);
	}

	handleSelectLevel = (selectedLevel) => {
		const arr = this.form.getFieldValue('academicLevel');
		const { academicLevels } = this.props.auth;
		let selectedLevels = arr?.map(item => item.level);

		if (selectedLevel == 'Early Education') {
			selectedLevels = selectedLevels?.filter(a => !['Pre-Nursery', 'Nursery', 'Kindergarten', 'Pre-1A'].includes(a));
		} else if (['Pre-Nursery', 'Nursery', 'Kindergarten', 'Pre-1A'].includes(selectedLevel)) {
			selectedLevels = selectedLevels?.filter(a => a != 'Early Education');
		} else if (selectedLevel == 'Elementary Grades 1-6') {
			selectedLevels = selectedLevels?.filter(a => !['Elementary Grades 1-8', 'Grades 1', 'Grades 2', 'Grades 3', 'Grades 4', 'Grades 5', 'Grades 6'].includes(a));
		} else if (['Grades 1', 'Grades 2', 'Grades 3', 'Grades 4', 'Grades 5', 'Grades 6'].includes(selectedLevel)) {
			selectedLevels = selectedLevels?.filter(a => a != 'Elementary Grades 1-6' && a != 'Elementary Grades 1-8');
		} else if (selectedLevel == 'Elementary Grades 1-8') {
			selectedLevels = selectedLevels?.filter(a => !['Elementary Grades 1-6', 'Middle Grades 7-8', 'Grades 1', 'Grades 2', 'Grades 3', 'Grades 4', 'Grades 5', 'Grades 6', 'Grades 7', 'Grades 8'].includes(a));
		} else if (['Grades 1', 'Grades 2', 'Grades 3', 'Grades 4', 'Grades 5', 'Grades 6', 'Grades 7', 'Grades 8'].includes(selectedLevel)) {
			selectedLevels = selectedLevels?.filter(a => a != 'Elementary Grades 1-8');
		} else if (selectedLevel == 'Middle Grades 7-8') {
			selectedLevels = selectedLevels?.filter(a => !['Elementary Grades 1-8', 'Grades 7', 'Grades 8'].includes(a));
		} else if (['Grades 7', 'Grades 8'].includes(selectedLevel)) {
			selectedLevels = selectedLevels?.filter(a => a != 'Middle Grades 7-8' && a != 'Elementary Grades 1-8');
		} else if (selectedLevel == 'High School Grades 9-12') {
			selectedLevels = selectedLevels?.filter(a => !['Grades 9', 'Grades 10', 'Grades 11', 'Grades 12'].includes(a));
		} else if (['Grades 9', 'Grades 10', 'Grades 11', 'Grades 12'].includes(selectedLevel)) {
			selectedLevels = selectedLevels?.filter(a => a != 'High School Grades 9-12');
		}

		const levelOptions = [
			{ label: 'By Level', options: academicLevels.slice(0, 6)?.filter(level => !selectedLevels?.find(l => l == level))?.map(a => ({ label: a, value: a })) ?? [] },
			{ label: 'By Grade', options: academicLevels.slice(6)?.filter(level => !selectedLevels?.find(l => l == level))?.map(a => ({ label: a, value: a })) ?? [] },
		];
		this.form.setFieldValue('academicLevel', arr.filter(a => selectedLevels?.includes(a.level)));
		this.setState({ academicLevels: levelOptions });
	}

	render() {
		const { academicLevels, sameRateForAllLevel, billingAddress } = this.state;
		const { registerData } = this.props.register;
		const uploadProps = {
			name: 'file',
			action: url + uploadTempW9FormForProvider,
			headers: { authorization: 'authorization-text' },
			onChange: this.onUploadChange,
			maxCount: 1,
			showUploadList: false,
		};

		return (
			<Row justify="center" className="row-form">
				<div className='col-form col-info-billing'>
					<div className='div-form-title'>
						<p className='font-30 text-center mb-10'>{intl.formatMessage(messages.billingDetails)}</p>
					</div>
					<Form
						name="form_billing_details"
						layout='vertical'
						onFinish={this.onFinish}
						onFinishFailed={this.onFinishFailed}
						ref={ref => this.form = ref}
					>
						<Form.Item
							name="legalName"
							label={intl.formatMessage(messages.legalName)}
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.legalName) }]}
						>
							<Input onChange={e => this.setValueToReduxRegisterData("legalName", e.target.value)} placeholder={intl.formatMessage(messages.legalName)} />
						</Form.Item>
						<Form.Item
							name="billingAddress"
							label={intl.formatMessage(messages.billingAddress)}
							rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.billingAddress) }]}
						>
							<PlacesAutocomplete
								value={billingAddress}
								onChange={value => this.setValueToReduxRegisterData("billingAddress", value)}
								onSelect={value => {
									this.setValueToReduxRegisterData("billingAddress", value);
									this.form.setFieldsValue({ "billingAddress": value });
								}}
							>
								{({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
									<div key='billingaddress'>
										<Input {...getInputProps({
											placeholder: 'Billing Address',
											className: 'location-search-input',
										})} />
										<div className="autocomplete-dropdown-container">
											{loading && <div>Loading...</div>}
											{suggestions.map(suggestion => {
												const className = suggestion.active
													? 'suggestion-item--active'
													: 'suggestion-item';
												// inline style for demonstration purpose
												const style = suggestion.active
													? { backgroundColor: '#fafafa', cursor: 'pointer' }
													: { backgroundColor: '#ffffff', cursor: 'pointer' };
												return (
													<div {...getSuggestionItemProps(suggestion, { className, style })} key={suggestion.index}>
														<span>{suggestion.description}</span>
													</div>
												);
											})}
										</div>
									</div>
								)}
							</PlacesAutocomplete>
						</Form.Item>
						<Row gutter={14}>
							<Col xs={24} sm={24} md={12}>
								<Form.Item name="licenseNumber" label={intl.formatMessage(messages.licenseNumber)}>
									<Input onChange={e => this.setValueToReduxRegisterData("licenseNumber", e.target.value)} placeholder={intl.formatMessage(messages.licenseNumber)} />
								</Form.Item>
							</Col>
							<Col xs={24} sm={24} md={12}>
								<Form.Item name="SSN" label="SSN">
									<Input onChange={e => this.setValueToReduxRegisterData("SSN", e.target.value)} placeholder='SSN' />
								</Form.Item>
							</Col>
						</Row>
						<Form.List name="academicLevel">
							{(fields, { add, remove }) => (
								<div>
									{fields.map((field) => {
										return (
											<Row gutter={14} key={field.key}>
												<Col xs={16} sm={16} md={16}>
													<Form.Item
														name={[field.name, "level"]}
														label={intl.formatMessage(messages.level)}
														rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.academicLevel) }]}
														className='bottom-0'
														style={{ marginTop: 14 }}
													>
														<Select
															onChange={(selectedLevel) => this.handleSelectLevel(selectedLevel)}
															options={academicLevels}
															placeholder={intl.formatMessage(messages.academicLevel)}
														>
														</Select>
													</Form.Item>
												</Col>
												<Col xs={8} sm={8} md={8} className='item-remove'>
													<Form.Item
														name={[field.name, "rate"]}
														label={'Standard ' + intl.formatMessage(messages.rate)}
														rules={[{
															required: true,
															message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.rate),
															validator: (_, value) => {
																if (_.required && (value < 0 || value == '' || value == undefined)) return Promise.reject('Must be value greater than 0');
																return Promise.resolve();
															},
														}]}
														className='bottom-0'
														style={{ marginTop: 14 }}
													>
														<Input
															placeholder={intl.formatMessage(messages.rate)}
															type="number"
															min={0}
															onChange={(event => {
																const value = event.target.value;
																let arr = JSON.parse(JSON.stringify(this.form.getFieldValue('academicLevel')));
																if (sameRateForAllLevel) {
																	for (let i = 0; i < arr.length; i++) {
																		if (arr[i] == undefined) arr[i] = {};
																		arr[i].rate = value;
																	}
																} else {
																	arr[field.key].rate = value;
																}
																this.form.setFieldValue('academicLevel', arr);
																this.setValueToReduxRegisterData('academicLevel', arr);
															})}
														/>
													</Form.Item>
													<BsDashCircle size={16} className='text-red icon-remove' onClick={() => remove(field.name)} />
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
													this.setValueToReduxRegisterData('sameRateForAllLevel', v)
												}}
											/>
											<p className='ml-10 mb-0'>{intl.formatMessage(messages.sameRateLevels)}</p>
										</div>
									</div>
								</div>
							)}
						</Form.List>
						<Row gutter={15}>
							{registerData?.scheduling?.isSeparateEvaluationRate && (
								<Col xs={24} sm={24} md={12}>
									<Form.Item
										name="separateEvaluationRate"
										label={'Evaluation ' + intl.formatMessage(messages.rate)}
										rules={[{ required: registerData?.scheduling?.isNewClientEvaluation, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.rate) }]}
									>
										<Input
											onChange={(e) => this.setValueToReduxRegisterData('separateEvaluationRate', e.target.value)}
											placeholder={intl.formatMessage(messages.rate)}
										/>
									</Form.Item>
								</Col>
							)}
							<Col xs={24} sm={24} md={12}>
								<Form.Item
									name="cancellationFee"
									label={intl.formatMessage(messages.cancellationFee)}
									rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.cancellationFee) }]}
									className='w-100'
								>
									<Input placeholder={intl.formatMessage(messages.cancellationFee)} />
								</Form.Item>
							</Col>
						</Row>
						<Form.Item
							name="upload_w_9"
							label={intl.formatMessage(messagesRequest.upload)}
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
	auth: state.auth,
})

export default compose(connect(mapStateToProps, { setRegisterData }))(InfoFinancial);