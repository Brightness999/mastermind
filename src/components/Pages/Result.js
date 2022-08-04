import React from 'react';
import { Layout, Row, Col } from 'antd';
import PropTypes from 'prop-types';
import cx from 'classnames';
import {CheckOutlined, CloseOutlined, ExclamationOutlined, InfoOutlined} from '@ant-design/icons'
const { Content } = Layout;

const type2icon = {
  success: <CheckOutlined />,
  error: <CloseOutlined />,
  warning: <ExclamationOutlined />,
  info: <InfoOutlined />
};
/**
 * Result display component
 */
const Result = ({
  title, // title
  extra, // The content to the right of the title
  icon, // Icon to the left of the title,
  type, // Default icon success error warning info
  description, // Text below the title
  actions, // Button below the content
  footer, // Text below the content
  style,
  children, // text
  className
}) => {
  const classNames = cx('full-layout', 'result-fragment', className);

  let titleIcon = icon;
  if (type && type2icon[type] && !icon) {
    titleIcon = type2icon[type];
  }

  return (
    <Layout className={classNames} style={style}>
      <Content>
        <div className="center-block">
          <div className="result-header">
            <Row type="flex" align="bottom">
              <Col span={extra ? 16 : 24}>
                <div className={cx('title', type)}>
                  {titleIcon} {title}
                </div>
              </Col>
              <Col span={extra ? 8 : 0}>
                <div className="extra">{extra}</div>
              </Col>
            </Row>
            {description ? (
              <div className="description">{description}</div>
            ) : null}
          </div>
          <div className="result-body">
            {children}
            {actions ? <div className="action-btns">{actions}</div> : null}
          </div>
          <div className="result-footer">{footer}</div>
        </div>
      </Content>
    </Layout>
  );
};

Result.propTypes = {
  style: PropTypes.string,
  title: PropTypes.string,
  icon: PropTypes.string,
  type: PropTypes.string,
  className: PropTypes.string,
  description: PropTypes.string,
  extra: PropTypes.object,
  actions: PropTypes.node,
  footer: PropTypes.node,
  children: PropTypes.node,
};

export default Result;
