import { Divider, Table, Space, Button, Input } from 'antd';
import { routerLinks } from '../../../constant';
import React, { createRef } from 'react';
import intl from 'react-intl-universal';
import mgsSidebar from '../../../../components/SideBar/messages';
import { checkPermission } from '../../../../utils/auth/checkPermission';
import request from '../../../../utils/api/request';
import { SearchOutlined } from '@ant-design/icons';
import { getConsultationList } from '../../../../utils/api/apiList';
import { connect } from 'react-redux';
import { compose } from 'redux';
import moment from 'moment';

class ConsultationRequest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      consultationList: [],
      skillSet: [],
    };
    this.searchInput = createRef(null);
  }

  componentDidMount() {
    if (!!localStorage.getItem('token') && localStorage.getItem('token').length > 0) {
      checkPermission().then(loginData => {
        loginData.role < 900 && this.props.history.push(routerLinks.Dashboard);
        const skillSet = JSON.parse(JSON.stringify(this.props.auth.skillSet));
        this.setState({ skillSet: skillSet?.map(skill => { skill['text'] = skill.name, skill['value'] = skill._id; return skill; }) });
        request.post(getConsultationList).then(result => {
          const { success, data } = result;
          if (success) {
            this.setState({
              consultationList: data?.map((consultation, i) => {
                consultation['key'] = i; return consultation;
              }) ?? []
            });
          }
        })
      }).catch(err => {
        console.log(err);
        this.props.history.push('/');
      })
    }
  }

  render() {
    const { consultationList, skillSet } = this.state;
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
      { title: 'Age', key: 'age', sorter: (a, b) => a.dependent?.birthday > b.dependent?.birthday ? 1 : -1, render: (appointment) => moment().diff(moment(appointment.dependent?.birthday), 'years') },
      { title: 'Grade', key: 'grade', render: (appointment) => appointment.dependent?.currentGrade },
      { title: 'School', key: 'school', render: appointment => appointment?.dependent?.school?.name },
      {
        title: 'Skill', dataIndex: 'skillSet', key: 'skillSet', filters: skillSet,
        onFilter: (value, record) => record.skillSet?._id == value,
        render: skill => skill?.name,
      },
      { title: 'Referral Date', dataIndex: 'date', key: 'date', type: 'datetime', sorter: (a, b) => a.date > b.date ? 1 : -1, render: (date) => moment(date).format('MM/DD/YYYY hh:mm a') },
    ];

    return (
      <div className="full-layout page usermanager-page">
        <div className='div-title-admin'>
          <p className='font-16 font-500'>{intl.formatMessage(mgsSidebar.flagList)}</p>
          <Divider />
        </div>
        <Table bordered size='middle' dataSource={consultationList} columns={columns} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return ({ auth: state.auth });
}

export default compose(connect(mapStateToProps))(ConsultationRequest);