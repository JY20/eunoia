import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper,
  TextField,
  Button,
  Grid,
  styled,
  useTheme,
  Alert,
  Snackbar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardMedia,
  Divider,
  IconButton,
  Fade,
  Grow,
  Zoom
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DescriptionIcon from '@mui/icons-material/Description';
import MissionIcon from '@mui/icons-material/EmojiObjects';
import GoalIcon from '@mui/icons-material/Flag';

// Constants
const API_BASE_URL = 'http://localhost:8000/api';

// Styled components
const PageWrapper = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
  minHeight: '100vh',
  padding: theme.spacing(0, 0, 8),
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #7209b7 0%, #9d4edd 100%)',
  padding: theme.spacing(10, 2, 15),
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)',
  marginBottom: theme.spacing(-10),
}));

const HeaderPattern = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  opacity: 0.1,
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  zIndex: 0,
}));

const FloatingCard = styled(Paper)(({ theme }) => ({
  padding: 0,
  borderRadius: 20,
  overflow: 'hidden',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
  position: 'relative',
  zIndex: 10,
  background: '#fff',
  margin: 'auto',
  maxWidth: 1100,
  marginTop: theme.spacing(-10),
  display: 'flex',
  flexDirection: 'column',
  minHeight: 550,
}));

const FormHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(90deg, #7209b7 0%, #9d4edd 100%)',
  padding: theme.spacing(3, 4),
  color: 'white',
}));

const FormContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
}));

const StyledStepper = styled(Stepper)(({ theme }) => ({
  '& .MuiStepLabel-root .Mui-completed': {
    color: '#9d4edd',
  },
  '& .MuiStepLabel-root .Mui-active': {
    color: '#7209b7',
  },
  '& .MuiStepLabel-label': {
    color: 'white',
    fontWeight: 500,
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
  },
  '& .MuiStepLabel-label.Mui-active': {
    fontWeight: 700,
    color: 'white',
  },
  '& .MuiStepConnector-line': {
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 2,
  },
  '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
    borderColor: 'white',
    borderWidth: 2,
  },
  '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
    borderColor: 'white',
    borderWidth: 2,
  },
  marginBottom: theme.spacing(4),
}));

const StepButton = styled(Button)(({ theme, direction }) => ({
  background: direction === 'back' 
    ? 'rgba(114, 9, 183, 0.1)'
    : 'linear-gradient(90deg, #7209b7 0%, #9d4edd 100%)',
  color: direction === 'back' ? '#7209b7' : 'white',
  borderRadius: 50,
  padding: '12px 24px',
  margin: theme.spacing(1),
  textTransform: 'none',
  fontWeight: 'bold',
  '&:hover': {
    background: direction === 'back'
      ? 'rgba(114, 9, 183, 0.2)'
      : 'linear-gradient(90deg, #560bad 0%, #7209b7 100%)',
  },
}));

const StepIcon = styled(Box)(({ theme, active }) => ({
  background: active ? '#7209b7' : 'rgba(157, 78, 221, 0.2)',
  color: 'white',
  width: 40,
  height: 40,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
}));

const IconContainer = styled(Box)(({ theme }) => ({
  background: 'rgba(114, 9, 183, 0.05)',
  borderRadius: '50%',
  width: 60,
  height: 60,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
}));

const NavigationContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isFirstStep'
})(({ theme, isFirstStep }) => ({
  display: 'flex',
  justifyContent: isFirstStep ? 'flex-end' : 'space-between',
  marginTop: theme.spacing(3),
}));

// Main component
const RegisterCharityPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    walletAddress: '',
    description: '',
    mission: '',
    goal: '',
  });
  
  // UI state
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Define steps
  const steps = [
    {
      label: 'Basics',
      icon: <VolunteerActivismIcon />,
      description: 'Let\'s start with your charity\'s name',
      fields: ['name']
    },
    {
      label: 'Wallet',
      icon: <AccountBalanceWalletIcon />,
      description: 'Add your wallet address for donations',
      fields: ['walletAddress']
    },
    {
      label: 'Mission',
      icon: <MissionIcon />,
      description: 'What is your charity\'s mission?',
      fields: ['mission']
    },
    {
      label: 'Goals',
      icon: <GoalIcon />,
      description: 'What are your fundraising goals?',
      fields: ['goal']
    },
    {
      label: 'Description',
      icon: <DescriptionIcon />,
      description: 'Tell us more about your charity',
      fields: ['description']
    }
  ];

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate current step
  const validateStep = () => {
    const currentFields = steps[activeStep].fields;
    const newErrors = {};
    let isValid = true;

    currentFields.forEach(field => {
      if (!formData[field] || !formData[field].trim()) {
        newErrors[field] = `This field is required`;
        isValid = false;
      } else if (field === 'walletAddress' && !/^0x[a-fA-F0-9]{64}$/.test(formData.walletAddress)) {
        newErrors.walletAddress = 'Please enter a valid Aptos wallet address';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Validate all fields
  const validateAll = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Charity name is required';
    }

    if (!formData.walletAddress.trim()) {
      newErrors.walletAddress = 'Wallet address is required';
    } else if (!/^0x[a-fA-F0-9]{64}$/.test(formData.walletAddress)) {
      newErrors.walletAddress = 'Please enter a valid Aptos wallet address';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.mission.trim()) {
      newErrors.mission = 'Mission statement is required';
    }

    if (!formData.goal.trim()) {
      newErrors.goal = 'Goal planning is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step navigation
  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAll()) {
      return;
    }

    setLoading(true);

    try {
      // Replace with actual API endpoint when available
      const response = await axios.post(`${API_BASE_URL}/charities/register/`, {
        name: formData.name,
        wallet_address: formData.walletAddress,
        description: formData.description,
        mission: formData.mission,
        goal_planning: formData.goal
      });

      setSnackbar({
        open: true,
        message: 'Charity registered successfully!',
        severity: 'success'
      });

      // Redirect to charities page after successful registration
      setTimeout(() => {
        navigate('/charities');
      }, 2000);

    } catch (error) {
      console.error('Error registering charity:', error);
      
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to register charity. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  // Render field for current step
  const renderStepContent = (step) => {
    const fields = steps[step].fields;
    
    return (
      <Fade in={true} timeout={800}>
        <Box>
          <Box mb={4} display="flex" alignItems="center">
            <IconContainer>
              {steps[step].icon}
            </IconContainer>
            <Box ml={2}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {steps[step].label}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {steps[step].description}
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {fields.map(field => (
              <Grid item xs={12} key={field}>
                <Zoom in={true} style={{ transitionDelay: '150ms' }}>
                  <TextField
                    fullWidth
                    label={
                      field === 'name' ? 'Charity Name' :
                      field === 'walletAddress' ? 'Wallet Address' :
                      field === 'description' ? 'Description' :
                      field === 'mission' ? 'Mission Statement' :
                      'Goal Planning'
                    }
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    error={!!errors[field]}
                    helperText={errors[field] || (
                      field === 'walletAddress' ? 'Enter your Aptos wallet address (starting with 0x)' :
                      field === 'goal' ? 'What are your fundraising goals and how will funds be used?' :
                      ''
                    )}
                    multiline={['description', 'mission', 'goal'].includes(field)}
                    rows={['description', 'mission'].includes(field) ? 4 : field === 'goal' ? 3 : 1}
                    variant="outlined"
                    InputProps={{
                      sx: {
                        borderRadius: 2,
                        backgroundColor: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)'
                        }
                      }
                    }}
                  />
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Fade>
    );
  };

  // Render review step
  const renderReview = () => {
    return (
      <Fade in={true} timeout={800}>
        <Box>
          <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
            Review Your Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ p: 3, background: 'linear-gradient(90deg, #7209b7 0%, #9d4edd 100%)' }}>
                  <Typography variant="h6" color="white" fontWeight="bold">
                    {formData.name}
                  </Typography>
                </Box>
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Wallet Address
                      </Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all', mt: 0.5 }}>
                        {formData.walletAddress}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" color="textSecondary">
                        Mission
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {formData.mission}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" color="textSecondary">
                        Goals
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {formData.goal}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" color="textSecondary">
                        Description
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {formData.description}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button 
              variant="contained" 
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                background: 'linear-gradient(90deg, #7209b7 0%, #9d4edd 100%)',
                color: 'white',
                borderRadius: 50,
                padding: '12px 32px',
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '1rem',
                '&:hover': {
                  background: 'linear-gradient(90deg, #560bad 0%, #7209b7 100%)',
                },
              }}
              startIcon={<CheckCircleIcon />}
            >
              {loading ? 'Registering...' : 'Complete Registration'}
            </Button>
          </Box>
        </Box>
      </Fade>
    );
  };

  return (
    <PageWrapper>
      <HeaderSection>
        <HeaderPattern />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grow in={true} timeout={800}>
            <Box textAlign="center">
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Register Your Charity
              </Typography>
              <Typography variant="h6" sx={{ maxWidth: '700px', margin: '0 auto', opacity: 0.9 }}>
                Join our platform to connect with donors and make a difference
              </Typography>
            </Box>
          </Grow>
        </Container>
      </HeaderSection>

      <Container maxWidth="lg">
        <FloatingCard>
          <FormHeader>
            <Box mb={2}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Your Registration Journey
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                Complete these steps to register your charity on our platform
              </Typography>
            </Box>

            <StyledStepper activeStep={activeStep} alternativeLabel>
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel 
                    StepIconComponent={() => (
                      <StepIcon active={activeStep === index}>
                        {step.icon}
                      </StepIcon>
                    )}
                  >
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
              <Step>
                <StepLabel 
                  StepIconComponent={() => (
                    <StepIcon active={activeStep === steps.length}>
                      <CheckCircleIcon />
                    </StepIcon>
                  )}
                >
                  Review
                </StepLabel>
              </Step>
            </StyledStepper>
          </FormHeader>

          <FormContent>
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {activeStep === steps.length ? renderReview() : renderStepContent(activeStep)}
            </Box>
            <NavigationContainer isFirstStep={activeStep === 0}>
              <Box>
                {activeStep > 0 && (
                  <StepButton 
                    onClick={handleBack}
                    startIcon={<ArrowBackIcon />}
                    direction="back"
                  >
                    Back
                  </StepButton>
                )}
              </Box>
              <Box>
                {activeStep < steps.length && (
                  <StepButton 
                    onClick={handleNext}
                    endIcon={<ArrowForwardIcon />}
                    direction="next"
                  >
                    {activeStep === steps.length - 1 ? 'Review' : 'Continue'}
                  </StepButton>
                )}
              </Box>
            </NavigationContainer>
          </FormContent>
        </FloatingCard>
      </Container>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageWrapper>
  );
};

export default RegisterCharityPage; 