import React from 'react';
import { Avatar, message, Tabs } from 'antd';
import { FaUser } from 'react-icons/fa';
import { BsXCircle, BsViewList } from 'react-icons/bs';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';

import messages from '../messages';
import request from '../../../utils/api/request'
import { cancelSubsidyRequest } from '../../../utils/api/apiList';
import { getSubsidyRequests } from '../../../redux/features/appointmentsSlice';
import { ModalCancelAppointment } from '../../../components/Modal';
import './index.less';

class PanelSubsidaries extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listSubsidaries: [],
      status: 1,
      visibleCancel: false,
      subsidyId: undefined,
    };
  }

  componentDidMount = () => {
    this.setState({ listSubsidaries: this.props.listSubsidaries?.filter(s => [0, 1, 3].includes(s.status)) });
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.listSubsidaries !== this.props.listSubsidaries) {
      const { status } = this.state;
      this.setState({ listSubsidaries: this.props.listSubsidaries?.filter(s => status == 1 ? [0, 1, 3].includes(s.status) : status == 1 ? [2, 4].includes(s.status) : s.status === 5) ?? [] });
    }
  }

  handleTabChange = (v) => {
    switch (v) {
      case "1":
        this.setState({ listSubsidaries: this.props.listSubsidaries?.filter(s => [0, 1, 3].includes(s.status)) ?? [], status: v }); break;
      case "2":
        this.setState({ listSubsidaries: this.props.listSubsidaries?.filter(s => [2, 4].includes(s.status)) ?? [], status: v }); break;
      case "3":
        this.setState({ listSubsidaries: this.props.listSubsidaries?.filter(s => s.status === 5) ?? [], status: v }); break;
      default: break;
    }
  }

  renderStatus(status) {
    let value = parseInt(status)
    switch (value) {
      case 0: case 1: case 3: return 'PENDING';
      case 2: case 4: return 'DECLINED';
      case 5: return 'APPROVED';
      case -1: return 'CANCELLED';
    }
    return '';
  }

  closeModalCancel = () => {
    this.setState({ visibleCancel: false });
  }

  openModalCancel = (subsidyId) => {
    this.setState({ visibleCancel: true, subsidyId });
  }

  handleConfirmCancel = () => {
    this.setState({ visibleCancel: false }, () => {
      const { subsidyId } = this.state;
      if (subsidyId) {
        request.post(cancelSubsidyRequest, { subsidyId }).then(result => {
          if (result.success) {
            this.props.getSubsidyRequests({ role: this.props.user?.role });
          }
        }).catch(error => {
          message.error(error.message);
        })
      }
    });
  }

  renderLeftContent(subsidy) {
    return (
      <div className='item-left' onClick={() => this.callOpenSubsidyDetail(subsidy)}>
        <Avatar size={24} icon={<FaUser size={12} />} />
        <div className='div-service' >
          <p className='font-11 mb-0'>{subsidy?.skillSet?.name}</p>
          <p className='font-09 mb-0'>{subsidy?.school?.name}</p>
        </div>
        <p className='font-12 ml-auto mb-0'>{this.renderStatus(subsidy.status)}</p>
      </div>
    );
  }

  callOpenSubsidyDetail(subsidy) {
    this.props.onShowModalSubsidyDetail(subsidy._id);
  }

  renderRighContent(type, subsidy) {
    if (type == 0) {
      return (
        <div className='item-right'>
          <BsViewList size={19} onClick={() => this.callOpenSubsidyDetail(subsidy)} />
          <BsXCircle style={{ marginTop: 4 }} size={15} onClick={() => this.openModalCancel(subsidy?._id)} />
        </div>
      )
    }
    if (type == 1 || type == 2) {
      return (
        <div className='item-right'>
          <BsViewList size={19} onClick={() => this.callOpenSubsidyDetail(subsidy)} />
        </div>
      )
    }
  }

  render() {
    const { listSubsidaries, visibleCancel } = this.state;
    const modalCancelProps = {
      visible: visibleCancel,
      onSubmit: this.handleConfirmCancel,
      onCancel: this.closeModalCancel,
    };

    return (
      <Tabs defaultActiveKey="1" type="card" size='small' onChange={this.handleTabChange}>
        <Tabs.TabPane tab={intl.formatMessage(messages.pending)} key="1">
          {listSubsidaries.length > 0 && listSubsidaries.map((subsidy, index) => (
            <div key={index} className='list-item'>
              {this.renderLeftContent(subsidy)}
              {this.renderRighContent(0, subsidy)}
            </div>
          ))}
          {listSubsidaries.length == 0 && (
            <div key={1} className='list-item p-10 justify-center'>
              <span>No pending subisdy</span>
            </div>
          )}
          {visibleCancel && <ModalCancelAppointment {...modalCancelProps} />}
        </Tabs.TabPane>
        <Tabs.TabPane tab={intl.formatMessage(messages.declined)} key="2">
          {listSubsidaries.length > 0 && listSubsidaries.map((subsidy, index) => (
            <div key={index} className='list-item'>
              {this.renderLeftContent(subsidy)}
              <div className='item-right'>
                {this.renderRighContent(1, subsidy)}
              </div>
            </div>
          )
          )}
          {listSubsidaries.length == 0 && (
            <div key={2} className='list-item p-10 justify-center'>
              <span>No declined subisdy</span>
            </div>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab={intl.formatMessage(messages.approved)} key="3">
          {listSubsidaries.length > 0 && listSubsidaries.map((subsidy, index) => (
            <div key={index} className='list-item'>
              {this.renderLeftContent(subsidy)}
              {this.renderRighContent(2, subsidy)}
            </div>
          )
          )}
          {listSubsidaries.length == 0 && (
            <div key={3} className='list-item p-10 justify-center'>
              <span>No approved subisdy</span>
            </div>
          )}
        </Tabs.TabPane>
      </Tabs>
    )
  }
}

const mapStateToProps = state => ({
  listSubsidaries: state.appointments.dataSubsidyRequests,
  user: state.auth.user,
})

export default compose(connect(mapStateToProps, { getSubsidyRequests }))(PanelSubsidaries);
