import React, { useState } from 'react';
import { Grid, Box, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import Header from './header';
import SubHeader from './subHeader';
// import { Form, Input } from 'antd';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { PAYPAL_CLIENT_ID } from '../../../utils/index';
import toast, { Toaster } from 'react-hot-toast';
import { url } from '../../../utils/api/baseUrl';
import axios from 'axios'

const StyledBoxTan = styled(Box)({
  backgroundColor: "#FBF2D4",
  border: "2px solid #8445C0",
  borderRadius: "8px",
  padding: "50px",
  gap: "30px"
});

const DonationForm = ({ paymentAmount, frequency, sponsoredChildren, packageSelected }) => {
  // const [form] = Form.useForm();
  const [orderID, setOrderID] = useState(false);
  const [billingDetails, setBillingDetails] = useState("");
  // const [isFormValid, setIsFormValid] = useState(false);
  
  //paypal events
  const onPayPalButtonClick = (data, actions) => {
    // if (!isFormValid) {
    if (paymentAmount < 1) {
      toast.error("The form is not valid.")
      return actions.reject();
    }
    else {      
      return actions.resolve();
    }
  };
  
  const createSubscription = (data, actions) => {
    return actions.subscription.create({
      plan_id: packageSelected.planId,
      quantity: sponsoredChildren || 1
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
    if (frequency === 'monthly') {
      sendRequestMonthlyCustomAmount(paymentAmount, sponsoredChildren, packageSelected)
    }
    toast.success("Your payment has been processed! Thank you for your donation!")
    sendDonationReceipt(paymentAmount)
    return actions.order.capture().then(function (details) {
      const {payer} = details;
      setBillingDetails(payer);
    })
  };

  const onError = (data, actions)=>{    
    toast.error("Something went wrong with your payment")
  };

  //email events
  const sendRequestMonthlyCustomAmount = (paymentAmount, sponsoredChildren, packageSelected) => {
    axios.post(url + 'donations/monthly_custom_amount', { paymentAmount, sponsoredChildren, packageSelected }
        ).then(result => {
            console.log('monthly_custom_amount', result.data);
            console.log(result.data)
            if (result.data.success) {
                var data = result.data.data;
                this.setState({isSent:true})
            } else {
              console.log('error sending email')
            }

        }).catch(err=>{
          console.log('error trying to send email')
        })
  }

  const sendDonationReceipt = (money) => {
    axios.post(url + 'donations/donation_receipt', { money }
        ).then(result => {
            console.log('donation_receipt', result.data);
            console.log(result.data)
            if (result.data.success) {
                var data = result.data.data;
                this.setState({isSent:true})
            } else {
              console.log('error sending email')
            }

        }).catch(err=>{
          console.log(err)
          console.log('error trying to generate or send donation receipt')
        })
  }

  // //form events
  // const onFinish = (values) => {
  //   toast.success('Success:' + values);
  // };

  // const onFinishFailed = (errorInfo) => {
  //   toast.error('Failed:' + errorInfo);
  // };

  // const validateForm = (values) => {
  //   if (values[0].name.includes('email') && values[0].errors.length < 1)
  //     setIsFormValid(true)
  // };

  //we're using undefined for the first argument in place of 'en-US' to use the system locale
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  });

  return (
    // <Form
    //   form={form}
    //   layout="vertical"
    //   onFinish={onFinish}
    //   onFinishFailed={onFinishFailed}
    //   onFieldsChange={validateForm}
    //   style={{ display: "flex", gap: "10%" }}
    // >
    //   <StyledBoxTan style={{ width: '60%' }}>
    //     <Header text="Enter your details:" style={{ fontSize: '52px', paddingBottom: '30px' }} />
    //     <Grid container spacing={4}>
    //       <Grid item xs={6}>
    //         <Form.Item
    //           label="First Name"
    //           name="firstName"
    //         >
    //           <Input />
    //         </Form.Item>
    //       </Grid>
    //       <Grid item xs={6}>
    //         <Form.Item
    //           label="Last Name"
    //           name="lastName"
    //         >
    //           <Input />
    //         </Form.Item>
    //       </Grid>
    //       <Grid item xs={6}>
    //         <Form.Item
    //           label="Street Address"
    //           name="streetAddress"
    //         >
    //           <Input />
    //         </Form.Item>
    //       </Grid>
    //       <Grid item xs={6}>
    //         <Form.Item
    //           label="City"
    //           name="city"
    //         >
    //           <Input />
    //         </Form.Item>
    //       </Grid>
    //       <Grid item xs={6}>
    //         <Form.Item
    //           label="State"
    //           name="state"
    //         >
    //           <Input />
    //         </Form.Item>
    //       </Grid>
    //       <Grid item xs={6}>
    //         <Form.Item
    //           label="Zip"
    //           name="zip"
    //         >
    //           <Input />
    //         </Form.Item>
    //       </Grid>
    //       <Grid item xs={6}>
    //         <Form.Item
    //           label="Phone Number"
    //           name="phoneNumber"
    //         >
    //           <Input />
    //         </Form.Item>
    //       </Grid>
    //       <Grid item xs={6}>
    //         <Form.Item
    //           label="Mobile Number"
    //           name="mobileNumber"
    //         >
    //           <Input />
    //         </Form.Item>
    //       </Grid>            
    //       <Grid item xs={12}>
    //         <Form.Item
    //           label="Email Address"
    //           name="email"
    //           rules={[
    //             {
    //               type: 'email',
    //               message: 'The input is not valid E-mail!',
    //             },
    //             {
    //               required: true,
    //               message: 'Please input your E-mail!',
    //             },
    //           ]}
    //         >
    //           <Input />
    //         </Form.Item>
    //       </Grid>
    //     </Grid>
    //   </StyledBoxTan>
      <StyledBoxTan
        // style={{ width: '36%', height: 'min-content', display: "flex", gap: "30px", flexDirection: "column" }}
      >
        <Toaster />
        <Header style={{ fontSize: '52px', whiteSpace: 'noWrap' }} text="Donation Total:" />
        <Header style={{ fontSize: '41px', paddingBottom: '20px' }} text={`${formatter.format(paymentAmount || 0)} / ${frequency}`} />
        {/* <Button onClick={() => sendDonationReceipt(paymentAmount)}>Send Receipt</Button> */}
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
                  color: "black",
                  shape: "rect",
                  label: "paypal",
                  layout: "horizontal",
                }}
                onClick={onPayPalButtonClick}
                createOrder={createOrder}
                onApprove={onApprove}
                fundingSource="card"
                // disabled={!isFormValid}
                disabled={paymentAmount < 1}
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
                  color: "black",
                  shape: "rect",
                  label: "paypal",
                  layout: "horizontal",
                }}
                onClick={onPayPalButtonClick}
                createSubscription={createSubscription}
                onApprove={onApprove}
                fundingSource="card"
                // disabled={!isFormValid}
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
    // </Form>
  )
}

export default DonationForm