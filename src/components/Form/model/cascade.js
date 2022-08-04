import React from 'react';
import { Cascader } from 'antd';
import $$ from 'cmn-utils';

/**
 * Cascading form components
 * initialValue Initial value
 */
export default ({
  name,
  form,
  record,
  formFieldOptions = {},
  normalize,
  initialValue,
  rules,
  onChange,
  preview,
  getPopupContainer,
  placeholder,
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
    if (otherProps.options && initval) {
      const data = [];
      let level = 0;
      const loop = opts => {
        opts.forEach(item => {
          if (item.value === initval[level]) {
            data.push(item.label);
            level += 1;
            if (item.children && initval[level]) {
              loop(item.children);
            }
          }
        });
      };
      loop(otherProps.options);
      return <div style={otherProps.style}>{data.join(' / ')}</div>;
    }
    return null;
  }

  // If there are rules
  if (rules && rules.length) {
    options.rules = rules;
  }

  // If you need onChange
  if (typeof onChange === 'function') {
    options.onChange = (value, selectedOptions) =>
      onChange(form, value, selectedOptions); // form, value, selectedOptions
  }

  const props = {
    placeholder: placeholder || `Please choose ${otherProps.title}`,
    ...otherProps
  };

  if (getPopupContainer) {
    props.getPopupContainer = getPopupContainer;
  }

  return getFieldDecorator(name, options)(
    <Cascader {...props} />
  );
};
