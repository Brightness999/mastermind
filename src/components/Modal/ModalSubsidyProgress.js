import React from 'react';
import { Modal, Button, Divider, Steps, Row, Col, Select, Input, DatePicker,message} from 'antd';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { ImPencil } from 'react-icons/im';
import { ModalNewGroup } from '../Modal'
import intl from 'react-intl-universal';
import messages from './messages';
import msgCreateAccount from '../../routes/Sign/CreateAccount/messages';
import msgDashboard from '../../routes/Dashboard/messages';
import msgDrawer from '../../components/DrawerDetail/messages';
import msgReview from '../../routes/Sign/SubsidyReview/messages';
import msgRequest from '../../routes/Sign/SubsidyRequest/messages';
import './style/index.less';
import '../../assets/styles/login.less';
import request,{generateSearchStructure} from '../../utils/api/request'
import {url , switchPathWithRole} from '../../utils/api/baseUrl'
import moment from 'moment';

const { Step } = Steps;

const arrMeetSolution = [
    'Google meet',
    'Zoom',
    'Direction',
]

class ModalSubsidyProgress extends React.Component {
    state = {
        currentStep: 2,
        isApproved: true,
        subsidy:{},
        providers:[],
        selectedProviders:[],
        isDisableSchoolFields:false,
        decisionExplanation:"",
        isFiredButton:false,
        isScheduling:false,
        consulationName:'',
        meetSolution:undefined,
        meetLocation:undefined,
        consulationDate:undefined,
        consulationTime:undefined,
        consulationPhoneNumber:undefined,
        selectedDate: moment(),
        selectedHour: undefined,
        selectProviderFromAdmin:undefined,
        numberOfSessions:undefined,
        priceForSession:undefined,
        parentWarning:'',
        consulationWarning:'',
        referral:{},
    }

    componentDidMount = () => {
        this.props.setOpennedEvent(this.loadData)
    }

    loadData = (subsidyId) =>{
        this.clearData();
        this.loadSubsidyData(subsidyId);
    }

    loadSubsidyData = (subsidyId , isNeedLoadSchool=true)=>{
        
        request.post(switchPathWithRole(this.props.userRole)+'get_subsidy_detail' , {subsidyId:subsidyId}).then(result=>{
            console.log('get_subsidy_detail', result);
            if(result.success){
                this.setState({subsidy: result.data});
                if(!!result.data.providers&&result.data.providers.length>0){
                    console.log(result.data.providers)
                    this.setState({selectedProviders:result.data.providers});
                }
                if(!!result.data.decisionExplanation &&result.data. decisionExplanation.length >0){
                    console.log(result.data.decisionExplanation)
                    this.setState({decisionExplanation:result.data.decisionExplanation});
                }

                // set consulation
                // if(!!result.data.consulation){
                //     console.log('consulation',result.data.consulation)
                //     var consulation= result.data.consulation;
                //     var _moment = moment( consulation.date);
                //     var date = _moment.clone();
                //     var hour = _moment.format('HH:mm');
                //     console.log(date, hour)
                //     this.setState({
                //         consulationName:consulation.name,
                //         meetSolution:consulation.typeForAppointLocation,
                //         meetLocation:consulation.location,
                //         consulationDate:date,
                //         consulationTime:hour,
                //         selectedDate: date,
                //         selectedHour: hour,
                //         consulationPhoneNumber:consulation.phoneNumber,
                //     })
                // }

                if(!!result.data.selectedProvider){
                    this.setState({
                        selectProviderFromAdmin:result.data.selectedProvider,
                        numberOfSessions:result.data.numberOfSessions,
                        priceForSession:result.data.priceForSession,
                    })
                }

                this.loadLastReferral();

                if(isNeedLoadSchool){
                    this.loadProvidersInSchool(result.data.school._id);
                    
                }
                
                
            }else{
                this.props.onCancel();
            }
        }).catch(err=>{
            this.props.onCancel();
        })
    }

    loadProvidersInSchool = (schoolId)=>{
        this.setState({providers:[]});
        request.post('schools/get_all_provider_in_school',{schoolId:schoolId}).then(result=>{
            if(result.success){
                console.log('get_all_provider_in_school',result.data)
                this.setState({providers: result.data});
                
            }else{
                this.props.onCancel();
            }
        }).catch(err=>{
            this.setState({providers:[]});
        })
    }

    loadLastReferral = () =>{
        this.setState({referral:{}});
        console.log('sub id ' , this.state.subsidy._id);
        request.post('schools/get_last_consulation',{subsidyId:this.state.subsidy._id}).then(result=>{
            if(result.success){
                console.log('get_last_consulation',result.data)
                this.setState({referral: result.data});
                
            }else{
                this.setState({referral:{}});
            }
        }).catch(err=>{
            this.setState({referral:{}});
        })
    }

    clearData = () =>{
        this.setState({
            subsidy:{},
            providers:[],
            selectedProviders:[],
            isDisableSchoolFields:false,
            decisionExplanation:"",
            isFiredButton:false,
            isScheduling:false,
            consulationName:'',
            meetSolution:undefined,
            meetLocation:undefined,
            consulationDate:undefined,
            consulationTime:undefined,
            consulationPhoneNumber:undefined,

            selectProviderFromAdmin:undefined,
            numberOfSessions:undefined,
            priceForSession:undefined,
            referral: {},
        });

    }

    schoolDenySubsidy(subsidy){
        
        request.post('schools/deny_subsidy_request', {subsidyId:subsidy._id }).then(result=>{
            if(result.success){
                this.loadSubsidyData(subsidy._id , false);
            }else{

            }
        }).catch(err=>{
            
        })
    }

    adminDenySubsidy(subsidy){
        
        request.post(switchPathWithRole(this.props.userRole) + 'deny_subsidy_request', {subsidyId:subsidy._id }).then(result=>{
            if(result.success){
                this.loadSubsidyData(subsidy._id , false);
            }else{

            }
        }).catch(err=>{
            
        })
    }

    schoolAcceptSubsidy(subsidy){
        if(this.state.selectedProviders.length == 0 || this.state.decisionExplanation.length == 0){
            this.setState({parentWarning:'Please suggest a provider and fill in decision explaintion'})
            return;
        }
        this.setState({parentWarning:''})
        request.post('schools/accept_subsidy_request',{
            "subsidyId":subsidy._id ,
            "student": subsidy.student._id,
            "providers": this.state.selectedProviders, 
            "decisionExplanation":this.state.decisionExplanation,
        }).then(result=>{
            console.log('accept_subsidy_request' , result)
            message.success('Approved successfully');
            if(result.success){
                this.loadSubsidyData(subsidy._id , false);
                
            }else{

            }
        }).catch(err=>{
            
        })
    }

    // createConsulation(subsidy){
    //     if(!this.state.consulationName || !this.state.selectedHour || !this.state.consulationPhoneNumber || !this.state.consulationPhoneNumber
    //         || !this.state.consulationPhoneNumber.length <1
    //         ||this.state.meetSolution == undefined
    //         ){
    //             message.error('please fill all reuired field');
    //         return;
    //     }
    //     if(!!subsidy.consulation){
    //         this.editConsulation(subsidy);return;
    //     }
    //     var str = this.state.selectedDate.format("DD/MM/YYYY")+ " " + this.state.selectedHour;
    //     // console.log(str)
    //     var _selectedDay = moment(str , 'DD/MM/YYYY hh:mm' ).valueOf();
    //     var postData = {
    //         "subsidyId":subsidy._id ,
    //         "dependent": subsidy.student._id,
    //         "skillSet":subsidy.skillSet,
    //         "school":subsidy.school._id,
    //         "name":this.state.consulationName,
    //         "typeForAppointLocation":this.state.meetSolution,
    //         "location":this.state.meetLocation,
    //         "date":_selectedDay,
    //         "phoneNumber": this.state.consulationPhoneNumber,
    //     };
        
    //     // console.log(postData);return;
    //     request.post(switchPathWithRole(this.props.userRole)+'create_consulation_to_subsidy',postData).then(result=>{
    //         console.log('create_consulation_to_subsidy' , result)
    //         if(result.success){
    //             this.loadSubsidyData(subsidy._id , false);
    //             this.setState({isScheduling:false , consulationWarning:''});
    //         }else{

    //         }
    //     }).catch(err=>{
            
    //     })
    // }

    // editConsulation(subsidy){
    //     if(!this.state.consulationName || !this.state.selectedHour || !this.state.consulationPhoneNumber || !this.state.consulationPhoneNumber
    //         || !this.state.consulationPhoneNumber.length <1
    //         ||this.state.meetSolution == undefined
    //         ){
    //             message.error('please fill all reuired field');
    //         return;
    //     }
    //     var str = this.state.selectedDate.format("DD/MM/YYYY")+ " " + this.state.selectedHour;
    //     // console.log(str)
    //     var _selectedDay = moment(str , 'DD/MM/YYYY hh:mm' ).valueOf();
    //     var postData = {
    //         "consulationId": subsidy.consulation._id,
    //         "name":this.state.consulationName,
    //         "typeForAppointLocation":this.state.meetSolution,
    //         "location":this.state.meetLocation,
    //         "date":_selectedDay,
    //         "phoneNumber": this.state.consulationPhoneNumber,
    //     }
    //     console.log(postData);
    //     request.post(switchPathWithRole(this.props.userRole)+'change_consulation',postData).then(result=>{
    //         console.log('change_consulation' , result)
    //         if(result.success){
    //             this.loadSubsidyData(subsidy._id , false);
    //             this.setState({isScheduling:false, consulationWarning:''});
    //         }else{

    //         }
    //     }).catch(err=>{
            
    //     })
    // }

    submitSubsidyFromAdmin =(subsidy)=>{
        var postData = {
            "selectedProvider": this.state.selectProviderFromAdmin,
            "numberOfSessions":this.state.numberOfSessions,
            "priceForSession": this.state.priceForSession,
            "subsidyId": subsidy._id,
            "student": subsidy.student._id,
            "school": subsidy.school._id,
        }
        if(!this.state.selectProviderFromAdmin || !this.state.numberOfSessions || !this.state.priceForSession){
            message.error('please fill all reuired field');
            return;
        }
        request.post(switchPathWithRole(this.props.userRole)+'select_final_provider_for_subsidy',postData).then(result=>{
            console.log('select_final_provider_for_subsidy' , result)
            if(result.success){
                this.loadSubsidyData(subsidy._id , false);
                this.setState({isScheduling:false});
            }else{

            }
        }).catch(err=>{
            
        })
    }

    appealSubsidy = () =>{
        var postData = {
            subsidyId: this.state.subsidy._id
        }
        request.post('clients/appeal_subsidy',postData).then(result=>{
            console.log('appeal_subsidy' , result)
            message.success('Your appeal has been sent successfully');
            if(result.success){
                this.loadSubsidyData(subsidy._id , false);
                this.setState({isScheduling:false});
            }else{

            }
        }).catch(err=>{
            
        })
    }

    openHierachy(subsidy){
        !!this.props.openHierachy&&this.props.openHierachy(subsidy , this.callbackHierachy);
    }

    openReferral(){
        !!this.props.openReferral&& this.props.openReferral(subsidy , this.callbackReferral );
    }

    callbackHierachy = (hierachyId) =>{
        console.log('this callback call from hierachy')
        const {subsidy} = this.state;
        subsidy.hierachy = hierachyId
        this.setState({subsidy:subsidy});
    }

    callbackReferral(appoiment){
        this.loadLastReferral();
        // consulationDate:undefined,
        // consulationTime:undefined,
        // consulationPhoneNumber:undefined,
    }

    nextStep = () => {
        this.setState({currentStep: this.state.currentStep + 1});
        console.log("Step", this.state.currentStep)
    };
    
    prevStep = () => {
        this.setState({currentStep: this.state.currentStep - 1});
    };
    handleContinue = () => {
        // if(this.state.currentStep <= 2) {
        //   this.nextStep();
        // } else {
        //   this.openModalCreateDone();
        // }
        if(this.state.currentStep <= 4) {
          this.nextStep();
        } 
        // else {
        //   window.location.href="/login";
        // }
    }
    
    getSkillSetName(value){
        return this.props.SkillSet[value];
    }

    getFileName(path){
        return path.replace(/^.*[\\\/]/, '')
    }

    getFileUrl(path){
        return url+'uploads/'+path;
    }

    denyAppeal = (subsidy)=>{
        var postData = {
            subsidyId: this.state.subsidy._id
        }
        request.post('schools/deny_appeal_subsidy',postData).then(result=>{
            console.log('deny_appeal_subsidy' , result)
            message.success('Denied successfully');
            if(result.success){
                this.loadSubsidyData(subsidy._id , false);
            }else{

            }
        }).catch(err=>{
            
        })
    }
    
    renderStudentParentInfo(subsidy){
        const {student,documents} = subsidy;
        return (<div className='parent-info'>
        <p className='font-20 font-700'>{intl.formatMessage(messages.parentInformation)}</p>
        <Row gutter={15}>
            <Col xs={24} sm={24} md={12}>
                <p className='font-700'>{intl.formatMessage(msgReview.dependentInfo)}</p>
                <div className='count-2'>
                    <p className='font-12'>Dependent:<b>{student.firstName} {student.lastName}</b></p>
                    <p className='font-12'>School: {student.school.name}</p>
                    <p className='font-12'>Skillset(s): {this.getSkillSetName(subsidy.skillSet)} </p>
                    <div className='count-2'>
                        <p className='font-12'>Age: {moment().diff(student.birthday, 'years',false)}</p>
                        <p className='font-12'>Grade: {student.currentGrade}</p>
                    </div>
                    <p className='font-12'>Teacher: {student.primaryTeacher}</p>
                </div>
            </Col>
            <Col xs={24} sm={24} md={12}>
                <p className='font-700'>{intl.formatMessage(msgReview.otherCcontacts)}</p>
                    <div className='count-2'>
                        <p className='font-12'>Rav name: {subsidy.ravName}</p>
                        <p className='font-12'>Rav phone: {subsidy.ravPhone}</p>
                        <p className='font-12'>Rav email: {subsidy.ravEmail}</p>
                        <p className='font-12'>Therapist name: {subsidy.therapistContact}</p>
                        <p className='font-12'>Therapist phone: {subsidy.therapistPhone}</p>
                        <p className='font-12'>Therapist email: {subsidy.therapistEmail}</p>
                    </div>
            </Col>
        </Row>
        <Divider style={{margin: '12px 0', borderColor: '#d7d7d7'}}/>
        {!!documents&&documents.length>0&&<Row gutter={15}>
            <Col xs={24} sm={24} md={12}>
                <p className='font-700'>{intl.formatMessage(messages.subsidyNotes)}</p>
                <p className='font-12'>{subsidy.note}</p>
            </Col>
            <Col xs={24} sm={24} md={12}>
                <p className='font-700'>{intl.formatMessage(msgRequest.documents)}</p>
                {documents.map((document,index )=>{
                    return <a href={this.getFileUrl(document)} className='font-12'>{this.getFileName(document)}</a>
                })}
            </Col>
        </Row>}
    </div>)
    }

    renderButtonsForSchoolInfo(subsidy){
        if(this.props.userRole == 3){
            return;
        }
        if(subsidy.isAppeal &&(subsidy.status == -1||subsidy.adminApprovalStatus == -1)){
            return (<div>
            <div className='flex flex-row items-center'>
            <p>User has sent appeal for this, please choose an action </p>
            </div>
            <div className='flex flex-row items-center'>
            <Button 
                onClick={()=>{this.denyAppeal(subsidy)}}
                size='small' className='mr-10'>{intl.formatMessage(messages.decline).toUpperCase()}</Button>
            <Button
                onClick={()=>{this.schoolAcceptAcceptSubsidy(subsidy)}}
                size='small' type='primary'>{intl.formatMessage(messages.approve).toUpperCase()}</Button>
            
            </div>
        </div>)
        }
        return (<div>
            {this.state.parentWarning.length>0&&<div className='flex flex-row items-center'>
            <p>{this.state.parentWarning}</p>
            </div>}
            <div className='flex flex-row items-center'>
            {subsidy.status == 0 && <Button 
                onClick={()=>{this.schoolDenySubsidy(subsidy)}}
                size='small' className='mr-10'>{intl.formatMessage(messages.decline).toUpperCase()}</Button> }
            {subsidy.status == 0 && <Button
                onClick={()=>{this.schoolAcceptSubsidy(subsidy)}}
                size='small' type='primary'>{intl.formatMessage(messages.approve).toUpperCase()}</Button>}
            
            {subsidy.status == 1 && !subsidy.hierachy && <Button
                onClick={()=>{this.openHierachy(subsidy)}}
                size='small' type='primary'>{'Hierachi'.toUpperCase()}</Button>}
            
        </div></div>)

        
    }

    renderButtonsForConsulation(subsidy){
        
        return (<div className='flex flex-row items-center'>
            {(this.state.isScheduling||subsidy.consulation == undefined) && <Button 
                onClick={()=>{this.createConsulation(subsidy)}}
                size='small' className='mr-10'>Schedule</Button> }
            
        </div>)

        
    }

    renderButtonsForDecision(subsidy){
        if(this.props.userRole > 800){
            return (<div className='flex flex-row items-center'>
                <Button 
                    onClick={()=>{this.adminDenySubsidy(subsidy)}}
                    size='small' className='mr-10'>DECLINE</Button>
                <Button
                    onClick={()=>{this.submitSubsidyFromAdmin(subsidy)}}
                    size='small' type='primary'>APPROVE</Button>
            </div>)
        }
        

        
    }



    renderSchoolInfo = (subsidy)=>{
        
        return (<div className='school-info'
            >
            <div className='flex flex-row justify-between'>
                <p className='font-20 font-700'>{intl.formatMessage(messages.schoolInformation)}</p>
                {this.renderButtonsForSchoolInfo(subsidy)}
            </div>
            <Row gutter={15}>
                <Col xs={24} sm={24} md={8}>
                    <p className='font-700 mb-10'>{intl.formatMessage(messages.recommendedProviders)}</p>
                    <div className='select-md'>
                        {[0,1,2,].map((_,index)=>{
                            return <Select 
                            value={this.state.selectedProviders[index]}
                            disabled={this.state.subsidy.status == 1|| this.state.subsidy.status == -1}
                            onChange={v=>{
                                console.log('on dropdown changed',v);
                                const {selectedProviders} = this.state;
                                selectedProviders[index] = v;
                                this.setState({selectedProviders: selectedProviders});
                            }}
                            className='mb-10' 
                            placeholder={intl.formatMessage(msgCreateAccount.provider)}
                            >
                                {this.state.providers.map((provider) =>{
                                    return (<Select.Option value={provider._id}>{provider.name||provider.referredToAs}</Select.Option>);
                                }) }
                            </Select>
                        })}
                    </div>
                </Col>
                <Col xs={24} sm={24} md={16}>
                    <p className='font-700 mb-10'>{intl.formatMessage(messages.decisionExplanation)}</p>
                    <Input.TextArea 
                    value={this.state.decisionExplanation}
                    disabled={this.state.subsidy.status == 1|| this.state.subsidy.status == -1}
                        onChange={v=>{
                            this.setState({decisionExplanation: v.target.value});
                        }}
                        rows={5} placeholder={intl.formatMessage(msgRequest.generalNotes)}/>
                </Col>
            </Row>
        </div>)
        
    }

    renderConsulation = (subsidy) =>{
        const {referral} = this.state;
        if(subsidy.status == 1){
            
            return (<div className='consulation-appoint'>
                {/* <div className='flex flex-row justify-between'>
                <p className='font-20 font-700 mb-10'>{intl.formatMessage(messages.consulationAppointment)}</p>
                {this.renderButtonsForConsulation(subsidy)}
            </div> */}
                {/* {(!subsidy.consulation||this.state.isScheduling)&&<Row gutter={20} align='bottom'>
                <Col xs={24} sm={24} md={10}>
                    
                    <Input placeholder='name of consulation' className='mb-10'
                    value={this.state.consulationName}
                    onChange={v=>{this.setState({consulationName:v.target.value})}}
                    />
                    <div className='flex flex-row select-md picker-md'>
                        <DatePicker placeholder='Date of consulation' className='mr-10 flex-1'
                        value={this.state.selectedDate}
                        onChange={v=>{
                            this.setState({selectedDate:v})
                        }}
                         />
                        <Select placeholder='Time'
                        value={this.state.selectedHour}
                        onChange={v=>{
                            this.setState({selectedHour:v});
                        }}
                        className='flex-1'>
                            <Select.Option value='9:00'>9:30am</Select.Option>
                            <Select.Option value='9:30'>9:30am</Select.Option>
                            <Select.Option value='10:30'>10:30am</Select.Option>
                            <Select.Option value='11:00'>11:00am</Select.Option>
                            <Select.Option value='11:30'>11:30am</Select.Option>
                            <Select.Option value='13:30'>1:30pm</Select.Option>
                            <Select.Option value='14:00'>2:00pm</Select.Option>
                            <Select.Option value='14:30'>2:30pm</Select.Option>
                            <Select.Option value='15:00'>3:00pm</Select.Option>
                            <Select.Option value='15:30'>3:30pm</Select.Option>
                            <Select.Option value='16:00'>4:00pm</Select.Option>
                            <Select.Option value='16:30'>4:30pm</Select.Option>
                            <Select.Option value='17:00'>5:00pm</Select.Option>
                        </Select>
                    </div>
                </Col>
                <Col xs={24} sm={24} md={14}>
                    <div className='flex flex-row justify-between'>
                        <p><span className='font-700'>Meet Solution</span>: </p>
                        <div className='mb-10 flex flex-row w-70 select-md'>
                            <Select 
                                // value={this.state.selectedProviders[index]}
                                // disabled={this.state.subsidy.status == 1|| this.state.subsidy.status == -1}
                                onChange={v=>{
                                    // console.log('on dropdown changed',v);
                                    // const {selectedProviders} = this.state;
                                    // selectedProviders[index] = v;
                                    // this.setState({selectedProviders: selectedProviders});
                                    this.setState({meetSolution:v})
                                }}
                                value={this.state.meetSolution}
                                className='mr-10' 
                                placeholder='Meet Solution'
                            >
                                {arrMeetSolution.map((value, index)=><Select.Option value={index}>{value}</Select.Option>)}
                            </Select>
                            <Input placeholder='address or url'
                            value={this.state.meetLocation}
                            onChange={v=>{this.setState({meetLocation: v.target.value})}}
                            />
                        </div>
                    </div>
                    <div className='flex flex-row justify-between'>
                        <p><span className='font-700'>Phone Number</span>: </p>
                        <div className='w-70'>
                            <Input placeholder='phone number'
                            value={this.state.consulationPhoneNumber}
                            onChange={v=>{this.setState({consulationPhoneNumber:v.target.value})}}
                            />
                        </div>
                    </div>
                </Col>
            </Row>}
            {(!!subsidy.consulation&&!this.state.isScheduling)&&<Row gutter={15} align='bottom'>
                <Col xs={24} sm={24} md={10}>
                    <p className='font-20 font-700'>{intl.formatMessage(messages.consulationAppointment)}</p>
                    <p className='font-700'>{intl.formatMessage(messages.consultant)}: <span className='text-uppercase'>{this.state.consulationName}</span></p>
                </Col>
                <Col xs={24} sm={24} md={14}>
                    <div className='flex flex-row justify-between'>
                        <p><span className='font-700'>{arrMeetSolution[this.state.meetSolution??0]}</span>: <a>{this.state.meetLocation}</a></p>
                        <div className='flex flex-row items-center'>
                            <a className='text-primary'
                            onClick={()=>{
                                this.setState({isScheduling:true})
                            }}
                            ><FaRegCalendarAlt/>{intl.formatMessage(messages.reSchedule)}</a>
                        </div>
                    </div>
                    <div className='flex flex-row justify-between'>
                        <p><span className='font-700'>{intl.formatMessage(messages.dateTime)}</span>: {moment(this.state.selectedDate).format('YYYY-MM-DD') } | {this.state.selectedHour}</p>
                        <p><span className='font-700'>{intl.formatMessage(messages.phone)}</span>: {this.state.consulationPhoneNumber}</p>
                    </div>
                </Col>
                </Row>} */}

                <Col xs={24} sm={24} md={10}>
                    <p className='font-20 font-700'>{intl.formatMessage(messages.consulationAppointment)}</p>
                    {/* <p className='font-700'>{intl.formatMessage(messages.consultant)}: <span className='text-uppercase'>{this.state.consulationName}</span></p> */}
                </Col>
                <Col xs={24} sm={24} md={14}>
                    <div className='flex flex-row justify-between'>
                        <p><span className='font-700'>{referral.typeForAppointLocation!=undefined? arrMeetSolution[referral.typeForAppointLocation]:''}</span>: <a>{referral.location}</a></p>
                        <div className='flex flex-row items-center'>
                            <a className='text-primary'
                            onClick={()=>{
                                !!this.props.openReferral&&this.props.openReferral(this.state.subsidy , this.loadLastReferral);
                            }}
                            ><FaRegCalendarAlt/>{intl.formatMessage(messages.reSchedule)}</a>
                        </div>
                    </div>
                    <div className='flex flex-row justify-between'>
                        <p><span className='font-700'>{intl.formatMessage(messages.dateTime)}</span>: {referral.date!=undefined?moment(referral.date).format('YYYY-MM-DD'):'' } | {referral.date!=undefined?moment(referral.date).format('HH:mm A'):'' }</p>
                        <p><span className='font-700'>{intl.formatMessage(messages.phone)}</span>: {referral.phoneNumber}</p>
                    </div>
                </Col>
        </div>)
        
        }
    }
    
    renderDecision(subsidy){
        var isNotAdmin = this.props.userRole <800
        if(isNotAdmin && subsidy.adminApprovalStatus != 1){
            return;
        }
        return (
            <div className='subsidy-detail'>
                <div className='flex flex-row justify-between'>
                    <p className='font-20 font-700'>{intl.formatMessage(messages.subsidyDetails)}</p>
                    {this.renderButtonsForDecision(subsidy)}
                </div>
                <Row gutter={15}>
                    <Col xs={24} sm={24} md={8}>
                        <p className='font-700'>{intl.formatMessage(msgCreateAccount.provider)}:</p>
                        <Select 
                            disabled={isNotAdmin}
                            value={this.state.selectProviderFromAdmin}
                            onChange={v=>{
                                this.setState({selectProviderFromAdmin: v});
                            }}
                            className='mb-10' 
                            placeholder={intl.formatMessage(msgCreateAccount.provider)}
                            >
                                {this.state.providers.map((provider) =>{
                                    return (<Select.Option value={provider._id}>{provider.name||provider.referredToAs}</Select.Option>);
                                }) }
                            </Select>
                       
                    </Col>
                    <Col xs={24} sm={24} md={8}>
                        <p className='font-700'>{intl.formatMessage(messages.numberApprovedSessions)}:</p>
                        <Input
                        disabled={isNotAdmin}
                        value={this.state.numberOfSessions}
                        type="number"
                        onChange={v=>{this.setState({numberOfSessions: v.target.value})}}
                        />
                    </Col>
                    <Col xs={24} sm={24} md={8}>
                        <p className='font-700'>{intl.formatMessage(messages.totalRemaining)}:</p>
                        <Input
                        value={this.state.priceForSession}
                        type="number"
                        onChange={v=>{this.setState({priceForSession: v.target.value})}}
                        disabled={isNotAdmin}
                        />
                    </Col>
                </Row>
            </div>
        )
    }

    renderSubsidyData(subsidy){
        if(!subsidy.student){
            return (<div>Loading...</div>)
        }
        return (<div className="steps-content mt-1">
        {this.renderStudentParentInfo(subsidy)}
        {this.renderSchoolInfo(subsidy)}
        {this.renderConsulation(subsidy)}
        {this.renderDecision(subsidy)}
        
        
        
    
    </div>)
    }

    

    checkCurrentStep = (subsidy) =>{
        if(subsidy.status == 1){
            if(!!subsidy.adminApprovalStatus ){
                return 3;
            }
            return 2;
        }else if(subsidy.status == -1){
            return 1;
        }else{
            return 0;
        }
    }

    footerButton(){
        
        if((this.state.subsidy.status == -1 || this.state.subsidy.adminApprovalStatus == -1) && this.props.userRole==3  ){
            return [
                <Button key="back" onClick={this.props.onCancel}>
                    CLOSE
                </Button>,
                <Button 
                disabled={this.state.subsidy.isAppeal!=0}
                key="submit" type="primary" onClick={this.appealSubsidy} style={{padding: '7.5px 30px'}}>
                    {/* {intl.formatMessage(messages.approve).toUpperCase()} */}
                    {intl.formatMessage(messages.appeal).toUpperCase()}
                </Button>
            ]
        }
        return [
                
        ]
    }
    
    render() {
        const {subsidy} = this.state;
        const modalProps = {
            className: 'modal-subsidy-progress',
            title: "",
            visible: this.props.visible,
            onOk: this.props.onSubmit,
            onCancel: this.props.onCancel,
            closable: false,
            width: 900,
            footer: this.footerButton(),
        };
       
        const { currentStep, isApproved } = this.state;
        return(
            <Modal {...modalProps}>
                <div className='flex flex-row mb-20'>
                    <div style={{width: 110}}/>
                    <div className='flex-1 text-center'>
                        <p className='font-30 font-30-sm'>{intl.formatMessage(messages.subsidyProgress)}</p>
                    </div>
                    {subsidy.status!=0 && <div style={{width: 110, textAlign: 'right'}}>
                        {subsidy.status == 1&& subsidy.adminApprovalStatus!=-1&&<p className='text-green500 font-24 font-700 ml-auto'>{intl.formatMessage(msgDashboard.approved)}</p>}
                        {(subsidy.status==-1 || subsidy.adminApprovalStatus==-1)&& <p className='text-red font-24 font-700 ml-auto'>{intl.formatMessage(msgDashboard.declined)}</p>}
                        
                    </div>}
                </div>
                <div className={subsidy.status !=-2 ? '' : 'step-declined'}>
                    <Steps current={this.checkCurrentStep(subsidy)} responsive={false} style={{maxWidth: 600}}>
                        <Step key='request' title={intl.formatMessage(messages.request)} icon={<p>1</p>}/>
                        <Step key='school' title={intl.formatMessage(msgCreateAccount.school)} icon={<p>2</p>}/>
                        <Step key='consultation' title={intl.formatMessage(messages.consultation)} icon={<p>3</p>}/>
                        <Step key='decision' title={intl.formatMessage(messages.decision)} icon={<p>4</p>}/>
                    </Steps>
                </div>
                {/* {currentStep === 0 && <div className="steps-content"></div>}
                {currentStep === 1 && <div className="steps-content"></div>}
                {currentStep === 2 && <div className="steps-content"></div>}
                {currentStep === 3 && <div className="steps-content"></div>} */}

                {this.renderSubsidyData(subsidy)}
            </Modal>
        );
    }
};
export default ModalSubsidyProgress;