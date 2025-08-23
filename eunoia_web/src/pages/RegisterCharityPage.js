import React, { useState, useRef } from 'react';
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
  Zoom,
  Input,
  FormHelperText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MissionIcon from '@mui/icons-material/EmojiObjects';
import GoalIcon from '@mui/icons-material/Flag';
import EmailIcon from '@mui/icons-material/Email';
import LinkIcon from '@mui/icons-material/Link';
import ImageIcon from '@mui/icons-material/Image';
// import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';

// Constants
const API_BASE_URL = 'http://127.0.0.1:8000/api'; // Local development backend
// const API_BASE_URL = 'https://eunoia-api-eya2hhfdfzcchyc2.canadacentral-01.azurewebsites.net/api'; // Production

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
  const logoInputRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    walletAddress: '',
    contactEmail: '',
    websiteUrl: '',
    logo: null,
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
      label: 'Contact',
      icon: <EmailIcon />,
      description: 'Provide a contact email for your charity',
      fields: ['contactEmail']
    },
    {
      label: 'Website',
      icon: <LinkIcon />,
      description: 'Enter your charity\'s official website URL',
      fields: ['websiteUrl']
    },
    {
      label: 'Logo',
      icon: <ImageIcon />,
      description: 'Upload your charity\'s logo (optional)',
      fields: ['logo']
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
  ];

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'logo') {
      setFormData(prev => ({
        ...prev,
        logo: files[0] || null
      }));
      if (errors.logo) {
        setErrors(prev => ({ ...prev, logo: '' }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when field is edited
    if (name !== 'logo' && errors[name]) {
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
      if (field === 'logo') return;

      if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
        newErrors[field] = `This field is required`;
        isValid = false;
      } else if (field === 'walletAddress' && !/^0x[a-fA-F0-9]{64}$/.test(formData.walletAddress)) {
        newErrors.walletAddress = 'Please enter a valid Aptos wallet address';
        isValid = false;
      } else if (field === 'contactEmail' && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
        newErrors.contactEmail = 'Please enter a valid email address';
        isValid = false;
      } else if (field === 'websiteUrl') {
        try {
          new URL(formData.websiteUrl);
        } catch (_) {
          newErrors.websiteUrl = 'Please enter a valid URL (e.g., https://example.com)';
          isValid = false;
        }
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

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    if (!formData.websiteUrl.trim()) {
      newErrors.websiteUrl = 'Website URL is required';
    } else if (!/^https?:\/\/[^\s]+$/.test(formData.websiteUrl)) {
      newErrors.websiteUrl = 'Please enter a valid URL (e.g., https://example.com)';
    }

    if (!formData.logo) {
      newErrors.logo = 'Logo is required';
    } else {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(formData.logo.type)) {
        newErrors.logo = 'Invalid file type. Please upload JPG, PNG, or GIF.';
      }
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (formData.logo.size > maxSize) {
        newErrors.logo = 'File is too large. Maximum size is 5MB.';
      }
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

    const submissionData = new FormData();
    submissionData.append('name', formData.name);
    submissionData.append('aptos_wallet_address', formData.walletAddress);
    submissionData.append('contact_email', formData.contactEmail);
    submissionData.append('website_url', formData.websiteUrl);
    if (formData.logo) {
      submissionData.append('logo', formData.logo);
    }
    submissionData.append('tagline', formData.mission);

    try {
      const response = await axios.post(`${API_BASE_URL}/charities/`, submissionData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSnackbar({
        open: true,
        message: 'Charity registered successfully!',
        severity: 'success'
      });

      setTimeout(() => {
        navigate('/charities');
      }, 2000);

    } catch (error) {
      console.error('Error registering charity:', error);
      
      let errorMessage = 'Failed to register charity. Please try again.';
      if (error.response && error.response.data) {
        const errors = error.response.data;
        const messages = Object.values(errors).flat();
        if (messages.length > 0) {
          errorMessage = messages.join(' \n');
        }
      }

      setSnackbar({
        open: true,
        message: errorMessage,
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
    switch(step.label) {
      case 'Basics':
        return (
          <Grow in={true}>
            <Box sx={{ width: '100%' }}>
              <IconContainer>
                <VolunteerActivismIcon sx={{ fontSize: 30 }} />
              </IconContainer>
              <Typography variant="h5" fontWeight="bold" gutterBottom align="center">
                {step.description}
              </Typography>
              <TextField 
                fullWidth
                margin="normal"
                name="name"
                label="Charity Name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                variant="outlined"
                sx={{ mb: 2, width: '100%' }}
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
            </Box>
          </Grow>
        );
      case 'Wallet':
        return (
          <Grow in={true}>
            <Box sx={{ width: '100%' }}>
              <IconContainer>
                <AccountBalanceWalletIcon sx={{ fontSize: 30 }} />
              </IconContainer>
              <Typography variant="h5" fontWeight="bold" gutterBottom align="center">
                {step.description}
              </Typography>
              <TextField
                fullWidth
                margin="normal"
                name="walletAddress"
                label="Wallet Address (Aptos)"
                value={formData.walletAddress}
                onChange={handleChange}
                error={!!errors.walletAddress}
                helperText={errors.walletAddress}
                variant="outlined"
                sx={{ mb: 2, width: '100%' }}
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
            </Box>
          </Grow>
        );
      case 'Contact':
        return (
          <Grow in={true}>
            <Box sx={{ width: '100%' }}>
              <IconContainer>
                <EmailIcon sx={{ fontSize: 30 }} />
              </IconContainer>
              <Typography variant="h5" fontWeight="bold" gutterBottom align="center">
                {step.description}
              </Typography>
              <TextField
                fullWidth
                margin="normal"
                name="contactEmail"
                label="Contact Email"
                type="email"
                value={formData.contactEmail}
                onChange={handleChange}
                error={!!errors.contactEmail}
                helperText={errors.contactEmail}
                variant="outlined"
                sx={{ mb: 2, width: '100%' }}
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
            </Box>
          </Grow>
        );
      case 'Website':
        return (
          <Grow in={true}>
            <Box sx={{ width: '100%' }}>
              <IconContainer>
                <LinkIcon sx={{ fontSize: 30 }} />
              </IconContainer>
              <Typography variant="h5" fontWeight="bold" gutterBottom align="center">
                {step.description}
              </Typography>
              <TextField
                fullWidth
                margin="normal"
                name="websiteUrl"
                label="Website URL (e.g., https://example.com)"
                type="url"
                value={formData.websiteUrl}
                onChange={handleChange}
                error={!!errors.websiteUrl}
                helperText={errors.websiteUrl}
                variant="outlined"
                sx={{ mb: 2, width: '100%' }}
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
            </Box>
          </Grow>
        );
      case 'Logo':
        return (
          <Grow in={true}>
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              <IconContainer sx={{ mx: 'auto' }}>
                <ImageIcon sx={{ fontSize: 30 }} />
              </IconContainer>
              <Typography variant="h5" fontWeight="bold" gutterBottom align="center">
                {step.description}
              </Typography>
              <Button variant="contained" component="label" sx={{ my: 2, background: 'linear-gradient(90deg, #7209b7 0%, #9d4edd 100%)', color: 'white', borderRadius: 2, padding: '10px 20px', '&:hover': { background: 'linear-gradient(90deg, #560bad 0%, #7209b7 100%)' } }}>
                Upload Logo
                <input type="file" name="logo" hidden onChange={handleChange} accept="image/png, image/jpeg, image/gif" ref={logoInputRef} />
              </Button>
              {formData.logo && <Typography variant="body2" sx={{ mt: 1 }}>Selected: {formData.logo.name}</Typography>}
              {errors.logo && <FormHelperText error sx={{ textAlign: 'center' }}>{errors.logo}</FormHelperText>}
            </Box>
          </Grow>
        );
      case 'Mission':
        return (
          <Grow in={true}>
            <Box sx={{ width: '100%' }}>
              <IconContainer>
                <MissionIcon sx={{ fontSize: 30 }} />
              </IconContainer>
              <Typography variant="h5" fontWeight="bold" gutterBottom align="center">
                {step.description}
              </Typography>
              <TextField
                fullWidth
                margin="normal"
                name="mission"
                label="Charity Mission/Tagline (Short & impactful)"
                value={formData.mission}
                onChange={handleChange}
                error={!!errors.mission}
                helperText={errors.mission}
                variant="outlined"
                multiline
                rows={3}
                sx={{ mb: 2, width: '100%' }}
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
            </Box>
          </Grow>
        );
      case 'Goals':
        return (
          <Grow in={true}>
            <Box sx={{ width: '100%' }}>
              <IconContainer>
                <GoalIcon sx={{ fontSize: 30 }} />
              </IconContainer>
              <Typography variant="h5" fontWeight="bold" gutterBottom align="center">
                {step.description}
              </Typography>
              <TextField
                fullWidth
                margin="normal"
                name="goal"
                label="Fundraising Goal (e.g., Target amount, specific project)"
                value={formData.goal}
                onChange={handleChange}
                error={!!errors.goal}
                helperText={errors.goal}
                variant="outlined"
                multiline
                rows={3}
                sx={{ mb: 2, width: '100%' }}
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
            </Box>
          </Grow>
        );
      default:
        return 'Unknown step';
    }
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
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Wallet Address
                      </Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all', mt: 0.5 }}>
                        {formData.walletAddress}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Contact Email
                      </Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all', mt: 0.5 }}>
                        {formData.contactEmail}
                      </Typography>
                    </Grid>
                    {formData.websiteUrl && (
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="subtitle2" color="textSecondary">
                          Website URL
                        </Typography>
                        <Typography variant="body2" sx={{ wordBreak: 'break-all', mt: 0.5 }}>
                          {formData.websiteUrl}
                        </Typography>
                      </Grid>
                    )}
                    {formData.logo && (
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="subtitle2" color="textSecondary">
                          Logo
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {formData.logo.name}
                        </Typography>
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" color="textSecondary">
                        Mission/Tagline
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
              {activeStep === steps.length ? renderReview() : renderStepContent(steps[activeStep])}
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