import React from 'react';
import { Grid, Box } from '@mui/material';
import DonationButton from './donationButton';
import Header from './header';
import SubHeader from './subHeader'
import Image3 from '../images/image_3.jpg';
import Caption from './caption';

const ThirdSection = () => {
  return (    
    <Grid item xs={12} style={{
      padding: "50px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",          
      width: "75%",
      minWidth: "1000px",
      maxWidth: "1440px",
      margin: "auto",
    }}>
      <Box>
        <Box style={{
          width: "600px",
          height: "600px",
          backgroundColor: "#FFF5D1",
          borderRadius: "0 600px 0 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <img src={Image3} style={{
            width: "377px",
            height: "471px"
          }} />
        </Box>
      </Box>        
      <Box display="flex" flexDirection="column" gap="20px">
        <Caption text="Referrals" />
        <Header text="Get the clarity you need to help your child succeed" style={{ fontSize: "52px" }} />
        <SubHeader text={"Finding the right provider to assist your child can be overwhelming. Help Me Get Help offers free referral services to help you find the tutor or therapist that best suits your needs. With a large database of providers, our referral consultants can help you find someone who targets your child's specific needs, is available at a convenient time, or takes your insurance plan."} />
        <DonationButton>Get in touch</DonationButton>
      </Box>
    </Grid>
  )
}

export default ThirdSection