import React, { createRef } from 'react';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';
import moment from 'moment';
import { Divider, Table, Space, Button, Input, message, Popconfirm } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import { APPOINTMENT, EVALUATION, SUBSIDY, routerLinks } from '../../../constant';
import { ModalConfirm } from '../../../../components/Modal';
import mgsSidebar from '../../../../components/SideBar/messages';
import msgModal from '../../../../components/Modal/messages';
import msgDrawer from '../../../../components/DrawerDetail/messages';
import request from '../../../../utils/api/request';
import { activateUser, clearFlag, getFlagList } from '../../../../utils/api/apiList';
import PageLoading from '../../../../components/Loading/PageLoading';

class FlagList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      schools: [],
      isConfirmModal: false,
      confirmMessage: '',
      userId: '',
      userState: 1,
      flags: [],
      skillSet: [],
      loading: false,
    };
    this.searchInput = createRef(null);
  }

  componentDidMount() {
    this.setState({ loading: true });
    const skillSet = JSON.parse(JSON.stringify(this.props.auth.skillSet));
    this.setState({ skillSet: skillSet?.map(skill => { skill['text'] = skill.name, skill['value'] = skill._id; return skill; }) });
    request.post(getFlagList).then(result => {
      const { success, data } = result;
      this.setState({ loading: false });
      if (success) {
        this.setState({
          flags: data?.map((flag, i) => {
            flag['key'] = i; return flag;
          }) ?? []
        });
      }
    }).catch(err => {
      message.error(err.message);
      this.setState({ loading: false });
    })
  }

  handleNewSchool = () => {
    this.props.history.push(routerLinks.CreateAccountForAdmin);
  }

  handleActivate = (id, state) => {
    this.setState({
      isConfirmModal: true,
      confirmMessage: `Are you sure to ${state ? 'activate' : 'deactivate'} this school?`,
      userId: id,
      userState: state,
    });
  }

  handleConfirm = () => {
    const { userId, userState, schools } = this.state;

    request.post(activateUser, { userId: userId, isActive: userState }).then(res => {
      if (res.success) {
        schools.map(user => {
          if (user._id == userId) {
            user.isActive = userState;
          }
          return user;
        })
        this.setState({
          schools: JSON.parse(JSON.stringify(schools)),
          isConfirmModal: false,
        });
      }
    }).catch(err => {
      console.log('activate user error---', err);
      message.error(err.message);
    })
  }

  handleCancel = () => {
    this.setState({ isConfirmModal: false });
  }

  handleClearFlag = (appointment) => {
    request.post(clearFlag, { _id: appointment?._id }).then(result => {
      const { success } = result;
      if (success) {
        const { flags } = this.state;
        message.success('Cleared successfully');
        const newFlags = flags.filter(a => a._id != appointment?._id);
        this.setState({ flags: newFlags });
      }
    })
  }

  render() {
    const { flags, isConfirmModal, confirmMessage, skillSet, loading } = this.state;
    const columns = [
      {
        title: 'Dependent', key: 'dependent',
        sorter: (a, b) => a.dependent?.firstName + a.dependent?.lastName > b.dependent?.firstName + b.dependent?.lastName ? 1 : -1,
        render: (appointment) => `${appointment?.dependent.firstName ?? ''} ${appointment?.dependent.lastName ?? ''}`,
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
        onFilter: (value, record) => record.dependent?.firstName?.toString()?.toLowerCase()?.includes((value).toLowerCase()) || record.dependent?.lastName?.toString()?.toLowerCase()?.includes((value).toLowerCase()),
        onFilterDropdownOpenChange: visible => {
          if (visible) {
            setTimeout(() => this.searchInput.current?.select(), 100);
          }
        },
      },
      {
        title: 'Provider',
        key: 'provider',
        sorter: (a, b) => a.provider?.firstName + a.provider?.lastName > b.provider?.firstName + b.provider?.lastName ? 1 : -1,
        render: (appointment) => `${appointment?.provider.firstName ?? ''} ${appointment?.provider.lastName ?? ''}`,
      },
      {
        title: 'Service', dataIndex: 'skillSet', key: 'skillSet', filters: skillSet,
        onFilter: (value, record) => record.skillSet?._id == value,
        render: skill => skill?.name,
      },
      {
        title: 'Session Type', dataIndex: 'type', key: 'sessionType',
        filters: [
          { text: 'Evaluation', value: EVALUATION },
          { text: 'Standard Session', value: APPOINTMENT },
          { text: 'Subsidized Session', value: SUBSIDY },
        ],
        onFilter: (value, record) => record.type == value,
        render: (type) => type === EVALUATION ? intl.formatMessage(msgModal.evaluation) : type === APPOINTMENT ? intl.formatMessage(msgModal.standardSession) : type === SUBSIDY ? intl.formatMessage(msgModal.subsidizedSession) : '',
      },
      { title: 'Session Date', dataIndex: 'date', key: 'date', type: 'datetime', sorter: (a, b) => a.date > b.date ? 1 : -1, render: (date) => moment(date).format('MM/DD/YYYY hh:mm a') },
      {
        title: 'Action', key: 'action', render: (appointment) => (
          <Popconfirm
            title="Are you sure to clear this flag?"
            onConfirm={() => this.handleClearFlag(appointment)}
            okText="Yes"
            cancelText="No"
            overlayClassName='clear-flag-confirm'
          >
            <a className='btn-blue action'>{intl.formatMessage(msgDrawer.clearFlag)}</a>
          </Popconfirm>
        )
      },
    ];

    const confirmModalProps = {
      visible: isConfirmModal,
      message: confirmMessage,
      onSubmit: this.handleConfirm,
      onCancel: this.handleCancel,
    }

    return (
      <div className="full-layout page usermanager-page">
        <div className='div-title-admin'>
          <p className='font-16 font-500'>{intl.formatMessage(mgsSidebar.flagList)}</p>
          <Divider />
        </div>
        <Table bordered size='middle' dataSource={flags} columns={columns} />
        <ModalConfirm {...confirmModalProps} />
        <PageLoading loading={loading} isBackground={true} />
      </div>
    );
  }
}

const mapStateToProps = state => ({ auth: state.auth });

export default compose(connect(mapStateToProps))(FlagList);