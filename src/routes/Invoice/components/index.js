import React, { createRef } from 'react';
import { Divider, Table, Space, Input, Button, Tabs, message, Popconfirm } from 'antd';
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
import request, { decryptParam, encryptParam } from 'utils/api/request';
import { clearFlag, payInvoice, updateInvoice } from 'utils/api/apiList';
import { getInvoiceList, setInvoiceList } from 'src/redux/features/appointmentsSlice';
import PageLoading from 'components/Loading/PageLoading';
import { InvoiceType, PARENT, PROVIDER } from 'src/routes/constant';

class InvoiceList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      visibleInvoice: false,
      selectedInvoice: {},
      tabInvoices: [],
      selectedTab: 0,
    };
    this.searchInput = createRef(null);
  }

  componentDidMount() {
    const { auth, invoices } = this.props;
    const { selectedTab } = this.state;
    const params = new URLSearchParams(window.location.search);
    const success = decryptParam(params.get('s')?.replaceAll(' ', '+') || '');
    const invoiceId = decryptParam(params.get('i')?.replaceAll(' ', '+') || '');
    if (success === 'true' && (invoiceId)) {
      request.post(payInvoice, { invoiceId }).then(res => {
        if (res.success) {
          message.success('Paid successfully');
          const url = window.location.href;
          const cleanUrl = url.split('?')[0];
          window.history.replaceState({}, document.title, cleanUrl);
          if (invoiceId) {
            const newInvoices = JSON.parse(JSON.stringify(invoices))?.map(a => {
              if (a._id === invoiceId) {
                a.isPaid = 1;
              }
              return a;
            })

            this.props.setInvoiceList(newInvoices);
          }
        } else {
          message.warning('Something went wrong. Please try again');
        }
      }).catch(err => {
        message.error(err.message);
      });
    }
    this.setState({ tabInvoices: invoices?.length ? JSON.parse(JSON.stringify(invoices))?.filter(i => i.isPaid == selectedTab)?.map(f => ({ ...f, key: f._id })) : [] });
    this.props.getInvoiceList({ role: auth.user.role });
  }

  componentDidUpdate(prevProps) {
    const { selectedTab } = this.state;
    const { invoices } = this.props;
    if (JSON.stringify(prevProps.invoices) != JSON.stringify(invoices)) {
      this.setState({ tabInvoices: JSON.parse(JSON.stringify(invoices))?.filter(i => i.isPaid == selectedTab)?.map(f => ({ ...f, key: f._id })) });
    }
  }

  openModalInvoice = (invoiceId) => {
    const { invoices } = this.props;
    this.setState({ visibleInvoice: true, selectedInvoice: invoices?.find(a => a._id === invoiceId) });
  }

  closeModalInvoice = () => {
    this.setState({ visibleInvoice: false, selectedInvoice: {} });
  }

  handleUpdateInvoice = (items) => {
    const { invoices } = this.props;
    const { selectedInvoice } = this.state;
    const { totalPayment, minimumPayment } = items;
    this.closeModalInvoice();
    if (selectedInvoice?._id) {
      let postData = {
        invoiceId: selectedInvoice._id,
        totalPayment: totalPayment,
        minimumPayment: minimumPayment,
      }

      if ([InvoiceType.BALANCE, InvoiceType.CANCEL, InvoiceType.RESCHEDULE].includes(selectedInvoice.type)) {
        postData = {
          ...postData,
          updateData: [{
            appointment: selectedInvoice.data?.[0]?.appointment?._id,
            items: items?.items,
          }]
        }
      }

      if (selectedInvoice.type === InvoiceType.NOSHOW || selectedInvoice.type === InvoiceType.BALANCE) {
        postData = {
          ...postData,
          updateData: [{
            appointment: selectedInvoice.data?.[0]?.appointment?._id,
            items: {
              ...selectedInvoice.data?.[0]?.items,
              data: items.items,
            }
          }]
        }
      }

      request.post(updateInvoice, postData).then(result => {
        if (result.success) {
          message.success('Successfully updated!');
          const newInvoices = JSON.parse(JSON.stringify(invoices))?.map(invoice => {
            if (invoice?._id === selectedInvoice._id) {
              if ([InvoiceType.BALANCE, InvoiceType.CANCEL, InvoiceType.RESCHEDULE].includes(selectedInvoice.type)) {
                invoice.totalPayment = totalPayment;
                invoice.data = [{
                  appointment: selectedInvoice.data?.[0]?.appointment,
                  items: items?.items,
                }];
              } else if (selectedInvoice.type === InvoiceType.NOSHOW || selectedInvoice.type === InvoiceType.BALANCE) {
                invoice.totalPayment = totalPayment;
                invoice.minimumPayment = minimumPayment;
                invoice.data = [{
                  appointment: selectedInvoice.data?.[0]?.appointment,
                  items: {
                    ...selectedInvoice.data?.[0]?.items,
                    data: items?.items,
                  },
                }];
              }
            }
            return invoice;
          });
          this.props.setInvoiceList(newInvoices);
        } else {
          message.warning('Something went wrong. Please try again or contact admin.');
        }
      }).catch(error => {
        message.warning('Something went wrong. Please try again or contact admin.');
      })
    }
  }

  handleChangeTab = (value) => {
    const { invoices } = this.props;
    this.setState({
      tabInvoices: JSON.parse(JSON.stringify(invoices)).filter(i => i.isPaid == value)?.map(f => ({ ...f, key: f._id })),
      selectedTab: value,
    })
  }

  handleClearFlag = (invoice) => {
    const { invoices } = this.props;
    request.post(clearFlag, { invoiceId: invoice?._id }).then(result => {
      const { success } = result;
      if (success) {
        const newInvoices = JSON.parse(JSON.stringify(invoices))?.map(a => {
          if (a._id === invoice?._id) {
            a.isPaid = true;
          }
          return a;
        })
        this.props.setInvoiceList(newInvoices);
        message.success('Successfully cleared!');
      }
    })
  }

  render() {
    const { loading, selectedInvoice, selectedTab, tabInvoices, visibleInvoice } = this.state;
    const { user, academicLevels } = this.props.auth;
    const grades = JSON.parse(JSON.stringify(academicLevels ?? []))?.slice(6)?.map(level => ({ text: level, value: level }));
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
        onFilter: (value, record) => (record.provider?.firstName || '')?.toLowerCase()?.includes((value).toLowerCase()) || (record.provider?.lastName || '')?.toLowerCase()?.includes((value).toLowerCase()),
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
        render: createdAt => moment(createdAt).format("MM/DD/YYYY hh:mm a"),
      },
      {
        title: intl.formatMessage(messages.updatedDate), dataIndex: 'updatedAt', type: 'date', key: 'updatedat',
        sorter: (a, b) => a.updatedAt > b.updatedAt ? 1 : -1,
        render: updatedAt => moment(updatedAt).format("MM/DD/YYYY hh:mm a"),
      },
      {
        title: intl.formatMessage(messages.action), key: 'action', align: 'center',
        render: invoice => (invoice.isPaid || invoice.totalPayment == 0) ? null : (
          <div className='flex'>
            {user?.role === PARENT ? (
              <form aria-live="polite" className='flex-1' data-ux="Form" action="https://www.paypal.com/cgi-bin/webscr" method="post">
                <input type="hidden" name="edit_selector" data-aid="EDIT_PANEL_EDIT_PAYMENT_ICON" />
                <input type="hidden" name="business" value="office@helpmegethelp.org" />
                <input type="hidden" name="cmd" value="_donations" />
                <input type="hidden" name="item_name" value="Help Me Get Help" />
                <input type="hidden" name="item_number" />
                <input type="hidden" name="amount" value={invoice?.totalPayment} data-aid="PAYMENT_HIDDEN_AMOUNT" />
                <input type="hidden" name="shipping" value="0.00" />
                <input type="hidden" name="currency_code" value="USD" data-aid="PAYMENT_HIDDEN_CURRENCY" />
                <input type="hidden" name="rm" value="0" />
                <input type="hidden" name="return" value={`${window.location.href}?s=${encryptParam('true')}&i=${encryptParam(invoice?._id)}`} />
                <input type="hidden" name="cancel_return" value={window.location.href} />
                <input type="hidden" name="cbt" value="Return to Help Me Get Help" />
                <Button type='link' htmlType='submit'>
                  <span className='text-primary'>{intl.formatMessage(msgModal.paynow)}</span>
                </Button>
              </form>
            ) : null}
            {([4, 5].includes(invoice.type) && user?.role === PROVIDER) ? (
              <Popconfirm
                title="Are you sure to clear this flag?"
                onConfirm={() => this.handleClearFlag(invoice)}
                okText="Yes"
                cancelText="No"
              >
                <Button type='link'><span className='text-primary'>Clear flag</span></Button>
              </Popconfirm>
            ) : null}
          </div>
        ),
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
              onClick: (e) => e.target.className == 'ant-table-cell ant-table-cell-row-hover' && this.openModalInvoice(invoice._id),
              onDoubleClick: (e) => e.target.className == 'ant-table-cell ant-table-cell-row-hover' && this.openModalInvoice(invoice._id),
            })}
            scroll={{ x: true }}
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
            scroll={{ x: true }}
          />
        ),
      },
    ]

    const modalInvoiceProps = {
      visible: visibleInvoice,
      onSubmit: this.handleUpdateInvoice,
      onCancel: this.closeModalInvoice,
      invoice: selectedInvoice,
    }

    return (
      <div className="full-layout page usermanager-page">
        <div className='div-title-admin'>
          <div className='font-16 font-500'>{intl.formatMessage(msgMainHeader.invoiceList)}</div>
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
  invoices: state.appointments.dataInvoices,
})

export default compose(connect(mapStateToProps, { getInvoiceList, setInvoiceList }))(InvoiceList);