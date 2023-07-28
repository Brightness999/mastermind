import React, { createRef } from 'react';
import { Table, Space, Input, Button, message, Popconfirm } from 'antd';
import intl from 'react-intl-universal';
import { SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { ModalCreateNote, ModalInvoice, ModalPay } from 'components/Modal';
import msgMainHeader from 'components/MainHeader/messages';
import messages from 'routes/User/Dashboard/messages';
import msgCreateAccount from 'routes/Sign/CreateAccount/messages';
import msgModal from 'components/Modal/messages';
import request, { encryptParam } from 'utils/api/request';
import { clearFlag, requestClearance, updateInvoice } from 'utils/api/apiList';
import { getInvoiceList, setInvoiceList } from 'src/redux/features/appointmentsSlice';
import { InvoiceType, PARENT, PROVIDER } from 'src/routes/constant';

class OutstandingList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleInvoice: false,
      selectedInvoice: {},
      tabInvoices: [],
      selectedTab: 0,
      visibleCreateNote: false,
      visiblePay: false,
      returnUrl: '',
      totalPayment: 0,
      minimumPayment: 0,
      paidAmount: 0,
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


  onOpenModalCreateNote = (invoice) => {
    this.setState({ visibleCreateNote: true, selectedInvoice: invoice });
  }

  onCloseModalCreateNote = () => {
    this.setState({ visibleCreateNote: false, selectedInvoice: {} });
  }

  handleRequestClearance = (requestMessage) => {
    const { selectedInvoice } = this.state;
    if (selectedInvoice) {
      this.onCloseModalCreateNote();
      message.success("Your request has been submitted. Please allow up to 24 hours for the provider to review this.");

      request.post(requestClearance, { invoiceId: selectedInvoice?._id, message: requestMessage }).catch(err => {
        message.error(err.message);
      })
    } else {
      message.warn("Something went wrong. Please try again.");
    }
  }

  openModalPay = (url, paidAmount, totalPayment, minimumPayment = 0) => {
    this.setState({ visiblePay: true, returnUrl: url, totalPayment, minimumPayment, paidAmount });
  }

  closeModalPay = () => {
    this.setState({ visiblePay: false, returnUrl: '', totalPayment: 0, minimumPayment: 0, paidAmount: 0 });
  }

  render() {
    const { paidAmount, selectedInvoice, totalPayment, minimumPayment, visibleCreateNote, visibleInvoice, visiblePay, returnUrl } = this.state;
    const { auth, invoices } = this.props;
    const grades = JSON.parse(JSON.stringify(auth.academicLevels ?? []))?.slice(6)?.map(level => ({ text: level, value: level }));
    const invoiceTypeFilterOptions = [
      { text: 'Session', value: 1 },
      { text: 'Reschedule', value: 2 },
      { text: 'Cancel', value: 3 },
      { text: 'No show', value: 4 },
      { text: 'Past due balance', value: 5 },
    ]

    if (auth.user.role === 30) {
      invoiceTypeFilterOptions.push({ text: 'Admin', value: 6 });
    }

    const columns = [
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
        title: intl.formatMessage(messages.invoiceType), dataIndex: 'type', key: 'invoicetype',
        filters: invoiceTypeFilterOptions,
        onFilter: (value, record) => record.type === value,
        render: type => type === 1 ? 'Session' : type === 2 ? 'Reschedule' : type === 3 ? 'Cancel' : type === 4 ? 'No show' : type === 5 ? 'Past due balance' : type === 6 ? 'Admin-Subsidy' : '',
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
        render: invoice => invoice.isPaid ? (invoice.method === 2 && invoice.paidAmount < invoice.totalPayment) ? (
          <Button type='link' onClick={() => this.openModalPay(`${window.location.href}?s=${encryptParam('true')}&i=${encryptParam(invoice?._id)}`, invoice?.paidAmount, invoice?.totalPayment, invoice?.minimumPayment)}>
            <span className='text-primary'>{intl.formatMessage(msgModal.paynow)}</span>
          </Button>
        ) : null : (
          <div>
            {(auth.user?.role === PARENT && invoice.totalPayment > 0) ? (
              <Button type='link' onClick={() => this.openModalPay(`${window.location.href}?s=${encryptParam('true')}&i=${encryptParam(invoice?._id)}`, invoice?.paidAmount, invoice?.totalPayment, invoice?.minimumPayment)}>
                <span className='text-primary'>{intl.formatMessage(msgModal.paynow)}</span>
              </Button>
            ) : null}
            {(auth.user?.role === PARENT && [InvoiceType.NOSHOW, InvoiceType.BALANCE].includes(invoice.type)) ? (
              <Popconfirm
                title="Are you sure to send clearnace request?"
                onConfirm={() => this.onOpenModalCreateNote(invoice)}
                okText="Yes"
                cancelText="No"
                placement='left'
              >
                <Button type='link' className='px-5'><span className='text-primary'>Request clearance</span></Button>
              </Popconfirm>
            ) : null}
            {([InvoiceType.NOSHOW, InvoiceType.BALANCE].includes(invoice.type) && auth.user?.role === PROVIDER) ? (
              <Popconfirm
                title="Are you sure to clear this flag?"
                onConfirm={() => this.handleClearFlag(invoice)}
                okText="Yes"
                cancelText="No"
                placement='left'
              >
                <Button type='link'><span className='text-primary'>Clear flag</span></Button>
              </Popconfirm>
            ) : null}
          </div>
        ),
      },
    ];

    const modalInvoiceProps = {
      visible: visibleInvoice,
      onSubmit: this.handleUpdateInvoice,
      onCancel: this.closeModalInvoice,
      invoice: selectedInvoice,
    }
    const modalCreateNoteProps = {
      visible: visibleCreateNote,
      onSubmit: this.handleRequestClearance,
      onCancel: this.onCloseModalCreateNote,
      title: "Request Message"
    };

    const modalPayProps = {
      visible: visiblePay,
      onSubmit: this.openModalPay,
      onCancel: this.closeModalPay,
      returnUrl, totalPayment, minimumPayment, paidAmount,
    }

    return (
      <div className="full-layout page invoicelist-page">
        <Table
          bordered
          size='middle'
          dataSource={invoices}
          columns={columns}
          onRow={invoice => ({
            onClick: (e) => e.target.className.includes('ant-table-cell') && this.openModalInvoice(invoice._id),
            onDoubleClick: (e) => e.target.className.includes('ant-table-cell') && this.openModalInvoice(invoice._id),
          })}
          scroll={{ x: true }}
        />
        {visibleInvoice && <ModalInvoice {...modalInvoiceProps} />}
        {visibleCreateNote && <ModalCreateNote {...modalCreateNoteProps} />}
        {visiblePay && <ModalPay {...modalPayProps} />}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
})

export default compose(connect(mapStateToProps, { getInvoiceList, setInvoiceList }))(OutstandingList);