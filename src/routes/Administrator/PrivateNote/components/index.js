import React, { createRef } from 'react';
import { Divider, Table, Space, Input, Button, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { ADMINAPPROVED, APPOINTMENT, BALANCE, CLOSED, CONSULTATION, EVALUATION, PENDING, SUBSIDY } from '../../../constant';
import { ModalBalance, ModalDependentDetail } from '../../../../components/Modal';
import intl from 'react-intl-universal';
import msgMainHeader from '../../../../components/MainHeader/messages';
import messages from '../../../Dashboard/messages';
import msgCreateAccount from '../../../Sign/CreateAccount/messages';
import msgDraweDetail from '../../../../components/DrawerDetail/messages';
import msgModal from '../../../../components/Modal/messages';
import request from '../../../../utils/api/request';
import { getDependents, setFlagBalance } from '../../../../utils/api/apiList';
import PageLoading from '../../../../components/Loading/PageLoading';
import './index.less';

class PrivateNote extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dependents: [],
      selectedDependentId: '',
      note: '',
      visibleDependent: false,
      selectedDependent: {},
      loading: false,
      visibleBalance: false,
    };
    this.searchInput = createRef(null);
  }

  componentDidMount() {
    this.setState({ loading: true });
    this.getDependentList();
  }

  getDependentList() {
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
  }

  onCloseModalDependent = () => {
    this.setState({ visibleDependent: false });
  }

  onShowModalBalance = (dependent) => {
    if (dependent?.appointments?.length) {
      this.setState({ selectedDependent: dependent }, () => {
        this.setState({ visibleBalance: true });
      })
    }
  }

  onCloseModalBalance = () => {
    this.setState({ visibleBalance: false, selectedDependent: {} });
  }

  handleSubmitFlagBalance = (values) => {
    const { notes } = values;
    const { selectedDependent } = this.state;
    const providerIds = Object.keys(values).filter(a => a.includes('invoiceNumber')).map(a => a.split("-")[1]);
    let bulkData = [];
    providerIds.forEach(providerId => {
      let temp = [];
      Object.entries(values)?.forEach(value => {
        if (value?.length) {
          const appointment = selectedDependent.appointments?.find(a => a._id === value[0]);
          if (appointment && appointment?.provider?._id === providerId) {
            temp.push({
              appointment: appointment._id,
              items: {
                flagType: BALANCE,
                late: value[1] * 1,
                balance: values[`balance-${appointment._id}`],
                totalPayment: values[`totalPayment-${appointment.provider?._id}`],
                rate: values[`totalPayment-${appointment.provider?._id}`],
                minimumPayment: values[`minimumPayment-${appointment.provider?._id}`] * 1,
                type: appointment?.type === EVALUATION ? intl.formatMessage(msgModal.evaluation) : appointment?.type === APPOINTMENT ? intl.formatMessage(msgModal.standardSession) : appointment?.type === SUBSIDY ? intl.formatMessage(msgModal.subsidizedSession) : '',
                locationDate: `(${appointment?.location}) Session on ${new Date(appointment?.date).toLocaleDateString()}`,
                notes,
              }
            })
          }
        }
      })
      bulkData.push({
        providerId,
        invoiceNumber: values[`invoiceNumber-${providerId}`],
        data: temp
      })
    })

    request.post(setFlagBalance, { bulkData, dependent: selectedDependent?._id }).then(result => {
      const { success } = result;
      if (success) {
        this.onCloseModalBalance();
        this.getDependentList();
      }
    }).catch(err => message.error(err.message));
  }

  handleClickRow = (dependent) => {
    this.setState({ visibleDependent: true, selectedDependent: dependent });
  }

  render() {
    const { dependents, visibleDependent, selectedDependent, loading, visibleBalance } = this.state;
    const { auth } = this.props;
    const grades = JSON.parse(JSON.stringify(auth.academicLevels ?? []))?.slice(6)?.map(level => ({ text: level, value: level }));
    const schools = JSON.parse(JSON.stringify(auth.schools ?? []))?.map(s => s?.schoolInfo)?.map(school => { school['text'] = school.name, school['value'] = school._id; return school; });

    const columns = [
      {
        title: intl.formatMessage(messages.studentName), key: 'name',
        sorter: (a, b) => a.firstName + a.lastName > b.firstName + b.lastName ? 1 : -1,
        render: (dependent) => (<a onClick={() => this.handleClickRow(dependent)}>{dependent.firstName ?? ''} {dependent.lastName ?? ''}</a>),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              name='SearchName'
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
      {
        title: intl.formatMessage(msgCreateAccount.age), dataIndex: 'birthday', key: 'age',
        sorter: (a, b) => a.birthday > b.birthday ? 1 : -1,
        render: (birthday) => moment().year() - moment(birthday).year(),
      },
      {
        title: intl.formatMessage(msgCreateAccount.currentGrade), dataIndex: 'currentGrade', key: 'grade',
        sorter: (a, b) => a.currentGrade.toLowerCase() > b.currentGrade.toLowerCase() ? 1 : -1,
        filters: grades,
        onFilter: (value, record) => record?.currentGrade === value,
      },
      {
        title: intl.formatMessage(msgCreateAccount.school), dataIndex: 'school', key: 'school',
        sorter: (a, b) => !a.school ? 1 : a?.school?.name > b?.school?.name ? 1 : -1,
        filters: schools,
        onFilter: (value, record) => record?.school?._id === value,
        render: school => school?.name,
      },
      {
        title: intl.formatMessage(messages.countOfClosedSessionsPast), dataIndex: 'appointments', key: 'countOfClosedSessionsPast',
        sorter: (a, b) => a.appointments?.filter(data => [EVALUATION, APPOINTMENT].includes(data.type) && moment().isAfter(moment(data.date)) && data.status === CLOSED)?.length - b.appointments?.filter(data => [EVALUATION, APPOINTMENT].includes(data.type) && moment().isAfter(moment(data.date)) && data.status === CLOSED)?.length,
        render: appointments => appointments?.filter(a => [EVALUATION, APPOINTMENT].includes(a.type) && moment().isAfter(moment(a.date)) && a.status === CLOSED)?.length,
      },
      {
        title: intl.formatMessage(messages.countOfPendingSessionsPast), dataIndex: 'appointments', key: 'countOfPendingSessionsPast',
        sorter: (a, b) => a.appointments?.filter(data => [EVALUATION, APPOINTMENT].includes(data.type) && moment().isAfter(moment(data.date)) && data.status === PENDING)?.length - b.appointments?.filter(data => [EVALUATION, APPOINTMENT].includes(data.type) && moment().isAfter(moment(data.date)) && data.status === PENDING)?.length,
        render: appointments => appointments?.filter(a => [EVALUATION, APPOINTMENT].includes(a.type) && moment().isAfter(moment(a.date)) && a.status === PENDING)?.length,
      },
      {
        title: intl.formatMessage(messages.countOfSessionsFuture), dataIndex: 'appointments', key: 'countOfSessionsFuture',
        sorter: (a, b) => a.appointments?.filter(data => [EVALUATION, APPOINTMENT].includes(data.type) && moment().isBefore(moment(data.date)) && data.status === PENDING)?.length - b.appointments?.filter(data => [EVALUATION, APPOINTMENT].includes(data.type) && moment().isBefore(moment(data.date)) && data.status === PENDING)?.length,
        render: appointments => appointments?.filter(a => [EVALUATION, APPOINTMENT].includes(a.type) && moment().isBefore(moment(a.date)) && a.status === PENDING)?.length,
      },
      {
        title: intl.formatMessage(messages.countOfReferrals), dataIndex: 'appointments', key: 'countOfReferrals',
        sorter: (a, b) => a.appointments?.filter(data => data.type === CONSULTATION && moment().isAfter(moment(data.date)) && data.status === CLOSED)?.length - b.appointments?.filter(data => data.type === CONSULTATION && moment().isAfter(moment(data.date)) && data.status === CLOSED)?.length,
        render: appointments => appointments?.filter(a => a.type === CONSULTATION && moment().isAfter(moment(a.date)) && a.status === CLOSED)?.length
      },
      {
        title: intl.formatMessage(msgCreateAccount.subsidy), key: 'subsidy',
        sorter: (a, b) => a?.appointments?.filter(a => a?.type === SUBSIDY && [PENDING, CLOSED].includes(a?.status))?.length > b?.appointments?.filter(a => a?.type === SUBSIDY && [PENDING, CLOSED].includes(a?.status))?.length ? 1 : -1,
        render: dependent => {
          const approvedSubsidy = dependent.subsidy?.filter(s => s?.status === ADMINAPPROVED);

          if (approvedSubsidy.length) {
            const totalAllowedSessions = approvedSubsidy?.reduce((a, b) => a + b.numberOfSessions, 0);
            const totalUsedSessions = dependent.appointments?.filter(a => a?.type === SUBSIDY && [PENDING, CLOSED].includes(a?.status))?.length ?? 0;

            return `${totalUsedSessions}/${totalAllowedSessions}`;
          } else {
            return 'No Subsidy';
          }
        },
      },
      {
        title: intl.formatMessage(messages.recentSessionDate), dataIndex: 'appointments', key: 'recentSession',
        sorter: (a, b) => {
          const aLastSession = a.appointments?.filter(a => [EVALUATION, APPOINTMENT, SUBSIDY].includes(a.type) && a.status === CLOSED)?.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b, {});
          const bLastSession = b.appointments?.filter(a => [EVALUATION, APPOINTMENT, SUBSIDY].includes(a.type) && a.status === CLOSED)?.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b, {});

          if (aLastSession.date) {
            if (bLastSession.date) {
              return moment(aLastSession.date) > moment(bLastSession.date) ? 1 : -1;
            } else {
              return 1;
            }
          } else {
            return -1;
          }
        },
        render: appointments => {
          const lastSession = appointments?.filter(a => [EVALUATION, APPOINTMENT, SUBSIDY].includes(a.type) && a.status === CLOSED)?.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b, {});
          return lastSession.date ? moment(lastSession.date).format('MM/DD/YYYY hh:mm A') : ''
        },
      },
      {
        title: intl.formatMessage(messages.action), key: 'action',
        render: dependent => {
          const countOfSessionsPast = dependent?.appointments?.filter(a => [EVALUATION, APPOINTMENT, SUBSIDY].includes(a.type) && moment().isAfter(moment(a.date)) && a.status == CLOSED)?.length;
          const countOfSessionsPaid = dependent?.appointments?.filter(a => [EVALUATION, APPOINTMENT, SUBSIDY].includes(a.type) && moment().isAfter(moment(a.date)) && a.status == CLOSED && a.isPaid)?.length;

          if (countOfSessionsPast > countOfSessionsPaid) {
            return (
              <div className='action cursor' onClick={() => this.onShowModalBalance(dependent)}>
                <a className='action cursor'>{intl.formatMessage(msgDraweDetail.flagDependent)}</a>
              </div>
            )
          } else {
            return null;
          }
        },
      }
    ];

    const modalDependentProps = {
      visible: visibleDependent,
      onCancel: this.onCloseModalDependent,
      dependent: selectedDependent,
    }

    const modalBalanceProps = {
      visible: visibleBalance,
      onSubmit: this.handleSubmitFlagBalance,
      onCancel: this.onCloseModalBalance,
      dependent: selectedDependent,
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
              onClick: (e) => e.target.className != 'action cursor' && this.handleClickRow(dependent),
              onDoubleClick: (e) => e.target.className != 'action cursor' && this.handleClickRow(dependent),
            }
          }}
        />
        {visibleDependent && <ModalDependentDetail {...modalDependentProps} />}
        {visibleBalance && <ModalBalance {...modalBalanceProps} />}
        <PageLoading loading={loading} isBackground={true} />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
})

export default compose(connect(mapStateToProps))(PrivateNote);