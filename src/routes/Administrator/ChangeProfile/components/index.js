import React from 'react';
import { Link } from 'dva/router';
import { Divider, Menu } from 'antd';
import intl from 'react-intl-universal';
import Cookies from 'js-cookie';

import InfoProfile from '../../../Profile/ChangeProfile/components/Provider/info_profile';
import InfoServices from '../../../Profile/ChangeProfile/components/Provider/info_services';
import InfoAvailability from '../../../Profile/ChangeProfile/components/Provider/info_availability';
import InfoScheduling from '../../../Profile/ChangeProfile/components/Provider/info_scheduling';
import InfoFinancial from '../../../Profile/ChangeProfile/components/Provider/info_financial';
import InfoChild from '../../../Profile/ChangeProfile/components/Parents/info_child';
import InfoParent from '../../../Profile/ChangeProfile/components/Parents/info_parent';
import InfoSchool from '../../../Profile/ChangeProfile/components/School/info_school';
import InfoAvaiSchool from '../../../Profile/ChangeProfile/components/School/info_availability'
import InfoConsultant from '../../../Profile/ChangeProfile/components/Consultant/info_consultant';
import ConsultantAvailability from '../../../Profile/ChangeProfile/components/Consultant/info_availability';
import InfoAdmin from '../../../Profile/ChangeProfile/components/Admin/info_admin';
import SubsidyProgram from '../../../Profile/ChangeProfile/components/Provider/subsidy_program';
import { MENU_ADMIN, MENU_CONSULTANT, MENU_PARENT, MENU_PROVIDER, MENU_SCHOOL } from '../constant';
import { setKeyDefault } from '../service';
import { store } from 'src/redux/store';
import { socketUrl } from 'utils/api/baseUrl';
import mgsSidebar from 'components/SideBar/messages';
import msgCreateAccount from 'routes/Sign/CreateAccount/messages';
import './index.less';

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.socket = undefined;
    this.state = {
      user: store.getState().auth.selectedUser,
      parent: {
        info_child: true,
        info_parent: false,
      },
      provider: {
        info_general: true,
        info_availability: false,
        info_professional: false,
        info_scheduling: false,
        info_subsidy: false,
        info_billing: false,
      },
      school: {
        info_school: true,
        info_availability: false,
      },
      consultant: {
        info_consultant: true,
        info_availability: false,
      },
      admin: {
        info_admin: true,
      },
      listMenu: [],
      keyActive: setKeyDefault(store.getState().auth.selectedUser?.role),
    };
  }

  componentDidMount() {
    switch (this.state.user?.role) {
      case 1000:
        this.setState({ listMenu: this.getMenuList(MENU_ADMIN) });
        break;
      case 999:
        this.setState({ listMenu: this.getMenuList(MENU_ADMIN) });
        break;
      case 100:
        this.setState({ listMenu: this.getMenuList(MENU_CONSULTANT) });
        break;
      case 60:
        this.setState({ listMenu: this.getMenuList(MENU_SCHOOL) });
        break;
      case 30:
        this.setState({ listMenu: this.getMenuList(MENU_PROVIDER) });
        break;
      case 3:
        this.setState({ listMenu: this.getMenuList(MENU_PARENT) });
        break;
    }
    this.handleSocketEvents();
  }

  handleSocketEvents = () => {
    let opts = {
      query: {
        token: Cookies.get('tk'),
      },
      withCredentials: true,
      autoConnect: true,
    };
    this.socket = io(socketUrl, opts);
  }

  getMenuList = (data) => {
    const menu = data.map((item) => ({
      key: String(item.key),
      icon: item.icon != '' ? React.createElement(item.icon) : '',
      label: (
        <Link to='#' onClick={() => this.changeMenu(item.key)}>
          {item.label}
        </Link>
      )
    }))
    return menu;
  }

  changeMenu = (val) => {
    this.setState({ keyActive: val });
    const { user } = this.state;
    let data = {
      user: store.getState().auth.user?._id,
      action: 'User Manage',
    }

    switch (user?.role) {
      case 1000:
        let newStateSuperAdmin = { ...this.state.admin };
        switch (val) {
          case 'Info_admin':
            data['description'] = `Viewed ${intl.formatMessage(msgCreateAccount.adminDetails)}.`;
            this.setState({ admin: { newStateSuperAdmin, info_admin: true } }); break;
          default: break;
        }
        break;
      case 999:
        let newStateAdmin = { ...this.state.admin };
        switch (val) {
          case 'Info_admin':
            data['description'] = `Viewed ${intl.formatMessage(msgCreateAccount.adminDetails)}.`;
            this.setState({ admin: { newStateAdmin, info_admin: true } }); break;
          default: break;
        }
        break;
      case 100:
        let newStateConsultant = { ...this.state.consultant };
        switch (val) {
          case 'Info_consultant':
            data['description'] = `Viewed consultant's ${intl.formatMessage(msgCreateAccount.generalInformation)}.`;
            this.setState({ consultant: { newStateConsultant, info_consultant: true } }); break;
          case 'Info_availability':
            data['description'] = `Viewed consultant's ${intl.formatMessage(msgCreateAccount.availability)}.`;
            this.setState({ consultant: { newStateConsultant, info_availability: true } }); break;
          default: break;
        }
        break;
      case 60:
        let newStateSchool = { ...this.state.school };
        switch (val) {
          case 'Info_school':
            data['description'] = `Viewed ${intl.formatMessage(msgCreateAccount.schoolDetails)}.`;
            this.setState({ school: { newStateSchool, info_school: true } }); break;
          case 'Info_availability':
            data['description'] = `Viewed school's ${intl.formatMessage(msgCreateAccount.availability)}.`;
            this.setState({ school: { newStateSchool, info_availability: true } }); break;
          default: break;
        }
        break;
      case 30:
        let newStateProvider = { ...this.state.provider };
        switch (val) {
          case 'Info_general':
            data['description'] = `Viewed provider's ${intl.formatMessage(msgCreateAccount.generalInformation)}.`;
            this.setState({ provider: { newStateProvider, info_general: true } }); break;
          case 'Info_professional':
            data['description'] = `Viewed provider's ${intl.formatMessage(msgCreateAccount.professionalInformation)}.`;
            this.setState({ provider: { newStateProvider, info_professional: true } }); break;
          case 'Info_scheduling':
            data['description'] = `Viewed provider's ${intl.formatMessage(msgCreateAccount.scheduling)}.`;
            this.setState({ provider: { newStateProvider, info_scheduling: true } }); break;
          case 'Info_availability':
            data['description'] = `Viewed provider's ${intl.formatMessage(msgCreateAccount.availability)}.`;
            this.setState({ provider: { newStateProvider, info_availability: true } }); break;
          case 'Info_subsidy':
            data['description'] = `Viewed provider's ${intl.formatMessage(msgCreateAccount.subsidyProgram)}.`;
            this.setState({ provider: { newStateProvider, info_subsidy: true } }); break;
          case 'Info_billing':
            data['description'] = `Viewed provider's ${intl.formatMessage(msgCreateAccount.billingDetails)}.`;
            this.setState({ provider: { newStateProvider, info_billing: true } }); break;
          default: break;
        }
        break;
      case 3:
        let newStateParent = { ...this.state.parent }
        switch (val) {
          case 'Info_child':
            data['description'] = `Viewed ${intl.formatMessage(msgCreateAccount.dependentsInfo)}.`;
            this.setState({ parent: { newStateParent, info_child: true } }); break;
          case 'Info_parent':
            data['description'] = `Viewed ${intl.formatMessage(msgCreateAccount.parentInformation)}.`;
            this.setState({ parent: { newStateParent, info_parent: true } }); break;
          default: break;
        }
        break;
    }

    if (data.description) {
      this.socket.emit('action_tracking', data);
    }
  }

  getScreen = () => {
    const { admin, school, parent, provider, consultant, user } = this.state;
    switch (user?.role) {
      case 1000:
        if (admin.info_admin) {
          return <InfoAdmin />
        } else {
          return null;
        }
      case 999:
        if (admin.info_admin) {
          return <InfoAdmin />
        } else {
          return null;
        }
      case 100:
        if (consultant.info_consultant) {
          return <InfoConsultant />
        } else if (consultant.info_availability) {
          return <ConsultantAvailability />
        } else {
          return null;
        }
      case 60:
        if (school.info_school) {
          return <InfoSchool />
        } else if (school.info_availability) {
          return <InfoAvaiSchool />
        } else {
          return null;
        }
      case 30:
        if (provider.info_general) {
          return <InfoProfile />
        } else if (provider.info_availability) {
          return <InfoAvailability />
        } else if (provider.info_professional) {
          return <InfoServices />
        } else if (provider.info_scheduling) {
          return <InfoScheduling />
        } else if (provider.info_subsidy) {
          return <SubsidyProgram />
        } else if (provider.info_billing) {
          return <InfoFinancial />
        } else {
          return null;
        }
      case 3:
        if (parent.info_child) {
          return <InfoChild />
        } else if (parent.info_parent) {
          return <InfoParent />
        } else {
          return null;
        }
    }
  }

  render() {
    const { listMenu, keyActive } = this.state;

    return (
      <div className="full-layout page admin-page">
        <div className='div-title-admin'>
          <p className='font-16 font-500'>{intl.formatMessage(mgsSidebar.editUser)}</p>
          <Divider />
        </div>
        <div className='div-content'>
          <section className='div-activity-feed box-card'>
            <Menu theme="light" mode="inline" defaultSelectedKeys={[keyActive]} rootClassName="h-100 overflow-x-hidden overflow-y-scroll" items={listMenu} />
          </section>
          <section className='div-calendar box-card overflow-y-scroll'>
            {this.getScreen()}
          </section>
        </div>
      </div>
    );
  }
}