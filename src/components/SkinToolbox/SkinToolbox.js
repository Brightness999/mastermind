import './style/index.less';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import intl from "react-intl-universal";
import cx from 'classnames';
import { Tabs, Typography, } from 'antd';
import $$ from 'cmn-utils';
import SideBarBox from './SideBarBox';
import NavBarBox from './NavBarBox';
import LayoutBox from "./LayoutBox";
import messages from './messages';
import { SettingOutlined } from '@ant-design/icons';
const { TabPane } = Tabs;
const { Title } = Typography;

/**
 * Set the right side of the skin to slide the panel
 */
class SkinToolbox extends Component {

  constructor(props) {
    super(props);
    this.state = {
      collapsed: true,
    }
  }

  onChangeSideColor = e => {
    this.props.onChangeTheme({
      ...this.props.theme,
      leftSide: e.target.value
    });
  };

  onChangeNavBarColor = e => {
    this.props.onChangeTheme({
      ...this.props.theme,
      navbar: e.target.value
    });
  };

  onChangeLayout = value => {
    this.props.onChangeTheme({
      ...this.props.theme,
      layout: value,
    });
  };

  clearThemeStore = () => {
    $$.removeStore('theme');
  };

  /**
   * Switch skin settings panel
   */
  toggleSkinToolbox = () => {
    const { collapsed } = this.state;
    this.setState({
      collapsed: !collapsed
    });
  };

  render() {
    const { theme } = this.props;

    const classnames = cx('skin-toolbox', {
      'skin-toolbox-close': this.state.collapsed
    });

    return (
      <div className={classnames}>
        <div className="panel">
          <div role="presentation" className="panel-head" onClick={this.toggleSkinToolbox}>
            <span className="panel-icon">
              <SettingOutlined />
            </span>
            <span className="panel-title">{intl.formatMessage(messages.Setyourtheme)}</span>
          </div>
          <div className="panel-body">
            <Tabs defaultActiveKey="1" size="small">
              <TabPane tab={intl.formatMessage(messages.Navigationbar)} key="navbar">
                <Title level={4}>{intl.formatMessage(messages.Navigationbarstyle)}</Title>
                <NavBarBox theme={theme} onChange={this.onChangeNavBarColor} />
              </TabPane>
              <TabPane tab={intl.formatMessage(messages.Sidebar)} key="sidebar">
                <Title level={4}>{intl.formatMessage(messages.Navigationbarstyle)}</Title>
                <SideBarBox theme={theme} onChange={this.onChangeSideColor} />
              </TabPane>
              <TabPane tab={intl.formatMessage(messages.Layout)} key="misc">
                <Title level={4}>{intl.formatMessage(messages.Layoutstyle)}</Title>
                <LayoutBox theme={theme} onChange={this.onChangeLayout} />
              </TabPane>
            </Tabs>
          </div>
          <div className="panel-footer">
            <a role="presentation" className="btn-primary" onClick={this.clearThemeStore}>
              {intl.formatMessage(messages.Cleanupstorage)}
            </a>
          </div>
        </div>
      </div>
    );
  }
}

SkinToolbox.propTypes = {
  onChangeTheme: PropTypes.func,
  theme: PropTypes.object,
};

export default SkinToolbox;
