import React from 'react';
import { DatePicker, TimePicker } from 'antd';
import $$ from 'cmn-utils';
import moment from 'moment';
const { MonthPicker, RangePicker } = DatePicker;
/**
 * Date, time component
 */
export default ({
  name,
  form,
  type,
  record,
  initialValue,
  rules,
  formFieldOptions = {},
  format,
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
    } else if ($$.isArray(initval)) {
      options.initialValue = initval.map(item => moment.isMoment(item) ? item : moment(item))
    } else {
      options.initialValue = moment.isMoment(initval) ? initval : moment(initval);
    }
  }

  // If there are rules
  if (rules && rules.length) {
    options.rules = rules;
  }

  let Component = DatePicker;

  const props = {
    ...otherProps
  };

  if (getPopupContainer) {
    props.getCalendarContainer = getPopupContainer;
  }

  switch (type) {
    case 'date':
      break;
    case 'datetime':
      if (!props.showTime) {
        props.showTime = true;
      }
      break;
    case 'date~':
      Component = RangePicker;
      break;
    case 'month':
      Component = MonthPicker;
      break;
    case 'time':
      Component = TimePicker;
      break;
    default:
      break;
  }

  // If you need onChange
  if (typeof onChange === 'function') {
    options.onChange = (date, dateString) =>
      onChange(form, date, dateString);
  }

  if (format) props.format = format;
  else if (type === 'month') props.format = 'YYYY-MM';
  else if (type === 'datetime' || type === 'date~')
    props.format = 'YYYY-MM-DD HH:mm:ss';
  else if (type === 'time') props.format = 'HH:mm:ss';
  else props.format = 'YYYY-MM-DD';

  if (preview) {
    return (
      <div style={otherProps.style}>
        {initval ? options.initialValue.format(props.format) : ''}
      </div>
    );
  }

  return getFieldDecorator(name, options)(<Component {...props} />);
};
