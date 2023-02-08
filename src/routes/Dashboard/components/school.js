import React, { useCallback, useEffect, useRef, useState } from "react";
import { Space, Table, Tabs } from "antd";
import update from 'immutability-helper';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { store } from "../../../redux/store";
import request from "../../../utils/api/request";
import { getAllProviderInSchool } from "../../../utils/api/apiList";

const Subsidaries = () => {
  const type = 'DraggableBodyRow';
  const user = store.getState().auth.user;
  const [pendingList, setPendingList] = useState([]);
  const [shoolApprovedList, setSchoolApprovedList] = useState([]);
  const [schoolDeclinedList, setSchoolDeclinedList] = useState([]);
  const [adminPreApprovedList, setAdminPreApprovedList] = useState([]);
  const [adminDeclinedList, setAdminDeclinedList] = useState([]);
  const [adminApprovedList, setAdminApprovedList] = useState([]);
  const [providers, setProviders] = useState([]);

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

  const DeclineSubsidy = (subsidy) => {
    
  }

  const pendingColumns = [
    {
      title: 'Name',
      key: 'name',
      align: 'center',
      render: (subsidy) => <span>{subsidy.student.firstName ?? ''} {subsidy.student.lastName ?? ''}</span>,
    },
    {
      title: 'Student Grade',
      key: 'grade',
      align: 'center',
      render: (subsidy) => <span>{subsidy.student.currentGrade}</span>
    },
    {
      title: 'Service requested',
      key: 'skillSet',
      align: 'center',
      render: (subsidy) => <span>{subsidy.skillSet.name}</span>
    },
    {
      title: 'Note',
      key: 'note',
      align: 'center',
      render: (subsidy) => <span>{subsidy.note}</span>
    },
    {
      title: 'Providers',
      key: 'provider',
      align: 'center',
      render: (subsidy) => (
        <div>
          {providers?.filter(provider => provider?.skillSet?.find(skill => skill == subsidy.skillSet?._id))?.map((provider, index) => (
            <p key={index}>{provider.firstName} {provider.lastName}</p>
          ))}
        </div>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (subsidy) => (
        <Space size="middle">
          <a className='btn-blue' onClick={() => SchoolApproveSubsidy(subsidy)}>Approve</a>
          <a className='btn-blue' onClick={() => DeclineSubsidy(subsidy)}>Decline</a>
        </Space>
      ),
      align: 'center',
      fixed: 'right',
    },
  ];

  const schoolApprovedColumns = [
    {
      title: 'Name',
      key: 'name',
      align: 'center',
      render: (subsidy) => <span>{subsidy.student.firstName ?? ''} {subsidy.student.lastName ?? ''}</span>,
    },
    {
      title: 'Student Grade',
      key: 'grade',
      align: 'center',
      render: (subsidy) => <span>{subsidy.student.currentGrade}</span>
    },
    {
      title: 'Service requested',
      key: 'skillSet',
      align: 'center',
      render: (subsidy) => <span>{subsidy.skillSet.name}</span>
    },
    {
      title: 'Note',
      key: 'note',
      align: 'center',
      render: (subsidy) => <span>{subsidy.note}</span>
    },
    {
      title: 'Providers',
      key: 'provider',
      align: 'center',
      render: (subsidy) => (
        <div>
          {providers?.filter(provider => provider?.skillSet?.find(skill => skill == subsidy.skillSet?._id))?.map((provider, index) => (
            <p key={index}>{provider.firstName} {provider.lastName}</p>
          ))}
        </div>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (a) => (
        <Space size="middle">
          <a className='btn-blue' onClick={() => { }}>Approve</a>
          <a className='btn-blue' onClick={() => { }}>Decline</a>
        </Space>
      ),
      align: 'center',
      fixed: 'right',
    },
  ];

  const schoolDeclinedColumns = [
    {
      title: 'Name',
      key: 'name',
      align: 'center',
      render: (subsidy) => <span>{subsidy.student.firstName ?? ''} {subsidy.student.lastName ?? ''}</span>,
    },
    {
      title: 'Student Grade',
      key: 'grade',
      align: 'center',
      render: (subsidy) => <span>{subsidy.student.currentGrade}</span>
    },
    {
      title: 'Service requested',
      key: 'skillSet',
      align: 'center',
      render: (subsidy) => <span>{subsidy.skillSet.name}</span>
    },
    {
      title: 'Note',
      key: 'note',
      align: 'center',
      render: (subsidy) => <span>{subsidy.note}</span>
    },
    {
      title: 'Providers',
      key: 'provider',
      align: 'center',
      render: (subsidy) => (
        <div>
          {providers?.filter(provider => provider?.skillSet?.find(skill => skill == subsidy.skillSet?._id))?.map((provider, index) => (
            <p key={index}>{provider.firstName} {provider.lastName}</p>
          ))}
        </div>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (a) => (
        <Space size="middle">
          <a className='btn-blue' onClick={() => { }}>Approve</a>
          <a className='btn-blue' onClick={() => { }}>Decline</a>
        </Space>
      ),
      align: 'center',
      fixed: 'right',
    },
  ];

  const adminPreApprovedColumns = [
    {
      title: 'Name',
      key: 'name',
      align: 'center',
      render: (subsidy) => <span>{subsidy.student.firstName ?? ''} {subsidy.student.lastName ?? ''}</span>,
    },
    {
      title: 'Student Grade',
      key: 'grade',
      align: 'center',
      render: (subsidy) => <span>{subsidy.student.currentGrade}</span>
    },
    {
      title: 'Service requested',
      key: 'skillSet',
      align: 'center',
      render: (subsidy) => <span>{subsidy.skillSet.name}</span>
    },
    {
      title: 'Note',
      key: 'note',
      align: 'center',
      render: (subsidy) => <span>{subsidy.note}</span>
    },
    {
      title: 'Providers',
      key: 'provider',
      align: 'center',
      render: (subsidy) => (
        <div>
          {providers?.filter(provider => provider?.skillSet?.find(skill => skill == subsidy.skillSet?._id))?.map((provider, index) => (
            <p key={index}>{provider.firstName} {provider.lastName}</p>
          ))}
        </div>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (a) => (
        <Space size="middle">
          <a className='btn-blue' onClick={() => { }}>Approve</a>
          <a className='btn-blue' onClick={() => { }}>Decline</a>
        </Space>
      ),
      align: 'center',
      fixed: 'right',
    },
  ];

  const adminApprovedColumns = [
    {
      title: 'Name',
      key: 'name',
      align: 'center',
      render: (subsidy) => <span>{subsidy.student.firstName ?? ''} {subsidy.student.lastName ?? ''}</span>,
    },
    {
      title: 'Student Grade',
      key: 'grade',
      align: 'center',
      render: (subsidy) => <span>{subsidy.student.currentGrade}</span>
    },
    {
      title: 'Service requested',
      key: 'skillSet',
      align: 'center',
      render: (subsidy) => <span>{subsidy.skillSet.name}</span>
    },
    {
      title: 'Note',
      key: 'note',
      align: 'center',
      render: (subsidy) => <span>{subsidy.note}</span>
    },
    {
      title: 'Providers',
      key: 'provider',
      align: 'center',
      render: (subsidy) => (
        <div>
          {providers?.filter(provider => provider?.skillSet?.find(skill => skill == subsidy.skillSet?._id))?.map((provider, index) => (
            <p key={index}>{provider.firstName} {provider.lastName}</p>
          ))}
        </div>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (a) => (
        <Space size="middle">
          <a className='btn-blue' onClick={() => { }}>Approve</a>
          <a className='btn-blue' onClick={() => { }}>Decline</a>
        </Space>
      ),
      align: 'center',
      fixed: 'right',
    },
  ];

  const adminDeclinedColumns = [
    {
      title: 'Name',
      key: 'name',
      align: 'center',
      render: (subsidy) => <span>{subsidy.student.firstName ?? ''} {subsidy.student.lastName ?? ''}</span>,
    },
    {
      title: 'Student Grade',
      key: 'grade',
      align: 'center',
      render: (subsidy) => <span>{subsidy.student.currentGrade}</span>
    },
    {
      title: 'Service requested',
      key: 'skillSet',
      align: 'center',
      render: (subsidy) => <span>{subsidy.skillSet.name}</span>
    },
    {
      title: 'Note',
      key: 'note',
      align: 'center',
      render: (subsidy) => <span>{subsidy.note}</span>
    },
    {
      title: 'Providers',
      key: 'provider',
      align: 'center',
      render: (subsidy) => (
        <div>
          {providers?.filter(provider => provider?.skillSet?.find(skill => skill == subsidy.skillSet?._id))?.map((provider, index) => (
            <p key={index}>{provider.firstName} {provider.lastName}</p>
          ))}
        </div>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (a) => (
        <Space size="middle">
          <a className='btn-blue' onClick={() => { }}>Approve</a>
          <a className='btn-blue' onClick={() => { }}>Decline</a>
        </Space>
      ),
      align: 'center',
      fixed: 'right',
    },
  ];

  const components = {
    body: {
      row: DraggableBodyRow,
    },
  };

  const moveRow = useCallback(
    (dragIndex, hoverIndex) => {
      const dragRow = pendingList[dragIndex];
      console.log(pendingList)
      setPendingList(
        update(pendingList, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragRow],
          ],
        }),
      );
    },
    [pendingList],
  );

  const items = [
    {
      key: '1',
      label: 'Pending',
      children: (
        <Table
          bordered
          size='middle'
          dataSource={pendingList?.map((s, index) => ({ ...s, key: index }))}
          columns={pendingColumns}
          scroll={{ x: 1300 }}
          className='mt-2'
          pagination={false}
        />
      ),
    },
    {
      key: '2',
      label: 'Approved',
      children: (
        <div className="approved-list">
          <DndProvider backend={HTML5Backend}>
            <Table
              bordered
              size='middle'
              dataSource={shoolApprovedList?.map((s, index) => ({ ...s, key: index }))}
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
              className='mt-2'
              pagination={false}
            />
          </DndProvider>
        </div>
      ),
    },
    {
      key: '3',
      label: 'Declined',
      children: (
        <Table
          bordered
          size='middle'
          dataSource={schoolDeclinedList?.map((s, index) => ({ ...s, key: index }))}
          columns={schoolDeclinedColumns}
          scroll={{ x: 1300 }}
          className='mt-2'
          pagination={false}
        />
      ),
    },
    {
      key: '4',
      label: 'Admin Pre-Approved',
      children: (
        <Table
          bordered
          size='middle'
          dataSource={adminPreApprovedList?.map((s, index) => ({ ...s, key: index }))}
          columns={adminPreApprovedColumns}
          scroll={{ x: 1300 }}
          className='mt-2'
          pagination={false}
        />
      ),
    },
    {
      key: '5',
      label: 'Admin Declined',
      children: (
        <Table
          bordered
          size='middle'
          dataSource={adminDeclinedList?.map((s, index) => ({ ...s, key: index }))}
          columns={adminDeclinedColumns}
          scroll={{ x: 1300 }}
          className='mt-2'
          pagination={false}
        />
      ),
    },
    {
      key: '6',
      label: 'Admin Approved',
      children: (
        <Table
          bordered
          size='middle'
          dataSource={adminApprovedList?.map((s, index) => ({ ...s, key: index }))}
          columns={adminApprovedColumns}
          scroll={{ x: 1300 }}
          className='mt-2'
          pagination={false}
        />
      ),
    }
  ];

  useEffect(() => {
    const listSubsidaries = store.getState().appointments.dataSubsidyRequests;
    setPendingList(listSubsidaries?.filter(s => s.status == 0));
    setSchoolApprovedList(listSubsidaries?.filter(s => s.status == 1));
    setSchoolDeclinedList(listSubsidaries?.filter(s => s.status == 2));
    setAdminPreApprovedList(listSubsidaries?.filter(s => s.status == 3));
    setAdminDeclinedList(listSubsidaries?.filter(s => s.status == 4));
    setAdminApprovedList(listSubsidaries?.filter(s => s.status == 5));

    request.post(getAllProviderInSchool, { schoolId: user?.schoolInfo?._id }).then(res => {
      const { success, data } = res;
      if (success) {
        setProviders(data);
      } else {
        setProviders([]);
      }
    }).catch(err => {
      console.log('get providers error---', err);
      setProviders([]);
    })
  }, []);

  return (
    <div className="full-layout page school-dashboard h-100">
      <Tabs
        defaultActiveKey="1"
        type="card"
        size='small'
        items={items}
        className="bg-white p-10 h-100 overflow-y-scroll overflow-x-hidden"
      >
      </Tabs>
    </div>
  );
}

export default Subsidaries;