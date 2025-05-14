import React, { createContext, useState, useContext } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [walletAddress, setWalletAddress] = useState(null);
    const [routeTrigger, setRouteTrigger] = useState(false);
    const [wallet, setWallet] = useState(null);

    return (
        <AppContext.Provider value={{walletAddress, setWalletAddress, routeTrigger, setRouteTrigger, wallet, setWallet}}>
            {children}
        </AppContext.Provider>
    );
};