import React from 'react';
import { Input } from 'antd';
import $$ from 'cmn-utils';
const { TextArea } = Input;
/**
 * Text box component
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
  type,
  preview,
  placeholder,
  getPopupContainer,
  ...otherProps
}) => {
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
    if (type === 'hidden') return null;
    return <div style={otherProps.style}>{initval || ''}</div>;
  }

  // If there are rules
  if (rules && rules.length) {
    options.rules = rules;
  }

  // If you need onChange
  if (typeof onChange === 'function') {
    options.onChange = e => onChange(form, e.target.value, e); // form, value, event
  }

  const Comp = type === 'textarea' ? TextArea : Input;

  const tempProps = { ...otherProps };

  delete tempProps.render;

  const props = {
    autoComplete: 'off',
    type,
    placeholder: placeholder || `Please enter ${otherProps.title}`,
    ...tempProps
  };

  // return getFieldDecorator(name, options)(<Comp {...props} />);
  return <Comp {...props} />;
};
