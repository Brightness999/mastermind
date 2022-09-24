import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select, Checkbox, Segmented, TimePicker, Switch } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import { QuestionCircleOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import moment from 'moment';
import messages from '../../messages';
import messagesLogin from '../../../../Sign/Login/messages';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import shortid from 'shortid';
import { url } from '../../../../../utils/api/baseUrl';
import axios from 'axios';

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
        // const {registerData} = this.props.register;
        // const { authDataClientChild } = this.props.auth
        // var studentInfos = authDataClientChild
        // this.form?.setFieldsValue({children:studentInfos});
        // if(this.state?.currentDaySelecting.length == 0){
        //     var arr = []
        //     for(var i = 0 ; i < studentInfos.length ; i++){
        //         arr.push(0);
        //     }
        //     this.setState({currentDaySelecting:arr});
        // }
        // this.setState({studentInfos:studentInfos});

        const tokenUser = localStorage.getItem('token');

        if (tokenUser) {
            axios.post(url + 'clients/get_child_profile', {}, {
                headers: {
                    'Authorization': 'Bearer ' + tokenUser
                }
            }).then(result => {
                let { success, data } = result.data;
                if (success) {
                    console.log(data);
                    this.form?.setFieldsValue({ children: data });
                    if (this.state.currentDaySelecting.length == 0) {
                        var arr = []
                        for (var i = 0; i < data.length; i++) {
                            arr.push(0);
                        }
                        this.setState({ currentDaySelecting: arr });
                    }
                    this.setState({ studentInfos: data });
                }
            }).catch(err => {
                console.log(err);
                this.setState({
                    checkEmailExist: false,
                });
            })
        }
    }


    onFinish = (values) => {


        // this.props.onContinue();
    };

    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    onSameAllDependent = () => {
        console.log('set same all');
        this.setState({ isSameAll: !this.state.isSameAll });
    }

    onSubmit = async () => {
        var isPassed = false;

        // add to redux
        const { registerData } = this.props.register;
        var studentInfos = [...registerData.studentInfos]

        for (var i = 0; i < this.state.studentInfos.length; i++) {
            console.log('submitting ', i, 'availabilitySchedule', this.state.studentInfos[i].availabilitySchedule.length, this.state.studentInfos[i].availabilitySchedule);
            var selectedObj = { ...studentInfos[i] };
            selectedObj['availabilitySchedule'] = this.state.studentInfos[i].availabilitySchedule;
            studentInfos[i] = selectedObj;
        }
        this.props.setRegisterData({ studentInfos: studentInfos });

        // continue
        return this.props.onContinue();
    }

    updateProfile(index) {
        updateProfile = async (index) => {
            const token = localStorage.getItem('token');
            const values = await this.form.validateFields();
            const dataForm = values.children[index];
            const dataChangeFrom = this.state.dataChange ?? [];

            try {
                store.dispatch(setInforClientChild({ data: dataForm, token: token }))
                if (dataChangeFrom.length != 0) {
                    this.props.changeInforClientChild(dataChangeFrom)
                }
            } catch (error) {
                console.log(error, 'error')
            }

        }
    }

    logForAvailbitiyArr = () => {
        // console.log('submitting' , this.form.getFieldsValue());
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
        console.log('update redux student', index, selectedObj, fieldName, value);
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



    onChangeTimeRange = (indexInStudentInfo, indexInRange, newValue) => {
        if (this.state.isSameAll) {

        } else {

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
            // newStu[index].availabilitySchedule = arr;

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
        console.log(this.state.currentDaySelecting)
    }

    onValueAdd() {

    }

    valueForAvailabilityScheduleOpenHour(index, indexOnAvailabilitySchedule) {
        console.log('value open', index, indexOnAvailabilitySchedule, `${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].openHour}:${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].openMin}:00`)
        if (!this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule]) return moment('00:00:00', 'HH:mm:ss')
        return moment(`${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].openHour}:${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].openMin}:00`, 'HH:mm:ss')
    }

    valueForAvailabilityScheduleCloseHour(index, indexOnAvailabilitySchedule) {

        console.log('value close', index, indexOnAvailabilitySchedule, `${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].closeHour}:${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].closeMin}:00`)
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
                    if (stdIndex = index) {
                        return { ...student, availabilitySchedule: arr }
                    }

                    return student;
                })
            });
            // newStu[index].availabilitySchedule = arr;

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
                    if (stdIndex = index) {
                        return { ...student, availabilitySchedule: arr }
                    }

                    return student;
                })
            });
            // newStu[index].availabilitySchedule = arr;

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

    renderItem(field, index) {
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
                        onChange={v => {
                            console.log('day change ', v, index);
                            // var  newDay = day_week.indexOf(v);
                            this.onChangeSelectingDay(index, v);
                        }}
                    />
                    <div className='div-time'>
                        {this.state.studentInfos[index].availabilitySchedule.map((scheduleItem, indexOnAvailabilitySchedule) => {
                            if (scheduleItem.dayInWeek == this.state.currentDaySelecting[index]) {
                                return (
                                    <Row key={indexOnAvailabilitySchedule} gutter={14}>
                                        <Col xs={24} sm={24} md={12}>
                                            <TimePicker
                                                name={`timer_1${scheduleItem.uid}_${indexOnAvailabilitySchedule}`}
                                                use12Hours format="h:mm a" placeholder={intl.formatMessage(messages.from)}
                                                value={this.valueForAvailabilityScheduleOpenHour(index, indexOnAvailabilitySchedule)}

                                                onChange={v => {
                                                    console.log('timer open changed ', v);
                                                    this.valueChangeForOpenHour(index, indexOnAvailabilitySchedule, v);
                                                }}
                                            />
                                        </Col>
                                        <Col xs={24} sm={24} md={12} className={indexOnAvailabilitySchedule === 0 ? '' : 'item-remove'}>
                                            <TimePicker
                                                name={`timer_1${scheduleItem.uid}_${indexOnAvailabilitySchedule}`}
                                                onChange={v => {
                                                    console.log('timer 2 changed ', v);
                                                    this.valueChangeForCloseHour(index, indexOnAvailabilitySchedule, v);
                                                }}
                                                value={this.valueForAvailabilityScheduleCloseHour(index, indexOnAvailabilitySchedule)}
                                                use12Hours
                                                format="h:mm a"
                                                placeholder={intl.formatMessage(messages.to)}
                                            />
                                            {indexOnAvailabilitySchedule === 0 ? null : <BsDashCircle size={16} className='text-red icon-remove' onClick={() => {
                                                // if(this.state.isSameAll){
                                                //     remove(field.name)
                                                // }else{
                                                //     remove(field.id)
                                                // }
                                            }} />}
                                        </Col>
                                    </Row>
                                )
                            }

                        }
                        )}
                        <div className='div-add-time' onClick={() => {
                            // add(null);
                            this.addNewTimeRange(index, this.state.currentDaySelecting[index]);
                        }}>
                            <BsPlusCircle size={17} className='mr-5 text-primary' />
                            <a className='text-primary'>{intl.formatMessage(messages.addTimeRange)}</a>
                        </div>
                        <div className='text-right div-copy-week' onClick={() => {
                            this.copyToFullWeek(index, this.state.currentDaySelecting[index]);
                        }}>
                            <a className='font-10 underline text-primary'>{intl.formatMessage(messages.copyFullWeek)}</a>
                            <QuestionCircleOutlined className='text-primary' />
                        </div>
                    </div>
                </div>
                {index == 0 && this.state.studentInfos.length > 1 && <div className='flex flex-row items-center'>
                    <Switch size="small" checked={isSameAll} onChange={this.onSameAllDependent} />
                    <p className='ml-10 mb-0'>{intl.formatMessage(messages.sameAllDependents)}</p>
                </div>}


            </div>
        );
    }

    render() {
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
        // state version
        return (
            <Row justify="center" className="row-form">
                <div className='col-form col-create-default'>
                    {/* <div className='div-form-title'>
                        <p className='font-30 text-center'>{intl.formatMessage(messages.academicInformation)}</p>
                    </div> */}
                    <div

                    >
                        {this.state.studentInfos.map((user, index) => {
                            return this.renderItem(user, index);
                        })}

                        {/* List of Availability Schedule End */}
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

const mapStateToProps = state => ({
    register: state.register,
    auth: state.auth
})

export default compose(connect(mapStateToProps, { setRegisterData }))(InfoProgress);