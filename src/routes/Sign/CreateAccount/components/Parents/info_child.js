import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select, DatePicker, Switch } from 'antd';
// import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
// import { Row, Col, Form, Button, Space, Input } from "antd";
import { BsPlusCircle } from 'react-icons/bs';
import { TbTrash } from 'react-icons/tb';
import { Link } from 'dva/router';
import { routerLinks } from '../../../../constant';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesLogin from '../../../Login/messages';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { setRegisterData } from '../../../../../redux/features/registerSlice';
import moment from 'moment';
import { url } from '../../../../../utils/api/baseUrl';
import axios from 'axios';
class InfoChild extends Component {
    constructor(props) {
        super(props);
        

        this.state = {
            formChild: [
                {
                    firstName: '',
                    lastName: '',
                    birthday: '',
                    backgroundInfor: '',
                    primaryTeacher: '',
                    currentGrade: '',
                    school: '',
                    services: [],
                },
            ],
            isTypeFull: false,
            phoneFill: '',
            emailFill: '',
            listServices:[],
            inforChildren:[{},{},{}],
            parentInfo:{},
            // inforChildren,
        }
    }

    componentDidMount() {

        const {registerData} = this.props.register;

        this.setState({
            parentInfo:registerData.parentInfo
        })
        
        try{
            console.log('birthday' , studentInfos[0].birthday, studentInfos[0].birthday_moment, typeof studentInfos[0].birthday_moment );
        }catch(e){

        }
        
        var newChild =this.getDefaultChildObj(registerData.parentInfo);
        var studentInfos = !!registerData.studentInfos? JSON.parse(JSON.stringify(registerData.studentInfos)) : [newChild,newChild,newChild];
        
        
        if(!registerData.studentInfos){
            
            // for(var i = 0 ; i < registerData.studentInfos.length ; i++){
            //     if()
            // }
            this.props.setRegisterData({studentInfos:studentInfos});
        }

        
        for(var i = 0 ; i < studentInfos.length ; i++){
            if((studentInfos[i].birthday+'').length >0){
                studentInfos[i].birthday_moment =  moment(studentInfos[i].birthday);
                // var obj = {};
                // obj[(i+'birthday_moment')] = moment(studentInfos[i].birthday);
                // console.log(this.form.get)
                // this.form.setFieldValue(obj);
            }
        }
        this.form.setFieldsValue({children:studentInfos});
        
        this.loadServices();
    }

    loadServices(){
        axios.post(url+ 'clients/get_default_value_for_client'
            ).then(result=>{
                console.log('get_default_value_for_client',result.data);
                if(result.data.success){
                    var data = result.data.data;
                    this.setState({listServices:data.listServices})
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

    getDefaultChildObj(parentInfo){
        var obj={
            "firstName":"",
            "lastName":"",
            "birthday":"",
            "guardianPhone":parentInfo.fatherPhoneNumber || parentInfo.motherPhoneNumber,
            "guardianEmail":parentInfo.fatherEmail || parentInfo.motherEmail,
            "backgroundInfor":"",
            "school":"",
            "primaryTeacher":"",
            "currentGrade":"",
            "services":[],
            "hasIEP":1,
            "availabilitySchedule":[]
        };
        return obj;
    }

    onRemove1Depenent(index){
        const {registerData} = this.props.register;
        var studentInfos =[ ...registerData.studentInfos]
        
        studentInfos.splice(index , 1);
        
        this.props.setRegisterData({studentInfos:studentInfos});
    }

    updateReduxValueFor1Depedent(index , fieldName , value){
        const {registerData} = this.props.register;
        var studentInfos =[ ...registerData.studentInfos]
        var selectedObj ={ ...studentInfos[index]};
        selectedObj[fieldName ] = value;
        studentInfos[index] = selectedObj;
        console.log(selectedObj , fieldName , value);
        this.props.setRegisterData({studentInfos:studentInfos});
    }
    
    getBirthday = (index)=>{
        if(!!this.props.register.studentInfos&&this.props.register.studentInfos[index]!=undefined&&!!this.props.register.studentInfos[index].birthday_moment){
            console.log('da load birthday ',this.props.register.studentInfos[index].birthday_moment)
            return this.props.register.studentInfos[index].birthday_moment;
        }
        return moment();
    }

    onFinish = (values) => {
        // this.props.setRegisterData({ step3: values.children });
        // localStorage.setItem('inforChildren', JSON.stringify(values.children));
        // console.log('Success:', values);
        this.props.onContinue();
    };

    onFinishFailed = (errorInfo) => {
        // console.log('Failed:', errorInfo);
    };

    getValueInForm = (allValue, allValueChange) => {
        // const { children } = allValueChange;
        // localStorage.setItem('inforChildren', JSON.stringify(children));
    }

    onValueChange(){

    }

    openSubsidy(){

    }

    checkFillinAllFieldForSubsidy(index){
        const {registerData} = this.props.register;
        const studentInfo =registerData.studentInfos[index];
        var isAlreadyFillIn = !!studentInfo && studentInfo.firstName.length > 0
        &&studentInfo.lastName.length > 0
        &&(''+studentInfo.birthday).length > 0
        &&studentInfo.guardianPhone.length > 0
        &&studentInfo.guardianEmail.length > 0
        &&studentInfo.backgroundInfor.length > 0
        &&studentInfo.school.length > 0
        &&studentInfo.primaryTeacher.length > 0
        &&studentInfo.currentGrade.length > 0
        &&studentInfo.services.length > 0;
        console.log('vaid for index ',index ,
        !!studentInfo ,
         studentInfo.firstName.length > 0
        ,studentInfo.lastName.length > 0
        ,studentInfo.birthday,studentInfo.birthday.length
        ,studentInfo.birthday.length > 0
        ,studentInfo.guardianPhone.length > 0
        ,studentInfo.guardianEmail.length > 0
        ,studentInfo.backgroundInfor.length > 0
        ,studentInfo.school.length > 0
        ,studentInfo.primaryTeacher.length > 0
        ,studentInfo.currentGrade.length > 0
        ,studentInfo.services.length > 0,
        "fill in "+ isAlreadyFillIn
        )
        return isAlreadyFillIn;
    }

    render() {

        return (
            <Row justify="center" className="row-form">
                <div className='col-form col-info-child'>
                    <div className='div-form-title'>
                        <p className='font-30 text-center mb-10'>{intl.formatMessage(messages.tellYourself)}</p>
                        <p className='font-24 text-center'>{intl.formatMessage(messages.contactInformation)}</p>
                    </div>
                    <Form
                        name="form_contact"
                        onFinish={this.onFinish}
                        onFinishFailed={this.onFinishFailed}
                        ref={ref => this.form = ref}
                        onValuesChange={this.getValueInForm}

                    >
                        <Form.List name="children">
                            {(fields, { add, remove }) => (
                                <div>
                                    {fields.map((field, index) => {
                                        return (
                                            <div key={field.key} className='div-dependent-form'>
                                                <div className='flex flex-row items-center justify-between mb-10'>
                                                    <div className='flex flex-row items-center'>
                                                        <p className='font-16 mr-10 mb-0'>{intl.formatMessage(messages.dependent)}# {index + 1}</p>
                                                        <Switch 
                                                            onChange={v => {
                                                                console.log('hasIEP',v)
                                                                this.updateReduxValueFor1Depedent(index,"hasIEP" , v);
                                                            }} 
                                                            size="small" defaultChecked />
                                                        <p className='font-16 ml-10 mb-0'>{intl.formatMessage(messages.hasIEP)}</p>
                                                    </div>
                                                    {field.key === 0 ? null : <Button
                                                        type='text'
                                                        className='remove-btn'
                                                        icon={<TbTrash size={18} />}
                                                        onClick={() =>{
                                                            remove(field.name);
                                                            this.onRemove1Depenent(index);
                                                        }}
                                                    >{intl.formatMessage(messages.remove)}</Button>}
                                                </div>
                                                <Row gutter={14}>
                                                    <Col xs={24} sm={24} md={9}>
                                                        <Form.Item
                                                            name={[field.name, "firstName"]}
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.firstName)
                                                                }
                                                            ]}
                                                        >
                                                            <Input onChange={v => {
                                                                this.updateReduxValueFor1Depedent(index,"firstName" , v.target.value);
                                                            }} 
                                                            placeholder={intl.formatMessage(messages.firstName)} />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={24} sm={24} md={9}>
                                                        <Form.Item
                                                            name={[field.name, "lastName"]}
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.lastName)
                                                                }
                                                            ]}
                                                        >
                                                            <Input onChange={v => {
                                                                this.updateReduxValueFor1Depedent(index,"lastName" , v.target.value);
                                                                
                                                            }} placeholder={intl.formatMessage(messages.lastName)} />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={24} sm={24} md={6}>
                                                        <Form.Item
                                                            name={[field.name, "birthday_moment"]}
                                                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.dateBirth) }]}
                                                        >
                                                            <DatePicker format={"YYYY-MM-DD"} placeholder={intl.formatMessage(messages.dateBirth)} 
                                                            selected={this.getBirthday(index)}
                                                            onChange={v => {
                                                                console.log(v.valueOf() , typeof v);
                                                                // this.updateReduxValueFor1Depedent(index,"birthday_moment" ,v.clone() );
                                                                this.updateReduxValueFor1Depedent(index,"birthday" ,v.valueOf());
                                                            }} />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>

                                                <Row gutter={14}>
                                                    <Col xs={24} sm={24} md={12}>
                                                        <Form.Item
                                                            name={[field.name, "guardianPhone"]}
                                                            className='float-label-item'
                                                            label={intl.formatMessage(messages.guardianPhone)}>
                                                            <Input 
                                                            onChange={v => {
                                                                this.updateReduxValueFor1Depedent(index,"guardianPhone" , v.target.value);
                                                            }} 
                                                            placeholder='{PARENTS} AUTOFILL'   />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={24} sm={24} md={12}>
                                                        <Form.Item className='float-label-item'
                                                            name={[field.name, "guardianEmail"]}
                                                            label={intl.formatMessage(messages.guardianEmail)}>
                                                            <Input 
                                                            onChange={v => {
                                                                this.updateReduxValueFor1Depedent(index,"guardianEmail" , v.target.value);
                                                            }} 
                                                            placeholder='{PARENTS} AUTOFILL'
                                                               />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>

                                                <Form.Item

                                                    name={[field.name, "backgroundInfor"]}
                                                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.backgroundInformation) }]}
                                                >
                                                    <Input.TextArea onChange={v => {
                                                        this.updateReduxValueFor1Depedent(index,"backgroundInfor" , v.target.value);
                                                    }} 
                                                    rows={4} 
                                                    placeholder={intl.formatMessage(messages.backgroundInformation)} />
                                                </Form.Item>
                                                <Form.Item

                                                    name={[field.name, "school"]}
                                                    rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.school) }]}
                                                >
                                                    <Input onChange={v => {
                                                        this.updateReduxValueFor1Depedent(index,"school" , v.target.value);
                                                    }} 
                                                    placeholder={intl.formatMessage(messages.school)} />
                                                </Form.Item>
                                                <Row gutter={14}>
                                                    <Col xs={24} sm={24} md={12}>
                                                        <Form.Item

                                                            name={[field.name, "primaryTeacher"]}
                                                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.primaryTeacher) }]}
                                                        >
                                                            <Input onChange={v => {
                                                               this.updateReduxValueFor1Depedent(index,"primaryTeacher" , v.target.value);
                                                            }} 
                                                            placeholder={intl.formatMessage(messages.primaryTeacher)} />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={24} sm={24} md={12}>
                                                        <Form.Item

                                                            name={[field.name, "currentGrade"]}
                                                            rules={[{ required: true, message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.currentGrade) }]}
                                                        >
                                                            <Input onChange={v => {
                                                                this.updateReduxValueFor1Depedent(index,"currentGrade" , v.target.value);
                                                            }} 
                                                            placeholder={intl.formatMessage(messages.currentGrade)} />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                                <div className='flex flex-row'>
                                                    <Form.Item
                                                        name={[field.name, 'services']}
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: intl.formatMessage(messagesLogin.pleaseEnter) + ' ' + intl.formatMessage(messages.servicesRequired)
                                                            }
                                                        ]}
                                                        className='add-services bottom-0 flex-1'>
                                                        <Select
                                                            mode="multiple"
                                                            showArrow
                                                            placeholder={intl.formatMessage(messages.servicesRequired)}
                                                            optionLabelProp="label"
                                                            
                                                            onChange={v => {
                                                                console.log(v);
                                                                this.updateReduxValueFor1Depedent(index,"services" , v);
                                                            }}
                                                        >
                                                            {this.state.listServices.map(service=>{
                                                                return (<Select.Option label={service.name} value={service._id}>{service.name}</Select.Option>)
                                                            })}
                                                            
                                                            
                                                        </Select>
                                                    </Form.Item>
                                                    <Button className='ml-10' disabled={
                                                            !this.checkFillinAllFieldForSubsidy(index)
                                                    }
                                                    onClick={v=>{
                                                        this.props.onOpenSubsidyStep(1 , index);
                                                    }}
                                                    >{intl.formatMessage(messages.subsidyRequest)}</Button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    <Form.Item className='text-center'>
                                        <Button
                                            type="text"
                                            className='add-dependent-btn'
                                            icon={<BsPlusCircle size={17} className='mr-5' />}
                                            onClick={() => {
                                                let allState = this.state;
                                                allState.inputs.push({ name: '', visible: false })
                                                this.setState(allState, () => {
                                                    add(null)
                                                })
                                            }}
                                        >
                                            {intl.formatMessage(messages.addDependent)}
                                        </Button>
                                    </Form.Item>
                                </div>
                            )}
                        </Form.List>

                        <Form.Item className="form-btn continue-btn" >
                            <Button
                                block
                                type="primary"
                                htmlType="submit"
                            >
                                {intl.formatMessage(messages.continue).toUpperCase()}
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Row >
        );
    }
}

const mapStateToProps = state => {
    console.log('state', state);
    return ({
        register: state.register,
    })
}

export default compose(connect(mapStateToProps, { setRegisterData  }))(InfoChild);