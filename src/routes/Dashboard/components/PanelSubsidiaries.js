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
import { ADMINAPPROVED, ADMINDECLINED, ADMINPREAPPROVED, CANCELLED, PENDING, SCHOOLAPPROVED, SCHOOLDECLINED } from '../../constant';
import './index.less';

class PanelSubsidiaries extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listSubsidiaries: [],
      status: 1,
      visibleCancel: false,
      subsidyId: undefined,
    };
  }

  componentDidMount = () => {
    this.setState({ listSubsidiaries: this.props.listSubsidiaries?.filter(s => [PENDING, SCHOOLAPPROVED, ADMINPREAPPROVED].includes(s.status)) });
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.listSubsidiaries !== this.props.listSubsidiaries) {
      const { status } = this.state;
      this.setState({ listSubsidiaries: this.props.listSubsidiaries?.filter(s => status == 1 ? [PENDING, SCHOOLAPPROVED, ADMINPREAPPROVED].includes(s.status) : status == 2 ? [SCHOOLDECLINED, ADMINDECLINED].includes(s.status) : s.status === ADMINAPPROVED) ?? [] });
    }
  }

  handleTabChange = (v) => {
    const { listSubsidiaries } = this.props;
    switch (v) {
      case "1":
        this.setState({ listSubsidiaries: listSubsidiaries?.filter(s => [PENDING, SCHOOLAPPROVED, ADMINPREAPPROVED].includes(s.status)) ?? [], status: v }); break;
      case "2":
        this.setState({ listSubsidiaries: listSubsidiaries?.filter(s => [SCHOOLDECLINED, ADMINDECLINED].includes(s.status)) ?? [], status: v }); break;
      case "3":
        this.setState({ listSubsidiaries: listSubsidiaries?.filter(s => s.status === ADMINAPPROVED) ?? [], status: v }); break;
      default: break;
    }
  }

  renderStatus(status) {
    let value = parseInt(status)
    switch (value) {
      case PENDING: case SCHOOLAPPROVED: case ADMINPREAPPROVED: return 'PENDING';
      case SCHOOLDECLINED: case ADMINDECLINED: return 'DECLINED';
      case ADMINAPPROVED: return 'APPROVED';
      case CANCELLED: return 'CANCELLED';
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
    const { listSubsidiaries, visibleCancel } = this.state;
    const modalCancelProps = {
      visible: visibleCancel,
      onSubmit: this.handleConfirmCancel,
      onCancel: this.closeModalCancel,
    };

    return (
      <Tabs defaultActiveKey="1" type="card" size='small' onChange={this.handleTabChange}>
        <Tabs.TabPane tab={intl.formatMessage(messages.pending)} key="1">
          {listSubsidiaries.length > 0 && listSubsidiaries.map((subsidy, index) => (
            <div key={index} className='list-item'>
              {this.renderLeftContent(subsidy)}
              {this.renderRighContent(0, subsidy)}
            </div>
          ))}
          {listSubsidiaries.length == 0 && (
            <div key={1} className='list-item p-10 justify-center'>
              <span>No pending subisdy</span>
            </div>
          )}
          {visibleCancel && <ModalCancelAppointment {...modalCancelProps} />}
        </Tabs.TabPane>
        <Tabs.TabPane tab={intl.formatMessage(messages.declined)} key="2">
          {listSubsidiaries.length > 0 && listSubsidiaries.map((subsidy, index) => (
            <div key={index} className='list-item'>
              {this.renderLeftContent(subsidy)}
              <div className='item-right'>
                {this.renderRighContent(1, subsidy)}
              </div>
            </div>
          )
          )}
          {listSubsidiaries.length == 0 && (
            <div key={2} className='list-item p-10 justify-center'>
              <span>No declined subisdy</span>
            </div>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab={intl.formatMessage(messages.approved)} key="3">
          {listSubsidiaries.length > 0 && listSubsidiaries.map((subsidy, index) => (
            <div key={index} className='list-item'>
              {this.renderLeftContent(subsidy)}
              {this.renderRighContent(2, subsidy)}
            </div>
          )
          )}
          {listSubsidiaries.length == 0 && (
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
  listSubsidiaries: state.appointments.dataSubsidyRequests,
  user: state.auth.user,
})

export default compose(connect(mapStateToProps, { getSubsidyRequests }))(PanelSubsidiaries);
