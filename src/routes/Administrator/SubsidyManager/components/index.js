import React, { useEffect, useState } from 'react';
import { Divider, Select, Input, Row, Col, Form, Button, message, Tabs } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';

import mgsSidebar from '../../../../components/SideBar/messages';
import messages from '../../../Dashboard/messages';
import msgCreateAccount from '../../../Sign/CreateAccount/messages';
import request from '../../../../utils/api/request'
import { ModalConfirm, ModalSchoolSubsidyApproval, ModalSubsidyProgress } from '../../../../components/Modal';
import { acceptSubsidyRequest, denySubsidyRequest, getAdminSubsidyRequests, reorderRequests } from '../../../../utils/api/apiList';
import PageLoading from '../../../../components/Loading/PageLoading';
import { getSubsidyRequests, setSubsidyRequests } from "../../../../redux/features/appointmentsSlice";
import SchoolPending from './SchoolPending';
import SchoolApproved from './SchoolApproved';
import SchoolDeclined from './SchoolDeclined';
import AdminPreApproved from './AdminPreApproved';
import AdminDeclined from './AdminDeclined';
import AdminApproved from './AdminApproved';
import './index.less';

const SubsidyManager = (props) => {
  const { user, providers, skillSet, academicLevels, schools } = props.auth;
  const skills = JSON.parse(JSON.stringify(skillSet ?? []))?.map(skill => { skill['text'] = skill.name, skill['value'] = skill._id; return skill; });
  const grades = JSON.parse(JSON.stringify(academicLevels ?? []))?.slice(6)?.map(level => ({ text: level, value: level }));
  const schoolInfos = JSON.parse(JSON.stringify(schools ?? []))?.map(s => s?.schoolInfo)?.map(school => { school['text'] = school.name, school['value'] = school._id; return school; });
  const [visibleSubsidy, setVisibleSubsidy] = useState(false);
  const [filterSchool, setFilterSchool] = useState(undefined);
  const [filterStudent, setFilterStudent] = useState(undefined);
  const [filterProvider, setFilterProvider] = useState(undefined);
  const [filterSkillSet, setfilterSkillSet] = useState(undefined);
  const [filterStatus, setFilterStatus] = useState(undefined);
  const [filterGrade, setFilterGrade] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState(props.listSubsidy?.filter(s => s.status === 0));
  const [status, setStatus] = useState(0);
  const [selectedSubsidyId, setSelectedSubsidyId] = useState(undefined);
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [visibleSchoolApproval, setVisibleSchoolApproval] = useState(false);

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
        setRequests(data?.docs?.filter(s => s.status === status));
      }
    }).catch(err => {
      setLoading(false);
      message.error(err.message);
    });
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

  const onShowModalSubsidy = (subsidyId) => {
    setSelectedSubsidyId(subsidyId);
    setVisibleSubsidy(true);
  }

  const onCloseModalSubsidy = () => {
    setVisibleSubsidy(false);
    setSelectedSubsidyId(undefined);
  };

  const handleReorder = (updatedList) => {
    const requestIds = updatedList?.map(a => a?._id);
    const orders = updatedList?.map(a => a.orderPosition)?.sort((a, b) => b - a);
    if (requestIds?.length > 0 && orders?.length > 0 && requestIds?.length === orders?.length) {
      request.post(reorderRequests, { requestIds, orders }).then(res => res.success && props.getSubsidyRequests({ role: user.role }));
    }
  }

  const handleChangeTab = v => {
    setRequests(props.listSubsidy?.filter(s => s.status == v - 1));
    setStatus(v - 1);
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
        const newSubsidyRequests = JSON.parse(JSON.stringify(props.listSubsidy));
        props.setSubsidyRequests(newSubsidyRequests?.map(s => {
          if (s._id === selectedSubsidyId) {
            s.status = data.status;
          }
          return s;
        }));
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
        const newSubsidyRequests = JSON.parse(JSON.stringify(props.listSubsidy));
        props.setSubsidyRequests(newSubsidyRequests?.map(s => {
          if (s._id === selectedSubsidyId) {
            s.status = data.status;
          }
          return s;
        }));
      }
    }).catch(err => {
      message.error(err.message);
    })
  }

  const items = [
    {
      key: '1',
      label: <span className="font-16">{intl.formatMessage(msgCreateAccount.school)} {intl.formatMessage(messages.pending)}</span>,
      children: (
        <SchoolPending
          requests={requests}
          skills={skills}
          grades={grades}
          schools={schoolInfos}
          onShowModalSubsidy={onShowModalSubsidy}
          onShowModalSchoolApproval={onShowModalSchoolApproval}
          onShowModalConfirm={onShowModalConfirm}
        />
      ),
    },
    {
      key: '2',
      label: <span className="font-16">{intl.formatMessage(msgCreateAccount.school)} {intl.formatMessage(messages.approved)}</span>,
      children: (
        <SchoolApproved
          requests={requests}
          skills={skills}
          grades={grades}
          schools={schoolInfos}
          setRequests={setRequests}
          onShowModalSubsidy={onShowModalSubsidy}
          handleReorder={handleReorder}
        />
      ),
    },
    {
      key: '3',
      label: <span className="font-16">{intl.formatMessage(msgCreateAccount.school)} {intl.formatMessage(messages.declined)}</span>,
      children: (
        <SchoolDeclined
          requests={requests}
          skills={skills}
          grades={grades}
          schools={schoolInfos}
          onShowModalSubsidy={onShowModalSubsidy}
        />
      ),
    },
    {
      key: '4',
      label: <span className="font-16">{intl.formatMessage(messages.preApproved)}</span>,
      children: (
        <AdminPreApproved
          requests={requests}
          skills={skills}
          grades={grades}
          schools={schoolInfos}
          onShowModalSubsidy={onShowModalSubsidy}
        />
      ),
    },
    {
      key: '5',
      label: <span className="font-16">{intl.formatMessage(messages.declined)}</span>,
      children: (
        <AdminDeclined
          requests={requests}
          skills={skills}
          grades={grades}
          schools={schoolInfos}
          onShowModalSubsidy={onShowModalSubsidy}
        />
      ),
    },
    {
      key: '6',
      label: <span className="font-16">{intl.formatMessage(messages.approved)}</span>,
      children: (
        <AdminApproved
          requests={requests}
          skills={skills}
          grades={grades}
          schools={schoolInfos}
          onShowModalSubsidy={onShowModalSubsidy}
        />
      ),
    }
  ];

  useEffect(() => {
    setRequests(props.listSubsidy?.filter(s => s.status === status));
  }, [props.listSubsidy]);

  useEffect(() => {
    props.getSubsidyRequests({ role: user.role });
  }, []);

  const modalSubsidyProps = {
    visible: visibleSubsidy,
    onSubmit: onCloseModalSubsidy,
    onCancel: onCloseModalSubsidy,
    subsidyId: selectedSubsidyId,
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
                <Button type='primary' onClick={() => getSubsidyRequests()} htmlType="submit">Apply Search</Button>
              </div>
            </Form.Item>
          </Form>
        </Col>
      </Row>
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
      <PageLoading loading={loading} isBackground={true} />
    </div>
  );
}

const mapStateToProps = state => ({
  auth: state.auth,
  listSubsidy: state.appointments.dataSubsidyRequests,
});

export default compose(connect(mapStateToProps, { getSubsidyRequests, setSubsidyRequests }))(SubsidyManager);