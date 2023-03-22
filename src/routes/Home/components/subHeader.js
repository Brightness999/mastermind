import React from 'react'
import { Typography } from '@mui/material'
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  text: {
    fontFamily: 'ProximaNova',
    fontSize: '18px',
    lineHeight: '28px',
    width: '100%',
    textAlign: "justify"
  }
});

const SubHeader = ({ text, ...rest }) => {
  const classes = useStyles()
  return (
    <Typography className={classes.text} {...rest} >
      {text}
    </Typography>
  )
}

export default SubHeader