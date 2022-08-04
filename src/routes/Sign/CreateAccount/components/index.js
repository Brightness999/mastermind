import React from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Row, Form, Button, Input } from 'antd';
import { routerLinks } from "../../../constant";
import intl from 'react-intl-universal';
import messages from '../messages';

import './index.less';

@connect()
export default class extends React.Component {
  render() {
    return (
      <div className="full-layout page createaccount-page">
        <div>{intl.formatMessage(messages.blankPage)}</div>
      </div>
    );
  }
}
