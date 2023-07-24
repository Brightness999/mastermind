import React, { createRef } from 'react';
import { Table, Space, Button, Input, message, Pagination, Popconfirm, Checkbox, Popover } from 'antd';
import { CheckCircleFilled, FilterFilled, SearchOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import { compose } from 'redux';
import moment from 'moment';
import 'moment/locale/en-au';
import { CSVLink } from "react-csv";
import { FaFileDownload } from 'react-icons/fa';
import intl from "react-intl-universal";

import msgDrawer from 'components/DrawerDetail/messages';
import request from 'utils/api/request';
import { claimConsultation, getConsultationList } from 'utils/api/apiList';
import PageLoading from 'components/Loading/PageLoading';
import { CANCELLED, CLOSED, DECLINED, NOSHOW, PENDING } from 'routes/constant';
import { ModalCurrentReferralService } from 'components/Modal';
import DrawerDetail from 'components/DrawerDetail';

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
      searchDependentName: '',
      selectedGrades: [],
      selectedSchools: [],
      selectedServices: [],
      visibleCurrentReferral: false,
      selectedConsultation: {},
      visibleDrawer: false,
    };
    this.searchInput = createRef(null);
  }

  componentDidMount() {
    const skillSet = JSON.parse(JSON.stringify(this.props.auth.skillSet));
    this.setState({ skillSet: skillSet?.map(skill => { skill['label'] = skill.name, skill['value'] = skill._id; return skill; }) });
    this.getConsultations();
  }

  handleChangePagination = (newPageNumber, newPageSize) => {
    this.setState({ pageNumber: newPageNumber, pageSize: newPageSize }, () => {
      this.getConsultations();
    });
  }

  getConsultations = () => {
    this.setState({ loading: true });
    const { pageNumber, pageSize, searchDependentName, selectedGrades, selectedSchools, selectedServices } = this.state;
    const postData = {
      pageNumber, pageSize,
      isClaimed: false,
      name: searchDependentName,
      grades: selectedGrades,
      schools: selectedSchools,
      services: selectedServices,
    }

    request.post(getConsultationList, postData).then(result => {
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
      "Referrer": c?.consultant?.consultantInfo?.referredToAs ?? '',
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
        message.warning("You are not available at this consultation time.");
      }
    }
  }


  openModalCurrent = (consultation) => {
    this.setState({ visibleCurrentReferral: true, selectedConsultation: consultation });
  }

  closeModalCurrent = () => {
    this.setState({ visibleCurrentReferral: false, selectedConsultation: {} });
  }

  submitModalCurrent = (data) => {
    this.setState({
      consultationList: this.state.consultationList?.map(consultation => {
        if (this.state.selectedConsultation._id === consultation?._id) {
          consultation.date = data.date;
          consultation.phoneNumber = data.phoneNumber;
          consultation.meetingLink = data.meetingLink;
          consultation.notes = data.note;
          return consultation;
        } else {
          return consultation;
        }
      })
    })
    this.closeModalCurrent();
  }

  onShowDrawerDetail = (consultation) => {
    this.setState({ selectedConsultation: { ...consultation, consultant: consultation?.consultant?.consultantInfo }, visibleDrawer: true });
  };

  onCloseDrawerDetail = () => {
    this.setState({ selectedConsultation: {}, visibleDrawer: false });
  };

  render() {
    const { pageNumber, pageSize, searchDependentName, selectedGrades, selectedSchools, selectedServices, totalSize, consultationList, skillSet, loading, csvData, visibleCurrentReferral, selectedConsultation, visibleDrawer } = this.state;
    const { auth } = this.props;
    const grades = JSON.parse(JSON.stringify(auth.academicLevels ?? []))?.slice(6)?.map(level => ({ label: level, value: level }));
    const schools = JSON.parse(JSON.stringify(auth.schools ?? []))?.map(school => ({ label: school.schoolInfo?.name, value: school.schoolInfo?._id })) || [];
    schools.push({ label: 'Other', value: 'other' });
    const csvHeaders = ["Student Name", "Referrer", "Student Grade", "Service Requested", "PhoneNumber/Google Meet", "Date"];
    const columns = [
      {
        title: 'Student', key: 'dependent', fixed: 'left',
        sorter: (a, b) => a.dependent?.firstName + a.dependent?.lastName > b.dependent?.firstName + b.dependent?.lastName ? 1 : -1,
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
                this.getConsultations();
              }}
              style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
              <Button
                type="primary"
                onClick={() => {
                  confirm();
                  this.getConsultations();
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
                    this.getConsultations();
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
        render: (appointment) => `${appointment?.dependent.firstName ?? ''} ${appointment?.dependent.lastName ?? ''}`,
      },
      { title: 'Subsidy Request', key: 'subsidy', dataIndex: 'subsidy', align: 'center', render: (subsidy) => !!subsidy ? <CheckCircleFilled className='text-green500' /> : null },
      { title: 'Age', key: 'age', width: 100, sorter: (a, b) => a.dependent?.birthday > b.dependent?.birthday ? 1 : -1, render: (appointment) => moment().year() - moment(appointment.dependent?.birthday).year() },
      {
        title: 'Grade', key: 'grade',
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
                this.getConsultations();
              }}>
                Filter
              </Button>
              <Button size="small" onClick={() => {
                this.setState({ selectedGrades: [] }, () => {
                  this.getConsultations();
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
        render: (appointment) => appointment.dependent?.currentGrade,
      },
      {
        title: 'School', key: 'school',
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
                this.getConsultations();
              }}>
                Filter
              </Button>
              <Button size="small" onClick={() => {
                this.setState({ selectedSchools: [] }, () => {
                  this.getConsultations();
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
        render: appointment => appointment?.dependent?.school?.name || (
          <Popover content={(<div>
            <div><span className='font-700'>Name:</span> {appointment?.dependent?.otherName}</div>
            <div><span className='font-700'>Phone:</span> {appointment?.dependent?.otherContactNumber}</div>
            <div><span className='font-700'>Notes:</span> {appointment?.dependent?.otherNotes}</div>
          </div>)} trigger="click">
            <span className='text-primary text-underline cursor action'>Other</span>
          </Popover>
        ),
      },
      {
        title: 'Service', dataIndex: 'skillSet', key: 'skillSet',
        filterDropdown: ({ setSelectedKeys, confirm, clearFilters }) => (
          <div className='service-dropdown'>
            <Checkbox.Group
              options={skillSet}
              value={selectedServices}
              onChange={(values) => {
                this.setState({ selectedServices: values });
                setSelectedKeys(values);
              }}
            />
            <div className='service-dropdown-footer'>
              <Button type="primary" size="small" onClick={() => {
                confirm();
                this.getConsultations();
              }}>
                Filter
              </Button>
              <Button size="small" onClick={() => {
                this.setState({ selectedServices: [] }, () => {
                  this.getConsultations();
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
        render: skill => skill?.name,
      },
      {
        title: <span className='whitespace-nowrap'>PhoneNumber / Google Meet</span>,
        render: (appointment) => appointment?.phoneNumber ? appointment?.phoneNumber : appointment?.meetingLink,
      },
      { title: 'Referral Date', dataIndex: 'date', key: 'date', type: 'datetime', sorter: (a, b) => a.date > b.date ? 1 : -1, render: (date) => moment(date).format('MM/DD/YYYY hh:mm a') },
      { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => status === PENDING ? 'Pending' : status === CLOSED ? 'Closed' : status === DECLINED ? 'Declined' : status === CANCELLED ? 'Canceled' : status === NOSHOW ? 'No Show' : '' },
      {
        title: 'Action', key: 'action', fixed: 'right', render: (consultation) => {
          const appointmentDate = moment(consultation?.date);

          return (
            <>
              {consultation?.status === PENDING && (moment().isBefore(appointmentDate) && auth.user?.role > 900) && (
                <span className='text-primary cursor text-underline' onClick={() => this.openModalCurrent(consultation)}>
                  {intl.formatMessage(msgDrawer.reschedule)}
                </span>
              )}
              {consultation?.status === PENDING && moment().isBefore(appointmentDate) && !consultation?.consultant?.consultantInfo?._id && auth.user?.role === 100 && auth.user?.consultantInfo?.manualSchedule?.find(a => a.dayInWeek === appointmentDate.day() && appointmentDate.isBetween(moment().set({ years: a.fromYear, months: a.fromMonth, dates: a.fromDate, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }), moment().set({ years: a.toYear, months: a.toMonth, dates: a.toDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 0 })) && appointmentDate.isBetween(appointmentDate.clone().set({ hours: a.openHour, minutes: a.openMin }), appointmentDate.clone().set({ hours: a.closeHour, minutes: a.closeMin }))) && (
                <Popconfirm
                  title="Are you sure to tag this consultation?"
                  onConfirm={() => this.handleTag(consultation)}
                  okText="Yes"
                  cancelText="No"
                >
                  <span className='text-primary text-underline'>Tag</span>
                </Popconfirm>
              )}
            </>
          )
        }
      },
    ];

    const modalCurrentReferralProps = {
      visible: visibleCurrentReferral,
      onSubmit: this.submitModalCurrent,
      onCancel: this.closeModalCurrent,
      event: selectedConsultation,
    }
    const drawerDetailProps = {
      visible: visibleDrawer,
      onClose: this.onCloseDrawerDetail,
      event: selectedConsultation,
      socket: this.props.socket,
    };

    return (
      <div>
        <CSVLink onClick={this.exportToExcel} data={csvData} headers={csvHeaders} filename="Approved Requests">
          <Button type='primary' className='inline-flex items-center gap-2 mb-10' icon={<FaFileDownload size={24} />}>
            Download CSV
          </Button>
        </CSVLink>
        <Space direction='vertical' className='flex'>
          <Table
            bordered
            size='middle'
            pagination={false}
            dataSource={consultationList}
            columns={columns}
            scroll={{ x: true }}
            onRow={(consultation) => ({
              onClick: (e) => e.target.className.includes('ant-table-cell') && this.onShowDrawerDetail(consultation),
              onDoubleClick: (e) => e.target.className.includes('ant-table-cell') && this.onShowDrawerDetail(consultation),
            })}
          />
          <Pagination current={pageNumber} total={totalSize} pageSize={pageSize} pageSizeOptions={true} onChange={this.handleChangePagination} />
        </Space>
        {visibleCurrentReferral && <ModalCurrentReferralService {...modalCurrentReferralProps} />}
        {visibleDrawer && <DrawerDetail {...drawerDetailProps} />}
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