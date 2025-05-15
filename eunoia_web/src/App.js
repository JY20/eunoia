import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import DonatePage from './pages/DonatePage';
import HomePage from './pages/HomePage';
import CharitiesPage from './pages/CharitiesPage';
import RegisterCharityPage from './pages/RegisterCharityPage';
import AboutPage from './pages/AboutPage';
import ManagementPage from './pages/ManagementPage';
import TransparencyPage from './pages/TransparencyPage';
import { AppProvider } from './components/AppProvider';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { WalletProvider } from './context/WalletContext';
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";

// Setup wallets for Aptos
const wallets = [new PetraWallet()];

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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AptosWalletAdapterProvider plugins={wallets} autoConnect={false}>
          <WalletProvider>
            <AppProvider>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar />
                <main style={{ flex: 1 }}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/donate" element={<DonatePage />} />
                    <Route path="/charities" element={<CharitiesPage />} />
                    <Route path="/register-charity" element={<RegisterCharityPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/management" element={<ManagementPage />} />
                    <Route path="/transparency" element={<TransparencyPage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </AppProvider>
          </WalletProvider>
        </AptosWalletAdapterProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
