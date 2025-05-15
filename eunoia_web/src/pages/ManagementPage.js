import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Alert,
  Divider,
  Stack
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddToDriveIcon from '@mui/icons-material/AddToDrive'; // Placeholder for register icon
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'; // For initialize button
import axios from 'axios';
import { AppContext } from '../components/AppProvider';

const API_BASE_URL = 'http://localhost:8000/api';
const MODULE_ADDRESS = "0x3940277b22c1fe2c8631bdce9dbcf020c3b8240a5417fa13ac21d37860f88011";
const MODULE_NAME = "eunoia_foundation";
const ADD_CHARITY_FUNCTION_NAME = "add_charity";
const INITIALIZE_FUNCTION_NAME = "initialize_module";

const ManagementPage = () => {
  const { walletAddress } = useContext(AppContext) || {};
  const [charities, setCharities] = useState([]);
  const [loadingCharities, setLoadingCharities] = useState(false);
  const [loadingStates, setLoadingStates] = useState({}); // To track loading per charity
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessages, setSuccessMessages] = useState({});
  const [initSuccess, setInitSuccess] = useState(null);

  const moduleOwnerAddress = MODULE_ADDRESS;

  useEffect(() => {
    const fetchCharities = async () => {
      setLoadingCharities(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/charities/`);
        setCharities(response.data.results || response.data || []);
      } catch (err) {
        console.error("Error fetching charities:", err);
        setError("Failed to load charities from the backend. Please ensure the backend server is running.");
        setCharities([]);
      }
      setLoadingCharities(false);
    };

    fetchCharities();
  }, []);

  const handleInitializeModule = async () => {
    if (!walletAddress || walletAddress.toLowerCase() !== moduleOwnerAddress.toLowerCase()) {
      setError("Only the module owner can initialize the contract.");
      return;
    }
    setInitializing(true);
    setError(null);
    setInitSuccess(null);

    const payload = {
      type: "entry_function_payload",
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::${INITIALIZE_FUNCTION_NAME}`,
      type_arguments: [],
      arguments: [], // initialize_module takes the signer as implicit first arg, no explicit args
    };

    try {
      console.log("Submitting initialize_module transaction with payload:", JSON.stringify(payload, null, 2));
      const pendingTransaction = await window.aptos.signAndSubmitTransaction({ payload });
      console.log("Initialize module transaction submitted:", pendingTransaction);
      setInitSuccess(`Contract initialization submitted! TxHash: ${pendingTransaction.hash}. Please wait a few moments for it to be confirmed on-chain before adding charities.`);
    } catch (err) {
      console.error("Error initializing module:", err);
      let detailedError = "An error occurred during initialization.";
      if (typeof err === 'string') detailedError = err;
      else if (err.message) detailedError = err.message;
      
      if (detailedError.includes("E_ALREADY_INITIALIZED") || (err.data?.vm_status && err.data.vm_status.includes("E_ALREADY_INITIALIZED"))) {
        detailedError = "Contract module is already initialized.";
        setInitSuccess(detailedError); // Treat as success for UI flow
      } else if (detailedError.toLowerCase().includes("user rejected") || detailedError.toLowerCase().includes("declined") || (err.code && err.code === 4001)) {
        detailedError = "Initialization transaction rejected by user in wallet.";
      }
      setError(`Failed to initialize contract module. ${detailedError}`);
    } finally {
      setInitializing(false);
    }
  };

  const handleRegisterCharity = async (charity) => {
    if (!walletAddress || walletAddress.toLowerCase() !== moduleOwnerAddress.toLowerCase()) {
      setError("Please connect as the module owner to register charities.");
      return;
    }

    setLoadingStates(prev => ({ ...prev, [charity.id]: true }));
    setError(null);
    setSuccessMessages(prev => ({...prev, [charity.id]: null}));

    const charityName = charity.name;
    let charityWallet = charity.aptos_wallet_address;

    if (!charityName || !charityWallet) {
        setError(`Charity '${charity.name}' is missing a name or Aptos wallet address.`);
        setLoadingStates(prev => ({ ...prev, [charity.id]: false }));
        return;
    }
    
    // Ensure wallet address has 0x prefix, Aptos SDK might handle it but good practice for payload.
    if (!charityWallet.startsWith('0x')) {
        charityWallet = '0x' + charityWallet;
    }

    const payload = {
      type: "entry_function_payload",
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::${ADD_CHARITY_FUNCTION_NAME}`,
      type_arguments: [],
      arguments: [
        charityName,        // charity_name: String
        charityWallet,      // charity_wallet_addr: address
      ],
    };

    try {
      console.log("Submitting add_charity transaction with payload:", JSON.stringify(payload, null, 2));
      const pendingTransaction = await window.aptos.signAndSubmitTransaction({ payload });
      console.log("Add charity transaction submitted:", pendingTransaction);
      setSuccessMessages(prev => ({...prev, [charity.id]: `Charity '${charityName}' registration submitted! TxHash: ${pendingTransaction.hash}`}));
    } catch (err) {
      console.error(`Error registering charity '${charityName}':`, err);
      let detailedError = "An error occurred during the transaction.";
      if (typeof err === 'string') detailedError = err;
      else if (err.message) detailedError = err.message;
      
      if (detailedError.includes("E_CHARITY_ALREADY_EXISTS")) {
        detailedError = `Charity '${charityName}' is already registered on the blockchain.`;
      } else if (detailedError.includes("E_MODULE_NOT_INITIALIZED")) {
        detailedError = "The smart contract module has not been initialized. The module owner must call 'initialize_module' first (see button above).";
      } else if (detailedError.toLowerCase().includes("user rejected") || detailedError.toLowerCase().includes("declined")) {
        detailedError = "Transaction rejected by user in wallet.";
      }
      setError(`Failed to register charity '${charityName}'. ${detailedError}`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [charity.id]: false }));
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: '16px' }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" textAlign="center">
          Charity Management
        </Typography>
        <Divider sx={{ my: 2 }} />

        {!walletAddress ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Please connect your Aptos wallet to manage charities. 
            Only the module owner ({moduleOwnerAddress}) can perform management actions.
          </Alert>
        ) : (
          <Alert severity={walletAddress.toLowerCase() === moduleOwnerAddress.toLowerCase() ? "success" : "error"} sx={{ mb: 2 }}>
            Connected as: {walletAddress} <br />
            {walletAddress.toLowerCase() === moduleOwnerAddress.toLowerCase()
              ? "You are connected as the module owner."
              : `Warning: You are NOT connected as the module owner (${moduleOwnerAddress}). You will not be able to perform management actions.`}
          </Alert>
        )}

        <Box sx={{ border: '1px solid', borderColor: 'primary.main', borderRadius: 2, p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Contract Initialization</Typography>
          <Typography variant="body2" sx={{mb:1}}>
            This must be done ONCE by the module owner (<code>{moduleOwnerAddress}</code>) after deploying the contract.
            It sets up the necessary storage for the contract to operate.
          </Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleInitializeModule}
            disabled={initializing || !walletAddress || walletAddress.toLowerCase() !== moduleOwnerAddress.toLowerCase()}
            startIcon={initializing ? <CircularProgress size={20} color="inherit" /> : <RocketLaunchIcon />}
          >
            Initialize Contract Module
          </Button>
          {initSuccess && (
            <Alert severity="success" sx={{mt: 2}}>{initSuccess}</Alert>
          )}
        </Box>

        {error && (
          <Alert severity="error" onClose={() => {setError(null); /* Clear initSuccess if error is shown for other actions */ if (!error.toLowerCase().includes('initializ')) setInitSuccess(null);}} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="h6" gutterBottom>Register Charities On-Chain</Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Important for Registering Charities:</strong>
          <ul>
            <li>Ensure the contract module is initialized (use the button above if needed).</li>
            <li>Registering a charity will submit a transaction and incur gas fees.</li>
          </ul>
        </Alert>

        {loadingCharities ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        ) : charities.length === 0 && !error ? (
            <Typography sx={{my: 2}}>No charities found in the database.</Typography>
        ) : (
          <List>
            {charities.map((charity) => (
              <React.Fragment key={charity.id}>
                <ListItem 
                    secondaryAction={
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={loadingStates[charity.id] ? <CircularProgress size={20} color="inherit" /> : <AddToDriveIcon />}
                      onClick={() => handleRegisterCharity(charity)}
                      disabled={loadingStates[charity.id] || initializing || !walletAddress || walletAddress.toLowerCase() !== moduleOwnerAddress.toLowerCase()}
                    >
                      Register On-Chain
                    </Button>
                  }
                >
                  <ListItemIcon>
                    {successMessages[charity.id] ? <CheckCircleIcon color="success" /> : <AccountBalanceWalletIcon />}
                  </ListItemIcon>
                  <ListItemText 
                    primary={charity.name} 
                    secondary={`Wallet: ${charity.aptos_wallet_address || 'Not set'} | Verified: ${charity.is_verified ? 'Yes' : 'No'}`}
                  />
                </ListItem>
                {successMessages[charity.id] && (
                    <Alert severity="success" sx={{ml: 7, mr:2, my: 1, fontSize: '0.8rem'}}>{successMessages[charity.id]}</Alert>
                )}
                 <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default ManagementPage; 