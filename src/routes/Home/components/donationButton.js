import React from 'react'
import { Button } from '@mui/material';
import { makeStyles } from "@mui/styles";
import { routerLinks } from "../../../routes/constant";
import { Link } from 'dva/router';

const useStyles = makeStyles({
  text: {
    textTransform: 'none',
    fontSize: 16,
    color: 'white',
    backgroundColor: "#8445C0",
    boxShadow: 'none',
    padding: '13px 51px',
  }
});

const DonationButton = ({...rest}) => {
  const classes = useStyles()
  return (
    <Button className={classes.text} {...rest}>
      <Link to={routerLinks['Donate']} style={{
        color: 'inherit'
      }}>
        Donate Now
      </Link>
    </Button>
  )
}
export default DonationButton