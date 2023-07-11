import React, { createRef, useState } from 'react';
import { Table, Space, Input, Button, Popconfirm, Popover } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';
import { SearchOutlined } from '@ant-design/icons';
import { CSVLink } from "react-csv";
import { FaFileDownload } from 'react-icons/fa';
import { AiFillWarning } from 'react-icons/ai';

import messages from 'routes/User/Dashboard/messages';
import msgCreateAccount from 'routes/Sign/CreateAccount/messages';
import msgModal from 'components/Modal/messages';

const SchoolPending = (props) => {
  const { skills, grades, requests, schools } = props;
  const [csvData, setCsvData] = useState([]);
  const [sortedRequests, setSortedRequests] = useState(requests);
  const csvHeaders = ["Student Name", "School", "Student Grade", "Service Requested", "Notes", "Request Date"];
  const searchInput = createRef(null);
  const pendingColumns = [
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
      render: (subsidy) => `${subsidy?.student?.firstName ?? ''} ${subsidy?.student?.lastName ?? ''}`,
    },
    {
      title: <span className="font-16">{intl.formatMessage(msgCreateAccount.school)}</span>,
      key: 'school',
      align: 'center',
      filters: schools,
      onFilter: (value, record) => record.school?._id === value,
      sorter: (a, b) => (a?.school?.name ?? '').toLowerCase() > (b?.school?.name ?? '').toLowerCase() ? 1 : -1,
      render: (subsidy) => subsidy?.school?.name || (
        <Popover content={(<div>
          <div><span className='font-700'>Name:</span> {subsidy?.student?.otherName}</div>
          <div><span className='font-700'>Phone:</span> {subsidy?.student?.otherContactNumber}</div>
          <div><span className='font-700'>Notes:</span> {subsidy?.student?.otherNotes}</div>
        </div>)} trigger="click">
          <span className='text-primary text-underline cursor action'>Other</span>
        </Popover>
      ),
    },
    {
      title: <span className="font-16">{intl.formatMessage(messages.studentGrade)}</span>,
      key: 'grade',
      align: 'center',
      filters: grades,
      onFilter: (value, record) => record.student?.currentGrade === value,
      sorter: (a, b) => (a?.student?.currentGrade ?? '').toLowerCase() > (b?.student?.currentGrade ?? '').toLowerCase() ? 1 : -1,
      render: (subsidy) => subsidy?.student?.currentGrade
    },
    {
      title: <span className="font-16">{intl.formatMessage(messages.serviceRequested)}</span>,
      key: 'skillSet',
      align: 'center',
      filters: skills,
      onFilter: (value, record) => record.skillSet?._id === value,
      sorter: (a, b) => (a?.skillSet?.name ?? '').toLowerCase() > (b?.skillSet?.name ?? '').toLowerCase() ? 1 : -1,
      render: (subsidy) => subsidy?.skillSet?.name,
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
      render: (subsidy) => subsidy?.note,
    },
    {
      title: <span className="font-16">{intl.formatMessage(messages.requestDate)}</span>,
      key: 'createdAt',
      align: 'center',
      sorter: (a, b) => a?.createdAt > b?.createdAt ? 1 : -1,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            name='SearchName'
            ref={searchInput}
            placeholder={`Search Request Date`}
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
      onFilter: (value, record) => (moment(record.createdAt).format('MM/DD/YYY hh:mm A') ?? '')?.toLowerCase()?.includes((value).toLowerCase()) || (moment(record.createdAt).format('MM/DD/YYY hh:mm A') ?? '')?.toLowerCase()?.includes((value).toLowerCase()),
      onFilterDropdownOpenChange: visible => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
      render: (subsidy) => moment(subsidy?.createdAt).format('MM/DD/YYYY hh:mm A'),
    },
    {
      title: <span className="font-16">{intl.formatMessage(messages.action)}</span>,
      key: 'action',
      align: 'center',
      fixed: 'right',
      render: (subsidy) => (
        <Space size="middle">
          <Popconfirm
            icon={<AiFillWarning size={24} />}
            title="Are you sure to approve this request?"
            onConfirm={() => subsidy?.school ? props.onShowModalSchoolApproval(subsidy?._id) : props.adminPreApproveSubsidy(subsidy?._id)}
            okText="Yes"
            cancelText="No"
          >
            <span className='text-primary cursor'>{intl.formatMessage(msgModal.approve)}</span>
          </Popconfirm>
          <Popconfirm
            icon={<AiFillWarning size={24} />}
            title={<span >Are you sure to decline this request?</span>}
            placement='left'
            onConfirm={() => props.onShowModalDeclineExplanation(subsidy?._id)}
            okText="Yes"
            cancelText="No"
          >
            <span className='text-primary cursor'>{intl.formatMessage(msgModal.decline)}</span>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const exportToExcel = () => {
    const data = sortedRequests?.map(r => ({
      "Student Name": `${r?.student?.firstName ?? ''} ${r?.student?.lastName ?? ''}`,
      "School": r?.school?.name ?? '',
      "Student Grade": r?.student?.currentGrade,
      "Service Requested": r?.skillSet?.name,
      "Notes": r?.note,
      "Request Date": moment(r?.createdAt).format('MM/DD/YYYY hh:mm A'),
    }))
    setCsvData(data);
    props.socket.emit("action_tracking", {
      user: props.user?._id,
      action: "Subsidy Request",
      description: "Downloaded pending subsidy requests",
    })
    return true;
  }

  return (
    <div>
      <CSVLink onClick={exportToExcel} data={csvData} headers={csvHeaders} filename="Pending Requests">
        <Button type='primary' className='inline-flex items-center gap-2' icon={<FaFileDownload size={24} />}>
          Download CSV
        </Button>
      </CSVLink>
      <Table
        bordered
        size='middle'
        dataSource={requests?.map((s, index) => ({ ...s, key: index }))}
        columns={pendingColumns}
        scroll={{ x: 1300 }}
        className='mt-1 pb-10'
        onChange={(_, __, ___, extra) => setSortedRequests(extra.currentDataSource)}
        onRow={(subsidy) => ({
          onClick: (e) => e.target.className.includes('ant-table-cell') && props.onShowModalSubsidy(subsidy?._id),
          onDoubleClick: (e) => e.target.className.includes('ant-table-cell') && props.onShowModalSubsidy(subsidy?._id),
        })}
      />
    </div>
  )
}

export default SchoolPending;