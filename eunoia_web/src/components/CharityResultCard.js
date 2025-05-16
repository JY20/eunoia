import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Chip,
  Avatar,
  Collapse,
  IconButton
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const StyledCharityCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2), // Adjusted from 3 to 2 for tighter grid
  borderRadius: '16px',
  boxShadow: theme.shadows[6],
  transition: 'transform 0.3s, box-shadow 0.3s',
  height: '100%', // Ensure cards in a row have same height for alignment
  display: 'flex', // Added for flex column layout
  flexDirection: 'column', // Added for flex column layout
  justifyContent: 'space-between', // Added for flex column layout
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[12],
  },
}));

const ExpandableSection = styled(Box)({
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '8px',
});

const CardContentWrapper = styled(Box)({
  flexGrow: 1, // Allows content to take up space before actions
});

const CardActionsWrapper = styled(Box)({
  marginTop: 'auto', // Pushes actions to the bottom
});

const CharityResultCard = ({ charity, suggestedAllocation, selectedCrypto, theme }) => {
  const [expanded, setExpanded] = useState(false);

  const getReasonTags = (explanation) => {
    if (!explanation) return [];
    const keywords = ['education', 'faith', 'africa', 'children', 'empowerment', 'uganda', 'health', 'environment', 'innovation', 'community'];
    return keywords.filter(kw => explanation.toLowerCase().includes(kw)).slice(0, 3);
  };
  const reasonTags = getReasonTags(charity.ai_explanation);

  return (
    <StyledCharityCard>
      <CardContentWrapper>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <Grid item xs={3} sm={2} md={3}>
            <Avatar 
              src={charity.logo || 'https://via.placeholder.com/100?text=Logo'} 
              alt={`${charity.name} logo`} 
              sx={{ width: 64, height: 64, margin: 'auto' }} // Slightly smaller logo
              variant="rounded"
            />
          </Grid>
          <Grid item xs={9} sm={10} md={9}>
            <Typography variant="h6" fontWeight="bold" component="div"  sx={{fontSize: '1.1rem'}}>{charity.name}</Typography>
            <Chip 
              icon={<CheckCircleIcon fontSize="small"/>} 
              label={`${charity.match_score_percent}% Match`}
              color="primary" 
              size="small" 
              variant="filled" 
              sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
            />
            <Chip 
              icon={<VerifiedUserIcon fontSize="small"/>} 
              label={`Trust: ${charity.trust_score_grade}`}
              color="success" 
              size="small" 
              variant="outlined" 
              sx={{ mb: 0.5, fontSize: '0.7rem' }}
            />
          </Grid>
        </Grid>

        <ExpandableSection onClick={() => setExpanded(!expanded)}>
          <Typography variant="subtitle2" fontWeight="medium">Why this match?</Typography>
          <IconButton size="small">
            <ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s'}}/>
          </IconButton>
        </ExpandableSection>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Typography variant="body2" sx={{ mt: 1, fontSize: '0.8rem' }}>
            {charity.ai_explanation || "AI explanation not available."}
          </Typography>
        </Collapse>
      </CardContentWrapper>

      <CardActionsWrapper>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="body2" fontWeight="medium">Suggested:</Typography>
            <Typography variant="subtitle1" color="primary" fontWeight="bold">
              {suggestedAllocation ? suggestedAllocation.toFixed(2) : 'N/A'} {selectedCrypto}
            </Typography>
          </Box>
          <Button variant="contained" size="small" sx={{ borderRadius: '50px' }}>See Impact</Button>
        </Box>
        {charity.category && (
          <Box sx={{mt: 1.5, display: 'flex', gap: 0.5, flexWrap: 'wrap'}}>
              {charity.category.split('&').map(tag => tag.trim()).map(tag => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" sx={{fontSize: '0.65rem'}} />
              ))}
          </Box>
        )}
      </CardActionsWrapper>
    </StyledCharityCard>
  );
};

export default CharityResultCard; 