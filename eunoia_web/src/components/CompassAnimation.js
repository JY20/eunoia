import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// Original spin animation - let's try to make this one work first if keyframes are okay
const spin = keyframes`
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(80deg) scale(1); 
  }
  100% {
    transform: rotate(-180deg) scale(1);
  }
`;

// Test opacity spin, keeping it for fallback
const testSpinOpacity = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.2; }
  100% { opacity: 1; }
`;

const CompassContainer = styled(Box)(({ theme }) => ({
  width: '250px',
  height: '250px',
  backgroundColor: '#F3F3F3',
  borderRadius: '100%',
  backgroundImage: 'linear-gradient(to bottom, #F7F7F7, #ECECEC)',
  position: 'relative',
  margin: '0 auto',
  [theme.breakpoints.down('sm')]: {
    width: '180px',
    height: '180px',
  },
}));

const CompassInner = styled(Box)(({ theme }) => ({
  width: '210px',
  height: '210px',
  backgroundColor: '#3D3D3D',
  borderRadius: '100%',
  position: 'relative',
  left: '17.5px',
  top: '17.5px',
  border: '3px solid #C5C5C5',
  [theme.breakpoints.down('sm')]: {
    width: '150px',
    height: '150px',
    left: '12.5px',
    top: '12.5px',
  },
}));

// Remove animation from styled() definition for MainArrow
const MainArrowBox = styled(Box)(({ theme }) => ({
  height: '100%',
  width: '20px',
  left: '95px',
  position: 'relative',
  paddingTop: '3px',
  boxSizing: 'border-box',
  // transform: 'rotate(20deg)', // Base transform can be part of the initial animation state or set via sx if needed
  backgroundColor: 'transparent', // Reverted test background
  [theme.breakpoints.down('sm')]: {
    width: '14px',
    left: '68px',
    paddingTop: '2px',
  },
}));

const ArrowUp = styled(Box)(({ theme }) => ({
  width: 0,
  height: 0,
  borderLeft: '10px solid transparent',
  borderRight: '10px solid transparent',
  borderBottom: '102.5px solid #EF5052',
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    borderLeft: '7px solid transparent',
    borderRight: '7px solid transparent',
    borderBottom: '73px solid #EF5052',
  },
}));

const ArrowDown = styled(Box)(({ theme }) => ({
  transform: 'rotate(180deg)',
  width: 0,
  height: 0,
  borderLeft: '10px solid transparent',
  borderRight: '10px solid transparent',
  borderBottom: '102.5px solid #F3F3F3',
  position: 'relative',
    [theme.breakpoints.down('sm')]: {
    borderLeft: '7px solid transparent',
    borderRight: '7px solid transparent',
    borderBottom: '73px solid #F3F3F3',
  },
}));

const DirectionText = styled(Typography)(({ theme }) => ({
  fontFamily: 'Lobster Two, cursive',
  color: '#FFF',
  position: 'absolute',
  fontSize: '28px',
  [theme.breakpoints.down('sm')]: {
    fontSize: '18px',
  },
}));

const NorthText = styled(DirectionText)(({ theme }) => ({
  left: '50%',
  transform: 'translateX(-50%)',
  top: '10px',
  [theme.breakpoints.down('sm')]: {
    top: '8px',
  },
}));

const EastText = styled(DirectionText)(({ theme }) => ({
  right: '15px',
  top: '50%',
  transform: 'translateY(-50%)',
  [theme.breakpoints.down('sm')]: {
    right: '10px',
  },
}));

const WestText = styled(DirectionText)(({ theme }) => ({
  left: '15px',
  top: '50%',
  transform: 'translateY(-50%)',
  [theme.breakpoints.down('sm')]: {
    left: '10px',
  },
}));

const SouthText = styled(DirectionText)(({ theme }) => ({
  left: '50%',
  transform: 'translateX(-50%)',
  bottom: '10px',
  [theme.breakpoints.down('sm')]: {
    bottom: '8px',
  },
}));


const CompassAnimation = () => {
  return (
    <CompassContainer>
      <CompassInner>
        <NorthText>N</NorthText>
        <EastText>E</EastText>
        <WestText>W</WestText>
        <SouthText>S</SouthText>
        {/* Apply animation using the sx prop on the instance */}
        <MainArrowBox 
          sx={{
            transform: 'rotate(20deg)', // Initial base rotation
            animation: `${spin} 2.0s alternate infinite ease-in-out`,
          }}
        >
          <ArrowUp />
          <ArrowDown />
        </MainArrowBox>
      </CompassInner>
    </CompassContainer>
  );
};

export default CompassAnimation; 