import { Divider, Table, Space } from 'antd';
import React from 'react';
import intl from 'react-intl-universal';

import messages from '../messages';
import mgsSidebar from '../../../../components/SideBar/messages';

import './index.less';

export default class extends React.Component {
  render() {
    const dataSource = [
      {
        key: '1',
        name: 'Mike',
        age: 32,
        address: '10 Downing Street',
      },
      {
        key: '2',
        name: 'John',
        age: 42,
        address: '10 Downing Street',
      },
    ];
    
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Age',
        dataIndex: 'age',
        key: 'age',
      },
      {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
      },
      {
        title: 'Action',
        key: 'action',
        render: () => (
          <Space size="middle">
            <a className='btn-blue'>Edit</a>
            <a className='btn-red'>Delete</a>
          </Space>
        ),
      },
    ];
    return (
      <div className="full-layout page usermanager-page">
        <div className='div-title-admin'>
          <p className='font-16 font-500'>{intl.formatMessage(mgsSidebar.userManager)}</p>
          <Divider/>
        </div>
        <Table bordered size='middle' dataSource={dataSource} columns={columns} />
      </div>
    );
  }
}
