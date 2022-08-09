import React from 'react';
import { Button, Steps } from 'antd';
import { BiChevronLeft } from 'react-icons/bi';
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
import { ModalCreateDone } from '../../../../components/Modal';
import './index.less';
const { Step } = Steps;

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: 0,
      visibleCreateDone: false, 
    }
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
  openModalCreateDone = () => {
    this.setState({ visibleCreateDone: true });
  }
  closeModalCreateDone = () => {
      this.setState({ visibleCreateDone: false });
  }

  render() {
    const { currentStep, visibleCreateDone } = this.state;

    const createDoneProps = {
      visible: visibleCreateDone,
      onSubmit: this.closeModalCreateDone,
      onCancel: this.closeModalCreateDone,
    };
    return (
      <div className="full-layout page createaccount-page">
        
          {currentStep === 0 && <div className="steps-content">
            <CreateDefault onContinueDefault={this.handleContinue}/>
          </div>}
          {currentStep === 1 && <div className="steps-content">
            {/* <InfoParent onContinueParent={this.handleContinue}/> */}
            <InfoProfile onContinueProfile={this.handleContinue}/>
          </div>}
          {currentStep === 2 && <div className="steps-content">
            {/* <InfoChild onContinueChild={this.handleContinue}/> */}
            <InfoServices onContinueServices={this.handleContinue}/>
          </div>}
          {currentStep === 3 && <div className="steps-content">
            {/* <InfoProgress onContinueProgress={this.handleContinue}/> */}
            <InfoAvailability onContinueAvailability={this.handleContinue}/>
          </div>}
          {currentStep === 4 && <div className="steps-content">
            {/* <ReviewAccount onContinueReview={this.handleContinue}/> */}
            <SubsidyProgram onContinueProgram={this.handleContinue}/>
          </div>}
          {currentStep === 5 && <div className="steps-content">
            <InfoReview onContinueReview={this.handleContinue}/>
          </div>}
          {/* <Steps current={currentStep} responsive={false} style={{maxWidth: 500}}
              <Step key='default' title={intl.formatMessage(messages.accountInfo)} icon={<p>1</p>}/>
              <Step key='info_parent' title={intl.formatMessage(messages.contactInfo)} icon={<p>2</p>}/>
              <Step key='info_child' title={intl.formatMessage(messages.dependentsInfo)} icon={<p>3</p>}/>
              <Step key='info_progress' title={intl.formatMessage(messages.progessInfo)} icon={<p>4</p>}/>
              <Step key='review_info' title={intl.formatMessage(messages.reviewInfo)} icon={<p>5</p>}/>
          </Steps> */}
          <Steps current={currentStep} responsive={false} style={{maxWidth: 600}}>
              <Step key='default' title={intl.formatMessage(messages.accountInfo)} icon={<p>1</p>}/>
              <Step key='info_profile' title={intl.formatMessage(messages.profileInfo)} icon={<p>2</p>}/>
              <Step key='info_services' title={intl.formatMessage(messages.servicesInfo)} icon={<p>3</p>}/>
              <Step key='info_availability' title={intl.formatMessage(messages.availabilityInfo)} icon={<p>4</p>}/>
              <Step key='subsidy' title={intl.formatMessage(messages.subsidy)} icon={<p>5</p>}/>
              <Step key='info_review' title={intl.formatMessage(messages.reviewInfo)} icon={<p>6</p>}/>
          </Steps>
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
                <BiChevronLeft size={25}/>{intl.formatMessage(messages.back)}
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
          <ModalCreateDone {...createDoneProps}/>
      </div>
    );
  }
}