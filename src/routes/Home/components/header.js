import React from 'react'
import { Typography } from '@mui/material'
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  text: {
    fontFamily: 'Quincy',
    fontSize: '74px',
    color: '#35735C',
    lineHeight: 1,
    width: '100%'
  },
});

const Header = ({ text, ...rest }) => {
  const classes = useStyles()
  return (
    <Typography className={classes.text} {...rest}>
      {text}
    </Typography>
  )
}

export default Header