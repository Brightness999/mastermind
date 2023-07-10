import React, { createRef } from 'react';
import { Table, Space, Button, Input, message, Pagination, Popconfirm } from 'antd';
import { CheckCircleFilled, SearchOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import { compose } from 'redux';
import moment from 'moment';
import 'moment/locale/en-au';
import { CSVLink } from "react-csv";
import { FaFileDownload } from 'react-icons/fa';

import request from 'utils/api/request';
import { claimConsultation, getConsultationList } from 'utils/api/apiList';
import PageLoading from 'components/Loading/PageLoading';
import { CANCELLED, CLOSED, DECLINED, NOSHOW, PENDING } from 'routes/constant';

class UnclaimedConsultationRequest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      consultationList: [],
      skillSet: [],
      loading: false,
      csvData: [],
      pageSize: 10,
      pageNumber: 1,
      totalSize: 0,
    };
    this.searchInput = createRef(null);
  }

  componentDidMount() {
    const skillSet = JSON.parse(JSON.stringify(this.props.auth.skillSet));
    this.setState({ skillSet: skillSet?.map(skill => { skill['text'] = skill.name, skill['value'] = skill._id; return skill; }) });
    this.getConsultations();
  }

  handleChangePagination = (newPageNumber, newPageSize) => {
    this.setState({ pageNumber: newPageNumber, pageSize: newPageSize });
    this.getConsultations(newPageNumber, newPageSize);
  }

  getConsultations = (pageNumber = 1, pageSize = 10) => {
    this.setState({ loading: true });
    request.post(getConsultationList, { pageNumber, pageSize, isClaimed: false }).then(result => {
      this.setState({ loading: false });
      const { success, data } = result;
      if (success) {
        this.setState({
          consultationList: data?.consultations?.map((consultation, i) => {
            consultation['key'] = i; return consultation;
          }) ?? [],
          totalSize: data?.total || 0,
        });
      }
    }).catch(err => {
      message.error(err.message);
      this.setState({ loading: false });
    })
  }

  exportToExcel = () => {
    const { user } = this.props.auth;
    const { consultationList } = this.state;
    const data = consultationList?.map(c => ({
      "Student Name": `${c?.dependent?.firstName ?? ''} ${c?.dependent?.lastName ?? ''}`,
      "Referrer": c?.consultant?.referredToAs ?? '',
      "Student Grade": c?.dependent?.currentGrade,
      "Service Requested": c?.skillSet?.name,
      "PhoneNumber/Google Meet": c?.meetingLink ? c.meetingLink : c.phoneNumber ? c.phoneNumber : '',
      "Date": c?.date ? moment(c?.date).format('MM/DD/YYYY hh:mm A') : '',
      "Status": c.status === PENDING ? 'Pending' : c.status === CLOSED ? 'Closed' : c.status === DECLINED ? 'Declined' : c.status === CANCELLED ? 'Canceled' : c.status === NOSHOW ? 'No Show' : ''
    }))
    this.setState({ csvData: data });
    this.props.socket.emit("action_tracking", {
      user: user?._id,
      action: "Consultation Request",
      description: "Downloaded consultation requests",
    })
    return true;
  }

  handleTag = (consultation) => {
    const { auth, appointments } = this.props;
    const { pageNumber, pageSize } = this.state;

    if (appointments?.find(a => a?.consultant?._id === auth.user?.consultantInfo?._id && a.date === consultation?.date)) {
      message.warning("You already scheduled at this time.");
    } else {
      const appointmentDate = moment(consultation?.date);
      const ranges = auth.user?.consultantInfo?.manualSchedule?.filter(a => a.dayInWeek === appointmentDate.day() && appointmentDate.isBetween(moment().set({ years: a.fromYear, months: a.fromMonth, dates: a.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }), moment().set({ years: a.toYear, months: a.toMonth, dates: a.toDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 0 })));

      if (ranges?.length) {
        request.post(claimConsultation, { appointmentId: consultation?._id })
          .then(res => {
            if (res.success) {
              if (res.data.message) {
                message.warning(res.data.message);
              } else {
                message.success("Claimed successfully");
                this.getConsultations(pageNumber, pageSize);
              }
            }
          })
          .catch(err => message.error(err.message));
      } else {
        message.warning("You are not available at this event time.");
      }
    }
  }

  render() {
    const { pageNumber, pageSize, totalSize, consultationList, skillSet, loading, csvData } = this.state;
    const csvHeaders = ["Student Name", "Referrer", "Student Grade", "Service Requested", "PhoneNumber/Google Meet", "Date"];
    const columns = [
      {
        title: 'Dependent', key: 'dependent', fixed: 'left',
        sorter: (a, b) => a.dependent?.firstName + a.dependent?.lastName > b.dependent?.firstName + b.dependent?.lastName ? 1 : -1,
        render: (appointment) => `${appointment?.dependent.firstName ?? ''} ${appointment?.dependent.lastName ?? ''}`,
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
        onFilter: (value, record) => record.dependent?.firstName?.toString()?.toLowerCase()?.includes((value).toLowerCase()) || record.dependent?.lastName?.toString()?.toLowerCase()?.includes((value).toLowerCase()),
        onFilterDropdownOpenChange: visible => {
          if (visible) {
            setTimeout(() => this.searchInput.current?.select(), 100);
          }
        },
      },
      { title: 'Subsidy Request', key: 'subsidy', dataIndex: 'subsidy', align: 'center', render: (subsidy) => !!subsidy ? <CheckCircleFilled className='text-green500' /> : null },
      { title: 'Age', key: 'age', width: 100, sorter: (a, b) => a.dependent?.birthday > b.dependent?.birthday ? 1 : -1, render: (appointment) => moment().year() - moment(appointment.dependent?.birthday).year() },
      { title: 'Grade', key: 'grade', render: (appointment) => appointment.dependent?.currentGrade },
      { title: 'School', key: 'school', render: appointment => appointment?.dependent?.school?.name },
      {
        title: 'Service', dataIndex: 'skillSet', key: 'skillSet', filters: skillSet,
        onFilter: (value, record) => record.skillSet?._id == value,
        render: skill => skill?.name,
      },
      {
        title: <span className='whitespace-nowrap'>PhoneNumber / Google Meet</span>,
        render: (appointment) => appointment?.phoneNumber ? appointment?.phoneNumber : appointment?.meetingLink,
      },
      { title: 'Referral Date', dataIndex: 'date', key: 'date', type: 'datetime', sorter: (a, b) => a.date > b.date ? 1 : -1, render: (date) => moment(date).format('MM/DD/YYYY hh:mm a') },
      { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => status === PENDING ? 'Pending' : status === CLOSED ? 'Closed' : status === DECLINED ? 'Declined' : status === CANCELLED ? 'Canceled' : status === NOSHOW ? 'No Show' : '' },
      {
        title: 'Action', key: 'action', fixed: 'right', render: (consultation) => consultation.status === PENDING ? (
          <Popconfirm
            title="Are you sure to tag this consultation?"
            onConfirm={() => this.handleTag(consultation)}
            okText="Yes"
            cancelText="No"
          ><span className='text-primary text-underline'>Tag</span></Popconfirm>
        ) : null
      },
    ];

    return (
      <div>
        <CSVLink onClick={this.exportToExcel} data={csvData} headers={csvHeaders} filename="Approved Requests">
          <Button type='primary' className='inline-flex items-center gap-2 mb-10' icon={<FaFileDownload size={24} />}>
            Download CSV
          </Button>
        </CSVLink>
        <Space direction='vertical' className='flex'>
          <Table bordered size='middle' pagination={false} dataSource={consultationList} columns={columns} scroll={{ x: 1200 }} />
          <Pagination current={pageNumber} total={totalSize} pageSize={pageSize} pageSizeOptions={true} onChange={this.handleChangePagination} />
        </Space>
        <PageLoading loading={loading} isBackground={true} />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  appointments: state.appointments.dataAppointments,
});

export default compose(connect(mapStateToProps))(UnclaimedConsultationRequest);