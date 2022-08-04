import React from 'react';
import { InputNumber } from 'antd';
import $$ from 'cmn-utils';
/**
 * Digital input frame component
 */
export default ({
  form,
  name,
  formFieldOptions = {},
  record,
  initialValue,
  normalize,
  rules,
  onChange,
  preview,
  placeholder,
  getPopupContainer,
  type,
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
    return <div style={otherProps.style}>{initval || ''}</div>;
  }

  // If there are rules
  if (rules && rules.length) {
    options.rules = rules;
  }

  // If you need onChange
  if (typeof onChange === 'function') {
    options.onChange = value => onChange(form, value); // form, value, event
  }

  const tempProps = { ...otherProps };

  delete tempProps.render;

  const props = {
    placeholder: placeholder || `Please enter ${otherProps.title}`,
    ...tempProps
  };

  return getFieldDecorator(name, options)(<InputNumber {...props} />);
};
