import React, { useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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

const DonationConfirmationView = ({
  currentStage,
  transactionPending,
  donationComplete,
  transactionError,
  walletAddress,
  handleDonate,
  setCurrentStage,
  handleReset,
  setTransactionError,
  currentProcessingCharityIndex,
  aiMatchedCharities,
  aiSuggestedAllocations,
  selectedCrypto,
  selectedCharityIds,
  handleToggleCharitySelection,
  individualDonationAmounts,
  handleIndividualAmountChange
}) => { 
  console.log('DonationConfirmationView render, index:', currentProcessingCharityIndex);
  
  // Get the current charity and amount for display
  const charityToDisplay = aiMatchedCharities && aiMatchedCharities[currentProcessingCharityIndex];
  const amountToDisplay = charityToDisplay && aiSuggestedAllocations && aiSuggestedAllocations[charityToDisplay.id];

  useEffect(() => {
    // Ensure charityToDisplay is valid before attempting to donate
    if (currentStage === 'donationConfirmation' && charityToDisplay && !transactionPending && !donationComplete && !transactionError) {
      if (!walletAddress) {
        setTransactionError("Wallet not connected. Please connect your wallet first.");
        return;
      }
      // Check if we are ready to process this specific charity (e.g. not already completed/failed *for this specific one*)
      // This check might be redundant if handleDonate correctly manages global state per step.
      console.log(`DonationConfirmationView useEffect: Triggering handleDonate for ${charityToDisplay.name}`);
      handleDonate(); 
    }
  }, [currentStage, transactionPending, donationComplete, transactionError, walletAddress, handleDonate, setTransactionError, setCurrentStage, currentProcessingCharityIndex, charityToDisplay]);

  if (!charityToDisplay) {
    return (
      <StepContent sx={{ textAlign: 'center', py: {xs:4, sm:6}}}>
        <Typography variant="h6">Preparing next donation or finalizing...</Typography>
        <CircularProgress sx={{my: 2}}/>
      </StepContent>
    );
  }

  // Display information for the current charity being confirmed
  
  const displayCharityName = charityToDisplay.name || "Selected Charity";
  const displayAmount = amountToDisplay || "N/A";

  if (transactionPending) {
    return (
      <StepContent sx={{ textAlign: 'center', py: {xs:4, sm:6}}}>
        <CircularProgress sx={{ mb: 3, width: '60px !important', height: '60px !important' }}/>
        <Typography variant="h5" fontWeight="bold" gutterBottom>Processing Your Donation</Typography>
        <Typography variant="body1" color="text.secondary">To: {displayCharityName}</Typography>
        <Typography variant="body1" color="text.secondary">Amount: {displayAmount} {selectedCrypto}</Typography>
        <Typography variant="body1" color="text.secondary" sx={{mt:1}}>Please confirm the transaction in your wallet.</Typography>
        <Typography variant="body2" color="text.secondary" sx={{mt:1}}><i>(This may take a moment)</i></Typography>
      </StepContent>
    );
  }
  
  if (transactionError) {
    return (
      <StepContent sx={{ textAlign: 'center', py: {xs:4, sm:6}}}>
        <ReportProblemIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" color="error" fontWeight="bold" gutterBottom>Donation Failed</Typography>
        <Typography color="error" paragraph>{transactionError}</Typography>
        <GlowButton variant="outlined" onClick={() => setCurrentStage('charityResults')} sx={{background: 'transparent', color: 'primary.main', mr:1}}>Try Again</GlowButton>
        <Button variant="text" onClick={handleReset}>Start Over</Button>
      </StepContent>
    );
  }
      
  if (donationComplete) {
    return (
      <StepContent sx={{ textAlign: 'center', py: {xs:4, sm:6}}}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom fontWeight="bold" color="success.main" sx={{ fontFamily: "'Space Grotesk', sans-serif"}}>
          Donation Successful!
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{mb:3}}>
          Thank you for your generosity and trust in Eunoia.
        </Typography>
        <GlowButton onClick={() => setCurrentStage('impactTracker')} size="large" sx={{py: 1.5, px: 5, fontSize: '1.1rem'}}>
          Track Your Impact
        </GlowButton>
        <Button sx={{ml: 2, textTransform:'none'}} variant="text" onClick={handleReset}>Make Another Donation</Button>
      </StepContent>
    );
  }
    
  return (
    <StepContent sx={{ textAlign: 'center', py: {xs:4, sm:6}}}>
      <Typography variant="h5" fontWeight="bold">Preparing your donation...</Typography>
      <CircularProgress sx={{my: 3, width: '50px !important', height: '50px !important'}} />
    </StepContent>
  );
};

export default DonationConfirmationView;