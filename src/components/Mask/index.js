import './style/index.less';
import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import cssAnimate, { isCssAnimationSupported } from 'css-animation';
import cx from 'classnames';
import $$ from 'cmn-utils';
import PropTypes from 'prop-types';
import { CloseOutlined } from '@ant-design/icons';
const noop = () => {};

class Mask extends PureComponent {
  componentDidMount() {
    const { visible, getContainer } = this.props;
    this.container = document.createElement('div');
    if ($$.isFunction(getContainer)) {
      const mountNode = getContainer(ReactDOM.findDOMNode(this));
      mountNode.appendChild(this.container);
    } else {
      document.body.appendChild(this.container);
    }
    this.toggle(visible);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { visible } = this.props;
    this.toggle(visible);
  }

  componentWillUnmount() {
    this.container.parentNode.removeChild(this.container);
  }

  toggle = visible => {
    const {node} = this;
    if (!node) return;
    if (visible) node.style.display = 'block';

    if (isCssAnimationSupported) {
      cssAnimate(node, `fade${visible ? 'In' : 'Out'}`, () => {
        node.style.display = visible ? 'block' : 'none';
      });
    } else {
      node.style.display = visible ? 'block' : 'none';
    }
  };

  onClick = e => {
    const { onClose, prefixCls } = this.props;

    if (
      (e.target.classList.contains(prefixCls) ||
        e.target.classList.contains(`${prefixCls  }-close`)) &&
      onClose
    ) {
      onClose(e);
    }
  };

  render() {
    const {
      children,
      className,
      prefixCls,
      closable,
      maskClosable
    } = this.props;

    if (this.container) {
      return ReactDOM.createPortal(
        <div
          role="presentation"
          ref={node => { this.node = node }}
          className={cx(prefixCls, 'animated', 'animated-short', className)}
          onClick={maskClosable ? this.onClick : noop}
        >
          {closable ? (
            <CloseOutlined className={`${prefixCls}-close`} onClick={this.onClick}/>
          ) : null}
          {children}
        </div>,
        this.container
      );
    }

    return <div />;
  }
}

Mask.propTypes = {
  prefixCls: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
  maskClosable: PropTypes.bool,
  closable: PropTypes.bool,
  visible: PropTypes.bool,
  getContainer: PropTypes.func,
  onClose: PropTypes.func,
};

Mask.defaultProps = {
  prefixCls: 'basic-mask',
  maskClosable: true
};

export default Mask;
