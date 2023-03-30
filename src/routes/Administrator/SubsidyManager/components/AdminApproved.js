import React, { createRef } from 'react';
import { Table, Space, Input, Button } from 'antd';
import intl from 'react-intl-universal';
import { SearchOutlined } from '@ant-design/icons';
import moment from 'moment';

import messages from '../../../Dashboard/messages';
import msgCreateAccount from '../../../Sign/CreateAccount/messages';

const AdminApproved = (props) => {
  const { skills, grades, requests } = props;
  const searchInput = createRef(null);
  const adminApprovedColumns = [
    {
      title: <span className="font-16">{intl.formatMessage(msgCreateAccount.name)}</span>,
      key: 'name',
      align: 'center',
      fixed: 'left',
      sorter: (a, b) => (a?.student?.firstName ?? '' + a?.student?.lastName ?? '').toLowerCase() > (b?.student?.firstName ?? '' + b?.student?.lastName ?? '').toLowerCase() ? 1 : -1,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            ref={searchInput}
            placeholder={`Search Dependent Name`}
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button
              onClick={() => { clearFilters(); confirm(); }}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value, record) => record.student?.firstName?.toLowerCase()?.includes((value).toLowerCase()) || record.student?.lastName?.toLowerCase()?.includes((value).toLowerCase()),
      onFilterDropdownOpenChange: visible => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
      render: (subsidy) => <span>{subsidy?.student.firstName ?? ''} {subsidy?.student.lastName ?? ''}</span>,
    },
    {
      title: <span className="font-16">{intl.formatMessage(msgCreateAccount.school)}</span>,
      key: 'name',
      align: 'center',
      fixed: 'left',
      render: (subsidy) => <span>{subsidy?.school?.name ?? ''}</span>,
    },
    {
      title: <span className="font-16">{intl.formatMessage(messages.studentGrade)}</span>,
      key: 'grade',
      align: 'center',
      filters: grades,
      onFilter: (value, record) => record.student?.currentGrade === value,
      sorter: (a, b) => (a?.student?.currentGrade ?? '').toLowerCase() > (b?.student?.currentGrade ?? '').toLowerCase() ? 1 : -1,
      render: (subsidy) => <span>{subsidy?.student.currentGrade}</span>
    },
    {
      title: <span className="font-16">{intl.formatMessage(messages.serviceRequested)}</span>,
      key: 'skillSet',
      align: 'center',
      filters: skills,
      onFilter: (value, record) => record.skillSet?._id === value,
      sorter: (a, b) => (a?.skillSet?.name ?? '').toLowerCase() > (b?.skillSet?.name ?? '').toLowerCase() ? 1 : -1,
      render: (subsidy) => <span>{subsidy?.skillSet.name}</span>
    },
    {
      title: <span className="font-16">{intl.formatMessage(msgCreateAccount.notes)}</span>,
      key: 'note',
      align: 'center',
      sorter: (a, b) => (a?.note ?? '').toLowerCase() > (b?.note ?? '').toLowerCase() ? 1 : -1,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            ref={searchInput}
            placeholder={`Search Dependent Name`}
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button
              onClick={() => { clearFilters(); confirm(); }}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value, record) => record.note?.toLowerCase()?.includes((value).toLowerCase()) || record.note?.toLowerCase()?.includes((value).toLowerCase()),
      onFilterDropdownOpenChange: visible => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
      render: (subsidy) => <span>{subsidy?.note}</span>
    },
    {
      title: <span className="font-16">{intl.formatMessage(msgCreateAccount.provider)}</span>,
      key: 'provider',
      align: 'center',
      sorter: (a, b) => (a?.selectedProvider?.firstName ?? '' + a?.selectedProvider?.lastName ?? '').toLowerCase() > (b?.selectedProvider?.firstName ?? '' + b?.selectedProvider?.lastName ?? '').toLowerCase() ? 1 : -1,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            ref={searchInput}
            placeholder={`Search Dependent Name`}
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button
              onClick={() => { clearFilters(); confirm(); }}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value, record) => record.selectedProvider?.firstName?.toLowerCase()?.includes((value).toLowerCase()) || record.selectedProvider?.lastName?.toLowerCase()?.includes((value).toLowerCase()),
      onFilterDropdownOpenChange: visible => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
      render: (subsidy) => (
        <div>{subsidy?.selectedProvider?.firstName ?? ''} {subsidy?.selectedProvider?.lastName ?? ''}</div>
      )
    },
    {
      title: <span className="font-16">{intl.formatMessage(messages.approvalDate)}</span>,
      key: 'approvalDate',
      align: 'center',
      sorter: (a, b) => a?.approvalDate > b?.approvalDate ? 1 : -1,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            ref={searchInput}
            placeholder={`Search Dependent Name`}
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button
              onClick={() => { clearFilters(); confirm(); }}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value, record) => (moment(record.approvalDate).format('MM/DD/YYY hh:mm A') ?? '')?.toLowerCase()?.includes((value).toLowerCase()) || (moment(record.approvalDate).format('MM/DD/YYY hh:mm A') ?? '')?.toLowerCase()?.includes((value).toLowerCase()),
      onFilterDropdownOpenChange: visible => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
      render: (subsidy) => <span>{moment(subsidy?.approvalDate).format('MM/DD/YYYY hh:mm A')}</span>
    },
    {
      title: <span className="font-16">{intl.formatMessage(messages.recentSessionDate)}</span>,
      key: 'approvalDate',
      align: 'center',
      sorter: (a, b) => a?.appointments?.[0]?.date > b?.appointments?.[0]?.date ? 1 : -1,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            ref={searchInput}
            placeholder={`Search Dependent Name`}
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button
              onClick={() => { clearFilters(); confirm(); }}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value, record) => (moment(record.appointments?.[0]?.date).format('MM/DD/YYY hh:mm A') ?? '')?.toLowerCase()?.includes((value).toLowerCase()) || (moment(record.appointments?.[0]?.date).format('MM/DD/YYY hh:mm A') ?? '')?.toLowerCase()?.includes((value).toLowerCase()),
      onFilterDropdownOpenChange: visible => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
      render: (subsidy) => <span>{moment(subsidy?.appointments?.[0]?.date).format('MM/DD/YYYY hh:mm A')}</span>
    },
    {
      title: <span className="font-16">{intl.formatMessage(messages.lastSessionDate)}</span>,
      key: 'approvalDate',
      align: 'center',
      sorter: (a, b) => a?.appointments?.[0]?.date > b?.appointments?.[0]?.date ? 1 : -1,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            ref={searchInput}
            placeholder={`Search Dependent Name`}
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button
              onClick={() => { clearFilters(); confirm(); }}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value, record) => (moment(record.appointments?.[0]?.date).format('MM/DD/YYY hh:mm A') ?? '')?.toLowerCase()?.includes((value).toLowerCase()) || (moment(record.appointments?.[0]?.date).format('MM/DD/YYY hh:mm A') ?? '')?.toLowerCase()?.includes((value).toLowerCase()),
      onFilterDropdownOpenChange: visible => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
      render: (subsidy) => <span>{subsidy?.numberOfSessions === subsidy?.appointments?.length ? moment(subsidy?.appointments?.[0]?.date).format('MM/DD/YYYY hh:mm A') : ''}</span>
    },
  ];

  return (
    <Table
      bordered
      size='middle'
      dataSource={requests?.map((s, index) => ({ ...s, key: index }))}
      columns={adminApprovedColumns}
      scroll={{ x: 1300 }}
      onRow={(subsidy) => ({
        onClick: (e) => e.target.className !== 'btn-blue' && props.onShowModalSubsidy(subsidy?._id),
        onDoubleClick: (e) => e.target.className !== 'btn-blue' && props.onShowModalSubsidy(subsidy?._id),
      })}
      className='mt-2 pb-10'
      pagination={false}
    />)
}

export default AdminApproved;