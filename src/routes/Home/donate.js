import React, { useState } from 'react';
import { Grid, Box, ButtonGroup, Typography, Chip, Switch, FormControlLabel } from '@mui/material';
import { ReactComponent as ManFilled } from './images/man_filled.svg';
import { ReactComponent as ManUnfilled } from './images/man_unfilled.svg';
import { styled } from '@mui/material/styles';
import { BsBook } from 'react-icons/bs';
import { SlSpeech } from 'react-icons/sl';
import { CiBasketball } from 'react-icons/ci';
import { BiCaretUp, BiCaretDown } from 'react-icons/bi';
import NavigationBar from './components/navigationBar';
import FirstDonateSection from './components/firstDonateSection';
import DonationForm from './components/donationForm';
import { useEffect } from 'react';


const StyledBoxGreen = styled(Box)({
  fontFamily: "ProximaNova",
  fontWeight: "700px",
  width: "279px",
  height: "220px",
  backgroundColor: "#B5E6D3",
  border: "thin solid #35735C",
  borderRadius: "7px",
  display: "flex",
  flexDirection: "column",
  gap: "18px",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  color: "#35735C",
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
  const [donateMonthly, setDonateMonthly] = useState(false)
  const [sponsoredChildren, setSponsoredChildren] = useState(0)
  const [packageSelected, setPackageSelected] = useState(0)
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    setAmount(packageSelected * sponsoredChildren)
  }, [packageSelected, sponsoredChildren])
  
  const onManClick = (index) => {
    setSponsoredChildren(index + 1)
    drawMen()
  }
  
  const drawMen = () => ([...Array(28)].map((item, index) => sponsoredChildren >= (index + 1) ? <ManFilled onClick={() => onManClick(index)} style={{ cursor: "pointer" }} /> : <ManUnfilled onClick={() => onManClick(index)} style={{ cursor: "pointer" }} />))
  
  const handleIncrement = () => {
    setSponsoredChildren((previousValue) => previousValue + 1)
  }
  const handleDecrement = () => {
    setSponsoredChildren((previousValue) => previousValue - 1)
  }
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
          {/* <Radio.Group>
            <Radio.Button value="220" style={{ height: '500px' }}>
              <Box>
                <BsBook size="36px" />
                <Typography>
                  Homework / Tutoring
                  <br/>
                  8 Sessions
                </Typography>
                <Chip label="$220" />
              </Box>
            </Radio.Button>
            <Radio.Button value="400">
              <SlSpeech size="36px" />
              <Typography>
                Speech Therapy
                <br/>
                8 Sessions
              </Typography>
              <Chip label="$400" />
            </Radio.Button>
            <Radio.Button value="650">
              <CiBasketball size="36px" />
              <Typography>
                Occupational Therapy
                <br/>
                8 Sessions
              </Typography>
              <Chip label="$650" />
            </Radio.Button>
          </Radio.Group> */}
          <Box style={{
            display: "flex",
            justifyContent: "space-evenly",
            fontFamily: "ProximaNova",
            fontSize: "17px",
            textTransform: "uppercase",
            color: "#B5E6D3"
          }}>
            <StyledBoxGreen onClick={() => setPackageSelected(220)}>
              <BsBook size="36px" />
              <Typography>
                Homework / Tutoring
                <br/>
                8 Sessions
              </Typography>
              <Chip label="$220" />
            </StyledBoxGreen>
            <StyledBoxGreen onClick={() => setPackageSelected(400)}>
              <SlSpeech size="36px" />
              <Typography>
                Speech Therapy
                <br/>
                8 Sessions
              </Typography>
              <Chip label="$400" />
            </StyledBoxGreen>
            <StyledBoxGreen onClick={() => setPackageSelected(650)}>
              <CiBasketball size="36px" />
              <Typography>
                Occupational Therapy
                <br/>
                8 Sessions
              </Typography>
              <Chip label="$650" />
            </StyledBoxGreen>
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
              paddingBottom: "30px"
            }}>
              {"Amount of children you'd like to sponsor"}
          </Typography>
          <Box display="flex">
            <Box>
              <StyledBoxTan>
                <ButtonGroup style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                }}>
                  <BiCaretUp onClick={handleIncrement} style={{
                    fontSize: "65px",
                    cursor: "pointer"
                  }} />
                  <Typography style={{
                    fontSize: "65px",
                    lineHeight: '0.4'
                  }}>
                    {sponsoredChildren}
                  </Typography>                
                  <BiCaretDown onClick={handleDecrement} style={{
                    fontSize: "65px",
                    cursor: "pointer"
                  }} />
                </ButtonGroup>
              </StyledBoxTan>
              <StyledBoxTan mt="18px">
                <FormControlLabel 
                  control={<StyledSwitch
                    checked={donateMonthly}
                    onChange={(event) => setDonateMonthly(event.target.checked)}
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
            <Box display="flex" gap="20px" style={{
              flexFlow: "row wrap",
              alignItems: "center",
              marginLeft: "30px"
            }}>
              {drawMen()}
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} style={{
          padding: "50px",
          display: "flex",
          alignItems: "top",
          justifyContent: "space-between",     
          width: "75%",
          minWidth: "1000px",
          maxWidth: "1440px",
          margin: "auto"
        }}>
          <DonationForm paymentAmount={amount} frequency={donateMonthly ? "monthly" : "once"} sponsoredChildren={sponsoredChildren} packageSelected={packageSelected} />
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
    </>
  )
}

export default Donate