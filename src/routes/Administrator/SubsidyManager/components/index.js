import React from 'react';
import { Divider, Table, Space } from 'antd';
import intl from 'react-intl-universal';

import messages from '../messages';
import mgsSidebar from '../../../../components/SideBar/messages';
import './index.less';
import request from '../../../../utils/api/request'
import {switchPathWithRole } from '../../../../utils/api/baseUrl'
import { 
  ModalNewGroup,
  ModalNewAppointment,
  ModalNewAppointmentForParents, 
  ModalSubsidyProgress,
  ModalReferralService,
  ModalNewSubsidyRequest,
  ModalNewSubsidyReview
} from '../../../../components/Modal';
export default class extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      listSubsidy:[],
      currentPage:0,
      limit:10,
      userRole:901,
      totalPages:1,
      visibleSubsidy: false,
      visibleNewGroup: false,
      SkillSet:[]
    }
  }

  componentDidMount =()=>{
    this.loadDefaultData();
    this.getSubsidyPerPage();
  }

  loadDefaultData(){
    request.post('clients/get_default_value_for_client').then(result=>{
        var data = result.data;
        console.log('default value',data);
        this.setState({SkillSet: data.SkillSet});
    })
  }

  getSubsidyPerPage = (page = 0)=>{
    request.post(switchPathWithRole(this.state.userRole) + 'get_subsidy_requests').then(result=>{
      console.log('result',result);
      if(result.success){
        this.setState({currentPage: page , listSubsidy: result.data.docs ,totalPages: result.data.docs });
      }
    }).catch(err=>{
      console.log(err);
    });
  }

  statusType(subsidy){
    if(subsidy.status == -1 || subsidy.adminApprovalStatus == -1){
      return 'DECLINED';
    }
    if(subsidy.adminApprovalStatus == 1){
      return 'APPROVED';
    }
    if(subsidy.status == 1){
      return 'SCHOOL APPROVED';
    }
    return 'PENDING';

  }

  renderModalSubsidyDetail = () =>{
    const modalSubsidyProps = {
      visible: this.state.visibleSubsidy,
      onSubmit: this.onCloseModalSubsidy,
      onCancel: this.onCloseModalSubsidy,
    };
    return (<ModalSubsidyProgress {...modalSubsidyProps}
      setOpennedEvent = {(reload)=>{this.reloadModalSubsidyDetail = reload}}
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

  openHierachyModal = (subsidy , callbackAfterChanged) =>{
    this.setState({ visibleNewGroup: true });
    this.loadDataModalNewGroup(subsidy , callbackAfterChanged);
  }

  onShowModalGroup = () => {
    this.setState({visibleNewGroup: true});
  }
  onCloseModalGroup = () => {
      this.setState({visibleNewGroup: false});
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
        render:(a) =><span>{a.student.firstName} {a.student.lastName}</span>
      },
      {
        title: 'School',
        key: 'school',
        render:(a) =><span>{a.school.name}</span>
      },
      {
        title: 'Status',
        key: 'address',
        render:(a) =><span>{this.statusType(a)}</span>
      },
      {
        title: 'Hierachy',
        key: 'hierachy',
        render:(a) =><span>{(!!a.hierachy?a.hierachy.name:'')}</span>
      },
      {
        title: 'Action',
        key: 'action',
        render: (a) => (
          <Space size="middle">
            <a className='btn-blue' onClick={v=>{this.onShowModalSubsidy(a._id)}}>Edit</a>
          </Space>
        ),
      },
    ];
    return (
      <div className="full-layout page subsidymanager-page">
        <div className='div-title-admin'>
          <p className='font-16 font-500'>{intl.formatMessage(mgsSidebar.subsidyManager)}</p>
          <Divider/>
        </div>
        <Table 
       
        bordered size='middle' dataSource={this.state.listSubsidy} columns={columns} />
        {this.renderModalSubsidyDetail()}

        <ModalNewGroup {...modalNewGroupProps}
          setLoadData={reload=>{
            this.loadDataModalNewGroup = reload;
          }}
        />
      </div>
    );
  }
}
