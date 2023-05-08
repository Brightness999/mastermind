import React from 'react';
import { Grid, Box } from '@mui/material';
import Header from './header';
import SubHeader from './subHeader'
import Image5 from '../images/image_5.png';

const FirstDonateSection = () => {
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
        <Header text="Your donation will help a child succeed" />
        <SubHeader text="Sponsor tutoring, speech, or occupational therapy for a child in need." style={{ paddingRight: "40px" }} />
      </Box>
      <img src={Image5} alt='child_with_tablet' style={{
        width: "501px",
        height: "418px"
      }} />
    </Grid>

  )
}

export default FirstDonateSection