import React from 'react';
import { Divider, Table, Space, Select, Input, Row, Col, Form, Button, message } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';

import mgsSidebar from '../../../../components/SideBar/messages';
import request from '../../../../utils/api/request'
import { ModalNewGroup, ModalSubsidyProgress } from '../../../../components/Modal';
import { getAdminSubsidyRequests } from '../../../../utils/api/apiList';
import PageLoading from '../../../../components/Loading/PageLoading';
import './index.less';

class SubsidyManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listSubsidy: [],
      currentPage: 0,
      limit: 10,
      totalPages: 1,
      visibleSubsidy: false,
      visibleNewGroup: false,
      skillSet: [],
      filterSchool: undefined,
      filterStudent: undefined,
      filterProvider: undefined,
      filterSkillSet: undefined,
      filterMeetSolution: undefined,
      filterStatus: undefined,
      filterGrade: undefined,
      isApplyFilter: false,
      academicLevels: [],
      subsidyId: '',
      loading: false,
    }
  }

  componentDidMount = () => {
    const { skillSet, academicLevels } = this.props.auth;

    this.setState({
      skillSet: skillSet,
      academicLevels: academicLevels,
    });
    this.getSubsidyPerPage();
  }

  generatePostData = () => {
    const { isApplyFilter, filterSchool, filterStudent, filterProvider, filterStatus, filterGrade } = this.state;
    let postData = {
      "filter": {},
      "populate": [{ path: 'school' }, { path: 'providers' }, { path: 'student' }, { path: 'selectedProvider' }]
    };

    if (isApplyFilter) {
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
    }
    return postData;
  }

  getSubsidyPerPage = (page = 1) => {
    const postData = this.generatePostData();
    this.setState({ loading: true });
    request.post(getAdminSubsidyRequests, postData).then(result => {
      this.setState({ loading: false });
      const { success, data } = result;
      if (success) {
        this.setState({ currentPage: page, listSubsidy: data?.docs, totalPages: data?.docs });
      }
    }).catch(err => {
      this.setState({ loading: false });
      message.error(err.message);
    });
  }

  statusType(subsidy) {
    if (subsidy.status == -1 || subsidy.adminApprovalStatus == -1) {
      return 'DECLINED';
    }
    if (subsidy.adminApprovalStatus == 1) {
      return 'APPROVED';
    }
    if (subsidy.status == 1) {
      return 'SCHOOL APPROVED';
    }
    return 'PENDING';
  }

  clearFilter = () => {
    this.form.resetFields();
    this.setState({
      filterSchool: "",
      filterStudent: "",
      filterProvider: "",
      filterSkillSet: undefined,
      filterStatus: undefined,
      filterGrade: undefined,
      isApplyFilter: false,
    }, this.getSubsidyPerPage);
  }

  applyFilter = () => {
    this.setState({ isApplyFilter: true }, this.getSubsidyPerPage);
  }

  onCloseModalSubsidy = () => {
    this.setState({ visibleSubsidy: false, subsidyId: '' });
  };

  onShowModalSubsidy = (subsidyId) => {
    this.setState({ visibleSubsidy: true, subsidyId: subsidyId });
  };

  openHierachyModal = (subsidy, callbackAfterChanged) => {
    this.setState({ visibleNewGroup: true });
    this.loadDataModalNewGroup(subsidy, callbackAfterChanged);
  }

  onShowModalGroup = () => {
    this.setState({ visibleNewGroup: true });
  }

  onCloseModalGroup = () => {
    this.setState({ visibleNewGroup: false });
  }

  render() {
    const { visibleNewGroup, filterStudent, filterProvider, skillSet, filterSchool, listSubsidy, academicLevels, visibleSubsidy, subsidyId, loading } = this.state;

    const modalNewGroupProps = {
      visible: visibleNewGroup,
      onSubmit: this.onCloseModalGroup,
      onCancel: this.onCloseModalGroup,
    }

    const modalSubsidyProps = {
      visible: visibleSubsidy,
      subsidyId: subsidyId,
      onSubmit: this.onCloseModalSubsidy,
      onCancel: this.onCloseModalSubsidy,
      openHierachy: this.openHierachyModal
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
        align: 'center',
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
        render: (a) => <span>{this.statusType(a)}</span>
      },
      {
        title: 'Action',
        key: 'action',
        render: (a) => (
          <Space size="middle">
            <a className='btn-blue' onClick={v => { this.onShowModalSubsidy(a._id) }}>Edit</a>
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
            <Form
              name="form_subsidy"
              ref={ref => { this.form = ref }}
            >
              <Row gutter={10}>
                <Col span={12}>
                  <Form.Item name="student_name">
                    <Input
                      placeholder='Student name'
                      value={filterStudent}
                      onChange={v => this.setState({ filterStudent: v.target.value })}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="provider_name">
                    <Input
                      placeholder='Provider name'
                      value={filterProvider}
                      onChange={v => this.setState({ filterProvider: v.target.value })}
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
                      onChange={v => this.setState({ filterSchool: v.target.value })}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="grade" >
                    <Select
                      placeholder='Grade'
                      onChange={v => { this.setState({ filterGrade: v }) }}
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
                      placeholder='skillSet'
                      onChange={v => { this.setState({ filterSkillSet: v }) }}
                    >
                      {skillSet?.map((skill, index) => (<Select.Option key={index} value={skill._id}>{skill.name}</Select.Option>))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="status" >
                    <Select
                      placeholder='Status'
                      onChange={v => { this.setState({ filterStatus: v }) }}
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
                  <Button onClick={() => this.clearFilter()} className='mr-10'>Clear</Button>
                  <Button type='primary' onClick={() => this.applyFilter()} htmlType="submit">Apply Search</Button>
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
        <ModalNewGroup
          {...modalNewGroupProps}
          setLoadData={reload => { this.loadDataModalNewGroup = reload; }}
        />
        <PageLoading loading={loading} isBackground={true} />
      </div>
    );
  }
}

const mapStateToProps = state => ({ auth: state.auth });

export default compose(connect(mapStateToProps))(SubsidyManager);