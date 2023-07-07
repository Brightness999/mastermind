import React, { createRef } from 'react';
import { Divider, Tabs, message } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';

import msgMainHeader from 'components/MainHeader/messages';
import msgCreateAccount from 'routes/Sign/CreateAccount/messages';
import msgDrawer from 'components/DrawerDetail/messages';
import request, { decryptParam } from 'src/utils/api/request';
import { payInvoice } from 'src/utils/api/apiList';
import { getInvoiceList, setInvoiceList } from 'src/redux/features/appointmentsSlice';
import Subsidy from './subsidy';
import SubsidyProcessed from './subsidyProcessed';
import Paid from './paid';
import Outstanding from './outstanding';
import { MethodType } from 'routes/constant';
import ParentSubsidyList from './parentSubsidy';
import ParentSubsidyPaidList from './parentSubsidyPaid';

class InvoiceList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabInvoices: [],
      selectedTab: '2',
    };
    this.searchInput = createRef(null);
  }

  componentDidMount() {
    const { auth, invoices } = this.props;
    const params = new URLSearchParams(window.location.search);
    const success = decryptParam(params.get('s')?.replaceAll(' ', '+') || '');
    const invoiceId = decryptParam(params.get('i')?.replaceAll(' ', '+') || '');
    const amount = decryptParam(params.get('v')?.replaceAll(' ', '+') || '');
    if (success === 'true' && invoiceId) {
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
    this.setState({ tabInvoices: invoices?.length ? JSON.parse(JSON.stringify(invoices))?.filter(i => !i.isPaid && i.type === 6)?.map(f => ({ ...f, key: f._id })) : [] });
    this.props.getInvoiceList({ role: auth.user.role });
  }

  componentDidUpdate(prevProps) {
    const { selectedTab } = this.state;
    const { invoices } = this.props;
    if (JSON.stringify(prevProps.invoices) != JSON.stringify(invoices)) {
      if (selectedTab === '0') {
        this.setState({
          tabInvoices: JSON.parse(JSON.stringify(invoices)).filter(i => !i.isPaid && (i.type != 6 && !(i.type === 1 && i.data[0]?.appointment?.type === 5)))?.map(f => ({ ...f, key: f._id })),
        })
      } else if (selectedTab === '1') {
        this.setState({
          tabInvoices: JSON.parse(JSON.stringify(invoices)).filter(i => i.isPaid && (i.type != 6 && !(i.type === 1 && i.data[0]?.appointment?.type === 5)))?.map(f => ({ ...f, key: f._id })),
        })
      } else if (selectedTab === '2') {
        this.setState({
          tabInvoices: JSON.parse(JSON.stringify(invoices)).filter(i => !i.isPaid && i.type === 6)?.map(f => ({ ...f, key: f._id })),
        })
      } else if (selectedTab === '3') {
        this.setState({
          tabInvoices: JSON.parse(JSON.stringify(invoices)).filter(i => i.isPaid && i.type === 6)?.map(f => ({ ...f, key: f._id })),
        })
      } else if (selectedTab === '4') {
        this.setState({
          tabInvoices: JSON.parse(JSON.stringify(invoices)).filter(i => !i.isPaid && i.type === 1 && i.data[0]?.appointment?.type === 5)?.map(f => ({ ...f, key: f._id })),
        })
      } else if (selectedTab === '5') {
        this.setState({
          tabInvoices: JSON.parse(JSON.stringify(invoices)).filter(i => i.isPaid && i.type === 1 && i.data[0]?.appointment?.type === 5)?.map(f => ({ ...f, key: f._id })),
        })
      } else {
        this.setState({
          tabInvoices: [],
        })
      }
    }
  }

  handleChangeTab = (value) => {
    const { invoices } = this.props;

    if (value === '0') {
      this.setState({
        tabInvoices: JSON.parse(JSON.stringify(invoices)).filter(i => !i.isPaid && (i.type != 6 && !(i.type === 1 && i.data[0]?.appointment?.type === 5)))?.map(f => ({ ...f, key: f._id })),
        selectedTab: value,
      })
    } else if (value === '1') {
      this.setState({
        tabInvoices: JSON.parse(JSON.stringify(invoices)).filter(i => i.isPaid && (i.type != 6 && !(i.type === 1 && i.data[0]?.appointment?.type === 5)))?.map(f => ({ ...f, key: f._id })),
        selectedTab: value,
      })
    } else if (value === '2') {
      this.setState({
        tabInvoices: JSON.parse(JSON.stringify(invoices)).filter(i => !i.isPaid && i.type === 6)?.map(f => ({ ...f, key: f._id })),
        selectedTab: value,
      })
    } else if (value === '3') {
      this.setState({
        tabInvoices: JSON.parse(JSON.stringify(invoices)).filter(i => i.isPaid && i.type === 6)?.map(f => ({ ...f, key: f._id })),
        selectedTab: value,
      })
    } else if (value === '4') {
      this.setState({
        tabInvoices: JSON.parse(JSON.stringify(invoices)).filter(i => !i.isPaid && i.type === 1 && i.data[0]?.appointment?.type === 5)?.map(f => ({ ...f, key: f._id })),
        selectedTab: value,
      })
    } else if (value === '5') {
      this.setState({
        tabInvoices: JSON.parse(JSON.stringify(invoices)).filter(i => i.isPaid && i.type === 1 && i.data[0]?.appointment?.type === 5)?.map(f => ({ ...f, key: f._id })),
        selectedTab: value,
      })
    } else {
      this.setState({
        tabInvoices: [],
        selectedTab: value,
      })
    }
  }

  render() {
    const { tabInvoices } = this.state;
    const items = [
      {
        key: '2',
        label: <span className="font-16">{intl.formatMessage(msgCreateAccount.subsidy)}</span>,
        children: (<Subsidy invoices={tabInvoices} />),
      },
      {
        key: '3',
        label: <span className="font-16">{intl.formatMessage(msgDrawer.subsidyProcessed)}</span>,
        children: (<SubsidyProcessed invoices={tabInvoices} />),
      },
      {
        key: '4',
        label: <span className="font-16">{intl.formatMessage(msgCreateAccount.parentSubsidy)}</span>,
        children: (<ParentSubsidyList invoices={tabInvoices} />),
      },
      {
        key: '5',
        label: <span className="font-16">{intl.formatMessage(msgCreateAccount.parentSubsidyPaid)}</span>,
        children: (<ParentSubsidyPaidList invoices={tabInvoices} />),
      },
      {
        key: '1',
        label: <span className="font-16">{intl.formatMessage(msgDrawer.paid)}</span>,
        children: (<Paid invoices={tabInvoices} />),
      },
      {
        key: '0',
        label: <span className="font-16">{intl.formatMessage(msgDrawer.outstanding)}</span>,
        children: (<Outstanding invoices={tabInvoices} />),
      },
    ]

    return (
      <div className="full-layout page invoicelist-page">
        <div className='div-title-admin'>
          <p className='font-16 font-500'>{intl.formatMessage(msgMainHeader.invoiceList)}</p>
          <Divider />
        </div>
        <Tabs
          defaultActiveKey="2"
          type="card"
          size='small'
          items={items}
          className="bg-white p-10 h-100 overflow-y-scroll overflow-x-hidden"
          onChange={this.handleChangeTab}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  invoices: state.appointments.dataInvoices,
})

export default compose(connect(mapStateToProps, { getInvoiceList, setInvoiceList }))(InvoiceList);