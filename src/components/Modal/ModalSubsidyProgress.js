import React from 'react';
import { Modal, Button, Divider, Steps, Row, Col, Select, Input} from 'antd';
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

    clearData = () =>{
        this.setState({
            subsidy:{},
            providers:[],
            selectedProviders:[],
            isDisableSchoolFields:false,
            decisionExplanation:"",
            isFiredButton:false,
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

    schoolAcceptSubsidy(subsidy){
        if(this.state.selectedProviders.length == 0 || this.state.decisionExplanation.length == 0) return;
        request.post('schools/accept_subsidy_request',{
            "subsidyId":subsidy._id ,
            "student": subsidy.student._id,
            "providers": this.state.selectedProviders, 
            "decisionExplanation":this.state.decisionExplanation,
        }).then(result=>{
            console.log('accept_subsidy_request' , result)
            if(result.success){
                this.loadSubsidyData(subsidy._id , false);
                
            }else{

            }
        }).catch(err=>{
            
        })
    }

    openHierachy(subsidy){
        this.props.openHierachy&&this.props.openHierachy(subsidy);
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
        return (<div className='flex flex-row items-center'>
            {subsidy.status == 0 && <Button 
                onClick={()=>{this.schoolDenySubsidy(subsidy)}}
                size='small' className='mr-10'>{intl.formatMessage(messages.decline).toUpperCase()}</Button> }
            {subsidy.status == 0 && <Button
                onClick={()=>{this.schoolAcceptSubsidy(subsidy)}}
                size='small' type='primary'>{intl.formatMessage(messages.approve).toUpperCase()}</Button>}
            
            {subsidy.status == 1 && !subsidy.hierachy && <Button
                onClick={()=>{this.openHierachy(subsidy)}}
                size='small' type='primary'>{'Hierachi'.toUpperCase()}</Button>}
            
        </div>)

        
    }

    renderSchoolInfo = (subsidy)=>{
        if(this.props.userRole == 60 ){
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
                            onChange={v=>{
                                console.log('on dropdown changed',v);
                                this.setState(prevState => ({
                                    selectedProviders: {
                                        ...prevState.selectedProviders,
                                        [prevState.selectedProviders[index].name]: v,
                                    },
                                }));
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
                        onChange={v=>{
                            this.setState({decisionExplanation: v.target.value});
                        }}
                        rows={5} placeholder={intl.formatMessage(msgRequest.generalNotes)}/>
                </Col>
            </Row>
        </div>)
        }
    }

    renderConsulation(subsidy){
        if(subsidy.adminApprovalStatus == 2){
            return (<div className='consulation-appoint'>
            <Row gutter={15} align='bottom'>
                <Col xs={24} sm={24} md={10}>
                    <p className='font-20 font-700'>{intl.formatMessage(messages.consulationAppointment)}</p>
                    <p className='font-700'>{intl.formatMessage(messages.consultant)}: <span className='text-uppercase'>Name Here</span></p>
                </Col>
                <Col xs={24} sm={24} md={14}>
                    <div className='flex flex-row justify-between'>
                        <p><span className='font-700'>Google Meet</span>: <a>meet.google.com/sdf-sasd-gdh</a></p>
                        <div className='flex flex-row items-center'>
                            <p className='text-primary'><FaRegCalendarAlt/>{intl.formatMessage(messages.reSchedule)}</p>
                        </div>
                    </div>
                    <div className='flex flex-row justify-between'>
                        <p><span className='font-700'>{intl.formatMessage(messages.dateTime)}</span>: 12/23/2022 | 7:30pm</p>
                        <p><span className='font-700'>{intl.formatMessage(messages.phone)}</span>: 0749072340</p>
                    </div>
                </Col>
            </Row>
        </div>)
        }
    }

    renderDecision(subsidy){
        <div className='subsidy-detail'>
            <div className='flex flex-row justify-between'>
                <p className='font-20 font-700'>{intl.formatMessage(messages.subsidyDetails)}</p>
                <div className='flex flex-row items-center'>
                    <p className='text-primary'><ImPencil/>{intl.formatMessage(messages.edit)}</p>
                </div>
            </div>
            <Row gutter={15}>
                <Col xs={24} sm={24} md={8}>
                    <p><span className='font-700'>{intl.formatMessage(msgCreateAccount.provider)}</span>: <span className='text-uppercase'>Name Here</span></p>
                </Col>
                <Col xs={24} sm={24} md={8}>
                    <p><span className='font-700'>{intl.formatMessage(messages.numberApprovedSessions)}</span>: 20</p>
                </Col>
                <Col xs={24} sm={24} md={8} className='text-right sm-text-left'>
                    <p><span className='font-700'>{intl.formatMessage(messages.totalRemaining)}</span>: 8</p>
                </Col>
            </Row>
        </div>
    }

    renderSubsidyData(subsidy){
        if(!subsidy.student){
            return (<div>Loading...</div>)
        }
        return (<div className="steps-content mt-1">
        {this.renderStudentParentInfo(subsidy)}
        {this.renderSchoolInfo(subsidy)}
        {this.renderConsulation(subsidy)}
        {this.renderConsulation(subsidy)}
        
        
        
    
    </div>)
    }

    

    checkCurrentStep = (subsidy) =>{
        if(subsidy.status == 2){
            if(!!subsidy.adminApprovalStatus ){
                return 3;
            }
            return 2;
        }else if(subsidy.status == -2){
            return 1;
        }else{
            return 0;
        }
    }

    footerButton(){
        
        if(this.state.subsidy.status == -2 || this.state.subsidy.status == 2){
            return [
                <Button key="back" onClick={this.props.onCancel}>
                    {intl.formatMessage(messages.decline).toUpperCase()}
                </Button>,
                <Button key="submit" type="primary" onClick={this.props.onSubmit} style={{padding: '7.5px 30px'}}>
                    {intl.formatMessage(messages.approve).toUpperCase()}
                    {/* {intl.formatMessage(messages.appeal).toUpperCase()} */}
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
                        {subsidy.status == 2&&<p className='text-green500 font-24 font-700 ml-auto'>{intl.formatMessage(msgDashboard.approved)}</p>}
                        {subsidy.status==-2&& <p className='text-red font-24 font-700 ml-auto'>{intl.formatMessage(msgDashboard.declined)}</p>}
                        
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