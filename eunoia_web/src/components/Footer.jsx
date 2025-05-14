import React from 'react';
import { Box, Stack, styled } from '@mui/material';

const Footer = () => {

  const StackColumn = styled(Stack)(() => ({
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    gap: '3vh',  
    textAlign: 'center',
  }));

  const BoxRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#ededed',
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      gap: '3vh',
    }
  }));

  return (
    <BoxRow component='footer' sx={{ py: 4, px: 2 }}>
      <StackColumn>
        &copy; 2025 Eunoia
      </StackColumn>
    </BoxRow>
  );
};

export default Footer;
