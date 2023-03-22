import React from 'react';
import { Grid, Box } from '@mui/material';
import DonationButton from './donationButton';
import Header from './header';
import Image4 from '../images/image_4.jpg';
import Caption from './caption';

const FourthSection = () => {
  return (
    <Grid item xs={12} padding="50px" width="75%" minWidth="1000px" maxWidth="1440px !important" margin="auto">
      <Box display="flex" pl="80px" pr="80px">
        <img src={Image4} width={387} height={553} loading="lazy" />
        <Box style={{
          backgroundColor: "#8445C0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          flexDirection: "column"
        }} gap="40px">
          <Caption text="Donate your services" style={{ color: 'white' }} />
          <Header text="Use your expertise to help a student in need by providing services at a reduced rate." style={{ fontSize: '2.5rem', color: 'white', padding: "0px 50px", textAlign: "center" }} />
          <DonationButton style={{ backgroundColor: 'white', color: '#8445C0' }}>Find out how</DonationButton>
        </Box>
      </Box>
    </Grid>
  )
}

export default FourthSection