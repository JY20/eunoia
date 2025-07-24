/* global BigInt */
import React, { useState, useEffect, useContext, useRef } from 'react';
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
  CircularProgress,
  LinearProgress,
  Slider,
  MenuItem,
  Tooltip
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
import { Link } from 'react-router-dom';
import { Collapse } from '@mui/material';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';

// Import Aptos libraries for balance checking
import { AptosClient, CoinClient } from "aptos";
import { createClient } from "polkadot-api";
import { getSmProvider } from 'polkadot-api/sm-provider';

// New Icons for AI flow
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'; // For AI
import InsightsIcon from '@mui/icons-material/Insights'; // For AI analysis
import ShareIcon from '@mui/icons-material/Share'; // For sharing impact
import InfoIcon from '@mui/icons-material/Info';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ExploreIcon from '@mui/icons-material/Explore'; // Placeholder for Compass
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'; // For trust score
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Icons for Moodboard (placeholders)
import SchoolIcon from '@mui/icons-material/School'; // Education
import ForestIcon from '@mui/icons-material/Forest'; // Environment
import GavelIcon from '@mui/icons-material/Gavel'; // Justice
import ChurchIcon from '@mui/icons-material/Church'; // Faith-based (example)
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism'; // Local support/Community
import CodeIcon from '@mui/icons-material/Code'; // Innovation
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import ChevronRightIcon from '@mui/icons-material/ChevronRight'; // For Next button

import { AppContext, CHAINS } from '../components/AppProvider';
import { Connected } from '../components/Alert';
import Loading from '../components/Loading';
import { AppContract } from '../components/AppContract';
import CompassAnimation from '../components/CompassAnimation'; // Import the new component
import CharityResultCard from '../components/CharityResultCard'; // Import the new card component
import ImpactMap from '../components/ImpactMap'; // Import the new map component

// Mock data, replace with API calls
// Constants for API and Wallet
const API_BASE_URL = 'https://eunoia-api-eya2hhfdfzcchyc2.canadacentral-01.azurewebsites.net/api'; // Backend API base URL
const MODULE_ADDRESS = "0x3940277b22c1fe2c8631bdce9dbcf020c3b8240a5417fa13ac21d37860f88011";
const MODULE_NAME = "eunoia_foundation";
const DONATE_FUNCTION_NAME = "donate";

// Polkadot Contract Constants (Placeholders until real ones are available)
const POLKADOT_CONTRACT_ADDRESS = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"; // Placeholder
const POLKADOT_MODULE_NAME = "eunoia_foundation";
const POLKADOT_DONATE_FUNCTION_NAME = "donate";

// Balance checking constants
const APTOS_NODE_URL = "https://fullnode.testnet.aptoslabs.com";
const POLKADOT_NODE_URL = "wss://rpc.polkadot.io";

// Token type mapping
const TOKEN_TYPES = {
  APT: "0x1::aptos_coin::AptosCoin",
  DOT: "DOT",
  USDC: "0x1::coin::CoinStore<0x8c805723ebc0a7fc5b7d3e7b75d567918e806b3461cb9fa21941a9edc0220bf::usdc::USDC>"
};

// Mock data until API integration
// const MOCK_CHARITIES_DATA = [ ... ];

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

const StyledCharityCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  borderRadius: '16px',
  boxShadow: theme.shadows[6],
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[12],
  },
}));

const SidebarPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: '16px',
  background: alpha(theme.palette.background.default, 0.7),
  backdropFilter: 'blur(8px)',
  height: '100%',
}));

const ExpandableSection = styled(Box)({
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '8px',
});

// Top-level CharityResultsView component
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
  combinedMissionStatement
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
  const userInputs = extractUserInputs();

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
            {/* <List dense>
              <ListItem>
                <ListItemIcon sx={{minWidth: '30px'}}><Typography variant="body2" fontWeight="bold">🎯</Typography></ListItemIcon>
                <ListItemText primaryTypographyProps={{variant: 'body2', fontWeight: 'medium'}} secondaryTypographyProps={{variant: 'caption'}} primary="Mission:" secondary={userInputs.mission} />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{minWidth: '30px'}}><Typography variant="body2" fontWeight="bold">💖</Typography></ListItemIcon>
                <ListItemText primaryTypographyProps={{variant: 'body2', fontWeight: 'medium'}} secondaryTypographyProps={{variant: 'caption'}} primary="Values:" secondary={userInputs.values} />
              </ListItem> */}
              {/* <ListItem>
                <ListItemIcon sx={{minWidth: '30px'}}><Typography variant="body2" fontWeight="bold">🌍</Typography></ListItemIcon>
                <ListItemText primaryTypographyProps={{variant: 'body2', fontWeight: 'medium'}} secondaryTypographyProps={{variant: 'caption'}} primary="Region:" secondary={userInputs.region} />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{minWidth: '30px'}}><Typography variant="body2" fontWeight="bold">💸</Typography></ListItemIcon>
                <ListItemText primaryTypographyProps={{variant: 'body2', fontWeight: 'medium'}} secondaryTypographyProps={{variant: 'caption'}} primary="Giving Style:" secondary={userInputs.givingStyle} />
              </ListItem> */}
            {/* </List> */}

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

// Define VisionPromptView as a top-level component
const VisionPromptView = ({
  visionPrompt,
  setVisionPrompt,
  setCurrentStage,
  totalDonationAmount,
  setTotalDonationAmount,
  selectedCrypto,
  setSelectedCrypto,
  platformFeeActive,
  setPlatformFeeActive,
  calculatePlatformFee,
  socialHandles,
  setSocialHandles,
  theme,
  walletBalance,
  loadingBalance,
  balanceError,
  setMaxDonationAmount
}) => {
  const cryptoOptions = [
    { value: 'APT', label: 'Aptos (APT)' },
    { value: 'BTC', label: 'Bitcoin (BTC)' },
    { value: 'ETH', label: 'Ethereum (ETH)' },
    { value: 'SOL', label: 'Solana (SOL)' },
    { value: 'USDC', label: 'USD Coin (USDC)' }
  ];

  const handleSocialChange = (platform, value) => {
    setSocialHandles(prev => ({ ...prev, [platform]: value }));
  };

  const isNextDisabled = 
    !visionPrompt.trim() || 
    totalDonationAmount <= 0;

  const hasNavigatedRef = useRef(false);
  
  console.log('Standalone VisionPromptView render, visionPrompt:', visionPrompt);

  return (
    <StepContent sx={{maxWidth: '700px', mx: 'auto'}}>
      <Typography variant="h4" fontWeight="bold" gutterBottom align="center" sx={{ fontFamily: "'Space Grotesk', sans-serif", mb:1}}>
        Define Your Impact
      </Typography>
      
      <Paper elevation={2} sx={{p: {xs:2, sm:3}, borderRadius: '16px', mb: 3, background: alpha(theme.palette.background.default, 0.7), backdropFilter: 'blur(5px)'}}>
        <Typography variant="h6" fontWeight="medium" gutterBottom>
          What kind of change do you care about?
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          placeholder="I want to support education for girls in rural communities."
          value={visionPrompt}
          onChange={(e) => setVisionPrompt(e.target.value)}
          sx={{ 
            mb: 1,
            '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: alpha(theme.palette.common.white, 0.5)
            }
          }}
        />
        <Button size="small" variant="text" sx={{textTransform: 'none'}}>
          Let Compass help (Suggest ideas)
        </Button>
      </Paper>
      
      <Paper elevation={2} sx={{p: {xs:2, sm:3}, borderRadius: '16px', mb: 3, background: alpha(theme.palette.background.default, 0.7), backdropFilter: 'blur(5px)'}}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="medium">
            Set Your Donation Amount
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {loadingBalance ? (
              <CircularProgress size={16} sx={{ mr: 1 }} />
            ) : (
              <AccountBalanceWalletIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
            )}
            <Typography variant="body2" color={balanceError ? "error" : "text.secondary"}>
              {balanceError 
                ? "Error loading balance" 
                : `Balance: ${walletBalance.toFixed(4)} ${selectedCrypto}`}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: {xs: 'column', sm: 'row'}, gap: 2, my: 2 }}>
            <TextField
            label="Amount"
            type="number"
              variant="outlined"
            value={totalDonationAmount}
            onChange={(e) => setTotalDonationAmount(Number(e.target.value))}
            InputProps={{
              endAdornment: <InputAdornment position="end">
                <IconButton size="small" onClick={() => setTotalDonationAmount(prev => Math.max(1, prev - 1))}>
                  <RemoveCircleOutlineIcon />
                </IconButton>
                <IconButton size="small" onClick={() => setTotalDonationAmount(prev => prev + 1)}>
                  <AddCircleOutlineIcon />
                </IconButton>
                <Tooltip title="Use maximum available balance">
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={setMaxDonationAmount}
                    disabled={walletBalance <= 0}
                    sx={{ ml: 1, minWidth: 'auto', height: 32, borderRadius: 1 }}
                  >
                    Max
                  </Button>
                </Tooltip>
              </InputAdornment>,
            }}
              sx={{ 
              flexGrow: 1,
                '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: alpha(theme.palette.common.white, 0.5)
                }
              }}
            />
          <TextField
            select
            label="Currency"
            value={selectedCrypto}
            onChange={(e) => setSelectedCrypto(e.target.value)}
            sx={{
              minWidth: '150px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: alpha(theme.palette.common.white, 0.5)
              }
            }}
          >
            {cryptoOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
            </Box>
        <Box sx={{ mt: 2 }}>
          <Slider
            value={totalDonationAmount}
            min={1}
            max={walletBalance > 0 ? walletBalance : 1} // Using wallet balance as max value
            step={1}
            onChange={(e, newValue) => setTotalDonationAmount(Number(newValue))}
            aria-labelledby="donation-amount-slider"
            sx={{color: 'primary.main'}}
            valueLabelDisplay="auto"
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', typography: 'caption', color: 'text.secondary' }}>
            <span>1 {selectedCrypto}</span>
            <span>{(walletBalance > 0 ? walletBalance : 1).toFixed(2)} {selectedCrypto}</span>
          </Box>
        </Box>
      </Paper>
      
      <Paper elevation={2} sx={{p: {xs:2, sm:3}, borderRadius: '16px', mb: 3, background: alpha(theme.palette.background.default, 0.7), backdropFilter: 'blur(5px)'}}>
        <Typography variant="h6" fontWeight="medium" gutterBottom>
          Want smarter matches? Share your socials. <Chip label="Optional" size="small" variant="outlined"/>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{mb:2}}>
          We'll never post or share anything. This helps our AI understand your interests better.
        </Typography>
        <Stack spacing={2}>
          <TextField 
            label="Twitter / X Handle"
            variant="outlined" 
            size="small" 
            value={socialHandles.twitter}
            onChange={(e) => handleSocialChange('twitter', e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><TwitterIcon /></InputAdornment> }}
            sx={{backgroundColor: alpha(theme.palette.common.white, 0.5), borderRadius: '8px'}}
          />
          <TextField 
            label="Instagram Handle"
            variant="outlined" 
            size="small"
            value={socialHandles.instagram}
            onChange={(e) => handleSocialChange('instagram', e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><InstagramIcon /></InputAdornment> }}
            sx={{backgroundColor: alpha(theme.palette.common.white, 0.5), borderRadius: '8px'}}
          />
          <TextField 
            label="LinkedIn Profile URL"
            variant="outlined" 
            size="small"
            value={socialHandles.linkedin}
            onChange={(e) => handleSocialChange('linkedin', e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><LinkedInIcon /></InputAdornment> }}
            sx={{backgroundColor: alpha(theme.palette.common.white, 0.5), borderRadius: '8px'}}
          />
        </Stack>
      </Paper>

      <Paper elevation={2} sx={{p: {xs:2, sm:3}, borderRadius: '16px', mb: 3, background: alpha(theme.palette.background.default, 0.7), backdropFilter: 'blur(5px)'}}>
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
            <Box sx={{textAlign: 'left', flexGrow:1, mr:1}}>
              <Typography variant="body1" fontWeight="medium">
                Support Eunoia Platform (+0.20%)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Helps us grow! Fee: {calculatePlatformFee().toFixed(2)} {selectedCrypto}
              </Typography>
            </Box>
          }
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', ml:0 }}
        />
      </Paper>
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <BackButton onClick={() => setCurrentStage('welcomeAI')}>Back</BackButton>
        <GlowButton 
            onClick={() => {
              if (!hasNavigatedRef.current) {
                hasNavigatedRef.current = true;
                setCurrentStage('aiProcessing');
                setTimeout(() => { hasNavigatedRef.current = false; }, 1000); 
              }
            }} 
            disabled={isNextDisabled}
            sx={{py: 1.5, fontSize: '1.1rem'}}
            endIcon={<ChevronRightIcon />}
        >
          Continue
        </GlowButton>
      </Box>
      <Typography variant="caption" display="block" sx={{mt:2, textAlign: 'center', color: 'text.secondary'}}>
          Your data stays private. We only use it to guide your giving journey.
      </Typography>
    </StepContent>
  );
};

// AiProcessingView is now defined globally
const AiProcessingView = ({
  visionPrompt,
  totalDonationAmount,
  setCurrentStage,
  setAiMatchedCharities,
  setAiSuggestedAllocations,
  setSemanticSearchLoading,
  setSemanticSearchError,
  semanticSearchLoading,
  semanticSearchError,
  setCombinedMissionStatement // New prop for setting combined mission
}) => { 
  console.log('AiProcessingView render');
  
  useEffect(() => {
    const performSemanticSearch = async () => {
      if (!visionPrompt.trim()) {
        setSemanticSearchError("Please enter your vision before searching.");
        setCurrentStage('visionPrompt');
        return;
      }

      setSemanticSearchLoading(true);
      setSemanticSearchError(null);
      setAiMatchedCharities([]);
      setAiSuggestedAllocations({});

      // // Artificial delay for testing animation visibility
      // await new Promise(resolve => setTimeout(resolve, 5000)); // 5-second delay

      try {
        console.log(`Performing semantic search for: "${visionPrompt}"`);
        const response = await axios.get(`${API_BASE_URL}/charity-semantic-search/`, {
          params: { query: visionPrompt }
        });

        console.log("Semantic search response from backend:", response.data);

        // Backend now returns an object: { matched_charities: [], combined_mission: "..." }
        if (response.data && response.data.matched_charities && response.data.matched_charities.length > 0) {
          const charities = response.data.matched_charities.map(charity => ({
            ...charity,
            id: charity.id || Date.now() + Math.random(),
            name: charity.name || "Unnamed Charity",
            description: charity.description || "No description available.",
            logo: charity.logo_url || charity.logo || 'https://via.placeholder.com/300x200.png?text=No+Logo',
            aptos_wallet_address: charity.aptos_wallet_address || "N/A",
            category: charity.category_display || charity.category || "Other",
            // Corrected: use response.data.matched_charities for indexOf
            match_score_percent: charity.similarity_score 
                ? Math.round(charity.similarity_score * 100) 
                : (95 - (response.data.matched_charities.indexOf(charity) * 5)),
            trust_score_grade: 'A',
            ai_explanation: `Matches your interest in "${visionPrompt.substring(0,30)}..." due to its focus on ${charity.category_display || charity.category || 'relevant areas'}.`,
          }));

          setAiMatchedCharities(charities);

          const totalScore = charities.reduce((sum, charity) => sum + (charity.match_score_percent || 0), 0);
          const allocations = {};
          let cumulativeAllocation = 0;

          if (totalScore > 0) {
            charities.forEach((charity, index) => {
              let rawAllocation;
              if (index === charities.length - 1) {
                  rawAllocation = totalDonationAmount - cumulativeAllocation;
              } else {
                  rawAllocation = ( (charity.match_score_percent || 0) / totalScore) * totalDonationAmount;
              }
              const finalAllocation = Math.max(0, parseFloat(rawAllocation.toFixed(2)));
              allocations[charity.id] = finalAllocation;
              cumulativeAllocation += finalAllocation;
            });
            
            const sumOfAllocations = Object.values(allocations).reduce((sum, val) => sum + val, 0);
            if (sumOfAllocations !== totalDonationAmount && charities.length > 0) {
                const lastCharityId = charities[charities.length -1].id;
                const diff = totalDonationAmount - sumOfAllocations;
                allocations[lastCharityId] = Math.max(0, parseFloat((allocations[lastCharityId] + diff).toFixed(2)));
            }

          } else if (charities.length > 0) {
            const equalShare = parseFloat((totalDonationAmount / charities.length).toFixed(2));
            charities.forEach(charity => {
              allocations[charity.id] = equalShare;
            });
            
            const sumOfAllocations = Object.values(allocations).reduce((sum, val) => sum + val, 0);
              if (sumOfAllocations !== totalDonationAmount && charities.length > 0) {
                  const lastCharityId = charities[charities.length -1].id;
                  const diff = totalDonationAmount - sumOfAllocations;
                  allocations[lastCharityId] = Math.max(0, parseFloat((allocations[lastCharityId] + diff).toFixed(2)));
              }
          }
          setAiSuggestedAllocations(allocations);
          
          // Set the combined mission statement from the API response
          setCombinedMissionStatement(response.data.combined_mission || "Explore these charities that align with your vision.");
          setCurrentStage('charityResults');
        } else {
          setSemanticSearchError("No charities found matching your vision. Try rephrasing or broadening your search.");
          setCombinedMissionStatement(""); // Clear combined mission if no charities
          setCurrentStage('charityResults'); 
        }
      } catch (error) {
        console.error('Error during semantic search:', error);
        let detailedError = "Failed to fetch charity recommendations. Please try again later.";
        if (error.response) {
          detailedError += ` (Server responded with ${error.response.status})`;
          console.error("Error response data:", error.response.data);
        } else if (error.request) {
          detailedError += " (No response from server)";
        }
        setSemanticSearchError(detailedError);
        setCombinedMissionStatement(""); // Clear combined mission on error
        setCurrentStage('charityResults');
      } finally {
        setSemanticSearchLoading(false);
      }
    };

    performSemanticSearch();
  }, [visionPrompt, totalDonationAmount, setCurrentStage, setAiMatchedCharities, setAiSuggestedAllocations, setSemanticSearchLoading, setSemanticSearchError, setCombinedMissionStatement]);

  const keywords = visionPrompt.split(' ').filter(k => k.length > 3);
  if(keywords.length === 0) keywords.push(...['Impact', 'Faith', 'Children', 'Education', 'Africa']);

  if (semanticSearchLoading) {
      return (
          <StepContent sx={{ textAlign: 'center', py: {xs:4, sm:6}}}>
              <Box sx={{ mb: 4 }}> 
                  <CompassAnimation />
              </Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontFamily: "'Space Grotesk', sans-serif"}}>
                  Finding the causes that truly fit you…
              </Typography>
              <Box sx={{my:3, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1}}>
                  {keywords.slice(0,5).map(kw => <Chip key={kw} label={kw} variant="outlined" />)}
              </Box>
              <LinearProgress sx={{my:2, maxWidth: 300, mx:'auto'}}/> 
              <Typography variant="body2" color="text.secondary">
                  <i>Consulting the Eunoia Compass...</i>
              </Typography>
          </StepContent>
      );
  }
  
  return (
    <StepContent sx={{ textAlign: 'center', py: {xs:4, sm:6}}}>
      <CircularProgress sx={{mb:2}} />
      <Typography variant="h6" fontWeight="medium">Processing your vision...</Typography>
      {semanticSearchError && <Typography color="error" sx={{mt:1}}>{semanticSearchError}</Typography>}
    </StepContent>
  );
};

// AllocationWelcomeView is now defined globally
const AllocationWelcomeView = ({ setCurrentStage }) => { 
  console.log('AllocationWelcomeView render');
      return (
    <StepContent sx={{ textAlign: 'center', py: {xs: 4, sm: 6} }}>
      <Box mb={4}>
        <ExploreIcon sx={{ fontSize: 90, color: 'primary.main', mb:1 }} />
      </Box>
      <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ fontFamily: "'Space Grotesk', sans-serif"}}>
        Find Your Compass.
          </Typography>
      <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 5, maxWidth: '600px', mx: 'auto' }}>
        Giving guided by your values.
          </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" alignItems="center">
        <GlowButton 
          onClick={() => setCurrentStage('visionPrompt')} 
          size="large" 
          sx={{py: 1.5, px: 5, fontSize: '1.1rem'}}
          startIcon={<AutoAwesomeIcon />}
        >
          Use Eunoia Compass
        </GlowButton>
            <Button 
          variant="outlined" 
          color="primary"
          component={Link} 
          to="/charities"
          size="large" 
          sx={{py: 1.5, px: 5, fontSize: '1.1rem', borderRadius: '50px'}}
              startIcon={<SearchIcon />}
            >
          Donate Directly
            </Button>
      </Stack>
      <Typography variant="body1" sx={{ mt: 6, fontStyle: 'italic', color: 'text.secondary' }}>
        Unchained Giving. Borderless Impact.
      </Typography>
    </StepContent>
  );
};

// DonationConfirmationView is now defined globally
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
  // Added currentProcessingCharityIndex to ensure effect re-runs for new charity.
  // Also added charityToDisplay to re-evaluate if it changes (e.g. aiMatchedCharities updates).
  }, [currentStage, transactionPending, donationComplete, transactionError, walletAddress, handleDonate, setTransactionError, setCurrentStage, currentProcessingCharityIndex, charityToDisplay]);

  if (!charityToDisplay) {
    // This case might occur if the index is out of bounds or charities array is empty.
    // It could indicate all donations are processed or an error in logic.
    // Parent (DonatePage) should ideally handle stage transition before this view renders without a valid charity.
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
              <Typography variant="body1" color="text.secondary">Amount: {displayAmount} {selectedCrypto /* prop needed */}</Typography>
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

// ImpactTrackerView is now defined globally
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
        {/* <Button component={Link} to="/profile" variant="contained" sx={{mt:3, mr:1, borderRadius: '50px'}}>View My Profile</Button> */}
        <Button onClick={handleReset} variant="outlined" sx={{mt:3, borderRadius: '50px'}}>
          Make Another Donation
        </Button>

    </StepContent>
  );
};

const DonatePage = () => {
  const theme = useTheme();
  const location = useLocation();
  const { walletAddress, setWalletAddress, activeChain } = useContext(AppContext) || {};
  
  // Debug: Log on every render
  // console.log('DonatePage render, currentStage:', currentStage); // Keep this or remove if not debugging
  
  const initialState = location.state || {};
  const initialSearchValue = initialState.searchValue || '';
  const initialSearchMode = initialState.searchMode || 'direct';
  const initialSelectedCharities = initialState.selectedCharities || [];
  
  const [currentStage, setCurrentStage] = useState(initialSearchValue ? 'visionPrompt' : 'welcomeAI'); // Updated this line
  const [visionPrompt, setVisionPrompt] = useState(initialSearchValue || ''); // Use initialSearchValue here
  const [totalDonationAmount, setTotalDonationAmount] = useState(50);
  const [aiMatchedCharities, setAiMatchedCharities] = useState([]);
  const [aiSuggestedAllocations, setAiSuggestedAllocations] = useState({});
  const [socialHandles, setSocialHandles] = useState({ twitter: '', instagram: '', linkedin: '' });
  const [selectedCrypto, setSelectedCrypto] = useState('APT');
  const [searchValue, setSearchValue] = useState(initialSearchValue);
  const [needsDescription, setNeedsDescription] = useState(initialSearchMode === 'needs' ? initialSearchValue : '');
  const [searchMode, setSearchMode] = useState(initialSearchMode);
  const [matchedCharities, setMatchedCharities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCharitiesState, setSelectedCharitiesState] = useState(initialSelectedCharities); // Renamed to avoid conflict if CharityResultsView needs it
  const [donationAmounts, setDonationAmounts] = useState(
    initialSelectedCharities.reduce((acc, charity) => {
      acc[charity.id] = 10;
      return acc;
    }, {})
  );
  const [platformFeeActive, setPlatformFeeActive] = useState(true);
  const [donationComplete, setDonationComplete] = useState(false);
  const [transactionPending, setTransactionPending] = useState(false);
  const [transactionError, setTransactionError] = useState(null);
  const [impactActivities, setImpactActivities] = useState([]);
  const [showSocialSharePreview, setShowSocialSharePreview] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState(null);
  const [polkadotApi, setPolkadotApi] = useState(null);
  const [semanticSearchLoading, setSemanticSearchLoading] = useState(false);
  const [semanticSearchError, setSemanticSearchError] = useState(null);
  const [currentProcessingCharityIndex, setCurrentProcessingCharityIndex] = useState(0); // New state for sequential donations
  const [combinedMissionStatement, setCombinedMissionStatement] = useState(''); // New state
  
  // New state for selectable charities and individual amounts
  const [selectedCharityIds, setSelectedCharityIds] = useState(new Set());
  const [individualDonationAmounts, setIndividualDonationAmounts] = useState({});
  
  const steps = [
    'Find Charities',
    'Select & Allocate',
    'Connect Wallet',
    'Confirm & Donate'
  ];

  // Initialize Polkadot API
  useEffect(() => {
    const setupPolkadotApi = async () => {
      if (activeChain === CHAINS.POLKADOT) {
        try {
          const provider = getSmProvider(POLKADOT_NODE_URL);
          const api = createClient(provider);
          setPolkadotApi(api);
          console.log('Polkadot API initialized');
        } catch (error) {
          console.error('Failed to initialize Polkadot API:', error);
          setBalanceError("Failed to initialize Polkadot connection");
        }
      }
    };
    
    setupPolkadotApi();
    
    return () => {
      // Clean up Polkadot API connection on unmount
      if (polkadotApi && polkadotApi.disconnect) {
        polkadotApi.disconnect();
      }
    };
  }, [activeChain]);

  // Check wallet balance whenever wallet address or selected crypto changes
  useEffect(() => {
    if (walletAddress) {
      checkWalletBalance();
    } else {
      setWalletBalance(0);
    }
  }, [walletAddress, selectedCrypto, activeChain]);

  // Function to check wallet balance
  const checkWalletBalance = async () => {
    if (!walletAddress) {
      setWalletBalance(0);
      return;
    }

    setLoadingBalance(true);
    setBalanceError(null);

    try {
      let balance = 0;
      
      if (activeChain === CHAINS.APTOS || !activeChain) {
        balance = await getAptosBalance(walletAddress, selectedCrypto);
      } else if (activeChain === CHAINS.POLKADOT) {
        balance = await getPolkadotBalance(walletAddress);
      } else {
        console.log(`Unknown chain: ${activeChain}, using default balance`);
        balance = 50; // Default value
      }
      
      console.log(`Wallet balance for ${selectedCrypto}: ${balance}`);
      setWalletBalance(balance);
    } catch (error) {
      console.error("Error checking wallet balance:", error);
      setBalanceError(error.message || "Failed to check wallet balance");
      setWalletBalance(0);
    } finally {
      setLoadingBalance(false);
    }
  };

  // Get balance for Aptos
  const getAptosBalance = async (address, tokenSymbol) => {
    try {
      const client = new AptosClient(APTOS_NODE_URL);
      const tokenType = TOKEN_TYPES[tokenSymbol];
      
      if (!tokenType) {
        console.warn(`Token symbol ${tokenSymbol} not in TOKEN_TYPES, attempting direct use.`);
        if (tokenSymbol !== 'APT') {
            console.warn(`Only APT is supported for balance check currently. Querying for ${tokenSymbol} might fail or return 0.`);
        }
      }
      
      const payload = {
        function: "0x1::coin::balance",
        type_arguments: [tokenType || `0x1::coin::CoinStore<${tokenSymbol}>`],
        arguments: [address]
      };
      
      const balanceResponse = await client.view(payload);
      
      if (balanceResponse && balanceResponse.length > 0) {
        // Convert from string to number instead of using BigInt
        const rawBalance = balanceResponse[0].toString();
        // Convert from octas to APT (8 decimal places)
        const balanceNumber = parseInt(rawBalance, 10) / Math.pow(10, 8);
        return balanceNumber;
      }
      
      return 0;
    } catch (error) {
      console.error(`Error fetching Aptos ${tokenSymbol} balance:`, error);
      // For testing, return a mock balance if view function fails
      return tokenSymbol === 'APT' ? 10 : 100;
    }
  };

  // Get balance for Polkadot
  const getPolkadotBalance = async (address) => {
    try {
      if (!polkadotApi) {
        throw new Error("Polkadot API not initialized");
      }
      
      const balance = await polkadotApi.rpc.state.call('system_account', [address]);
      const free = balance?.data?.free || '0';
      
      // Convert from Planck to DOT (10 decimal places for Polkadot)
      const decimals = 10; // Polkadot has 10 decimals
      const balanceNumber = Number(BigInt(free)) / Math.pow(10, decimals);
      return balanceNumber;
    } catch (error) {
      console.error("Error fetching Polkadot balance:", error);
      // For testing, return a mock balance
      return 5;
    }
  };
  
  // Set maximum donation amount based on wallet balance
  const setMaxDonationAmount = () => {
    // Leave a small amount for transaction fees
    const maxAmount = Math.max(0, walletBalance - 0.1);
    setTotalDonationAmount(Number(maxAmount.toFixed(2)));
  };

  useEffect(() => {
    if (initialSearchValue && currentStage === 'traditionalSearch') {
      // handleManualSearch(); 
    }
  }, [initialSearchValue, currentStage]); // Added currentStage to dependencies

  const handleManualSearch = async () => { /* ... */ };
  const handleFindMatches = async () => { /* ... */ };
  const handleSelectCharity = (charity) => { /* ... */ };
  const handleDonationAmountChange = (charityId, amount) => { /* ... */ };
  
  const handleConnectWallet = async () => {
    try {
      if (activeChain === 'aptos' || !activeChain) {
        // Connect Aptos wallet
        if (window.aptos) {
          try {
            // Try to connect
            const response = await window.aptos.connect();
            console.log("Connected to Aptos wallet:", response);
            
            if (response && response.address) {
              setWalletAddress(response.address);
              // Get balance after connecting
              await checkWalletBalance();
              return true;
            }
          } catch (error) {
            console.error("Error connecting to Aptos wallet:", error);
            setTransactionError("Failed to connect to wallet. Please try again.");
            return false;
          }
        } else {
          console.error("Aptos wallet provider not found");
          setTransactionError("Aptos wallet extension not found. Please install Petra wallet.");
          return false;
        }
      } else if (activeChain === 'polkadot') {
        // Connect Polkadot wallet
        try {
          // Import from polkadot extension
          const { web3Enable, web3Accounts } = await import('@polkadot/extension-dapp');
          
          // Enable all extensions
          const extensions = await web3Enable('Eunoia Donation Platform');
          
          if (!extensions.length) {
            console.error("No Polkadot extension found");
            setTransactionError("No Polkadot extension found. Please install a wallet like SubWallet.");
            return false;
          }
          
          // Get all accounts
          const accounts = await web3Accounts();
          
          if (!accounts.length) {
            console.error("No accounts found in the Polkadot wallet");
            setTransactionError("No accounts found in your Polkadot wallet.");
            return false;
          }
          
          // Use the first account
          const address = accounts[0].address;
          setWalletAddress(address);
          
          // Store address for later use
          localStorage.setItem('polkadotAddress', address);
          
          // Get balance after connecting
          await checkWalletBalance();
          return true;
        } catch (error) {
          console.error("Error connecting to Polkadot wallet:", error);
          setTransactionError("Failed to connect to Polkadot wallet. Please try again.");
          return false;
        }
      } else {
        console.error("Unsupported chain:", activeChain);
        setTransactionError("Unsupported blockchain selected.");
        return false;
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      setTransactionError("Failed to connect wallet: " + (error.message || "Unknown error"));
      return false;
    }
  };
  
  const calculateTotal = () => { /* ... */ };
  const calculatePlatformFee = () => {
    if (!platformFeeActive) return 0;
    return totalDonationAmount * 0.002;
  };

  // Initialize/update selectedCharityIds and individualDonationAmounts when AI results are processed
  useEffect(() => {
    if (currentStage === 'charityResults' && aiMatchedCharities.length > 0) {
      // const initialSelectedIds = new Set(); // No longer select all by default
      // const initialAmounts = {};
      // // By default, select all matched charities and use AI suggested allocations
      // aiMatchedCharities.forEach(charity => {
      //   initialSelectedIds.add(charity.id);
      //   initialAmounts[charity.id] = aiSuggestedAllocations[charity.id] || 10; // Default to 10 if no suggestion
      // });
      // setSelectedCharityIds(initialSelectedIds);
      // setIndividualDonationAmounts(initialAmounts);

      // Instead, initialize with no charities selected, 
      // but still prepare individual amounts based on AI suggestions if they exist, 
      // so if a user *does* select a charity, its amount input is pre-filled reasonably.
      const initialAmounts = {};
      aiMatchedCharities.forEach(charity => {
        initialAmounts[charity.id] = aiSuggestedAllocations[charity.id] || 10; 
      });
      setIndividualDonationAmounts(initialAmounts);
      setSelectedCharityIds(new Set()); // Start with an empty set of selected IDs

    } else if (currentStage !== 'charityResults') {
        // Clear selections if we navigate away from results page, 
        // or if there are no charities (handled in performSemanticSearch as well)
        // setSelectedCharityIds(new Set()); 
        // setIndividualDonationAmounts({});
    }
  }, [aiMatchedCharities, aiSuggestedAllocations, currentStage]);

  const handleToggleCharitySelection = (charityId) => {
    setSelectedCharityIds(prevSelectedIds => {
      const newSelectedIds = new Set(prevSelectedIds);
      if (newSelectedIds.has(charityId)) {
        newSelectedIds.delete(charityId);
      } else {
        newSelectedIds.add(charityId);
        // Optionally set a default amount if a charity is selected and doesn't have one
        if (!individualDonationAmounts[charityId]) {
          setIndividualDonationAmounts(prevAmounts => ({
            ...prevAmounts,
            [charityId]: aiSuggestedAllocations[charityId] || 10 // Default amount
          }));
        }
      }
      return newSelectedIds;
    });
  };

  const handleIndividualAmountChange = (charityId, newAmount) => {
    const amount = Math.max(1, Number(newAmount)); // Ensure amount is at least 1 (or your minimum)
    setIndividualDonationAmounts(prevAmounts => ({
      ...prevAmounts,
      [charityId]: amount,
    }));
  };

  // Calculate the actual totalDonationAmount based on selected charities and their individual amounts
  const actualTotalDonation = Array.from(selectedCharityIds).reduce((sum, id) => {
    return sum + (individualDonationAmounts[id] || 0);
  }, 0);

  // Add the handleDonate function with multi-chain support
  const handleDonate = async () => {
    const charitiesToProcess = aiMatchedCharities.filter(c => selectedCharityIds.has(c.id));

    // Ensure we are in the correct stage and have charities to process
    if (currentStage !== 'donationConfirmation' || charitiesToProcess.length === 0) {
      setTransactionError("No selected charities to process or incorrect stage.");
      setTransactionPending(false);
      return;
    }

    const charityToDonate = charitiesToProcess[currentProcessingCharityIndex];
    if (!charityToDonate) {
      setTransactionError("No more selected charities to process or invalid index.");
      setTransactionPending(false); 
      if (currentProcessingCharityIndex >= charitiesToProcess.length && charitiesToProcess.length > 0) {
        console.log("All selected donations processed.");
        setCurrentStage('impactTracker'); 
      }
      return;
    }

    // Use individual amount for the current charity
    const amountToDonate = individualDonationAmounts[charityToDonate.id];

    if (!charityToDonate.name) {
      setTransactionError(`Selected charity (index ${currentProcessingCharityIndex}) is missing a name.`);
      setTransactionPending(false);
      return;
    }

    if (!amountToDonate || amountToDonate <= 0) {
      setTransactionError(`Invalid amount for ${charityToDonate.name}.`);
      setTransactionPending(false);
      return;
    }

    setTransactionPending(true);
    setTransactionError(null);
    // setDonationComplete(false); // This is set on success/failure or for next step

    try {
      console.log(`Preparing donation on ${activeChain || CHAINS.APTOS} blockchain for ${charityToDonate.name}`);
      
      let txResult;
      let txHashForBackend;
      let blockchainForBackend;

      if (activeChain === CHAINS.POLKADOT) {
        txResult = await handlePolkadotDonation(charityToDonate, amountToDonate);
        txHashForBackend = txResult ? txResult.toHex() : null;
        blockchainForBackend = 'POL'; // Matches model choice
      } else {
        txResult = await handleAptosDonation(charityToDonate, amountToDonate);
        // Aptos SDK v2+ returns an object with a `hash` property for pendingTransaction
        // For older SDK that returns just the hash string, it would be `txResult` directly
        txHashForBackend = txResult ? (txResult.hash || txResult) : null; 
        blockchainForBackend = 'APT'; // Matches model choice
      }
      
      console.log(`Donation to ${charityToDonate.name} successful. Tx: ${txHashForBackend}`);

      // ---- SAVE TRANSACTION TO BACKEND ----
      if (txHashForBackend) {
        const donationDataForBackend = {
          transaction_hash: txHashForBackend,
          donor_address: walletAddress,
          charity_name: charityToDonate.name,
          charity_wallet_address: activeChain === CHAINS.POLKADOT 
            ? POLKADOT_CONTRACT_ADDRESS // Central Polkadot contract
            : charityToDonate.aptos_wallet_address, // Specific Aptos address
          amount: amountToDonate.toString(), // Send as string, backend has DecimalField
          currency: selectedCrypto,
          blockchain: blockchainForBackend,
          status: 'success',
        };

        try {
          console.log("Sending donation data to backend:", donationDataForBackend);
          // API_BASE_URL is 'http://localhost:8000/api'
          const response = await axios.post(`${API_BASE_URL}/donation-transactions/`, donationDataForBackend);
          console.log("Backend response for saving transaction:", response.data);
        } catch (backendError) {
          console.error("Error saving transaction to backend:", backendError.response ? backendError.response.data : backendError.message);
          // Non-critical error, don't block user flow
        }
      }
      // ---- END SAVE TRANSACTION TO BACKEND ----

      // Logic for advancing to the next charity or completing the process
      if (currentProcessingCharityIndex < charitiesToProcess.length - 1) {
        // More charities to process
        setTransactionPending(false); 
        setDonationComplete(false);   
        setTransactionError(null);
        setCurrentProcessingCharityIndex(prevIndex => prevIndex + 1);
        // The DonationConfirmationView's useEffect should pick this up and call handleDonate again.
      } else {
        // This was the last charity
        setDonationComplete(true); // All donations in sequence are now complete
        setTransactionPending(false);
        setCurrentStage('impactTracker'); // Or a new summary/final success page
        setCurrentProcessingCharityIndex(0); // Reset for a potential new batch later
      }

    } catch (err) {
      console.error(`Donation to ${charityToDonate.name} failed:`, err);
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
      setTransactionPending(false);
      // Do not advance index on error, user might want to retry this specific one.
      // The UI in DonationConfirmationView will show the error.
    }
  };
  
  // Handle Aptos donation
  const handleAptosDonation = async (charity, amount) => {
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      throw new Error(`Invalid donation amount: ${amount}`);
    }

    const amountInOcta = Math.round(numericAmount * Math.pow(10, 8)); 
    const coinIdentifier = TOKEN_TYPES[selectedCrypto] || TOKEN_TYPES.APT;

    if (!charity.name) {
        throw new Error("Charity name is missing, cannot proceed with Aptos donation.");
    }

    // Log the charity name being sent to the contract for debugging E_CHARITY_NOT_FOUND
    console.log(`[Aptos Contract Call] Using charity_name: "${charity.name}" for donation to ${charity.aptos_wallet_address}`);

    const entryFunctionPayload = {
      type: "entry_function_payload",
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::${DONATE_FUNCTION_NAME}`,
      type_arguments: [coinIdentifier],
      arguments: [
        charity.name,
        coinIdentifier,
        amountInOcta.toString()
      ],
    };

    if (window.aptos && window.aptos.isConnected) {
      console.log("Constructed Aptos Entry Function Payload:", JSON.stringify(entryFunctionPayload, null, 2));
      const pendingTransaction = await window.aptos.signAndSubmitTransaction({ payload: entryFunctionPayload }); 
      console.log("Aptos transaction submitted:", pendingTransaction);
      // The pendingTransaction for Aptos SDK v2+ is an object like { hash: "0x..." }
      // If using an older SDK version that directly returns the hash string, this would be fine.
      // For now, we expect an object with a hash property.
      if (!pendingTransaction || typeof pendingTransaction.hash !== 'string') {
        throw new Error("Aptos transaction submission did not return a valid hash object.");
      }
      return pendingTransaction; 
    } else {
      throw new Error("Aptos wallet not connected or not available. Please connect your wallet.");
    }
  };
  
  // Handle Polkadot donation
  const handlePolkadotDonation = async (charity, amount) => {
    try {
      if (!polkadotApi) {
        throw new Error("Polkadot API not initialized. Please try again.");
      }
      
      const numericAmount = Number(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        throw new Error(`Invalid donation amount: ${amount}`);
      }
      // Use chain's specific decimals
      const decimals = 10; // Polkadot has 10 decimals
      const amountInPlanck = BigInt(Math.round(numericAmount * Math.pow(10, decimals)));
      
      // Ensure we're signed in
      if (!walletAddress) {
        throw new Error("Polkadot wallet not connected. Please connect your wallet.");
      }
      
      console.log(`Preparing Polkadot donation of ${amount} DOT (${amountInPlanck} Planck) to ${charity.name}`);
      
      // Create the transaction
      const tx = await polkadotApi.tx.balances.transferKeepAlive({
        dest: POLKADOT_CONTRACT_ADDRESS, // Placeholder contract address
        value: amountInPlanck.toString()
      });
      
      // Sign and send the transaction using the browser extension
      const { web3FromAddress } = await import('@polkadot/extension-dapp');
      const injector = await web3FromAddress(walletAddress);
      
      const result = await tx.signAndSend(walletAddress, { signer: injector.signer });
      
      console.log("Polkadot transaction submitted:", result.hash);
      
      return result;
    } catch (error) {
      console.error("Polkadot donation error:", error);
      throw error;
    }
  };

  // Add the missing handleReset function
  const handleReset = () => {
    setCurrentStage('welcomeAI');
    setVisionPrompt('');
    setTotalDonationAmount(50);
    setAiMatchedCharities([]);
    setAiSuggestedAllocations({});
    setSocialHandles({ twitter: '', instagram: '', linkedin: '' });
    setSelectedCharityIds(new Set()); // Add this line
    setIndividualDonationAmounts({}); // Add this line
    setSearchValue('');
    setNeedsDescription('');
    setSearchMode('direct');
  };

  const renderCurrentStage = () => {
    switch (currentStage) {
      case 'welcomeAI':
        return <AllocationWelcomeView setCurrentStage={setCurrentStage} />;
      case 'visionPrompt':
        return <VisionPromptView 
          visionPrompt={visionPrompt}
          setVisionPrompt={setVisionPrompt}
          setCurrentStage={setCurrentStage}
          totalDonationAmount={totalDonationAmount}
          setTotalDonationAmount={setTotalDonationAmount}
          selectedCrypto={selectedCrypto}
          setSelectedCrypto={setSelectedCrypto}
          platformFeeActive={platformFeeActive}
          setPlatformFeeActive={setPlatformFeeActive}
          calculatePlatformFee={calculatePlatformFee}
          socialHandles={socialHandles}
          setSocialHandles={setSocialHandles}          
          theme={theme}
          walletBalance={walletBalance}
          loadingBalance={loadingBalance}
          balanceError={balanceError}
          setMaxDonationAmount={setMaxDonationAmount}
        />;
      case 'aiProcessing':
        return <AiProcessingView 
          visionPrompt={visionPrompt}
          totalDonationAmount={totalDonationAmount}
          setCurrentStage={setCurrentStage}
          setAiMatchedCharities={setAiMatchedCharities}
          setAiSuggestedAllocations={setAiSuggestedAllocations}
          setSemanticSearchLoading={setSemanticSearchLoading}
          setSemanticSearchError={setSemanticSearchError}
          semanticSearchLoading={semanticSearchLoading}
          semanticSearchError={semanticSearchError}
          setCombinedMissionStatement={setCombinedMissionStatement} // Pass setter to AiProcessingView
        />;
      case 'charityResults':
        return <CharityResultsView 
          aiMatchedCharities={aiMatchedCharities}
          aiSuggestedAllocations={aiSuggestedAllocations}
          setCurrentStage={setCurrentStage}
          selectedCrypto={selectedCrypto}
          platformFeeActive={platformFeeActive}
          setPlatformFeeActive={setPlatformFeeActive}
          calculatePlatformFee={calculatePlatformFee}
          totalDonationAmount={totalDonationAmount}
          visionPrompt={visionPrompt}
          theme={theme}
          semanticSearchLoading={semanticSearchLoading}
          semanticSearchError={semanticSearchError}
          selectedCharityIds={selectedCharityIds}
          handleToggleCharitySelection={handleToggleCharitySelection}
          individualDonationAmounts={individualDonationAmounts}
          handleIndividualAmountChange={handleIndividualAmountChange}
          combinedMissionStatement={combinedMissionStatement} // Pass statement to CharityResultsView
        />;
      case 'donationConfirmation':
        return <DonationConfirmationView 
          currentStage={currentStage}
          transactionPending={transactionPending}
          donationComplete={donationComplete}
          transactionError={transactionError}
          walletAddress={walletAddress}
          handleDonate={handleDonate}
          setCurrentStage={setCurrentStage}
          handleReset={handleReset}
          setTransactionError={setTransactionError}
          currentProcessingCharityIndex={currentProcessingCharityIndex}
          aiMatchedCharities={aiMatchedCharities}
          aiSuggestedAllocations={aiSuggestedAllocations}
          selectedCrypto={selectedCrypto}
          selectedCharityIds={selectedCharityIds}
          handleToggleCharitySelection={handleToggleCharitySelection}
          individualDonationAmounts={individualDonationAmounts}
          handleIndividualAmountChange={handleIndividualAmountChange}
        />;
      case 'impactTracker':
        return <ImpactTrackerView 
          aiSuggestedAllocations={aiSuggestedAllocations}
          aiMatchedCharities={aiMatchedCharities}
          selectedCrypto={selectedCrypto}
          setImpactActivities={setImpactActivities}
          impactActivities={impactActivities}
          setCurrentStage={setCurrentStage}
          platformFeeActive={platformFeeActive}
          setPlatformFeeActive={setPlatformFeeActive}
          calculatePlatformFee={calculatePlatformFee} // This will now use actualTotalDonation
          totalDonationAmount={actualTotalDonation} // Pass the dynamically calculated total
          visionPrompt={visionPrompt}
          theme={theme}
          semanticSearchLoading={semanticSearchLoading}
          semanticSearchError={semanticSearchError}
          selectedCharityIds={selectedCharityIds}
          handleToggleCharitySelection={handleToggleCharitySelection}
          individualDonationAmounts={individualDonationAmounts}
          handleIndividualAmountChange={handleIndividualAmountChange}
          handleReset={handleReset} // Pass handleReset for the button
        />;
      default:
        return <AllocationWelcomeView setCurrentStage={setCurrentStage} />;
    }
  };
  
  // Debug: Log on every render
  console.log('DonatePage render, currentStage:', currentStage, 'Selected IDs:', selectedCharityIds);

  return (
    <Box sx={{ py: {xs:3, sm:6}, background: 'linear-gradient(135deg, #f0f4f8 0%, #e0eafc 100%)', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Box sx={{textAlign: 'center', mb: {xs:3, sm:5}}}>
          <Typography 
            variant="h2" 
            fontWeight="bold" 
            gutterBottom
            sx={{ 
              fontFamily: "'Space Grotesk', sans-serif", 
              color: 'primary.dark',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            <AutoAwesomeIcon sx={{fontSize: 'inherit', mr: 1.5, color: 'primary.main'}}/> Eunoia
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
            {currentStage === 'welcomeAI' 
              ? "Experience a new way to give, guided by intelligence, powered by transparency on Aptos." 
              : currentStage === 'impactTracker' 
              ? "Track your generous contribution and see the difference it makes in real-time."
              : "Your contribution makes a direct impact. Follow its journey transparently on the blockchain."}
          </Typography>
        </Box>
        
        {currentStage !== 'welcomeAI' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
            {['visionPrompt', 'aiProcessing', 'charityResults', 'donationConfirmation', 'impactTracker'].map((stage, index, arr) => {
              const stageIndex = arr.indexOf(currentStage);
              const isActive = stage === currentStage;
              const isCompleted = arr.indexOf(stage) < arr.indexOf(currentStage);
              return (
                <React.Fragment key={stage}>
                  <Chip 
                    label={index + 1}
                    color={isActive ? 'primary' : isCompleted ? 'success' : 'default'}
                    variant={isActive || isCompleted ? 'filled' : 'outlined'}
                    sx={{ fontWeight: isActive ? 'bold' : 'normal', cursor: 'default'}}
                  />
                  {index < arr.length - 1 && <Divider sx={{flexGrow: 1, maxWidth: '50px', mx:1, borderColor: isCompleted ? 'success.main' : 'grey.400'}}/>}
                </React.Fragment>
              );
            })}
          </Box>
        )}
        
        <Paper sx={{ 
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(8px)',
          borderRadius: '24px', 
          boxShadow: theme.shadows[6],
          p: { xs: 2, sm: 3, md: 4 }, 
          mb: 6,
          minHeight: '500px' 
        }}>
          {renderCurrentStage()}
        </Paper>
      </Container>
    </Box>
  );
};

export default DonatePage;