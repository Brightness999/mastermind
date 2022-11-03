import React from 'react';
import { Avatar, Tabs } from 'antd';
import { FaUser } from 'react-icons/fa';
import { GiBackwardTime } from 'react-icons/gi';
import { BsEnvelope, BsXCircle, BsFillFlagFill, BsCheckCircleFill } from 'react-icons/bs';
import intl from 'react-intl-universal';
import messages from '../messages';
import { connect } from 'react-redux';
import { compose } from 'redux';
import './index.less';
import moment from 'moment';
import request from '../../../utils/api/request'
import { ModalCancelAppointment, ModalCurrentAppointment } from '../../../components/Modal';

class PanelAppointment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      appointments: [],
      type: 0,
      currentTab: 1,
      visibleCancel: false,
      visibleCurrent: false,
      event: {},
    };
  }

  getMyAppointments = (searchData) => {
    var url = 'clients/get_my_appointments';
    if (this.props.userRole === 30) {
      url = 'providers/get_my_appointments'
    }
    request.post(url, searchData).then(result => {
      if (result.success) {
        var data = result.data;
        this.setState({ appointments: data?.docs ?? [] });
      } else {
        this.setState({ appointments: [] });
      }
    })
  }

  componentDidMount() {
    this.handleTabChange(1)
    this.props.setReload(this.setReloadData);
  }

  setReloadData = () => {
    this.handleTabChange(this.state.currentTab);
  }

  handleTabChange = (v) => {
    const date = new Date();
    this.setState({ appointments: [], currentTab: v })
    switch (parseInt(v)) {
      case 1: return this.getMyAppointments({
        "filter": {
          "type": [3],
          "status": [0],
          "date": { "$gte": date }
        }
      })
      case 2: return this.getMyAppointments({
        "filter": {
          "type": [3],
          "status": [-2],
        }
      })
      case 3: return this.getMyAppointments({
        "filter": {
          "type": [3],
          "status": [0, -1],
          "date": { "$lt": date }
        }
      })
    }
  }

  renderItemLeft = (data) => {
    return (
      <div className='item-left' onClick={() => this.props.onShowDrawerDetail(data._id)}>
        <Avatar size={24} icon={<FaUser size={12} />} />
        <div className='div-service'>
          {!!data.name && <p className='font-09 mb-0'><b>{data.name}</b></p>}
          {!!data.provider && <p className='font-09 mb-0'>{data.provider.name || data.provider.referredToAs}</p>}
          {!!data.school && <p className='font-09 mb-0'>{data.school.name}</p>}
        </div>
        <p className='font-11 mb-0 ml-auto mr-5'>{data.location}</p>
        <div className='ml-auto'>
          <p className='font-12 mb-0'>{moment(data.date).format("HH:mm:ss")}</p>
          <p className='font-12 font-700 mb-0'>{moment(data.date).format('YYYY-MM-DD')}</p>
        </div>
      </div>
    );
  }

  closeModalCurrent = () => {
    this.setState({ visibleCurrent: false });
  }

  openModalCurrent = (data) => {
    this.setState({
      visibleCurrent: true,
      event: data,
    });
  }

  closeModalCancel = () => {
    this.setState({ visibleCancel: false });
  }

  openModalCancel = (data) => {
    this.setState({
      visibleCancel: true,
      event: data,
    });
  }

  handleConfirmCancel = () => {
    this.setState({ visibleCancel: false }, () => {
      if (this.state.event?._id) {
        const data = { appointId: this.state.event._id };
        request.post('clients/cancel_appoint', data).then(result => {
          if (result.success) {
            this.setState({
              errorMessage: '',
              isCancelled: true,
            });
          } else {
            this.setState({
              errorMessage: result.data,
              isCancelled: true,
            });
          }
        }).catch(error => {
          console.log('closed error---', error);
          this.setState({
            errorMessage: error.message,
            isCancelled: true,
          });
        })
      }
    });
  }

  render() {
    const { appointments, visibleCancel, visibleCurrent, event } = this.state;
    const modalCancelProps = {
      visible: visibleCancel,
      onSubmit: this.handleConfirmCancel,
      onCancel: this.closeModalCancel,
      event: event,
    };
    const modalCurrentProps = {
      visible: visibleCurrent,
      onSubmit: this.closeModalCurrent,
      onCancel: this.closeModalCurrent,
      event: event,
    };

    return (
      <Tabs defaultActiveKey="1" type="card" size='small' onChange={this.handleTabChange}>
        <Tabs.TabPane tab={intl.formatMessage(messages.upcoming)} key="1">
          {appointments?.map((data, index) => (
            <div key={index} className='list-item'>
              {this.renderItemLeft(data)}
              <div className='item-right'>
                <GiBackwardTime size={19} onClick={() => this.openModalCurrent(data)} />
                <BsXCircle style={{ marginTop: 4 }} size={15} onClick={() => this.openModalCancel(data)} />
              </div>
            </div>
          ))}
          {(appointments?.length == 0) && (
            <div key={1} className='list-item'>
              <p className='p-10'>No upcoming appoiment</p>
            </div>
          )}
          <ModalCancelAppointment {...modalCancelProps} />
          <ModalCurrentAppointment {...modalCurrentProps} />
        </Tabs.TabPane>
        <Tabs.TabPane tab={intl.formatMessage(messages.unprocessed)} key="2">
          {appointments?.map((data, index) => (
            <div key={index} className='list-item'>
              {this.renderItemLeft(data)}
              <div className='item-right'>
                <BsFillFlagFill size={15} onClick={() => { }} />
                <BsCheckCircleFill className='text-green500' style={{ marginTop: 4 }} size={15} onClick={() => { }} />
              </div>
            </div>
          ))}
          {(appointments?.length == 0) && (
            <div key={1} className='list-item'>
              <p className='p-10'>No unprocess appoiment</p>
            </div>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab={intl.formatMessage(messages.past)} key="3">
          {appointments?.map((data, index) => (
            <div key={index} className='list-item'>
              {this.renderItemLeft(data)}
              <div className='item-right'>
                <BsEnvelope size={15} onClick={() => { }} />
                <BsFillFlagFill style={{ marginTop: 4 }} size={15} onClick={() => { }} />
              </div>
            </div>
          ))}
          {(appointments?.length == 0) && (
            <div key={1} className='list-item'>
              <p className='p-10'>No past appoiment</p>
            </div>
          )}
        </Tabs.TabPane>
      </Tabs>
    )
  }
}

const mapStateToProps = state => {
  return ({})
}

export default compose(connect(mapStateToProps))(PanelAppointment);
