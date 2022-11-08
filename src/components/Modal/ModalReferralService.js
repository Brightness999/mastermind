import React from 'react';
import { Modal, Button, Row, Col, Switch, Select, Typography, Calendar, Upload, Input, message, Form } from 'antd';
import { BiChevronLeft, BiChevronRight, BiUpload } from 'react-icons/bi';
import { GoPrimitiveDot } from 'react-icons/go';
import intl from 'react-intl-universal';
import messages from './messages';
import msgCreateAccount from '../../routes/Sign/CreateAccount/messages';
import msgDrawer from '../../components/DrawerDetail/messages';
import msgReview from '../../routes/Sign/SubsidyReview/messages';
import msgRequest from '../../routes/Sign/SubsidyRequest/messages';
import moment from 'moment';
import './style/index.less';
import '../../assets/styles/login.less';
import { url, switchPathWithRole } from '../../utils/api/baseUrl'
import request from '../../utils/api/request'
import 'moment/locale/en-au';
moment.locale('en');

const arrTime = [
	"8:30am",
	"9:00am",
	"9:30am",
	"10:30am",
	"11:00am",
	"11:30am",
	"1:30pm",
	"2:00pm",
	"2:30pm",
	"3:00pm",
	"3:30pm",
	"4:00pm",
	"4:30pm",
	"5:00pm",
];

class ModalReferralService extends React.Component {
	state = {
		isConfirm: false,
		isPopupComfirm: false,
		isSelectTime: -1,
		fileList: [],
		uploading: false,
		selectedDependent: undefined,
		selectedSkillSet: undefined,
		schoolInfo: undefined,
		consulationPhoneNumber: undefined,
		meetLocation: undefined,
		meetSolution: undefined,
		note: undefined,
		subsidyId: undefined,
		isGoogleMeet: false,
		selectedDate: moment(),
		isSelectTime: -1,
	}

	componentDidMount = () => {
		this.props.setLoadData(this.loadDataForReferralFromSubsidy);
	}

	loadDefaultData() {
		this.setState({
			fileList: [],
			uploading: false,
			selectedDependent: undefined,
			selectedSkillSet: undefined,
			schoolInfo: undefined,
			consulationPhoneNumber: undefined,
			meetLocation: undefined,
			meetSolution: undefined,
			note: undefined,
			subsidyId: undefined,
		})
	}

	loadDataForReferralFromSubsidy = (subsidy, callback) => {
		this.loadDefaultData();
		if (subsidy != undefined && subsidy.student != undefined && subsidy.student._id != undefined) {
			this.setState({
				subsidyId: subsidy._id,
				selectedSkillSet: subsidy.skillSet,
				schoolInfo: subsidy.school,
				selectedDependent: subsidy.student._id,
				consulationPhoneNumber: subsidy.school.techContactRef[0],
			})
		}
		if (callback != undefined) {
			this.callbackForReferral = callback
		} else {
			this.callbackForReferral = undefined;
		}
	}

	loadDataForSelectedDependent(dependent) {
		var schoolId = dependent.school._id || dependent.school;
		if (!!this.state.schoolInfo && schoolId == this.state.schoolInfo._id) {
			return;
		}
		request.post('schools/get_school_info', { 'schoolId': schoolId }).then(result => {
			if (result.success) {
				this.setState({ schoolInfo: result.data, consulationPhoneNumber: result.data.techContactRef[0] });
			} else {
				this.setState({ schoolInfo: undefined });
			}
		}).catch(err => {
			console.log(err);
			this.setState({ schoolInfo: undefined });
		})
	}

	createConsulation = () => {
		if (!this.state.consulationPhoneNumber
			|| this.state.consulationPhoneNumber.length < 1
			|| this.state.meetSolution == undefined ||
			this.state.isSelectTime < 0
		) {
			console.log(this.state.consulationPhoneNumber
				, this.state.consulationPhoneNumber.length < 1
				, this.state.meetSolution == undefined,
				this.state.isSelectTime < 0)
			message.error('please fill all reuired field');
			return;
		}

		var str = this.state.selectedDate.format("DD/MM/YYYY") + " " + arrTime[this.state.isSelectTime];
		var _selectedDay = moment(str, 'DD/MM/YYYY hh:mm').valueOf();
		var postData = {
			"subsidyId": this.state.subsidyId,
			"dependent": this.state.selectedDependent,
			"skillSet": this.state.selectedSkillSet,
			"school": this.state.schoolInfo._id,
			"typeForAppointLocation": this.state.meetSolution,
			"location": this.state.meetLocation,
			"date": _selectedDay,
			"phoneNumber": this.state.consulationPhoneNumber,
			"addtionalDocuments": this.state.fileList.length > 0 ? [this.state.fileList[0].response.data] : [],
			"note": this.state.note,
		};

		request.post(switchPathWithRole(this.props.userRole) + 'create_consulation_to_subsidy', postData).then(result => {
			if (result.success) {
				!!this.callbackForReferral && this.callbackForReferral()
				this.props.onCancel();
			} else {
				message.error('cannot create referral');
			}
		}).catch(err => {
			console.log(err);
			message.error('cannot create referral');
		})
	}

	onFinishFailed = (values) => {
		console.log(values);
	}

	onConfirm = () => {
		this.setState({ isConfirm: true });
		this.setState({ isPopupComfirm: true });
	}

	onSelectTime = (index) => {
		this.setState({ isSelectTime: index })
	}

	onChangeUpload = (info) => {
		if (info.file.status == 'removed') {
			this.setState({ fileList: [] })
			return;
		}
		if (info.file.status == 'done') {
			this.setState(prevState => ({
				fileList: info.fileList,
			}));
		}
	}

	isSameId = (id, _id) => {
		return id = _id;
	}

	changeMeetingType = (status) => {
		this.setState({ isGoogleMeet: status });
	}

	prevMonth = () => {
		if (moment(this.state.selectedDate).add(-1, 'month').isAfter(new Date())) {
			this.setState({
				selectedDate: moment(this.state.selectedDate).add(-1, 'month'),
				isSelectTime: -1,
			});
		}
	}

	nextMonth = () => {
		if (moment(this.state.selectedDate).add(1, 'month').isAfter(new Date())) {
			this.setState({
				selectedDate: moment(this.state.selectedDate).add(1, 'month'),
				isSelectTime: -1,
			});
		}
	}

	render() {
		const { selectedDate, selectedValue, isSelectTime, selectedDependent, subsidyId, selectedSkillSet, consulationPhoneNumber, note, isGoogleMeet } = this.state;

		const modalProps = {
			className: 'modal-referral-service',
			title: "",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: this.props.onCancel,
			closable: false,
			width: 900,
			footer: []
		};

		const props = {
			name: 'file',
			action: url + "clients/upload_document",
			headers: {
				authorization: 'authorization-text',
			},
			onChange: this.onChangeUpload,
			maxCount: 1,
		};

		return (
			<Modal {...modalProps}>
				<div className='new-appointment'>
					<div className='flex mt-10'>
						<p className='font-30'>{intl.formatMessage(messages.referralService)}</p>
						<img src='../images/hands.png' className='hands-img' />
					</div>
					<Form
						name='consultation-form'
						onFinish={this.createConsulation}
						onFinishFailed={this.onFinishFailed}
						ref={ref => this.form = ref}
					>
						<Row gutter={20} className='mb-10' align="bottom">
							<Col xs={24} sm={24} md={8} className='select-small'>
								<p className='font-16 mb-5'>{intl.formatMessage(messages.selectOptions)}</p>
								<Form.Item name='selectedDependent' rules={[{ required: true, message: intl.formatMessage(messages.pleaseSelect) + ' ' + intl.formatMessage(msgCreateAccount.dependent) }]}>
									<Select
										placeholder={intl.formatMessage(msgCreateAccount.dependent)}
										value={selectedDependent}
										disabled={subsidyId != undefined}
										onChange={v => {
											this.setState({ selectedDependent: v });
											var selected = this.props.listDependents.find(x => x._id === v);
											this.loadDataForSelectedDependent(selected);
										}}
									>
										{this.props.listDependents?.map((dependent, index) => (
											<Select.Option key={index} value={dependent._id}>{dependent.firstName} {dependent.lastName}</Select.Option>
										))}
									</Select>
								</Form.Item>
							</Col>
							<Col xs={24} sm={24} md={8} className='select-small'>
								<Form.Item name='selectedSkillSet' rules={[{ required: true, message: intl.formatMessage(messages.pleaseSelect) + ' ' + intl.formatMessage(msgCreateAccount.skillsets).slice(0, -1) }]}>
									<Select
										placeholder={intl.formatMessage(msgCreateAccount.skillsets)}
										value={selectedSkillSet}
										disabled={subsidyId != undefined}
										onChange={v => this.setState({ selectedSkillSet: v })}
									>
										{this.props.SkillSet?.map((skill, index) => (
											<Select.Option key={index} value={index}>{skill.name}</Select.Option>
										))}
									</Select>
								</Form.Item>
							</Col>
							<Col xs={24} sm={24} md={8}>
								<div className='flex gap-2 pb-10'>
									<div>{intl.formatMessage(messages.byPhone)}</div>
									<Switch className='phone-googlemeet-switch' checked={isGoogleMeet} onChange={this.changeMeetingType} />
									<div>{intl.formatMessage(messages.googleMeet)}</div>
								</div>
								<Form.Item
									name='phoneNumber'
									rules={[
										{ required: !isGoogleMeet, message: intl.formatMessage(messages.pleaseEnter) + ' ' + intl.formatMessage(messages.contactNumber) },
										{ pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$', message: intl.formatMessage(messages.phoneNumberValid) },
									]}
								>
									<Input
										placeholder={intl.formatMessage(msgCreateAccount.phoneNumber)}
										value={consulationPhoneNumber}
										onChange={v => this.setState({ consulationPhoneNumber: v.target.value })}
										className={`${isGoogleMeet ? 'display-none' : ''}`}
									/>
								</Form.Item>
							</Col>
						</Row>
						<Row gutter={10}>
							<Col xs={24} sm={24} md={8}>
								<div className='provider-profile'>
									<p className='font-14 font-700'>{intl.formatMessage(messages.additionalDocuments)}</p>
									<div className='upload-document flex-1 mb-10'>
										<Upload {...props}>
											<Button size='small' type='primary' className='btn-upload'>
												{intl.formatMessage(msgRequest.upload).toUpperCase()} <BiUpload size={16} />
											</Button>
										</Upload>
									</div>
									<Input.TextArea
										value={note}
										onChange={e => { this.setState({ note: e.target.value }) }}
										rows={6}
										placeholder={intl.formatMessage(msgReview.notes)}
										className='font-12'
									/>
								</div>
							</Col>
							<Col xs={24} sm={24} md={16}>
								<div className='px-20'>
									<p className='font-700'>{intl.formatMessage(msgCreateAccount.selectDateTime)}</p>
									<div className='calendar'>
										<Row gutter={15}>
											<Col xs={24} sm={24} md={12}>
												<Calendar
													fullscreen={false}
													value={selectedDate}
													onSelect={this.onSelectDate}
													disabledDate={(date) => date.isBefore(new Date())}
													headerRender={() => (
														<div className='mb-10'>
															<Row gutter={8} justify="space-between" align="middle">
																<Col>
																	<p className='font-12 mb-0'>{selectedValue?.format('MMMM YYYY')}</p>
																</Col>
																<Col>
																	<Button
																		type='text'
																		className='mr-10 left-btn'
																		icon={<BiChevronLeft size={25} />}
																		onClick={this.prevMonth}
																	/>
																	<Button
																		type='text'
																		className='right-btn'
																		icon={<BiChevronRight size={25} />}
																		onClick={this.nextMonth}
																	/>
																</Col>
															</Row>
														</div>
													)}
												/>
											</Col>
											<Col xs={24} sm={24} md={12}>
												<Row gutter={15}>
													{arrTime?.map((time, index) => (
														<Col key={index} span={12}>
															<div className={isSelectTime === index ? 'time-available active' : 'time-available'} onClick={() => time.active ? this.onSelectTime(index) : this.onSelectTime(-1)}>
																<p className='font-12 mb-0'><GoPrimitiveDot className='active' size={15} />{time}</p>
															</div>
														</Col>
													))}
												</Row>
											</Col>
										</Row>
									</div>
								</div>
							</Col>
						</Row>
						<Row justify='end' className='gap-2'>
							<Button key="back" onClick={this.props.onCancel}>
								{intl.formatMessage(msgReview.goBack).toUpperCase()}
							</Button>
							<Button key="submit" type="primary" htmlType='submit'>
								{intl.formatMessage(messages.scheduleConsultation).toUpperCase()}
							</Button>
						</Row>
					</Form>
				</div>
			</Modal>
		);
	}
};
export default ModalReferralService;