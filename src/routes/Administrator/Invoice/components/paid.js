import React, { createRef } from 'react';
import { Table, Space, Input, Button } from 'antd';
import intl from 'react-intl-universal';
import { SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { ModalInvoice } from 'components/Modal';
import msgMainHeader from 'components/MainHeader/messages';
import messages from 'routes/Dashboard/messages';
import msgCreateAccount from 'routes/Sign/CreateAccount/messages';

class Paid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleInvoice: false,
      selectedInvoice: {},
    };
    this.searchInput = createRef(null);
  }

  openModalInvoice = (invoiceId) => {
    const { invoices } = this.props;
    this.setState({ visibleInvoice: true, selectedInvoice: invoices?.find(a => a._id === invoiceId) });
  }

  closeModalInvoice = () => {
    this.setState({ visibleInvoice: false, selectedInvoice: {} });
  }


  render() {
    const { selectedInvoice, visibleInvoice } = this.state;
    const { auth, invoices } = this.props;
    const grades = JSON.parse(JSON.stringify(auth.academicLevels ?? []))?.slice(6)?.map(level => ({ text: level, value: level }));
    const columns = [
      {
        title: intl.formatMessage(messages.studentName), dataIndex: 'dependent', key: 'name', fixed: 'left',
        sorter: (a, b) => (a.dependent.firstName || '' + a.dependent.lastName || '').toLowerCase() > (b.dependent.firstName || '' + b.dependent.lastName || '').toLowerCase() ? 1 : -1,
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
        onFilter: (value, record) => record.dependent.firstName?.toLowerCase()?.includes((value).toLowerCase()) || record.dependent.lastName?.toLowerCase()?.includes((value).toLowerCase()),
        onFilterDropdownOpenChange: visible => {
          if (visible) {
            setTimeout(() => this.searchInput.current?.select(), 100);
          }
        },
        render: (dependent) => `${dependent.firstName ?? ''} ${dependent.lastName ?? ''}`,
      },
      {
        title: intl.formatMessage(messages.invoiceType), dataIndex: 'type', key: 'invoicetype',
        filters: [
          { text: 'Session', value: 1 },
          { text: 'Reschedule', value: 2 },
          { text: 'Cancel', value: 3 },
          { text: 'No show', value: 4 },
          { text: 'Past due balance', value: 5 },
        ],
        onFilter: (value, record) => record.type === value,
        render: type => type === 1 ? 'Session' : type === 2 ? 'Reschedule' : type === 3 ? 'Cancel' : type === 4 ? 'No show' : type === 5 ? 'Past due balance' : '',
      },
      {
        title: intl.formatMessage(messages.method), dataIndex: 'method', key: 'method',
        filters: [
          { text: 'Waived', value: 1 },
          { text: 'PayPal', value: 2 },
        ],
        onFilter: (value, record) => record.method === value,
        render: method => method === 1 ? 'Waived' : method === 2 ? 'PayPal' : '',
      },
      {
        title: intl.formatMessage(msgCreateAccount.age), dataIndex: 'dependent', key: 'age', type: 'datetime',
        sorter: (a, b) => a.dependent.birthday > b.dependent.birthday ? 1 : -1,
        render: (dependent) => moment().year() - moment(dependent.birthday).year(),
      },
      {
        title: intl.formatMessage(msgCreateAccount.currentGrade), dataIndex: 'dependent', key: 'grade',
        sorter: (a, b) => a?.dependent?.currentGrade.toLowerCase() > b?.dependent?.currentGrade.toLowerCase() ? 1 : -1,
        filters: grades,
        onFilter: (value, record) => record?.dependent?.currentGrade === value,
        render: dependent => dependent?.currentGrade,
      },
      {
        title: intl.formatMessage(msgCreateAccount.provider), dataIndex: 'provider', key: 'provider',
        sorter: (a, b) => (a?.provider?.firstName || '' + a?.provider?.lastName || '').toLowerCase() > (b?.provider?.firstName || '' + b?.provider?.lastName || '').toLowerCase() ? 1 : -1,
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
        onFilter: (value, record) => (record?.provider?.firstName || '')?.toLowerCase()?.includes((value).toLowerCase()) || (record?.provider?.lastName || '')?.toLowerCase()?.includes((value).toLowerCase()),
        onFilterDropdownOpenChange: visible => {
          if (visible) {
            setTimeout(() => this.searchInput.current?.select(), 100);
          }
        },
        render: provider => `${provider?.firstName || ''} ${provider?.lastName || ''}`,
      },
      {
        title: 'Amount', dataIndex: 'totalPayment', type: 'number', key: 'amount',
        sorter: (a, b) => a.totalPayment > b.totalPayment ? 1 : -1,
      },
      {
        title: intl.formatMessage(messages.createdDate), dataIndex: 'createdAt', type: 'date', key: 'createdat',
        sorter: (a, b) => a.createdAt > b.createdAt ? 1 : -1,
        render: createdAt => moment(createdAt).format("MM/DD/YYYY hh:mm A"),
      },
      {
        title: intl.formatMessage(messages.updatedDate), dataIndex: 'updatedAt', type: 'date', key: 'updatedat',
        sorter: (a, b) => a.updatedAt > b.updatedAt ? 1 : -1,
        render: updatedAt => moment(updatedAt).format("MM/DD/YYYY hh:mm A"),
      },
    ];

    const modalInvoiceProps = {
      visible: visibleInvoice,
      onSubmit: this.closeModalInvoice,
      onCancel: this.closeModalInvoice,
      invoice: selectedInvoice,
    }

    return (
      <div className="full-layout page invoicelist-page">
        <Table
          bordered
          size='middle'
          dataSource={invoices}
          columns={columns}
          onRow={invoice => ({
            onClick: () => this.openModalInvoice(invoice._id),
            onDoubleClick: () => this.openModalInvoice(invoice._id),
          })}
          scroll={{ x: true }}
        />
        {visibleInvoice && <ModalInvoice {...modalInvoiceProps} />}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
})

export default compose(connect(mapStateToProps))(Paid);