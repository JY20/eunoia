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
import TelegramIcon from '@mui/icons-material/Telegram';
import GitHubIcon from '@mui/icons-material/GitHub';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import VpnLockIcon from '@mui/icons-material/VpnLock';
import SvgIcon from '@mui/material/SvgIcon';

// Custom X icon (formerly Twitter) component
const XIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M16.99 2H20.25l-6.722 7.695 7.94 10.306h-5.847l-4.847-6.323-5.55 6.323H2l7.167-8.193L1.53 2h5.974l4.367 5.768L16.99 2zm-1.387 15.053h1.644L7.09 3.887H5.327l10.276 13.166z" />
  </SvgIcon>
);

// Custom Discord icon component
const DiscordIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.03.02.06.03.09.02 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z"/>
  </SvgIcon>
);

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
                aria-label="X (Twitter)" 
                size="small"
                component={Link}
                href="https://x.com/eunoia_give"
                target="_blank"
                sx={{ 
                  color: theme.palette.primary.main,
                  '&:hover': { 
                    backgroundColor: 'rgba(114, 9, 183, 0.1)'
                  }
                }}
              >
                <XIcon fontSize="small" />
              </IconButton>
              <IconButton 
                aria-label="Telegram" 
                size="small"
                component={Link}
                href="https://t.me/+aDt6-_BdrTtjODMx"
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
                aria-label="Discord" 
                size="small"
                component={Link}
                href="https://discord.gg/CWYXFqyQe6"
                target="_blank"
                sx={{ 
                  color: theme.palette.primary.main,
                  '&:hover': { 
                    backgroundColor: 'rgba(114, 9, 183, 0.1)'
                  }
                }}
              >
                <DiscordIcon fontSize="small" />
              </IconButton>
              <IconButton 
                aria-label="GitHub" 
                size="small"
                component={Link}
                href="https://github.com/JY20/eunoia"
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
