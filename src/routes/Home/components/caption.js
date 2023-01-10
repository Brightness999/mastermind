import React from 'react'
import { Typography } from '@mui/material'
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  text: {
    fontFamily: 'ProximaNova',
    fontSize: '13px',
    textTransform: 'uppercase',
    color: '#35735C',
  }
});

const Caption = ({ text, ...rest }) => {
  const classes = useStyles()
  return (
    <Typography className={classes.text} {...rest}>
      {text}
    </Typography>
  )
}

export default Caption