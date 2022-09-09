import React, { Component, useRef } from 'react';
import { Link } from 'dva/router';
import { FaUserAlt, FaUserEdit } from 'react-icons/fa';
import { BiChevronLeft, BiChevronRight, BiLogOutCircle, BiBell } from 'react-icons/bi';
import { BsSearch } from 'react-icons/bs';
import { Badge, Avatar, Button, Input, Menu, Dropdown} from 'antd';
import intl from "react-intl-universal";
import messages from './messages';
import './style/index.less';
import { routerLinks } from '../../routes/constant';
import { connect } from 'react-redux';
import { compose } from 'redux';
const scrollElement = React.createRef();
class MainHeader extends Component {

  constructor(props) {
    super(props);
    this.state = {
      user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : '',
    }

  }

  componentDidMount() {
  }

  scrollTrans = (scrollOffset) => {
    scrollElement.current.scrollLeft += scrollOffset;
  }

  logout = ()=>{
    localStorage.removeItem('token');
    // this.props.history.push('/');
  }
  render() {
    console.log(this.props,'props')
    const infoAuth  = this.props.authData ?? '';
    const clientParent = this.props.authParent ?? '';
    const {user} = this.state;
    const menu = (
      <Menu
        items={[
          {
            key: '1',
            icon: <FaUserEdit size={18} color='#495057'/>,
            label: (
              <Link to={routerLinks.Changeprofile}>
                Change Infomation
              </Link>
            ),
          },
          {
            key: '2',
            icon: <Badge size="small" count={6}><BiBell size={18} color='#495057'/></Badge>,
            label: (
              <a href='#'>
                Notification
              </a>
            ),
          },
          {
            key: '3',
            icon: <BiLogOutCircle size={18} color='#495057'/>,
            label: (
              <Link to='/' onClick={this.logout}>
                Log Out
              </Link>
            ),
          },
        ]}
      />
    );
    return (
      <div className='component-mainheader'>
        <div className='div-account'>
          <div className='account-icon'>
            <Dropdown overlay={menu} placement="bottomLeft">
              <Badge size="small" count={6}>
                <Avatar icon={<FaUserAlt size={17} className='text-white'/>} />
              </Badge>
            </Dropdown>
          </div>
          <div className='account-name'>
            <p className='mb-0'>{this.state.user.username}</p>
            <p className='font-10 mb-0'>{ user.role == 3 ? clientParent?.familyName : infoAuth?.name  }</p>
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
    authChild : state.auth.authDataClientChild
  }
}
export default compose(connect(mapStateToProps))(MainHeader);
