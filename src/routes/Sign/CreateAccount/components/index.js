import React from 'react';
import { Button, Steps , Input } from 'antd';
import { BiChevronLeft } from 'react-icons/bi';
import { ModalCreateDone } from '../../../../components/Modal';

import intl from 'react-intl-universal';
import messages from '../messages';
import CreateDefault from './create_default';
import InfoParent from './Parents/info_parent';
import InfoChild from './Parents/info_child';
import InfoProgress from './Parents/info_progress';
import ReviewAccount from './Parents/review_account';

import InfoProfile from './Provider/info_profile';
import InfoServices from './Provider/info_services';
import InfoAvailability from './Provider/info_availability';
import SubsidyProgram from './Provider/subsidy_program';
import InfoReview from './Provider/info_review';
import InfoSchool from './School/info_school';
import InfoAdmin from './Admin/info_admin';
import SubsidyRequest from '../../SubsidyRequest/components';
import SubsidyReview from '../../SubsidyReview/components';
import { routerLinks } from "../../../constant";
import './index.less';
import '../../../../assets/styles/login.less';
const { Step } = Steps;

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: 0,
      subsidyStep:-1,
      selectedDependent:-1,
      accountType: intl.formatMessage(messages.parent),
      visibleCreateDone: false,
    }
  }



  nextStep = () => {
    this.setState({ currentStep: this.state.currentStep + 1 });
    console.log("Step", this.state.currentStep)
  };

  prevStep = () => {
    this.setState({ currentStep: this.state.currentStep - 1 });
  };

  handleContinue = (isFinished = false) => {
    // if(this.state.currentStep <= 2) {
    //   this.nextStep();
    // } else {
    //   this.openModalCreateDone();
    // }
    if(isFinished){
      this.openModalCreateDone();
      return;
    }
    if (this.state.currentStep <= 4) {
      this.nextStep();
    }
  }

  handleChange = (accountType) => {
    switch (accountType) {
      case intl.formatMessage(messages.parent):
        return this.setState({accountType: intl.formatMessage(messages.parent)})
      case intl.formatMessage(messages.provider):
        return this.setState({accountType: intl.formatMessage(messages.provider)})
      case intl.formatMessage(messages.school):
        return this.setState({accountType: intl.formatMessage(messages.school)})
      case intl.formatMessage(messages.admin):
        return this.setState({accountType: intl.formatMessage(messages.admin)})
    }
  }

  handleContinueDefault = (accountType) => {
    if (this.state.currentStep === 0) {
      this.setState({accountType: accountType});
    }
  }

  getStepsComponent = (type) => {
    switch (type) {
      case intl.formatMessage(messages.parent):
        return (
          <Steps current={this.state.currentStep} responsive={false} style={{ maxWidth: 450 }}>
            <Step key='default' title={intl.formatMessage(messages.accountInfo)} icon={<p>1</p>} />
            <Step key='info_parent' title={intl.formatMessage(messages.contactInfo)} icon={<p>2</p>} />
            <Step key='info_child' title={intl.formatMessage(messages.dependentsInfo)} icon={<p>3</p>} />
            <Step key='info_progress' title={intl.formatMessage(messages.progessInfo)} icon={<p>4</p>} />
            <Step key='review_info' title={intl.formatMessage(messages.reviewInfo)} icon={<p>5</p>} />
          </Steps>
        )
      case intl.formatMessage(messages.provider):
        return (
          <Steps current={this.state.currentStep} responsive={false} style={{ maxWidth: 450 }}>
            <Step key='default' title={intl.formatMessage(messages.accountInfo)} icon={<p>1</p>} />
            <Step key='info_profile' title={intl.formatMessage(messages.profileInfo)} icon={<p>2</p>} />
            <Step key='info_services' title={intl.formatMessage(messages.servicesInfo)} icon={<p>3</p>} />
            <Step key='info_availability' title={intl.formatMessage(messages.availabilityInfo)} icon={<p>4</p>} />
            <Step key='subsidy' title={intl.formatMessage(messages.subsidy)} icon={<p>5</p>} />
            {/* <Step key='info_review' title={intl.formatMessage(messages.reviewInfo)} icon={<p>6</p>} /> */}
          </Steps>
        )
    }
  }

  onOpenSubsidyStep = (step , selectedDependent)=>{
    console.log('step',step , selectedDependent);
    this.setState({
      subsidyStep:step,
      selectedDependent:selectedDependent
    })
  }

  changeSelectedDependent = (selectedDependent)=>{
    this.setState({
      selectedDependent:selectedDependent
    })
  }

  getSelectedDependent = ()=>{
    return this.state.selectedDependent
  }

  openModalCreateDone = () => {
    this.setState({ visibleCreateDone: true });
  }
  closeModalCreateDone = () => {
    this.setState({ visibleCreateDone: false });

    
    this.props.history.push(routerLinks['Dashboard']);
          
  }

  getStepContentComponent = (currentStep) => {
    switch (currentStep) {
      case 0:
        return (<CreateDefault onContinue={this.handleContinue} onHandleChangeRoleRegister={this.handleChange} />)
      case 1:
        
        switch (this.state.accountType) {
          case intl.formatMessage(messages.parent):
            return (<InfoParent onFinishRegister={this.openModalCreateDone} onContinue={this.handleContinue} />)
          case intl.formatMessage(messages.provider):
            // return (<InfoServices onContinue={this.handleContinue} />)
            // return (<InfoAvailability onContinue={this.handleContinue} />)
            // return (<SubsidyProgram onContinue={this.handleContinue} />)
            return (<InfoProfile onContinue={this.handleContinue} />)
          case intl.formatMessage(messages.school):
            return (<InfoSchool onContinue={this.handleContinue}/>)
          case intl.formatMessage(messages.admin):
            return (<InfoAdmin onContinue={this.handleContinue}/>)
        }
      case 2:
        switch (this.state.accountType) {
          case intl.formatMessage(messages.parent):
            if(this.state.subsidyStep == 1){
              return (<SubsidyRequest selectedDependent={this.state.selectedDependent} changeSelectedDependent={this.changeSelectedDependent}  onOpenSubsidyStep={this.onOpenSubsidyStep} onContinue={this.handleContinue} />)
            }else if(this.state.subsidyStep == 2){
              return (<SubsidyReview selectedDependent={this.state.selectedDependent} changeSelectedDependent={this.changeSelectedDependent}  onOpenSubsidyStep={this.onOpenSubsidyStep} onContinue={this.handleContinue} />)
            }else{
              return (<InfoChild onOpenSubsidyStep={this.onOpenSubsidyStep} changeSelectedDependent={this.changeSelectedDependent} onContinue={this.handleContinue} />)
            }
            
          case intl.formatMessage(messages.provider):
            return (<InfoServices onContinue={this.handleContinue} />)
        }
      case 3:
        switch (this.state.accountType) {
          case intl.formatMessage(messages.parent):
            return (<InfoProgress onContinue={this.handleContinue} />)
          case intl.formatMessage(messages.provider):
            return (<InfoAvailability onContinue={this.handleContinue} />)
        }
      case 4:
        switch (this.state.accountType) {
          case intl.formatMessage(messages.parent):
            return (<ReviewAccount onContinue={this.handleContinue} />)
          case intl.formatMessage(messages.provider):
            return (<SubsidyProgram onContinue={this.handleContinue} />)
        }
      case 5:
        return (<InfoReview onContinue={this.handleContinue} onFinishRegister={this.openModalCreateDone} />)
    }
  }

  

  render() {
    const { currentStep, visibleCreateDone, accountType } = this.state;

    const createDoneProps = {
      visible: visibleCreateDone,
      onSubmit: this.closeModalCreateDone,
      onCancel: this.closeModalCreateDone,
    };
    return (
      <div className="full-layout page createaccount-page">
        <div className='step-content'>
          {this.getStepContentComponent(currentStep)}
        </div>

        {this.getStepsComponent(accountType)}
        <div className="steps-action">

          {/* {currentStep === steps.length - 1 && (
              <Button 
                type="primary" 
                onClick={() => message.success('Processing complete!')}>
                Done
              </Button>
            )} */}
          {currentStep > 0 && (
            <Button
              type="text"
              className='back-btn'
              onClick={() => this.prevStep()}
            >
              <BiChevronLeft size={25} />{intl.formatMessage(messages.back)}
            </Button>
          )}
          {/* {currentStep < steps.length - 1 && (
              <Button 
                type="text" 
                className='next-btn'
                onClick={() => this.nextStep()}>
                Next<BiChevronLeft size={25}/>
              </Button>
            )} */}
        </div>
        <ModalCreateDone {...createDoneProps} />
      </div>
    );
  }
}