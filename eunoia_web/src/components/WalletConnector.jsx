/* global BigInt */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MultiAddress, dot } from "@polkadot-api/descriptors";
import { createClient } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { getInjectedExtensions, connectInjectedExtension } from "polkadot-api/pjs-signer";
import { AppContext, CHAINS } from './AppProvider';
import { POLKADOT_NODE_URL } from '../config';

// Create a context for the wallet connector
const WalletConnectorContext = createContext(null);

// Helper function to convert BigInt values to strings for display
const formatBalanceData = (data) => {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (typeof data === 'bigint') {
    return data.toString();
  }
  
  if (typeof data === 'object') {
    if (Array.isArray(data)) {
      return data.map(item => formatBalanceData(item));
    } else {
      const result = {};
      for (const key in data) {
        result[key] = formatBalanceData(data[key]);
      }
      return result;
    }
  }
  
  return data;
};

// Format balance for user-friendly display with units
export const formatBalanceDisplay = (balance) => {
  if (balance === undefined || balance === null) {
    return '0 DOT';
  }
  
  // Convert to string if it's a BigInt
  const balanceStr = typeof balance === 'bigint' ? balance.toString() : balance;
  
  // Convert to a number we can work with
  const balanceNum = parseFloat(balanceStr);
  
  // Polkadot has 10 decimal places (1 DOT = 10^10 Planck)
  const dotValue = balanceNum / Math.pow(10, 10);
  
  // Format with 4 decimal places
  return `${dotValue.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} DOT`;
};

export function WalletConnectorProvider({ children }) {
  const { walletAddress, setWalletAddress, activeChain, setActiveChain } = useContext(AppContext);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [extension, setExtension] = useState(null);
  const url = POLKADOT_NODE_URL;
  const [client, setClient] = useState(null);
  const [dotApi, setDotApi] = useState(null);

  // Initialize client
  useEffect(() => {
    if (activeChain === CHAINS.POLKADOT) {
      try {
        // Create client with error handling
        const newClient = createClient(
          withPolkadotSdkCompat(
            getWsProvider(url)
          )
        );

        // Make sure client is valid before proceeding
        if (!newClient) {
          console.error("Failed to create Polkadot client");
          return;
        }

        // Subscribe to finalized blocks with error handling
        let subscription;
        try {
          subscription = newClient.finalizedBlock$.subscribe(
            (finalizedBlock) => console.log("Finalized block:", finalizedBlock.number, finalizedBlock.hash),
            (error) => console.error("Finalized block subscription error:", error)
          );
        } catch (err) {
          console.error("Error subscribing to finalized blocks:", err);
        }

        // Get the typed API with error handling
        try {
          // Make sure dot is defined before using it
          if (!dot) {
            console.error("Polkadot dot descriptor is undefined");
            return;
          }
          
          const api = newClient.getTypedApi(dot);
          if (api) {
            setClient(newClient);
            setDotApi(api);
          } else {
            console.error("Failed to get typed API");
          }
        } catch (err) {
          console.error("Error getting typed API:", err);
        }

        // Cleanup function
        return () => {
          if (subscription) {
            try {
              subscription.unsubscribe();
            } catch (err) {
              console.error("Error unsubscribing:", err);
            }
          }
          
          if (newClient) {
            try {
              newClient.destroy();
            } catch (err) {
              console.error("Error destroying client:", err);
            }
          }
        };
      } catch (err) {
        console.error("Error initializing Polkadot client:", err);
      }
    }
  }, [activeChain, url]);

  const connectWallet = async () => {
    if (activeChain !== CHAINS.POLKADOT) {
      console.warn("WalletConnector only supports Polkadot chain");
      return { success: false, error: "Unsupported chain" };
    }

    setIsLoading(true);
    try {
      // Get the list of installed extensions with error handling
      let availableExtensions = [];
      try {
        availableExtensions = getInjectedExtensions() || [];
      } catch (err) {
        console.error("Error getting injected extensions:", err);
        // Continue with empty array
      }
      
      if (availableExtensions.length === 0) {
        console.warn("No Polkadot extensions found - using demo mode");
        
        // Create a demo account for testing when no extension is available
        const demoAccount = {
          address: "15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5",
          meta: {
            name: "Demo Account",
            source: "Demo"
          },
          polkadotSigner: null // No signer available in demo mode
        };
        
        setAccounts([demoAccount]);
        setSelectedAccount(demoAccount);
        setWalletAddress(demoAccount.address);
        setIsConnected(true);
        setBalance({ free: "1000000000000" }); // Set a demo balance
        
        setIsLoading(false);
        return { 
          success: true, 
          accounts: [demoAccount], 
          selectedAccount: demoAccount,
          demoMode: true
        };
      }
      
      console.log('Available extensions:', availableExtensions);
      
      // Connect to the first available extension with timeout
      let selectedExtension;
      try {
        const connectPromise = connectInjectedExtension(availableExtensions[0]);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Extension connection timed out after 5 seconds")), 5000);
        });
        
        selectedExtension = await Promise.race([connectPromise, timeoutPromise]);
        setExtension(selectedExtension);
      } catch (err) {
        console.error("Error connecting to extension:", err);
        setIsLoading(false);
        return { 
          success: false, 
          error: `Error connecting to extension: ${err.message || String(err)}` 
        };
      }
      
      // Get accounts registered in the extension with timeout
      let extensionAccounts;
      try {
        const accountsPromise = selectedExtension.getAccounts();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Getting accounts timed out after 5 seconds")), 5000);
        });
        
        extensionAccounts = await Promise.race([accountsPromise, timeoutPromise]);
      } catch (err) {
        console.error("Error getting accounts from extension:", err);
        setIsLoading(false);
        return { 
          success: false, 
          error: `Error getting accounts: ${err.message || String(err)}` 
        };
      }
      
      if (!extensionAccounts || extensionAccounts.length === 0) {
        setIsLoading(false);
        return { 
          success: false, 
          error: 'No accounts found in the Polkadot.js extension. Please create or import an account first.' 
        };
      }
      
      console.log('Extension accounts:', extensionAccounts);
      
      // Format accounts to include necessary properties
      const formattedAccounts = extensionAccounts.map(acc => ({
        address: acc.address,
        meta: {
          name: acc.name,
          source: availableExtensions[0]
        },
        polkadotSigner: acc.polkadotSigner
      }));
      
      setAccounts(formattedAccounts);
      setSelectedAccount(formattedAccounts[0]);
      setWalletAddress(formattedAccounts[0].address); // Update the global wallet address
      setIsConnected(true);
      
      // Get balance for the first account
      try {
        await getBalance(formattedAccounts[0]);
      } catch (err) {
        console.error("Error getting initial balance:", err);
        // Continue anyway, as this is not critical
      }
      
      return { 
        success: true, 
        accounts: formattedAccounts, 
        selectedAccount: formattedAccounts[0] 
      };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return { 
        success: false, 
        error: error.message || String(error) 
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  const getBalance = async (account) => {
    if (!account || !account.address) {
      console.warn("Cannot get balance: Invalid account or address");
      return null;
    }

    try {
      if (!dotApi) {
        console.error("Polkadot API not initialized");
        return null;
      }
      
      // Check if the query method exists
      if (!dotApi.query || !dotApi.query.System || !dotApi.query.System.Account) {
        console.error("Polkadot API query methods not available");
        return null;
      }
      
      // Query the account balance with timeout
      const accountInfoPromise = dotApi.query.System.Account.getValue(account.address);
      
      // Add timeout to prevent hanging if the API doesn't respond
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Balance query timed out after 10 seconds")), 10000);
      });
      
      // Race the promises
      const accountInfo = await Promise.race([accountInfoPromise, timeoutPromise]);
      
      if (!accountInfo) {
        console.warn("Account info is undefined or null");
        return null;
      }
      
      // Convert BigInt values to strings to make them serializable
      const formattedBalance = formatBalanceData(accountInfo);
      setBalance(formattedBalance);
      return formattedBalance;
    } catch (error) {
      console.error('Error getting balance:', error);
      return null;
    }
  };
  
  const changeAccount = async (address) => {
    const account = accounts.find(acc => acc.address === address);
    if (account) {
      setSelectedAccount(account);
      setWalletAddress(account.address);
      await getBalance(account);
      return { success: true, account };
    }
    return { success: false, error: "Account not found" };
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setSelectedAccount(null);
    setWalletAddress(null);
    setBalance(null);
    setAccounts([]);
    return { success: true };
  };

  // Create a transfer transaction
  const createTransfer = (recipientAddress, amount) => {
    if (!dotApi || !selectedAccount) {
      return null;
    }
    
    // Convert amount to planck (1 DOT = 10^10 planck)
    const amountInPlanck = BigInt(Math.floor(amount * 10000000000));
    
    // Create the transaction
    return dotApi.tx.Balances.transfer_allow_death({
      dest: MultiAddress.Id(recipientAddress),
      value: amountInPlanck,
    });
  };

  // Sign and submit a transaction
  const signAndSubmitTransaction = (transaction) => {
    if (!selectedAccount || !selectedAccount.polkadotSigner) {
      return Promise.reject(new Error("No signer available for this account"));
    }
    
    return new Promise((resolve, reject) => {
      let txHash = null;
      
      transaction.signSubmitAndWatch(selectedAccount.polkadotSigner).subscribe({
        next: (event) => {
          console.log("Tx event: ", event.type);
          if (event.type === "txBestBlocksState" && event.txHash) {
            txHash = event.txHash;
            console.log("Transaction included in block! Hash:", txHash);
          }
        },
        error: (err) => {
          console.error("Transaction error:", err);
          reject(err);
        },
        complete() {
          console.log("Transaction process completed!");
          // Refresh balance
          getBalance(selectedAccount);
          // Resolve with the transaction hash
          resolve(txHash);
        },
      });
    });
  };

  const value = {
    accounts,
    selectedAccount,
    balance,
    isLoading,
    isConnected,
    connectWallet,
    disconnectWallet,
    getBalance,
    changeAccount,
    createTransfer,
    signAndSubmitTransaction,
    formatBalanceDisplay
  };

  return (
    <WalletConnectorContext.Provider value={value}>
      {children}
    </WalletConnectorContext.Provider>
  );
}

// Custom hook to use the wallet connector
export const useWalletConnector = () => {
  const context = useContext(WalletConnectorContext);
  if (!context) {
    throw new Error("useWalletConnector must be used within a WalletConnectorProvider");
  }
  return context;
};

export default WalletConnectorProvider;