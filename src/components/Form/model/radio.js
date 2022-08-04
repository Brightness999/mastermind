import React from 'react';
import { Radio } from 'antd';
import $$ from 'cmn-utils';
const RadioGroup = Radio.Group;
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
  buttonStyle,
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

  // Preview view
  if (preview) {
    const dictObj = dict.filter(item => item.code === initval)[0];
    let text = '';
    if (dictObj) {
      text = dictObj.codeName;
    }
    return <div style={otherProps.style}>{text}</div>;
  }

  // If there are rules
  if (rules && rules.length) {
    options.rules = rules;
  }

  // If you need onChange
  if (typeof onChange === 'function') {
    options.onChange = e => onChange(form, e.target.value, e); // form, value
  }

  let RadioComp = Radio;
  if (buttonStyle === 'solid') { // noinspection JSUnusedAssignment
    RadioComp = Radio.Button;
  }

  return getFieldDecorator(name, options)(
    <RadioGroup {...otherProps}>
      {dict.map((dic) => (
        <RadioComp key={dic.code} value={dic.code} title={dic.codeName}>
          {dic.codeName}
        </RadioComp>
      ))}
    </RadioGroup>
  );
};
