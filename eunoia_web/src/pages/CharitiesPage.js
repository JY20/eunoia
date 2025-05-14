import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions, 
  Button,
  Pagination,
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Constants
const API_URL = 'http://localhost:8000/api';

const PageHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #7E57C2 0%, #B39DDB 100%)',
  padding: theme.spacing(6, 2),
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

const CharitiesPage = () => {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filteredCharities, setFilteredCharities] = useState([]);
  
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    const fetchCharities = async () => {
      try {
        setLoading(true);
        
        // Temporarily use mock data until API is ready
        // const response = await axios.get(`${API_URL}/charities/`);
        
        // Mock data
        setTimeout(() => {
          const mockCharities = [
            {
              id: 1,
              name: 'Ocean Cleanup Foundation',
              description: "Working to rid the world's oceans of plastic pollution through innovative technologies.",
              logo: 'https://via.placeholder.com/300x200?text=Ocean+Cleanup',
              aptos_wallet_address: '0x123...abc',
              website_url: 'https://example.com/oceancleanup'
            },
            {
              id: 2,
              name: 'Reforestation Alliance',
              description: "Planting trees and protecting forests to combat climate change and preserve biodiversity.",
              logo: 'https://via.placeholder.com/300x200?text=Reforestation',
              aptos_wallet_address: '0x456...def',
              website_url: 'https://example.com/reforest'
            },
            {
              id: 3,
              name: 'Education For All',
              description: "Providing educational opportunities to underprivileged children around the world.",
              logo: 'https://via.placeholder.com/300x200?text=Education',
              aptos_wallet_address: '0x789...ghi',
              website_url: 'https://example.com/education'
            },
            {
              id: 4,
              name: 'Healthcare Access Initiative',
              description: "Expanding access to quality healthcare in underserved communities globally.",
              logo: 'https://via.placeholder.com/300x200?text=Healthcare',
              aptos_wallet_address: '0xabc...123',
              website_url: 'https://example.com/healthcare'
            },
            {
              id: 5,
              name: 'Clean Water Project',
              description: "Bringing clean drinking water to communities facing water scarcity and contamination.",
              logo: 'https://via.placeholder.com/300x200?text=Water',
              aptos_wallet_address: '0xdef...456',
              website_url: 'https://example.com/water'
            },
            {
              id: 6,
              name: 'Digital Literacy Program',
              description: "Teaching essential digital skills to bridge the technological divide in underserved areas.",
              logo: 'https://via.placeholder.com/300x200?text=Digital',
              aptos_wallet_address: '0xghi...789',
              website_url: 'https://example.com/digital'
            },
            {
              id: 7,
              name: 'Wildlife Conservation Trust',
              description: "Protecting endangered species and habitats from climate change and human threats.",
              logo: 'https://via.placeholder.com/300x200?text=Wildlife',
              aptos_wallet_address: '0x123...abc',
              website_url: 'https://example.com/wildlife'
            },
            {
              id: 8,
              name: 'Food Security Alliance',
              description: "Combating food insecurity through sustainable agriculture and food distribution systems.",
              logo: 'https://via.placeholder.com/300x200?text=Food',
              aptos_wallet_address: '0x456...def',
              website_url: 'https://example.com/food'
            },
            {
              id: 9,
              name: 'Renewable Energy Collective',
              description: "Advancing renewable energy solutions in communities reliant on fossil fuels.",
              logo: 'https://via.placeholder.com/300x200?text=Energy',
              aptos_wallet_address: '0x789...ghi',
              website_url: 'https://example.com/energy'
            },
            {
              id: 10,
              name: 'Disaster Relief Network',
              description: "Providing emergency relief and rebuilding assistance to communities affected by natural disasters.",
              logo: 'https://via.placeholder.com/300x200?text=Disaster+Relief',
              aptos_wallet_address: '0xabc...123',
              website_url: 'https://example.com/disaster'
            },
            {
              id: 11,
              name: 'Mental Health Access Initiative',
              description: "Expanding access to mental health services and reducing stigma worldwide.",
              logo: 'https://via.placeholder.com/300x200?text=Mental+Health',
              aptos_wallet_address: '0xdef...456',
              website_url: 'https://example.com/mentalhealth'
            },
            {
              id: 12,
              name: 'Arts & Culture Foundation',
              description: "Preserving cultural heritage and supporting artists in underrepresented communities.",
              logo: 'https://via.placeholder.com/300x200?text=Arts+Culture',
              aptos_wallet_address: '0xghi...789',
              website_url: 'https://example.com/arts'
            }
          ];
          
          setCharities(mockCharities);
          setFilteredCharities(mockCharities);
          setLoading(false);
        }, 1000);
        
        // When API is ready, use:
        // setCharities(response.data);
        // setFilteredCharities(response.data);
        // setLoading(false);
      } catch (err) {
        console.error('Error fetching charities:', err);
        setError('Failed to load charities. Please try again later.');
        setLoading(false);
      }
    };

    fetchCharities();
  }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredCharities(charities);
      setPage(1);
      return;
    }

    const filtered = charities.filter(charity => 
      charity.name.toLowerCase().includes(search.toLowerCase()) || 
      charity.description.toLowerCase().includes(search.toLowerCase())
    );
    
    setFilteredCharities(filtered);
    setPage(1);
  }, [search, charities]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const paginatedCharities = filteredCharities.slice(
    (page - 1) * ITEMS_PER_PAGE, 
    page * ITEMS_PER_PAGE
  );

  return (
    <>
      <PageHeader>
        <Container maxWidth="md">
          <Typography variant="h3" gutterBottom>
            Explore Verified Charities
          </Typography>
          <Typography variant="body1" paragraph sx={{ maxWidth: '700px', margin: '0 auto', mb: 4 }}>
            Browse our collection of verified charitable organizations and support causes that matter to you.
          </Typography>
          
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search charities by name or mission..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ 
              maxWidth: '600px', 
              margin: '0 auto',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '8px',
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'transparent' },
                '&:hover fieldset': { borderColor: 'transparent' },
                '&.Mui-focused fieldset': { borderColor: 'transparent' },
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Container>
      </PageHeader>

      <Container maxWidth="lg" sx={{ mb: 8 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress size={60} sx={{ color: '#7E57C2' }} />
          </Box>
        ) : error ? (
          <Typography align="center" color="error">{error}</Typography>
        ) : filteredCharities.length === 0 ? (
          <Typography align="center" sx={{ my: 8 }}>No charities found matching your search criteria.</Typography>
        ) : (
          <>
            <Grid container spacing={4}>
              {paginatedCharities.map((charity) => (
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
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" display="block">
                          <strong>Wallet:</strong> {charity.aptos_wallet_address.substring(0, 6)}...
                        </Typography>
                        {charity.website_url && (
                          <Typography variant="caption" display="block">
                            <strong>Website:</strong> <a href={charity.website_url} target="_blank" rel="noopener noreferrer">{new URL(charity.website_url).hostname}</a>
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button 
                        variant="contained" 
                        component={Link}
                        to={`/donate?charity=${charity.id}`}
                        fullWidth
                        sx={{ 
                          backgroundColor: '#7E57C2',
                          '&:hover': { backgroundColor: '#6A4BA1' },
                        }}
                      >
                        Donate
                      </Button>
                    </CardActions>
                  </CharityCard>
                </Grid>
              ))}
            </Grid>

            {filteredCharities.length > ITEMS_PER_PAGE && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Pagination 
                  count={Math.ceil(filteredCharities.length / ITEMS_PER_PAGE)}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#7E57C2',
                    },
                    '& .Mui-selected': {
                      backgroundColor: 'rgba(126, 87, 194, 0.2) !important',
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default CharitiesPage; 