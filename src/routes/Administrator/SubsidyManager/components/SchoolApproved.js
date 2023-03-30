import React, { createRef, useCallback, useRef } from 'react';
import { Table, Space, Input, Button } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';
import update from 'immutability-helper';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { SearchOutlined } from '@ant-design/icons';

import messages from '../../../Dashboard/messages';
import msgCreateAccount from '../../../Sign/CreateAccount/messages';

const SchoolApproved = (props) => {
  const type = 'DraggableBodyRow';
  const { skills, grades, requests } = props;
  const searchInput = createRef(null);
  const schoolApprovedColumns = [
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
      render: (subsidy) => <span>{subsidy?.student?.firstName ?? ''} {subsidy?.student?.lastName ?? ''}</span>,
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
      render: (subsidy) => <span>{subsidy?.student?.currentGrade}</span>
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
      sorter: (a, b) => a?.schoolApprovalDate > b?.schoolApprovalDate ? 1 : -1,
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
      onFilter: (value, record) => (moment(record.schoolApprovalDate).format('MM/DD/YYY hh:mm A') ?? '')?.toLowerCase()?.includes((value).toLowerCase()) || (moment(record.schoolApprovalDate).format('MM/DD/YYY hh:mm A') ?? '')?.toLowerCase()?.includes((value).toLowerCase()),
      onFilterDropdownOpenChange: visible => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
      render: (subsidy) => <span>{moment(subsidy?.schoolApprovalDate).format('MM/DD/YYYY hh:mm A')}</span>
    },
    {
      title: <span className="font-16">{intl.formatMessage(messages.action)}</span>,
      key: 'action',
      render: (subsidy) => (
        <Space size="middle">
          <a className='btn-blue' onClick={() => props.onShowModalSubsidy(subsidy?._id)}>Edit</a>
        </Space>
      ),
      align: 'center',
      fixed: 'right',
    },
  ];

  const DraggableBodyRow = ({ index, moveRow, className, style, ...restProps }) => {
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
      }
    },
    [requests],
  );

  return (
    <div className="approved-list">
      <DndProvider backend={HTML5Backend}>
        <Table
          bordered
          size='middle'
          dataSource={requests?.map((s, index) => ({ ...s, key: index }))}
          columns={schoolApprovedColumns}
          components={components}
          onRow={(_, index) => {
            const attr = {
              index,
              moveRow,
            };
            return attr;
          }}
          scroll={{ x: 1300 }}
          className='mt-2 pb-10'
          pagination={false}
        />
      </DndProvider>
    </div>
  )
}

export default SchoolApproved;