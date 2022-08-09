import React from 'react';
import { connect } from 'dva';
import intl from 'react-intl-universal';

import messages from '../messages';
import './index.less';

@connect()
export default class extends React.Component {
  render() {
    return (
      <div className="full-layout page dashboard-page">
        {intl.formatMessage(messages.blankPage)}
      </div>
    );
  }
}
