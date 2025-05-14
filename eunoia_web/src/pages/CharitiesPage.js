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
  CircularProgress,
  Chip,
  alpha,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VerifiedIcon from '@mui/icons-material/Verified';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import CharitySearch from '../components/CharitySearch';

// Constants
const API_URL = 'http://localhost:8000/api';

const PageHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #7E57C2 0%, #B39DDB 100%)',
  padding: theme.spacing(6, 2, 8),
  color: 'white',
  textAlign: 'center',
  borderRadius: '0 0 30px 30px',
  marginBottom: theme.spacing(10),
  position: 'relative',
  overflow: 'hidden',
}));

const HeaderPattern = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  background: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23ffffff" fill-opacity="0.05" fill-rule="evenodd"/%3E%3C/svg%3E")',
  zIndex: 0,
}));

const SearchCard = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '20px',
  padding: theme.spacing(4),
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  zIndex: '1',
  marginTop: theme.spacing(-6),
  marginBottom: theme.spacing(4),
  width: '100%',
  maxWidth: '800px',
  margin: 'auto',
  transform: 'translateY(50px)',
}));

const CharityCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.15)',
  },
}));

const DonateButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #4cc9f0 0%, #4361ee 100%)',
  color: 'white',
  borderRadius: '50px',
  padding: '8px 16px',
  textTransform: 'none',
  fontWeight: 'bold',
  '&:hover': {
    background: 'linear-gradient(90deg, #4361ee 0%, #3a0ca3 100%)',
  }
}));

const CharitiesPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
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
              website_url: 'https://example.com/oceancleanup',
              category: 'Environment'
            },
            {
              id: 2,
              name: 'Reforestation Alliance',
              description: "Planting trees and protecting forests to combat climate change and preserve biodiversity.",
              logo: 'https://via.placeholder.com/300x200?text=Reforestation',
              aptos_wallet_address: '0x456...def',
              website_url: 'https://example.com/reforest',
              category: 'Environment'
            },
            {
              id: 3,
              name: 'Education For All',
              description: "Providing educational opportunities to underprivileged children around the world.",
              logo: 'https://via.placeholder.com/300x200?text=Education',
              aptos_wallet_address: '0x789...ghi',
              website_url: 'https://example.com/education',
              category: 'Education'
            },
            {
              id: 4,
              name: 'Healthcare Access Initiative',
              description: "Expanding access to quality healthcare in underserved communities globally.",
              logo: 'https://via.placeholder.com/300x200?text=Healthcare',
              aptos_wallet_address: '0xabc...123',
              website_url: 'https://example.com/healthcare',
              category: 'Health'
            },
            {
              id: 5,
              name: 'Clean Water Project',
              description: "Bringing clean drinking water to communities facing water scarcity and contamination.",
              logo: 'https://via.placeholder.com/300x200?text=Water',
              aptos_wallet_address: '0xdef...456',
              website_url: 'https://example.com/water',
              category: 'Human Rights'
            },
            {
              id: 6,
              name: 'Digital Literacy Program',
              description: "Teaching essential digital skills to bridge the technological divide in underserved areas.",
              logo: 'https://via.placeholder.com/300x200?text=Digital',
              aptos_wallet_address: '0xghi...789',
              website_url: 'https://example.com/digital',
              category: 'Education'
            },
            {
              id: 7,
              name: 'Wildlife Conservation Trust',
              description: "Protecting endangered species and habitats from climate change and human threats.",
              logo: 'https://via.placeholder.com/300x200?text=Wildlife',
              aptos_wallet_address: '0x123...abc',
              website_url: 'https://example.com/wildlife',
              category: 'Animals'
            },
            {
              id: 8,
              name: 'Food Security Alliance',
              description: "Combating food insecurity through sustainable agriculture and food distribution systems.",
              logo: 'https://via.placeholder.com/300x200?text=Food',
              aptos_wallet_address: '0x456...def',
              website_url: 'https://example.com/food',
              category: 'Community'
            },
            {
              id: 9,
              name: 'Renewable Energy Collective',
              description: "Advancing renewable energy solutions in communities reliant on fossil fuels.",
              logo: 'https://via.placeholder.com/300x200?text=Energy',
              aptos_wallet_address: '0x789...ghi',
              website_url: 'https://example.com/energy',
              category: 'Environment'
            },
            {
              id: 10,
              name: 'Disaster Relief Network',
              description: "Providing emergency relief and rebuilding assistance to communities affected by natural disasters.",
              logo: 'https://via.placeholder.com/300x200?text=Disaster+Relief',
              aptos_wallet_address: '0xabc...123',
              website_url: 'https://example.com/disaster',
              category: 'Disaster'
            },
            {
              id: 11,
              name: 'Mental Health Access Initiative',
              description: "Expanding access to mental health services and reducing stigma worldwide.",
              logo: 'https://via.placeholder.com/300x200?text=Mental+Health',
              aptos_wallet_address: '0xdef...456',
              website_url: 'https://example.com/mentalhealth',
              category: 'Health'
            },
            {
              id: 12,
              name: 'Arts & Culture Foundation',
              description: "Preserving cultural heritage and supporting artists in underrepresented communities.",
              logo: 'https://via.placeholder.com/300x200?text=Arts+Culture',
              aptos_wallet_address: '0xghi...789',
              website_url: 'https://example.com/arts',
              category: 'Arts'
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
      charity.description.toLowerCase().includes(search.toLowerCase()) ||
      (charity.category && charity.category.toLowerCase().includes(search.toLowerCase()))
    );
    
    setFilteredCharities(filtered);
    setPage(1);
  }, [search, charities]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDonateClick = (charity) => {
    navigate('/donate', { 
      state: { 
        selectedCharities: [charity],
        startStep: 1
      } 
    });
  };

  const paginatedCharities = filteredCharities.slice(
    (page - 1) * ITEMS_PER_PAGE, 
    page * ITEMS_PER_PAGE
  );

  return (
    <>
      <PageHeader>
        <HeaderPattern />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" gutterBottom>
            Explore Verified Charities
          </Typography>
          <Typography variant="body1" paragraph sx={{ maxWidth: '700px', margin: '0 auto', mb: 4 }}>
            Browse our collection of verified charitable organizations and support causes that matter to you.
          </Typography>
        </Container>
      </PageHeader>

      <Container maxWidth="lg" sx={{ mb: 8, mt: -10 }}>
        <SearchCard>
          <CharitySearch />
        </SearchCard>

        <Box sx={{ mt: 6, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight="bold">
            All Verified Charities
          </Typography>
          <TextField
            variant="outlined"
            placeholder="Filter results..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ 
              width: '250px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '50px',
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
        </Box>

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
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography gutterBottom variant="h6" component="div" sx={{ flexGrow: 1 }}>
                          {charity.name}
                        </Typography>
                        <VerifiedIcon color="primary" fontSize="small" />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {charity.description}
                      </Typography>
                      <Box>
                        <Chip 
                          label={charity.category} 
                          size="small" 
                          sx={{ mb: 2, borderRadius: '50px' }} 
                        />
                      </Box>
                      <Box>
                        <Typography variant="caption" display="block">
                          <strong>Wallet:</strong> {charity.aptos_wallet_address}
                        </Typography>
                        {charity.website_url && (
                          <Typography variant="caption" display="block">
                            <strong>Website:</strong> <a href={charity.website_url} target="_blank" rel="noopener noreferrer">{new URL(charity.website_url).hostname}</a>
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                    <CardActions sx={{ p: 2 }}>
                      <Button 
                        variant="outlined" 
                        startIcon={<FavoriteIcon />}
                        size="small"
                        sx={{ 
                          borderRadius: '50px',
                          mr: 1,
                          textTransform: 'none',
                          flex: 1
                        }}
                      >
                        Add to Favorites
                      </Button>
                      <DonateButton 
                        onClick={() => handleDonateClick(charity)}
                        size="small"
                        sx={{ 
                          flex: 1,
                        }}
                      >
                        Donate
                      </DonateButton>
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