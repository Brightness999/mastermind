import React, { createRef, useState } from 'react';
import { Table, Space, Input, Button } from 'antd';
import intl from 'react-intl-universal';
import { SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import { CSVLink } from "react-csv";
import { FaFileDownload } from 'react-icons/fa';

import messages from '../../../Dashboard/messages';
import msgCreateAccount from '../../../Sign/CreateAccount/messages';

const AdminApproved = (props) => {
  const { skills, grades, requests, schools } = props;
  const [csvData, setCsvData] = useState([]);
  const csvHeaders = ["Student Name", "School", "Student Grade", "Service Requested", "Notes", "Provider", "HMGH expense per session", "# of approved sessions", "# of sessions paid to DATE", "Total HMGH expense"];
  const searchInput = createRef(null);
  const adminApprovedColumns = [
    {
      title: <span className="font-16">{intl.formatMessage(messages.studentName)}</span>,
      key: 'name',
      align: 'center',
      fixed: 'left',
      sorter: (a, b) => (a?.student?.firstName ?? '' + a?.student?.lastName ?? '').toLowerCase() > (b?.student?.firstName ?? '' + b?.student?.lastName ?? '').toLowerCase() ? 1 : -1,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            name='SearchName'
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
      key: 'school',
      align: 'center',
      filters: schools,
      onFilter: (value, record) => record.school?._id === value,
      sorter: (a, b) => (a?.school?.name ?? '').toLowerCase() > (b?.school?.name ?? '').toLowerCase() ? 1 : -1,
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
            name='SearchName'
            ref={searchInput}
            placeholder={`Search Notes`}
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
      sorter: (a, b) => {
        const prevName = a?.selectedProviderFromAdmin ? a.selectedProviderFromAdmin.firstName + a.selectedProviderFromAdmin.lastName : a.otherProvider;
        const nextName = b?.selectedProviderFromAdmin ? b.selectedProviderFromAdmin.firstName + b.selectedProviderFromAdmin.lastName : b.otherProvider;
        if (prevName.toLowerCase() > nextName.toLowerCase())
          return 1;
        else
          return -1;
      },
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            name='SearchName'
            ref={searchInput}
            placeholder={`Search Provider Name`}
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
      onFilter: (value, record) => record.selectedProviderFromAdmin?.firstName?.toLowerCase()?.includes((value).toLowerCase()) || record.selectedProviderFromAdmin?.lastName?.toLowerCase()?.includes((value).toLowerCase()) || record.otherProvider?.toLowerCase()?.includes((value).toLowerCase()),
      onFilterDropdownOpenChange: visible => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
      render: (subsidy) => (
        subsidy?.selectedProviderFromAdmin ? <div>{subsidy?.selectedProviderFromAdmin?.firstName ?? ''} {subsidy?.selectedProviderFromAdmin?.lastName ?? ''}</div>
          : <div>{subsidy?.otherProvider}</div>
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
            name='SearchName'
            ref={searchInput}
            placeholder={`Search Approval Date`}
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
      key: 'recentSessionDate',
      align: 'center',
      sorter: (a, b) => a?.appointments?.[0]?.date > b?.appointments?.[0]?.date ? 1 : -1,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            name='SearchName'
            ref={searchInput}
            placeholder={`Search Recent Session Date`}
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
      render: (subsidy) => <span>{subsidy?.appointments?.length ? moment(subsidy?.appointments?.[0]?.date).format('MM/DD/YYYY hh:mm A') : ''}</span>
    },
    {
      title: <span className="font-16">{intl.formatMessage(messages.HMGHExpensePerSession)}</span>,
      key: 'HMGHExpensePerSession',
      align: 'center',
      sorter: (a, b) => a?.priceForSession > b?.priceForSession ? 1 : -1,
      render: (subsidy) => <span>{subsidy?.priceForSession ?? ''}</span>
    },
    {
      title: <span className="font-16">{intl.formatMessage(messages.totalHMGHExpense)}</span>,
      key: 'totalHMGHExpense',
      align: 'center',
      sorter: (a, b) => a?.priceForSession * a?.numberOfSessions > b?.priceForSession * b?.numberOfSessions ? 1 : -1,
      render: (subsidy) => <span>{subsidy?.priceForSession * subsidy?.numberOfSessions ? subsidy?.priceForSession * subsidy?.numberOfSessions : ''}</span>
    },
    {
      title: <span className="font-16">{intl.formatMessage(messages.status)}</span>,
      key: 'status',
      align: 'center',
      fixed: 'right',
      sorter: (a, b) => a?.appointments?.length > b?.appointments?.length ? 1 : -1,
      render: (subsidy) => <span>{subsidy?.appointments?.length ?? 0} / {subsidy?.numberOfSessions}</span>
    },
  ];

  const exportToExcel = () => {
    const data = requests?.map(r => ({
      "Student Name": `${r?.student?.firstName ?? ''} ${r?.student?.lastName ?? ''}`,
      "School": r?.school?.name ?? '',
      "Student Grade": r?.student?.currentGrade,
      "Service Requested": r?.skillSet?.name,
      "Notes": r?.note,
      "Provider": r?.selectedProviderFromAdmin ? `${r?.selectedProviderFromAdmin?.firstName ?? ''} ${r?.selectedProviderFromAdmin?.lastName ?? ''}` : r?.otherProvider,
      "HMGH expense per session": r.priceForSession ?? '',
      "# of approved sessions": r.numberOfSessions ?? '',
      "# of sessions paid to DATE": r?.appointments?.filter(a => a.status === -1 && a.isPaid)?.length ?? '',
      "Total HMGH expense": r.priceForSession * r.numberOfSessions,
    }))
    setCsvData(data);
    return true;
  }

  return (
    <div>
      <CSVLink onClick={exportToExcel} data={csvData} headers={csvHeaders} filename="Approved Requests">
        <Button type='primary' className='inline-flex items-center gap-2' icon={<FaFileDownload size={24} />}>
          Download CSV
        </Button>
      </CSVLink>
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
        className='mt-1 pb-10'
        pagination={false}
      />
    </div>
  )
}

export default AdminApproved;