import React from 'react';
import { Modal, Button, Form, Row, TimePicker, Col, Input, Checkbox } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';

import messages from './messages';
import msgCreateAccount from 'routes/Sign/CreateAccount/messages';
import { store } from 'src/redux/store';
import './style/index.less';
import '../../assets/styles/login.less';

class ModalSelectTime extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isFullDay: false,
			prevFullDay: false,
			prevOpenHour: undefined,
			prevOpenMin: undefined,
			prevCloseHour: undefined,
			prevCloseMin: undefined,
		}
	}

	componentDidMount() {
		const { selectedDate } = this.props;
		const { user } = store.getState().auth;
		const blackoutDates = user.providerInfo?.blackoutDates || user.consultantInfo?.blackoutDates;
		const blackoutTimes = user.providerInfo?.blackoutTimes || user.consultantInfo?.blackoutTimes;

		if (selectedDate) {
			blackoutDates?.forEach(d => {
				if (moment(d).year() === selectedDate.getFullYear() && moment(d).month() === selectedDate.getMonth() && moment(d).date() === selectedDate.getDate()) {
					this.setState({ isFullDay: true, prevFullDay: true });
				}
			})

			blackoutTimes?.forEach(t => {
				if (t.year === selectedDate.getFullYear() && t.month === selectedDate.getMonth() && t.date === selectedDate.getDate()) {
					this.form?.setFieldsValue({
						from_time: (t.openHour === 0 && t.openMin === 0) ? undefined : moment().hour(t.openHour).minute(t.openMin),
						to_time: (t.closeHour === 23 && t.closeMin === 59) ? undefined : moment().hour(t.closeHour).minute(t.closeMin),
					})
					this.setState({
						prevOpenHour: (t.openHour === 0 && t.openMin === 0) ? undefined : t.openHour,
						prevOpenMin: (t.openHour === 0 && t.openMin === 0) ? undefined : t.openMin,
						prevCloseHour: (t.closeHour === 23 && t.closeMin === 59) ? undefined : t.closeHour,
						prevCloseMin: (t.closeHour === 23 && t.closeMin === 59) ? undefined : t.closeMin,
					})
				}
			});
		}
	}

	onFinish = (values) => {
		const { prevCloseHour, prevCloseMin, prevFullDay, prevOpenHour, prevOpenMin, isFullDay } = this.state;
		if (prevCloseHour === values.to_time?.hour(), prevCloseMin === values.to_time?.minute(), prevOpenHour === values.from_time?.hour() && prevOpenMin === values.from_time?.minute() && prevFullDay === isFullDay) {
			this.props.onCancel();
		} else {
			this.props.onSubmit({ ...values, isFullDay });
		}
	}

	handleSelectTime = (value, type) => {
		if (value?.split(' ')?.length === 2 && (value.split(' ')?.[1] === 'am' || value.split(' ')?.[1] === 'pm')) {
			const selectedHour = value.split(' ')?.[0]?.split(':')?.[0];
			const selectedMin = value.split(' ')?.[0]?.split(':')?.[1];
			const timePeriod = value.split(' ')?.[1];
			if (selectedHour > 0 && selectedHour < 13 && selectedHour?.length === 2 && selectedMin >= 0 && selectedMin < 60 && selectedMin?.length === 2) {
				value = moment().set({ hours: timePeriod?.toLowerCase() === 'pm' ? selectedHour * 1 + 12 : selectedHour * 1, minutes: selectedMin * 1, seconds: 0, milliseconds: 0 });
				this.form?.setFieldValue(type, value)
			}
		}
	}

	handleCheck = (checked) => {
		this.setState({ isFullDay: checked });
		checked && this.form.setFieldsValue({ isFullDay: checked, from_time: undefined, to_time: undefined });
	}

	render() {
		const modalProps = {
			className: 'modal-date-options',
			title: "Blackout settings",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: this.props.onCancel,
			footer: null,
		};

		return (
			<Modal {...modalProps}>
				<p className='font-20 font-500 mb-10'>Please select time rage.</p>
				<Form name='select-time' layout='vertical' onFinish={this.onFinish} ref={ref => this.form = ref}>
					<Row gutter={15}>
						<Col xs={24} sm={24} md={12}>
							<Form.Item name="from_time" label="From">
								<TimePicker
									use12Hours
									format="hh:mm a"
									popupClassName='timepicker'
									placeholder={intl.formatMessage(msgCreateAccount.from)}
									className='w-100'
									inputRender={props => (
										<Input
											aria-required={props['aria-required']}
											aria-describedby={props['aria-describedby']}
											aria-invalid={props['aria-invalid']}
											autoComplete={props.autoComplete}
											autoFocus={props.autoFocus}
											disabled={props.disabled}
											id={props.id}
											onBlur={props.onBlur}
											onChange={(e) => {
												props.onChange(e);
												this.handleSelectTime(e.target.value, 'from_time');
												this.setState({ isFullDay: false });
											}}
											onFocus={props.onFocus}
											onKeyDown={props.onKeyDown}
											onMouseDown={props.onMouseDown}
											placeholder={props.placeholder}
											readOnly={props.readOnly}
											size={props.size}
											value={props.value}
											title={props.title}
										/>
									)}
									onSelect={(v) => {
										this.form?.setFieldValue('from_time', v)
										this.setState({ isFullDay: false });
									}}
								/>
							</Form.Item>
						</Col>
						<Col xs={24} sm={24} md={12}>
							<Form.Item name="to_time" label="To">
								<TimePicker
									use12Hours
									format="hh:mm a"
									popupClassName='timepicker'
									className='w-100'
									placeholder={intl.formatMessage(msgCreateAccount.to)}
									inputRender={props => (
										<Input
											aria-required={props['aria-required']}
											aria-describedby={props['aria-describedby']}
											aria-invalid={props['aria-invalid']}
											autoComplete={props.autoComplete}
											autoFocus={props.autoFocus}
											disabled={props.disabled}
											id={props.id}
											onBlur={props.onBlur}
											onChange={(e) => {
												props.onChange(e);
												this.handleSelectTime(e.target.value, 'to_time');
												this.setState({ isFullDay: false });
											}}
											onFocus={props.onFocus}
											onKeyDown={props.onKeyDown}
											onMouseDown={props.onMouseDown}
											placeholder={props.placeholder}
											readOnly={props.readOnly}
											size={props.size}
											value={props.value}
											title={props.title}
										/>
									)}
									onSelect={(v) => {
										this.form?.setFieldValue('to_time', v);
										this.setState({ isFullDay: false });
									}}
								/>
							</Form.Item>
						</Col>
					</Row>
					<Checkbox checked={this.state.isFullDay} onChange={e => this.handleCheck(e.target.checked)}>Full Day</Checkbox>
					<Row className="justify-end gap-2 mt-10">
						<Button key="back" onClick={this.props.onCancel}>
							{intl.formatMessage(messages.goBack)}
						</Button>
						<Button key="submit" type="primary" htmlType='submit'>
							{intl.formatMessage(msgCreateAccount.confirm)}
						</Button>
					</Row>
				</Form>
			</Modal >
		);
	}
};

export default ModalSelectTime;