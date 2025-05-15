import React, { createContext, useState, useContext, useEffect } from 'react';
import { useWallet as useAptosWallet } from "@aptos-labs/wallet-adapter-react";
import polkadotWallet, { POLKADOT_NETWORKS } from '../utils/polkadotWallet';
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

// Create context
export const WalletContext = createContext(null);

// Custom hook to use wallet context
export const useMultiWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
  // Current active chain
  const [activeChain, setActiveChain] = useState(CHAINS.APTOS);
  
  // Wallets state
  const [polkadotAccounts, setPolkadotAccounts] = useState([]);
  const [selectedPolkadotAccount, setSelectedPolkadotAccount] = useState(null);
  const [polkadotNetwork, setPolkadotNetwork] = useState(POLKADOT_NETWORKS.POLKADOT);
  const [polkadotBalance, setPolkadotBalance] = useState('0');
  const [polkadotConnected, setPolkadotConnected] = useState(false);
  
  // Aptos wallet state
  const aptosWallet = useAptosWallet();
  
  // Initialize Polkadot connection
  const initPolkadot = async () => {
    try {
      await polkadotWallet.initApi(polkadotNetwork.endpoint);
      const accounts = await polkadotWallet.getAccounts();
      setPolkadotAccounts(accounts);
      
      if (accounts.length > 0) {
        setSelectedPolkadotAccount(accounts[0]);
        setPolkadotConnected(true);
        
        // Get balance for selected account
        const balance = await polkadotWallet.getBalance(accounts[0], polkadotNetwork);
        setPolkadotBalance(balance);
      }
    } catch (error) {
      console.error('Failed to initialize Polkadot:', error);
      setPolkadotConnected(false);
    }
  };
  
  // Connect to Polkadot
  const connectPolkadot = async () => {
    try {
      await initPolkadot();
      return true;
    } catch (error) {
      console.error('Failed to connect to Polkadot:', error);
      return false;
    }
  };
  
  // Disconnect from Polkadot
  const disconnectPolkadot = () => {
    setSelectedPolkadotAccount(null);
    setPolkadotConnected(false);
    setPolkadotBalance('0');
  };
  
  // Switch Polkadot account
  const selectPolkadotAccount = async (account) => {
    try {
      setSelectedPolkadotAccount(account);
      const balance = await polkadotWallet.getBalance(account, polkadotNetwork);
      setPolkadotBalance(balance);
    } catch (error) {
      console.error('Failed to select Polkadot account:', error);
    }
  };
  
  // Switch Polkadot network
  const switchPolkadotNetwork = async (network) => {
    try {
      setPolkadotNetwork(network);
      if (selectedPolkadotAccount) {
        const balance = await polkadotWallet.getBalance(selectedPolkadotAccount, network);
        setPolkadotBalance(balance);
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