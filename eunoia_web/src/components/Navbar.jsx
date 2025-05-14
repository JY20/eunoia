import React, { useState, useContext } from 'react';
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

    const handleConnectButton = async () => {
        if (!connected) {
            try {
                await connect();
                const addr = account?.address || "";
                const profile = addr.substring(0, 4) + "..." + addr.substring(addr.length - 4);
                setButtonLabel(profile);
                info.setWalletAddress(addr);
            } catch (e) {
                console.error(e);
            }
        } else {
            await disconnect();
            setButtonLabel("Connect");
            info.setWalletAddress(null);
        }
    };

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
