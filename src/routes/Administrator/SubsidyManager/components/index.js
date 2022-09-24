import React from 'react';
import { Divider, Table, Space, Select, Input, Row, Col, Form, Button } from 'antd';
import intl from 'react-intl-universal';

import messages from '../messages';
import mgsSidebar from '../../../../components/SideBar/messages';
import './index.less';
import request, { generateSearchStructureWithPopulateSearch } from '../../../../utils/api/request'
import { switchPathWithRole } from '../../../../utils/api/baseUrl'
import {
  ModalNewGroup,
  ModalNewAppointment,
  ModalNewAppointmentForParents,
  ModalSubsidyProgress,
  ModalReferralService,
  ModalNewSubsidyRequest,
  ModalNewSubsidyReview
} from '../../../../components/Modal';
const arrMeetSolution = [
  'Google meet',
  'Zoom',
  'Direction',
]

export default class extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      listSubsidy: [],
      currentPage: 0,
      limit: 10,
      userRole: 901,
      totalPages: 1,
      visibleSubsidy: false,
      visibleNewGroup: false,
      SkillSet: [],
      filterSchool: undefined,
      filterStudent: undefined,
      filterProvider: undefined,
      filterSkillSet: undefined,
      filterMeetSolution: undefined,
      filterStatus: undefined,
      filterGrade: undefined,
      isApplyFilter: false,
    }
  }

  componentDidMount = () => {
    this.loadDefaultData();
    this.getSubsidyPerPage();
  }

  loadDefaultData() {
    request.post('clients/get_default_value_for_client').then(result => {
      var data = result.data;
      console.log('default value', data);
      this.setState({ SkillSet: data.SkillSet });
    })
  }

  generatePostData = (page=1) => {
    var populate = [ {path:'providers'} , {path: 'student' } , {path:'selectedProvider'} ,{ path: 'school'}];
    var filter = {};
    console.log(this.state.filterSchool, this.state.filterSchool?.length , this.state.isApplyFilter)
    if(this.state.isApplyFilter){
      var postData = {
        "filter":filter,
            "page":page,
            "limit":10,
            "populate": [ {path: 'school' },{path:'providers'} , {path: 'student' },{path:'selectedProvider'} ]};
      if(this.state.filterSchool!=undefined&& this.state.filterSchool.length > 0){
        postData['filterSchool'] = this.state.filterSchool;
        
      }
      if(this.state.filterStudent!=undefined&& this.state.filterStudent.length > 0){
        postData['filterStudent'] = this.state.filterStudent;
        
      }
      if(this.state.filterProvider!=undefined&& this.state.filterProvider.length > 0){
        postData['filterProvider'] = this.state.filterProvider;
        
      }

      if(this.state.filterStatus!=undefined){
        postData['filterStatus'] = this.state.filterStatus;
        
      }
      if(this.state.filterGrade!=undefined){
        postData['filterGrade'] = this.state.filterGrade;
        
      }
      
      return postData;
    }
    return generateSearchStructureWithPopulateSearch('',{},page , 10, [ {path: 'school' },{path:'providers'} , {path: 'student' },{path:'selectedProvider'} ]);
  }

  getSubsidyPerPage = (page = 1) => {
    var postData = this.generatePostData();console.log(postData)
    request.post(switchPathWithRole(this.state.userRole) + 'get_subsidy_requests',postData ).then(result => {
      console.log('result', result);
      if (result.success) {
        this.setState({ currentPage: page, listSubsidy: result.data.docs, totalPages: result.data.docs });
      }
    }).catch(err => {
      console.log(err);
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
    this.setState({
      filterSchool: "",
      filterStudent: "",
      filterProvider: "",
      filterSkillSet: undefined,
      filterStatus: undefined,
      filterGrade: undefined,
      isApplyFilter: false,
    },this.getSubsidyPerPage);
    
  }

  applyFilter = () => {
    this.setState({
      isApplyFilter: true,
    } , this.getSubsidyPerPage);
    
  }


  renderModalSubsidyDetail = () => {
    const modalSubsidyProps = {
      visible: this.state.visibleSubsidy,
      onSubmit: this.onCloseModalSubsidy,
      onCancel: this.onCloseModalSubsidy,
    };
    return (<ModalSubsidyProgress {...modalSubsidyProps}
      setOpennedEvent={(reload) => { this.reloadModalSubsidyDetail = reload }}
      userRole={this.state.userRole}
      SkillSet={this.state.SkillSet}
      openHierachy={this.openHierachyModal}
    />)
  }

  onCloseModalSubsidy = () => {
    this.setState({ visibleSubsidy: false });

  };

  onShowModalSubsidy = (subsidyId) => {
    this.setState({ visibleSubsidy: true });
    this.reloadModalSubsidyDetail(subsidyId);
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
    const modalNewGroupProps = {
      visible: this.state.visibleNewGroup,
      onSubmit: this.onCloseModalGroup,
      onCancel: this.onCloseModalGroup,
    }

    const columns = [
      {
        title: 'Name',
        key: 'name',
        render: (a) => <span>{a.student.firstName} {a.student.lastName}</span>,
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
        render: (a) => <span>{a.provider?.name}</span>
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
            <Form name="form_subsidy">
              <Row gutter={10}>
                <Col span={12}>
                  <Form.Item name="student_name">
                    <Input
                      placeholder='Student name'
                      value={this.state.filterStudent}
                      onChange={v => {console.log(v.target.value); this.setState({ filterStudent: v.target.value }) }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="provider_name">
                    <Input
                      placeholder='Provider name'
                      value={this.state.filterProvider}
                      onChange={v => { this.setState({ filterProvider: v.target.value }) }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={10}>
                <Col span={12}>
                  <Form.Item name="school_name">
                    <Input
                      placeholder='School name'
                      value={this.state.filterSchool}
                      onChange={v => { this.setState({ filterSchool: v.target.value }) }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="grade" >
                    <Select placeholder='Grade'
                    onChange={v => { this.setState({ filterGrade: v}) }}
                    >
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(item=>(<Select.Option value={item}>{item}</Select.Option>))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={10}>
                <Col span={12}>
                  <Form.Item name="skillset" >
                    <Select placeholder='SkillSet'
                    onChange={v=>{this.setState({filterSkillSet:v})}}
                    >
                      {this.state.SkillSet.map((item,index)=>(<Select.Option value={index}>{item}</Select.Option>))}
                      
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                <Form.Item name="status" >
                <Select placeholder='Status'
                onChange={v=>{this.setState({filterStatus:v})}}
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
                  <Button onClick={() => { this.clearFilter() }} className='mr-10'>Clear</Button>
                  <Button type='primary'  onClick={() => { this.applyFilter() }} htmlType="submit">Apply Search</Button>
                </div>
              </Form.Item>
            </Form>
          </Col>
        </Row>
        <Table
          bordered
          size='middle'
          dataSource={this.state.listSubsidy}
          columns={columns}
          scroll={{ x: 1300}}
          className='mt-2'
        />

        {this.renderModalSubsidyDetail()}

        <ModalNewGroup
          {...modalNewGroupProps}
          setLoadData={reload => {
            this.loadDataModalNewGroup = reload;
          }}
        />
      </div>
    );
  }
}
