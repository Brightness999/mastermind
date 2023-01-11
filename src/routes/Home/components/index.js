import React from 'react';
import { Grid, Box } from '@mui/material';
import NavigationBar from './navigationBar';
import FirstSection from './firstSection';
import SecondSection from './secondSection';
import ThirdSection from './thirdSection';
import FourthSection from './fourthSection';
import '../styles.less';

const Home = () => {
  return (    
    <>
      <Box style={{
        backgroundColor: '#FFF5D1',
        padding: "18px 50px 0px 50px"
      }}>
        <NavigationBar />
      </Box>
      <Grid container>
        <Box style={{ backgroundColor: '#FFF5D1', width: "100%" }}>
          <FirstSection />
        </Box>
        <SecondSection />
        <ThirdSection />
        <FourthSection />
      </Grid>
      <Box style={{
        backgroundColor: "#FBF2D4",
        padding: "56px 84px",
        color: "#2E2F2F",
        fontFamily: "Inter",
        fontSize: "14px",
        display: "flex",
        width: "100%",
        justifyContent: "space-between"
      }}>
        <Box>
          Copyright © 2022 Help Me Get Help. All Rights Reserved
        </Box>
        <Box style={{
          width: "491px"
        }}>
          {"Help Me Get Help is a project of the Association for Torah Advancement (AFTA). AFTA is a nonprofit organization. All donations are tax deductible."}
        </Box>
      </Box>
    </>
  )
}

export default Home