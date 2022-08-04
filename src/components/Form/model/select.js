import React from 'react';
import { Select } from 'antd';
import $$ from 'cmn-utils';
/**
 * Drop-down menu component
 */
export default ({
  form,
  name,
  dict = [],
  formFieldOptions = {},
  record,
  initialValue,
  rules,
  onChange,
  normalize,
  getPopupContainer,
  placeholder,
  preview,
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

  // Preview view
  if (preview) {
    const _initval = $$.isArray(initval) ? initval : [initval];
    const dictObj = dict.filter(item => _initval.indexOf(item.code) !== -1);
    let text = '';
    if (dictObj.length) {
      text = dictObj.map(item => item.codeName).join(',');
    }
    return <div style={otherProps.style}>{text}</div>;
  }

  // If there are rules
  if (rules && rules.length) {
    options.rules = rules;
  }

  // If you need onChange
  if (typeof onChange === 'function') {
    options.onChange = value => onChange(form, value); // form, value
  }

  const props = {
    placeholder: placeholder || `Please choose ${otherProps.title}`,
    ...otherProps
  };

  if (getPopupContainer) {
    props.getPopupContainer = getPopupContainer;
  }

  return getFieldDecorator(name, options)(
    <Select {...props}>
      {dict.map((dic) => (
        <Select.Option key={dic.code} value={dic.code} title={dic.codeName}>
          {dic.codeName}
        </Select.Option>
      ))}
    </Select>
  );
};
