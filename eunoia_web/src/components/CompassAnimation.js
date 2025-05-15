import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

const spin = keyframes`
  0% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1) rotate(80deg);
  }
  100% {
    transform: scale(1) rotate(-180deg);
  }
`;

const CompassContainer = styled(Box)(({ theme }) => ({
  width: '250px', // Adjusted size
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
  width: '210px', // Adjusted size
  height: '210px',
  backgroundColor: '#3D3D3D',
  borderRadius: '100%',
  position: 'relative',
  left: '17.5px', // Adjusted
  top: '17.5px',  // Adjusted
  border: '3px solid #C5C5C5',
  [theme.breakpoints.down('sm')]: {
    width: '150px',
    height: '150px',
    left: '12.5px',
    top: '12.5px',
  },
}));

const MainArrow = styled(Box)(({ theme }) => ({
  height: '100%',
  width: '20px', // Adjusted
  left: '95px',  // Adjusted: (210 - 20) / 2
  position: 'relative',
  paddingTop: '3px', // Adjusted
  boxSizing: 'border-box',
  transform: 'rotate(20deg)',
  animation: `${spin} 2.0s alternate infinite`,
  [theme.breakpoints.down('sm')]: {
    width: '14px',
    left: '68px', // (150 - 14) / 2
    paddingTop: '2px',
  },
}));

const ArrowUp = styled(Box)(({ theme }) => ({
  width: 0,
  height: 0,
  borderLeft: '10px solid transparent', // Adjusted
  borderRight: '10px solid transparent', // Adjusted
  borderBottom: '102.5px solid #EF5052', // Adjusted: 210 / 2 - padding
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    borderLeft: '7px solid transparent',
    borderRight: '7px solid transparent',
    borderBottom: '73px solid #EF5052', // 150 / 2 - padding
  },
}));

const ArrowDown = styled(Box)(({ theme }) => ({
  transform: 'rotate(180deg)',
  width: 0,
  height: 0,
  borderLeft: '10px solid transparent', // Adjusted
  borderRight: '10px solid transparent', // Adjusted
  borderBottom: '102.5px solid #F3F3F3', // Adjusted
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
  fontSize: '28px', // Adjusted
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
  right: '15px', // Adjusted
  top: '50%',
  transform: 'translateY(-50%)',
  [theme.breakpoints.down('sm')]: {
    right: '10px',
  },
}));

const WestText = styled(DirectionText)(({ theme }) => ({
  left: '15px', // Adjusted
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
        <MainArrow>
          <ArrowUp />
          <ArrowDown />
        </MainArrow>
      </CompassInner>
    </CompassContainer>
  );
};

export default CompassAnimation; 