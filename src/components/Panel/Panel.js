import React, { Component } from 'react';
import cx from 'classnames';
import intl from "react-intl-universal";
import { Popconfirm, Modal } from 'antd';
import PropTypes from 'prop-types';
import {SyncOutlined, ShrinkOutlined, ExpandAltOutlined, PlusOutlined, MinusOutlined ,CloseOutlined} from '@ant-design/icons'
import CSSAnimate from '../CSSAnimate';
import './style/index.less';
import messages from './messages';
const {confirm} = Modal;
const noop = () => {};
/**
 * Panel assembly
 */
class Panel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapse: props.collapse || false,
      expand: props.expand || false,
      refresh: 0,
      animationName: ''
    };
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const st = {};
    if ('collapse' in nextProps) {
      st.collapse = true;
    } else if ('expand' in nextProps) {
      st.expand = true;
    }
    if (Object.keys(st).length) {
      this.setState(st);
    }
  }

  onExpand = expand => () => {
    const { onChange } = this.props;

    this.setState({
      expand,
      collapse: false
    });

    if (onChange) {
      onChange({
        expand,
        collapse: false
      });
    }
  };

  onCollapse = collapse => () => {
    const { onChange } = this.props;

    this.setState({
      collapse,
      expand: false
    });

    if (onChange) {
      onChange({
        collapse,
        expand: false
      });
    }
  };

  onRefresh = () => {
    const { refresh } = this.state;
    this.setState({
      refresh: refresh + 1,
      animationName: 'fadeIn'
    });
    this.props.onRefresh && this.props.onRefresh();
  };

  onClose = () => {
    const { expand } = this.state;
    if (expand) {
      confirm({
        title: intl.formatMessage(messages.prompt),
        content:  intl.formatMessage(messages.sureClose),
        onOk: () => {
          this.props.onClose && this.props.onClose();
        }
      });
    } else {
      this.props.onClose && this.props.onClose();
    }
  };

  render() {
    const { expand, collapse, refresh, animationName } = this.state;
    const {
      prefix,
      theme,
      className,
      title,
      width,
      height,
      style,
      children,
      header,
      cover,
      scroll,
      fit,
    } = this.props;

    const classnames = cx(prefix, className, {
      theme: !!theme,
      'panel-fullscreen': !!expand,
      'panel-collapsed': !!collapse,
      cover: !!cover
    });

    const styles = {
      ...style,
      width,
    };
    const bodyStyles = {};
    if (!expand) {
      bodyStyles.height = height;
    }
    if (scroll) {
      bodyStyles.overflow = 'auto';
    }

    const Header =
      typeof header === 'undefined' ? (
        <div className={`${prefix}-header`}>
          <span className={`${prefix}-header-title`}>{title}</span>
          <span className={`${prefix}-header-controls`}>
            <a role="presentation" className="panel-control-loader" onClick={this.onRefresh}>
              <SyncOutlined />
            </a>
            <a
              role="presentation"
              className="panel-control-fullscreen"
              onClick={this.onExpand(!expand)}
            >
              {`${expand ?  <ShrinkOutlined /> : <ExpandAltOutlined />}`}
            </a>
            <a
              role="presentation"
              className="panel-control-collapsed"
              onClick={this.onCollapse(!collapse)}
            >
              {`${collapse ? <PlusOutlined /> : <MinusOutlined />}`}
            </a>
            <Popconfirm
              title={intl.formatMessage(messages.sureClose)}
              onConfirm={this.onClose}
              placement="topRight"
            >
              <a
                role="presentation"
                className="panel-control-remove"
                onClick={expand ? this.onClose : noop}
              >
                <CloseOutlined />
              </a>
            </Popconfirm>
          </span>
        </div>
      ) : (
        header
      );

    return (
      <div className={classnames} style={styles}>
        {Header}
        <div className={`${prefix}-body`} style={bodyStyles}>
          <CSSAnimate
            className={`panel-content${fit ? ' fit' : ''}`}
            type={animationName}
            callback={() => this.setState({ animationName: '' })}
            key={refresh}
          >
            {children}
          </CSSAnimate>
        </div>
      </div>
    );
  }
}


Panel.propTypes = {
  collapse: PropTypes.bool,
  expand: PropTypes.bool,
  theme: PropTypes.bool,
  cover: PropTypes.bool,
  scroll: PropTypes.bool,
  prefix: PropTypes.string,
  className: PropTypes.string,
  title: PropTypes.any,
  width: PropTypes.number,
  height: PropTypes.number,
  style: PropTypes.string,
  onChange: PropTypes.func,
  onRefresh: PropTypes.func,
  onClose: PropTypes.func,
  children: PropTypes.node,
  header: PropTypes.node,
  fit: PropTypes.bool
};

Panel.defaultProps = {
  prefix: 'antui-panel',
  fit: false,
};


export default Panel;
