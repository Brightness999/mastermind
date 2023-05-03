import React, { createRef, useState } from 'react';
import { Table, Space, Input, Button } from 'antd';
import intl from 'react-intl-universal';
import { SearchOutlined } from '@ant-design/icons';
import { CSVLink } from "react-csv";
import { FaFileDownload } from 'react-icons/fa';

import messages from '../../../Dashboard/messages';
import msgCreateAccount from '../../../Sign/CreateAccount/messages';

const AdminDeclined = (props) => {
  const { skills, grades, requests, schools } = props;
  const [csvData, setCsvData] = useState([]);
  const searchInput = createRef(null);
  const adminDeclinedColumns = [
    {
      title: <span className="font-16">{intl.formatMessage(messages.studentName)}</span>,
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
      sorter: (a, b) => (a?.selectedProvider?.firstName ?? '' + a?.selectedProvider?.lastName ?? '').toLowerCase() > (b?.selectedProvider?.firstName ?? '' + b?.selectedProvider?.lastName ?? '').toLowerCase() ? 1 : -1,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
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
  ];

  const exportToExcel = () => {
    const data = requests?.map(r => ({
      "Student Name": `${r?.student?.firstName ?? ''} ${r?.student?.lastName ?? ''}`,
      "School": r?.school?.name ?? '',
      "Student Grade": r?.student?.currentGrade,
      "Service Requested": r?.skillSet?.name,
      "Notes": r?.note,
      "Provider": r?.selectedProvider ? `${r?.selectedProvider?.firstName ?? ''} ${r?.selectedProvider?.lastName ?? ''}` : r?.otherProvider,
    }))
    setCsvData(data);
    return true;
  }

  return (
    <div>
      <CSVLink onClick={() => exportToExcel()} data={csvData} filename="Admin Declined Requests"><Button type='primary' className='flex items-center gap-2' icon={<FaFileDownload size={24} />}>Download CSV</Button></CSVLink>
      <Table
        bordered
        size='middle'
        dataSource={requests?.map((s, index) => ({ ...s, key: index }))}
        columns={adminDeclinedColumns}
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

export default AdminDeclined;