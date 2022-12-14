import { Divider, Tabs, Card, Row, Col, Switch, Button, message } from 'antd';
import React from 'react';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';
import msgMainHeader from '../../../components/MainHeader/messages';
import msgTopBar from '../../../components/TopBar/messages';
import request from '../../../utils/api/request';
import { updateNotificationSetting } from '../../../utils/api/apiList';
import './index.less';

class NotificationSetting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notificationSetting: undefined,
      isNewSessionEmail: false,
      isNewSessionPush: false,
      isNewSessionText: false,
      isRescheduleSessionEmail: false,
      isRescheduleSessionPush: false,
      isRescheduleSessionText: false,
      isSessionReminderEmail: false,
      isSessionReminderPush: false,
      isSessionReminderText: false,
      isCancelSessionEmail: false,
      isCancelSessionPush: false,
      isCancelSessionText: false,
      isSubsidyUpdateEmail: false,
      isSubsidyUpdatePush: false,
      isSubsidyUpdateText: false,
      isFlagClearedEmail: false,
      isFlagClearedPush: false,
      isFlagClearedText: false,
      isFlagCreatedEmail: false,
      isFlagCreatedPush: false,
      isFlagCreatedText: false,
    };
  }

  componentDidMount() {
    this.setState({ notificationSetting: this.props.user.notificationSetting });
  }

  handleSaveSetting = () => {
    request.post(updateNotificationSetting).then(res => {
      const { success } = res;
      if (success) {
        message.success("Successfully updated");
      }
    }).catch(err => {
      console.log('update notification error---', err);
      message.error(err.message);
    })
  }

  render() {
    const { notificationSetting } = this.state;

    return (
      <div className="full-layout page usermanager-page">
        <div className='div-title-admin'>
          <p className='font-16 font-500 p-0'>{intl.formatMessage(msgMainHeader.notification)}</p>
          <Divider />
        </div>
        <Tabs defaultActiveKey="1" type="card" size='small'>
          <Tabs.TabPane tab={intl.formatMessage(msgMainHeader.notification)} key="1">
          </Tabs.TabPane>
          <Tabs.TabPane tab={intl.formatMessage(msgTopBar.setting)} key="2">
            <Row>
              <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={8}>
                <Card className='bg-white'>
                  <table className='notification-settings w-100 table-fixed'>
                    <thead>
                      <tr>
                        <th></th>
                        <th>Email</th>
                        <th>Text</th>
                        <th>Push</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={4} className="bg-pastel">
                          <div className='header'>Sessions</div>
                        </td>
                      </tr>
                      <tr>
                        <td>New Session</td>
                        <td><div className='text-center'><Switch defaultChecked={notificationSetting?.isNewSessionEmail} onChange={v => this.setState({ isNewSessionEmail: v })} /></div></td>
                        <td><div className='text-center'><Switch defaultChecked={notificationSetting?.isNewSessionText} onChange={v => this.setState({ isNewSessionText: v })} /></div></td>
                        <td><div className='text-center'><Switch defaultChecked={notificationSetting?.isNewSessionPush} onChange={v => this.setState({ isNewSessionPush: v })} /></div></td>
                      </tr>
                      <tr>
                        <td>Reschedule Session</td>
                        <td><div className='text-center'><Switch defaultChecked={notificationSetting?.isRescheduleSessionEmail} onChange={v => this.setState({ isRescheduleSessionEmail: v })} /></div></td>
                        <td><div className='text-center'><Switch defaultChecked={notificationSetting?.isRescheduleSessionText} onChange={v => this.setState({ isRescheduleSessionText: v })} /></div></td>
                        <td><div className='text-center'><Switch defaultChecked={notificationSetting?.isRescheduleSessionPush} onChange={v => this.setState({ isRescheduleSessionPush: v })} /></div></td>
                      </tr>
                      <tr>
                        <td>Cancel Session</td>
                        <td><div className='text-center'><Switch defaultChecked={notificationSetting?.isCancelSessionEmail} onChange={v => this.setState({ isCancelSessionEmail: v })} /></div></td>
                        <td><div className='text-center'><Switch defaultChecked={notificationSetting?.isCancelSessionText} onChange={v => this.setState({ isCancelSessionText: v })} /></div></td>
                        <td><div className='text-center'><Switch defaultChecked={notificationSetting?.isCancelSessionPush} onChange={v => this.setState({ isCancelSessionPush: v })} /></div></td>
                      </tr>
                      <tr>
                        <td>Session reminder</td>
                        <td><div className='text-center'><Switch defaultChecked={notificationSetting?.isSessionReminderEmail} onChange={v => this.setState({ isSessionReminderEmail: v })} /></div></td>
                        <td><div className='text-center'><Switch defaultChecked={notificationSetting?.isSessionReminderText} onChange={v => this.setState({ isSessionReminderText: v })} /></div></td>
                        <td><div className='text-center'><Switch defaultChecked={notificationSetting?.isSessionReminderPush} onChange={v => this.setState({ isSessionReminderPush: v })} /></div></td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="bg-pastel">
                          <div className='header'>Subsidy</div>
                        </td>
                      </tr>
                      <tr>
                        <td>Subsidy Update</td>
                        <td><div className='text-center'><Switch defaultChecked={notificationSetting?.isSubsidyUpdateEmail} onChange={v => this.setState({ isSubsidyUpdateEmail: v })} /></div></td>
                        <td><div className='text-center'><Switch defaultChecked={notificationSetting?.isSubsidyUpdateText} onChange={v => this.setState({ isSubsidyUpdateText: v })} /></div></td>
                        <td><div className='text-center'><Switch defaultChecked={notificationSetting?.isSubsidyUpdatePush} onChange={v => this.setState({ isSubsidyUpdatePush: v })} /></div></td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="bg-pastel">
                          <div className='header'>Flag</div>
                        </td>
                      </tr>
                      <tr>
                        <td>Flag Created</td>
                        <td><div className='text-center'><Switch defaultChecked={notificationSetting?.isFlagCreatedEmail} onChange={v => this.setState({ isFlagCreatedEmail: v })} /></div></td>
                        <td><div className='text-center'><Switch defaultChecked={notificationSetting?.isFlagCreatedText} onChange={v => this.setState({ isFlagCreatedText: v })} /></div></td>
                        <td><div className='text-center'><Switch defaultChecked={notificationSetting?.isFlagCreatedPush} onChange={v => this.setState({ isFlagCreatedPush: v })} /></div></td>
                      </tr>
                      <tr>
                        <td>Flag Cleared</td>
                        <td><div className='text-center'><Switch defaultChecked={notificationSetting?.isFlagClearedEmail} onChange={v => this.setState({ isFlagClearedEmail: v })} /></div></td>
                        <td><div className='text-center'><Switch defaultChecked={notificationSetting?.isFlagClearedText} onChange={v => this.setState({ isFlagClearedText: v })} /></div></td>
                        <td><div className='text-center'><Switch defaultChecked={notificationSetting?.isFlagClearedPush} onChange={v => this.setState({ isFlagClearedPush: v })} /></div></td>
                      </tr>
                    </tbody>
                  </table>
                  <div className='mt-10 flex justify-end'>
                    <Button type='primary' className='px-20' onClick={() => this.handleSaveSetting()}>Save</Button>
                  </div>
                </Card>
              </Col>
            </Row>
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  }
}


const mapStateToProps = state => {
  return ({ user: state.auth.user });
}

export default compose(connect(mapStateToProps))(NotificationSetting);
