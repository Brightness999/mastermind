import React from 'react';
import { Link } from 'dva/router';
import intl from 'react-intl-universal';
import { Layout, Row, Col } from 'antd';
import {HomeOutlined} from '@ant-design/icons'
import errorImg from './style/images/error.gif';
import messages from './messages';
const { Content } = Layout;

export default () => (
  <Layout className="full-layout page500">
    <Content>
      <Row className="error-block">
        <Col span={16}>
          <div className="center-block">
            <h1 className="error-title"> 500! </h1>
            <h2 className="error-subtitle"> {intl.formatMessage(messages.unexpectedMistake)}</h2>
            <h6>{intl.formatMessage(messages.errorCode)} 500</h6>
          </div>
        </Col>
        <Col span={8}>
          <img src={errorImg} width="313" height="428" alt="error" />
        </Col>
      </Row>
      <Link to="/" className="backhome">
        <HomeOutlined/>

      </Link>
    </Content>
  </Layout>
);
