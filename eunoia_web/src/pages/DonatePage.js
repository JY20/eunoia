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
  CircularProgress,
  LinearProgress,
  Slider
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

// New Icons for AI flow
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'; // For AI
import InsightsIcon from '@mui/icons-material/Insights'; // For AI analysis
import ShareIcon from '@mui/icons-material/Share'; // For sharing impact
import InfoIcon from '@mui/icons-material/Info';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ExploreIcon from '@mui/icons-material/Explore'; // Placeholder for Compass

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
const MOCK_CHARITIES_DATA = [
  {
    id: 1,
    name: 'Hope Uganda Initiative',
    description: "Empowering children in Uganda through education and healthcare.",
    logo: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?q=80&w=500&auto=format&fit=crop', // Placeholder
    aptos_wallet_address: '0x123...abc',
    category: 'Education & Health',
    match_score_percent: 92,
    trust_score_grade: 'A',
    ai_explanation: "Strongly aligns with Christian values and focus on children in Africa, specifically Uganda.",
    suggested_allocation_percent: 60,
  },
  {
    id: 2,
    name: "African Children's Fund",
    description: "Providing essential needs and educational support across various African regions.",
    logo: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=500&auto=format&fit=crop', // Placeholder
    aptos_wallet_address: '0x456...def',
    category: 'General Aid',
    match_score_percent: 85,
    trust_score_grade: 'B+',
    ai_explanation: "Broadly supports children in Africa, aligning with stated interests.",
    suggested_allocation_percent: 25,
  },
  {
    id: 3,
    name: 'Faithful Scholars Africa',
    description: "Supporting faith-based educational programs for children in rural African communities.",
    logo: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=500&auto=format&fit=crop', // Placeholder
    aptos_wallet_address: '0x789...ghi',
    category: 'Faith-Based Education',
    match_score_percent: 78,
    trust_score_grade: 'A-',
    ai_explanation: "Directly supports faith-based education for children in Africa.",
    suggested_allocation_percent: 15,
  }
];

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
  const initialSearchValue = initialState.searchValue || '';
  const initialSearchMode = initialState.searchMode || 'direct';
  const initialSelectedCharities = initialState.selectedCharities || [];
  
  // New Stage Management for AI Flow
  const [currentStage, setCurrentStage] = useState('welcomeAI');
  
  // States for AI Flow
  const [visionPrompt, setVisionPrompt] = useState('');
  const [totalDonationAmount, setTotalDonationAmount] = useState(50);
  const [aiMatchedCharities, setAiMatchedCharities] = useState([]);
  const [aiSuggestedAllocations, setAiSuggestedAllocations] = useState({});
  const [selectedMoodboardTags, setSelectedMoodboardTags] = useState([]);
  const [socialHandles, setSocialHandles] = useState({ twitter: '', instagram: '', linkedin: '' });

  const [searchValue, setSearchValue] = useState(initialSearchValue);
  const [needsDescription, setNeedsDescription] = useState(initialSearchMode === 'needs' ? initialSearchValue : '');
  const [searchMode, setSearchMode] = useState(initialSearchMode);
  const [matchedCharities, setMatchedCharities] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [selectedCharities, setSelectedCharities] = useState(initialSelectedCharities);
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
  
  const [walletBalance, setWalletBalance] = useState(150.75);

  const steps = [
    'Find Charities',
    'Select & Allocate',
    'Connect Wallet',
    'Confirm & Donate'
  ];

  useEffect(() => {
    if (initialSearchValue && currentStage === 'traditionalSearch') {
      handleManualSearch();
    }
  }, []);

  const handleManualSearch = async () => {
    setLoading(true);
    console.log("Manual search triggered with:", searchValue, "or description:", needsDescription);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

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
      
      const updatedAmounts = {...donationAmounts};
      delete updatedAmounts[charity.id];
      setDonationAmounts(updatedAmounts);
    } else {
      setSelectedCharities([...selectedCharities, charity]);
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
    setWalletAddress('0x742...3fd9');
    handleNext();
  };

  const calculateTotal = () => {
    if (currentStage === 'charityResults' || currentStage === 'donationConfirmation' || currentStage === 'impactTracker') {
        return Object.values(aiSuggestedAllocations).reduce((sum, amount) => sum + Number(amount), 0);
    }
    return Object.values(donationAmounts).reduce((sum, amount) => sum + Number(amount), 0);
  };

  const calculatePlatformFee = () => {
    if (!platformFeeActive) return 0;
    if (['visionPrompt', 'aiProcessing', 'charityResults', 'donationConfirmation', 'impactTracker'].includes(currentStage)) {
        return totalDonationAmount * 0.002;
    }
    return calculateTotal() * 0.002;
  };

  const handleDonate = async () => {
    if (selectedCharities.length === 0) {
      setTransactionError("No charity selected for donation.");
      return;
    }

    const charityToDonate = selectedCharities[0];
    const amountToDonate = donationAmounts[charityToDonate.id];

    if (!amountToDonate || amountToDonate <= 0) {
      setTransactionError(`Invalid amount for ${charityToDonate.name}.`);
      return;
    }

    const amountInOcta = Math.round(amountToDonate * Math.pow(10, 8)); 
    const coinIdentifier = '0x1::aptos_coin::AptosCoin';

    setTransactionPending(true);
    setTransactionError(null);
    setDonationComplete(false);

    try {
      const entryFunctionPayload = {
        type: "entry_function_payload",
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::${DONATE_FUNCTION_NAME}`,
        type_arguments: [coinIdentifier],
        arguments: [
          charityToDonate.name,
          coinIdentifier,
          amountInOcta.toString()
        ],
      };

      if (window.aptos && window.aptos.isConnected) {
        console.log("Constructed Entry Function Payload:", JSON.stringify(entryFunctionPayload, null, 2));
        
        const pendingTransaction = await window.aptos.signAndSubmitTransaction({ payload: entryFunctionPayload }); 

        console.log("Transaction submitted:", pendingTransaction); 
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
      setTransactionPending(false);
    }
  };

  const handleNext = () => {
    setCurrentStage((prevStage) => {
      if (prevStage === 'welcomeAI') return 'visionPrompt';
      if (prevStage === 'visionPrompt') return 'aiProcessing';
      if (prevStage === 'aiProcessing') return 'charityResults';
      if (prevStage === 'charityResults') return 'donationConfirmation';
      if (prevStage === 'donationConfirmation') return 'impactTracker';
      return 'welcomeAI';
    });
  };

  const handleBack = () => {
    setCurrentStage((prevStage) => {
      if (prevStage === 'welcomeAI') return 'welcomeAI';
      if (prevStage === 'visionPrompt') return 'welcomeAI';
      if (prevStage === 'aiProcessing') return 'visionPrompt';
      if (prevStage === 'charityResults') return 'visionPrompt';
      if (prevStage === 'donationConfirmation') return 'charityResults';
      if (prevStage === 'impactTracker') return 'donationConfirmation';
      return 'welcomeAI';
    });
  };

  const handleReset = () => {
    setCurrentStage('welcomeAI');
    setVisionPrompt('');
    setTotalDonationAmount(50);
    setAiMatchedCharities([]);
    setAiSuggestedAllocations({});
    setSelectedMoodboardTags([]);
    setSocialHandles({ twitter: '', instagram: '', linkedin: '' });
    
    setSearchValue('');
    setNeedsDescription('');
    setSearchMode('direct');
    setMatchedCharities([]);
    setSelectedCharities([]);
    setDonationAmounts({});
    setDonationComplete(false);
    setTransactionError(null);
    setTransactionPending(false);
    setImpactActivities([]);
    setShowSocialSharePreview(false);
  };

  const AllocationWelcomeView = () => (
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
          to="/explore"
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

  const VisionPromptView = () => {
    const MIN_MOODBOARD_SELECTION = 3;
    const MAX_MOODBOARD_SELECTION = 5;

    const moodboardItems = [
      { id: 'education', imgSrc: '/images/Education.png', label: 'Education', tags: ['education', 'children', 'learning'] },
      { id: 'environment', imgSrc: '/images/Environment.jpg', label: 'Environment', tags: ['nature', 'conservation', 'sustainability'] },
      { id: 'faith', imgSrc: '/images/Religion.jpg', label: 'Faith-Based', tags: ['spirituality', 'community', 'mission'] },
      { id: 'innovation', imgSrc: '/images/Innovation.jpg', label: 'Innovation', tags: ['technology', 'progress', 'future'] },
    ];

    const handleMoodboardSelect = (itemId) => {
      setSelectedMoodboardTags(prevTags => {
        if (prevTags.includes(itemId)) {
          return prevTags.filter(tag => tag !== itemId);
        } else {
          if (prevTags.length < MAX_MOODBOARD_SELECTION) {
            return [...prevTags, itemId];
          }
        }
        return prevTags; // Return previous tags if max is reached and not deselecting
      });
    };

    const handleSocialChange = (platform, value) => {
      setSocialHandles(prev => ({ ...prev, [platform]: value }));
    };

    const isNextDisabled = 
      selectedMoodboardTags.length < MIN_MOODBOARD_SELECTION || 
      selectedMoodboardTags.length > MAX_MOODBOARD_SELECTION ||
      !visionPrompt.trim() || 
      totalDonationAmount <= 0;

    return (
      <StepContent sx={{maxWidth: '700px', mx: 'auto'}}>
        <Typography variant="h4" fontWeight="bold" gutterBottom align="center" sx={{ fontFamily: "'Space Grotesk', sans-serif", mb:1}}>
          Define Your Impact
        </Typography>
        
        {/* 1. Mission Prompt Input */}
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

        {/* 2. Visual Moodboard Selector */}
        <Paper elevation={2} sx={{p: {xs:2, sm:3}, borderRadius: '16px', mb: 3, background: alpha(theme.palette.background.default, 0.7), backdropFilter: 'blur(5px)'}}>
          <Typography variant="h6" fontWeight="medium" gutterBottom>
            Pick what resonates with you
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{mb:2}}>
            These images help us understand your values. (Select {MIN_MOODBOARD_SELECTION}-{MAX_MOODBOARD_SELECTION})
          </Typography>
          <Grid container spacing={2}>
            {moodboardItems.map(item => (
              <Grid item xs={4} sm={2} key={item.id} sx={{textAlign: 'center'}}>
                <Paper 
                  elevation={selectedMoodboardTags.includes(item.id) ? 6 : 2}
                  onClick={() => handleMoodboardSelect(item.id)}
                  sx={{
                    p: selectedMoodboardTags.includes(item.id) ? 0.5 : 1,
                    borderRadius: '12px', 
                    cursor: 'pointer', 
                    border: selectedMoodboardTags.includes(item.id) ? `3px solid ${theme.palette.primary.main}` : `3px solid transparent`,
                    backgroundColor: selectedMoodboardTags.includes(item.id) ? alpha(theme.palette.primary.light, 0.1) : alpha(theme.palette.background.paper, 0.7),
                    transition: 'all 0.2s ease-in-out',
                    overflow: 'hidden',
                    '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: theme.shadows[5]
                    }
                  }}
                >
                  {item.imgSrc ? (
                    <img src={process.env.PUBLIC_URL + item.imgSrc} alt={item.label} style={{ width: '100%', height: '60px', objectFit: 'cover', display:'block', borderRadius: '8px 8px 0 0' }} />
                  ) : (
                    <item.Icon sx={{fontSize: 30, mt: 1, height: '60px', color: selectedMoodboardTags.includes(item.id) ? theme.palette.primary.main : 'action.active' }}/>
                  )}
                  <Typography variant="caption" display="block" sx={{ mt: 0.5, p:0.5, backgroundColor: alpha(theme.palette.background.paper, 0.5) }}>{item.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
           {selectedMoodboardTags.length > 0 && selectedMoodboardTags.length < MIN_MOODBOARD_SELECTION && (
            <Typography color="error" variant="caption" display="block" sx={{mt:1, textAlign:'center'}}>
                Please select at least {MIN_MOODBOARD_SELECTION} images.
            </Typography>
           )}
           {selectedMoodboardTags.length > MAX_MOODBOARD_SELECTION && (
            <Typography color="error" variant="caption" display="block" sx={{mt:1, textAlign:'center'}}>
                Please select no more than {MAX_MOODBOARD_SELECTION} images.
            </Typography>
           )}
        </Paper>

        {/* Donation Amount Slider - Keeping this as it's crucial for donation */}
        <Paper elevation={2} sx={{p: {xs:2, sm:3}, borderRadius: '16px', mb: 3, background: alpha(theme.palette.background.default, 0.7), backdropFilter: 'blur(5px)'}}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'baseline' }}>
              <Typography variant="h6" fontWeight="medium">Set Your Donation Amount (APT):</Typography>
              <Typography variant="h5" fontWeight="bold" color="primary.main">{totalDonationAmount} APT</Typography>
          </Box>
          <Slider
              value={totalDonationAmount}
              min={5}
              max={100} 
              step={1}
              onChange={(e, newValue) => setTotalDonationAmount(Number(newValue))}
              aria-labelledby="donation-amount-slider"
              sx={{color: 'primary.main'}}
              valueLabelDisplay="auto"
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', typography: 'caption', color: 'text.secondary' }}>
              <span>5 APT</span>
              <span>100 APT</span>
          </Box>
        </Paper>
        
        {/* 3. Social Media Input */}
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

        {/* Platform Fee Toggle - Keeping this */}
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
                  Helps us grow! Fee: {calculatePlatformFee().toFixed(2)} APT
                </Typography>
              </Box>
            }
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', ml:0 }}
          />
        </Paper>
        
        {/* Navigation */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <BackButton onClick={() => setCurrentStage('welcomeAI')}>Back</BackButton>
          <GlowButton 
              onClick={() => setCurrentStage('aiProcessing')} 
              disabled={isNextDisabled}
              sx={{py: 1.5, fontSize: '1.1rem'}}
              endIcon={<ChevronRightIcon />}
          >
            Continue with Compass
          </GlowButton>
        </Box>
        <Typography variant="caption" display="block" sx={{mt:2, textAlign: 'center', color: 'text.secondary'}}>
            Your data stays private. We only use it to guide your giving journey.
        </Typography>
      </StepContent>
    );
  };

  const AiProcessingView = () => {
    useEffect(() => {
      const timer = setTimeout(() => {
        const mockResults = MOCK_CHARITIES_DATA.slice(0, 3);
        setAiMatchedCharities(mockResults);
        
        const allocations = {};
        let currentTotalAllocation = 0;
        mockResults.forEach((charity, index) => {
            const suggestedPercent = Number(charity.suggested_allocation_percent);
            if (isNaN(suggestedPercent)) {
                console.error("Invalid suggested_allocation_percent for charity:", charity.name);
                allocations[charity.id] = 0;
                return;
            }
            let allocatedAmount;
            if (index === mockResults.length - 1) {
                allocatedAmount = totalDonationAmount - currentTotalAllocation;
            } else {
                allocatedAmount = totalDonationAmount * (suggestedPercent / 100);
            }
            allocatedAmount = Math.max(0, parseFloat(allocatedAmount.toFixed(2)));
            allocations[charity.id] = allocatedAmount;
            currentTotalAllocation += allocatedAmount;
        });

        const sumOfAllocations = Object.values(allocations).reduce((sum, val) => sum + val, 0);
        if (sumOfAllocations !== totalDonationAmount && mockResults.length > 0) {
            const lastCharityId = mockResults[mockResults.length -1].id;
            const diff = totalDonationAmount - sumOfAllocations;
            allocations[lastCharityId] = parseFloat((allocations[lastCharityId] + diff).toFixed(2));
            if (allocations[lastCharityId] < 0) allocations[lastCharityId] = 0;
        }

        setAiSuggestedAllocations(allocations);
        setCurrentStage('charityResults');
      }, 4000);
      return () => clearTimeout(timer);
    }, []);

    const keywords = visionPrompt.split(' ').filter(k => k.length > 3);
    if(keywords.length === 0) keywords.push(...['Impact', 'Faith', 'Children', 'Education', 'Africa']);

    return (
      <StepContent sx={{ textAlign: 'center', py: {xs:4, sm:6}}}>
        <Box sx={{ position: 'relative', width: 120, height: 120, marginX: 'auto', mb: 3 }}>
            <InsightsIcon sx={{ fontSize: 100, color: 'primary.light', position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', opacity: 0.2 }} />
            <CircularProgress size={120} thickness={2} sx={{ position:'absolute', top:0, left:0 }} />
            <AutoAwesomeIcon sx={{ fontSize: 60, color: 'primary.main', position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)' }} />
        </Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontFamily: "'Space Grotesk', sans-serif"}}>
          🧠 Agent Theo is analyzing...
                </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Matching your vision with high-impact causes.
                </Typography>
        <Box sx={{my:3, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1}}>
            {keywords.slice(0,5).map(kw => <Chip key={kw} label={kw} variant="outlined" />)}
              </Box>
        <LinearProgress sx={{my:2, maxWidth: 300, mx:'auto'}}/> 
        <Typography variant="body2" color="text.secondary">
          <i>This may take a few moments...</i>
        </Typography>
          </StepContent>
        );
  };

  const CharityResultsView = () => (
    <StepContent sx={{maxWidth: '900px', mx: 'auto'}}>
      <Typography variant="h4" fontWeight="bold" gutterBottom align="center" sx={{ fontFamily: "'Space Grotesk', sans-serif", mb:1}}>
        Your Personalized Charity Matches
            </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary" sx={{mb:3}}>
        Based on your vision, Agent Theo suggests these organizations:
            </Typography>
            
      <Grid container spacing={3} sx={{ mt: 0 }}>
        {aiMatchedCharities.map(charity => (
          <Grid item xs={12} md={4} key={charity.id}>
            <CharityCard selected={false} sx={{boxShadow: 'lg', transition: 'transform 0.3s, box-shadow 0.3s', '&:hover': {transform: 'translateY(-5px)', boxShadow: 'xl'} }}>
              <CardMedia
                component="img"
                height="160"
                image={charity.logo || 'https://via.placeholder.com/300x160.png?text=Charity+Logo'}
                alt={charity.name}
              />
              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Typography variant="h6" component="div" fontWeight="bold" gutterBottom noWrap title={charity.name}>
                  {charity.name}
                        </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: "wrap" }}>
                  <Chip icon={<CheckCircleIcon />} label={`${charity.match_score_percent}% Match`} color="primary" size="small" variant="filled" />
                  <Chip label={`Trust: ${charity.trust_score_grade}`} color="success" size="small" variant="outlined" />
                </Stack>
                <Typography variant="h6" color="primary.dark" sx={{ my: 1.5}}>
                  Suggested: {aiSuggestedAllocations[charity.id] ? aiSuggestedAllocations[charity.id].toFixed(2) : '0.00'} APT
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.8rem', height: '50px', overflow: 'hidden' }}>
                  AI Note: {charity.ai_explanation}
                </Typography>
              </CardContent>
              <CardActions sx={{ p:2, justifyContent: 'space-around'}}>
                <Button size="small" variant="outlined" sx={{borderRadius: '50px'}}>Details</Button> 
                <Button size="small" variant="contained" sx={{borderRadius: '50px'}} onClick={() => {
                }}>Accept Suggestion</Button> 
              </CardActions>
            </CharityCard>
                  </Grid>
        ))}
      </Grid>
      
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
            <Box sx={{textAlign: 'left'}}>
                    <Typography variant="body1" fontWeight="medium">
                Support Eunoia Platform (+0.20%)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                Helps us operate & grow! Fee: {calculatePlatformFee().toFixed(2)} APT
                    </Typography>
                  </Box>
                }
          sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', ml:0 }}
              />
              <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt:1 }}>
            <Typography variant="h5" fontWeight="bold">Total Donation:</Typography>
            <Typography variant="h5" fontWeight="bold" color="primary.main">
                {(totalDonationAmount + calculatePlatformFee()).toFixed(2)} APT
                </Typography>
              </Box>
      </Paper>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <BackButton onClick={() => setCurrentStage('visionPrompt')}>Adjust Vision</BackButton>
              <GlowButton 
            onClick={() => {
                setCurrentStage('donationConfirmation');
            }}
            disabled={aiMatchedCharities.length === 0 || transactionPending}
            size="large"
            sx={{py: 1.5, px: 5, fontSize: '1.1rem'}}
        >
          {transactionPending ? <CircularProgress size={24} color="inherit"/> : 'Confirm & Donate'}
              </GlowButton>
            </Box>
          </StepContent>
        );
      
  const DonationConfirmationView = () => {
    useEffect(() => {
        if (currentStage === 'donationConfirmation' && !transactionPending && !donationComplete && !transactionError) {
            if (!walletAddress) {
                 setTransactionError("Wallet not connected. Please connect your wallet first.");
                 return;
            }
            handleDonate();
        }
    }, [currentStage]);

    if (transactionPending) {
        return (
            <StepContent sx={{ textAlign: 'center', py: {xs:4, sm:6}}}>
                <CircularProgress sx={{ mb: 3, width: '60px !important', height: '60px !important' }}/>
                <Typography variant="h5" fontWeight="bold" gutterBottom>Processing Your Donation...</Typography>
                <Typography variant="body1" color="text.secondary">Please confirm the transaction in your wallet.</Typography>
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

  const ImpactTrackerView = () => {
    useEffect(() => {
        setImpactActivities([]); 
        const baseDonationAmount = aiSuggestedAllocations[aiMatchedCharities[0]?.id] || 0;
        const charityName = aiMatchedCharities[0]?.name || 'the selected cause';

        const activities = [
            { id: 1, text: `✅ ${(baseDonationAmount).toFixed(2)} APT sent to ${charityName} Wallet`, time: "Just now", type: "transfer" },
        ];
        
        let currentDelay = 0;
        const scheduleActivity = (text, time, type, delay) => {
            currentDelay += delay;
            setTimeout(() => {
                setImpactActivities(prev => [...prev, {id: prev.length + 2, text, time, type}])
            }, currentDelay);
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
        setImpactActivities(activities);

    }, []);

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
        
        let post = `Just made an AI-guided donation via @EunoiaImpact! 💖 My contribution is supporting ${charityName}`;
        if (impactHighlights.length > 0) {
            post += ` - already making a difference: ${impactHighlights.join(', ')}!`;
        }
        post += " Trackable on Aptos! #Eunoia #TransparentGiving #Web3ForGood";
        return post;
    };

    return (
        <StepContent sx={{maxWidth: '900px', mx: 'auto'}}>
            <Typography variant="h4" fontWeight="bold" gutterBottom align="center" sx={{ fontFamily: "'Space Grotesk', sans-serif", mb:1}}>
                Your Impact Tracker
                </Typography>
             <Typography variant="subtitle1" align="center" color="text.secondary" sx={{mb:3}}>
                Follow the real-time progress of your donation to {aiMatchedCharities[0]?.name || "the cause"}.
                </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                    <Typography variant="h6" gutterBottom fontWeight="medium">Donation Timeline</Typography>
                    <Paper elevation={2} sx={{ p: {xs:1.5, sm:2}, borderRadius: '16px', minHeight: 200, background: alpha(theme.palette.background.default, 0.7), backdropFilter: 'blur(5px)' }}>
                        {impactActivities.length === 0 && <Typography color="textSecondary" sx={{p:2, textAlign: 'center'}}>Tracking updates will appear here shortly...</Typography>}
                        {impactActivities.map((activity, index) => (
                            <Box 
                                key={activity.id}
                  sx={{ 
                                    mb: 1.5, 
                                    pb: 1.5, 
                                    borderBottom: index === impactActivities.length -1 ? 'none' : `1px dashed ${theme.palette.divider}`,
                                    display: 'flex',
                                    alignItems: 'flex-start'
                                }}
                            >
                                <Chip 
                                    icon={activity.type === 'transfer' ? <CheckCircleIcon /> : activity.type === 'confirmation' ? <VerifiedIcon/> : <InfoIcon/>}
                                    color={activity.type === 'transfer' ? "success" : activity.type === 'confirmation' ? "info" : "secondary"}
                                    size="small"
                                    sx={{mr: 1.5, mt: 0.5, borderRadius: '50px'}}
                                />
                                <Box>
                                    <Typography variant="body1">{activity.text}</Typography>
                                    <Typography variant="caption" color="text.secondary">{activity.time}</Typography>
              </Box>
                    </Box>
                        ))}
                    </Paper>
                </Grid>
                <Grid item xs={12} md={5}>
                    <Typography variant="h6" gutterBottom fontWeight="medium">Total Impact Summary</Typography>
                     <Paper elevation={2} sx={{ p: {xs:1.5, sm:2}, borderRadius: '16px', mb: 2.5, background: alpha(theme.palette.background.default, 0.7), backdropFilter: 'blur(5px)' }}>
                        <Grid container spacing={2}>
                            {Object.entries(totalImpactStats).map(([key, value]) => {
                                if (value === 0) return null;
                                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                return (
                                    <Grid item xs={6} sm={6} sx={{textAlign: 'center'}} key={key}>
                                        <Typography variant="h4" color="primary.main" fontWeight="bold">{value}</Typography>
                                        <Typography variant="caption">{label}</Typography>
                                    </Grid>
                                );
                            })}
                            {Object.values(totalImpactStats).every(v => v === 0) && 
                                <Typography sx={{p:2, textAlign: 'center', width:'100%'}} color="textSecondary">Impact stats will update as activities are confirmed.</Typography>}
                        </Grid>
                    </Paper>

                    <Paper elevation={2} sx={{ p: {xs:1.5, sm:2}, borderRadius: '16px', background: alpha(theme.palette.background.default, 0.7), backdropFilter: 'blur(5px)' }}>
                         <FormControlLabel
                            control={
                                <Switch
                                checked={showSocialSharePreview}
                                onChange={(e) => setShowSocialSharePreview(e.target.checked)}
                                color="primary"
                                />
                            }
                            labelPlacement="start"
                            label={"Share Your Impact"}
                            sx={{ mb: 1, display:'flex', justifyContent:'space-between', width:'100%', ml:0, fontWeight:'medium' }}
                        />
                        {showSocialSharePreview && (
                            <Paper variant="outlined" sx={{ p:1.5, borderRadius: '12px', bgcolor: alpha(theme.palette.common.white, 0.7), my:1.5 }}>
                                <Box sx={{display: 'flex', alignItems: 'center', mb:1}}>
                                    <Avatar sx={{width:32, height:32, bgcolor: 'primary.light', mr:1}}>You</Avatar>
                                    <Typography variant="subtitle2" fontWeight="bold">@YourHandle</Typography>
              </Box>
                                <Typography variant="body2" sx={{mt:0.5, fontSize: '0.85rem'}}>
                                   {getSocialPostText()}
              </Typography>
                                <Chip label="Verified by Aptos" size="small" variant="outlined" color="secondary" sx={{mt:1, fontSize: '0.7rem'}}/>
                            </Paper>
                        )}
                        <GlowButton fullWidth startIcon={<ShareIcon />} disabled={!showSocialSharePreview} sx={{py:1.2, fontSize: '1rem'}}>
                            Share Now (Mock)
                        </GlowButton>
                    </Paper>
                </Grid>
            </Grid>
            <Box sx={{ textAlign: 'center', mt: 4, display:'flex', justifyContent:'center', gap: 2 }}>
                <GlowButton onClick={handleReset} size="large" sx={{py: 1.5, px: 5, fontSize: '1.1rem'}}>
                    Make Another Donation
                </GlowButton>
                 <Button component={Link} to="/explore" variant="outlined" sx={{textTransform:'none'}}>Explore Charities</Button>
            </Box>
          </StepContent>
        );
  };

  const renderCurrentStage = () => {
    switch (currentStage) {
      case 'welcomeAI':
        return <AllocationWelcomeView />;
      case 'visionPrompt':
        return <VisionPromptView />;
      case 'aiProcessing':
        return <AiProcessingView />;
      case 'charityResults':
        return <CharityResultsView />;
      case 'donationConfirmation':
        return <DonationConfirmationView />;
      case 'impactTracker':
        return <ImpactTrackerView />;
      default:
        setCurrentStage('welcomeAI'); 
        return <AllocationWelcomeView />;
    }
  };

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
                    const isCompleted = stageIndex < arr.indexOf(currentStage);
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