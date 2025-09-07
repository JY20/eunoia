/* global BigInt */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MultiAddress, dot } from "@polkadot-api/descriptors";
import { createClient } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { getInjectedExtensions, connectInjectedExtension } from "polkadot-api/pjs-signer";
import { AppContext, CHAINS } from './AppProvider';

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
  const url = "wss://testnet-passet-hub.polkadot.io";
  const [client, setClient] = useState(null);
  const [dotApi, setDotApi] = useState(null);

  // Initialize client
  useEffect(() => {
    if (activeChain === CHAINS.POLKADOT) {
      const newClient = createClient(
        withPolkadotSdkCompat(
          getWsProvider(url)
        )
      );

      // Subscribe to finalized blocks
      const subscription = newClient.finalizedBlock$.subscribe((finalizedBlock) =>
        console.log("Finalized block:", finalizedBlock.number, finalizedBlock.hash),
      );

      // Get the typed API
      const api = newClient.getTypedApi(dot);
      setClient(newClient);
      setDotApi(api);

      return () => {
        subscription.unsubscribe();
        if (newClient) {
          newClient.destroy();
        }
      };
    }
  }, [activeChain]);

  const connectWallet = async () => {
    if (activeChain !== CHAINS.POLKADOT) {
      console.warn("WalletConnector only supports Polkadot chain");
      return { success: false, error: "Unsupported chain" };
    }

    setIsLoading(true);
    try {
      // Get the list of installed extensions
      const availableExtensions = getInjectedExtensions();
      
      if (availableExtensions.length === 0) {
        setIsLoading(false);
        return { 
          success: false, 
          error: 'No extension found! Please install the Polkadot.js extension and try again.' 
        };
      }
      
      console.log('Available extensions:', availableExtensions);
      
      // Connect to the first available extension
      const selectedExtension = await connectInjectedExtension(availableExtensions[0]);
      setExtension(selectedExtension);
      
      // Get accounts registered in the extension
      const extensionAccounts = await selectedExtension.getAccounts();
      
      if (extensionAccounts.length === 0) {
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
      await getBalance(formattedAccounts[0]);
      
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
      return null;
    }

    try {
      if (!dotApi) {
        console.error("Polkadot API not initialized");
        return null;
      }
      
      // Query the account balance
      const accountInfo = await dotApi.query.System.Account.getValue(account.address);
      
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