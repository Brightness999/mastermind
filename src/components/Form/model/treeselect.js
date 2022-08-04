import React from 'react';
import { TreeSelect } from 'antd';
import $$ from 'cmn-utils';

/**
 * Drop-down tree menu component
 */
export const TreeSelectForm = ({
  form,
  name,
  formFieldOptions = {},
  children,
  record,
  initialValue,
  normalize,
  rules,
  onChange,
  getPopupContainer,
  placeholder,
  ...otherProps
}) => {
  // --
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

  // If there is a rules
  if (rules && rules.length) {
    options.rules = rules;
  }

  // If you need onChange
  if (typeof onChange === 'function') {
    options.onChange = (value, label, extra) =>
      onChange(form, value, label, extra); // form, value
  }

  const props = {
    placeholder: placeholder || `Please choose ${otherProps.title}`,
    ...otherProps
  };

  if (getPopupContainer) {
    props.getPopupContainer = getPopupContainer;
  }

  return getFieldDecorator(name, options)(
    <TreeSelect {...props} />
  );
};

export default TreeSelectForm;
