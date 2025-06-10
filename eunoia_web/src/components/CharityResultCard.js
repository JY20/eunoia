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
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CardMedia,
  CardActions
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const StyledCard = styled(Card)(({ theme, selected }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '16px',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  border: selected ? `3px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
  boxShadow: selected 
    ? `0 10px 25px ${alpha(theme.palette.primary.main, 0.35)}` 
    : theme.shadows[3],
  cursor: 'pointer',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: selected 
      ? `0 14px 30px ${alpha(theme.palette.primary.main, 0.4)}` 
      : theme.shadows[6],
  },
}));

const ExpandableSection = styled(Box)({
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '8px',
});

const AmountControlBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(0.5, 0),
  marginTop: theme.spacing(1),
}));

const CharityResultCard = ({
  charity,
  suggestedAllocation,
  selectedCrypto,
  theme,
  isSelected,
  onToggleSelect,
  currentAmount,
  onAmountChange
}) => {
  const [expanded, setExpanded] = useState(false);

  const getReasonTags = (explanation) => {
    if (!explanation) return [];
    const keywords = ['education', 'faith', 'africa', 'children', 'empowerment', 'uganda', 'health', 'environment', 'innovation', 'community'];
    return keywords.filter(kw => explanation.toLowerCase().includes(kw)).slice(0, 3);
  };
  // const reasonTags = getReasonTags(charity.ai_explanation || "");

  const handleIncreaseAmount = (e) => {
    e.stopPropagation();
    onAmountChange(currentAmount + 1);
  };

  const handleDecreaseAmount = (e) => {
    e.stopPropagation();
    onAmountChange(Math.max(1, currentAmount - 1));
  };
  
  const displayAmount = currentAmount !== undefined ? currentAmount : (suggestedAllocation || 0);

  return (
    <StyledCard selected={isSelected} onClick={onToggleSelect} elevation={isSelected ? 10 : 2}>
      {isSelected && (
        <CheckCircleIcon 
          color="primary"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            fontSize: '2.2rem',
            backgroundColor: 'white',
            borderRadius: '50%',
            padding: '2px',
            boxShadow: '0px 3px 6px rgba(0,0,0,0.25)',
            zIndex: 10
          }}
        />
      )}
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Grid container spacing={1} alignItems="flex-start" sx={{ mb: 1 }}> 
          <Grid item xs={3} sm={2} md={3}>
            <Avatar 
              src={charity.logo || 'https://via.placeholder.com/100?text=U'} 
              alt={`${charity.name} logo`} 
              sx={{ width: 56, height: 56 }}
              variant="rounded"
            />
          </Grid>
          <Grid item xs={9} sm={10} md={9}>
            <Typography variant="h6" fontWeight="bold" component="div" sx={{fontSize: '1.0rem', lineHeight: 1.3}}>
              {charity.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mt: 0.5}}>
                <Chip 
                  icon={<CheckCircleIcon fontSize="small"/>} 
                  label={`${charity.match_score_percent}% Match`}
                  color="primary" 
                  size="small" 
                  variant="filled" 
                  sx={{ fontSize: '0.7rem' }}
                />
                <Chip 
                  icon={<VerifiedUserIcon fontSize="small"/>} 
                  label={`Trust: ${charity.trust_score_grade}`}
                  color="success" 
                  size="small" 
                  variant="outlined" 
                  sx={{ fontSize: '0.7rem' }}
                />
            </Box>
          </Grid>
        </Grid>

        <ExpandableSection onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
          <Typography variant="caption" fontWeight="medium">Why this match?</Typography>
          <IconButton size="small" sx={{p:0.2}}>
            <ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s'}}/>
          </IconButton>
        </ExpandableSection>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.75rem', color: 'text.secondary' }}>
            {charity.ai_explanation || "AI explanation not available."}
          </Typography>
        </Collapse>
        
        {charity.category && (
          <Chip 
            label={charity.category_display || charity.category} 
            size="small" 
            variant="outlined" 
            sx={{ fontSize: '0.65rem', alignSelf: 'flex-start', mb: 1}}
          />
        )}
        
        {isSelected && (
          <Paper elevation={0} sx={{ borderRadius: '8px', p:1, background: alpha(theme.palette.grey[500], 0.05), mt: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <Typography variant="caption" display="block" textAlign="center" fontWeight="medium" sx={{mb: 0.5}}>
              Donate Amount ({selectedCrypto}):
            </Typography>
            <AmountControlBox>
              <IconButton onClick={handleDecreaseAmount} size="small" color="primary" aria-label="decrease amount">
                <RemoveCircleOutlineIcon />
              </IconButton>
              <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{minWidth: '60px', textAlign: 'center', mx:0.5}}>
                {displayAmount.toFixed(2)}
              </Typography>
              <IconButton onClick={handleIncreaseAmount} size="small" color="primary" aria-label="increase amount">
                <AddCircleOutlineIcon />
              </IconButton>
            </AmountControlBox>
          </Paper>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default CharityResultCard; 