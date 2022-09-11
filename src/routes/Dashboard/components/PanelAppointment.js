import React from 'react';
import {
  Avatar,
  Tabs,
} from 'antd';
import { FaUser } from 'react-icons/fa';
import { GiBackwardTime } from 'react-icons/gi';
import { BsEnvelope, BsXCircle, BsFillFlagFill, BsCheckCircleFill } from 'react-icons/bs';
import intl from 'react-intl-universal';
import messages from '../messages';
import { connect } from 'react-redux';
import { compose } from 'redux';
import './index.less';
const { TabPane } = Tabs;
import moment from 'moment';

class PanelAppointment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }


  componentDidMount() {
  }

  render(){
    const { appointments } = this.props
    return (
        <Tabs defaultActiveKey="1" type="card" size='small'>
            <TabPane tab={intl.formatMessage(messages.upcoming)} key="1">
                {
                !!appointments&&appointments.map((data,index) => {
                    if(data.status == 0){
                    let serviceType = ''
                    return (
                        <div key={index} className='list-item'>
                        <div className='item-left'>
                            <Avatar size={24} icon={<FaUser size={12} />} onClick={this.onShowDrawerDetail} />
                            <div className='div-service'>
                            <p className='font-11 mb-0'>{
                                data.skillSet && data.skillSet.map(item => (
                                serviceType += item
                                ) )
                                }</p>
                            <p className='font-09 mb-0'>{data.provider.name}</p>
                            </div>
                            <p className='font-11 mb-0 ml-auto mr-5'>{data.location}</p>
                            <div className='ml-auto'>
                            <p className='font-12 mb-0'>{moment(data.date).format("HH:mm:ss")}</p>
                            <p className='font-12 font-700 mb-0'>{moment(data.date).format('YYYY-MM-DD')}</p>
                            </div>
                        </div>
                        <div className='item-right'>
                            <GiBackwardTime size={19} onClick={() => { }} />
                            <BsXCircle style={{ marginTop: 4 }} size={15} onClick={() => { }} />
                        </div>
                    </div>
                    )
                    }
                })
                }
            </TabPane>
            <TabPane tab={intl.formatMessage(messages.unprocessed)} key="2">
            {!!appointments&&appointments.map((data, index) => {
                if(data.status == 2){
                let serviceType = ''
                return (
                    <div key={index} className='list-item'>
                    <div className='item-left'>
                        <Avatar size={24} icon={<FaUser size={12} />} onClick={this.onShowDrawerDetail} />
                        <div className='div-service'>
                        <p className='font-11 mb-0'>{
                                data.skillSet && data.skillSet.map(item => (
                                serviceType += item
                                ) )
                                }</p>
                            <p className='font-09 mb-0'>{data.provider.name}</p>
                        </div>
                        <p className='font-11 mb-0 ml-auto mr-5'>{data.location}</p>
                        <div className='ml-auto'>
                            <p className='font-12 mb-0'>{moment(data.date).format("HH:mm:ss")}</p>
                            <p className='font-12 font-700 mb-0'>{moment(data.date).format('YYYY-MM-DD')}</p>
                        </div>
                        </div>
                    <div className='item-right'>
                        <BsFillFlagFill size={15} onClick={() => { }} />
                        <BsCheckCircleFill className='text-green500' style={{ marginTop: 4 }} size={15} onClick={() => { }} />
                    </div>
                    </div>
                )
                }
            } 
            )}
            </TabPane>
            <TabPane tab={intl.formatMessage(messages.past)} key="3">
            {!!appointments&&appointments.map((data, index) =>{
                if(data.status == 1 || data.status == -1){
                let serviceType = ''
                return (
                    <div key={index} className='list-item'>
                    <div className='item-left'>
                        <Avatar size={24} icon={<FaUser size={12} />} onClick={this.onShowDrawerDetail} />
                        <div className='div-service'>
                        <p className='font-11 mb-0'>{
                                    data.skillSet && data.skillSet.map(item => (
                                    serviceType += item
                                    ) )
                                    }</p>
                        <p className='font-09 mb-0'>{data.provider.name}</p>
                        </div>
                        <p className='font-11 mb-0 ml-auto mr-5'>{data.location}</p>
                        <div className='ml-auto'>
                        <p className='font-12 mb-0'>{moment(data.date).format("HH:mm:ss")}</p>
                        <p className='font-12 font-700 mb-0'>{moment(data.date).format('YYYY-MM-DD')}</p>
                        </div>
                    </div>
                    <div className='item-right'>
                        <BsEnvelope size={15} onClick={() => { }} />
                        <BsFillFlagFill style={{ marginTop: 4 }} size={15} onClick={() => { }} />
                    </div>
                    </div>
                )
                }
            }
            )}
            </TabPane>
        </Tabs>
    )
  }
}
const mapStateToProps = state => {
    return ({
    })
}

export default compose(connect(mapStateToProps))(PanelAppointment);
