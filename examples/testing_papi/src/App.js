 /* global BigInt */

import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { MultiAddress, dot } from "@polkadot-api/descriptors"
import { createClient } from "polkadot-api"
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { web3Accounts, web3Enable, web3FromAddress, web3FromSource } from '@polkadot/extension-dapp';

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
const formatBalanceDisplay = (balance) => {
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

function TokenTransfer({ selectedAccount, url }) {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferStatus, setTransferStatus] = useState('');

  const handleTransfer = async () => {
    if (!recipientAddress || !amount || !selectedAccount) {
      setTransferStatus('Please fill in all fields');
      return;
    }

    try {
      setIsTransferring(true);
      setTransferStatus('Preparing transaction...');

      // Create client
      const client = createClient(
        withPolkadotSdkCompat(
          getWsProvider(url)
        )
      );

      // Get the typed API
      const api = client.getTypedApi(dot);

      // Convert amount to planck (1 DOT = 10^10 planck)
      // const amountInPlanck = BigInt(parseFloat(amount) * Math.pow(10, 10));

      // Get the injector for the selected account
      // const injector = await web3FromSource(selectedAccount.meta.source);

      // Create and send the transaction
      console.log(selectedAccount);
      setTransferStatus('Sending transaction...');
      
      const fromAddress = "5GR8Nu8teWPxeG6ekDf63sv49JSghNGnHB7tQrNQaKeo5TjN";
      const toAddress = "14avfLPyk7LjGEbFFdDU7vRLQQt6BKzNfZcFauhuub5mghb1";
      const amount = 100;
      
      const injector = await web3FromAddress(fromAddress);
      const amountInPlanck = BigInt(parseFloat(amount) * Math.pow(10, 10));
      const transfer = api.tx.Balances.transfer_allow_death({
        dest: MultiAddress.Id(toAddress),
        value: 12345n,
      })

      transfer.signSubmitAndWatch(selectedAccount).subscribe({
        next: (event) => {
          console.log("Tx event: ", event.type)
          if (event.type === "txBestBlocksState") {
            console.log("The tx is now in a best block, check it out:")
            console.log(`https://westend.subscan.io/extrinsic/${event.txHash}`)
          }
        },
        error: console.error,
        complete() {
          client.destroy()
        },
      })
      
    } catch (error) {
      console.error('Transfer setup error:', error);
      setTransferStatus(`Error setting up transaction: ${error.message}`);
      setIsTransferring(false);
    }
  };

  return (
    <div className="token-transfer">
      <h3>Send Tokens</h3>
      <div className="transfer-form">
        <div className="form-group">
          <label htmlFor="recipient-address">Recipient Address:</label>
          <input
            id="recipient-address"
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="Enter recipient address"
            disabled={isTransferring}
          />
        </div>
        <div className="form-group">
          <label htmlFor="amount">Amount (DOT):</label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount to send"
            step="0.0001"
            min="0"
            disabled={isTransferring}
          />
        </div>
        <button
          onClick={handleTransfer}
          disabled={isTransferring || !selectedAccount}
          className="transfer-button"
        >
          {isTransferring ? 'Sending...' : 'Send Tokens'}
        </button>
      </div>
      {transferStatus && (
        <div className={`transfer-status ${transferStatus.includes('Error') ? 'error' : ''}`}>
          {transferStatus}
        </div>
      )}
    </div>
  );
}

function WalletConnector() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const url = "wss://testnet-passet-hub.polkadot.io";

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      // Enable the extension
      const extensions = await web3Enable('Polkadot Balance App');
      
      if (extensions.length === 0) {
        alert('No extension found! Please install the Polkadot.js extension and try again.');
        setIsLoading(false);
        return;
      }
      
      // Get all accounts from the extension
      const allAccounts = await web3Accounts();
      
      if (allAccounts.length === 0) {
        alert('No accounts found in the Polkadot.js extension. Please create or import an account first.');
        setIsLoading(false);
        return;
      }
      
      setAccounts(allAccounts);
      setSelectedAccount(allAccounts[0]);
      setIsConnected(true);
      
      // Get balance for the first account
      await getBalance(allAccounts[0]);
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getBalance = async (account) => {
    try {
      // Create client
      const client = createClient(
        withPolkadotSdkCompat(
          getWsProvider(url)
        )
      );

      // Subscribe to finalized blocks
      client.finalizedBlock$.subscribe((finalizedBlock) =>
        console.log(finalizedBlock.number, finalizedBlock.hash),
      );
      
      // Get the typed API
      const dotApi = client.getTypedApi(dot);
      
      // Query the account balance
      const accountInfo = await dotApi.query.System.Account.getValue(account.address);
      
      // Convert BigInt values to strings to make them serializable
      const formattedBalance = formatBalanceData(accountInfo);
      setBalance(formattedBalance);
    } catch (error) {
      console.error('Error getting balance:', error);
      alert('Failed to get balance: ' + error.message);
    }
  };
  
  const handleAccountChange = (event) => {
    const selectedAddress = event.target.value;
    const account = accounts.find(acc => acc.address === selectedAddress);
    setSelectedAccount(account);
    getBalance(account);
  };

  return (
    <div className="wallet-connector">
      {!isConnected ? (
        <button 
          onClick={connectWallet} 
          disabled={isLoading}
          className="connect-button"
        >
          {isLoading ? 'Connecting...' : 'Connect Polkadot Wallet'}
        </button>
      ) : (
        <div className="account-selector">
          <label htmlFor="account-select">Select Account:</label>
          <select 
            id="account-select"
            value={selectedAccount?.address || ''}
            onChange={handleAccountChange}
            className="account-dropdown"
          >
            {accounts.map(acc => (
              <option key={acc.address} value={acc.address}>
                {acc.meta.name} ({acc.address.substring(0, 6)}...{acc.address.substring(acc.address.length - 4)})
              </option>
            ))}
          </select>
        </div>
      )}
      
      {selectedAccount && (
        <div className="account-info">
          <h3>Connected Account</h3>
          <p><strong>Name:</strong> {selectedAccount.meta.name}</p>
          <p><strong>Address:</strong> {selectedAccount.address}</p>
          {balance && (
            <div className="balance-info">
              <h3>Account Balance</h3>
              <div className="balance-details">
                <div className="balance-row">
                  <span className="balance-label">Free Balance:</span>
                  <span className="balance-value">{formatBalanceDisplay(balance.data?.free)}</span>
                </div>
                <div className="balance-row">
                  <span className="balance-label">Reserved:</span>
                  <span className="balance-value">{formatBalanceDisplay(balance.data?.reserved)}</span>
                </div>
                <div className="balance-row">
                  <span className="balance-label">Frozen:</span>
                  <span className="balance-value">{formatBalanceDisplay(balance.data?.frozen)}</span>
                </div>
                <div className="balance-row total">
                  <span className="balance-label">Total:</span>
                  <span className="balance-value">{formatBalanceDisplay(balance.data?.free)}</span>
                </div>
              </div>
              <div className="balance-json">
                <details>
                  <summary>Raw Balance Data</summary>
                  <pre>{JSON.stringify(balance, null, 2)}</pre>
                </details>
              </div>
            </div>
          )}
          
          {/* Token Transfer Component */}
          <TokenTransfer selectedAccount={selectedAccount} url={url} />
        </div>
      )}
    </div>
  );
}
 
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Polkadot Wallet Balance</h1>
        <WalletConnector />
        <a
          className="App-link"
          href="https://polkadot.js.org/extension/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Install Polkadot.js Extension
        </a>
      </header>
    </div>
  );
}

export default App;
