import React, { createContext, useState, useContext } from 'react';

// Define chain constants
export const CHAINS = {
    APTOS: 'aptos',
    POLKADOT: 'polkadot'
};

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [walletAddress, setWalletAddress] = useState(null);
    const [routeTrigger, setRouteTrigger] = useState(false);
    const [wallet, setWallet] = useState(null);
    const [activeChain, setActiveChain] = useState(CHAINS.POLKADOT);

    return (
        <AppContext.Provider value={{
            walletAddress, 
            setWalletAddress, 
            routeTrigger, 
            setRouteTrigger, 
            wallet, 
            setWallet,
            activeChain,
            setActiveChain
        }}>
            {children}
        </AppContext.Provider>
    );
};