import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress } from '@mui/material';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { AptosClient } from 'aptos';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const client = new AptosClient('https://fullnode.mainnet.aptoslabs.com/v1');

const MODULE_ADDRESS = '0xeunoia'; // 替换为实际的合约地址
const MODULE_NAME = 'eunoia_foundation';

const FlowSection = () => {
  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h4" gutterBottom>
        Donation Flow
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: 2,
        flexWrap: 'wrap',
        p: 3,
        backgroundColor: '#f8f9fa',
        borderRadius: 2
      }}>
        <Box sx={{ 
          p: 3, 
          backgroundColor: '#4caf50', 
          color: 'white',
          borderRadius: 2,
          minWidth: 200,
          textAlign: 'center'
        }}>
          <Typography variant="h6" gutterBottom>Donor</Typography>
          <Typography variant="body2">Sends APT</Typography>
        </Box>
        
        <ArrowForwardIcon sx={{ color: '#666' }} />
        
        <Box sx={{ 
          p: 3, 
          backgroundColor: '#2196f3', 
          color: 'white',
          borderRadius: 2,
          minWidth: 200,
          textAlign: 'center'
        }}>
          <Typography variant="h6" gutterBottom>Eunoia Platform</Typography>
          <Typography variant="body2">Processes & Distributes</Typography>
        </Box>
        
        <ArrowForwardIcon sx={{ color: '#666' }} />
        
        <Box sx={{ 
          p: 3, 
          backgroundColor: '#ff9800', 
          color: 'white',
          borderRadius: 2,
          minWidth: 200,
          textAlign: 'center'
        }}>
          <Typography variant="h6" gutterBottom>Charity</Typography>
          <Typography variant="body2">Receives 98%</Typography>
        </Box>
      </Box>
      
      <Box sx={{ 
        mt: 2, 
        p: 2, 
        backgroundColor: '#9c27b0', 
        color: 'white',
        borderRadius: 2,
        maxWidth: 200,
        mx: 'auto',
        textAlign: 'center'
      }}>
        <Typography variant="body2">Platform Fee: 2%</Typography>
      </Box>
    </Box>
  );
};

const TransparencyPage = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { account } = useWallet();

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await client.getEventsByEventHandle(
        MODULE_ADDRESS,
        `${MODULE_NAME}::ContractData`,
        'DonateEvent',
        { limit: 10 }
      );

      const formattedDonations = response.map(event => ({
        to: event.data.charity_name,
        amount: `${event.data.amount} ${event.data.coin_name}`,
        txHash: event.transaction_version,
        timestamp: new Date(event.data.timestamp * 1000).toLocaleString()
      }));

      setDonations(formattedDonations);
    } catch (error) {
      console.error('Error fetching donations:', error);
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
        Recent Donations
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
                <TableCell>Time</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {donations.map((donation, index) => (
                <TableRow key={index}>
                  <TableCell>{donation.to}</TableCell>
                  <TableCell>{donation.amount}</TableCell>
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