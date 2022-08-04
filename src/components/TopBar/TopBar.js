import React, {Component} from 'react';
import {Breadcrumb, Row, Col} from 'antd';
import PropTypes from 'prop-types';
import intl from "react-intl-universal";
import {Link} from 'dva/router';
import cx from 'classnames';
import {
    MessageOutlined,
    UserOutlined,
    CustomerServiceOutlined,
    ToolOutlined,
    VideoCameraOutlined,
    PictureFilled,
    HomeOutlined
} from '@ant-design/icons'
import CSSAnimate from '../CSSAnimate';
import Mask from '../Mask';
import './style/index.less';
import messages from './messages';

class TopBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentRoute: this.getRouteLevel(props.location.pathname) || []
        };
    }

    componentWillReceiveProps(nextProps, nextContext) {
        const currentRoute = this.getRouteLevel(nextProps.location.pathname);

        this.setState({
            currentRoute
        });
    }

    getRouteLevel = pathName => {
        const orderPaths = [];
        pathName.split('/').reduce((prev, next) => {
            const path = [prev, next].join('/');
            orderPaths.push(path);
            return path;
        });

        return orderPaths
            .map(item => window.dva_router_pathMap[item])
            .filter(item => !!item);
    };

    render() {
        const {
            expand,
            collapsedRightSide,
            toggleRightSide,
            onCollapse,
            rightSideBar
        } = this.props;
        const {currentRoute} = this.state;
        const classnames = cx('topbar', {
            'topbar-expand': expand
        });

        return (
            <div className={classnames}>
                <div className="topbar-dropmenu">
                    <Row gutter={22}>
                        <Col xs={8} md={4}>
                            <CSSAnimate
                                className="animated-short"
                                type={expand ? 'fadeInDown' : 'fadeOutUp'}
                            >
                                <a className="metro-tile">
                                    <MessageOutlined/>
                                    <span
                                        className="metro-title">{intl.formatMessage(messages.information)}</span>
                                </a>
                            </CSSAnimate>
                        </Col>
                        <Col xs={8} md={4}>
                            <CSSAnimate
                                className="animated-short"
                                type={expand ? 'fadeInDown' : 'fadeOutUp'}
                            >
                                <a className="metro-tile">
                                    <UserOutlined/>
                                    <span className="metro-title">{intl.formatMessage(messages.user)}</span>
                                </a>
                            </CSSAnimate>
                        </Col>
                        <Col xs={8} md={4}>
                            <CSSAnimate
                                className="animated-short"
                                type={expand ? 'fadeInDown' : 'fadeOutUp'}
                            >
                                <a className="metro-tile">
                                    <CustomerServiceOutlined/>
                                    <span className="metro-title">{intl.formatMessage(messages.support)}</span>
                                </a>
                            </CSSAnimate>
                        </Col>
                        <Col xs={8} md={4}>
                            <CSSAnimate
                                className="animated-short"
                                type={expand ? 'fadeInDown' : 'fadeOutUp'}
                            >
                                <a className="metro-tile">
                                    <ToolOutlined/>
                                    <span className="metro-title">{intl.formatMessage(messages.setting)}</span>
                                </a>
                            </CSSAnimate>
                        </Col>
                        <Col xs={8} md={4}>
                            <CSSAnimate
                                className="animated-short"
                                type={expand ? 'fadeInDown' : 'fadeOutUp'}
                            >
                                <a className="metro-tile">
                                    <VideoCameraOutlined/>
                                    <span className="metro-title">{intl.formatMessage(messages.Video)}</span>
                                </a>
                            </CSSAnimate>
                        </Col>
                        <Col xs={8} md={4}>
                            <CSSAnimate
                                className="animated-short"
                                type={expand ? 'fadeInDown' : 'fadeOutUp'}
                            >
                                <a className="metro-tile">
                                    <PictureFilled/>
                                    <span className="metro-title">{intl.formatMessage(messages.Image)}</span>
                                </a>
                            </CSSAnimate>
                        </Col>
                    </Row>
                </div>
                <header className="topbar-content">
                    {currentRoute.length ? (
                        <div style={{float: 'left'}}>
                            <span className="first">{currentRoute[currentRoute.length - 1].title}</span>
                        </div>
                    ) : null}
                    {!!rightSideBar && (
                        <a
                            role="presentation"
                            className={cx('topbar-right', {collapse: collapsedRightSide})}
                            onClick={toggleRightSide}
                        >
                            {/*<Icon type="into"/>*/}
                            Text
                        </a>
                    )}
                </header>
                <Mask
                    visible={expand}
                    onClose={onCollapse}
                    getContainer={node => node.parentNode}
                />
            </div>
        );
    }
}

TopBar.propTypes = {
    location: PropTypes.object,
    expand: PropTypes.bool,
    collapsedRightSide: PropTypes.bool,
    toggleRightSide: PropTypes.func,
    onCollapse: PropTypes.func,
    rightSideBar: PropTypes.bool
};

export default TopBar;