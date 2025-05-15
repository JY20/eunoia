/* global BigInt */
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import { ApiPromise, WsProvider } from '@polkadot/api';

// Initialize the connection
let api = null;

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
 * @returns {Promise<ApiPromise>} API instance
 */
export const initApi = async (network = DEFAULT_NETWORK.endpoint) => {
  if (!api) {
    const provider = new WsProvider(network);
    api = await ApiPromise.create({ provider });
  }
  return api;
};

/**
 * Get accounts from Polkadot.js extension
 * @returns {Promise<Array>} List of accounts
 */
export const getAccounts = async () => {
  try {
    // This call triggers the extension popup
    const extensions = await web3Enable('Eunoia App');
    
    if (extensions.length === 0) {
      // No extension installed, or the user did not accept the authorization
      throw new Error('No extension installed, or the user did not accept the authorization');
    }
    
    // Get all accounts in the extension
    const allAccounts = await web3Accounts();
    return allAccounts;
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
    
    const { data: { free: balance } } = await api.query.system.account(account.address);
    
    // Format with proper decimals
    return formatBalance(balance.toString(), network.decimals, network.symbol);
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0';
  }
};

/**
 * Format balance with proper decimals
 * @param {string} balance Raw balance
 * @param {number} decimals Decimal places
 * @param {string} symbol Currency symbol
 * @returns {string} Formatted balance
 */
export const formatBalance = (balance, decimals = 10, symbol = '') => {
  const formattedBalance = (parseInt(balance) / Math.pow(10, decimals)).toFixed(4);
  return symbol ? `${formattedBalance} ${symbol}` : formattedBalance;
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
    
    // Get the account injector (signer)
    const injector = await web3FromSource(account.meta.source);
    
    // Create and sign the transaction
    const txHash = await api.tx.balances
      .transfer(recipient, formattedAmount)
      .signAndSend(account.address, { signer: injector.signer });
    
    return txHash.toHex();
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