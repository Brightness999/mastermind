import React from 'react'
import { Box, Typography } from '@mui/material';
import NavigationBar from './components/navigationBar'

const Opportunities = () => {
  return (
    <>
      <Box style={{
        backgroundColor: '#FFF5D1',
        padding: "18px 50px 0px 50px"
      }}>
        <NavigationBar />
      </Box>
      <Typography>Coming Soon!</Typography>
    </>
  )
}

export default Opportunities