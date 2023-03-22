import React from 'react';
import { Grid, Box } from '@mui/material';
import DonationButton from './donationButton';
import Header from './header';
import SubHeader from './subHeader';
import Caption from './caption';
import Image2 from '../images/image_2.jpg';

const SecondSection = () => {
  return (
    <Grid item xs={12} padding="50px" display="flex" alignItems="center" justifyContent="space-between" width="75%" minWidth="1000px" maxWidth="1440px !important" margin="auto">
      <Box display="flex" flexDirection="column" gap="20px">
        <Caption text="Give the gift of success" />
        <Header text={"Making a child's achievement possible"} style={{ fontSize: "52px" }} />
        <SubHeader text="Every child deserves to taste success. At Help Me Get Help, we make that possible. Through complimentary referral services, student advocating, and financial support, Help Me Get Help navigates the barriers preventing children from getting the help they need and paves the road to each child's success." />
        <DonationButton>Donate</DonationButton>
      </Box>
      <Box>
        <Box style={{
          width: "600px",
          height: "600px",
          backgroundColor: "#B5E6D3",
          borderRadius: "0 0 0 600px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <img src={Image2} width={377} height={471} loading="lazy" />
        </Box>
      </Box>
    </Grid>
  )
}

export default SecondSection