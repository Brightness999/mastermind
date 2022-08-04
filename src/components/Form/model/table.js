import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Select } from 'antd';
import $$ from 'cmn-utils';
import intl from 'react-intl-universal';
import isEqual from 'react-fast-compare';
import assign from 'object-assign';
import PageHelper from '../../../utils/pageHelper';
import messages from '../messages';
import messagesModal from '../../Modal/messages';
const {Option} = Select;

/**
 *  formItem: {
      type: 'table',
      rowKey: 'id',
      dataSource,
      columns: innerColumns,
      onChange: (form, value) => console.log('。。。:', value),
      loadData: self.onLoadTableData,
      initialValue: [11, 3, 5],
    }
 */
class TableControlled extends Component {
  constructor(props) {
    super(props);
    const { value, dataSource } = props;
    this.state = {
      value: this.getKeys(value),
      rows: this.getRows(value),
      dataSource: dataSource || PageHelper.create(),
      visible: false,
      loading: false
    };
  }

  componentDidMount() {
    const { loadData } = this.props;
    if (loadData) {
      this.onChange({ pageNum: 1 });
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const { dataSource, value, loadData } = nextProps;
    const { rows } = this.state;
    if (
      !isEqual(this.props.dataSource, dataSource) ||
      !isEqual(this.props.value, value)
    ) {
      const _value = this.getKeys(value);
      const newState = {
        value: _value,
        rows: this.getRows(_value, rows)
      };
      if (!loadData && dataSource) {
        newState.dataSource = dataSource;
      }

      this.setState(newState);
    }
  }

  // Convert value to object array
  getRows(value, oldValue = []) {
    const { rowKey } = this.props;
    if (value) {
      return value.map(item => {
        const oldv = oldValue.filter(jtem => jtem[rowKey] === item)[0];
        return typeof item === 'object' ? item : oldv || { [rowKey]: item };
      });
    }
    return [];
  }

  getKeys(value) {
    const { rowKey } = this.props;
    if (value) {
      return value.map(item => ($$.isObject(item) ? item[rowKey] : item));
    }
    return [];
  }

  onSelect = (keys, rows) => {
    const { modal, onChange } = this.props;
    this.setState({ value: keys, rows });

    if (onChange && !modal) {
      onChange(keys, rows);
    }
  };

  async onChange({ pageNum, pageSize }) {
    const { loadData } = this.props;
    const { dataSource } = this.state;

    if (loadData) {
      this.setState({
        loading: true
      });

      const newDataSource = await loadData(
        dataSource.jumpPage(pageNum, pageSize)
      );

      this.setState({
        loading: false,
        dataSource: assign(dataSource, newDataSource)
      });
    }
  }

  onSelectChange = (value) => {
    const { rowKey, onChange } = this.props;
    const { rows } = this.state;
    const newRows = rows.filter(item => value.indexOf(item[rowKey]) !== -1);
    this.setState({
      value,
      rows: newRows
    });
    onChange && onChange(value, newRows);
  };

  showModal = () => {
    this.setState({
      visible: true
    });
  };

  onSubmit = () => {
    const { value, rows } = this.state;
    const { onChange } = this.props;
    this.hideModal();
    onChange && onChange(value, rows);
  };

  hideModal = () => {
    this.setState({
      visible: false
    });
  };

  render() {
    const {
      modal,
      columns,
      titleKey,
      rowKey,
      selectType,
      showNum,
      placeholder,
      getPopupContainer,
      disabled,
      ...otherProps
    } = this.props;
    const { dataSource, value, rows, loading, visible } = this.state;

    const dataTableProps = {
      loading,
      columns,
      rowKey,
      dataItems: dataSource,
      selectedRowKeys: value,
      selectType: typeof selectType === 'undefined' ? 'checkbox' : selectType,
      showNum: typeof showNum === 'undefined' ? true : showNum,
      isScroll: true,
      onChange: ({ pageNum, pageSize }) => this.onChange({ pageNum, pageSize }),
      onSelect: (keys, items) => this.onSelect(keys, items)
    };
    if (modal || disabled) {
      let tempValue;
      if (titleKey) {
        tempValue = value;
      } else {
        tempValue = value.length ? '_selected' : [];
      }
      return (
        <div>
          <div role="presentation" onClick={disabled ? () => {} : this.showModal}>
            <Select
              readOnly
              disabled={!!disabled}
              mode="multiple"
              open={false}
              value={tempValue}
              onChange={this.onSelectChange}
              placeholder={placeholder}
            >
              {titleKey ? (
                rows.map(item => (
                  <Option key={item[rowKey]} value={item[rowKey]}>
                    {item[titleKey]}
                  </Option>
                ))
              ) : (
                <Option key="_selected" value="_selected">
                  {intl.formatMessage(messages.chosen)} {rows.length} {intl.formatMessage(messages.item)}
                </Option>
              )}
            </Select>
          </div>
          <Modal
            className="antui-table-modal"
            title={`Please choose ${  otherProps.title}`}
            visible={visible}
            width={modal.width || 600}
            onCancel={this.hideModal}
            footer={[
              <Button key="back" onClick={this.hideModal}>
                {intl.formatMessage(messagesModal.cancel)}
              </Button>,
              <Button key="submit" type="primary" onClick={this.onSubmit}>
                {intl.formatMessage(messagesModal.determine)}
              </Button>
            ]}
            {...modal}
          >
            {/*<DataTable {...dataTableProps} />*/}
          </Modal>
        </div>
      );
    }
  }
}

TableControlled.propTypes = {
  value: PropTypes.array,
  dataSource: PropTypes.object,
  onChange: PropTypes.func,
  modal: PropTypes.any,
  rowKey: PropTypes.string,
  loadData: PropTypes.func,
  selectType: PropTypes.func,
  showNum: PropTypes.func,
  placeholder: PropTypes.string,
  getPopupContainer: PropTypes.func,
  disabled: PropTypes.bool,
  columns: PropTypes.array,
  titleKey: PropTypes.string,
};

TableControlled.defaultProps = {
  rowKey: 'id',
  modal: {}
};

/**
 * TableForm component
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
  rowKey,
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
    options.onChange = (value, rows) => onChange(form, value, rows); // form, value
  }

  const props = {
    placeholder: placeholder || `Please choose${otherProps.title}`,
    ...otherProps
  };

  return getFieldDecorator(name, options)(
    <TableControlled
      dataSource={dataSource}
      rowKey={rowKey || name}
      {...props}
    />
  );
};
