/* global BigInt */
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useWallet as useAptosWallet } from "@aptos-labs/wallet-adapter-react";
import aptosLogo from '../assets/logos/aptos-logo.svg';
import polkadotLogo from '../assets/logos/polkadot-logo.svg';

// Available blockchains
export const CHAINS = {
  APTOS: 'aptos',
  POLKADOT: 'polkadot',
};

// Chain icons
export const CHAIN_ICONS = {
  [CHAINS.APTOS]: aptosLogo,
  [CHAINS.POLKADOT]: polkadotLogo
};

// Polkadot networks
export const POLKADOT_NETWORKS = {
  POLKADOT: {
    name: 'Polkadot',
    endpoint: 'wss://rpc.polkadot.io',
    symbol: 'DOT',
    decimals: 10
  },
  KUSAMA: {
    name: 'Kusama',
    endpoint: 'wss://kusama-rpc.polkadot.io',
    symbol: 'KSM',
    decimals: 12
  },
  WESTEND: {
    name: 'Westend',
    endpoint: 'wss://westend-rpc.polkadot.io',
    symbol: 'WND',
    decimals: 12
  }
};

// Create context
export const WalletContext = createContext(null);

// Custom hook to use wallet context
export const useMultiWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
  // Current active chain
  const [activeChain, setActiveChain] = useState(CHAINS.POLKADOT);
  
  // Wallets state
  const [polkadotAccounts, setPolkadotAccounts] = useState([]);
  const [selectedPolkadotAccount, setSelectedPolkadotAccount] = useState(null);
  const [polkadotNetwork, setPolkadotNetwork] = useState(POLKADOT_NETWORKS.POLKADOT);
  const [polkadotBalance, setPolkadotBalance] = useState('0');
  const [polkadotConnected, setPolkadotConnected] = useState(false);
  const [polkadotClient, setPolkadotClient] = useState(null);
  
  // Aptos wallet state
  const aptosWallet = useAptosWallet();
  
  // Initialize Polkadot connection
  const initPolkadot = async () => {
    try {
      // Import the required modules dynamically
      const { ApiPromise, WsProvider } = await import('@polkadot/api');
      
      // Create a WebSocket provider
      const wsProvider = new WsProvider(polkadotNetwork.endpoint);
      
      // Create the API instance
      const api = await ApiPromise.create({ provider: wsProvider });
      
      // Wait for the API to be ready
      await api.isReady;
      
      setPolkadotClient(api);
      
      // Get accounts from browser extension
      const { web3Accounts, web3Enable } = await import('@polkadot/extension-dapp');
      await web3Enable('Eunoia Donation Platform');
      const accounts = await web3Accounts();
      setPolkadotAccounts(accounts);
      
      if (accounts.length > 0) {
        setSelectedPolkadotAccount(accounts[0]);
        setPolkadotConnected(true);
        
        // Get balance for selected account with new client
        await updatePolkadotBalance(accounts[0], api);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Polkadot:', error);
      setPolkadotConnected(false);
      return false;
    }
  };
  
  // Update Polkadot balance
  const updatePolkadotBalance = async (account, client) => {
    try {
      if (!account || !account.address) return;
      
      const clientToUse = client || polkadotClient;
      if (!clientToUse) return;
      
      // Use the proper API call for @polkadot/api
      const { data: { free } } = await clientToUse.query.system.account(account.address);
      
      // Format balance
      const balanceBigInt = free.toBigInt();
      const divisor = BigInt(10) ** BigInt(polkadotNetwork.decimals);
      const integerPart = balanceBigInt / divisor;
      const fractionalPart = balanceBigInt % divisor;
      
      let formatted = integerPart.toString();
      if (fractionalPart > 0) {
        let fraction = fractionalPart.toString().padStart(polkadotNetwork.decimals, '0');
        fraction = fraction.replace(/0+$/, '');
        if (fraction.length > 0) {
          formatted += '.' + fraction;
        }
      }
      
      setPolkadotBalance(`${formatted} ${polkadotNetwork.symbol}`);
    } catch (error) {
      console.error('Failed to get Polkadot balance:', error);
      setPolkadotBalance(`0 ${polkadotNetwork.symbol}`);
    }
  };
  
  // Connect to Polkadot
  const connectPolkadot = async () => {
    return await initPolkadot();
  };
  
  // Disconnect from Polkadot
  const disconnectPolkadot = () => {
    setSelectedPolkadotAccount(null);
    setPolkadotConnected(false);
    setPolkadotBalance(`0 ${polkadotNetwork.symbol}`);
    
    // Disconnect client if exists
    if (polkadotClient && polkadotClient.disconnect) {
      polkadotClient.disconnect();
      setPolkadotClient(null);
    }
  };
  
  // Switch Polkadot account
  const selectPolkadotAccount = async (account) => {
    try {
      setSelectedPolkadotAccount(account);
      await updatePolkadotBalance(account);
    } catch (error) {
      console.error('Failed to select Polkadot account:', error);
    }
  };
  
  // Switch Polkadot network
  const switchPolkadotNetwork = async (network) => {
    try {
      setPolkadotNetwork(network);
      
      // Reinitialize with new network
      if (polkadotClient && polkadotClient.disconnect) {
        polkadotClient.disconnect();
      }
      
      // Import the required modules dynamically
      const { ApiPromise, WsProvider } = await import('@polkadot/api');
      
      // Create a WebSocket provider with the new endpoint
      const wsProvider = new WsProvider(network.endpoint);
      
      // Create the API instance
      const api = await ApiPromise.create({ provider: wsProvider });
      
      // Wait for the API to be ready
      await api.isReady;
      
      setPolkadotClient(api);
      
      // Update balance for selected account with new client
      if (selectedPolkadotAccount) {
        await updatePolkadotBalance(selectedPolkadotAccount, api);
      }
    } catch (error) {
      console.error('Failed to switch Polkadot network:', error);
    }
  };
  
  // Get active wallet info
  const getActiveWalletInfo = () => {
    switch (activeChain) {
      case CHAINS.APTOS:
        return {
          connected: aptosWallet.connected,
          account: aptosWallet.account,
          connect: aptosWallet.connect,
          disconnect: aptosWallet.disconnect,
          network: 'testnet', // or detect from configuration
          balance: null, // aptos wallet adapter doesn't provide balance directly
          chainName: 'Aptos',
          chainIcon: CHAIN_ICONS[CHAINS.APTOS],
          wallets: aptosWallet.wallets,
        };
      case CHAINS.POLKADOT:
        return {
          connected: polkadotConnected,
          account: selectedPolkadotAccount,
          connect: connectPolkadot,
          disconnect: disconnectPolkadot,
          network: polkadotNetwork.name,
          balance: polkadotBalance,
          chainName: 'Polkadot',
          chainIcon: CHAIN_ICONS[CHAINS.POLKADOT],
          wallets: polkadotAccounts,
          switchAccount: selectPolkadotAccount,
          switchNetwork: switchPolkadotNetwork,
          availableNetworks: POLKADOT_NETWORKS,
        };
      default:
        return {
          connected: false,
          account: null,
          connect: () => {},
          disconnect: () => {},
        };
    }
  };
  
  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    
    if (typeof address === 'string') {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    
    // Handle Polkadot account which has address as a property
    if (address.address) {
      return `${address.address.slice(0, 6)}...${address.address.slice(-4)}`;
    }
    
    return 'Unknown';
  };
  
  // Switch active blockchain
  const switchChain = (chain) => {
    setActiveChain(chain);
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (polkadotClient && polkadotClient.disconnect) {
        polkadotClient.disconnect();
      }
    };
  }, []);
  
  return (
    <WalletContext.Provider
      value={{
        activeChain,
        switchChain,
        allChains: CHAINS,
        chainIcons: CHAIN_ICONS,
        wallet: getActiveWalletInfo(),
        formatAddress,
        // Aptos specific
        aptosWallet,
        // Polkadot specific
        polkadotAccounts,
        selectedPolkadotAccount,
        polkadotNetwork,
        polkadotBalance,
        polkadotConnected,
        connectPolkadot,
        disconnectPolkadot,
        selectPolkadotAccount,
        switchPolkadotNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}; 