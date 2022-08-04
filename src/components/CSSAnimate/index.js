import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import cssAnimate, { isCssAnimationSupported } from 'css-animation';
import cx from 'classnames';
import omit from 'object.omit';

class CSSAnimate extends PureComponent {
  componentDidMount() {
    const { type, callback } = this.props;
    this.animate(type, callback);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { type, callback } = this.props;
    this.animate(type, callback);
  }

  animate = (type, callback) => {
    const node = ReactDOM.findDOMNode(this);

    if (isCssAnimationSupported && type) {
      cssAnimate(node, type, callback);
    } else if (!isCssAnimationSupported) {
      // console.warn('Does not support css animation');
    }
  };

  render() {
    const { className, children, delay, duration, style, ...otherProps } = this.props;
    const classnames = cx(
      'animated',
      className
    );
    const _style = {...style};
    if (duration) {
      _style.animationDuration = `${duration  }ms`;
      _style.WebkitAnimationDuration = `${duration  }ms`;
    }

    if (delay) {
      _style.animationDelay = `${delay  }ms`;
      _style.WebkitAnimationDelay = `${delay  }ms`;
    }

    const divProps = omit(otherProps, ['type', 'callback', 'delay', 'duration']);

    return (
      <div className={classnames} {...divProps} style={_style}>
        {children}
      </div>
    );
  }
}

CSSAnimate.propTypes = {
  type: PropTypes.string, // Animation name
  callback: PropTypes.func, // Callback function at the end of the animation
  duration: PropTypes.number, // Animation duration
  delay: PropTypes.number, // Animation delay
  style: PropTypes.object,
  className: PropTypes.string,
  children: PropTypes.any,
};

export default CSSAnimate;
