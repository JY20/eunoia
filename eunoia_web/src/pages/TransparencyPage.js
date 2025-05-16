import React, { useState, useEffect } from 'react';
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
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { AptosClient, TxnBuilderTypes, HexString } from 'aptos';

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
const client = new AptosClient('https://fullnode.testnet.aptoslabs.com/v1');

// Use the correct deployed module address for Testnet
const MODULE_ADDRESS = '0x3940277b22c1fe2c8631bdce9dbcf020c3b8240a5417fa13ac21d37860f88011';
const MODULE_NAME = 'eunoia_foundation'; // Module name from your contract

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
  padding: theme.spacing(3),
  backgroundColor: color,
  color: 'white',
  borderRadius: '16px',
  minWidth: 180,
  textAlign: 'center',
  boxShadow: `0 8px 16px ${alpha(color, 0.3)}`,
  transition: 'all 0.3s ease',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 12px 20px ${alpha(color, 0.4)}`,
  },
  zIndex: 1
}));

const FlowArrow = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  animation: 'flow 2s infinite',
  '@keyframes flow': {
    '0%': { transform: 'translateX(-5px)' },
    '50%': { transform: 'translateX(5px)' },
    '100%': { transform: 'translateX(-5px)' },
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
        How Donations Flow
      </Typography>
      <Box sx={{ 
        position: 'relative',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: { xs: 2, md: 4 },
        backgroundColor: alpha(theme.palette.background.default, 0.7),
        borderRadius: 4,
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.03)',
        overflow: 'auto',
        mb: 3
      }}>
        {/* Background gradient line */}
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          transform: 'translateY(-50%)',
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
          <ArrowForwardIcon sx={{ fontSize: 32, color: theme.palette.text.primary }} />
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
          <ArrowForwardIcon sx={{ fontSize: 32, color: theme.palette.text.primary }} />
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
  const { account } = useWallet();
  const theme = useTheme();

  useEffect(() => {
    fetchDonations();
  }, [account]); // Refetch when account changes

  // Call smart contract's get_donation_history function
  const getDonationHistory = async () => {
    try {
      if (!account || !account.address) {
        console.log("No wallet connected, cannot fetch donation history");
        return [];
      }

      console.log(`Calling get_donation_history for address: ${account.address}`);
      
      // Create payload for calling the get_donation_history function
      const payload = {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_donation_history`,
        type_arguments: [],
        arguments: [account.address] // Pass the donor address
      };
      
      // Call the view function
      const response = await client.view(payload);
      console.log("Smart contract get_donation_history response:", response);
      
      if (response && Array.isArray(response[0])) {
        const historyData = response[0];
        
        // Transform the data to match our donations format
        const transformedData = historyData.map(item => ({
          to: item.charity_name,
          amount: `${item.amount} ${item.coin_name || 'USDC'}`,
          txHash: item.transaction_id,
          timestamp: new Date(parseInt(item.timestamp, 10) * 1000).toLocaleString(),
          donor: account.address, // Use connected wallet address
          rawAmount: parseInt(item.amount, 10)
        }));
        
        return transformedData;
      }
      
      return [];
    } catch (error) {
      console.error("Error calling get_donation_history from smart contract:", error);
      return [];
    }
  };

  const fetchDonations = async () => {
    try {
      setLoading(true);
      
      // Try to get history from smart contract for connected wallet
      const donationHistory = await getDonationHistory();
      
      if (donationHistory.length > 0) {
        console.log(`Found ${donationHistory.length} donations from smart contract get_donation_history`);
        
        // Calculate stats
        const uniqueCharities = new Set(donationHistory.map(d => d.to)).size;
        const totalAmount = donationHistory.reduce((sum, d) => sum + (d.rawAmount || 0), 0);
        
        setStats({
          totalDonations: donationHistory.length,
          totalAmount,
          uniqueCharities
        });

        // Sort by timestamp (newest first)
        setDonations(donationHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        setLastUpdated(new Date());
        setLoading(false);
        return;
      }
      
      // If no wallet is connected or no donation history, show a message
      if (!account || !account.address) {
        console.log("No wallet connected - showing empty state");
        setDonations([]);
        setStats({
          totalDonations: 0,
          totalAmount: 0,
          uniqueCharities: 0
        });
        setLoading(false);
        return;
      }
      
      // Fallback to event fetching if no data from get_donation_history
      console.log("No data from get_donation_history, falling back to event fetching");
      const donateEventStructFQN = `${MODULE_ADDRESS}::${MODULE_NAME}::DonateEvent`;
      const NODE_URL = 'https://fullnode.testnet.aptoslabs.com/v1';

      const mapEventToDonation = event => ({
        to: event.data.charity_name,
        amount: `${event.data.amount} ${event.data.coin_name}`,
        txHash: event.transaction_version,
        timestamp: new Date(parseInt(event.data.timestamp, 10) * 1000).toLocaleString(),
        donor: event.data.donor_address,
        rawAmount: parseInt(event.data.amount, 10)
      });

      let foundDonations = [];

      const fetchEventsForCreationNumber = async (creationNumStr) => {
        const url = `${NODE_URL}/accounts/${MODULE_ADDRESS}/events/${creationNumStr}?limit=100`;
        console.log(`Fetching events directly from API: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
          const errorBody = await response.text();
          console.error(`Error fetching events for creation number ${creationNumStr}: ${response.status} ${response.statusText}`, errorBody);
          throw new Error(`Failed to fetch events for creation ${creationNumStr}: ${errorBody}`);
        }
        const events = await response.json();
        console.log(`Received ${events.length} events from API for creation_number ${creationNumStr}.`);
        
        // Filter events by the connected wallet address if available
        return events
          .filter(event => event.type === donateEventStructFQN)
          .filter(event => !account || !account.address || event.data.donor_address === account.address)
          .map(mapEventToDonation);
      };

      // Try creation_number "0"
      try {
        const donationsFrom0 = await fetchEventsForCreationNumber("0");
        foundDonations.push(...donationsFrom0);
        if (donationsFrom0.length > 0) {
            console.log(`Found ${donationsFrom0.length} DonateEvents with creation_number 0 from API.`);
        }
      } catch (error) {
        console.warn("Failed to fetch or process events from creation_number 0 (API)", error);
      }
      
      // Try creation_number "1" regardless of success/failure of "0"
      try {
        const donationsFrom1 = await fetchEventsForCreationNumber("1");
        foundDonations.push(...donationsFrom1);
        if (donationsFrom1.length > 0) {
            console.log(`Found ${donationsFrom1.length} DonateEvents with creation_number 1 from API.`);
        }
      } catch (error) {
        console.warn("Failed to fetch or process events from creation_number 1 (API)", error);
      }

      if (foundDonations.length > 0) {
        // Calculate stats
        const uniqueCharities = new Set(foundDonations.map(d => d.to)).size;
        const totalAmount = foundDonations.reduce((sum, d) => sum + (d.rawAmount || 0), 0);
        
        setStats({
          totalDonations: foundDonations.length,
          totalAmount,
          uniqueCharities
        });

        // Sort by timestamp (newest first)
        setDonations(foundDonations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        setLastUpdated(new Date());
      } else {
        console.warn("No DonateEvents found for this module on creation_numbers 0 or 1 using direct API call.");
        setDonations([]);
      }

    } catch (error) {
      console.error('Error in fetchDonations:', error);
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTransaction = (txHash) => {
    window.open(`https://explorer.aptoslabs.com/txn/${txHash}`, '_blank');
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
            Donation Tracking
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
                    Total Value (USDC)
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
              Recent Transactions
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
              <Typography color="text.secondary">Loading latest donation data...</Typography>
            </Box>
          ) : !account || !account.address ? (
            <GlassCard>
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Please connect your wallet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Connect your wallet to view your donation history
                </Typography>
              </Box>
            </GlassCard>
          ) : donations.length === 0 ? (
            <GlassCard>
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No donation history found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You haven't made any donations yet with this wallet
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