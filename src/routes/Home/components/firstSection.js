import React from 'react';
import { Grid, Box, Typography,  } from '@mui/material';
import DonationButton from './donationButton';
import Header from './header';
import SubHeader from './subHeader'
import Image1 from '../images/image_1.jpg';

const FirstSection = () => {
  return (
    <Grid item xs={12} style={{ 
      padding: "50px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      minWidth: "1000px",
      maxWidth: "1440px",
      margin: "auto",
    }}>
      <Box display="flex" flexDirection="column" gap="20px">
        <Header text="Give the gift of success." />
        <SubHeader
          text="Sponsor tutoring, speech or occupational therapy for a child in need."
          style={{ paddingRight: "40px" }}
        />
        <Box display="flex" gap="20px" alignItems="center">
          <DonationButton>Donate</DonationButton>
          <Typography>Donate your services</Typography>
        </Box>
      </Box>
      <img src={Image1} style={{
        width: "478px",
        height: "572px"
      }} />
    </Grid>
    
  )
}

export default FirstSection