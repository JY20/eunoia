import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  CircularProgress,
  Container,
  Grid,
  Card,
  Chip,
  Divider,
  Avatar,
  IconButton,
  alpha,
  useTheme,
  Stack,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AptosClient, TxnBuilderTypes, HexString } from 'aptos';
import { ApiPromise, WsProvider } from '@polkadot/api';
import axios from 'axios'; // Ensure axios is imported
import { API_BASE_URL as API_BASE_URL_TRANSPARENCY } from '../config';

// Context
import { AppContext, CHAINS } from '../components/AppProvider';

// Icons
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';

// Ensure this points to the TESTNET
const aptosClient = new AptosClient('https://fullnode.testnet.aptoslabs.com/v1');

// Chain-specific contract addresses
const CONTRACTS = {
  APTOS: {
    ADDRESS: '0x3940277b22c1fe2c8631bdce9dbcf020c3b8240a5417fa13ac21d37860f88011',
    MODULE: 'eunoia_foundation'
  },
  POLKADOT: {
    ADDRESS: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', // Placeholder contract address
    MODULE: 'eunoia' // Placeholder module name
  }
};

// Chain explorer URLs
const EXPLORERS = {
  APTOS: 'https://explorer.aptoslabs.com/txn', // Base URL for Aptos explorer
  POLKADOT: 'https://polkadot.subscan.io/extrinsic'
};

// Styled Components
const PageHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
  padding: theme.spacing(8, 0, 6),
  textAlign: 'center',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(6),
  borderRadius: '0 0 30px 30px',
  boxShadow: '0 10px 30px rgba(114, 9, 183, 0.2)',
}));

const HeaderPattern = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  background: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z" fill="%23ffffff" fill-opacity="0.05" fill-rule="evenodd"/%3E%3C/svg%3E")',
  zIndex: 0,
}));

const GlassCard = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.12)',
  },
}));

const FlowNode = styled(Box)(({ theme, color }) => ({
  position: 'relative',
  padding: theme.spacing(3, 4),
  backgroundColor: color,
  color: 'white',
  borderRadius: '16px',
  minWidth: 200,
  textAlign: 'center',
  boxShadow: `0 10px 20px ${alpha(color, 0.4)}`,
  transition: 'all 0.3s ease',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  border: '2px solid white',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 15px 25px ${alpha(color, 0.5)}`,
  },
  zIndex: 1
}));

const FlowArrow = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  padding: theme.spacing(1.5),
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
  animation: 'pulse-arrow 2s infinite',
  '& svg': {
    transform: 'rotate(0deg)', // Ensure arrow is not rotated
    color: theme.palette.primary.main,
    fontSize: 36
  },
  '@keyframes pulse-arrow': {
    '0%': { transform: 'translateX(-8px) scale(1)' },
    '50%': { transform: 'translateX(8px) scale(1.1)' },
    '100%': { transform: 'translateX(-8px) scale(1)' }
  }
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
  overflow: 'hidden',
  '& .MuiTableHead-root': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
  '& .MuiTableHead-root .MuiTableCell-head': {
    fontWeight: 'bold',
    color: theme.palette.primary.dark,
  },
  '& .MuiTableRow-root': {
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
  },
  '& .MuiTableCell-root': {
    padding: theme.spacing(2),
  },
}));

const ViewButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(114, 9, 183, 0.2)',
  },
}));

const AnimatedIcon = styled(Box)(({ theme, delay = 0 }) => ({
  animation: `pulse 2s ease-in-out ${delay}s infinite`,
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.1)' },
    '100%': { transform: 'scale(1)' },
  },
}));

const StatCard = styled(Box)(({ theme, color }) => ({
  padding: theme.spacing(2.5),
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: alpha(color, 0.1),
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 8px 24px ${alpha(color, 0.2)}`,
  }
}));

const FlowSection = () => {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3, fontFamily: "'Space Grotesk', sans-serif" }}>
        How the Flow Works
      </Typography>
      <Box sx={{ 
        position: 'relative',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: { xs: 3, md: 5 },
        backgroundColor: alpha(theme.palette.primary.main, 0.05),
        borderRadius: 4,
        border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        overflow: 'auto',
        mb: 4,
        minHeight: '180px'
      }}>
        {/* Background gradient line */}
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: '6px',
          background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          transform: 'translateY(-50%)',
          boxShadow: '0 0 15px rgba(114, 9, 183, 0.4)',
          borderRadius: '3px',
          zIndex: 0
        }} />
        
        {/* Donor Node */}
        <FlowNode color={theme.palette.primary.main}>
          <AnimatedIcon delay={0}>
            <VolunteerActivismIcon sx={{ fontSize: 40, mb: 1 }} />
          </AnimatedIcon>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Giver</Typography>
          <Typography variant="body2">Initiates Transfer</Typography>
        </FlowNode>
        
        {/* Custom arrow with animation */}
        <FlowArrow>
          <ArrowForwardIcon />
        </FlowArrow>
        
        {/* Platform Node */}
        <FlowNode color={theme.palette.primary.main}>
          <AnimatedIcon delay={0.5}>
            <AccountBalanceIcon sx={{ fontSize: 40, mb: 1 }} />
          </AnimatedIcon>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Eunoia</Typography>
          <Typography variant="body2">Processes & Routes</Typography>
        </FlowNode>
        
        {/* Custom arrow with animation */}
        <FlowArrow>
          <ArrowForwardIcon />
        </FlowArrow>
        
        {/* Charity Node */}
        <FlowNode color={theme.palette.primary.main}>
          <AnimatedIcon delay={1}>
            <MonetizationOnIcon sx={{ fontSize: 40, mb: 1 }} />
          </AnimatedIcon>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Charity</Typography>
          <Typography variant="body2">Receives Funds</Typography>
        </FlowNode>
      </Box>
      
      {/* Platform fee badge */}
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        mt: 2
      }}>
        <Chip 
          icon={<VerifiedUserIcon />}
          label="Platform Fee: Only 0.2%" 
          color="secondary"
          sx={{ 
          p: 2,
          borderRadius: '50px',
            boxShadow: '0 4px 12px rgba(76, 201, 240, 0.3)',
            fontSize: '1rem',
            fontWeight: 'medium',
            '& .MuiChip-icon': {
              fontSize: '1.2rem'
            }
          }}
        />
      </Box>
    </Box>
  );
};

const TransparencyPage = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    uniqueCharities: 0
  });
  const theme = useTheme();
  
  // Get the active chain from the app context
  const { activeChain } = useContext(AppContext);
  const [polkadotApi, setPolkadotApi] = useState(null);
  
  // REMOVE Polkadot API initialization if not used for other purposes on this page
  // useEffect(() => {
  //   const setupPolkadotApi = async () => {
  //     if (activeChain === CHAINS.POLKADOT) { // And if polkadotApi is actually needed elsewhere
  //       try {
  //         const wsProvider = new WsProvider('wss://rpc.polkadot.io');
  //         const api = await ApiPromise.create({ provider: wsProvider });
  //         setPolkadotApi(api);
  //         console.log('Polkadot API initialized');
  //       } catch (error) {
  //         console.error('Failed to initialize Polkadot API:', error);
  //       }
  //     }
  //   };
    
  //   setupPolkadotApi();
    
  //   return () => {
  //     if (polkadotApi) {
  //       polkadotApi.disconnect();
  //     }
  //   };
  // }, [activeChain, polkadotApi]); // Dependency on polkadotApi itself can cause loop if not careful

  useEffect(() => {
    console.log(`Transparency Page active chain: ${activeChain}`);
    fetchDonations();
  }, [activeChain]); // Refetch when chain changes if you want to show chain-specific elements, but main data is global now
  
  // REMOVE: getDonationHistory, getAptosHistory, getPolkadotHistory, fetchAptosEvents
  // These are replaced by a direct backend call in fetchDonations

  const fetchDonations = async () => {
    try {
      setLoading(true);
      console.log("Fetching all donations from backend...");
      const response = await axios.get(`${API_BASE_URL_TRANSPARENCY}/donation-transactions/`);
      // Correctly access the 'results' array from the response
      const backendDonationsResults = response.data && response.data.results ? response.data.results : [];

      if (backendDonationsResults.length > 0) {
        console.log(`Found ${backendDonationsResults.length} donations from backend.`);
        
        const transformedData = backendDonationsResults.map(d => ({
          to: d.charity_name,
          amount: `${parseFloat(d.amount).toFixed(4)} ${d.currency}`, // Format amount
          txHash: d.transaction_hash,
          timestamp: new Date(d.timestamp).toLocaleString(),
          donor: d.donor_address,
          rawAmount: parseFloat(d.amount),
          // Keep chain for potential future use, though explorer link is now fixed
          chain: d.blockchain === 'APT' ? CHAINS.APTOS : d.blockchain === 'POL' ? CHAINS.POLKADOT : d.blockchain.toLowerCase(),
          status: d.status,
          charityWallet: d.charity_wallet_address
        }));      

        const successfulDonations = transformedData.filter(d => d.status === 'success');
        const uniqueCharities = new Set(successfulDonations.map(d => d.to)).size;
        const totalAmount = successfulDonations.reduce((sum, d) => sum + d.rawAmount, 0);
        
        setStats({
          totalDonations: successfulDonations.length,
          totalAmount: parseFloat(totalAmount.toFixed(4)),
          uniqueCharities
        });

        setDonations(successfulDonations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      } else {
        console.log("No donations found from backend or 'results' field is missing/empty.");
        setDonations([]);
        setStats({ totalDonations: 0, totalAmount: 0, uniqueCharities: 0 });
      }
    } catch (error) {
      console.error('Error fetching donations from backend:', error.response ? error.response.data : error.message);
      setDonations([]);
      setStats({ totalDonations: 0, totalAmount: 0, uniqueCharities: 0 });
    } finally {
      setLoading(false);
      setLastUpdated(new Date()); // Update last updated time regardless of outcome
    }
  };

  const handleViewTransaction = (txHash) => {
    // Always use Aptos testnet explorer
    window.open(`${EXPLORERS.APTOS}/${txHash}?network=testnet`, '_blank');
  };

  const handleRefresh = () => {
    fetchDonations();
  };

  // Function to truncate addresses/hashes for display
  const truncateAddress = (address, start = 6, end = 4) => {
    if (!address) return '';
    if (address.length <= start + end) return address;
    return `${address.slice(0, start)}...${address.slice(-end)}`;
  };

  // Chain-specific messaging for UI
  // const getWalletMessage = () => {
  //   if (activeChain === CHAINS.APTOS) {
  //     return "Connect your Aptos wallet to view your donation history";
  //   } else if (activeChain === CHAINS.POLKADOT) {
  //     return "Connect your Polkadot wallet to view your donation history";
  //   }
  //   return "Connect your wallet to view your donation history";
  // };
  
  // Determine the primary currency for display in the stats, or use a general term
  const primaryCurrencyForStats = activeChain === CHAINS.POLKADOT ? 'DOT' : 'APT/USDC'; 

  return (
    <Box sx={{ minHeight: '100vh', pb: 8, bgcolor: 'background.default' }}>
      <PageHeader>
        <HeaderPattern />
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            fontWeight="bold" 
            gutterBottom
            sx={{ 
              fontFamily: "'Space Grotesk', sans-serif",
              position: 'relative',
              zIndex: 1
            }}
          >
            Tracking
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              maxWidth: '800px', 
              mx: 'auto', 
              mb: 4,
              opacity: 0.9,
              position: 'relative',
              zIndex: 1
            }}
          >
            Complete transparency on the blockchain. Track every donation and see the impact in real-time.
          </Typography>
          <Grid container spacing={3} justifyContent="center" sx={{ position: 'relative', zIndex: 1 }}>
            <Grid item xs={12} sm={4}>
              <StatCard color={theme.palette.primary.main}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 56, height: 56, mr: 2 }}>
                  <ReceiptLongIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h3" fontWeight="bold" color="white" sx={{ textShadow: '0 0 10px rgba(0,0,0,0.3)' }}>
                    {stats.totalDonations || 0}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="medium" color="white">
                    Total Donations
                  </Typography>
                </Box>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard color={theme.palette.primary.main}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 56, height: 56, mr: 2 }}>
                  <AccountBalanceIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h3" fontWeight="bold" color="white" sx={{ textShadow: '0 0 10px rgba(0,0,0,0.3)' }}>
                    {stats.uniqueCharities || 0}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="medium" color="white">
                    Charities Funded
                  </Typography>
                </Box>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard color={theme.palette.primary.main}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 56, height: 56, mr: 2 }}>
                  <MonetizationOnIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h3" fontWeight="bold" color="white" sx={{ textShadow: '0 0 10px rgba(0,0,0,0.3)' }}>
                    {stats.totalAmount || 0}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="medium" color="white">
                    Total Value ({primaryCurrencyForStats})
                  </Typography>
                </Box>
              </StatCard>
            </Grid>
          </Grid>
        </Container>
      </PageHeader>

      <Container maxWidth="lg">
      <FlowSection />
      
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
              All Donation History
              <Chip 
                label={activeChain === CHAINS.POLKADOT ? 'Polkadot' : 'Aptos'} 
                color={activeChain === CHAINS.POLKADOT ? 'secondary' : 'primary'}
                size="small"
                sx={{ ml: 2, textTransform: 'capitalize' }}
              />
            </Typography>
            <Box>
              {lastUpdated && (
                <Typography variant="caption" color="text.secondary" sx={{ mr: 2, display: 'inline-flex', alignItems: 'center' }}>
                  <ScheduleIcon fontSize="small" sx={{ mr: 0.5 }} />
                  Last updated: {lastUpdated.toLocaleTimeString()}
      </Typography>
              )}
              <Tooltip title="Refresh data">
                <IconButton 
                  onClick={handleRefresh} 
                  disabled={loading}
                  color="primary"
                  sx={{ 
                    '&:hover': { 
                      bgcolor: alpha(theme.palette.primary.main, 0.1) 
                    },
                    animation: loading ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
      {loading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: 300,
              flexDirection: 'column',
              gap: 2
            }}>
              <CircularProgress size={60} thickness={4} />
              <Typography color="text.secondary">Loading donation history...</Typography>
            </Box>
          ) : donations.length === 0 ? (
            <GlassCard>
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No donation history found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  There are currently no recorded donations on the platform.
                </Typography>
        </Box>
            </GlassCard>
      ) : (
            <StyledTableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>To Charity</TableCell>
                <TableCell>Amount</TableCell>
                    <TableCell>From</TableCell>
                <TableCell>Time</TableCell>
                    <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {donations.map((donation, index) => (
                <TableRow key={index}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <AccountBalanceIcon color="primary" />
                          <Typography fontWeight="medium">{donation.to}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={<MonetizationOnIcon />} 
                          label={donation.amount}
                          variant="outlined"
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {truncateAddress(donation.donor)}
                          </Typography>
                        </Stack>
                      </TableCell>
                  <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <ScheduleIcon fontSize="small" color="action" />
                          <Typography variant="body2">{donation.timestamp}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <ViewButton
                      variant="contained"
                      color="primary"
                          size="small"
                          onClick={() => handleViewTransaction(donation.txHash)}
                          endIcon={<OpenInNewIcon />}
                    >
                          View on Explorer
                        </ViewButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            </StyledTableContainer>
      )}
        </Box>
      </Container>
    </Box>
  );
};

export default TransparencyPage; 