import React, { createRef, useEffect, useState } from 'react';
import { Table, Space, Input, Button, Popover, Divider } from 'antd';
import intl from 'react-intl-universal';
import { SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import { connect } from 'react-redux';
import { compose } from 'redux';

import messages from 'routes/User/Dashboard/messages';
import msgCreateAccount from 'routes/Sign/CreateAccount/messages';
import mgsSidebar from 'components/SideBar/messages';
import { getSubsidyRequests, setSubsidyRequests } from "src/redux/features/appointmentsSlice";
import { ModalNewSubsidyRequest, ModalSubsidyProgress } from 'components/Modal';

const SubsidyRequests = (props) => {
  const { user, skillSet, academicLevels, schools } = props.auth;
  const skills = JSON.parse(JSON.stringify(skillSet ?? []))?.map(skill => { skill['text'] = skill.name, skill['value'] = skill._id; return skill; });
  const grades = JSON.parse(JSON.stringify(academicLevels ?? []))?.slice(6)?.map(level => ({ text: level, value: level }));
  const schoolInfos = JSON.parse(JSON.stringify(schools ?? []))?.map(s => s?.schoolInfo)?.map(school => { school['text'] = school.name, school['value'] = school._id; return school; });
  const [visibleSubsidy, setVisibleSubsidy] = useState(false);
  const [visibleNewSubsidy, setVisibleNewSubsidy] = useState(false);
  const [selectedSubsidyId, setSelectedSubsidyId] = useState(undefined);
  const [requests, setRequests] = useState(props.listSubsidy);
  const searchInput = createRef(null);
  const columns = [
    {
      title: <span className="font-16">{intl.formatMessage(messages.studentName)}</span>,
      key: 'name', align: 'center', fixed: 'left',
      sorter: (a, b) => (a?.student?.firstName ?? '' + a?.student?.lastName ?? '').toLowerCase() > (b?.student?.firstName ?? '' + b?.student?.lastName ?? '').toLowerCase() ? 1 : -1,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            name='SearchName'
            ref={searchInput}
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
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
      render: (subsidy) => `${subsidy?.student.firstName ?? ''} ${subsidy?.student.lastName ?? ''}`,
    },
    {
      title: <span className="font-16">{intl.formatMessage(msgCreateAccount.school)}</span>,
      key: 'school',
      align: 'center',
      filters: schoolInfos,
      onFilter: (value, record) => record.school?._id === value,
      sorter: (a, b) => (a?.school?.name ?? '').toLowerCase() > (b?.school?.name ?? '').toLowerCase() ? 1 : -1,
      render: (subsidy) => subsidy?.school?.name || (
        <Popover content={(<div>
          <div><span className='font-700'>Name:</span> {subsidy?.student?.otherName}</div>
          <div><span className='font-700'>Phone:</span> {subsidy?.student?.otherContactNumber}</div>
          <div><span className='font-700'>Notes:</span> {subsidy?.student?.otherNotes}</div>
        </div>)} trigger="click">
          <span className='text-primary text-underline cursor action'>Other</span>
        </Popover>
      ),
    },
    {
      title: <span className="font-16">{intl.formatMessage(messages.studentGrade)}</span>,
      key: 'grade',
      align: 'center',
      filters: grades,
      onFilter: (value, record) => record.student?.currentGrade === value,
      sorter: (a, b) => (a?.student?.currentGrade ?? '').toLowerCase() > (b?.student?.currentGrade ?? '').toLowerCase() ? 1 : -1,
      render: (subsidy) => subsidy?.student.currentGrade,
    },
    {
      title: <span className="font-16">{intl.formatMessage(messages.serviceRequested)}</span>,
      key: 'skillSet',
      align: 'center',
      filters: skills,
      onFilter: (value, record) => record.skillSet?._id === value,
      sorter: (a, b) => (a?.skillSet?.name ?? '').toLowerCase() > (b?.skillSet?.name ?? '').toLowerCase() ? 1 : -1,
      render: (subsidy) => subsidy?.skillSet.name,
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
            ref={searchInput}
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
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
      render: (subsidy) => subsidy?.note,
    },
    {
      title: <span className="font-16">Request Status</span>,
      key: 'requeststatus',
      align: 'center',
      filters: [
        { text: 'Pending', value: 0 },
        { text: 'School Approved', value: 1 },
        { text: 'School Declined', value: 2 },
        { text: 'Admin Pre-Approved', value: 3 },
        { text: 'Admin Declined', value: 4 },
        { text: 'Admin Approved', value: 5 },
      ],
      onFilter: (value, record) => record.status === value,
      render: (subsidy) => subsidy?.status === 0 ? 'Pending' : subsidy?.status === 1 ? 'School Approved' : subsidy?.status === 2 ? subsidy?.isAppeal === 1 ? 'School Appealed' : 'School Declined' : subsidy?.status === 3 ? 'Admin Pre-Approved' : subsidy?.status === 4 ? subsidy?.isAppeal === 1 ? 'Admin Appealed' : 'Admin Declined' : subsidy?.status === 5 ? 'Admin Approved' : '',
    },
    {
      title: <span className="font-16">{intl.formatMessage(msgCreateAccount.provider)}</span>,
      key: 'provider',
      align: 'center',
      sorter: (a, b) => {
        const prevName = a?.selectedProviderFromAdmin ? a.selectedProviderFromAdmin.firstName + a.selectedProviderFromAdmin.lastName : a.otherProvider;
        const nextName = b?.selectedProviderFromAdmin ? b.selectedProviderFromAdmin.firstName + b.selectedProviderFromAdmin.lastName : b.otherProvider;
        if (prevName.toLowerCase() > nextName.toLowerCase())
          return 1;
        else
          return -1;
      },
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            name='SearchName'
            ref={searchInput}
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
      onFilter: (value, record) => record.selectedProviderFromAdmin?.firstName?.toLowerCase()?.includes((value).toLowerCase()) || record.selectedProviderFromAdmin?.lastName?.toLowerCase()?.includes((value).toLowerCase()) || record.otherProvider?.toLowerCase()?.includes((value).toLowerCase()),
      onFilterDropdownOpenChange: visible => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
      render: (subsidy) => (
        subsidy?.selectedProviderFromAdmin ? `${subsidy?.selectedProviderFromAdmin?.firstName ?? ''} ${subsidy?.selectedProviderFromAdmin?.lastName ?? ''}`
          : subsidy?.otherProvider
      ),
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
            ref={searchInput}
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
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
      render: (subsidy) => moment(subsidy?.approvalDate).format('MM/DD/YYYY hh:mm A'),
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
            ref={searchInput}
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
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
      render: (subsidy) => subsidy?.appointments?.length ? moment(subsidy?.appointments?.[0]?.date).format('MM/DD/YYYY hh:mm A') : '',
    },
    {
      title: <span className="font-16">{intl.formatMessage(messages.HMGHExpensePerSession)}</span>,
      key: 'HMGHExpensePerSession',
      align: 'center',
      sorter: (a, b) => a?.pricePerSession > b?.pricePerSession ? 1 : -1,
      render: (subsidy) => subsidy?.pricePerSession ?? '',
    },
    {
      title: <span className="font-16">{intl.formatMessage(messages.totalHMGHExpense)}</span>,
      key: 'totalHMGHExpense',
      align: 'center',
      sorter: (a, b) => a?.pricePerSession * a?.numberOfSessions > b?.pricePerSession * b?.numberOfSessions ? 1 : -1,
      render: (subsidy) => subsidy?.pricePerSession * subsidy?.numberOfSessions ? subsidy?.pricePerSession * subsidy?.numberOfSessions : '',
    },
    {
      title: <span className="font-16">{intl.formatMessage(messages.status)}</span>,
      key: 'status',
      align: 'center',
      fixed: 'right',
      sorter: (a, b) => a?.appointments?.length > b?.appointments?.length ? 1 : -1,
      render: (subsidy) => `${subsidy?.appointments?.length ?? 0} / ${subsidy?.numberOfSessions}`,
    },
  ];

  const onShowModalSubsidy = (subsidyId) => {
    setSelectedSubsidyId(subsidyId);
    setVisibleSubsidy(true);
  }

  const onCloseModalSubsidy = () => {
    setVisibleSubsidy(false);
    setSelectedSubsidyId(undefined);
  };

  const onShowModalNewSubsidy = () => {
    setVisibleNewSubsidy(true);
  }

  const onCloseModalNewSubsidy = () => {
    setVisibleNewSubsidy(false);
  };

  const onSubmitModalNewSubsidy = () => {
    onCloseModalNewSubsidy();
    props.getSubsidyRequests({ role: user.role });
  };

  useEffect(() => {
    setRequests(props.listSubsidy);
  }, [props.listSubsidy]);

  useEffect(() => {
    props.getSubsidyRequests({ role: user.role });
  }, [])

  const modalSubsidyProps = {
    visible: visibleSubsidy,
    onSubmit: onCloseModalSubsidy,
    onCancel: onCloseModalSubsidy,
    subsidyId: selectedSubsidyId,
  }

  const modalNewSubsidyProps = {
    visible: visibleNewSubsidy,
    onSubmit: onSubmitModalNewSubsidy,
    onCancel: onCloseModalNewSubsidy,
  };

  return (
    <div className="full-layout page subsidymanager-page">
      <div className='div-title-admin'>
        <div className='font-16 font-500'>{intl.formatMessage(mgsSidebar.subsidyManager)}</div>
        <Divider />
      </div>
      <div className='mb-20'>
        <Button type='primary' onClick={onShowModalNewSubsidy}>+ Create New Subsidy Request</Button>
      </div>
      <Table
        bordered
        size='middle'
        dataSource={requests?.map((s, index) => ({ ...s, key: index }))}
        columns={columns}
        scroll={{ x: true }}
        onRow={(subsidy) => ({
          onClick: (e) => e.target.className.includes('ant-table-cell') && onShowModalSubsidy(subsidy?._id),
          onDoubleClick: (e) => e.target.className.includes('ant-table-cell') && onShowModalSubsidy(subsidy?._id),
        })}
        className='mt-1 pb-10'
      />
      {visibleSubsidy && <ModalSubsidyProgress {...modalSubsidyProps} />}
      {visibleNewSubsidy && <ModalNewSubsidyRequest {...modalNewSubsidyProps} />}
    </div>
  )
}

const mapStateToProps = state => ({
  auth: state.auth,
  listSubsidy: state.appointments.dataSubsidyRequests,
});

export default compose(connect(mapStateToProps, { getSubsidyRequests, setSubsidyRequests }))(SubsidyRequests);