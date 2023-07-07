import React, { createRef } from 'react';
import { Divider, Tabs, message } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { ModalInvoice } from 'components/Modal';
import msgMainHeader from 'components/MainHeader/messages';
import msgDrawer from 'components/DrawerDetail/messages';
import request, { decryptParam } from 'utils/api/request';
import { payInvoice } from 'utils/api/apiList';
import { getInvoiceList, setInvoiceList } from 'src/redux/features/appointmentsSlice';
import { MethodType } from 'src/routes/constant';
import PaidList from './paid';
import OutstandingList from './outstanding';

class InvoiceList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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
    const amount = decryptParam(params.get('v')?.replaceAll(' ', '+') || '');
    if (success === 'true' && (invoiceId)) {
      request.post(payInvoice, { invoiceId, method: MethodType.PAYPAL, amount }).then(res => {
        if (res.success) {
          message.success('Paid successfully');
          const url = window.location.href;
          const cleanUrl = url.split('?')[0];
          window.history.replaceState({}, document.title, cleanUrl);
          if (invoiceId) {
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

  handleChangeTab = (value) => {
    const { invoices } = this.props;
    this.setState({
      tabInvoices: JSON.parse(JSON.stringify(invoices)).filter(i => i.isPaid == value)?.map(f => ({ ...f, key: f._id })),
      selectedTab: value,
    })
  }

  render() {
    const { selectedInvoice, tabInvoices, visibleInvoice } = this.state;
    const items = [
      {
        key: '0',
        label: <span className="font-16">{intl.formatMessage(msgDrawer.outstanding)}</span>,
        children: (<OutstandingList invoices={tabInvoices} />),
      },
      {
        key: '1',
        label: <span className="font-16">{intl.formatMessage(msgDrawer.paid)}</span>,
        children: (
          <PaidList invoices={tabInvoices} />
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
      <div className="full-layout page invoicelist-page">
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
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  invoices: state.appointments.dataInvoices,
})

export default compose(connect(mapStateToProps, { getInvoiceList, setInvoiceList }))(InvoiceList);