import React, { createRef } from 'react';
import { Divider, Table, Space, Button, Input, message } from 'antd';
import intl from 'react-intl-universal';
import { SearchOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import { compose } from 'redux';
import moment from 'moment';
import { CSVLink } from "react-csv";
import { FaFileDownload } from 'react-icons/fa';

import mgsSidebar from '../../../../components/SideBar/messages';
import request from '../../../../utils/api/request';
import { getConsultationList } from '../../../../utils/api/apiList';
import PageLoading from '../../../../components/Loading/PageLoading';

class ConsultationRequest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      consultationList: [],
      skillSet: [],
      loading: false,
      csvData: [],
    };
    this.searchInput = createRef(null);
  }

  componentDidMount() {
    this.setState({ loading: true });
    const skillSet = JSON.parse(JSON.stringify(this.props.auth.skillSet));
    this.setState({ skillSet: skillSet?.map(skill => { skill['text'] = skill.name, skill['value'] = skill._id; return skill; }) });
    request.post(getConsultationList).then(result => {
      this.setState({ loading: false });
      const { success, data } = result;
      if (success) {
        this.setState({
          consultationList: data?.map((consultation, i) => {
            consultation['key'] = i; return consultation;
          }) ?? []
        });
      }
    }).catch(err => {
      message.error(err.message);
      this.setState({ loading: false });
    })
  }

  exportToExcel = () => {
    const { consultationList } = this.state;
    const data = consultationList?.map(c => ({
      "Student Name": `${c?.dependent?.firstName ?? ''} ${c?.dependent?.lastName ?? ''}`,
      "Referrer": c?.consultant?.referredToAs ?? '',
      "Student Grade": c?.dependent?.currentGrade,
      "Service Requested": c?.skillSet?.name,
      "PhoneNumber/Google Meet": c?.meetingLink ? c.meetingLink : c.phoneNumber ? c.phoneNumber : '',
      "Date": c?.date ? moment(c?.date).format('MM/DD/YYYY hh:mm A') : '',
    }))
    this.setState({ csvData: data });
    return true;
  }

  render() {
    const { consultationList, skillSet, loading, csvData } = this.state;
    const csvHeaders = ["Student Name", "Referrer", "Student Grade", "Service Requested", "PhoneNumber/Google Meet", "Date"];
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
      { title: 'Age', key: 'age', sorter: (a, b) => a.dependent?.birthday > b.dependent?.birthday ? 1 : -1, render: (appointment) => moment().year() - moment(appointment.dependent?.birthday).year() },
      { title: 'Grade', key: 'grade', render: (appointment) => appointment.dependent?.currentGrade },
      { title: 'School', key: 'school', render: appointment => appointment?.dependent?.school?.name },
      {
        title: 'Service', dataIndex: 'skillSet', key: 'skillSet', filters: skillSet,
        onFilter: (value, record) => record.skillSet?._id == value,
        render: skill => skill?.name,
      },
      {
        title: 'PhoneNumber / Google Meet',
        render: (appointment) => appointment?.phoneNumber ? appointment?.phoneNumber : appointment?.meetingLink,
      },
      { title: 'Referral Date', dataIndex: 'date', key: 'date', type: 'datetime', sorter: (a, b) => a.date > b.date ? 1 : -1, render: (date) => moment(date).format('MM/DD/YYYY hh:mm a') },
    ];

    return (
      <div className="full-layout page usermanager-page">
        <div className='div-title-admin'>
          <p className='font-16 font-500'>{intl.formatMessage(mgsSidebar.flagList)}</p>
          <Divider />
        </div>
        <CSVLink onClick={this.exportToExcel} data={csvData} headers={csvHeaders} filename="Approved Requests">
          <Button type='primary' className='inline-flex items-center gap-2 mb-10' icon={<FaFileDownload size={24} />}>
            Download CSV
          </Button>
        </CSVLink>
        <Table bordered size='middle' dataSource={consultationList} columns={columns} />
        <PageLoading loading={loading} isBackground={true} />
      </div>
    );
  }
}

const mapStateToProps = state => ({ auth: state.auth });

export default compose(connect(mapStateToProps))(ConsultationRequest);