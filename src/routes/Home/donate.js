import React, { useState, useEffect } from 'react';
import { Grid, Box, ButtonGroup, Typography, Chip, Switch, FormControlLabel, TextField, InputAdornment } from '@mui/material';
import { ReactComponent as ManFilled } from './images/man_filled.svg';
import { ReactComponent as ManUnfilled } from './images/man_unfilled.svg';
import { styled } from '@mui/material/styles';
import { BsBook } from 'react-icons/bs';
import { SlSpeech } from 'react-icons/sl';
import { CiBasketball } from 'react-icons/ci';
import { AiOutlineEye } from 'react-icons/ai';
import { BiCaretUp, BiCaretDown } from 'react-icons/bi';
import NavigationBar from './components/navigationBar';
import FirstDonateSection from './components/firstDonateSection';
import DonationForm from './components/donationForm';

const StyledBoxGreen = styled(Box)({
  fontFamily: "ProximaNova",
  fontWeight: "700px",
  width: "279px",
  height: "220px",
  border: "thin solid #35735C",
  borderRadius: "7px",
  display: "flex",
  flexDirection: "column",
  gap: "18px",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  color: "#35735C",
  margin: "20px",
  '&:hover': {
    backgroundColor: '#35735C',
    color: "white",
    cursor: "pointer"
  },
});



const StyledBoxTan = styled(Box)({
  backgroundColor: "#FBF2D4",
  border: "2px solid #8445C0",
  borderRadius: "8px",
  color: "#8445C0",
  padding: "0px 15px",
  gap: "20px"
});

const StyledSwitch = styled(Switch)({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: "#8445C0"
  },
  ['& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track']: {
    backgroundColor: "#8445C0"
  }
})

const Donate = () => {
  const package_plans = [
    {
      name: 'Specialized Tutoring Plan',
      amount: 600,
      sessions: 8,
      planId: 'P-1M580609XD9766844MS5MFRY',
      icon: <BsBook size="36px" />
    },
    {
      name: 'Speech Therapy Plan',
      amount: 280,
      sessions: 8,
      planId: 'P-7C907100Y0009390HMS5MF2A',
      icon: <SlSpeech size="36px" />
    },
    {
      name: 'Occupational Therapy Plan',
      amount: 320,
      sessions: 4,
      planId: 'P-4W365141N6088254XMS5MGAA',
      icon: <CiBasketball size="36px" />
    },
    {
      name: 'Vision Therapy',
      amount: 320,
      sessions: 4,
      planId: 'P-9R274401NG876681NMS5MGIQ',
      icon: <AiOutlineEye size="36px" />
    },
    {
      name: 'Custom'
    }
  ]
  const [donateMonthly, setDonateMonthly] = useState(true)
  const [sponsoredChildren, setSponsoredChildren] = useState(donateMonthly ? 12 : 1)
  const [packageSelected, setPackageSelected] = useState(package_plans[0])
  const [amount, setAmount] = useState(packageSelected.amount * sponsoredChildren);
  const [customValue, setCustomValue] = useState(0);

  useEffect(() => {
    if (packageSelected?.amount) setAmount(packageSelected.amount * sponsoredChildren)
    else setAmount(customValue * sponsoredChildren)
  }, [packageSelected, sponsoredChildren, customValue])

  const onManClick = (index) => {
    setSponsoredChildren(index + 1)
    drawMen()
  }

  const drawMen = () => ([...Array(12)].map((item, index) => sponsoredChildren >= (index + 1) ? <ManFilled key={index} onClick={() => onManClick(index)} style={{ cursor: "pointer" }} /> : <ManUnfilled key={index} onClick={() => onManClick(index)} style={{ cursor: "pointer" }} />))

  const handleIncrement = () => {
    setSponsoredChildren((previousValue) => previousValue + 1)
  }
  const handleDecrement = () => {
    setSponsoredChildren((previousValue) => previousValue - 1)
  }
  return (
    <Box style={{
      width: 'fit-content'
    }}>
      <Box style={{
        backgroundColor: '#FFF5D1',
        padding: "18px 50px 0px 50px"
      }}>
        <NavigationBar />
      </Box>
      <Grid container>
        <Box style={{ backgroundColor: '#FFF5D1', width: "100%" }}>
          <FirstDonateSection />
        </Box>
        <Grid item xs={12} style={{
          padding: "50px",
          width: "75%",
          minWidth: "1000px",
          maxWidth: "1440px",
          margin: "auto",
        }}>
          <Typography style={{
            fontFamily: 'Quincy',
            fontSize: '52px',
            color: '#35735C',
            lineHeight: 1,
            paddingBottom: "30px",
          }}>
            Select your package:
          </Typography>
          <Box style={{
            display: "flex",
            flexFlow: "wrap",
            justifyContent: "center",
            fontFamily: "ProximaNova",
            fontSize: "17px",
            textTransform: "uppercase",
            color: "#B5E6D3"
          }}>
            {package_plans.map((p, index) => (
              <StyledBoxGreen key={index} onClick={() => setPackageSelected(p)} sx={{
                backgroundColor: packageSelected.name === p.name ? '#35735C' : '#B5E6D3',
                color: packageSelected.name === p.name ? 'white' : '#35735C'
              }}>
                {p.name === "Custom" ?
                  <>
                    <TextField
                      type="number"
                      onChange={(e) => donateMonthly ? setCustomValue(e.target.value) : setAmount(e.target.value)}
                      variant="outlined"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                    <Typography>
                      Custom Amount
                    </Typography>
                  </> :
                  <>
                    {p.icon}
                    <Typography>
                      {p.name}
                      <br />
                      {p.sessions} Sessions
                    </Typography>
                    <Chip label={`$${p.amount}`} />
                  </>
                }
              </StyledBoxGreen>
            ))}
          </Box>
        </Grid>
        <Grid item xs={12} style={{
          padding: "50px",
          width: "75%",
          minWidth: "1000px",
          maxWidth: "1440px",
          margin: "auto",
        }}>
          <Typography style={{
            fontFamily: 'Quincy',
            fontSize: '52px',
            color: '#35735C',
            lineHeight: 1,
            paddingBottom: "30px",
            textAlign: "center"
          }}>
            {"Amount of children you'd like to sponsor"}
          </Typography>
          <Box display="flex" flexDirection="column" gap="20px" alignItems="center">
            <Box display="flex">
              <Box>
                <StyledBoxTan>
                  <ButtonGroup style={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column"
                  }}>
                    <BiCaretUp onClick={handleIncrement} style={{
                      fontSize: "65px",
                      cursor: "pointer"
                    }} />
                    <Typography style={{
                      fontSize: "65px",
                      lineHeight: '.5'
                    }}>
                      {sponsoredChildren}
                    </Typography>
                    <BiCaretDown onClick={handleDecrement} style={{
                      fontSize: "65px",
                      cursor: "pointer"
                    }} />
                  </ButtonGroup>
                </StyledBoxTan>
                <StyledBoxTan style={{ display: "flex", alignItems: "center" }}>
                  <FormControlLabel
                    control={<StyledSwitch
                      checked={donateMonthly}
                      onChange={(event) => {
                        setDonateMonthly(event.target.checked);
                        setSponsoredChildren(event.target.checked ? 12 : 1);
                      }}
                    />}
                    label={donateMonthly ? "monthly" : "once"}
                    labelPlacement="bottom"
                    sx={{
                      paddingBottom: "15px",
                      '& .MuiFormControlLabel-label': {
                        lineHeight: '.15'
                      }
                    }}
                  />
                </StyledBoxTan>
              </Box>
              <Box display="flex" gap="17px" pl="17px" style={{
                flexFlow: "row wrap",
                alignItems: "center",
                maxWidth: "310px"
              }}>
                {drawMen()}
              </Box>
            </Box>
            <Box style={{ width: "min-content" }}>
              <DonationForm
                paymentAmount={amount}
                frequency={donateMonthly ? "monthly" : "once"}
                sponsoredChildren={sponsoredChildren}
                packageSelected={packageSelected}
              />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} style={{
          padding: "50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "75%",
          minWidth: "1000px",
          maxWidth: "1440px",
          margin: "auto",
        }}>
        </Grid>
        <Grid item xs={12} style={{
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
        </Grid>
      </Grid>
    </Box>
  )
}

export default Donate