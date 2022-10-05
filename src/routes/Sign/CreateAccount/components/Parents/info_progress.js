import React, { Component } from 'react';
import { Row, Col, Form, Button, Segmented, TimePicker, Switch } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import { QuestionCircleOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import moment from 'moment';
import messages from '../../messages';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import shortid from 'shortid';

class InfoProgress extends Component {
	constructor(props) {
		super(props);
		this.state = {
			formTime: [{ timeFromTo: "Time 1" }],
			fromLocation: [{ timeLocation: "Location 1" }],
			isSameAll: true,
			studentInfos: [],
			currentDaySelecting: [],
			hasErrorOnTimeClose: false,
		}
	}

	componentDidMount() {
		const { registerData } = this.props.register;
		var studentInfos = registerData.studentInfos
		this.form?.setFieldsValue({ children: studentInfos });
		if (this.state.currentDaySelecting.length == 0) {
			var arr = []
			for (var i = 0; i < studentInfos.length; i++) {
				arr.push(0);
			}
			this.setState({ currentDaySelecting: arr });
		}
		this.setState({ studentInfos: studentInfos });
	}

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	onSameAllDependent = () => {
		this.setState({ isSameAll: !this.state.isSameAll });
	}

	onSubmit = async () => {
		const { registerData } = this.props.register;
		var studentInfos = [...registerData.studentInfos]
		for (var i = 0; i < this.state.studentInfos.length; i++) {
			var selectedObj = { ...studentInfos[i] };
			selectedObj['availabilitySchedule'] = this.state.studentInfos[i].availabilitySchedule;
			studentInfos[i] = selectedObj;
		}
		this.props.setRegisterData({ studentInfos: studentInfos });
		return this.props.onContinue();
	}

	logForAvailbitiyArr = () => {
		for (var i = 0; i < this.state.studentInfos.length; i++) {
			console.log('submitting ', i, 'availabilitySchedule', this.state.studentInfos[i].availabilitySchedule.length, this.state.studentInfos[i].availabilitySchedule);
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

	defaultTimeRangeItem = (dayInWeek) => {
		return {
			"uid": shortid.generate() + '' + Date.now(),
			"dayInWeek": dayInWeek,
			"openHour": 7,
			"openMin": 0,
			"closeHour": 18,
			"closeMin": 0
		}
	}

	addNewTimeRange = (index, dayInWeek) => {
		const { studentInfos } = this.state;
		var newStu = [...studentInfos];
		var arr = [...newStu[index].availabilitySchedule];
		arr.push(this.defaultTimeRangeItem(dayInWeek))
		if (this.state.isSameAll) {
			this.setState({
				studentInfos: this.state.studentInfos.map((student, stdIndex) => {
					return { ...student, availabilitySchedule: [...arr] }
				})
			});
		} else {
			this.setState({
				studentInfos: this.state.studentInfos.map((student, stdIndex) => {
					if (stdIndex == index) {
						return { ...student, availabilitySchedule: arr }
					}
					return student;
				})
			});
		}
	}

	copyToFullWeek = (index, dayInWeek) => {
		const { studentInfos } = this.state;
		var newStu = [...studentInfos];
		var arr = [];

		// get all field in selected day
		var arrForCopy = [];
		for (var i = 0; i < newStu[index].availabilitySchedule.length; i++) {
			if (newStu[index].availabilitySchedule[i].dayInWeek == dayInWeek) {
				arrForCopy.push(newStu[index].availabilitySchedule[i]);
			}
		}

		for (var i = 0; i < 6; i++) {
			for (var j = 0; j < arrForCopy.length; j++) {
				var item = { ...arrForCopy[j] };
				item.dayInWeek = i;
				arr.push(item);
			}
		}
		if (this.state.isSameAll) {
			this.setState({
				studentInfos: this.state.studentInfos.map((student, stdIndex) => {
					return { ...student, availabilitySchedule: [...arr] }
				})
			});
		} else {
			this.setState({
				studentInfos: this.state.studentInfos.map((student, stdIndex) => {
					if (stdIndex == index) {
						return { ...student, availabilitySchedule: arr }
					}
					return student;
				})
			});
		}
	}

	onChangeSelectingDay = (index, newDay) => {
		const { currentDaySelecting } = this.state;
		if (this.state.isSameAll) {
			for (var i = 0; i < currentDaySelecting.length; i++) {
				currentDaySelecting[i] = newDay;
			}
		} else {
			currentDaySelecting[index] = newDay;
		}
		this.setState({ currentDaySelecting })
	}

	valueForAvailabilityScheduleOpenHour(index, indexOnAvailabilitySchedule) {
		if (!this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule]) return moment('00:00:00', 'HH:mm:ss')
		return moment(`${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].openHour}:${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].openMin}:00`, 'HH:mm:ss')
	}

	valueForAvailabilityScheduleCloseHour(index, indexOnAvailabilitySchedule) {
		if (!this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule]) return moment('00:00:00', 'HH:mm:ss')
		return moment(`${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].closeHour}:${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].closeMin}:00`, 'HH:mm:ss')
	}

	valueChangeForOpenHour(index, indexOnAvailabilitySchedule, v) {
		if (!v) return;// moment('00:00:00', 'HH:mm:ss');
		const { studentInfos } = this.state;
		var newStu = [...studentInfos];
		var arr = [...newStu[index].availabilitySchedule];
		arr[indexOnAvailabilitySchedule].openHour = v.hour();
		arr[indexOnAvailabilitySchedule].openMin = v.minutes();
		if (this.state.isSameAll) {
			this.setState({
				studentInfos: this.state.studentInfos.map((student, stdIndex) => {
					return { ...student, availabilitySchedule: [...arr] }
				})
			});
		} else {
			this.setState({
				studentInfos: this.state.studentInfos.map((student, stdIndex) => {
					if (stdIndex == index) {
						return { ...student, availabilitySchedule: arr }
					}
					return student;
				})
			});
		}
		var momentOpen = moment(`${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].openHour}:${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].openMin}:00`, 'HH:mm:ss')
		var momentClose = moment(`${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].closeHour}:${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].closeMin}:00`, 'HH:mm:ss')
		if (momentClose.isBefore(momentOpen)) {
			this.setState({
				hasErrorOnTimeClose: true,
			})
		} else {
			this.setState({
				hasErrorOnTimeClose: false,
			})
		}
		this.logForAvailbitiyArr();
	}

	valueChangeForCloseHour(index, indexOnAvailabilitySchedule, v) {
		if (!v) return;// moment('00:00:00', 'HH:mm:ss');
		const { studentInfos } = this.state;
		var newStu = [...studentInfos];
		var arr = [...newStu[index].availabilitySchedule];
		arr[indexOnAvailabilitySchedule].closeHour = v.hour();
		arr[indexOnAvailabilitySchedule].closeMin = v.minutes();
		if (this.state.isSameAll) {
			this.setState({
				studentInfos: this.state.studentInfos.map((student, stdIndex) => {
					return { ...student, availabilitySchedule: [...arr] }
				})
			});
		} else {
			this.setState({
				studentInfos: this.state.studentInfos.map((student, stdIndex) => {
					if (stdIndex == index) {
						return { ...student, availabilitySchedule: arr }
					}
					return student;
				})
			});
		}
		var momentOpen = moment(`${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].openHour}:${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].openMin}:00`, 'HH:mm:ss')
		var momentClose = moment(`${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].closeHour}:${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].closeMin}:00`, 'HH:mm:ss')
		if (momentClose.isBefore(momentOpen)) {
			this.setState({
				hasErrorOnTimeClose: true,
			})
		} else {
			this.setState({
				hasErrorOnTimeClose: false,
			})
		}
		this.logForAvailbitiyArr();
	}

	remove1Item(index, indexOnAvailabilitySchedule,) {
		const { studentInfos } = this.state;
		var newStu = [...studentInfos];
		var arr = [...newStu[index].availabilitySchedule];
		arr.splice(indexOnAvailabilitySchedule, 1)
		if (this.state.isSameAll) {
			this.setState({
				studentInfos: this.state.studentInfos.map((student, stdIndex) => {
					return { ...student, availabilitySchedule: [...arr] }
				})
			});
		} else {
			this.setState({
				studentInfos: this.state.studentInfos.map((student, stdIndex) => {
					if (stdIndex == index) {
						return { ...student, availabilitySchedule: [...arr] }
					}
					return student;
				})
			});
		}
	}

	renderItem(_, index) {
		const day_week = [
			intl.formatMessage(messages.sunday),
			intl.formatMessage(messages.monday),
			intl.formatMessage(messages.tuesday),
			intl.formatMessage(messages.wednesday),
			intl.formatMessage(messages.thursday),
			intl.formatMessage(messages.friday),
		]
		const optionsSegments = day_week.map((day, index) => {
			return { label: day, value: index };
		});
		const { isSameAll } = this.state;

		return (
			<div key={`div${index}`} className='academic-item'>
				<p className='font-24 mb-10 text-center'>{intl.formatMessage(messages.availability)}</p>
				<p className='font-16 mr-10 mb-5'>{intl.formatMessage(messages.dependent)} #{index + 1} {this.state.studentInfos[index].firstName} {this.state.studentInfos[index].lastName} </p>
				<div className='div-availability'>
					<Segmented options={optionsSegments} block={true}
						value={this.state.currentDaySelecting[index]}
						onChange={v => this.onChangeSelectingDay(index, v)}
					/>
					<div className='div-time'>
						{this.state.studentInfos[index].availabilitySchedule.map((scheduleItem, indexOnAvailabilitySchedule) => {
							if (scheduleItem.dayInWeek == this.state.currentDaySelecting[index]) {
								return (
									<Row key={indexOnAvailabilitySchedule} gutter={14}>
										<Col xs={24} sm={24} md={12}>
											<TimePicker
												name={`timer_1${scheduleItem.uid}_${indexOnAvailabilitySchedule}`}
												use12Hours
												format="h:mm a"
												placeholder={intl.formatMessage(messages.from)}
												value={this.valueForAvailabilityScheduleOpenHour(index, indexOnAvailabilitySchedule)}
												onChange={v => this.valueChangeForOpenHour(index, indexOnAvailabilitySchedule, v)}
											/>
										</Col>
										<Col xs={24} sm={24} md={12} className={indexOnAvailabilitySchedule === 0 ? '' : 'item-remove'}>
											<TimePicker
												name={`timer_1${scheduleItem.uid}_${indexOnAvailabilitySchedule}`}
												onChange={v => this.valueChangeForCloseHour(index, indexOnAvailabilitySchedule, v)}
												value={this.valueForAvailabilityScheduleCloseHour(index, indexOnAvailabilitySchedule)}
												use12Hours
												format="h:mm a"
												placeholder={intl.formatMessage(messages.to)}
											/>
											{indexOnAvailabilitySchedule === 0 ? null : (
												<BsDashCircle
													size={16}
													className='text-red icon-remove'
													onClick={() => this.remove1Item(index, indexOnAvailabilitySchedule)}
												/>
											)}
										</Col>
									</Row>
								)
							}
						})}
						<div className='div-add-time' onClick={() => this.addNewTimeRange(index, this.state.currentDaySelecting[index])}>
							<BsPlusCircle size={17} className='mr-5 text-primary' />
							<a className='text-primary'>{intl.formatMessage(messages.addTimeRange)}</a>
						</div>
						<div className='text-right div-copy-week' onClick={() => this.copyToFullWeek(index, this.state.currentDaySelecting[index])}>
							<a className='font-10 underline text-primary'>{intl.formatMessage(messages.copyFullWeek)}</a>
							<QuestionCircleOutlined className='text-primary' />
						</div>
					</div>
				</div>
				{index == 0 && this.state.studentInfos.length > 1 && (
					<div className='flex flex-row items-center'>
						<Switch size="small" checked={isSameAll} onChange={this.onSameAllDependent} />
						<p className='ml-10 mb-0'>{intl.formatMessage(messages.sameAllDependents)}</p>
					</div>
				)}
			</div>
		);
	}

	render() {
		return (
			<Row justify="center" className="row-form">
				<div className='col-form col-create-default'>
					<div>
						{this.state.studentInfos.map((user, index) => this.renderItem(user, index))}
						<div className="form-btn continue-btn" >
							<Form
								name="form_default"
								onFinishFailed={this.onFinishFailed}
								ref={ref => this.form = ref}
							>
								<Form.Item>
									<Button
										block
										type="primary"
										htmlType="submit"
										onClick={this.onSubmit}
									>
										{intl.formatMessage(messages.continue).toUpperCase()}
									</Button>
								</Form.Item>
							</Form>
						</div>
					</div>
				</div>
			</Row >
		);
	}
}

const mapStateToProps = state => ({
	register: state.register,
})

export default compose(connect(mapStateToProps, { setRegisterData }))(InfoProgress);