import React from 'react';
import { Row, Divider, Button } from 'antd';
import { BiChevronLeft } from 'react-icons/bi';
import intl from 'react-intl-universal';
import messages from '../messages';
import messagesRequest from '../../SubsidyRequest/messages';
import './index.less';


import { connect } from 'react-redux';
import { compose } from 'redux';
import { setRegisterData } from '../../../../redux/features/registerSlice';
import { url } from '../../../../utils/api/baseUrl';
import axios from 'axios';

class SubsidyReview extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data:  {},
      inforChildren:  [],
      SkillSet:[],
      childname:''
    }
  }

  componentDidMount() {
    const {registerData} = this.props.register;

    this.setState({
      childname:registerData.studentInfos [this.props.selectedDependent].firstName+' '+registerData.studentInfos [this.props.selectedDependent].lastName,
      data:registerData.studentInfos [this.props.selectedDependent].subsidyRequest
    })
    this.loadDataFromServer()
  }

  loadDataFromServer(){
    axios.post(url+ 'clients/get_default_value_for_client'
        ).then(result=>{
            console.log('get_default_value_for_client',result.data);
            if(result.data.success){
                var data = result.data.data;
                this.setState({SkillSet:data.SkillSet})
            }else{
                this.setState({
                    checkEmailExist:false,
                });
                
            }
            
        }).catch(err=>{
            console.log(err);
            this.setState({
                checkEmailExist:false,
            });
        })
  }



  onSubmit = () => {
    // const { data } = this.state;
    // const { dependent, ...subsidyRequest } = data
    // const inforChildren = this.state.inforChildren;
    // inforChildren[dependent - 1].subsidyRequest = subsidyRequest;
    // localStorage.setItem('inforChildren', JSON.stringify(inforChildren));
    // this.props.history.push(routerLinks['CreateAccount']);

    this.props.onOpenSubsidyStep(-1,-1);

  }

  backToPrev = () =>{
    this.props.onOpenSubsidyStep(1,this.props.selectedDependent);
  }

  render() {

    const {
      dependent,
      note,
      ravName,
      ravEmail,
      ravPhone,
      school,
      skillSet,
      therapistContact,
      therapistEmail,
      documents,
      therapistPhone } = this.state.data;

    return (
      <div className="full-layout page subsidyreview-page">
        <Row justify="center" className="row-form">
          <div className='col-form col-subsidy-review'>
            <div className='div-form-title'>
              <p className='font-24 text-center'>{intl.formatMessage(messages.reviewSubsidyRequest)}</p>
            </div>
            <div>
              <p className='font-20 font-700 mb-10'>{intl.formatMessage(messages.dependentInfo)}</p>
              <div className='review-item'>
                <p>Dependent : {this.state.childname}</p>
                <p>School : {school}</p>
                <p>Skillset(s) : {this.state.SkillSet.length>0?this.state.SkillSet[skillSet]:''}</p>
              </div>
            </div>
            <Divider style={{ marginTop: 15, marginBottom: 15, borderColor: '#d7d7d7' }} />
            <div>
              <p className='font-20 font-700 mb-10'>{intl.formatMessage(messages.otherCcontacts)}</p>
              <div className='review-item'>
                <p>Raw name : {ravName}</p>
                <p>Rav phone : {ravPhone}</p>
                <p>Rav email : {ravEmail}</p>
                <p>Therapist name : {therapistContact}</p>
                <p>Therapist phone : {therapistPhone}</p>
                <p>Therapist email : {therapistEmail}</p>
              </div>
            </div>
            <Divider style={{ marginTop: 15, marginBottom: 15, borderColor: '#d7d7d7' }} />
            <div>
              <p className='font-20 font-700 mb-10'>{intl.formatMessage(messages.notes)}</p>
              <div>
                <p>{note}</p>
              </div>
            </div>
            <Divider style={{ marginTop: 15, marginBottom: 15, borderColor: '#d7d7d7' }} />
            <div>
              <p className='font-20 font-700 mb-10'>{intl.formatMessage(messagesRequest.documents)}</p>
              <div className='review-item'>
                <p>{!!documents&&documents.length > 0 &&documents.map((item, index) => {
                  return <p>Document #{++index} {item.name}</p>
                })}</p>
                {/* <p>Document #2 title</p>
                <p>Document #3 title</p>
                <p>Document #4 title</p> */}
              </div>
            </div>
            <div className='div-review-btn'>
              <Button block onClick={() => this.backToPrev() }>{intl.formatMessage(messages.goBack).toUpperCase()}</Button>
              <Button type='primary' onClick={this.onSubmit} block>{intl.formatMessage(messages.submit).toUpperCase()}</Button>
            </div>
          </div>
        </Row>
      </div>
    );
  }
}
const mapStateToProps = state => {
  console.log('state', state);
  return ({
      register: state.register,
  })
}

export default compose(connect(mapStateToProps, { setRegisterData  }))(SubsidyReview);