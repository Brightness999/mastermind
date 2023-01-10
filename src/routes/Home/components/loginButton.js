import React from 'react'
import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';

const LoginButton = styled(Button)({
  textTransform: 'none',
  fontSize: 16,
  color: '#35735C',
  backgroundColor: "transparent",
  border: 'thin solid #35735C',
  padding: '0px 20px',
  '&:hover': {
    backgroundColor: '#ebdeb1',
    boxShadow: 'none',
  },
});

export default LoginButton