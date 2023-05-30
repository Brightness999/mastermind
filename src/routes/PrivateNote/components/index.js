import React, { createRef } from 'react';
import { Divider, Table, Space, Input, Button, message } from 'antd';
import intl from 'react-intl-universal';
import { SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { CSVLink } from "react-csv";
import { FaFileDownload } from 'react-icons/fa';

import { ACTIVE, ADMINAPPROVED, APPOINTMENT, BALANCE, CLOSED, CONSULTANT, CONSULTATION, EVALUATION, PARENT, PENDING, PROVIDER, SCHOOL, SUBSIDY } from '../../constant';
import { ModalBalance, ModalDependentDetail, ModalSubsidyProgress } from '../../../components/Modal';
import msgMainHeader from '../../../components/MainHeader/messages';
import messages from '../../Dashboard/messages';
import msgCreateAccount from '../../Sign/CreateAccount/messages';
import msgDraweDetail from '../../../components/DrawerDetail/messages';
import msgModal from '../../../components/Modal/messages';
import request from '../../../utils/api/request';
import { getDependents, setFlagBalance, updateBalanceFlag } from '../../../utils/api/apiList';
import { getSubsidyRequests } from '../../../redux/features/appointmentsSlice';
import PageLoading from '../../../components/Loading/PageLoading';
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
      csvData: [],
      visibleSubsidyProgress: false,
      selectedSubsidyId: undefined,
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
      } else {
        this.setState({ dependents: [], loading: false });
      }
    }).catch(err => {
      this.setState({ dependents: [], loading: false });
    })
  }

  onCloseModalDependent = () => {
    this.setState({ visibleDependent: false });
  }

  handleClickRow = (dependent) => {
    this.setState({ visibleDependent: true, selectedDependent: dependent });
  }

  exportToExcel = () => {
    const data = this.props.subsidyRequests?.map(r => ({
      "Student Name": `${r?.student?.firstName ?? ''} ${r?.student?.lastName ?? ''}`,
      "School": r?.school?.name ?? '',
      "Student Grade": r?.student?.currentGrade,
      "Service Requested": r?.skillSet?.name,
      "Notes": r?.note,
      "Provider": r?.selectedProvider ? `${r?.selectedProvider?.firstName ?? ''} ${r?.selectedProvider?.lastName ?? ''}` : r?.otherProvider,
      "HMGH expense per session": r.pricePerSession ?? '',
      "# of approved sessions": r.numberOfSessions ?? '',
      "# of sessions paid to DATE": r?.appointments?.filter(a => a.status === CLOSED && a.isPaid)?.length ?? '',
      "Total HMGH expense": r.pricePerSession * r.numberOfSessions,
    }))
    this.setState({ csvData: data });
    return true;
  }

  onShowModalSubsidy = (subsidyId) => {
    this.setState({ selectedSubsidyId: subsidyId, visibleSubsidyProgress: true });
  }

  onCloseModalSubsidy = () => {
    this.setState({ selectedSubsidyId: undefined, visibleSubsidyProgress: false });
  };

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
    const { notes, invoiceNumber } = values;
    const { selectedDependent } = this.state;
    let bulkData = [];

    Object.entries(values)?.forEach(value => {
      if (value?.length) {
        const appointment = selectedDependent.appointments?.find(a => a._id === value[0]);
        if (appointment) {
          bulkData.push({
            updateOne: {
              filter: { _id: value[0] },
              update: {
                $set: {
                  flagStatus: ACTIVE,
                  flagType: BALANCE,
                  flagItems: {
                    flagType: BALANCE,
                    late: value[1] * 1,
                    balance: values[`balance-${appointment?._id}`] * 1,
                    totalPayment: values[`totalPayment-${appointment.provider?._id}`],
                    minimumPayment: values[`minimumPayment-${appointment.provider?._id}`] * 1,
                    type: appointment?.type === EVALUATION ? intl.formatMessage(msgModal.evaluation) : appointment?.type === APPOINTMENT ? intl.formatMessage(msgModal.standardSession) : appointment?.type === SUBSIDY ? intl.formatMessage(msgModal.subsidizedSession) : '',
                    locationDate: `(${appointment?.location}) Session on ${new Date(appointment?.date).toLocaleDateString()}`,
                    notes,
                  }
                }
              }
            }
          })
        }
      }
    })

    request.post(invoiceNumber ? updateBalanceFlag : setFlagBalance, { bulkData, invoiceNumber, dependent: selectedDependent?._id }).then(result => {
      const { success } = result;
      if (success) {
        this.onCloseModalBalance();
        this.getDependentList();
      }
    }).catch(err => message.error(err.message));
  }

  render() {
    const { csvData, dependents, visibleDependent, selectedDependent, loading, visibleSubsidyProgress, selectedSubsidyId, visibleBalance } = this.state;
    const { auth, subsidyRequests } = this.props;
    const skills = JSON.parse(JSON.stringify(auth.skillSet ?? []))?.map(skill => { skill['text'] = skill.name, skill['value'] = skill._id; return skill; });
    const grades = JSON.parse(JSON.stringify(auth.academicLevels ?? []))?.slice(6)?.map(level => ({ text: level, value: level }));
    const schools = JSON.parse(JSON.stringify(auth.schools ?? []))?.map(s => s?.schoolInfo)?.map(school => { school['text'] = school.name, school['value'] = school._id; return school; });

    const columns = [
      {
        title: intl.formatMessage(messages.studentName), key: 'name',
        sorter: (a, b) => a.firstName + a.lastName > b.firstName + b.lastName ? 1 : -1,
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              name='SearchName'
              ref={this.searchInput}
              placeholder={`${intl.formatMessage(msgMainHeader.search)} ${intl.formatMessage(messages.studentName)}`}
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
                {intl.formatMessage(msgMainHeader.search)}
              </Button>
              <Button
                onClick={() => { clearFilters(); confirm(); }}
                size="small"
                style={{ width: 90 }}
              >
                {intl.formatMessage(messages.reset)}
              </Button>
            </Space>
          </div>
        ),
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) => record['firstName']?.toString()?.toLowerCase()?.includes((value).toLowerCase()) || record['lastName']?.toString()?.toLowerCase()?.includes((value).toLowerCase()),
        onFilterDropdownOpenChange: visible => {
          if (visible) {
            setTimeout(() => this.searchInput.current?.select(), 100);
          }
        },
        render: (dependent) => (<a onClick={() => this.handleClickRow(dependent)}>{dependent.firstName ?? ''} {dependent.lastName ?? ''}</a>),
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
    ];

    if (auth.user.role === PARENT) {
      columns.splice(5, 0, {
        title: intl.formatMessage(messages.countOfSessionsPast), dataIndex: 'appointments', key: 'countOfSessionsPast',
        sorter: (a, b) => a.appointments?.filter(data => [EVALUATION, APPOINTMENT].includes(data.type) && moment().isAfter(moment(data.date)) && [CLOSED, PENDING].includes(data.status))?.length - b.appointments?.filter(data => [EVALUATION, APPOINTMENT].includes(data.type) && moment().isAfter(moment(data.date)) && [CLOSED, PENDING].includes(data.status))?.length,
        render: appointments => appointments?.filter(a => [EVALUATION, APPOINTMENT].includes(a.type) && moment().isAfter(moment(a.date)) && [CLOSED, PENDING].includes(a.status))?.length,
      })
      columns.splice(6, 0, {
        title: intl.formatMessage(messages.countOfSessionsFuture), dataIndex: 'appointments', key: 'countOfSessionsFuture',
        sorter: (a, b) => a.appointments?.filter(data => [EVALUATION, APPOINTMENT].includes(data.type) && moment().isBefore(moment(data.date)) && data.status === PENDING)?.length - b.appointments?.filter(data => [EVALUATION, APPOINTMENT].includes(data.type) && moment().isBefore(moment(data.date)) && data.status === PENDING)?.length,
        render: appointments => appointments?.filter(a => [EVALUATION, APPOINTMENT].includes(a.type) && moment().isBefore(moment(a.date)) && a.status === PENDING)?.length,
      })
      columns.splice(7, 0, {
        title: intl.formatMessage(messages.countOfReferrals), dataIndex: 'appointments', key: 'countOfReferrals',
        sorter: (a, b) => a.appointments?.filter(data => data.type === CONSULTATION && moment().isAfter(moment(data.date)) && data.status === CLOSED)?.length - b.appointments?.filter(data => data.type === CONSULTATION && moment().isAfter(moment(data.date)) && data.status === CLOSED)?.length,
        render: appointments => appointments?.filter(a => a.type === CONSULTATION && moment().isAfter(moment(a.date)) && a.status === CLOSED)?.length,
      })
      columns.splice(8, 0, {
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
      })
      columns.splice(9, 0, {
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
            return 1;
          }
        },
        render: appointments => {
          const lastSession = appointments?.filter(a => [EVALUATION, APPOINTMENT, SUBSIDY].includes(a.type) && a.status === CLOSED)?.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b, {});
          return lastSession.date ? moment(lastSession.date).format('MM/DD/YYYY hh:mm A') : ''
        },
      })
    }

    if (auth.user.role === PROVIDER) {
      columns.splice(5, 0, {
        title: intl.formatMessage(messages.countOfClosedSessionsPast), dataIndex: 'appointments', key: 'countOfClosedSessionsPast',
        sorter: (a, b) => a.appointments?.filter(data => data.provider?._id === auth.user.providerInfo?._id && [EVALUATION, APPOINTMENT].includes(data.type) && moment().isAfter(moment(data.date)) && data.status === CLOSED)?.length - b.appointments?.filter(data => data.provider?._id === auth.user.providerInfo?._id && [EVALUATION, APPOINTMENT].includes(data.type) && moment().isAfter(moment(data.date)) && data.status === CLOSED)?.length,
        render: appointments => appointments?.filter(a => a.provider?._id === auth.user.providerInfo?._id && [EVALUATION, APPOINTMENT].includes(a.type) && moment().isAfter(moment(a.date)) && a.status === CLOSED)?.length,
      });
      columns.splice(6, 0, {
        title: intl.formatMessage(messages.countOfPendingSessionsPast), dataIndex: 'appointments', key: 'countOfPendingSessionsPast',
        sorter: (a, b) => a.appointments?.filter(data => data.provider?._id === auth.user.providerInfo?._id && [EVALUATION, APPOINTMENT].includes(data.type) && moment().isAfter(moment(data.date)) && data.status === PENDING)?.length - b.appointments?.filter(data => data.provider?._id === auth.user.providerInfo?._id && [EVALUATION, APPOINTMENT].includes(data.type) && moment().isAfter(moment(data.date)) && data.status === PENDING)?.length,
        render: appointments => appointments?.filter(a => a.provider?._id === auth.user.providerInfo?._id && [EVALUATION, APPOINTMENT].includes(a.type) && moment().isAfter(moment(a.date)) && a.status === PENDING)?.length,
      });
      columns.splice(7, 0, {
        title: intl.formatMessage(messages.countOfSessionsFuture), dataIndex: 'appointments', key: 'countOfSessionsFuture',
        sorter: (a, b) => a.appointments?.filter(data => data.provider?._id === auth.user.providerInfo?._id && [EVALUATION, APPOINTMENT].includes(data.type) && moment().isBefore(moment(data.date)) && data.status === PENDING)?.length - b.appointments?.filter(data => data.provider?._id === auth.user.providerInfo?._id && [EVALUATION, APPOINTMENT].includes(data.type) && moment().isBefore(moment(data.date)) && data.status === PENDING)?.length,
        render: appointments => appointments?.filter(a => a.provider?._id === auth.user.providerInfo?._id && [EVALUATION, APPOINTMENT].includes(a.type) && moment().isBefore(moment(a.date)) && a.status === PENDING)?.length,
      })
      columns.splice(8, 0, {
        title: intl.formatMessage(msgCreateAccount.subsidy), key: 'subsidy',
        sorter: (a, b) => a?.appointments?.filter(a => a?.type === SUBSIDY && [PENDING, CLOSED].includes(a?.status))?.length > b?.appointments?.filter(a => a?.type === SUBSIDY && [PENDING, CLOSED].includes(a?.status))?.length ? 1 : -1,
        render: dependent => {
          const approvedSubsidy = dependent.subsidy?.filter(s => s?.status === ADMINAPPROVED && s?.selectedProvider?._id === auth.user.providerInfo?._id);

          if (approvedSubsidy.length) {
            const totalAllowedSessions = approvedSubsidy?.reduce((a, b) => a + b.numberOfSessions, 0);
            const totalUsedSessions = dependent.appointments?.filter(a => a?.type === SUBSIDY && [PENDING, CLOSED].includes(a?.status) && a?.provider?._id === auth.user.providerInfo?._id)?.length ?? 0;

            return `${totalUsedSessions}/${totalAllowedSessions}`;
          } else {
            return 'No Subsidy';
          }
        },
      })
      columns.splice(9, 0, {
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
            return 1;
          }
        },
        render: appointments => {
          const lastSession = appointments?.filter(a => [EVALUATION, APPOINTMENT, SUBSIDY].includes(a.type) && a.status === CLOSED)?.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b, {});
          return lastSession.date ? moment(lastSession.date).format('MM/DD/YYYY hh:mm A') : ''
        },
      })
      columns.splice(10, 0, {
        title: intl.formatMessage(messages.action), key: 'action',
        render: dependent => {
          const countOfSessionsPast = dependent?.appointments?.filter(a => a.provider?._id === auth.user.providerInfo?._id && [EVALUATION, APPOINTMENT, SUBSIDY].includes(a.type) && moment().isAfter(moment(a.date)) && a.status === CLOSED)?.length;
          const countOfSessionsPaid = dependent?.appointments?.filter(a => a.provider?._id === auth.user.providerInfo?._id && [EVALUATION, APPOINTMENT, SUBSIDY].includes(a.type) && moment().isAfter(moment(a.date)) && a.status === CLOSED && a.isPaid)?.length;

          if (countOfSessionsPast > countOfSessionsPaid) {
            return (
              <a className='action' onClick={() => this.onShowModalBalance(dependent)}>{intl.formatMessage(msgDraweDetail.flagDependent)}</a>
            )
          } else {
            return null;
          }
        },
      });
    }

    if (auth.user.role === SCHOOL) {
      columns.splice(5, 0, {
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
      })
    }

    if (auth.user.role === CONSULTANT) {
      columns.splice(5, 0, {
        title: intl.formatMessage(messages.countOfSessionsPast), dataIndex: 'appointments', key: 'countOfSessionsPast',
        sorter: (a, b) => a.appointments?.filter(data => [EVALUATION, APPOINTMENT].includes(data.type) && moment().isAfter(moment(data.date)) && [CLOSED, PENDING].includes(data.status))?.length - b.appointments?.filter(data => [EVALUATION, APPOINTMENT].includes(data.type) && moment().isAfter(moment(data.date)) && [CLOSED, PENDING].includes(data.status))?.length,
        render: appointments => appointments?.filter(a => [EVALUATION, APPOINTMENT].includes(a.type) && moment().isAfter(moment(a.date)) && [CLOSED, PENDING].includes(a.status))?.length,
      })
      columns.splice(6, 0, {
        title: intl.formatMessage(messages.countOfSessionsFuture), dataIndex: 'appointments', key: 'countOfSessionsFuture',
        sorter: (a, b) => a.appointments?.filter(data => [EVALUATION, APPOINTMENT].includes(data.type) && moment().isBefore(moment(data.date)) && data.status === PENDING)?.length - b.appointments?.filter(data => [EVALUATION, APPOINTMENT].includes(data.type) && moment().isBefore(moment(data.date)) && data.status === PENDING)?.length,
        render: appointments => appointments?.filter(a => [EVALUATION, APPOINTMENT].includes(a.type) && moment().isBefore(moment(a.date)) && a.status === PENDING)?.length,
      })
      columns.splice(7, 0, {
        title: intl.formatMessage(messages.countOfReferrals), dataIndex: 'appointments', key: 'countOfReferrals',
        sorter: (a, b) => a.appointments?.filter(data => data.type === CONSULTATION && moment().isAfter(moment(data.date)) && data.status === CLOSED)?.length - b.appointments?.filter(data => data.type === CONSULTATION && moment().isAfter(moment(data.date)) && data.status === CLOSED)?.length,
        render: appointments => appointments?.filter(a => a.type === CONSULTATION && moment().isAfter(moment(a.date)) && a.status === CLOSED)?.length,
      })
      columns.splice(8, 0, {
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
      })
      columns.splice(9, 0, {
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
            return 1;
          }
        },
        render: appointments => {
          const lastSession = appointments?.filter(a => [EVALUATION, APPOINTMENT, SUBSIDY].includes(a.type) && a.status === CLOSED)?.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b, {});
          return lastSession.date ? moment(lastSession.date).format('MM/DD/YYYY hh:mm A') : ''
        },
      })
    }

    const adminApprovedColumns = [
      {
        title: <span className="font-16">{intl.formatMessage(messages.studentName)}</span>,
        key: 'name',
        align: 'center',
        fixed: 'left',
        sorter: (a, b) => (a?.student?.firstName ?? '' + a?.student?.lastName ?? '').toLowerCase() > (b?.student?.firstName ?? '' + b?.student?.lastName ?? '').toLowerCase() ? 1 : -1,
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
                onClick={() => { clearFilters(); confirm(); }}
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
        onFilter: (value, record) => record.student?.firstName?.toLowerCase()?.includes((value).toLowerCase()) || record.student?.lastName?.toLowerCase()?.includes((value).toLowerCase()),
        onFilterDropdownOpenChange: visible => {
          if (visible) {
            setTimeout(() => this.searchInput.current?.select(), 100);
          }
        },
        render: (subsidy) => <span>{subsidy?.student.firstName ?? ''} {subsidy?.student.lastName ?? ''}</span>,
      },
      {
        title: <span className="font-16">{intl.formatMessage(msgCreateAccount.school)}</span>,
        key: 'school',
        align: 'center',
        filters: schools,
        onFilter: (value, record) => record.school?._id === value,
        sorter: (a, b) => (a?.school?.name ?? '').toLowerCase() > (b?.school?.name ?? '').toLowerCase() ? 1 : -1,
        render: (subsidy) => <span>{subsidy?.school?.name ?? ''}</span>,
      },
      {
        title: <span className="font-16">{intl.formatMessage(messages.studentGrade)}</span>,
        key: 'grade',
        align: 'center',
        filters: grades,
        onFilter: (value, record) => record.student?.currentGrade === value,
        sorter: (a, b) => (a?.student?.currentGrade ?? '').toLowerCase() > (b?.student?.currentGrade ?? '').toLowerCase() ? 1 : -1,
        render: (subsidy) => <span>{subsidy?.student.currentGrade}</span>
      },
      {
        title: <span className="font-16">{intl.formatMessage(messages.serviceRequested)}</span>,
        key: 'skillSet',
        align: 'center',
        filters: skills,
        onFilter: (value, record) => record.skillSet?._id === value,
        sorter: (a, b) => (a?.skillSet?.name ?? '').toLowerCase() > (b?.skillSet?.name ?? '').toLowerCase() ? 1 : -1,
        render: (subsidy) => <span>{subsidy?.skillSet.name}</span>
      },
      {
        title: <span className="font-16">{intl.formatMessage(msgCreateAccount.notes)}</span>,
        key: 'note',
        align: 'center',
        sorter: (a, b) => (a?.note ?? '').toLowerCase() > (b?.note ?? '').toLowerCase() ? 1 : -1,
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              name='SearchName'
              ref={this.searchInput}
              placeholder={`Search Notes`}
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
                onClick={() => { clearFilters(); confirm(); }}
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
        onFilter: (value, record) => record.note?.toLowerCase()?.includes((value).toLowerCase()) || record.note?.toLowerCase()?.includes((value).toLowerCase()),
        onFilterDropdownOpenChange: visible => {
          if (visible) {
            setTimeout(() => this.searchInput.current?.select(), 100);
          }
        },
        render: (subsidy) => <span>{subsidy?.note}</span>
      },
      {
        title: <span className="font-16">{intl.formatMessage(msgCreateAccount.provider)}</span>,
        key: 'provider',
        align: 'center',
        sorter: (a, b) => (a?.selectedProvider?.firstName ?? '' + a?.selectedProvider?.lastName ?? '').toLowerCase() > (b?.selectedProvider?.firstName ?? '' + b?.selectedProvider?.lastName ?? '').toLowerCase() ? 1 : -1,
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              name='SearchName'
              ref={this.searchInput}
              placeholder={`Search Provider Name`}
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
                onClick={() => { clearFilters(); confirm(); }}
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
        onFilter: (value, record) => record.selectedProvider?.firstName?.toLowerCase()?.includes((value).toLowerCase()) || record.selectedProvider?.lastName?.toLowerCase()?.includes((value).toLowerCase()),
        onFilterDropdownOpenChange: visible => {
          if (visible) {
            setTimeout(() => this.searchInput.current?.select(), 100);
          }
        },
        render: (subsidy) => (
          <div>{subsidy?.selectedProviderFromAdmin?.firstName ?? ''} {subsidy?.selectedProviderFromAdmin?.lastName ?? ''}</div>
        )
      },
      {
        title: <span className="font-16">{intl.formatMessage(messages.approvalDate)}</span>,
        key: 'approvalDate',
        align: 'center',
        sorter: (a, b) => a?.approvalDate > b?.approvalDate ? 1 : -1,
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              name='SearchName'
              ref={this.searchInput}
              placeholder={`Search Approval Date`}
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
                onClick={() => { clearFilters(); confirm(); }}
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
        onFilter: (value, record) => (moment(record.approvalDate).format('MM/DD/YYY hh:mm A') ?? '')?.toLowerCase()?.includes((value).toLowerCase()) || (moment(record.approvalDate).format('MM/DD/YYY hh:mm A') ?? '')?.toLowerCase()?.includes((value).toLowerCase()),
        onFilterDropdownOpenChange: visible => {
          if (visible) {
            setTimeout(() => this.searchInput.current?.select(), 100);
          }
        },
        render: (subsidy) => <span>{moment(subsidy?.approvalDate).format('MM/DD/YYYY hh:mm A')}</span>
      },
      {
        title: <span className="font-16">{intl.formatMessage(messages.recentSessionDate)}</span>,
        key: 'recentSessionDate',
        align: 'center',
        sorter: (a, b) => a?.appointments?.[0]?.date > b?.appointments?.[0]?.date ? 1 : -1,
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              name='SearchName'
              ref={this.searchInput}
              placeholder={`Search Recent Session Date`}
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
                onClick={() => { clearFilters(); confirm(); }}
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
        onFilter: (value, record) => (moment(record.appointments?.[0]?.date).format('MM/DD/YYY hh:mm A') ?? '')?.toLowerCase()?.includes((value).toLowerCase()) || (moment(record.appointments?.[0]?.date).format('MM/DD/YYY hh:mm A') ?? '')?.toLowerCase()?.includes((value).toLowerCase()),
        onFilterDropdownOpenChange: visible => {
          if (visible) {
            setTimeout(() => this.searchInput.current?.select(), 100);
          }
        },
        render: (subsidy) => <span>{subsidy?.appointments?.length ? moment(subsidy?.appointments?.[0]?.date).format('MM/DD/YYYY hh:mm A') : ''}</span>
      },
      {
        title: <span className="font-16">{intl.formatMessage(messages.HMGHExpensePerSession)}</span>,
        key: 'HMGHExpensePerSession',
        align: 'center',
        sorter: (a, b) => a?.pricePerSession > b?.pricePerSession ? 1 : -1,
        render: (subsidy) => <span>{subsidy?.pricePerSession ?? ''}</span>
      },
      {
        title: <span className="font-16">{intl.formatMessage(messages.totalHMGHExpense)}</span>,
        key: 'totalHMGHExpense',
        align: 'center',
        sorter: (a, b) => a?.pricePerSession * a?.numberOfSessions > b?.pricePerSession * b?.numberOfSessions ? 1 : -1,
        render: (subsidy) => <span>{subsidy?.pricePerSession * subsidy?.numberOfSessions ? subsidy?.pricePerSession * subsidy?.numberOfSessions : ''}</span>
      },
      {
        title: <span className="font-16">{intl.formatMessage(messages.status)}</span>,
        key: 'status',
        align: 'center',
        fixed: 'right',
        sorter: (a, b) => a?.appointments?.length > b?.appointments?.length ? 1 : -1,
        render: (subsidy) => <span>{subsidy?.appointments?.length ?? 0} / {subsidy?.numberOfSessions}</span>
      },
    ];

    const modalDependentProps = {
      visible: visibleDependent,
      onCancel: this.onCloseModalDependent,
      dependent: selectedDependent,
    }

    const modalSubsidyProps = {
      visible: visibleSubsidyProgress,
      onSubmit: this.onCloseModalSubsidy,
      onCancel: this.onCloseModalSubsidy,
      subsidyId: selectedSubsidyId,
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
          <div className='font-16 font-500'>{intl.formatMessage(msgMainHeader.dependentList)}</div>
          <Divider />
        </div>
        <Table
          bordered
          size='middle'
          dataSource={dependents}
          columns={columns}
          onRow={(dependent) => {
            return {
              onClick: (e) => e.target.className != 'action' && this.handleClickRow(dependent),
              onDoubleClick: (e) => e.target.className != 'action' && this.handleClickRow(dependent),
            }
          }}
        />
        {auth.user?.role === 30 ? (
          <div>
            <div className='div-title-admin'>
              <div className='font-16 font-500'>{intl.formatMessage(msgCreateAccount.subsidyRequest)}</div>
              <Divider />
            </div>
            <CSVLink onClick={this.exportToExcel} data={csvData} filename="Approved Requests"><Button type='primary' className='inline-flex items-center gap-2' icon={<FaFileDownload size={24} />}>Download CSV</Button></CSVLink>
            <Table
              bordered
              size='middle'
              dataSource={subsidyRequests?.map((s, index) => ({ ...s, key: index }))}
              columns={adminApprovedColumns}
              scroll={{ x: 1300 }}
              onRow={(subsidy) => ({
                onClick: (e) => e.target.className !== 'btn-blue' && this.onShowModalSubsidy(subsidy?._id),
                onDoubleClick: (e) => e.target.className !== 'btn-blue' && this.onShowModalSubsidy(subsidy?._id),
              })}
              className='mt-1 pb-10'
              pagination={false}
            />
          </div>
        ) : null}
        {visibleDependent && <ModalDependentDetail {...modalDependentProps} />}
        {visibleSubsidyProgress && <ModalSubsidyProgress {...modalSubsidyProps} />}
        {visibleBalance && <ModalBalance {...modalBalanceProps} />}
        <PageLoading loading={loading} isBackground={true} />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  subsidyRequests: state.appointments.dataSubsidyRequests,
})

export default compose(connect(mapStateToProps, { getSubsidyRequests }))(PrivateNote);