import React, { useState, useContext, useEffect } from 'react';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    CssBaseline, 
    ThemeProvider, 
    createTheme, 
    Button, 
    Box,
    styled
} from '@mui/material';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AppContext } from './AppProvider';

// Helper function to convert Uint8Array to Hex String
const toHexString = (byteArray) => {
    if (!byteArray) return null;
    return Array.from(byteArray, byte => {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
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
    [theme.breakpoints.down("sm")]: {
        width: '90%',
        padding: '6px 15px'
    }
}));

const theme = createTheme({
    palette: {
        primary: {
            main: '#D1C4E9', 
        },
        background: {
            default: '#D1C4E9',
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
        h6: {
            fontWeight: 600,
        },
    },
});

const Navbar = () => {
    const info = useContext(AppContext);
    const { connect, disconnect, account, connected, wallets } = useWallet();
    const [buttonLabel, setButtonLabel] = useState('Connect');

    // console.log("Available wallets:", wallets.map(w => ({name: w.name, readyState: w.readyState, icon: w.icon, url: w.url}) ));

    const getDisplayAddress = (acc) => {
        if (!acc) return null;
        // console.log("getDisplayAddress: input account object:", JSON.stringify(acc, null, 2));

        let rawAddressField = acc.address;

        // Case 1: acc.address is already a string (ideal)
        if (typeof rawAddressField === 'string' && rawAddressField.startsWith('0x')) {
            console.log("getDisplayAddress: acc.address is a valid string:", rawAddressField);
            return rawAddressField;
        }

        // Case 2: acc.address is an object like { data: Uint8Array }
        // This is what the logs indicate Petra returns via the adapter.
        if (typeof rawAddressField === 'object' && rawAddressField !== null && rawAddressField.data instanceof Uint8Array) {
            console.log("getDisplayAddress: acc.address is an object with Uint8Array data.");
            let hexAddress = toHexString(rawAddressField.data);
            if (hexAddress) {
                if (!hexAddress.startsWith('0x')) {
                    hexAddress = '0x' + hexAddress;
                }
                console.log("getDisplayAddress: Derived address from acc.address.data:", hexAddress);
                // Basic validation for Aptos address format (0x + 64 hex chars)
                if (/^0x[0-9a-fA-F]{64}$/.test(hexAddress)) {
                    return hexAddress;
                }
                console.warn("getDisplayAddress: Hex string from acc.address.data does not look like a valid Aptos address:", hexAddress);
            }
        }
        
        // Fallback/Logging for other unexpected structures if any
        if (typeof rawAddressField === 'string') { // Was a string, but not starting with 0x or failed validation
             console.warn("getDisplayAddress: acc.address was a string but not a valid format:", rawAddressField);
        }
        console.error("getDisplayAddress: Could not determine a valid address string from account object. Account:", JSON.stringify(acc, null, 2));
        return null;
    };

    const handleConnectButton = async () => {
        console.log("Attempting to connect wallet...");
        if (!connected) {
            try {
                const petraWallet = wallets.find(
                    w => w.name.toLowerCase().includes('petra')
                );

                if (petraWallet) {
                    console.log(`Petra wallet found: ${petraWallet.name}. Attempting to connect...`);
                    await connect(petraWallet.name);
                } else {
                    alert("Petra wallet is not detected. Please ensure it's installed and enabled.");
                    setButtonLabel("Connect");
                    info.setWalletAddress(null);
                    console.warn("Petra wallet not found in the list of available wallets.");
                    return;
                }
                
                console.log("Connection attempt finished. Current 'connected' state from hook:", connected);
                console.log("Current 'account' object from hook after connect attempt:", account ? JSON.stringify(account, null, 2) : null);

                const displayAddr = getDisplayAddress(account);
                console.log("Wallet address (displayAddr) based on hook state after connect attempt:", displayAddr);

                if (displayAddr && typeof displayAddr === 'string' && displayAddr.length > 7) {
                    const profile = displayAddr.substring(0, 4) + "..." + displayAddr.substring(displayAddr.length - 4);
                    setButtonLabel(profile);
                    info.setWalletAddress(displayAddr);
                    console.log("Wallet connected with Petra. Profile:", profile, "Address stored in context:", displayAddr);
                } else {
                    console.error("Petra connection attempt finished, but a valid address string could not be determined. Account object:", account ? JSON.stringify(account, null, 2) : null, "Connected state:", connected);
                    if (connected && !displayAddr) {
                        console.log("Wallet adapter is in 'connected' state, but no usable address was retrieved from the Petra account object.");
                    }
                    setButtonLabel("Connect");
                    info.setWalletAddress(null);
                    alert("Failed to get address after connecting with Petra. Please try again.");
                }
            } catch (e) {
                console.error("Error connecting wallet:", e);
                alert(`Error connecting wallet: ${e.message || e}`);
                setButtonLabel("Connect");
                info.setWalletAddress(null);
            }
        } else {
            console.log("Disconnecting wallet...");
            try {
                await disconnect();
                setButtonLabel("Connect");
                info.setWalletAddress(null);
                console.log("Wallet disconnected.");
            } catch (e) {
                console.error("Error disconnecting wallet:", e);
                alert(`Error disconnecting wallet: ${e.message || e}`);
            }
        }
    };

    useEffect(() => {
        // Only log wallets once on initial load or when wallets array actually changes.
        // This console.log was moved from top level to avoid excessive logging on every render.
        if (wallets && wallets.length > 0) {
            // console.log("Available wallets (useEffect check):", wallets.map(w => ({name: w.name, readyState: w.readyState}) ));
        }

        const displayAddr = getDisplayAddress(account);
        if (connected && displayAddr && typeof displayAddr === 'string' && displayAddr.length > 7) {
            const profile = displayAddr.substring(0, 4) + "..." + displayAddr.substring(displayAddr.length - 4);
            setButtonLabel(profile);
            info.setWalletAddress(displayAddr);
            console.log("Wallet state updated via useEffect. Connected with address:", displayAddr);
        } else {
            setButtonLabel("Connect");
            info.setWalletAddress(null);
            if (connected && !displayAddr) {
                console.warn("useEffect: Wallet connected but no valid display address found in account object.", account ? JSON.stringify(account, null, 2) : null);
            }
        }
    }, [connected, account, info, setButtonLabel, wallets]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppBar component="nav" position="sticky" sx={{ backgroundColor: '#D1C4E9', color: '#060f5e' }} elevation={0}>
                <StyledToolbar>
                    <NavbarContainer>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                            }}
                        >
                            <Typography 
                                variant="h6" 
                                component={Link}
                                to="/"
                                sx={{
                                    textDecoration: 'none',
                                    color: '#7E57C2',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    transition: 'transform 0.3s ease',
                                    '&:hover': { color: '#6A4BA1' },
                                }}>
                                <img src={logo} alt="logo" style={{ width: "30px", height: "30px", borderRadius: '50%', marginRight: '10px' }} />
                                Eunoia
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '16px',
                            }}
                        >
                            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: '10px' }}>
                                <Button
                                    component={Link}
                                    to="/"
                                    sx={{
                                        color: '#7E57C2',
                                        fontWeight: 'bold',
                                        '&:hover': { color: '#6A4BA1' },
                                    }}
                                >
                                    Home
                                </Button>
                                <Button
                                    component={Link}
                                    to="/donate"
                                    sx={{
                                        color: '#7E57C2',
                                        fontWeight: 'bold',
                                        '&:hover': { color: '#6A4BA1' },
                                    }}
                                >
                                    Donate
                                </Button>
                            </Box>
                            
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
                                    {connected && buttonLabel !== 'Connect' ? buttonLabel : "Connect"} 
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
