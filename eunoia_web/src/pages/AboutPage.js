import React from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Paper, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Chip, 
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  styled,
  useTheme,
  alpha
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'; // For MVP Goals
import SecurityIcon from '@mui/icons-material/Security'; // For Aptos
import SpeedIcon from '@mui/icons-material/Speed'; // For Aptos
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'; // For Aptos
import GroupWorkIcon from '@mui/icons-material/GroupWork'; // For Key Features
import TrackChangesIcon from '@mui/icons-material/TrackChanges'; // For Key Features
import VpnKeyIcon from '@mui/icons-material/VpnKey'; // For Key Features
import CampaignIcon from '@mui/icons-material/Campaign'; // For Key Features
import ReceiptIcon from '@mui/icons-material/Receipt'; // For Key Features
import HowToRegIcon from '@mui/icons-material/HowToReg'; // For Key Features


const PageHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
  padding: theme.spacing(10, 2, 12),
  color: 'white',
  textAlign: 'center',
  clipPath: 'polygon(0 0, 100% 0, 100% 90%, 0 100%)',
  marginBottom: theme.spacing(-5),
}));

const SectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
}));

const FeatureItem = ({ icon, title, text }) => {
  const theme = useTheme(); // Ensure theme is available
  return (
    <Grid item xs={12} sm={10} md={8}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.light, 0.2), color: 'primary.main' }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>{title}</Typography>
          <Typography variant="body2" color="text.secondary">{text}</Typography>
        </Box>
      </Box>
    </Grid>
  );
};

const HowItWorksStep = ({ number, title, text }) => (
  <Grid item xs={12} sm={10} md={8} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
    <Avatar sx={{ bgcolor: 'primary.main', color: 'white', width: 40, height: 40, fontWeight: 'bold' }}>{number}</Avatar>
    <Box>
      <Typography variant="h6" fontWeight="bold">{title}</Typography>
      <Typography variant="body2" color="text.secondary">{text}</Typography>
    </Box>
  </Grid>
);

const AboutPage = () => {
  const theme = useTheme();

  const keyFeatures = [
    { icon: <AttachMoneyIcon />, title: "Ultra-Low Fees", text: "Core fee of just 0.25%. Optional 0.20% goes to a marketing fund that benefits all campaigns." },
    { icon: <TrackChangesIcon />, title: "On-Chain Transparency", text: "View live fund flows and spend dashboards. Every gift is publicly verifiable." },
    { icon: <GroupWorkIcon />, title: "Advocate-Aligned Mission", text: "Eunoia is inspired by stewardship and collective impact." },
    { icon: <VpnKeyIcon />, title: "Anonymity + Tax Flexibility", text: "Give anonymously or opt-in for tax receipts via secure KYC." },
    { icon: <HowToRegIcon />, title: "Multi-Charity Splitting", text: "Support multiple causes in one transaction." },
    { icon: <HowToRegIcon />, title: "Charity Registry + Trust Scoring", text: "Register charities with AI-supported impact & integrity scoring." },
    { icon: <CampaignIcon />, title: "Marketing Engine", text: "0.20% surcharge funds auto-generated social content and growth loops." },
    { icon: <ReceiptIcon />, title: "Exportable Receipts", text: "Donors and orgs get downloadable, auditable records." },
  ];

  const howItWorks = [
    { number: 1, title: "Donate in USDC", text: "Use the Eunoia app to send donations in USDC." },
    { number: 2, title: "Optional \"Amplify Impact\"", text: "Add 0.20% to grow the platform via marketing." }, // Escaped quotes
    { number: 3, title: "Funds Tracked On-Chain", text: "Watch real-time fund movement and charity use." },
    { number: 4, title: "Charity Receives USDC", text: "Uses stablecoin or fiat (USDC → ACH, SEPA, Interac)." },
    { number: 5, title: "Impact Uploaded", text: "Charities share receipts, images, and progress, which will increase their trust score." },
  ];
  
  const mvpGoals = [
    "Web app with donation UI and APT wallet connection",
    "\"Amplify Impact\" toggle + 0.20% marketing pool logic", // Escaped quotes
    "On-chain fund dashboard (APT indexer)",
    "Charity registry + allocation splitter",
    "Exportable receipts + impact reporting mock",
    "Fiat off-ramp placeholder (MoonPay/Transak)",
    "Social post generator MVP for marketing fund",
  ];

  const builtOnAptos = [
    { icon: <SpeedIcon />, title: "Sub-second latency" },
    { icon: <AttachMoneyIcon />, title: "< $0.001 gas fees" },
    { icon: <SecurityIcon />, title: "Move language for secure smart contracts" },
  ];

  const comparisonData = [
    { platform: 'Eunoia', fee: '0.25%', tracking: true, multiCharity: true, anonymity: 'Optional', marketing: true },
    { platform: 'Tithe.ly (Web2)', fee: '~2.9%', tracking: false, multiCharity: false, anonymity: false, marketing: false },
    { platform: 'Givebutter (Web2)', fee: '1-5%', tracking: false, multiCharity: true, anonymity: false, marketing: false },
    { platform: 'The Giving Block (Web3)', fee: '$2,500+/yr', tracking: 'Partial', multiCharity: false, anonymity: true, marketing: false },
  ];

  return (
    <Box sx={{ backgroundColor: alpha(theme.palette.primary.light, 0.05), minHeight: '100vh' }}>
      <PageHeader>
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
            About Eunoia
          </Typography>
          <Typography variant="h5" component="p" sx={{ opacity: 0.9, maxWidth: '700px', margin: 'auto' }}>
            Onchained Giving. Borderless Impact.
          </Typography>
        </Container>
      </PageHeader>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <SectionPaper elevation={3}>
          <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom sx={{ color: 'primary.main', mb: 2, textAlign: 'center' }}>
            Executive Summary
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.7 }}>
            Eunoia is a radically transparent, advocate-centered giving platform built on Aptos. We enable givers to track every penny from wallet → charity → spend in real-time. With an optional 0.20% "Amplify Impact" surcharge, Eunoia powers a self-funding marketing engine that grows the platform without burdening charities or donors.
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
            Eunoia also aims to eliminate unnecessary middlemen, enabling donations to reach individuals directly like missionaries or independent charity workers in developing countries with full transparency and minimal fees.
          </Typography>
        </SectionPaper>

        <SectionPaper elevation={3}>
          <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom sx={{ color: 'primary.main', mb: 3, textAlign: 'center' }}>
            Key Features
          </Typography>
          <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
            {keyFeatures.map(feature => <FeatureItem key={feature.title} {...feature} />)}
          </Grid>
        </SectionPaper>

        <SectionPaper elevation={3}>
          <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom sx={{ color: 'primary.main', mb: 3, textAlign: 'center' }}>
            How It Works
          </Typography>
          <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
            {howItWorks.map(step => <HowItWorksStep key={step.number} {...step} />)}
          </Grid>
        </SectionPaper>

        <SectionPaper elevation={3}>
          <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
            Our Advantage
          </Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`}}>
            <Table sx={{ minWidth: 650 }} aria-label="comparison table">
              <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.light, 0.1) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: 'primary.dark' }}>Platform</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>Avg. Fee</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>Real-Time Tracking</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>Multi-Charity</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>Anonymity</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>Marketing Engine</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {comparisonData.map((row) => (
                  <TableRow key={row.platform} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>{row.platform}</TableCell>
                    <TableCell align="center">{row.fee}</TableCell>
                    <TableCell align="center">{row.tracking === true ? <CheckIcon color="success" /> : row.tracking === false ? <ClearIcon color="error" /> : String(row.tracking)}</TableCell>
                    <TableCell align="center">{row.multiCharity ? <CheckIcon color="success" /> : <ClearIcon color="error" />}</TableCell>
                    <TableCell align="center">{row.anonymity === true ? <CheckIcon color="success" /> : row.anonymity === false ? <ClearIcon color="error" /> : String(row.anonymity)}</TableCell>
                    <TableCell align="center">{row.marketing ? <CheckIcon color="success" /> : <ClearIcon color="error" />}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </SectionPaper>

        <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
          <Grid item xs={12} md={6}>
            <SectionPaper elevation={3} sx={{ height: '100%' }}>
              <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                MVP Goals
              </Typography>
              <List dense>
                {mvpGoals.map((goal, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemIcon sx={{minWidth: '32px'}}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: alpha(theme.palette.success.main, 0.8), fontSize: '0.8rem' }}>
                        <CheckIcon sx={{fontSize: '1rem'}}/>
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText primary={goal} />
                  </ListItem>
                ))}
              </List>
            </SectionPaper>
          </Grid>

          <Grid item xs={12} md={6}>
            <SectionPaper elevation={3} sx={{ height: '100%' }}>
              <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                Built on Aptos
              </Typography>
              <List>
                {builtOnAptos.map((item) => (
                  <ListItem key={item.title} disablePadding sx={{mb: 1.5}}>
                    <ListItemIcon sx={{minWidth: '48px'}}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.light, 0.2), color: 'primary.main' }}>
                        {item.icon}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText primaryTypographyProps={{fontWeight:'medium'}} primary={item.title} />
                  </ListItem>
                ))}
              </List>
            </SectionPaper>
          </Grid>
        </Grid>

      </Container>
    </Box>
  );
};

export default AboutPage; 