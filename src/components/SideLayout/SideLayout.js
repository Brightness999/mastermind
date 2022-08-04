import './style/index.less';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';
import intl from "react-intl-universal";
import cx from 'classnames';
import messages from './messages';
import {CaretLeftOutlined, CaretRightOutlined, FolderOutlined } from '@ant-design/icons'
const { Content, Sider } = Layout;

class SideLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openSide: true
    };
  }

  toggle = e => {
    const { openSide } = this.state;
    e.stopPropagation();
    e.preventDefault();

    this.setState({
      openSide: !openSide
    });
  };

  render() {
    const {
      prefixCls,
      className,
      sideContent,
      children,
      title,
      width
    } = this.props;
    const { openSide } = this.state;
    return (
      <Layout className={cx(prefixCls, className)}>
        <Sider
          trigger={null}
          collapsible
          collapsed={!openSide}
          collapsedWidth={0}
          width={width}
        >
          <a role="presentation" className="side-handle" onClick={this.toggle} title={openSide ? intl.formatMessage(messages.Collapse) : intl.formatMessage(messages.Expand)}>
            {openSide ? <CaretLeftOutlined /> :<CaretRightOutlined />} />
          </a>
          <div
            className="side-body"
            style={!openSide ? { width: 0 } : { width }}
          >
            <div className="side-panel">
              <div className="panel-header">
                <FolderOutlined />
                &nbsp;
                <strong>{title}</strong>
              </div>
              <div className="panel-body">{sideContent}</div>
            </div>
          </div>
        </Sider>
        <Content>{children}</Content>
      </Layout>
    );
  }
}

SideLayout.propTypes = {
  className: PropTypes.string,
  prefixCls: PropTypes.string,
  width: PropTypes.number,
  title: PropTypes.string,
  sideContent: PropTypes.node,
  children: PropTypes.node,
};

SideLayout.defaultProps = {
  prefixCls: 'antui-side-layout',
  width: 180
};

export default SideLayout;
