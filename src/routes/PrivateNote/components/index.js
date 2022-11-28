import { Divider, Table, Space } from 'antd';
import { routerLinks } from '../../constant';
import { ModalConfirm, ModalDependentDetail, ModalCreateNote } from '../../../components/Modal';
import React, { createRef } from 'react';
import intl from 'react-intl-universal';
import msgMainHeader from '../../../components/MainHeader/messages';
import './index.less';
import { checkPermission } from '../../../utils/auth/checkPermission';
import request from '../../../utils/api/request';
import { createPrivateNote, deletePrivateNote, getDependents } from '../../../utils/api/apiList';

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleCreate: false,
      dependents: [],
      userRole: -1,
      isConfirmModal: false,
      confirmMessage: '',
      userId: '',
      selectedDependentId: '',
      note: '',
      visibleDependent: false,
      selectedDependent: {},
    };
    this.searchInput = createRef(null);
  }

  componentDidMount() {
    if (!!localStorage.getItem('token') && localStorage.getItem('token').length > 0) {
      checkPermission().then(loginData => {
        request.post(getDependents).then(result => {
          if (result.success) {
            this.setState({
              dependents: result?.data?.map((user, i) => {
                user['key'] = i; return user;
              }) ?? []
            });
          }
        }).catch(err => {
          console.log('get dependents error ---', err);
          this.setState({ dependents: [] });
        })
        this.setState({
          userRole: loginData.role,
          userId: loginData._id,
        });
      }).catch(err => {
        console.log(err);
        this.props.history.push('/');
      })
    }
  }

  handleNewUser = () => {
    localStorage.removeItem('token');
    this.props.history.push(routerLinks.CreateAccount);
  }

  onShowModalEdit = (dependentId) => {
    this.setState({
      visibleCreate: true,
      selectedDependentId: dependentId,
      note: '',
    });
  }

  onCloseModalCreateNote = () => {
    this.setState({ visibleCreate: false });
  }

  onCloseModalDependent = () => {
    this.setState({ visibleDependent: false });
  }

  handleDeleteNote = (dependentId) => {
    this.setState({
      isConfirmModal: true,
      confirmMessage: `Are you sure you want to delete this note?`,
      selectedDependentId: dependentId
    });
  }

  handleConfirm = () => {
    const { dependents, selectedDependentId } = this.state;
    const selectedDependent = dependents?.find(dependent => dependent._id == selectedDependentId);
    if (selectedDependent.notes?.find(note => note.dependent == selectedDependentId)) {
      request.post(deletePrivateNote, { id: selectedDependent.notes?.find(note => note.dependent == selectedDependentId)?._id }).then((res) => {
        if (res.success) {
          this.setState({
            dependents: dependents?.map(dependent => {
              if (dependent._id == selectedDependentId) {
                dependent.notes = [];
              }
              return dependent;
            })
          })
        }
      }).catch(err => {
        console.log('activate user error---', err);
      })
    }
    this.setState({ isConfirmModal: false });
  }

  handleCancel = () => {
    this.setState({ isConfirmModal: false });
  }

  handleCreateNote = (newnote) => {
    const { selectedDependentId, userId, dependents } = this.state;
    const data = {
      user: userId,
      dependent: selectedDependentId,
      note: newnote,
    }
    request.post(createPrivateNote, data).then(res => {
      if (res.success) {
        this.setState({
          dependents: dependents?.map(dependent => {
            if (dependent._id == selectedDependentId) {
              dependent.notes.unshift(res.data)
            }
            return dependent;
          })
        })
      }
    }).catch(err => {
      console.log('update private note error---', err);
    })
    this.setState({ visibleCreate: false });
  }

  handleClickRow = (dependent) => {
    this.setState({ visibleDependent: true, selectedDependent: dependent });
  }

  render() {
    const { visibleCreate, dependents, isConfirmModal, confirmMessage, note, visibleDependent, selectedDependent } = this.state;
    const columns = [
      {
        title: 'Name', key: 'name',
        sorter: (a, b) => a.firstName > b.firstName ? 1 : a.firstName < b.firstName ? -1 : a.firstName == b.firstName && a.lastName > b.lastName ? 1 : -1,
        render: (dependent) => `${dependent.firstName} ${dependent.lastName}`,
      },
      { title: 'Birthday', dataIndex: 'birthday', key: 'birthday', type: 'datetime', sorter: (a, b) => a.birthday > b.birthday ? 1 : -1, render: (birthday) => new Date(birthday).toLocaleString() },
      { title: 'Parent Email', dataIndex: 'guardianEmail', key: 'guardianEmail', sorter: (a, b) => a.guardianEmail > b.guardianEmail ? 1 : -1 },
      { title: 'Parent Phone', dataIndex: 'guardianPhone', key: 'guardianPhone', sorter: (a, b) => a.guardianPhone > b.guardianPhone ? 1 : -1 },
      {
        title: 'Action', key: 'action', render: (dependent) => (
          <Space size="middle">
            <a className='btn-blue action' onClick={() => this.onShowModalEdit(dependent._id)}>Create</a>
          </Space>
        ),
      },
    ];

    const modalCreateNoteProps = {
      visible: visibleCreate,
      onSubmit: this.handleCreateNote,
      onCancel: this.onCloseModalCreateNote,
      note: note,
    }

    const modalDependentProps = {
      visible: visibleDependent,
      onCancel: this.onCloseModalDependent,
      dependent: selectedDependent,
    }

    const confirmModalProps = {
      visible: isConfirmModal,
      message: confirmMessage,
      onSubmit: this.handleConfirm,
      onCancel: this.handleCancel,
    }

    return (
      <div className="full-layout page usermanager-page">
        <div className='div-title-admin'>
          <p className='font-16 font-500'>{intl.formatMessage(msgMainHeader.privateNotes)}</p>
          <Divider />
        </div>
        <Table
          bordered
          size='middle'
          dataSource={dependents}
          columns={columns}
          onRow={(dependent) => {
            return {
              onClick: (e) => e.target.className != 'btn-blue action' && this.handleClickRow(dependent),
              onDoubleClick: (e) => e.target.className != 'btn-blue action' && this.handleClickRow(dependent),
            }
          }}
        />
        {visibleCreate && <ModalCreateNote {...modalCreateNoteProps} />}
        {visibleDependent && <ModalDependentDetail {...modalDependentProps} />}
        <ModalConfirm {...confirmModalProps} />
      </div>
    );
  }
}
