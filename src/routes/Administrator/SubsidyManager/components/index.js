import React, { useState } from 'react';
import { Divider, Table, Space, Select, Input, Row, Col, Form, Button, message } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';

import mgsSidebar from '../../../../components/SideBar/messages';
import request from '../../../../utils/api/request'
import { ModalSubsidyProgress } from '../../../../components/Modal';
import { getAdminSubsidyRequests } from '../../../../utils/api/apiList';
import PageLoading from '../../../../components/Loading/PageLoading';
import './index.less';

const SubsidyManager = (props) => {
  const { skillSet, academicLevels } = props.auth;
  const [listSubsidy, setListSubsidy] = useState(props.listSubsidy);
  const [visibleSubsidy, setVisibleSubsidy] = useState(false);
  const [filterSchool, setFilterSchool] = useState(undefined);
  const [filterStudent, setFilterStudent] = useState(undefined);
  const [filterProvider, setFilterProvider] = useState(undefined);
  const [filterSkillSet, setfilterSkillSet] = useState(undefined);
  const [filterStatus, setFilterStatus] = useState(undefined);
  const [filterGrade, setFilterGrade] = useState(undefined);
  const [subsidyId, setSubsidyId] = useState(undefined);
  const [loading, setLoading] = useState(false);

  const generatePostData = () => {
    let postData = {
      "filter": {},
      "populate": [{ path: 'school' }, { path: 'providers' }, { path: 'student' }, { path: 'selectedProvider' }]
    };

    if (filterSchool != undefined && filterSchool.length > 0) {
      postData['filterSchool'] = filterSchool;
    }

    if (filterStudent != undefined && filterStudent.length > 0) {
      postData['filterStudent'] = filterStudent;
    }

    if (filterProvider != undefined && filterProvider.length > 0) {
      postData['filterProvider'] = filterProvider;
    }

    if (filterStatus != undefined) {
      postData['filterStatus'] = parseInt(filterStatus);
    }

    if (filterGrade != undefined) {
      postData['filterGrade'] = parseInt(filterGrade);
    }
    return postData;
  }

  const getSubsidyRequests = () => {
    const postData = generatePostData();
    setLoading(true);
    request.post(getAdminSubsidyRequests, postData).then(result => {
      setLoading(false);
      const { success, data } = result;
      if (success) {
        setListSubsidy(data?.docs ?? []);
      }
    }).catch(err => {
      setLoading(false);
      message.error(err.message);
    });
  }

  const statusType = (subsidy) => {
    switch (subsidy.status) {
      case 0: return 'PENDING';
      case 1: return 'SCHOOL APPROVED';
      case 2: return 'SCHOOL DECLINED';
      case 3: return 'PREAPPROVED';
      case 4: return 'DECLINED';
      case 5: return 'APPROVED';
      case -1: return 'CANCELLED';
      default: return '';
    }
  }

  const clearFilter = () => {
    setFilterSchool('');
    setFilterStudent('');
    setFilterProvider('');
    setfilterSkillSet(undefined);
    setFilterStatus(undefined);
    setFilterGrade(undefined);
    getSubsidyRequests();
  }

  const applyFilter = () => {
    getSubsidyRequests();
  }

  const onCloseModalSubsidy = () => {
    setVisibleSubsidy(false);
    setSubsidyId('');
  };

  const onShowModalSubsidy = (subsidyId) => {
    setVisibleSubsidy(true);
    setSubsidyId(subsidyId);
  };

  const modalSubsidyProps = {
    visible: visibleSubsidy,
    subsidyId: subsidyId,
    onSubmit: onCloseModalSubsidy,
    onCancel: onCloseModalSubsidy,
  }

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (a) => <span>{a.student.firstName ?? ''} {a.student.lastName ?? ''}</span>,
      fixed: 'left',
    },
    {
      title: 'Student Grade',
      key: 'grade',
      render: (a) => <span>{a.student.currentGrade}</span>
    },
    {
      title: 'School',
      key: 'school',
      render: (a) => <span>{a.school.name}</span>
    },
    {
      title: 'Providers',
      key: 'provider',
      render: (a) => <span>{a.provider?.firstName ?? ''} {a.provider?.lastName ?? ''}</span>
    },
    {
      title: 'Expense per session',
      key: 'expensepersession',
      align: 'center',
      render: (a) => <span>{a.priceForSession}</span>
    },
    {
      title: '# of sessions',
      key: 'totalSessions',
      align: 'center',
      render: (a) => <span>{a.numberOfSessions}</span>
    },
    {
      title: '# of sessions paid to date',
      key: 'totalSessions',
      align: 'center',
      render: (a) => <span>0</span>
    },
    {
      title: 'HMGH Payment to date',
      key: 'paymenttodate',
      align: 'center',
      render: (a) => <span>0</span>
    },
    {
      title: 'Total HMGH Expense',
      key: 'totalExpense',
      align: 'center',
      render: (a) => <span>0</span>
    },
    {
      title: 'Status',
      key: 'address',
      align: 'center',
      render: (a) => <span>{statusType(a)}</span>
    },
    {
      title: 'Action',
      key: 'action',
      render: (a) => (
        <Space size="middle">
          <a className='btn-blue' onClick={v => onShowModalSubsidy(a._id)}>Edit</a>
        </Space>
      ),
      width: 80,
      align: 'center',
      fixed: 'right',
    },
  ];

  return (
    <div className="full-layout page subsidymanager-page">
      <div className='div-title-admin'>
        <p className='font-16 font-500'>{intl.formatMessage(mgsSidebar.subsidyManager)}</p>
        <Divider />
      </div>
      <Row >
        <Col xs={24} sm={24} md={20} lg={18} xl={12} className='col-form col-subsidy-manager'>
          <Form name="form_subsidy">
            <Row gutter={10}>
              <Col span={12}>
                <Form.Item name="student_name">
                  <Input
                    placeholder='Student name'
                    value={filterStudent}
                    onChange={e => setFilterStudent(e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="provider_name">
                  <Input
                    placeholder='Provider name'
                    value={filterProvider}
                    onChange={e => setFilterProvider(e.target.value)}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={10}>
              <Col span={12}>
                <Form.Item name="school_name">
                  <Input
                    placeholder='School name'
                    value={filterSchool}
                    onChange={e => setFilterSchool(e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="grade" >
                  <Select
                    placeholder='Grade'
                    onChange={v => setFilterGrade(v)}
                  >
                    {academicLevels?.map((level, index) => (<Select.Option key={index} value={level}>{level}</Select.Option>))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={10}>
              <Col span={12}>
                <Form.Item name="skillset" >
                  <Select
                    placeholder='Skill'
                    onChange={v => setfilterSkillSet(v)}
                  >
                    {skillSet?.map((skill, index) => (<Select.Option key={index} value={skill._id}>{skill.name}</Select.Option>))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="status" >
                  <Select
                    placeholder='Status'
                    onChange={v => setFilterStatus(v)}
                  >
                    <Select.Option value='0'>PENDING</Select.Option>
                    <Select.Option value='-1'>DECLINE</Select.Option>
                    <Select.Option value='1'>APPROVED</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <div className="flex flex-row">
                <Button onClick={() => clearFilter()} className='mr-10'>Clear</Button>
                <Button type='primary' onClick={() => applyFilter()} htmlType="submit">Apply Search</Button>
              </div>
            </Form.Item>
          </Form>
        </Col>
      </Row>
      <Table
        bordered
        size='middle'
        dataSource={listSubsidy}
        columns={columns}
        scroll={{ x: 1300 }}
        className='mt-2'
      />
      {visibleSubsidy && <ModalSubsidyProgress {...modalSubsidyProps} />}
      <PageLoading loading={loading} isBackground={true} />
    </div>
  );
}

const mapStateToProps = state => ({
  auth: state.auth,
  listSubsidy: state.appointments.dataSubsidyRequests,
});

export default compose(connect(mapStateToProps))(SubsidyManager);