import React, {PureComponent} from 'react';
import intl from 'react-intl-universal';
import PropTypes from 'prop-types';
import {Popover, Badge, Avatar} from 'antd';
import {Link} from 'dva/router';
import cx from 'classnames';

import {routerLinks} from "../../routes/constant";
import './style/index.less';
import {
    MenuOutlined,
    DownOutlined,
    SearchOutlined,
    FullscreenOutlined,
    MailOutlined,
    TeamOutlined,
    SettingFilled,
    BellFilled,
    LogoutOutlined
} from '@ant-design/icons'
import SearchBox from './SearchBox';
import messages from './messages';
import {ReactComponent as IconLanguage} from '../../assets/images/languages.svg';
import {appLocales} from '../../i18n';

/**
 * Head office area
 */
class NavBar extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            openSearchBox: false
        };
    }

    toggleFullScreen() {
        if (
            !document.fullscreenElement &&
            !document.mozFullScreenElement &&
            !document.webkitFullscreenElement &&
            !document.msFullscreenElement
        ) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(
                    Element.ALLOW_KEYBOARD_INPUT
                );
            }
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }

    onCloseSearchBox = () => {
        this.setState({
            openSearchBox: false
        });
    };

    onOpenSearchBox = () => {
        this.setState({
            openSearchBox: true
        });
    };

    render() {
        const {openSearchBox} = this.state;
        const {
            fixed,
            theme,
            onCollapseLeftSide,
            toggleSidebarHeader,
            user,
            collapsed,
            isMobile,
            language,
            onChangeLanguage,
        } = this.props;

        const classnames = cx('navbar', {
            'navbar-fixed-top': !!fixed,
            'navbar-sm': isMobile ? true : !collapsed,
            [`bg-${theme}`]: !!theme
        });

        return (
            <header className={classnames}>
                <div className="navbar-branding">
                    <Link className="navbar-brand" to="/">
                        <img src="/images/logoAct.png" alt="logo"/>
                        <b>ACT</b>
                        Admin
                    </Link>
                    <span role="presentation" className="toggle-sidemenu-l" onClick={onCollapseLeftSide}>
                        <MenuOutlined/>
                    </span>
                </div>
                <ul className="nav navbar-nav navbar-left clearfix">
                    <li role="presentation" onClick={this.toggleFullScreen}>
                        <a className="request-fullscreen">
                            <FullscreenOutlined/>
                        </a>
                    </li>
                </ul>
                <ul className="nav navbar-nav navbar-right clearfix">
                    {/* <li className="dropdown icon-svg">
                        <Popover
                            placement="bottomRight"
                            title={intl.formatMessage(messages.changeLanguage)}
                            overlayClassName={cx('navbar-popup', {[theme]: !!theme})}
                            content={<LanguageDropDown language={language} onChangeLanguage={onChangeLanguage}/>}
                            trigger="click"
                        >
                            <a role="presentation" className="dropdown-toggle">
                                <IconLanguage width={22} height={22}/>
                            </a>
                        </Popover>
                    </li> */}
                    {/*<li className="dropdown">*/}
                    {/*  <Popover*/}
                    {/*    placement="bottomRight"*/}
                    {/*    title= {intl.formatMessage(messages.notification)}*/}
                    {/*    overlayClassName={cx('navbar-popup', { [theme]: !!theme })}*/}
                    {/*    content=""*/}
                    {/*    trigger="click"*/}
                    {/*  >*/}
                    {/*    <a role="presentation" className="dropdown-toggle">*/}
                    {/*      <Icon type="radio-tower" />*/}
                    {/*    </a>*/}
                    {/*  </Popover>*/}
                    {/*</li>*/}
                    <li className="dropdown">
                        <Popover
                            placement="bottomRight"
                            // title={`WELCOME ${user.userName}`}
                            overlayClassName={cx('navbar-popup', {[theme]: !!theme})}
                            content={<UserDropDown/>}
                            trigger="click"
                        >
                            <a role="presentation" className="dropdown-toggle">
                                <Badge dot>
                                    <Avatar src='../images/user.png'>
                                        {user.userName}
                                    </Avatar>
                                </Badge>
                            </a>
                        </Popover>
                    </li>
                </ul>
                <SearchBox visible={openSearchBox} onClose={this.onCloseSearchBox}/>
            </header>
        );
    }
}

const UserDropDown = () => (
    <ul className="dropdown-menu list-group dropdown-persist">
        {/* <li className="list-group-item">
            <a className="animated animated-short fadeInUp">
                <MailOutlined/> {intl.formatMessage(messages.information)}
                <Badge count={5} className="label"/>
            </a>
        </li>
        <li className="list-group-item">
            <a className="animated animated-short fadeInUp">
                <TeamOutlined/> {intl.formatMessage(messages.friend)}
                <Badge count={6} className="label"/>
            </a>
        </li>
        <li className="list-group-item">
            <a className="animated animated-short fadeInUp">
                <SettingFilled/> {intl.formatMessage(messages.acountSetting)}
            </a>
        </li>
        <li className="list-group-item">
            <a className="animated animated-short fadeInUp">
                <BellFilled/> {intl.formatMessage(messages.notification)}
            </a>
        </li> */}
        <li className="list-group-item dropdown-footer">
            <Link to={routerLinks['Login']}>
                <LogoutOutlined/> {intl.formatMessage(messages.logOut)}
            </Link>
        </li>
    </ul>
);

const LanguageDropDown = ({language, onChangeLanguage}) => (
    <ul className="dropdown-menu list-group dropdown-persist">
        {appLocales.map(item => (
            <li key={item} className="list-group-item">
                <a
                    className={`animated animated-short fadeInUp${language === item ? ' active' : ''}`}
                    onClick={() => onChangeLanguage(item)}
                    onKeyUp={() => onChangeLanguage(item)}
                    role="button"
                    tabIndex="0"
                >
                    {intl.formatMessage(messages[item])}
                </a>
            </li>
        ))}
    </ul>
);

LanguageDropDown.propTypes = {
    language: PropTypes.string,
    onChangeLanguage: PropTypes.func,
};

NavBar.propTypes = {
    theme: PropTypes.string,
    language: PropTypes.string,
    fixed: PropTypes.bool,
    collapsed: PropTypes.bool,
    isMobile: PropTypes.bool,
    onCollapseLeftSide: PropTypes.func,
    toggleSidebarHeader: PropTypes.func,
    onChangeLanguage: PropTypes.func,
    user: PropTypes.any,
};

NavBar.defaultProps = {
    fixed: true,
    theme: '' // 'bg-dark',
};

export default NavBar;
