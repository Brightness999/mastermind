import { Divider, Tabs, Card, Row, Col, Switch, Button, message } from 'antd';
import React from 'react';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';
import msgMainHeader from '../../../components/MainHeader/messages';
import './index.less';

class NotificationSetting extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() { }

  render() {
    return (
      <div className="full-layout page usermanager-page">
        <div className='div-title-admin'>
          <p className='font-16 font-500 p-0'>{intl.formatMessage(msgMainHeader.notification)}</p>
          <Divider />
        </div>
      </div>
    );
  }
}


const mapStateToProps = state => {
  return ({ user: state.auth.user });
}

export default compose(connect(mapStateToProps))(NotificationSetting);
