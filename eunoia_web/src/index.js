import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { WalletProvider } from "@aptos-labs/wallet-adapter-react";
import { PetraWallet } from "@aptos-labs/petra-wallet-adapter";
// If you want to use Martian Wallet, uncomment the line below
// import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";

const wallets = [
  new PetraWallet(),
  // If you want to use Martian Wallet, uncomment the line below
  // new MartianWallet(),
];

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <WalletProvider
      wallets={wallets}
      autoConnect={true} /* autoConnect is optional */
      onError={(error) => {
        console.error("Wallet Provider Error:", error);
      }}
    >
      <App />
    </WalletProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
