import React from 'react';
import {
  Avatar,
  Tabs,
} from 'antd';
import { FaUser } from 'react-icons/fa';
import { GiBackwardTime } from 'react-icons/gi';
import { BsEnvelope, BsXCircle, BsFillFlagFill, BsCheckCircleFill ,BsViewList} from 'react-icons/bs';
import intl from 'react-intl-universal';
import messages from '../messages';
import { connect } from 'react-redux';
import { compose } from 'redux';
import './index.less';
const { TabPane } = Tabs;
import moment from 'moment';
import request,{generateSearchStructure} from '../../../utils/api/request'

class PanelSubsidaries extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        listSubsidaries:[],
        status:0,
    };
  }

  componentDidMount =()=>{
    this.props.setReload(this.requestLoadDataFromMainView)
    this.loadSubsidaryWithStatus();
  }

  requestLoadDataFromMainView = (isForceReload)=>{
    console.log('called')
    if(this.state.listSubsidaries.length == 0||isForceReload){
        this.loadSubsidaryWithStatus(this.state.status);
    }
  }

  loadSubsidaryWithStatus(status=0){
    var url  = 'clients/get_my_subsidy_requests';
    if(this.props.userRole === 30){
      url = 'providers/get_my_subsidy_requests'
      return;
    }
    if(this.props.userRole === 60){
        url = 'schools/get_my_subsidy_requests'
    }
    this.setState({listSubsidaries:[]});
    request.post(url,{
        filter:{status:parseInt(status)}
    }).then(result=>{
        console.log('result get_my_subsidy_requests',result);
      if(result.success){
        var data = result.data;
        this.setState({listSubsidaries: data.docs});
      }else{
        this.setState({listSubsidaries: []});
      }
      
    })
  }

  handleTabChange = (v)=>{
    console.log('tab change',v);
    var status = 0;
    if(v==1) status = 0;
    if(v == 2) status = -1;
    if(v==3) status = 1;
    this.loadSubsidaryWithStatus(status);
  }

  renderStatus(status){
    var value = parseInt(status)
    switch( value ){
      case 0: return 'PENDING';
      case 1: return 'APPROVED';
      case -1: return 'DECLINE';
      case 2: return 'CANCELLED';
    }
    return '';
  }

  getSkillSetName(value){
    return this.props.SkillSet[value];
  }

  renderLeftContent(subsidy){
    if(this.props.userRole == 30){
      return (<div className='item-left'
        
      >
      <Avatar size={24} icon={<FaUser size={12} />}  
      
      />
      <div className='div-service'
      >
          <p className='font-11 mb-0'>{this.getSkillSetName(subsidy.skillSet)}</p>
          <p className='font-09 mb-0'>{subsidy.student.firstName} {subsidy.student.lastName}</p>
          </div>
          {/* <p className='font-11 mb-0 ml-auto mr-5'>Case Handler</p> */}
          <p className='font-12 ml-auto mb-0'>{this.renderStatus(subsidy.status)}</p>
      </div>);
    }
    return (<div className='item-left'
    >
    <Avatar size={24} icon={<FaUser size={12} />}  />
    <div className='div-service' >
    <p className='font-11 mb-0'>{this.getSkillSetName(subsidy.skillSet)}</p>
          <p className='font-09 mb-0'>{subsidy.school.name}</p>
          </div>
          {/* <p className='font-11 mb-0 ml-auto mr-5'>Case Handler</p> */}
          <p className='font-12 ml-auto mb-0'>{this.renderStatus(subsidy.status)}</p>
    </div>);
  }

  callOpenSubsidyDetail(subsidy){
    this.props.onShowModalSubsidyDetail(subsidy._id);
  }

  renderRighContent(type, subsidy){
    if(type == 0 ){
      return (<div className='item-right'>
      <GiBackwardTime size={19} onClick={() => { this.callOpenSubsidyDetail(subsidy) }} />
      <BsXCircle style={{ marginTop: 4 }} size={15} onClick={() => { }} />
    </div>)
    }
    if(type == 1 || type == 2){
      return (<div className='item-right'>
        <BsViewList size={19} onClick={() => { this.callOpenSubsidyDetail(subsidy) }} />
      </div>)
    }
    
  }

  render(){
    
    return (
        <Tabs defaultActiveKey="1" type="card" size='small'
        onChange={this.handleTabChange}
        >
                  <TabPane tab={intl.formatMessage(messages.pending)} key="1">
                    {this.state.listSubsidaries.length > 0 && this.state.listSubsidaries.map((subsidy, index) =>
                      <div key={index} className='list-item'>
                        {this.renderLeftContent(subsidy)}
                        {this.renderRighContent(0,subsidy)}
                      </div>
                    )}

                    {this.state.listSubsidaries.length == 0 && (<div key={1} className='list-item'>
                        <p style={{padding:"10px"}}>No pending subisdy</p>
                    </div>)}


                  </TabPane>
                  <TabPane tab={intl.formatMessage(messages.declined)} key="2">
                    {this.state.listSubsidaries.length > 0 && this.state.listSubsidaries.map((subsidy, index) =>
                      <div key={index} className='list-item'>
                        {this.renderLeftContent(subsidy)}
                        <div className='item-right'>
                        {this.renderRighContent(1,subsidy)}
                          {/* <BsFillFlagFill size={15} onClick={() => { }} />
                          <BsCheckCircleFill className='text-green500' style={{ marginTop: 4 }} size={15} onClick={() => { }} /> */}
                        </div>
                      </div>
                    )}
                    {this.state.listSubsidaries.length == 0 && (<div key={2} className='list-item'>
                        <p style={{padding:"10px"}}>No declined subisdy</p>
                    </div>)}
                  </TabPane>
                  <TabPane tab={intl.formatMessage(messages.approved)} key="3">
                    {this.state.listSubsidaries.length > 0 && this.state.listSubsidaries.map((subsidy, index) =>
                      <div key={index} className='list-item'>
                        {this.renderLeftContent(subsidy)}
                        {this.renderRighContent(2,subsidy)}
                        {/* <div className='item-right'>
                          <BsEnvelope size={15} onClick={() => { }} />
                          <BsFillFlagFill style={{ marginTop: 4 }} size={15} onClick={() => { }} />
                        </div> */}
                      </div>
                    )}
                    {this.state.listSubsidaries.length == 0 && (<div key={3} className='list-item'>
                        <p style={{padding:"10px"}}>No approved subisdy</p>
                    </div>)}
                  </TabPane>
                </Tabs>
    )
  }
}
const mapStateToProps = state => {
    return ({
    })
}

export default compose(connect(mapStateToProps))(PanelSubsidaries);
