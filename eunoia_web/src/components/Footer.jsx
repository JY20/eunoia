import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  Stack,
  List,
  ListItem,
  ListItemText,
  useTheme
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import TwitterIcon from '@mui/icons-material/Twitter';
import TelegramIcon from '@mui/icons-material/Telegram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import VpnLockIcon from '@mui/icons-material/VpnLock';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box component="footer" sx={{ 
      backgroundColor: '#f8f9fa', 
      pt: 6, 
      pb: 3, 
      borderTop: '1px solid #eee',
      mt: 'auto'
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo and description */}
          <Grid item xs={12} md={4} sx={{ mb: { xs: 4, md: 0 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
              <VolunteerActivismIcon 
                fontSize="large" 
                sx={{ 
                  color: theme.palette.primary.main
                }} 
              />
              <Typography variant="h5" component="div" fontWeight="bold" 
                sx={{ 
                  background: 'linear-gradient(90deg, #7209b7 0%, #3f37c9 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Eunoia
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: '300px' }}>
              A decentralized giving platform with radical transparency. Track your donations from wallet to impact with 0.20% fees.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton 
                aria-label="Twitter" 
                size="small"
                component={Link}
                href="https://twitter.com/eunoia"
                target="_blank"
                sx={{ 
                  color: theme.palette.primary.main,
                  '&:hover': { 
                    backgroundColor: 'rgba(114, 9, 183, 0.1)'
                  }
                }}
              >
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton 
                aria-label="Telegram" 
                size="small"
                component={Link}
                href="https://t.me/eunoia"
                target="_blank"
                sx={{ 
                  color: theme.palette.primary.main,
                  '&:hover': { 
                    backgroundColor: 'rgba(114, 9, 183, 0.1)'
                  }
                }}
              >
                <TelegramIcon fontSize="small" />
              </IconButton>
              <IconButton 
                aria-label="LinkedIn" 
                size="small"
                component={Link}
                href="https://linkedin.com/company/eunoia"
                target="_blank"
                sx={{ 
                  color: theme.palette.primary.main,
                  '&:hover': { 
                    backgroundColor: 'rgba(114, 9, 183, 0.1)'
                  }
                }}
              >
                <LinkedInIcon fontSize="small" />
              </IconButton>
              <IconButton 
                aria-label="GitHub" 
                size="small"
                component={Link}
                href="https://github.com/eunoia"
                target="_blank"
                sx={{ 
                  color: theme.palette.primary.main,
                  '&:hover': { 
                    backgroundColor: 'rgba(114, 9, 183, 0.1)'
                  }
                }}
              >
                <GitHubIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Grid>

          {/* Navigation Links */}
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
              Platform
            </Typography>
            <List dense disablePadding>
              <ListItem disableGutters disablePadding>
                <ListItemText 
                  primary={
                    <Link component={RouterLink} to="/" color="inherit" underline="hover">
                      Home
                    </Link>
                  }
                />
              </ListItem>
              <ListItem disableGutters disablePadding>
                <ListItemText 
                  primary={
                    <Link component={RouterLink} to="/charities" color="inherit" underline="hover">
                      Explore Charities
                    </Link>
                  }
                />
              </ListItem>
              <ListItem disableGutters disablePadding>
                <ListItemText 
                  primary={
                    <Link component={RouterLink} to="/donate" color="inherit" underline="hover">
                      Make a Donation
                    </Link>
                  }
                />
              </ListItem>
              <ListItem disableGutters disablePadding>
                <ListItemText 
                  primary={
                    <Link component={RouterLink} to="/register-charity" color="inherit" underline="hover">
                      Register Charity
                    </Link>
                  }
                />
              </ListItem>
            </List>
          </Grid>

          {/* Resources Links */}
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
              Resources
            </Typography>
            <List dense disablePadding>
              <ListItem disableGutters disablePadding>
                <ListItemText 
                  primary={
                    <Link component={RouterLink} to="/about" color="inherit" underline="hover">
                      About Us
                    </Link>
                  }
                />
              </ListItem>
              <ListItem disableGutters disablePadding>
                <ListItemText 
                  primary={
                    <Link href="https://docs.eunoia.org" target="_blank" color="inherit" underline="hover">
                      Documentation
                    </Link>
                  }
                />
              </ListItem>
              <ListItem disableGutters disablePadding>
                <ListItemText 
                  primary={
                    <Link component={RouterLink} to="/faq" color="inherit" underline="hover">
                      FAQ
                    </Link>
                  }
                />
              </ListItem>
              <ListItem disableGutters disablePadding>
                <ListItemText 
                  primary={
                    <Link component={RouterLink} to="/blog" color="inherit" underline="hover">
                      Blog
                    </Link>
                  }
                />
              </ListItem>
            </List>
          </Grid>

          {/* Extra Info */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
              Verified by
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <VpnLockIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2">
                Blockchain Verified Transactions
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              All donations are securely processed through the Aptos blockchain, ensuring transparent and immutable transaction records.
            </Typography>
            <Link href="https://aptos.dev" target="_blank" color="primary" underline="hover">
              Learn about Aptos blockchain
            </Link>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'center', sm: 'flex-start' } }}>
          <Typography variant="body2" color="text.secondary">
            &copy; {currentYear} Eunoia. All rights reserved.
          </Typography>
          <Stack 
            direction="row" 
            spacing={3} 
            sx={{ 
              mt: { xs: 2, sm: 0 },
            }}
          >
            <Link component={RouterLink} to="/privacy" color="text.secondary" underline="hover" variant="body2">
              Privacy Policy
            </Link>
            <Link component={RouterLink} to="/terms" color="text.secondary" underline="hover" variant="body2">
              Terms of Service
            </Link>
            <Link component={RouterLink} to="/contact" color="text.secondary" underline="hover" variant="body2">
              Contact
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
