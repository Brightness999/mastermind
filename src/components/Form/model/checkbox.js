import React from 'react';
import { Checkbox } from 'antd';
import $$ from 'cmn-utils';
import omit from 'object.omit';

const CheckboxGroup = Checkbox.Group;
/**
 * Single box
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
  buttonStyle = 'solid',
  getPopupContainer,
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

  // If there are rules
  if (rules && rules.length) {
    options.rules = rules;
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

  // If you need onChange
  if (typeof onChange === 'function') {
    options.onChange = e => onChange(form, e.target.value, e); // form, value
  }

  const checkboxProps = omit(otherProps, 'allowClear');
  return getFieldDecorator(name, options)(
    <CheckboxGroup {...checkboxProps}>
      {dict.map((dic) => (
        <Checkbox key={dic.code} value={dic.code} title={dic.codeName}>
          {dic.codeName}
        </Checkbox>
      ))}
    </CheckboxGroup>
  );
};
