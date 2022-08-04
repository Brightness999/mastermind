import React from 'react';
import PropTypes from 'prop-types';
import { Form, Row, Col, Button, message } from 'antd';
import intl from "react-intl-universal";
import cx from 'classnames';
import $$ from 'cmn-utils';
import './style/index.less';
import messages from './messages';
const createForm = Form.create;

const PlainComp = ({ className, children }) => (
  <div className={className}>{children}</div>
);
PlainComp.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
};
/**
 * Search bar
 */
class SearchBar extends React.Component {
  // Specify the number of elements per line when type is grid
  cols = {
    xs: 8,
    md: 6,
    xl: 4
  };

  // Inline elements default width
  width = {
    date: 100,
    month: 100,
    'date~': 280,
    datetime: 140,
    select: 100,
    default: 110,
    treeSelect: 110,
    cascade: 110,
    cascader: 110
  };

  // Specify the interval between every two elements when type is grid
  rows = {
    gutter: 8
  };

  resetForm() {
    this.props.form.resetFields();
    this.searchForm(true);
  }

  searchForm(isReset) {
    this.props.form.validateFields((errors, values) => {
      if (errors) {
        let errs = [];
        Object.keys(errors).forEach(fieldName => {
          errs = errors[fieldName].errors || [];
        });
        if (errs && errs.length) message.error(errs[0].message);
        return;
      }

      this.props.onSearch && this.props.onSearch(values, isReset);
    });
  }

  render() {
    const {
      className,
      prefixCls,
      type,
      rows,
      cols,
      columns,
      group,
      children,
      form,
      appendTo,
      record,
      ...otherProps
    } = this.props;

    const colopts = type === 'grid' ? cols || this.cols : {};
    const rowopts = type === 'grid' ? rows || this.rows : {};

    const ComponentRow = type === 'inline' ? PlainComp : Row;
    const ComponentCol = type === 'inline' ? PlainComp : Col;
    const ComponentItem = type === 'inline' ? PlainComp : Form.Item;
    const formItemLayout =
      type === 'grid'
        ? {
          labelCol: { span: 8 },
          wrapperCol: { span: 16 }
        }
        : {};

    const ComponentBtnGroup = type === 'inline' ? Button.Group : PlainComp;

    let searchFields = columns.filter(col => col.searchItem);
    searchFields = group
      ? searchFields.filter(
        col => col.searchItem && col.searchItem.group === group
      )
      : searchFields;

    if (!searchFields.length) return null;

    delete otherProps.onSearch;

    let getPopupContainer = null;
    if (appendTo) {
      if ($$.isFunction(appendTo)) getPopupContainer = appendTo;
      else if (appendTo === true)
        getPopupContainer = triggerNode => triggerNode.parentNode;
      else getPopupContainer = () => appendTo;
    }

    return (
      <div className={cx(prefixCls, className)} {...otherProps}>
        <Form
          className={cx({
            'form-inline': type === 'inline',
            'form-grid': type === 'grid'
          })}
        >
          <ComponentRow className="row-item" {...rowopts}>
            {searchFields.map((field, i) => {
              let col = { ...colopts };
              if (type === 'grid' && field.searchItem.col) {
                col = { ...field.searchItem.col };
              } else if (type !== 'grid') {
                col = {};
              }

              const fieldType = field.searchItem.type || 'input';

              const formProps = {
                form,
                name: field.name,
                title: field.title,
                record,
                ...field.searchItem
              };

              if (type === 'inline') {
                formProps.style = {
                  width: formProps.width || this.width[fieldType]
                };
              }

              if (getPopupContainer) {
                formProps.getPopupContainer = getPopupContainer;
              }

              if (field.dict) {
                formProps.dict = field.dict;
              }

              let FieldComp;
              switch (fieldType) {
                case 'date~': // Date range
                case 'datetime': // Date time
                case 'date': // date
                case 'month': // month
                case 'time': // time
                  FieldComp = require(`../Form/model/date`).default(formProps);
                  break;
                case 'input': // Input box
                case 'textarea': // Multi-line text
                  formProps.formFieldOptions = {
                    rules: [
                      {
                        pattern: /^[^'%&<>=?*!]*$/,
                        message: intl.formatMessage(messages.errors)
                      }
                    ]
                  };
                  formProps.maxLength = field.searchItem.maxLength || 100;
                  formProps.autoComplete = 'off';
                  FieldComp = require(`../Form/model/input`).default(formProps);
                  break;
                case 'hidden': // Hidden domain
                  return (
                    <span key={`col-${i}`}>
                      {require(`../Form/model/input`).default(formProps)}
                    </span>
                  );
                case 'select':
                  formProps.optionFilterProp = 'children';
                // eslint-disable-next-line no-fallthrough
                case 'treeSelect':
                case 'cascade':
                  formProps.allowClear = true;
                  formProps.showSearch = true;
                // eslint-disable-next-line no-fallthrough
                default:
                  // General purpose
                  FieldComp = require(`../Form/model/${fieldType.toLowerCase()}`).default(
                    formProps
                  );
              }

              return (
                <ComponentCol key={`col-${i}`} className="col-item" {...col}>
                  <ComponentItem
                    {...formItemLayout}
                    label={field.title}
                    className="col-item-content"
                  >
                    {FieldComp}
                  </ComponentItem>
                </ComponentCol>
              );
            })}
            {children}
          </ComponentRow>
          <ComponentBtnGroup className="search-btns">
            <Button
              title={intl.formatMessage(messages.titleButtonTop)}
              type={type === 'grid' ? 'primary' : 'default'}
              onClick={() => this.searchForm()}
              htmlType="submit"
              icon="search"
            >
              {intl.formatMessage(messages.titleButtonTop)}
            </Button>
            <Button title={intl.formatMessage(messages.titleButtonBottom)} onClick={() => this.resetForm()} icon="reload">
              {intl.formatMessage(messages.titleButtonBottom)}
            </Button>
          </ComponentBtnGroup>
        </Form>
      </div>
    );
  }
}

SearchBar.propTypes = {
  prefixCls: PropTypes.string,
  className: PropTypes.string,
  columns: PropTypes.array.isRequired,
  record: PropTypes.object,
  type: PropTypes.string,
  group: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  rows: PropTypes.object,
  cols: PropTypes.object,
  children: PropTypes.node,
  appendTo: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  form: PropTypes.object,
  onSearch: PropTypes.func
};

SearchBar.defaultProps = {
  prefixCls: 'antui-searchbar',
  type: 'inline'
};

export default createForm()(SearchBar);
