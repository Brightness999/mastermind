import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AutoComplete, Input } from 'antd';
import {LoadingOutlined} from '@ant-design/icons'
import $$ from 'cmn-utils';
import omit from 'object.omit';
import isEqual from 'react-fast-compare';
const {Option} = AutoComplete;

class AutoCompleteControlled extends Component {
  constructor(props) {
    super(props);
    const { value, loadData } = props;
    this.state = {
      value,
      dataSource: [],
      loading: false
    };

    this.handleSearch = loadData ? $$.debounce(this._handleSearch, 500) : null;
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const { dataSource, value, loadData } = nextProps;
    if (
      !isEqual(this.props.dataSource, dataSource) ||
      !isEqual(this.props.value, value)
    ) {
      const newState = { value };
      if (!loadData && dataSource) {
        newState.dataSource = value ? dataSource : [];
      }

      this.setState(newState);
    }
  }

  onSearch = value => {
    const { onChange, loadData } = this.props;
    if (onChange) {
      onChange(value, {});
    }
    if (!value.trim()) {
      this.setState({
        dataSource: [],
        value
      });
      return;
    }
    this.setState({
      value,
    });


    if (loadData) {
      this.handleSearch(value);
    }
  };

  _handleSearch = value => {
    const { loadData } = this.props;

    this.setState({ loading: true });
    const promise = loadData(value);
    if (promise && promise.then) {
      promise
        .then(listItem => {
          this.setState({
            dataSource: listItem,
            loading: false,
          });
        })
        .catch(() =>
          this.setState({
            dataSource: [],
            loading: false,
          }),
        );
    }
  };

  renderOptions = dataSource => {
    const { render, renderItem } = this.props;
    if (render) return render(dataSource) || [];
    if (renderItem) {
      return dataSource.map(this.renderOptionItem);
    }
    return dataSource;

  };

  renderOptionItem = (item, index) => {
    const { keyField, renderItem } = this.props;
    return (
      <Option key={item[keyField] || index} {...item}>
        {renderItem(item)}
      </Option>
    );
  };

  onSelect = (value, option) => {
    const {onChange} = this.props;
    if (onChange) {
      const { valueField, optionLabelProp } = this.props;
      const itemProps = option.props;
      const valueKey = valueField || optionLabelProp;
      const rvalue = itemProps[valueKey] || value;
      onChange(rvalue, option);
    }
  };

  render() {
    const { value, dataSource, loading } = this.state;
    const { valueField } = this.props;
    const autoComponentProps = omit(this.props, [
      'value',
      'dataSource',
      'onChange'
    ]);
    return (
      <AutoComplete
        value={value}
        dataSource={this.renderOptions(dataSource)}
        onSelect={this.onSelect}
        onSearch={this.onSearch}
        optionLabelProp={valueField}
        {...autoComponentProps}
        allowClear={false}
      >
        <Input
          suffix={
            loading ? (
              <LoadingOutlined  className="auto-complete-loading"/>
            ) : null
          }
        />
      </AutoComplete>
    );
  }
}
AutoCompleteControlled.propTypes = {
  value: PropTypes.any,
  dataSource: PropTypes.array,
  optionLabelProp: PropTypes.array,
  onChange: PropTypes.func,
  keyField: PropTypes.string,
  valueField: PropTypes.string,
  render: PropTypes.func,
  renderItem: PropTypes.func,
  loadData: PropTypes.func
};

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

  // If there are rules
  if (rules && rules.length) {
    options.rules = rules;
  }

  // If you need onChange
  if (typeof onChange === 'function') {
    options.onChange = (value, option) =>
      onChange(form, value, option); // form, value, option 选中的项
  }

  const props = {
    placeholder: placeholder || `Please enter ${otherProps.title}`,
    ...otherProps
  };

  if (getPopupContainer) {
    props.getPopupContainer = getPopupContainer;
  }

  return getFieldDecorator(name, options)(
    <AutoCompleteControlled dataSource={dataSource} {...props} />
  );
};
