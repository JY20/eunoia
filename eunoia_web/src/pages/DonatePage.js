import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Stepper, 
  Step, 
  StepLabel, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions, 
  Divider, 
  Chip, 
  Stack, 
  FormControlLabel, 
  Switch,
  InputAdornment,
  IconButton,
  useTheme,
  alpha,
  Paper,
  Avatar,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedIcon from '@mui/icons-material/Verified';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TextsmsIcon from '@mui/icons-material/Textsms';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

import { AppContext } from '../components/AppProvider';
import { Connected } from '../components/Alert';
import Loading from '../components/Loading';
import { AppContract } from '../components/AppContract';

const API_BASE_URL = 'http://localhost:8000/api';

// Aptos Contract Constants (Re-added for all-frontend approach)
const MODULE_ADDRESS = "0x3940277b22c1fe2c8631bdce9dbcf020c3b8240a5417fa13ac21d37860f88011";
const MODULE_NAME = "eunoia_foundation";
const DONATE_FUNCTION_NAME = "donate";

// Mock data until API integration
/*
const MOCK_CHARITIES = [
  {
    id: 1,
    name: 'Ocean Cleanup Foundation',
    description: "Working to rid the world's oceans of plastic pollution through innovative technologies.",
    logo: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?q=80&w=500&auto=format&fit=crop',
    aptos_wallet_address: '0x123...abc',
    category: 'Environment',
    match_score: 0.95,
    match_reason: "This charity focuses on ocean cleanup which directly relates to your interest in environmental protection and marine conservation."
  },
  {
    id: 2,
    name: 'Reforestation Alliance',
    description: "Planting trees and protecting forests to combat climate change and preserve biodiversity.",
    logo: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=500&auto=format&fit=crop',
    aptos_wallet_address: '0x456...def',
    category: 'Environment',
    match_score: 0.85,
    match_reason: "This charity's reforestation efforts align with your concern about climate change and environmental preservation."
  },
  {
    id: 3,
    name: 'Education For All',
    description: "Providing educational opportunities to underprivileged children around the world.",
    logo: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=500&auto=format&fit=crop',
    aptos_wallet_address: '0x789...ghi',
    category: 'Education',
    match_score: 0.72,
    match_reason: "While not directly related to environmental concerns, education is foundational to creating awareness about environmental issues."
  },
  {
    id: 4,
    name: 'Wildlife Conservation Trust',
    description: "Protecting endangered species and habitats from climate change and human threats.",
    logo: 'https://images.unsplash.com/photo-1564652518878-669c5d2e6b9c?q=80&w=500&auto=format&fit=crop',
    aptos_wallet_address: '0xabc...123',
    category: 'Environment',
    match_score: 0.91,
    match_reason: "This charity focuses on wildlife protection which is closely related to your interest in biodiversity conservation."
  }
];
*/

// Styled components
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

const CharityCard = styled(Card)(({ theme, selected }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '16px',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  border: selected ? `2px solid ${theme.palette.primary.main}` : 'none',
  boxShadow: selected 
    ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}` 
    : '0 4px 12px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: selected 
      ? `0 12px 30px ${alpha(theme.palette.primary.main, 0.5)}` 
      : '0 8px 24px rgba(0, 0, 0, 0.15)',
  },
}));

const AmountInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '50px',
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

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

const BackButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textTransform: 'none',
  fontWeight: 'medium',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
}));

const DonatePage = () => {
  const theme = useTheme();
  const location = useLocation();
  const { walletAddress, setWalletAddress } = useContext(AppContext) || {};
  
  // Parse location state if available
  const initialState = location.state || {};
  const startStep = initialState.startStep || 0;
  const initialSearchValue = initialState.searchValue || '';
  const initialSearchMode = initialState.searchMode || 'direct';
  const initialSelectedCharities = initialState.selectedCharities || [];
  
  const [activeStep, setActiveStep] = useState(startStep);
  const [searchValue, setSearchValue] = useState(initialSearchValue);
  const [needsDescription, setNeedsDescription] = useState(initialSearchMode === 'needs' ? initialSearchValue : '');
  const [searchMode, setSearchMode] = useState(initialSearchMode);
  const [matchedCharities, setMatchedCharities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCharities, setSelectedCharities] = useState(initialSelectedCharities);
  const [donationAmounts, setDonationAmounts] = useState(
    // Initialize amounts for any pre-selected charities
    initialSelectedCharities.reduce((acc, charity) => {
      acc[charity.id] = 10; // Default amount
      return acc;
    }, {})
  );
  const [amplifyImpact, setAmplifyImpact] = useState(true);
  const [donationComplete, setDonationComplete] = useState(false);
  const [transactionPending, setTransactionPending] = useState(false);
  const [transactionError, setTransactionError] = useState(null);
  
  // Mock wallet balance (would come from blockchain)
  const [walletBalance, setWalletBalance] = useState(150.75); // APT tokens

  const steps = [
    'Find Charities',
    'Select & Allocate',
    'Connect Wallet',
    'Confirm & Donate'
  ];

  // On component mount, run search if there's an initial search value
  useEffect(() => {
    if (initialSearchValue && activeStep === 0) {
      handleFindMatches();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Simulate fetching matches based on search or description
  const handleFindMatches = async () => {
    setLoading(true);
    
    try {
      let endpoint = `${API_BASE_URL}/charities/?is_verified=true`;
      if (searchMode === 'direct' && searchValue) {
        endpoint += `&search=${encodeURIComponent(searchValue)}`;
      } else if (searchMode === 'needs' && needsDescription) {
        endpoint += `&search=${encodeURIComponent(needsDescription)}`;
      }

      const response = await axios.get(endpoint);
      const charitiesData = response.data.results || response.data;

      if (searchMode === 'needs') {
        const charitiesWithMockScores = charitiesData.map(charity => ({
          ...charity,
          match_score: Math.random() * (0.98 - 0.7) + 0.7,
          match_reason: "This charity aligns with your described interests based on its category and mission."
        }));
        setMatchedCharities(charitiesWithMockScores);
      } else {
        setMatchedCharities(charitiesData);
      }

    } catch (err) {
      console.error('Error fetching matching charities:', err);
      setMatchedCharities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCharity = (charity) => {
    if (selectedCharities.some(c => c.id === charity.id)) {
      setSelectedCharities(selectedCharities.filter(c => c.id !== charity.id));
      
      // Also remove donation amount
      const updatedAmounts = {...donationAmounts};
      delete updatedAmounts[charity.id];
      setDonationAmounts(updatedAmounts);
    } else {
      setSelectedCharities([...selectedCharities, charity]);
      // Set default donation amount
      setDonationAmounts({
        ...donationAmounts,
        [charity.id]: 10
      });
    }
  };

  const handleDonationAmountChange = (charityId, amount) => {
    if (amount < 0) amount = 0;
    setDonationAmounts({
      ...donationAmounts,
      [charityId]: amount
    });
  };

  const handleConnectWallet = () => {
    // This would interact with the wallet adapter in a real implementation
    // For now, just simulate a successful connection
    setWalletAddress('0x742...3fd9');
    handleNext();
  };

  const calculateTotal = () => {
    return Object.values(donationAmounts).reduce((sum, amount) => sum + Number(amount), 0);
  };

  const calculateFees = () => {
    if (!amplifyImpact) return 0;
    return calculateTotal() * 0.002; // 0.20%
  };

  const handleDonate = async () => {
    if (selectedCharities.length === 0) {
      setTransactionError("No charity selected for donation.");
      return;
    }

    const charityToDonate = selectedCharities[0]; // Example: process first selected
    const amountToDonate = donationAmounts[charityToDonate.id];

    if (!amountToDonate || amountToDonate <= 0) {
      setTransactionError(`Invalid amount for ${charityToDonate.name}.`);
      return;
    }

    // 1 APT = 10^8 OCTA
    const amountInOcta = Math.round(amountToDonate * Math.pow(10, 8)); 
    const coinIdentifier = '0x1::aptos_coin::AptosCoin'; // Default to APT

    // setLoading(true); // setLoading is now part of transactionPending
    setTransactionPending(true);
    setTransactionError(null);
    setDonationComplete(false);

    try {
      // 1. Construct the transaction payload directly on the frontend
      const entryFunctionPayload = {
        type: "entry_function_payload", // Ensure this type string is exactly what the wallet expects
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::${DONATE_FUNCTION_NAME}`,
        type_arguments: [coinIdentifier], // The CoinType generic type argument
        arguments: [
          charityToDonate.name,       // charity_name: String
          coinIdentifier,             // coin_identifier_string: String (runtime argument)
          amountInOcta.toString()     // amount: u64 (passed as string for safety)
        ],
      };

      // 2. Use wallet to sign and submit the transaction
      // Adhering to the new standard suggested by Petra (wrapping the payload)
      if (window.aptos && window.aptos.isConnected) {
        console.log("Constructed Entry Function Payload:", JSON.stringify(entryFunctionPayload, null, 2));
        
        // The Petra deprecation warning: "Usage of `signAndSubmitTransaction(payload)` is going to be deprecated soon. Use `signAndSubmitTransaction({ payload })` instead"
        // This implies the *entire* payload object might need to be wrapped if it's not already in the expected TransactionRequestInput format.
        // However, `entryFunctionPayload` *is* the detailed payload. Let's pass it directly as per many examples, 
        // but if it fails, wrapping it like `{data: entryFunctionPayload}` or `{payload: entryFunctionPayload}` is the next step.
        // For now, let's assume `entryFunctionPayload` is what it wants, and Petra handles the internal wrapping if it needs to for its new API structure.
        // The key is often ensuring the `type` field like "entry_function_payload" is correct.
        
        const pendingTransaction = await window.aptos.signAndSubmitTransaction(entryFunctionPayload); 
        // IF THE ABOVE STILL FAILS WITH TYPEERRORS or similar, TRY:
        // const pendingTransaction = await window.aptos.signAndSubmitTransaction({ data: entryFunctionPayload });
        // OR based on the literal deprecation message:
        // const pendingTransaction = await window.aptos.signAndSubmitTransaction({ payload: entryFunctionPayload });

        console.log("Transaction submitted:", pendingTransaction); 
        // pendingTransaction typically contains { hash: string, ... }
        // You might want to use pendingTransaction.hash to link to an explorer
        setDonationComplete(true);
      } else {
        throw new Error("Aptos wallet not connected or not available. Please connect your wallet.");
      }

    } catch (err) {
      console.error('Donation failed:', err);
      let errorMessage = "Donation failed. Please try again.";
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.name) {
        errorMessage = `Error: ${err.name}`;
      }
      
      if (errorMessage.toLowerCase().includes("user rejected") || 
          errorMessage.toLowerCase().includes("declined") || 
          (err.code && err.code === 4001)) {
        errorMessage = "Transaction rejected by user.";
      }
      setTransactionError(errorMessage);
      setDonationComplete(false);
    } finally {
      // setLoading(false);
      setTransactionPending(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSearchValue('');
    setNeedsDescription('');
    setSearchMode('direct');
    setMatchedCharities([]);
    setSelectedCharities([]);
    setDonationAmounts({});
    setDonationComplete(false);
  };

  // Generate the appropriate step content based on active step
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <StepContent>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Find charities you'd like to support
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              You can search for specific charities or describe what cause you'd like to support.
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
            
            {searchMode === 'direct' ? (
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search for charity names, categories, or keywords..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                sx={{ 
                  mb: 3,
                  borderRadius: '8px',
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
                value={needsDescription}
                onChange={(e) => setNeedsDescription(e.target.value)}
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
              onClick={handleFindMatches}
              disabled={searchMode === 'direct' ? !searchValue : !needsDescription}
              sx={{ px: 4 }}
            >
              Find Matching Charities
            </GlowButton>
            
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            )}
            
            {!loading && matchedCharities.length > 0 && (
              <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                  {matchedCharities.length} {matchedCharities.length === 1 ? 'charity' : 'charities'} matched your search
                </Typography>
                
                <Grid container spacing={3} sx={{ mt: 2 }}>
                  {matchedCharities.map((charity) => (
                    <Grid item xs={12} sm={6} md={4} key={charity.id}>
                      <CharityCard selected={selectedCharities.some(c => c.id === charity.id)}>
                        <CardMedia
                          component="img"
                          height="140"
                          image={charity.logo}
                          alt={charity.name}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                              {charity.name}
                            </Typography>
                            <VerifiedIcon color="primary" fontSize="small" />
                          </Box>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {charity.description}
                          </Typography>
                          <Chip 
                            label={charity.category} 
                            size="small" 
                            sx={{ mb: 1, borderRadius: '50px' }} 
                          />
                          {searchMode === 'needs' && (
                            <Box 
                              sx={{ 
                                mt: 2,
                                p: 1.5, 
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                borderRadius: '12px',
                              }}
                            >
                              <Typography variant="caption" fontWeight="medium" color="primary.main" display="block" gutterBottom>
                                {Math.round(charity.match_score * 100)}% Match
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {charity.match_reason}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                        <CardActions sx={{ p: 2 }}>
                          <Button
                            variant={selectedCharities.some(c => c.id === charity.id) ? "contained" : "outlined"}
                            fullWidth
                            onClick={() => handleSelectCharity(charity)}
                            startIcon={selectedCharities.some(c => c.id === charity.id) ? <CheckCircleIcon /> : <FavoriteIcon />}
                            sx={{ 
                              borderRadius: '50px',
                              textTransform: 'none',
                            }}
                          >
                            {selectedCharities.some(c => c.id === charity.id) ? "Selected" : "Select"}
                          </Button>
                        </CardActions>
                      </CharityCard>
                    </Grid>
                  ))}
                </Grid>
                
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">
                    {selectedCharities.length} {selectedCharities.length === 1 ? 'charity' : 'charities'} selected
                  </Typography>
                  <GlowButton 
                    onClick={handleNext}
                    disabled={selectedCharities.length === 0}
                  >
                    Continue to Allocation
                  </GlowButton>
                </Box>
              </Box>
            )}
            
            {!loading && matchedCharities.length === 0 && searchValue && (
              <Box sx={{ textAlign: 'center', my: 4, p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: '16px' }}>
                <Typography variant="h6" gutterBottom>
                  No charities found matching your search
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try different keywords or categories.
                </Typography>
              </Box>
            )}
          </StepContent>
        );
      
      case 1:
        return (
          <StepContent>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Allocate your donation
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Decide how much you'd like to donate to each charity.
            </Typography>
            
            {selectedCharities.map((charity) => (
              <Box 
                key={charity.id} 
                sx={{ 
                  mb: 3, 
                  p: 3, 
                  backgroundColor: alpha(theme.palette.background.paper, 0.7),
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={charity.logo} 
                        sx={{ width: 48, height: 48, mr: 2 }} 
                        variant="rounded"
                      />
                      <Box>
                        <Typography variant="h6">{charity.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Wallet: {charity.aptos_wallet_address}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton 
                        onClick={() => handleDonationAmountChange(
                          charity.id, 
                          Math.max(0, Number(donationAmounts[charity.id]) - 1)
                        )}
                        sx={{ color: theme.palette.primary.main }}
                      >
                        <RemoveCircleOutlineIcon />
                      </IconButton>
                      
                      <AmountInput
                        value={donationAmounts[charity.id] || 0}
                        onChange={(e) => handleDonationAmountChange(
                          charity.id, 
                          e.target.value === '' ? 0 : Number(e.target.value)
                        )}
                        type="number"
                        variant="outlined"
                        size="small"
                        sx={{ width: '100px', mx: 1 }}
                        inputProps={{ 
                          min: 0,
                          step: 0.1
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              $
                            </InputAdornment>
                          ),
                        }}
                      />
                      
                      <IconButton 
                        onClick={() => handleDonationAmountChange(
                          charity.id, 
                          Number(donationAmounts[charity.id]) + 1
                        )}
                        sx={{ color: theme.palette.primary.main }}
                      >
                        <AddCircleOutlineIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            ))}
            
            <Box 
              sx={{ 
                mt: 4, 
                p: 3, 
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: '16px',
              }}
            >
              <FormControlLabel
                control={
                  <Switch 
                    checked={amplifyImpact} 
                    onChange={(e) => setAmplifyImpact(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      Amplify Your Impact (+0.20%)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This small contribution helps fund marketing for all charities on our platform.
                    </Typography>
                  </Box>
                }
                sx={{ mb: 2 }}
              />
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Donation Total:</Typography>
                <Typography variant="body1" fontWeight="bold">${calculateTotal().toFixed(2)}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Amplify Impact Fee:</Typography>
                <Typography variant="body2" color="text.secondary">${calculateFees().toFixed(2)}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" fontWeight="bold">Total Amount:</Typography>
                <Typography variant="body1" fontWeight="bold" color="primary.main">
                  ${(calculateTotal() + calculateFees()).toFixed(2)}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <BackButton onClick={handleBack}>
                Back to Search
              </BackButton>
              <GlowButton 
                onClick={handleNext}
                disabled={calculateTotal() <= 0}
              >
                Proceed to Wallet Connection
              </GlowButton>
            </Box>
          </StepContent>
        );
      
      case 2:
        return (
          <StepContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Connect your wallet
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Connect your Aptos wallet to make your donation securely.
              </Typography>
              
              <Box 
                sx={{ 
                  display: 'inline-block',
                  p: 3,
                  mt: 3,
                  mb: 5,
                  borderRadius: '24px',
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
                }}
              >
                <AccountBalanceWalletIcon 
                  sx={{ 
                    fontSize: 80, 
                    color: theme.palette.primary.main,
                    mb: 2
                  }} 
                />
                
                <Typography variant="h6" gutterBottom>
                  Total Donation Amount
                </Typography>
                <Typography 
                  variant="h4" 
                  color="primary.main" 
                  fontWeight="bold" 
                  gutterBottom
                >
                  ${(calculateTotal() + calculateFees()).toFixed(2)}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  Supporting {selectedCharities.length} {selectedCharities.length === 1 ? 'charity' : 'charities'}
                </Typography>
                
                <GlowButton
                  onClick={handleConnectWallet}
                  sx={{ 
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem'
                  }}
                  startIcon={<AccountBalanceWalletIcon />}
                >
                  Connect Petra Wallet
                </GlowButton>
              </Box>
            </Box>
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <BackButton onClick={handleBack}>
                Back to Allocation
              </BackButton>
            </Box>
          </StepContent>
        );
      
      case 3:
        return (
          <StepContent>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Confirm your donation
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Review your donation details and confirm.
            </Typography>
            
            <Box 
              sx={{ 
                p: 3, 
                borderRadius: '16px',
                backgroundColor: alpha(theme.palette.success.main, 0.05),
                mb: 4
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1">Connected Wallet:</Typography>
                <Typography variant="body1" fontWeight="medium">{walletAddress}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1">Available Balance:</Typography>
                <Typography variant="body1" fontWeight="medium">{walletBalance} APT</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" fontWeight="medium" gutterBottom>Donation Breakdown:</Typography>
              
              {selectedCharities.map((charity) => (
                <Box key={charity.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{charity.name}:</Typography>
                  <Typography variant="body2" fontWeight="medium">${donationAmounts[charity.id]}</Typography>
                </Box>
              ))}
              
              {amplifyImpact && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Amplify Impact (0.20%):</Typography>
                  <Typography variant="body2" fontWeight="medium">${calculateFees().toFixed(2)}</Typography>
                </Box>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" fontWeight="bold">Total Amount:</Typography>
                <Typography variant="body1" fontWeight="bold" color="primary.main">
                  ${(calculateTotal() + calculateFees()).toFixed(2)}
                </Typography>
              </Box>
            </Box>
            
            {donationComplete ? (
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  py: 4, 
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  borderRadius: '16px'
                }}
              >
                <CheckCircleIcon 
                  sx={{ 
                    fontSize: 60, 
                    color: theme.palette.success.main,
                    mb: 2
                  }} 
                />
                <Typography variant="h5" gutterBottom color="success.main">
                  Donation Successful!
                </Typography>
                <Typography variant="body1" paragraph>
                  Thank you for your contribution to these amazing causes.
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={handleReset}
                  sx={{ 
                    mt: 2,
                    borderRadius: '50px',
                    textTransform: 'none'
                  }}
                >
                  Make Another Donation
                </Button>
              </Box>
            ) : (
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                <BackButton onClick={handleBack}>
                  Back to Wallet Connection
                </BackButton>
                {
                  transactionPending ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <CircularProgress sx={{ mb: 2 }}/>
                      <Typography>Processing transaction...</Typography>
                      <Typography variant="body2" color="text.secondary">Please confirm in your wallet.</Typography>
                    </Box>
                  ) : (
                    <GlowButton 
                      onClick={handleDonate}
                    >
                      Confirm Donation
                    </GlowButton>
                  )
                }
              </Box>
            )}
            {transactionError && (
              <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
                {transactionError}
              </Typography>
            )}
          </StepContent>
        );
      
      default:
        return 'Unknown step';
    }
  };

  // If the user is not connected and at a later step, show the connect message
  if (!walletAddress && activeStep >= 2) {
    return <Connected />;
  }

  return (
    <Box sx={{ py: 6, background: 'linear-gradient(135deg, #f5f7fa 0%, #e4ecfb 100%)' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
          Make a Donation
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6, maxWidth: '700px', mx: 'auto' }}>
          Your contribution makes a direct impact. Choose your charities and track your donation transparently on the blockchain.
        </Typography>
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ 
          bgcolor: 'white', 
          borderRadius: '24px', 
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
          p: { xs: 2, sm: 4 }, 
          mb: 6,
          minHeight: '600px'
        }}>
          {getStepContent(activeStep)}
        </Box>
      </Container>
    </Box>
  );
};

export default DonatePage;