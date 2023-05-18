import React, { createRef } from 'react';
import { Divider, Table, Space, Input, Button } from 'antd';
import intl from 'react-intl-universal';
import { SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { CSVLink } from "react-csv";
import { FaFileDownload } from 'react-icons/fa';

import { APPOINTMENT, CLOSED, CONSULTATION, EVALUATION, PENDING, routerLinks } from '../../constant';
import { ModalDependentDetail, ModalSubsidyProgress } from '../../../components/Modal';
import msgMainHeader from '../../../components/MainHeader/messages';
import messages from '../../Dashboard/messages';
import msgCreateAccount from '../../Sign/CreateAccount/messages';
import request from '../../../utils/api/request';
import { deletePrivateNote, getDependents } from '../../../utils/api/apiList';
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
    };
    this.searchInput = createRef(null);
  }

  componentDidMount() {
    this.setState({ loading: true });
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
        console.log(data);
        this.setState({ dependents: [], loading: false });
      }
    }).catch(err => {
      console.log('get dependents error ---', err);
      this.setState({ dependents: [], loading: false });
    })
  }

  handleNewUser = () => {
    this.props.history.push(routerLinks.CreateAccount);
  }

  onCloseModalDependent = () => {
    this.setState({ visibleDependent: false });
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
      "HMGH expense per session": r.priceForSession ?? '',
      "# of approved sessions": r.numberOfSessions ?? '',
      "# of sessions paid to DATE": r?.appointments?.filter(a => a.status === CLOSED && a.isPaid)?.length ?? '',
      "Total HMGH expense": r.priceForSession * r.numberOfSessions,
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

  render() {
    const { csvData, dependents, visibleDependent, selectedDependent, loading, visibleSubsidyProgress, selectedSubsidyId } = this.state;
    const { auth, subsidyRequests } = this.props;
    const columns = [
      {
        title: 'Full Name', key: 'name',
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
        onFilter: (value, record) => record['firstName']?.toString()?.toLowerCase()?.includes((value).toLowerCase()) || record['lastName']?.toString()?.toLowerCase()?.includes((value).toLowerCase()),
        onFilterDropdownOpenChange: visible => {
          if (visible) {
            setTimeout(() => this.searchInput.current?.select(), 100);
          }
        },
      },
      { title: 'Age', dataIndex: 'birthday', key: 'age', sorter: (a, b) => a.birthday > b.birthday ? 1 : -1, render: (birthday) => moment().year() - moment(birthday).year() },
      { title: 'Grade', dataIndex: 'currentGrade', key: 'grade' },
      { title: 'School', dataIndex: 'school', key: 'school', render: school => school?.name },
      { title: 'Count of Sessions Past', dataIndex: 'appointments', key: 'countOfSessionsPast', render: appointments => appointments?.filter(a => [EVALUATION, APPOINTMENT].includes(a.type) && moment().isAfter(moment(a.date)) && a.status == CLOSED)?.length },
      { title: 'Count of Sessions Future', dataIndex: 'appointments', key: 'countOfSessionsFuture', render: appointments => appointments?.filter(a => [EVALUATION, APPOINTMENT].includes(a.type) && moment().isBefore(moment(a.date)) && a.status == PENDING)?.length },
      { title: 'Count of Referrals', dataIndex: 'appointments', key: 'countOfReferrals', render: appointments => appointments?.filter(a => a.type === CONSULTATION && moment().isAfter(moment(a.date)) && a.status == CLOSED)?.length },
      { title: 'Subsidy', dataIndex: 'subsidy', key: 'subsidy', render: subsidy => subsidy?.length ? subsidy.length : 'No Subsidy' },
    ];
    const skills = JSON.parse(JSON.stringify(auth.skillSet ?? []))?.map(skill => { skill['text'] = skill.name, skill['value'] = skill._id; return skill; });
    const grades = JSON.parse(JSON.stringify(auth.academicLevels ?? []))?.slice(6)?.map(level => ({ text: level, value: level }));
    const schools = JSON.parse(JSON.stringify(auth.schools ?? []))?.map(s => s?.schoolInfo)?.map(school => { school['text'] = school.name, school['value'] = school._id; return school; });

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
        sorter: (a, b) => a?.priceForSession > b?.priceForSession ? 1 : -1,
        render: (subsidy) => <span>{subsidy?.priceForSession ?? ''}</span>
      },
      {
        title: <span className="font-16">{intl.formatMessage(messages.totalHMGHExpense)}</span>,
        key: 'totalHMGHExpense',
        align: 'center',
        sorter: (a, b) => a?.priceForSession * a?.numberOfSessions > b?.priceForSession * b?.numberOfSessions ? 1 : -1,
        render: (subsidy) => <span>{subsidy?.priceForSession * subsidy?.numberOfSessions ? subsidy?.priceForSession * subsidy?.numberOfSessions : ''}</span>
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
              onClick: (e) => e.target.className != 'btn-blue action' && this.handleClickRow(dependent),
              onDoubleClick: (e) => e.target.className != 'btn-blue action' && this.handleClickRow(dependent),
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