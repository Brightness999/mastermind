import { Divider, Table, Space } from 'antd';
import { routerLinks } from '../../constant';
import { ModalConfirm, ModalEditNote } from '../../../components/Modal';
import React, { createRef } from 'react';
import intl from 'react-intl-universal';
import messages from '../messages';
import './index.less';
import { checkPermission } from '../../../utils/auth/checkPermission';
import request from '../../../utils/api/request';

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleEdit: false,
      dependents: [],
      userRole: -1,
      isConfirmModal: false,
      confirmMessage: '',
      userId: '',
      selectedDependentId: '',
      note: '',
    };
    this.searchInput = createRef(null);
  }

  componentDidMount() {
    if (!!localStorage.getItem('token') && localStorage.getItem('token').length > 0) {
      checkPermission().then(loginData => {
        const data = {
          id: loginData?.user?._id,
          role: loginData?.user?.role,
        }
        request.post('providers/get_dependents', data).then(result => {
          if (result.success) {
            this.setState({
              dependents: result?.data?.map((user, i) => {
                user['key'] = i; return user;
              }) ?? []
            });
          }
        })
        this.setState({
          userRole: loginData.user.role,
          userId: loginData.user._id,
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
      visibleEdit: true,
      selectedDependentId: dependentId,
      note: this.state.dependents?.find(dependent => dependent._id == dependentId)?.notes?.find(note => note.dependent == dependentId)?.note
    });
  }

  onCloseModalEdit = () => {
    this.setState({ visibleEdit: false });
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
      request.post('providers/delete_private_note', { id: selectedDependent.notes?.find(note => note.dependent == selectedDependentId)?._id }).then((res) => {
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

  handleUpdateNote = (newnote) => {
    const { selectedDependentId, userId, dependents } = this.state;
    const selectedDependent = dependents?.find(dependent => dependent._id == selectedDependentId);
    const data = {
      user: userId,
      dependent: selectedDependentId,
      note: newnote,
    }
    if (selectedDependent?.notes?.[0]) {
      request.post('providers/update_private_note', data).then(res => {
        if (res.success) {
          this.setState({
            dependents: dependents?.map(dependent => {
              if (dependent._id == selectedDependentId) {
                dependent.notes = [res.data];
              }
              return dependent;
            })
          })
        }
      }).catch(err => {
        console.log('update private note error---', err);
      })
    } else {
      request.post('providers/create_private_note', data).then(res => {
        if (res.success) {
          this.setState({
            dependents: dependents?.map(dependent => {
              if (dependent._id == selectedDependentId) {
                dependent.notes.push(res.data)
              }
              return dependent;
            })
          })
        }
      }).catch(err => {
        console.log('update private note error---', err);
      })
    }
    this.setState({ visibleEdit: false });
  }

  render() {
    const { visibleEdit, dependents, isConfirmModal, confirmMessage, note } = this.state;
    const columns = [
      {
        title: 'Name', key: 'name',
        sorter: (a, b) => a.firstName > b.firstName ? 1 : a.firstName < b.firstName ? -1 : a.firstName == b.firstName && a.lastName > b.lastName ? 1 : -1,
        render: (dependent) => `${dependent.firstName} ${dependent.lastName}`,
      },
      { title: 'Birthday', dataIndex: 'birthday', key: 'birthday', type: 'datetime', sorter: (a, b) => a.birthday > b.birthday ? 1 : -1, render: (birthday) => new Date(birthday).toLocaleString() },
      { title: 'Parent Email', dataIndex: 'guardianEmail', key: 'guardianEmail', sorter: (a, b) => a.guardianEmail > b.guardianEmail ? 1 : -1 },
      { title: 'Parent Phone', dataIndex: 'guardianPhone', key: 'guardianPhone', sorter: (a, b) => a.guardianPhone > b.guardianPhone ? 1 : -1 },
      { title: 'Note', key: 'note', render: (dependent) => dependent.notes?.[0]?.note },
      {
        title: 'Action', key: 'action', render: (dependent) => (
          <Space size="middle">
            <a className='btn-blue' onClick={() => this.onShowModalEdit(dependent._id)}>{dependent.notes?.[0] ? 'Edit' : 'Create'}</a>
            <a className='btn-red' onClick={() => this.handleDeleteNote(dependent._id)}>{dependent.notes?.[0] ? 'Delete' : ''}</a>
          </Space>
        ),
      },
    ];

    const modalEditNoteProps = {
      visible: visibleEdit,
      onSubmit: this.handleUpdateNote,
      onCancel: this.onCloseModalEdit,
      note: note,
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
          <p className='font-16 font-500'>{intl.formatMessage(messages.privatenotes)}</p>
          <Divider />
        </div>
        <Table bordered size='middle' dataSource={dependents} columns={columns} />
        {visibleEdit && <ModalEditNote {...modalEditNoteProps} />}
        <ModalConfirm {...confirmModalProps} />
      </div>
    );
  }
}
