import React, { useState } from 'react';
import { Grid, Box, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import Header from './header';
import SubHeader from './subHeader';
import { Form, Input } from 'antd';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { PAYPAL_CLIENT_ID } from '../../../utils/index';
import toast, { Toaster } from 'react-hot-toast';

const StyledBoxTan = styled(Box)({
  backgroundColor: "#FBF2D4",
  border: "2px solid #8445C0",
  borderRadius: "8px",
  padding: "50px",
  gap: "30px"
});

const DonationForm = ({ paymentAmount, frequency, sponsoredChildren, packageSelected }) => {
  const [form] = Form.useForm();
  const [orderID, setOrderID] = useState(false);
  const [billingDetails, setBillingDetails] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  
  //paypal events
  const onPayPalButtonClick = (data, actions) => {
    if (!isFormValid) {
      toast.error("The form is not valid.")
      return actions.reject();
    }
    else {
      return actions.resolve();
    }
  };
  const package_plans = [
    {
      name: 'Homework & Tutoring Plan',
      amount: 220,
      planId: 'P-93K62384A78529137MOWRNIA'
    },
    {
      name: 'Speech Therapy Plan',
      amount: 400,
      planId: 'P-90X28329VS5128505MOWRTKQ'
    },
    {
      name: 'Occupational Therapy Plan',
      amount: 650,
      planId: 'P-68T89259UE970873HMOWRXQQ'
    }
  ]
  const createSubscription = (data, actions) => {
    const plan = package_plans.find((p) => p.amount === packageSelected)
    return actions.subscription.create({
      plan_id: 'P-27U32078NC629723CMOXRP7Y', // plan.planId,
      quantity: sponsoredChildren
    });
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
    console.log('in Approve')
    return actions.order.capture().then(function (details) {
      const {payer} = details;
      setBillingDetails(payer);
      toast.success("Your payment has been processed!")
    })
  };

  const onError = (data, actions)=>{    
    toast.error("Something went wrong with your payment")
  };

  //form events
  const onFinish = (values) => {
    toast.success('Success:' + values);
  };

  const onFinishFailed = (errorInfo) => {
    toast.error('Failed:' + errorInfo);
  };

  const validateForm = (values) => {
    if (values[0].name.includes('email') && values[0].errors.length < 1)
      setIsFormValid(true)
  };

  //we're using undefined for the first argument in place of 'en-US' to use the system locale
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      onFieldsChange={validateForm}
      style={{ display: "flex", gap: "10%" }}
    >
      <StyledBoxTan style={{ width: '60%' }}>
        <Toaster />
        <Header text="Enter your details:" style={{ fontSize: '52px', paddingBottom: '30px' }} />
        <Grid container spacing={4}>
          <Grid item xs={6}>
            <Form.Item
              label="First Name"
              name="firstName"
            >
              <Input />
            </Form.Item>
          </Grid>
          <Grid item xs={6}>
            <Form.Item
              label="Last Name"
              name="lastName"
            >
              <Input />
            </Form.Item>
          </Grid>
          <Grid item xs={6}>
            <Form.Item
              label="Street Address"
              name="streetAddress"
            >
              <Input />
            </Form.Item>
          </Grid>
          <Grid item xs={6}>
            <Form.Item
              label="City"
              name="city"
            >
              <Input />
            </Form.Item>
          </Grid>
          <Grid item xs={6}>
            <Form.Item
              label="State"
              name="state"
            >
              <Input />
            </Form.Item>
          </Grid>
          <Grid item xs={6}>
            <Form.Item
              label="Zip"
              name="zip"
            >
              <Input />
            </Form.Item>
          </Grid>
          <Grid item xs={6}>
            <Form.Item
              label="Phone Number"
              name="phoneNumber"
            >
              <Input />
            </Form.Item>
          </Grid>
          <Grid item xs={6}>
            <Form.Item
              label="Mobile Number"
              name="mobileNumber"
            >
              <Input />
            </Form.Item>
          </Grid>            
          <Grid item xs={12}>
            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                {
                  type: 'email',
                  message: 'The input is not valid E-mail!',
                },
                {
                  required: true,
                  message: 'Please input your E-mail!',
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Grid>
        </Grid>
      </StyledBoxTan>
      <StyledBoxTan style={{ width: '36%', height: 'min-content', display: "flex", gap: "30px", flexDirection: "column" }}>
        <Header style={{ fontSize: '52px' }} text="Donation Total:" />
        <Header style={{ fontSize: '41px' }} text={`${formatter.format(paymentAmount)} / ${frequency}`} />
          <Form.Item>
            <Box display={frequency === 'once' ? 'block' : 'none'}>
              <PayPalScriptProvider
                options={{
                  "client-id": PAYPAL_CLIENT_ID.clientId,
                  components: "buttons",
                  "data-namespace": "paypalOrder"
                }}
              >
                <PayPalButtons
                  style={{
                    color: "silver",
                    shape: "rect",
                    label: "paypal",
                    layout: "horizontal",
                  }}
                  onClick={onPayPalButtonClick}
                  createOrder={createOrder}
                  onApprove={onApprove}
                  fundingSource="paypal"
                  disabled={!isFormValid}
                  forceReRender={[paymentAmount, frequency]}
                />
              </PayPalScriptProvider>
            </Box>
            <Box display={frequency === 'monthly' ? 'block' : 'none'}>
              <PayPalScriptProvider
                options={{
                  "client-id": PAYPAL_CLIENT_ID.clientId,
                  components: "buttons",
                  intent: "subscription",
                  vault: true,
                }}
              >
                <PayPalButtons
                  style={{
                    color: "silver",
                    shape: "rect",
                    label: "paypal",
                    layout: "horizontal",
                  }}
                  onClick={onPayPalButtonClick}
                  createSubscription={createSubscription}
                  onApprove={onApprove}
                  fundingSource="paypal"
                  disabled={!isFormValid}
                  forceReRender={[paymentAmount, frequency]}
                  label="Subscribe"
                />
              </PayPalScriptProvider>
            </Box>
            <Button
              style={{ backgroundColor: "#eee", width: "100%", padding: "10px", marginTop: "10px" }}
              component="a"
              href="https://thedonorsfund.org/app/login"
              target="_blank"
              rel="noopener noreferrer">
              Donate with The Donors Fund
            </Button>
          </Form.Item>
        <SubHeader text="Help Me Get Help is a project of the Association for Torah Advancement (AFTA). AFTA is a nonprofit organization. All donations are tax deductible." />
      </StyledBoxTan>
    </Form>
  )
}

export default DonationForm