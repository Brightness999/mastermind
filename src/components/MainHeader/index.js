import React, { Component } from 'react';
import { Link } from 'dva/router';
import { FaChild, FaUserAlt, FaUserEdit } from 'react-icons/fa';
import { BiLogOutCircle, BiBell } from 'react-icons/bi';
import { BsSearch } from 'react-icons/bs';
import { Badge, Avatar, Input, Menu, Dropdown } from 'antd';
import intl from "react-intl-universal";
import messages from './messages';
import './style/index.less';
import { routerLinks } from '../../routes/constant';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { removeUser } from '../../redux/features/authSlice';
import { MdOutlineSpaceDashboard } from 'react-icons/md';

class MainHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  logout = () => {
    localStorage.removeItem('token');
    this.props.removeUser();
  }

  render() {
    const { user, community } = this.props;
    const items = [
      {
        key: '1',
        icon: <MdOutlineSpaceDashboard size={18} color='#495057' />,
        label: (
          <Link to={user?.role > 900 ? routerLinks.Admin : routerLinks.Dashboard}>
            {intl.formatMessage(messages.dashboard)}
          </Link>
        ),
      },
      {
        key: '2',
        icon: <FaUserEdit size={18} color='#495057' />,
        label: (
          <Link to={routerLinks.Changeprofile}>
            {intl.formatMessage(messages.editProfile)}
          </Link>
        ),
      },
      {
        key: '3',
        icon: <Badge size="small" count={6}><BiBell size={18} color='#495057' /></Badge>,
        label: (
          <Link to={routerLinks.Notification}>
            {intl.formatMessage(messages.notification)}
          </Link>
        ),
      },
      {
        key: '5',
        icon: <BiLogOutCircle size={18} color='#495057' />,
        label: (
          <Link to='/' onClick={this.logout}>
            {intl.formatMessage(messages.logOut)}
          </Link>
        ),
      },
    ]
    user.role < 900 && items.splice(3, 0, {
      key: '4',
      icon: <FaChild size={18} color='#495057' />,
      label: (
        <Link to={routerLinks.PrivateNote}>
          {intl.formatMessage(messages.dependentList)}
        </Link>
      ),
    });
    const menu = (<Menu items={items} />);

    return (
      <div className='component-mainheader'>
        <div className='div-account'>
          <div className='account-icon'>
            <Dropdown overlay={menu} placement="bottomLeft">
              <Badge size="small" count={6}>
                <Avatar icon={<FaUserAlt size={17} className='text-white' />} />
              </Badge>
            </Dropdown>
          </div>
          <div className='account-name'>
            <p className='mb-0'>{user?.fullName ?? user?.username}</p>
          </div>
          <div className='font-16 ml-20'>{community?.community?.name}</div>
        </div>
        <div className='div-search'>
          <BsSearch size={18} />
          <Input placeholder={`${intl.formatMessage(messages.search)}...`} />
        </div>
      </div>
    );
  }
}
const mapStateToProps = state => {
  return {
    user: state.auth.user,
    community: state.auth.currentCommunity,
  };
}

export default compose(connect(mapStateToProps, { removeUser }))(MainHeader);
