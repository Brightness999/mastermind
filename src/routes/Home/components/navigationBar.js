import React from 'react'
import { ReactComponent as Logo } from '../images/HMGHLogo.svg';
import { Link } from 'dva/router';
import { routerLinks } from "../../../routes/constant";
import { Box } from "@mui/material";
import LoginButton from './loginButton';
import DonationButton from './donationButton';

const NavigationBar = () => {
  return (    
    <Box id="navigationBar" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: "center",
    }}>
      <Box
        id="menu"
        sx={{
          display: "flex",
          alignItems: "flex-start",
          fontSize: "16px",
          color: "#35735C",
          fontFamily: 'Inter'
        }}
        gap="35px"
      >
        <Link to={routerLinks['Home']} style={{
            color: 'inherit'
          }}>
          Home
        </Link>
        <Link to={routerLinks['Referrals']} style={{
            color: 'inherit'
          }}>
          Referrals
        </Link>
        <Link to={routerLinks['Opportunities']} style={{
            color: 'inherit'
          }}>
          Opportunities
        </Link>
      </Box>
      <Logo />
      <Box id="buttons" display="flex" gap="20px">
        <LoginButton>
          <Link to={routerLinks['Login']} style={{
            color: 'inherit'
          }}>
            Login/Register
          </Link>
        </LoginButton>
        <DonationButton style={{
            background: "#35735C",
            padding: '0p 20px',
            border: 'thin solid #35735C',
            '&:hover': {
              backgroundColor: '#255241',
              boxShadow: 'none',
            },
          }} />
      </Box>
    </Box>
  )
}

export default NavigationBar