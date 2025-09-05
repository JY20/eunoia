/* global BigInt */
import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Divider, 
  Chip, 
  useTheme,
  alpha,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

// Import the new component views
import CharityResultsView from '../components/donate/CharityResultsView';
import VisionPromptView from '../components/donate/VisionPromptView';
import AiProcessingView from '../components/donate/AiProcessingView';
import AllocationWelcomeView from '../components/donate/AllocationWelcomeView';
import DonationConfirmationView from '../components/donate/DonationConfirmationView';
import ImpactTrackerView from '../components/donate/ImpactTrackerView';

// Import Aptos libraries for balance checking
import { AptosClient, CoinClient } from "aptos";
// Import Polkadot contract interaction libraries
import { ContractPromise } from '@polkadot/api-contract';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { BN } from "@polkadot/util";
import polkadotWallet from '../utils/polkadotWallet';
// Import contract ABI
import abiJson from '../eunoia.json';

// New Icons for AI flow
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'; 

import { AppContext, CHAINS } from '../components/AppProvider';
import { Connected } from '../components/Alert';
import Loading from '../components/Loading';
import { AppContract } from '../components/AppContract';
import CompassAnimation from '../components/CompassAnimation'; // Import the new component
import CharityResultCard from '../components/CharityResultCard'; // Import the new card component
import ImpactMap from '../components/ImpactMap'; // Import the new map component

// Mock data, replace with API calls
// Constants for API and Wallet
const MODULE_ADDRESS = "0x3940277b22c1fe2c8631bdce9dbcf020c3b8240a5417fa13ac21d37860f88011";
const MODULE_NAME = "eunoia_foundation";
const DONATE_FUNCTION_NAME = "donate";

// Polkadot Contract Constants
const POLKADOT_CONTRACT_ADDRESS = "0xFeDaF0b1500381F9EeEa77840cBC090C26CF63CA"; // Deployed contract address
const POLKADOT_MODULE_NAME = "eunoia";
const POLKADOT_DONATE_FUNCTION_NAME = "giveMe";

// Balance checking constants
const APTOS_NODE_URL = "https://fullnode.testnet.aptoslabs.com";
const POLKADOT_NODE_URL = "wss://testnet-passet-hub.polkadot.io";
// const POLKADOT_NODE_URL = "wss://polkadot-rpc.publicnode.com";

// Token type mapping
const TOKEN_TYPES = {
  APT: "0x1::aptos_coin::AptosCoin",
  DOT: "DOT",
  USDC: "0x1::coin::CoinStore<0x8c805723ebc0a7fc5b7d3e7b75d567918e806b3461cb9fa21941a9edc0220bf::usdc::USDC>"
};

const DonatePage = () => {
  const theme = useTheme();
  const location = useLocation();
  const { walletAddress, setWalletAddress, activeChain } = useContext(AppContext) || {};
  
  const initialState = location.state || {};
  const initialSearchValue = initialState.searchValue || '';
  const initialSearchMode = initialState.searchMode || 'direct';
  const initialSelectedCharities = initialState.selectedCharities || [];
  
  const [currentStage, setCurrentStage] = useState(initialSearchValue ? 'visionPrompt' : 'welcomeAI'); // Updated this line
  const [visionPrompt, setVisionPrompt] = useState(initialSearchValue || ''); // Use initialSearchValue here
  const [totalDonationAmount, setTotalDonationAmount] = useState(50);
  const [aiMatchedCharities, setAiMatchedCharities] = useState([]);
  const [aiSuggestedAllocations, setAiSuggestedAllocations] = useState({});
  const [socialHandles, setSocialHandles] = useState({ twitter: '', instagram: '', linkedin: '' });
  // Set default cryptocurrency based on active chain
  const getDefaultCrypto = () => activeChain === CHAINS.POLKADOT ? 'DOT' : 'APT';
  const [selectedCrypto, setSelectedCrypto] = useState(getDefaultCrypto());
  const [searchValue, setSearchValue] = useState(initialSearchValue);
  const [needsDescription, setNeedsDescription] = useState(initialSearchMode === 'needs' ? initialSearchValue : '');
  const [searchMode, setSearchMode] = useState(initialSearchMode);
  const [matchedCharities, setMatchedCharities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCharitiesState, setSelectedCharitiesState] = useState(initialSelectedCharities); // Renamed to avoid conflict if CharityResultsView needs it
  const [donationAmounts, setDonationAmounts] = useState(
    initialSelectedCharities.reduce((acc, charity) => {
      acc[charity.id] = 10;
      return acc;
    }, {})
  );
  const [platformFeeActive, setPlatformFeeActive] = useState(true);
  const [donationComplete, setDonationComplete] = useState(false);
  const [transactionPending, setTransactionPending] = useState(false);
  const [transactionError, setTransactionError] = useState(null);
  const [impactActivities, setImpactActivities] = useState([]);
  const [showSocialSharePreview, setShowSocialSharePreview] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState(null);
  const [polkadotApi, setPolkadotApi] = useState(null);
  const [semanticSearchLoading, setSemanticSearchLoading] = useState(false);
  const [semanticSearchError, setSemanticSearchError] = useState(null);
  const [currentProcessingCharityIndex, setCurrentProcessingCharityIndex] = useState(0); // New state for sequential donations
  const [combinedMissionStatement, setCombinedMissionStatement] = useState(''); // New state
  const [compassRecommendations, setCompassRecommendations] = useState([]);
  const [groupedMatches, setGroupedMatches] = useState({});
  
  // New state for selectable charities and individual amounts
  const [selectedCharityIds, setSelectedCharityIds] = useState(new Set());
  const [individualDonationAmounts, setIndividualDonationAmounts] = useState({});
  
  const steps = [
    'Find Charities',
    'Select & Allocate',
    'Connect Wallet',
    'Confirm & Donate'
  ];

  const connectToPolkadot = async () => {
    if (activeChain === CHAINS.POLKADOT) {
      try {
        // Create a WebSocket provider
        const provider = new WsProvider(POLKADOT_NODE_URL);
        
        // Create the API instance
        const polkadotApi = await ApiPromise.create({ provider });
        
        setPolkadotApi(polkadotApi);
        
        // Get chain name for logging
        const chain = await polkadotApi.rpc.system.chain();
        console.log(`Connected to Polkadot chain: ${chain.toString()}`);
        
        // Create contract instance
        const c = new ContractPromise(polkadotApi, abiJson, POLKADOT_CONTRACT_ADDRESS);
        console.log('Contract instance created successfully');
      } catch (error) {
        console.error('Failed to initialize Polkadot API:', error);
        setBalanceError("Failed to initialize Polkadot connection");
      }
    }
  };

  // Fetch balance function similar to App.js
  const fetchBalance = async () => {
    if (polkadotApi && walletAddress) {
      try {
        const { data } = await polkadotApi.query.system.account(walletAddress);
        const freeBalance = data.free.toBigInt(); // get BigInt
        const formattedBalance = Number(freeBalance) / 100_000_000_00;
        console.log(`Polkadot balance for ${selectedCrypto}: ${formattedBalance}`);
        
        // Convert from string to number for display
        const balanceNumber = parseFloat(formattedBalance);
        setWalletBalance(balanceNumber);
        
        // Get chain information for logging
        const chain = await polkadotApi.rpc.system.chain();
        console.log(`Connected to chain: ${chain.toString()}`);
      } catch (error) {
        console.error("Error fetching Polkadot balance:", error);
        setBalanceError("Failed to fetch balance");
      }
    }
  };

  // Function to check wallet balance
  const checkWalletBalance = async () => {
    if (!walletAddress) {
      setWalletBalance(0);
      return;
    }

    setLoadingBalance(true);
    setBalanceError(null);

    try {
      let balance = 0;
      
      if (activeChain === CHAINS.APTOS) {
        balance = await getAptosBalance(walletAddress, selectedCrypto);
      } else if (activeChain === CHAINS.POLKADOT) {
        balance = await getPolkadotBalance(walletAddress);
      } else {
        console.log(`Unknown chain: ${activeChain}, using default balance`);
        balance = 50; // Default value
      }
      
      console.log(`Wallet balance for ${selectedCrypto}: ${balance}`);
      setWalletBalance(balance);
    } catch (error) {
      console.error("Error checking wallet balance:", error);
      setBalanceError(error.message || "Failed to check wallet balance");
      setWalletBalance(0);
    } finally {
      setLoadingBalance(false);
    }
  };
  
  // Get balance for Aptos
  const getAptosBalance = async (address, tokenSymbol) => {
    try {
      const client = new AptosClient(APTOS_NODE_URL);
      const tokenType = TOKEN_TYPES[tokenSymbol];
      
      if (!tokenType) {
        console.warn(`Token symbol ${tokenSymbol} not in TOKEN_TYPES, attempting direct use.`);
        if (tokenSymbol !== 'APT') {
            console.warn(`Only APT is supported for balance check currently. Querying for ${tokenSymbol} might fail or return 0.`);
        }
      }
      
      const payload = {
        function: "0x1::coin::balance",
        type_arguments: [tokenType || `0x1::coin::CoinStore<${tokenSymbol}>`],
        arguments: [address]
      };
      
      const balanceResponse = await client.view(payload);
      
      if (balanceResponse && balanceResponse.length > 0) {
        // Convert from string to number instead of using BigInt
        const rawBalance = balanceResponse[0].toString();
        // Convert from octas to APT (8 decimal places)
        const balanceNumber = parseInt(rawBalance, 10) / Math.pow(10, 8);
        return balanceNumber;
      }
      
      return 0;
    } catch (error) {
      console.error(`Error fetching Aptos ${tokenSymbol} balance:`, error);
      // For testing, return a mock balance if view function fails
      return tokenSymbol === 'APT' ? 10 : 100;
    }
  };

  // Get balance for Polkadot/Westend using the same approach as App.js
  const getPolkadotBalance = async (address) => {
    try {
      if (!polkadotApi) {
        console.error("Polkadot API not initialized");
        return 5; // Default value for testing
      }

      const { data } = await polkadotApi.query.system.account(address);
      const freeBalance = data.free.toBigInt(); // get BigInt
      
      // Convert from smallest unit (plancks) to DOT/WND (12 decimal places)
      const formattedBalance = Number(freeBalance) / 100_000_000_00;
      return formattedBalance;
    } catch (error) {
      console.error(`Error fetching ${selectedCrypto} balance:`, error);
      // For testing, return a mock balance
      return 5;
    }
  };
  
  // Set maximum donation amount based on wallet balance
  const setMaxDonationAmount = () => {
    if (!walletBalance) {
      return;
    }
    // Leave a small amount for transaction fees
    const maxAmount = Math.max(0, walletBalance - 0.1);
    setTotalDonationAmount(Number(maxAmount.toFixed(2)));
  };

  // Initialize Polkadot API and update selected crypto when chain changes
  useEffect(() => {
    // Update selected cryptocurrency when chain changes
    setSelectedCrypto(activeChain === CHAINS.POLKADOT ? 'DOT' : 'APT');
    
    connectToPolkadot();
    
    return () => {
      // Clean up Polkadot API connection on unmount
      if (polkadotApi && polkadotApi.disconnect) {
        polkadotApi.disconnect();
      }
    };
  }, [activeChain]);

  // Check wallet balance whenever wallet address or selected crypto changes
  useEffect(() => {
    if (walletAddress) {
      if (activeChain === CHAINS.POLKADOT && polkadotApi) {
        fetchBalance();
      } else {
        checkWalletBalance();
      }
    } else {
      setWalletBalance(0);
    }
  }, [walletAddress, selectedCrypto, activeChain, polkadotApi]);

  useEffect(() => {
    if (initialSearchValue && currentStage === 'traditionalSearch') {
      // handleManualSearch(); 
    }
  }, [initialSearchValue, currentStage]); // Added currentStage to dependencies

  const handleManualSearch = async () => { /* ... */ };
  const handleFindMatches = async () => { /* ... */ };
  const handleSelectCharity = (charity) => { /* ... */ };
  const handleDonationAmountChange = (charityId, amount) => { /* ... */ };
  
  const handleConnectWallet = async () => {
    try {
      if (activeChain === CHAINS.APTOS || !activeChain) {
        // Connect Aptos wallet
        if (window.aptos) {
          try {
            // Try to connect
            const response = await window.aptos.connect();
            console.log("Connected to Aptos wallet:", response);
            
            if (response && response.address) {
              setWalletAddress(response.address);
              // Get balance after connecting
              await checkWalletBalance();
              return true;
            }
          } catch (error) {
            console.error("Error connecting to Aptos wallet:", error);
            setTransactionError("Failed to connect to wallet. Please try again.");
            return false;
          }
        } else {
          console.error("Aptos wallet provider not found");
          setTransactionError("Aptos wallet extension not found. Please install Petra wallet.");
          return false;
        }
      } else if (activeChain === CHAINS.POLKADOT) {
        // Connect Polkadot wallet using the approach from App.js
        try {
          const extensions = await web3Enable('Eunoia Donation Platform');
          if (extensions.length === 0) {
            alert('Polkadot{.js} extension not found. Please install it.');
            return false;
          }
          
          const accounts = await web3Accounts();
          if (accounts.length === 0) {
            alert('No accounts found in the Polkadot{.js} extension.');
            return false;
          }
          
          setWalletAddress(accounts[0].address);
          // Get balance after connecting
          if (polkadotApi) {
            await fetchBalance();
          } else {
            await checkWalletBalance();
          }
          return true;
        } catch (error) {
          console.error('Error connecting to wallet:', error);
          alert('Failed to connect to wallet. Please try again.');
          return false;
        }
      } else {
        console.error("Unsupported chain:", activeChain);
        setTransactionError("Unsupported blockchain selected.");
        return false;
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      setTransactionError("Failed to connect wallet: " + (error.message || "Unknown error"));
      return false;
    }
  };
  
  const calculateTotal = () => { /* ... */ };
  const calculatePlatformFee = () => {
    if (!platformFeeActive) return 0;
    return totalDonationAmount * 0.002;
  };

  // Initialize/update selectedCharityIds and individualDonationAmounts when AI results are processed
  useEffect(() => {
    if (currentStage === 'charityResults' && aiMatchedCharities.length > 0) {
      // const initialSelectedIds = new Set(); // No longer select all by default
      // const initialAmounts = {};
      // // By default, select all matched charities and use AI suggested allocations
      // aiMatchedCharities.forEach(charity => {
      //   initialSelectedIds.add(charity.id);
      //   initialAmounts[charity.id] = aiSuggestedAllocations[charity.id] || 10; // Default to 10 if no suggestion
      // });
      // setSelectedCharityIds(initialSelectedIds);
      // setIndividualDonationAmounts(initialAmounts);

      // Instead, initialize with no charities selected, 
      // but still prepare individual amounts based on AI suggestions if they exist, 
      // so if a user *does* select a charity, its amount input is pre-filled reasonably.
      const initialAmounts = {};
      aiMatchedCharities.forEach(charity => {
        initialAmounts[charity.id] = aiSuggestedAllocations[charity.id] || 10; 
      });
      setIndividualDonationAmounts(initialAmounts);
      setSelectedCharityIds(new Set()); // Start with an empty set of selected IDs

    } else if (currentStage !== 'charityResults') {
        // Clear selections if we navigate away from results page, 
        // or if there are no charities (handled in performSemanticSearch as well)
        // setSelectedCharityIds(new Set()); 
        // setIndividualDonationAmounts({});
    }
  }, [aiMatchedCharities, aiSuggestedAllocations, currentStage]);

  const handleToggleCharitySelection = (charityId) => {
    setSelectedCharityIds(prevSelectedIds => {
      const newSelectedIds = new Set(prevSelectedIds);
      if (newSelectedIds.has(charityId)) {
        newSelectedIds.delete(charityId);
      } else {
        newSelectedIds.add(charityId);
        // Optionally set a default amount if a charity is selected and doesn't have one
        if (!individualDonationAmounts[charityId]) {
          setIndividualDonationAmounts(prevAmounts => ({
            ...prevAmounts,
            [charityId]: aiSuggestedAllocations[charityId] || 10 // Default amount
          }));
        }
      }
      return newSelectedIds;
    });
  };

  const handleIndividualAmountChange = (charityId, newAmount) => {
    const amount = Math.max(1, Number(newAmount)); // Ensure amount is at least 1 (or your minimum)
    setIndividualDonationAmounts(prevAmounts => ({
      ...prevAmounts,
      [charityId]: amount,
    }));
  };

  // Calculate the actual totalDonationAmount based on selected charities and their individual amounts
  const actualTotalDonation = Array.from(selectedCharityIds).reduce((sum, id) => {
    return sum + (individualDonationAmounts[id] || 0);
  }, 0);

  // Add the handleDonate function with multi-chain support
  const handleDonate = async () => {
    const charitiesToProcess = aiMatchedCharities.filter(c => selectedCharityIds.has(c.id));

    // Ensure we are in the correct stage and have charities to process
    if (currentStage !== 'donationConfirmation' || charitiesToProcess.length === 0) {
      setTransactionError("No selected charities to process or incorrect stage.");
      setTransactionPending(false);
      return;
    }

    const charityToDonate = charitiesToProcess[currentProcessingCharityIndex];
    if (!charityToDonate) {
      setTransactionError("No more selected charities to process or invalid index.");
      setTransactionPending(false); 
      if (currentProcessingCharityIndex >= charitiesToProcess.length && charitiesToProcess.length > 0) {
        console.log("All selected donations processed.");
        setCurrentStage('impactTracker'); 
      }
      return;
    }

    // Use individual amount for the current charity
    const amountToDonate = individualDonationAmounts[charityToDonate.id];

    if (!charityToDonate.name) {
      setTransactionError(`Selected charity (index ${currentProcessingCharityIndex}) is missing a name.`);
      setTransactionPending(false);
      return;
    }

    if (!amountToDonate || amountToDonate <= 0) {
      setTransactionError(`Invalid amount for ${charityToDonate.name}.`);
      setTransactionPending(false);
      return;
    }

    setTransactionPending(true);
    setTransactionError(null);
    // setDonationComplete(false); // This is set on success/failure or for next step

    try {
      console.log(`Preparing donation on ${activeChain || CHAINS.POLKADOT} blockchain for ${charityToDonate.name}`);
      
      let txResult;
      let txHashForBackend;
      let blockchainForBackend;

      if (activeChain === CHAINS.POLKADOT) {
        txResult = await handlePolkadotDonation(charityToDonate, amountToDonate);
        txHashForBackend = txResult ? txResult.toHex() : null;
        blockchainForBackend = 'POL'; // Matches model choice
      } else {
        txResult = await handleAptosDonation(charityToDonate, amountToDonate);
        // Aptos SDK v2+ returns an object with a `hash` property for pendingTransaction
        // For older SDK that returns just the hash string, it would be `txResult` directly
        txHashForBackend = txResult ? (txResult.hash || txResult) : null; 
        blockchainForBackend = 'APT'; // Matches model choice
      }
      
      console.log(`Donation to ${charityToDonate.name} successful. Tx: ${txHashForBackend}`);

      // ---- SAVE TRANSACTION TO BACKEND ----
      if (txHashForBackend) {
        const donationDataForBackend = {
          transaction_hash: txHashForBackend,
          donor_address: walletAddress,
          charity_name: charityToDonate.name,
          charity_wallet_address: activeChain === CHAINS.POLKADOT 
            ? POLKADOT_CONTRACT_ADDRESS // Central Polkadot contract
            : charityToDonate.aptos_wallet_address, // Specific Aptos address
          amount: amountToDonate.toString(), // Send as string, backend has DecimalField
          currency: selectedCrypto,
          blockchain: blockchainForBackend,
          status: 'success',
        };

        try {
          console.log("Sending donation data to backend:", donationDataForBackend);
          // API_BASE_URL is 'http://localhost:8000/api'
          const response = await axios.post(`${API_BASE_URL}/donation-transactions/`, donationDataForBackend);
          console.log("Backend response for saving transaction:", response.data);
        } catch (backendError) {
          console.error("Error saving transaction to backend:", backendError.response ? backendError.response.data : backendError.message);
          // Non-critical error, don't block user flow
        }
      }
      // ---- END SAVE TRANSACTION TO BACKEND ----

      // Logic for advancing to the next charity or completing the process
      if (currentProcessingCharityIndex < charitiesToProcess.length - 1) {
        // More charities to process
        setTransactionPending(false); 
        setDonationComplete(false);   
        setTransactionError(null);
        setCurrentProcessingCharityIndex(prevIndex => prevIndex + 1);
        // The DonationConfirmationView's useEffect should pick this up and call handleDonate again.
      } else {
        // This was the last charity
        setDonationComplete(true); // All donations in sequence are now complete
        setTransactionPending(false);
        setCurrentStage('impactTracker'); // Or a new summary/final success page
        setCurrentProcessingCharityIndex(0); // Reset for a potential new batch later
      }

    } catch (err) {
      console.error(`Donation to ${charityToDonate.name} failed:`, err);
      let errorMessage = "Donation failed. Please try again.";
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.name) {
        errorMessage = `Error: ${err.name}`;
      }
      
      if (errorMessage.toLowerCase().includes("user rejected") || 
          errorMessage.toLowerCase().includes("declined") || 
          (err.code && err.code === 4001)) {
        errorMessage = "Transaction rejected by user.";
      }
      setTransactionError(errorMessage);
      setDonationComplete(false);
      setTransactionPending(false);
      // Do not advance index on error, user might want to retry this specific one.
      // The UI in DonationConfirmationView will show the error.
    }
  };
  
  // Handle Aptos donation
  const handleAptosDonation = async (charity, amount) => {
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      throw new Error(`Invalid donation amount: ${amount}`);
    }

    const amountInOcta = Math.round(numericAmount * Math.pow(10, 8)); 
    const coinIdentifier = TOKEN_TYPES[selectedCrypto] || TOKEN_TYPES.APT;

    if (!charity.name) {
        throw new Error("Charity name is missing, cannot proceed with Aptos donation.");
    }

    // Log the charity name being sent to the contract for debugging E_CHARITY_NOT_FOUND
    console.log(`[Aptos Contract Call] Using charity_name: "${charity.name}" for donation to ${charity.aptos_wallet_address}`);

    const entryFunctionPayload = {
      type: "entry_function_payload",
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::${DONATE_FUNCTION_NAME}`,
      type_arguments: [coinIdentifier],
      arguments: [
        charity.name,
        coinIdentifier,
        amountInOcta.toString()
      ],
    };

    if (window.aptos && window.aptos.isConnected) {
      console.log("Constructed Aptos Entry Function Payload:", JSON.stringify(entryFunctionPayload, null, 2));
      const pendingTransaction = await window.aptos.signAndSubmitTransaction({ payload: entryFunctionPayload }); 
      console.log("Aptos transaction submitted:", pendingTransaction);
      // The pendingTransaction for Aptos SDK v2+ is an object like { hash: "0x..." }
      // If using an older SDK version that directly returns the hash string, this would be fine.
      // For now, we expect an object with a hash property.
      if (!pendingTransaction || typeof pendingTransaction.hash !== 'string') {
        throw new Error("Aptos transaction submission did not return a valid hash object.");
      }
      return pendingTransaction; 
    } else {
      throw new Error("Aptos wallet not connected or not available. Please connect your wallet.");
    }
  };
  
  // Handle Polkadot donation using the approach from App.js
  const handlePolkadotDonation = async (charity, amount) => {
    try {
      if (!polkadotApi) {
        throw new Error("Polkadot API not initialized. Please try again.");
      }

      const numericAmount = Number(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        throw new Error(`Invalid donation amount: ${amount}`);
      }

      // Ensure we're signed in
      if (!walletAddress) {
        throw new Error("Polkadot wallet not connected. Please connect your wallet.");
      }

      // Convert amount to planck units (smallest unit)
      const amountInPlanck = new BN(Number(numericAmount) * 1e12);

      console.log(`Preparing Westend donation of ${amount} DOT (${amountInPlanck.toString()} plancks) to ${charity.name}`);

      // Get the injector for the current address
      const injector = await web3FromAddress(walletAddress);

      // Use the giveTo function from the contract if available
      if (POLKADOT_MODULE_NAME === 'eunoia' && POLKADOT_DONATE_FUNCTION_NAME === 'giveMe') {
        // Create contract instance
          const contract = new ContractPromise(
            polkadotApi,
          abiJson, // This should be imported at the top of the file like in App.js
            POLKADOT_CONTRACT_ADDRESS
          );

        // Set gas limit
        const gasLimit = polkadotApi.registry.createType("WeightV2", {
          refTime: 3_000_000_000,
          proofSize: 1_000_000,
        });

        // Call the giveMe function
        const tx = contract.tx.giveMe({ value: 0, gasLimit }, numericAmount);

        // Sign and send the transaction
        const result = await tx.signAndSend(
          walletAddress, 
          { signer: injector.signer },
          ({ status, dispatchError }) => {
            if (dispatchError) {
              console.error("Dispatch error:", dispatchError.toString());
            }
            if (status.isInBlock) {
              console.log("giveMe included in blockHash:", status.asInBlock.toString());
            } else if (status.isFinalized) {
              console.log("giveMe finalized:", status.asFinalized.toString());
              console.log(`giveMe executed: received ${numericAmount}`);
            }
          }
        );

        return result;
      } else {
        // Fallback to simple transfer if contract is not available
        const tx = polkadotApi.tx.balances.transferAllowDeath(POLKADOT_CONTRACT_ADDRESS, amountInPlanck);

        // Sign and send the transaction
        const result = await tx.signAndSend(
          walletAddress,
          { signer: injector.signer },
          ({ status, dispatchError, events }) => {
            if (dispatchError) {
              console.error("Dispatch error:", dispatchError.toString());
            }
            if (status.isInBlock) {
              console.log("Transfer included in blockHash:", status.asInBlock.toString());
            } else if (status.isFinalized) {
              console.log("Transfer finalized:", status.asFinalized.toString());
              console.log(`Transferred ${numericAmount} ${selectedCrypto} to ${POLKADOT_CONTRACT_ADDRESS}`);
              
              // Refresh balance after transfer
              polkadotApi.query.system.account(walletAddress).then(({ data }) => {
                const freeBalance = data.free.toBigInt();
                const formatted = Number(freeBalance) / 1e12;
                setWalletBalance(formatted);
              });
            }
          }
        );

      return result;
      }
    } catch (error) {
      console.error("Westend donation error:", error);
      throw error;
    }
  };
  // Add the missing handleReset function
  const handleReset = () => {
    setCurrentStage('welcomeAI');
    setVisionPrompt('');
    setTotalDonationAmount(50);
    setAiMatchedCharities([]);
    setAiSuggestedAllocations({});
    setSocialHandles({ twitter: '', instagram: '', linkedin: '' });
    setSelectedCharityIds(new Set()); // Add this line
    setIndividualDonationAmounts({}); // Add this line
    setSearchValue('');
    setNeedsDescription('');
    setSearchMode('direct');
  };

  const renderCurrentStage = () => {
    switch (currentStage) {
      case 'welcomeAI':
        return <AllocationWelcomeView 
          setCurrentStage={setCurrentStage} 
        />;
      case 'visionPrompt':
        return <VisionPromptView 
          visionPrompt={visionPrompt}
          setVisionPrompt={setVisionPrompt}
          setCurrentStage={setCurrentStage}
          totalDonationAmount={totalDonationAmount}
          setTotalDonationAmount={setTotalDonationAmount}
          selectedCrypto={selectedCrypto}
          setSelectedCrypto={setSelectedCrypto}
          platformFeeActive={platformFeeActive}
          setPlatformFeeActive={setPlatformFeeActive}
          calculatePlatformFee={calculatePlatformFee}
          socialHandles={socialHandles}
          setSocialHandles={setSocialHandles}          
          theme={theme}
          walletBalance={walletBalance}
          loadingBalance={loadingBalance}
          balanceError={balanceError}
          setMaxDonationAmount={setMaxDonationAmount}
          activeChain={activeChain}
          handleConnectWallet={handleConnectWallet}
          walletAddress={walletAddress}
        />;
      case 'aiProcessing':
        return <AiProcessingView 
          visionPrompt={visionPrompt}
          totalDonationAmount={totalDonationAmount}
          setCurrentStage={setCurrentStage}
          setAiMatchedCharities={setAiMatchedCharities}
          setAiSuggestedAllocations={setAiSuggestedAllocations}
          setSemanticSearchLoading={setSemanticSearchLoading}
          setSemanticSearchError={setSemanticSearchError}
          semanticSearchLoading={semanticSearchLoading}
          semanticSearchError={semanticSearchError}
          setCombinedMissionStatement={setCombinedMissionStatement}
          setCompassRecommendations={setCompassRecommendations}
          setGroupedMatches={setGroupedMatches}
        />;
      case 'charityResults':
        return <CharityResultsView 
          aiMatchedCharities={aiMatchedCharities}
          aiSuggestedAllocations={aiSuggestedAllocations}
          setCurrentStage={setCurrentStage}
          selectedCrypto={selectedCrypto}
          platformFeeActive={platformFeeActive}
          setPlatformFeeActive={setPlatformFeeActive}
          calculatePlatformFee={calculatePlatformFee}
          totalDonationAmount={totalDonationAmount}
          visionPrompt={visionPrompt}
          theme={theme}
          semanticSearchLoading={semanticSearchLoading}
          semanticSearchError={semanticSearchError}
          selectedCharityIds={selectedCharityIds}
          handleToggleCharitySelection={handleToggleCharitySelection}
          individualDonationAmounts={individualDonationAmounts}
          handleIndividualAmountChange={handleIndividualAmountChange}
          combinedMissionStatement={combinedMissionStatement}
          compassRecommendations={compassRecommendations}
          groupedMatches={groupedMatches}
        />;
      case 'donationConfirmation':
        return <DonationConfirmationView 
          currentStage={currentStage}
          transactionPending={transactionPending}
          donationComplete={donationComplete}
          transactionError={transactionError}
          walletAddress={walletAddress}
          handleDonate={handleDonate}
          setCurrentStage={setCurrentStage}
          handleReset={handleReset}
          setTransactionError={setTransactionError}
          currentProcessingCharityIndex={currentProcessingCharityIndex}
          aiMatchedCharities={aiMatchedCharities}
          aiSuggestedAllocations={aiSuggestedAllocations}
          selectedCrypto={selectedCrypto}
          selectedCharityIds={selectedCharityIds}
          handleToggleCharitySelection={handleToggleCharitySelection}
          individualDonationAmounts={individualDonationAmounts}
          handleIndividualAmountChange={handleIndividualAmountChange}
        />;
      case 'impactTracker':
        return <ImpactTrackerView 
          aiSuggestedAllocations={aiSuggestedAllocations}
          aiMatchedCharities={aiMatchedCharities}
          selectedCrypto={selectedCrypto}
          setImpactActivities={setImpactActivities}
          impactActivities={impactActivities}
          setCurrentStage={setCurrentStage}
          platformFeeActive={platformFeeActive}
          setPlatformFeeActive={setPlatformFeeActive}
          calculatePlatformFee={calculatePlatformFee}
          totalDonationAmount={actualTotalDonation}
          visionPrompt={visionPrompt}
          theme={theme}
          semanticSearchLoading={semanticSearchLoading}
          semanticSearchError={semanticSearchError}
          selectedCharityIds={selectedCharityIds}
          handleToggleCharitySelection={handleToggleCharitySelection}
          individualDonationAmounts={individualDonationAmounts}
          handleIndividualAmountChange={handleIndividualAmountChange}
          handleReset={handleReset}
        />;
      default:
        return <AllocationWelcomeView setCurrentStage={setCurrentStage} />;
    }
  };
  
  // Debug: Log on every render
  console.log('DonatePage render, currentStage:', currentStage, 'Selected IDs:', selectedCharityIds);

  return (
    <Box sx={{ py: {xs:3, sm:6}, background: 'linear-gradient(135deg, #f0f4f8 0%, #e0eafc 100%)', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Box sx={{textAlign: 'center', mb: {xs:3, sm:5}}}>
          <Typography 
            variant="h2" 
            fontWeight="bold" 
            gutterBottom
            sx={{ 
              fontFamily: "'Space Grotesk', sans-serif", 
              color: 'primary.dark',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            <AutoAwesomeIcon sx={{fontSize: 'inherit', mr: 1.5, color: 'primary.main'}}/> Eunoia
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
            {currentStage === 'welcomeAI' 
              ? "Experience a new way to give, guided by intelligence, powered by transparency on Aptos." 
              : currentStage === 'impactTracker' 
              ? "Track your generous contribution and see the difference it makes in real-time."
              : "Your contribution makes a direct impact. Follow its journey transparently on the blockchain."}
          </Typography>
        </Box>
        
        {currentStage !== 'welcomeAI' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
            {['visionPrompt', 'aiProcessing', 'charityResults', 'donationConfirmation', 'impactTracker'].map((stage, index, arr) => {
              const stageIndex = arr.indexOf(currentStage);
              const isActive = stage === currentStage;
              const isCompleted = arr.indexOf(stage) < arr.indexOf(currentStage);
              return (
                <React.Fragment key={stage}>
                  <Chip 
                    label={index + 1}
                    color={isActive ? 'primary' : isCompleted ? 'success' : 'default'}
                    variant={isActive || isCompleted ? 'filled' : 'outlined'}
                    sx={{ fontWeight: isActive ? 'bold' : 'normal', cursor: 'default'}}
                  />
                  {index < arr.length - 1 && <Divider sx={{flexGrow: 1, maxWidth: '50px', mx:1, borderColor: isCompleted ? 'success.main' : 'grey.400'}}/>}
                </React.Fragment>
              );
            })}
          </Box>
        )}
        
        <Paper sx={{ 
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(8px)',
          borderRadius: '24px', 
          boxShadow: theme.shadows[6],
          p: { xs: 2, sm: 3, md: 4 }, 
          mb: 6,
          minHeight: '500px' 
        }}>
          {renderCurrentStage()}
        </Paper>
      </Container>
    </Box>
  );
};

export default DonatePage;