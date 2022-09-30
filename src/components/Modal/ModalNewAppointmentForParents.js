import React from 'react';
import { Modal, Button, Row, Col, Switch, Select, Typography, Calendar, Avatar, Input, Popover } from 'antd';
import { BiChevronLeft, BiChevronRight, BiSearch } from 'react-icons/bi';
import { BsCheck } from 'react-icons/bs';
import { GoPrimitiveDot } from 'react-icons/go';
import intl from 'react-intl-universal';
import messages from './messages';
import msgCreateAccount from '../../routes/Sign/CreateAccount/messages';
import msgDashboard from '../../routes/Dashboard/messages';
import msgDrawer from '../../components/DrawerDetail/messages';
import msgReview from '../../routes/Sign/SubsidyReview/messages';
import moment from 'moment';
import 'moment/locale/en-au'; 

import './style/index.less';
import '../../assets/styles/login.less';

import request,{generateSearchStructure} from '../../utils/api/request'
import PlacesAutocomplete from 'react-places-autocomplete';
const { Paragraph } = Typography;
moment.locale('en');

class ModalNewAppointmentForParents extends React.Component {
    state = {
        valueCalendar: moment(),
        selectedDate: moment(),
        currentMonth: moment().format('MMMM YYYY'),
        isChoose:-1,
        isConfirm: false,
        isPopupComfirm: false,
        isSelectTime: -1,
        listProvider:[],
        selectedSkillSet:-1,
        address:'',
        selectedDependent:undefined,
        selectedProvider:undefined,
        arrTime:[],
        errorMessage:'',
    }
    
    componentDidMount(){
        console.log('new appointment',this.props)

        var arrTime = [];
        var hour9AM = moment('2022-10-30 9:00:00');
        for(var i = 0 ; i < 6;i++ ){
            var newTime = hour9AM.clone();
            hour9AM = hour9AM.add(30, 'minutes')
            arrTime.push(newTime);
            
        }
        var hour2PM = moment('2022-10-30 14:00:00');
        for(var i = 0 ; i < 8;i++ ){
            var newTime = hour2PM.clone();
            hour2PM = hour2PM.add(30, 'minutes')
            arrTime.push(newTime);
            
        }
        this.setState({arrTime:arrTime});
        this.searchProvider()
    }

    

    

    searchProvider(name){
        
        request.post('clients/search_providers' , generateSearchStructure(name)).then(result=>{
            console.log(result)
            if(result.success){
                this.setState({listProvider: result.data.docs})
            }
        })
    }

    getCalendarWhenSelectProvider(){

    }

    createAppointment = ()=>{
        if(this.state.isSelectTime < 0 || this.state.selectedSkillSet<0 || this.state.address.length==0||
            this.state.selectedDependent==undefined || this.state.selectedProvider==undefined
            ){
            this.setState({errorMessage:'please fill all required field'})
            return;

        }
        console.log('' , this.state.selectedDate);
        this.setState({errorMessage:''})
        var date1 = this.state.selectedDate
        let { years, months, date } = date1.toObject();
        var hour = this.state.arrTime[this.state.isSelectTime].clone().set({ years, months, date });

        var postData = {
            
            skillSet: this.state.selectedSkillSet,
            dependent: this.state.selectedDependent,
            provider: this.state.selectedProvider, 
            date: hour.valueOf(),
            location:this.state.address,
        };
        console.log('post data' , postData);
        request.post('clients/create_appoinment' , postData).then(result=>{
            console.log(result)
            if(result.success){
                this.setState({errorMessage:''});
                this.props.onSubmit();
            }else{
                this.setState({errorMessage:result.data})
            }
            
        }).catch(err=>{
            this.setState({errorMessage:err.message})
        })
    }

    handleChangeAddress = address => {
        console.log('address',address);
        this.setState({address: address });
    };

    handleSelectAddress = address => {
        console.log('address',address);
        this.setState({address: address });
    };


    onSelectDate = (newValue) => {
        this.setState({valueCalendar: newValue});
        this.setState({selectedDate: newValue});
    }
    onPanelChange = (newValue) => {
        this.setState({valueCalendar: newValue});
    }
    nextMonth = () => {
        this.setState({selectedDate: moment(this.state.selectedDate).add(1, 'month')});
        this.setState({valueCalendar: moment(this.state.selectedDate).add(1, 'month')});
    }
    prevMonth = () => {
        this.setState({selectedDate: moment(this.state.selectedDate).add(-1, 'month')});
        this.setState({valueCalendar: moment(this.state.selectedDate).add(-1, 'month')});
    }

    onChooseDoctor = (index) => {
        this.setState({isChoose: index , selectedProvider: this.state.listProvider[index]._id});
    }
    onConfirm = () => {
        this.setState({isConfirm: true});
        this.setState({isPopupComfirm: true});
    }
    onSelectTime = (index) => {
        
        this.setState({isSelectTime: index})
    }
  render() {
    const contentConfirm = (
        <div className='confirm-content'>
            <p className='text-center mb-5'>{intl.formatMessage(messages.areSureChangeAppoint)}</p>
            <Row gutter={10}>
                <Col xs={24} sm={24} md={12}>
                    <p className='font-12 text-center mb-0'>{intl.formatMessage(messages.current)}</p>
                    <div className='current-content'>
                        <p className='font-10'>30 minutes {intl.formatMessage(messages.meetingWith)} <span className='font-11 font-700'>Dr.Blank</span></p>
                        <p className='font-10'>{intl.formatMessage(msgDrawer.who)}: Dependent Name</p>
                        <p className='font-10'>{intl.formatMessage(msgDrawer.where)}: Local Office Name</p>
                        <p className='font-10'>{intl.formatMessage(msgDrawer.when)}: <span className='font-11 font-700'>6:45pm</span> on <span className='font-11 font-700'>July, 26, 2022</span></p>
                    </div>
                </Col>
                <Col xs={24} sm={24} md={12}>
                    <p className='font-12 text-center mb-0'>{intl.formatMessage(messages.new)}</p>
                    <div className='new-content'>
                        <p className='font-10'>30 minutes {intl.formatMessage(messages.meetingWith)} <span className='font-11 font-700'>Dr.Blank</span></p>
                        <p className='font-10'>{intl.formatMessage(msgDrawer.who)}: Dependent Name</p>
                        <p className='font-10'>{intl.formatMessage(msgDrawer.where)}: Local Office Name</p>
                        <p className='font-10'>{intl.formatMessage(msgDrawer.when)}: <span className='font-11 font-700'>7:20pm</span> on <span className='font-11 font-700'>July, 28, 2022</span></p>
                    </div>

                </Col>
            </Row>
        </div>
    );

    const modalProps = {
      className: 'modal-new',
      title: "",
      visible: this.props.visible,
      onOk: this.props.onSubmit,
      onCancel: this.props.onCancel,
      closable: false,
      width: 900,

      footer: [
        <Button key="back" onClick={this.props.onCancel}>
          {intl.formatMessage(msgReview.goBack).toUpperCase()}
        </Button>,
        <Button key="submit" type="primary" onClick={this.createAppointment}>
            {intl.formatMessage(messages.scheduleScreening).toUpperCase()}
        </Button>
        
      ]
    };
    const { valueCalendar, selectedDate, isChoose, isSelectTime } = this.state;
    return(
        <Modal {...modalProps}>
            <div className='new-appointment'>
                <p className='font-30 mb-10'>{intl.formatMessage(messages.newAppointment)}</p>
                <div className='flex flex-row items-center mb-10'>
                    <p className='font-16 mb-0'>{intl.formatMessage(messages.selectOptions)}</p>
                    <div className='flex flex-row items-center ml-20'>
                        <Switch size="small" defaultChecked />
                        <p className='ml-10 mb-0'>{intl.formatMessage(messages.subsidyOnly)}</p>
                    </div>
                </div>
                <Row gutter={20}>
                    <Col xs={24} sm={24} md={8} className='select-small'>
                        <Select 
                        onChange={v=>this.setState({selectedDependent: v})}
                        value={this.state.selectedDependent}
                        placeholder={intl.formatMessage(msgCreateAccount.dependent)}>
                            {this.props.listDependents.map((dependent,index) =>(<Select.Option value={dependent._id}>{dependent.firstName} {dependent.lastName}</Select.Option>))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={24} md={8} className='select-small'>
                        <Select
                        onChange={v=>{
                            this.setState({selectedSkillSet: v});
                        }}
                         placeholder={intl.formatMessage(msgCreateAccount.skillsets)}>
                            {this.props.SkillSet.map((skill,index) =>(<Select.Option value={index}>{skill}</Select.Option>))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={24} md={8} className='select-small'>
                        <PlacesAutocomplete
                                value={this.state.address}
                                onChange={this.handleChangeAddress}
                                onSelect={this.handleSelectAddress}
                            >
                            {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                                <div>
                                    <Input {...getInputProps({
                                        placeholder: 'Search Places ...',
                                        className: 'location-search-input',
                                        size: 'small'
                                    })} />
                                    <div className="autocomplete-dropdown-container">
                                        {loading && <div>Loading...</div>}
                                        {suggestions.map(suggestion => {
                                            const className = suggestion.active
                                                ? 'suggestion-item--active'
                                                : 'suggestion-item';
                                            // inline style for demonstration purpose
                                            const style = suggestion.active
                                                ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                                                : { backgroundColor: '#ffffff', cursor: 'pointer' };
                                            return (
                                                <div
                                                    {...getSuggestionItemProps(suggestion, {
                                                        className,
                                                        style,
                                                    })}
                                                >
                                                    <span>{suggestion.description}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </PlacesAutocomplete>
                        {/* <Select placeholder={intl.formatMessage(msgCreateAccount.location)}>
                            <Select.Option value='lo1'>location 1</Select.Option>
                        </Select> */}
                    </Col>
                </Row>
                
                <div className='choose-doctor'>
                    <p className='font-16 mt-10'>{intl.formatMessage(messages.availableProviders)}</p>
                    <div className='doctor-content'>
                        <div style={{width: 300}}>
                            <Input 
                                onChange={v=>{
                                    this.searchProvider(v.target.value)
                                }}
                                placeholder={intl.formatMessage(messages.searchDoctor)}
                                suffix={<BiSearch size={17}/>}
                            />
                        </div>
                        <p className='font-500 mt-1 mb-0'>{intl.formatMessage(messages.popularDoctors)}</p>
                        <div className='doctor-list'>
                            {this.state.listProvider.map((provider, index) => <div key={index} className='doctor-item' onClick={() => this.onChooseDoctor(index)}>
                                <Avatar shape="square" size="large" src='../images/doctor_ex2.jpeg'/>
                                <p className='font-10 text-center'>{provider.name||provider.referredToAs}</p>
                                {isChoose === index && <div className='selected-doctor'>
                                    <BsCheck size={12}/>
                                </div>}
                            </div>)}
                           
                            {/* <div className='doctor-item'>
                                <Avatar shape="square" size="large" src='../images/doctor_ex1.jpeg'/>
                                <p className='font-10 text-center'>Diane</p>
                            </div> */}
                        </div>
                    </div>
                </div>

                <Row gutter={10}>
                    <Col xs={24} sm={24} md={8}>
                        <div className='provider-profile'>
                            <div className='flex flex-row items-center'>
                                <p className='font-16 font-700'>{intl.formatMessage(msgDrawer.providerProfile)}</p>
                                <p className='font-12 font-700 ml-auto text-primary'>{intl.formatMessage(messages.screeningRequired)}</p>
                            </div>
                            <div className='count-2'>
                                <p className='font-10'>Name: {isChoose>=0&&this.state.listProvider[isChoose]!=undefined?this.state.listProvider[isChoose].referredToAs:''}</p>
                                <p className='font-10'>Skillset(s): {isChoose>=0&&this.state.listProvider[isChoose]!=undefined?this.props.SkillSet[this.state.listProvider[isChoose].skillSet]:''}</p>
                            </div>
                            <p className='font-10'>Practice/Location</p>
                            <div className='count-2'>
                                {isChoose>=0&&this.state.listProvider[isChoose]!=undefined&&this.state.listProvider[isChoose].contactNumber.map((phone,phoneIndex)=> (<p className='font-10'>Contact number #{phoneIndex+1}: {phone.phoneNumber}</p>) )}
                                
                            </div>
                            <div className='count-2'>
                                {isChoose>=0&&this.state.listProvider[isChoose]!=undefined&& this.state.listProvider[isChoose].contactEmail.map((email,emailIndex)=> (<p className='font-10'>Contact email #{emailIndex+1}: {email.email}</p>) )}
                                
                            </div>
                            <div className='count-2'>
                                <p className='font-10'>Academic level(s)</p>
                                <p className='font-10'>Subsidy </p>
                            </div>
                            <div className='profile-text'>
                                <Paragraph className='font-12 mb-0' ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>
                                Profile {isChoose>=0&&this.state.listProvider[isChoose]!=undefined?this.state.listProvider[isChoose].publicProfile:''}
                                </Paragraph>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} sm={24} md={16}>
                        <div className='px-20'>
                            <p className='font-700'>{intl.formatMessage(msgCreateAccount.selectDateTime)}</p>
                            <div className='calendar'>
                                <Row gutter={15}>
                                    <Col xs={24} sm={24} md={12}>
                                        <Calendar 
                                            fullscreen={false} 
                                            value={valueCalendar} 
                                            onSelect={this.onSelectDate} 
                                            onPanelChange={this.onPanelChange}
                                            headerRender={() => {
                                            return (
                                                <div style={{ marginBottom: 10 }}>
                                                    <Row gutter={8} justify="space-between" align="middle">
                                                        <Col>
                                                            <p className='font-12 mb-0'>{selectedDate?.format('MMMM YYYY')}</p>
                                                        </Col>
                                                        <Col>
                                                            <Button
                                                                type='text' 
                                                                className='mr-10 left-btn' 
                                                                icon={<BiChevronLeft size={25}/>}
                                                                onClick={this.prevMonth}
                                                             />
                                                            <Button 
                                                                type='text' 
                                                                className='right-btn' 
                                                                icon={<BiChevronRight size={25}/>}
                                                                onClick={this.nextMonth}
                                                            />
                                                        </Col>
                                                    </Row>
                                                </div>
                                            );
                                        }}
                                    />
                                    </Col>
                                    <Col xs={24} sm={24} md={12}>
                                       <Row gutter={15}>
                                            {this.state.arrTime.map((time, index) =><Col key={index} span={12}>
                                                <div className={isSelectTime === index ? 'time-available active' : 'time-available'} onClick={() => this.onSelectTime(index)}>
                                                    <p className='font-12 mb-0'><GoPrimitiveDot size={15} />{time.format('hh:mm a')}</p>
                                                </div>
                                            </Col>)}
                                       </Row>
                                    </Col> 
                                </Row>
                            </div>
                        </div>
                    </Col>
                </Row>

                {this.state.errorMessage.length>0&&(<p style={{marginRight:"5px"}}>{this.state.errorMessage}</p>)}
            </div>
        </Modal>
    );
  }
};
export default ModalNewAppointmentForParents;