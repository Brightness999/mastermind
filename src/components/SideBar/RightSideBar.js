import React, { PureComponent } from 'react';
import cx from 'classnames';
import { Layout, Drawer } from 'antd';
import PropTypes from 'prop-types';

import './style/index.less';
const { Sider } = Layout;

class RightSideBar extends PureComponent {

  render() {
    const { fixed, theme, collapsed, isMobile, onCollapse } = this.props;

    const classnames = cx('sidebar-right', {
      affix: !!fixed,
      'sidebar-right-close': collapsed,
      [theme]: !!theme
    });

    const siderBar = (
      <Sider
        className={classnames}
        width={300}
        collapsedWidth={0}
        collapsible
        collapsed={collapsed}
        trigger={null}
      >
        <div className="sidebar-right-content" />
      </Sider>
    );

    return isMobile ? (
      <Drawer
        className=""
        onClose={onCollapse}
        visible={!collapsed}
        placement="right"
        width={300}
      >
        {siderBar}
      </Drawer>
    ) : (
      siderBar
    );
  }
}


RightSideBar.propTypes = {
  fixed: PropTypes.bool,
  collapsed: PropTypes.bool,
  isMobile: PropTypes.bool,
  theme: PropTypes.string,
  onCollapse: PropTypes.func,
};

RightSideBar.defaultProps = {
  fixed: true,
  theme: ''
};

export default RightSideBar;
