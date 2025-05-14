import React, { useState, useContext, useEffect, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Button,
  Box,
  styled,
} from '@mui/material';
import logo from '../assets/logo.jpg';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { AppContext } from './AppProvider';

const toHexString = (byteArray) => {
  if (!byteArray) return null;
  return Array.from(byteArray, (byte) => ('0' + (byte & 0xff).toString(16)).slice(-2)).join('');
};

const StyledToolbar = styled(Toolbar)({
  display: 'flex',
  justifyContent: 'center',
});

const NavbarContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '80%',
  backgroundColor: 'white',
  borderRadius: '30px',
  padding: '8px 20px',
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  [theme.breakpoints.down('sm')]: {
    width: '90%',
    padding: '6px 15px',
  },
}));

const theme = createTheme({
  palette: {
    primary: { main: '#D1C4E9' },
    background: { default: '#D1C4E9' },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h6: { fontWeight: 600 },
  },
});

const Navbar = () => {
  const info = useContext(AppContext);
  const { connect, disconnect, account, connected, wallets } = useWallet();
  const [buttonLabel, setButtonLabel] = useState('Connect');

  const getDisplayAddress = (acc) => {
    if (!acc) return null;
    let rawAddressField = acc.address;

    if (typeof rawAddressField === 'string' && rawAddressField.startsWith('0x')) {
      return rawAddressField;
    }

    if (
      typeof rawAddressField === 'object' &&
      rawAddressField !== null &&
      rawAddressField.data instanceof Uint8Array
    ) {
      let hexAddress = toHexString(rawAddressField.data);
      if (hexAddress) {
        if (!hexAddress.startsWith('0x')) hexAddress = '0x' + hexAddress;
        if (/^0x[0-9a-fA-F]{64}$/.test(hexAddress)) return hexAddress;
      }
    }

    return null;
  };

  const fetchAddressWithRetry = useCallback(
    async (retries = 3, delay = 500) => {
      for (let i = 0; i < retries; i++) {
        if (account) {
          const displayAddr = getDisplayAddress(account);
          if (displayAddr && typeof displayAddr === 'string' && displayAddr.length > 7) {
            const profile = `${displayAddr.substring(0, 4)}...${displayAddr.substring(displayAddr.length - 4)}`;
            setButtonLabel(profile);
            info.setWalletAddress(displayAddr);
            return true;
          }
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
      return false;
    },
    [account, info]
  );

  const handleConnectButton = async () => {
    if (!connected) {
      try {
        const petraWallet = wallets.find((w) => w.name.toLowerCase().includes('petra'));
        if (!petraWallet) {
          alert('Petra wallet is not detected. Please install the Petra wallet extension.');
          setButtonLabel('Connect');
          info.setWalletAddress(null);
          return;
        }
        if (petraWallet.readyState !== 'Installed') {
          alert('Petra wallet is not ready. Please ensure it is installed and enabled.');
          setButtonLabel('Connect');
          info.setWalletAddress(null);
          return;
        }
        setButtonLabel('Connecting...');
        await connect(petraWallet.name);
      } catch (e) {
        alert(`Error connecting wallet: ${e.message || 'Unknown error'}`);
        setButtonLabel('Connect');
        info.setWalletAddress(null);
      }
    } else {
      try {
        await disconnect();
        setButtonLabel('Connect');
        info.setWalletAddress(null);
      } catch (e) {
        alert(`Error disconnecting wallet: ${e.message || 'Unknown error'}`);
      }
    }
  };

  useEffect(() => {
    if (connected && account) {
      const displayAddr = getDisplayAddress(account);
      if (displayAddr && typeof displayAddr === 'string' && displayAddr.length > 7) {
        const profile = `${displayAddr.substring(0, 4)}...${displayAddr.substring(displayAddr.length - 4)}`;
        setButtonLabel(profile);
        info.setWalletAddress(displayAddr);
      } else {
        fetchAddressWithRetry();
      }
    } else {
      setButtonLabel('Connect');
      info.setWalletAddress(null);
    }
  }, [connected, account, info, fetchAddressWithRetry]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar component="nav" position="sticky" sx={{ backgroundColor: '#D1C4E9', color: '#060f5e' }} elevation={0}>
        <StyledToolbar>
          <NavbarContainer>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Typography
                variant="h6"
                sx={{
                  textDecoration: 'none',
                  color: '#7E57C2',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'transform 0.3s ease',
                  '&:hover': { color: '#6A4BA1' },
                }}
              >
                <img
                  src={logo}
                  alt="logo"
                  style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }}
                />
                Eunoia
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#7E57C2',
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: '30px',
                    padding: '10px 20px',
                    '&:hover': { backgroundColor: '#6A4BA1' },
                  }}
                  onClick={handleConnectButton}
                >
                  {buttonLabel}
                </Button>
              </Box>
            </Box>
          </NavbarContainer>
        </StyledToolbar>
      </AppBar>
    </ThemeProvider>
  );
};

export default Navbar;
