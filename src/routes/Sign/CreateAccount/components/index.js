import React from 'react';
import { Button, Steps } from 'antd';
import { BiChevronLeft } from 'react-icons/bi';
import { ModalCreateDone } from '../../../../components/Modal';
import intl from 'react-intl-universal';

import messages from '../messages';
import CreateDefault from './create_default';
import InfoParent from './Parents/info_parent';
import InfoChild from './Parents/info_child';
import ReviewAccount from './Parents/review_account';
import InfoProfile from './Provider/info_profile';
import InfoServices from './Provider/info_services';
import InfoScheduling from './Provider/info_scheduling';
import InfoAvailability from './Provider/info_availability';
import SubsidyProgram from './Provider/subsidy_program';
import InfoReview from './Provider/info_review';
import InfoFinancial from './Provider/info_financial';
import InfoSchool from './School/info_school';
import SchoolAvailability from './School/school_availability';
import InfoAdmin from './Admin/info_admin';
import InfoConsultant from './Consultant/info_consultant';
import ConsultantAvailability from './Consultant/info_availability';
import { routerLinks } from "../../../constant";
import './index.less';
import '../../../../assets/styles/login.less';

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: 0,
      accountType: intl.formatMessage(messages.parent),
      visibleCreateDone: false,
    }
  }

  nextStep = () => {
    this.setState({ currentStep: this.state.currentStep + 1 });
  };

  prevStep = () => {
    this.setState({ currentStep: this.state.currentStep - 1 });
  };

  handleContinue = (isFinished = false) => {
    if (isFinished) {
      this.openModalCreateDone();
      return;
    }
    if (this.state.currentStep <= 7) {
      this.nextStep();
    }
  }

  handleChange = (accountType) => {
    switch (accountType) {
      case intl.formatMessage(messages.parent):
        return this.setState({ accountType: intl.formatMessage(messages.parent) })
      case intl.formatMessage(messages.provider):
        return this.setState({ accountType: intl.formatMessage(messages.provider) })
      case intl.formatMessage(messages.school):
        return this.setState({ accountType: intl.formatMessage(messages.school) })
      case intl.formatMessage(messages.admin):
        return this.setState({ accountType: intl.formatMessage(messages.admin) })
      case intl.formatMessage(messages.consultant):
        return this.setState({ accountType: intl.formatMessage(messages.consultant) })
    }
  }

  handleContinueDefault = (accountType) => {
    if (this.state.currentStep === 0) {
      this.setState({ accountType: accountType });
    }
  }

  getStepsComponent = (type) => {
    switch (type) {
      case intl.formatMessage(messages.parent):
        return (
          <Steps current={this.state.currentStep} responsive={true} style={{ maxWidth: 450 }} items={[
            { title: intl.formatMessage(messages.accountInfo), icon: (<p>1</p>) },
            { title: intl.formatMessage(messages.contactInfo), icon: (<p>2</p>) },
            { title: intl.formatMessage(messages.dependentsInfo), icon: (<p>3</p>) },
            { title: intl.formatMessage(messages.reviewInfo), icon: (<p>4</p>) },
          ]}>
          </Steps>
        )
      case intl.formatMessage(messages.provider):
        return (
          <Steps current={this.state.currentStep} responsive={false} style={{ maxWidth: 450 }} className="provider-steps" items={[
            { title: intl.formatMessage(messages.accountInfo), icon: (<p>1</p>) },
            { title: intl.formatMessage(messages.generalInformation), icon: (<p>2</p>) },
            { title: intl.formatMessage(messages.professionalInformation), icon: (<p>3</p>) },
            { title: intl.formatMessage(messages.scheduling), icon: (<p>4</p>) },
            { title: intl.formatMessage(messages.billingDetails), icon: (<p>5</p>) },
            { title: intl.formatMessage(messages.subsidyProgram), icon: (<p>6</p>) },
            { title: intl.formatMessage(messages.availability), icon: (<p>7</p>) },
            { title: intl.formatMessage(messages.reviewInfo), icon: (<p>8</p>) },
          ]}>
          </Steps >
        )
      case intl.formatMessage(messages.consultant):
        return (
          <Steps current={this.state.currentStep} responsive={false} style={{ maxWidth: 450 }} items={[
            { title: intl.formatMessage(messages.accountInfo), icon: (<p>1</p>) },
            { title: intl.formatMessage(messages.profileInfo), icon: (<p>2</p>) },
            { title: intl.formatMessage(messages.availabilityInfo), icon: (<p>3</p>) },
          ]}>
          </Steps>
        )
      case intl.formatMessage(messages.school):
        return (
          <Steps current={this.state.currentStep} responsive={false} style={{ maxWidth: 450 }} items={[
            { title: intl.formatMessage(messages.accountInfo), icon: (<p>1</p>) },
            { title: intl.formatMessage(messages.schoolDetails), icon: (<p>2</p>) },
            { title: intl.formatMessage(messages.availabilityInfo), icon: (<p>3</p>) },
          ]}>
          </Steps>
        )
    }
  }

  openModalCreateDone = () => {
    this.setState({ visibleCreateDone: true });
  }

  closeModalCreateDone = () => {
    this.setState({ visibleCreateDone: false });
    this.props.history.push(routerLinks.Login + '/register_success');
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
            return (<InfoProfile onContinue={this.handleContinue} />)
          case intl.formatMessage(messages.consultant):
            return (<InfoConsultant onContinue={this.handleContinue} />)
          case intl.formatMessage(messages.school):
            return (<InfoSchool onContinue={this.handleContinue} />)
          case intl.formatMessage(messages.admin):
            return (<InfoAdmin onContinue={this.handleContinue} />)
        }
      case 2:
        switch (this.state.accountType) {
          case intl.formatMessage(messages.parent):
            return (<InfoChild onContinue={this.handleContinue} />)
          case intl.formatMessage(messages.provider):
            return (<InfoServices onContinue={this.handleContinue} />)
          case intl.formatMessage(messages.consultant):
            return (<ConsultantAvailability onContinue={this.handleContinue} />)
          case intl.formatMessage(messages.school):
            return (<SchoolAvailability onContinue={this.handleContinue} />)
        }
      case 3:
        switch (this.state.accountType) {
          case intl.formatMessage(messages.parent):
            return (<ReviewAccount onContinue={this.handleContinue} />)
          case intl.formatMessage(messages.provider):
            return (<InfoScheduling onContinue={this.handleContinue} />)
        }
      case 4:
        switch (this.state.accountType) {
          case intl.formatMessage(messages.provider):
            return (<InfoFinancial onContinue={this.handleContinue} />)
        }
      case 5:
        return (<SubsidyProgram onContinue={this.handleContinue} />)
      case 6:
        return (<InfoAvailability onContinue={this.handleContinue} />)
      case 7:
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
          {currentStep > 0 && (
            <Button
              type="text"
              className='back-btn'
              onClick={() => this.prevStep()}
            >
              <BiChevronLeft size={25} />{intl.formatMessage(messages.back)}
            </Button>
          )}
        </div>
        {visibleCreateDone && <ModalCreateDone {...createDoneProps} />}
      </div>
    );
  }
}