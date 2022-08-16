import React from 'react';
import { Modal, Button, Divider, Steps, Row, Col, Select, Input} from 'antd';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { ImPencil } from 'react-icons/im';
import intl from 'react-intl-universal';
import messages from './messages';
import msgCreateAccount from '../../routes/Sign/CreateAccount/messages';
import msgDashboard from '../../routes/Dashboard/messages';
import msgDrawer from '../../components/DrawerDetail/messages';
import msgReview from '../../routes/Sign/SubsidyReview/messages';
import msgRequest from '../../routes/Sign/SubsidyRequest/messages';
import './style/index.less';
import '../../assets/styles/login.less';

const { Step } = Steps;
class ModalSubsidyProgress extends React.Component {
    state = {
        currentStep: 2,
        isApproved: true,
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
    render() {
    
        const modalProps = {
            className: 'modal-subsidy-progress',
            title: "",
            visible: this.props.visible,
            onOk: this.props.onSubmit,
            onCancel: this.props.onCancel,
            closable: false,
            width: 900,
            footer: [
                <Button key="back" onClick={this.props.onCancel}>
                    {intl.formatMessage(messages.decline).toUpperCase()}
                </Button>,
                <Button key="submit" type="primary" onClick={this.props.onSubmit} style={{padding: '7.5px 30px'}}>
                    {intl.formatMessage(messages.approve).toUpperCase()}
                    {/* {intl.formatMessage(messages.appeal).toUpperCase()} */}
                </Button>
            ]
        };
        const { currentStep, isApproved } = this.state;
        return(
            <Modal {...modalProps}>
                <div className='flex flex-row mb-20'>
                    <div style={{width: 110}}/>
                    <div className='flex-1 text-center'>
                        <p className='font-30 font-30-sm'>{intl.formatMessage(messages.subsidyProgress)}</p>
                    </div>
                    <div style={{width: 110, textAlign: 'right'}}>
                        {isApproved ?
                            <p className='text-green500 font-24 font-700 ml-auto'>{intl.formatMessage(msgDashboard.approved)}</p>
                            :
                            <p className='text-red font-24 font-700 ml-auto'>{intl.formatMessage(msgDashboard.declined)}</p>
                        }
                    </div>
                </div>
                <div className={isApproved ? '' : 'step-declined'}>
                    <Steps current={currentStep} responsive={false} style={{maxWidth: 600}}>
                        <Step key='request' title={intl.formatMessage(messages.request)} icon={<p>1</p>}/>
                        <Step key='school' title={intl.formatMessage(msgCreateAccount.school)} icon={<p>2</p>}/>
                        <Step key='consultation' title={intl.formatMessage(messages.consultation)} icon={<p>3</p>}/>
                        <Step key='decision' title={intl.formatMessage(messages.decision)} icon={<p>4</p>}/>
                    </Steps>
                </div>
                {currentStep === 0 && <div className="steps-content"></div>}
                {currentStep === 1 && <div className="steps-content"></div>}
                {currentStep === 2 && <div className="steps-content mt-1">
                    <div className='parent-info'>
                        <p className='font-20 font-700'>{intl.formatMessage(messages.parentInformation)}</p>
                        <Row gutter={15}>
                            <Col xs={24} sm={24} md={12}>
                                <p className='font-700'>{intl.formatMessage(msgReview.dependentInfo)}</p>
                                <div className='count-2'>
                                    <p className='font-12'>Depentdent</p>
                                    <p className='font-12'>School</p>
                                    <p className='font-12'>Skillset(s)</p>
                                    <div className='count-2'>
                                        <p className='font-12'>Age</p>
                                        <p className='font-12'>Grade</p>
                                    </div>
                                    <p className='font-12'>Teacher</p>
                                </div>
                            </Col>
                            <Col xs={24} sm={24} md={12}>
                                <p className='font-700'>{intl.formatMessage(msgReview.otherCcontacts)}</p>
                                    <div className='count-2'>
                                        <p className='font-12'>Rav name</p>
                                        <p className='font-12'>Rav phone</p>
                                        <p className='font-12'>Rav email</p>
                                        <p className='font-12'>Therapist name</p>
                                        <p className='font-12'>Therapist phone</p>
                                        <p className='font-12'>Therapist email</p>
                                    </div>
                            </Col>
                        </Row>
                        <Divider style={{margin: '12px 0', borderColor: '#d7d7d7'}}/>
                        <Row gutter={15}>
                            <Col xs={24} sm={24} md={12}>
                                <p className='font-700'>{intl.formatMessage(messages.subsidyNotes)}</p>
                                <p className='font-12'>Notes text....</p>
                            </Col>
                            <Col xs={24} sm={24} md={12}>
                                <p className='font-700'>{intl.formatMessage(msgRequest.documents)}</p>
                                <p className='font-12'>Document #1 title</p>
                                <p className='font-12'>Document #2 title</p>
                                <p className='font-12'>Document #3 title</p>
                                <p className='font-12'>Document #4 title</p>
                            </Col>
                        </Row>
                    </div>
                    <div className='school-info'>
                        <div className='flex flex-row justify-between'>
                            <p className='font-20 font-700'>{intl.formatMessage(messages.schoolInformation)}</p>
                            <div className='flex flex-row items-center'>
                                <Button size='small' className='mr-10'>{intl.formatMessage(messages.decline).toUpperCase()}</Button>
                                <Button size='small' type='primary'>{intl.formatMessage(messages.approve).toUpperCase()}</Button>
                            </div>
                        </div>
                        <Row gutter={15}>
                            <Col xs={24} sm={24} md={8}>
                                <p className='font-700 mb-10'>{intl.formatMessage(messages.recommendedProviders)}</p>
                                <div className='select-md'>
                                    <Select className='mb-10' placeholder={intl.formatMessage(msgCreateAccount.provider)}>
                                        <Select.Option value='p1'>provider 1</Select.Option>
                                    </Select>
                                    <Select className='mb-10' placeholder={intl.formatMessage(msgCreateAccount.provider)}>
                                        <Select.Option value='p2'>provider 2</Select.Option>
                                    </Select>
                                    <Select className='mb-10' placeholder={intl.formatMessage(msgCreateAccount.provider)}>
                                        <Select.Option value='p3'>provider 3</Select.Option>
                                    </Select>
                                </div>
                            </Col>
                            <Col xs={24} sm={24} md={16}>
                                <p className='font-700 mb-10'>{intl.formatMessage(messages.decisionExplanation)}</p>
                                <Input.TextArea rows={5} placeholder={intl.formatMessage(msgRequest.generalNotes)}/>
                            </Col>
                        </Row>
                    </div>
                    <div className='consulation-appoint'>
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
                    </div>
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
                </div>}
                {currentStep === 3 && <div className="steps-content"></div>}
            </Modal>
        );
    }
};
export default ModalSubsidyProgress;