import React from 'react';
import { Button, Steps } from 'antd';
import { BiChevronLeft } from 'react-icons/bi';
import intl from 'react-intl-universal';

import messages from 'routes/Sign/CreateAccount/messages';
import { ModalCreateDone } from 'components/Modal';
import CreateDefault from 'routes/Sign/CreateAccount/components/create_default';
import InfoParent from 'routes/Sign/CreateAccount/components/Parents/info_parent';
import InfoChild from 'routes/Sign/CreateAccount/components/Parents/info_child';
import ReviewAccount from 'routes/Sign/CreateAccount/components/Parents/review_account';
import InfoProfile from 'routes/Sign/CreateAccount/components/Provider/info_profile';
import InfoServices from 'routes/Sign/CreateAccount/components/Provider/info_services';
import InfoScheduling from 'routes/Sign/CreateAccount/components/Provider/info_scheduling';
import InfoAvailability from 'routes/Sign/CreateAccount/components/Provider/info_availability';
import SubsidyProgram from 'routes/Sign/CreateAccount/components/Provider/subsidy_program';
import InfoReview from 'routes/Sign/CreateAccount/components/Provider/info_review';
import InfoFinancial from 'routes/Sign/CreateAccount/components/Provider/info_financial';
import InfoSchool from 'routes/Sign/CreateAccount/components/School/info_school';
import SchoolAvailability from 'routes/Sign/CreateAccount/components/School/school_availability';
import InfoAdmin from 'routes/Sign/CreateAccount/components/Admin/info_admin';
import InfoConsultant from 'routes/Sign/CreateAccount/components/Consultant/info_consultant';
import ConsultantAvailability from 'routes/Sign/CreateAccount/components/Consultant/info_availability';
import InfoNotificationSetting from 'routes/Profile/ChangeProfile/components/info_notification';
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
    if (this.state.currentStep < 9) {
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
      case intl.formatMessage(messages.consultant):
        return this.setState({ accountType: intl.formatMessage(messages.consultant) })
      case intl.formatMessage(messages.admin):
        return this.setState({ accountType: intl.formatMessage(messages.admin) })
      case 'superadmin':
        return this.setState({ accountType: 'superadmin' })
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
            { title: intl.formatMessage(messages.notificationSetting), icon: (<p>4</p>) },
            { title: intl.formatMessage(messages.reviewInfo), icon: (<p>5</p>) },
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
            { title: intl.formatMessage(messages.notificationSetting), icon: (<p>8</p>) },
            { title: intl.formatMessage(messages.reviewInfo), icon: (<p>9</p>) },
          ]}>
          </Steps >
        )
      case intl.formatMessage(messages.consultant):
        return (
          <Steps current={this.state.currentStep} responsive={false} style={{ maxWidth: 450 }} items={[
            { title: intl.formatMessage(messages.accountInfo), icon: (<p>1</p>) },
            { title: intl.formatMessage(messages.profileInfo), icon: (<p>2</p>) },
            { title: intl.formatMessage(messages.notificationSetting), icon: (<p>3</p>) },
            { title: intl.formatMessage(messages.availabilityInfo), icon: (<p>4</p>) },
          ]}>
          </Steps>
        )
      case intl.formatMessage(messages.school):
        return (
          <Steps current={this.state.currentStep} responsive={false} style={{ maxWidth: 450 }} items={[
            { title: intl.formatMessage(messages.accountInfo), icon: (<p>1</p>) },
            { title: intl.formatMessage(messages.schoolDetails), icon: (<p>2</p>) },
            { title: intl.formatMessage(messages.notificationSetting), icon: (<p>3</p>) },
            { title: intl.formatMessage(messages.availabilityInfo), icon: (<p>4</p>) },
          ]}>
          </Steps>
        )
    }
  }

  openModalCreateDone = () => {
    this.setState({ visibleCreateDone: true });
  }

  closeModalCreateDone = () => {
    this.setState({ visibleCreateDone: false, currentStep: 0 });
  }

  getStepContentComponent = (currentStep) => {
    switch (currentStep) {
      case 0:
        return (<CreateDefault onContinue={this.handleContinue} onHandleChangeRoleRegister={this.handleChange} />)
      case 1:
        switch (this.state.accountType) {
          case intl.formatMessage(messages.parent):
            return (<InfoParent onContinue={this.handleContinue} />)
          case intl.formatMessage(messages.provider):
            return (<InfoProfile onContinue={this.handleContinue} />)
          case intl.formatMessage(messages.consultant):
            return (<InfoConsultant onContinue={this.handleContinue} />)
          case intl.formatMessage(messages.school):
            return (<InfoSchool onContinue={this.handleContinue} />)
          case intl.formatMessage(messages.admin):
            return (<InfoAdmin onContinue={this.handleContinue} />)
          case 'superadmin':
            return (<InfoAdmin onContinue={this.handleContinue} />)
        }
      case 2:
        switch (this.state.accountType) {
          case intl.formatMessage(messages.parent):
            return (<InfoChild onContinue={this.handleContinue} />)
          case intl.formatMessage(messages.provider):
            return (<InfoServices onContinue={this.handleContinue} />)
          case intl.formatMessage(messages.school):
            return (<SchoolAvailability onContinue={this.handleContinue} />)
          case intl.formatMessage(messages.consultant):
            return (<ConsultantAvailability onContinue={this.handleContinue} />)
        }
      case 3:
        switch (this.state.accountType) {
          case intl.formatMessage(messages.parent):
            return (<InfoNotificationSetting onContinue={this.handleContinue} />)
          case intl.formatMessage(messages.provider):
            return (<InfoScheduling onContinue={this.handleContinue} />)
          case intl.formatMessage(messages.school):
            return (<InfoNotificationSetting onContinue={this.handleContinue} />)
          case intl.formatMessage(messages.consultant):
            return (<InfoNotificationSetting onContinue={this.handleContinue} />)
        }
      case 4:
        switch (this.state.accountType) {
          case intl.formatMessage(messages.parent):
            return (<ReviewAccount onContinue={this.handleContinue} />)
          case intl.formatMessage(messages.provider):
            return (<InfoFinancial onContinue={this.handleContinue} />)
        }
      case 5:
        return (<SubsidyProgram onContinue={this.handleContinue} />)
      case 6:
        return (<InfoAvailability onContinue={this.handleContinue} />)
      case 7:
        return (<InfoNotificationSetting onContinue={this.handleContinue} />)
      case 8:
        return (<InfoReview onContinue={this.handleContinue} />)
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
        <ModalCreateDone {...createDoneProps} />
      </div>
    );
  }
}