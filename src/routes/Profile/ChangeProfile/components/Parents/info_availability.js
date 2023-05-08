import React, { Component } from 'react';
import { Row, Col, Button, Segmented, TimePicker, Switch } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import { QuestionCircleOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import moment from 'moment';

import messages from '../../../../Sign/CreateAccount/messages';
import { connect } from 'react-redux';
import { compose } from 'redux';
import request from '../../../../../utils/api/request';
import { getChildProfile } from '../../../../../utils/api/apiList';
import { setAvailabilityClientChild } from '../../../../../redux/features/authSlice';
import { store } from '../../../../../redux/store';

class DependentAvailability extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isSameAll: true,
			studentInfos: [],
			currentDaySelecting: [],
			hasErrorOnTimeClose: false,
		}
	}

	componentDidMount() {
		request.post(getChildProfile).then(result => {
			const { success, data } = result;
			if (success) {
				if (this.state.currentDaySelecting.length == 0) {
					const arr = []
					for (let i = 0; i < data.length; i++) {
						arr.push(0);
					}
					this.setState({ currentDaySelecting: arr });
				}
				this.setState({ studentInfos: data });
			}
		}).catch(err => {
			console.log('get child profile error---', err);
		})
	}

	onSameAllDependent = () => {
		this.setState({ isSameAll: !this.state.isSameAll });
	}

	onSubmit = async () => {
		try {
			store.dispatch(setAvailabilityClientChild({ data: this.state.studentInfos, token: token }));
		} catch (error) {
			console.log(error, 'error')
		}
	}

	defaultTimeRangeItem = (dayInWeek) => {
		return {
			"dayInWeek": dayInWeek,
			"openHour": 7,
			"openMin": 0,
			"closeHour": 18,
			"closeMin": 0
		}
	}

	addNewTimeRange = (index, dayInWeek) => {
		const { isSameAll, studentInfos } = this.state;
		const newStu = [...studentInfos];
		const arr = newStu[index]?.availabilitySchedule ?? [];
		arr.push(this.defaultTimeRangeItem(dayInWeek))
		if (isSameAll) {
			this.setState({
				studentInfos: studentInfos?.map(student => {
					return { ...student, availabilitySchedule: [...arr] }
				})
			});
		} else {
			this.setState({
				studentInfos: studentInfos?.map((student, stdIndex) => {
					if (stdIndex == index) {
						student = { ...student, availabilitySchedule: arr }
					}
					return student;
				})
			});
		}
	}

	copyToFullWeek = (index, dayInWeek) => {
		const { studentInfos, isSameAll } = this.state;
		let newStu = JSON.parse(JSON.stringify(studentInfos));
		const arr = [];

		// get all field in selected day
		let arrForCopy = [];
		for (let i = 0; i < newStu[index].availabilitySchedule.length; i++) {
			if (newStu[index].availabilitySchedule[i].dayInWeek == dayInWeek) {
				arrForCopy.push(newStu[index].availabilitySchedule[i]);
			}
		}

		for (let i = 0; i < 6; i++) {
			for (let j = 0; j < arrForCopy.length; j++) {
				let item = { ...arrForCopy[j] };
				item.dayInWeek = i;
				arr.push(item);
			}
		}
		if (isSameAll) {
			this.setState({
				studentInfos: newStu?.map(student => {
					return { ...student, availabilitySchedule: arr }
				})
			});
		} else {
			this.setState({
				studentInfos: newStu?.map((student, stdIndex) => {
					if (stdIndex == index) {
						student = { ...student, availabilitySchedule: arr }
					}
					return student;
				})
			});
		}
	}

	onChangeSelectingDay = (index, newDay) => {
		const { currentDaySelecting } = this.state;
		if (this.state.isSameAll) {
			for (let i = 0; i < currentDaySelecting.length; i++) {
				currentDaySelecting[i] = newDay;
			}
		} else {
			currentDaySelecting[index] = newDay;
		}
		this.setState({ currentDaySelecting })
	}

	valueForAvailabilityScheduleOpenHour(index, indexOnAvailabilitySchedule) {
		const { studentInfos } = this.state;

		if (!studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule]) {
			return moment('00:00:00', 'HH:mm:ss');
		}

		return moment(`${studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].openHour}:${studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].openMin}:00`, 'HH:mm:ss')
	}

	valueForAvailabilityScheduleCloseHour(index, indexOnAvailabilitySchedule) {
		const { studentInfos } = this.state;

		if (!studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule]) {
			return moment('00:00:00', 'HH:mm:ss');
		}

		return moment(`${studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].closeHour}:${studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].closeMin}:00`, 'HH:mm:ss')
	}

	valueChangeForOpenHour(index, indexOnAvailabilitySchedule, v) {
		if (!v) return;// moment('00:00:00', 'HH:mm:ss');

		const { isSameAll, studentInfos } = this.state;
		const newStu = JSON.parse(JSON.stringify(studentInfos));
		let arr = [...newStu[index].availabilitySchedule];

		arr[indexOnAvailabilitySchedule].openHour = v.hour();
		arr[indexOnAvailabilitySchedule].openMin = v.minutes();

		if (isSameAll) {
			this.setState({
				studentInfos: studentInfos?.map(student => {
					return { ...student, availabilitySchedule: [...arr] }
				})
			});
		} else {
			this.setState({
				studentInfos: studentInfos?.map((student, stdIndex) => {
					if (stdIndex == index) {
						return { ...student, availabilitySchedule: arr }
					}
					return student;
				})
			});
		}

		const momentOpen = moment(`${studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].openHour}:${studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].openMin}:00`, 'HH:mm:ss')
		const momentClose = moment(`${studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].closeHour}:${studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].closeMin}:00`, 'HH:mm:ss')

		if (momentClose.isBefore(momentOpen)) {
			this.setState({ hasErrorOnTimeClose: true });
		} else {
			this.setState({ hasErrorOnTimeClose: false });
		}
	}

	valueChangeForCloseHour(index, indexOnAvailabilitySchedule, v) {
		if (!v) return;// moment('00:00:00', 'HH:mm:ss');

		const { isSameAll, studentInfos } = this.state;
		const newStu = JSON.parse(JSON.stringify(studentInfos));
		let arr = [...newStu[index].availabilitySchedule];

		arr[indexOnAvailabilitySchedule].closeHour = v.hour();
		arr[indexOnAvailabilitySchedule].closeMin = v.minutes();

		if (isSameAll) {
			this.setState({
				studentInfos: studentInfos?.map(student => {
					return { ...student, availabilitySchedule: [...arr] }
				})
			});
		} else {
			this.setState({
				studentInfos: studentInfos?.map((student, stdIndex) => {
					if (stdIndex == index) {
						return { ...student, availabilitySchedule: arr }
					}
					return student;
				})
			});
		}

		const momentOpen = moment(`${studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].openHour}:${studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].openMin}:00`, 'HH:mm:ss')
		const momentClose = moment(`${studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].closeHour}:${studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].closeMin}:00`, 'HH:mm:ss')

		if (momentClose.isBefore(momentOpen)) {
			this.setState({ hasErrorOnTimeClose: true });
		} else {
			this.setState({ hasErrorOnTimeClose: false });
		}
	}

	removeItem(index, indexOnAvailabilitySchedule,) {
		const { studentInfos, isSameAll } = this.state;
		const newStu = [...studentInfos];
		let arr = [...newStu[index].availabilitySchedule];

		arr.splice(indexOnAvailabilitySchedule, 1);

		if (isSameAll) {
			this.setState({
				studentInfos: studentInfos.map((student) => {
					return { ...student, availabilitySchedule: [...arr] }
				})
			});
		} else {
			this.setState({
				studentInfos: studentInfos.map((student, stdIndex) => {
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
		const { isSameAll, studentInfos, currentDaySelecting } = this.state;

		return (
			<div key={`div${index}`} className='academic-item'>
				<p className='font-24 mb-10 text-center'>{intl.formatMessage(messages.availability)}</p>
				<p className='font-16 mr-10 mb-5'>{studentInfos[index]?.firstName ?? ''} {studentInfos[index]?.lastName ?? ''} </p>
				<div className='div-availability'>
					<Segmented options={optionsSegments} block={true}
						value={currentDaySelecting[index]}
						onChange={v => this.onChangeSelectingDay(index, v)}
					/>
					<div className='div-time'>
						{studentInfos[index].availabilitySchedule?.map((scheduleItem, indexOnAvailabilitySchedule) => {
							if (scheduleItem.dayInWeek == currentDaySelecting[index]) {
								return (
									<Row key={indexOnAvailabilitySchedule} gutter={14}>
										<Col xs={24} sm={24} md={12}>
											<TimePicker
												name={`timer_1${scheduleItem.uid}_${indexOnAvailabilitySchedule}`}
												use12Hours format="h:mm a" placeholder={intl.formatMessage(messages.from)}
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
													onClick={() => this.removeItem(index, indexOnAvailabilitySchedule)}
												/>
											)}
										</Col>
									</Row>
								)
							}
						})}
						<div className='div-add-time' onClick={() => this.addNewTimeRange(index, currentDaySelecting[index])}>
							<BsPlusCircle size={17} className='mr-5 text-primary' />
							<a className='text-primary'>{intl.formatMessage(messages.addTimeRange)}</a>
						</div>
						<div className='text-right div-copy-week' onClick={() => this.copyToFullWeek(index, currentDaySelecting[index])}>
							<a className='underline text-primary'>{intl.formatMessage(messages.copyFullWeek)}</a>
							<QuestionCircleOutlined className='text-primary' />
						</div>
					</div>
				</div>
				{index == 0 && studentInfos.length > 1 && (
					<div className='flex flex-row items-center'>
						<Switch size="small" checked={isSameAll} onChange={this.onSameAllDependent} />
						<p className='ml-10 mb-0'>{intl.formatMessage(messages.sameAllDependents)}</p>
					</div>
				)}
			</div>
		);
	}

	render() {
		const { studentInfos } = this.state;

		return (
			<Row justify="center" className="row-form">
				<div className='col-form col-create-default'>
					<div>
						{studentInfos?.map((user, index) => this.renderItem(user, index))}
						<div className="form-btn continue-btn" >
							<Button
								block
								type="primary"
								htmlType="submit"
								onClick={this.onSubmit}
							>
								{intl.formatMessage(messages.update).toUpperCase()}
							</Button>
						</div>
					</div>
				</div>
			</Row >
		);
	}
}

const mapStateToProps = state => ({})

export default compose(connect(mapStateToProps))(DependentAvailability);