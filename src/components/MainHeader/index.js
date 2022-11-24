import React, { Component } from 'react';
import { Link } from 'dva/router';
import { FaUserAlt, FaUserEdit } from 'react-icons/fa';
import { BiChevronLeft, BiChevronRight, BiLogOutCircle, BiBell } from 'react-icons/bi';
import { BsSearch } from 'react-icons/bs';
import { Badge, Avatar, Button, Input, Menu, Dropdown } from 'antd';
import intl from "react-intl-universal";
import messages from './messages';
import './style/index.less';
import { routerLinks } from '../../routes/constant';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { removeUser } from '../../redux/features/authSlice';
import { MdOutlineSpaceDashboard } from 'react-icons/md';
import { GiNotebook } from 'react-icons/gi';
const scrollElement = React.createRef();

class MainHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : '',
    }
  }

  scrollTrans = (scrollOffset) => {
    scrollElement.current.scrollLeft += scrollOffset;
  }

  logout = () => {
    localStorage.removeItem('token');
    this.props.removeUser();
  }

  render() {
    const infoAuth = this.props.authData ?? '';
    const clientParent = this.props.authParent ?? '';
    const { user } = this.state;
    const items = [
      {
        key: '1',
        icon: <MdOutlineSpaceDashboard size={18} color='#495057' />,
        label: (
          <Link to={user?.role === 999 ? routerLinks.Appointments : routerLinks.Dashboard}>
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
    user.role != 3 && items.splice(3, 0, {
      key: '4',
      icon: <GiNotebook size={18} color='#495057' />,
      label: (
        <Link to={routerLinks.PrivateNote}>
          {intl.formatMessage(messages.privateNotes)}
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
            <p className='mb-0'>{this.state.user.username}</p>
            <p className='font-10 mb-0'>{user.role == 3 ? clientParent?.familyName : infoAuth?.name}</p>
          </div>
        </div>
        <div className='div-search'>
          <BsSearch size={18} />
          <Input placeholder={`${intl.formatMessage(messages.search)}...`} />
        </div>
        <div className='div-trans flex flex-row'>
          <Avatar size={36} className='trans-all'>All</Avatar>
          <Button
            type='text'
            className='trans-left' icon={<BiChevronLeft size={35} />}
            onClick={() => this.scrollTrans(-40)}
          />
          <div className='trans-scroll' ref={scrollElement}>
            <Avatar size={36} className='trans-item'>CMR</Avatar>
            <Avatar size={36} className='trans-item'>CR</Avatar>
            <Avatar size={36} className='trans-item'>MZR</Avatar>
            <Avatar size={36} className='trans-item'>DR</Avatar>
            <Avatar size={36} className='trans-item'>FR</Avatar>
            <Avatar size={36} className='trans-item'>SBR</Avatar>
            <Avatar size={36} className='trans-item'>SZR</Avatar>
            <Avatar size={36} className='trans-item'>EYR</Avatar>
            <Avatar size={36} className='trans-item'>KR</Avatar>
          </div>
          <Button
            type='text'
            className='trans-right' icon={<BiChevronRight size={35} />}
            onClick={() => this.scrollTrans(40)}
          />
          <div className='trans-new'>
            <p className='font-16 text-white mb-0'>{intl.formatMessage(messages.new).toUpperCase()}</p>
          </div>
        </div>
      </div>
    );
  }
}
const mapStateToProps = state => {
  return {
    authData: state.auth.authData,
    authParent: state.auth.authDataClientParent,
    authChild: state.auth.authDataClientChild
  }
}

export default compose(connect(mapStateToProps, { removeUser }))(MainHeader);
