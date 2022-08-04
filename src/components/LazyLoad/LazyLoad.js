import React, { Component } from 'react';
import PropTypes from 'prop-types';
import lazySizes from 'lazysizes';
import cx from 'classnames';
import $$ from 'cmn-utils';
import './style/index.less';

class LazyLoad extends Component {
  componentWillUpdate(nextProps, nextState, nextContext) {
    let propsChanged = false;
    for (const propName of [
      'src',
      'dataSizes',
      'dataSrc',
      'dataSrcSet',
      'className',
      'iframe'
    ]) {
      const prop =
        propName === 'dataSrcSet'
          ? LazyLoad.handleSrcSet(this.props[propName])
          : this.props[propName];
      const nextProp =
        propName === 'dataSrcSet'
          ? LazyLoad.handleSrcSet(nextProps[propName])
          : nextProps[propName];
      if (prop !== nextProp) {
        propsChanged = true;
        break;
      }
    }
    if (propsChanged && lazySizes) {
      if (lazySizes.hC(this.node, 'lazyloaded')) {
        lazySizes.rC(this.node, 'lazyloaded');
      }
    }
  }

  static handleSrcSet(dataSrcSet) {
    if ($$.isArray(dataSrcSet)) {
      return dataSrcSet.join(',');
    } if (typeof dataSrcSet === 'string') {
      return dataSrcSet;
    }
    return null;

  }

  componentDidUpdate = () => {
    if (!lazySizes) {
      return;
    }
    if (
      !lazySizes.hC(this.node, 'lazyloaded') &&
      !lazySizes.hC(this.node, 'lazyload')
    ) {
      lazySizes.aC(this.node, 'lazyload');
    }
  };

  componentWillUnmount() {
    this.node.src = '';
  }

  static onError(e) {
    e.target.classList.add('lazyerror');
    e.target.src =
      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  }

  render() {
    const {
      prefixCls,
      src,
      dataSizes,
      dataSrc,
      dataSrcSet,
      className,
      iframe,
      title,
      alt,
      ...otherProps
    } = this.props;

    const classNames = cx(prefixCls, 'lazyload', className);

    const lazyProps = { ...otherProps, src };
    if (dataSrc) lazyProps['data-src'] = dataSrc;
    if (dataSizes) lazyProps['data-sizes'] = dataSizes;
    if (dataSrcSet) {
      lazyProps['data-srcset'] = LazyLoad.handleSrcSet(dataSrcSet);
    }

    if (iframe) {
      // noinspection HtmlDeprecatedAttribute
      return (
        <iframe
          ref={node => { this.node = node }}
          className={classNames}
          title={title}
          frameBorder="0"
          {...lazyProps}
        />
      );
    }
    // noinspection HtmlDeprecatedAttribute
    return (
      <img
        ref={node => { this.node = node }}
        className={classNames}
        alt={alt}
        onError={LazyLoad.onError}
        {...lazyProps}
      />
    );
  }
}

LazyLoad.propTypes = {
  src: PropTypes.string,
  dataSizes: PropTypes.string,
  dataSrc: PropTypes.string,
  dataSrcSet: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  className: PropTypes.string,
  prefixCls: PropTypes.string,
  title: PropTypes.string,
  alt: PropTypes.string,
  iframe: PropTypes.bool
};

LazyLoad.defaultProps = {
  src:
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  dataSizes: 'auto',
  iframe: false,
  prefixCls: 'antui-lazyload'
};

export default LazyLoad;
