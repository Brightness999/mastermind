import React, { createRef } from 'react';
import { Divider, Table, Space, Input, Button, message, Pagination, Popover, Checkbox } from 'antd';
import { FilterFilled, SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import { connect } from 'react-redux';
import { compose } from 'redux';
import intl from 'react-intl-universal';

import { ADMINAPPROVED, APPOINTMENT, BALANCE, CLOSED, CONSULTATION, EVALUATION, PENDING, SUBSIDY } from 'routes/constant';
import { ModalBalance, ModalDependentDetail } from 'components/Modal';
import msgMainHeader from 'components/MainHeader/messages';
import messages from 'routes/User/Dashboard/messages';
import msgCreateAccount from 'routes/Sign/CreateAccount/messages';
import msgDraweDetail from 'components/DrawerDetail/messages';
import msgModal from 'components/Modal/messages';
import request from 'utils/api/request';
import { getDependents, setFlagBalance } from 'utils/api/apiList';
import PageLoading from 'components/Loading/PageLoading';
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
      pageSize: 10,
      pageNumber: 1,
      totalSize: 0,
      searchDependentName: '',
      selectedGrades: [],
      selectedSchools: [],
    };
    this.searchInput = createRef(null);
  }

  componentDidMount() {
    this.getDependentList();
  }

  handleChangePagination = (newPageNumber, newPageSize) => {
    this.setState({ pageNumber: newPageNumber, pageSize: newPageSize }, () => {
      this.getDependentList();
    });
  }

  getDependentList() {
    this.setState({ loading: true });
    const { pageNumber, pageSize, searchDependentName, selectedGrades, selectedSchools } = this.state;
    const postData = {
      pageNumber, pageSize,
      name: searchDependentName,
      grades: selectedGrades,
      schools: selectedSchools,
    }

    request.post(getDependents, postData).then(result => {
      this.setState({ loading: false });
      const { success, data } = result;
      if (success) {
        this.setState({
          dependents: data?.dependents?.map((user, i) => {
            user['key'] = i; return user;
          }) ?? [],
          totalSize: data?.total,
        });
      }
    }).catch(err => {
      message.error(err.message);
      this.setState({ dependents: [], totalSize: 0, loading: false });
    })
  }

  onCloseModalDependent = (isUpdated) => {
    this.setState({ visibleDependent: false });
    isUpdated && this.getDependentList();
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
    const providerIds = Object.keys(values).filter(a => a.includes('invoiceId')).map(a => a.split("-")[1]);
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
                minimumPayment: values[`minimumPayment-${appointment.provider?._id}`] * 1,
                data: [
                  {
                    type: appointment?.type === EVALUATION ? intl.formatMessage(msgModal.evaluation) : appointment?.type === APPOINTMENT ? intl.formatMessage(msgModal.standardSession) : appointment?.type === SUBSIDY ? intl.formatMessage(msgModal.subsidizedSession) : '',
                    date: moment(appointment?.date).format("MM/DD/YYYY hh:mm a"),
                    details: `Location: ${appointment?.location}`,
                    count: appointment.type === SUBSIDY ? `[${selectedDependent.appointments?.filter(a => a?.type === SUBSIDY && [PENDING, CLOSED].includes(a?.status) && a?.dependent?._id === appointment?.dependent?._id && a?.provider?._id === appointment?.provider?._id)?.length}/${appointment?.subsidy?.numberOfSessions}]` : '',
                    discount: values[`discount-${appointment._id}`],
                    rate: values[`balance-${appointment._id}`],
                  },
                  {
                    type: 'Fee',
                    date: moment(appointment?.date).format("MM/DD/YYYY hh:mm a"),
                    details: 'Past Due Balance Fee',
                    rate: value[1] * 1,
                  },
                ],
                notes,
              }
            })
          }
        }
      })
      bulkData.push({
        providerId,
        invoiceId: values[`invoiceId-${providerId}`],
        totalPayment: values[`totalPayment-${providerId}`],
        minimumPayment: values[`minimumPayment-${providerId}`],
        data: temp,
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
    const { dependents, pageNumber, pageSize, searchDependentName, selectedGrades, selectedSchools, totalSize, visibleDependent, selectedDependent, loading, visibleBalance } = this.state;
    const { auth } = this.props;
    const grades = JSON.parse(JSON.stringify(auth.academicLevels ?? []))?.slice(6)?.map(level => ({ label: level, value: level }));
    const schools = JSON.parse(JSON.stringify(auth.schools ?? []))?.map(s => s?.schoolInfo)?.map(school => { school['label'] = school.name, school['value'] = school._id; return school; });
    schools.push({ label: 'Other', value: 'other' });

    const columns = [
      {
        title: intl.formatMessage(messages.studentName), key: 'name', fixed: 'left',
        sorter: (a, b) => (a.firstName || '' + a.lastName || '').toLowerCase() > (b.firstName || '' + b.lastName || '').toLowerCase() ? 1 : -1,
        filterDropdown: ({ setSelectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              name='SearchName'
              ref={this.searchInput}
              placeholder={`Search Student Name`}
              value={searchDependentName}
              onChange={e => {
                setSelectedKeys(e.target.value ? [e.target.value] : []);
                this.setState({ searchDependentName: e.target.value });
              }}
              onPressEnter={() => {
                confirm();
                this.getDependentList();
              }}
              style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
              <Button
                type="primary"
                onClick={() => {
                  confirm();
                  this.getDependentList();
                }}
                icon={<SearchOutlined />}
                size="small"
                style={{ width: 90 }}
              >
                Search
              </Button>
              <Button
                onClick={() => {
                  clearFilters();
                  confirm();
                  this.setState({ searchDependentName: '' }, () => {
                    this.getDependentList();
                  })
                }}
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
        onFilterDropdownOpenChange: visible => {
          if (visible) {
            setTimeout(() => this.searchInput.current?.select(), 100);
          }
        },
        render: (dependent) => (<span className='text-primary cursor' onClick={() => this.handleClickRow(dependent)}>{dependent.firstName ?? ''} {dependent.lastName ?? ''}</span>),
      },
      {
        title: intl.formatMessage(msgCreateAccount.age), dataIndex: 'birthday', key: 'age',
        sorter: (a, b) => a.birthday > b.birthday ? 1 : -1,
        render: (birthday) => moment().year() - moment(birthday).year(),
      },
      {
        title: intl.formatMessage(msgCreateAccount.currentGrade), dataIndex: 'currentGrade', key: 'grade',
        sorter: (a, b) => (a.currentGrade || '').toLowerCase() > (b.currentGrade || '').toLowerCase() ? 1 : -1,
        filterDropdown: ({ setSelectedKeys, confirm, clearFilters }) => (
          <div className='service-dropdown'>
            <Checkbox.Group
              options={grades}
              value={selectedGrades}
              onChange={(values) => {
                this.setState({ selectedGrades: values });
                setSelectedKeys(values);
              }}
            />
            <div className='service-dropdown-footer'>
              <Button type="primary" size="small" onClick={() => {
                confirm();
                this.getDependentList();
              }}>
                Filter
              </Button>
              <Button size="small" onClick={() => {
                this.setState({ selectedGrades: [] }, () => {
                  this.getDependentList();
                });
                clearFilters();
                confirm();
              }}>
                Reset
              </Button>
            </div>
          </div>
        ),
        filterIcon: filtered => (
          <FilterFilled style={{ color: filtered ? '#3E92CF' : undefined }} />
        ),
      },
      {
        title: intl.formatMessage(msgCreateAccount.school), key: 'school',
        sorter: (a, b) => !a.school ? 1 : a?.school?.name > b?.school?.name ? 1 : -1,
        filterDropdown: ({ setSelectedKeys, confirm, clearFilters }) => (
          <div className='service-dropdown'>
            <Checkbox.Group
              options={schools}
              value={selectedSchools}
              onChange={(values) => {
                this.setState({ selectedSchools: values });
                setSelectedKeys(values);
              }}
            />
            <div className='service-dropdown-footer'>
              <Button type="primary" size="small" onClick={() => {
                confirm();
                this.getDependentList();
              }}>
                Filter
              </Button>
              <Button size="small" onClick={() => {
                this.setState({ selectedSchools: [] }, () => {
                  this.getDependentList();
                });
                clearFilters();
                confirm();
              }}>
                Reset
              </Button>
            </div>
          </div>
        ),
        filterIcon: filtered => (
          <FilterFilled style={{ color: filtered ? '#3E92CF' : undefined }} />
        ),
        render: dependent => dependent?.school?.name || (
          <Popover content={(<div>
            <div><span className='font-700'>Name:</span> {dependent?.otherName}</div>
            <div><span className='font-700'>Phone:</span> {dependent?.otherContactNumber}</div>
            <div><span className='font-700'>Notes:</span> {dependent?.otherNotes}</div>
          </div>)} trigger="click">
            <span className='text-primary text-underline cursor action'>Other</span>
          </Popover>
        ),
      },
      {
        title: 'Closed Sessions', dataIndex: 'appointments', key: 'countOfClosedSessionsPast',
        sorter: (a, b) => a.appointments?.filter(data => [EVALUATION, APPOINTMENT].includes(data.type) && moment().isAfter(moment(data.date)) && data.status === CLOSED)?.length - b.appointments?.filter(data => [EVALUATION, APPOINTMENT].includes(data.type) && moment().isAfter(moment(data.date)) && data.status === CLOSED)?.length,
        render: appointments => appointments?.filter(a => [EVALUATION, APPOINTMENT].includes(a.type) && moment().isAfter(moment(a.date)) && a.status === CLOSED)?.length,
      },
      {
        title: 'Pending Sessions', dataIndex: 'appointments', key: 'countOfPendingSessionsPast',
        sorter: (a, b) => a.appointments?.filter(data => [EVALUATION, APPOINTMENT].includes(data.type) && moment().isAfter(moment(data.date)) && data.status === PENDING)?.length - b.appointments?.filter(data => [EVALUATION, APPOINTMENT].includes(data.type) && moment().isAfter(moment(data.date)) && data.status === PENDING)?.length,
        render: appointments => appointments?.filter(a => [EVALUATION, APPOINTMENT].includes(a.type) && moment().isAfter(moment(a.date)) && a.status === PENDING)?.length,
      },
      {
        title: 'Future Sessions', dataIndex: 'appointments', key: 'countOfSessionsFuture',
        sorter: (a, b) => a.appointments?.filter(data => [EVALUATION, APPOINTMENT].includes(data.type) && moment().isBefore(moment(data.date)) && data.status === PENDING)?.length - b.appointments?.filter(data => [EVALUATION, APPOINTMENT].includes(data.type) && moment().isBefore(moment(data.date)) && data.status === PENDING)?.length,
        render: appointments => appointments?.filter(a => [EVALUATION, APPOINTMENT].includes(a.type) && moment().isBefore(moment(a.date)) && a.status === PENDING)?.length,
      },
      {
        title: 'Referrals', dataIndex: 'appointments', key: 'countOfReferrals',
        sorter: (a, b) => a.appointments?.filter(data => data.type === CONSULTATION && moment().isAfter(moment(data.date)) && data.status === CLOSED)?.length - b.appointments?.filter(data => data.type === CONSULTATION && moment().isAfter(moment(data.date)) && data.status === CLOSED)?.length,
        render: appointments => appointments?.filter(a => a.type === CONSULTATION && moment().isAfter(moment(a.date)) && a.status === CLOSED)?.length
      },
      {
        title: 'Total subsidy requests', key: 'subsidy',
        sorter: (a, b) => a?.appointments?.filter(a => a?.type === SUBSIDY && [PENDING, CLOSED].includes(a?.status))?.length > b?.appointments?.filter(a => a?.type === SUBSIDY && [PENDING, CLOSED].includes(a?.status))?.length ? 1 : -1,
        render: dependent => {
          const approvedSubsidy = dependent.subsidy?.filter(s => s?.status === ADMINAPPROVED);
          return approvedSubsidy.length || 'No subsidy';
        }
      },
      {
        title: 'Subsidized sessions', key: 'subsidy',
        sorter: (a, b) => a?.appointments?.filter(a => a?.type === SUBSIDY && [PENDING, CLOSED].includes(a?.status))?.length > b?.appointments?.filter(a => a?.type === SUBSIDY && [PENDING, CLOSED].includes(a?.status))?.length ? 1 : -1,
        render: dependent => {
          const approvedSubsidy = dependent.subsidy?.filter(s => s?.status === ADMINAPPROVED);

          if (approvedSubsidy.length) {
            const totalAllowedSessions = approvedSubsidy?.reduce((a, b) => a + b.numberOfSessions, 0);
            const totalUsedSessions = dependent.appointments?.filter(a => a?.type === SUBSIDY && [PENDING, CLOSED].includes(a?.status))?.length ?? 0;

            return `${totalUsedSessions}/${totalAllowedSessions}`;
          } else {
            return '';
          }
        },
      },
      {
        title: 'Active Flags', key: 'activeflags', dataIndex: 'invoices', type: 'number',
        render: (invoices) => invoices?.filter(a => [4, 5].includes(a.type) && !a.isPaid)?.length || 0,
      },
      {
        title: 'Past Flags', key: 'pastflags', dataIndex: 'invoices', type: 'number',
        render: (invoices) => invoices?.filter(a => [4, 5].includes(a.type) && a.isPaid)?.length || 0,
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
        title: intl.formatMessage(messages.action), key: 'action', fixed: 'right',
        render: dependent => {
          const countOfUnpaidInvoices = dependent?.invoices?.filter(a => !a.isPaid && a.type === 1)?.length;

          if (countOfUnpaidInvoices) {
            return (
              <div className='action cursor' onClick={() => this.onShowModalBalance(dependent)}>
                <span className='action text-primary cursor'>{intl.formatMessage(msgDraweDetail.flagDependent)}</span>
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
      <div className="full-layout page dependentlist-page">
        <div className='div-title-admin'>
          <p className='font-16 font-500'>{intl.formatMessage(msgMainHeader.dependentList)}</p>
          <Divider />
        </div>
        <Space direction='vertical' className='flex'>
          <Table
            bordered
            size='middle'
            dataSource={dependents}
            columns={columns}
            onRow={(dependent) => {
              return {
                onClick: (e) => !e.target.className.includes('action') && this.handleClickRow(dependent),
                onDoubleClick: (e) => !e.target.className.includes('action') && this.handleClickRow(dependent),
              }
            }}
            pagination={false}
            scroll={{ x: true }}
          />
          <Pagination current={pageNumber} total={totalSize} pageSize={pageSize} onChange={this.handleChangePagination} />
        </Space>
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