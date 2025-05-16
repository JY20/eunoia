import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  InputAdornment,
  Paper,
  Typography,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import TextsmsIcon from '@mui/icons-material/Textsms';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';

const SearchInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '50px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    },
    '&.Mui-focused': {
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    },
    '& fieldset': {
      borderColor: 'transparent',
    },
    '&:hover fieldset': {
      borderColor: 'transparent',
    },
    '&.Mui-focused fieldset': {
      borderColor: alpha(theme.palette.primary.main, 0.5),
    },
  },
  maxWidth: '650px',
  width: '100%',
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

const CharitySearch = ({ variant = 'standard', placeholder = "Search charities or describe a cause you care about..." }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState('direct'); // 'direct' or 'needs'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    
    setLoading(true);
    
    // Determine the searchMode for navigation based on the variant
    const modeForNavigation = variant === 'minimal' ? 'needs' : searchMode;
    
    // Add a small delay to simulate processing
    setTimeout(() => {
      setLoading(false);
      // Navigate to donate page with appropriate params
      navigate('/donate', { 
        state: { 
          searchValue,
          searchMode: modeForNavigation, // Use 'needs' if minimal variant, otherwise current searchMode
          startStep: 0 // Assuming DonatePage handles this to start semantic search if mode is 'needs'
        } 
      });
    }, 800);
  };

  if (variant === 'minimal') {
    return (
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', width: '100%' }}>
        <SearchInput
          fullWidth
          variant="outlined"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <GlowButton 
          type="submit"
          disabled={!searchValue.trim() || loading}
          sx={{ ml: 1 }}
          endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
        >
          {loading ? 'Searching...' : 'Donate'}
        </GlowButton>
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: '24px',
        maxWidth: '800px',
        width: '100%',
        mx: 'auto',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Find a charity to support
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Search for a specific charity or describe a cause you're passionate about
      </Typography>

      <Box sx={{ display: 'flex', mb: 3 }}>
        <Button 
          variant={searchMode === 'direct' ? 'contained' : 'outlined'} 
          onClick={() => setSearchMode('direct')}
          startIcon={<SearchIcon />}
          sx={{ 
            mr: 2, 
            borderRadius: '50px',
            textTransform: 'none'
          }}
        >
          Direct Search
        </Button>
        <Button 
          variant={searchMode === 'needs' ? 'contained' : 'outlined'} 
          onClick={() => setSearchMode('needs')}
          startIcon={<TextsmsIcon />}
          sx={{ 
            borderRadius: '50px',
            textTransform: 'none'
          }}
        >
          Describe Your Cause
        </Button>
      </Box>

      <Box component="form" onSubmit={handleSubmit}>
        {searchMode === 'direct' ? (
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search for charity names, categories, or keywords..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            sx={{ 
              mb: 3,
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
        ) : (
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Describe the cause you're passionate about..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            multiline
            rows={4}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '16px',
              }
            }}
          />
        )}
        
        <GlowButton 
          type="submit"
          fullWidth
          disabled={!searchValue.trim() || loading}
          sx={{ py: 1.5 }}
          endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
        >
          {loading ? 'Searching...' : searchMode === 'direct' ? 'Find Charity' : 'Find Matching Charities'}
        </GlowButton>
      </Box>
    </Paper>
  );
};

export default CharitySearch; 