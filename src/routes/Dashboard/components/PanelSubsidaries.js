import React from 'react';
import { Avatar, Tabs } from 'antd';
import { FaUser } from 'react-icons/fa';
import { GiBackwardTime } from 'react-icons/gi';
import { BsXCircle, BsViewList } from 'react-icons/bs';
import intl from 'react-intl-universal';
import messages from '../messages';
import { connect } from 'react-redux';
import { compose } from 'redux';
import './index.less';

class PanelSubsidaries extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listSubsidaries: [],
      status: 0,
    };
  }

  componentDidMount = () => {
    this.setState({ listSubsidaries: this.props.listSubsidaries?.filter(s => s.status == this.state.status) });
  }

  handleTabChange = (v) => {
    switch (v) {
      case "1":
        this.setState({ listSubsidaries: this.props.listSubsidaries?.filter(s => s.status == 0) }); break;
      case "2":
        this.setState({ listSubsidaries: this.props.listSubsidaries?.filter(s => s.status == -1) }); break;
      case "3":
        this.setState({ listSubsidaries: this.props.listSubsidaries?.filter(s => s.status == 1) }); break;
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

  renderLeftContent(subsidy) {
    return (
      <div className='item-left'>
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
          <GiBackwardTime size={19} onClick={() => { this.callOpenSubsidyDetail(subsidy) }} />
          <BsXCircle style={{ marginTop: 4 }} size={15} onClick={() => { }} />
        </div>
      )
    }
    if (type == 1 || type == 2) {
      return (
        <div className='item-right'>
          <BsViewList size={19} onClick={() => { this.callOpenSubsidyDetail(subsidy) }} />
        </div>
      )
    }
  }

  render() {
    const { listSubsidaries } = this.state;

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
  listSubsidaries: state.appointments.dataSubsidyRequests
})

export default compose(connect(mapStateToProps))(PanelSubsidaries);
