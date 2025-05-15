import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress } from '@mui/material';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { AptosClient, TxnBuilderTypes, HexString } from 'aptos'; // AccountAddress is part of TxnBuilderTypes
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Ensure this points to the TESTNET
const client = new AptosClient('https://fullnode.testnet.aptoslabs.com/v1');

// Use the correct deployed module address for Testnet
const MODULE_ADDRESS = '0x3940277b22c1fe2c8631bdce9dbcf020c3b8240a5417fa13ac21d37860f88011';
const MODULE_NAME = 'eunoia_foundation'; // Module name from your contract

const FlowSection = () => {
  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h4" gutterBottom>
        Flow
      </Typography>
      <Box sx={{ 
        position: 'relative',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 4,
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRadius: 4,
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.03)',
        overflow: 'hidden',
        mb: 3
      }}>
        {/* Background gradient line */}
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, rgba(76,175,80,0.6) 0%, rgba(33,150,243,0.6) 50%, rgba(255,152,0,0.6) 100%)',
          transform: 'translateY(-50%)',
          zIndex: 0
        }} />
        
        {/* Donor Node */}
        <Box sx={{ 
          position: 'relative',
          p: 3, 
          backgroundColor: '#4caf50', 
          color: 'white',
          borderRadius: '16px',
          minWidth: 180,
          textAlign: 'center',
          boxShadow: '0 8px 16px rgba(76,175,80,0.3)',
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 20px rgba(76,175,80,0.4)',
          },
          zIndex: 1
        }}>
          <Typography variant="h6" gutterBottom>Giver</Typography>
          <Typography variant="body2">Initiates Transfer</Typography>
        </Box>
        
        {/* Custom arrow with animation */}
        <Box sx={{ 
          position: 'relative',
          zIndex: 1,
          animation: 'flow 2s infinite',
          '@keyframes flow': {
            '0%': { transform: 'translateX(-5px)' },
            '50%': { transform: 'translateX(5px)' },
            '100%': { transform: 'translateX(-5px)' },
          }
        }}>
          <ArrowForwardIcon sx={{ fontSize: 32, color: '#333' }} />
        </Box>
        
        {/* Platform Node */}
        <Box sx={{ 
          position: 'relative',
          p: 3, 
          backgroundColor: '#2196f3', 
          color: 'white',
          borderRadius: '16px',
          minWidth: 180,
          textAlign: 'center',
          boxShadow: '0 8px 16px rgba(33,150,243,0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 20px rgba(33,150,243,0.4)',
          },
          zIndex: 1
        }}>
          <Typography variant="h6" gutterBottom>Eunoia</Typography>
          <Typography variant="body2">Processes & Routes</Typography>
        </Box>
        
        {/* Custom arrow with animation */}
        <Box sx={{ 
          position: 'relative',
          zIndex: 1,
          animation: 'flow 2s infinite',
          '@keyframes flow': {
            '0%': { transform: 'translateX(-5px)' },
            '50%': { transform: 'translateX(5px)' },
            '100%': { transform: 'translateX(-5px)' },
          }
        }}>
          <ArrowForwardIcon sx={{ fontSize: 32, color: '#333' }} />
        </Box>
        
        {/* Charity Node */}
        <Box sx={{ 
          position: 'relative',
          p: 3, 
          backgroundColor: '#ff9800', 
          color: 'white',
          borderRadius: '16px',
          minWidth: 180,
          textAlign: 'center',
          boxShadow: '0 8px 16px rgba(255,152,0,0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 20px rgba(255,152,0,0.4)',
          },
          zIndex: 1
        }}>
          <Typography variant="h6" gutterBottom>Charity</Typography>
          <Typography variant="body2">Receives Funds</Typography>
        </Box>
      </Box>
      
      {/* Platform fee badge */}
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        mt: 2
      }}>
        <Box sx={{ 
          p: 2,
          px: 3,
          backgroundColor: 'rgba(156,39,176,0.9)', 
          color: 'white',
          borderRadius: '50px',
          boxShadow: '0 4px 12px rgba(156,39,176,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 6px 16px rgba(156,39,176,0.4)',
          }
        }}>
          <Typography variant="body1" fontWeight="medium">Platform Fee: 0.2%</Typography>
        </Box>
      </Box>
    </Box>
  );
};

const TransparencyPage = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { account } = useWallet(); // Kept for potential other uses

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const donateEventStructFQN = `${MODULE_ADDRESS}::${MODULE_NAME}::DonateEvent`;
      const NODE_URL = 'https://fullnode.testnet.aptoslabs.com/v1'; // Make sure this is the correct Testnet V1 URL

      const mapEventToDonation = event => ({
        to: event.data.charity_name,
        amount: `${event.data.amount} ${event.data.coin_name}`,
        txHash: event.transaction_version, // This was event.transaction_version, ensure it's correct from direct API resp
        timestamp: new Date(parseInt(event.data.timestamp, 10) * 1000).toLocaleString(),
        donor: event.data.donor_address
      });

      let foundDonations = [];

      // Helper to fetch and process events for a given creation number
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
        return events
          .filter(event => event.type === donateEventStructFQN)
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
        setDonations(foundDonations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))); // Optional: sort by timestamp
      } else {
        console.warn("No DonateEvents found for this module on creation_numbers 0 or 1 using direct API call.");
        setDonations([]); // Set to empty if no donations found from either stream
      }

    } catch (error) {
      // This catch is for errors in the overall fetchDonations logic, not individual fetches unless rethrown
      console.error('Error in fetchDonations (API method):', error);
      setDonations([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleViewTransaction = (txHash) => {
    window.open(`https://explorer.aptoslabs.com/txn/${txHash}`, '_blank');
  };

  return (
    <Box sx={{ p: 4 }}>
      <FlowSection />
      
      <Typography variant="h4" gutterBottom>
        Recent Transactions
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>To Charity</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>From Donor</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {donations.map((donation, index) => (
                <TableRow key={index}>
                  <TableCell>{donation.to}</TableCell>
                  <TableCell>{donation.amount}</TableCell>
                  <TableCell>{donation.donor}</TableCell>
                  <TableCell>{donation.timestamp}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleViewTransaction(donation.txHash)}
                    >
                      View Transaction
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default TransparencyPage; 