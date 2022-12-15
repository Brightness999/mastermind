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
    this.setState({
      isNewSessionEmail: this.props.user.notificationSetting?.isNewSessionEmail,
      isNewSessionPush: this.props.user.notificationSetting?.isNewSessionPush,
      isNewSessionText: this.props.user.notificationSetting?.isNewSessionText,
      isRescheduleSessionEmail: this.props.user.notificationSetting?.isRescheduleSessionEmail,
      isRescheduleSessionPush: this.props.user.notificationSetting?.isRescheduleSessionPush,
      isRescheduleSessionText: this.props.user.notificationSetting?.isRescheduleSessionText,
      isSessionReminderEmail: this.props.user.notificationSetting?.isSessionReminderEmail,
      isSessionReminderPush: this.props.user.notificationSetting?.isSessionReminderPush,
      isSessionReminderText: this.props.user.notificationSetting?.isSessionReminderText,
      isCancelSessionEmail: this.props.user.notificationSetting?.isCancelSessionEmail,
      isCancelSessionPush: this.props.user.notificationSetting?.isCancelSessionPush,
      isCancelSessionText: this.props.user.notificationSetting?.isCancelSessionText,
      isSubsidyUpdateEmail: this.props.user.notificationSetting?.isSubsidyUpdateEmail,
      isSubsidyUpdatePush: this.props.user.notificationSetting?.isSubsidyUpdatePush,
      isSubsidyUpdateText: this.props.user.notificationSetting?.isSubsidyUpdateText,
      isFlagClearedEmail: this.props.user.notificationSetting?.isFlagClearedEmail,
      isFlagClearedPush: this.props.user.notificationSetting?.isFlagClearedPush,
      isFlagClearedText: this.props.user.notificationSetting?.isFlagClearedText,
      isFlagCreatedEmail: this.props.user.notificationSetting?.isFlagCreatedEmail,
      isFlagCreatedPush: this.props.user.notificationSetting?.isFlagCreatedPush,
      isFlagCreatedText: this.props.user.notificationSetting?.isFlagCreatedText,
    });
  }

  handleSaveSetting = () => {
    const data = {
      isNewSessionEmail: this.state.isNewSessionEmail,
      isNewSessionPush: this.state.isNewSessionPush,
      isNewSessionText: this.state.isNewSessionText,
      isRescheduleSessionEmail: this.state.isRescheduleSessionEmail,
      isRescheduleSessionPush: this.state.isRescheduleSessionPush,
      isRescheduleSessionText: this.state.isRescheduleSessionText,
      isSessionReminderEmail: this.state.isSessionReminderEmail,
      isSessionReminderPush: this.state.isSessionReminderPush,
      isSessionReminderText: this.state.isSessionReminderText,
      isCancelSessionEmail: this.state.isCancelSessionEmail,
      isCancelSessionPush: this.state.isCancelSessionPush,
      isCancelSessionText: this.state.isCancelSessionText,
      isSubsidyUpdateEmail: this.state.isSubsidyUpdateEmail,
      isSubsidyUpdatePush: this.state.isSubsidyUpdatePush,
      isSubsidyUpdateText: this.state.isSubsidyUpdateText,
      isFlagClearedEmail: this.state.isFlagClearedEmail,
      isFlagClearedPush: this.state.isFlagClearedPush,
      isFlagClearedText: this.state.isFlagClearedText,
      isFlagCreatedEmail: this.state.isFlagCreatedEmail,
      isFlagCreatedPush: this.state.isFlagCreatedPush,
      isFlagCreatedText: this.state.isFlagCreatedText,
    }
    request.post(updateNotificationSetting, data).then(res => {
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
    const {
      isNewSessionEmail,
      isNewSessionPush,
      isNewSessionText,
      isRescheduleSessionEmail,
      isRescheduleSessionPush,
      isRescheduleSessionText,
      isSessionReminderEmail,
      isSessionReminderPush,
      isSessionReminderText,
      isCancelSessionEmail,
      isCancelSessionPush,
      isCancelSessionText,
      isSubsidyUpdateEmail,
      isSubsidyUpdatePush,
      isSubsidyUpdateText,
      isFlagClearedEmail,
      isFlagClearedPush,
      isFlagClearedText,
      isFlagCreatedEmail,
      isFlagCreatedPush,
      isFlagCreatedText,
    } = this.state;

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
                        <td><div className='text-center'><Switch defaultChecked={isNewSessionEmail} onChange={v => this.setState({ isNewSessionEmail: v })} /></div></td>
                        <td><div className='text-center'><Switch defaultChecked={isNewSessionText} onChange={v => this.setState({ isNewSessionText: v })} /></div></td>
                        <td><div className='text-center'><Switch defaultChecked={isNewSessionPush} onChange={v => this.setState({ isNewSessionPush: v })} /></div></td>
                      </tr>
                      <tr>
                        <td>Reschedule Session</td>
                        <td><div className='text-center'><Switch defaultChecked={isRescheduleSessionEmail} onChange={v => this.setState({ isRescheduleSessionEmail: v })} /></div></td>
                        <td><div className='text-center'><Switch defaultChecked={isRescheduleSessionText} onChange={v => this.setState({ isRescheduleSessionText: v })} /></div></td>
                        <td><div className='text-center'><Switch defaultChecked={isRescheduleSessionPush} onChange={v => this.setState({ isRescheduleSessionPush: v })} /></div></td>
                      </tr>
                      <tr>
                        <td>Cancel Session</td>
                        <td><div className='text-center'><Switch defaultChecked={isCancelSessionEmail} onChange={v => this.setState({ isCancelSessionEmail: v })} /></div></td>
                        <td><div className='text-center'><Switch defaultChecked={isCancelSessionText} onChange={v => this.setState({ isCancelSessionText: v })} /></div></td>
                        <td><div className='text-center'><Switch defaultChecked={isCancelSessionPush} onChange={v => this.setState({ isCancelSessionPush: v })} /></div></td>
                      </tr>
                      <tr>
                        <td>Session reminder</td>
                        <td><div className='text-center'><Switch defaultChecked={isSessionReminderEmail} onChange={v => this.setState({ isSessionReminderEmail: v })} /></div></td>
                        <td><div className='text-center'><Switch defaultChecked={isSessionReminderText} onChange={v => this.setState({ isSessionReminderText: v })} /></div></td>
                        <td><div className='text-center'><Switch defaultChecked={isSessionReminderPush} onChange={v => this.setState({ isSessionReminderPush: v })} /></div></td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="bg-pastel">
                          <div className='header'>Subsidy</div>
                        </td>
                      </tr>
                      <tr>
                        <td>Subsidy Update</td>
                        <td><div className='text-center'><Switch defaultChecked={isSubsidyUpdateEmail} onChange={v => this.setState({ isSubsidyUpdateEmail: v })} /></div></td>
                        <td><div className='text-center'><Switch defaultChecked={isSubsidyUpdateText} onChange={v => this.setState({ isSubsidyUpdateText: v })} /></div></td>
                        <td><div className='text-center'><Switch defaultChecked={isSubsidyUpdatePush} onChange={v => this.setState({ isSubsidyUpdatePush: v })} /></div></td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="bg-pastel">
                          <div className='header'>Flag</div>
                        </td>
                      </tr>
                      <tr>
                        <td>Flag Created</td>
                        <td><div className='text-center'><Switch defaultChecked={isFlagCreatedEmail} onChange={v => this.setState({ isFlagCreatedEmail: v })} /></div></td>
                        <td><div className='text-center'><Switch defaultChecked={isFlagCreatedText} onChange={v => this.setState({ isFlagCreatedText: v })} /></div></td>
                        <td><div className='text-center'><Switch defaultChecked={isFlagCreatedPush} onChange={v => this.setState({ isFlagCreatedPush: v })} /></div></td>
                      </tr>
                      <tr>
                        <td>Flag Cleared</td>
                        <td><div className='text-center'><Switch defaultChecked={isFlagClearedEmail} onChange={v => this.setState({ isFlagClearedEmail: v })} /></div></td>
                        <td><div className='text-center'><Switch defaultChecked={isFlagClearedText} onChange={v => this.setState({ isFlagClearedText: v })} /></div></td>
                        <td><div className='text-center'><Switch defaultChecked={isFlagClearedPush} onChange={v => this.setState({ isFlagClearedPush: v })} /></div></td>
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
