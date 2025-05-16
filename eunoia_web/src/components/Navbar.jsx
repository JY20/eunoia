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
    Container,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Avatar,
    Divider,
    Chip,
    Menu,
    MenuItem,
    alpha,
    useMediaQuery,
    Stack,
    Tooltip,
    CircularProgress
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ListItemIcon from '@mui/material/ListItemIcon';
import HomeIcon from '@mui/icons-material/Home';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import InfoIcon from '@mui/icons-material/Info';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import logo from '../assets/logo.jpg';
import aptosLogo from '../assets/aptos.png';
import polkadotLogo from '../assets/polkadot.png';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AppContext, CHAINS } from './AppProvider';

// Try to import Polkadot extension - will handle if the package isn't installed
let web3Accounts, web3Enable, web3FromSource;
try {
    // Import Polkadot.js extension API
    const polkadotExtension = require('@polkadot/extension-dapp');
    web3Accounts = polkadotExtension.web3Accounts;
    web3Enable = polkadotExtension.web3Enable;
    web3FromSource = polkadotExtension.web3FromSource;
} catch (error) {
    console.warn("Polkadot.js extension packages not found. Using mock implementation.");
    // Mock implementations if packages aren't available
    web3Accounts = async () => [];
    web3Enable = async () => [];
    web3FromSource = async () => null;
}

// Helper function to convert Uint8Array to Hex String
const toHexString = (byteArray) => {
    if (!byteArray) return null;
    return Array.from(byteArray, byte => {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
};

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 2),
    [theme.breakpoints.up('md')]: {
        padding: theme.spacing(0, 3),
    },
}));

const NavLink = styled(Button)(({ theme, active }) => ({
    color: active ? theme.palette.primary.dark : theme.palette.text.primary,
    fontWeight: active ? 700 : 500,
    marginRight: theme.spacing(2),
    position: 'relative',
    '&::after': {
        content: '""',
        position: 'absolute',
        width: active ? '100%' : '0%',
        height: '3px',
        bottom: '2px',
        left: '0',
        backgroundColor: theme.palette.primary.main,
        transition: 'width 0.3s',
        borderRadius: '10px',
    },
    '&:hover::after': {
        width: '100%',
    },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    gap: theme.spacing(1),
}));

const WalletButton = styled(Button)(({ theme, connected }) => ({
    padding: theme.spacing(1, 2.5),
    borderRadius: '50px',
    fontWeight: 'bold',
    boxShadow: connected ? 'none' : '0 4px 14px 0 rgba(114, 9, 183, 0.2)',
    background: connected 
        ? alpha(theme.palette.primary.main, 0.1)
        : 'linear-gradient(90deg, #7209b7 0%, #3f37c9 100%)',
    color: connected ? theme.palette.primary.main : '#fff',
    border: connected ? `2px solid ${theme.palette.primary.main}` : 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
        boxShadow: connected ? 'none' : '0 6px 20px 0 rgba(114, 9, 183, 0.3)',
        background: connected 
            ? alpha(theme.palette.primary.main, 0.15)
            : 'linear-gradient(90deg, #7209b7 20%, #3f37c9 100%)',
    },
}));

const ChainIndicator = styled(Box)(({ theme, activeChain }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: theme.spacing(0.5, 1.5),
    borderRadius: '50px',
    marginRight: theme.spacing(1),
    backgroundColor: alpha(
        activeChain === CHAINS.APTOS 
            ? theme.palette.primary.main 
            : theme.palette.secondary.main, 
        0.1
    ),
    border: `1px solid ${
        activeChain === CHAINS.APTOS 
            ? theme.palette.primary.main 
            : theme.palette.secondary.main
    }`,
    fontSize: '0.75rem',
    fontWeight: 'bold',
    color: activeChain === CHAINS.APTOS 
        ? theme.palette.primary.main 
        : theme.palette.secondary.main,
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: alpha(
            activeChain === CHAINS.APTOS 
                ? theme.palette.primary.main 
                : theme.palette.secondary.main, 
            0.15
        ),
    }
}));

const ChainLogo = styled('img')({
    width: 20,
    height: 20,
    marginRight: 6,
    objectFit: 'contain',
});

// Create a custom theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#7209b7',
            light: '#9d4edd',
            dark: '#560bad',
        },
        secondary: {
            main: '#4cc9f0',
        },
        background: {
            default: '#f8f9fa',
            paper: '#ffffff',
        },
        text: {
            primary: '#2b2d42',
            secondary: '#555b6e',
        },
    },
    typography: {
        fontFamily: '"Poppins", "Roboto", "Arial", sans-serif',
        h1: {
            fontWeight: 800,
        },
        h2: {
            fontWeight: 700,
        },
        h3: {
            fontWeight: 700,
        },
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
        button: {
            fontWeight: 600,
            textTransform: 'none',
        },
    },
    shape: {
        borderRadius: 12,
    },
    shadows: [
        'none',
        '0px 2px 1px -1px rgba(0,0,0,0.08),0px 1px 1px 0px rgba(0,0,0,0.05),0px 1px 3px 0px rgba(0,0,0,0.04)',
        '0px 3px 1px -2px rgba(0,0,0,0.08),0px 2px 2px 0px rgba(0,0,0,0.05),0px 1px 5px 0px rgba(0,0,0,0.04)',
        '0px 3px 3px -2px rgba(0,0,0,0.08),0px 3px 4px 0px rgba(0,0,0,0.05),0px 1px 8px 0px rgba(0,0,0,0.04)',
        '0px 2px 4px -1px rgba(0,0,0,0.08),0px 4px 5px 0px rgba(0,0,0,0.05),0px 1px 10px 0px rgba(0,0,0,0.04)',
        '0px 3px 5px -1px rgba(0,0,0,0.08),0px 5px 8px 0px rgba(0,0,0,0.05),0px 1px 14px 0px rgba(0,0,0,0.04)',
        '0px 3px 5px -1px rgba(0,0,0,0.08),0px 6px 10px 0px rgba(0,0,0,0.05),0px 1px 18px 0px rgba(0,0,0,0.04)',
        '0px 4px 5px -2px rgba(0,0,0,0.08),0px 7px 10px 1px rgba(0,0,0,0.05),0px 2px 16px 1px rgba(0,0,0,0.04)',
        '0px 5px 5px -3px rgba(0,0,0,0.08),0px 8px 10px 1px rgba(0,0,0,0.05),0px 3px 14px 2px rgba(0,0,0,0.04)',
        '0px 5px 6px -3px rgba(0,0,0,0.08),0px 9px 12px 1px rgba(0,0,0,0.05),0px 3px 16px 2px rgba(0,0,0,0.04)',
        '0px 6px 6px -3px rgba(0,0,0,0.08),0px 10px 14px 1px rgba(0,0,0,0.05),0px 4px 18px 3px rgba(0,0,0,0.04)',
        '0px 6px 7px -4px rgba(0,0,0,0.08),0px 11px 15px 1px rgba(0,0,0,0.05),0px 4px 20px 3px rgba(0,0,0,0.04)',
        '0px 7px 8px -4px rgba(0,0,0,0.08),0px 12px 17px 2px rgba(0,0,0,0.05),0px 5px 22px 4px rgba(0,0,0,0.04)',
        '0px 7px 8px -4px rgba(0,0,0,0.08),0px 13px 19px 2px rgba(0,0,0,0.05),0px 5px 24px 4px rgba(0,0,0,0.04)',
        '0px 7px 9px -4px rgba(0,0,0,0.08),0px 14px 21px 2px rgba(0,0,0,0.05),0px 5px 26px 4px rgba(0,0,0,0.04)',
        '0px 8px 9px -5px rgba(0,0,0,0.08),0px 15px 22px 2px rgba(0,0,0,0.05),0px 6px 28px 5px rgba(0,0,0,0.04)',
        '0px 8px 10px -5px rgba(0,0,0,0.08),0px 16px 24px 2px rgba(0,0,0,0.05),0px 6px 30px 5px rgba(0,0,0,0.04)',
        '0px 8px 11px -5px rgba(0,0,0,0.08),0px 17px 26px 2px rgba(0,0,0,0.05),0px 6px 32px 5px rgba(0,0,0,0.04)',
        '0px 9px 11px -5px rgba(0,0,0,0.08),0px 18px 28px 2px rgba(0,0,0,0.05),0px 7px 34px 6px rgba(0,0,0,0.04)',
        '0px 9px 12px -6px rgba(0,0,0,0.08),0px 19px 29px 2px rgba(0,0,0,0.05),0px 7px 36px 6px rgba(0,0,0,0.04)',
        '0px 10px 13px -6px rgba(0,0,0,0.08),0px 20px 31px 3px rgba(0,0,0,0.05),0px 8px 38px 7px rgba(0,0,0,0.04)',
        '0px 10px 13px -6px rgba(0,0,0,0.08),0px 21px 33px 3px rgba(0,0,0,0.05),0px 8px 40px 7px rgba(0,0,0,0.04)',
        '0px 10px 14px -6px rgba(0,0,0,0.08),0px 22px 35px 3px rgba(0,0,0,0.05),0px 8px 42px 7px rgba(0,0,0,0.04)',
        '0px 11px 14px -7px rgba(0,0,0,0.08),0px 23px 36px 3px rgba(0,0,0,0.05),0px 9px 44px 8px rgba(0,0,0,0.04)',
        '0px 11px 15px -7px rgba(0,0,0,0.08),0px 24px 38px 3px rgba(0,0,0,0.05),0px 9px 46px 8px rgba(0,0,0,0.04)',
    ],
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                },
            },
        },
    },
});

const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [accountMenuAnchor, setAccountMenuAnchor] = useState(null);
    const [chainsMenuAnchor, setChainsMenuAnchor] = useState(null);
    const location = useLocation();
    const { walletAddress, setWalletAddress, activeChain, setActiveChain } = useContext(AppContext);
    const { connect, disconnect, account, connected, wallets } = useWallet();
    const [buttonLabel, setButtonLabel] = useState('Connect Wallet');
    const [polkadotConnected, setPolkadotConnected] = useState(false);
    const [polkadotAddress, setPolkadotAddress] = useState(null);

    // Define chain logos mapping
    const chainLogos = {
        [CHAINS.APTOS]: aptosLogo,
        [CHAINS.POLKADOT]: polkadotLogo
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleAccountMenuOpen = (event) => {
        setAccountMenuAnchor(event.currentTarget);
    };

    const handleAccountMenuClose = () => {
        setAccountMenuAnchor(null);
    };

    const handleChainsMenuOpen = (event) => {
        setChainsMenuAnchor(event.currentTarget);
    };
    
    const handleChainsMenuClose = () => {
        setChainsMenuAnchor(null);
    };

    const handleSwitchChain = (chain) => {
        setActiveChain(chain);
        handleChainsMenuClose();
        
        // Reset connection state when switching chains
        if (chain === CHAINS.POLKADOT && connected) {
            disconnect().catch(console.error);
        } else if (chain === CHAINS.APTOS && polkadotConnected) {
            // Disconnect Polkadot if we had a connection
            setPolkadotConnected(false);
            setPolkadotAddress(null);
            setWalletAddress(null);
        }
        
        // Auto-connect to the selected wallet if possible
        if (chain === CHAINS.APTOS && !connected && wallets.length > 0) {
            const petraWallet = wallets.find((w) => w.name.toLowerCase().includes('petra'));
            if (petraWallet && petraWallet.readyState === 'Installed') {
                setTimeout(() => {
                    connect(petraWallet.name).catch(console.error);
                }, 500);
            }
        } else if (chain === CHAINS.POLKADOT && !polkadotConnected) {
            // Attempt to connect to Polkadot wallet
            setTimeout(() => {
                connectToPolkadot().catch(console.error);
            }, 500);
        }
    };

    const connectToPolkadot = async () => {
        try {
            setButtonLabel('Connecting...');
            
            // Enable Polkadot.js extensions
            const extensions = await web3Enable('Eunoia Donation Platform');
            
            // Check if SubWallet is available
            const subWalletExtension = extensions.find(ext => 
                ext.name.toLowerCase().includes('subwallet') || 
                ext.name.toLowerCase().includes('sub wallet')
            );
            
            if (!subWalletExtension && extensions.length === 0) {
                console.warn('No Polkadot wallet extensions found.');
                setButtonLabel('Connect');
                return false;
            }
            
            // Get accounts from extension
            const allAccounts = await web3Accounts();
            
            if (allAccounts.length === 0) {
                console.warn('No accounts found in Polkadot wallet.');
                setButtonLabel('Connect');
                return false;
            }
            
            // Use the first account
            const account = allAccounts[0];
            const address = account.address;
            const shortAddress = `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
            
            setPolkadotConnected(true);
            setPolkadotAddress(address);
            setButtonLabel(shortAddress);
            setWalletAddress(address);
            console.log('Connected to Polkadot wallet with address:', address);
            
            // Store polkadot address in localStorage for reference by other components
            localStorage.setItem('polkadotAddress', address);
            
            return true;
        } catch (e) {
            console.error('Failed to connect to Polkadot wallet:', e);
            setButtonLabel('Connect');
            return false;
        }
    };

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
                setWalletAddress(displayAddr);
                return true;
            }
            }
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
        return false;
        },
        [account, setWalletAddress]
    );

    const handleConnectButton = async () => {
        if (activeChain === CHAINS.APTOS) {
            if (!connected) {
                try {
                    const petraWallet = wallets.find((w) => w.name.toLowerCase().includes('petra'));
                    if (!petraWallet) {
                        alert('Petra wallet is not detected. Please install the Petra wallet extension.');
                        setButtonLabel('Connect');
                        setWalletAddress(null);
                        return;
                    }
                    if (petraWallet.readyState !== 'Installed') {
                        alert('Petra wallet is not ready. Please ensure it is installed and enabled.');
                        setButtonLabel('Connect');
                        setWalletAddress(null);
                        return;
                    }
                    setButtonLabel('Connecting...');
                    await connect(petraWallet.name);
                } catch (e) {
                    alert(`Error connecting wallet: ${e.message || 'Unknown error'}`);
                    setButtonLabel('Connect');
                    setWalletAddress(null);
                }
            } else {
                handleAccountMenuOpen(window.event);
            }
        } else if (activeChain === CHAINS.POLKADOT) {
            if (!polkadotConnected) {
                await connectToPolkadot();
            } else {
                handleAccountMenuOpen(window.event);
            }
        }
    };

    const handleDisconnect = async () => {
        console.log("Disconnecting wallet...");
        try {
            if (activeChain === CHAINS.APTOS && connected) {
                await disconnect();
                setButtonLabel("Connect Wallet");
                setWalletAddress(null);
                console.log("Aptos wallet disconnected");
            } else if (activeChain === CHAINS.POLKADOT && polkadotConnected) {
                // For Polkadot, we just clear the state since there's no explicit disconnect method
                setPolkadotConnected(false);
                setPolkadotAddress(null);
                setButtonLabel("Connect Wallet");
                setWalletAddress(null);
                localStorage.removeItem('polkadotAddress');
                console.log("Polkadot wallet disconnected");
            }
            handleAccountMenuClose();
        } catch (e) {
            console.error("Error disconnecting wallet:", e);
            alert(`Error disconnecting wallet: ${e.message || e}`);
        }
    };

    // Get the correct button label based on chain and connection status
    const getButtonDisplayLabel = () => {
        if (activeChain === CHAINS.APTOS) {
            return connected ? buttonLabel : "Connect Wallet";
        } else if (activeChain === CHAINS.POLKADOT) {
            return polkadotConnected ? buttonLabel : "Connect Wallet";
        }
        return "Connect Wallet";
    };

    // Check if connected based on active chain
    const isConnected = () => {
        return (activeChain === CHAINS.APTOS && connected) || 
               (activeChain === CHAINS.POLKADOT && polkadotConnected);
    };

    useEffect(() => {
        if (wallets && wallets.length > 0) {
            // console.log("Available wallets (useEffect check):", wallets.map(w => ({name: w.name, readyState: w.readyState}) ));
        }

        const displayAddr = getDisplayAddress(account);
        if (connected && displayAddr && typeof displayAddr === 'string' && displayAddr.length > 7) {
            const profile = displayAddr.substring(0, 4) + "..." + displayAddr.substring(displayAddr.length - 4);
            setButtonLabel(profile);
            setWalletAddress(displayAddr);
            console.log("Wallet state updated via useEffect. Connected with address:", displayAddr);
        } else if (activeChain === CHAINS.APTOS) {
            setButtonLabel("Connect Wallet");
            if (!connected) {
                setWalletAddress(null);
            }
            if (connected && !displayAddr) {
                console.warn("useEffect: Wallet connected but no valid display address found in account object.", account ? JSON.stringify(account, null, 2) : null);
            }
        }
    }, [connected, account, setWalletAddress, wallets, activeChain]);

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', p: 2 }}>
            <LogoContainer component={Link} to="/" sx={{ justifyContent: 'center', mb: 2 }}>
                <Avatar src={logo} alt="Eunoia Logo" sx={{ width: 40, height: 40 }} />
                <Typography variant="h6" fontWeight="bold" color="primary">
                    Eunoia
                </Typography>
            </LogoContainer>
            <Divider sx={{ my: 2 }} />
            <List>
                <ListItem button component={Link} to="/">
                    <ListItemIcon>
                        <HomeIcon color={location.pathname === '/' ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Home" primaryTypographyProps={{ 
                        fontWeight: location.pathname === '/' ? 700 : 400,
                        color: location.pathname === '/' ? 'primary' : 'inherit'
                    }} />
                </ListItem>
                <ListItem button component={Link} to="/charities">
                    <ListItemIcon>
                        <VolunteerActivismIcon color={location.pathname === '/charities' ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Charities" primaryTypographyProps={{ 
                        fontWeight: location.pathname === '/charities' ? 700 : 400,
                        color: location.pathname === '/charities' ? 'primary' : 'inherit'
                    }} />
                </ListItem>
                <ListItem button component={Link} to="/donate">
                    <ListItemIcon>
                        <VolunteerActivismIcon color={location.pathname === '/donate' ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Donate" primaryTypographyProps={{ 
                        fontWeight: location.pathname === '/donate' ? 700 : 400,
                        color: location.pathname === '/donate' ? 'primary' : 'inherit'
                    }} />
                </ListItem>
                <ListItem button component={Link} to="/register-charity">
                    <ListItemIcon>
                        <VolunteerActivismIcon color={location.pathname === '/register-charity' ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Register Charity" primaryTypographyProps={{ 
                        fontWeight: location.pathname === '/register-charity' ? 700 : 400,
                        color: location.pathname === '/register-charity' ? 'primary' : 'inherit'
                    }} />
                </ListItem>
                <ListItem button component={Link} to="/about">
                    <ListItemIcon>
                        <InfoIcon color={location.pathname === '/about' ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="About Us" primaryTypographyProps={{ 
                        fontWeight: location.pathname === '/about' ? 700 : 400,
                        color: location.pathname === '/about' ? 'primary' : 'inherit'
                    }} />
                </ListItem>
            </List>
            <Divider sx={{ my: 2 }} />
            <Box 
                sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    cursor: 'pointer',
                    p: 1,
                    mb: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    handleChainsMenuOpen(e);
                }}
            >
                <Stack direction="row" spacing={1} alignItems="center">
                    <ChainLogo 
                        src={chainLogos[activeChain]} 
                        alt={activeChain === CHAINS.APTOS ? 'Aptos Logo' : 'Polkadot Logo'} 
                        sx={{ width: 24, height: 24 }}
                    />
                    <Typography variant="body2" fontWeight="medium">
                        {activeChain === CHAINS.APTOS ? 'Aptos' : 'Polkadot'}
                    </Typography>
                    <SwapHorizIcon fontSize="small" />
                </Stack>
            </Box>
            <WalletButton
                fullWidth
                startIcon={<AccountBalanceWalletIcon />}
                onClick={handleConnectButton}
                connected={isConnected()}
            >
                {getButtonDisplayLabel()}
            </WalletButton>
        </Box>
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppBar 
                component="nav" 
                position="sticky" 
                sx={{ 
                    backgroundColor: 'background.paper', 
                    color: 'text.primary'
                }} 
                elevation={1}
            >
                <Container maxWidth="xl">
                    <StyledToolbar disableGutters>
                        <LogoContainer component={Link} to="/">
                            <Avatar src={logo} alt="Eunoia Logo" sx={{ width: 36, height: 36 }} />
                            <Typography 
                                variant="h6" 
                                component="div" 
                                sx={{ 
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(90deg, #7209b7 0%, #3f37c9 100%)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    display: { xs: 'none', sm: 'block' }
                                }}
                            >
                                Eunoia
                            </Typography>
                        </LogoContainer>

                        {/* Desktop Navigation */}
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                            <NavLink 
                                component={Link} 
                                to="/" 
                                disableRipple
                                active={location.pathname === '/' ? 1 : 0}
                            >
                                Home
                            </NavLink>
                            <NavLink 
                                component={Link} 
                                to="/charities" 
                                disableRipple
                                active={location.pathname === '/charities' ? 1 : 0}
                            >
                                Charities
                            </NavLink>
                            <NavLink 
                                component={Link} 
                                to="/donate" 
                                disableRipple
                                active={location.pathname === '/donate' ? 1 : 0}
                            >
                                Donate
                            </NavLink>
                            <NavLink 
                                component={Link} 
                                to="/register-charity" 
                                disableRipple
                                active={location.pathname === '/register-charity' ? 1 : 0}
                            >
                                Register Charity
                            </NavLink>
                            <NavLink 
                                component={Link} 
                                to="/transparency" 
                                disableRipple
                                active={location.pathname === '/transparency' ? 1 : 0}
                            >
                                Tracking
                            </NavLink>
                            <NavLink 
                                component={Link} 
                                to="/about" 
                                disableRipple
                                active={location.pathname === '/about' ? 1 : 0}
                            >
                                About Us
                            </NavLink>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Tooltip title="Switch blockchain">
                                <ChainIndicator 
                                    activeChain={activeChain}
                                    onClick={handleChainsMenuOpen}
                                >
                                    {activeChain === CHAINS.APTOS && (
                                        <>
                                            <ChainLogo src={chainLogos[CHAINS.APTOS]} alt="Aptos" />
                                            Aptos
                                        </>
                                    )}
                                    {activeChain === CHAINS.POLKADOT && (
                                        <>
                                            <ChainLogo src={chainLogos[CHAINS.POLKADOT]} alt="Polkadot" />
                                            Polkadot
                                        </>
                                    )}
                                    <SwapHorizIcon sx={{ ml: 0.5, fontSize: '1rem' }} />
                                </ChainIndicator>
                            </Tooltip>
                            
                            {isConnected() && (
                                <Chip 
                                    label="Connected" 
                                    size="small"
                                    color="success"
                                    sx={{ 
                                        mr: 2,
                                        display: { xs: 'none', sm: 'flex' }
                                    }}
                                />
                            )}
                            
                            <WalletButton
                                variant={isConnected() ? "outlined" : "contained"}
                                startIcon={<AccountBalanceWalletIcon />}
                                endIcon={isConnected() ? <KeyboardArrowDownIcon /> : null}
                                onClick={isConnected() ? handleAccountMenuOpen : handleConnectButton}
                                connected={isConnected()}
                                sx={{ display: { xs: 'none', sm: 'flex' } }}
                            >
                                {getButtonDisplayLabel()}
                            </WalletButton>

                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="end"
                                onClick={handleDrawerToggle}
                                sx={{ display: { md: 'none' } }}
                            >
                                <MenuIcon />
                            </IconButton>
                        </Box>
                    </StyledToolbar>
                </Container>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer
                anchor="right"
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
                }}
            >
                {drawer}
            </Drawer>

            {/* Chain Selection Menu */}
            <Menu
                anchorEl={chainsMenuAnchor}
                open={Boolean(chainsMenuAnchor)}
                onClose={handleChainsMenuClose}
                PaperProps={{
                    elevation: 3,
                    sx: { 
                        mt: 1.5, 
                        borderRadius: 2,
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)' 
                    }
                }}
            >
                <MenuItem 
                    onClick={() => handleSwitchChain(CHAINS.APTOS)}
                    selected={activeChain === CHAINS.APTOS}
                >
                    <Stack direction="row" spacing={1} alignItems="center">
                        <ChainLogo 
                            src={chainLogos[CHAINS.APTOS]} 
                            alt="Aptos Logo" 
                            sx={{ width: 24, height: 24 }}
                        />
                        <Typography>Aptos</Typography>
                    </Stack>
                </MenuItem>
                <MenuItem 
                    onClick={() => handleSwitchChain(CHAINS.POLKADOT)}
                    selected={activeChain === CHAINS.POLKADOT}
                >
                    <Stack direction="row" spacing={1} alignItems="center">
                        <ChainLogo 
                            src={chainLogos[CHAINS.POLKADOT]} 
                            alt="Polkadot Logo" 
                            sx={{ width: 24, height: 24 }}
                        />
                        <Typography>Polkadot</Typography>
                    </Stack>
                </MenuItem>
            </Menu>

            {/* Account Menu */}
            <Menu
                anchorEl={accountMenuAnchor}
                open={Boolean(accountMenuAnchor)}
                onClose={handleAccountMenuClose}
                PaperProps={{
                    elevation: 3,
                    sx: {
                        borderRadius: 2,
                        minWidth: 180,
                        p: 0.5,
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleAccountMenuClose}>
                    <ListItemIcon>
                        <AccountBalanceWalletIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                        primary={activeChain === CHAINS.APTOS ? "Aptos Wallet" : "Polkadot Wallet"} 
                        secondary={buttonLabel} 
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                    />
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleDisconnect}>
                    <ListItemIcon>
                        <ExitToAppIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText 
                        primary="Disconnect" 
                        primaryTypographyProps={{ 
                            variant: 'body2',
                            color: 'error'
                        }}
                    />
                </MenuItem>
            </Menu>
        </ThemeProvider>
    );
};

export default Navbar;
