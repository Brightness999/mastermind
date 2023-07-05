import React from 'react';
import { Divider, Pagination, Space, Table, message } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';
import moment from 'moment';
import 'moment/locale/en-au';
import Cookies from 'js-cookie';

import msgMainHeader from 'components/MainHeader/messages';
import request from 'utils/api/request';
import { getUserNotifications } from 'utils/api/apiList';
import { ADMIN, CONSULTANT, PARENT, PROVIDER, SCHOOL, SUPERADMIN } from 'routes/constant';
import { socketUrl } from 'utils/api/baseUrl';
import { setCountOfUnreadNotifications } from 'src/redux/features/authSlice';
import PageLoading from 'components/Loading/PageLoading';
import './index.less';

class NotificationSetting extends React.Component {
  constructor(props) {
    super(props);
    this.socket = undefined;
    this.state = {
      notifications: [],
      pageSize: 10,
      pageNumber: 1,
      totalSize: 0,
      loading: false,
    }
  }

  componentDidMount() {
    const { pageNumber, pageSize } = this.state;
    this.getNotificationList(pageNumber, pageSize);
    this.handleSocket();
  }

  handleSocket = () => {
    const opts = {
      query: {
        token: Cookies.get('tk'),
      },
      withCredentials: true,
      autoConnect: true,
    };
    this.socket = io(socketUrl, opts);
    this.socket.on('socket_result', data => {
      if (data.key === "countOfUnreadNotifications") {
        this.props.setCountOfUnreadNotifications(data.count);
      }
    })
  }

  handleChangePagination = (newPageNumber, newPageSize) => {
    this.setState({ pageNumber: newPageNumber, pageSize: newPageSize });
    this.getNotificationList(newPageNumber, newPageSize);
  }

  getNotificationList = (pageNumber = 1, pageSize = 10) => {
    const { user } = this.props;
    this.setState({ loading: true });
    request.post(getUserNotifications, { pageNumber, pageSize }).then(result => {
      this.setState({ loading: false });
      const { success, data } = result;
      if (success) {
        this.setState({
          notifications: data?.docs?.map((notification, i) => {
            notification['key'] = i; return notification;
          }) ?? [],
          totalSize: data?.total || 0,
        });
        const readData = data?.docs?.filter(a => !a.isRead).map(a => ({
          updateOne: {
            filter: { _id: a._id },
            update: { $set: { isRead: true } },
          }
        }))

        if (!!readData?.length) {
          this.socket.emit("read_notifications", { readData, userId: user?._id });
        }
      } else {
        this.setState({ notifications: [] });
      }
    }).catch(err => {
      message.error(err.message);
      this.setState({ notifications: [], loading: false });
    })
  }

  render() {
    const { loading, notifications, pageNumber, pageSize, totalSize } = this.state;
    const columns = [
      {
        title: 'Author', dataIndex: 'fromUser', key: 'author',
        render: user => {
          switch (user?.role) {
            case PARENT: return `${user.parentInfo?.fatherName || user.parentInfo?.motherName} ${user.parentInfo?.familyName}`;
            case PROVIDER: return `${user.providerInfo?.firstName} ${user.providerInfo?.lastName}`;
            case SCHOOL: return user.schoolInfo?.name || '';
            case CONSULTANT: return user.username || '';
            case ADMIN: return user.fullName || '';
            case SUPERADMIN: return user.fullName || '';
            default: return;
          }
        },
      },
      {
        title: 'Role', dataIndex: 'fromUser', key: 'role',
        filters: [
          { text: 'Super Admin', value: 1000 },
          { text: 'Admin', value: 999 },
          { text: 'Consultant', value: 100 },
          { text: 'School', value: 60 },
          { text: 'Provider', value: 30 },
          { text: 'Parent', value: 3 },
        ],
        onFilter: (value, record) => record.fromUser?.role === value,
        render: (user) => {
          switch (user?.role) {
            case 1000: return 'Super Admin';
            case 999: return 'Admin';
            case 100: return 'Consultant';
            case 60: return 'School';
            case 30: return 'Provider';
            case 3: return 'Parent';
            default: return 'Banner User';
          }
        },
      },
      {
        title: 'Message', key: 'message',
        render: (notification) => (<div className={`${notification?.isRead ? '' : 'message'}`}><div className={`${notification?.isRead ? '' : 'message-content'}`}>{notification.text}</div></div>)
      },
      {
        title: 'Created Date', dataIndex: 'createdAt', key: 'createdAt', type: 'datetime',
        render: (createdAt) => moment(createdAt).format('MM/DD/YYYY hh:mm A'),
      },
    ]

    return (
      <div className="full-layout page usermanager-page">
        <div className='div-title-admin'>
          <p className='font-16 font-500 p-0'>{intl.formatMessage(msgMainHeader.notification)}</p>
          <Divider />
        </div>
        <Space direction='vertical' className='flex'>
          <Table bordered size='middle' pagination={false} dataSource={notifications} columns={columns} />
          <Pagination current={pageNumber} total={totalSize} pageSize={pageSize} onChange={this.handleChangePagination} />
        </Space>
        <PageLoading loading={loading} isBackground={true} />
      </div>
    );
  }
}

const mapStateToProps = state => ({ user: state.auth.user });

export default compose(connect(mapStateToProps, { setCountOfUnreadNotifications }))(NotificationSetting);
