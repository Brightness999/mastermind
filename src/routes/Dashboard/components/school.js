import React, { useCallback, useEffect, useRef, useState } from "react";
import { message, Space, Table, Tabs } from "antd";
import update from 'immutability-helper';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { connect } from 'react-redux';
import { compose } from 'redux';
import moment from 'moment';

import request from "../../../utils/api/request";
import { acceptSubsidyRequest, denySubsidyRequest, getAllProviderInSchool, reorderRequests } from "../../../utils/api/apiList";
import { ModalConfirm, ModalSchoolSubsidyApproval, ModalSubsidyProgress } from "../../../components/Modal";
import { getSubsidyRequests, setSubsidyRequests } from "../../../redux/features/appointmentsSlice";

const Subsidaries = (props) => {
  const type = 'DraggableBodyRow';
  const { user } = props.auth;
  const [requests, setRequests] = useState(props.listSubsidaries?.filter(s => s.status == 0));
  const [status, setStatus] = useState(0);
  const [providers, setProviders] = useState([]);
  const [selectedSubsidyId, setSelectedSubsidyId] = useState({});
  const [visibleSubsidy, setVisibleSubsidy] = useState(false);
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [visibleSchoolApproval, setVisibleSchoolApproval] = useState(false);

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

  const onShowModalSubsidy = (subsidyId) => {
    setSelectedSubsidyId(subsidyId);
    setVisibleSubsidy(true);
  }

  useEffect(() => {
    setRequests(props.listSubsidaries?.filter(s => s.status === status));
  }, [props.listSubsidaries]);

  const pendingColumns = [
    {
      title: <span className="font-16">Name</span>,
      key: 'name',
      align: 'center',
      fixed: 'left',
      render: (subsidy) => <span>{subsidy.student.firstName ?? ''} {subsidy.student.lastName ?? ''}</span>,
    },
    {
      title: <span className="font-16">Student Grade</span>,
      key: 'grade',
      align: 'center',
      render: (subsidy) => <span>{subsidy.student.currentGrade}</span>
    },
    {
      title: <span className="font-16">Service Requested</span>,
      key: 'skillSet',
      align: 'center',
      render: (subsidy) => <span>{subsidy.skillSet.name}</span>
    },
    {
      title: <span className="font-16">Note</span>,
      key: 'note',
      align: 'center',
      render: (subsidy) => <span>{subsidy.note}</span>
    },
    {
      title: <span className="font-16">Request Date</span>,
      key: 'createdAt',
      align: 'center',
      render: (subsidy) => <span>{moment(subsidy.createdAt).format('MM/DD/YYYY hh:mm A')}</span>
    },
    {
      title: <span className="font-16">Action</span>,
      key: 'action',
      render: (subsidy) => (
        <Space size="middle">
          <a className='btn-blue' onClick={() => onShowModalSchoolApproval(subsidy?._id)}>Approve</a>
          <a className='btn-blue' onClick={() => onShowModalConfirm(subsidy?._id)}>Decline</a>
        </Space>
      ),
      align: 'center',
      fixed: 'right',
    },
  ];

  const schoolApprovedColumns = [
    {
      title: <span className="font-16">Name</span>,
      key: 'name',
      align: 'center',
      fixed: 'left',
      render: (subsidy) => <span>{subsidy.student.firstName ?? ''} {subsidy.student.lastName ?? ''}</span>,
    },
    {
      title: <span className="font-16">Student Grade</span>,
      key: 'grade',
      align: 'center',
      render: (subsidy) => <span>{subsidy.student.currentGrade}</span>
    },
    {
      title: <span className="font-16">Service Requested</span>,
      key: 'skillSet',
      align: 'center',
      render: (subsidy) => <span>{subsidy.skillSet.name}</span>
    },
    {
      title: <span className="font-16">Note</span>,
      key: 'note',
      align: 'center',
      render: (subsidy) => <span>{subsidy.note}</span>
    },
    {
      title: <span className="font-16">Provider</span>,
      key: 'provider',
      align: 'center',
      render: (subsidy) => (
        <div>{subsidy?.selectedProvider?.firstName ?? ''} {subsidy?.selectedProvider?.lastName ?? ''}</div>
      )
    },
    {
      title: <span className="font-16">Approval Date</span>,
      key: 'approvalDate',
      align: 'center',
      render: (subsidy) => <span>{moment(subsidy.schoolApprovalDate).format('MM/DD/YYYY hh:mm A')}</span>
    },
    {
      title: <span className="font-16">Action</span>,
      key: 'action',
      render: (subsidy) => (
        <Space size="middle">
          <a className='btn-blue' onClick={() => onShowModalSubsidy(subsidy._id)}>Edit</a>
        </Space>
      ),
      align: 'center',
      fixed: 'right',
    },
  ];

  const schoolDeclinedColumns = [
    {
      title: <span className="font-16">Name</span>,
      key: 'name',
      align: 'center',
      fixed: 'left',
      render: (subsidy) => <span>{subsidy.student.firstName ?? ''} {subsidy.student.lastName ?? ''}</span>,
    },
    {
      title: <span className="font-16">Student Grade</span>,
      key: 'grade',
      align: 'center',
      render: (subsidy) => <span>{subsidy.student.currentGrade}</span>
    },
    {
      title: <span className="font-16">Service Requested</span>,
      key: 'skillSet',
      align: 'center',
      render: (subsidy) => <span>{subsidy.skillSet.name}</span>
    },
    {
      title: <span className="font-16">Note</span>,
      key: 'note',
      align: 'center',
      render: (subsidy) => <span>{subsidy.note}</span>
    },
  ];

  const adminPreApprovedColumns = [
    {
      title: <span className="font-16">Name</span>,
      key: 'name',
      align: 'center',
      fixed: 'left',
      render: (subsidy) => <span>{subsidy.student.firstName ?? ''} {subsidy.student.lastName ?? ''}</span>,
    },
    {
      title: <span className="font-16">Student Grade</span>,
      key: 'grade',
      align: 'center',
      render: (subsidy) => <span>{subsidy.student.currentGrade}</span>
    },
    {
      title: <span className="font-16">Service Requested</span>,
      key: 'skillSet',
      align: 'center',
      render: (subsidy) => <span>{subsidy.skillSet.name}</span>
    },
    {
      title: <span className="font-16">Note</span>,
      key: 'note',
      align: 'center',
      render: (subsidy) => <span>{subsidy.note}</span>
    },
    {
      title: <span className="font-16">Provider</span>,
      key: 'provider',
      align: 'center',
      render: (subsidy) => (
        <div>{subsidy?.selectedProvider?.firstName ?? ''} {subsidy?.selectedProvider?.lastName ?? ''}</div>
      )
    },
  ];

  const adminApprovedColumns = [
    {
      title: <span className="font-16">Name</span>,
      key: 'name',
      align: 'center',
      fixed: 'left',
      render: (subsidy) => <span>{subsidy.student.firstName ?? ''} {subsidy.student.lastName ?? ''}</span>,
    },
    {
      title: <span className="font-16">Student Grade</span>,
      key: 'grade',
      align: 'center',
      render: (subsidy) => <span>{subsidy.student.currentGrade}</span>
    },
    {
      title: <span className="font-16">Service Requested</span>,
      key: 'skillSet',
      align: 'center',
      render: (subsidy) => <span>{subsidy.skillSet.name}</span>
    },
    {
      title: <span className="font-16">Note</span>,
      key: 'note',
      align: 'center',
      render: (subsidy) => <span>{subsidy.note}</span>
    },
    {
      title: <span className="font-16">Approval Date</span>,
      key: 'approvalDate',
      align: 'center',
      render: (subsidy) => <span>{moment(subsidy.approvalDate).format('MM/DD/YYYY hh:mm A')}</span>
    },
    {
      title: <span className="font-16">Provider</span>,
      key: 'provider',
      align: 'center',
      render: (subsidy) => (
        <div>{subsidy?.selectedProvider?.firstName ?? ''} {subsidy?.selectedProvider?.lastName ?? ''}</div>
      )
    },
  ];

  const adminDeclinedColumns = [
    {
      title: <span className="font-16">Name</span>,
      key: 'name',
      align: 'center',
      fixed: 'left',
      render: (subsidy) => <span>{subsidy.student.firstName ?? ''} {subsidy.student.lastName ?? ''}</span>,
    },
    {
      title: <span className="font-16">Student Grade</span>,
      key: 'grade',
      align: 'center',
      render: (subsidy) => <span>{subsidy.student.currentGrade}</span>
    },
    {
      title: <span className="font-16">Service Requested</span>,
      key: 'skillSet',
      align: 'center',
      render: (subsidy) => <span>{subsidy.skillSet.name}</span>
    },
    {
      title: <span className="font-16">Note</span>,
      key: 'note',
      align: 'center',
      render: (subsidy) => <span>{subsidy.note}</span>
    },
    {
      title: <span className="font-16">Provider</span>,
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
      label: <span className="font-16">Pending</span>,
      children: (
        <Table
          bordered
          size='middle'
          dataSource={requests?.map((s, index) => ({ ...s, key: index }))}
          columns={pendingColumns}
          scroll={{ x: 1300 }}
          className='mt-2 pb-10'
          onRow={(subsidy) => ({
            onClick: (e) => e.target.className !== 'btn-blue' && onShowModalSubsidy(subsidy?._id),
            onDoubleClick: (e) => e.target.className !== 'btn-blue' && onShowModalSubsidy(subsidy?._id),
          })}
          pagination={false}
        />
      ),
    },
    {
      key: '2',
      label: <span className="font-16">Approved</span>,
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
              className='mt-2 pb-10'
              pagination={false}
            />
          </DndProvider>
        </div>
      ),
    },
    {
      key: '3',
      label: <span className="font-16">Declined</span>,
      children: (
        <Table
          bordered
          size='middle'
          dataSource={requests?.map((s, index) => ({ ...s, key: index }))}
          columns={schoolDeclinedColumns}
          scroll={{ x: 1300 }}
          className='mt-2 pb-10'
          pagination={false}
        />
      ),
    },
    {
      key: '4',
      label: <span className="font-16">Admin Pre-Approved</span>,
      children: (
        <Table
          bordered
          size='middle'
          dataSource={requests?.map((s, index) => ({ ...s, key: index }))}
          columns={adminPreApprovedColumns}
          scroll={{ x: 1300 }}
          onRow={(subsidy) => ({
            onClick: (e) => e.target.className !== 'btn-blue' && onShowModalSubsidy(subsidy?._id),
            onDoubleClick: (e) => e.target.className !== 'btn-blue' && onShowModalSubsidy(subsidy?._id),
          })}
          className='mt-2 pb-10'
          pagination={false}
        />
      ),
    },
    {
      key: '5',
      label: <span className="font-16">Admin Declined</span>,
      children: (
        <Table
          bordered
          size='middle'
          dataSource={requests?.map((s, index) => ({ ...s, key: index }))}
          columns={adminDeclinedColumns}
          scroll={{ x: 1300 }}
          className='mt-2 pb-10'
          pagination={false}
        />
      ),
    },
    {
      key: '6',
      label: <span className="font-16">Admin Approved</span>,
      children: (
        <Table
          bordered
          size='middle'
          dataSource={requests?.map((s, index) => ({ ...s, key: index }))}
          columns={adminApprovedColumns}
          scroll={{ x: 1300 }}
          onRow={(subsidy) => ({
            onClick: (e) => e.target.className !== 'btn-blue' && onShowModalSubsidy(subsidy?._id),
            onDoubleClick: (e) => e.target.className !== 'btn-blue' && onShowModalSubsidy(subsidy?._id),
          })}
          className='mt-2 pb-10'
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

  const onShowModalConfirm = (subsidyId) => {
    setVisibleConfirm(true);
    setSelectedSubsidyId(subsidyId);
  }

  const onCloseModalConfirm = () => {
    setVisibleConfirm(false);
  }

  const onShowModalSchoolApproval = (subsidyId) => {
    setVisibleSchoolApproval(true);
    setSelectedSubsidyId(subsidyId);
  }

  const onCloseModalSchoolApproval = () => {
    setVisibleSchoolApproval(false);
  }

  const schoolAcceptSubsidy = (data) => {
    const { selectedProvider, decisionExplanation } = data;
    setVisibleSchoolApproval(false);

    request.post(acceptSubsidyRequest, {
      subsidyId: selectedSubsidyId,
      student: requests?.find(a => a._id === selectedSubsidyId)?.student?._id,
      selectedProvider,
      decisionExplanation,
    }).then(result => {
      const { success, data } = result;
      if (success) {
        const newSubsidyRequests = JSON.parse(JSON.stringify(props.listSubsidaries));
        props.dispatch(setSubsidyRequests(newSubsidyRequests?.map(s => {
          if (s._id === selectedSubsidyId) {
            s.status = data.status;
          }
          return s;
        })));
      }
    }).catch(err => {
      message.error(err.message);
    })
  }

  const schoolDenySubsidy = () => {
    setVisibleConfirm(false);
    request.post(denySubsidyRequest, { subsidyId: selectedSubsidyId }).then(result => {
      const { success, data } = result;
      if (success) {
        const newSubsidyRequests = JSON.parse(JSON.stringify(props.listSubsidaries));
        props.dispatch(setSubsidyRequests(newSubsidyRequests?.map(s => {
          if (s._id === selectedSubsidyId) {
            s.status = data.status;
          }
          return s;
        })));
      }
    }).catch(err => {
      message.error(err.message);
    })
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

  useEffect(() => {
    if (props.subsidyId) {
      onShowModalSubsidy(props.subsidyId)
    }
  }, [props.subsidyId]);

  const modalSubsidyProps = {
    visible: visibleSubsidy,
    onSubmit: onCloseModalSubsidy,
    onCancel: onCloseModalSubsidy,
    subsidyId: selectedSubsidyId,
    openReferral: onShowModalReferral,
    openHierachy: openHierachyModal,
    providers: providers,
  }

  const modalSchoolApprovalProps = {
    visible: visibleSchoolApproval,
    onSubmit: schoolAcceptSubsidy,
    onCancel: onCloseModalSchoolApproval,
    providers: providers,
    subsidy: requests?.find(a => a._id === selectedSubsidyId),
  }

  const modalConfirmProps = {
    visible: visibleConfirm,
    onSubmit: schoolDenySubsidy,
    onCancel: onCloseModalConfirm,
    message: "Are you sure to decline this request?",
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
      {visibleSchoolApproval && <ModalSchoolSubsidyApproval {...modalSchoolApprovalProps} />}
      {visibleConfirm && <ModalConfirm {...modalConfirmProps} />}
    </div>
  );
}


const mapStateToProps = state => ({
  listSubsidaries: state.appointments.dataSubsidyRequests,
  auth: state.auth,
})

export default compose(connect(mapStateToProps))(Subsidaries);