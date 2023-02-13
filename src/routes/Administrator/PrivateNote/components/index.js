import { Divider, Table, Space, Input, Button, message } from 'antd';
import { routerLinks } from '../../../constant';
import { ModalConfirm, ModalDependentDetail } from '../../../../components/Modal';
import React, { createRef } from 'react';
import intl from 'react-intl-universal';
import msgMainHeader from '../../../../components/MainHeader/messages';
import './index.less';
import { checkPermission } from '../../../../utils/auth/checkPermission';
import request from '../../../../utils/api/request';
import { deletePrivateNote, getDependents } from '../../../../utils/api/apiList';
import { SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import PageLoading from '../../../../components/Loading/PageLoading';

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dependents: [],
      userRole: -1,
      isConfirmModal: false,
      confirmMessage: '',
      userId: '',
      selectedDependentId: '',
      note: '',
      visibleDependent: false,
      selectedDependent: {},
      loading: false,
    };
    this.searchInput = createRef(null);
  }

  componentDidMount() {
    if (!!localStorage.getItem('token') && localStorage.getItem('token').length > 0) {
      this.setState({ loading: true });
      checkPermission().then(loginData => {
        request.post(getDependents).then(result => {
          this.setState({ loading: false });
          const { success, data } = result;
          if (success) {
            this.setState({
              dependents: data?.map((user, i) => {
                user['key'] = i; return user;
              }) ?? []
            });
          }
        }).catch(err => {
          message.error(err.message);
          this.setState({ dependents: [], loading: false });
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

  handleClickRow = (dependent) => {
    this.setState({ visibleDependent: true, selectedDependent: dependent });
  }

  render() {
    const { dependents, isConfirmModal, confirmMessage, visibleDependent, selectedDependent, loading } = this.state;
    const columns = [
      {
        title: 'Full Name', key: 'name',
        sorter: (a, b) => a.firstName + a.lastName > b.firstName + b.lastName ? 1 : -1,
        render: (dependent) => (<a onClick={() => this.handleClickRow(dependent)}>{dependent.firstName ?? ''} {dependent.lastName ?? ''}</a>),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              ref={this.searchInput}
              placeholder={`Search Dependent Name`}
              value={selectedKeys[0]}
              onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => confirm()}
              style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
              <Button
                type="primary"
                onClick={() => confirm()}
                icon={<SearchOutlined />}
                size="small"
                style={{ width: 90 }}
              >
                Search
              </Button>
              <Button
                onClick={() => clearFilters()}
                size="small"
                style={{ width: 90 }}
              >
                Reset
              </Button>
            </Space>
          </div>
        ),
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) =>
          record['firstName']?.toString()?.toLowerCase()?.includes((value).toLowerCase()) || record['lastName']?.toString()?.toLowerCase()?.includes((value).toLowerCase()),
        onFilterDropdownOpenChange: visible => {
          if (visible) {
            setTimeout(() => this.searchInput.current?.select(), 100);
          }
        },
      },
      { title: 'Age', dataIndex: 'birthday', key: 'age', sorter: (a, b) => a.birthday > b.birthday ? 1 : -1, render: (birthday) => moment().diff(moment(birthday), 'years') },
      { title: 'Grade', dataIndex: 'currentGrade', key: 'grade' },
      { title: 'School', dataIndex: 'school', key: 'school', render: school => school.name },
      { title: 'Count of Sessions Past', dataIndex: 'appointments', key: 'countOfSessionsPast', render: appointments => appointments?.filter(a => [2, 3].includes(a.type) && moment().isAfter(moment(a.date)) && a.status == -1)?.length },
      { title: 'Count of Sessions Future', dataIndex: 'appointments', key: 'countOfSessionsFuture', render: appointments => appointments?.filter(a => [2, 3].includes(a.type) && moment().isBefore(moment(a.date)) && a.status == 0)?.length },
      { title: 'Count of Referrals', dataIndex: 'appointments', key: 'countOfReferrals', render: appointments => appointments?.filter(a => a.type == 4 && moment().isAfter(moment(a.date)) && a.status == -1)?.length },
      { title: 'Subsidy', dataIndex: 'subsidy', key: 'subsidy', render: subsidy => subsidy?.length ? subsidy.length : 'No Subsidy' },
    ];

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
          <p className='font-16 font-500'>{intl.formatMessage(msgMainHeader.dependentList)}</p>
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
        {visibleDependent && <ModalDependentDetail {...modalDependentProps} />}
        <ModalConfirm {...confirmModalProps} />
        <PageLoading loading={loading} isBackground={true} />
      </div>
    );
  }
}
