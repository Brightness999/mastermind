import React, { createRef, useCallback, useRef, useState } from 'react';
import { Table, Space, Input, Button, Popconfirm } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';
import update from 'immutability-helper';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { SearchOutlined } from '@ant-design/icons';
import { CSVLink } from "react-csv";
import { FaFileDownload } from 'react-icons/fa';
import { AiFillWarning } from 'react-icons/ai';

import messages from 'routes/User/Dashboard/messages';
import msgCreateAccount from 'routes/Sign/CreateAccount/messages';
import msgModal from 'components/Modal/messages';

const SchoolApproved = (props) => {
  const type = 'DraggableBodyRow';
  const { skills, grades, requests, schools } = props;
  const [csvData, setCsvData] = useState([]);
  const [sortedRequests, setSortedRequests] = useState(requests);
  const csvHeaders = ["Student Name", "School", "Student Grade", "Service Requested", "Notes", "Provider", "Approval Date"];
  const searchInput = createRef(null);
  const schoolApprovedColumns = [
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
      render: (subsidy) => `${subsidy?.student?.firstName ?? ''} ${subsidy?.student?.lastName ?? ''}`
    },
    {
      title: <span className="font-16">{intl.formatMessage(msgCreateAccount.school)}</span>,
      key: 'school',
      align: 'center',
      filters: schools,
      onFilter: (value, record) => record.school?._id === value,
      sorter: (a, b) => (a?.school?.name ?? '').toLowerCase() > (b?.school?.name ?? '').toLowerCase() ? 1 : -1,
      render: (subsidy) => subsidy?.school?.name ?? ''
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
      render: (subsidy) => subsidy?.skillSet.name
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
      render: (subsidy) => subsidy?.note
    },
    {
      title: <span className="font-16">{intl.formatMessage(msgCreateAccount.provider)}</span>,
      key: 'provider',
      align: 'center',
      sorter: (a, b) => {
        const prevName = a?.selectedProvider ? a.selectedProvider.firstName + a.selectedProvider.lastName : a.otherProvider;
        const nextName = b?.selectedProvider ? b.selectedProvider.firstName + b.selectedProvider.lastName : b.otherProvider;
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
      onFilter: (value, record) => record.selectedProvider?.firstName?.toLowerCase()?.includes((value).toLowerCase()) || record.selectedProvider?.lastName?.toLowerCase()?.includes((value).toLowerCase()) || record.otherProvider?.toLowerCase()?.includes((value).toLowerCase()),
      onFilterDropdownOpenChange: visible => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
      render: (subsidy) => (
        subsidy?.selectedProvider ? `${subsidy?.selectedProvider?.firstName ?? ''} ${subsidy?.selectedProvider?.lastName ?? ''}`
          : subsidy?.otherProvider
      )
    },
    {
      title: <span className="font-16">{intl.formatMessage(messages.approvalDate)}</span>,
      key: 'approvalDate',
      align: 'center',
      sorter: (a, b) => a?.schoolApprovalDate > b?.schoolApprovalDate ? 1 : -1,
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
      onFilter: (value, record) => (moment(record.schoolApprovalDate).format('MM/DD/YYY hh:mm A') ?? '')?.toLowerCase()?.includes((value).toLowerCase()) || (moment(record.schoolApprovalDate).format('MM/DD/YYY hh:mm A') ?? '')?.toLowerCase()?.includes((value).toLowerCase()),
      onFilterDropdownOpenChange: visible => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
      render: (subsidy) => moment(subsidy?.schoolApprovalDate).format('MM/DD/YYYY hh:mm A')
    },
    {
      title: <span className="font-16">{intl.formatMessage(messages.action)}</span>,
      key: 'action',
      render: (subsidy) => (
        <Space size="middle">
          <Popconfirm
            icon={<AiFillWarning size={24} />}
            title={<span >Are you sure to approve this request?</span>}
            onConfirm={() => props.adminPreApproveSubsidy(subsidy?._id)}
            okText="Yes"
            cancelText="No"
          >
            <span className='text-primary cursor'>{intl.formatMessage(msgModal.preapprove)}</span>
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
      align: 'center',
      fixed: 'right',
    },
  ];

  const DraggableBodyRow = ({ index, moveRow, className, style, onClick, ...restProps }) => {
    const ref = useRef(null);
    const [{ isOver, dropClassName }, drop] = useDrop({
      accept: type,
      collect: (monitor) => {
        const { index: dragIndex } = monitor.getItem() || {};
        if (dragIndex === index) {
          return {};
        }
        return {
          isOver: monitor.isOver(),
          dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
        };
      },
      drop: (item) => {
        moveRow(item.index, index);
      },
    });
    const [, drag] = useDrag({
      type,
      item: {
        index,
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });
    drop(drag(ref));
    return (
      <tr
        ref={ref}
        className={`${className}${isOver ? dropClassName : ''}`}
        onClick={(e) => e.target.className == 'ant-table-cell ant-table-cell-row-hover' && props.onShowModalSubsidy(restProps?.children?.[0]?.props?.record?._id)}
        onDoubleClick={(e) => e.target.className == 'ant-table-cell ant-table-cell-row-hover' && props.onShowModalSubsidy(restProps?.children?.[0]?.props?.record?._id)}
        style={{
          cursor: 'move',
          ...style,
        }}
        {...restProps}
      />
    );
  };

  const components = {
    body: {
      row: DraggableBodyRow,
    },
  };

  const moveRow = useCallback(
    (dragIndex, hoverIndex) => {
      const dragRow = requests[dragIndex];
      const updatedList = update(requests, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragRow],
        ],
      });
      if (dragIndex !== hoverIndex) {
        props.handleReorder(updatedList);
        props.setRequests(updatedList);
        setSortedRequests(updatedList);
      }
    },
    [requests],
  );

  const exportToExcel = () => {
    const data = sortedRequests?.map(r => ({
      "Student Name": `${r?.student?.firstName ?? ''} ${r?.student?.lastName ?? ''}`,
      "School": r?.school?.name ?? '',
      "Student Grade": r?.student?.currentGrade,
      "Service Requested": r?.skillSet?.name,
      "Notes": r?.note,
      "Provider": r?.selectedProvider ? `${r?.selectedProvider?.firstName ?? ''} ${r?.selectedProvider?.lastName ?? ''}` : r?.otherProvider,
      "Approval Date": moment(r?.schoolApprovalDate).format('MM/DD/YYYY hh:mm A'),
    }))
    setCsvData(data);
    props.socket.emit("action_tracking", {
      user: props.user?._id,
      action: "Subsidy Request",
      description: "Downloaded school approved subsidy requests",
    })
    return true;
  }

  return (
    <div className="approved-list">
      <CSVLink onClick={exportToExcel} data={csvData} headers={csvHeaders} filename="School Approved Requests">
        <Button type='primary' className='inline-flex items-center gap-2' icon={<FaFileDownload size={24} />}>
          Download CSV
        </Button>
      </CSVLink>
      <DndProvider backend={HTML5Backend}>
        <Table
          bordered
          size='middle'
          dataSource={requests?.map((s, index) => ({ ...s, key: index }))}
          columns={schoolApprovedColumns}
          components={components}
          onChange={(_, __, ___, extra) => setSortedRequests(extra.currentDataSource)}
          onRow={(_, index) => {
            const attr = {
              index,
              moveRow,
            };
            return attr;
          }}
          scroll={{ x: 1300 }}
          className='mt-1 pb-10'
          pagination={false}
        />
      </DndProvider>
    </div>
  )
}

export default SchoolApproved;