import React, { useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TextsmsIcon from '@mui/icons-material/Textsms';
import InsightsIcon from '@mui/icons-material/Insights';

const StepContent = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  minHeight: '400px',
}));

const ImpactTrackerView = ({ 
  aiSuggestedAllocations, 
  aiMatchedCharities, 
  selectedCrypto, 
  setImpactActivities,
  impactActivities,
  setCurrentStage,
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
  handleReset
}) => { 
  console.log('ImpactTrackerView render');
  useEffect(() => {
    const baseDonationAmount = aiMatchedCharities[0] && aiSuggestedAllocations[aiMatchedCharities[0]?.id] ? aiSuggestedAllocations[aiMatchedCharities[0]?.id] : 0;
    const charityName = aiMatchedCharities[0]?.name || 'the selected cause';

    const initialActivities = [
      { id: 1, text: `✅ ${(baseDonationAmount).toFixed(2)} ${selectedCrypto} sent to ${charityName} Wallet`, time: "Just now", type: "transfer" },
    ];
    
    setImpactActivities(initialActivities);

    let currentDelay = 0;
    const activityTimeouts = [];

    const scheduleActivity = (text, time, type, delay) => {
      currentDelay += delay;
      const timeoutId = setTimeout(() => {
        setImpactActivities(prev => [...prev, {id: prev.length + Date.now(), text, time, type}])
      }, currentDelay);
      activityTimeouts.push(timeoutId);
    }

    if (baseDonationAmount > 0) {
      scheduleActivity(`📬 Confirmation received from ${charityName}`, "Moments ago", "confirmation", 1500);

      const books = Math.floor(baseDonationAmount / 5); 
      if (books > 0) {
        scheduleActivity(`📘 ${books} book${books > 1 ? 's' : ''} being prepared for distribution`, "Updates soon", "action", 2000);
      }
      const meals = Math.floor(baseDonationAmount / 2);
      if (meals > 0) {
        scheduleActivity(`🍲 ${meals} meal${meals > 1 ? 's' : ''} funding allocated to kitchen partners`, "Updates soon", "action", 2500);
      }
      if (baseDonationAmount > 10) {
        scheduleActivity(`🤝 Community outreach program benefiting from your support`, "In progress", "action", 3000);
      }
    }
    return () => {
      activityTimeouts.forEach(clearTimeout);
    };

  }, [aiSuggestedAllocations, aiMatchedCharities, selectedCrypto, setImpactActivities]);

  const totalImpactStats = {
    mealsFunded: aiMatchedCharities.length > 0 && aiSuggestedAllocations[aiMatchedCharities[0]?.id] ? Math.floor(aiSuggestedAllocations[aiMatchedCharities[0].id] / 2) : 0,
    booksProvided: aiMatchedCharities.length > 0 && aiSuggestedAllocations[aiMatchedCharities[0]?.id] ? Math.floor(aiSuggestedAllocations[aiMatchedCharities[0].id] / 5) : 0,
    childrenHelped: aiMatchedCharities.length > 0 && aiSuggestedAllocations[aiMatchedCharities[0]?.id] ? Math.floor(aiSuggestedAllocations[aiMatchedCharities[0].id] / 1.5) : 0, 
  };

  const getSocialPostText = () => { 
    const charityName = aiMatchedCharities[0]?.name || 'a great cause';
    let impactHighlights = [];
    if (totalImpactStats.childrenHelped > 0) impactHighlights.push(`${totalImpactStats.childrenHelped} children helped`);
    if (totalImpactStats.mealsFunded > 0) impactHighlights.push(`${totalImpactStats.mealsFunded} meals funded`);
    if (totalImpactStats.booksProvided > 0) impactHighlights.push(`${totalImpactStats.booksProvided} books provided`);
    
    if (impactHighlights.length === 0 && aiMatchedCharities.length > 0 && aiSuggestedAllocations[aiMatchedCharities[0]?.id] > 0) {
      return `Supported ${charityName} with a donation of ${(aiSuggestedAllocations[aiMatchedCharities[0]?.id]).toFixed(2)} ${selectedCrypto}.`
    }
    return impactHighlights.join(', ') || `Made a contribution to ${charityName}.`;
  };

  return (
    <StepContent sx={{ textAlign: 'center', py: {xs:4, sm:6}}}>
      <Typography variant="h5" fontWeight="bold">Your Impact</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2, mb: 3 }}>
        {getSocialPostText()}
      </Typography>
      <Typography variant="subtitle1" sx={{mb:1, fontWeight:'medium'}}>Transaction Journey:</Typography>
      <List dense sx={{maxWidth: 400, margin: 'auto', textAlign: 'left'}}>
        {impactActivities.map((activity) => (
          <ListItem key={activity.id}>
            <ListItemIcon sx={{minWidth: '30px'}}>
              {activity.type === 'transfer' && <CheckCircleIcon fontSize="small" color="success"/>}
              {activity.type === 'confirmation' && <TextsmsIcon fontSize="small" color="info"/>}
              {activity.type === 'action' && <InsightsIcon fontSize="small" color="secondary"/>}
            </ListItemIcon>
            <ListItemText primary={activity.text} secondary={activity.time} />
          </ListItem>
        ))}
      </List>
      <Button onClick={handleReset} variant="outlined" sx={{mt:3, borderRadius: '50px'}}>
        Make Another Donation
      </Button>
    </StepContent>
  );
};

export default ImpactTrackerView;

