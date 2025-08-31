import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  CircularProgress, 
  alpha, 
  Divider, 
  FormControlLabel, 
  Switch 
} from '@mui/material';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import CharityResultCard from '../CharityResultCard';
import ImpactMap from '../ImpactMap';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

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

const SidebarPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: '16px',
  background: alpha(theme.palette.background.default, 0.7),
  backdropFilter: 'blur(8px)',
  height: '100%',
}));

const CharityResultsView = ({
  aiMatchedCharities,
  aiSuggestedAllocations,
  setCurrentStage,
  selectedCrypto,
  platformFeeActive,
  setPlatformFeeActive,
  calculatePlatformFee,
  totalDonationAmount,
  visionPrompt,
  theme,
  semanticSearchLoading,
  semanticSearchError,
  selectedCharityIds,
  handleToggleCharitySelection,
  individualDonationAmounts,
  handleIndividualAmountChange,
  combinedMissionStatement,
  compassRecommendations = [],
  groupedMatches = {}
}) => {
  console.log('CharityResultsView render, charities:', aiMatchedCharities);
  console.log('Selected IDs:', selectedCharityIds);
  console.log('Individual Amounts:', individualDonationAmounts);

  const extractUserInputs = () => {
    const missionKeywords = visionPrompt.toLowerCase().match(/\b(empower|support|education|girls|africa|children|communities|health|environment|innovation|faith|art)\b/g) || [];
    const uniqueMissionKeywords = [...new Set(missionKeywords)];
    const valueKeywords = uniqueMissionKeywords.slice(0, 2);
    return {
      mission: visionPrompt || 'Not specified',
      values: valueKeywords.length > 0 ? valueKeywords.join(', ') : 'General Impact',
      region: visionPrompt.toLowerCase().includes('africa') ? 'Africa' : visionPrompt.toLowerCase().includes('uganda') ? 'Uganda' : 'Global/Not specified',
      givingStyle: 'One-time (recurring can be an option)'
    };
  };

  console.log('Individual Amounts:', aiSuggestedAllocations); // This was an old log, might be individualDonationAmounts now
  console.log('CharityResultsView - received combinedMissionStatement prop:', combinedMissionStatement);

  return (
    <StepContent sx={{maxWidth: '1200px', mx: 'auto', py: {xs: 2, sm: 3}}}>
      <Box sx={{ textAlign: 'center', mb: {xs: 3, sm: 4} }}>
        <Typography variant="h3" fontWeight="bold" sx={{ fontFamily: "'Space Grotesk', sans-serif"}} gutterBottom>
          Your Compass results here.
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
          Backed by hundreds of data points.
        </Typography>
      </Box>

      {/* Top 3 movement recommendations */}
      {Array.isArray(compassRecommendations) && compassRecommendations.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Top Picks For You</Typography>
          <Grid container spacing={2}>
            {compassRecommendations.slice(0,3).map((rec, idx) => {
              const group = Object.values(groupedMatches || {}).find(g => g.charity_name === rec.charity_name);
              const movement = group?.movements?.find(m => m.movement_id === rec.movement_id);
              const charityId = group?.charity_id;
              const summary = movement?.summary || '';
              return (
                <Grid item xs={12} md={4} key={`${rec.movement_id}-${idx}`}>
                  <Paper sx={{ p: 2, borderRadius: '12px' }} elevation={3}>
                    <Typography variant="subtitle2" color="text.secondary">{rec.charity_name}</Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ mt: 0.5 }}>{rec.movement_title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {summary ? `${summary.substring(0, 180)}${summary.length > 180 ? '…' : ''}` : 'No summary available.'}
                    </Typography>
                    {rec.reason && (
                      <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 1.5, fontStyle: 'italic' }}>
                        {rec.reason}
                      </Typography>
                    )}
                    {charityId && (
                      <Button size="small" sx={{ mt: 1.5, borderRadius: '20px' }} variant={selectedCharityIds.has(charityId) ? 'contained' : 'outlined'} onClick={() => handleToggleCharitySelection(charityId)}>
                        {selectedCharityIds.has(charityId) ? 'Selected' : 'Select Charity'}
                      </Button>
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      <Grid container spacing={3}>
        {/* Charity Results Feed - now a nested grid for 2 columns */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}> {/* Nested grid for cards */}
            {semanticSearchLoading && (
              <Grid item xs={12} sx={{textAlign: 'center', my: 5}}>
                <CircularProgress />
                <Typography sx={{mt: 1}}>Finding your matches...</Typography>
              </Grid>
            )}
            {!semanticSearchLoading && semanticSearchError && (
              <Grid item xs={12} sx={{textAlign: 'center', my: 5}}>
                <ReportProblemIcon color="error" sx={{fontSize: 40}}/>
                <Typography color="error.main" sx={{mt: 1}}>{semanticSearchError}</Typography>
                 <Button 
                    variant="outlined" 
                    onClick={() => setCurrentStage('visionPrompt')} 
                    sx={{mt:2, borderRadius: '50px'}}
                  >
                    Try Adjusting Your Vision
                  </Button>
              </Grid>
            )}
            {!semanticSearchLoading && !semanticSearchError && aiMatchedCharities.length === 0 && (
              <Grid item xs={12} sx={{textAlign: 'center', my: 5}}>
                <Typography variant="h6" sx={{ mt: 3 }}>No charities matched your vision.</Typography>
                <Typography color="text.secondary">Try adjusting your prompt or explore charities directly.</Typography>
                 <Button 
                    variant="outlined" 
                    onClick={() => setCurrentStage('visionPrompt')} 
                    sx={{mt:2, borderRadius: '50px', mr: 1}}
                  >
                    Edit My Compass
                  </Button>
                  <Button 
                    component={Link} 
                    to="/charities"
                    variant="contained" 
                    sx={{mt:2, borderRadius: '50px'}}
                  >
                    Explore All Charities
                  </Button>
              </Grid>
            )}
            {!semanticSearchLoading && !semanticSearchError && aiMatchedCharities.map(charity => (
              <Grid item xs={12} sm={6} key={charity.id}> {/* Each card takes half width on sm and up */}
                <CharityResultCard 
                  charity={charity} 
                  // suggestedAllocation={aiSuggestedAllocations[charity.id]} // Keeping for now, but individual amount will be primary
                  currentAmount={individualDonationAmounts[charity.id] || 0}
                  onAmountChange={(newAmount) => handleIndividualAmountChange(charity.id, newAmount)}
                  isSelected={selectedCharityIds.has(charity.id)}
                  onToggleSelect={() => handleToggleCharitySelection(charity.id)}
                  selectedCrypto={selectedCrypto}
                  theme={theme} // Pass theme if CharityResultCard uses it directly for styling
                />
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Right Sidebar (Compass Summary) */}
        <Grid item xs={12} md={4}>
          <SidebarPaper>
            <Typography variant="h6" fontWeight="bold" gutterBottom>How Compass found your matches:</Typography>

            {/* Display Combined Mission Statement HERE */}
            {combinedMissionStatement && (
              <Box sx={{ my: 2, p: 1.5, backgroundColor: alpha(theme.palette.primary.main, 0.05), borderRadius: '8px', borderLeft: `4px solid ${theme.palette.primary.main}` }}>
                <Typography variant="subtitle1" color="primary.dark" sx={{ fontStyle: 'italic', fontWeight: 'medium' }}>
                  Mission 🎯: <Typography component="span" variant="subtitle1" sx={{ fontStyle: 'italic', fontWeight: 'normal', color: 'text.primary'}}>{combinedMissionStatement}</Typography>
                </Typography>
              </Box>
            )}
            
            <Divider sx={{my: 2}} />
            
            {/* Impact Map Section */}
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom sx={{mt: 2}}>
              Your Impact Area
            </Typography>
            {console.log('CharityResultsView - aiMatchedCharities for ImpactMap:', aiMatchedCharities)}
            <ImpactMap charities={aiMatchedCharities} />
            
            <Divider sx={{my: 2}} />
            <Typography variant="subtitle2" fontWeight="medium" gutterBottom>Match Score Legend:</Typography>
            <Typography variant="caption" color="text.secondary" paragraph>
              Our AI analyzes your inputs against detailed charity profiles. Higher scores indicate stronger alignment with your stated mission, values, and preferences.
            </Typography>
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={() => setCurrentStage('visionPrompt')} 
              sx={{mt:1, borderRadius: '50px'}}
            >
              Edit My Compass
            </Button>
          </SidebarPaper>
        </Grid>
      </Grid>

      {/* Donation Summary and Action */}
      <Paper elevation={3} sx={{ mt: 4, p: {xs: 2, sm:3}, borderRadius: '16px', background: alpha(theme.palette.background.paper, 0.8), backdropFilter: 'blur(5px)' }}>
        <FormControlLabel
          control={
            <Switch 
              checked={platformFeeActive}
              onChange={(e) => setPlatformFeeActive(e.target.checked)}
              color="primary"
            />
          }
          labelPlacement="start"
          label={
            <Box sx={{textAlign: 'left', flexGrow: 1}}>
              <Typography variant="body1" fontWeight="medium">
                Support Eunoia Platform (+0.20%)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Helps us operate & grow! Fee: {calculatePlatformFee().toFixed(2)} {selectedCrypto}
              </Typography>
            </Box>
          }
          sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', ml:0 }}
        />
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt:1 }}>
          <Typography variant="h5" fontWeight="bold">Total Donation:</Typography>
          <Typography variant="h5" fontWeight="bold" color="primary.main">
            {(totalDonationAmount + calculatePlatformFee()).toFixed(2)} {selectedCrypto}
          </Typography>
        </Box>
      </Paper>
            
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button onClick={() => setCurrentStage('visionPrompt')} sx={{color: theme.palette.text.secondary, textTransform: 'none'}}>Adjust Vision</Button>
        <GlowButton 
          onClick={() => setCurrentStage('donationConfirmation')}
          disabled={selectedCharityIds.size === 0} // Disable if no charities are selected
          size="large"
          sx={{py: 1.5, px: 5, fontSize: '1.1rem'}}
        >
          Confirm & Donate
        </GlowButton>
      </Box>
    </StepContent>
  );
};

export default CharityResultsView;
