import React from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Row, Form, Button, Input, Select, Steps, message } from 'antd';
import { BsCheck, BsDot, BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import { routerLinks } from "../../../constant";
import intl from 'react-intl-universal';
import messages from '../messages';
import messagesLogin from '../../Login/messages';
import CreateDefault from './create_default';
import InfoParent from './info_parent';
import InfoChild from './info_child';
import InfoProgress from './info_progress';
import './index.less';
const { Step } = Steps;

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: 3,
    }
  }

  nextStep = () => {
    this.setState({currentStep: this.state.currentStep + 1});
  };

  prevStep = () => {
    this.setState({currentStep: this.state.currentStep - 1});
  };
  
  handleContinue = () => {
    this.nextStep();
  }
  
  render() {
    const onFinish = (values: any) => {
      console.log('Success:', values);
    };
  
    const onFinishFailed = (errorInfo: any) => {
      console.log('Failed:', errorInfo);
    };

    const steps = [
      {
        title: 'First',
        content: 'First-content',
      },
      {
        title: 'Second',
        content: 'Second-content',
      },
      {
        title: 'Last',
        content: 'Last-content',
      },
    ];
  
    const { currentStep } = this.state;
    return (
      <div className="full-layout page createaccount-page">
        
          {currentStep === 0 && <div className="steps-content">
            <CreateDefault onContinueDefault={this.handleContinue}/>
          </div>}
          {currentStep === 1 && <div className="steps-content">
            <InfoParent onContinueParent={this.handleContinue}/>
          </div>}
          {currentStep === 2 && <div className="steps-content">
            <InfoChild onContinueChild={this.handleContinue}/>
          </div>}
          {currentStep === 3 && <div className="steps-content">
            <InfoProgress onContinueProgress={this.handleContinue}/>
          </div>}
          <Steps current={currentStep} responsive={false}>
              <Step key='default' title={intl.formatMessage(messages.accountInfo)} icon={<p>1</p>}/>
              <Step key='info_parent' title={intl.formatMessage(messages.contactInfo)} icon={<p>2</p>}/>
              <Step key='info_child' title={intl.formatMessage(messages.dependentsInfo)} icon={<p>3</p>}/>
              <Step key='info_progress' title={intl.formatMessage(messages.progessInfo)} icon={<p>4</p>}/>
              <Step key='info_progress' title={intl.formatMessage(messages.progessInfo)} icon={<p>5</p>}/>
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
                <BiChevronLeft size={25}/>Back
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
      </div>
    );
  }
}