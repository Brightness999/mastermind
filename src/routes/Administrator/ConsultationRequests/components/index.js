import React, { createRef } from 'react';
import { Divider, Tabs } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Cookies from 'js-cookie';

import msgSidebar from 'components/SideBar/messages';
import msgDrawer from 'components/DrawerDetail/messages';
import { socketUrl } from 'utils/api/baseUrl';
import Unclaimed from './unclaimed';
import Claimed from './claimed';

class ConsultationRequest extends React.Component {
  constructor(props) {
    super(props);
    this.searchInput = createRef(null);
    this.socket = undefined;
  }

  componentDidMount() {
    const opts = {
      query: {
        token: Cookies.get('tk'),
      },
      withCredentials: true,
      autoConnect: true,
    };
    this.socket = io(socketUrl, opts);
  }

  render() {
    const items = [
      {
        key: '0',
        label: <span className="font-16">{intl.formatMessage(msgDrawer.unclaimed)}</span>,
        children: <Unclaimed socket={this.socket} />,
      },
      {
        key: '1',
        label: <span className="font-16">{intl.formatMessage(msgDrawer.claimed)}</span>,
        children: <Claimed socket={this.socket} />,
      },
    ]

    return (
      <div className="full-layout page consultationrequests-page">
        <div className='div-title-admin'>
          <p className='font-16 font-500'>{intl.formatMessage(msgSidebar.consultationRequests)}</p>
          <Divider />
        </div>
        <Tabs
          defaultActiveKey="0"
          type="card"
          size='small'
          items={items}
          className="bg-white p-10 h-100 overflow-y-scroll overflow-x-hidden"
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({ auth: state.auth });

export default compose(connect(mapStateToProps))(ConsultationRequest);