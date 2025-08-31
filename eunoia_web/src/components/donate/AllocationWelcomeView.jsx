import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Stack 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExploreIcon from '@mui/icons-material/Explore';

const StepContent = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  minHeight: '400px',
}));

const GlowButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #4cc9f0 0%, #4361ee 100%)',
  borderRadius: '50px',
  padding: '12px 24px',
  color: 'white',
  fontWeight: 'bold',
  textTransform: 'none',
  fontSize: '1rem',
  boxShadow: '0 8px 20px rgba(76, 201, 240, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 12px 28px rgba(76, 201, 240, 0.5)',
    transform: 'translateY(-3px)',
  },
  '&:disabled': {
    background: '#e0e0e0',
    color: '#a0a0a0',
  },
}));

const AllocationWelcomeView = ({ setCurrentStage }) => { 
  console.log('AllocationWelcomeView render');
  return (
    <StepContent sx={{ textAlign: 'center', py: {xs: 4, sm: 6} }}>
      <Box mb={4}>
        <ExploreIcon sx={{ fontSize: 90, color: 'primary.main', mb:1 }} />
      </Box>
      <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ fontFamily: "'Space Grotesk', sans-serif"}}>
        Find Your Compass.
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 5, maxWidth: '600px', mx: 'auto' }}>
        Giving guided by your values.
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" alignItems="center">
        <GlowButton 
          onClick={() => setCurrentStage('visionPrompt')} 
          size="large" 
          sx={{py: 1.5, px: 5, fontSize: '1.1rem'}}
          startIcon={<AutoAwesomeIcon />}
        >
          Use Eunoia Compass
        </GlowButton>
        <Button 
          variant="outlined" 
          color="primary"
          component={Link} 
          to="/charities"
          size="large" 
          sx={{py: 1.5, px: 5, fontSize: '1.1rem', borderRadius: '50px'}}
          startIcon={<SearchIcon />}
        >
          Donate Directly
        </Button>
      </Stack>
      <Typography variant="body1" sx={{ mt: 6, fontStyle: 'italic', color: 'text.secondary' }}>
        Unchained Giving. Borderless Impact.
      </Typography>
    </StepContent>
  );
};

export default AllocationWelcomeView;

