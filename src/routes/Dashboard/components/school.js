import React, { useCallback, useEffect, useRef, useState } from "react";
import { Space, Table, Tabs } from "antd";
import update from 'immutability-helper';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import request from "../../../utils/api/request";
import { getAllProviderInSchool, reorderRequests } from "../../../utils/api/apiList";
import { connect } from 'react-redux';
import { compose } from 'redux';
import { ModalSubsidyProgress } from "../../../components/Modal";
import { getSubsidyRequests } from "../../../redux/features/appointmentsSlice";

const Subsidaries = (props) => {
  const type = 'DraggableBodyRow';
  const { user } = props.auth;
  const [requests, setRequests] = useState(props.listSubsidaries?.filter(s => s.status == 0));
  const [status, setStatus] = useState(0);
  const [providers, setProviders] = useState([]);
  const [selectedSubsidy, setSelectedSubsidy] = useState({});
  const [visibleSubsidy, setVisibleSubsidy] = useState(false);

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

  const onShowModalSubsidy = (subsidy) => {
    setSelectedSubsidy(subsidy);
    setVisibleSubsidy(true);
  }

  useEffect(() => {
    setRequests(props.listSubsidaries?.filter(s => s.status === status));
  }, [props.listSubsidaries]);

  const pendingColumns = [
    {
      title: 'Name',
      key: 'name',
      align: 'center',
      fixed: 'left',
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
          {providers?.filter(provider => provider?.skillSet?.find(skill => skill === subsidy.skillSet?._id))?.map((provider, index) => (
            <div key={index}>{provider.firstName} {provider.lastName}</div>
          ))}
        </div>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (subsidy) => (
        <Space size="middle">
          <a className='btn-blue' onClick={() => onShowModalSubsidy(subsidy)}>Edit</a>
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
      fixed: 'left',
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
      title: 'Recommended Provider',
      key: 'provider',
      align: 'center',
      render: (subsidy) => (
        <div>{subsidy?.selectedProvider?.firstName ?? ''} {subsidy?.selectedProvider?.lastName ?? ''}</div>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (subsidy) => (
        <Space size="middle">
          <a className='btn-blue' onClick={() => onShowModalSubsidy(subsidy)}>Edit</a>
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
      fixed: 'left',
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
            <div key={index}>{provider.firstName} {provider.lastName}</div>
          ))}
        </div>
      )
    },
  ];

  const adminPreApprovedColumns = [
    {
      title: 'Name',
      key: 'name',
      align: 'center',
      fixed: 'left',
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
      title: 'Recommended Provider',
      key: 'provider',
      align: 'center',
      render: (subsidy) => (
        <div>{subsidy?.selectedProvider?.firstName ?? ''} {subsidy?.selectedProvider?.lastName ?? ''}</div>
      )
    },
  ];

  const adminApprovedColumns = [
    {
      title: 'Name',
      key: 'name',
      align: 'center',
      fixed: 'left',
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
      title: 'Recommended Provider',
      key: 'provider',
      align: 'center',
      render: (subsidy) => (
        <div>{subsidy?.selectedProvider?.firstName ?? ''} {subsidy?.selectedProvider?.lastName ?? ''}</div>
      )
    },
  ];

  const adminDeclinedColumns = [
    {
      title: 'Name',
      key: 'name',
      align: 'center',
      fixed: 'left',
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
      title: 'Recommended Provider',
      key: 'provider',
      align: 'center',
      render: (subsidy) => (
        <div>{subsidy?.selectedProvider?.firstName ?? ''} {subsidy?.selectedProvider?.lastName ?? ''}</div>
      )
    },
  ];

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
      handleReorder(updatedList);
      setRequests(updatedList);
    },
    [requests],
  );

  const items = [
    {
      key: '1',
      label: 'Pending',
      children: (
        <Table
          bordered
          size='middle'
          dataSource={requests?.map((s, index) => ({ ...s, key: index }))}
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
          dataSource={requests?.map((s, index) => ({ ...s, key: index }))}
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
          dataSource={requests?.map((s, index) => ({ ...s, key: index }))}
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
          dataSource={requests?.map((s, index) => ({ ...s, key: index }))}
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
          dataSource={requests?.map((s, index) => ({ ...s, key: index }))}
          columns={adminApprovedColumns}
          scroll={{ x: 1300 }}
          className='mt-2'
          pagination={false}
        />
      ),
    }
  ];

  const handleChangeTab = v => {
    setRequests(props.listSubsidaries?.filter(s => s.status == v - 1));
    setStatus(v - 1);
  }

  const onCloseModalSubsidy = () => {
    setVisibleSubsidy(false);
  }

  const onShowModalReferral = () => { }

  const openHierachyModal = () => { }

  const handleReorder = (updatedList) => {
    const requestIds = updatedList?.map(a => a?._id);
    const orders = updatedList?.map(a => a.orderPosition)?.sort((a, b) => b - a);
    if (requestIds?.length > 0 && orders?.length > 0 && requestIds?.length === orders?.length) {
      request.post(reorderRequests, { requestIds, orders }).then(res => res.success && props.dispatch(getSubsidyRequests({ role: user.role })));
    }
  }

  useEffect(() => {
    if (user?.schoolInfo?._id) {
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
    }
  }, [user]);

  const modalSubsidyProps = {
    visible: visibleSubsidy,
    onSubmit: onCloseModalSubsidy,
    onCancel: onCloseModalSubsidy,
    subsidyId: selectedSubsidy?._id,
    openReferral: onShowModalReferral,
    openHierachy: openHierachyModal,
  }

  return (
    <div className="full-layout page school-dashboard h-100">
      <Tabs
        defaultActiveKey="1"
        type="card"
        size='small'
        items={items}
        className="bg-white p-10 h-100 overflow-y-scroll overflow-x-hidden"
        onChange={(v) => handleChangeTab(v)}
      >
      </Tabs>
      {visibleSubsidy && <ModalSubsidyProgress {...modalSubsidyProps} />}
    </div>
  );
}


const mapStateToProps = state => ({
  listSubsidaries: state.appointments.dataSubsidyRequests,
  auth: state.auth,
})

export default compose(connect(mapStateToProps))(Subsidaries);