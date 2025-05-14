import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const Loading = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(3, 37, 65, 0.3)', 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        zIndex: 9999,
        opacity: 0,
        animation: 'fadeIn 0.3s ease forwards',
        '@keyframes fadeIn': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        }
      }}
    >
      <CircularProgress size={80} thickness={4.5} sx={{ color: '#1e88e5' }} />
    </Box>
  );
};

export default Loading;
