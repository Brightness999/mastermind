import React, { createRef } from 'react';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';
import moment from 'moment';
import { Divider, Table, Space, Button, Input, message, Popconfirm, Tabs } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import { InvoiceType } from 'routes/constant';
import mgsSidebar from 'components/SideBar/messages';
import msgModal from 'components/Modal/messages';
import msgDrawer from 'components/DrawerDetail/messages';
import request, { decryptParam, encryptParam } from 'utils/api/request';
import { clearFlag, payInvoice, updateInvoice } from 'utils/api/apiList';
import PageLoading from 'components/Loading/PageLoading';
import { getInvoiceList, setInvoiceList } from 'src/redux/features/appointmentsSlice';
import { ModalInvoice } from 'components/Modal';

class FlagList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      tabFlags: [],
      selectedTab: 0,
      visibleInvoice: false,
      selectedFlag: {},
    };
    this.searchInput = createRef(null);
  }

  componentDidMount() {
    const { auth, invoices } = this.props;
    const { selectedTab } = this.state;
    const params = new URLSearchParams(window.location.search);
    const success = decryptParam(params.get('s')?.replace(' ', '+') || '');
    const invoiceId = decryptParam(params.get('i')?.replace(' ', '+') || '');
    if (success === 'true' && (invoiceId)) {
      request.post(payInvoice, { invoiceId }).then(res => {
        if (res.success) {
          message.success('Paid successfully');
          const url = window.location.href;
          const cleanUrl = url.split('?')[0];
          window.history.replaceState({}, document.title, cleanUrl);
        } else {
          message.warning('Something went wrong. Please try again');
        }
      }).catch(err => {
        message.error(err.message);
      });
    }
    this.setState({ tabFlags: JSON.parse(JSON.stringify(invoices))?.filter(i => [InvoiceType.NOSHOW, InvoiceType.BALANCE].includes(i.type) && i.isPaid == selectedTab)?.map(f => ({ ...f, key: f._id })) });
    this.props.getInvoiceList({ role: auth.user.role });
  }

  componentDidUpdate(prevProps) {
    const { selectedTab } = this.state;
    const { invoices } = this.props;
    if (JSON.stringify(prevProps.invoices) != JSON.stringify(invoices)) {
      this.setState({ tabFlags: JSON.parse(JSON.stringify(invoices))?.filter(i => [InvoiceType.NOSHOW, InvoiceType.BALANCE].includes(i.type) && i.isPaid == selectedTab)?.map(f => ({ ...f, key: f._id })) });
    }
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

  handleChangeTab = (value) => {
    const { invoices } = this.props;
    this.setState({
      tabFlags: JSON.parse(JSON.stringify(invoices)).filter(i => [InvoiceType.NOSHOW, InvoiceType.BALANCE].includes(i.type) && i.isPaid == value)?.map(f => ({ ...f, key: f._id })),
      selectedTab: value,
    })
  }

  openModalInvoice = (invoice) => {
    this.setState({ visibleInvoice: true, selectedFlag: invoice });
  }

  closeModalInvoice = () => {
    this.setState({ visibleInvoice: false, selectedFlag: {} });
  }

  handleUpdateInvoice = (items) => {
    const { invoices } = this.props;
    const { selectedFlag } = this.state;
    const { totalPayment } = items;
    this.closeModalInvoice();
    if (selectedFlag?._id) {
      let postData = {
        invoiceId: selectedFlag._id,
        totalPayment: totalPayment,
      }

      if (selectedFlag.type === InvoiceType.NOSHOW) {
        postData = {
          ...postData,
          updateData: [{
            appointment: selectedFlag.data?.[0]?.appointment?._id,
            items: {
              ...selectedFlag.data?.[0]?.items,
              data: items.items,
            }
          }]
        }
      }

      request.post(updateInvoice, postData).then(result => {
        if (result.success) {
          message.success('Successfully updated!');
          const newInvoices = JSON.parse(JSON.stringify(invoices))?.map(invoice => {
            if (invoice?._id === selectedFlag._id) {
              if ([InvoiceType.BALANCE, InvoiceType.CANCEL, InvoiceType.RESCHEDULE].includes(selectedFlag.type)) {
                invoice.totalPayment = totalPayment;
                invoice.data = [{
                  appointment: selectedFlag.data?.[0]?.appointment,
                  items: items?.items,
                }];
              } else if (selectedFlag.type === InvoiceType.NOSHOW) {
                invoice.totalPayment = totalPayment;
                invoice.data = [{
                  appointment: selectedFlag.data?.[0]?.appointment,
                  items: {
                    ...selectedFlag.data?.[0]?.items,
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

  render() {
    const { tabFlags, loading, selectedTab, visibleInvoice, selectedFlag } = this.state;
    const { auth } = this.props;
    const grades = JSON.parse(JSON.stringify(auth.academicLevels ?? []))?.slice(6)?.map(level => ({ text: level, value: level }));
    const columns = [
      {
        title: 'Flag Type', dataIndex: 'type', key: 'flagtype',
        filters: [
          { text: 'No Show', value: InvoiceType.NOSHOW },
          { text: 'Past Due Balance', value: InvoiceType.BALANCE },
        ],
        onFilter: (value, record) => record.type == value,
        render: (type) => type === InvoiceType.NOSHOW ? 'No Show' : type === InvoiceType.BALANCE ? 'Past Due Balance' : '',
      },
      {
        title: 'Student Name', dataIndex: 'dependent', key: 'dependent',
        sorter: (a, b) => ((a.dependent?.firstName || '') + (a.dependent?.lastName || '')).toLowerCase() > ((b.dependent?.firstName || '') + (b.dependent?.lastName || '')).toLowerCase() ? 1 : -1,
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
        onFilter: (value, record) => record.dependent?.firstName?.toString()?.toLowerCase()?.includes((value).toLowerCase()) || record.dependent?.lastName?.toString()?.toLowerCase()?.includes((value).toLowerCase()),
        onFilterDropdownOpenChange: visible => {
          if (visible) {
            setTimeout(() => this.searchInput.current?.select(), 100);
          }
        },
        render: (dependent) => `${dependent?.firstName ?? ''} ${dependent?.lastName ?? ''}`,
      },
      {
        title: 'Age', dataIndex: 'dependent', key: 'age', type: 'datetime',
        sorter: (a, b) => a.dependent.birthday > b.dependent.birthday ? 1 : -1,
        render: (dependent) => moment().year() - moment(dependent.birthday).year(),
      },
      {
        title: 'Current grade', dataIndex: 'dependent', key: 'grade',
        sorter: (a, b) => a?.dependent?.currentGrade.toLowerCase() > b?.dependent?.currentGrade.toLowerCase() ? 1 : -1,
        filters: grades,
        onFilter: (value, record) => record?.dependent?.currentGrade === value,
        render: dependent => dependent?.currentGrade,
      },
      {
        title: 'Provider', dataIndex: 'provider', key: 'provider',
        sorter: (a, b) => ((a.provider?.firstName || '') + (a.provider?.lastName || '')).toLowerCase() > ((b.provider?.firstName || '') + (b.provider?.lastName || '')).toLowerCase() ? 1 : -1,
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
        onFilter: (value, record) => record.provider?.firstName?.toString()?.toLowerCase()?.includes((value).toLowerCase()) || record.provider?.lastName?.toString()?.toLowerCase()?.includes((value).toLowerCase()),
        onFilterDropdownOpenChange: visible => {
          if (visible) {
            setTimeout(() => this.searchInput.current?.select(), 100);
          }
        },
        render: (provider) => `${provider?.firstName ?? ''} ${provider?.lastName ?? ''}`,
      },
      {
        title: 'Amount', dataIndex: 'totalPayment', type: 'number', key: 'amount',
        sorter: (a, b) => a.totalPayment > b.totalPayment ? 1 : -1,
      },
      {
        title: 'Created Date', dataIndex: 'createdAt', key: 'createdAt', type: 'datetime',
        sorter: (a, b) => a.createdAt > b.createdAt ? 1 : -1,
        render: (createdAt) => moment(createdAt).format('MM/DD/YYYY hh:mm A'),
      },
      {
        title: 'Updated Date', dataIndex: 'updatedAt', key: 'updatedAt', type: 'datetime',
        sorter: (a, b) => a.updatedAt > b.updatedAt ? 1 : -1,
        render: (updatedAt) => moment(updatedAt).format('MM/DD/YYYY hh:mm A'),
      },
      {
        title: 'Action', key: 'action', align: 'center',
        render: (invoice) => (invoice.isPaid || invoice.totalPayment == 0) ? null : (
          <div className='flex'>
            <form aria-live="polite" data-ux="Form" action="https://www.paypal.com/cgi-bin/webscr" method="post">
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
                {intl.formatMessage(msgModal.paynow)}
              </Button>
            </form>
            <Popconfirm
              title="Are you sure to clear this flag?"
              onConfirm={() => this.handleClearFlag(invoice)}
              okText="Yes"
              cancelText="No"
            >
              <Button type='link'>{intl.formatMessage(msgDrawer.clearFlag)}</Button>
            </Popconfirm>
          </div>
        )
      },
    ];

    if (selectedTab == 1) {
      columns.splice(8);
    }

    const items = [
      {
        key: '0',
        label: <span className="font-16">{intl.formatMessage(msgModal.active)}</span>,
        children: (
          <Table
            bordered
            size='middle'
            dataSource={tabFlags}
            columns={columns}
            onRow={invoice => ({
              onClick: (e) => e.target.className == 'ant-table-cell ant-table-cell-row-hover' && this.openModalInvoice(invoice),
              onDoubleClick: (e) => e.target.className == 'ant-table-cell ant-table-cell-row-hover' && this.openModalInvoice(invoice),
            })}
          />
        ),
      },
      {
        key: '1',
        label: <span className="font-16">{intl.formatMessage(msgModal.cleared)}</span>,
        children: (
          <Table
            bordered
            size='middle'
            dataSource={tabFlags}
            columns={columns}
            onRow={invoice => ({
              onClick: () => this.openModalInvoice(invoice),
              onDoubleClick: () => this.openModalInvoice(invoice),
            })}
          />
        ),
      },
    ]

    const modalInvoiceProps = {
      visible: visibleInvoice,
      onSubmit: this.handleUpdateInvoice,
      onCancel: this.closeModalInvoice,
      invoice: selectedFlag,
    }

    return (
      <div className="full-layout page usermanager-page">
        <div className='div-title-admin'>
          <p className='font-16 font-500'>{intl.formatMessage(mgsSidebar.flagList)}</p>
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
});

export default compose(connect(mapStateToProps, { getInvoiceList, setInvoiceList }))(FlagList);