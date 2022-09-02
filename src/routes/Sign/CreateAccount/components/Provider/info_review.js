import React,  {Component} from 'react';
import { Row, Col, Button} from 'antd';
import intl from 'react-intl-universal';
import messages from '../../messages';
import messagesReview from '../../../SubsidyReview/messages';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { setRegisterData } from '../../../../../redux/features/registerSlice';

import { url } from '../../../../../utils/api/baseUrl';
import axios from 'axios'

class InfoReview extends Component {

    constructor(props) {
        super(props);
        this.state = {
            SkillSet:[],
            AcademicLevel:[],
            ServiceableSchools:[],
            ScreenTime:[],
            
        }
    }

    componentDidMount() {
        const {registerData} = this.props.register;
        console.log(registerData);
        var arrReduce = [];
        for(var i=0;i<100;i++){
            arrReduce.push( i);
        }
        var arrTime = [];
        arrTime.push(moment('2018-01-19 9:30:00 AM','YYYY-MM-DD hh:mm:ss A'))
        arrTime.push(moment('2018-01-19 10:00:00 AM','YYYY-MM-DD hh:mm:ss A'))
        arrTime.push(moment('2018-01-19 10:30:00 AM','YYYY-MM-DD hh:mm:ss A'))
        arrTime.push(moment('2018-01-19 11:00:00 AM','YYYY-MM-DD hh:mm:ss A'))

        this.setState({ReduceList: arrReduce,TimeAvailableList: arrTime});
        if (registerData.subsidy) {
            this.form?.setFieldsValue(registerData.subsidy);
            
        }else{
            this.form.setFieldsValue({level:[{}]})
        }
        this.setState({
            isAcceptProBono: registerData.isAcceptProBono||false,
            isAcceptReduceRate: registerData.isAcceptReduceRate||false,
            isWillingOpenPrivate: registerData.isWillingOpenPrivate||false
        })
        this.getDataFromServer();
    }



    onFinish = (values) => {
        console.log('Success:', values);
        // this.props.onContinue(true);
    };
    
    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
      };
    render() {
        return (
            <Row justify="center" className="row-form">
                <Row justify="center" className="row-form">
                    <div className='col-form col-info-review'>
                        <div className='div-form-title'>
                            <p className='font-26'>{intl.formatMessage(messages.reviewAccountInfo)}</p>
                        </div>
                        <Row gutter={14}>
                            <Col xs={24} sm={24} md={6}>
                                <div>
                                    <p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.usernameEmail)}</p>
                                    <p>Username</p>
                                    <p>Email</p>
                                </div>
                                <div>
                                    <p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.providerInfo)}</p>
                                    <p>Mother + Family name</p>
                                    <p>Mother phone</p>
                                    <p>Mother email</p>
                                    <div className='height-20'/>
                                    <p>Father + Family name</p>
                                    <p>Father phone</p>
                                    <p>Father email</p>
                                </div>
                            </Col>
                            <Col xs={24} sm={24} md={9}>
                                <div>
                                    <p>Street Address </p>
                                    <p>City State Zip</p>
                                </div>
                                <div>
                                    <p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.ratesInfo)}</p>
                                    <p className='font-14 font-700 mb-10'>Dependent #1 First + Last Name + DOB</p>
                                    <p>School</p>
                                    <div className='review-item'>
                                        <p>Teacher</p>
                                        <p>Grade</p>
                                    </div>
                                    <div className='review-item'>
                                        <p className='font-14 font-700 mb-10'>{intl.formatMessage(messages.servicesRequested)}</p>
                                        <p>Has an IEP</p>
                                    </div>
                                    <div className='review-item-3'>
                                        <p>Service#1</p>
                                        <p>Service#2</p>
                                        <p>Service#3</p>
                                    </div>
                                </div>
                                <div>
                                    <p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.availability)}</p>
                                    <div className='review-item-flex'>
                                        <div className='item-flex'>
                                            <p className='font-14 font-700 mb-10'>{intl.formatMessage(messages.sunday)}</p>
                                            <p>AM#1.1 - AM#1.2</p>
                                            <p>AM#1.1 - AM#1.2</p>
                                            <p>AM#1.1 - AM#1.2</p>
                                        </div>
                                        <div className='item-flex'>
                                            <p className='font-14 font-700 mb-10'>{intl.formatMessage(messages.wednesday)}</p>
                                            <p>AM#1.1 - AM#1.2</p>
                                            <p>AM#1.1 - AM#1.2</p>
                                        </div>
                                        <div className='item-flex'>
                                            <p className='font-14 font-700 mb-10'>{intl.formatMessage(messages.thursday)}</p>
                                            <p>AM#1.1 - AM#1.2</p>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={24} sm={24} md={9}>
                                <div>
                                    <p className='font-18 font-700 mb-10'>{intl.formatMessage(messages.subsidyOptions)}</p>
                                    <p>School</p>
                                    <div className='review-item'>
                                        <p>Teacher</p>
                                        <p>Grade</p>
                                    </div>
                                    <div className='review-item'>
                                        <p className='font-14 font-700 mb-10'>{intl.formatMessage(messages.servicesRequested)}</p>
                                        <p>Has an IEP</p>
                                    </div>
                                    <div className='review-item-3'>
                                        <p>Service#1</p>
                                        <p>Service#2</p>
                                        <p>Service#3</p>
                                    </div>
                                    <p className='font-14 font-700 mb-10'>{intl.formatMessage(messages.availability)}</p>
                                    <div className='review-item-flex'>
                                        <div className='item-flex'>
                                            <p className='font-14 font-700 mb-10'>{intl.formatMessage(messages.sunday)}</p>
                                            <p>AM#1.1 - AM#1.2</p>
                                            <p>AM#1.1 - AM#1.2</p>
                                            <p>AM#1.1 - AM#1.2</p>
                                        </div>
                                        <div className='item-flex'>
                                            <p className='font-14 font-700 mb-10'>{intl.formatMessage(messages.wednesday)}</p>
                                            <p>AM#1.1 - AM#1.2</p>
                                            <p>AM#1.1 - AM#1.2</p>
                                        </div>
                                        <div className='item-flex'>
                                            <p className='font-14 font-700 mb-10'>{intl.formatMessage(messages.thursday)}</p>
                                            <p>AM#1.1 - AM#1.2</p>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                        <div className="form-btn continue-btn" >
                            <Button
                                block
                                type="primary"                                      
                                htmlType="submit"
                            >
                                {intl.formatMessage(messages.confirm).toUpperCase()}
                            </Button>
                        </div>
                    </div>
                    </Row>
            </Row>
        );
    }
}
const mapStateToProps = state => ({
    register: state.register,
})
export default compose(connect(mapStateToProps, { setRegisterData }))(InfoReview);