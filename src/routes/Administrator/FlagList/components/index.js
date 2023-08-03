import React, { createRef } from 'react';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';
import moment from 'moment';
import { Divider, Table, Space, Button, Input, message, Popconfirm, Tabs } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { CSVLink } from "react-csv";
import { FaFileDownload } from 'react-icons/fa';
import Cookies from 'js-cookie';

import { InvoiceType, MethodType } from 'routes/constant';
import mgsSidebar from 'components/SideBar/messages';
import msgModal from 'components/Modal/messages';
import msgDrawer from 'components/DrawerDetail/messages';
import request, { decryptParam, encryptParam } from 'utils/api/request';
import { clearFlag, payInvoice, updateInvoice } from 'utils/api/apiList';
import PageLoading from 'components/Loading/PageLoading';
import { getInvoiceList, setInvoiceList } from 'src/redux/features/appointmentsSlice';
import { ModalInvoice, ModalPay } from 'components/Modal';
import { socketUrl } from 'utils/api/baseUrl';
import './index.less';

class FlagList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      tabFlags: [],
      selectedTab: 0,
      visibleInvoice: false,
      selectedFlag: {},
      csvData: [],
      sortedFlags: [],
      visiblePay: false,
      returnUrl: '',
      totalPayment: 0,
      minimumPayment: 0,
      paidAmount: 0,
    };
    this.searchInput = createRef(null);
    this.socket = undefined;
  }

  componentDidMount() {
    const { auth, invoices } = this.props;
    const { selectedTab } = this.state;
    const params = new URLSearchParams(window.location.search);
    const success = decryptParam(params.get('s')?.replace(' ', '+') || '');
    const invoiceId = decryptParam(params.get('i')?.replace(' ', '+') || '');
    const amount = decryptParam(params.get('v')?.replaceAll(' ', '+') || '');
    if (success === 'true' && (invoiceId)) {
      request.post(payInvoice, { invoiceId, method: MethodType.PAYPAL, amount }).then(res => {
        if (res.success) {
          message.success('Paid successfully');
          const url = window.location.href;
          const cleanUrl = url.split('?')[0];
          window.history.replaceState({}, document.title, cleanUrl);
          const newInvoices = JSON.parse(JSON.stringify(invoices))?.map(a => {
            const totalPaidAmount = (a.paidAmount || 0) + amount;
            if (a._id === invoiceId) {
              a.paidAmount = totalPaidAmount;
              a.isPaid = a.type === 5 ? totalPaidAmount >= a.minimumPayment ? 1 : 0 : totalPaidAmount >= a.totalPayment ? 1 : 0;
              a.method = MethodType.PAYPAL;
            }
            return a;
          })
          this.props.setInvoiceList(newInvoices);
        } else {
          message.warning('Something went wrong. Please try again');
        }
      }).catch(err => {
        message.error(err.message);
      });
    }
    this.setState({
      tabFlags: invoices?.length ? JSON.parse(JSON.stringify(invoices))?.filter(i => [InvoiceType.NOSHOW, InvoiceType.BALANCE].includes(i.type) && i.isPaid == selectedTab)?.map(f => ({ ...f, key: f._id })) : [],
      sortedFlags: invoices?.length ? JSON.parse(JSON.stringify(invoices))?.filter(i => [InvoiceType.NOSHOW, InvoiceType.BALANCE].includes(i.type) && i.isPaid == selectedTab)?.map(f => ({ ...f, key: f._id })) : [],
    });
    this.props.getInvoiceList({ role: auth.user.role });
    const opts = {
      query: {
        token: Cookies.get('tk'),
      },
      withCredentials: true,
      autoConnect: true,
    };
    this.socket = io(socketUrl, opts);
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
            a.method = MethodType.WAIVED;
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
      sortedFlags: JSON.parse(JSON.stringify(invoices)).filter(i => [InvoiceType.NOSHOW, InvoiceType.BALANCE].includes(i.type) && i.isPaid == value)?.map(f => ({ ...f, key: f._id })),
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
    const { totalPayment, minimumPayment } = items;
    this.closeModalInvoice();
    if (selectedFlag?._id) {
      let postData = {
        invoiceId: selectedFlag._id,
        totalPayment: totalPayment,
        minimumPayment: minimumPayment,
        updateData: [{
          appointment: selectedFlag.data?.[0]?.appointment?._id,
          items: {
            ...selectedFlag.data?.[0]?.items,
            data: items.items,
          }
        }],
      }

      request.post(updateInvoice, postData).then(result => {
        if (result.success) {
          message.success('Successfully updated!');
          const newInvoices = JSON.parse(JSON.stringify(invoices))?.map(invoice => {
            if (invoice?._id === selectedFlag._id) {
              invoice.totalPayment = totalPayment;
              invoice.minimumPayment = minimumPayment;
              invoice.data = [{
                appointment: selectedFlag.data?.[0]?.appointment,
                items: {
                  ...selectedFlag.data?.[0]?.items,
                  data: items?.items,
                },
              }];
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

  exportToExcel = () => {
    const { user } = this.props.auth;
    const { sortedFlags } = this.state;
    const data = sortedFlags?.map(f => ({
      "Flag Type": f?.type === InvoiceType.NOSHOW ? 'No Show' : f?.type === InvoiceType.BALANCE ? 'Past Due Balance' : '',
      "Student Name": `${f?.dependent?.firstName ?? ''} ${f?.dependent?.lastName ?? ''}`,
      "Age": moment().year() - moment(f?.dependent?.birthday).year(),
      "Student Grade": f?.dependent?.currentGrade,
      "Provider": `${f?.provider?.firstName ?? ''} ${f?.provider?.lastName ?? ''}`,
      "Amount": f?.totalPayment,
      "Created Date": moment(f?.createdAt).format('MM/DD/YYYY hh:mm A'),
      "Updated Date": moment(f?.updatedAt).format('MM/DD/YYYY hh:mm A'),
    }))
    this.setState({ csvData: data });
    this.socket.emit("action_tracking", {
      user: user?._id,
      action: "Flag List",
      description: "Downloaded flags",
    })
    return true;
  }

  openModalPay = (url, paidAmount, totalPayment, minimumPayment = 0) => {
    this.setState({ visiblePay: true, returnUrl: url, totalPayment, minimumPayment, paidAmount });
  }

  closeModalPay = () => {
    this.setState({ visiblePay: false, returnUrl: '', totalPayment: 0, minimumPayment: 0, paidAmount: 0 });
  }

  render() {
    const { csvData, tabFlags, loading, selectedTab, totalPayment, minimumPayment, paidAmount, visibleInvoice, selectedFlag, visiblePay, returnUrl } = this.state;
    const { auth } = this.props;
    const csvHeaders = ["Flag Type", "Student Name", "Age", "Student Grade", "Provider", "Amount", "Created Date", "Updated Date"];
    const grades = JSON.parse(JSON.stringify(auth.academicLevels ?? []))?.slice(6)?.map(level => ({ text: level, value: level }));
    const columns = [
      {
        title: 'Student Name', dataIndex: 'dependent', key: 'dependent', fixed: 'left',
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
        title: 'Flag Type', dataIndex: 'type', key: 'flagtype',
        filters: [
          { text: 'No Show', value: InvoiceType.NOSHOW },
          { text: 'Past Due Balance', value: InvoiceType.BALANCE },
        ],
        onFilter: (value, record) => record.type == value,
        render: (type) => type === InvoiceType.NOSHOW ? 'No Show' : type === InvoiceType.BALANCE ? 'Past Due Balance' : '',
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
        title: <span className='whitespace-nowrap'>Created Date</span>, dataIndex: 'createdAt', key: 'createdAt', type: 'datetime',
        sorter: (a, b) => a.createdAt > b.createdAt ? 1 : -1,
        render: (createdAt) => moment(createdAt).format('MM/DD/YYYY hh:mm A'),
      },
      {
        title: <span className='whitespace-nowrap'>Updated Date</span>, dataIndex: 'updatedAt', key: 'updatedAt', type: 'datetime',
        sorter: (a, b) => a.updatedAt > b.updatedAt ? 1 : -1,
        render: (updatedAt) => moment(updatedAt).format('MM/DD/YYYY hh:mm A'),
      },
      {
        title: 'Action', key: 'action', align: 'center', fixed: 'right', width: 160,
        render: (invoice) => (invoice.isPaid || invoice.totalPayment == 0) ? null : (
          <div className='flex'>
            <Button type='link' className='px-5' onClick={() => this.openModalPay(`${window.location.href}?s=${encryptParam('true')}&i=${encryptParam(invoice?._id)}`, invoice?.paidAmount, invoice?.totalPayment, invoice?.minimumPayment)}>
              <span className='text-primary'>{intl.formatMessage(msgModal.paynow)}</span>
            </Button>
            <Popconfirm
              title="Are you sure to clear this flag?"
              onConfirm={() => this.handleClearFlag(invoice)}
              okText="Yes"
              cancelText="No"
            >
              <Button type='link' className='px-5'><span className='text-primary'>{intl.formatMessage(msgDrawer.clearFlag)}</span></Button>
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
          <div>
            <CSVLink onClick={this.exportToExcel} data={csvData} headers={csvHeaders} filename="Pending Requests">
              <Button type='primary' className='inline-flex items-center gap-2' icon={<FaFileDownload size={24} />}>
                Download CSV
              </Button>
            </CSVLink>
            <Table
              bordered
              size='middle'
              dataSource={tabFlags}
              columns={columns}
              className='mt-1'
              onChange={(_, __, ___, extra) => this.setState({ sortedFlags: extra.currentDataSource })}
              onRow={invoice => ({
                onClick: (e) => e.target.className == 'ant-table-cell ant-table-cell-row-hover' && this.openModalInvoice(invoice),
                onDoubleClick: (e) => e.target.className == 'ant-table-cell ant-table-cell-row-hover' && this.openModalInvoice(invoice),
              })}
              scroll={{ x: 1300 }}
            />
          </div>
        ),
      },
      {
        key: '1',
        label: <span className="font-16">{intl.formatMessage(msgModal.cleared)}</span>,
        children: (
          <div>
            <CSVLink onClick={this.exportToExcel} data={csvData} headers={csvHeaders} filename="Pending Requests">
              <Button type='primary' className='inline-flex items-center gap-2' icon={<FaFileDownload size={24} />}>
                Download CSV
              </Button>
            </CSVLink>
            <Table
              bordered
              size='middle'
              dataSource={tabFlags}
              columns={columns}
              className='mt-1'
              onRow={invoice => ({
                onClick: () => this.openModalInvoice(invoice),
                onDoubleClick: () => this.openModalInvoice(invoice),
              })}
              scroll={{ x: 1300 }}
            />
          </div>
        ),
      },
    ]

    const modalInvoiceProps = {
      visible: visibleInvoice,
      onSubmit: this.handleUpdateInvoice,
      onCancel: this.closeModalInvoice,
      invoice: selectedFlag,
    }

    const modalPayProps = {
      visible: visiblePay,
      onSubmit: this.openModalPay,
      onCancel: this.closeModalPay,
      returnUrl, totalPayment, minimumPayment, paidAmount,
    }

    return (
      <div className="full-layout page flaglist-page">
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
        {visiblePay && <ModalPay {...modalPayProps} />}
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