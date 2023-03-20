import React from 'react';
import { Divider, Table } from 'antd';
import intl from 'react-intl-universal';

import mgsSidebar from '../../../../components/SideBar/messages';
import './index.less';

export default class extends React.Component {
  render() {
    const dataSource = [];
    const columns = [];

    return (
      <div className="full-layout page statistics-page">
        <div className='div-title-admin'>
          <p className='font-16 font-500'>{intl.formatMessage(mgsSidebar.statistics)}</p>
          <Divider />
        </div>
        <Table bordered size='middle' dataSource={dataSource} columns={columns} />
      </div>
    );
  }
}
