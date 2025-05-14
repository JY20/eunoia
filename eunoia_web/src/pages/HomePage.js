import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, CardMedia, CardActions } from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

// Constants
const API_URL = 'http://localhost:8000/api'; // We'll need to create this API endpoint in Django

const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #7E57C2 0%, #B39DDB 100%)',
  padding: theme.spacing(10, 2),
  color: 'white',
  textAlign: 'center',
  borderRadius: '0 0 20px 20px',
  marginBottom: theme.spacing(6),
}));

const CharityCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.15)',
  },
}));

const HomePage = () => {
  const [featuredCharities, setFeaturedCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch featured charities from Django backend
    const fetchCharities = async () => {
      try {
        setLoading(true);
        // Temporarily mock data until our API is ready
        // In a real scenario: const response = await axios.get(`${API_URL}/charities/featured/`);
        
        // Mock data
        setTimeout(() => {
          const mockCharities = [
            {
              id: 1,
              name: 'Ocean Cleanup Foundation',
              description: "Working to rid the world's oceans of plastic pollution through innovative technologies.",
              logo: 'https://via.placeholder.com/300x200?text=Ocean+Cleanup',
              aptos_wallet_address: '0x123...abc'
            },
            {
              id: 2,
              name: 'Reforestation Alliance',
              description: "Planting trees and protecting forests to combat climate change and preserve biodiversity.",
              logo: 'https://via.placeholder.com/300x200?text=Reforestation',
              aptos_wallet_address: '0x456...def'
            },
            {
              id: 3,
              name: 'Education For All',
              description: "Providing educational opportunities to underprivileged children around the world.",
              logo: 'https://via.placeholder.com/300x200?text=Education',
              aptos_wallet_address: '0x789...ghi'
            }
          ];
          
          setFeaturedCharities(mockCharities);
          setLoading(false);
        }, 1000);
        
        // When API is ready, uncomment:
        // setFeaturedCharities(response.data);
        // setLoading(false);
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
        <Container maxWidth="md">
          <Typography variant="h2" gutterBottom>
            Welcome to Eunoia
          </Typography>
          <Typography variant="h5" gutterBottom>
            A Decentralized Giving Platform
          </Typography>
          <Typography variant="body1" paragraph sx={{ maxWidth: '700px', margin: '0 auto', mb: 4 }}>
            Support causes you care about with greater transparency, lower fees, and direct impact.
            Powered by Aptos blockchain technology.
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button 
              variant="contained" 
              color="secondary" 
              size="large" 
              sx={{ 
                mr: 2, 
                bgcolor: 'white', 
                color: '#7E57C2',
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
              href="/charities"
            >
              Explore Charities
            </Button>
            <Button 
              variant="outlined" 
              color="secondary"
              size="large"
              sx={{ 
                borderColor: 'white', 
                color: 'white',
                '&:hover': { 
                  borderColor: 'white', 
                  bgcolor: 'rgba(255, 255, 255, 0.1)' 
                }
              }}
              href="/donate"
            >
              Donate Now
            </Button>
          </Box>
        </Container>
      </HeroSection>

      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
          Featured Charities
        </Typography>

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
                    <Typography gutterBottom variant="h5" component="div">
                      {charity.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {charity.description}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Wallet: {charity.aptos_wallet_address.substring(0, 6)}...
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary">Learn More</Button>
                    <Button 
                      size="small" 
                      variant="contained" 
                      color="primary"
                      sx={{ ml: 'auto' }}
                      href={`/donate?charity=${charity.id}`}
                    >
                      Donate
                    </Button>
                  </CardActions>
                </CharityCard>
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ textAlign: 'center', mt: 6, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            How It Works
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="h6" gutterBottom>1. Choose a Charity</Typography>
                <Typography>
                  Browse our verified charitable organizations and select a cause you're passionate about.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="h6" gutterBottom>2. Make a Donation</Typography>
                <Typography>
                  Donate using Aptos cryptocurrency with minimal transaction fees.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="h6" gutterBottom>3. Track Your Impact</Typography>
                <Typography>
                  Follow your donation on the blockchain and see the real impact of your contribution.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default HomePage; 