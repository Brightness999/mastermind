import React, { createRef } from 'react';
import { Button, Divider, Input, Pagination, Space, Table, message, DatePicker } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';
import 'moment/locale/en-au';
import { SearchOutlined } from '@ant-design/icons';

import mgsSidebar from 'components/SideBar/messages';
import msgMainHeader from 'components/MainHeader/messages';
import messages from 'routes/User/Dashboard/messages';
import request from 'utils/api/request';
import { store } from 'src/redux/store';
import { getTrackedActions } from 'utils/api/apiList';
import { ADMIN, CONSULTANT, PARENT, PROVIDER, SCHOOL, SUPERADMIN } from 'routes/constant';
import PageLoading from 'components/Loading/PageLoading';
import './index.less';

const { RangePicker } = DatePicker;

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      trackedLogs: [],
      pageSize: 10,
      pageNumber: 1,
      totalSize: 0,
      userSearch: '',
      actionSearch: '',
      dateRange: undefined,
      loading: false,
    };
    this.searchInput = createRef(null);
  }

  componentDidMount() {
    const { userSearch, actionSearch, pageNumber, pageSize } = this.state;
    this.getActionList(pageNumber, pageSize, userSearch, actionSearch);
  }

  handleChangePagination = (newPageNumber, newPageSize) => {
    const { userSearch, actionSearch } = this.state;
    this.setState({ pageNumber: newPageNumber, pageSize: newPageSize });
    this.getActionList(newPageNumber, newPageSize, userSearch, actionSearch);
  }

  getActionList(pageNumber = 1, pageSize = 10, userSearch = "", actionSearch = "", dateRange = [0, moment().valueOf()]) {
    if (!dateRange?.length) {
      dateRange = [0, moment().valueOf()];
    }
    this.setState({ loading: true });
    request.post(getTrackedActions, { userSearch, actionSearch, pageNumber, pageSize, dateRange }).then(result => {
      this.setState({ loading: false });
      const { success, data } = result;
      if (success) {
        this.setState({
          trackedLogs: data.actions?.map((action, i) => {
            action['key'] = i; return action;
          }) ?? [],
          totalSize: data.totalCount || 0
        });
      }
    }).catch(err => {
      this.setState({ loading: false });
      message.error(err.message);
    });
  }

  render() {
    const { loading, pageNumber, pageSize, totalSize, trackedLogs, userSearch, actionSearch, dateRange } = this.state;
    const roleFilterOptions = [
      { text: 'Admin', value: 999 },
      { text: 'Consultant', value: 100 },
      { text: 'School', value: 60 },
      { text: 'Provider', value: 30 },
      { text: 'Parent', value: 3 },
    ];

    if (store.getState().auth.user?.role === 999) {
      roleFilterOptions.splice(0, 1);
    }

    const columns = [
      {
        title: 'User', dataIndex: 'user', key: 'user',
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              name='SearchName'
              ref={this.searchInput}
              placeholder={`${intl.formatMessage(msgMainHeader.search)} ${intl.formatMessage(messages.studentName)}`}
              value={selectedKeys[0]}
              onChange={e => {
                setSelectedKeys(e.target.value ? [e.target.value] : []);
                this.setState({ userSearch: e.target.value });
              }}
              onPressEnter={() => {
                confirm();
                this.getActionList(pageNumber, pageSize, selectedKeys[0], actionSearch, dateRange);
              }}
              style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
              <Button
                type="primary"
                onClick={() => {
                  confirm();
                  this.getActionList(pageNumber, pageSize, selectedKeys[0], actionSearch, dateRange);
                }}
                icon={<SearchOutlined />}
                size="small"
                style={{ width: 90 }}
              >
                {intl.formatMessage(msgMainHeader.search)}
              </Button>
              <Button
                onClick={() => {
                  clearFilters();
                  confirm();
                  this.getActionList(pageNumber, pageSize, '', actionSearch, dateRange);
                  this.setState({ userSearch: '' });
                }}
                size="small"
                style={{ width: 90 }}
              >
                {intl.formatMessage(messages.reset)}
              </Button>
            </Space>
          </div>
        ),
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilterDropdownOpenChange: visible => {
          if (visible) {
            setTimeout(() => this.searchInput.current?.select(), 100);
          }
        },
        render: user => {
          switch (user?.role) {
            case PARENT: return `${user.parentInfo?.fatherName || user.parentInfo?.motherName} ${user.parentInfo?.familyName}`;
            case PROVIDER: return `${user.providerInfo?.firstName} ${user.providerInfo?.lastName}`;
            case SCHOOL: return user.schoolInfo?.name || '';
            case CONSULTANT: return user.username || '';
            case ADMIN: return user.fullName || user.username;
            case SUPERADMIN: return user.fullName || user.username;
            default: return;
          }
        },
      },
      {
        title: 'Role', dataIndex: 'user', key: 'role',
        filters: roleFilterOptions,
        onFilter: (value, record) => record.user?.role === value,
        render: (user) => {
          switch (user?.role) {
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
        title: 'Action', dataIndex: 'action', key: 'action',
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              name='SearchName'
              ref={this.searchInput}
              placeholder={`${intl.formatMessage(msgMainHeader.search)} ${intl.formatMessage(messages.studentName)}`}
              value={selectedKeys[0]}
              onChange={e => {
                setSelectedKeys(e.target.value ? [e.target.value] : []);
                this.setState({ actionSearch: e.target.value });
              }}
              onPressEnter={() => {
                confirm();
                this.getActionList(pageNumber, pageSize, userSearch, selectedKeys[0], dateRange);
              }}
              style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
              <Button
                type="primary"
                onClick={() => {
                  confirm();
                  this.getActionList(pageNumber, pageSize, userSearch, selectedKeys[0], dateRange);
                }}
                icon={<SearchOutlined />}
                size="small"
                style={{ width: 90 }}
              >
                {intl.formatMessage(msgMainHeader.search)}
              </Button>
              <Button
                onClick={() => {
                  clearFilters();
                  confirm();
                  this.getActionList(pageNumber, pageSize, userSearch, '', dateRange);
                  this.setState({ actionSearch: '' });
                }}
                size="small"
                style={{ width: 90 }}
              >
                {intl.formatMessage(messages.reset)}
              </Button>
            </Space>
          </div>
        ),
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilterDropdownOpenChange: visible => {
          if (visible) {
            setTimeout(() => this.searchInput.current?.select(), 100);
          }
        },
      },
      {
        title: 'Description', dataIndex: 'description', key: 'description',
        sorter: (a, b) => (a.description || '').toLocaleLowerCase() > (b.description || '').toLocaleLowerCase() ? 1 : -1,
      },
      {
        title: 'Date', dataIndex: 'createdAt', key: 'createdAt', type: 'datetime',
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div className='p-3'>
            <div className='mb-5'>
              <RangePicker showTime size='small' value={dateRange} onChange={(range) => {
                setSelectedKeys(range);
                this.setState({ dateRange: range });
              }} />
            </div>
            <Space>
              <Button
                type="primary"
                onClick={() => {
                  confirm();
                  this.getActionList(pageNumber, pageSize, userSearch, actionSearch, selectedKeys);
                }}
                icon={<SearchOutlined />}
                size="small"
                style={{ width: 90 }}
              >
                {intl.formatMessage(msgMainHeader.search)}
              </Button>
              <Button
                onClick={() => {
                  clearFilters();
                  confirm();
                  this.getActionList(pageNumber, pageSize, userSearch, actionSearch, [0, moment().valueOf()]);
                  this.setState({ dateRange: [] });
                }}
                size="small"
                style={{ width: 90 }}
              >
                {intl.formatMessage(messages.reset)}
              </Button>
            </Space>
          </div>
        ),
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilterDropdownOpenChange: visible => {
          if (visible) {
            setTimeout(() => this.searchInput.current?.select(), 100);
          }
        },
        render: createdAt => moment(createdAt).format("MM/DD/YYYY hh:mm A"),
      },
    ];

    return (
      <div className="full-layout page statistics-page flex flex-col h-100">
        <div className='div-title-admin'>
          <p className='font-16 font-500'>{intl.formatMessage(mgsSidebar.statistics)}</p>
          <Divider />
        </div>
        <Space direction='vertical' className='flex flex-1 overflow-y-scroll'>
          <Table bordered size='middle' pagination={false} dataSource={trackedLogs} columns={columns} scroll={{ y: 'calc(100vh - 260px)' }} />
          <Pagination current={pageNumber} total={totalSize} pageSize={pageSize} onChange={this.handleChangePagination} />
        </Space>
        <PageLoading loading={loading} isBackground={true} />
      </div>
    );
  }
}
