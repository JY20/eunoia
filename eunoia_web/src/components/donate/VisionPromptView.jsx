import React, { useRef } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  alpha, 
  CircularProgress, 
  InputAdornment, 
  IconButton, 
  Tooltip,
  Slider,
  MenuItem,
  Chip,
  Stack,
  Switch,
  FormControlLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

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
  setMaxDonationAmount,
  activeChain,
  handleConnectWallet,
  walletAddress
}) => {
  // Define chain-specific cryptocurrency options
  const aptosCryptoOptions = [
    { value: 'APT', label: 'Aptos (APT)' }
  ];
  
  const polkadotCryptoOptions = [
    { value: 'DOT', label: 'Polkadot (DOT)' }
  ];
  
  // Select the appropriate options based on the active chain
  const cryptoOptions = activeChain === 'POLKADOT' ? polkadotCryptoOptions : aptosCryptoOptions;

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
            {walletAddress ? (
              <>
                {loadingBalance ? (
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                ) : (
                  <AccountBalanceWalletIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                )}
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    Balance: {walletBalance.toFixed(4)} {activeChain === 'POLKADOT' ? 'DOT' : 'APT'}
                  </Typography>
                  {!balanceError && walletBalance > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {activeChain === 'POLKADOT' ? 'Connected to Polkadot' : 'Connected to Aptos'}
                    </Typography>
                  )}
                </Box>
              </>
            ) : (
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<AccountBalanceWalletIcon />}
                onClick={handleConnectWallet}
              >
                Connect Wallet
              </Button>
            )}
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
                // If wallet not connected, try to connect first
                if (!walletAddress) {
                  handleConnectWallet().then(success => {
                    if (success) {
                      setCurrentStage('aiProcessing');
                    }
                  });
                } else {
                  setCurrentStage('aiProcessing');
                }
                setTimeout(() => { hasNavigatedRef.current = false; }, 1000); 
              }
            }} 
            disabled={isNextDisabled}
            sx={{py: 1.5, fontSize: '1.1rem'}}
            endIcon={<ChevronRightIcon />}
        >
          {walletAddress ? 'Continue' : 'Connect Wallet & Continue'}
        </GlowButton>
      </Box>
      <Typography variant="caption" display="block" sx={{mt:2, textAlign: 'center', color: 'text.secondary'}}>
          Your data stays private. We only use it to guide your giving journey.
      </Typography>
    </StepContent>
  );
};

export default VisionPromptView;
