import React, { createRef } from 'react';
import { Divider, Table, Space, Input, Button, Tabs } from 'antd';
import intl from 'react-intl-universal';
import { SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { ModalInvoice } from 'components/Modal';
import msgMainHeader from 'components/MainHeader/messages';
import messages from 'routes/Dashboard/messages';
import msgCreateAccount from 'routes/Sign/CreateAccount/messages';
import msgModal from 'components/Modal/messages';
import msgDrawer from 'components/DrawerDetail/messages';
import request from 'src/utils/api/request';
import { getInvoicesForAdmin } from 'src/utils/api/apiList';
import { getSubsidyRequests } from 'src/redux/features/appointmentsSlice';
import PageLoading from 'components/Loading/PageLoading';

class InvoiceList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      invoices: [],
      visibleInvoice: false,
      selectedInvoice: {},
      tabInvoices: [],
      selectedTab: 0,
    };
    this.searchInput = createRef(null);
  }

  componentDidMount() {
    this.setState({ loading: true });
    this.getInvoiceList();
  }

  getInvoiceList() {
    request.post(getInvoicesForAdmin).then(result => {
      this.setState({ loading: false });
      const { success, data } = result;
      if (success) {
        this.setState({
          invoices: data?.map((invoice, i) => {
            invoice['key'] = i; return invoice;
          }) ?? [],
          tabInvoices: data?.filter(i => !i.isPaid)?.map((invoice, i) => {
            invoice['key'] = i; return invoice;
          }) ?? [],
        });
      } else {
        this.setState({ invoices: [], loading: false });
      }
    }).catch(err => {
      this.setState({ invoices: [], loading: false });
    })
  }

  openModalInvoice = (invoiceId) => {
    const { invoices } = this.state;
    this.setState({ visibleInvoice: true, selectedInvoice: invoices?.find(a => a._id === invoiceId) });
  }

  closeModalInvoice = () => {
    this.setState({ visibleInvoice: false, selectedInvoice: {} });
  }

  handleChangeTab = (value) => {
    const { invoices } = this.state;
    this.setState({
      tabInvoices: invoices.filter(i => i.isPaid == value),
      selectedTab: value,
    })
  }

  render() {
    const { loading, selectedInvoice, selectedTab, tabInvoices, visibleInvoice } = this.state;
    const { auth } = this.props;
    const grades = JSON.parse(JSON.stringify(auth.academicLevels ?? []))?.slice(6)?.map(level => ({ text: level, value: level }));
    const columns = [
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
        title: intl.formatMessage(messages.studentName), dataIndex: 'dependent', key: 'name',
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
        title: intl.formatMessage(msgCreateAccount.age), dataIndex: 'dependent', key: 'age',
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
        title: intl.formatMessage(msgCreateAccount.provider), dataIndex: 'data', key: 'provider',
        sorter: (a, b) => (a.data?.[0]?.appointment?.provider?.firstName || '' + a.data?.[0]?.appointment?.provider?.lastName || '').toLowerCase() > (b.data?.[0]?.appointment?.provider?.firstName || '' + b.data?.[0]?.appointment?.provider?.lastName || '').toLowerCase() ? 1 : -1,
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
        onFilter: (value, record) => (record.data?.[0]?.appointment?.provider?.firstName || '')?.toLowerCase()?.includes((value).toLowerCase()) || (record.data?.[0]?.appointment?.provider?.lastName || '')?.toLowerCase()?.includes((value).toLowerCase()),
        onFilterDropdownOpenChange: visible => {
          if (visible) {
            setTimeout(() => this.searchInput.current?.select(), 100);
          }
        },
        render: data => `${data?.[0]?.appointment?.provider?.firstName || ''} ${data?.[0]?.appointment?.provider?.lastName || ''}`,
      },
      {
        title: intl.formatMessage(messages.status), dataIndex: 'isPaid', key: 'status',
        filters: [
          { text: 'Paid', value: 1 },
          { text: 'Unpaid', value: 0 },
        ],
        onFilter: (value, record) => record?.isPaid === value,
        render: isPaid => isPaid ? 'Paid' : 'Unpaid',
      },
      {
        title: intl.formatMessage(messages.createdDate), dataIndex: 'createdAt', type: 'date', key: 'createdat',
        sorter: (a, b) => a.createdAt > b.createdAt ? 1 : -1,
        render: createdAt => moment(createdAt).format("MM/DD/YYYY hh:mm a"),
      },
      {
        title: intl.formatMessage(messages.updatedDate), dataIndex: 'updatedAt', type: 'date', key: 'updatedat',
        sorter: (a, b) => a.updatedAt > b.updatedAt ? 1 : -1,
        render: updatedAt => moment(updatedAt).format("MM/DD/YYYY hh:mm a"),
      },
      {
        title: intl.formatMessage(messages.action), key: 'action',
        render: invoice => invoice.isPaid ? null : <form aria-live="polite" className='flex-1' data-ux="Form" action="https://www.paypal.com/cgi-bin/webscr" method="post">
          <input type="hidden" name="edit_selector" data-aid="EDIT_PANEL_EDIT_PAYMENT_ICON" />
          <input type="hidden" name="business" value="office@helpmegethelp.org" />
          <input type="hidden" name="cmd" value="_donations" />
          <input type="hidden" name="item_name" value="Help Me Get Help" />
          <input type="hidden" name="item_number" />
          <input type="hidden" name="amount" value={invoice?.totalPayment} data-aid="PAYMENT_HIDDEN_AMOUNT" />
          <input type="hidden" name="shipping" value="0.00" />
          <input type="hidden" name="currency_code" value="USD" data-aid="PAYMENT_HIDDEN_CURRENCY" />
          <input type="hidden" name="rm" value="0" />
          <input type="hidden" name="return" value={`${window.location.href}?success=true&type=flag&invoiceId=${invoice?._id}`} />
          <input type="hidden" name="cancel_return" value={window.location.href} />
          <input type="hidden" name="cbt" value="Return to Help Me Get Help" />
          <Button type='link' block className='h-30 p-0 text-primary' htmlType='submit'>
            {intl.formatMessage(msgModal.paynow)}
          </Button>
        </form>,
      },
    ];

    if (selectedTab == 1) {
      columns.splice(8);
    }

    const items = [
      {
        key: '0',
        label: <span className="font-16">{intl.formatMessage(msgDrawer.unpaid)}</span>,
        children: (
          <Table
            bordered
            size='middle'
            dataSource={tabInvoices}
            columns={columns}
            onRow={invoice => ({
              onClick: () => this.openModalInvoice(invoice._id),
              onDoubleClick: () => this.openModalInvoice(invoice._id),
            })}
          />
        ),
      },
      {
        key: '1',
        label: <span className="font-16">{intl.formatMessage(msgDrawer.paid)}</span>,
        children: (
          <Table
            bordered
            size='middle'
            dataSource={tabInvoices}
            columns={columns}
            onRow={invoice => ({
              onClick: () => this.openModalInvoice(invoice._id),
              onDoubleClick: () => this.openModalInvoice(invoice._id),
            })}
          />
        ),
      },
    ]

    const modalInvoiceProps = {
      visible: visibleInvoice,
      onSubmit: this.closeModalInvoice,
      onCancel: this.closeModalInvoice,
      invoice: selectedInvoice,
    }

    return (
      <div className="full-layout page usermanager-page">
        <div className='div-title-admin'>
          <p className='font-16 font-500'>{intl.formatMessage(msgMainHeader.invoiceList)}</p>
          <Divider />
        </div>
        <Tabs
          defaultActiveKey="0"
          type="card"
          size='small'
          items={items}
          className="bg-white p-10 h-100 overflow-y-scroll overflow-x-hidden"
          onChange={this.handleChangeTab}
        />
        {visibleInvoice && <ModalInvoice {...modalInvoiceProps} />}
        <PageLoading loading={loading} isBackground={true} />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
})

export default compose(connect(mapStateToProps, { getSubsidyRequests }))(InvoiceList);