import React, { Component } from 'react';
import PropTypes from 'prop-types';
import $$ from 'cmn-utils';
import omit from 'object.omit';
import Editor from '../../Editor';

class EditorControlled extends Component {
  constructor(props) {
    super(props);
    const { value } = props;
    this.state = {
      value
    };
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const { value } = nextProps;
    if (this.props.value !== value) {
      this.setState({ value });
    }
  }

  triggerChange = value => {
    const {onChange} = this.props;
    if (onChange) {
      onChange(value);
    }
  };

  render() {
    const { value } = this.state;
    const otherProps = omit(this.props, 'value');

    return (
      <Editor value={value} onChange={this.triggerChange} {...otherProps} />
    );
  }
}

EditorControlled.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func
};

/**
 * EditorForm component
 */
export default ({
  form,
  name,
  formFieldOptions = {},
  record,
  initialValue,
  rules,
  onChange,
  normalize,
  preview,
  getPopupContainer,
  ...otherProps
}) => {
  const { getFieldDecorator } = form;
  const options = {...formFieldOptions};

  let initval = initialValue;

  if (record) {
    initval = record[name];
  }

  // If there is an initial value
  if (initval !== null && typeof initval !== 'undefined') {
    if ($$.isFunction(normalize)) {
      options.initialValue = normalize(initval);
    } else {
      options.initialValue = initval;
    }
  }

  if (preview) {
    return (
      <div
        style={otherProps.style}
      >
        {initval || ''}
      </div>
    );
  }

  // If there are rules
  if (rules && rules.length) {
    options.rules = rules;
  }

  // If you need onChange
  if (typeof onChange === 'function') {
    options.onChange = value => onChange(form, value); // form, value
  }

  return getFieldDecorator(name, options)(
    <EditorControlled {...otherProps} />
  );
};
