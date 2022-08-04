import React from 'react';
import PropTypes from 'prop-types';
import { Form, Row, Col, Button, Divider } from 'antd';
import cx from 'classnames';
import objectAssign from 'object-assign';
import $$ from 'cmn-utils';
import omit from 'object.omit';
import intl from 'react-intl-universal';

import Password from './model/password';
import './style/index.less';
import messages from './messages';

const PlainComp = ({ className, children }) => (
  <div className={className}>{children}</div>
);
PlainComp.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
};

/**
 * Form component
 */
class FormComp extends React.Component {

  // Specify the number of elements per line when type is grid
  cols = {
    xs: 24,
    md: 24,
    xl: 24
  };

  // Inline elements default width
  width = {
    date: 100,
    month: 100,
    'date~': 280,
    datetime: 140,
    select: 100,
    default: 100,
    treeSelect: 110,
    cascade: 110,
    cascader: 110
  };

  // Specify the interval between every two elements when type is grid
  rows = {
    gutter: 8
  };

  onReset = () => {
    this.props.form.resetFields();
  };

  onSubmit = e => {
    e.preventDefault();
    const { form, record, onSubmit } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onSubmit && onSubmit(values, record);
      }
    });
  };

  render() {
    const {
      className,
      prefixCls,
      type,
      rows,
      cols,
      textSubmit,
      formItemLayout: _formItemLayout,
      layout,
      appendTo,
      columns,
      record,
      group,
      children,
      form,
      preview,
      loading,
      footer,
      ...otherProps
    } = this.props;

    delete otherProps.onSubmit;

    const classname = cx(prefixCls, className, {
      'form-inline': type === 'inline',
      'form-grid': type === 'grid',
      preview
    });

    const colopts = type === 'grid' ? cols || this.cols : {};
    const rowopts = type === 'grid' ? rows || this.rows : {};

    const ComponentRow = type === 'inline' ? PlainComp : Row;
    const ComponentCol = type === 'inline' ? PlainComp : Col;
    const ComponentItem = Form.Item;

    let formFields = columns.filter(col => col.formItem);
    formFields = group
      ? formFields.filter(col => col.formItem && col.formItem.group === group)
      : formFields;

    let getPopupContainer = null;
    if (appendTo) {
      if ($$.isFunction(appendTo)) getPopupContainer = appendTo;
      else if (appendTo === true)
        getPopupContainer = triggerNode => triggerNode.parentNode;
      else getPopupContainer = () => appendTo;
    }

    return (
      <Form
        className={classname}
        onSubmit={this.onSubmit}
        {...objectAssign(otherProps, type === 'inline' && { layout: 'inline' })}
      >
        <ComponentRow className="row-item" {...rowopts}>
          {formFields.map((field, i) => {
            // Pass in the personalized column size, change this value to change the number of elements per line
            let col = { ...colopts };

            if (type === 'grid' && field.formItem.col) {
              col = { ...field.formItem.col };
            } else if (type !== 'grid') {
              col = {};
            }

            let formItemLayout = { ..._formItemLayout, ...layout };
            if (
              type === 'grid' &&
              (field.formItem.formItemLayout || field.formItem.layout)
            ) {
              formItemLayout = {
                ...formItemLayout,
                ...field.formItem.formItemLayout,
                ...field.formItem.layout
              };
            } else if (type !== 'grid') {
              formItemLayout = {};
            }

            const fieldType = field.formItem.type || 'input';

            let formProps = {
              form,
              name: field.name,
              title: field.title,
              record,
              preview,
              ...field.formItem
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

            // Remove useless attributes before passing in child components
            formProps = omit(formProps, ['formItemLayout', 'layout', 'col']);
            const lineProps = omit(formProps, 'type');

            let FieldComp;
            switch (fieldType) {
              case 'date~':
              case 'datetime':
              case 'date':
              case 'month':
              case 'time':
                // eslint-disable-next-line global-require
                FieldComp = require(`./model/date`).default(formProps);
                break;
              case 'input': // Input box
              case 'textarea': // Multi-line text
                // eslint-disable-next-line global-require
                FieldComp = require(`./model/input`).default(formProps);
                break;
              case 'hidden': // Hidden domain
                return (
                  <span key={`col-${i}`}>
                    {/* eslint-disable-next-line global-require */}
                    {require(`./model/input`).default(formProps)}
                  </span>
                );
              case 'line': // Separation line
                return (
                  <Divider key={`col-${i}`} {...lineProps}>
                    {formProps.title}
                  </Divider>
                );
              case 'password': // password
                return (
                  <Password
                    key={`col-${i}`}
                    formItemLayout={formItemLayout}
                    col={col}
                    {...formProps}
                  />
                );
              default:
                // General purpose
                // eslint-disable-next-line global-require
                FieldComp = require(`./model/${fieldType.toLowerCase()}`).default(
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
          {footer === undefined ? (
            <ComponentCol className="form-btns col-item text-center" {...colopts}>
              <Button
                shape="round"
                title={intl.formatMessage(messages.submit)}
                type="primary"
                htmlType="submit"
                icon="check"
                loading={loading}
              >
                {textSubmit || intl.formatMessage(messages.submit)}
              </Button> { ' ' }
              <Button
                shape="round"
                title={intl.formatMessage(messages.reset)}
                onClick={() => this.onReset()}
                icon="reload"
              >
                {intl.formatMessage(messages.reset)}
              </Button>
            </ComponentCol>
          ) : (
            footer
          )}
        </ComponentRow>
      </Form>
    );
  }
}

export const { Item } = Form;
FormComp.propTypes = {
  prefixCls: PropTypes.string,
  textSubmit: PropTypes.string,
  className: PropTypes.string,
  columns: PropTypes.array.isRequired,
  record: PropTypes.object,
  type: PropTypes.string,
  group: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  appendTo: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  rows: PropTypes.object,
  cols: PropTypes.object,
  children: PropTypes.node,
  form: PropTypes.object,
  onSubmit: PropTypes.func,
  preview: PropTypes.bool,
  formItemLayout: PropTypes.object,
  layout: PropTypes.object,
  loading: PropTypes.bool,
  footer: PropTypes.oneOfType([PropTypes.bool, PropTypes.node])
};

FormComp.defaultProps = {
  prefixCls: 'antui-form',
  textSubmit: '',
  type: 'vertical',
  loading: false,
  formItemLayout: {
    labelCol: { span: 7 },
    wrapperCol: { span: 17 }
  }
};
export default FormComp;
