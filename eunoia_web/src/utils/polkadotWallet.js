/* global BigInt */
import { createClient } from "polkadot-api";
import { getSmProvider } from 'polkadot-api/sm-provider';

// Initialize the connection
let client = null;
let provider = null;

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

// Default network
const DEFAULT_NETWORK = POLKADOT_NETWORKS.POLKADOT;

/**
 * Initialize API connection to a network
 * @param {string} network Network endpoint
 * @returns {Promise<Object>} Client instance
 */
export const initApi = async (network = DEFAULT_NETWORK.endpoint) => {
  if (!client) {
    // Create a provider using SmProvider instead of WsProvider
    provider = getSmProvider(network);
    client = createClient(provider);
  }
  return client;
};

/**
 * Format balance with proper decimals
 * @param {string|number|BigInt} balance Raw balance
 * @param {number} decimals Decimal places
 * @param {string} symbol Currency symbol
 * @returns {string} Formatted balance
 */
export const formatBalance = (balance, decimals = DEFAULT_NETWORK.decimals, symbol = DEFAULT_NETWORK.symbol) => {
  if (!balance) return `0 ${symbol}`;
  
  const balanceBigInt = BigInt(balance);
  const divisor = BigInt(10) ** BigInt(decimals);
  const integerPart = balanceBigInt / divisor;
  const fractionalPart = balanceBigInt % divisor;
  
  // Format with proper decimals, trimming trailing zeros
  let formatted = integerPart.toString();
  if (fractionalPart > 0) {
    let fraction = fractionalPart.toString().padStart(decimals, '0');
    // Trim trailing zeros
    fraction = fraction.replace(/0+$/, '');
    if (fraction.length > 0) {
      formatted += '.' + fraction;
    }
  }
  
  return `${formatted} ${symbol}`;
};

/**
 * Get accounts from Polkadot extension
 * @returns {Promise<Array>} List of accounts
 */
export const getAccounts = async () => {
  try {
    // Use the browser extension to get accounts
    const { web3Accounts, web3Enable } = await import('@polkadot/extension-dapp');
    await web3Enable('Eunoia App');
    const accounts = await web3Accounts();
    return accounts;
  } catch (error) {
    console.error('Error getting accounts:', error);
    throw error;
  }
};

/**
 * Get balance for an account
 * @param {object} account Account object
 * @param {object} network Network configuration
 * @returns {Promise<string>} Balance formatted with proper decimals
 */
export const getBalance = async (account, network = DEFAULT_NETWORK) => {
  try {
    if (!account || !account.address) return '0';
    
    await initApi(network.endpoint);
    
    const balance = await client.rpc.state.call('system_account', [account.address]);
    const free = balance?.data?.free || '0';
    
    // Format with proper decimals
    return formatBalance(free, network.decimals, network.symbol);
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0';
  }
};

/**
 * Sign and send a transaction
 * @param {object} account Account object
 * @param {string} recipient Recipient address
 * @param {string} amount Amount to send
 * @param {object} network Network configuration
 * @returns {Promise<string>} Transaction hash
 */
export const sendTransaction = async (account, recipient, amount, network = DEFAULT_NETWORK) => {
  try {
    if (!account || !account.address) throw new Error('No account provided');
    
    await initApi(network.endpoint);
    
    // Convert amount to the proper format based on decimals
    const formattedAmount = BigInt(parseFloat(amount) * Math.pow(10, network.decimals));
    
    // Create the transaction
    const tx = await client.tx.balances.transferKeepAlive({
      dest: recipient,
      value: formattedAmount.toString()
    });
    
    // Sign and send the transaction using the browser extension
    const { web3FromAddress } = await import('@polkadot/extension-dapp');
    const injector = await web3FromAddress(account.address);
    
    const signedTx = await tx.signAndSend(account.address, { signer: injector.signer });
    
    return signedTx.hash;
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw error;
  }
};

export default {
  getAccounts,
  getBalance,
  formatBalance,
  sendTransaction,
  POLKADOT_NETWORKS,
  initApi
}; 