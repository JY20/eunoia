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
import logo from '../assets/logo.jpg';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AppContext } from './AppProvider';

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

    console.log("Available wallets:", wallets);

    const handleConnectButton = async () => {
        console.log("Attempting to connect wallet...");
        if (!connected) {
            try {
                console.log("Available wallets for connection:", wallets.map(w => ({name: w.name, readyState: w.readyState, icon: w.icon, url: w.url}) ));

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
                console.log("Current 'account' object from hook after connect attempt:", account);

                const currentAccountState = account;
                const addr = currentAccountState?.address || "";
                console.log("Wallet address (addr) based on hook state after connect attempt:", addr);

                if (addr) {
                    const profile = addr.substring(0, 4) + "..." + addr.substring(addr.length - 4);
                    setButtonLabel(profile);
                    info.setWalletAddress(addr);
                    console.log("Wallet connected with Petra. Profile:", profile, "Address stored in context:", addr);
                } else {
                    console.error("Petra connection attempt finished, but address is still empty. Account object:", currentAccountState, "Connected state:", connected);
                    if (connected && !addr) {
                        console.log("Wallet adapter is in 'connected' state, but no address was retrieved from the Petra account object.");
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
        if (connected && account?.address) {
            const addr = account.address;
            const profile = addr.substring(0, 4) + "..." + addr.substring(addr.length - 4);
            setButtonLabel(profile);
            info.setWalletAddress(addr);
            console.log("Wallet state updated via useEffect. Connected with address:", addr);
        } else {
            setButtonLabel("Connect");
            info.setWalletAddress(null);
            if (connected && !account?.address) {
                console.log("Wallet connected but no address in account object via useEffect.");
            }
        }
    }, [connected, account, info, setButtonLabel]);

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
                                    {connected ? buttonLabel : "Connect"}
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
