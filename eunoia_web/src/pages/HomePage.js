import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions, 
  Chip,
  Stack,
  Paper,
  Avatar,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
// import axios from 'axios'; // Commented out as API call is mocked

// Import icons
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VerifiedIcon from '@mui/icons-material/Verified';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PublicIcon from '@mui/icons-material/Public';
import SpeedIcon from '@mui/icons-material/Speed';
import PaidIcon from '@mui/icons-material/Paid';
import SecurityIcon from '@mui/icons-material/Security';

// Constants
// const API_URL = 'http://localhost:8000/api'; // Commented out as API call is mocked

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #7209b7 0%, #3f37c9 100%)',
  minHeight: '90vh',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: {
    minHeight: '70vh',
  },
}));

const HeroPattern = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  background: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23ffffff" fill-opacity="0.05" fill-rule="evenodd"/%3E%3C/svg%3E")',
  zIndex: 0,
}));

const GlassCard = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.15)',
  },
}));

const StatsSection = styled(Box)(({ theme }) => ({
  background: theme.palette.background.default,
  padding: theme.spacing(10, 0),
}));

const StatCard = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(2),
}));

const CharityCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
  },
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'scaleX(0)',
    transformOrigin: 'right',
    transition: 'transform 0.3s ease-out',
  },
  '&:hover::after': {
    transform: 'scaleX(1)',
    transformOrigin: 'left',
  },
}));

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // const isTablet = useMediaQuery(theme.breakpoints.down('md')); // Removed unused variable
  
  const [featuredCharities, setFeaturedCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch featured charities from Django backend
    const fetchCharities = async () => {
      try {
        setLoading(true);
        // Temporarily mock data until our API is ready
        setTimeout(() => {
          const mockCharities = [
            {
              id: 1,
              name: 'Ocean Cleanup Foundation',
              description: "Working to rid the world's oceans of plastic pollution through innovative technologies.",
              logo: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?q=80&w=500&auto=format&fit=crop',
              aptos_wallet_address: '0x123...abc',
              impact: '500,000 kg of plastic removed'
            },
            {
              id: 2,
              name: 'Reforestation Alliance',
              description: "Planting trees and protecting forests to combat climate change and preserve biodiversity.",
              logo: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=500&auto=format&fit=crop',
              aptos_wallet_address: '0x456...def',
              impact: '2 million trees planted'
            },
            {
              id: 3,
              name: 'Education For All',
              description: "Providing educational opportunities to underprivileged children around the world.",
              logo: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=500&auto=format&fit=crop',
              aptos_wallet_address: '0x789...ghi',
              impact: '50,000 children educated'
            }
          ];
          
          setFeaturedCharities(mockCharities);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching charities:', err);
        setError('Failed to load charities. Please try again later.');
        setLoading(false);
      }
    };

    fetchCharities();
  }, []);

  return (
    <>
      <HeroSection>
        <HeroPattern />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box sx={{ color: 'white', mb: { xs: 4, md: 0 } }}>
                <Typography 
                  variant={isMobile ? "h3" : "h1"} 
                  component="h1" 
                  fontWeight="800" 
                  sx={{ 
                    mb: 2,
                    background: 'linear-gradient(90deg, #ffffff 0%, #e0e0ff 100%)',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Unchained Giving.<br />
                  Borderless Impact.
                </Typography>
                <Typography variant="h6" sx={{ mb: 4, maxWidth: '600px', opacity: 0.9 }}>
                  The first truly transparent giving platform built on Aptos blockchain.
                  Track your donations in real-time, from your wallet to the cause.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <AnimatedButton 
                    variant="contained" 
                    size="large" 
                    component={Link}
                    to="/charities"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ 
                      py: 1.5, 
                      px: 4,
                      background: 'linear-gradient(90deg, #4cc9f0 0%, #4361ee 100%)',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      borderRadius: '50px',
                      boxShadow: '0 10px 20px rgba(67, 97, 238, 0.3)',
                    }}
                  >
                    Donate Now
                  </AnimatedButton>
                  <AnimatedButton 
                    variant="outlined" 
                    size="large"
                    component={Link}
                    to="/register-charity"
                    sx={{ 
                      py: 1.5, 
                      px: 4,
                      borderColor: 'white',
                      color: 'white',
                      borderRadius: '50px',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      borderWidth: '2px',
                      '&:hover': {
                        borderColor: 'white',
                        borderWidth: '2px',
                        background: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    Register Charity
                  </AnimatedButton>
                </Stack>
                <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    icon={<VerifiedIcon />} 
                    label="100% Transparent" 
                    sx={{ 
                      bgcolor: alpha(theme.palette.common.white, 0.1),
                      color: theme.palette.common.white,
                      backdropFilter: 'blur(10px)',
                      fontWeight: 'medium',
                    }} 
                  />
                  <Chip 
                    icon={<PaidIcon />} 
                    label="0.20% Fee Only" 
                    sx={{ 
                      bgcolor: alpha(theme.palette.common.white, 0.1),
                      color: theme.palette.common.white,
                      backdropFilter: 'blur(10px)',
                      fontWeight: 'medium',
                    }} 
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box 
                component="img" 
                src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=800&auto=format&fit=crop"
                alt="People helping each other"
                sx={{ 
                  width: '100%', 
                  borderRadius: '20px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                  transform: { xs: 'none', md: 'rotate(2deg)' },
                  border: '5px solid white',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      {/* How it Works Section */}
      <Box py={10} sx={{ background: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography variant="h6" color="primary" fontWeight="bold" mb={1}>
              TRANSPARENT • DECENTRALIZED • IMPACTFUL
            </Typography>
            <Typography variant="h3" fontWeight="bold" mb={2}>
              How Eunoia Works
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
              Follow your donation's journey from your wallet to direct impact, with complete transparency at every step.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <GlassCard>
                <Box sx={{ mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: 'primary.main',
                      mb: 2,
                    }}
                  >
                    <AccountBalanceWalletIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    1. Connect Wallet
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Connect your Aptos wallet securely. No registration required, no personal data stored.
                  </Typography>
                </Box>
                <Box>
                  <Chip
                    label="Secure & Private"
                    size="small"
                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}
                  />
                </Box>
              </GlassCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <GlassCard>
                <Box sx={{ mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: 'primary.main',
                      mb: 2,
                    }}
                  >
                    <PublicIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    2. Choose a Cause
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Browse verified charitable organizations and select a cause that resonates with you.
                  </Typography>
                </Box>
                <Box>
                  <Chip
                    label="Verified Charities"
                    size="small"
                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}
                  />
                </Box>
              </GlassCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <GlassCard>
                <Box sx={{ mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: 'primary.main',
                      mb: 2,
                    }}
                  >
                    <SecurityIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    3. Track Impact
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Follow your donation on the blockchain in real-time and see exactly how it's being used.
                  </Typography>
                </Box>
                <Box>
                  <Chip
                    label="100% Transparent"
                    size="small"
                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}
                  />
                </Box>
              </GlassCard>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <StatsSection>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <StatCard>
                <Typography variant="h3" fontWeight="bold" color="primary.main">
                  $2.8M+
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Donations processed
                </Typography>
              </StatCard>
            </Grid>
            <Grid item xs={12} md={3}>
              <StatCard>
                <Typography variant="h3" fontWeight="bold" color="primary.main">
                  47+
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Verified charities
                </Typography>
              </StatCard>
            </Grid>
            <Grid item xs={12} md={3}>
              <StatCard>
                <Typography variant="h3" fontWeight="bold" color="primary.main">
                  0.2%
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Optional fee
                </Typography>
              </StatCard>
            </Grid>
            <Grid item xs={12} md={3}>
              <StatCard>
                <Typography variant="h3" fontWeight="bold" color="primary.main">
                  100%
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Transparency
                </Typography>
              </StatCard>
            </Grid>
          </Grid>
        </Container>
      </StatsSection>

      {/* Featured Charities Section */}
      <Box py={10}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" fontWeight="bold" mb={2}>
              Featured Charities
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
              These verified organizations are making real-world impact with blockchain transparency.
            </Typography>
          </Box>

          {loading ? (
            <Typography align="center">Loading featured charities...</Typography>
          ) : error ? (
            <Typography align="center" color="error">{error}</Typography>
          ) : (
            <Grid container spacing={4}>
              {featuredCharities.map((charity) => (
                <Grid item xs={12} sm={6} md={4} key={charity.id}>
                  <CharityCard>
                    <CardMedia
                      component="img"
                      height="200"
                      image={charity.logo}
                      alt={charity.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                        <Typography gutterBottom variant="h6" component="div" fontWeight="bold">
                          {charity.name}
                        </Typography>
                        <VerifiedIcon color="primary" fontSize="small" />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {charity.description}
                      </Typography>
                      <Chip 
                        size="small" 
                        icon={<SpeedIcon />} 
                        label={charity.impact} 
                        sx={{ mb: 1, bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.dark' }} 
                      />
                      <Typography variant="caption" display="block" color="text.secondary">
                        Wallet: {charity.aptos_wallet_address}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button 
                        variant="outlined" 
                        size="small"
                        component={Link}
                        to={`/charities/${charity.id}`}
                      >
                        Learn More
                      </Button>
                      <Button 
                        variant="contained" 
                        size="small"
                        component={Link}
                        to={`/donate?charity=${charity.id}`}
                        sx={{ ml: 'auto' }}
                      >
                        Donate
                      </Button>
                    </CardActions>
                  </CharityCard>
                </Grid>
              ))}
            </Grid>
          )}

          <Box textAlign="center" mt={6}>
            <Button 
              variant="contained"
              component={Link}
              to="/charities"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                py: 1.5, 
                px: 4,
                borderRadius: '50px',
                background: 'linear-gradient(90deg, #4cc9f0 0%, #4361ee 100%)',
              }}
            >
              View All Charities
            </Button>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={10} sx={{ background: 'linear-gradient(135deg, #7209b7 0%, #3f37c9 100%)', color: 'white' }}>
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography variant="h3" fontWeight="bold" mb={3}>
              Join Us in Making a Difference
            </Typography>
            <Typography variant="subtitle1" mb={4} sx={{ opacity: 0.9 }}>
              Eunoia connects donors directly with causes they care about, leveraging blockchain technology for secure and transparent contributions.
              Help us build a better world, one donation at a time.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button 
                variant="contained" 
                size="large"
                component={Link}
                to="/charities"
                sx={{ 
                  py: 1.5, 
                  px: 4,
                  bgcolor: theme.palette.common.white,
                  color: theme.palette.primary.main,
                  fontWeight: 'bold',
                  borderRadius: '50px',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.common.white, 0.9),
                  }
                }}
              >
                Start Donating
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                component={Link}
                to="/register-charity"
                sx={{ 
                  py: 1.5, 
                  px: 4,
                  borderColor: 'white',
                  color: 'white',
                  borderRadius: '50px',
                  fontWeight: 'bold',
                  borderWidth: '2px',
                  '&:hover': {
                    borderColor: 'white',
                    borderWidth: '2px',
                    background: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Register Your Charity
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default HomePage; 