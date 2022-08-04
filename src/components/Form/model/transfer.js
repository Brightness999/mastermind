import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Transfer, Modal, Select } from 'antd';
import $$ from 'cmn-utils';
import intl from "react-intl-universal";

import messages from '../messages';
import messagesModal from '../../Modal/messages';
const {Option} = Select;
/**
 *  formItem: {
      type: 'transfer',
      modal: true,
      dataSource: employees,
      normalize: (value) => value.map(item => item.key)
    }
 */
class TransferControlled extends Component {
  constructor(props) {
    super(props);
    const { value, dataSource } = props;
    this.state = {
      value: value || [],
      dataSource,
      visible: false
    };
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.props.value !== nextProps.value) {
      this.setState({ value: nextProps.value });
    }
  }

  triggerChange = (nextTargetKeys) => {
    const { modal, onChange } = this.props;
    this.setState({ value: nextTargetKeys });

    if (onChange && !modal) {
      onChange(nextTargetKeys);
    }
  };

  showModal = () => {
    this.setState({
      visible: true,
      value: this.props.value
    });
  };

  hideModal = () => {
    this.setState({
      visible: false
    });
  };

  onSubmit = () => {
    const { onChange } = this.props;
    const { value } = this.state;
    this.setState({
      visible: false
    });
    if (onChange) {
      onChange(value);
    }
  };

  onSelectChange = (value) => {
    const { onChange } = this.props;
    this.setState({
      value
    });
    onChange && onChange(value);
  };

  render() {
    const { title, modal, placeholder, ...otherProps } = this.props;
    const { dataSource, value, visible } = this.state;

    const comp = (
      <Transfer
        {...otherProps}
        dataSource={dataSource}

        titles={[intl.formatMessage(messages.source), intl.formatMessage(messages.aims)]}
        targetKeys={value}
        onChange={this.triggerChange}
        render={item => item.title || item.label}
      />
    );

    if (modal || otherProps.disabled) {
      return (
        <div>
          <div role="presentation" onClick={otherProps.disabled ? () => {} : this.showModal}>
            <Select
              readOnly
              disabled={!!otherProps.disabled}
              mode="multiple"
              open={false}
              value={otherProps.value}
              onChange={this.onSelectChange}
              placeholder={placeholder}
            >
              {otherProps.value &&
                dataSource
                  .filter(item => otherProps.value.indexOf(item.key) !== -1)
                  .map(item => (
                    <Option key={item.key} value={item.key}>
                      {item.title || item.label}
                    </Option>
                  ))}
            </Select>
          </div>
          <Modal
            className="antui-transfer-modal"
            title={`Please choose ${  title}`}
            visible={visible}
            onOk={this.onSubmit}
            onCancel={this.hideModal}
            okText= {[intl.formatMessage(messagesModal.determine)]}
            cancelText= {[intl.formatMessage(messagesModal.cancel)]}
            {...modal}>
            {comp}
          </Modal>
        </div>
      );
    }

    return comp;
  }
}

TransferControlled.propTypes = {
  value: PropTypes.array,
  dataSource: PropTypes.array,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  title: PropTypes.string,
  modal: PropTypes.object
};

/**
 * TransferForm component
 */
export default ({
  form,
  name,
  formFieldOptions = {},
  record,
  initialValue,
  rules,
  onChange,
  dataSource,
  normalize,
  placeholder,
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

  return getFieldDecorator(name, options)(
    <TransferControlled dataSource={dataSource} {...props} />
  );
};
