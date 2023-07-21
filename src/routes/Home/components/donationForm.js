import React, { useState } from 'react';
import { Box, Button, Typography, FormControlLabel, TextField, Checkbox } from '@mui/material';
import { styled } from '@mui/material/styles';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import toast, { Toaster } from 'react-hot-toast';

import Header from './header';
import SubHeader from './subHeader';
import { PAYPAL_INFO } from 'utils/index';
import request from 'utils/api/request';
import { monthlyCustomAmount, donationReceipt, createPlan } from 'utils/api/apiList';

const StyledBoxTan = styled(Box)({
  backgroundColor: "#FBF2D4",
  border: "2px solid #8445C0",
  borderRadius: "8px",
  padding: "50px",
  gap: "30px"
});

const DonationForm = ({ paymentAmount, frequency, sponsoredChildren, packageSelected }) => {
  const [orderID, setOrderID] = useState(false);
  const [billingDetails, setBillingDetails] = useState("");
  const [donorEmail, setDonorEmail] = useState(undefined)
  const [sendReceipt, setSendReceipt] = useState(false)

  //paypal events
  const onPayPalButtonClick = (data, actions) => {
    if (paymentAmount < 1) {
      toast.error("The form is not valid.")
      return actions.reject();
    }
    else {
      return actions.resolve();
    }
  };

  const createSubscription = async (data, actions) => {
    if (packageSelected.planId) {
      return actions.subscription.create({
        plan_id: packageSelected.planId,
        quantity: sponsoredChildren || 1
      });
    } else {
      const response = await request.post(createPlan, { amount: paymentAmount / sponsoredChildren });
      if (response.success) {
        return actions.subscription.create({
          plan_id: response.data.id,
          quantity: sponsoredChildren || 1
        });
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  }

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: paymentAmount
          },
        },
      ],
      application_context: {
        shipping_preference: "NO_SHIPPING",
      },
    })
      .then((orderID) => {
        setOrderID(orderID);
        return orderID;
      });
  }

  const onApprove = (data, actions) => {
    if (frequency === 'monthly') {
      sendRequestMonthlyCustomAmount(paymentAmount, sponsoredChildren, packageSelected)
    }
    toast.success("Your payment has been processed! Thank you for your donation!")
    if (sendReceipt && donorEmail) {
      sendDonationReceipt(paymentAmount, donorEmail)
    }
    return actions.order.capture().then(function (details) {
      const { payer } = details;
      setBillingDetails(payer);
    })
  };

  const onError = (data, actions) => {
    toast.error("Something went wrong with your payment")
  };

  //email events
  const sendRequestMonthlyCustomAmount = (paymentAmount, sponsoredChildren, packageSelected) => {
    request.post(monthlyCustomAmount, { paymentAmount, sponsoredChildren, packageSelected }).then(result => {
      if (result.success) {
        this.setState({ isSent: true })
      } else {
        console.log('error sending email')
      }
    }).catch(err => {
      console.log('error trying to send email')
    })
  }

  const sendDonationReceipt = (money, email) => {
    request.post(donationReceipt, { money, email }).then(result => {
      if (result.success) {
        this.setState({ isSent: true })
      } else {
        console.log('error sending email')
      }
    }).catch(err => {
      console.log(err)
      console.log('error trying to generate or send donation receipt')
    })
  }

  //we're using undefined for the first argument in place of 'en-US' to use the system locale
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <StyledBoxTan>
      <Toaster />
      <Header style={{ fontSize: '52px', whiteSpace: 'noWrap' }} text="Donation Total:" />
      <Header style={{ fontSize: '41px', paddingBottom: '20px' }} text={`${formatter.format(paymentAmount || 0)} / ${frequency}`} />
      <Box mb="20px">
        <FormControlLabel
          control={<Checkbox checked={sendReceipt} onChange={(e) => setSendReceipt(e.target.checked)} />}
          label="Send Me A Receipt"
        />
        <TextField
          label="Email Address"
          fullWidth
          type="email"
          value={donorEmail}
          onChange={(e) => setDonorEmail(e.target.value)}
          variant="outlined"
          hidden={!sendReceipt}
        />
      </Box>
      <Box display={frequency === 'once' ? 'block' : 'none'}>
        <PayPalScriptProvider
          options={{
            "client-id": PAYPAL_INFO.clientId,
            components: "buttons",
            "data-namespace": "paypalOrder"
          }}
        >
          <PayPalButtons
            style={{
              color: "black",
              shape: "rect",
              label: "paypal",
              layout: "horizontal",
            }}
            onClick={onPayPalButtonClick}
            createOrder={createOrder}
            onApprove={onApprove}
            fundingSource="card"
            disabled={paymentAmount < 1}
            forceReRender={[paymentAmount, frequency]}
          />
        </PayPalScriptProvider>
      </Box>
      <Box display={frequency === 'monthly' ? 'block' : 'none'}>
        <PayPalScriptProvider
          options={{
            "client-id": PAYPAL_INFO.clientId,
            components: "buttons",
            intent: "subscription",
            vault: true,
          }}
        >
          <PayPalButtons
            style={{
              color: "black",
              shape: "rect",
              label: "paypal",
              layout: "horizontal",
            }}
            onClick={onPayPalButtonClick}
            createSubscription={createSubscription}
            onApprove={onApprove}
            fundingSource="card"
            disabled={paymentAmount < 1}
            forceReRender={[paymentAmount, frequency]}
            label="Subscribe"
          />
        </PayPalScriptProvider>
      </Box>
      <SubHeader style={{ textAlign: 'center' }} text="or" />
      <Button
        style={{ backgroundColor: "#eee", width: "100%", padding: "10px", marginTop: "10px" }}
        component="a"
        href="https://thedonorsfund.org/app/login"
        target="_blank"
        rel="noopener noreferrer">
        Donate with The Donors Fund
      </Button>
      <Box width="100%" textAlign="center">
        <Typography variant="caption">
          {"Please search for Tax ID: 36-6116829 (Association For Torah Advancement) from the available charities listed."}
        </Typography>
      </Box>
      <SubHeader style={{ paddingTop: '20px', textAlign: 'justify' }} text="Help Me Get Help is a project of the Association for Torah Advancement (AFTA). AFTA is a nonprofit organization. All donations are tax deductible." />
    </StyledBoxTan>
  )
}

export default DonationForm