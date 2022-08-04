import React from 'react';
import { Button } from 'antd';
import omit from 'object.omit';
import $$ from 'cmn-utils';
import intl from 'react-intl-universal';
import messages from '../messages';
import Upload from '../../Upload';
/**
 * Upload component, you may need to process the inverse value yourself, if FormData is needed in the background
 * const formData = new FormData();
   fileList.forEach((file) => {
     formData.append('files[]', file);
   });
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
  renderUpload,
  btnIcon = 'upload',
  max,
  maxFileSize, // Maximum file size
  fileTypes, // Allow file type
  action,    // Background address
  fileName,  // File name uploaded to the background
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
      options.initialValue = $$.isArray(initval)
        ? initval.map((item, index) => ({
          uid: `fs_${  index}`,
          thumbUrl: item
        }))
        : [
          {
            uid: 'fs_0',
            thumbUrl: record[name]
          }
        ];
    }
  }

  if (preview) {
    return <div style={otherProps.style}>{initval || ''}</div>;
  }

  // 如果有rules
  if (rules && rules.length) {
    options.rules = rules;
  }

  if (maxFileSize || fileTypes) {
    options.rules = [
      {
        validator: (rule, value, callback) => {
          validatorFileSize(maxFileSize, value, callback);
          validatorFileTypes(fileTypes, value, callback);
          callback();
        }
      },
      ...(options.rules || [])
    ];
  }

  // If you need onChange
  if (typeof onChange === 'function') {
    options.onChange = args => onChange(form, args); // form, args
  }

  let uploadProps = {
    listType: 'picture',
    beforeUpload: () => false,
  };

  // Really upload to the background
  if (action) {
    uploadProps = omit(otherProps, ['beforeUpload']);
    uploadProps.action = action;
    uploadProps.name = fileName || 'file';
  }

  return getFieldDecorator(name, {
    valuePropName: 'fileList',
    getValueFromEvent: normFile,
    ...options
  })(
    <Upload {...uploadProps} {...otherProps}>
      {renderUpload ? (
        renderUpload(form, record, isDisabled(max, form.getFieldValue(name)))
      ) : (
        <Button
          icon={btnIcon}
          disabled={isDisabled(max, form.getFieldValue(name))}
        >
          {intl.formatMessage(messages.clickUpload)}
        </Button>
      )}
    </Upload>
  );
};

const validatorFileSize = (maxFileSize, value, callback) => {
  if (value.some(item => item.size > maxFileSize * 1024)) {
    callback(new Error(`Please upload an image with a file size of ${maxFileSize}K`));

  }
};

const validatorFileTypes = (fileTypes, value, callback) => {
  if ($$.isArray(fileTypes) && fileTypes.length > 0) {
    if (
      value.some(
        item =>
          item.name &&
          !fileTypes.some(
            type => item.name.toLowerCase().indexOf(type.toLowerCase()) !== -1
          )
      )
    ) {
      callback(new Error(`Please upload ${fileTypes.join('、')}, type file`));
    }
  }
};

// If max is set, the control button is disabled
const isDisabled = (max, value) => {
  if (!max) return false;
  if (!value) return false;
  return !(value && value.length < max);
};

const normFile = e => {
  if (Array.isArray(e)) {
    return e;
  }
  return e && e.fileList;
};
