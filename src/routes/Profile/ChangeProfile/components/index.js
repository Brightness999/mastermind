import React from 'react';
import { Link } from 'dva/router';
import './index.less';
import { Layout, Menu } from 'antd';

import InfoProfile from './Provider/info_profile';
import InfoServices from './Provider/info_services';
import InfoAvailability from './Provider/info_availability';
import SubsidyProgram from './Provider/subsidy_program';
import DayWork from './Provider/day_work';

import InfoChild from './Parents/info_child';
import InfoParent from './Parents/info_parent';
import InfoProgress from './Parents/info_progress';
import InfoSchool from './School/info_school';
import InfoAvaiSchool from './School/info_availability'
import ChangePassword from './ChangePassword';
import InfoAdmin from './Admin/info_admin';
import { MENU_ADMIN, MENU_PARENT, MENU_PROVIDER, MENU_SCHOOL } from '../constant';
import { setKeyDefault } from '../service';
import { store } from '../../../../redux/store';

const user = store.getState().auth.user;
export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      parent: {
        info_child: true,
        info_parent: false,
        info_progress: false,
        info_availability: false,
        change_password: false
      },
      provider: {
        info_profile: true,
        info_availability: false,
        info_services: false,
        subsidy_program: false,
        day_work: false,
        change_password: false
      },
      school: {
        info_school: true,
        info_availability: false,
        change_password: false
      },
      admin: {
        info_admin: true,
        change_password: false
      },
      listMenu: [],
      keyActive: setKeyDefault(user.role)
    };
  }

  componentDidMount() {
    switch (user.role) {
      case 999:
        this.setState({ listMenu: this.getMenuList(MENU_ADMIN) });
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
  }

  getMenuList = (data) => {
    const menu = data.map((item, index) => ({
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
    switch (user.role) {
      case 999:
        let newStateAdmin = { ...this.state.admin };
        switch (val) {
          case 'Info_admin':
            this.setState({ admin: { newStateAdmin, info_admin: true } })
            break;
          default:
            this.setState({ admin: { newStateAdmin, change_password: true } })
            break;
        }
        break;
      case 60:
        let newStateSchool = { ...this.state.school }
        switch (val) {
          case 'Info_school':
            this.setState({ school: { newStateSchool, info_school: true } })
            break;
          case 'Info_availability':
            this.setState({ school: { newStateSchool, info_availability: true } })
            break;
          default:
            this.setState({ school: { newStateSchool, change_password: true } })
            break;
        }
        break;
      case 30:
        let newStateProvider = { ...this.state.provider };
        switch (val) {
          case 'Info_profile':
            this.setState({ provider: { newStateProvider, info_profile: true } })
            break;
          case 'Info_services':
            this.setState({ provider: { newStateProvider, info_services: true } })
            break;
          case 'Info_availability':
            this.setState({ provider: { newStateProvider, info_availability: true } })
            break;
          case 'Subsidy_program':
            this.setState({ provider: { newStateProvider, subsidy_program: true } })
            break;
          case 'Day_work':
            this.setState({ provider: { newStateProvider, day_work: true } })
            break;
          default:
            this.setState({ provider: { newStateProvider, change_password: true } })
            break;
        }
        break;
      case 3:
        let newStateParent = { ...this.state.parent }
        switch (val) {
          case 'Info_child':
            this.setState({ parent: { newStateParent, info_child: true } })
            break;
          case 'Info_parent':
            this.setState({ parent: { newStateParent, info_parent: true } })
            break;
          case 'Info_progress':
            this.setState({ parent: { newStateParent, info_progress: true } })
            break;
          default:
            this.setState({ parent: { newStateParent, change_password: true } })
            break;
        }
        break;
    }
  }

  getScreen = () => {
    const { admin, school, parent, provider } = this.state;
    switch (user.role) {
      case 999:
        if (admin.info_admin) {
          return <InfoAdmin />
        } else {
          return <ChangePassword />
        }
      case 60:
        if (school.info_school) {
          return <InfoSchool />
        } else if (school.info_availability) {
          return <InfoAvaiSchool />
        } else {
          return <ChangePassword />
        }
      case 30:
        if (provider.info_profile) {
          return <InfoProfile />
        } else if (provider.info_availability) {
          return <InfoAvailability />
        } else if (provider.info_services) {
          return <InfoServices />
        } else if (provider.subsidy_program) {
          return <SubsidyProgram />
        } else if (provider.day_work) {
          return <DayWork />
        } else {
          return <ChangePassword />
        }
      case 3:
        if (parent.info_child) {
          return <InfoChild />
        } else if (parent.info_parent) {
          return <InfoParent />
        } else if (parent.info_progress) {
          return <InfoProgress />
        } else {
          return <ChangePassword />
        }
    }
  }

  render() {
    const { listMenu, keyActive } = this.state;

    return (
      <div className="full-layout page admin-page">
        <div className='div-content'>
          <section className='div-activity-feed box-card'>
            <Menu theme="light" mode="inline" defaultSelectedKeys={[keyActive]} items={listMenu} />
          </section>
          <section className='div-calendar box-card'>
            {this.getScreen()}
          </section>
        </div>
      </div>
    );
  }
}

