import { Divider, Table, Space, Button, Modal } from 'antd';
import { routerLinks } from '../../../constant';
import { ModalEditUser } from '../../../../components/Modal';
import React from 'react';
import intl from 'react-intl-universal';

import messages from '../messages';
import mgsSidebar from '../../../../components/SideBar/messages';

import './index.less';

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
     visibleEdit: false,
    }
  }

  handleNewUser = () => {
    localStorage.removeItem('token');
    this.props.history.push(routerLinks.CreateAccount);
  }

  onShowModalEdit = () => {
    this.setState({visibleEdit: true})
  }
  onCloseModalEdit = () => {
    this.setState({visibleEdit: false})
  }

  render() {
    const { visibleEdit } = this.state;
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
            <a className='btn-blue' onClick={this.onShowModalEdit}>Edit</a>
            <a className='btn-red'>Delete</a>
          </Space>
        ),
      },
    ];

    const modalEditUserProps = {
      visible: visibleEdit,
      onSubmit: this.onCloseModalEdit,
      onCancel: this.onCloseModalEdit,
    }
    return (
      <div className="full-layout page usermanager-page">
        <div className='div-title-admin'>
          <p className='font-16 font-500'>{intl.formatMessage(mgsSidebar.userManager)}</p>
          <Divider/>
        </div>
        <div className='text-right mb-20'>
          <Button type='primary' onClick={this.handleNewUser}>Create New User</Button>
        </div>
        <Table bordered size='middle' dataSource={dataSource} columns={columns} />
        <ModalEditUser {...modalEditUserProps}/>
      </div>
    );
  }
}
