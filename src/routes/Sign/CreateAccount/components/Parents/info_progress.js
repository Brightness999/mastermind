import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select, Checkbox, Segmented, TimePicker, Switch } from 'antd';
import { BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import { QuestionCircleOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import moment from 'moment';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';
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
            isSameAllSchedule: true,
            studentInfos:[],
            currentDaySelecting:[],
            hasErrorOnTimeClose:false,
        }
    }

    componentDidMount(){
        const {registerData} = this.props.register;
        var studentInfos = registerData.studentInfos
        this.form.setFieldsValue({children:studentInfos});
        if(this.state.currentDaySelecting.length == 0){
            var arr = []
            for(var i = 0 ; i < studentInfos.length ; i++){
                arr.push(0);
            }
            this.setState({currentDaySelecting:arr});
        }
        this.setState({studentInfos:studentInfos});
    }
    

    onFinish = (values) => {
        

        // this.props.onContinue();
    };

    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    onSameAllDependent = () => {
        this.setState({ isSameAll: !this.state.isSameAll });
    }
    onSameAllSchedule = () => {
        this.setState({ isSameAllSchedule: !this.state.isSameAllSchedule });
    }

    onSubmit = async () => {
        var isPassed = false;
        
        // for(var i = 0 ; i < this.state.studentInfos.length;i++){
        //     for(var j = 0 ; j <this.state.studentInfos[i].availabilitySchedule.length ; j++){
        //         this.state.studentInfos[i].availabilitySchedule[j]
        //         if(){

        //         }
        //     }
        // }

        // add to redux
        const {registerData} = this.props.register;
        var studentInfos =[ ...registerData.studentInfos]
        
        for(var i = 0 ; i < this.state.studentInfos.length;i++){
            console.log('submitting ', i,'availabilitySchedule',this.state.studentInfos[i].availabilitySchedule.length , this.state.studentInfos[i].availabilitySchedule );
            var selectedObj ={ ...studentInfos[i]};
            selectedObj['availabilitySchedule' ] = this.state.studentInfos[i].availabilitySchedule;
            studentInfos[i] = selectedObj;
        }
        this.props.setRegisterData({studentInfos:studentInfos});

        // continue
        return this.props.onContinue();
    }

    logForAvailbitiyArr = ()=>{
        console.log('submitting' , this.form.getFieldsValue());
        for(var i = 0 ; i < this.state.studentInfos.length;i++){
            console.log('submitting ', i,'availabilitySchedule',this.state.studentInfos[i].availabilitySchedule.length , this.state.studentInfos[i].availabilitySchedule );
        }
    }

    updateReduxValueFor1Depedent(index , fieldName , value){
        const {registerData} = this.props.register;
        var studentInfos =[ ...registerData.studentInfos]
        var selectedObj ={ ...studentInfos[index]};
        selectedObj[fieldName ] = value;
        studentInfos[index] = selectedObj;
        console.log('update redux student',index ,selectedObj , fieldName , value);
        this.props.setRegisterData({studentInfos:studentInfos});
    }

    defaultTimeRangeItem = (dayInWeek)=>{
        return {
            "uid":shortid.generate()+''+Date.now(),
            "dayInWeek":dayInWeek,
            "openHour":7,
            "openMin":0,
            "closeHour":18,
            "closeMin":0
        }
    }
    
    addNewTimeRange =(index , dayInWeek)=>{
        const {studentInfos} = this.state;
        var newStu = [...studentInfos];
        var arr = [...newStu[index].availabilitySchedule];
        arr.push(this.defaultTimeRangeItem(dayInWeek))
        if(this.state.isSameAll){
            this.setState({
                studentInfos: this.state.studentInfos.map((student, stdIndex) => {
                    return {...student ,availabilitySchedule:[...arr]}
                })
            });
        }else{
            this.setState({
                studentInfos: this.state.studentInfos.map((student, stdIndex) => {
                    if(stdIndex == index ){
                        return {...student ,availabilitySchedule:arr}
                    }
        
                    return student;
                })
            });
            // newStu[index].availabilitySchedule = arr;
            
        }
        // this.setState({studentInfos:newStu})
    }

    

    onChangeTimeRange = (indexInStudentInfo , indexInRange , newValue)=>{
        if(this.state.isSameAll){

        }else{

        }
    }

    copyToFullWeek = (index , dayInWeek)=>{

    }

    onChangeSelectingDay = (index , newDay) =>{
        const {currentDaySelecting} = this.state;
        if(this.state.isSameAll){
            for(var i = 0 ;i <currentDaySelecting.length ;i++){
                currentDaySelecting[i] = newDay;
            }
        }else{
            
            currentDaySelecting[index ] = newDay;
            
            
        }
        this.setState({currentDaySelecting})
        console.log(this.state.currentDaySelecting)
    }

    onValueAdd(){

    }

    valueForAvailabilityScheduleOpenHour(index, indexOnAvailabilitySchedule){
        console.log('value open', index, indexOnAvailabilitySchedule , `${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].openHour}:${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].openMin}:00`)
        if(!this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule]) return moment('00:00:00', 'HH:mm:ss')
        return moment( `${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].openHour}:${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].openMin}:00`, 'HH:mm:ss' )
    }

    valueForAvailabilityScheduleCloseHour(index, indexOnAvailabilitySchedule){
        
        console.log('value close', index, indexOnAvailabilitySchedule , `${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].closeHour}:${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].closeMin}:00`)
        if(!this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule]) return moment('00:00:00', 'HH:mm:ss')
        return moment( `${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].closeHour}:${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].closeMin}:00`, 'HH:mm:ss' )
    }

    valueChangeForOpenHour(index, indexOnAvailabilitySchedule,v){
        if(!v) return;// moment('00:00:00', 'HH:mm:ss');
        const {studentInfos} = this.state;
        var newStu = [...studentInfos];
        var arr = [...newStu[index].availabilitySchedule];

        arr[indexOnAvailabilitySchedule].openHour = v.hour();
        arr[indexOnAvailabilitySchedule].openMin = v.minutes();

        if(this.state.isSameAll){
            this.setState({
                studentInfos: this.state.studentInfos.map((student, stdIndex) => {
                    return {...student ,availabilitySchedule:[...arr]}
                })
            });
        }else{
            this.setState({
                studentInfos: this.state.studentInfos.map((student, stdIndex) => {
                    if(stdIndex = index ){
                        return {...student ,availabilitySchedule:arr}
                    }
        
                    return student;
                })
            });
            // newStu[index].availabilitySchedule = arr;
            
        }
        var momentOpen = moment( `${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].openHour}:${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].openMin}:00`, 'HH:mm:ss' )
        var momentClose = moment( `${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].closeHour}:${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].closeMin}:00`, 'HH:mm:ss' )
        if(momentClose.isBefore(momentOpen)){
            this.setState({
                hasErrorOnTimeClose:true,
            })
        }else{
            this.setState({
                hasErrorOnTimeClose:false,
            })
        }
        this.logForAvailbitiyArr();
    }

    valueChangeForCloseHour(index, indexOnAvailabilitySchedule,v){
        if(!v) return;// moment('00:00:00', 'HH:mm:ss');
        const {studentInfos} = this.state;
        var newStu = [...studentInfos];
        var arr = [...newStu[index].availabilitySchedule];

        arr[indexOnAvailabilitySchedule].closeHour = v.hour();
        arr[indexOnAvailabilitySchedule].closeMin = v.minutes();

        if(this.state.isSameAll){
            this.setState({
                studentInfos: this.state.studentInfos.map((student, stdIndex) => {
                    return {...student ,availabilitySchedule:[...arr]}
                })
            });
        }else{
            this.setState({
                studentInfos: this.state.studentInfos.map((student, stdIndex) => {
                    if(stdIndex = index ){
                        return {...student ,availabilitySchedule:arr}
                    }
        
                    return student;
                })
            });
            // newStu[index].availabilitySchedule = arr;
            
        }
        var momentOpen = moment( `${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].openHour}:${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].openMin}:00`, 'HH:mm:ss' )
        var momentClose = moment( `${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].closeHour}:${this.state.studentInfos[index].availabilitySchedule[indexOnAvailabilitySchedule].closeMin}:00`, 'HH:mm:ss' )
        if(momentClose.isBefore(momentOpen)){
            this.setState({
                hasErrorOnTimeClose:true,
            })
        }else{
            this.setState({
                hasErrorOnTimeClose:false,
            })
        }
        
        this.logForAvailbitiyArr();
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
        const optionsSegments = day_week.map((day,index)=>{
            return { label: day, value: index };
        });
        const { isSameAll, isSameAllSchedule } = this.state;
        
        return (
            <Row justify="center" className="row-form">
                <div className='col-form col-create-default'>
                    {/* <div className='div-form-title'>
                        <p className='font-30 text-center'>{intl.formatMessage(messages.academicInformation)}</p>
                    </div> */}
                    <Form
                        name="form_default"
                        // onFinish={this.onFinish}
                        onFinishFailed={this.onFinishFailed}
                        
                        ref={ref => this.form = ref}
                    >
                        <Form.List name="children">
                            {(fields, _) => (
                                <>
                                    {fields.map((field , index) => {
                                    return (
                                        <div key={field.key} className='academic-item'>
                                            
                                            {/* <Form.Item
                                                name={[field.name, "school"]}
                                                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.school) }]}
                                            >
                                                <Input 

                                                placeholder={intl.formatMessage(messages.school)} 
                                                />
                                            </Form.Item>
                                            <Form.Item
                                                name={[field.name, "primaryTeacher"]}
                                                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.primaryTeacher) }]}
                                            >
                                                <Input placeholder={intl.formatMessage(messages.primaryTeacher)} />
                                            </Form.Item>
                                            <Form.Item
                                                name={[field.name, "currentGrade"]}
                                                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.currentGrade) }]}
                                            >
                                                <Input placeholder={intl.formatMessage(messages.currentGrade)} />
                                            </Form.Item>
                                            <Form.Item
                                                name={[field.name, "services"]}
                                                rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.servicesRequired) }]}
                                            >
                                                <Select
                                                    mode="multiple"
                                                    showArrow
                                                    placeholder={intl.formatMessage(messages.servicesRequired)}
                                                    optionLabelProp="label"

                                                >
                                                    <Select.Option value='Services required 1'>Services required 1</Select.Option>
                                                    <Select.Option value='Services required 2'>Services required 2</Select.Option>
                                                </Select>
                                            </Form.Item>
                                            <Form.Item>
                                                <Checkbox checked={true}>{intl.formatMessage(messages.doHaveIEP)}</Checkbox>
                                            </Form.Item> */}

                                            <p className='font-24 mb-10 text-center'>{intl.formatMessage(messages.availability)}</p>
                                            <p className='font-16 mr-10 mb-5'>{intl.formatMessage(messages.dependent)} #{field.key + 1} {this.state.studentInfos[index].firstName} {this.state.studentInfos[index].lastName} </p>
                                            <div className='div-availability'>
                                                <Segmented options={optionsSegments} block={true} 
                                                value={this.state.currentDaySelecting[index]} 
                                                onChange={v=>{
                                                    console.log('day change ',v,index);
                                                    // var  newDay = day_week.indexOf(v);
                                                    this.onChangeSelectingDay(index, v);
                                                }}
                                                />
                                                <div className='div-time'>
                                                    {this.state.studentInfos[index].availabilitySchedule.map((scheduleItem , indexOnAvailabilitySchedule) =>{
                                                        if(scheduleItem.dayInWeek == this.state.currentDaySelecting[index]){
                                                            return (
                                                                <Row key={indexOnAvailabilitySchedule} gutter={14}>
                                                                    <Col xs={24} sm={24} md={12}>
                                                                        <Form.Item name={[field.name, "open_time",scheduleItem.uid] } >
                                                                            <TimePicker 
                                                                            name={`timer_1${scheduleItem.uid}`}
                                                                            use12Hours format="h:mm a" placeholder={intl.formatMessage(messages.from)}
                                                                            value={this.valueForAvailabilityScheduleOpenHour(index, indexOnAvailabilitySchedule)}
                                                                            
                                                                            onChange={v=>{
                                                                                console.log('timer open changed ', v);
                                                                                this.valueChangeForOpenHour(index ,indexOnAvailabilitySchedule, v);
                                                                            }}
                                                                            />
                                                                        </Form.Item>
                                                                    </Col>
                                                                    <Col xs={24} sm={24} md={12} className={indexOnAvailabilitySchedule === 0 ? '' : 'item-remove'}>
                                                                        <Form.Item name={[field.name, "close_time",scheduleItem.uid]}>
                                                                            <TimePicker 
                                                                            name={`timer_1${scheduleItem.uid}`}
                                                                            onChange={v=>{
                                                                                console.log('timer 2 changed ', v);
                                                                                this.valueChangeForCloseHour(index,indexOnAvailabilitySchedule,v);
                                                                            }}
                                                                            value={this.valueForAvailabilityScheduleCloseHour(index, indexOnAvailabilitySchedule)}
                                                                            use12Hours 
                                                                            format="h:mm a" 
                                                                            placeholder={intl.formatMessage(messages.to)} 
                                                                            />
                                                                        </Form.Item>
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
                                                        this.addNewTimeRange(index , this.state.currentDaySelecting[index]);
                                                    }}>
                                                        <BsPlusCircle size={17} className='mr-5 text-primary' />
                                                        <a className='text-primary'>{intl.formatMessage(messages.addTimeRange)}</a>
                                                    </div>
                                                    <div className='text-right div-copy-week'  onClick={() => {
                                                        this.copyToFullWeek(index , this.state.currentDaySelecting[index]);
                                                    }}>
                                                        <a className='font-10 underline text-primary'>{intl.formatMessage(messages.copyFullWeek)}</a>
                                                        <QuestionCircleOutlined className='text-primary' />
                                                    </div>
                                                </div>
                                            </div>
                                            {index == 0 && this.state.studentInfos.length>1&&<div className='flex flex-row items-center'>
                                                <Switch size="small" checked={isSameAll} onChange={this.onSameAllDependent} />
                                                <p className='ml-10 mb-0'>{intl.formatMessage(messages.sameAllDependents)}</p>
                                            </div>}
                                            
                                           
                                        </div>
                                    )}
                                    )
                                    }
                                </>
                            )}
                        </Form.List>
                        {/* List of Availability Schedule End */}
                        <Form.Item className="form-btn continue-btn" >
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
            </Row >
        );
    }
}

const mapStateToProps = state => ({
    register: state.register,
})

export default compose(connect(mapStateToProps, { setRegisterData }))(InfoProgress);